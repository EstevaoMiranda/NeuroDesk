import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transcribeAudio, sendTextMessage } from '@/lib/zapi'
import type { ContactLabel } from '@/types'

interface ZApiWebhookPayload {
  instanceId?: string
  messageId?: string
  phone?: string
  fromMe?: boolean
  momment?: number
  type?: string
  chatName?: string
  photo?: string
  broadcast?: boolean
  // Message content fields
  body?: string
  text?: { message?: string }
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
  }
  // Audio
  audio?: { audioUrl?: string; mimeType?: string; seconds?: number }
  // Image
  image?: { imageUrl?: string; caption?: string }
  // Document
  document?: { documentUrl?: string; fileName?: string }
  // Label events
  label?: string
  labels?: string[]
  // Status events
  status?: string
  referenceMessageId?: string
}

function mapZApiLabelToContactLabel(zApiLabel: string): ContactLabel {
  const map: Record<string, ContactLabel> = {
    'Paciente/Cliente':  'CLIENTE',
    'Profissionais':     'PROFISSIONAL',
    'Curriculos':        'CURRICULO',
    'Visitas Marcadas':  'VISITA',
    'Leads Frios':       'LEAD_FRIO',
  }
  return map[zApiLabel] ?? 'NEW'
}

function extractPhone(body: ZApiWebhookPayload): string {
  const raw = body.phone || ''
  return raw.replace(/\D/g, '')
}

function extractTextContent(body: ZApiWebhookPayload): string | null {
  return (
    body.text?.message ||
    body.message?.conversation ||
    body.message?.extendedTextMessage?.text ||
    body.body ||
    null
  )
}

export async function POST(req: Request) {
  try {
    const body: ZApiWebhookPayload = await req.json()

    // Ignore status callbacks (delivery receipts, etc.)
    if (body.type === 'MessageStatusCallback' || body.type === 'DeliveryCallback') {
      return NextResponse.json({ received: true })
    }

    const instanceId = body.instanceId
    if (!instanceId) {
      return NextResponse.json({ received: true, skipped: 'no instanceId' })
    }

    // Find clinic by WhatsApp instance
    const clinic = await prisma.clinic.findFirst({
      where: { whatsappInstance: instanceId },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada para esta instância' }, { status: 404 })
    }

    // Handle label association events
    if (body.type === 'LabelAssociation' && body.phone && body.label) {
      const phone = extractPhone(body)
      const contact = await prisma.contact.findFirst({
        where: { clinicId: clinic.id, phone: { contains: phone.slice(-8) } },
      })

      if (contact) {
        const newLabel = mapZApiLabelToContactLabel(body.label)
        await prisma.contact.update({
          where: { id: contact.id },
          data: { label: newLabel },
        })
        return NextResponse.json({ received: true, labelUpdated: true, label: newLabel })
      }
      return NextResponse.json({ received: true, skipped: 'contact not found for label update' })
    }

    // Only process inbound messages
    if (body.fromMe) {
      return NextResponse.json({ received: true })
    }

    const phone = extractPhone(body)
    if (!phone) {
      return NextResponse.json({ received: true, skipped: 'no phone' })
    }

    // Determine message content based on type
    let content: string | null = null
    let isAudio = false

    if (body.audio?.audioUrl) {
      isAudio = true
      // Try to transcribe audio
      if (body.messageId && clinic.whatsappToken) {
        try {
          const result = await transcribeAudio(instanceId, clinic.whatsappToken, body.messageId)
          const transcription = result.transcription || result.text
          if (transcription) {
            const seconds = body.audio.seconds ? `${body.audio.seconds}s` : ''
            content = `[Áudio${seconds ? ` ${seconds}` : ''}] ${transcription}`
          }
        } catch {
          // Transcription failed, use placeholder
        }
      }
      if (!content) {
        const seconds = body.audio?.seconds ? ` (${body.audio.seconds}s)` : ''
        content = `[Áudio${seconds}]`
      }
    } else if (body.image?.imageUrl) {
      content = body.image.caption ? `[Imagem] ${body.image.caption}` : '[Imagem]'
    } else if (body.document?.fileName) {
      content = `[Documento] ${body.document.fileName}`
    } else {
      content = extractTextContent(body)
    }

    if (!content) {
      return NextResponse.json({ received: true, skipped: 'no content' })
    }

    // Determine label from Z-API labels array if present
    let initialLabel: ContactLabel = 'NEW'
    if (body.labels && body.labels.length > 0) {
      initialLabel = mapZApiLabelToContactLabel(body.labels[0])
    }

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: {
        clinicId: clinic.id,
        phone: { contains: phone.slice(-8) },
      },
    })

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: body.chatName || `+${phone}`,
          phone,
          type: 'NEW_CONTACT',
          label: initialLabel,
          clinicId: clinic.id,
        },
      })
    } else if (body.labels && body.labels.length > 0 && contact.label !== initialLabel) {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: { label: initialLabel },
      })
    }

    // Save inbound message
    const message = await prisma.message.create({
      data: {
        contactId: contact.id,
        clinicId: clinic.id,
        direction: 'INBOUND',
        channel: 'WHATSAPP',
        content,
        read: false,
      },
    })

    // ── AGENT IA ──────────────────────────────────────────────────────────
    try {
      // Check if agent is configured and active for this clinic
      const agentConfig = await prisma.agentConfig.findUnique({
        where: { clinicId: clinic.id },
        select: { active: true },
      })

      if (agentConfig?.active) {
        // Get last 20 messages for conversation history
        const history = await prisma.message.findMany({
          where:   { contactId: contact.id, clinicId: clinic.id },
          orderBy: { createdAt: 'asc' },
          take:    20,
        })

        const conversationHistory = history.map((m) => ({
          role:    m.direction === 'INBOUND' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }))

        // Use text content for agent (stripped audio/media labels)
        const agentMessage = isAudio ? (content.replace(/^\[Áudio[^\]]*\]\s*/, '') || content) : content

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const agentRes = await fetch(`${baseUrl}/api/agent/chat`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            clinicId:            clinic.id,
            contactId:           contact.id,
            message:             agentMessage,
            conversationHistory: conversationHistory.slice(0, -1), // exclude the message we just added
          }),
        })

        if (agentRes.ok) {
          const agentData = await agentRes.json()

          if (!agentData.skip && agentData.reply) {
            // Save agent reply as OUTBOUND message
            await prisma.message.create({
              data: {
                contactId:  contact.id,
                clinicId:   clinic.id,
                direction:  'OUTBOUND',
                channel:    'WHATSAPP',
                content:    agentData.reply,
                read:       true,
              },
            })

            // Send via Z-API
            if (clinic.whatsappInstance && clinic.whatsappToken) {
              await sendTextMessage(
                clinic.whatsappInstance,
                clinic.whatsappToken,
                phone,
                agentData.reply,
              )
            }
          }
        }
      }
    } catch (agentError) {
      // Agent errors must not break the webhook — just log
      console.error('Agent error in webhook:', agentError)
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json({ received: true, messageId: message.id, isAudio })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'webhook active', service: 'NeuroDesk CRM' })
}

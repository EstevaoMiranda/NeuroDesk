import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ContactLabel } from '@/types'

interface ZAPIWebhookPayload {
  instanceId?: string
  phone?: string
  body?: string
  text?: { message?: string }
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
  }
  momentsType?: string
  fromMe?: boolean
  chatName?: string
  // Z-API label update events
  type?: string
  label?: string
  labels?: string[]
}

function mapZApiLabelToContactLabel(zApiLabel: string): ContactLabel {
  const map: Record<string, ContactLabel> = {
    'Paciente/Cliente': 'CLIENTE',
    'Profissionais':    'PROFISSIONAL',
    'Curriculos':       'CURRICULO',
    'Visitas Marcadas': 'VISITA',
    'Leads Frios':      'LEAD_FRIO',
  }
  return map[zApiLabel] ?? 'NEW'
}

export async function POST(req: Request) {
  try {
    const body: ZAPIWebhookPayload = await req.json()

    const instanceId = body.instanceId
    if (!instanceId) {
      return NextResponse.json({ received: true, skipped: true })
    }

    // Find clinic by WhatsApp instance
    const clinic = await prisma.clinic.findFirst({
      where: { whatsappInstance: instanceId },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada para esta instância' }, { status: 404 })
    }

    // Handle label update events from Z-API
    if (body.type === 'LabelAssociation' && body.phone && body.label) {
      const phone = body.phone.replace(/\D/g, '')
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

    const phone = body.phone?.replace(/\D/g, '') || ''
    const content =
      body.text?.message ||
      body.message?.conversation ||
      body.message?.extendedTextMessage?.text ||
      body.body ||
      ''

    if (!phone || !content) {
      return NextResponse.json({ received: true, skipped: true })
    }

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: {
        clinicId: clinic.id,
        phone: { contains: phone.slice(-8) },
      },
    })

    // Determine label from Z-API labels array if present
    let initialLabel: ContactLabel = 'NEW'
    if (body.labels && body.labels.length > 0) {
      initialLabel = mapZApiLabelToContactLabel(body.labels[0])
    }

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: body.chatName || `+55${phone}`,
          phone,
          type: 'NEW_CONTACT',
          label: initialLabel,
          clinicId: clinic.id,
        },
      })
    } else if (body.labels && body.labels.length > 0 && contact.label !== initialLabel) {
      // Update label if it changed
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

    return NextResponse.json({ received: true, messageId: message.id })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'webhook active', service: 'NeuroDesk CRM' })
}

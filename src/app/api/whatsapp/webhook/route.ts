import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ZAPIWebhookPayload {
  instanceId?: string
  phone?: string
  body?: string
  text?: {
    message?: string
  }
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
  }
  momentsType?: string
  fromMe?: boolean
  chatName?: string
}

export async function POST(req: Request) {
  try {
    const body: ZAPIWebhookPayload = await req.json()

    // Only process inbound messages
    if (body.fromMe) {
      return NextResponse.json({ received: true })
    }

    const instanceId = body.instanceId
    const phone = body.phone?.replace(/\D/g, '') || ''
    const content =
      body.text?.message ||
      body.message?.conversation ||
      body.message?.extendedTextMessage?.text ||
      body.body ||
      ''

    if (!instanceId || !phone || !content) {
      return NextResponse.json({ received: true, skipped: true })
    }

    // Find clinic by WhatsApp instance
    const clinic = await prisma.clinic.findFirst({
      where: { whatsappInstance: instanceId },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada para esta instância' }, { status: 404 })
    }

    // Find or note that contact doesn't exist (we'll just log)
    const contact = await prisma.contact.findFirst({
      where: {
        clinicId: clinic.id,
        phone: { contains: phone.slice(-8) }, // match last 8 digits
      },
    })

    let contactId: string

    if (contact) {
      contactId = contact.id
    } else {
      // Auto-create contact for unknown numbers
      const newContact = await prisma.contact.create({
        data: {
          name: body.chatName || `+55${phone}`,
          phone,
          type: 'NEW_CONTACT',
          status: 'PENDING',
          clinicId: clinic.id,
        },
      })
      contactId = newContact.id
    }

    // Save inbound message
    const message = await prisma.message.create({
      data: {
        contactId,
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

// Allow GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'webhook active', service: 'NeuroDesk CRM' })
}

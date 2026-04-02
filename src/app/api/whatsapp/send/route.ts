import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const sendMessageSchema = z.object({
  contactId: z.string().min(1),
  content: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const body = await req.json()
    const result = sendMessageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { contactId, content } = result.data

    // Get contact and clinic info
    const [contact, clinic] = await Promise.all([
      prisma.contact.findFirst({ where: { id: contactId, clinicId } }),
      prisma.clinic.findUnique({ where: { id: clinicId } }),
    ])

    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    // Send via Z-API if configured
    if (clinic.whatsappInstance && clinic.whatsappToken) {
      const zapiBaseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io'
      const phone = contact.phone.replace(/\D/g, '')

      try {
        const zapiResponse = await fetch(
          `${zapiBaseUrl}/instances/${clinic.whatsappInstance}/token/${clinic.whatsappToken}/send-text`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone,
              message: content,
            }),
          }
        )

        if (!zapiResponse.ok) {
          const errorData = await zapiResponse.json().catch(() => ({}))
          console.error('Z-API send error:', errorData)
          // Continue to save in DB even if send fails
        }
      } catch (zapiError) {
        console.error('Z-API connection error:', zapiError)
        // Continue to save in DB even if send fails
      }
    }

    // Save outbound message to DB
    const message = await prisma.message.create({
      data: {
        contactId,
        clinicId,
        direction: 'OUTBOUND',
        channel: 'WHATSAPP',
        content,
        read: true,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('POST /whatsapp/send error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

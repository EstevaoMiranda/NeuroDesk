import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { sendTextMessage } from '@/lib/zapi'

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
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { contactId, content } = result.data

    const [contact, clinic] = await Promise.all([
      prisma.contact.findFirst({ where: { id: contactId, clinicId } }),
      prisma.clinic.findUnique({ where: { id: clinicId } }),
    ])

    if (!contact) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    if (!clinic)  return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })

    // Send via Z-API if configured
    if (clinic.whatsappInstance && clinic.whatsappToken) {
      const phone = contact.phone.replace(/\D/g, '')
      try {
        await sendTextMessage(clinic.whatsappInstance, clinic.whatsappToken, phone, content)
      } catch (zapiError) {
        console.error('Z-API send error:', zapiError)
        // Continue saving to DB even if send fails
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

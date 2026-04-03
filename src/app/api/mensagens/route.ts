import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const createMessageSchema = z.object({
  contactId: z.string().min(1, 'ContactId é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  channel: z.enum(['WHATSAPP', 'INSTAGRAM', 'MANUAL']).default('WHATSAPP'),
})

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const { searchParams } = new URL(req.url)
    const contactId = searchParams.get('contactId')

    if (contactId) {
      const messages = await prisma.message.findMany({
        where: { clinicId, contactId },
        orderBy: { createdAt: 'asc' },
      })

      await prisma.message.updateMany({
        where: { clinicId, contactId, read: false, direction: 'INBOUND' },
        data: { read: true },
      })

      return NextResponse.json({ messages })
    }

    // Return grouped conversations — include label in contact data
    const contacts = await prisma.contact.findMany({
      where: { clinicId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const conversations = contacts
      .filter((c) => c.messages.length > 0)
      .map((c) => {
        const messages = [...c.messages].reverse()
        const lastMessage = c.messages[0]
        const unreadCount = c.messages.filter((m) => !m.read && m.direction === 'INBOUND').length

        return {
          contact: {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            type: c.type,
            label: c.label,
            clinicId: c.clinicId,
            assignedToId: c.assignedToId,
            notes: c.notes,
            createdAt: c.createdAt,
          },
          messages,
          lastMessage,
          unreadCount,
        }
      })
      .sort((a, b) => {
        // Unread first, then by most recent
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1
        const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
        const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
        return bTime - aTime
      })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('GET /mensagens error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const body = await req.json()
    const result = createMessageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { contactId, content, channel } = result.data

    const contact = await prisma.contact.findFirst({ where: { id: contactId, clinicId } })
    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        contactId,
        clinicId,
        direction: 'OUTBOUND',
        channel,
        content,
        read: true,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('POST /mensagens error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const createContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(8, 'Telefone inválido'),
  email: z.string().email().optional().or(z.literal('')),
  type: z.enum(['NEW_CONTACT', 'PARENT_CLIENT', 'PROFESSIONAL']).default('NEW_CONTACT'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('PENDING'),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = { clinicId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) where.type = type
    if (status) where.status = status

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, specialty: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const contactsWithLastMessage = contacts.map((c) => ({
      ...c,
      lastMessage: c.messages[0] || null,
      messages: undefined,
    }))

    return NextResponse.json({ contacts: contactsWithLastMessage })
  } catch (error) {
    console.error('GET /contatos error:', error)
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
    const result = createContactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        type: data.type,
        status: data.status,
        notes: data.notes || null,
        assignedToId: data.assignedToId || null,
        clinicId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('POST /contatos error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

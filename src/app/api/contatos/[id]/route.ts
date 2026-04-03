import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal('')),
  type: z.enum(['NEW_CONTACT', 'PARENT_CLIENT', 'PROFESSIONAL']).optional(),
  label: z.enum(['NEW', 'VISITA', 'LEAD_FRIO', 'CLIENTE', 'PROFISSIONAL', 'CURRICULO']).optional(),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const contact = await prisma.contact.findFirst({
      where: { id: params.id, clinicId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, specialty: true, role: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
        sessions: {
          include: {
            therapist: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('GET /contatos/[id] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const body = await req.json()
    const result = updateContactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.contact.findFirst({ where: { id: params.id, clinicId } })
    if (!existing) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        ...result.data,
        email: result.data.email || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('PUT /contatos/[id] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const body = await req.json()
    const result = updateContactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.contact.findFirst({ where: { id: params.id, clinicId } })
    if (!existing) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: result.data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('PATCH /contatos/[id] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const existing = await prisma.contact.findFirst({ where: { id: params.id, clinicId } })
    if (!existing) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    await prisma.contact.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Contato excluído com sucesso' })
  } catch (error) {
    console.error('DELETE /contatos/[id] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

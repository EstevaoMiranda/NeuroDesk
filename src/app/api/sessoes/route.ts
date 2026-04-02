import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const createSessionSchema = z.object({
  contactId: z.string().min(1),
  therapistId: z.string().min(1),
  specialty: z.enum(['FONOAUDIOLOGIA', 'TERAPIA_OCUPACIONAL', 'PSICOLOGIA', 'ABA', 'PSICOMOTRICIDADE']),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
  scheduledAt: z.string().min(1),
  duration: z.number().int().min(15).max(240).default(50),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const therapistId = searchParams.get('therapistId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { clinicId }

    if (date) {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      where.scheduledAt = { gte: dayStart, lte: dayEnd }
    } else if (startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.scheduledAt = { gte: start, lte: end }
    }

    if (therapistId) where.therapistId = therapistId
    if (status) where.status = status

    const sessions = await prisma.session.findMany({
      where,
      include: {
        contact: {
          select: { id: true, name: true, phone: true },
        },
        therapist: {
          select: { id: true, name: true, specialty: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('GET /sessoes error:', error)
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
    const result = createSessionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // Verify contact and therapist belong to clinic
    const [contact, therapist] = await Promise.all([
      prisma.contact.findFirst({ where: { id: data.contactId, clinicId } }),
      prisma.user.findFirst({ where: { id: data.therapistId, clinicId } }),
    ])

    if (!contact) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    if (!therapist) return NextResponse.json({ error: 'Terapeuta não encontrado' }, { status: 404 })

    const session = await prisma.session.create({
      data: {
        contactId: data.contactId,
        clinicId,
        therapistId: data.therapistId,
        specialty: data.specialty,
        status: data.status,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        notes: data.notes || null,
      },
      include: {
        contact: {
          select: { id: true, name: true, phone: true },
        },
        therapist: {
          select: { id: true, name: true, specialty: true },
        },
      },
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('POST /sessoes error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

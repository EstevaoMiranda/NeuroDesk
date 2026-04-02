import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const therapists = await prisma.user.findMany({
      where: {
        clinicId,
        role: { in: ['THERAPIST', 'ADMIN', 'MANAGER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ therapists })
  } catch (error) {
    console.error('GET /sessoes/therapists error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

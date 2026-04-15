import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // filter by candidateStatus

    const contacts = await prisma.contact.findMany({
      where: {
        clinicId,
        label: 'CURRICULO',
        ...(status ? { candidateStatus: status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        candidateStatus: true,
        resumeUrl: true,
        resumeSummary: true,
        rejectionReason: true,
        rejectionCount: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('GET /api/curriculos error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

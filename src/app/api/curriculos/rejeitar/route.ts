import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const body: { contactId: string; reason?: string } = await req.json()
    const { contactId, reason } = body

    if (!contactId) {
      return NextResponse.json({ error: 'contactId é obrigatório' }, { status: 400 })
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, clinicId },
    })
    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: {
        candidateStatus: 'REJEITADO',
        rejectionReason: reason || null,
        rejectionCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, rejectionCount: updated.rejectionCount })
  } catch (error) {
    console.error('POST /api/curriculos/rejeitar error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

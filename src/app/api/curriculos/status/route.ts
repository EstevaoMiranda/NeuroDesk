import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const VALID_STATUSES = ['NOVO', 'EM_ANALISE', 'ENTREVISTA', 'APROVADO', 'REJEITADO']

export async function PATCH(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const body: { contactId: string; status: string } = await req.json()
    const { contactId, status } = body

    if (!contactId || !status) {
      return NextResponse.json({ error: 'contactId e status são obrigatórios' }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Status inválido. Use: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, clinicId },
    })
    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: { candidateStatus: status },
    })

    return NextResponse.json({ success: true, candidateStatus: updated.candidateStatus })
  } catch (error) {
    console.error('PATCH /api/curriculos/status error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

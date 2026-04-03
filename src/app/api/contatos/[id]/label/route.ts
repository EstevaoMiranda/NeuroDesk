import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const updateLabelSchema = z.object({
  label: z.enum(['NEW', 'VISITA', 'LEAD_FRIO', 'CLIENTE', 'PROFISSIONAL', 'CURRICULO']),
})

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
    const result = updateLabelSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Etiqueta inválida' },
        { status: 400 }
      )
    }

    const existing = await prisma.contact.findFirst({
      where: { id: params.id, clinicId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: { label: result.data.label },
      select: { id: true, name: true, label: true },
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('PATCH /contatos/[id]/label error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

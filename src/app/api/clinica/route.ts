import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
})

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ clinic })
  } catch (error) {
    console.error('GET /clinica error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId, role } = payload

    if (role !== 'ADMIN' && role !== 'MANAGER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()
    const result = updateClinicSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: result.data,
    })

    return NextResponse.json({ clinic })
  } catch (error) {
    console.error('PUT /clinica error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

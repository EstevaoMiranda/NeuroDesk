import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

async function getAuth(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: Request) {
  try {
    const payload = await getAuth(req)
    if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const config = await prisma.agentConfig.findUnique({
      where: { clinicId: payload.clinicId },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('GET /agent/config error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getAuth(req)
    if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem configurar o agente' }, { status: 403 })
    }

    const body = await req.json()

    const config = await prisma.agentConfig.upsert({
      where: { clinicId: payload.clinicId },
      update: {
        agentName:     body.agentName     ?? 'Assistente',
        agentTone:     body.agentTone     ?? 'acolhedor e profissional',
        agentIntro:    body.agentIntro    ?? '',
        clinicHours:   body.clinicHours   ?? null,
        clinicAddress: body.clinicAddress ?? null,
        specialties:   body.specialties   ?? [],
        faqs:          body.faqs          ?? [],
        escalateRules: body.escalateRules ?? [],
        active:        body.active        ?? true,
      },
      create: {
        clinicId:      payload.clinicId,
        agentName:     body.agentName     ?? 'Assistente',
        agentTone:     body.agentTone     ?? 'acolhedor e profissional',
        agentIntro:    body.agentIntro    ?? '',
        clinicHours:   body.clinicHours   ?? null,
        clinicAddress: body.clinicAddress ?? null,
        specialties:   body.specialties   ?? [],
        faqs:          body.faqs          ?? [],
        escalateRules: body.escalateRules ?? [],
        active:        body.active        ?? true,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('POST /agent/config error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      totalContatos,
      sessoesHoje,
      mensagensNaoLidas,
      totalMensagens,
      mensagensRespondidas,
      recentMessages,
      recentSessions,
    ] = await Promise.all([
      prisma.contact.count({ where: { clinicId } }),
      prisma.session.count({
        where: {
          clinicId,
          scheduledAt: { gte: today, lte: todayEnd },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      prisma.message.count({
        where: { clinicId, read: false, direction: 'INBOUND' },
      }),
      prisma.message.count({
        where: { clinicId, createdAt: { gte: sevenDaysAgo }, direction: 'INBOUND' },
      }),
      prisma.message.count({
        where: { clinicId, createdAt: { gte: sevenDaysAgo }, direction: 'OUTBOUND' },
      }),
      prisma.message.findMany({
        where: { clinicId, createdAt: { gte: sevenDaysAgo } },
        include: {
          contact: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.session.findMany({
        where: { clinicId, scheduledAt: { gte: sevenDaysAgo } },
        include: {
          contact: { select: { id: true, name: true } },
          therapist: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
      }),
    ])

    const taxaResposta = totalMensagens > 0
      ? Math.min(100, Math.round((mensagensRespondidas / totalMensagens) * 100))
      : 0

    // Combine and sort recent activities
    const atividadesRecentes = [
      ...recentMessages.map((m) => ({
        id: m.id,
        tipo: 'mensagem' as const,
        contactName: m.contact.name,
        contactId: m.contact.id,
        conteudo: `${m.direction === 'INBOUND' ? 'Recebido: ' : 'Enviado: '}${m.content}`,
        timestamp: m.createdAt,
        status: m.read ? 'lida' : 'não lida',
      })),
      ...recentSessions.map((s) => ({
        id: s.id,
        tipo: 'sessao' as const,
        contactName: s.contact.name,
        contactId: s.contact.id,
        conteudo: `Sessão com ${s.therapist.name}`,
        timestamp: s.scheduledAt,
        status: s.status,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      totalContatos,
      sessoesHoje,
      mensagensNaoLidas,
      taxaResposta,
      atividadesRecentes,
    })
  } catch (error) {
    console.error('GET /dashboard/metrics error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

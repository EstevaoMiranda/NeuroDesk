import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const payload = await verifyToken(token)
    const { clinicId } = payload

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      novosContatos,
      visitasAgendadas,
      totalContatos,
      clientesCount,
      leadsFriosAll,
      recentMessages,
      recentSessions,
      escaladas,
      agentActivity,
    ] = await Promise.all([
      // Total NEW label
      prisma.contact.count({ where: { clinicId, label: 'NEW' } }),

      // Total VISITA label
      prisma.contact.count({ where: { clinicId, label: 'VISITA' } }),

      // Total contacts for conversion rate
      prisma.contact.count({ where: { clinicId } }),

      // Total CLIENTE label
      prisma.contact.count({ where: { clinicId, label: 'CLIENTE' } }),

      // Leads Frios contacts (to find the ones > 7 days without response)
      prisma.contact.findMany({
        where: { clinicId, label: 'LEAD_FRIO' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),

      // Recent messages for activity feed
      prisma.message.findMany({
        where: { clinicId, createdAt: { gte: sevenDaysAgo } },
        include: {
          contact: { select: { id: true, name: true, label: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),

      // Recent sessions for activity feed
      prisma.session.findMany({
        where: { clinicId, scheduledAt: { gte: sevenDaysAgo } },
        include: {
          contact: { select: { id: true, name: true } },
          therapist: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
      }),

      // Contacts awaiting human takeover (oldest first = waiting longest)
      prisma.contact.findMany({
        where: { clinicId, humanTakeover: true },
        orderBy: { updatedAt: 'asc' },
        select: {
          id:              true,
          name:            true,
          phone:           true,
          label:           true,
          escalateSummary: true,
          updatedAt:       true,
        },
      }),

      // Agent outbound activity in last 24h (one per contact, latest first)
      prisma.message.findMany({
        where: {
          clinicId,
          direction: 'OUTBOUND',
          channel:   'WHATSAPP',
          createdAt: { gte: last24h },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id:        true,
          content:   true,
          createdAt: true,
          contact: {
            select: {
              id:            true,
              name:          true,
              label:         true,
              humanTakeover: true,
            },
          },
        },
        distinct: ['contactId'],
      }),
    ])

    // Leads Frios with last message > 7 days ago
    const leadsFriosAlerta = leadsFriosAll.filter((c) => {
      const lastMsg = c.messages[0]
      if (!lastMsg) return true
      const diffDays = Math.floor(
        (Date.now() - new Date(lastMsg.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      return diffDays > 7
    }).length

    const taxaConversao = totalContatos > 0
      ? Math.round((clientesCount / totalContatos) * 100)
      : 0

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
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    // Only show agent activity where agent resolved without escalation
    const agentActivityFiltered = agentActivity
      .filter((m) => !m.contact.humanTakeover)
      .slice(0, 10)

    return NextResponse.json({
      novosContatos,
      visitasAgendadas,
      leadsFriosAlerta,
      taxaConversao,
      atividadesRecentes,
      escaladas,
      agentActivity: agentActivityFiltered,
    })
  } catch (error) {
    console.error('GET /dashboard/metrics error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

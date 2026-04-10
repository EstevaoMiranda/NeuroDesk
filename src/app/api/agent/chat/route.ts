import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface AgentFaq {
  q: string
  a: string
}

function buildSystemPrompt(config: {
  agentName:     string
  agentTone:     string
  agentIntro:    string
  clinicHours:   string | null
  clinicAddress: string | null
  specialties:   string[]
  faqs:          AgentFaq[]
  escalateRules: string[]
}): string {
  const specs  = config.specialties.join(', ') || 'não informadas'
  const faqs   = config.faqs.map((f) => `  P: ${f.q}\n  R: ${f.a}`).join('\n\n')
  const rules  = config.escalateRules.map((r) => `  - ${r}`).join('\n')

  return `Você é ${config.agentName}, assistente virtual de uma clínica de neurodesenvolvimento.
Seu tom deve ser ${config.agentTone}.

Apresentação padrão (use somente na primeira mensagem da conversa):
"${config.agentIntro}"

Informações da clínica:
  Especialidades atendidas: ${specs}
  Horário de funcionamento: ${config.clinicHours ?? 'não informado'}
  ${config.clinicAddress ? `Endereço: ${config.clinicAddress}` : ''}

FAQ da clínica (use para responder dúvidas comuns):
${faqs || '  (nenhum cadastrado)'}

REGRAS DE ESCALADA — se o contato perguntar sobre qualquer um dos tópicos abaixo, escale imediatamente sem tentar responder:
${rules || '  (nenhuma regra ativa)'}

Ao identificar necessidade de escalada:
1. Responda de forma acolhedora que um membro da equipe irá continuar o atendimento em breve.
2. Finalize sua mensagem com o marcador exato na última linha: [ESCALAR]
3. Na linha seguinte, escreva um JSON com esta estrutura exata (sem markdown, sem explicações extras):
{"intencao":"...","perfil":"...","duvida":"...","motivoEscalada":"..."}

Nunca invente informações sobre a clínica. Se não souber algo, escale.
Nunca se identifique como IA a menos que seja diretamente perguntado.
Nunca mencione o marcador [ESCALAR] ou o JSON ao usuário — são instruções internas.`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clinicId, contactId, message, conversationHistory } = body

    if (!clinicId || !contactId || !message) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    // Verify agent is configured and active
    const config = await prisma.agentConfig.findUnique({
      where: { clinicId },
    })

    if (!config || !config.active) {
      return NextResponse.json({ skip: true })
    }

    // Check if contact has human takeover or agent disabled
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { humanTakeover: true, agentActive: true },
    })

    if (!contact || contact.humanTakeover || !contact.agentActive) {
      return NextResponse.json({ skip: true })
    }

    // Build message history for Claude
    const messages: Anthropic.MessageParam[] = [
      ...(conversationHistory ?? []),
      { role: 'user', content: message },
    ]

    // Call Claude API
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     buildSystemPrompt({
        agentName:     config.agentName,
        agentTone:     config.agentTone,
        agentIntro:    config.agentIntro,
        clinicHours:   config.clinicHours,
        clinicAddress: config.clinicAddress,
        specialties:   config.specialties,
        faqs:          config.faqs          as unknown as AgentFaq[],
        escalateRules: config.escalateRules as unknown as string[],
      }),
      messages,
    })

    const rawReply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')

    // Detect escalation
    const escalated = rawReply.includes('[ESCALAR]')
    let reply   = rawReply
    let summary = null

    if (escalated) {
      const jsonMatch = rawReply.match(/\{[^{}]*"intencao"[^{}]*\}/)
      if (jsonMatch) {
        try { summary = JSON.parse(jsonMatch[0]) } catch { summary = null }
      }

      // Strip internal markers before sending to user
      reply = rawReply.replace(/\[ESCALAR\][\s\S]*$/, '').trim()

      // Mark contact for human takeover
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          humanTakeover:   true,
          escalateSummary: summary,
        },
      })
    }

    return NextResponse.json({ reply, escalated, summary })
  } catch (error) {
    console.error('POST /agent/chat error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

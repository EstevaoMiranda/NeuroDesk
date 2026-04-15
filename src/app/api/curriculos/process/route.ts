import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ProcessPayload {
  contactId: string
  documentUrl: string
  fileName?: string
  _internal?: boolean
  clinicId?: string
}

export async function POST(req: Request) {
  try {
    const body: ProcessPayload = await req.json()
    const { contactId, documentUrl, fileName, _internal } = body

    let clinicId: string

    if (_internal && body.clinicId) {
      // Internal call from webhook — no JWT needed, clinicId passed in body
      clinicId = body.clinicId
    } else {
      const token = getTokenFromRequest(req)
      if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      const payload = await verifyToken(token)
      clinicId = payload.clinicId
    }

    if (!contactId || !documentUrl) {
      return NextResponse.json({ error: 'contactId e documentUrl são obrigatórios' }, { status: 400 })
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, clinicId },
    })
    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    // Download PDF
    const pdfRes = await fetch(documentUrl)
    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'Falha ao baixar o PDF' }, { status: 422 })
    }
    const pdfBuffer = await pdfRes.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    // Extract info via Claude document API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extraction = await (anthropic.messages.create as any)({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: `Analise este currículo e retorne um JSON com os campos:
{
  "nome": "nome completo",
  "especialidade": "área de atuação / cargo pretendido",
  "formacao": "formação acadêmica resumida",
  "experiencia": "experiência profissional resumida (max 2 linhas)",
  "resumo": "resumo geral do perfil em 3-4 linhas"
}
Responda APENAS com o JSON, sem markdown ou texto adicional.`,
            },
          ],
        },
      ],
    })

    const rawText = extraction.content[0].type === 'text' ? extraction.content[0].text : ''
    let extracted: Record<string, string> = {}
    try {
      extracted = JSON.parse(rawText)
    } catch {
      extracted = { resumo: rawText }
    }

    const resumeSummary = [
      extracted.nome ? `Nome: ${extracted.nome}` : '',
      extracted.especialidade ? `Especialidade: ${extracted.especialidade}` : '',
      extracted.formacao ? `Formação: ${extracted.formacao}` : '',
      extracted.experiencia ? `Experiência: ${extracted.experiencia}` : '',
      extracted.resumo ? `Resumo: ${extracted.resumo}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    // Upload PDF to Supabase Storage
    const safeFileName = fileName?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'curriculo.pdf'
    const storagePath = `${clinicId}/${contactId}/${Date.now()}_${safeFileName}`

    const supabaseAdmin = getSupabaseAdmin()

    const { error: uploadError } = await supabaseAdmin.storage
      .from('curriculos')
      .upload(storagePath, Buffer.from(pdfBuffer), {
        contentType: 'application/pdf',
        upsert: false,
      })

    let resumeUrl: string | null = null
    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage.from('curriculos').getPublicUrl(storagePath)
      resumeUrl = urlData.publicUrl
    } else {
      console.error('Storage upload error:', uploadError)
      // Continue even if storage fails — still save the summary
    }

    // Check reincidence: has this contact been rejected before?
    const isReincident = (contact.rejectionCount ?? 0) > 0

    // Update contact
    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: {
        label: 'CURRICULO',
        type: 'PROFESSIONAL',
        candidateStatus: 'NOVO',
        resumeSummary,
        ...(resumeUrl ? { resumeUrl } : {}),
        ...(extracted.nome && extracted.nome !== contact.name ? { name: extracted.nome } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      contactId: updated.id,
      resumeSummary,
      resumeUrl,
      isReincident,
      rejectionCount: contact.rejectionCount ?? 0,
    })
  } catch (error) {
    console.error('POST /api/curriculos/process error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

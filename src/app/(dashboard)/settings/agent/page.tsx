'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import type { AgentFaq } from '@/types'

const PRESET_ESCALATE_RULES = [
  'Perguntas sobre valores e preços',
  'Solicitação de laudo ou prontuário',
  'Reclamações ou situações de conflito',
  'Agendamento direto',
]

const TONE_OPTIONS = [
  { value: 'acolhedor e profissional', label: 'Acolhedor e profissional' },
  { value: 'formal',                   label: 'Formal' },
  { value: 'informal e próximo',       label: 'Informal e próximo' },
]

function buildPreviewPrompt(config: {
  agentName:     string
  agentTone:     string
  agentIntro:    string
  clinicHours:   string
  clinicAddress: string
  specialties:   string[]
  faqs:          AgentFaq[]
  escalateRules: string[]
}): string {
  const specs  = config.specialties.join(', ') || 'não informadas'
  const faqs   = config.faqs.map((f) => `  P: ${f.q}\n  R: ${f.a}`).join('\n\n')
  const rules  = config.escalateRules.map((r) => `  - ${r}`).join('\n')

  return `Você é ${config.agentName || '[nome]'}, assistente virtual de uma clínica de neurodesenvolvimento.
Seu tom deve ser ${config.agentTone || '[tom]'}.

Apresentação padrão (use somente na primeira mensagem):
"${config.agentIntro || '[intro]'}"

Informações da clínica:
  Especialidades atendidas: ${specs}
  Horário de funcionamento: ${config.clinicHours || 'não informado'}
  ${config.clinicAddress ? `Endereço: ${config.clinicAddress}` : ''}

FAQ da clínica:
${faqs || '  (nenhum cadastrado)'}

REGRAS DE ESCALADA:
${rules || '  (nenhuma regra ativa)'}

Ao identificar necessidade de escalada:
1. Responda de forma acolhedora que um membro da equipe irá continuar o atendimento.
2. Finalize com: [ESCALAR]
3. Na linha seguinte, JSON: {"intencao":"...","perfil":"...","duvida":"...","motivoEscalada":"..."}`
}

export default function AgentConfigPage() {
  const router = useRouter()
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [activeSection, setActiveSection] = useState<string>('identidade')

  // Form state
  const [active,        setActive]        = useState(true)
  const [agentName,     setAgentName]     = useState('Assistente')
  const [agentTone,     setAgentTone]     = useState('acolhedor e profissional')
  const [agentIntro,    setAgentIntro]    = useState('')
  const [clinicHours,   setClinicHours]   = useState('')
  const [clinicAddress, setClinicAddress] = useState('')
  const [specialties,   setSpecialties]   = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [faqs,          setFaqs]          = useState<AgentFaq[]>([])
  const [escalateRules, setEscalateRules] = useState<string[]>([])
  const [customRule,    setCustomRule]    = useState('')

  async function loadConfig() {
    try {
      const res = await fetch('/api/agent/config')
      if (res.status === 401 || res.status === 403) {
        router.push('/dashboard')
        return
      }
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setActive(data.active ?? true)
          setAgentName(data.agentName ?? 'Assistente')
          setAgentTone(data.agentTone ?? 'acolhedor e profissional')
          setAgentIntro(data.agentIntro ?? '')
          setClinicHours(data.clinicHours ?? '')
          setClinicAddress(data.clinicAddress ?? '')
          setSpecialties(data.specialties ?? [])
          setFaqs(data.faqs ?? [])
          setEscalateRules(data.escalateRules ?? [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar config do agente:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadConfig() }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/agent/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          active, agentName, agentTone, agentIntro,
          clinicHours: clinicHours || null,
          clinicAddress: clinicAddress || null,
          specialties, faqs, escalateRules,
        }),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  // Tags helpers
  function addSpecialty() {
    const s = specialtyInput.trim()
    if (s && !specialties.includes(s)) {
      setSpecialties((prev) => [...prev, s])
    }
    setSpecialtyInput('')
  }

  function removeSpecialty(s: string) {
    setSpecialties((prev) => prev.filter((x) => x !== s))
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { q: '', a: '' }])
  }

  function updateFaq(i: number, field: 'q' | 'a', value: string) {
    setFaqs((prev) => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  }

  function removeFaq(i: number) {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i))
  }

  function togglePresetRule(rule: string) {
    setEscalateRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    )
  }

  function addCustomRule() {
    const r = customRule.trim()
    if (r && !escalateRules.includes(r)) {
      setEscalateRules((prev) => [...prev, r])
    }
    setCustomRule('')
  }

  function removeRule(rule: string) {
    setEscalateRules((prev) => prev.filter((r) => r !== rule))
  }

  const promptPreview = useMemo(() => buildPreviewPrompt({
    agentName, agentTone, agentIntro, clinicHours, clinicAddress,
    specialties, faqs, escalateRules,
  }), [agentName, agentTone, agentIntro, clinicHours, clinicAddress, specialties, faqs, escalateRules])

  const SECTIONS = [
    { id: 'identidade',   label: 'Identidade' },
    { id: 'clinica',      label: 'Clínica' },
    { id: 'faq',          label: 'FAQ' },
    { id: 'escalada',     label: 'Escalada' },
    { id: 'preview',      label: 'Prévia do Prompt' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Agente IA" />

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">

        {/* Header card: toggle ativo/inativo */}
        <div className="card mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Agente de Atendimento IA</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Responde automaticamente no WhatsApp e escala para a equipe quando necessário
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${active ? 'text-green-600' : 'text-slate-400'}`}>
              {active ? 'Ativo' : 'Inativo'}
            </span>
            <button
              onClick={() => setActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                active ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-200 rounded-xl" />)}
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar navigation */}
            <div className="w-48 flex-shrink-0">
              <div className="flex flex-col gap-1 sticky top-6">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === s.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* ── IDENTIDADE ─────────────────────────────────── */}
              {activeSection === 'identidade' && (
                <div className="card space-y-5">
                  <h3 className="font-bold text-slate-900">Identidade do Agente</h3>

                  <div>
                    <label className="label">Nome do agente</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="input"
                      placeholder="Ex: Sofia, Ana, Assistente..."
                    />
                  </div>

                  <div>
                    <label className="label">Tom de comunicação</label>
                    <select
                      value={agentTone}
                      onChange={(e) => setAgentTone(e.target.value)}
                      className="input"
                    >
                      {TONE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Apresentação inicial</label>
                    <p className="text-xs text-slate-400 mb-2">
                      Enviada automaticamente na primeira mensagem de cada conversa.
                    </p>
                    <textarea
                      value={agentIntro}
                      onChange={(e) => setAgentIntro(e.target.value)}
                      className="input resize-none h-28"
                      placeholder="Olá! Sou a Sofia, assistente virtual da clínica. Como posso ajudar?"
                    />
                  </div>
                </div>
              )}

              {/* ── CLÍNICA ────────────────────────────────────── */}
              {activeSection === 'clinica' && (
                <div className="card space-y-5">
                  <h3 className="font-bold text-slate-900">Informações da Clínica</h3>

                  <div>
                    <label className="label">Horário de funcionamento</label>
                    <input
                      type="text"
                      value={clinicHours}
                      onChange={(e) => setClinicHours(e.target.value)}
                      className="input"
                      placeholder="Seg–Sex, 8h às 18h / Sáb, 8h às 12h"
                    />
                  </div>

                  <div>
                    <label className="label">Endereço</label>
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="input"
                      placeholder="Rua Exemplo, 123 – Bairro – Cidade/UF"
                    />
                  </div>

                  <div>
                    <label className="label">Especialidades atendidas</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
                        className="input flex-1"
                        placeholder="Ex: Fonoaudiologia, ABA, Psicologia..."
                      />
                      <button
                        onClick={addSpecialty}
                        className="btn-primary flex-shrink-0"
                      >
                        Adicionar
                      </button>
                    </div>
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {specialties.map((s) => (
                          <span
                            key={s}
                            className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full"
                          >
                            {s}
                            <button
                              onClick={() => removeSpecialty(s)}
                              className="hover:text-primary-900 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── FAQ ────────────────────────────────────────── */}
              {activeSection === 'faq' && (
                <div className="card space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">FAQ Personalizado</h3>
                      <p className="text-slate-500 text-sm mt-0.5">
                        Perguntas e respostas que o agente usará para responder automaticamente.
                      </p>
                    </div>
                    <button onClick={addFaq} className="btn-primary text-sm">
                      + Adicionar pergunta
                    </button>
                  </div>

                  {faqs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Nenhuma pergunta cadastrada.</p>
                      <p className="text-xs mt-1">Clique em &ldquo;Adicionar pergunta&rdquo; para começar.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Pergunta {i + 1}
                            </span>
                            <button
                              onClick={() => removeFaq(i)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Remover
                            </button>
                          </div>
                          <div>
                            <label className="label text-xs">Pergunta</label>
                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => updateFaq(i, 'q', e.target.value)}
                              className="input text-sm"
                              placeholder="Ex: Vocês atendem pelo plano X?"
                            />
                          </div>
                          <div>
                            <label className="label text-xs">Resposta</label>
                            <textarea
                              value={faq.a}
                              onChange={(e) => updateFaq(i, 'a', e.target.value)}
                              className="input resize-none h-20 text-sm"
                              placeholder="Sim, atendemos pelo plano X. Entre em contato para agendar..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ESCALADA ───────────────────────────────────── */}
              {activeSection === 'escalada' && (
                <div className="card space-y-5">
                  <div>
                    <h3 className="font-bold text-slate-900">Regras de Escalada</h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Quando o contato mencionar estes tópicos, o agente transfere automaticamente para a equipe.
                    </p>
                  </div>

                  {/* Preset rules */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Regras pré-definidas</p>
                    <div className="space-y-2">
                      {PRESET_ESCALATE_RULES.map((rule) => {
                        const enabled = escalateRules.includes(rule)
                        return (
                          <div
                            key={rule}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                              enabled ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <span className={`text-sm ${enabled ? 'text-amber-800 font-medium' : 'text-slate-600'}`}>
                              {rule}
                            </span>
                            <button
                              onClick={() => togglePresetRule(rule)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                enabled ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  enabled ? 'translate-x-4.5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom rules */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Regras personalizadas</p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={customRule}
                        onChange={(e) => setCustomRule(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomRule() } }}
                        className="input flex-1"
                        placeholder="Ex: Perguntas sobre convênios..."
                      />
                      <button onClick={addCustomRule} className="btn-primary flex-shrink-0">
                        Adicionar
                      </button>
                    </div>

                    {escalateRules.filter((r) => !PRESET_ESCALATE_RULES.includes(r)).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {escalateRules
                          .filter((r) => !PRESET_ESCALATE_RULES.includes(r))
                          .map((rule) => (
                            <span
                              key={rule}
                              className="flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-200"
                            >
                              {rule}
                              <button
                                onClick={() => removeRule(rule)}
                                className="hover:text-amber-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PREVIEW ────────────────────────────────────── */}
              {activeSection === 'preview' && (
                <div className="card space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Prévia do Prompt</h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Exatamente como será enviado ao Claude. Atualizado em tempo real.
                    </p>
                  </div>
                  <pre className="bg-slate-900 text-green-300 text-xs leading-relaxed p-4 rounded-2xl overflow-x-auto whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto">
                    {promptPreview}
                  </pre>
                </div>
              )}

              {/* Save button */}
              <div className="flex items-center gap-4 pb-8">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Configurações'
                  )}
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Configurações salvas!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

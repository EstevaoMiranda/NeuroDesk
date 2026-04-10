'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import MetricCard from '@/components/ui/MetricCard'
import type { DashboardMetrics, EscaladaItem, AgentActivityItem } from '@/types'
import { getSpecialtyLabel, getSpecialtyColor, getLabelText } from '@/lib/utils'

function formatWaitTime(updatedAt: Date | string): { label: string; color: string } {
  const mins = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000)
  let label: string
  if (mins < 60) {
    label = `Aguardando há ${mins} min`
  } else {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    label = `Aguardando há ${h}h${m > 0 ? ` ${m}min` : ''}`
  }
  const color = mins > 30 ? 'bg-red-100 text-red-700' : mins > 10 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
  return { label, color }
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// ── Escalada card ─────────────────────────────────────────────────────────────
function EscaladaCard({ contato }: { contato: EscaladaItem }) {
  const { label, color } = formatWaitTime(contato.updatedAt)
  const summary = contato.escalateSummary

  return (
    <div className="bg-white rounded-2xl border border-slate-200 border-l-[3px] border-l-red-400 p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-red-600 text-sm font-bold">{getInitials(contato.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{contato.name}</p>
          <p className="text-slate-400 text-xs">{contato.phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${color}`}>
            {label}
          </span>
          <span className="text-[11px] text-slate-400">{formatTime(contato.updatedAt)}</span>
        </div>
      </div>

      {/* AI summary grid */}
      {summary && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Intenção',          value: summary.intencao },
            { label: 'Dúvida principal',  value: summary.duvida },
            { label: 'Perfil coletado',   value: summary.perfil },
            { label: 'Motivo da escalada', value: summary.motivoEscalada },
          ].map(({ label: l, value }) => (
            <div key={l} className="bg-slate-50 rounded-lg p-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{l}</p>
              <p className="text-xs text-slate-700 leading-snug line-clamp-2">{value || '—'}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/inbox?contactId=${contato.id}`}
        className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
        </svg>
        Assumir atendimento
      </Link>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EscaladasEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700 text-sm">Tudo em dia</p>
      <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
        O agente está resolvendo os atendimentos sem precisar de ajuda.
      </p>
    </div>
  )
}

// ── Agent activity item ───────────────────────────────────────────────────────
function AgentActivityRow({ msg }: { msg: AgentActivityItem }) {
  const isLead = msg.contact.label === 'NEW' || msg.contact.label === 'VISITA'
  const preview = msg.content.length > 80 ? msg.content.slice(0, 80) + '…' : msg.content

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-slate-900 truncate">{msg.contact.name}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            isLead ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}>
            {isLead ? 'Lead qualificado' : 'Resolvido'}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-snug">{preview}</p>
      </div>
      <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{formatTime(msg.createdAt)}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/dashboard/metrics')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Erro ao carregar métricas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMetrics()
  }, [])

  const escaladas: EscaladaItem[]       = metrics?.escaladas    ?? []
  const agentActivity: AgentActivityItem[] = metrics?.agentActivity ?? []

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* ── Metric Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
            title="Novos Contatos"
            value={loading ? '...' : (metrics?.novosContatos ?? 0)}
            subtitle="Aguardando atendimento"
          />
          <MetricCard
            color="amber"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Visitas Agendadas"
            value={loading ? '...' : (metrics?.visitasAgendadas ?? 0)}
            subtitle="Aguardando visita"
          />
          <MetricCard
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Leads Frios (Alerta)"
            value={loading ? '...' : (metrics?.leadsFriosAlerta ?? 0)}
            subtitle="Sem resposta há +7 dias"
          />
          <MetricCard
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title="Escaladas hoje"
            value={loading ? '...' : escaladas.length}
            subtitle="Aguardando atendimento humano"
          />
        </div>

        {/* ── Main grid: escaladas + agent activity + sidebar ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: escaladas + agent activity (2/3 width) */}
          <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Escaladas pendentes (60%) ───────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900">Requer atenção humana</h2>
                {!loading && escaladas.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {escaladas.length}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-slate-200 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                          <div className="h-3 bg-slate-200 rounded w-1/3" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((j) => <div key={j} className="h-12 bg-slate-100 rounded-lg" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : escaladas.length === 0 ? (
                <div className="card">
                  <EscaladasEmpty />
                </div>
              ) : (
                <div className="space-y-3">
                  {escaladas.map((c) => <EscaladaCard key={c.id} contato={c} />)}
                </div>
              )}
            </div>

            {/* ── Atividade do agente (40%) ───────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900">Agente hoje</h2>
                <span className="text-xs text-slate-400">Últimas 24h</span>
              </div>

              <div className="card">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse py-2">
                        <div className="w-2 h-2 bg-slate-200 rounded-full mt-1.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : agentActivity.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-500">Agente sem atividade</p>
                    <p className="text-xs mt-0.5">Nenhuma resposta enviada hoje.</p>
                  </div>
                ) : (
                  <div>
                    {agentActivity.map((msg) => (
                      <AgentActivityRow key={msg.id} msg={msg} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar right: Funil + Especialidades (mantidos) ──────────── */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-base font-bold text-slate-900 mb-4">Funil de Atendimento</h3>
              <div className="space-y-3">
                {[
                  { emoji: '🆕', label: 'Novos',             color: 'bg-gray-200',    key: 'novosContatos' as const },
                  { emoji: '🟡', label: 'Visitas Marcadas',   color: 'bg-amber-200',   key: 'visitasAgendadas' as const },
                  { emoji: '🟢', label: 'Clientes',           color: 'bg-emerald-200', key: null },
                ].map(({ emoji, label, color, key }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${color}`} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-slate-600">{emoji} {label}</span>
                      <span className="text-sm font-bold text-slate-800">
                        {loading ? '…' : key ? (metrics?.[key] ?? 0) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-base font-bold text-slate-900 mb-4">Sessões por Especialidade</h3>
              <div className="space-y-3">
                {(
                  [
                    { specialty: 'FONOAUDIOLOGIA' as const, count: 3 },
                    { specialty: 'TERAPIA_OCUPACIONAL' as const, count: 4 },
                    { specialty: 'PSICOLOGIA' as const, count: 2 },
                  ] as const
                ).map(({ specialty, count }) => (
                  <div key={specialty} className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSpecialtyColor(specialty)}`}>
                      {getSpecialtyLabel(specialty)}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

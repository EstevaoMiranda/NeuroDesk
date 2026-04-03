'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import MetricCard from '@/components/ui/MetricCard'
import type { DashboardMetrics } from '@/types'
import { formatDateTime, getSpecialtyLabel, getSpecialtyColor, getSessionStatusLabel } from '@/lib/utils'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
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
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Taxa de Conversão"
            value={loading ? '...' : `${metrics?.taxaConversao ?? 0}%`}
            subtitle="Leads → Clientes"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="xl:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Atividade Recente</h2>
              <span className="text-sm text-slate-400">Últimos 7 dias</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(metrics?.atividadesRecentes || []).slice(0, 8).map((atividade) => (
                  <div key={atividade.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${atividade.tipo === 'mensagem' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {atividade.tipo === 'mensagem' ? (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{atividade.contactName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{atividade.conteudo}</p>
                      <p className="text-xs text-slate-300 mt-1">{formatDateTime(atividade.timestamp)}</p>
                    </div>
                    {atividade.status && (
                      <span className="text-xs text-slate-400 flex-shrink-0">{atividade.status}</span>
                    )}
                  </div>
                ))}

                {(!metrics?.atividadesRecentes || metrics.atividadesRecentes.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Funil de labels */}
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

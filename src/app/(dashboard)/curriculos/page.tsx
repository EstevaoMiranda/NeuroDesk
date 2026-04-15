'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Candidato {
  id: string
  name: string
  phone: string
  email?: string | null
  candidateStatus?: string | null
  resumeUrl?: string | null
  resumeSummary?: string | null
  rejectionReason?: string | null
  rejectionCount?: number
  updatedAt: string
  createdAt: string
}

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'NOVO', label: 'Novo' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'ENTREVISTA', label: 'Entrevista' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
]

const STATUS_COLORS: Record<string, string> = {
  NOVO:       'bg-blue-100 text-blue-700',
  EM_ANALISE: 'bg-amber-100 text-amber-700',
  ENTREVISTA: 'bg-purple-100 text-purple-700',
  APROVADO:   'bg-green-100 text-green-700',
  REJEITADO:  'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  NOVO:       'Novo',
  EM_ANALISE: 'Em Análise',
  ENTREVISTA: 'Entrevista',
  APROVADO:   'Aprovado',
  REJEITADO:  'Rejeitado',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (d.length === 13) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return phone
}

export default function CurriculosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected]     = useState<Candidato | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason]       = useState('')
  const [actionLoading, setActionLoading]     = useState(false)
  const [toast, setToast]           = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCandidatos = useCallback(async () => {
    try {
      const url = statusFilter
        ? `/api/curriculos?status=${statusFilter}`
        : '/api/curriculos'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setCandidatos(data)
        // Refresh selected if it changed
        if (selected) {
          const refreshed = data.find((c: Candidato) => c.id === selected.id)
          if (refreshed) setSelected(refreshed)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter, selected])

  useEffect(() => {
    setLoading(true)
    fetchCandidatos()
  }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(contactId: string, status: string) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/curriculos/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, status }),
      })
      if (res.ok) {
        showToast(`Status atualizado para ${STATUS_LABELS[status] ?? status}`)
        await fetchCandidatos()
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/curriculos/rejeitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: selected.id, reason: rejectReason }),
      })
      if (res.ok) {
        showToast('Candidato rejeitado')
        setShowRejectModal(false)
        setRejectReason('')
        await fetchCandidatos()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = candidatos

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Currículos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Candidatos recebidos via WhatsApp</p>
        </div>
        <span className="text-sm text-slate-400">{candidatos.length} candidato{candidatos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Status filter tabs */}
      <div className="px-6 py-3 border-b border-slate-100 bg-white flex gap-2 flex-wrap flex-shrink-0">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setSelected(null) }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              statusFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — list */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm gap-2">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Nenhum currículo encontrado
            </div>
          ) : (
            <ul>
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelected(c)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                      selected?.id === c.id && 'bg-primary-50 border-l-2 border-l-primary-500'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatPhone(c.phone)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={cn(
                          'text-xs font-medium px-1.5 py-0.5 rounded',
                          STATUS_COLORS[c.candidateStatus ?? 'NOVO'] ?? 'bg-slate-100 text-slate-600'
                        )}>
                          {STATUS_LABELS[c.candidateStatus ?? 'NOVO'] ?? c.candidateStatus ?? 'Novo'}
                        </span>
                        {(c.rejectionCount ?? 0) > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                            Reincidente ({c.rejectionCount})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(c.updatedAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right panel — detail */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-sm">Selecione um candidato</p>
            </div>
          ) : (
            <div className="p-6 max-w-2xl">
              {/* Candidate header */}
              <div className="card mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
                      {(selected.rejectionCount ?? 0) > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          Reincidente — {selected.rejectionCount}x rejeitado{(selected.rejectionCount ?? 0) > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{formatPhone(selected.phone)}</p>
                    {selected.email && (
                      <p className="text-sm text-slate-500">{selected.email}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Recebido em {formatDate(selected.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      'text-sm font-semibold px-2.5 py-1 rounded-lg',
                      STATUS_COLORS[selected.candidateStatus ?? 'NOVO'] ?? 'bg-slate-100 text-slate-600'
                    )}>
                      {STATUS_LABELS[selected.candidateStatus ?? 'NOVO'] ?? selected.candidateStatus ?? 'Novo'}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.resumeUrl && (
                    <a
                      href={selected.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Ver PDF
                    </a>
                  )}
                  <select
                    value={selected.candidateStatus ?? 'NOVO'}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                    disabled={actionLoading}
                    className="input text-sm py-1.5 px-2 h-auto"
                  >
                    {STATUS_FILTERS.filter((f) => f.value).map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  {selected.candidateStatus !== 'REJEITADO' && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Rejeitar
                    </button>
                  )}
                </div>
              </div>

              {/* Resume summary */}
              {selected.resumeSummary && (
                <div className="card mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Resumo extraído pela IA
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-line">
                    {selected.resumeSummary}
                  </div>
                </div>
              )}

              {/* Rejection history */}
              {selected.rejectionReason && (
                <div className="card border border-red-100">
                  <h3 className="text-sm font-semibold text-red-700 mb-2">Motivo da última rejeição</h3>
                  <p className="text-sm text-slate-600">{selected.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Rejeitar candidato</h2>
            <p className="text-sm text-slate-500 mb-4">{selected.name}</p>
            <label className="label">Motivo da rejeição (opcional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: perfil não se encaixa na vaga atual..."
              rows={3}
              className="input mt-1 resize-none"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason('') }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Rejeitando...' : 'Confirmar rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}

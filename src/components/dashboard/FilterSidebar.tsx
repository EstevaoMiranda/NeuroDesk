'use client'

import { useState } from 'react'

const FILTERS = [
  { id: 'profissional', label: 'Profissional', options: ['Todos', 'Ana Beatriz', 'Carlos Lima', 'Fernanda S.', 'João Pedro'] },
  { id: 'especialidade', label: 'Especialidade', options: ['Todas', 'Fonoaudiologia', 'Terapia Ocupacional', 'Psicologia', 'ABA'] },
  { id: 'setor', label: 'Setor', options: ['Todos', 'Infantil', 'Adultos', 'Adolescentes'] },
  { id: 'tipo', label: 'Tipo de sessão', options: ['Todos', 'Avaliação', 'Terapia', 'AT', 'Visita'] },
]

export default function FilterSidebar() {
  const [selected, setSelected] = useState<Record<string, string>>({
    profissional: 'Todos',
    especialidade: 'Todas',
    setor: 'Todos',
    tipo: 'Todos',
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-4 h-full">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold self-start"
        style={{ background: '#EEF0FC', color: '#4F5FE0' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Abr 2025 — hoje
      </div>

      <div className="flex flex-col gap-2">
        {FILTERS.map((f) => (
          <div key={f.id}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {f.label}
            </label>
            <select
              value={selected[f.id]}
              onChange={(e) => setSelected((s) => ({ ...s, [f.id]: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={() => setSelected({ profissional: 'Todos', especialidade: 'Todas', setor: 'Todos', tipo: 'Todos' })}
        className="mt-auto text-xs text-slate-400 hover:text-slate-600 transition-colors self-start"
      >
        Limpar filtros
      </button>
    </div>
  )
}

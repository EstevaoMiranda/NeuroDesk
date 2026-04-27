'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import WeekGrid from '@/components/agendamentos/WeekGrid'
import NewSessionModal from '@/components/agendamentos/NewSessionModal'
import { mockSessions } from '@/lib/mock/sessionsData'

const STATUS_LEGEND = [
  { label: 'Agendada',   style: 'bg-[#EEF0FC] border-l-2 border-[#4F5FE0]' },
  { label: 'Confirmada', style: 'bg-[#EAF3DE] border-l-2 border-[#1B9E5A]' },
  { label: 'Falta',      style: 'bg-[#FEECEC] border-l-2 border-[#E24B4A]' },
  { label: 'AT pendente',style: 'bg-gray-100   border-l-2 border-gray-400' },
]

export default function AgendamentosPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Agendamentos" />

      <div className="flex-1 p-6">
        {/* Header controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">Abril 2025 — semana 28</span>
            <button className="p-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="text-xs text-gray-500 border border-gray-200 bg-white px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors ml-1">
              Hoje
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="hidden md:flex items-center gap-3 mr-2">
              {STATUS_LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-sm ${l.style}`} />
                  <span className="text-[10px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: '#4F5FE0' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agendar
            </button>
          </div>
        </div>

        {/* Week grid */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <WeekGrid sessions={mockSessions} />
        </div>

        {/* Session count summary */}
        <p className="text-xs text-gray-400 mt-3 text-right">
          {mockSessions.length} sessões nesta semana
        </p>
      </div>

      {showModal && <NewSessionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

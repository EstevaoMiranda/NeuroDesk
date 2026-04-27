'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import KanbanColumn from '@/components/leads/KanbanColumn'
import NewLeadModal from '@/components/leads/NewLeadModal'
import { mockLeads, STAGES } from '@/lib/mock/leadsData'
import type { LeadStage } from '@/lib/mock/leadsData'

export default function LeadsPage() {
  const [showModal, setShowModal] = useState(false)

  const byStage = (stage: LeadStage) => mockLeads.filter((l) => l.stage === stage)

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Funil de leads" />

      <div className="flex-1 p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{mockLeads.length} leads no funil</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: '#4F5FE0' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo lead
            </button>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              leads={byStage(stage.id)}
            />
          ))}
        </div>
      </div>

      {showModal && <NewLeadModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

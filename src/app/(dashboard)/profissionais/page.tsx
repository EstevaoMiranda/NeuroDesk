'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import ProfessionalCard from '@/components/profissionais/ProfessionalCard'
import AddProfessionalModal from '@/components/profissionais/AddProfessionalModal'
import { mockProfessionals } from '@/lib/mock/professionalsData'
import type { ProfSpecialty } from '@/lib/mock/professionalsData'

const SPECIALTY_FILTERS: { id: ProfSpecialty | 'all'; label: string }[] = [
  { id: 'all',         label: 'Todas' },
  { id: 'autismo',     label: 'Autismo' },
  { id: 'tdah',        label: 'TDAH' },
  { id: 'atraso-fala', label: 'Atraso de fala' },
]

export default function ProfissionaisPage() {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<ProfSpecialty | 'all'>('all')

  const filtered = filter === 'all'
    ? mockProfessionals
    : mockProfessionals.filter((p) => p.specialties.includes(filter))

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Equipe" />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {SPECIALTY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  filter === f.id
                    ? 'bg-[#EEF0FC] border-[#4F5FE0] text-[#4F5FE0] font-medium'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
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
            Adicionar
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((prof) => (
            <ProfessionalCard key={prof.id} prof={prof} />
          ))}

          {/* Add card */}
          <button
            onClick={() => setShowModal(true)}
            className="border border-dashed border-gray-300 rounded-xl flex items-center justify-center min-h-[160px] hover:bg-gray-50 transition-colors"
          >
            <div className="text-center text-gray-400">
              <p className="text-2xl mb-1">+</p>
              <p className="text-xs">Adicionar profissional</p>
            </div>
          </button>
        </div>
      </div>

      {showModal && <AddProfessionalModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

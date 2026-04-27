'use client'

import { useState } from 'react'

const SPECIALTIES_OPTIONS = ['Autismo', 'TDAH', 'Atraso de fala', 'Outro']

interface Props {
  onClose: () => void
}

export default function AddProfessionalModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    role: 'Fonoaudióloga',
    specialties: [] as string[],
    isAT: false,
    hourlyRate: '',
    phone: '',
  })

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Adicionar profissional</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Especialidade / função</label>
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
            >
              <option>Fonoaudióloga</option>
              <option>Psicóloga</option>
              <option>Terapeuta Ocupacional</option>
              <option>AT</option>
              <option>Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Especialidades atendidas</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    form.specialties.includes(s)
                      ? 'bg-[#EEF0FC] border-[#4F5FE0] text-[#4F5FE0]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* IS AT toggle */}
          <div className="flex items-center justify-between py-1">
            <label className="text-xs font-medium text-gray-600">É Atendente Terapêutico (AT)?</label>
            <button
              type="button"
              onClick={() => update('isAT', !form.isAT)}
              className={`relative w-9 h-5 rounded-full transition-colors ${form.isAT ? 'bg-[#4F5FE0]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isAT ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {form.isAT && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor por hora (R$)</label>
              <input
                type="number"
                value={form.hourlyRate}
                onChange={(e) => update('hourlyRate', e.target.value)}
                placeholder="Ex: 40"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ background: '#4F5FE0' }}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

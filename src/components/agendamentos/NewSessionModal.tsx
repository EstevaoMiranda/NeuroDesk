'use client'

import { useState } from 'react'

const PATIENTS = ['Lucas F.', 'Miguel S.', 'Ana C.', 'Davi P.', 'Sofia R.', 'Clara B.', 'Pedro T.', 'Sophia A.']
const PROFESSIONALS = ['Ana Beatriz', 'Carlos Lima', 'Fernanda Santos', 'João Pedro', 'Mariana Teixeira']
const TIMES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

interface Props {
  onClose: () => void
}

export default function NewSessionModal({ onClose }: Props) {
  const [form, setForm] = useState({
    patient: '',
    professional: '',
    date: '',
    time: '08:00',
    recurrence: 'single',
    notes: '',
  })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Agendar sessão</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Paciente</label>
            <select
              required
              value={form.patient}
              onChange={(e) => update('patient', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
            >
              <option value="">Selecione...</option>
              {PATIENTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Profissional</label>
            <select
              required
              value={form.professional}
              onChange={(e) => update('professional', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
            >
              <option value="">Selecione...</option>
              {PROFESSIONALS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Horário</label>
              <select
                value={form.time}
                onChange={(e) => update('time', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
              >
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Recorrência</label>
            <select
              value={form.recurrence}
              onChange={(e) => update('recurrence', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
            >
              <option value="single">Sessão única</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] resize-none"
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
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

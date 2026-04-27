'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

export default function NewLeadModal({ onClose }: Props) {
  const [form, setForm] = useState({
    familyName: '',
    phone: '',
    diagnosis: 'autismo',
    origin: 'whatsapp',
    notes: '',
  })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mock: just close modal
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Novo lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome da família</label>
            <input
              type="text"
              required
              value={form.familyName}
              onChange={(e) => update('familyName', e.target.value)}
              placeholder="Ex: Família Rodrigues"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
            />
          </div>

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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Diagnóstico</label>
            <select
              value={form.diagnosis}
              onChange={(e) => update('diagnosis', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
            >
              <option value="autismo">Autismo</option>
              <option value="tdah">TDAH</option>
              <option value="atraso-fala">Atraso de fala</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Origem do contato</label>
            <select
              value={form.origin}
              onChange={(e) => update('origin', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] bg-white"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="indicacao">Indicação médico</option>
              <option value="site">Site</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={3}
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
              Criar lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

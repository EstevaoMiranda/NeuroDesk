'use client'

import { useState } from 'react'

interface NotifSetting {
  id: string
  label: string
  description?: string
  push: boolean
  email: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#4F5FE0]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function NotificacoesSection() {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: 'new-lead',    label: 'Novo lead recebido',               description: 'Quando chegar um novo contato via WhatsApp', push: true,  email: false },
    { id: 'no-response', label: 'Lead sem resposta há mais de 24h', description: 'Alerta para leads em triagem parados',         push: true,  email: true },
    { id: 'session',     label: 'Sessão não confirmada em 48h',     description: 'Antes da sessão agendada',                    push: true,  email: false },
    { id: 'at',          label: 'Alerta de AT (janela de decisão)', description: 'Quando a clínica precisa responder sobre AT',  push: true,  email: true },
    { id: 'daily',       label: 'Resumo diário às 08h',             description: 'Resumo de atividades do dia',                 push: false, email: true },
  ])

  function toggle(id: string, type: 'push' | 'email') {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, [type]: !s[type] } : s))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Notificações</h3>
      <p className="text-xs text-gray-400 mb-4">Configure quando e como você quer ser notificado.</p>

      {/* Header row */}
      <div className="grid grid-cols-[1fr_48px_48px] gap-2 mb-2 pb-2 border-b border-gray-100">
        <div />
        <p className="text-[10px] font-semibold text-gray-400 text-center uppercase tracking-wider">Push</p>
        <p className="text-[10px] font-semibold text-gray-400 text-center uppercase tracking-wider">Email</p>
      </div>

      <div className="space-y-0">
        {settings.map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_48px_48px] gap-2 items-center py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm text-gray-700">{s.label}</p>
              {s.description && <p className="text-[11px] text-gray-400 mt-0.5">{s.description}</p>}
            </div>
            <div className="flex justify-center">
              <Toggle checked={s.push}  onChange={() => toggle(s.id, 'push')} />
            </div>
            <div className="flex justify-center">
              <Toggle checked={s.email} onChange={() => toggle(s.id, 'email')} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          className="text-sm font-medium text-white px-4 py-2 rounded-lg"
          style={{ background: '#4F5FE0' }}
        >
          Salvar preferências
        </button>
      </div>
    </div>
  )
}

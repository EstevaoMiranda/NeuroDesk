'use client'

import { useState } from 'react'

interface AIConfig {
  isEnabled: boolean
  autoReplyLeads: boolean
  autoReplyClients: boolean
  escalateOnKeywords: boolean
  escalateKeywords: string
  responseDelaySeconds: number
  greeting: string
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#4F5FE0]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

function Row({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function IASection() {
  const [config, setConfig] = useState<AIConfig>({
    isEnabled: true,
    autoReplyLeads: true,
    autoReplyClients: true,
    escalateOnKeywords: true,
    escalateKeywords: 'laudo, diagnóstico, urgente, médico',
    responseDelaySeconds: 8,
    greeting: 'Olá! Sou a assistente virtual da Terap Moviment 😊 Como posso te ajudar hoje?',
  })

  function toggle(key: keyof AIConfig) {
    setConfig((c) => ({ ...c, [key]: !c[key] }))
  }

  return (
    <div className="space-y-4">
      {/* Main toggle card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Agente IA</h3>
            <p className="text-xs text-gray-400 mt-0.5">Respostas automáticas via Claude</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                config.isEnabled ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FEECEC] text-[#791F1F]'
              }`}
            >
              {config.isEnabled ? 'Ativo' : 'Inativo'}
            </span>
            <Toggle checked={config.isEnabled} onChange={() => toggle('isEnabled')} />
          </div>
        </div>
      </div>

      {/* Behavior settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Comportamento</h3>

        <Row
          label="Responder automaticamente novos leads"
          description="Ativa o agente para conversas com label 'Novo'"
          checked={config.autoReplyLeads}
          onChange={() => toggle('autoReplyLeads')}
        />
        <Row
          label="Responder clientes sobre sessões"
          description="Lembretes e confirmações automáticas"
          checked={config.autoReplyClients}
          onChange={() => toggle('autoReplyClients')}
        />
        <Row
          label="Escalar ao detectar palavras-chave"
          checked={config.escalateOnKeywords}
          onChange={() => toggle('escalateOnKeywords')}
        />

        {config.escalateOnKeywords && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Palavras-chave para escalada (separadas por vírgula)
            </label>
            <input
              type="text"
              value={config.escalateKeywords}
              onChange={(e) => setConfig((c) => ({ ...c, escalateKeywords: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0]"
            />
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Delay de resposta simulado (segundos)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={30}
              value={config.responseDelaySeconds}
              onChange={(e) => setConfig((c) => ({ ...c, responseDelaySeconds: Number(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-gray-700 w-8 text-right">
              {config.responseDelaySeconds}s
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            O agente aguarda este tempo antes de responder para parecer mais natural.
          </p>
        </div>
      </div>

      {/* Greeting message */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Mensagem de boas-vindas</h3>
        <textarea
          value={config.greeting}
          onChange={(e) => setConfig((c) => ({ ...c, greeting: e.target.value }))}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4F5FE0]/30 focus:border-[#4F5FE0] resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#4F5FE0' }}
          >
            Salvar configurações
          </button>
        </div>
      </div>
    </div>
  )
}

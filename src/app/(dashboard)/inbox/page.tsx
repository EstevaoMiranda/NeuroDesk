'use client'

import { useState, useEffect, useRef } from 'react'
import type { WaConversation, WaLabel, WaMessage } from '@/lib/mock/inboxData'
import { conversations as initialConversations } from '@/lib/mock/inboxData'

const LABEL_STYLES: Record<WaLabel, string> = {
  CLIENTE:      'bg-[#00a884] text-[#111b21]',
  LEAD:         'bg-[#4F5FE0] text-white',
  NEW:          'bg-[#E09B10] text-white',
  PROFISSIONAL: 'bg-[#7B5FE0] text-white',
  CURRICULO:    'bg-[#D94040] text-white',
  LEAD_FRIO:    'bg-[#3B82F6] text-white',
  VISITA:       'bg-[#F59E0B] text-[#111b21]',
}

const LABEL_TEXT: Record<WaLabel, string> = {
  CLIENTE:      'Cliente',
  LEAD:         'Lead',
  NEW:          'Novo',
  PROFISSIONAL: 'Profissional',
  CURRICULO:    'Currículo',
  LEAD_FRIO:    'Lead Frio',
  VISITA:       'Visita',
}

type FilterTab = 'ALL' | WaLabel

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'ALL',     label: 'Todos' },
  { id: 'CLIENTE', label: 'Clientes' },
  { id: 'LEAD',    label: 'Leads' },
  { id: 'NEW',     label: 'Novos' },
]

export default function InboxPage() {
  const [convs, setConvs]           = useState<WaConversation[]>(initialConversations)
  const [selected, setSelected]     = useState<WaConversation | null>(null)
  const [filter, setFilter]         = useState<FilterTab>('ALL')
  const [search, setSearch]         = useState('')
  const [message, setMessage]       = useState('')
  const messagesEndRef              = useRef<HTMLDivElement>(null)

  const filtered = convs.filter((c) => {
    const matchesTab    = filter === 'ALL' || c.label === filter
    const matchesSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.messages.length])

  function selectConv(conv: WaConversation) {
    setConvs((prev) =>
      prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
    )
    setSelected({ ...conv, unreadCount: 0 })
  }

  function sendMessage() {
    if (!message.trim() || !selected) return
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const newMsg: WaMessage = { id: `m${Date.now()}`, type: 'out', text: message.trim(), time: now }

    setConvs((prev) =>
      prev.map((c) => c.id === selected.id
        ? { ...c, messages: [...c.messages, newMsg], preview: message.trim(), time: now }
        : c
      )
    )
    setSelected((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null)
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const totalUnread = convs.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: '#111b21' }}
    >
      {/* ── Col 1: Left panel (search + tabs + conversation list) ──────── */}
      <div
        className="w-[300px] flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: '#1f2c34', background: '#111b21' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: '#202c33' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4F5FE0] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              N
            </div>
            <span className="text-[#e9edef] font-semibold text-sm">NeuroDesk</span>
          </div>
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <span className="bg-[#00a884] text-[#111b21] text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalUnread}
              </span>
            )}
            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 flex-shrink-0" style={{ background: '#202c33' }}>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg outline-none placeholder-[#8696a0] text-[#e9edef]"
              style={{ background: '#2a3942' }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: '#1f2c34', background: '#202c33' }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="flex-1 py-2 text-xs font-medium transition-colors border-b-2"
              style={{
                color: filter === tab.id ? '#00a884' : '#8696a0',
                borderColor: filter === tab.id ? '#00a884' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#111b21' }}>
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[#8696a0] text-sm">
              Nenhuma conversa
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConv(conv)}
                className="w-full flex items-start gap-3 px-3 py-3 border-b text-left transition-colors"
                style={{
                  borderColor: '#1f2c34',
                  background: selected?.id === conv.id ? '#2a3942' : 'transparent',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: conv.avatarColor }}
                >
                  {conv.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-sm font-medium text-[#e9edef] truncate">{conv.name}</span>
                    <span className="text-[10px] text-[#8696a0] flex-shrink-0">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-[#8696a0] truncate">{conv.preview}</span>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#00a884] text-[#111b21] text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {/* Label pill */}
                  <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${LABEL_STYLES[conv.label]}`}>
                    {LABEL_TEXT[conv.label]}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Col 2: Chat area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          /* Empty state */
          <div
            className="flex-1 flex flex-col items-center justify-center gap-4"
            style={{ background: '#0b141a' }}
          >
            <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[#e9edef] font-medium">NeuroDesk Inbox</p>
              <p className="text-[#8696a0] text-sm mt-1">Selecione uma conversa para começar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: '#202c33' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: selected.avatarColor }}
                >
                  {selected.initials}
                </div>
                <div>
                  <p className="text-[#e9edef] font-medium text-sm">{selected.name}</p>
                  <p className="text-[#8696a0] text-xs">{LABEL_TEXT[selected.label]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LABEL_STYLES[selected.label]}`}>
                  {LABEL_TEXT[selected.label]}
                </span>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors ml-1">
                  <svg className="w-5 h-5 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2"
              style={{
                background: '#0b141a',
                backgroundImage: 'radial-gradient(circle at 1px 1px, #1f2c34 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            >
              {selected.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer input */}
            <div
              className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
              style={{ background: '#202c33' }}
            >
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
                <svg className="w-5 h-5 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
                <svg className="w-5 h-5 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma mensagem"
                className="flex-1 px-4 py-2 text-sm rounded-full outline-none text-[#e9edef] placeholder-[#8696a0]"
                style={{ background: '#2a3942' }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
                style={{ background: '#00a884' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Col 3: Contact info panel ──────────────────────────────────── */}
      {selected && (
        <div
          className="w-[200px] flex-shrink-0 flex flex-col overflow-y-auto border-l"
          style={{ background: '#0b141a', borderColor: '#2a3942' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex-shrink-0" style={{ background: '#202c33' }}>
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2"
              style={{ background: selected.avatarColor }}
            >
              {selected.initials}
            </div>
            <p className="text-[#e9edef] font-semibold text-sm text-center">{selected.name}</p>
            <p className="text-[#8696a0] text-xs text-center mt-0.5">
              {selected.contactInfo.patientName ? `Resp. de ${selected.contactInfo.patientName}` : LABEL_TEXT[selected.label]}
            </p>
          </div>

          {/* Labels */}
          <div className="px-3 py-2 border-b" style={{ borderColor: '#1f2c34' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#00a884] mb-1.5">Etiqueta</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LABEL_STYLES[selected.label]}`}>
              {LABEL_TEXT[selected.label]}
            </span>
          </div>

          {/* Patient data */}
          <div className="px-3 py-2 border-b" style={{ borderColor: '#1f2c34' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#00a884] mb-2">Dados</p>
            {[
              { key: 'Paciente',     val: selected.contactInfo.patientName },
              { key: 'Diagnóstico',  val: selected.contactInfo.diagnosis },
              { key: 'Profissional', val: selected.contactInfo.professional },
              { key: 'Próx. sessão', val: selected.contactInfo.nextSession },
            ].map(({ key, val }) => val ? (
              <div key={key} className="mb-2">
                <p className="text-[9px] text-[#8696a0] uppercase tracking-wide">{key}</p>
                <p className="text-[11px] text-[#e9edef] leading-snug">{val}</p>
              </div>
            ) : null)}
          </div>

          {/* AI history */}
          {selected.contactInfo.aiHistory && (
            <div className="px-3 py-2 border-b" style={{ borderColor: '#1f2c34' }}>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#00a884] mb-1.5">IA — histórico</p>
              <p className="text-[11px] text-[#8696a0] leading-relaxed">{selected.contactInfo.aiHistory}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-3 py-3 flex flex-col gap-2 mt-auto">
            <button
              className="text-xs font-medium py-2 px-3 rounded-lg text-[#e9edef] transition-colors text-center"
              style={{ background: '#005c4b' }}
            >
              Ver agendamentos
            </button>
            <button
              className="text-xs font-medium py-2 px-3 rounded-lg text-[#8696a0] border transition-colors text-center"
              style={{ borderColor: '#2a3942' }}
            >
              Abrir ficha completa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg }: { msg: WaMessage }) {
  if (msg.type === 'ai') {
    return (
      <div className="self-start max-w-[80%]">
        <div
          className="rounded-tr-lg rounded-b-lg p-2.5"
          style={{ background: '#1e2f38', border: '1px solid #2a4a5a' }}
        >
          <div className="flex items-center gap-1 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] inline-block" />
            <span className="text-[9px] font-medium text-[#00a884]">NeuroDesk IA</span>
          </div>
          <p className="text-[11px] text-[#a8c6d0] leading-relaxed">{msg.text}</p>
          <p className="text-[9px] text-[#8696a0] text-right mt-1">{msg.time}</p>
        </div>
      </div>
    )
  }

  if (msg.type === 'out') {
    return (
      <div className="self-end max-w-[75%]">
        <div className="rounded-lg rounded-tr-none p-2.5" style={{ background: '#005c4b' }}>
          <p className="text-[12px] text-[#e9edef] leading-relaxed">{msg.text}</p>
          <p className="text-[9px] text-[#8696a0] text-right mt-1">{msg.time}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="self-start max-w-[75%]">
      <div className="rounded-lg rounded-tl-none p-2.5" style={{ background: '#202c33' }}>
        <p className="text-[12px] text-[#e9edef] leading-relaxed">{msg.text}</p>
        <p className="text-[9px] text-[#8696a0] text-right mt-1">{msg.time}</p>
      </div>
    </div>
  )
}

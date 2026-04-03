'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import type { Contact, Message, ContactLabel } from '@/types'
import {
  getInitials,
  timeAgo,
  formatDateTime,
  getLabelText,
  getLabelBgColor,
  getLabelHex,
  daysSince,
} from '@/lib/utils'

interface ConversationItem {
  contact: Contact
  messages: Message[]
  unreadCount: number
  lastMessage: Message | null
}

type TabLabel = 'ALL' | ContactLabel

const TABS: { id: TabLabel; emoji: string; label: string }[] = [
  { id: 'ALL',        emoji: '💬', label: 'Todos' },
  { id: 'NEW',        emoji: '🆕', label: 'Novos' },
  { id: 'VISITA',     emoji: '🟡', label: 'Visitas Marcadas' },
  { id: 'LEAD_FRIO',  emoji: '🔵', label: 'Leads Frios' },
  { id: 'CLIENTE',    emoji: '🟢', label: 'Clientes' },
  { id: 'PROFISSIONAL', emoji: '👤', label: 'Profissionais' },
  { id: 'CURRICULO',  emoji: '📄', label: 'Currículos' },
]

const QUICK_REPLIES: Record<ContactLabel | 'ALL', string[]> = {
  ALL: ['Olá! Como posso ajudar?', 'Aguarde um momento.'],
  NEW: [
    'Olá! Seja bem-vindo à Terap Moviment 👋',
    'Como posso te ajudar?',
    'Poderia me contar mais sobre sua necessidade?',
  ],
  VISITA: [
    'Confirmando sua visita 😊 Você virá no horário combinado?',
    'Precisamos reagendar sua visita?',
    'Lembrando que sua visita está agendada para amanhã!',
  ],
  LEAD_FRIO: [
    'Olá! Tudo bem? Ainda tem interesse em conhecer a clínica?',
    'Oi! Passando para retomar contato. Posso ajudar com algo?',
    'Temos novidades que podem te interessar! Posso apresentar?',
  ],
  CLIENTE: [
    'Olá! Como posso ajudar?',
    'Vou verificar com a equipe e retorno em breve!',
    'Tudo certo! Pode deixar que resolvo.',
  ],
  PROFISSIONAL: [
    'Olá! Como posso ajudar?',
    'Vou verificar com nossa equipe.',
    'Pode encaminhar os dados do paciente.',
  ],
  CURRICULO: [
    'Olá! Recebemos seu currículo com interesse.',
    'Nossa equipe irá analisar e entraremos em contato.',
    'Obrigado pelo interesse em fazer parte da nossa equipe!',
  ],
}

const ACTION_BUTTONS: Record<ContactLabel, { label: string; targetLabel: ContactLabel; color: string }[]> = {
  NEW: [
    { label: 'Marcar como Lead Frio', targetLabel: 'LEAD_FRIO', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Agendar Visita',        targetLabel: 'VISITA',    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  ],
  LEAD_FRIO: [
    { label: 'Agendar Visita',        targetLabel: 'VISITA',    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  ],
  VISITA: [
    { label: 'Converteu para Cliente', targetLabel: 'CLIENTE',  color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
  ],
  CLIENTE: [],
  PROFISSIONAL: [],
  CURRICULO: [],
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null)
  const [activeTab, setActiveTab] = useState<TabLabel>('ALL')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [updatingLabel, setUpdatingLabel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  async function loadConversations() {
    try {
      const res = await fetch('/api/mensagens')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function selectConversation(conv: ConversationItem) {
    setSelectedConversation(conv)
    if (conv.unreadCount > 0) {
      setConversations((prev) =>
        prev.map((c) =>
          c.contact.id === conv.contact.id
            ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
            : c
        )
      )
      setSelectedConversation({ ...conv, unreadCount: 0 })
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    setSendingMessage(true)
    const content = newMessage.trim()
    setNewMessage('')

    try {
      const res = await fetch('/api/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: selectedConversation.contact.id,
          content,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const newMsg: Message = data.message

        setSelectedConversation((prev) => {
          if (!prev) return prev
          return { ...prev, messages: [...prev.messages, newMsg], lastMessage: newMsg }
        })
        setConversations((prev) =>
          prev.map((c) =>
            c.contact.id === selectedConversation.contact.id
              ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg }
              : c
          )
        )
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  async function handleUpdateLabel(contactId: string, newLabel: ContactLabel) {
    setUpdatingLabel(true)
    try {
      const res = await fetch(`/api/contatos/${contactId}/label`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel }),
      })

      if (res.ok) {
        // Update local state
        const updatedContact = { ...selectedConversation!.contact, label: newLabel }
        const updatedConv = { ...selectedConversation!, contact: updatedContact }
        setSelectedConversation(updatedConv)
        setConversations((prev) =>
          prev.map((c) =>
            c.contact.id === contactId
              ? { ...c, contact: { ...c.contact, label: newLabel } }
              : c
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar etiqueta:', error)
    } finally {
      setUpdatingLabel(false)
    }
  }

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((conv) =>
    activeTab === 'ALL' ? true : conv.contact.label === activeTab
  )

  const tabCounts = useCallback(
    (tab: TabLabel) => {
      if (tab === 'ALL') return conversations.reduce((s, c) => s + c.unreadCount, 0)
      return conversations
        .filter((c) => c.contact.label === tab)
        .reduce((s, c) => s + c.unreadCount, 0)
    },
    [conversations]
  )

  const tabTotals = useCallback(
    (tab: TabLabel) => {
      if (tab === 'ALL') return conversations.length
      return conversations.filter((c) => c.contact.label === tab).length
    },
    [conversations]
  )

  const currentLabel = selectedConversation?.contact.label ?? 'NEW'
  const quickReplies = QUICK_REPLIES[currentLabel] || QUICK_REPLIES.ALL
  const actionButtons = ACTION_BUTTONS[currentLabel] || []

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Inbox" />

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">

          {/* Tab bar */}
          <div className="border-b border-slate-100 overflow-x-auto">
            <div className="flex min-w-max">
              {TABS.map((tab) => {
                const unread = tabCounts(tab.id)
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {unread}
                      </span>
                    )}
                    {unread === 0 && tabTotals(tab.id) > 0 && (
                      <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                        {tabTotals(tab.id)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse p-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
                <p className="text-sm">Nenhuma conversa nesta aba</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.contact.id === conv.contact.id
                const days = conv.lastMessage ? daysSince(conv.lastMessage.createdAt) : null
                const isLeadFrioAtrasado = conv.contact.label === 'LEAD_FRIO' && days !== null && days > 7

                return (
                  <button
                    key={conv.contact.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full px-4 py-3 flex items-start gap-3 text-left border-b border-slate-50 transition-colors ${
                      isSelected
                        ? 'bg-primary-50 border-l-2 border-l-primary-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: getLabelHex(conv.contact.label) }}
                      >
                        {getInitials(conv.contact.name)}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {conv.contact.name}
                        </p>
                        <p className="text-[11px] text-slate-400 flex-shrink-0">
                          {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : ''}
                        </p>
                      </div>

                      {/* Label badge */}
                      <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${getLabelBgColor(conv.contact.label)}`}>
                        {getLabelText(conv.contact.label)}
                      </span>

                      {/* Last message preview */}
                      {conv.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                          {conv.lastMessage.direction === 'OUTBOUND' ? 'Você: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}

                      {/* Alert indicators */}
                      {isLeadFrioAtrasado && (
                        <p className="text-[11px] text-red-500 font-medium mt-0.5">
                          ⚠ Sem resposta há {days} dias
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL / CHAT ────────────────────────── */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: getLabelHex(selectedConversation.contact.label) }}
                  >
                    {getInitials(selectedConversation.contact.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{selectedConversation.contact.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getLabelBgColor(selectedConversation.contact.label)}`}>
                        {getLabelText(selectedConversation.contact.label)}
                      </span>
                      <span className="text-xs text-slate-400">{selectedConversation.contact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: label dropdown + action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Manual label change dropdown */}
                  <select
                    value={selectedConversation.contact.label}
                    onChange={(e) => handleUpdateLabel(selectedConversation.contact.id, e.target.value as ContactLabel)}
                    disabled={updatingLabel}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                  >
                    <option value="NEW">🆕 Novo</option>
                    <option value="VISITA">🟡 Visita Marcada</option>
                    <option value="LEAD_FRIO">🔵 Lead Frio</option>
                    <option value="CLIENTE">🟢 Cliente</option>
                    <option value="PROFISSIONAL">👤 Profissional</option>
                    <option value="CURRICULO">📄 Currículo</option>
                  </select>

                  {/* Contextual action buttons */}
                  {actionButtons.map((btn) => (
                    <button
                      key={btn.targetLabel}
                      onClick={() => handleUpdateLabel(selectedConversation.contact.id, btn.targetLabel)}
                      disabled={updatingLabel}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 rounded-2xl text-sm ${
                        msg.direction === 'OUTBOUND'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-slate-800 shadow-sm rounded-bl-md'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.direction === 'OUTBOUND' ? 'text-primary-200' : 'text-slate-400'}`}>
                        {formatDateTime(msg.createdAt)}
                        {msg.direction === 'OUTBOUND' && (
                          <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => setNewMessage(reply)}
                    className="flex-shrink-0 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message input */}
              <div className="bg-white border-t border-slate-200 p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Digite uma mensagem..."
                      rows={1}
                      className="w-full bg-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? (
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">Enter para enviar • Shift+Enter para nova linha</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <h3 className="text-slate-600 font-semibold text-lg">Selecione uma conversa</h3>
                <p className="text-slate-400 text-sm mt-1">Use as abas para filtrar por etiqueta</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

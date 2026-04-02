'use client'

import { useEffect, useState, useRef } from 'react'
import Topbar from '@/components/layout/Topbar'
import type { Contact, Message } from '@/types'
import { getInitials, timeAgo, formatDateTime } from '@/lib/utils'

interface ConversationItem {
  contact: Contact
  messages: Message[]
  unreadCount: number
  lastMessage: Message | null
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickReplies = [
    'Olá! Como posso ajudar?',
    'Aguarde um momento, vou verificar.',
    'Posso te ajudar a agendar uma consulta.',
    'Para mais informações, entre em contato pelo telefone.',
  ]

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
    // Mark as read
    if (conv.unreadCount > 0) {
      const updated = conversations.map((c) =>
        c.contact.id === conv.contact.id
          ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
          : c
      )
      setConversations(updated)
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

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Inbox" />

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">Conversas</h2>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar conversa..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>

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
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
                <p className="text-sm">Nenhuma conversa ainda</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.contact.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 transition-colors text-left border-b border-slate-50 ${
                    selectedConversation?.contact.id === conv.contact.id
                      ? 'bg-primary-50 border-l-2 border-l-primary-500'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-bold">{getInitials(conv.contact.name)}</span>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {conv.contact.name}
                      </p>
                      <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : ''}
                      </p>
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                        {conv.lastMessage.direction === 'OUTBOUND' ? 'Você: ' : ''}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedConversation ? (
            <>
              {/* Contact Header */}
              <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 font-bold">{getInitials(selectedConversation.contact.name)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedConversation.contact.name}</p>
                    <p className="text-xs text-slate-500">{selectedConversation.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        msg.direction === 'OUTBOUND'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-slate-800 shadow-soft rounded-bl-md'
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
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin">
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

              {/* Message Input */}
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
                <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <h3 className="text-slate-600 font-semibold text-lg">Selecione uma conversa</h3>
                <p className="text-slate-400 text-sm mt-1">Escolha uma conversa ao lado para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

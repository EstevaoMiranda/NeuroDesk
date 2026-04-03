'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import type { Contact, Message, Session, ContactLabel } from '@/types'
import {
  formatPhone,
  formatDateTime,
  getLabelText,
  getLabelBgColor,
  getLabelHex,
  getLabelEmoji,
  getSpecialtyLabel,
  getSpecialtyColor,
  getSessionStatusLabel,
  getSessionStatusColor,
  getInitials,
} from '@/lib/utils'

interface ContactWithDetails extends Contact {
  lastMessage?: Message | null
  messages?: Message[]
  sessions?: Session[]
}

const ALL_LABELS: ContactLabel[] = ['NEW', 'VISITA', 'LEAD_FRIO', 'CLIENTE', 'PROFISSIONAL', 'CURRICULO']

export default function ContatosPage() {
  const [contacts, setContacts] = useState<ContactWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLabel, setFilterLabel] = useState<ContactLabel | ''>('')
  const [selectedContact, setSelectedContact] = useState<ContactWithDetails | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [changingLabel, setChangingLabel] = useState<string | null>(null)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState<ContactLabel>('NEW')
  const [newNotes, setNewNotes] = useState('')

  async function loadContacts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterLabel) params.set('label', filterLabel)

      const res = await fetch(`/api/contatos?${params}`)
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadContactDetails(contactId: string) {
    try {
      const res = await fetch(`/api/contatos/${contactId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedContact(data.contact)
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
    }
  }

  async function handleChangeLabel(contactId: string, label: ContactLabel) {
    setChangingLabel(contactId)
    try {
      const res = await fetch(`/api/contatos/${contactId}/label`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, label } : c))
        )
        if (selectedContact?.id === contactId) {
          setSelectedContact((prev) => prev ? { ...prev, label } : prev)
        }
      }
    } catch (error) {
      console.error('Erro ao mudar etiqueta:', error)
    } finally {
      setChangingLabel(null)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [search, filterLabel])

  async function handleCreateContact() {
    if (!newName || !newPhone) return
    setCreateLoading(true)

    try {
      const res = await fetch('/api/contatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail || undefined,
          label: newLabel,
          notes: newNotes || undefined,
        }),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setNewName('')
        setNewPhone('')
        setNewEmail('')
        setNewNotes('')
        setNewLabel('NEW')
        loadContacts()
      }
    } catch (error) {
      console.error('Erro ao criar contato:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  // Count per label for the sidebar filter
  const countByLabel = ALL_LABELS.reduce<Record<string, number>>((acc, lbl) => {
    acc[lbl] = contacts.filter((c) => c.label === lbl).length
    return acc
  }, {})

  return (
    <div>
      <Topbar title="Contatos" />

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar contatos..."
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Contato
          </button>
        </div>

        <div className="flex gap-6">
          {/* Label filter sidebar */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-1 sticky top-6">
              <button
                onClick={() => setFilterLabel('')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                  filterLabel === ''
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Todos</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{contacts.length}</span>
              </button>

              {ALL_LABELS.map((lbl) => (
                <button
                  key={lbl}
                  onClick={() => setFilterLabel(lbl === filterLabel ? '' : lbl)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                    filterLabel === lbl
                      ? 'font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={filterLabel === lbl ? { backgroundColor: `${getLabelHex(lbl)}18`, color: getLabelHex(lbl) } : {}}
                >
                  <span className="flex items-center gap-2">
                    <span>{getLabelEmoji(lbl)}</span>
                    <span className="truncate">{getLabelText(lbl)}</span>
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">
                    {countByLabel[lbl] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 mb-4">
              {loading ? 'Carregando...' : `${contacts.length} contato${contacts.length !== 1 ? 's' : ''}`}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-40">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-slate-500 font-medium">Nenhum contato encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedContact?.id === contact.id
                        ? 'border-primary-300 shadow-md ring-1 ring-primary-200'
                        : 'border-slate-100'
                    }`}
                    onClick={() => loadContactDetails(contact.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: getLabelHex(contact.label) }}
                      >
                        {getInitials(contact.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{contact.name}</p>
                        <p className="text-xs text-slate-500">{formatPhone(contact.phone)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLabelBgColor(contact.label)}`}>
                        {getLabelEmoji(contact.label)} {getLabelText(contact.label)}
                      </span>

                      {/* Quick label change */}
                      <select
                        value={contact.label}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleChangeLabel(contact.id, e.target.value as ContactLabel)
                        }}
                        disabled={changingLabel === contact.id}
                        className="text-[11px] border border-slate-200 rounded-lg px-1.5 py-1 bg-white text-slate-600 focus:outline-none disabled:opacity-50"
                      >
                        <option value="NEW">🆕 Novo</option>
                        <option value="VISITA">🟡 Visita</option>
                        <option value="LEAD_FRIO">🔵 Lead Frio</option>
                        <option value="CLIENTE">🟢 Cliente</option>
                        <option value="PROFISSIONAL">👤 Profissional</option>
                        <option value="CURRICULO">📄 Currículo</option>
                      </select>
                    </div>

                    {contact.lastMessage && (
                      <p className="text-xs text-slate-400 mt-2 truncate">
                        {contact.lastMessage.direction === 'OUTBOUND' ? '→ ' : '← '}
                        {contact.lastMessage.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact detail drawer */}
          {selectedContact && (
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-soft border border-slate-100 sticky top-6">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: getLabelHex(selectedContact.label) }}
                      >
                        {getInitials(selectedContact.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{selectedContact.name}</h3>
                        <p className="text-slate-500 text-sm">{formatPhone(selectedContact.phone)}</p>
                        {selectedContact.email && (
                          <p className="text-slate-400 text-xs">{selectedContact.email}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getLabelBgColor(selectedContact.label)}`}>
                      {getLabelEmoji(selectedContact.label)} {getLabelText(selectedContact.label)}
                    </span>
                    <select
                      value={selectedContact.label}
                      onChange={(e) => handleChangeLabel(selectedContact.id, e.target.value as ContactLabel)}
                      disabled={changingLabel === selectedContact.id}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none"
                    >
                      <option value="NEW">🆕 Novo</option>
                      <option value="VISITA">🟡 Visita Marcada</option>
                      <option value="LEAD_FRIO">🔵 Lead Frio</option>
                      <option value="CLIENTE">🟢 Cliente</option>
                      <option value="PROFISSIONAL">👤 Profissional</option>
                      <option value="CURRICULO">📄 Currículo</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
                  {selectedContact.assignedTo && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Responsável</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-slate-600 text-xs font-bold">{getInitials(selectedContact.assignedTo.name)}</span>
                        </div>
                        <span className="text-sm text-slate-700">{selectedContact.assignedTo.name}</span>
                      </div>
                    </div>
                  )}

                  {selectedContact.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observações</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{selectedContact.notes}</p>
                    </div>
                  )}

                  {selectedContact.sessions && selectedContact.sessions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Sessões ({selectedContact.sessions.length})
                      </p>
                      <div className="space-y-2">
                        {selectedContact.sessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="bg-slate-50 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSpecialtyColor(session.specialty)}`}>
                                {getSpecialtyLabel(session.specialty)}
                              </span>
                              <Badge
                                label={getSessionStatusLabel(session.status)}
                                variant={getSessionStatusColor(session.status) as 'default' | 'success' | 'warning' | 'error' | 'info'}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">{formatDateTime(session.scheduledAt)} • {session.duration}min</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedContact.messages && selectedContact.messages.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Últimas Mensagens</p>
                      <div className="space-y-2">
                        {selectedContact.messages.slice(0, 4).map((msg) => (
                          <div key={msg.id} className={`p-3 rounded-xl text-sm ${msg.direction === 'OUTBOUND' ? 'bg-primary-50 text-primary-800' : 'bg-slate-100 text-slate-700'}`}>
                            <p className="text-xs font-medium mb-1 opacity-60">
                              {msg.direction === 'OUTBOUND' ? 'Enviado' : 'Recebido'} • {formatDateTime(msg.createdAt)}
                            </p>
                            <p className="text-xs leading-relaxed line-clamp-2">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center">
                    Cadastrado em {selectedContact.createdAt ? formatDateTime(selectedContact.createdAt) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Contact Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Contato"
        confirmLabel="Criar Contato"
        onConfirm={handleCreateContact}
        confirmLoading={createLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="input" placeholder="Nome completo" />
          </div>
          <div>
            <label className="label">Telefone / WhatsApp *</label>
            <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="input" placeholder="11987654321" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="label">Etiqueta</label>
            <select value={newLabel} onChange={(e) => setNewLabel(e.target.value as ContactLabel)} className="input">
              <option value="NEW">🆕 Novo</option>
              <option value="VISITA">🟡 Visita Marcada</option>
              <option value="LEAD_FRIO">🔵 Lead Frio</option>
              <option value="CLIENTE">🟢 Cliente</option>
              <option value="PROFISSIONAL">👤 Profissional</option>
              <option value="CURRICULO">📄 Currículo</option>
            </select>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="input resize-none h-24" placeholder="Informações relevantes..." />
          </div>
        </div>
      </Modal>
    </div>
  )
}

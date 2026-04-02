'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import ContactCard from '@/components/ui/ContactCard'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import type { Contact, Message, Session, ContactType, ContactStatus } from '@/types'
import {
  formatPhone,
  formatDateTime,
  getContactTypeLabel,
  getContactTypeColor,
  getStatusLabel,
  getStatusColor,
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

const CONTACT_TYPES: { value: ContactType | ''; label: string }[] = [
  { value: '', label: 'Todos os tipos' },
  { value: 'NEW_CONTACT', label: 'Novo Contato' },
  { value: 'PARENT_CLIENT', label: 'Responsável/Paciente' },
  { value: 'PROFESSIONAL', label: 'Profissional' },
]

const CONTACT_STATUSES: { value: ContactStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'INACTIVE', label: 'Inativo' },
]

const SPECIALTIES = [
  { value: 'FONOAUDIOLOGIA', label: 'Fonoaudiologia' },
  { value: 'TERAPIA_OCUPACIONAL', label: 'Terapia Ocupacional' },
  { value: 'PSICOLOGIA', label: 'Psicologia' },
  { value: 'ABA', label: 'ABA' },
  { value: 'PSICOMOTRICIDADE', label: 'Psicomotricidade' },
]

export default function ContatosPage() {
  const [contacts, setContacts] = useState<ContactWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<ContactType | ''>('')
  const [filterStatus, setFilterStatus] = useState<ContactStatus | ''>('')
  const [selectedContact, setSelectedContact] = useState<ContactWithDetails | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newType, setNewType] = useState<ContactType>('NEW_CONTACT')
  const [newStatus, setNewStatus] = useState<ContactStatus>('PENDING')
  const [newNotes, setNewNotes] = useState('')

  async function loadContacts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterType) params.set('type', filterType)
      if (filterStatus) params.set('status', filterStatus)

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

  useEffect(() => {
    loadContacts()
  }, [search, filterType, filterStatus])

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
          type: newType,
          status: newStatus,
          notes: newNotes || undefined,
        }),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setNewName('')
        setNewPhone('')
        setNewEmail('')
        setNewNotes('')
        loadContacts()
      }
    } catch (error) {
      console.error('Erro ao criar contato:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div>
      <Topbar title="Contatos" />

      <div className="p-6">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
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

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContactType | '')}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CONTACT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ContactStatus | '')}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CONTACT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
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

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {loading ? 'Carregando...' : `${contacts.length} contato${contacts.length !== 1 ? 's' : ''} encontrado${contacts.length !== 1 ? 's' : ''}`}
        </p>

        <div className="flex gap-6">
          {/* Contact Grid */}
          <div className="flex-1">
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
                <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros ou criar um novo contato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    selected={selectedContact?.id === contact.id}
                    onClick={() => loadContactDetails(contact.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contact Detail Drawer */}
          {selectedContact && (
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-soft border border-slate-100 sticky top-6">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <span className="text-primary-600 font-bold text-lg">{getInitials(selectedContact.name)}</span>
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

                  <div className="flex gap-2 mt-4">
                    <Badge
                      label={getContactTypeLabel(selectedContact.type)}
                      variant={getContactTypeColor(selectedContact.type) as 'default' | 'success' | 'warning' | 'error' | 'info'}
                    />
                    <Badge
                      label={getStatusLabel(selectedContact.status)}
                      variant={getStatusColor(selectedContact.status) as 'default' | 'success' | 'warning' | 'error' | 'info'}
                      dot
                    />
                  </div>
                </div>

                <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
                  {/* Assigned to */}
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

                  {/* Notes */}
                  {selectedContact.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observações</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{selectedContact.notes}</p>
                    </div>
                  )}

                  {/* Sessions */}
                  {selectedContact.sessions && selectedContact.sessions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sessões ({selectedContact.sessions.length})</p>
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

                  {/* Messages */}
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
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="label">Telefone / WhatsApp *</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="input"
              placeholder="11987654321"
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input"
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ContactType)}
                className="input"
              >
                <option value="NEW_CONTACT">Novo Contato</option>
                <option value="PARENT_CLIENT">Responsável/Paciente</option>
                <option value="PROFESSIONAL">Profissional</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ContactStatus)}
                className="input"
              >
                <option value="PENDING">Pendente</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="input resize-none h-24"
              placeholder="Informações relevantes sobre o contato..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

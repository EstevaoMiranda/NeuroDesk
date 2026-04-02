'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import Modal from '@/components/ui/Modal'
import type { Session, Contact, User, Specialty, SessionStatus } from '@/types'
import { getSpecialtyLabel, getSpecialtyColor, getSessionStatusLabel, formatTime, getInitials } from '@/lib/utils'

interface SessionWithRelations extends Session {
  contact?: { id: string; name: string }
  therapist?: { id: string; name: string }
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7) // 7h to 18h

export default function AgendaPage() {
  const [sessions, setSessions] = useState<SessionWithRelations[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [therapists, setTherapists] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date()
    const day = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - day)
    start.setHours(0, 0, 0, 0)
    return start
  })
  const [showModal, setShowModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Form state
  const [formContactId, setFormContactId] = useState('')
  const [formTherapistId, setFormTherapistId] = useState('')
  const [formSpecialty, setFormSpecialty] = useState<Specialty>('PSICOLOGIA')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('09:00')
  const [formDuration, setFormDuration] = useState(50)
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<SessionStatus>('SCHEDULED')

  function getWeekDays(): Date[] {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart)
      day.setDate(currentWeekStart.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays()

  function getSessionsForDayAndHour(day: Date, hour: number): SessionWithRelations[] {
    return sessions.filter((s) => {
      const sessionDate = new Date(s.scheduledAt)
      return (
        sessionDate.getDate() === day.getDate() &&
        sessionDate.getMonth() === day.getMonth() &&
        sessionDate.getFullYear() === day.getFullYear() &&
        sessionDate.getHours() === hour
      )
    })
  }

  function isToday(day: Date): boolean {
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  function navigateWeek(direction: -1 | 1) {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(currentWeekStart.getDate() + direction * 7)
    setCurrentWeekStart(newStart)
  }

  async function loadSessions() {
    setLoading(true)
    try {
      const startDate = weekDays[0].toISOString().split('T')[0]
      const endDate = weekDays[6].toISOString().split('T')[0]
      const res = await fetch(`/api/sessoes?startDate=${startDate}&endDate=${endDate}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadContactsAndTherapists() {
    try {
      const [contactsRes, therapistsRes] = await Promise.all([
        fetch('/api/contatos'),
        fetch('/api/sessoes/therapists'),
      ])

      if (contactsRes.ok) {
        const data = await contactsRes.json()
        setContacts(data.contacts || [])
      }
      if (therapistsRes.ok) {
        const data = await therapistsRes.json()
        setTherapists(data.therapists || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [currentWeekStart])

  useEffect(() => {
    loadContactsAndTherapists()
  }, [])

  async function handleCreateSession() {
    if (!formContactId || !formTherapistId || !formDate || !formTime) return
    setCreateLoading(true)

    try {
      const scheduledAt = new Date(`${formDate}T${formTime}:00`)

      const res = await fetch('/api/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: formContactId,
          therapistId: formTherapistId,
          specialty: formSpecialty,
          status: formStatus,
          scheduledAt: scheduledAt.toISOString(),
          duration: formDuration,
          notes: formNotes || undefined,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        setFormContactId('')
        setFormTherapistId('')
        setFormNotes('')
        loadSessions()
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  const weekLabel = `${weekDays[0].getDate()} de ${MONTHS[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} de ${MONTHS[weekDays[6].getMonth()]} de ${weekDays[6].getFullYear()}`

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Agenda" />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="font-semibold text-slate-700 text-sm">{weekLabel}</p>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const day = today.getDay()
                const start = new Date(today)
                start.setDate(today.getDate() - day)
                start.setHours(0, 0, 0, 0)
                setCurrentWeekStart(start)
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Hoje
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Sessão
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[700px]">
            {/* Header days */}
            <div className="grid grid-cols-8 bg-white border-b border-slate-200 sticky top-0 z-10">
              <div className="py-3 px-4 text-xs text-slate-400 font-medium" />
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={`py-3 px-2 text-center border-l border-slate-100 ${isToday(day) ? 'bg-primary-50' : ''}`}
                >
                  <p className="text-xs text-slate-400 font-medium">{DAYS_OF_WEEK[day.getDay()]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday(day) ? 'text-primary-600 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-sm' : 'text-slate-700'}`}>
                    {day.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-100 min-h-[80px]">
                <div className="px-4 py-2 text-xs text-slate-400 font-medium flex-shrink-0 border-r border-slate-100 flex items-start pt-3">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((day, dayIdx) => {
                  const daysSessions = getSessionsForDayAndHour(day, hour)
                  return (
                    <div
                      key={dayIdx}
                      className={`p-1 border-l border-slate-100 ${isToday(day) ? 'bg-primary-50/30' : ''}`}
                    >
                      {daysSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`rounded-lg px-2 py-1.5 text-xs mb-1 cursor-pointer transition-opacity hover:opacity-80 ${getSpecialtyColor(session.specialty)}`}
                        >
                          <p className="font-semibold truncate">{session.contact?.name || 'Paciente'}</p>
                          <p className="opacity-75 truncate">{session.therapist?.name || 'Terapeuta'}</p>
                          <p className="opacity-60">{formatTime(session.scheduledAt)} • {session.duration}min</p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Sessão"
        confirmLabel="Agendar Sessão"
        onConfirm={handleCreateSession}
        confirmLoading={createLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Paciente / Contato *</label>
            <select
              value={formContactId}
              onChange={(e) => setFormContactId(e.target.value)}
              className="input"
            >
              <option value="">Selecione um contato</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Terapeuta *</label>
            <select
              value={formTherapistId}
              onChange={(e) => setFormTherapistId(e.target.value)}
              className="input"
            >
              <option value="">Selecione um terapeuta</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Especialidade *</label>
            <select
              value={formSpecialty}
              onChange={(e) => setFormSpecialty(e.target.value as Specialty)}
              className="input"
            >
              <option value="FONOAUDIOLOGIA">Fonoaudiologia</option>
              <option value="TERAPIA_OCUPACIONAL">Terapia Ocupacional</option>
              <option value="PSICOLOGIA">Psicologia</option>
              <option value="ABA">ABA</option>
              <option value="PSICOMOTRICIDADE">Psicomotricidade</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Horário *</label>
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duração (minutos)</label>
              <select
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="input"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as SessionStatus)}
                className="input"
              >
                <option value="SCHEDULED">Agendada</option>
                <option value="CONFIRMED">Confirmada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="input resize-none h-20"
              placeholder="Informações sobre a sessão..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

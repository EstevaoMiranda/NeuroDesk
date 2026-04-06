import type { ContactLabel, ContactType, SessionStatus, Specialty } from '@/types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

// ContactLabel helpers
export function getLabelText(label: ContactLabel): string {
  switch (label) {
    case 'NEW':       return 'Novo'
    case 'VISITA':    return 'Visita Marcada'
    case 'LEAD_FRIO': return 'Lead Frio'
    case 'CLIENTE':   return 'Cliente'
    case 'PROFISSIONAL': return 'Profissional'
    case 'CURRICULO': return 'Currículo'
    default:          return label
  }
}

export function getLabelEmoji(label: ContactLabel): string {
  switch (label) {
    case 'NEW':       return '🆕'
    case 'VISITA':    return '🟡'
    case 'LEAD_FRIO': return '🔵'
    case 'CLIENTE':   return '🟢'
    case 'PROFISSIONAL': return '👤'
    case 'CURRICULO': return '📄'
    default:          return ''
  }
}

// Returns Tailwind bg+text classes for badges
export function getLabelBgColor(label: ContactLabel): string {
  switch (label) {
    case 'NEW':       return 'bg-gray-100 text-gray-600'
    case 'VISITA':    return 'bg-amber-100 text-amber-700'
    case 'LEAD_FRIO': return 'bg-blue-100 text-blue-700'
    case 'CLIENTE':   return 'bg-emerald-100 text-emerald-700'
    case 'PROFISSIONAL': return 'bg-purple-100 text-purple-700'
    case 'CURRICULO': return 'bg-orange-100 text-orange-700'
    default:          return 'bg-gray-100 text-gray-600'
  }
}

// Returns hex color for inline styles / dot indicators
export function getLabelHex(label: ContactLabel): string {
  switch (label) {
    case 'NEW':       return '#6B7280'
    case 'VISITA':    return '#F59E0B'
    case 'LEAD_FRIO': return '#3B82F6'
    case 'CLIENTE':   return '#10B981'
    case 'PROFISSIONAL': return '#7C3AED'
    case 'CURRICULO': return '#F97316'
    default:          return '#6B7280'
  }
}

export function getContactTypeLabel(type: ContactType): string {
  switch (type) {
    case 'NEW_CONTACT':   return 'Novo Contato'
    case 'PARENT_CLIENT': return 'Responsável/Paciente'
    case 'PROFESSIONAL':  return 'Profissional'
    default:              return type
  }
}

export function getContactTypeColor(type: ContactType): string {
  switch (type) {
    case 'NEW_CONTACT':   return 'info'
    case 'PARENT_CLIENT': return 'success'
    case 'PROFESSIONAL':  return 'warning'
    default:              return 'default'
  }
}

export function getLabelVariant(label: ContactLabel): string {
  switch (label) {
    case 'CLIENTE':      return 'success'
    case 'VISITA':       return 'warning'
    case 'LEAD_FRIO':    return 'info'
    case 'PROFISSIONAL': return 'info'
    case 'CURRICULO':    return 'warning'
    case 'NEW':
    default:             return 'default'
  }
}

export function getSpecialtyLabel(specialty: Specialty): string {
  switch (specialty) {
    case 'FONOAUDIOLOGIA':    return 'Fonoaudiologia'
    case 'TERAPIA_OCUPACIONAL': return 'Terapia Ocupacional'
    case 'PSICOLOGIA':        return 'Psicologia'
    case 'ABA':               return 'ABA'
    case 'PSICOMOTRICIDADE':  return 'Psicomotricidade'
    default:                  return specialty
  }
}

export function getSpecialtyColor(specialty: Specialty): string {
  switch (specialty) {
    case 'FONOAUDIOLOGIA':    return 'bg-blue-100 text-blue-700'
    case 'TERAPIA_OCUPACIONAL': return 'bg-green-100 text-green-700'
    case 'PSICOLOGIA':        return 'bg-purple-100 text-purple-700'
    case 'ABA':               return 'bg-orange-100 text-orange-700'
    case 'PSICOMOTRICIDADE':  return 'bg-pink-100 text-pink-700'
    default:                  return 'bg-gray-100 text-gray-700'
  }
}

export function getSessionStatusLabel(status: SessionStatus): string {
  switch (status) {
    case 'SCHEDULED':  return 'Agendada'
    case 'CONFIRMED':  return 'Confirmada'
    case 'COMPLETED':  return 'Concluída'
    case 'CANCELLED':  return 'Cancelada'
    case 'NO_SHOW':    return 'Falta'
    default:           return status
  }
}

export function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case 'SCHEDULED':  return 'info'
    case 'CONFIRMED':  return 'success'
    case 'COMPLETED':  return 'default'
    case 'CANCELLED':  return 'error'
    case 'NO_SHOW':    return 'warning'
    default:           return 'default'
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':        return 'Administrador'
    case 'MANAGER':      return 'Gerente'
    case 'THERAPIST':    return 'Terapeuta'
    case 'RECEPTIONIST': return 'Recepcionista'
    default:             return role
  }
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return formatDate(d)
}

export function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

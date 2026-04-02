export type Plan = 'ESSENCIAL' | 'CLINICA' | 'REDE'
export type UserRole = 'ADMIN' | 'MANAGER' | 'THERAPIST' | 'RECEPTIONIST'
export type Specialty = 'FONOAUDIOLOGIA' | 'TERAPIA_OCUPACIONAL' | 'PSICOLOGIA' | 'ABA' | 'PSICOMOTRICIDADE'
export type ContactType = 'NEW_CONTACT' | 'PARENT_CLIENT' | 'PROFESSIONAL'
export type ContactStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'
export type SessionStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type Direction = 'INBOUND' | 'OUTBOUND'
export type Channel = 'WHATSAPP' | 'INSTAGRAM' | 'MANUAL'

export interface Clinic {
  id: string
  name: string
  slug: string
  plan: Plan
  whatsappInstance?: string | null
  whatsappToken?: string | null
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  specialty?: Specialty | null
  clinicId: string
  clinic?: Clinic
  createdAt: Date
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string | null
  type: ContactType
  status: ContactStatus
  clinicId: string
  clinic?: Clinic
  assignedToId?: string | null
  assignedTo?: User | null
  notes?: string | null
  messages?: Message[]
  sessions?: Session[]
  createdAt: Date
}

export interface Message {
  id: string
  contactId: string
  contact?: Contact
  clinicId: string
  clinic?: Clinic
  direction: Direction
  channel: Channel
  content: string
  read: boolean
  createdAt: Date
}

export interface Session {
  id: string
  contactId: string
  contact?: Contact
  clinicId: string
  clinic?: Clinic
  therapistId: string
  therapist?: User
  specialty: Specialty
  status: SessionStatus
  scheduledAt: Date
  duration: number
  notes?: string | null
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// JWT Payload
export interface JWTPayload {
  sub: string
  clinicId: string
  role: string
  email: string
  name?: string
  iat?: number
  exp?: number
}

// Dashboard metrics
export interface DashboardMetrics {
  totalContatos: number
  sessoesHoje: number
  mensagensNaoLidas: number
  taxaResposta: number
  atividadesRecentes: AtividadeRecente[]
}

export interface AtividadeRecente {
  id: string
  tipo: 'mensagem' | 'sessao'
  contactName: string
  contactId: string
  conteudo: string
  timestamp: Date
  status?: string
}

// Contact with last message for inbox
export interface ContactWithLastMessage extends Contact {
  lastMessage?: Message | null
  unreadCount?: number
}

// Conversation thread for inbox
export interface Conversation {
  contact: Contact
  messages: Message[]
  unreadCount: number
  lastMessage?: Message | null
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface CadastroForm {
  clinicName: string
  userName: string
  email: string
  password: string
  confirmPassword: string
  plan: Plan
}

export interface ContactForm {
  name: string
  phone: string
  email?: string
  type: ContactType
  status: ContactStatus
  assignedToId?: string
  notes?: string
}

export interface SessionForm {
  contactId: string
  therapistId: string
  specialty: Specialty
  status: SessionStatus
  scheduledAt: string
  duration: number
  notes?: string
}

export interface MessageForm {
  contactId: string
  content: string
  channel?: Channel
}

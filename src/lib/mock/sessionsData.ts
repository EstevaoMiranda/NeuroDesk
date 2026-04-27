export type SessionStatus = 'scheduled' | 'confirmed' | 'absent' | 'at-pending' | 'completed'

export interface AgendaSession {
  id: string
  patientName: string
  professionalName: string
  professionalInitials: string
  specialty: string
  dayIndex: number
  timeSlot: string
  status: SessionStatus
  atPending?: boolean
}

export const sessionStyles: Record<SessionStatus, string> = {
  scheduled:    'bg-[#EEF0FC] text-[#3C3489] border-l-2 border-[#4F5FE0]',
  confirmed:    'bg-[#EAF3DE] text-[#27500A] border-l-2 border-[#1B9E5A]',
  absent:       'bg-[#FEECEC] text-[#791F1F] border-l-2 border-[#E24B4A]',
  'at-pending': 'bg-gray-100 text-gray-500 border-l-2 border-gray-400',
  completed:    'bg-[#FAEEDA] text-[#633806] border-l-2 border-[#E09B10]',
}

export const TIME_SLOTS = ['08:00', '09:00', '10:00', '14:00', '15:00']

export const DAYS = [
  { label: 'Seg', date: 28, isToday: false },
  { label: 'Ter', date: 29, isToday: true },
  { label: 'Qua', date: 30, isToday: false },
  { label: 'Qui', date: 1,  isToday: false },
  { label: 'Sex', date: 2,  isToday: false },
]

export const mockSessions: AgendaSession[] = [
  { id: 's1',  patientName: 'Lucas F.',    professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 0, timeSlot: '08:00', status: 'scheduled' },
  { id: 's2',  patientName: 'Miguel S.',   professionalName: 'Fernanda',    professionalInitials: 'FS', specialty: 'Psicologia',     dayIndex: 1, timeSlot: '08:00', status: 'confirmed' },
  { id: 's3',  patientName: 'Beto A.',     professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 2, timeSlot: '08:00', status: 'scheduled' },
  { id: 's4',  patientName: 'Sofia R.',    professionalName: 'Carlos',      professionalInitials: 'CL', specialty: 'TO',             dayIndex: 4, timeSlot: '08:00', status: 'confirmed' },
  { id: 's5',  patientName: 'Ana C.',      professionalName: 'Mariana',     professionalInitials: 'MT', specialty: 'Psicologia',     dayIndex: 0, timeSlot: '09:00', status: 'confirmed' },
  { id: 's6',  patientName: 'Pedro T.',    professionalName: 'Carlos',      professionalInitials: 'CL', specialty: 'TO',             dayIndex: 1, timeSlot: '09:00', status: 'scheduled' },
  { id: 's7',  patientName: 'Laura M.',    professionalName: 'João',        professionalInitials: 'JP', specialty: 'AT',             dayIndex: 2, timeSlot: '09:00', status: 'absent' },
  { id: 's8',  patientName: 'Davi P.',     professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 3, timeSlot: '09:00', status: 'scheduled' },
  { id: 's9',  patientName: 'Clara B.',    professionalName: 'Fernanda',    professionalInitials: 'FS', specialty: 'Psicologia',     dayIndex: 4, timeSlot: '09:00', status: 'confirmed' },
  { id: 's10', patientName: 'Sophia A.',   professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 1, timeSlot: '10:00', status: 'scheduled' },
  { id: 's11', patientName: 'Mateus L.',   professionalName: 'Mariana',     professionalInitials: 'MT', specialty: 'Psicologia',     dayIndex: 2, timeSlot: '10:00', status: 'confirmed' },
  { id: 's12', patientName: 'Bia C.',      professionalName: 'Carlos',      professionalInitials: 'CL', specialty: 'TO',             dayIndex: 3, timeSlot: '10:00', status: 'scheduled' },
  { id: 's13', patientName: 'Ricardo A.',  professionalName: 'João',        professionalInitials: 'JP', specialty: 'TO',             dayIndex: 0, timeSlot: '14:00', status: 'scheduled' },
  { id: 's14', patientName: 'Lucas F.',    professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 1, timeSlot: '14:00', status: 'scheduled', atPending: true },
  { id: 's15', patientName: 'Ana C.',      professionalName: 'Mariana',     professionalInitials: 'MT', specialty: 'Psicologia',     dayIndex: 2, timeSlot: '14:00', status: 'confirmed' },
  { id: 's16', patientName: 'Davi P.',     professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 4, timeSlot: '14:00', status: 'scheduled' },
  { id: 's17', patientName: 'Sara M.',     professionalName: 'Fernanda',    professionalInitials: 'FS', specialty: 'Psicologia',     dayIndex: 0, timeSlot: '15:00', status: 'confirmed' },
  { id: 's18', patientName: 'Miguel S.',   professionalName: 'Carlos',      professionalInitials: 'CL', specialty: 'TO',             dayIndex: 2, timeSlot: '15:00', status: 'scheduled' },
  { id: 's19', patientName: 'Letícia R.',  professionalName: 'Ana Beatriz', professionalInitials: 'AB', specialty: 'Fonoaudiologia', dayIndex: 3, timeSlot: '15:00', status: 'scheduled' },
]

export type ProfSpecialty = 'autismo' | 'tdah' | 'atraso-fala' | 'outro'

export interface Professional {
  id: string
  name: string
  initials: string
  avatarColor: string
  role: string
  isActive: boolean
  specialties: ProfSpecialty[]
  isAT: boolean
  sessionsCount: number
  patientsCount: number
  confirmationRate?: string
  hourlyRate?: string
}

export const mockProfessionals: Professional[] = [
  { id: 'p1', name: 'Ana Beatriz Costa',  initials: 'AB', avatarColor: '#4F5FE0', role: 'Fonoaudióloga',        isActive: true,  specialties: ['autismo', 'atraso-fala'], isAT: false, sessionsCount: 28, patientsCount: 12, confirmationRate: '96%' },
  { id: 'p2', name: 'Carlos Lima',        initials: 'CL', avatarColor: '#1B9E5A', role: 'Terapeuta Ocupacional', isActive: true,  specialties: ['autismo', 'tdah'],        isAT: false, sessionsCount: 22, patientsCount: 9,  confirmationRate: '91%' },
  { id: 'p3', name: 'Fernanda Santos',    initials: 'FS', avatarColor: '#7B5FE0', role: 'Psicóloga',            isActive: true,  specialties: ['autismo'],                isAT: false, sessionsCount: 19, patientsCount: 8,  confirmationRate: '89%' },
  { id: 'p4', name: 'João Pedro Alves',   initials: 'JP', avatarColor: '#E09B10', role: 'AT — Atendente Terap.', isActive: true,  specialties: ['autismo'],                isAT: true,  sessionsCount: 15, patientsCount: 6,  hourlyRate: 'R$40/h' },
  { id: 'p5', name: 'Mariana Teixeira',   initials: 'MT', avatarColor: '#D94040', role: 'Psicóloga',            isActive: true,  specialties: ['tdah', 'atraso-fala'],    isAT: false, sessionsCount: 12, patientsCount: 5,  confirmationRate: '93%' },
]

export const SPECIALTY_STYLES: Record<ProfSpecialty, string> = {
  'autismo':     'bg-[#EEF0FC] text-[#3C3489]',
  'tdah':        'bg-[#FAEEDA] text-[#633806]',
  'atraso-fala': 'bg-[#E1F5EE] text-[#085041]',
  'outro':       'bg-gray-100 text-gray-500',
}

export const SPECIALTY_LABELS: Record<ProfSpecialty, string> = {
  'autismo':     'Autismo',
  'tdah':        'TDAH',
  'atraso-fala': 'Atraso de fala',
  'outro':       'Outro',
}

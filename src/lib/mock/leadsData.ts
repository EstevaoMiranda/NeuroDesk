export type LeadStage = 'novo' | 'triagem' | 'visita' | 'convertido'
export type LeadDiagnosis = 'autismo' | 'tdah' | 'atraso-fala' | 'outro'

export interface Lead {
  id: string
  familyName: string
  interest: string
  origin?: string
  diagnosis: LeadDiagnosis
  stage: LeadStage
  createdAt: string
  hasAlert?: boolean
  isConverted?: boolean
  visitDate?: string
}

export const mockLeads: Lead[] = [
  { id: '1', familyName: 'Família Rodrigues', interest: 'Interesse: avaliação TEA', diagnosis: 'autismo', stage: 'novo', createdAt: 'há 1h' },
  { id: '2', familyName: 'Márcia Oliveira', interest: 'Indicação: médico', diagnosis: 'tdah', stage: 'novo', createdAt: 'há 3h' },
  { id: '3', familyName: 'Pedro Alves', interest: 'Formulário site', diagnosis: 'atraso-fala', stage: 'novo', createdAt: 'hoje' },
  { id: '4', familyName: 'Família Costa', interest: 'Aguarda retorno', diagnosis: 'autismo', stage: 'triagem', createdAt: 'há 1d' },
  { id: '5', familyName: 'Renata Souza', interest: 'Enviou docs', diagnosis: 'tdah', stage: 'triagem', createdAt: 'há 2d' },
  { id: '6', familyName: 'Rafael Mendes', interest: 'Sem resposta há 3d', diagnosis: 'autismo', stage: 'triagem', createdAt: 'há 3d', hasAlert: true },
  { id: '7', familyName: 'Família Lima', interest: 'Visita agendada', diagnosis: 'atraso-fala', stage: 'visita', createdAt: 'amanhã', visitDate: '28/04 às 10h' },
  { id: '8', familyName: 'Carla Menezes', interest: 'Visita agendada', diagnosis: 'autismo', stage: 'visita', createdAt: '2d', visitDate: '29/04 às 14h' },
  { id: '9', familyName: 'Sônia Ferreira', interest: 'Iniciou em 10/04', diagnosis: 'autismo', stage: 'convertido', createdAt: '17d', isConverted: true },
  { id: '10', familyName: 'Família Teixeira', interest: 'Iniciou em 08/04', diagnosis: 'tdah', stage: 'convertido', createdAt: '19d', isConverted: true },
  { id: '11', familyName: 'Patricia Nunes', interest: 'Iniciou em 01/04', diagnosis: 'atraso-fala', stage: 'convertido', createdAt: '26d', isConverted: true },
]

export const STAGES: { id: LeadStage; label: string }[] = [
  { id: 'novo',       label: 'Novo contato' },
  { id: 'triagem',    label: 'Em triagem' },
  { id: 'visita',     label: 'Visita agendada' },
  { id: 'convertido', label: 'Convertido' },
]

export const DIAGNOSIS_STYLES: Record<LeadDiagnosis, string> = {
  'autismo':     'bg-[#EEF0FC] text-[#3C3489]',
  'tdah':        'bg-[#FAEEDA] text-[#633806]',
  'atraso-fala': 'bg-[#E1F5EE] text-[#085041]',
  'outro':       'bg-gray-100 text-gray-600',
}

export const DIAGNOSIS_LABELS: Record<LeadDiagnosis, string> = {
  'autismo':     'Autismo',
  'tdah':        'TDAH',
  'atraso-fala': 'Atraso de fala',
  'outro':       'Outro',
}

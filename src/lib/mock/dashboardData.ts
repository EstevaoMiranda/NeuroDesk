export interface StatCardData {
  value: string | number
  label: string
  color: string
  badge?: string
  badgeVariant?: 'red' | 'amber'
}

export const statCards: StatCardData[] = [
  { value: 5,    label: 'Leads pendentes',   color: '#E09B10' },
  { value: 12,   label: 'Em andamento',       color: '#4F5FE0' },
  { value: 38,   label: 'Pacientes ativos',   color: '#1B9E5A' },
  { value: 7,    label: 'Sessões hoje',        color: '#7B5FE0' },
  { value: 3,    label: 'Alertas AT',          color: '#E24B4A', badge: 'Ação necessária', badgeVariant: 'red' },
  { value: '94%', label: 'Confirmações',       color: '#333333' },
]

export interface AIMetric {
  value: number | string
  label: string
  color: string
}

export const aiMetrics: AIMetric[] = [
  { value: 18,    label: 'Conversas ativas',   color: '#4F5FE0' },
  { value: '82%', label: 'Resolvidas pela IA', color: '#1B9E5A' },
  { value: 3,     label: 'Aguardam humano',    color: '#E09B10' },
  { value: 2,     label: 'Escaladas agora',    color: '#E24B4A' },
]

export type AIConvVariant = 'managing' | 'alert' | 'waiting'

export interface AIConversation {
  id: string
  contactName: string
  context: string
  statusText: string
  variant: AIConvVariant
  actionLabel: string
  actionHref: string
}

export const aiConversations: AIConversation[] = [
  {
    id: '1',
    contactName: 'Família Rodrigues',
    context: 'lead novo',
    statusText: 'Lead qualificado · IA solicita humano para fechar visita',
    variant: 'alert',
    actionLabel: 'Assumir',
    actionHref: '/inbox?contact=rodrigues',
  },
  {
    id: '2',
    contactName: 'Sônia Ferreira',
    context: 'pergunta sobre laudo',
    statusText: 'Fora do escopo da IA · aguarda resposta há 4 min',
    variant: 'alert',
    actionLabel: 'Assumir',
    actionHref: '/inbox?contact=sonia',
  },
  {
    id: '3',
    contactName: 'Rafael Mendes',
    context: 'sem resposta',
    statusText: '3 mensagens sem retorno · lead em triagem',
    variant: 'waiting',
    actionLabel: 'Ver',
    actionHref: '/inbox?contact=rafael',
  },
  {
    id: '4',
    contactName: 'Márcia Oliveira',
    context: 'triagem TDAH',
    statusText: 'IA coletando informações · pergunta 3 de 5',
    variant: 'managing',
    actionLabel: 'Acompanhar',
    actionHref: '/inbox?contact=marcia',
  },
  {
    id: '5',
    contactName: 'Família Costa',
    context: 'confirmação de sessão',
    statusText: 'IA enviou lembrete 48h · aguardando confirmação',
    variant: 'managing',
    actionLabel: 'Acompanhar',
    actionHref: '/inbox?contact=costa',
  },
]

export interface Professional {
  name: string
  initials: string
  color: string
  sessions: number
  pct: number
}

export const professionals: Professional[] = [
  { name: 'Ana Beatriz', initials: 'AB', color: '#4F5FE0', sessions: 28, pct: 100 },
  { name: 'Carlos Lima', initials: 'CL', color: '#1B9E5A', sessions: 22, pct: 79 },
  { name: 'Fernanda S.', initials: 'FS', color: '#7B5FE0', sessions: 19, pct: 68 },
  { name: 'João Pedro',  initials: 'JP', color: '#E09B10', sessions: 15, pct: 54 },
  { name: 'Mariana T.',  initials: 'MT', color: '#D94040', sessions: 12, pct: 43 },
]

export const leadDonut = {
  labels: ['Convertidos', 'Andamento', 'Pendentes', 'Frios'],
  data: [40, 28, 20, 12],
  colors: ['#1B9E5A', '#4F5FE0', '#E09B10', '#c5c8d6'],
}

export interface MiniStat {
  value: string | number
  label: string
  badge?: string
  badgeVariant?: 'amber' | 'green'
}

export const miniStats: MiniStat[] = [
  { value: 14,    label: 'Profissionais' },
  { value: 38,    label: 'Pacientes ativos' },
  { value: 156,   label: 'Sessões no mês' },
  { value: 7,     label: 'Faltas na semana' },
  { value: 3,     label: 'ATs ativados',      badge: 'R$480', badgeVariant: 'amber' },
  { value: 819,   label: 'Msgs WhatsApp' },
  { value: '12/9', label: 'Agend./Enviados' },
  { value: 6,     label: 'Especialidades' },
  { value: 1,     label: 'Conexão Z-API' },
]

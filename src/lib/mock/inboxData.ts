export type WaLabel = 'CLIENTE' | 'LEAD' | 'NEW' | 'PROFISSIONAL' | 'CURRICULO' | 'LEAD_FRIO' | 'VISITA'
export type WaMessageType = 'in' | 'out' | 'ai'

export interface WaMessage {
  id: string
  type: WaMessageType
  text: string
  time: string
}

export interface ContactInfo {
  patientName?: string
  diagnosis?: string
  professional?: string
  nextSession?: string
  aiHistory?: string
}

export interface WaConversation {
  id: string
  name: string
  initials: string
  avatarColor: string
  label: WaLabel
  preview: string
  time: string
  unreadCount: number
  messages: WaMessage[]
  contactInfo: ContactInfo
}

export const conversations: WaConversation[] = [
  {
    id: 'c1',
    name: 'Família Rodrigues',
    initials: 'FR',
    avatarColor: '#4F5FE0',
    label: 'NEW',
    preview: 'Olá, vi o anúncio de vocês sobre Fonoaudiologia...',
    time: '10:42',
    unreadCount: 3,
    messages: [
      { id: 'm1', type: 'in',  text: 'Olá! Vi o anúncio de vocês sobre Fonoaudiologia infantil. Meu filho de 5 anos tem dificuldades de fala.', time: '10:32' },
      { id: 'm2', type: 'ai',  text: 'Olá! Sou a assistente virtual da Terap Moviment 😊 Ficamos felizes com o seu contato! Para entendermos melhor a situação do seu filho, poderia nos dizer quais são as principais dificuldades que você observa?', time: '10:33' },
      { id: 'm3', type: 'in',  text: 'Ele troca muitas letras na fala, é bem difícil de entender. Também tem 5 anos e ainda não fala todas as palavras direito.', time: '10:38' },
      { id: 'm4', type: 'ai',  text: 'Entendi! Essas características são bastante comuns em crianças dessa faixa etária e podem ser trabalhadas com a fonoterapia. Temos profissionais especializados em linguagem infantil. Gostaria de agendar uma avaliação inicial?', time: '10:39' },
      { id: 'm5', type: 'in',  text: 'Sim! Como funciona? Qual é o valor?', time: '10:42' },
    ],
    contactInfo: {
      patientName: 'Filho da Família Rodrigues',
      diagnosis: 'A avaliar (desvio fonológico)',
      professional: 'A definir',
      nextSession: 'Aguardando agendamento',
      aiHistory: 'Lead qualificado — mãe perguntou sobre fonoterapia infantil. IA coletou informações iniciais e está pronta para escalar para humano fechar a visita.',
    },
  },
  {
    id: 'c2',
    name: 'Sônia Ferreira',
    initials: 'SF',
    avatarColor: '#E09B10',
    label: 'CLIENTE',
    preview: 'Preciso do laudo da minha filha o mais rápido...',
    time: '09:15',
    unreadCount: 1,
    messages: [
      { id: 'm1', type: 'in', text: 'Bom dia! Preciso do laudo da minha filha o mais rápido possível para a escola.', time: '09:10' },
      { id: 'm2', type: 'ai', text: 'Bom dia, Sônia! Vou verificar a situação do laudo da sua filha. Pode me informar o nome completo dela?', time: '09:11' },
      { id: 'm3', type: 'in', text: 'Ana Luiza Ferreira, tem consulta toda quinta com a Dra. Fernanda.', time: '09:14' },
      { id: 'm4', type: 'in', text: 'Preciso com urgência, a escola está cobrando.', time: '09:15' },
    ],
    contactInfo: {
      patientName: 'Ana Luiza Ferreira',
      diagnosis: 'TEA Nível 1',
      professional: 'Fernanda S.',
      nextSession: 'Quinta, 14h',
      aiHistory: 'Solicitação de laudo urgente para escola. Fora do escopo da IA — escalada para atendimento humano.',
    },
  },
  {
    id: 'c3',
    name: 'Rafael Mendes',
    initials: 'RM',
    avatarColor: '#7B5FE0',
    label: 'LEAD_FRIO',
    preview: 'Oi, vocês trabalham com adultos também?',
    time: 'Ontem',
    unreadCount: 0,
    messages: [
      { id: 'm1', type: 'in',  text: 'Oi, vocês trabalham com adultos também? Tenho TDAH e quero fazer terapia ocupacional.', time: '14:22' },
      { id: 'm2', type: 'ai',  text: 'Olá, Rafael! Sim, atendemos adultos com TDAH! Nossa terapia ocupacional pode ajudar bastante. Gostaria de saber mais sobre como funciona o tratamento?', time: '14:23' },
      { id: 'm3', type: 'in',  text: 'Quanto custa a sessão?', time: '14:50' },
    ],
    contactInfo: {
      patientName: 'Rafael Mendes',
      diagnosis: 'TDAH (auto-relatado)',
      professional: 'A definir',
      nextSession: 'Sem agendamento',
      aiHistory: '3 mensagens sem retorno após pergunta sobre valores. Lead em triagem — recomendado retomar contato proativamente.',
    },
  },
  {
    id: 'c4',
    name: 'Márcia Oliveira',
    initials: 'MO',
    avatarColor: '#1B9E5A',
    label: 'VISITA',
    preview: 'Perfeito! Confirmo presença na quinta às 10h',
    time: '08:30',
    unreadCount: 0,
    messages: [
      { id: 'm1', type: 'in',  text: 'Bom dia! Queria agendar uma visita para conhecer a clínica para minha filha.', time: '08:15' },
      { id: 'm2', type: 'ai',  text: 'Bom dia! Será um prazer recebê-la 😊 Temos horários disponíveis nesta semana. Qual dia seria melhor para você?', time: '08:16' },
      { id: 'm3', type: 'in',  text: 'Quinta de manhã seria ótimo!', time: '08:20' },
      { id: 'm4', type: 'ai',  text: 'Ótimo! Tenho disponível quinta-feira às 10h ou 11h. Qual prefere?', time: '08:21' },
      { id: 'm5', type: 'in',  text: 'Perfeito! Confirmo presença na quinta às 10h 😊', time: '08:30' },
    ],
    contactInfo: {
      patientName: 'Filha da Sra. Márcia',
      diagnosis: 'A avaliar (suspeita TDAH)',
      professional: 'A definir',
      nextSession: 'Quinta, 10h (visita)',
      aiHistory: 'Visita agendada com sucesso pela IA. Nenhuma intervenção humana necessária.',
    },
  },
  {
    id: 'c5',
    name: 'Família Costa',
    initials: 'FC',
    avatarColor: '#D94040',
    label: 'CLIENTE',
    preview: 'Já confirmamos! Até amanhã 👍',
    time: 'Ontem',
    unreadCount: 0,
    messages: [
      { id: 'm1', type: 'ai', text: 'Olá! 👋 Lembrando que amanhã o Pedro tem sessão com a Ana Beatriz às 14h. Por favor confirme sua presença respondendo "SIM" ou "NÃO".', time: '10:00' },
      { id: 'm2', type: 'in', text: 'SIM', time: '10:15' },
      { id: 'm3', type: 'ai', text: 'Confirmado! Até amanhã 😊 Qualquer dúvida estamos à disposição.', time: '10:16' },
      { id: 'm4', type: 'in', text: 'Já confirmamos! Até amanhã 👍', time: '10:18' },
    ],
    contactInfo: {
      patientName: 'Pedro Costa',
      diagnosis: 'TEA Nível 2',
      professional: 'Ana Beatriz',
      nextSession: 'Amanhã, 14h',
      aiHistory: 'Lembrete automático de confirmação de sessão enviado e confirmado pela IA sem intervenção humana.',
    },
  },
  {
    id: 'c6',
    name: 'Guilherme Ramos',
    initials: 'GR',
    avatarColor: '#4F5FE0',
    label: 'NEW',
    preview: 'Boa tarde! Gostaria de mais informações...',
    time: 'Ontem',
    unreadCount: 2,
    messages: [
      { id: 'm1', type: 'in', text: 'Boa tarde! Gostaria de mais informações sobre psicologia para adolescentes.', time: '15:30' },
      { id: 'm2', type: 'ai', text: 'Boa tarde, Guilherme! Claro, teremos prazer em ajudar. Poderia nos contar um pouco mais sobre a situação do adolescente?', time: '15:31' },
    ],
    contactInfo: {
      patientName: 'Filho do Sr. Guilherme',
      diagnosis: 'A avaliar',
      professional: 'A definir',
      nextSession: 'Sem agendamento',
      aiHistory: 'Primeiro contato. IA coletando informações iniciais.',
    },
  },
]

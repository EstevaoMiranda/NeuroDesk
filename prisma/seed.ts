const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Criar clínica
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Terap Moviment',
      slug: 'terap-moviment',
      plan: 'CLINICA',
    },
  })
  console.log(`Clínica criada: ${clinic.name}`)

  // Criar usuários
  const adminHash = await bcrypt.hash('123456', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Admin',
      email: 'admin@terapmoviment.com.br',
      passwordHash: adminHash,
      role: 'ADMIN',
      specialty: 'PSICOLOGIA',
      clinicId: clinic.id,
    },
  })
  console.log(`Admin criado: ${admin.email}`)

  const fonoHash = await bcrypt.hash('123456', 10)
  const fono = await prisma.user.create({
    data: {
      name: 'Dra. Camila Fonseca',
      email: 'camila.fonseca@terapmoviment.com.br',
      passwordHash: fonoHash,
      role: 'THERAPIST',
      specialty: 'FONOAUDIOLOGIA',
      clinicId: clinic.id,
    },
  })

  const toHash = await bcrypt.hash('123456', 10)
  const terapeutaOcupacional = await prisma.user.create({
    data: {
      name: 'Dr. Rafael Mendes',
      email: 'rafael.mendes@terapmoviment.com.br',
      passwordHash: toHash,
      role: 'THERAPIST',
      specialty: 'TERAPIA_OCUPACIONAL',
      clinicId: clinic.id,
    },
  })
  console.log('Terapeutas criados')

  const now = new Date()

  // 12 contatos distribuídos:
  // 3 NEW, 3 VISITA, 2 LEAD_FRIO, 2 CLIENTE, 1 PROFISSIONAL, 1 CURRICULO
  const contactsData = [
    // ── 3 × NEW ──────────────────────────────────────────
    {
      name: 'Carlos Eduardo Lima',
      phone: '11976543210',
      email: 'carlos.lima@hotmail.com',
      type: 'NEW_CONTACT' as const,
      label: 'NEW' as const,
      assignedToId: null,
      notes: 'Novo contato via WhatsApp. Interesse em terapia ocupacional para filho.',
    },
    {
      name: 'Roberto Ferreira Nunes',
      phone: '11932109876',
      email: null,
      type: 'NEW_CONTACT' as const,
      label: 'NEW' as const,
      assignedToId: null,
      notes: 'Entrou em contato pelo Instagram. Busca avaliação psicológica.',
    },
    {
      name: 'Eduardo Martins Souza',
      phone: '11988765431',
      email: null,
      type: 'NEW_CONTACT' as const,
      label: 'NEW' as const,
      assignedToId: null,
      notes: 'Pai buscando avaliação para filho de 4 anos com atraso no desenvolvimento.',
    },

    // ── 3 × VISITA (sessão de avaliação agendada) ─────────
    {
      name: 'Ana Beatriz Rodrigues',
      phone: '11987654321',
      email: 'ana.beatriz@gmail.com',
      type: 'PARENT_CLIENT' as const,
      label: 'VISITA' as const,
      assignedToId: fono.id,
      notes: 'Mãe do Lucas, 7 anos. Visita marcada para avaliação fonoaudiológica.',
    },
    {
      name: 'Fernanda Silva Santos',
      phone: '11965432109',
      email: 'fernanda.santos@gmail.com',
      type: 'PARENT_CLIENT' as const,
      label: 'VISITA' as const,
      assignedToId: terapeutaOcupacional.id,
      notes: 'Mãe da Sofia, 5 anos. Diagnóstico de TEA. Visita marcada para avaliação TO.',
    },
    {
      name: 'Juliana Barbosa Pinto',
      phone: '11921098765',
      email: 'juliana.pinto@gmail.com',
      type: 'PARENT_CLIENT' as const,
      label: 'VISITA' as const,
      assignedToId: terapeutaOcupacional.id,
      notes: 'Mãe da Maria Clara, 6 anos. Visita agendada — dificuldades de coordenação motora.',
    },

    // ── 2 × LEAD_FRIO (último contato >10 dias atrás) ─────
    {
      name: 'Thiago Nascimento Gomes',
      phone: '11909876543',
      email: 'thiago.gomes@gmail.com',
      type: 'NEW_CONTACT' as const,
      label: 'LEAD_FRIO' as const,
      assignedToId: null,
      notes: 'Fez contato há 12 dias mas não retornou após receber orçamento.',
    },
    {
      name: 'Mariana Costa Ribeiro',
      phone: '11955512398',
      email: 'mariana.ribeiro@gmail.com',
      type: 'NEW_CONTACT' as const,
      label: 'LEAD_FRIO' as const,
      assignedToId: null,
      notes: 'Mãe interessada em ABA para filho com TEA. Sem resposta após envio de informações há 11 dias.',
    },

    // ── 2 × CLIENTE ───────────────────────────────────────
    {
      name: 'Patricia Almeida Costa',
      phone: '11943210987',
      email: 'patricia.costa@yahoo.com.br',
      type: 'PARENT_CLIENT' as const,
      label: 'CLIENTE' as const,
      assignedToId: fono.id,
      notes: 'Mãe do Gabriel, 9 anos. TDAH — em atendimento fonoaudiológico ativo.',
    },
    {
      name: 'Luciana Carvalho Dias',
      phone: '11998765432',
      email: 'luciana.dias@gmail.com',
      type: 'PARENT_CLIENT' as const,
      label: 'CLIENTE' as const,
      assignedToId: admin.id,
      notes: 'Mãe do Pedro, 8 anos. Em acompanhamento psicológico — suspeita de dislexia confirmada.',
    },

    // ── 1 × PROFISSIONAL ──────────────────────────────────
    {
      name: 'Dr. Marcos Oliveira',
      phone: '11954321098',
      email: 'marcos.oliveira@clinicamed.com.br',
      type: 'PROFESSIONAL' as const,
      label: 'PROFISSIONAL' as const,
      assignedToId: admin.id,
      notes: 'Neurologista parceiro. Encaminha pacientes regularmente.',
    },

    // ── 1 × CURRICULO ─────────────────────────────────────
    {
      name: 'Beatriz Lemos Andrade',
      phone: '11977001234',
      email: 'beatriz.lemos@gmail.com',
      type: 'NEW_CONTACT' as const,
      label: 'CURRICULO' as const,
      assignedToId: null,
      notes: 'Fonoaudióloga recém-formada. Enviou currículo para vaga de terapeuta.',
    },
  ]

  const contacts = []
  for (const contactData of contactsData) {
    const contact = await prisma.contact.create({
      data: { ...contactData, clinicId: clinic.id },
    })
    contacts.push(contact)
  }
  console.log(`${contacts.length} contatos criados`)

  // ── 36 mensagens (3 por contato) ──────────────────────────────────────────
  const messagesData = [
    // [0] Carlos Eduardo Lima — NEW
    [
      { direction: 'INBOUND',  content: 'Boa tarde! Preciso de informações sobre terapia ocupacional para o meu filho.', read: false },
      { direction: 'OUTBOUND', content: 'Boa tarde, Carlos! Atendemos crianças de todas as idades. Poderia me contar mais?', read: true },
      { direction: 'INBOUND',  content: 'Ele tem 8 anos e o médico sugeriu avaliação. Vocês têm horário disponível?', read: false },
    ],
    // [1] Roberto Ferreira Nunes — NEW
    [
      { direction: 'INBOUND',  content: 'Boa noite. Vi vocês no Instagram e quero saber o valor da avaliação psicológica.', read: false },
      { direction: 'OUTBOUND', content: 'Boa noite, Roberto! Nossa avaliação psicológica completa custa R$350. Posso explicar o que está incluso?', read: true },
      { direction: 'INBOUND',  content: 'Sim, por favor. Vocês aceitam plano de saúde?', read: false },
    ],
    // [2] Eduardo Martins Souza — NEW
    [
      { direction: 'INBOUND',  content: 'Oi, meu filho tem 4 anos e não fala quase nada. Vocês fazem avaliação de atraso no desenvolvimento?', read: false },
      { direction: 'OUTBOUND', content: 'Oi, Eduardo! Sim, fazemos avaliação multidisciplinar. É importante avaliar o quanto antes. Posso marcar uma triagem?', read: true },
      { direction: 'INBOUND',  content: 'Sim! Quanto tempo leva a avaliação?', read: false },
    ],
    // [3] Ana Beatriz Rodrigues — VISITA
    [
      { direction: 'INBOUND',  content: 'Olá! Vi o Instagram de vocês e gostaria de saber mais sobre atendimento fonoaudiológico.', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Ana Beatriz! Somos especializados em atendimento infantil. Quer agendar uma visita?', read: true },
      { direction: 'INBOUND',  content: 'Sim! Meu filho Lucas tem 7 anos. Quando é a nossa visita mesmo?', read: true },
    ],
    // [4] Fernanda Silva Santos — VISITA
    [
      { direction: 'INBOUND',  content: 'Bom dia! Minha filha Sofia tem TEA. Precisamos de mais horas de terapia ocupacional.', read: true },
      { direction: 'OUTBOUND', content: 'Bom dia, Fernanda! O Dr. Rafael tem disponibilidade. Confirmando sua visita para amanhã às 14h.', read: true },
      { direction: 'INBOUND',  content: 'Confirmado! Obrigada. Pode me passar o endereço?', read: true },
    ],
    // [5] Juliana Barbosa Pinto — VISITA
    [
      { direction: 'INBOUND',  content: 'Olá! Quero agendar uma visita para conhecer a clínica antes de iniciar o tratamento.', read: true },
      { direction: 'OUTBOUND', content: 'Claro, Juliana! Sua visita está marcada para quinta-feira às 10h com o Dr. Rafael. 😊', read: true },
      { direction: 'INBOUND',  content: 'Ótimo! A Maria Clara está ansiosa para conhecer a clínica.', read: true },
    ],
    // [6] Thiago Nascimento Gomes — LEAD_FRIO (>10 dias)
    [
      { direction: 'INBOUND',  content: 'Olá, quero saber sobre os planos de atendimento de vocês.', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Thiago! Temos pacotes mensais com sessões semanais. Posso te enviar a tabela de valores?', read: true },
      { direction: 'INBOUND',  content: 'Pode sim.', read: true },
    ],
    // [7] Mariana Costa Ribeiro — LEAD_FRIO (>10 dias)
    [
      { direction: 'INBOUND',  content: 'Oi, meu filho tem TEA e queria saber mais sobre ABA.', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Mariana! Trabalhamos com ABA e obtemos ótimos resultados. Enviei mais informações por aqui.', read: true },
      { direction: 'INBOUND',  content: 'Certo, vou ler e entro em contato.', read: true },
    ],
    // [8] Patricia Almeida Costa — CLIENTE
    [
      { direction: 'INBOUND',  content: 'Oi! O Gabriel faltou na sessão da semana passada porque ficou doente. Posso remarcar?', read: true },
      { direction: 'OUTBOUND', content: 'Oi, Patricia! A Dra. Camila tem horário na sexta às 10h. Serve?', read: true },
      { direction: 'INBOUND',  content: 'Perfeito! Confirmado para sexta às 10h. Obrigada!', read: true },
    ],
    // [9] Luciana Carvalho Dias — CLIENTE
    [
      { direction: 'INBOUND',  content: 'Dr. Admin, o Pedro fez o teste escolar e o professor confirmou dislexia. Quando podemos fazer a avaliação completa?', read: true },
      { direction: 'OUTBOUND', content: 'Luciana, vou agendar a avaliação neuropsicológica completa. Tenho disponibilidade na semana que vem. Prefere manhã ou tarde?', read: true },
      { direction: 'INBOUND',  content: 'Prefiro manhã, antes das 11h. O Pedro tem aula à tarde.', read: false },
    ],
    // [10] Dr. Marcos Oliveira — PROFISSIONAL
    [
      { direction: 'INBOUND',  content: 'Olá equipe! Vou encaminhar mais 2 pacientes essa semana. Podem receber?', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Dr. Marcos! Temos horários disponíveis. Pode passar os dados dos pacientes.', read: true },
      { direction: 'INBOUND',  content: 'Perfeito! Vou enviar o relatório clínico junto com os encaminhamentos.', read: true },
    ],
    // [11] Beatriz Lemos Andrade — CURRICULO
    [
      { direction: 'INBOUND',  content: 'Boa tarde! Vi no site que vocês podem ter vagas. Sou fonoaudióloga recém-formada e adoraria trabalhar na Terap Moviment.', read: true },
      { direction: 'OUTBOUND', content: 'Boa tarde, Beatriz! Que ótimo! Pode nos enviar seu currículo e CRFa? Nossa coordenadora vai analisar.', read: true },
      { direction: 'INBOUND',  content: 'Claro! Já enviando agora. Tenho experiência com crianças com TEA e TDAH.', read: true },
    ],
  ]

  let messageCount = 0
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]
    const msgs = messagesData[i]

    // Leads Frios: mensagens com >10 dias de atraso
    const isLeadFrio = contact.label === 'LEAD_FRIO'

    for (let j = 0; j < msgs.length; j++) {
      const minutesAgo = (msgs.length - j) * 30
      const baseDaysAgo = isLeadFrio ? 11 : i
      const createdAt = new Date(
        now.getTime() - minutesAgo * 60 * 1000 - baseDaysAgo * 24 * 60 * 60 * 1000
      )

      await prisma.message.create({
        data: {
          contactId: contact.id,
          clinicId: clinic.id,
          direction: msgs[j].direction,
          channel: 'WHATSAPP',
          content: msgs[j].content,
          read: msgs[j].read,
          createdAt,
        },
      })
      messageCount++
    }
  }
  console.log(`${messageCount} mensagens criadas`)

  // ── 9 sessões — vinculadas aos 3 contatos VISITA e 2 CLIENTE ────────────
  const sessionsData = [
    // Visitas marcadas (avaliação inicial)
    {
      contactIdx: 3, // Ana Beatriz / Lucas
      therapistId: fono.id,
      specialty: 'FONOAUDIOLOGIA' as const,
      status: 'CONFIRMED' as const,
      daysFromNow: 1,
      hour: 9,
      duration: 50,
      notes: 'Sessão de avaliação inicial. Trazer relatório do pediatra.',
    },
    {
      contactIdx: 4, // Fernanda / Sofia
      therapistId: terapeutaOcupacional.id,
      specialty: 'TERAPIA_OCUPACIONAL' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 1,
      hour: 14,
      duration: 50,
      notes: 'Avaliação de integração sensorial — primeiro contato.',
    },
    {
      contactIdx: 5, // Juliana / Maria Clara
      therapistId: terapeutaOcupacional.id,
      specialty: 'TERAPIA_OCUPACIONAL' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 3,
      hour: 10,
      duration: 60,
      notes: 'Avaliação de coordenação motora fina e grossa.',
    },

    // Clientes em atendimento ativo
    {
      contactIdx: 8, // Patricia / Gabriel
      therapistId: fono.id,
      specialty: 'FONOAUDIOLOGIA' as const,
      status: 'CONFIRMED' as const,
      daysFromNow: 2,
      hour: 10,
      duration: 50,
      notes: 'Sessão remarcada. Exercícios de articulação e fluência verbal.',
    },
    {
      contactIdx: 8, // Patricia / Gabriel
      therapistId: admin.id,
      specialty: 'PSICOLOGIA' as const,
      status: 'COMPLETED' as const,
      daysFromNow: -1,
      hour: 14,
      duration: 50,
      notes: 'Sessão realizada. Gabriel demonstrou boa evolução.',
    },
    {
      contactIdx: 9, // Luciana / Pedro
      therapistId: admin.id,
      specialty: 'PSICOLOGIA' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 3,
      hour: 9,
      duration: 50,
      notes: 'Avaliação neuropsicológica — sessão 1 de 3.',
    },
    {
      contactIdx: 9, // Luciana / Pedro
      therapistId: admin.id,
      specialty: 'PSICOLOGIA' as const,
      status: 'COMPLETED' as const,
      daysFromNow: -2,
      hour: 10,
      duration: 50,
      notes: 'Aplicação de testes projetivos. Relatório em elaboração.',
    },

    // Sessões futuras adicionais
    {
      contactIdx: 3, // Ana Beatriz / Lucas
      therapistId: fono.id,
      specialty: 'FONOAUDIOLOGIA' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 5,
      hour: 9,
      duration: 50,
      notes: 'Continuação da avaliação fonoaudiológica.',
    },
    {
      contactIdx: 4, // Fernanda / Sofia
      therapistId: terapeutaOcupacional.id,
      specialty: 'ABA' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 6,
      hour: 16,
      duration: 60,
      notes: 'Sessão de ABA — reforço de comportamentos adaptativos.',
    },
  ]

  for (const sessionData of sessionsData) {
    const scheduledAt = new Date(now)
    scheduledAt.setDate(scheduledAt.getDate() + sessionData.daysFromNow)
    scheduledAt.setHours(sessionData.hour, 0, 0, 0)

    await prisma.session.create({
      data: {
        contactId: contacts[sessionData.contactIdx].id,
        clinicId: clinic.id,
        therapistId: sessionData.therapistId,
        specialty: sessionData.specialty,
        status: sessionData.status,
        scheduledAt,
        duration: sessionData.duration,
        notes: sessionData.notes,
      },
    })
  }

  console.log('9 sessões criadas')
  console.log('✅ Seed concluído com sucesso!')
  console.log('Login: admin@terapmoviment.com.br / 123456')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

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

  // Criar usuário admin
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

  // Criar fonoaudióloga
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

  // Criar terapeuta ocupacional
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

  // Criar 12 contatos
  const now = new Date()
  const contactsData = [
    {
      name: 'Ana Beatriz Rodrigues',
      phone: '11987654321',
      email: 'ana.beatriz@gmail.com',
      type: 'PARENT_CLIENT' as const,
      status: 'ACTIVE' as const,
      assignedToId: fono.id,
      notes: 'Mãe do Lucas, 7 anos. Procura atendimento fonoaudiológico para atraso de fala.',
    },
    {
      name: 'Carlos Eduardo Lima',
      phone: '11976543210',
      email: 'carlos.lima@hotmail.com',
      type: 'NEW_CONTACT' as const,
      status: 'PENDING' as const,
      assignedToId: null,
      notes: 'Novo contato via WhatsApp. Interesse em terapia ocupacional.',
    },
    {
      name: 'Fernanda Silva Santos',
      phone: '11965432109',
      email: 'fernanda.santos@gmail.com',
      type: 'PARENT_CLIENT' as const,
      status: 'ACTIVE' as const,
      assignedToId: terapeutaOcupacional.id,
      notes: 'Mãe da Sofia, 5 anos. Diagnóstico de TEA. Aguardando avaliação completa.',
    },
    {
      name: 'Dr. Marcos Oliveira',
      phone: '11954321098',
      email: 'marcos.oliveira@clinicamed.com.br',
      type: 'PROFESSIONAL' as const,
      status: 'ACTIVE' as const,
      assignedToId: admin.id,
      notes: 'Neurologista parceiro. Encaminha pacientes regularmente.',
    },
    {
      name: 'Patricia Almeida Costa',
      phone: '11943210987',
      email: 'patricia.costa@yahoo.com.br',
      type: 'PARENT_CLIENT' as const,
      status: 'ACTIVE' as const,
      assignedToId: fono.id,
      notes: 'Mãe do Gabriel, 9 anos. TDAH e dificuldades de linguagem.',
    },
    {
      name: 'Roberto Ferreira Nunes',
      phone: '11932109876',
      email: null,
      type: 'NEW_CONTACT' as const,
      status: 'PENDING' as const,
      assignedToId: null,
      notes: 'Entrou em contato pelo Instagram. Busca avaliação psicológica.',
    },
    {
      name: 'Juliana Barbosa Pinto',
      phone: '11921098765',
      email: 'juliana.pinto@gmail.com',
      type: 'PARENT_CLIENT' as const,
      status: 'ACTIVE' as const,
      assignedToId: terapeutaOcupacional.id,
      notes: 'Mãe da Maria Clara, 6 anos. Dificuldades de coordenação motora.',
    },
    {
      name: 'Dra. Amanda Ramos',
      phone: '11910987654',
      email: 'amanda.ramos@escolaespecial.edu.br',
      type: 'PROFESSIONAL' as const,
      status: 'ACTIVE' as const,
      assignedToId: admin.id,
      notes: 'Pedagoga especialista. Parceria para atendimento conjunto.',
    },
    {
      name: 'Thiago Nascimento Gomes',
      phone: '11909876543',
      email: 'thiago.gomes@gmail.com',
      type: 'NEW_CONTACT' as const,
      status: 'INACTIVE' as const,
      assignedToId: null,
      notes: 'Fez contato há 2 meses mas não retornou após primeiro orçamento.',
    },
    {
      name: 'Luciana Carvalho Dias',
      phone: '11998765432',
      email: 'luciana.dias@gmail.com',
      type: 'PARENT_CLIENT' as const,
      status: 'ACTIVE' as const,
      assignedToId: admin.id,
      notes: 'Mãe do Pedro, 8 anos. Suspeita de dislexia. Em acompanhamento psicológico.',
    },
    {
      name: 'Eduardo Martins Souza',
      phone: '11988765431',
      email: null,
      type: 'NEW_CONTACT' as const,
      status: 'PENDING' as const,
      assignedToId: null,
      notes: 'Pai buscando avaliação para filho de 4 anos com atraso no desenvolvimento.',
    },
    {
      name: 'Renata Gonçalves Moreira',
      phone: '11977654320',
      email: 'renata.moreira@outlook.com',
      type: 'PARENT_CLIENT' as const,
      status: 'INACTIVE' as const,
      assignedToId: fono.id,
      notes: 'Paciente encerrou atendimento em outubro. Alta clínica fonoaudiológica.',
    },
  ]

  const contacts = []
  for (const contactData of contactsData) {
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        clinicId: clinic.id,
      },
    })
    contacts.push(contact)
  }

  console.log(`${contacts.length} contatos criados`)

  // Criar 36 mensagens (3 por contato)
  const messagesData = [
    // Ana Beatriz Rodrigues
    [
      { direction: 'INBOUND', content: 'Olá! Vi o Instagram de vocês e gostaria de saber mais sobre o atendimento fonoaudiológico para crianças.', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Ana Beatriz! Tudo bem? Somos especializados em atendimento infantil. Você poderia me contar um pouco mais sobre as necessidades do seu filho?', read: true },
      { direction: 'INBOUND', content: 'Meu filho Lucas tem 7 anos e ainda troca muitas letras ao falar. O pediatra recomendou avaliação fonoaudiológica.', read: true },
    ],
    // Carlos Eduardo Lima
    [
      { direction: 'INBOUND', content: 'Boa tarde! Preciso de informações sobre terapia ocupacional. É para mim mesmo, adulto.', read: false },
      { direction: 'OUTBOUND', content: 'Boa tarde, Carlos! Claro, atendemos adultos também. Qual a sua necessidade principal?', read: true },
      { direction: 'INBOUND', content: 'Tenho TDAH diagnosticado recentemente e quero trabalhar organização e foco.', read: false },
    ],
    // Fernanda Silva Santos
    [
      { direction: 'INBOUND', content: 'Bom dia! Minha filha Sofia tem TEA e está precisando de mais horas de terapia ocupacional.', read: true },
      { direction: 'OUTBOUND', content: 'Bom dia, Fernanda! Entendo a urgência. O Dr. Rafael tem disponibilidade às terças e quintas. Vamos agendar uma avaliação?', read: true },
      { direction: 'INBOUND', content: 'Sim! Terça-feira seria ótimo. Pode ser às 14h?', read: true },
    ],
    // Dr. Marcos Oliveira
    [
      { direction: 'INBOUND', content: 'Olá equipe! Vou encaminhar mais 2 pacientes essa semana. Podem receber?', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Dr. Marcos! Ótimo! Temos horários disponíveis. Pode passar os dados dos pacientes.', read: true },
      { direction: 'INBOUND', content: 'Perfeito! Vou passar o relatório clínico junto com os encaminhamentos.', read: true },
    ],
    // Patricia Almeida Costa
    [
      { direction: 'INBOUND', content: 'Oi! O Gabriel faltou na sessão da semana passada porque ficou doente. Posso remarcar?', read: true },
      { direction: 'OUTBOUND', content: 'Oi, Patricia! Claro, sem problema. A Dra. Camila tem horário na sexta às 10h. Serve?', read: true },
      { direction: 'INBOUND', content: 'Perfeito! Confirmado para sexta às 10h. Obrigada!', read: true },
    ],
    // Roberto Ferreira Nunes
    [
      { direction: 'INBOUND', content: 'Boa noite. Vi vocês no Instagram e quero saber o valor da avaliação psicológica.', read: false },
      { direction: 'OUTBOUND', content: 'Boa noite, Roberto! Nossa avaliação psicológica completa custa R$350, com relatório incluso. Posso te explicar o que está incluso?', read: true },
      { direction: 'INBOUND', content: 'Sim, por favor. E vocês aceitam plano de saúde?', read: false },
    ],
    // Juliana Barbosa Pinto
    [
      { direction: 'INBOUND', content: 'Olá! A Maria Clara adorou a sessão de hoje com o Dr. Rafael! Ela chegou em casa muito feliz.', read: true },
      { direction: 'OUTBOUND', content: 'Que ótimo ouvir isso, Juliana! A Maria Clara está evoluindo muito bem. O Dr. Rafael ficará feliz em saber.', read: true },
      { direction: 'INBOUND', content: 'Quando sai o próximo relatório de evolução dela?', read: true },
    ],
    // Dra. Amanda Ramos
    [
      { direction: 'INBOUND', content: 'Bom dia! Gostaria de combinar uma reunião de caso para discutirmos as crianças em comum.', read: true },
      { direction: 'OUTBOUND', content: 'Bom dia, Dra. Amanda! Ótima ideia! Temos disponibilidade nas quintas das 12h às 13h. Funcionaria?', read: true },
      { direction: 'INBOUND', content: 'Perfeito! Quinta-feira que vem então. Vou confirmar pelo e-mail também.', read: true },
    ],
    // Thiago Nascimento Gomes
    [
      { direction: 'INBOUND', content: 'Olá, quero saber sobre os planos de atendimento de vocês.', read: true },
      { direction: 'OUTBOUND', content: 'Olá, Thiago! Temos pacotes mensais com sessões semanais. Posso te enviar nossa tabela de valores?', read: true },
      { direction: 'INBOUND', content: 'Pode sim.', read: true },
    ],
    // Luciana Carvalho Dias
    [
      { direction: 'INBOUND', content: 'Dr. Admin, o Pedro fez o teste escolar e o professor suspeita de dislexia. Quando podemos fazer a avaliação completa?', read: true },
      { direction: 'OUTBOUND', content: 'Luciana, vamos agendar a avaliação neuropsicológica completa. Tenho disponibilidade na próxima semana. Prefere manhã ou tarde?', read: true },
      { direction: 'INBOUND', content: 'Prefiro manhã, antes das 11h. O Pedro tem aula à tarde.', read: false },
    ],
    // Eduardo Martins Souza
    [
      { direction: 'INBOUND', content: 'Oi, meu filho tem 4 anos e não fala quase nada. Vocês fazem avaliação de atraso no desenvolvimento?', read: false },
      { direction: 'OUTBOUND', content: 'Oi, Eduardo! Sim, fazemos avaliação multidisciplinar do desenvolvimento infantil. É importante avaliar o quanto antes. Podemos marcar uma triagem?', read: true },
      { direction: 'INBOUND', content: 'Sim! Quanto tempo leva a avaliação?', read: false },
    ],
    // Renata Gonçalves Moreira
    [
      { direction: 'INBOUND', content: 'Olá! A Dra. Camila me deu alta do tratamento fonoaudiológico. Muito obrigada pelo atendimento de todos!', read: true },
      { direction: 'OUTBOUND', content: 'Parabéns, Renata! Foi um prazer acompanhar sua evolução. Qualquer necessidade futura, estamos aqui!', read: true },
      { direction: 'INBOUND', content: 'Com certeza! Já indiquei vocês para uma amiga.', read: true },
    ],
  ]

  let messageCount = 0
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]
    const msgs = messagesData[i]

    for (let j = 0; j < msgs.length; j++) {
      const minutesAgo = (msgs.length - j) * 30
      const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000 - i * 24 * 60 * 60 * 1000)

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

  // Criar 9 sessões nos próximos 7 dias
  const sessionsData = [
    {
      contactIdx: 0, // Ana Beatriz / Lucas
      therapistId: fono.id,
      specialty: 'FONOAUDIOLOGIA' as const,
      status: 'CONFIRMED' as const,
      daysFromNow: 1,
      hour: 9,
      duration: 50,
      notes: 'Sessão de avaliação inicial. Trazer relatório do pediatra.',
    },
    {
      contactIdx: 2, // Fernanda / Sofia
      therapistId: terapeutaOcupacional.id,
      specialty: 'TERAPIA_OCUPACIONAL' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 1,
      hour: 14,
      duration: 50,
      notes: 'Foco em integração sensorial e atividades de vida diária.',
    },
    {
      contactIdx: 4, // Patricia / Gabriel
      therapistId: fono.id,
      specialty: 'FONOAUDIOLOGIA' as const,
      status: 'CONFIRMED' as const,
      daysFromNow: 2,
      hour: 10,
      duration: 50,
      notes: 'Exercícios de articulação e fluência verbal.',
    },
    {
      contactIdx: 6, // Juliana / Maria Clara
      therapistId: terapeutaOcupacional.id,
      specialty: 'TERAPIA_OCUPACIONAL' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 2,
      hour: 15,
      duration: 60,
      notes: 'Trabalho de coordenação motora fina e grossa.',
    },
    {
      contactIdx: 9, // Luciana / Pedro
      therapistId: admin.id,
      specialty: 'PSICOLOGIA' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 3,
      hour: 9,
      duration: 50,
      notes: 'Avaliação neuropsicológica - sessão 1 de 3.',
    },
    {
      contactIdx: 0, // Ana Beatriz / Lucas
      therapistId: fono.id,
      specialty: 'FONOAUDIOLOGIA' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 4,
      hour: 9,
      duration: 50,
      notes: 'Continuação da avaliação fonoaudiológica.',
    },
    {
      contactIdx: 2, // Fernanda / Sofia
      therapistId: terapeutaOcupacional.id,
      specialty: 'ABA' as const,
      status: 'SCHEDULED' as const,
      daysFromNow: 4,
      hour: 16,
      duration: 60,
      notes: 'Sessão de ABA - reforço de comportamentos adaptativos.',
    },
    {
      contactIdx: 4, // Patricia / Gabriel
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
      status: 'COMPLETED' as const,
      daysFromNow: -2,
      hour: 10,
      duration: 50,
      notes: 'Aplicação de testes projetivos. Relatório em elaboração.',
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
  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

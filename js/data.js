/* ==========================================================================
   VELOURS STUDIO — CONTEÚDO DO SITE
   --------------------------------------------------------------------------
   Este é o ÚNICO ficheiro que precisa de ser editado para atualizar o site.
   Todo o texto, horários, preços, contactos e imagens vêm daqui.

   Regras rápidas:
   • Texto entre [parêntesis retos] é um marcador: substituir pela info real.
   • Imagens: colocar os ficheiros em assets/images/ e indicar o caminho.
     Se uma imagem não existir, o site mostra automaticamente um fundo
     em gradiente no seu lugar (não parte nada).
   • Horas sempre no formato "HH:MM" (24h).
   • Depois de guardar, basta recarregar a página.
   ========================================================================== */

window.STUDIO_DATA = {

  /* ---------- Informação geral ---------- */
  studio: {
    name: 'Velours Studio',
    logoText: 'VELOURS',
    owners: 'by Julien & Camille',
    tagline: 'Treino com método. Resultados com propósito.',
    address: '[Morada do estúdio]',
    postalCode: '[Código postal, Localidade]',
    phone: '[Telefone]',
    email: '[Email]',
    // Número de WhatsApp SÓ com dígitos e indicativo, ex.: '351912345678'
    whatsapp: '[351XXXXXXXXX]',
    // Link do Google Maps (botão "Abrir no mapa"). Deixar '' para pesquisar pela morada.
    mapLink: '',
    // Opcional: URL de "incorporar mapa" do Google Maps (iframe). Deixar '' para mostrar o marcador gráfico.
    mapEmbedUrl: '',
    openingHours: [
      { days: 'Segunda a Sexta', hours: '[07:00 – 21:00]' },
      { days: 'Sábado', hours: '[09:00 – 13:00]' },
      { days: 'Domingo', hours: 'Encerrado' }
    ]
  },

  social: {
    instagram: 'https://instagram.com/[conta-instagram]',
    instagramHandle: '@[conta-instagram]'
  },

  /* ---------- Textos de cada secção ---------- */
  sections: {
    hero: {
      eyebrow: 'Estúdio de treino personalizado',
      title: 'VELOURS',
      titleOutline: 'STUDIO',
      text: 'Treinos em pequenos grupos e acompanhamento individual, num espaço onde cada repetição conta e ninguém treina sozinho.',
      primaryCta: 'Marcar aula experimental',
      secondaryCta: 'Ver horário',
      image: 'assets/images/hero.webp',
      imageAlt: 'Julien e Camille, fundadores do Velours Studio, de braços cruzados no estúdio iluminado a rosa'
    },
    // Barra de valores logo abaixo do hero
    pillars: [
      { word: 'Força', text: 'Cargas progressivas e técnica afinada.' },
      { word: 'Foco', text: 'Cada sessão com um objetivo claro.' },
      { word: 'Disciplina', text: 'Consistência que vira resultados.' },
      { word: 'Comunidade', text: 'Grupos pequenos, apoio a sério.' }
    ],
    manifesto: {
      eyebrow: 'O espaço',
      text: 'Aqui não há atalhos. Há treino, há método e há uma equipa que não te deixa desistir. Entras como és. Sais mais forte.',
      gallery: [
        { src: 'assets/images/studio-1.webp', alt: 'Interior do estúdio com halteres, kettlebells e luzes néon rosa' },
        { src: 'assets/images/studio-2.webp', alt: '[Descrição da foto do estúdio 2]' },
        { src: 'assets/images/studio-3.webp', alt: '[Descrição da foto do estúdio 3]' }
      ]
    },
    about: {
      eyebrow: 'Quem somos',
      title: 'Julien & Camille',
      text: 'Dois treinadores, uma missão: criar o sítio onde gostarias de treinar todos os dias. Toca nos cartões para conhecer cada um.'
    },
    classes: {
      eyebrow: 'Modalidades',
      title: 'Escolhe o teu treino',
      text: 'Todas as aulas são em grupos reduzidos, com correção técnica e progressão planeada.'
    },
    schedule: {
      eyebrow: 'Horário',
      title: 'A tua semana de treino',
      note: 'Horário provisório — sujeito a confirmação.'
    },
    stats: {
      eyebrow: 'Em números'
    },
    transformation: {
      eyebrow: 'Transformações',
      title: 'O antes e o depois',
      text: 'Arrasta para comparar. Resultados reais de quem treina connosco.',
      note: 'Imagens ilustrativas — substituir por fotos reais com autorização dos alunos.'
    },
    pricing: {
      eyebrow: 'Planos',
      title: 'Investe em ti',
      text: 'Sem taxas escondidas. A primeira aula experimental é por nossa conta.',
      monthlyLabel: 'Mensal',
      yearlyLabel: 'Anual',
      yearlyBadge: '[-X%]'
    },
    testimonials: {
      eyebrow: 'Testemunhos',
      title: 'Quem treina, recomenda'
    },
    faq: {
      eyebrow: 'Dúvidas',
      title: 'Perguntas frequentes'
    },
    cta: {
      title: 'A tua primeira aula é por nossa conta',
      text: 'Escolhe a modalidade, o dia e a hora. Nós tratamos do resto.',
      button: 'Marcar aula experimental'
    },
    contact: {
      eyebrow: 'Contactos',
      title: 'Vem conhecer o estúdio'
    }
  },

  /* ---------- Treinadores ---------- */
  coaches: [
    {
      id: 'julien',
      name: 'Julien',
      role: 'Coach & Co-fundador',
      image: 'assets/images/julien.webp',
      imageAlt: 'Retrato do coach Julien, de braços cruzados, com t-shirt preta',
      bio: '[Biografia do Julien: percurso, filosofia de treino e o que o motiva todos os dias.]',
      specialties: ['Treino de força', 'Hipertrofia', 'Preparação física'],
      certifications: ['[Certificação 1]', '[Certificação 2]', '[Licenciatura / Cédula TPTE]']
    },
    {
      id: 'camille',
      name: 'Camille',
      role: 'Coach & Co-fundadora',
      image: 'assets/images/camille.webp',
      imageAlt: 'Retrato da coach Camille, com a mão na anca, com top desportivo preto',
      bio: '[Biografia da Camille: percurso, filosofia de treino e o que a motiva todos os dias.]',
      specialties: ['Treino funcional', 'Mobilidade', 'Treino feminino'],
      certifications: ['[Certificação 1]', '[Certificação 2]', '[Licenciatura / Cédula TPTE]']
    }
  ],

  /* ---------- Modalidades ----------
     id: identificador curto (usado no horário)
     intensity: 1 a 5
     icon: nome de um ficheiro em assets/icons/ (sem .svg)
     appointment: true = por marcação (não aparece no horário de grupo) */
  classes: [
    {
      id: 'forca',
      name: 'Força',
      icon: 'dumbbell',
      short: 'Ganha força real com barras, halteres e técnica afinada.',
      description: '[Descrição da aula de Força.] Trabalho com cargas progressivas nos movimentos fundamentais — agachamento, peso morto, press e remadas — com correção técnica em cada série.',
      duration: 50,
      intensity: 4,
      level: 'Todos os níveis'
    },
    {
      id: 'hiit',
      name: 'HIIT',
      icon: 'flame',
      short: 'Intervalos de alta intensidade para queimar e superar limites.',
      description: '[Descrição da aula de HIIT.] Blocos curtos e intensos que melhoram a capacidade cardiovascular e o gasto energético, sempre com alternativas para cada nível.',
      duration: 40,
      intensity: 5,
      level: 'Intermédio'
    },
    {
      id: 'funcional',
      name: 'Funcional',
      icon: 'zap',
      short: 'Movimento completo para o corpo que usas no dia a dia.',
      description: '[Descrição da aula de Funcional.] Circuitos com kettlebells, peso corporal e acessórios para desenvolver força, coordenação e resistência.',
      duration: 50,
      intensity: 3,
      level: 'Todos os níveis'
    },
    {
      id: 'mobilidade',
      name: 'Mobilidade & Core',
      icon: 'lotus',
      short: 'Articulações livres, core forte e menos dores.',
      description: '[Descrição da aula de Mobilidade & Core.] Sessão para melhorar amplitude de movimento, postura e estabilidade — o complemento perfeito para os treinos mais intensos.',
      duration: 45,
      intensity: 2,
      level: 'Todos os níveis'
    },
    {
      id: 'pt',
      name: 'Personal Training',
      icon: 'target',
      short: 'Plano 100% à tua medida, só tu e o teu coach.',
      description: '[Descrição do Personal Training.] Avaliação inicial, plano individual e acompanhamento próximo para chegares ao teu objetivo mais depressa.',
      duration: 60,
      intensity: 4,
      level: 'Individual',
      appointment: true
    }
  ],

  /* ---------- Horário semanal ----------
     Para cada dia: lista de aulas com hora de início, id da modalidade e coach.
     A hora de fim é calculada a partir da duração da modalidade. */
  days: [
    { key: 'seg', short: 'Seg', long: 'Segunda' },
    { key: 'ter', short: 'Ter', long: 'Terça' },
    { key: 'qua', short: 'Qua', long: 'Quarta' },
    { key: 'qui', short: 'Qui', long: 'Quinta' },
    { key: 'sex', short: 'Sex', long: 'Sexta' },
    { key: 'sab', short: 'Sáb', long: 'Sábado' },
    { key: 'dom', short: 'Dom', long: 'Domingo' }
  ],
  schedule: {
    seg: [
      { time: '07:00', classId: 'forca', coach: 'Julien' },
      { time: '09:30', classId: 'mobilidade', coach: 'Camille' },
      { time: '12:30', classId: 'hiit', coach: 'Camille' },
      { time: '18:30', classId: 'funcional', coach: 'Julien' },
      { time: '19:30', classId: 'forca', coach: 'Camille' }
    ],
    ter: [
      { time: '07:00', classId: 'hiit', coach: 'Julien' },
      { time: '12:30', classId: 'forca', coach: 'Julien' },
      { time: '18:30', classId: 'mobilidade', coach: 'Camille' },
      { time: '19:30', classId: 'hiit', coach: 'Camille' }
    ],
    qua: [
      { time: '07:00', classId: 'funcional', coach: 'Camille' },
      { time: '09:30', classId: 'mobilidade', coach: 'Camille' },
      { time: '12:30', classId: 'forca', coach: 'Julien' },
      { time: '18:30', classId: 'hiit', coach: 'Julien' },
      { time: '19:30', classId: 'funcional', coach: 'Camille' }
    ],
    qui: [
      { time: '07:00', classId: 'forca', coach: 'Julien' },
      { time: '12:30', classId: 'hiit', coach: 'Camille' },
      { time: '18:30', classId: 'forca', coach: 'Julien' },
      { time: '19:30', classId: 'mobilidade', coach: 'Camille' }
    ],
    sex: [
      { time: '07:00', classId: 'hiit', coach: 'Camille' },
      { time: '12:30', classId: 'funcional', coach: 'Julien' },
      { time: '18:30', classId: 'forca', coach: 'Camille' }
    ],
    sab: [
      { time: '09:00', classId: 'funcional', coach: 'Julien & Camille' },
      { time: '10:15', classId: 'mobilidade', coach: 'Camille' }
    ],
    dom: []
  },

  /* ---------- Números ----------
     value: 'auto' em "aulas por semana" conta automaticamente as aulas do horário.
     ATENÇÃO: os restantes valores são de EXEMPLO — confirmar antes de publicar. */
  stats: [
    { value: 150, prefix: '+', suffix: '', label: 'Alunos ativos' },
    { value: 'auto', prefix: '', suffix: '', label: 'Aulas por semana' },
    { value: 10, prefix: '+', suffix: '', label: 'Anos de experiência' },
    { value: 2, prefix: '', suffix: '', label: 'Coaches dedicados' }
  ],

  /* ---------- Antes / Depois ---------- */
  transformation: {
    before: { src: 'assets/images/before.webp', alt: '[Foto antes]', label: 'Antes' },
    after: { src: 'assets/images/after.webp', alt: '[Foto depois]', label: 'Depois' },
    caption: '[Nome do aluno] · [X] meses de treino'
  },

  /* ---------- Planos ----------
     monthly / yearly: preço por mês em euros (número, ex.: 59) ou null para mostrar "[Preço]".
     Quando forem números, os preços animam ao trocar Mensal/Anual. */
  plans: [
    {
      name: 'Essencial',
      description: 'Para quem quer começar com consistência.',
      monthly: null,
      yearly: null,
      features: ['2 aulas de grupo por semana', 'Acesso a todas as modalidades', 'Avaliação física inicial'],
      cta: 'Começar'
    },
    {
      name: 'Ilimitado',
      description: 'Treina quando quiseres, quantas vezes quiseres.',
      monthly: null,
      yearly: null,
      featured: true,
      badge: 'Mais popular',
      features: ['Aulas de grupo ilimitadas', 'Acesso a todas as modalidades', 'Avaliação física trimestral', 'Plano de treino complementar'],
      cta: 'Escolher Ilimitado'
    },
    {
      name: 'Personal',
      description: 'Acompanhamento 1:1 com o teu coach.',
      monthly: null,
      yearly: null,
      features: ['[N.º] sessões individuais por mês', 'Plano de treino personalizado', 'Orientação nutricional base', 'Acesso às aulas de grupo'],
      cta: 'Falar com um coach'
    }
  ],

  /* ---------- Testemunhos ----------
     example: true mostra a etiqueta "Exemplo". Remover quando forem reais. */
  testimonials: [
    { name: '[Nome do aluno]', detail: 'Aluna há 2 anos', text: 'Nunca pensei gostar tanto de treinar. O ambiente é incrível e sinto-me mais forte do que nunca.', example: true },
    { name: '[Nome do aluno]', detail: 'Aluno há 1 ano', text: 'O acompanhamento faz toda a diferença. Corrigem cada detalhe e os resultados aparecem mesmo.', example: true },
    { name: '[Nome do aluno]', detail: 'Personal Training', text: 'Comecei com dores nas costas e hoje faço peso morto sem medo. Mudaram a minha relação com o exercício.', example: true },
    { name: '[Nome do aluno]', detail: 'Aluna há 6 meses', text: 'Grupos pequenos, treinos desafiantes e uma comunidade que te puxa para cima. Não troco por nada.', example: true }
  ],

  /* ---------- Perguntas frequentes ---------- */
  faq: [
    { q: 'Nunca treinei. Posso começar?', a: 'Claro. Todas as aulas têm adaptações para cada nível e a primeira aula experimental serve precisamente para conheceres o método e os coaches.' },
    { q: 'Quantas pessoas há em cada aula?', a: '[Número máximo] pessoas por aula, para garantir acompanhamento próximo e correção técnica a todos.' },
    { q: 'Preciso de levar alguma coisa?', a: 'Apenas roupa confortável, calçado desportivo, uma toalha e uma garrafa de água. [Indicar se há balneários e cacifos.]' },
    { q: 'Como funciona a aula experimental?', a: 'Marcas pelo botão "Marcar aula experimental", escolhes a modalidade, o dia e a hora, e confirmamos contigo por WhatsApp.' },
    { q: 'Posso cancelar ou congelar a mensalidade?', a: '[Explicar a política de cancelamento e congelamento.]' },
    { q: 'Há estacionamento perto?', a: '[Informação sobre estacionamento e transportes públicos.]' }
  ],

  /* ---------- Marcações ----------
     Mensagem enviada por WhatsApp. Os campos {nome}, {modalidade}, {dia}, {hora}
     e {extra} são substituídos automaticamente. */
  booking: {
    title: 'Marcar aula experimental',
    successTitle: 'Está quase!',
    successText: 'Abrimos o WhatsApp com a tua mensagem pronta. Só tens de a enviar e confirmamos a tua aula.',
    message: 'Olá Velours Studio! 👋\nGostaria de marcar uma aula experimental.\n\nNome: {nome}\nModalidade: {modalidade}\nDia: {dia}\nHora: {hora}{extra}',
    floatingMessage: 'Olá Velours Studio! Gostaria de saber mais sobre as aulas.',
    // Opções de horário para modalidades por marcação (ex.: Personal Training)
    appointmentSlots: ['Manhã (07h–12h)', 'Almoço (12h–14h)', 'Tarde (14h–18h)', 'Noite (18h–21h)']
  }
};

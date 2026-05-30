/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Witness {
  id: string;
  name: string;
  period: string;
  category: string;
  description: string;
  avatarPlaceholder: string; // Emoji character or initials
}

export const WITNESS_CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'pais-reformadores', name: 'Pais & Reformadores' },
  { id: 'teologos-pensadores', name: 'Teólogos & Pensadores' },
  { id: 'poder-avivamento', name: 'Poder & Avivamento' },
  { id: 'pioneiros-missoes', name: 'Pioneiros das Missões' },
  { id: 'testemunhas-martires', name: 'Testemunhas & Mártires' },
  { id: 'pastores-mestres', name: 'Pastores & Mestres' },
  { id: 'avivamento-santidade', name: 'Avivamento & Santidade' },
  { id: 'nossos-dias', name: 'Para os Nossos Dias' }
];

export const WITNESSES: Witness[] = [
  // Category: Pais e Reformadores
  {
    id: 'lutero',
    name: 'Martinho Lutero',
    period: '1483-1546',
    category: 'pais-reformadores',
    avatarPlaceholder: '📖',
    description: 'Monge alemão atormentado pela culpa que encontrou nas Escrituras que "o justo viverá pela fé". Ao desafiar os desvios clericais de sua época pregando as 95 teses em Wittenberg, mostrou que um coração cativo pela pura Palavra de Deus não se curva ao medo, impérios ou tradições humanas obsoletas.'
  },
  {
    id: 'calvino',
    name: 'João Calvino',
    period: '1509-1564',
    category: 'pais-reformadores',
    avatarPlaceholder: '📜',
    description: 'Jovem bacharel e grande estudioso que dedicou toda a sua inteligência sistemática e vida a um propósito centralizador: "soli Deo gloria" (glória somente a Deus). O reformador genebrino nos ensina que a mente redimida pelo Espírito Santo e cada ação laboral do nosso dia a dia pode ser consagrada como um sagrado ato de adoração.'
  },
  {
    id: 'wesley',
    name: 'John Wesley',
    period: '1703-1791',
    category: 'pais-reformadores',
    avatarPlaceholder: '🔥',
    description: 'O homem com o "coração estranhamente aquecido" que percorreu mais de 400 mil quilômetros a cavalo pregando o evangelho nas praças inglesas. Fundador do metodismo, demonstrou empiricamente que a fé salvadora verdadeira nunca é estática ou confinada em paredes; ela gera santidade social, nos extrai do comodismo e encarna o movimento incessante em direção às almas.'
  },
  {
    id: 'spurgeon',
    name: 'Charles Spurgeon',
    period: '1834-1892',
    category: 'pais-reformadores',
    avatarPlaceholder: '🦁',
    description: 'Conhecido universalmente como "O Príncipe dos Pregadores". Apesar de lutar bravamente contra a depressão severa e gota durante a maior parte do seu fecundo ministério no Metropolitan Tabernacle, deixou-nos a chave inabalável da perseverança: a maior arma de um servo vocacionado e cheio do Espírito é manter os olhos fixados exclusivamente em Cristo, e jamais nas efêmeras circunstâncias.'
  },
  {
    id: 'knox',
    name: 'John Knox',
    period: '1514-1572',
    category: 'pais-reformadores',
    avatarPlaceholder: '⚡',
    description: 'O destemido reformador escocês cujo clamor absoluto era: "Dá-me a Escócia ou eu morro!". Era tão temido pela Rainha da Escócia que ela declarava temer mais as orações fervorosas de Knox do que um exército de dez mil soldados em marcha. Knox prova que um homem de joelhos, dobrado em reverência e ardendo no poder do Espírito Santo, é a pessoa mais influente sobre a terra.'
  },

  // Category: Teólogos e Pensadores
  {
    id: 'agostinho',
    name: 'Santo Agostinho',
    period: '354-430',
    category: 'teologos-pensadores',
    avatarPlaceholder: '🕯️',
    description: 'Jovem brilhante que perseguiu avidamente as respostas existenciais nos prazeres carnais e nas filosofias intelectuais vazias de sua época, mas encontrou o sossego perfeito ao render sua erudição ao amor do Pai. Sua célebre frase ecoa transversalmente até hoje: "Fizeste-nos para ti, Senhor, e o nosso coração anda inquieto enquanto não descansar em ti".'
  },
  {
    id: 'atanasio',
    name: 'Atanásio',
    period: '298-373',
    category: 'teologos-pensadores',
    avatarPlaceholder: '🛡️',
    description: 'Conhecido como "O Pai da Ortodoxia" ou "Athanasius contra mundum" (Atanásio contra o mundo). Defendeu bravamente, quase que sozinho frente à heresia ariana que dominava o Império Romano, a divindade coeterna de Cristo. Sofreu exílio implacável repetidas vezes por se recusar terminantemente a comprometer a verdade revelada sobre Quem Jesus realmente é.'
  },
  {
    id: 'edwards',
    name: 'Jonathan Edwards',
    period: '1703-1758',
    category: 'teologos-pensadores',
    avatarPlaceholder: '🕊️',
    description: 'Gênio intelectual norte-americano que ingressou na Universidade de Yale com apenas 13 anos. Edwards tomou a firme decisão divina de usar sua mente prodigiosa e rigor reflexivo para guiar o Grande Despertamento espiritual de sua terra. Ele ensina que a genialidade literária e científica autêntica acha sua cúpula ao se prostrar para conhecer e proclamar as excelências do Criador.'
  },
  {
    id: 'pascal',
    name: 'Blaise Pascal',
    period: '1623-1662',
    category: 'teologos-pensadores',
    avatarPlaceholder: '⚖️',
    description: 'Físico, matemático e filósofo genial que experimentou uma "noite de fogo" extraordinária — um encontro sobrenatural e inesquecível com o Deus de Abraão, Isaque e Jacó. A partir desse dia, passou a argumentar aos céticos que a razão humana tem limites intransponíveis, pois "o coração tem razões que a própria razão desconhece".'
  },
  {
    id: 'cslewis',
    name: 'C.S. Lewis',
    period: '1898-1963',
    category: 'teologos-pensadores',
    avatarPlaceholder: '🦁',
    description: 'Ateu convicto e brilhante acadêmico de Oxford que relutou até se render, admitindo que o cristianismo era a verdade mítica encarnada. Tornou-se um dos maiores e mais influentes defensores e apologistas cristãos do século XX, desmistificando obviedades e mostrando ao mundo cético e intelectual que a fé cristã é perfeitamente digna de confiança, profunda e lógica.'
  },

  // Category: Poder e Avivamento
  {
    id: 'finney',
    name: 'Charles Finney',
    period: '1792-1875',
    category: 'poder-avivamento',
    avatarPlaceholder: '⚡',
    description: 'Advogado articulado e de carreira promissora que experimentou um batismo de amor e poder do Espírito Santo em seu escritório de advocacia. Abandonou as ambições humanas de imediato para pregar o arrependimento nacional. Finney nos ensina que o sucesso profissional secular empalidece totalmente diante do privilégio indescritível de cooperar como instrumento de um avivamento santo conduzido pelo Espírito.'
  },
  {
    id: 'moody',
    name: 'D.L. Moody',
    period: '1837-1899',
    category: 'poder-avivamento',
    avatarPlaceholder: '👟',
    description: 'Humilde e simples vendedor de sapatos sem nenhum tipo de instrução formal ou graduação teológica, mas possuidor de um "sim" irrestrito, total e incondicional ao chamado de Deus. Sua vigorosa trajetória de evangelização internacional prova de maneira perpétua que o Senhor nunca prioriza os já dotados de recursos ou capacidades humanas, mas sim os plenamente disponíveis.'
  },
  {
    id: 'whitefield2',
    name: 'George Whitefield',
    period: '1714-1770',
    category: 'poder-avivamento',
    avatarPlaceholder: '📣',
    description: 'Grandioso pregador itinerante que, servindo-se meramente da assombrosa e potente acústica natural de sua voz, arrebatou multidões de milhares ao ar livre. Sepultado nos Estados Unidos após cruzar o Atlântico repetidas vezes sob o único clamor de seu coração: gastar sua integridade física no altar pelo resgate de almas perdidas.'
  },
  {
    id: 'graham',
    name: 'Billy Graham',
    period: '1918-2018',
    category: 'poder-avivamento',
    avatarPlaceholder: '🎙️',
    description: 'Reconhecido como o "Evangelista do Século". Preegou com amor e determinação a mensagem de cruz a mais de 210 milhões de pessoas ao vivo em grandes estádios e arenas em todo o globo. Apesar de aconselhar chefes de estado e influenciar eras, manteve uma vida de profunda integridade moral, simplicidade financeira e humildade cristã que bradavam mais alto do que sua imensa reputação secular.'
  },

  // Category: Pioneiros das Missões
  {
    id: 'carey',
    name: 'William Carey',
    period: '1761-1834',
    category: 'pioneiros-missoes',
    avatarPlaceholder: '🗺️',
    description: 'Humilde sapateiro inglês de aldeia que fixou um grande planisfério feito de retalhos de couro na parede de sua oficina, chorando e intercedendo diariamente pelas nações pagãs não alcançadas. Partiu para a Índia sob o lema glorioso: "Espere grandes coisas de Deus, tente grandes coisas para Deus". Carey traduziu as Sagradas Escrituras para dezenas de dialetos locais e tornou-se o Pai das Missões Modernas.'
  },
  {
    id: 'taylor',
    name: 'Hudson Taylor',
    period: '1832-1905',
    category: 'pioneiros-missoes',
    avatarPlaceholder: '🏮',
    description: 'Vislumbrador e incansável obreiro que fundou a histórica Missão do Interior da China. Consagrou sua vida e adaptou seus trajes e cultura ao dia a dia dos nativos chineses para alcançá-los com o amor bíblico. Aprendeu e ensinou segredos eternos de prover recursos, legando o princípio áureo: "A obra de Deus, quando realizada no modelo do compasso de Deus, jamais padecerá de provisões financeiras".'
  },
  {
    id: 'livingstone',
    name: 'David Livingstone',
    period: '1813-1873',
    category: 'pioneiros-missoes',
    avatarPlaceholder: '🧭',
    description: 'Médico obstinado e missionário desbravador escocês que passou décadas no interior inexplorado do continente africano combatendo tenazmente o monstruoso comércio escravista local, enquanto espalhava a semente apostólica. Sua famosa prece de vida traduz seu perfil desprendido: "Estou inteiramente disposto a marchar em direção a qualquer lugar, desde que seja estritamente para a frente".'
  },
  {
    id: 'elliot',
    name: 'Jim Elliot',
    period: '1927-1956',
    category: 'pioneiros-missoes',
    avatarPlaceholder: '✈️',
    description: 'Jovem missionário martirizado aos 28 anos de idade nas margens de um rio no Equador pelos índios Huaorani. Seu trágico e dócil sacrifício abriu as comportas para a conversão de toda aquela tribo de guerreiros, inclusive de seus próprios algozes. Deixou-nos uma das maiores máximas da dedicação vocacional: "Não é tolo aquele que dá o que não pode reter, para ganhar o que nunca pode perder".'
  },
  {
    id: 'teresa',
    name: 'Madre Teresa de Calcutá',
    period: '1910-1997',
    category: 'pioneiros-missoes',
    avatarPlaceholder: '🕊️',
    description: 'Fervorosa freira que escolheu como seu lar os esgotos e favelas fétidas de Calcutá, exercendo a compaixão encarnada em favor dos mais miseráveis, rejeitados e agonizantes da terra. Mesmo passando por longos períodos de deserto interior e calados sentimentos de oração, ela seguiu como um raio de luz pura, provando que a fé real sempre se manifesta em humilde amor prático.'
  },
  {
    id: 'yonggicho',
    name: 'Paul Yonggi Cho',
    period: '1936-2021',
    category: 'pioneiros-missoes',
    avatarPlaceholder: '⛪',
    description: 'Pioneiro sul-coreano que após ser desenganado e milagrosamente curado da tuberculose, plantou a icônica Igreja Yoido do Evangelho Pleno em Seul (que se tornou a maior congregação do planeta). Sua vida é uma prova concreta e irrefutável de que a fé, a oração no mistério do Espírito e a implantação estratégica de pequenos grupos em reuniões nos lares são armas capazes de reerguer e regenerar toda uma nação arrasada pela guerra.'
  },

  // Category: Testemunhas e Mártires
  {
    id: 'bunyan',
    name: 'John Bunyan',
    period: '1628-1688',
    category: 'testemunhas-martires',
    avatarPlaceholder: '🧱',
    description: 'Humilde caldeireiro e pregador puritano que foi encarcerado em uma masmorra úmida de Bedford por doze longos anos por recusar-se a interromper sua obra de pregação pública ao ar livre. Recusando render o Espírito das Escrituras em troca de liberdade externa, utilizou a prisão como púlpito de papel escrevendo a obra literária "O Peregrino" — mostrando que a suprema liberdade reside em ter a alma cativa e guardada por Jesus.'
  },
  {
    id: 'bonhoeffer',
    name: 'Dietrich Bonhoeffer',
    period: '1906-1945',
    category: 'testemunhas-martires',
    avatarPlaceholder: '👓',
    description: 'Brilhante jovem pastor, teólogo e líder engajado da Igreja Confessante na Alemanha nazista que preferiu arcar com as últimas consequências do discipulado radical — sofrendo a morte por enforcamento no campo de concentração de Flossenbürg — a dobrar os joelhos ou calar sua voz ante a tirania do Terceiro Reich. Ele imortalizou que quando Cristo convoca um homem para segui-Lo, Ele o convida a morrer para si.'
  },
  {
    id: 'tenboom2',
    name: 'Corrie ten Boom',
    period: '1892-1983',
    category: 'testemunhas-martires',
    avatarPlaceholder: '🔑',
    description: 'Humilde relojoeira holandesa que juntamente com sua família escondeu corajosamente centenas de judeus perseguidos nas paredes de sua oficina em Haarlem. Sofreu torturas físicas e internamento no letal campo nazista de Ravensbrück. Sobreviveu milagrosamente sob um chamado mundial: espalhar que Cristo perdoa e que nenhuma escuridão ou ódio é superior à infinita e restauradora graça redentora de Deus.'
  },
  {
    id: 'policarpo',
    name: 'Polycarp',
    period: '69-155',
    category: 'testemunhas-martires',
    avatarPlaceholder: '🔥',
    description: 'Discípulo direto do Apóstolo João e bispo da igreja de Esmirna. Sofrendo ameaça de morte em idade avançada por parte do procônsul romano, foi amarrado na fogueira para ser queimado vivo por recusar-se categoricamente a blasfemar contra seu Rei. Sua última exclamação pública de amor nos comove até hoje: "Eu O sirvo por oitenta e seis anos, e Ele nunca me fez qualquer mal. Como eu poderia blasfemar contra o meu Rei e Salvador?".'
  },
  {
    id: 'cranmer',
    name: 'Thomas Cranmer',
    period: '1489-1556',
    category: 'testemunhas-martires',
    avatarPlaceholder: '✊',
    description: 'Arcebispo reformador inglês da Cantuária. Durante momentos terríveis de extrema pressão mental e medo de martírio sob a rainha católica Maria I, fraquejou e assinou uma declaração pública de retratação de suas crenças protestantes. Contudo, ao ser levado à fogueira pública, recuperou a ousadia, colocou a mão que havia assinado o deslize no coração do fogo primeiro, exclamando arrependido e determinado: "Esta mão indigna arderá antes!".'
  },

  // Category: Pastores e Mestres
  {
    id: 'calvino-mestre',
    name: 'João Calvino (Zelo Pastoral)',
    period: '1509-1564',
    category: 'pastores-mestres',
    avatarPlaceholder: '🥖',
    description: 'Representando o ideal nobre do pastor-mestre erudito. Além de escrever a monumental obra das Institutas, Calvino pregava diariamente em Genebra expondo meticulosamente as Escrituras versículo por versículo. Sua vida ensina que a instrução teológica acadêmica e as disciplinas intelectuais profundas se destinam acima de tudo a gerar temor prático do Senhor, edificação da comunidade local e assistência dócil aos necessitados.'
  },
  {
    id: 'stott',
    name: 'John Stott',
    period: '1921-2011',
    category: 'pastores-mestres',
    avatarPlaceholder: '🕊️',
    description: 'Teólogo anglicano brilhante e autor monumental do Pacto de Lausanne, que consagrou toda sua existência a ensinar sobre a necessidade essencial da igreja reconciliar a sã doutrina bíblica ortodoxa à justiça social operosa e amor prático ao próximo. Conduziu dezenas de pastores pelo mundo sob o ideal da pregação em "dupla escuta" — ouvindo atenta e incansavelmente tanto a verdade eterna da Palavra quanto os clamores dolorosos do mundo contemporâneo.'
  },
  {
    id: 'hodge',
    name: 'Charles Hodge',
    period: '1797-1878',
    category: 'pastores-mestres',
    avatarPlaceholder: '🛡️',
    description: 'Notável e emblemático mestre teológico que lecionou no Seminário de Princeton por mais de meio século, instruindo pessoalmente mais de três mil pastores no amor indestrutível à autenticidade insubstituível das Escrituras. Hodge defendeu as sãs verdades bíblicas frente aos ventos de doutrina e modismos racionalistas de seu século com imensa classe e robusta precisão acadêmica.'
  },
  {
    id: 'lloydjones',
    name: 'Martyn Lloyd-Jones',
    period: '1899-1981',
    category: 'pastores-mestres',
    avatarPlaceholder: '🩺',
    description: 'Emblemático médico que no alvorecer de uma promissora e brilhante carreira clínica na realeza britânica, aceitou o doce arrebatamento do chamado do Senhor das almas, abandonando os jalecos humanos para consagrar-se à pregação dogmática em Westminster. Conhecido afetuosamente como "O Doutor", defendia que a verdadeira exposição homilética nada mais é do que: "A lógica pegando fogo através do revestimento ardente do Espírito Santo".'
  },
  {
    id: 'sproul',
    name: 'R.C. Sproul',
    period: '1939-2017',
    category: 'pastores-mestres',
    avatarPlaceholder: '🦁',
    description: 'Pastoreador e mestre carismático que consagrou sua formidável vida a despertar a mente das pessoas em relação à majestade suprema e santidade absoluta de Deus. Com analogias cativantes e zelo brilhante, Sproul ensinou incansavelmente que fomos criados para adorar e conhecer o Senhor em sua fascinante e transcendente perfeição moral: "O Deus Trino é santo, santo, santo!".'
  },

  // Category: Avivamento e Santidade
  {
    id: 'muller',
    name: 'George Müller',
    period: '1805-1898',
    category: 'avivamento-santidade',
    avatarPlaceholder: '🏘️',
    description: 'Rebelde e astuto ladrazinho na adolescência que foi transformado em um colosso da fé no Espírito Santo. Pelo poder soberano da oração incessante em secreto e sem nunca requisitar nenhum tostão ou doação a qualquer pessoa, acolheu e supriu com generosidade total e alimentação diária mais de 10.000 crianças órfãs inglesas. Müller demonstrou empiricamente que o Pai Celeste é de fato digno de confiança integral.'
  },
  {
    id: 'murray',
    name: 'Andrew Murray',
    period: '1828-1917',
    category: 'avivamento-santidade',
    avatarPlaceholder: '🍷',
    description: 'Pastor, mestre espiritual e fecundo escritor sul-africano cujo coração ardia continuamente em ensinar as profundezas teológicas da "vida de oração", da dependência do Espírito e do "viver em Cristo". Seus ricos textos devocionais e edificações literárias seguiram orientando centenas de líderes de avivamento a extraírem suas místicas forças espirituais a partir do altar silencioso do Secreto.'
  },
  {
    id: 'booth',
    name: 'William Booth',
    period: '1829-1912',
    category: 'avivamento-santidade',
    avatarPlaceholder: '🎺',
    description: 'Arrojado fundador da corporação de caridade e proclamação "Exército de Salvação". Trazendo do próprio trono divino o firme lema "Sopa, Sabão e Salvação", resgatou os mais marginalizados da sociedade londrina e necessitados nas calçadas frias do submundo. Ensinava que pregar a plenitude do Evangelho consiste em alimentar o corpo faminto e vestir o nu com a mesma paixão com que oramos pela conversão da sua alma.'
  },
  {
    id: 'nee',
    name: 'Watchman Nee',
    period: '1903-1972',
    category: 'avivamento-santidade',
    avatarPlaceholder: '🔐',
    description: 'Líder de igrejas domésticas chinesas livres que passou os últimos vinte anos de sua riquíssima existência aprisionado e submetido a severos trabalhos forçados por se recusar a desviar suas verdades morais em favor de regimes ideológicos terrenos terrestres. Deixou-nos obras-primas da maturidade espiritual escritas a partir da provação íntima profunda, ensinando que a divina força do Espírito unicamente opera na nossa doçura e fraqueza capituladas.'
  },
  {
    id: 'paton',
    name: 'John G. Paton',
    period: '1824-1907',
    category: 'avivamento-santidade',
    avatarPlaceholder: '🌴',
    description: 'Heroico missionário pioneiro nas ilhas canibais do Pacífico Sul de Vanuatu. Sofreu a perda dolorosa de sua esposa e recém-nascido, enterrando-os à beira da selva hostil. Paton não retrocedeu perante as ameaças à sua vida; sua confiança e amor incondicionais aos indomáveis nativos venceram, culminando na docilização, cura social e arrependimento de comunidades tribais inteiras pelo poder da Palavra Viva.'
  },

  // Category: Para os Nossos Dias
  {
    id: 'aimee',
    name: 'Aimee Semple McPherson',
    period: '1890-1944',
    category: 'nossos-dias',
    avatarPlaceholder: '🕊️',
    description: 'Arrojada pioneira cristã pentecostal e desbravadora das transmissões radiofônicas nos Estados Unidos. Desafiou rigorosas convenções misóginas e sociais de sua época para erguer canais e púlpitos modernos dedicados a pregar o glorioso "Evangelho Quadrangular". Aimee demonstrou de maneira indubitável que o Espírito Santo não faz distinção de gênero quando deseja de mover com prodígios, amor e curas divinas.'
  },
  {
    id: 'piper',
    name: 'John Piper',
    period: '1946-',
    category: 'nossos-dias',
    avatarPlaceholder: '💎',
    description: 'Inspirador escritor e pastor norte-americano que reacendeu na presente geração global a paixão inestimável pela soberania santa e beleza arrebatadora do Senhor através do conceito do "Hedonismo Cristão". Piper nos desafia firmemente com uma tese central transformadora: "Deus é mais glorificado em nós quando estamos genuinamente mais satisfeitos e saciados n\'Ele".'
  },
  {
    id: 'nick',
    name: 'Nick Vujicic',
    period: '1982-',
    category: 'nossos-dias',
    avatarPlaceholder: '❤️',
    description: 'Nascido com a severa e rara síndrome de tetra-amelia (ausência completa de todos os quatro membros), mas dotado pelo Espírito Santo de um sorriso e fé vitoriosa inabaláveis. Nick prega a milhões em arenas lotadas em todo o planeta que as limitações carnais não dão cabo do belo propósito celestial de nossa vida; em Deus, a nossa verdadeira alegria e restauração interior são uma livre escolha de graça.'
  },
  {
    id: 'yun',
    name: 'Irmão Yun',
    period: '1958-',
    category: 'nossos-dias',
    avatarPlaceholder: '🇨🇳',
    description: 'Conhecido amplamente como "O Homem Celestial" devido à sua milagrosa e lendária fuga de uma prisão de segurança máxima trancada na China comunista por pregar a Palavra. Yun passou por torturas excruciantes e longas greves de fome em favor das igrejas subterrâneas chinesas, nos lembrando que o Evangelho que portamos nos custa a vida e exige devoção incondicional.'
  },
  {
    id: 'chan',
    name: 'Francis Chan',
    period: '1967-',
    category: 'nossos-dias',
    avatarPlaceholder: '🕯️',
    description: 'Fervoroso pastor, pregador e autor influente que renunciou deliberadamente ao topo do corporativismo de mega-igrejas norte-americanas para vivenciar comunidades simples, multiplicadoras, unidas nos lares e cheias do Espírito Santo. Chan sacode insistentemente o cristianismo nominal contemporâneo, desafiando a juventude a se arrepender das vaidades para correr de volta à pureza sincera da Igreja Primitiva do Novo Testamento.'
  }
];

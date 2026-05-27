/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ebook } from '../types';

export const DESPERTAR_EBOOKS: Ebook[] = [
  {
    id: 'propisito',
    title: 'Meu Propósito',
    subtitle: 'Alinhando nossa existência com a Vontade Soberana',
    author: 'Equipe Despertar',
    description: 'Encontre o rumo de sua alma através de uma jornada de autoconhecimento bíblico. Saia do piloto automático e descubra o encargo que queima no coração do Pai para a sua vida ordinária.',
    isPremium: false, // FREE
    chapters: [
      {
        title: 'Capítulo 1: O esvaziamento das falsas ambições',
        estimatedReadTime: 6,
        content: `O primeiro passo para caminhar no seu verdadeiro propósito não é acumular metas, mas sim esvaziar-se dos ruídos das ambições alheias. Muitas vezes corremos intensamente apenas para alcançar troféus que outras pessoas desenharam para nós. No deserto espiritual do "Despertar", Deus nos convida a abrir as mãos, solto o controle e fazer uma simples pergunta: "Senhor, quem sou eu na Tua presença, longe das minhas vaidades?".

O propósito bíblico não é uma carreira de sucesso terreno; é uma vida posta a serviço da manifestação do amor de Jesus nos cantos ordinários e poeirentos do cotidiano. É ali que sua caminhada de fé começa a respirar fundo.`
      },
      {
        title: 'Capítulo 2: A unção do servir oculto',
        estimatedReadTime: 7,
        content: `Toda grande árvore tem raízes profundas que ninguém vê sob a terra fria. Queremos a copa frondosa dos palcos e das luzes, mas o caráter do Reino de Deus é moldado nas tarefas ordinárias e silenciosas que não atraem aplausos. Quando servimos de coração limpo, sem o vício das métricas de vaidade, somos libertados do cativeiro da aprovação humana e estabelecidos na sólida rocha do sossego paternal.`
      },
      {
        title: 'Capítulo 3: O altar das pequenas obediências',
        estimatedReadTime: 5,
        content: `Muitos esperam um grande chamado sonoro vindo de nuvens, enquanto negligenciam o telefonema ao idoso solitário, a reconciliação com o irmão, ou o capricho honesto com a planilha de Excel no trabalho. O propósito se vive no varejo da vida. É em cada sim silencioso e pequeno dado às inspirações do Espírito que o perfume do banquete se espalha.`
      }
    ]
  },
  {
    id: 'familia',
    title: 'Minha Família',
    subtitle: 'Edificando um santuário de cura e carinho',
    author: 'Pastor Despertar',
    description: 'A mesa posta da graça em casa. Aprenda a transformar o seu lar em um lugar seguro de aceitação mútua e curas emocionais, longe de legalismos e discussões exaustivas.',
    isPremium: false, // FREE
    chapters: [
      {
        title: 'Capítulo 1: O lar como espaço de asilo',
        estimatedReadTime: 6,
        content: `Nossa casa deve ser o local onde tiramos a armadura de guerra. No entanto, muitas vezes ela é transformada em um tribunal cansativo onde as falhas são anotadas e os julgamentos são rápidos. Redescobrir o altar doméstico significa restabelecer o abraço sincero, a desculpa sincera e o pão partilhado. 

Quando sua família descobre que pode falhar em casa e ainda assim ser amada e acolhida com óleo curador, estabelece-se ali o verdadeiro aroma da graça compassiva do Pai.`
      },
      {
        title: 'Capítulo 2: O altar do diálogo vulnerável',
        estimatedReadTime: 8,
        content: `Lars saudáveis não são construídos com a mentira de que nunca brigamos, mas sim com a honestidade reconstrutora de pedir perdão e sentar para escutar as mágoas mútuas com simpatia real. Desligue a TV, coloque as pendências de lado, olhe fundo nos olhos sob a mesa de jantar e faça o convite: "Eu quero te ouvir de verdade". É ali que as feridas secam e o amor se renova profunda e sinceramente.`
      }
    ]
  },
  {
    id: 'negocio',
    title: 'Meu Negócio',
    subtitle: 'Empreendedorismo como Liturgia e Trabalho Sagrado',
    author: 'Equipe Despertar',
    description: 'Alinhando seus empreendimentos com a ética e a justiça do Reino. Como liderar negócios com foco humano, integridade inabalável e compaixão em cada decisão corporativa.',
    isPremium: true, // PREMIUM
    chapters: [
      {
        title: 'Capítulo 1: O chamado sacerdotal dos negócios',
        estimatedReadTime: 10,
        content: `Os negócios não servem apenas para pagar contas ou inflar contas bancárias de acionistas frios. Seu empreendimento é um espaço sagrado de transformação coletiva. Suas planilhas, contratações, fornecedores e clientes são o altar onde a semente do caráter de Cristo é lançada ao mundo comercial todos os dias.`
      },
      {
        title: 'Capítulo 2: Liderança contemplativa em mercado volátil',
        estimatedReadTime: 9,
        content: `Em um ecossistema econômico histérico, o líder Despertar responde com a solidez de uma mente ancorada na confiança eterna. Liderar com calma é ser o centro de gravidade tranquila enquanto a equipe racha sob estresse.`
      }
    ]
  },
  {
    id: 'carreira',
    title: 'Minha Carreira',
    subtitle: 'Encontrando o descanso em meio às pressões do mercado',
    author: 'Equipe Despertar',
    description: 'Um guia emocional para profissionais cansados. Descubra como progredir profissionalmente sem queimar a mente (burnout) e sem vender sua paz interior em troca de aplausos corporativos.',
    isPremium: true, // PREMIUM
    chapters: [
      {
        title: 'Capítulo 1: A ilusão do status quo comercial',
        estimatedReadTime: 8,
        content: `Sua carreira é o que você faz, não quem você é na sua essência íntima. Quando confundimos nosso crachá com nossa identidade filial divina, entregamos nossa alma à neurose do desempenho frenético. Aprenda a fechar o notebook sem culpa amorosa e sintonize com sua real dignidade.`
      },
      {
        title: 'Capítulo 2: Limites emocionais e ética nas relações',
        estimatedReadTime: 8,
        content: `Dizer não com serenidade é uma oração contemplativa. Saiba impor fronteiras de refrigério na sua agenda profissional, sabendo que o Senhor que sustenta as galáxias zela pela sua saúde integral enquanto você dorme tranquilo.`
      }
    ]
  }
];

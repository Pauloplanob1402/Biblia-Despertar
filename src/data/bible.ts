/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BibleBook } from '../types';

export const BIBLE_BOOKS: BibleBook[] = [
  {
    id: 'salmos',
    name: 'Salmos',
    category: 'Velho Testamento',
    chapters: {
      23: [
        { chapter: 23, number: 1, text: "O SENHOR é o meu pastor, nada me faltará." },
        { chapter: 23, number: 2, text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas." },
        { chapter: 23, number: 3, text: "Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome." },
        { chapter: 23, number: 4, text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam." },
        { chapter: 23, number: 5, text: "Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda." },
        { chapter: 23, number: 6, text: "Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias." }
      ],
      46: [
        { chapter: 46, number: 1, text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia." },
        { chapter: 46, number: 2, text: "Portanto não temeremos, ainda que a terra se mude, e ainda que os montes se transportem para o meio dos mares." },
        { chapter: 46, number: 3, text: "Ainda que as águas rujam e se perturbem, ainda que os montes se abalem pela sua braveza." },
        { chapter: 46, number: 4, text: "Há um rio cujas correntes alegram a cidade de Deus, o santuário das moradas do Altíssimo." },
        { chapter: 46, number: 5, text: "Deus está no meio dela; não será abalada. Deus a ajudará, já ao romper da manhã." },
        { chapter: 46, number: 10, text: "Aquietai-vos, e sabei que eu sou Deus; serei exaltado entre os gentios; serei exaltado sobre a terra." },
        { chapter: 46, number: 11, text: "O Senhor dos Exércitos está conosco; o Deus de Jacó é o nosso refúgio." }
      ],
      139: [
        { chapter: 139, number: 1, text: "Senhor, tu me sondaste, e me conheces." },
        { chapter: 139, number: 2, text: "Tu sabes o meu assentar e o meu levantar; de longe entendes o meu pensamento." },
        { chapter: 139, number: 3, text: "Cercas o meu andar, e o meu deitar; e conheces todos os meus caminhos." },
        { chapter: 139, number: 4, text: "Sem que haja uma palavra na minha língua, eis que, ó Senhor, tudo conheces." },
        { chapter: 139, number: 5, text: "Tu me cercaste por detrás e por diante, e puseste sobre mim a tua mão." },
        { chapter: 139, number: 6, text: "Tal ciência é para mim maravilhosa; tão alta que não a posso atingir." },
        { chapter: 139, number: 7, text: "Para onde me irei do teu espírito, ou para onde fugirei da tua face?" },
        { chapter: 139, number: 8, text: "Se subir ao céu, lá tu estás; se fizer no inferno a minha cama, eis que tu ali estás também." }
      ]
    }
  },
  {
    id: 'isaias',
    name: 'Isaías',
    category: 'Velho Testamento',
    chapters: {
      30: [
        { chapter: 30, number: 15, text: "Porque assim diz o Senhor Deus, o Santo de Israel: Em vos converterdes e em repousardes estaria a vossa salvação; no sossego e na confiança estaria a vossa força, mas não quisestes." },
        { chapter: 30, number: 18, text: "E, portanto, o Senhor esperará, para ter misericórdia de vós; e por isso se levantará, para se compadecer de vós, porque o Senhor é um Deus de equidade; bem-aventurados todos os que nele esperam." }
      ],
      40: [
        { chapter: 40, number: 29, text: "Dá força ao cansado, e multiplica as forças ao que não tem nenhum vigor." },
        { chapter: 40, number: 30, text: "Os jovens se cansarão e se fatigarão, e os moços certamente cairão;" },
        { chapter: 40, number: 31, text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão." }
      ]
    }
  },
  {
    id: 'joao',
    name: 'João',
    category: 'Novo Testamento',
    chapters: {
      1: [
        { chapter: 1, number: 1, text: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." },
        { chapter: 1, number: 2, text: "Ele estava no princípio com Deus." },
        { chapter: 1, number: 3, text: "Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez." },
        { chapter: 1, number: 4, text: "Nele estava a vida, e a vida era a luz dos homens." },
        { chapter: 1, number: 5, text: "And the light shineth in darkness; e as trevas não a compreenderam." },
        { chapter: 1, number: 9, text: "Ali estava a luz verdadeira, que alumia a todo o homem que vem ao mundo." },
        { chapter: 1, number: 14, text: "E o Verbo se fez carne, e habitou entre nós, e vimos a sua glória, como a glória do unigênito do Pai, cheio de graça e de verdade." }
      ],
      15: [
        { chapter: 15, number: 1, text: "Eu sou la videira verdadeira, e meu Pai é o lavrador." },
        { chapter: 15, number: 4, text: "Estai em mim, e eu em vós; como a vara de si mesma não pode dar fruto, se não estiver na videira, assim também vós, se não estiverdes em mim." },
        { chapter: 15, number: 5, text: "Eu sou a videira, vós as varas; quem está em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer." },
        { chapter: 15, number: 9, text: "Como o Pai me amou, também eu vos amei a vós; permanecei no meu amor." },
        { chapter: 15, number: 11, text: "Tenho-vos dito isto, para que o meu gozo permaneça em vós, e o vosso gozo seja completo." },
        { chapter: 15, number: 12, text: "O meu mandamento é este: Que vos ameis uns aos outros, assim como eu vos amei." }
      ]
    }
  },
  {
    id: 'romanos',
    name: 'Romanos',
    category: 'Novo Testamento',
    chapters: {
      8: [
        { chapter: 8, number: 1, text: "Portanto, agora nenhuma condenação há para os que estão em Cristo Jesus, que não andam segundo a carne, mas segundo o Espírito." },
        { chapter: 8, number: 14, text: "Porque todos os que são guiados pelo Espírito de Deus, esses são filhos de Deus." },
        { chapter: 8, number: 28, text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito." },
        { chapter: 8, number: 38, text: "Porque estou certo de que, nem a morte, ni a vida, nem os anjos, nem os principados, nem as potências, nem as coisas do presente, nem as do porvir," },
        { chapter: 8, number: 39, text: "Nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus nosso Senhor." }
      ]
    }
  }
];

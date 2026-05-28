/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DESPERTAR_PROFILES } from '../data/profiles';
import { SpiritualIdentity } from '../types';
import { Compass, BookOpen, RotateCcw, Feather, Send, Heart, Coffee, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileSelectorProps {
  currentIdentityId: string | null;
  onSelectIdentity: (id: string, answers: { [key: string]: string }) => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    text: 'Quando alguém se aproxima de você machucado… o que acontece naturalmente?',
    reaction: '“Algumas pessoas fazem os outros se sentirem vistos pela primeira vez.”',
    options: [
      { text: 'Eu conecto essa pessoa com alguém que pode ajudá-la.', profileId: 'conector,semeador' },
      { text: 'Eu me aproximo imediatamente e tento fazer algo.', profileId: 'ativador,faisca' },
      { text: 'Eu escuto sem pressionar a pessoa a parecer forte.', profileId: 'guardiao,intercessor' },
      { text: 'Eu faço perguntas que normalmente ninguém teria coragem de fazer.', profileId: 'questionador,profeta,honesto' }
    ]
  },
  {
    id: 'q2',
    text: 'Qual destas frases parece ter sido escrita para você?',
    reaction: '“Talvez existam outros caminhantes carregando exatamente isso.”',
    options: [
      { text: '“Algo precisa começar — mesmo que ninguém veja ainda.”', profileId: 'semeador,ativador' },
      { text: '“Não consigo fingir que está tudo bem quando não está.”', profileId: 'honesto,profeta' },
      { text: '“Ainda tenho perguntas. E talvez isso não seja um problema.”', profileId: 'investigador,questionador' },
      { text: '“Quando amo alguém, permaneço.”', profileId: 'guardiao,fiel,intercessor' }
    ]
  },
  {
    id: 'q3',
    text: 'O que mais mexe com você no evangelho?',
    reaction: '“Você não precisa se parecer com outra pessoa para pertencer.”',
    options: [
      { text: 'O fato de Jesus ter chamado pessoas improváveis.', profileId: 'restaurador,honesto' },
      { text: 'O fato de Jesus transformar pessoas comuns em movimento.', profileId: 'faisca,ativador' },
      { text: 'O fato de Jesus sentar à mesa com quem ninguém queria.', profileId: 'conector,guardiao,intercessor' },
      { text: 'O fato de Jesus nunca fugir das perguntas difíceis.', profileId: 'questionador,investigador,profeta' }
    ]
  },
  {
    id: 'q4',
    text: 'Se você criasse uma Mesa hoje… como ela seria?',
    reaction: '“Talvez a próxima conversa importante da sua vida ainda nem aconteceu.”',
    options: [
      { text: 'Uma mesa para pessoas cansadas reaprenderem a respirar.', profileId: 'guardiao,intercessor,fiel' },
      { text: 'Uma mesa para conversas honestas sem respostas prontas.', profileId: 'investigador,honesto,questionador' },
      { text: 'Uma mesa para conectar pessoas e criar amizades reais.', profileId: 'conector,semeador' },
      { text: 'Uma mesa para começar algo novo na cidade.', profileId: 'semeador,ativador,faisca' }
    ]
  },
  {
    id: 'q5',
    text: 'O que você sente que Deus mais tem feito em você ultimamente?',
    reaction: '“Jesus nunca chamou pessoas prontas.\nChamou pessoas reais.”',
    options: [
      { text: 'Me ensinando a permanecer.', profileId: 'fiel,guardiao' },
      { text: 'Me ensinando a recomeçar sem vergonha.', profileId: 'restaurador,conector' },
      { text: 'Me ensinando a transformar inquietação em ação.', profileId: 'ativador,faisca,profeta' },
      { text: 'Me ensinando que dúvida honesta também pode aproximar.', profileId: 'investigador,questionador,honesto' }
    ]
  }
];

const PLURAL_NAMES: { [key: string]: string } = {
  conector: 'Conectores',
  faisca: 'Faíscas',
  guardiao: 'Guardiões',
  profeta: 'Profetas',
  questionador: 'Questionadores',
  honesto: 'Honestos',
  restaurado: 'Restaurados',
  investigador: 'Investigadores',
  fiel: 'Fiéis',
  intercessor: 'Intercessores',
  ativador: 'Ativadores',
  semeador: 'Semeadores'
};

const PROFILE_NARRATIVES: { [key: string]: string } = {
  conector: "Você percebe o potencial secreto nas pessoas.\nSabe criar conexões raras, aproximar quem está isolado e encurtar distâncias com um simples convite para tomar um café.\n\nAndré também era assim.\n\nTalvez o evangelho que você carrega não precise de palcos ou grandes discursos. Ele se revela na mesa, ligando corações à graça espontânea e unindo pontes preciosas.",
  faisca: "Você sente tudo intensamente.\n\nQuando acredita, mergulha.\nQuando cai, levanta.\nQuando vê algo vivo, quer de imediato puxar mais gente para dançar ou orar por perto.\n\nPedro também era assim.\n\nTalvez Deus nunca tenha pedido que você fosse impecável. Ele sabe que sua espontaneidade aquece o ambiente, ensinando você a perseverar em sua busca.",
  guardiao: "Você ama de maneira mansa e inabalável.\nÉ aquela presença serena que permanece de pé ao pé da cruz quando todos já bateram retirada, guardando corações de forma fiel.\n\nJoão também era assim.\n\nTalvez a sua maior vocação não seja preencher espaços barulhentos, mas sim ser o abraço seguro onde almas fatigadas podem simplesmente se desarmar.",
  profeta: "Você enxerga através das mentiras e aparências religiosas.\nDiz em voz alta com coragem amorosa o que todos estão sentindo na alma mas ninguém tem bravura para assumir ou denunciar.\n\nTiago também era assim.\n\nNo Despertar, sua integridade não prega condenação agressiva, mas sim uma verdade restauradora que remove o peso das exigências vazias.",
  questionador: "Você carrega perguntas honestas no fundo do peito.\nNão se conforma com silêncios frios ou discursos pré-fabricados. Sabe que as dúvidas autênticas abrem caminhos de aprendizado real.\n\nFilipe também era assim.\n\nNão tenha medo das suas indagações sinceras. Elas são o portal precioso que faz desabar as velhas muralhas institucionais e aproxima você do Pai.",
  honesto: "Você detesta encenações teatrais e ritos frios.\nApresenta-se desarmado exatamente como é, preferindo a nudez da sinceridade a qualquer performance bem-sucedida.\n\nNatanael também era assim.\n\nSua total recusa em desempenhar personagens cria uma zona de segurança espontânea que liberta outras pessoas ao seu redor de suas próprias máscaras.",
  restaurado: "Você conhece o gosto doce do resgate imerecido.\nSabe que o Mestre senta para lanchar antes das correções morais e que a comunhão da graça suspende qualquer acusação.\n\nMateus também era assim.\n\nVocê é a prova límpida e pulsante de que ninguém está longe demais do afeto reconciliador, e que o perdão reconstrói sobre ruínas.",
  investigador: "Você caminha pela necessidade de profundidade e solidez.\nDeseja apalpar a verdade viva nas Escrituras, meditando e analisando sem pressões ou pânico intelectual.\n\nTomé também era assim.\n\nOs seus questionamentos não te afastam do Eterno; pelo contrário, são a gestação de uma das confissões de fé mais monumental dos Evangelhos.",
  fiel: "Você sustenta a caminhada no silêncio dos bastidores.\nSua presença contínua, humilde e firme apoia a mesa comum sem necessitar de holofotes ou aclamação pública.\n\nTiago filho de Alfeu também era assim.\n\nA beleza mansa do seu servir secreto é o que mantém a comunidade unida, revelando que a consistência invisível é o que consolida o Reino.",
  intercessor: "Você tem a alma sensível para ler os fardos invisíveis alheios.\nCarrega as dores de amigos silenciosamente diante do altar divino, orando por paz antes mesmo que eles desabafem.\n\nTadeu também era assim.\n\nSua intercessão terna age sob o secreto, servindo de sustentáculo silencioso e seguro para aliviar a exaustão das amizades.",
  ativador: "Você carrega um ardor pacífico para movimentar as vidas.\nNão tolera a inércia fria das rotinas burocráticas e convoca todos de maneira entusiasmada à ação sincera.\n\nSimão Zelote também era assim.\n\nVocê descobriu que a revolução espiritual mais cortante acontece no coração e move corpos na direção de abraçar o mundo ferido.",
  semeador: "Você planta no escuro rústico da sementeira.\nInicia mesas onde não havia nada, cuidando do solo e da boa semente sem exigir colheitas imediatas ou aplausos do público.\n\nPaulo pioneiro também era assim.\n\nSua coragem simples confia no vigor interno da semente que crescerá no silêncio e no tempo de Deus."
};

export default function ProfileSelector({ currentIdentityId, onSelectIdentity }: ProfileSelectorProps) {
  const [activeTab, setActiveTab] = useState<'quiz' | 'catalog'>('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  
  // Selection/reaction workflow states
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showReaction, setShowReaction] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [quizResult, setQuizResult] = useState<SpiritualIdentity | null>(
    currentIdentityId ? DESPERTAR_PROFILES.find(p => p.id === currentIdentityId) || null : null
  );
  
  // Catalog selection detail state
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(DESPERTAR_PROFILES[0].id);

  const handleOptionSelect = (index: number) => {
    setSelectedOptionIndex(index);
    setShowReaction(true);
  };

  const handleContinue = () => {
    if (selectedOptionIndex === null) return;

    const opSelected = QUIZ_QUESTIONS[currentQuestionIndex].options[selectedOptionIndex];
    const questionId = QUIZ_QUESTIONS[currentQuestionIndex].id;
    const newAnswers = { ...answers, [questionId]: opSelected.profileId };
    setAnswers(newAnswers);

    // Reset reaction states for next step
    setShowReaction(false);
    setSelectedOptionIndex(null);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Trigger pre-calculation transition
      setIsCalculating(true);
      
      const timer = setTimeout(() => {
        // Calculate dominant profile using points system for the 12 disciples
        const scores: { [key: string]: number } = {
          conector: 0,
          faisca: 0,
          guardiao: 0,
          profeta: 0,
          questionador: 0,
          honesto: 0,
          restaurado: 0,
          investigador: 0,
          fiel: 0,
          intercessor: 0,
          ativador: 0,
          semeador: 0
        };

        Object.values(newAnswers).forEach((val) => {
          const ids = (val as string).split(',');
          ids.forEach((id) => {
            if (id in scores) {
              scores[id] += 2; // Selected gets higher score weights
            }
          });
        });

        // Find profile with maximum points
        let maxId = 'conector';
        let maxCount = -1;
        Object.entries(scores).forEach(([id, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxId = id;
          }
        });

        const matchedProfile = DESPERTAR_PROFILES.find(p => p.id === maxId) || DESPERTAR_PROFILES[0];
        setQuizResult(matchedProfile);
        setIsCalculating(false);
        onSelectIdentity(matchedProfile.id, newAnswers);
      }, 2800);

      return () => clearTimeout(timer);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setShowReaction(false);
    setIsCalculating(false);
    setQuizResult(null);
    setActiveTab('quiz');
  };

  const handleShare = (profileName: string) => {
    const textToCopy = `Pensei em você. Acabei de descobrir o meu jeito de caminhar com Deus no espaço O Despertar. Senti que meu coração bate muito parecido com a história de "${profileName}". Acho que você também se encontraria lá. Puxa uma cadeira e senta comigo nessa mesa? Veja qual história se parece com a sua em: ${window.location.origin}`;
    navigator.clipboard.writeText(textToCopy);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const navigateToSection = (section: string) => {
    window.dispatchEvent(new CustomEvent('change-section', { detail: section }));
  };

  const triggerCreateMesa = () => {
    window.dispatchEvent(new CustomEvent('change-section', { detail: 'mesas' }));
    // Wait briefly for transit animation then trigger open modal
    setTimeout(() => {
      window.dispatchEvent(new Event('open-create-mesa'));
    }, 150);
  };

  const selectedViewedProfile = DESPERTAR_PROFILES.find(p => p.id === viewedProfileId) || DESPERTAR_PROFILES[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab bar */}
      <div className="flex bg-stone-100 rounded-2xl p-1.5 max-w-sm mx-auto shadow-inner">
        <button
          id="tab-quiz"
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'quiz' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Compass size={14} />
          <span>Descobrir Minha Identidade</span>
        </button>
        <button
          id="tab-catalog"
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'catalog' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen size={14} />
          <span>Os 12 Perfis</span>
        </button>
      </div>

      {activeTab === 'quiz' ? (
        <div id="quiz-workspace" className="max-w-2xl mx-auto">
          {isCalculating ? (
            /* Timed transition screen */
            <div className="bg-white/95 border border-stone-200/50 rounded-3xl p-10 md:p-14 shadow-md text-center space-y-8 min-h-[400px] flex flex-col justify-center items-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-[#C08261] rounded-full animate-spin"></div>
              </div>
              <div className="space-y-6 max-w-md">
                <span className="text-[11px] uppercase tracking-widest font-mono text-stone-400 font-bold">
                  Enquanto calculamos seu caminho…
                </span>
                <p className="font-serif text-lg md:text-xl text-stone-700 leading-relaxed italic">
                  Talvez o mais bonito não seja descobrir quem você é.<br />
                  Talvez seja descobrir que existem outros como você.
                </p>
                <div className="text-xs text-stone-500 space-y-1 font-light leading-relaxed">
                  <p>Pessoas criando Mesas.</p>
                  <p>Conversas.</p>
                  <p>Recomeços.</p>
                  <p>Vida após vida.</p>
                </div>
              </div>
            </div>
          ) : !quizResult ? (
            /* Quiz questions workflow */
            <div className="bg-white/90 border border-stone-200/50 rounded-3xl p-8 shadow-md relative overflow-hidden">
              {/* Introduction header only on question 1 */}
              {currentQuestionIndex === 0 && !showReaction && (
                <div className="mb-8 pb-6 border-b border-stone-100 text-center max-w-md mx-auto space-y-3">
                  <h4 className="font-serif text-2xl text-stone-800 font-light">Talvez você não esteja aqui por acaso.</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Existem formas diferentes de caminhar com Deus. Algumas pessoas conectam. Outras acolhem. Outras perguntam. Outras sustentam tudo em silêncio.
                  </p>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Jesus chamou doze pessoas completamente diferentes. E mesmo assim construiu uma mesa com elas. Talvez uma dessas histórias se pareça com a sua.
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-1 rounded-full mb-8 relative">
                <div
                  className="bg-[#C08261] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#C08261] font-bold uppercase">
                    Mesa e Caminho • Questão {currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl text-stone-850 mt-2 font-light leading-snug">
                    {QUIZ_QUESTIONS[currentQuestionIndex].text}
                  </h3>
                </div>

                <AnimatePresence mode="wait">
                  {!showReaction ? (
                    <motion.div
                      key="options-list"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col space-y-3 pt-2"
                    >
                      {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                        <button
                          id={`quiz-option-${idx}`}
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          className="w-full text-left px-5 py-4 border border-stone-200 rounded-2xl hover:border-[#C08261]/60 hover:bg-[#C08261]/5 active:bg-[#C08261]/10 text-stone-700 text-sm font-medium transition cursor-pointer leading-relaxed"
                        >
                          {option.text}
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reaction-view"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="space-y-6 pt-2 bg-stone-50/50 p-6 rounded-2xl border border-stone-200/35"
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-semibold block">Sua Escolha</span>
                        <p className="text-sm text-stone-700 font-medium leading-relaxed italic">
                          "{QUIZ_QUESTIONS[currentQuestionIndex].options[selectedOptionIndex!].text}"
                        </p>
                      </div>

                      <div className="border-t border-stone-200/60 pt-4 flex flex-col items-center text-center space-y-4">
                        <p className="font-serif italic text-base md:text-lg text-[#C08261] px-4 font-light leading-relaxed">
                          {QUIZ_QUESTIONS[currentQuestionIndex].reaction}
                        </p>

                        <button
                          id="btn-quiz-continue"
                          onClick={handleContinue}
                          className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                        >
                          <span>Continuar</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* COMPREHENSIVE CONTEMPLATIVE RESULT SCREEN */
            <div className="space-y-6 transform duration-500 animate-fade-in">
              <div
                id="result-profile-card"
                className="rounded-3xl p-8 relative overflow-hidden shadow-xl text-white border-2 hover:shadow-2xl transition"
                style={{
                  backgroundColor: quizResult.hexColor,
                  borderColor: `${quizResult.hexColor}aa`
                }}
              >
                {/* Visual geometric texture */}
                <div className="absolute bottom-0 right-0 translate-x-24 translate-y-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

                <div className="flex justify-between items-start border-b border-white/20 pb-5 mb-6">
                  <div>
                    <span className="text-[11px] uppercase font-mono tracking-widest text-[#EAD0B3] italic font-semibold block">
                      Talvez isso explique muita coisa.
                    </span>
                    <h3 className="text-3xl font-serif font-light mt-1 text-white uppercase tracking-tight">
                      VOCÊ CARREGA A {quizResult.name.replace('O ', '').replace('A ', '')}
                    </h3>
                    <p className="text-white/80 text-sm mt-0.5 italic">{quizResult.subtitle}</p>
                  </div>
                  <div className="p-3 bg-white/15 backdrop-blur-sm rounded-2xl">
                    <Feather size={20} className="text-amber-100" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-base md:text-md leading-relaxed font-light text-stone-100 max-w-xl whitespace-pre-line">
                      {PROFILE_NARRATIVES[quizResult.id] || quizResult.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-black/25 p-5 md:p-6 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-xs uppercase font-mono tracking-wider text-white/60 block mb-2 font-semibold">Caminho do Coração</span>
                      <ul className="text-sm space-y-1.5 text-stone-100">
                        <li>• <strong className="text-white">Estilo:</strong> {quizResult.archetype}</li>
                        <li>• <strong className="text-white">Sustento Íntimo:</strong> {quizResult.emotionalTrigger}</li>
                        <li>• <strong className="text-white">Anseio Profundo:</strong> {quizResult.coreFeeling}</li>
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-mono tracking-wider text-white/60 block mb-2 font-semibold">Palavra Farol</span>
                      <p className="text-sm leading-relaxed italic text-amber-100/90 font-serif">"{quizResult.scripture}"</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-5 space-y-5">
                    <div>
                      <strong className="text-sm text-[#EAD0B3] font-sans font-semibold uppercase tracking-wider block mb-1.5">Questão Reflexiva</strong>
                      <p className="text-sm md:text-base italic text-stone-100 font-serif leading-relaxed px-1">"{quizResult.reflectiveQuestion}"</p>
                    </div>
                    <div className="pt-1">
                      <strong className="text-sm text-[#EAD0B3] font-sans font-semibold uppercase tracking-wider block mb-1.5">Oração do Secreto</strong>
                      <p className="text-sm md:text-base bg-white/5 p-4 rounded-xl border border-white/5 text-stone-100 leading-relaxed font-serif italic">
                        "{quizResult.prayer}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* NUDGE INVISÍVEL DISCRETO */}
              <div className="bg-white border border-stone-200/50 rounded-2xl p-6 text-center space-y-4">
                <p className="text-xs md:text-sm text-stone-600 font-serif leading-relaxed italic">
                  “Existem outras {PLURAL_NAMES[quizResult.id] || 'pessoas'} procurando uma mesa para sentar.”
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    id="btn-quiz-view-mesas"
                    onClick={() => navigateToSection('mesas')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold tracking-wider transition"
                  >
                    Ver Outras Mesas
                  </button>
                  <button
                    id="btn-quiz-start-mesa"
                    onClick={triggerCreateMesa}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#C08261] hover:bg-[#B07251] text-white rounded-xl text-xs font-semibold tracking-wider transition"
                  >
                    Começar Uma Mesa
                  </button>
                  <button
                    id="btn-quiz-share"
                    onClick={() => handleShare(quizResult.name)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#C08261]/10 hover:bg-[#C08261]/20 text-[#8C6239] rounded-xl text-xs font-semibold tracking-wider transition relative"
                  >
                    {shareCopied ? 'Convite Copiado!' : 'Enviar para quem pisaria nessa mesa com você'}
                  </button>
                </div>

                {shareCopied && (
                  <p className="text-[10px] text-[#8C6239] font-medium">
                    Convite de mesa copiado com carinho! Agora envie para aquela pessoa querida.
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  id="btn-retake-discovery"
                  onClick={handleRetakeQuiz}
                  className="flex items-center space-x-2 px-5 py-2 hover:bg-stone-150 rounded-xl text-xs text-stone-500 border border-stone-200 transition"
                >
                  <RotateCcw size={14} />
                  <span>Refazer Autoconhecimento</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Profiles Catalog */
        <div id="profiles-catalog" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List items */}
          <div className="md:col-span-1 bg-stone-50 border border-stone-200/50 rounded-2xl p-4 flex flex-col space-y-1 md:max-h-[500px] overflow-y-auto">
            <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider mb-2 px-3">Os 12 Temperamentos</span>
            {DESPERTAR_PROFILES.map((prof) => (
              <button
                id={`btn-view-profile-${prof.id}`}
                key={prof.id}
                onClick={() => setViewedProfileId(prof.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-serif transition-all flex items-center space-x-2.5 ${
                  viewedProfileId === prof.id
                    ? 'bg-stone-800 text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-200/50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: prof.hexColor }}
                />
                <span>{prof.name}</span>
              </button>
            ))}
          </div>

          {/* Details viewer */}
          <div className="md:col-span-2 shadow-sm border border-stone-150 rounded-3xl overflow-hidden bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewedProfileId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-6 md:p-8 flex flex-col space-y-6 relative"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: selectedViewedProfile.hexColor }}
                />

                <div className="flex justify-between items-start border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-light text-stone-800 flex items-center space-x-2">
                      <span>{selectedViewedProfile.name}</span>
                      <span className="text-xs font-mono font-normal py-0.5 px-2 bg-stone-100 text-stone-500 rounded-full">
                        {selectedViewedProfile.archetype}
                      </span>
                    </h3>
                    <p className="text-stone-500 text-xs italic mt-0.5">"{selectedViewedProfile.quote}"</p>
                  </div>
                  <div
                    className="w-7 h-7 rounded-full shadow-inner"
                    style={{ backgroundColor: selectedViewedProfile.hexColor }}
                  />
                </div>

                <div className="space-y-4 text-stone-700 text-sm">
                  <div>
                    <span className="text-[12px] uppercase font-mono tracking-wider text-stone-500 block">Identidade Essencial</span>
                    <p className="leading-relaxed mt-1 whitespace-pre-line">
                      {PROFILE_NARRATIVES[selectedViewedProfile.id] || selectedViewedProfile.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-sm space-y-1.5 text-stone-750">
                      <span className="font-semibold text-[#8C6239] text-base block mb-1">Caminho do Coração</span>
                      <p><strong>Cuidado Íntimo:</strong> {selectedViewedProfile.emotionalTrigger}</p>
                      <p><strong>Anseio da Alma:</strong> {selectedViewedProfile.coreFeeling}</p>
                    </div>
                    <div className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-sm text-stone-750">
                      <span className="font-semibold text-[#C08261] text-base block mb-1">Versículo Farol</span>
                      <p className="italic text-stone-700 font-serif leading-relaxed text-sm md:text-base">"{selectedViewedProfile.scripture}"</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-200/60 space-y-5">
                    <div>
                      <strong className="block text-stone-500 font-sans font-semibold uppercase tracking-wider text-xs mb-1.5">Questão de Reflexão Profunda</strong>
                      <p className="italic font-serif pl-3 border-l-2 border-[#C08261] text-stone-800 text-sm md:text-base leading-relaxed">"{selectedViewedProfile.reflectiveQuestion}"</p>
                    </div>
                    <div>
                      <strong className="block text-stone-500 font-sans font-semibold uppercase tracking-wider text-xs mb-1.5">Oração do Secreto</strong>
                      <p className="bg-stone-50 border border-stone-150 p-4 rounded-xl italic font-serif leading-relaxed text-stone-850 text-sm md:text-base">
                        "{selectedViewedProfile.prayer}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

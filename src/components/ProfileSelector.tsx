/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DESPERTAR_PROFILES } from '../data/profiles';
import { SpiritualIdentity } from '../types';
import { CheckCircle, ArrowRight, RotateCcw, Compass, BookOpen, Heart, RefreshCw, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileSelectorProps {
  currentIdentityId: string | null;
  onSelectIdentity: (id: string, answers: { [key: string]: string }) => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    text: 'Como você costuma se revigorar nos dias de esgotamento profundo?',
    options: [
      { text: 'Trancando-me no quarto para ler, meditar ou ficar no silêncio.', profileId: 'contemplativo' },
      { text: 'Caminhando ao ar livre ou escrevendo minhas dúvidas sinceras.', profileId: 'peregrino' },
      { text: 'Ouvindo desabafos de amigos ou cuidando de quem está machucado.', profileId: 'restaurador' },
      { text: 'Preparando uma refeição especial ou lavando a louça para servir alguém.', profileId: 'cooperador' }
    ]
  },
  {
    id: 'q2',
    text: 'O que mais te afasta ou cansa nos ambientes de adoração tradicionais?',
    options: [
      { text: 'A histeria, o barulho constante e os discursos mecânicos.', profileId: 'contemplativo' },
      { text: 'As respostas enlatadas e a falta de espaço para questionar verdades.', profileId: 'peregrino' },
      { text: 'A superficialidade com que tratam as crises existenciais e fracassos.', profileId: 'restaurador' },
      { text: 'A pregação teológica fria que não se traduz em ações sociais sérias.', profileId: 'atalaia' }
    ]
  },
  {
    id: 'q3',
    text: 'Em qual papel você se sente útil por inteiro no reino de Deus?',
    options: [
      { text: 'Preservando as sagradas doutrinas e raízes antigas da fé com firmeza.', profileId: 'guardiao' },
      { text: 'Aconselhando pessoas em encruzilhadas ou orando nas madrugadas.', profileId: 'conselheiro' },
      { text: 'Abrindo as portas da minha casa e acolhendo estranhos na mesa posta.', profileId: 'facilitador' },
      { text: 'Conduzindo outros ao louvor sincero através de expressões artísticas.', profileId: 'adorador' }
    ]
  },
  {
    id: 'q4',
    text: 'Qual destas frases ecoa mais no fundo do seu peito hoje?',
    options: [
      { text: '"Na quietude de um quarto fechado habita o maior dos mistérios."', profileId: 'contemplativo' },
      { text: '"Não cheguei ao fim, mas prossigo caminhando e aprendendo."', profileId: 'peregrino' },
      { text: '"O amor cristão deve curar furos de prego visíveis na sociedade."', profileId: 'cooperador' },
      { text: '"Como as corças suspiram pelas águas, minha alma anseia por beleza."', profileId: 'adorador' }
    ]
  },
  {
    id: 'q5',
    text: 'Quando você vê alguém em meio a um desvio ou crise, qual seu impulso natural?',
    options: [
      { text: 'Sentar ao lado para ouvir em silêncio absoluto, de forma amorosa.', profileId: 'conselheiro' },
      { text: 'Estender as mãos com ajuda material imediata, cuidando dele.', profileId: 'cooperador' },
      { text: 'Promover a reconciliação e as pontes para cessar os abismos.', profileId: 'pacificador' },
      { text: 'Ensinar metodicamente os caminhos de Jesus para que cresça.', profileId: 'discipulo' }
    ]
  }
];

export default function ProfileSelector({ currentIdentityId, onSelectIdentity }: ProfileSelectorProps) {
  const [activeTab, setActiveTab] = useState<'quiz' | 'catalog'>('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [quizResult, setQuizResult] = useState<SpiritualIdentity | null>(
    currentIdentityId ? DESPERTAR_PROFILES.find(p => p.id === currentIdentityId) || null : null
  );
  
  // Catalog selection detail state
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(DESPERTAR_PROFILES[0].id);

  const handleAnswerSelect = (profileId: string) => {
    const questionId = QUIZ_QUESTIONS[currentQuestionIndex].id;
    const newAnswers = { ...answers, [questionId]: profileId };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate dominant profile
      const counts: { [key: string]: number } = {};
      Object.values(newAnswers).forEach((val) => {
        const id = val as string;
        counts[id] = (counts[id] || 0) + 1;
      });

      // Find profile with maximum occurrences
      let maxId = 'contemplativo';
      let maxCount = 0;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxId = id;
        }
      });

      const matchedProfile = DESPERTAR_PROFILES.find(p => p.id === maxId) || DESPERTAR_PROFILES[0];
      setQuizResult(matchedProfile);
      onSelectIdentity(matchedProfile.id, newAnswers);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setActiveTab('quiz');
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
          {!quizResult ? (
            <div className="bg-white/90 border border-stone-200/50 rounded-3xl p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-stone-900 pointer-events-none">
                <Compass size={180} />
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-1 rounded-full mb-8 relative">
                <div
                  className="bg-[#C08261] h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#C08261] font-semibold uppercase">
                    Autoconhecimento • Questão {currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl text-stone-800 mt-2 font-light leading-snug">
                    {QUIZ_QUESTIONS[currentQuestionIndex].text}
                  </h3>
                </div>

                <div className="flex flex-col space-y-3 pt-2">
                  {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      id={`quiz-option-${idx}`}
                      key={idx}
                      onClick={() => handleAnswerSelect(option.profileId)}
                      className="w-full text-justify px-5 py-4 border border-stone-200 rounded-2xl hover:border-[#C08261]/60 hover:bg-[#C08261]/5 active:bg-[#C08261]/10 text-stone-700 text-sm font-medium transition cursor-pointer"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 transform duration-500 scale-95 md:scale-100">
              {/* Profile Card */}
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
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/70">Sua Identidade Predominante</span>
                    <h3 className="text-3xl font-serif font-light mt-1 text-white">{quizResult.name}</h3>
                    <p className="text-white/80 text-sm mt-0.5 italic">{quizResult.subtitle}</p>
                  </div>
                  <div className="p-3 bg-white/15 backdrop-blur-sm rounded-2xl">
                    <Feather size={20} className="text-amber-100" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 block mb-1">Como sua alma respira</span>
                    <p className="text-sm md:text-base leading-relaxed font-light text-stone-100">{quizResult.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/10 p-5 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 block mb-1">Âncoras de Caráter</span>
                      <ul className="text-xs space-y-1 text-stone-200">
                        <li>• <strong className="text-white">Arquétipo:</strong> {quizResult.archetype}</li>
                        <li>• <strong className="text-white">Gatilho Emocional:</strong> {quizResult.emotionalTrigger}</li>
                        <li>• <strong className="text-white">Sentimento Central:</strong> {quizResult.coreFeeling}</li>
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 block mb-1">Versículo Farol</span>
                      <p className="text-[11px] leading-relaxed italic text-amber-100">{quizResult.scripture}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-5 space-y-3">
                    <div>
                      <strong className="text-xs text-white/80 uppercase tracking-wider block mb-1">Pergunta Reflexiva do Caminho</strong>
                      <p className="text-xs italic text-stone-200">"{quizResult.reflectiveQuestion}"</p>
                    </div>
                    <div className="pt-2">
                      <strong className="text-xs text-white/80 uppercase tracking-wider block mb-1">Oração do Secreto</strong>
                      <p className="text-xs bg-white/5 p-3 rounded-xl border border-white/5 text-stone-100 leading-relaxed font-serif italic">
                        "{quizResult.prayer}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  id="btn-retake-discovery"
                  onClick={handleRetakeQuiz}
                  className="flex items-center space-x-2 px-5 py-2 hover:bg-stone-100 rounded-xl text-xs text-stone-600 border border-stone-200 transition"
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
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewedProfileId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white/95 border border-stone-100 rounded-3xl p-6 shadow-md flex flex-col space-y-6 relative"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
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
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Identidade Essencial</span>
                    <p className="leading-relaxed mt-1">{selectedViewedProfile.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-stone-50 border border-stone-200/50 rounded-xl text-xs space-y-1">
                      <span className="font-semibold text-[#8C6239] block mb-1">Arquétipo & Emoções:</span>
                      <p><strong>Gatilho:</strong> {selectedViewedProfile.emotionalTrigger}</p>
                      <p><strong>Sentimento Central:</strong> {selectedViewedProfile.coreFeeling}</p>
                    </div>
                    <div className="p-4 bg-stone-50 border border-stone-200/50 rounded-xl text-xs">
                      <span className="font-semibold text-[#C08261] block mb-1">Versículo Clave:</span>
                      <p className="italic text-stone-600">"{selectedViewedProfile.scripture}"</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 space-y-3 text-xs">
                    <div>
                      <strong className="block text-stone-500 uppercase tracking-widest text-[9px] mb-1">Questão de Reflexão Profunda</strong>
                      <p className="italic font-serif pl-2 border-l border-[#C08261] text-stone-700">"{selectedViewedProfile.reflectiveQuestion}"</p>
                    </div>
                    <div>
                      <strong className="block text-stone-500 uppercase tracking-widest text-[9px] mb-1">Oração do Secreto</strong>
                      <p className="bg-stone-50 border border-stone-100 p-3 rounded-xl italic font-serif leading-relaxed text-[#5C3D2E]">
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

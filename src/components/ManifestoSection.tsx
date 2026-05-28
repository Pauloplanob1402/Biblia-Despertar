import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Landmark, Users, Compass, Eye, ArrowRight, Sparkles, MapPin, Coffee, BookOpen } from 'lucide-react';

interface ManifestoSectionProps {
  onExploreMesas: () => void;
  onOpenCreateMesa: () => void;
  currentUserName?: string;
  onAuthenticate: () => void;
  isAuthenticated: boolean;
}

const PRESET_MESA_NAMES = [
  'Mesa da Conexão',
  'Mesa dos Caminhantes',
  'Mesa dos Amigos',
  'Mesa da Reconciliação',
  'Mesa da Graça'
];

export default function ManifestoSection({
  onExploreMesas,
  onOpenCreateMesa,
  currentUserName,
  onAuthenticate,
  isAuthenticated
}: ManifestoSectionProps) {
  // Interactive ideation state
  const [cityInput, setCityInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Mesa da Conexão');
  const [customNameInput, setCustomNameInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [wantsToHost, setWantsToHost] = useState(false);

  const getFinalMesaName = () => {
    const title = isCustomMode ? customNameInput.trim() : selectedPreset;
    return title || 'A Sua Mesa';
  };

  const getFinalLocation = () => {
    return cityInput.trim() || 'sua cidade ou bairro...';
  };

  return (
    <div className="space-y-16 py-12 md:py-20 max-w-4xl mx-auto px-4 md:px-0 select-none">
      
      {/* SECTION 1: PRE-SUASION POETIC INGRESS */}
      <div className="space-y-10 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-[#C08261]/25 select-none font-serif font-semibold text-8xl pointer-events-none opacity-40">
          🕊️
        </div>
        
        <div className="space-y-3.5 z-10 relative">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C6239] font-bold">
            Um jeito simples de caminhar
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-extralight text-stone-850 tracking-tight leading-tight">
            Você não precisa chegar pronto para sentar à mesa.
          </h2>
          <p className="text-stone-400 font-serif italic text-xs md:text-sm">
            O Despertar é um lugar onde pessoas reais reaprendem a caminhar com Deus juntas.
          </p>
        </div>

        {/* Storytelling Slider */}
        <div className="font-serif text-stone-700 space-y-6 leading-relaxed max-w-2xl mx-auto text-sm md:text-base border-l border-stone-200/60 pl-6 md:pl-10 text-justify italic">
          <p className="not-italic font-medium text-stone-900 text-base md:text-lg text-center">
            No início, não havia palcos, templos grandiosos ou cobranças pesadas. <br />
            Havia apenas um convite simples. <br />
            E pessoas que apareciam exatamente como eram.
          </p>
          
          <p className="not-italic text-stone-850 text-center">
            Talvez a conversa mais importante da sua vida não aconteça num palco. <br />
            <span className="font-serif italic font-semibold text-[#8C6239]">Talvez aconteça ao redor de uma mesa.</span>
          </p>

          <p className="text-stone-600 font-sans text-xs md:text-sm leading-relaxed non-italic text-center">
            Pessoas sentando à mesa de forma demorada, partilhando o pão com simplicidade. <br />
            Reacendendo a fé umas nas outras em cada olhar de escuta mútua. <br />
            Criando espaços onde a graça consegue finalmente respirar em paz novamente.
          </p>

          <p className="font-medium text-stone-900 not-italic text-center py-2 md:py-4 border-y border-stone-100 max-w-lg mx-auto">
            Talvez seu próximo passo espiritual não seja encontrar um lugar. <br />
            <span className="text-[#C08261] font-serif italic">Talvez seja apenas criar um espaço acolhedor.</span>
          </p>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE DEEP ENGAGEMENT (Imagine your space) */}
      <div className="bg-white border border-stone-200/70 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden text-left space-y-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C08261]/3 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#C08261] flex items-center gap-1.5 font-bold">
            <Sparkles size={11} /> Inspiração para sua Mesa
          </span>
          <h4 className="font-serif text-xl md:text-2xl font-light text-stone-850">
            Imagine a atmosfera da sua própria Mesa...
          </h4>
          <p className="text-stone-500 text-xs">
            Feche os olhos por um segundo. Como seria a placa ou o convite discreto para uma mesa acolhedora em seu lar ou café local? Escolha ou digite um nome e veja a semente nascer abaixo:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          
          {/* Controls side */}
          <div className="space-y-5">
            {/* Toggle custom vs preset */}
            <div className="flex bg-stone-50 p-1 rounded-xl border border-stone-100">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-semibold transition ${
                  !isCustomMode ? 'bg-white text-[#8C6239] shadow-xs' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Inspirar Nomes
              </button>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-semibold transition ${
                  isCustomMode ? 'bg-white text-[#8C6239] shadow-xs' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                Nome Próprio / Customizado
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isCustomMode ? (
                <motion.div
                  key="preset-controls"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-wrap gap-1.5"
                >
                  {PRESET_MESA_NAMES.map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedPreset(name)}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-medium transition ${
                        selectedPreset === name
                          ? 'border-[#C08261] bg-[#C08261]/5 text-[#C08261] font-semibold'
                          : 'border-stone-200 bg-white text-stone-605 hover:bg-stone-50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="custom-controls"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col space-y-1.5"
                >
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Escreva o título que brota no seu interior</label>
                  <input
                    type="text"
                    maxLength={32}
                    placeholder="Ex: Mesa do Recomeço..."
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* City input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Em qual cidade / bairro ocorreria? *</label>
              <div className="relative">
                <MapPin size={13} className="text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={30}
                  placeholder="Ex: Pinheiros, São Paulo"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                />
              </div>
            </div>
          </div>

          {/* Interactive Blueprint Canvas Preview */}
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 relative flex flex-col justify-between h-[210px] shadow-xs select-none">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono uppercase bg-amber-50 text-[#8C6239] border border-amber-200/50 px-2 py-0.5 rounded-full font-bold">
                  Sua semente de mesa
                </span>
                <span className="text-xl">🕯️</span>
              </div>

              <div>
                <h5 className="font-serif text-lg font-medium text-stone-850 leading-tight">
                  {getFinalMesaName()}
                </h5>
                <p className="text-[11px] font-mono text-[#C08261] mt-0.5 flex items-center gap-0.5">
                  <MapPin size={10} /> {getFinalLocation()}
                </p>
              </div>
            </div>

            <div className="border-t border-stone-200/60 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-stone-450 font-sans italic">
                {currentUserName ? `Facilitador: ${currentUserName}` : 'Sob a sua tutela...' }
              </span>
              <div className="flex items-center space-x-0.5 text-[#C08261]">
                <Coffee size={13} />
                <span className="text-[10px] font-semibold font-mono">Pão e Café</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: THE COGNITIVE REVELATION (Mateus 18:20) */}
      <div className="bg-[#C08261]/5 border border-[#C08261]/20 rounded-3xl p-8 relative md:p-10 text-center space-y-6">
        <blockquote className="font-serif text-stone-800 text-sm md:text-base leading-relaxed italic max-w-2xl mx-auto text-center font-medium">
          "O amor sempre andou assim. De casa em casa, de mesa em mesa. Sem palcos, sem cobranças de desempenho ou rituais complicados. Apenas pessoas acolhendo pessoas ao redor do pão e do café quente."
        </blockquote>

        <div className="flex flex-col items-center space-y-1">
          <cite className="font-serif text-[#8C6239] text-base font-medium not-italic">
            “Onde estiverem dois ou três reunidos em meu nome, ali eu estou.”
          </cite>
          <span className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
            Mateus 18:20
          </span>
        </div>

        {/* Nudge Options Wrapper */}
        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto">
          {isAuthenticated ? (
            <button
              onClick={onOpenCreateMesa}
              className="w-full sm:flex-1 py-3 bg-[#C08261] hover:bg-[#b07353] text-white text-sm font-semibold rounded-2xl transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <span>Dar Vida a Esta Mesa</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onAuthenticate}
              className="w-full sm:flex-1 py-3 bg-[#C08261] hover:bg-[#b07353] text-white text-sm font-semibold rounded-2xl transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <span>Consagrar Minha Mesa</span>
              <ArrowRight size={14} />
            </button>
          )}

          <button
            onClick={onExploreMesas}
            className="w-full sm:flex-1 py-3 bg-white border border-stone-200 text-stone-750 text-sm font-semibold rounded-2xl hover:bg-stone-50 transition"
          >
            Ver as Mesas Ativas
          </button>
        </div>

        <p className="text-xs text-stone-500 font-mono max-w-sm mx-auto leading-normal select-none">
          Crie, inspire os amigos ou participe. O acolhimento ao próximo é um chamado de todos os peregrinos de Deus.
        </p>
      </div>

    </div>
  );
}

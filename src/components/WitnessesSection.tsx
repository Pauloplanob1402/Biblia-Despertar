/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Flame, Sparkles, BookOpen, Clock, Heart, Plus, Check, Compass, Award } from 'lucide-react';
import { WITNESSES, Witness, WITNESS_CATEGORIES } from '../data/witnesses';

interface WitnessesSectionProps {
  onAddReflection: (verseRef: string, text: string) => void;
  onShowSuccessToast: (msg: string) => void;
}

export default function WitnessesSection({ onAddReflection, onShowSuccessToast }: WitnessesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedWitnessId, setExpandedWitnessId] = useState<string | null>(null);
  const [reflectionTexts, setReflectionTexts] = useState<{ [key: string]: string }>({});

  // Filter & Search Logic
  const filteredWitnesses = WITNESSES.filter((witness) => {
    const matchesCategory = selectedCategory === 'all' || witness.category === selectedCategory;
    const matchesSearch = 
      witness.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      witness.period.includes(searchQuery) ||
      witness.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveReflection = (witness: Witness) => {
    const text = reflectionTexts[witness.id]?.trim();
    if (!text) return;

    // Save reflection to the user's main diary
    onAddReflection(`Testemunho: ${witness.name}`, text);
    onShowSuccessToast(`Reflexão sobre ${witness.name} guardada no seu Diário! 🕊️`);

    // Reset local state for this input
    setReflectionTexts((prev) => ({
      ...prev,
      [witness.id]: ''
    }));
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Immersive Header and Scripture Banner */}
      <div 
        id="witnesses-header" 
        className="relative overflow-hidden bg-gradient-to-br from-[#1C1A19] via-[#121110] to-[#0A0A09] p-8 md:p-12 rounded-3xl border border-[#C08261]/25 shadow-xl space-y-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#C08261/10,transparent_55%)] pointer-events-none" />
        
        <div className="space-y-3 max-w-3xl relative z-10">
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs uppercase font-mono tracking-widest text-[#C08261] bg-[#C08261]/12 border border-[#C08261]/25 font-bold">
            <Award size={13} className="text-[#C08261]" />
            <span>Nuvem de Testemunhas</span>
          </span>
          
          <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-100 tracking-tight leading-tight">
            Nuvem de <span className="text-[#C08261] font-semibold">Testemunhas</span>
          </h3>
          
          <div className="border-l-4 border-[#C08261] pl-5 italic text-stone-100 font-serif text-lg md:text-xl lg:text-2xl leading-relaxed my-6 space-y-2">
            <p className="font-normal tracking-wide">
              "Portanto, também nós, visto que estamos rodeados por tão grande nuvem de testemunhas, livremo-nos de todo peso e do pecado que nos rodeia e corramos com perseverança a corrida que nos está proposta."
            </p>
            <span className="text-right block text-sm font-mono text-[#C08261] font-semibold uppercase tracking-widest not-italic mt-2.5">— Hebreus 12:1</span>
          </div>

          <p className="text-stone-300 text-sm md:text-base leading-relaxed font-sans max-w-2xl">
            Sintonize a bravura, sabedoria e fogo secreto dos santos, reformadores e missionários que cooperaram com o mover do Espírito Santo ao longo das eras. Que a jornada deles infunda em você ousadia para responder ao chamado hoje da mesma forma.
          </p>
        </div>
      </div>

      {/* Control Area: Tab filters & Full text Search */}
      <div id="witnesses-controls" className="bg-white border border-stone-200/50 p-6 rounded-3xl shadow-xs space-y-5">
        
        {/* Real-time search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" />
          <input
            id="search-witnesses"
            type="text"
            placeholder="Pesquise por heróis da fé (ex: Lutero, Lewis, Avivamento, Oração)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50/50 border border-stone-200/80 rounded-2xl pl-12 pr-4 py-4 text-sm md:text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C08261] focus:border-[#C08261] focus:bg-white transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs md:text-sm font-mono text-stone-400 hover:text-stone-600"
            >
              Limpar ✕
            </button>
          )}
        </div>

        {/* Scrollable Categories Navigation list (Hick's Law / Horizontal Scrolling for High Density) */}
        <div className="space-y-3">
          <span className="text-xs md:text-sm font-mono uppercase tracking-widest text-[#C08261] font-bold block mb-1">Filtrar por Época & Chamado</span>
          <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-1 select-none">
            {WITNESS_CATEGORIES.map((cat) => (
              <button
                id={`cat-btn-${cat.id}`}
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm md:text-base font-serif transition shrink-0 border cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#C08261] text-white border-[#C08261] font-semibold shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200/50 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid count feed */}
      <div className="flex justify-between items-center px-2">
        <span className="text-xs md:text-sm uppercase font-mono tracking-wider font-semibold text-stone-500">
          Resultados: {filteredWitnesses.length} {filteredWitnesses.length === 1 ? 'testemunha encontrada' : 'testemunhas herdadas'}
        </span>
        <span className="text-xs md:text-sm text-[#C08261] font-mono italic">Toque em qualquer card para refletir no Secreto</span>
      </div>

      {/* Grid of beautifully styled historical cards */}
      {filteredWitnesses.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-stone-200 rounded-3xl space-y-3">
          <p className="text-stone-400 text-sm font-serif italic">
            "Procurei e não encontrei nenhuma testemunha correspondente a este termo..."
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
          >
            Mostrar Todas as Testemunhas
          </button>
        </div>
      ) : (
        <div id="witnesses-bento-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredWitnesses.map((witness, idx) => {
              const isExpanded = expandedWitnessId === witness.id;
              const matchingCategoryName = WITNESS_CATEGORIES.find(c => c.id === witness.category)?.name || 'Testemunha';

              return (
                <motion.div
                  layout
                  id={`witness-card-${witness.id}`}
                  key={witness.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`bg-white border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between transition-all relative overflow-hidden ${
                    isExpanded 
                      ? 'border-[#C08261]/40 ring-1 ring-[#C08261]/20 shadow-md md:col-span-2 shadow-sm' 
                      : 'border-stone-200/50 hover:border-stone-300 hover:shadow-xs cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isExpanded) {
                      setExpandedWitnessId(witness.id);
                    }
                  }}
                >
                  {/* Subtle index tag or decorative accent in the background */}
                  <div className="absolute top-2 right-4 opacity-[0.05] pointer-events-none font-mono text-[70px] md:text-[90px] font-bold text-[#C08261] leading-none">
                    {idx + 1}
                  </div>

                  <div className="space-y-5">
                    {/* Character Bio Header Info Row */}
                    <div className="flex items-start gap-4">
                      {/* Monogram/Avatar box */}
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-[#C08261]/15 flex items-center justify-center text-2xl shadow-xs shrink-0 select-none">
                        {witness.avatarPlaceholder}
                      </div>
                      
                      <div className="text-left space-y-1.5 flex-1 select-none">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#C08261] bg-[#C08261]/8 px-2.5 py-1 rounded-md font-bold">
                            {matchingCategoryName}
                          </span>
                          <span className="text-xs font-mono text-stone-500 font-medium">• Ano {witness.period}</span>
                        </div>
                        <h4 className="font-serif text-xl md:text-2xl font-bold text-stone-900 tracking-tight leading-tight">
                          {witness.name}
                        </h4>
                      </div>

                      {/* Header toggle icon when not expanded */}
                      {!isExpanded && (
                        <div className="text-[#C08261] text-xs md:text-sm font-serif font-semibold mt-1 flex items-center gap-1.5 whitespace-nowrap bg-[#C08261]/5 px-3 py-1.5 rounded-full border border-[#C08261]/15 hover:bg-[#C08261]/10">
                          <span>Sintonizar</span>
                          <Plus size={14} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                    {/* Prose Text - Show short crop or full text depending on state */}
                    <div className="text-left font-serif leading-relaxed text-stone-800 text-base md:text-lg lg:text-xl select-text">
                      {isExpanded ? (
                        <p className="whitespace-pre-line text-justify italic font-normal leading-relaxed">{witness.description}</p>
                      ) : (
                        <p className="line-clamp-3 text-stone-500 italic font-light">{witness.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Fully Interactive Reflection Panel - Activates uniquely on Expanded mode */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-stone-100 pt-6 mt-6 space-y-5 text-left"
                      onClick={(e) => e.stopPropagation()} // Stop propagation from triggering toggle again
                    >
                      <div className="bg-[#C08261]/5 p-5 rounded-2xl border border-[#C08261]/12 space-y-2 select-none">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block">Consagração em Silêncio</span>
                        <p className="text-sm md:text-base font-serif text-stone-700 italic leading-relaxed">
                          Considere a fé inabalável deste irmão. O que neles despertava tamanho amor pelas almas? Reflita no seu silêncio por um instante.
                        </p>
                      </div>

                      {/* Micro-Journal Reflection text input form */}
                      <div className="space-y-3">
                        <label className="text-xs md:text-sm font-mono uppercase tracking-wider text-stone-500 font-bold block">
                          O que o testemunho de {witness.name} ativa no seu chamado?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Insira sua nota no Secreto..."
                            value={reflectionTexts[witness.id] || ''}
                            onChange={(e) => setReflectionTexts((prev) => ({
                              ...prev,
                              [witness.id]: e.target.value
                            }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveReflection(witness);
                            }}
                            className="bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3.5 text-sm md:text-base flex-1 focus:outline-none focus:ring-1 focus:ring-[#C08261] text-stone-800 focus:bg-white transition"
                          />
                          <button
                            id={`btn-save-reflection-${witness.id}`}
                            onClick={() => handleSaveReflection(witness)}
                            disabled={!(reflectionTexts[witness.id]?.trim())}
                            className="px-5 py-3.5 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition flex items-center justify-center shadow-xs cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 disabled:border-transparent shrink-0"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3">
                        <button
                          onClick={() => setExpandedWitnessId(null)}
                          className="text-stone-500 hover:text-stone-700 text-sm font-serif hover:underline"
                        >
                          Encolher Detalhes
                        </button>
                        
                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#C08261] font-mono font-medium">
                          <Compass size={14} />
                          <span>Mesa e Caminho</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Encouragement message box at bottom */}
      <div className="bg-amber-50/15 border border-stone-200 p-8 rounded-3xl text-center space-y-3 max-w-2xl mx-auto italic select-none">
        <p className="font-serif text-[#C08261] text-base md:text-lg lg:text-xl leading-relaxed font-semibold">
          "A jornada de fé não é uma corrida de cem metros rasos, mas uma maratona de perseverança e busca diária pela presença de Deus. Que você também responda ao Seu chamado com o mesmo fervor."
        </p>
      </div>
    </div>
  );
}

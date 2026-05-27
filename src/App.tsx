/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, Book, Coffee, User, Bookmark, Feather, 
  Flame, Sparkles, Clock, Heart, Calendar, ArrowLeft, 
  AlertCircle, ChevronRight, Terminal, FileText, Check, Code 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents import
import BreathingGuide from './components/BreathingGuide';
import BibleReader from './components/BibleReader';
import ProfileSelector from './components/ProfileSelector';
import EbookReader from './components/EbookReader';
import MesasSection from './components/MesasSection';
import AndroidExporter from './components/AndroidExporter';

// Core static databases
import { DEVOCIONAIS } from './data/devotionals';
import { DESPERTAR_PROFILES } from './data/profiles';
import { UserProgress, Devotional, SpiritualIdentity } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'bible' | 'devotionals' | 'profiles' | 'mesas' | 'ebooks' | 'profile' | 'android_hub'>('home');
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  
  // User profile persistent state engine
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('despertar_progress_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      streak: 3, // Starting encouragement streak
      lastActive: new Date().toISOString().split('T')[0],
      savedReflections: [],
      favoriteVerses: [],
      completedChapters: [],
      currentIdentityId: null,
      answers: {}
    };
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('despertar_progress_v2', JSON.stringify(progress));
  }, [progress]);

  // Determine emotional greeting based on local time
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: 'Bom dia, peregrino da luz.',
        desc: 'Sinta o orvalho da graça fresca do Pai neste início de caminhada. Respire fundo, e dê o seu primeiro passo no silêncio.'
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        title: 'Boa tarde, alma querida.',
        desc: 'Faça uma pausa na correria ordinária do dia. Sentar-se à mesa do descanso por uns instantes é restaurar as forças de aprendiz.'
      };
    } else {
      return {
        title: 'Boa noite, descanse no secreto.',
        desc: 'O Senhor que sustenta as galáxias vigia suas preocupações enquanto você repousa. Deite-se em verdes pastos tranquilos.'
      };
    }
  };

  const greeting = getTimeBasedGreeting();
  const currentIdentity = progress.currentIdentityId 
    ? DESPERTAR_PROFILES.find(p => p.id === progress.currentIdentityId) 
    : null;

  // Handles favorite verses
  const handleAddFavoriteVerse = (ref: string, text: string) => {
    setProgress((prev) => {
      if (prev.favoriteVerses.some(v => v.ref === ref)) return prev;
      return {
        ...prev,
        favoriteVerses: [...prev.favoriteVerses, { ref, text }]
      };
    });
  };

  const handleRemoveFavoriteVerse = (ref: string) => {
    setProgress((prev) => ({
      ...prev,
      favoriteVerses: prev.favoriteVerses.filter(v => v.ref !== ref)
    }));
  };

  // Handles adding devotion/scripture reflections
  const handleAddReflection = (verseRef: string, text: string) => {
    const newRef = {
      id: `ref_${Date.now()}`,
      verseRef,
      reflectionText: text,
      createdAt: new Date().toISOString()
    };
    setProgress((prev) => ({
      ...prev,
      savedReflections: [newRef, ...prev.savedReflections],
      streak: prev.streak + (prev.lastActive !== new Date().toISOString().split('T')[0] ? 1 : 0),
      lastActive: new Date().toISOString().split('T')[0]
    }));
  };

  // Handle ebook chapter completion
  const handleCompleteChapter = (ebookId: string, chapterIdx: number) => {
    const key = `${ebookId}_${chapterIdx}`;
    setProgress((prev) => {
      if (prev.completedChapters.includes(key)) return prev;
      return {
        ...prev,
        completedChapters: [...prev.completedChapters, key]
      };
    });
  };

  // Handle identity discovery
  const handleSelectIdentity = (identityId: string, answers: { [key: string]: string }) => {
    setProgress((prev) => ({
      ...prev,
      currentIdentityId: identityId,
      answers
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col md:flex-row antialiased selection:bg-[#C08261]/20">
      
      {/* SIDEBAR: Desktop Premium Navigation Drawer (Width: 280px) */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-stone-200/55 flex flex-col shrink-0 md:h-screen sticky top-0 z-30">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-serif font-semibold shadow-inner">
              B
            </div>
            <div className="text-left">
              <h1 className="font-serif text-[15px] font-bold tracking-tight text-stone-850">Bíblia do Despertar</h1>
              <span className="text-[9px] font-mono tracking-widest text-[#C08261] uppercase">Contemplativa</span>
            </div>
          </div>
          <p className="text-[10px] font-mono text-stone-400 font-semibold md:hidden">Menu</p>
        </div>

        {/* User context card (Left mini-deck) */}
        {currentIdentity && (
          <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center space-x-3 text-left">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-serif font-normal shadow-sm shrink-0"
              style={{ backgroundColor: currentIdentity.hexColor }}
            >
              {currentIdentity.name.charAt(2)}
            </div>
            <div className="truncate">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 font-mono">Identidade Atual:</span>
              <h5 className="font-serif text-[13px] font-semibold text-stone-800 truncate">{currentIdentity.name}</h5>
            </div>
          </div>
        )}

        {/* Navigation lists (Airbnb/Calm style) */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <span className="text-[9px] uppercase font-mono tracking-widest text-stone-400 block px-3 mb-2 text-left">Santúario</span>
          
          <button
            id="nav-home"
            onClick={() => { setActiveSection('home'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'home' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Heart size={14} />
              <span>Pausa & Respirar</span>
            </span>
            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />
          </button>

          <button
            id="nav-bible"
            onClick={() => { setActiveSection('bible'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'bible' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Book size={14} />
              <span>Bíblia (ACF)</span>
            </span>
          </button>

          <button
            id="nav-devotionals"
            onClick={() => { setActiveSection('devotionals'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'devotionals' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Feather size={14} />
              <span>30 Devocionais Reais</span>
            </span>
          </button>

          <button
            id="nav-profiles"
            onClick={() => { setActiveSection('profiles'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'profiles' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Compass size={14} />
              <span>Os 12 Temperamentos</span>
            </span>
          </button>

          <span className="text-[9px] uppercase font-mono tracking-widest text-stone-400 block px-3 pt-5 mb-2 text-left">Comunidade & Estudos</span>

          <button
            id="nav-mesas"
            onClick={() => { setActiveSection('mesas'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'mesas' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Coffee size={14} />
              <span>Mesas do Despertar</span>
            </span>
          </button>

          <button
            id="nav-ebooks"
            onClick={() => { setActiveSection('ebooks'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'ebooks' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <FileText size={14} />
              <span>Catálogo Ebooks</span>
            </span>
          </button>

          <button
            id="nav-profile"
            onClick={() => { setActiveSection('profile'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'profile' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <User size={14} />
              <span>Minha Jornada</span>
            </span>
          </button>

          <span className="text-[9px] uppercase font-mono tracking-widest text-stone-400 block px-3 pt-5 mb-2 text-left">Equipe Sênior</span>

          <button
            id="nav-android-hub"
            onClick={() => { setActiveSection('android_hub'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'android_hub' ? 'bg-amber-600/15 text-amber-300 font-semibold border-l-2 border-amber-500' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Code size={14} />
              <span>Código Android Studio</span>
            </span>
          </button>
        </nav>

        {/* Footer streak count */}
        <div className="p-5 border-t border-stone-100 flex justify-between items-center bg-stone-50 text-stone-500 text-xs">
          <div className="flex items-center space-x-1">
            <Flame size={14} className="text-[#C08261] animate-pulse" />
            <span className="font-mono font-medium">{progress.streak} dias de quietude</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">v1.0</span>
        </div>
      </aside>

      {/* MAIN VIEWPORT: Scrollable content container */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12 max-w-7xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          
          {/* HOME WORKSPACE VIEWPORT */}
          {activeSection === 'home' && !selectedDevotional && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 text-left"
            >
              {/* Emotional Custom Welcome Header and Streak */}
              <div id="emotional-banner" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-stone-100 to-amber-50/10 p-6 rounded-3xl border border-stone-200/40 shadow-sm">
                <div className="space-y-1.5 max-w-2xl">
                  <h2 className="font-serif text-3xl font-light text-stone-850 tracking-tight">{greeting.title}</h2>
                  <p className="text-stone-500 text-xs leading-relaxed">{greeting.desc}</p>
                </div>
                {/* Micro-interactive Streak card */}
                <div className="flex items-center space-x-2.5 bg-white py-3 px-5 rounded-2xl shadow-sm border border-stone-200/50">
                  <Flame size={18} fill="#C08261" className="text-[#C08261] animate-bounce" />
                  <div className="text-left font-mono">
                    <span className="text-[16px] font-bold text-stone-800">{progress.streak}</span>
                    <p className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Ritual Diário</p>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN GRID: Left Breathing Space & Stats, Right Daily Devotional & Verse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT COLUMN: Breathing circle + identity tracker */}
                <div className="space-y-8">
                  <BreathingGuide />

                  {/* Spiritual identity recommendation slot */}
                  {currentIdentity ? (
                    <div className="bg-white/90 border border-stone-200/40 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <span className="text-[10px] font-mono uppercase text-[#C08261] font-semibold tracking-wide">Minha Essência</span>
                        <Feather size={14} className="text-stone-400" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-stone-800 font-medium">{currentIdentity.name}</h4>
                        <p className="text-stone-500 text-xs mt-1 leading-relaxed line-clamp-3">{currentIdentity.description}</p>
                      </div>
                      <div className="pt-2">
                        <button
                          id="btn-home-learn-profile"
                          onClick={() => setActiveSection('profiles')}
                          className="text-xs text-[#C08261] font-semibold flex items-center space-x-0.5 hover:underline"
                        >
                          <span>Estudar meu temperamento</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/40 border border-amber-200/40 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                      <Compass size={24} className="text-[#C08261]" />
                      <div className="space-y-1">
                        <h5 className="font-serif font-semibold text-stone-800 text-sm">Qual o seu Perfil dos 12?</h5>
                        <p className="text-stone-500 text-xs max-w-xs">
                          Faça nosso mapeamento silencioso comportamental para descobrir como sua alma melhor se conecta com Deus.
                        </p>
                      </div>
                      <button
                        id="btn-home-start-quiz"
                        onClick={() => setActiveSection('profiles')}
                        className="mt-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
                      >
                        Iniciar Mapeamento
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Devocional do dia & Verso */}
                <div className="space-y-8">
                  {/* Verso do Dia layout */}
                  <div className="bg-white border border-stone-200/50 p-6 rounded-3xl shadow-sm text-center relative overflow-hidden flex flex-col items-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#8C6239] block mb-3 font-semibold">Salmo do Dia</span>
                    <Heart size={14} className="text-[#C08261]/60 mb-2" />
                    <blockquote className="font-serif text-[17px] md:text-[19px] italic leading-relaxed text-stone-850 px-4">
                      "O SENHOR é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas."
                    </blockquote>
                    <cite className="font-mono text-[10px] text-stone-400 uppercase tracking-widest block mt-3 font-semibold">Salmos 23:1-2 • ACF</cite>
                  </div>

                  {/* Curated Daily Devotional snippet with real texts */}
                  <div className="bg-white border border-stone-200/50 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Leitura Recomendada de Hoje</span>
                      <span className="px-2 py-0.5 bg-[#C08261]/10 text-[#C08261] text-[9px] font-semibold font-mono rounded-full leading-none">Sossego</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif text-xl font-medium text-stone-800">A pressa é uma forma de ateísmo prático</h3>
                      <p className="text-stone-500 text-xs font-mono">{DEVOCIONAIS[0].scripture}</p>
                    </div>

                    <p className="text-stone-600 text-xs leading-relaxed text-justify line-clamp-3">
                      {DEVOCIONAIS[0].text}
                    </p>

                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[10px] text-stone-400 font-mono">Leitura de 5 min</span>
                      <button
                        id="btn-home-read-devotional"
                        onClick={() => setSelectedDevotional(DEVOCIONAIS[0])}
                        className="text-xs font-semibold text-[#C08261] hover:underline flex items-center space-x-0.5"
                      >
                        <span>Ler Devocional por Inteiro</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE PORT: BIBLE TRANSLATION VIEWER */}
          {activeSection === 'bible' && !selectedDevotional && (
            <motion.div
              key="bible"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <BibleReader
                onAddFavorite={handleAddFavoriteVerse}
                onRemoveFavorite={handleRemoveFavoriteVerse}
                onAddReflection={handleAddReflection}
                favorites={progress.favoriteVerses}
                reflections={progress.savedReflections}
              />
            </motion.div>
          )}

          {/* ACTIVE PORT: DEVOCIONAIS LIST */}
          {activeSection === 'devotionals' && !selectedDevotional && (
            <motion.div
              key="devotionals"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-8 text-left"
            >
              <div className="text-center max-w-xl mx-auto space-y-1.5 border-b border-stone-100 pb-5 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C08261] font-semibold">Conversas de Secreto</span>
                <h3 className="font-serif text-3xl font-light text-stone-800">Ritual dos 30 Devocionais</h3>
                <p className="text-stone-500 text-xs">Aprenda a andar de sandálias leves, longe de pesos religiosos e julgamentos.</p>
              </div>

              {/* Grid of 30 devotionals */}
              <div id="devotionals-library-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEVOCIONAIS.map((dev, index) => (
                  <div
                    id={`devotional-card-${dev.id}`}
                    key={dev.id}
                    onClick={() => setSelectedDevotional(dev)}
                    className="bg-white border border-stone-200/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-[190px]"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                        <span>Dia {index + 1}</span>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full font-semibold">{dev.category}</span>
                      </div>
                      <h4 className="font-serif text-base font-medium text-stone-800 line-clamp-2 leading-snug">{dev.title}</h4>
                      <p className="text-[11px] text-[#C08261] font-mono italic truncate">{dev.scripture}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-3 border-t border-stone-100 mt-2">
                      <span className="text-stone-400 font-mono">Contemplativo</span>
                      <span className="text-[#C08261] font-semibold hover:underline">Iniciar Leitura →</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ACTIVE PORT: SINGLE DEVOTIONAL EXPANDED VIEW (IMMERSIVE SEED READER) */}
          {selectedDevotional && (
            <motion.div
              key="single-devotional"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto space-y-8 text-left"
            >
              {/* Escape bar */}
              <button
                id="btn-exit-single-devotional"
                onClick={() => setSelectedDevotional(null)}
                className="flex items-center space-x-1 py-1.5 px-3 hover:bg-stone-150 rounded-xl text-xs text-stone-600 transition"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </button>

              {/* Devotional body card */}
              <div id="devotional-view-card" className="bg-white rounded-3xl p-8 md:p-12 border border-stone-200/40 shadow-md space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-stone-900 pointer-events-none">
                  <Feather size={200} />
                </div>

                <div className="border-b border-stone-100 pb-5 space-y-2">
                  <span className="px-2.5 py-0.5 bg-[#C08261]/10 text-[#C08261] text-[9px] font-semibold font-mono rounded-full tracking-wider uppercase">
                    Reflexão • {selectedDevotional.category}
                  </span>
                  <h2 className="text-3xl font-serif font-light text-stone-850 leading-snug">{selectedDevotional.title}</h2>
                  <p className="text-xs text-stone-400 font-mono italic font-semibold">{selectedDevotional.scripture}</p>
                </div>

                {/* Main Meditative Prose */}
                <p className="font-serif text-stone-700 text-[15px] md:text-base leading-relaxed text-justify space-y-4 whitespace-pre-line">
                  {selectedDevotional.text}
                </p>

                {/* Moment of quiet breathing block */}
                <div id="devotional-breathing-box" className="p-5 bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200/50 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-stone-700">
                    <Clock size={14} className="text-[#C08261] animate-spin" />
                    <span className="font-mono uppercase tracking-wider text-[10px]">Pausa para respiração</span>
                  </div>
                  <p className="text-xs text-stone-600 italic font-serif leading-relaxed">
                    {selectedDevotional.pauseInstruction}
                  </p>
                </div>

                {/* Prayer / Oração do Secreto */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 font-semibold block">Oração do Secreto</span>
                  <blockquote className="p-4 bg-amber-50/20 border-l-2 border-[#C08261] text-xs font-serif italic text-stone-700 leading-relaxed rounded-r-xl">
                    "{selectedDevotional.prayer}"
                  </blockquote>
                </div>

                {/* Grace in practice */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 font-semibold block">A Graça em prática no seu dia</span>
                  <p className="text-xs text-stone-600 leading-normal pl-1">
                    • {selectedDevotional.graceInPractice}
                  </p>
                </div>

                {/* Reflective input box */}
                <div className="border-t border-stone-100 pt-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-[#8C6239] font-semibold block">Pergunta Reflexiva</span>
                    <p className="text-xs italic text-stone-600 font-serif">"{selectedDevotional.reflectiveQuestion}"</p>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      id="input-devotional-journal-note"
                      type="text"
                      placeholder="Responda em silêncio o que queima em sua mente..."
                      className="bg-stone-50 border border-stone-250 rounded-xl px-4 py-2.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget as HTMLInputElement).value;
                          if (val.trim()) {
                            handleAddReflection(selectedDevotional.title, val);
                            (e.currentTarget as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      id="btn-save-journal-note"
                      onClick={(e) => {
                        const input = document.getElementById('input-devotional-journal-note') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          handleAddReflection(selectedDevotional.title, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-stone-900 border border-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center justify-center shadow-xs"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE PORT: INDENTIDADES ESPIRITUAIS 12 (GALLERY & QUIZ) */}
          {activeSection === 'profiles' && !selectedDevotional && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-2"
            >
              <ProfileSelector
                currentIdentityId={progress.currentIdentityId}
                onSelectIdentity={handleSelectIdentity}
              />
            </motion.div>
          )}

          {/* ACTIVE PORT: COMMUNITY FELLOWSHIP DINNER TABLES */}
          {activeSection === 'mesas' && !selectedDevotional && (
            <motion.div
              key="mesas"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-2"
            >
              <MesasSection />
            </motion.div>
          )}

          {/* ACTIVE PORT: EBOOK READING SHELF */}
          {activeSection === 'ebooks' && !selectedDevotional && (
            <motion.div
              key="ebooks"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-2"
            >
              <EbookReader
                completedChapters={progress.completedChapters}
                onCompleteChapter={handleCompleteChapter}
              />
            </motion.div>
          )}

          {/* ACTIVE PORT: ANDROID STUDENT SYSTEM AND CODE CONVERTER */}
          {activeSection === 'android_hub' && !selectedDevotional && (
            <motion.div
              key="android_hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col border-b border-stone-200 pb-5 mb-2 gap-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C08261] font-semibold">Configuração Sênior Android Studio</span>
                <h3 className="font-serif text-3xl font-light text-stone-800">Módulos Kotlin, Compose & Supabase</h3>
                <p className="text-stone-500 text-xs text-justify">
                  Este painel disponibiliza o projeto Android Studio real, compilável e completo baseado no SDK 35/Kotlin 2.0.
                  Navegue pelos arquivos no explorer para ler, copiar e importar cada camada MVVM funcional.
                </p>
              </div>

              <AndroidExporter />
            </motion.div>
          )}

          {/* ACTIVE PORT: USER EXPENSIVE PROGRESSION PROFILE */}
          {activeSection === 'profile' && !selectedDevotional && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-8 text-left"
            >
              <div className="border-b border-stone-105 pb-5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C08261] font-bold">Minha caminhada de Fé</span>
                <h3 className="font-serif text-3xl font-light text-stone-850 mt-0.5">Jornada Espiritual</h3>
                <p className="text-stone-500 text-xs">Acompanhe suas marcas de meditação íntima, notas e versículos favoritados.</p>
              </div>

              {/* Stat rows */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200/50 p-5 rounded-2xl flex flex-col align-left justify-center">
                  <span className="text-[9px] uppercase font-mono text-stone-400">Streak Contemplativo</span>
                  <div className="flex items-baseline space-x-1 mt-1.5 text-stone-800">
                    <span className="text-2xl font-bold font-mono">{progress.streak}</span>
                    <span className="text-xs text-stone-400">dias</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200/50 p-5 rounded-2xl flex flex-col align-left justify-center">
                  <span className="text-[9px] uppercase font-mono text-stone-400">Anotações Escritas</span>
                  <div className="flex items-baseline space-x-1 mt-1.5 text-stone-850">
                    <span className="text-2xl font-bold font-mono">{progress.savedReflections.length}</span>
                    <span className="text-xs text-stone-400">reflexões</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200/50 p-5 rounded-2xl flex flex-col align-left justify-center">
                  <span className="text-[9px] uppercase font-mono text-stone-400">Versos Salvos</span>
                  <div className="flex items-baseline space-x-1 mt-1.5 text-stone-800">
                    <span className="text-2xl font-bold font-mono">{progress.favoriteVerses.length}</span>
                    <span className="text-xs text-stone-400">passagens</span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200/50 p-5 rounded-2xl flex flex-col align-left justify-center">
                  <span className="text-[9px] uppercase font-mono text-stone-400">Capítulos de Ebooks</span>
                  <div className="flex items-baseline space-x-1 mt-1.5 text-stone-850">
                    <span className="text-2xl font-bold font-mono">{progress.completedChapters.length}</span>
                    <span className="text-xs text-stone-400">lidos</span>
                  </div>
                </div>
              </div>

              {/* Saved Verses & Reflections list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {/* Notes list */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-1.5 text-stone-800 border-b border-stone-100 pb-2">
                    <FileText size={16} className="text-[#C08261]" />
                    <h4 className="font-serif text-lg font-medium">Minhas Diários e Mementos</h4>
                  </div>

                  {progress.savedReflections.length === 0 ? (
                    <p className="text-stone-400 text-xs py-8 text-center italic border border-dashed border-stone-200 rounded-2xl">
                      Nenhuma anotação de diário guardada ainda. Explore os devocionais para escrever no secreto.
                    </p>
                  ) : (
                    <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                      {progress.savedReflections.map((ref) => (
                        <div key={ref.id} className="bg-white border border-stone-200/50 p-4.5 rounded-2xl text-left space-y-1 shadow-xs">
                          <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono">
                            <span className="font-semibold text-[#8C6239]">{ref.verseRef}</span>
                            <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed font-serif">"{ref.reflectionText}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorite verses */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-1.5 text-stone-850 border-b border-stone-100 pb-2">
                    <Bookmark size={15} className="text-[#C08261]" />
                    <h4 className="font-serif text-lg font-medium">Versículos Faróis Guardados</h4>
                  </div>

                  {progress.favoriteVerses.length === 0 ? (
                    <p className="text-stone-400 text-xs py-8 text-center italic border border-dashed border-stone-200 rounded-2xl">
                      Nenhum versículo favoritado ainda. Navegue na Bíblia e destaque sabedorias eternas.
                    </p>
                  ) : (
                    <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                      {progress.favoriteVerses.map((fav) => (
                        <div key={fav.ref} className="bg-white border border-stone-200/50 p-4.5 rounded-2xl text-left space-y-1.5 shadow-xs relative">
                          <button
                            id={`btn-remove-favorite-verse-${fav.ref}`}
                            onClick={() => handleRemoveFavoriteVerse(fav.ref)}
                            className="absolute top-3.5 right-3.5 text-stone-400 hover:text-stone-700 text-[10px]"
                          >
                            Remover
                          </button>
                          <span className="text-[10px] font-semibold text-[#C08261] font-mono">{fav.ref}</span>
                          <p className="text-xs text-stone-605 leading-relaxed font-serif italic text-stone-700">"{fav.text}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

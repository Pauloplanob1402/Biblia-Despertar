/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, Book, Coffee, User, Bookmark, Feather, 
  Flame, Sparkles, Clock, Heart, Calendar, ArrowLeft, 
  AlertCircle, ChevronRight, Terminal, FileText, Check, Code, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents import
import BreathingGuide from './components/BreathingGuide';
import BibleReader from './components/BibleReader';
import ProfileSelector from './components/ProfileSelector';
import EbookReader from './components/EbookReader';
import MesasSection from './components/MesasSection';
import AuthModal from './components/AuthModal';
import ChatDM from './components/ChatDM';
import ManifestoSection from './components/ManifestoSection';

// Core static databases
import { DEVOCIONAIS } from './data/devotionals';
import { DESPERTAR_PROFILES } from './data/profiles';
import { UserProgress, Devotional, SpiritualIdentity } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'bible' | 'devotionals' | 'profiles' | 'mesas' | 'ebooks' | 'profile'>('home');
  const [mesasSubTab, setMesasSubTab] = useState<'mesas' | 'pilgrims'>('mesas');
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [chatContact, setChatContact] = useState<{ uid: string; name: string; emoji?: string } | null>(null);

  // User profile persistent state engine
  const [progress, setProgress] = useState<UserProgress>({
    streak: 3, // Starting encouragement streak
    lastActive: new Date().toISOString().split('T')[0],
    savedReflections: [],
    favoriteVerses: [],
    completedChapters: [],
    currentIdentityId: null,
    answers: {}
  });

  // Listener for dynamic section change custom events across components
  useEffect(() => {
    const handleChangeSection = (e: Event) => {
      const targetDetail = (e as CustomEvent).detail;
      if (targetDetail) {
        setSelectedDevotional(null);
        setActiveSection(targetDetail);
      }
    };
    window.addEventListener('change-section', handleChangeSection);
    return () => window.removeEventListener('change-section', handleChangeSection);
  }, []);

  // Track Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user progress from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserProfile(data);
            setProgress({
              streak: data.streak ?? 3,
              lastActive: data.lastActive ?? new Date().toISOString().split('T')[0],
              savedReflections: data.savedReflections ?? [],
              favoriteVerses: data.favoriteVerses ?? [],
              completedChapters: data.completedChapters ?? [],
              currentIdentityId: data.currentIdentityId ?? null,
              answers: data.answers ?? {}
            });
          } else {
            // First time user, create progress in Firestore
            await setDoc(userDocRef, {
              uid: user.uid,
              name: user.displayName || 'Peregrino',
              email: user.email || '',
              avatarEmoji: '🕊️',
              streak: 3,
              lastActive: new Date().toISOString().split('T')[0],
              savedReflections: [],
              favoriteVerses: [],
              completedChapters: [],
              currentIdentityId: null,
              answers: {}
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error loading user profile from Firestore:", err);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        // Fallback to local storage for guests
        const saved = localStorage.getItem('despertar_progress_v2');
        if (saved) {
          try {
            setProgress(JSON.parse(saved));
          } catch (e) {
            // fallback
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state changes to Firestore/localStorage
  useEffect(() => {
    if (currentUser) {
      const syncToFirestore = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            streak: progress.streak,
            lastActive: progress.lastActive,
            savedReflections: progress.savedReflections,
            favoriteVerses: progress.favoriteVerses,
            completedChapters: progress.completedChapters,
            currentIdentityId: progress.currentIdentityId,
            answers: progress.answers
          }, { merge: true });
        } catch (err) {
          console.error("Error syncing progress to Firestore:", err);
        }
      };
      
      syncToFirestore();
    } else {
      localStorage.setItem('despertar_progress_v2', JSON.stringify(progress));
    }
  }, [progress, currentUser]);


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
      
      {/* MOBILE STICKY HEADER */}
      <header className="md:hidden w-full bg-white border-b border-stone-200/55 flex items-center justify-between p-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white font-serif font-semibold shadow-inner">
            D
          </div>
          <div className="text-left">
            <h1 className="font-serif text-[13px] font-bold tracking-tight text-stone-850">Somos o Despertar</h1>
            <span className="text-[11px] font-mono tracking-widest text-[#C08261] uppercase leading-none block font-semibold text-[10px]">Mesa e Caminho</span>
          </div>
        </div>
        
        <button 
          id="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(true)}
          className="px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-[#C08261] bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200/50 transition flex items-center space-x-1"
        >
          <span>Menu ☰</span>
        </button>
      </header>

      {/* MOBILE TRANSPARENT DRAWER & BACKDROP OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900 z-40 md:hidden"
            />
            {/* Slide-out drawer panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col h-full border-r border-stone-200 md:hidden"
            >
              {/* Brand Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white font-serif font-semibold shadow-inner">
                    D
                  </div>
                  <div className="text-left">
                    <h1 className="font-serif text-[14px] font-bold tracking-tight text-stone-850">Somos o Despertar</h1>
                    <span className="text-[11px] font-mono tracking-widest text-[#C08261] uppercase leading-none block font-semibold text-[10px]">Mesa e Caminho</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium text-[#C08261] bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200/50"
                >
                  Fechar ✕
                </button>
              </div>

              {/* User Profile context if exists */}
              {currentUser ? (
                <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-orange-100/80 flex items-center justify-center text-xl shadow-xs shrink-0 select-none">
                      {userProfile?.avatarEmoji || '🕊️'}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400 block font-bold leading-none mb-0.5">Identidade Ativa:</span>
                      <h5 className="font-serif text-sm font-semibold text-[#C08261] truncate leading-tight">
                        {userProfile?.name || currentUser.displayName || 'Buscador'}
                      </h5>
                    </div>
                  </div>
                  <button 
                    onClick={() => { signOut(auth); setChatContact(null); }}
                    className="text-[9px] uppercase font-mono font-bold tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-lg hover:bg-rose-100 transition duration-150 shrink-0 ml-2"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="p-5 border-b border-stone-100 bg-[#C08261]/5 text-left flex flex-col space-y-2.5">
                  <p className="text-[11px] text-stone-600 leading-normal font-sans">
                    Modo visitante ativo. Para salvar suas reflexões e conversar com outros peregrinos, entre ou crie sua conta.
                  </p>
                  <button
                    onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
                  >
                    Entrar / Criar Conta
                  </button>
                </div>
              )}

              {/* Drawer Navigation items list */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto w-full">
                <span className="text-[11.5px] uppercase font-mono tracking-wider font-semibold text-stone-400 block px-3 mb-2 text-left">Santuário do Secreto</span>
                
                <button
                  id="mobile-nav-home"
                  onClick={() => { setActiveSection('home'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'home' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Heart size={14} />
                    <span>Instante de Respiro</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-bible"
                  onClick={() => { setActiveSection('bible'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'bible' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Book size={14} />
                    <span>Palavra Viva</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-devotionals"
                  onClick={() => { setActiveSection('devotionals'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'devotionals' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Feather size={14} />
                    <span>30 Dias no Secreto</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-profiles"
                  onClick={() => { setActiveSection('profiles'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'profiles' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Compass size={14} />
                    <span>Caminhos do Coração</span>
                  </span>
                </button>

                <span className="text-[11.5px] uppercase font-mono tracking-wider font-semibold text-stone-400 block px-3 pt-5 mb-2 text-left">Mesa & Comunhão</span>

                <button
                  id="mobile-nav-mesas"
                  onClick={() => { setActiveSection('mesas'); setMesasSubTab('mesas'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'mesas' && mesasSubTab === 'mesas' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Coffee size={14} />
                    <span>Mesas de Comunhão</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-chat"
                  onClick={() => { setActiveSection('mesas'); setMesasSubTab('pilgrims'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'mesas' && mesasSubTab === 'pilgrims' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <MessageSquare size={14} />
                    <span>Chat & Conexões</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-ebooks"
                  onClick={() => { setActiveSection('ebooks'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'ebooks' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <FileText size={14} />
                    <span>Livros da Jornada</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-profile"
                  onClick={() => { setActiveSection('profile'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'profile' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <User size={14} />
                    <span>Minha Caminhada</span>
                  </span>
                </button>
              </nav>

              {/* Drawer streak indicators */}
              <div className="p-5 border-t border-stone-200 bg-stone-50 flex justify-between items-center text-stone-500 text-xs">
                <div className="flex items-center space-x-1">
                  <Flame size={14} className="text-[#C08261] animate-pulse" />
                  <span className="font-mono font-medium">{progress.streak} dias de quietude</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">v1.0</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* SIDEBAR: Permanent Desktop Premium Navigation Panel (Width: 280px) */}
      <aside className="hidden md:flex w-72 bg-white border-r border-stone-200/55 flex-col shrink-0 h-screen sticky top-0 z-30">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-serif font-semibold shadow-inner">
              D
            </div>
            <div className="text-left">
              <h1 className="font-serif text-[15px] font-bold tracking-tight text-stone-850">Somos o Despertar</h1>
              <span className="text-[11px] font-mono tracking-widest text-[#C08261] uppercase leading-none block font-semibold text-[10px]">Mesa e Caminho</span>
            </div>
          </div>
        </div>

        {/* User context card (Left mini-deck) */}
        {currentUser ? (
          <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between text-left">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-10 h-10 rounded-xl bg-orange-100/80 flex items-center justify-center text-xl shadow-xs shrink-0 select-none">
                {userProfile?.avatarEmoji || '🕊️'}
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400 block font-bold leading-none mb-0.5">Identidade Ativa:</span>
                <h5 className="font-serif text-sm font-semibold text-[#C08261] truncate leading-tight">
                  {userProfile?.name || currentUser.displayName || 'Buscador'}
                </h5>
              </div>
            </div>
            <button 
              onClick={() => { signOut(auth); setChatContact(null); }}
              className="text-[9px] uppercase font-mono font-bold tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-lg hover:bg-rose-100 transition duration-150 shrink-0 ml-2"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="p-5 border-b border-stone-100 bg-[#C08261]/5 text-left flex flex-col space-y-2.5">
            <p className="text-[11px] text-stone-600 leading-normal font-sans">
              Modo visitante ativo. Para salvar suas reflexões e conversar com outros peregrinos, entre ou crie sua conta.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full text-center py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
            >
              Entrar / Criar Conta
            </button>
          </div>
        )}

        {/* Navigation lists */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <span className="text-[11.5px] uppercase font-mono tracking-wider font-semibold text-stone-400 block px-3 mb-2 text-left">Santuário do Secreto</span>
          
          <button
            id="nav-home"
            onClick={() => { setActiveSection('home'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'home' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Heart size={14} />
              <span>Instante de Respiro</span>
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
              <span>Palavra Viva</span>
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
              <span>30 Dias no Secreto</span>
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
              <span>Caminhos do Coração</span>
            </span>
          </button>

          <span className="text-[11.5px] uppercase font-mono tracking-wider font-semibold text-stone-400 block px-3 pt-5 mb-2 text-left">Mesa & Comunhão</span>

          <button
            id="nav-mesas"
            onClick={() => { setActiveSection('mesas'); setMesasSubTab('mesas'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'mesas' && mesasSubTab === 'mesas' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Coffee size={14} />
              <span>Mesas de Comunhão</span>
            </span>
          </button>

          <button
            id="nav-chat"
            onClick={() => { setActiveSection('mesas'); setMesasSubTab('pilgrims'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'mesas' && mesasSubTab === 'pilgrims' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <MessageSquare size={14} />
              <span>Chat & Conexões</span>
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
              <span>Livros da Jornada</span>
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
              <span>Minha Caminhada</span>
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
                          <span>Relembrar meu jeito de caminhar</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/40 border border-amber-200/40 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                      <Compass size={24} className="text-[#C08261]" />
                      <div className="space-y-1">
                        <h5 className="font-serif font-semibold text-stone-800 text-sm">Qual o seu jeito de caminhar?</h5>
                        <p className="text-stone-500 text-xs max-w-xs">
                          Descubra qual destas 12 histórias se parece mais com o seu coração e como você se conecta com Ele, com os outros e consigo mesmo.
                        </p>
                      </div>
                      <button
                        id="btn-home-start-quiz"
                        onClick={() => setActiveSection('profiles')}
                        className="mt-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs"
                      >
                        Iniciar Descoberta
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

              {/* NOTA DO DESPERTAR — MANIFESTO SECTION */}
              <ManifestoSection
                onExploreMesas={() => setActiveSection('mesas')}
                onOpenCreateMesa={() => setActiveSection('mesas')}
                currentUserName={userProfile?.name || currentUser?.displayName || undefined}
                onAuthenticate={() => setShowAuthModal(true)}
                isAuthenticated={!!currentUser}
              />
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C08261] font-bold">Conversas de Secreto</span>
                <h3 className="font-serif text-3xl font-light text-stone-800">30 Dias no Secreto</h3>
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
                  <span className="px-3 py-1 bg-[#C08261]/10 text-[#C08261] text-xs font-semibold font-mono rounded-full tracking-wider uppercase">
                    Reflexão • {selectedDevotional.category}
                  </span>
                  <h2 className="text-3xl font-serif font-light text-stone-850 leading-snug">{selectedDevotional.title}</h2>
                  <p className="text-sm text-stone-550 font-mono italic font-semibold">{selectedDevotional.scripture}</p>
                </div>

                {/* Main Meditative Prose */}
                <p className="font-serif text-stone-800 text-base md:text-lg leading-relaxed text-justify space-y-4 whitespace-pre-line">
                  {selectedDevotional.text}
                </p>

                {/* Moment of quiet breathing block */}
                <div id="devotional-breathing-box" className="p-6 bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-150 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-stone-700">
                    <Clock size={14} className="text-[#C08261] animate-spin" />
                    <span className="font-mono uppercase tracking-wider text-xs">Pausa para respiração</span>
                  </div>
                  <p className="text-sm md:text-base text-stone-750 italic font-serif leading-relaxed">
                    {selectedDevotional.pauseInstruction}
                  </p>
                </div>

                {/* Prayer / Oração do Secreto */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-mono text-stone-550 font-semibold block">Oração do Secreto</span>
                  <blockquote className="p-5 bg-amber-50/20 border-l-2 border-[#C08261] text-sm md:text-base font-serif italic text-stone-850 leading-relaxed rounded-r-xl">
                    "{selectedDevotional.prayer}"
                  </blockquote>
                </div>

                {/* Grace in practice */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-mono text-stone-550 font-semibold block">A Graça em prática no seu dia</span>
                  <p className="text-sm md:text-base text-stone-750 leading-relaxed pl-1">
                    • {selectedDevotional.graceInPractice}
                  </p>
                </div>

                {/* Reflective input box */}
                <div className="border-t border-stone-100 pt-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-mono text-[#8C6239] font-semibold block">Pergunta Reflexiva</span>
                    <p className="text-sm md:text-base italic text-stone-850 font-serif leading-relaxed pl-1">"{selectedDevotional.reflectiveQuestion}"</p>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      id="input-devotional-journal-note"
                      type="text"
                      placeholder="Responda em silêncio o que queima em sua mente..."
                      className="bg-stone-50 border border-stone-250 rounded-xl px-4 py-3 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-[#C08261] text-stone-800"
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
                      className="px-5 py-3 bg-stone-900 border border-stone-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition flex items-center justify-center shadow-xs"
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

          {/* ACTIVE PORT: COMMUNITY FELLOWSHIP DINNER TABLES / CHAT */}
          {activeSection === 'mesas' && !selectedDevotional && (
            <motion.div
              key="mesas"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-2"
            >
              {chatContact ? (
                <ChatDM
                  contactUid={chatContact.uid}
                  contactName={chatContact.name}
                  contactEmoji={chatContact.emoji || '👥'}
                  onBack={() => setChatContact(null)}
                />
              ) : (
                <MesasSection
                  onStartChat={(uid, name, emoji) => setChatContact({ uid, name, emoji })}
                  onOpenAuth={() => setShowAuthModal(true)}
                  initialTab={mesasSubTab}
                />
              )}
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
                <h3 className="font-serif text-3xl font-light text-stone-850 mt-0.5">Minha Caminhada</h3>
                <p className="text-stone-500 text-xs">Acompanhe seus tempos de quietude, notas e versículos favoritos.</p>
              </div>

              {/* Stat rows */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200/50 p-5 rounded-2xl flex flex-col align-left justify-center">
                  <span className="text-[9px] uppercase font-mono text-stone-400">Constância Diária</span>
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
                    <h4 className="font-serif text-lg font-medium">Meus Diários e Reflexões</h4>
                  </div>

                  {progress.savedReflections.length === 0 ? (
                    <p className="text-stone-400 text-sm py-8 text-center italic border border-dashed border-stone-200 rounded-2xl">
                      Nenhuma anotação de diário guardada ainda. Explore os devocionais para escrever no secreto.
                    </p>
                  ) : (
                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {progress.savedReflections.map((ref) => (
                        <div key={ref.id} className="bg-white border border-stone-200/50 p-5 rounded-2xl text-left space-y-2 shadow-xs">
                          <div className="flex justify-between items-center text-xs text-stone-500 font-mono">
                            <span className="font-semibold text-[#8C6239]">{ref.verseRef}</span>
                            <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm md:text-base text-stone-700 leading-relaxed font-serif text-justify whitespace-pre-line">
                            "{ref.reflectionText}"
                          </p>
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
                    <p className="text-stone-400 text-sm py-8 text-center italic border border-dashed border-stone-200 rounded-2xl">
                      Nenhum versículo favoritado ainda. Navegue na Bíblia e destaque sabedorias eternas.
                    </p>
                  ) : (
                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {progress.favoriteVerses.map((fav) => (
                        <div key={fav.ref} className="bg-white border border-stone-200/50 p-5 rounded-2xl text-left space-y-2.5 shadow-xs relative">
                          <button
                            id={`btn-remove-favorite-verse-${fav.ref}`}
                            onClick={() => handleRemoveFavoriteVerse(fav.ref)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-xs transition"
                          >
                            Remover
                          </button>
                          <span className="text-xs font-semibold text-[#C08261] font-mono">{fav.ref}</span>
                          <p className="text-sm md:text-base leading-relaxed font-serif italic text-stone-800">
                            "{fav.text}"
                          </p>
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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

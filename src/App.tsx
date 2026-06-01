/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, Book, Coffee, User, Bookmark, Feather, 
  Flame, Sparkles, Clock, Heart, Calendar, ArrowLeft, 
  AlertCircle, ChevronRight, Terminal, FileText, Check, Code, MessageSquare, Award 
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
import WitnessesSection from './components/WitnessesSection';
import IgrejaPrimitiva from './components/IgrejaPrimitiva';

// Core static databases
import { DEVOCIONAIS } from './data/devotionals';
import { MULTIPLICACAO } from './data/multiplication';
import { DESPERTAR_PROFILES } from './data/profiles';
import { UserProgress, Devotional, SpiritualIdentity } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'bible' | 'devotionals' | 'profiles' | 'mesas' | 'ebooks' | 'profile' | 'respiro' | 'testemunhas' | 'primitiva'>('home');
  const [mesasSubTab, setMesasSubTab] = useState<'mesas' | 'pilgrims'>('mesas');
  const [activeDevotionalTab, setActiveDevotionalTab] = useState<'comunhao' | 'multiplicacao'>('comunhao');
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [chatContact, setChatContact] = useState<{ uid: string; name: string; emoji?: string } | null>(null);

  // Growth loop & Norman Feedback states
  const [committedToastMsg, setCommittedToastMsg] = useState<string | null>(null);
  const [homeRef, setHomeRef] = useState("");
  const [homeText, setHomeText] = useState("");

  const handleCopyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCommittedToastMsg("Enviado com amor! Texto copiado para colar no WhatsApp. 🕊️");
      setTimeout(() => setCommittedToastMsg(null), 3000);
    } catch (e) {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCommittedToastMsg("Enviado com amor! Texto copiado para colar no WhatsApp. 🕊️");
      setTimeout(() => setCommittedToastMsg(null), 3000);
    }
  };

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
    setProgress((prev) => {
      const completed = prev.completedChallenges || [];
      const newCompleted = completed.includes('reflection') ? completed : [...completed, 'reflection'];
      let newPerfectDays = prev.perfectDaysCount || 0;
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayInCompleted = prev.lastActive === todayStr;
      let newStreak = prev.streak;
      if (!todayInCompleted) {
        newStreak = prev.streak + 1;
      }

      if (newCompleted.length === 3 && !completed.includes('reflection')) {
        newPerfectDays += 1;
        setCommittedToastMsg("Perfeito! Você concluiu todos os compromissos de hoje e nutriu seu altar! 🌟🌿 (+1 dia de perfeita comunhão)");
        setTimeout(() => setCommittedToastMsg(null), 5000);
      } else {
        setCommittedToastMsg(`Sussurro guardado com sucesso! +2 sementes de quietude cultivadas. ✨`);
        setTimeout(() => setCommittedToastMsg(null), 3000);
      }

      return {
        ...prev,
        savedReflections: [newRef, ...prev.savedReflections],
        completedChallenges: newCompleted,
        perfectDaysCount: newPerfectDays,
        streak: newStreak,
        lastActive: todayStr,
        maxStreak: Math.max(prev.maxStreak || 0, newStreak)
      };
    });
  };

  // Phase 2 Habits and Daily Challenges Tracker
  const handleCompleteChallenge = (type: 'breathe' | 'read' | 'reflection') => {
    setProgress(prev => {
      const completed = prev.completedChallenges || [];
      if (completed.includes(type)) return prev;
      
      const newCompleted = [...completed, type];
      let newPerfectDays = prev.perfectDaysCount || 0;
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayInCompleted = prev.lastActive === todayStr;
      let newStreak = prev.streak;
      if (!todayInCompleted) {
        newStreak = prev.streak + 1;
      }

      if (newCompleted.length === 3) {
        newPerfectDays += 1;
        setCommittedToastMsg("Perfeito! Você concluiu todos os compromissos de hoje e nutriu seu altar! 🌟🌿 (+1 dia de perfeita comunhão)");
        setTimeout(() => setCommittedToastMsg(null), 5000);
      } else {
        setCommittedToastMsg(`Passo concluído com fé! +2 sementes cultivadas. ✨`);
        setTimeout(() => setCommittedToastMsg(null), 3000);
      }
      
      return {
        ...prev,
        completedChallenges: newCompleted,
        perfectDaysCount: newPerfectDays,
        streak: newStreak,
        lastActive: todayStr,
        maxStreak: Math.max(prev.maxStreak || 0, newStreak)
      };
    });
  };

  const handleToggleChallenge = (type: 'breathe' | 'read' | 'reflection') => {
    setProgress(prev => {
      const completed = prev.completedChallenges || [];
      const todayStr = new Date().toISOString().split('T')[0];
      if (completed.includes(type)) {
        // Toggle off
        return {
          ...prev,
          completedChallenges: completed.filter(c => c !== type)
        };
      } else {
        // Toggle on
        const newCompleted = [...completed, type];
        let newPerfectDays = prev.perfectDaysCount || 0;
        const todayInCompleted = prev.lastActive === todayStr;
        let newStreak = prev.streak;
        if (!todayInCompleted) {
          newStreak = prev.streak + 1;
        }

        if (newCompleted.length === 3) {
          newPerfectDays += 1;
          setCommittedToastMsg("Perfeito! Você concluiu todos os compromissos de hoje e nutriu seu altar! 🌟🌿");
          setTimeout(() => setCommittedToastMsg(null), 4000);
        } else {
          setCommittedToastMsg(`Passo concluído com fé! ✨`);
          setTimeout(() => setCommittedToastMsg(null), 2500);
        }

        return {
          ...prev,
          completedChallenges: newCompleted,
          perfectDaysCount: newPerfectDays,
          streak: newStreak,
          lastActive: todayStr,
          maxStreak: Math.max(prev.maxStreak || 0, newStreak)
        };
      }
    });
  };

  const handleBreathingCycleCompleted = () => {
    setProgress(prev => ({
      ...prev,
      breathingCyclesCount: (prev.breathingCyclesCount || 0) + 1
    }));
    handleCompleteChallenge('breathe');
  };

  const handleBibleChapterRead = (bookId: string, bookName: string, chapter: number) => {
    setProgress(prev => {
      if (prev.lastReadBibleInfo?.bookId === bookId && prev.lastReadBibleInfo?.chapter === chapter) {
        return prev;
      }
      return {
        ...prev,
        lastReadBibleInfo: { bookId, bookName, chapter }
      };
    });
    handleCompleteChallenge('read');
  };

  const handleEbookChapterRead = (ebookId: string, ebookTitle: string, chapterIndex: number, chapterTitle: string) => {
    setProgress(prev => {
      if (prev.lastReadEbookInfo?.ebookId === ebookId && prev.lastReadEbookInfo?.chapterIndex === chapterIndex) {
        return prev;
      }
      return {
        ...prev,
        lastReadEbookInfo: { ebookId, ebookTitle, chapterIndex, chapterTitle }
      };
    });
    handleCompleteChallenge('read');
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

  // Handle devotional completion mark
  const handleCompleteDevotional = (devotionalId: string) => {
    setProgress((prev) => {
      if (prev.completedChapters.includes(devotionalId)) return prev;
      return {
        ...prev,
        completedChapters: [...prev.completedChapters, devotionalId],
        streak: prev.streak + (prev.lastActive !== new Date().toISOString().split('T')[0] ? 1 : 0),
        lastActive: new Date().toISOString().split('T')[0]
      };
    });
  };

  // Simulates fully completed communion for developers to test progression flow instantly
  const handleSimulateAllComunhao = () => {
    setProgress((prev) => {
      const allDevocionaisIds = DEVOCIONAIS.map(d => d.id);
      const updatedChapters = Array.from(new Set([...prev.completedChapters, ...allDevocionaisIds]));
      return {
        ...prev,
        completedChapters: updatedChapters
      };
    });
    setCommittedToastMsg("Comunhão Íntima concluída para testes do Despertador! 🕊️");
    setTimeout(() => setCommittedToastMsg(null), 3500);
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
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col md:flex-row antialiased selection:bg-[#C08261]/20">
      
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
                    Seu Diário de quietude está seguro de forma <strong>100% off-line</strong> neste navegador! 🏛️ Para sincronizar suas reflexões e conversar com a nuvem de peregrinos, crie uma conta gratuita:
                  </p>
                  <button
                    onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition cursor-pointer"
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
                    <Sparkles size={14} />
                    <span>Início & Diário</span>
                  </span>
                </button>

                <button
                  id="mobile-nav-primitiva"
                  onClick={() => { setActiveSection('primitiva'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-semibold transition ${
                    activeSection === 'primitiva' ? 'bg-[#C08261]/10 text-[#C08261] font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Flame size={14} className="text-[#C08261]" />
                    <span>Igreja Primitiva ⛪</span>
                  </span>
                  <span className="text-[9px] bg-[#C08261] text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold">Fundador</span>
                </button>

                <button
                  id="mobile-nav-respiro"
                  onClick={() => { setActiveSection('respiro'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'respiro' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Heart size={14} />
                    <span>Respiro do Secreto</span>
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
                    <span>40 Dias Despertando</span>
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

                <button
                  id="mobile-nav-testemunhas"
                  onClick={() => { setActiveSection('testemunhas'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
                    activeSection === 'testemunhas' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Award size={14} />
                    <span>Nuvem de Testemunhas</span>
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
              Progresso seguro de forma <strong>100% vitalícia e off-line</strong> neste navegador! 🏛️ Crie sua credencial se desejar partilhar testemunhos e meditar em outros aparelhos.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full text-center py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition cursor-pointer"
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
              <Sparkles size={14} />
              <span>Início & Diário</span>
            </span>
            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />
          </button>

          <button
            id="nav-primitiva"
            onClick={() => { setActiveSection('primitiva'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-semibold transition ${
              activeSection === 'primitiva' ? 'bg-[#C08261]/10 text-[#C08261] font-bold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Flame size={14} className="text-[#C08261]" />
              <span>Igreja Primitiva ⛪</span>
            </span>
            <span className="text-[9px] bg-[#C08261] text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold">Fundador</span>
          </button>

          <button
            id="nav-respiro"
            onClick={() => { setActiveSection('respiro'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'respiro' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Heart size={14} />
              <span>Respiro do Secreto</span>
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
              <span>40 Dias Despertando</span>
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

          <button
            id="nav-testemunhas"
            onClick={() => { setActiveSection('testemunhas'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-medium transition ${
              activeSection === 'testemunhas' ? 'bg-[#C08261]/10 text-[#C08261] font-semibold' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Award size={14} />
              <span>Nuvem de Testemunhas</span>
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
              <div id="emotional-banner" className="relative group overflow-hidden bg-gradient-to-br from-[#1E1C1A] via-[#121110] to-[#0A0A09] p-8 md:p-10 rounded-3xl border border-[#DCAE6C]/20 shadow-xl space-y-6">
                {/* Golden Sunburst background effect */}
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-b from-[#DCAE6C]/10 to-transparent pointer-events-none rounded-full blur-3xl -mr-16 -mt-16 opacity-80" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 w-full">
                  <div className="space-y-3.5 max-w-2xl text-left">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs uppercase font-mono tracking-widest text-[#DCAE6C] bg-[#DCAE6C]/10 border border-[#DCAE6C]/20 font-bold">
                      <Sparkles size={11} className="text-[#DCAE6C]" />
                      <span>A Bíblia do Despertar</span>
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-200 tracking-tight leading-tight">
                      <span className="text-stone-200/35">A Palavra que </span><span className="text-[#DCAE6C] font-semibold">acorda</span><span className="text-stone-200/35">.</span><br />
                      <span className="text-[#DCAE6C]/35">A Verdade que </span><span className="text-[#DCAE6C] font-semibold">transforma</span><span className="text-stone-200/35">.</span><br />
                      <span className="text-stone-200/35">A Vida que </span><span className="text-[#DCAE6C] font-semibold">floresce</span><span className="text-stone-200/35">.</span>
                    </h2>
                    <p className="text-stone-400 text-xs md:text-sm leading-relaxed font-sans max-w-lg mt-2">
                      Você já imaginou ter uma Bíblia criada para ajudar uma nova geração a despertar para aquilo que Deus sonhou? Desenvolva uma caminhada diária com Deus, compreenda as Escrituras e viva uma fé autêntica.
                    </p>
                  </div>

                  {/* Micro-interactive Streak card */}
                  <div className="flex items-center space-x-3.5 bg-[#1F1D1B] py-3.5 px-6 rounded-2xl shadow-lg border border-[#DCAE6C]/15 backdrop-blur-xs shrink-0 self-start md:self-auto">
                    <Flame size={22} fill="#DCAE6C" className="text-[#DCAE6C] animate-pulse" />
                    <div className="text-left font-mono">
                      <span className="text-xl font-bold text-[#DCAE6C]">{progress.streak} dias</span>
                      <p className="text-[9px] text-stone-450 uppercase tracking-widest font-semibold mt-0.5">Sintonia Diária</p>
                    </div>
                  </div>
                </div>

                {/* Scannable Grid featuring the brand benefits */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-[#DCAE6C]/10 relative z-10 text-left">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#DCAE6C] uppercase tracking-wider block">✔ Leitura Ativa</span>
                    <p className="text-[11px] text-stone-400 leading-normal">Aproximação diária e simples com o Logos divino</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#DCAE6C] uppercase tracking-wider block">✔ Planos Práticos</span>
                    <p className="text-[11px] text-stone-400 leading-normal">Desafios projetados para cada fase da sua fé</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#DCAE6C] uppercase tracking-wider block">✔ Devocionais Livres</span>
                    <p className="text-[11px] text-stone-400 leading-normal">Meditações focadas na graça, livres de cobranças</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#DCAE6C] uppercase tracking-wider block">✔ 12 Inspiradores</span>
                    <p className="text-[11px] text-stone-400 leading-normal">Encontre seu jeito único e importante para o Reino</p>
                  </div>
                </div>
              </div>

              {/* PHASE TWO: COMPROMISSOS DE QUIETUDE, CONSTÂNCIA & RETOMAR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. COMPROMISSOS DE QUIETUDE CARD */}
                <div id="card-compromissos-dia" className="bg-white border border-[#C08261]/20 rounded-3xl p-5 shadow-sm space-y-4 md:col-span-2 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#C08261]/3 pointer-events-none rounded-bl-full" />
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Compromissos de Hoje</span>
                      <h4 className="font-serif text-base font-bold text-stone-850 flex items-center gap-1.5">
                        Altar de Quietude Diária 🌿
                      </h4>
                    </div>
                    <span id="tracker-completed-challenges-count" className="text-xs bg-stone-100 text-stone-605 font-mono px-2.5 py-1 rounded-full font-bold">
                      {(progress.completedChallenges || []).length}/3 Concluídos
                    </span>
                  </div>

                  <p className="text-stone-500 text-xs leading-relaxed max-w-xl">
                    Desenvolva constância sem o fardo da obrigação. Cultive pequenas interações de graça e marque o que conseguiu realizar em espírito.
                  </p>

                  <div className="space-y-3 pt-1">
                    {/* Item 1: Respiração */}
                    <div 
                      id="challenge-item-breathe"
                      onClick={() => handleToggleChallenge('breathe')}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none gap-2 ${
                        (progress.completedChallenges || []).includes('breathe') 
                          ? 'bg-emerald-50/50 border-emerald-200/50' 
                          : 'bg-stone-50/50 border-stone-150 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          (progress.completedChallenges || []).includes('breathe') 
                            ? 'bg-emerald-500 border-transparent text-white' 
                            : 'border-stone-300'
                        }`}>
                          {(progress.completedChallenges || []).includes('breathe') && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <span className="text-xs font-serif font-bold text-stone-800">🌬️ Respiração no Secreto</span>
                          <span className="text-[10px] text-stone-400 font-sans block">Pratique a quietude de 4 segundos imersiva (+2 sementes)</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection('respiro');
                        }}
                        className="text-[10px] font-semibold text-[#C08261] hover:underline self-start sm:self-auto"
                      >
                        Praticar ➔
                      </button>
                    </div>

                    {/* Item 2: Leitura */}
                    <div 
                      id="challenge-item-read"
                      onClick={() => handleToggleChallenge('read')}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none gap-2 ${
                        (progress.completedChallenges || []).includes('read') 
                          ? 'bg-emerald-50/50 border-emerald-200/50' 
                          : 'bg-stone-50/50 border-stone-150 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          (progress.completedChallenges || []).includes('read') 
                            ? 'bg-emerald-500 border-transparent text-white' 
                            : 'border-stone-300'
                        }`}>
                          {(progress.completedChallenges || []).includes('read') && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <span className="text-xs font-serif font-bold text-stone-800">📖 Comer do Logos Divino</span>
                          <span className="text-[10px] text-stone-400 font-sans block">Cultive sabedoria lendo a Bíblia ou os Ebooks (+2 sementes)</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection('bible');
                        }}
                        className="text-[10px] font-semibold text-[#C08261] hover:underline self-start sm:self-auto"
                      >
                        Ler Bíblia ➔
                      </button>
                    </div>

                    {/* Item 3: Reflexão */}
                    <div 
                      id="challenge-item-reflection"
                      onClick={() => handleToggleChallenge('reflection')}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none gap-2 ${
                        (progress.completedChallenges || []).includes('reflection') 
                          ? 'bg-emerald-50/50 border-emerald-200/50' 
                          : 'bg-stone-50/50 border-stone-150 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          (progress.completedChallenges || []).includes('reflection') 
                            ? 'bg-emerald-500 border-transparent text-white' 
                            : 'border-stone-300'
                        }`}>
                          {(progress.completedChallenges || []).includes('reflection') && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <span className="text-xs font-serif font-bold text-stone-800">🖋️ Sussurro no Altar</span>
                          <span className="text-[10px] text-stone-400 font-sans block">Escreva uma oração ou reflexão sincera de conexão (+2 sementes)</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const altarSection = document.getElementById('altar-scripture-ref');
                          if (altarSection) altarSection.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[10px] font-semibold text-[#C08261] hover:underline self-start sm:self-auto"
                      >
                        Escrever ➔
                      </button>
                    </div>
                  </div>

                  {/* Perfect Day banner */}
                  {(progress.completedChallenges || []).length === 3 && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 bg-amber-50/80 border border-[#DCAE6C]/30 rounded-2xl flex items-center space-x-3 text-left shadow-xs mt-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#DCAE6C]/10 flex items-center justify-center text-base">🌟</div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-serif font-bold text-stone-850">Comunhão Perfeita Consolidada!</p>
                        <p className="text-[10px] text-stone-600">Você concluiu todos os seus marcos de hoje e conquistou +4 sementes bônus! Seu altar brilha.</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 2. CONSTÂNCIA CARD / STREAK STATS */}
                <div id="card-constancia-habitos" className="bg-[#FAF8F5]/90 border border-stone-200/55 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-left h-full">
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-stone-200/50 space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Marcos de Comunhão</span>
                      <h4 className="font-serif text-base font-bold text-stone-800">Constância Diária 🔥</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-2xl border border-stone-150 text-center">
                        <Flame size={18} fill="#C08261" className="text-[#C08261] mx-auto mb-1 animate-pulse" />
                        <span id="streak-indicator-val" className="text-sm font-bold text-stone-850 font-serif block">{progress.streak} dias</span>
                        <span className="text-[9px] text-stone-400 uppercase font-mono tracking-wider block">Sequência</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-stone-150 text-center">
                        <Award size={18} className="text-[#C08261] mx-auto mb-1" />
                        <span id="max-streak-indicator-val" className="text-sm font-bold text-stone-850 font-serif block">{progress.maxStreak || Math.max(3, progress.streak)} dias</span>
                        <span className="text-[9px] text-stone-400 uppercase font-mono tracking-wider block">Recorde</span>
                      </div>
                    </div>

                    {/* Cycle counter statistics block for Phase 2 Retention */}
                    <div className="bg-white p-3.5 rounded-2xl border border-stone-150 space-y-2">
                      <span className="text-[9.5px] uppercase font-mono tracking-widest font-bold text-[#C08261] block">Ciclos de Quietude</span>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-550 font-sans">Sessões Respiratórias:</span>
                        <span id="cycles-count-val" className="font-serif font-bold text-stone-800">{progress.breathingCyclesCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-[11px]">
                        <span className="text-stone-550 font-sans">Dias Perfeitos de Aliança:</span>
                        <span id="perfect-days-count-val" className="font-serif font-bold text-stone-800">{progress.perfectDaysCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* 7-DAY VISUAL TRACKER CHECKS */}
                  <div className="pt-3 mt-3 border-t border-stone-200/50 space-y-1.5">
                    <span className="text-[9.5px] uppercase font-mono text-stone-400 font-bold block">Histórico de Aliança Semanal</span>
                    <div className="flex justify-between items-center">
                      {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => {
                        const isToday = idx === 4;
                        const isDone = isToday && (progress.completedChallenges || []).length > 0;
                        return (
                          <div key={idx} className="flex flex-col items-center space-y-1">
                            <span className="text-[9px] font-mono font-bold text-stone-605">{day}</span>
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              isDone 
                                ? 'bg-[#C08261] text-white' 
                                : isToday 
                                  ? 'border-2 border-[#C08261] text-[#C08261] animate-pulse bg-white' 
                                  : 'bg-stone-200 text-stone-450 border border-stone-250/30'
                            }`}>
                              {isDone ? '✓' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* RETOMAR DE ONDE PAROU CARD */}
              {(progress.lastReadBibleInfo || progress.lastReadEbookInfo) && (
                <div id="card-retomar-caminhada" className="bg-[#FAF8F5]/60 border border-[#C08261]/25 rounded-3xl p-5 text-left space-y-3.5">
                  <div className="flex items-center space-x-1.5 ">
                    <span className="w-2 h-2 bg-[#C08261] rounded-full animate-ping" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C08261]">Retomar Caminhada</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bible Card */}
                    {progress.lastReadBibleInfo && (
                      <div id="resume-bible-box" className="bg-white border border-stone-200 rounded-2xl p-4 flex justify-between items-center hover:shadow-md transition duration-300">
                        <div className="space-y-1 pr-2">
                          <span className="text-[9px] font-mono uppercase font-bold text-stone-400">Palavra de Alívio</span>
                          <h5 id="resume-bible-ref-title" className="font-serif font-bold text-stone-850 text-sm">
                            {progress.lastReadBibleInfo.bookName} • Capítulo {progress.lastReadBibleInfo.chapter}
                          </h5>
                          <p className="text-[10px] text-stone-500 font-sans">Continue saboreando o Logos divino de onde você parou.</p>
                        </div>
                        <button
                          id="btn-resume-bible"
                          onClick={() => setActiveSection('bible')}
                          className="px-3.5 py-1.5 bg-[#C08261] hover:bg-[#b07353] text-white text-[11px] font-bold font-serif rounded-xl transition cursor-pointer whitespace-nowrap shadow-xs shrink-0"
                        >
                          Retomar ➔
                        </button>
                      </div>
                    )}

                    {/* Ebook Card */}
                    {progress.lastReadEbookInfo && (
                      <div id="resume-ebook-box" className="bg-white border border-stone-200 rounded-2xl p-4 flex justify-between items-center hover:shadow-md transition duration-300 w-full overflow-hidden">
                        <div className="space-y-1 pr-2 max-w-[70%]">
                          <span className="text-[9px] font-mono uppercase font-bold text-stone-400">Livro de Inspiração</span>
                          <h5 id="resume-ebook-title" className="font-serif font-bold text-stone-850 text-sm truncate">
                            {progress.lastReadEbookInfo.ebookTitle}
                          </h5>
                          <p id="resume-ebook-chapter-sub" className="text-[10px] text-stone-500 font-sans truncate">Capítulo {progress.lastReadEbookInfo.chapterIndex + 1}: {progress.lastReadEbookInfo.chapterTitle}</p>
                        </div>
                        <button
                          id="btn-resume-ebook"
                          onClick={() => setActiveSection('ebooks')}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-[11px] font-bold font-serif rounded-xl transition cursor-pointer whitespace-nowrap shadow-xs shrink-0"
                        >
                          Continuar ➔
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CAMINHO PRIMITIVO PROMOTION BANNER */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-[#C08261]/40 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left shadow-xs">
                <div className="space-y-2 md:max-w-2xl">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#C08261] flex items-center gap-1.5 bg-[#C08261]/10 px-2.5 py-1 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 bg-[#C08261] rounded-full animate-ping" />
                    Movimento de Co-Fundadores
                  </span>
                  <h4 className="font-serif text-lg md:text-xl font-bold text-stone-850">
                    "A igreja primitiva não tinha aplicativo. Mas funcionava assim."
                  </h4>
                  <p className="text-stone-605 text-xs md:text-sm leading-relaxed">
                    Sintonize-se com a economia da graça e serviço descentralizados das primeiras comunidades. Apoie financeiramente a infraestrutura da Bíblia do Despertar e reserve seu lugar de pioneiro.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('primitiva')}
                  className="py-3 px-6 bg-stone-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition active:scale-95 shrink-0 shadow-md cursor-pointer whitespace-nowrap"
                >
                  Conhecer Movimento & Apoiar 🕊️
                </button>
              </div>

              {/* TWO COLUMN GRID: Left Breathing Space & Stats, Right Daily Devotional & Verse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT COLUMN: Breathing circle + identity tracker */}
                <div className="space-y-8">
                  <BreathingGuide onCycleComplete={handleBreathingCycleCompleted} />

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
                  <div className="bg-white border border-stone-200/50 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden flex flex-col">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] block mb-3 font-bold text-center">Salmo do Dia</span>
                    <div className="border-l-4 border-[#C08261] pl-5 italic text-stone-850 font-serif text-lg md:text-xl lg:text-2xl leading-relaxed my-4 text-justify">
                      "O SENHOR é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas."
                    </div>
                    <cite className="font-mono text-xs text-stone-400 uppercase tracking-widest block text-right font-semibold mt-1">— Salmos 23:1-2 • ACF</cite>
                  </div>

                  {/* MEU ALTAR DE REFLEXÕES DO DIA */}
                  <div className="bg-white border border-[#C08261]/25 p-6 rounded-3xl shadow-sm space-y-4 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C08261]/5 to-transparent pointer-events-none rounded-bl-full" />
                    
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <span className="text-[10.5px] font-mono uppercase text-[#C08261] font-bold tracking-wider flex items-center gap-1.5 leading-none">
                        <Feather size={12} className="text-[#C08261]" />
                        Meu Altar de Reflexão de Hoje
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      <p className="text-stone-500 text-[11px] leading-relaxed">
                        O que o Espírito sussurrou ao seu coração hoje? Escreva e guarde de forma segura no seu diário de quietude de forma instantânea.
                      </p>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          id="altar-scripture-ref"
                          placeholder="Referência Bíblica (Opcional, ex: João 15:5)"
                          value={homeRef}
                          onChange={(e) => setHomeRef(e.target.value)}
                          className="w-full bg-stone-50/85 border border-stone-200/50 rounded-xl py-2 px-3 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                        />
                        <textarea
                          rows={2.5}
                          id="altar-reflection-text"
                          placeholder="Escreva sua oração ou meditação aqui..."
                          value={homeText}
                          onChange={(e) => setHomeText(e.target.value)}
                          className="w-full bg-stone-50/85 border border-stone-200/50 rounded-xl py-2 px-3 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C08261] resize-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!homeText.trim()) return;
                          handleAddReflection(homeRef.trim() || "Altar de Quietude", homeText);
                          setHomeText("");
                          setHomeRef("");
                          setCommittedToastMsg("Reflexão guardada com sucesso! Seu dia de quietude foi renovado! 🏛️🕊️");
                          setTimeout(() => setCommittedToastMsg(null), 3500);
                        }}
                        disabled={!homeText.trim()}
                        className="w-full py-2.5 bg-stone-900 hover:bg-black disabled:bg-stone-100 disabled:text-stone-400 text-white text-xs font-bold font-serif rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <span>Sussurrar no Altar 🖋️</span>
                      </button>
                    </div>
                  </div>

                  {/* Curated Daily Devotional snippet with real texts */}
                  <div className="bg-white border border-stone-200/50 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                      <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Leitura Recomendada de Hoje</span>
                      <span className="px-2 py-0.5 bg-[#C08261]/10 text-[#C08261] text-[9px] font-semibold font-mono rounded-full leading-none">{DEVOCIONAIS[0].category}</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif text-xl font-medium text-stone-800">{DEVOCIONAIS[0].title}</h3>
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
              className="space-y-6 text-center"
            >
              <div className="space-y-3 max-w-4xl mx-auto py-2">
                <span className="text-xs md:text-sm font-mono uppercase tracking-widest text-[#C08261] font-bold block mb-1.5">Leitura Sagrada</span>
                <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 tracking-tight leading-tight">Escrituras do Despertar</h3>
                <p className="text-stone-500 text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto mt-2">
                  Sintonize sua atenção com as revelações e inspirações guardadas no Logos Divino, mergulhando no silêncio da Palavra.
                </p>
              </div>

              <BibleReader
                onAddFavorite={handleAddFavoriteVerse}
                onRemoveFavorite={handleRemoveFavoriteVerse}
                onAddReflection={handleAddReflection}
                favorites={progress.favoriteVerses}
                reflections={progress.savedReflections}
                initialBookId={progress.lastReadBibleInfo?.bookId}
                initialChapter={progress.lastReadBibleInfo?.chapter}
                onChapterRead={handleBibleChapterRead}
              />
            </motion.div>
          )}

          {/* ACTIVE PORT: DEVOCIONAIS LIST */}
          {activeSection === 'devotionals' && !selectedDevotional && (() => {
            const currentList = activeDevotionalTab === 'comunhao' ? DEVOCIONAIS : MULTIPLICACAO;
            
            // Check if Comunhão has been fully completed (all 40 days of DEVOCIONAIS)
            const totalComunhaoDays = DEVOCIONAIS.length; // 40
            const completedComunhaoDays = DEVOCIONAIS.filter(dev => progress.completedChapters.includes(dev.id)).length;
            const isComunhaoFullyComplete = completedComunhaoDays >= totalComunhaoDays;

            const completedCount = currentList.filter(dev => progress.completedChapters.includes(dev.id)).length;
            const completionPercent = Math.round((completedCount / currentList.length) * 100);
            
            // Find today's recommended day (first incomplete)
            const recommendedDev = currentList.find(dev => !progress.completedChapters.includes(dev.id)) || currentList[0];
            const recommendedIndex = currentList.findIndex(dev => dev.id === recommendedDev.id);

            return (
              <motion.div
                key="devotionals"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8 text-left max-w-5xl mx-auto"
              >
                {/* Header Banner with Premium Styling */}
                <div className="text-center py-6 max-w-3xl mx-auto space-y-3">
                  <span className="text-xs md:text-sm font-mono uppercase tracking-widest text-[#C08261] font-bold block mb-1.5">Caminho de Despertar</span>
                  <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 tracking-tight leading-tight">
                    Consagração Diária e Preparação para o Chamado
                  </h3>
                  <p className="text-stone-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-sans mt-2">
                    Cultive a presença invisível através do silêncio devocional e multiplique o chamado.
                  </p>
                </div>

                {/* Highly intuitive segmented choice control (Krug's Ease of Decision & Norman Affordance) */}
                <div id="devotionals-segmented-control" className="flex justify-center p-1 bg-stone-150/60 rounded-2xl max-w-md mx-auto border border-stone-200/50">
                  <button
                    id="tab-devotional-comunhao"
                    onClick={() => setActiveDevotionalTab('comunhao')}
                    className={`flex-1 flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                      activeDevotionalTab === 'comunhao'
                        ? 'bg-white text-[#C08261] shadow-sm font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <span className="text-xs font-serif leading-none">40 Dias Despertando</span>
                    <span className="text-[9px] font-mono uppercase opacity-75 mt-0.5 tracking-wider">Comunhão Íntima</span>
                  </button>
                  <button
                    id="tab-devotional-multiplicacao"
                    onClick={() => setActiveDevotionalTab('multiplicacao')}
                    className={`flex-1 flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                      activeDevotionalTab === 'multiplicacao'
                        ? 'bg-white text-[#C08261] shadow-sm font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <span className="text-xs font-serif leading-none flex items-center gap-1">
                      <span>Imersão do Despertador</span>
                      {!isComunhaoFullyComplete && <span className="text-[10px]">🔒</span>}
                    </span>
                    <span className="text-[9px] font-mono uppercase opacity-75 mt-0.5 tracking-wider">A Multiplicação</span>
                  </button>
                </div>

                {/* IF THE MULTIPLICACAO TAB IS SELECTED BUT COMUNHAO IS NOT FULLY COMPLETED, SHOW SACRED LOCK PANEL */}
                {activeDevotionalTab === 'multiplicacao' && !isComunhaoFullyComplete ? (
                  <motion.div
                    key="sacred-lock-panel"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-[#1c1917] via-[#121110] to-[#0c0b0a] border border-[#C08261]/20 p-8 md:p-12 shadow-2xl relative overflow-hidden text-center space-y-8"
                  >
                    {/* Glowing gold circular halo */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-radial-gradient from-[#C08261]/15 to-transparent pointer-events-none rounded-full blur-3xl opacity-60" />
                    
                    <div className="space-y-4 relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#C08261]/10 flex items-center justify-center border border-[#C08261]/35 mb-2 shadow-inner text-[#C08261]">
                        <span className="text-3xl">🎚️</span>
                      </div>
                      
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#C08261] bg-[#C08261]/10 px-3 py-1 rounded-full border border-[#C08261]/25 font-bold">
                        A Provação Secreta das Almas
                      </span>
                      
                      <h4 className="font-serif text-2xl md:text-3xl text-stone-100 tracking-tight font-light leading-snug">
                        Os 40 dias no <span className="text-[#C08261] font-semibold">Deserto do Despertador</span> só se abrem após o término da Comunhão Íntima
                      </h4>
                    </div>

                    <div className="border-t border-stone-800/65 pt-6 space-y-4 max-w-lg mx-auto relative z-10 text-stone-400 text-xs md:text-sm leading-relaxed text-left font-serif font-light">
                      <p className="indent-4">
                        Assim como Jesus foi guiado pelo Espírito ao deserto, enfrentando, jejuando e orando por <strong>40 dias e 40 noites</strong> (Mateus 4:1-11, Marcos 1:12-15) em profunda provação, purificação e preparo íntimo com o Pai, o seu chamado como Despertador — um ganhador e multiplicador de almas — exige a consolidação prévia do seu fogo secreto.
                      </p>
                      <p className="indent-4">
                        Nenhum homem pode dar o que não possui. A multiplicação só floresce a partir do transbordo de uma mesa de intimidade. Complete primeiro os 40 dias da sua consagração pessoal antes de receber as ferramentas da obra pública de resgate.
                      </p>
                      
                      <div className="bg-stone-900/50 rounded-2xl p-4.5 border border-stone-800 flex items-start gap-3.5 mt-3">
                        <span className="text-xl">🕊️</span>
                        <div className="space-y-1 flex-1 font-sans">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wide block font-semibold">Atendimento ao Seu Progresso</span>
                          <span className="text-xs text-stone-300 font-medium">Você concluiu {completedComunhaoDays} de 40 encontros diários.</span>
                          <div className="w-full bg-stone-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-[#C08261] h-full" style={{ width: `${(completedComunhaoDays / 40) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DEV / TESTER SHIELDS BYPASS (Norman Feedback and transparency) */}
                    <div className="pt-4 relative z-10 flex flex-col sm:flex-row justify-center items-center gap-3">
                      <button
                        id="btn-return-to-comunhao"
                        onClick={() => setActiveDevotionalTab('comunhao')}
                        className="px-6 py-2.5 bg-[#C08261] hover:bg-[#A06C51] text-white text-xs font-semibold rounded-2xl shadow-sm transition"
                      >
                        Voltar para a Comunhão Íntima
                      </button>
                      <button
                        id="btn-simulate-completion"
                        onClick={handleSimulateAllComunhao}
                        className="px-4 py-2 bg-stone-900 hover:bg-black text-stone-400 hover:text-stone-200 text-[10.5px] font-mono rounded-xl border border-stone-800 transition shadow-inner"
                      >
                        ⚡ Simular 40 dias (Bypass)
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Progress Indicators & Zeigarnik Goal Gradient Meter */}
                    <div id="devocionais-progress-panel" className="bg-white border border-stone-200/60 p-5 rounded-3xl shadow-xs max-w-2xl mx-auto space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-serif font-medium text-stone-700">Progresso na Jornada de Ativação</span>
                        <span className="font-mono text-[11px] text-[#C08261] font-semibold bg-[#C08261]/10 px-2.5 py-0.5 rounded-full">
                          {completedCount} de {currentList.length} dias ({completionPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          key={activeDevotionalTab}
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-[#C08261] to-[#e0a281] h-full rounded-full"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 italic text-center font-serif leading-relaxed">
                        "O fechamento de cada círculo de silêncio consolida a sua maturidade secreta." — Zeigarnik Focus
                      </p>
                    </div>

                    {/* Today's Dynamic Recommended Devotional Nudge Card (Nudge & StoryBrand Architecture) */}
                    {recommendedDev && (
                      <motion.div 
                        id="devotional-recommended-nudge"
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-[#C08261]/5 border border-[#C08261]/20 rounded-3xl max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
                      >
                        <div className="absolute -top-12 -right-12 opacity-[0.03] text-[#C08261] pointer-events-none">
                          <Flame size={120} />
                        </div>
                        
                        <div className="space-y-1.5 flex-1 z-10">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 bg-[#C08261]/15 text-[#C08261] text-[9px] font-mono uppercase font-bold rounded-lg tracking-wider">
                              Recomendado de Hoje
                            </span>
                            <span className="text-[11px] font-mono text-stone-500">• Dia {recommendedIndex + 1}</span>
                          </div>
                          <h4 className="font-serif text-[18px] font-semibold text-stone-850 tracking-tight leading-tight">
                            {recommendedDev.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 md:max-w-md font-serif leading-normal italic">
                            {recommendedDev.scripture}
                          </p>
                        </div>

                        <button
                          id="btn-nudge-active-devocional"
                          onClick={() => setSelectedDevotional(recommendedDev)}
                          className="w-full md:w-auto px-5 py-3 bg-[#C08261] hover:bg-[#A06C51] text-white text-xs font-semibold rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm transition-all hover:scale-[1.02] transform shrink-0 active:scale-95"
                        >
                          <span>Entrar no Secreto</span>
                          <ChevronRight size={14} />
                        </button>
                      </motion.div>
                    )}

                    {/* Hick's Law: Phase Filter / Groups to avoid decision paralysis */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                        <span className="text-xs uppercase font-mono tracking-widest text-stone-400 font-semibold">Círculos de Encontro</span>
                        <span className="text-[10px] text-stone-400 font-mono italic">Toque para desvelar a leitura</span>
                      </div>

                      <div id="devotionals-library-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {currentList.map((dev, idx) => {
                          const isCompleted = progress.completedChapters.includes(dev.id);
                          return (
                            <div
                              id={`devotional-card-${dev.id}`}
                              key={dev.id}
                              onClick={() => setSelectedDevotional(dev)}
                              className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between h-[180px] hover:scale-[1.01] transform ${
                                isCompleted 
                                  ? 'border-[#C08261]/30 bg-[#C08261]/2 shadow-inner-sm' 
                                  : 'border-stone-200/50 hover:border-stone-300'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                                  <span className="font-semibold text-stone-500">Dia {idx + 1}</span>
                                  {isCompleted ? (
                                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-[#C08261]/15 text-[#C08261] text-[9.5px] font-semibold rounded-full font-mono">
                                      <Check size={8} strokeWidth={3} />
                                      <span>PRESENTE</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-stone-100 text-stone-550 rounded-full font-semibold">{dev.category}</span>
                                  )}
                                </div>
                                <h4 className="font-serif text-sm font-medium text-stone-850 line-clamp-2 leading-snug">{dev.title}</h4>
                                <p className="text-[10.5px] text-[#C08261] font-mono italic truncate">{dev.scripture}</p>
                              </div>

                              <div className="flex items-center justify-between text-[10.5px] pt-3 border-t border-stone-100/60 mt-1">
                                <span className="text-stone-400 font-mono">
                                  {activeDevotionalTab === 'comunhao' ? 'Contemplação' : 'Multiplicação'}
                                </span>
                                <span className="text-[#C08261] font-semibold flex items-center space-x-0.5 hover:underline">
                                  <span>Sintonizar</span>
                                  <ChevronRight size={12} />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })()}

          {/* ACTIVE PORT: SINGLE DEVOTIONAL EXPANDED VIEW (IMMERSIVE SEED READER) */}
          {selectedDevotional && (() => {
            const isComunhao = DEVOCIONAIS.some(d => d.id === selectedDevotional.id);
            const currentGroup = isComunhao ? DEVOCIONAIS : MULTIPLICACAO;
            const currentIndex = currentGroup.findIndex(d => d.id === selectedDevotional.id);
            const nextDevotional = currentIndex !== -1 && currentIndex < currentGroup.length - 1 ? currentGroup[currentIndex + 1] : null;
            const isCompleted = progress.completedChapters.includes(selectedDevotional.id);

            return (
              <motion.div
                key="single-devotional"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-2xl mx-auto space-y-6 text-left pb-16"
              >
                {/* Escape bar */}
                <button
                  id="btn-exit-single-devotional"
                  onClick={() => setSelectedDevotional(null)}
                  className="flex items-center space-x-1.5 py-1.5 px-3.5 hover:bg-stone-150 rounded-xl text-xs text-stone-605 transition"
                >
                  <ArrowLeft size={13} />
                  <span>Voltar aos Encontros</span>
                </button>

                {/* Devotional body card */}
                <div id="devotional-view-card" className="bg-white rounded-3xl p-6 md:p-10 border border-stone-200/40 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-stone-900 pointer-events-none">
                    <Feather size={200} />
                  </div>

                  <div className="border-b border-stone-100 pb-5 space-y-2.5">
                    <span className="px-3 py-1 bg-[#C08261]/10 text-[#C08261] text-[10px] font-semibold font-mono rounded-lg tracking-wider uppercase">
                      {isComunhao ? '40 Dias Despertando' : 'Imersão do Despertador'} • Dia {currentIndex + 1}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 leading-tight">{selectedDevotional.title}</h2>
                    <p className="text-xs md:text-sm text-stone-500 font-mono italic font-semibold">{selectedDevotional.scripture}</p>
                  </div>

                  {/* Main Meditative Prose */}
                  <div className="font-serif text-stone-850 text-base md:text-lg lg:text-xl leading-relaxed text-justify space-y-4 whitespace-pre-line">
                    {selectedDevotional.text}
                  </div>

                  {/* Moment of quiet breathing block */}
                  <div id="devotional-breathing-box" className="p-5 bg-gradient-to-r from-stone-50 to-stone-100/60 border border-stone-155 rounded-2xl space-y-2.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#C08261]">
                      <Clock size={13} className="animate-spin" />
                      <span className="font-mono uppercase tracking-widest">Desafio Pessoal no Silêncio</span>
                    </div>
                    <p className="text-sm md:text-base text-stone-800 italic font-serif leading-relaxed">
                      {selectedDevotional.pauseInstruction}
                    </p>
                  </div>

                  {/* Prayer / Oração do Secreto */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block mb-1">Oração no Secreto</span>
                    <div className="border-l-4 border-[#C08261] pl-5 italic text-stone-850 font-serif text-base md:text-lg lg:text-xl leading-relaxed my-4 text-justify">
                      "{selectedDevotional.prayer}"
                    </div>
                  </div>

                  {/* Grace in practice */}
                  <div className="space-y-2 bg-[#C08261]/2 border border-[#C08261]/10 rounded-2xl p-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block mb-1">Desafio de Multiplicação</span>
                    <p className="text-sm md:text-base text-stone-850 leading-relaxed font-serif pl-1">
                      {selectedDevotional.graceInPractice}
                    </p>
                  </div>

                  {/* Reflective input box - Nir Eyal Investment Hook */}
                  <div className="border-t border-stone-100 pt-6 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#8C6239] font-bold block">Pergunta Reflexiva</span>
                      <p className="text-sm md:text-[15px] italic text-stone-800 font-serif leading-relaxed pl-1">"{selectedDevotional.reflectiveQuestion}"</p>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        id="input-devotional-journal-note"
                        type="text"
                        placeholder="Escreva algo no seu Caderno de Secreto..."
                        className="bg-stone-50/60 border border-stone-200 rounded-xl px-4 py-2.5 text-xs md:text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-[#C08261] text-stone-800"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.currentTarget as HTMLInputElement).value;
                            if (val.trim()) {
                              handleAddReflection(`${selectedDevotional.category} Dev - Dia ${currentIndex + 1}`, val);
                              (e.currentTarget as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        id="btn-save-journal-note"
                        onClick={() => {
                          const input = document.getElementById('input-devotional-journal-note') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            handleAddReflection(`${selectedDevotional.category} Dev - Dia ${currentIndex + 1}`, input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2.5 bg-stone-900 border border-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>

                  {/* ACTIONS ZONE: Commitment toggle and Viral WhatsApp copy (Adam Grant & Jonah Berger Growth Mechanism) */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
                    <button
                      id="btn-seal-devotional"
                      onClick={() => {
                        handleCompleteDevotional(selectedDevotional.id);
                        if (!isCompleted) {
                          setCommittedToastMsg("Compromisso selado no Secreto! 🔥 +1 de Streak!");
                        } else {
                          // Allow undo
                          setProgress(prev => ({
                            ...prev,
                            completedChapters: prev.completedChapters.filter(id => id !== selectedDevotional.id)
                          }));
                          setCommittedToastMsg("Compromisso desfeito com sucesso.");
                        }
                        setTimeout(() => setCommittedToastMsg(null), 3000);
                      }}
                      className={`flex-1 py-3.5 px-5 rounded-xl font-serif text-xs font-semibold flex items-center justify-center space-x-2 transition transform active:scale-95 cursor-pointer ${
                        isCompleted
                          ? 'bg-stone-100 text-stone-500 hover:bg-stone-150'
                          : 'bg-[#C08261] text-white hover:bg-[#A06C51] shadow-sm hover:scale-[1.01]'
                      }`}
                    >
                      <Check size={14} strokeWidth={isCompleted ? 3 : 2} />
                      <span>
                        {isCompleted
                          ? 'Completado (Toque para desfazer)'
                          : 'Dizer Sim e Marcar Diário'}
                      </span>
                    </button>

                    <button
                      id="btn-share-devotional"
                      onClick={() => {
                        const appUrl = window.location.href.split('?')[0];
                        const shareText = `🕊️ *SOMOS O DESPERTAR* 🕊️\n*40 dias despertando outros: Dia ${currentIndex + 1}*\n\n"Passei pelo Altar do Secreto de hoje e lembrei de você. Posso compartilhar o que Deus tem me mostrado?"\n\n📌 *Estudo Central:* _"${selectedDevotional.title}"_\n📖 *Versículo:* ${selectedDevotional.scripture}\n\n🎯 *Meu Desafio de Hoje:* ${selectedDevotional.graceInPractice}\n\nSintonize você também esta efervescência de fé:\n${appUrl}`;
                        handleCopyToClipboard(shareText);
                      }}
                      className="py-3.5 px-4 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 hover:text-[#C08261] rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition transform active:scale-95 shadow-xs cursor-pointer"
                    >
                      <Feather size={13} className="text-[#C08261]" />
                      <span>Semear Chamado (WhatsApp)</span>
                    </button>
                  </div>

                  {/* continuous escorregador next day flow (Joseph Sugarman - low cognitive drag) */}
                  {nextDevotional && (
                    <motion.button
                      id="btn-next-devotional-transition"
                      whileHover={{ scale: 1.005 }}
                      onClick={() => {
                        setSelectedDevotional(nextDevotional);
                        const topElement = document.getElementById('btn-exit-single-devotional');
                        if (topElement) topElement.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full mt-4 py-3.5 px-5 border border-stone-150 rounded-xl bg-stone-50 hover:bg-stone-100/85 transition text-left flex justify-between items-center group cursor-pointer"
                    >
                      <span className="font-mono uppercase text-[9px] tracking-widest text-stone-400 group-hover:text-stone-600 block">
                        PRÓXIMO DIA ({currentIndex + 2}/40)
                      </span>
                      <span className="flex items-center space-x-1 font-serif text-stone-850 text-xs font-medium group-hover:text-[#C08261]">
                        <span>Sintonize "{nextDevotional.title}"</span>
                        <ChevronRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </motion.button>
                  )}
                </div>

                {/* Floating Commitment Popup Toast */}
                {committedToastMsg && (
                  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white text-xs px-4 py-3 rounded-full shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
                    <Sparkles size={12} className="text-amber-400 animate-spin" />
                    <span className="font-mono">{committedToastMsg}</span>
                  </div>
                )}
              </motion.div>
            );
          })()}

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

          {/* ACTIVE PORT: DEEPLY GUIDED RESPIRO DO SECRETO SANCTUARY */}
          {activeSection === 'respiro' && !selectedDevotional && (
            <motion.div
              key="respiro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-2"
            >
              <BreathingGuide mode="sanctuary" onCycleComplete={handleBreathingCycleCompleted} />
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
                initialBookId={progress.lastReadEbookInfo?.ebookId}
                initialChapterIndex={progress.lastReadEbookInfo?.chapterIndex}
                onChapterRead={handleEbookChapterRead}
              />
            </motion.div>
          )}

          {/* ACTIVE PORT: NUVEM DE TESTEMUNHAS HISTORICAL GALLERY */}
          {activeSection === 'testemunhas' && !selectedDevotional && (
            <motion.div
              key="testemunhas"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-2"
            >
              <WitnessesSection
                onAddReflection={handleAddReflection}
                onShowSuccessToast={(msg) => {
                  setCommittedToastMsg(msg);
                  setTimeout(() => setCommittedToastMsg(null), 3500);
                }}
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
              <div className="border-b border-stone-105 pb-5 space-y-3 text-center md:text-left">
                <span className="text-xs md:text-sm font-mono uppercase tracking-widest text-[#C08261] font-bold block">Minha caminhada de Fé</span>
                <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 tracking-tight leading-tight mt-0.5">Minha Caminhada</h3>
                <p className="text-stone-500 text-sm md:text-base leading-relaxed font-sans max-w-2xl mt-2">Acompanhe seus tempos de quietude, notas e versículos favoritos.</p>
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

              {/* HISTORIC MARCOS ESPIRITUAIS BADGES (Bento / Core features) */}
              <div id="marcos-espirituais-section" className="space-y-4 pt-4">
                <div className="flex items-center space-x-1.5 text-stone-850 border-b border-stone-100 pb-2">
                  <Award size={16} className="text-[#C08261]" />
                  <h4 className="font-serif text-lg font-medium">Marcas e Frutos do Caminhar 🌿</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Badge 1: Semente da Presença */}
                  {(() => {
                    const isAchieved = (progress.breathingCyclesCount || 0) > 0;
                    return (
                      <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                        isAchieved 
                          ? 'bg-amber-50/15 border-[#DCAE6C]/30 shadow-xs' 
                          : 'bg-stone-50/40 border-stone-150/40 opacity-70'
                      }`}>
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-xl">🌟</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              isAchieved ? 'bg-emerald-50 text-emerald-705 font-bold' : 'bg-stone-100 text-stone-400'
                            }`}>
                              {isAchieved ? 'Frutificado' : 'Semente'}
                            </span>
                          </div>
                          <h5 className="font-serif text-xs font-bold text-stone-800">Semente da Presença</h5>
                          <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                            Sua jornada rumo ao silêncio interior e quietude respiratória foi iniciada pela primeira vez.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-stone-100/30 mt-3 text-left">
                          <span className="text-[9.5px] font-mono text-stone-400">
                            Status: {isAchieved ? 'Concluído' : 'Semear 1 respiração'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Badge 2: Discípulo do Logos */}
                  {(() => {
                    const isAchieved = progress.completedChapters.length >= 5;
                    return (
                      <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                        isAchieved 
                          ? 'bg-amber-50/15 border-[#DCAE6C]/30 shadow-xs' 
                          : 'bg-stone-50/40 border-stone-150/40 opacity-70'
                      }`}>
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-xl">📚</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              isAchieved ? 'bg-emerald-50 text-emerald-705 font-bold' : 'bg-stone-100 text-stone-400'
                            }`}>
                              {isAchieved ? 'Frutificado' : 'Semente'}
                            </span>
                          </div>
                          <h5 className="font-serif text-xs font-bold text-stone-800">Discípulo do Logos</h5>
                          <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                            Alimentando o coração com pelo menos 5 capítulos devocionais ou sabedorias dos ebooks de graça.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-stone-100/30 mt-3 text-left">
                          <span className="text-[9.5px] font-mono text-stone-400">
                            Progresso: {progress.completedChapters.length}/5 Leituras
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Badge 3: Escritor do Secreto */}
                  {(() => {
                    const isAchieved = progress.savedReflections.length >= 3;
                    return (
                      <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                        isAchieved 
                          ? 'bg-amber-50/15 border-[#DCAE6C]/30 shadow-xs' 
                          : 'bg-stone-50/40 border-stone-150/40 opacity-70'
                      }`}>
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-xl">🖋️</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              isAchieved ? 'bg-emerald-50 text-emerald-705 font-bold' : 'bg-stone-100 text-stone-400'
                            }`}>
                              {isAchieved ? 'Frutificado' : 'Semente'}
                            </span>
                          </div>
                          <h5 className="font-serif text-xs font-bold text-stone-800">Escritor do Secreto</h5>
                          <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                            Suas orações e entendimentos estão sendo escritas e guardadas de forma autêntica em seu memorial.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-stone-100/30 mt-3 text-left">
                          <span className="text-[9.5px] font-mono text-stone-400">
                            Histórico: {progress.savedReflections.length}/3 Anotações
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Badge 4: Aliança de Ouro */}
                  {(() => {
                    const isAchieved = (progress.maxStreak || 0) >= 5 || progress.streak >= 5;
                    return (
                      <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                        isAchieved 
                          ? 'bg-amber-50/15 border-[#DCAE6C]/30 shadow-xs' 
                          : 'bg-stone-50/40 border-stone-150/40 opacity-70'
                      }`}>
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <span className="text-xl">🏆</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              isAchieved ? 'bg-emerald-50 text-emerald-705 font-bold' : 'bg-stone-100 text-stone-400'
                            }`}>
                              {isAchieved ? 'Frutificado' : 'Semente'}
                            </span>
                          </div>
                          <h5 className="font-serif text-xs font-bold text-stone-800">Aliança de Ouro</h5>
                          <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                            Consolidando e firmando sua alvorada diária de comunhão por 5 dias consecutivos sem quebras.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-stone-100/30 mt-3 text-left">
                          <span className="text-[9.5px] font-mono text-stone-400">
                            Sequência: {progress.streak}/5 dias
                          </span>
                        </div>
                      </div>
                    );
                  })()}
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

          {/* ACTIVE PORT: IGREJA PRIMITIVA FUNDADORES LANDING VIEW */}
          {activeSection === 'primitiva' && !selectedDevotional && (
            <motion.div
              key="primitiva"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <IgrejaPrimitiva
                currentUser={currentUser}
                userProfile={userProfile}
                onShowAuthModal={() => setShowAuthModal(true)}
                onSaveProgress={(achievements) => {
                  setProgress(prev => {
                    const updated = { ...prev, ...achievements };
                    localStorage.setItem('despertar_progress_v2', JSON.stringify(updated));
                    return updated;
                  });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

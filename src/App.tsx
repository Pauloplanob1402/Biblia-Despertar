/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, Book, Coffee, User, Bookmark, Feather, 
  Flame, Sparkles, Clock, Heart, Calendar, ArrowLeft, 
  AlertCircle, ChevronRight, Terminal, FileText, Check, Code, MessageSquare, Award, Smartphone, Share2
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
import AppsSection from './components/AppsSection';
import MuralComunidade from './components/MuralComunidade';

// Core static databases
import { DEVOCIONAIS } from './data/devotionals';
import { MULTIPLICACAO } from './data/multiplication';
import { DESPERTAR_PROFILES } from './data/profiles';
import { UserProgress, Devotional, SpiritualIdentity } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { buscarMovimentos } from './lib/sementes';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, query, collection, where, orderBy, limit, updateDoc, increment } from 'firebase/firestore';

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'bible' | 'devotionals' | 'profiles' | 'mesas' | 'ebooks' | 'profile' | 'respiro' | 'testemunhas' | 'primitiva' | 'apps' | 'mural'>('home');
  const [activePrayersCount, setActivePrayersCount] = useState<number>(0);
  const [homePrayerOfTheDay, setHomePrayerOfTheDay] = useState<any>(null);
  const [homeTestimonyOfTheDay, setHomeTestimonyOfTheDay] = useState<any>(null);
  const [mesasSubTab, setMesasSubTab] = useState<'mesas' | 'pilgrims'>('mesas');
  const [activeDevotionalTab, setActiveDevotionalTab] = useState<'comunhao' | 'multiplicacao'>('comunhao');
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Card Generator theme & signature states (Novo Poder)
  const [cardTheme, setCardTheme] = useState<'cosmic' | 'linen' | 'emerald'>('cosmic');
  const [cardSignature, setCardSignature] = useState('');
  const [randomQuote, setRandomQuote] = useState<{ text: string; title: string; scripture: string } | null>(null);
  const [showFrictionlessModal, setShowFrictionlessModal] = useState(false);
  
  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [chatContact, setChatContact] = useState<{ uid: string; name: string; emoji?: string } | null>(null);
  
  // Real-time Sementes do Reino balance (Mateus 6)
  const [sementesSaldo, setSementesSaldo] = useState<number>(0);
  const [floatingSementes, setFloatingSementes] = useState<{ id: string; tipo: string; descricao: string; valor?: number; mensagemEspecial?: string; versiculo?: string }[]>([]);
  const [sementesMovimentos, setSementesMovimentos] = useState<any[]>([]);

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

  // Zero Fricção Quote Selector (Novo Poder Feature)
  const handlePullRandomQuote = () => {
    const allQuotes = [...DEVOCIONAIS, ...MULTIPLICACAO];
    if (allQuotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    const selected = allQuotes[randomIndex];
    
    setRandomQuote({
      text: selected.prayer,
      title: selected.title,
      scripture: selected.scripture
    });
    setShowFrictionlessModal(true);
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

  // Listen to active prayers count, daily prayer, and daily testimony
  useEffect(() => {
    // 1. Count of active prayers
    const qCount = query(
      collection(db, 'pedidosOracao'),
      where('respondido', '==', false)
    );
    const unsubCount = onSnapshot(qCount, (snapshot) => {
      setActivePrayersCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pedidosOracao');
    });

    // 2. Spotlight Prayer of the Day (latest active or semi-stable)
    const qPrayer = query(
      collection(db, 'pedidosOracao'),
      where('respondido', '==', false),
      orderBy('criadoEm', 'desc'),
      limit(5)
    );
    const unsubPrayer = onSnapshot(qPrayer, (snapshot) => {
      if (!snapshot.empty) {
        const docs: any[] = [];
        snapshot.forEach(docSnap => {
          docs.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Select first item or fallback
        setHomePrayerOfTheDay(docs[0]);
      } else {
        setHomePrayerOfTheDay(null);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'pedidosOracao');
    });

    // 3. Spotlight Testimony of the Day (latest)
    const qTestimony = query(
      collection(db, 'testemunhos'),
      orderBy('criadoEm', 'desc'),
      limit(5)
    );
    const unsubTestimony = onSnapshot(qTestimony, (snapshot) => {
      if (!snapshot.empty) {
        const docs: any[] = [];
        snapshot.forEach(docSnap => {
          docs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setHomeTestimonyOfTheDay(docs[0]);
      } else {
        setHomeTestimonyOfTheDay(null);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'testemunhos');
    });

    return () => {
      unsubCount();
      unsubPrayer();
      unsubTestimony();
    };
  }, []);

  // Home spotlight support actions
  const handleSupportPrayerFromHome = async (id: string) => {
    try {
      const docRef = doc(db, 'pedidosOracao', id);
      await updateDoc(docRef, {
        contadorOracoes: increment(1)
      });
      setCommittedToastMsg("Você uniu sua fé a esta oração! Deus ouviu! 🙏");
      setTimeout(() => setCommittedToastMsg(null), 3000);
    } catch (err) {
      console.error("Error backing up prayer request:", err);
    }
  };

  const handleSupportTestimonyFromHome = async (id: string) => {
    try {
      const docRef = doc(db, 'testemunhos', id);
      await updateDoc(docRef, {
        fortalecidos: increment(1)
      });
      setCommittedToastMsg("Sua fé foi fortalecida! Glórias a Deus! 🌱");
      setTimeout(() => setCommittedToastMsg(null), 3000);
    } catch (err) {
      console.error("Error backing up testimony:", err);
    }
  };

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

  // Listen to Sementes do Reino in real-time or via local storage
  useEffect(() => {
    const updateLocalSeeds = () => {
      const localSeeds = localStorage.getItem('despertar_sementes_saldo');
      setSementesSaldo(localSeeds ? parseInt(localSeeds) : 0);
    };

    const handleSementePlantada = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { tipo, descricao, valor, mensagemEspecial, versiculo } = customEvent.detail;
        const newId = Math.random().toString();
        
        // Add to floating pool
        setFloatingSementes(prev => [...prev, { id: newId, tipo, descricao, valor, mensagemEspecial, versiculo }]);
        
        // Clean up after 4.5 seconds
        setTimeout(() => {
          setFloatingSementes(prev => prev.filter(item => item.id !== newId));
        }, 4500);
      }
    };

    window.addEventListener('storage-sementes-updated', updateLocalSeeds);
    window.addEventListener('semente-plantada', handleSementePlantada);
    updateLocalSeeds();

    let unsubscribeSnapshot: (() => void) | null = null;
    if (currentUser) {
      const sementeDocRef = doc(db, 'sementes', currentUser.uid);
      unsubscribeSnapshot = onSnapshot(sementeDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const dbSaldo = docSnap.data().saldo ?? 0;
          setSementesSaldo(dbSaldo);
          localStorage.setItem('despertar_sementes_saldo', dbSaldo.toString());
        }
      }, (error) => {
        console.warn("Real-time listener to Sementes do Reino status skipped/authorized/failed:", error);
      });
    }

    return () => {
      window.removeEventListener('storage-sementes-updated', updateLocalSeeds);
      window.removeEventListener('semente-plantada', handleSementePlantada);
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [currentUser]);

  // Load sementes movements history
  useEffect(() => {
    const carregarMovimentos = async () => {
      const uid = currentUser?.uid || '';
      const movs = await buscarMovimentos(uid);
      setSementesMovimentos(movs);
    };

    carregarMovimentos();

    window.addEventListener('storage-sementes-updated', carregarMovimentos);
    return () => {
      window.removeEventListener('storage-sementes-updated', carregarMovimentos);
    };
  }, [currentUser]);


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
      <header className="md:hidden w-full bg-white border-b border-stone-200/55 flex items-center justify-between p-4 sticky top-0 z-30 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white font-serif font-semibold shadow-inner">
            D
          </div>
          <div className="text-left">
            <h1 className="font-serif text-[13px] font-bold tracking-tight text-stone-850">Somos o Despertar</h1>
            <span className="text-[11px] font-mono tracking-widest text-[#C08261] uppercase leading-none block font-semibold text-[10px]">Mesa e Caminho</span>
          </div>
        </div>
        
        {/* Sementes do Reino indicator pill */}
        <div className="flex items-center space-x-1.5 bg-[#f1f8f3] border border-emerald-100/75 px-3 py-1.5 rounded-full text-emerald-800 text-xs font-semibold font-mono shadow-xs">
          <span className="text-sm">🌱</span>
          <span>{sementesSaldo}</span>
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
                    <Coffee size={14} />
                    <span>Café e Comunhão</span>
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
                  id="mobile-nav-mural"
                  onClick={() => { setActiveSection('mural'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-semibold border-[#C08261]/20 border bg-[#C08261]/5 transition ${
                    activeSection === 'mural' ? 'bg-[#C08261]/15 text-[#C08261] font-bold' : 'text-stone-750 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Compass size={14} className="text-[#C08261]" />
                    <span>Mural de Oração & Fé 🕊️</span>
                  </span>
                  <span className="text-[9px] bg-[#C08261] text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold">Novo</span>
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

                <button
                  id="mobile-nav-apps"
                  onClick={() => { setActiveSection('apps'); setSelectedDevotional(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-semibold bg-[#C08261]/5 border border-[#C08261]/10 transition ${
                    activeSection === 'apps' ? 'bg-[#C08261]/15 text-[#C08261]' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Smartphone size={14} className="text-[#C08261]" />
                    <span>Nossos Apps 📱</span>
                  </span>
                  <span className="text-[9px] bg-[#C08261] text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold animate-pulse">Instalar</span>
                </button>

                {/* Separador e Cards de Apoio (Sementes & Clamores) ao final da navegação */}
                <div className="pt-4 mt-4 border-t border-stone-100/70 space-y-3">
                  {/* Sementes do Reino Mobile Quick Balance */}
                  <div className="px-4 py-3 bg-[#f1f8f3] border border-emerald-100/50 rounded-xl flex items-center justify-between text-left">
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-base select-none animate-bounce">🌱</span>
                      <div className="truncate">
                        <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider leading-none">Sementes do Reino</span>
                        <p className="text-[11px] text-emerald-950 font-sans mt-0.5 truncate font-medium">Tesouros no Secreto (Mateus 6)</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold font-mono text-emerald-800 bg-white border border-emerald-100/80 px-2.5 py-1 rounded-lg block">
                        {sementesSaldo}
                      </span>
                    </div>
                  </div>

                  {/* Necessidade Aberta (Mobile Gatilho Zeigarnik / Clé do Loop) */}
                  <div className="p-4 bg-amber-50/50 border border-amber-100/70 rounded-xl text-left space-y-2.5 shadow-3xs hover:border-amber-200 transition-colors duration-300">
                    <div className="flex items-center space-x-2 text-stone-800">
                      <span className="text-sm select-none animate-pulse">🕊️</span>
                      <span className="text-[10px] font-mono uppercase font-black text-amber-800 tracking-wider">
                        Hoje existem {activePrayersCount} pedidos ativos
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-normal font-sans">
                      Sempre há fardos para carregar em comunidade. Seja a resposta de apoio ao clamor de um irmão agora!
                    </p>
                    <button
                      onClick={() => {
                        setActiveSection('mural');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-3 bg-[#C08261] hover:bg-[#A96D4D] text-white text-[10px] font-mono uppercase tracking-widest font-black rounded-lg transition text-center block shadow-2xs hover:shadow-sm"
                    >
                      Orar por alguém agora 🙏
                    </button>
                  </div>
                </div>
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
              <Coffee size={14} />
              <span>Café e Comunhão</span>
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
            id="nav-mural"
            onClick={() => { setActiveSection('mural'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-semibold bg-[#C08261]/5 border border-[#C08261]/10 transition ${
              activeSection === 'mural' ? 'bg-[#C08261]/15 text-[#C08261] font-bold' : 'text-stone-750 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Compass size={14} className="text-[#C08261]" />
              <span>Mural de Oração & Fé 🕊️</span>
            </span>
            <span className="text-[9px] bg-[#C08261] text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold">Novo</span>
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

          <button
            id="nav-apps"
            onClick={() => { setActiveSection('apps'); setSelectedDevotional(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left tracking-wide text-xs font-semibold bg-[#C08261]/5 border border-[#C08261]/10 transition ${
              activeSection === 'apps' ? 'bg-[#C08261]/15 text-[#C08261]' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Smartphone size={14} className="text-[#C08261]" />
              <span>Baixar o App 📱</span>
            </span>
            <span className="text-[9px] bg-[#C08261] text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold animate-pulse">Instalar</span>
          </button>

          {/* Separador e Cards de Apoio (Sementes & Clamores) ao final da navegação */}
          <div className="pt-4 mt-4 border-t border-stone-100/70 space-y-3">
            {/* Sementes do Reino Quick Balance */}
            <div className="px-4 py-3 bg-[#f1f8f3] border border-emerald-100/50 rounded-xl flex items-center justify-between text-left">
              <div className="flex items-center space-x-2.5 truncate">
                <span className="text-base select-none animate-bounce">🌱</span>
                <div className="truncate">
                  <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider leading-none">Sementes do Reino</span>
                  <p className="text-[11px] text-emerald-950 font-sans mt-0.5 truncate font-medium">Tesouros no Secreto (Mateus 6)</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono text-emerald-800 bg-white border border-emerald-100/80 px-2.5 py-1 rounded-lg block">
                  {sementesSaldo}
                </span>
              </div>
            </div>

            {/* Necessidade Aberta (Gatilho Zeigarnik / Clé do Loop) */}
            <div className="p-4 bg-amber-50/50 border border-amber-100/70 rounded-xl text-left space-y-2.5 shadow-3xs hover:border-amber-200 transition-colors duration-300">
              <div className="flex items-center space-x-2 text-stone-800">
                <span className="text-sm select-none animate-pulse">🕊️</span>
                <span className="text-[10px] font-mono uppercase font-black text-amber-800 tracking-wider">
                  Hoje existem {activePrayersCount} pedidos ativos
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-normal font-sans">
                Sempre há fardos para carregar em comunidade. Seja a resposta de apoio ao clamor de um irmão agora!
              </p>
              <button
                onClick={() => {
                  setActiveSection('mural');
                }}
                className="w-full py-1.5 px-3 bg-[#C08261] hover:bg-[#A96D4D] text-white text-[10px] font-mono uppercase tracking-widest font-black rounded-lg transition text-center block shadow-2xs hover:shadow-sm"
              >
                Orar por alguém agora 🙏
              </button>
            </div>
          </div>
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
              <div id="emotional-banner" className="relative group overflow-hidden bg-gradient-to-br from-[#1E1C1A] via-[#121110] to-[#0A0A09] p-8 md:p-10 rounded-3xl border border-[#DCAE6C]/25 shadow-xl space-y-6">
                {/* Golden Sunburst background effect */}
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-b from-[#DCAE6C]/10 to-transparent pointer-events-none rounded-full blur-3xl -mr-16 -mt-16 opacity-80 animate-pulse" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 w-full">
                  <div className="space-y-4 max-w-2xl text-left">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs uppercase font-mono tracking-widest text-[#DCAE6C] bg-[#DCAE6C]/10 border border-[#DCAE6C]/20 font-bold">
                      <Coffee size={12} className="text-[#DCAE6C] mr-0.5" />
                      <span>Café com o Despertar</span>
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100 tracking-tight leading-tight">
                      <span className="text-stone-300">À Mesa com o </span><span className="text-[#DCAE6C] font-semibold">Pai</span><span className="text-stone-400">.</span><br />
                      <span className="text-stone-400">Um café quente, um silêncio, </span><span className="text-[#DCAE6C] font-semibold">um recomeço</span><span className="text-stone-400">.</span>
                    </h2>
                    
                    {/* The Slippery Slide Hook (Joseph Sugarman style) */}
                    <div className="space-y-2.5 text-stone-300 text-xs md:text-sm leading-relaxed max-w-xl font-sans">
                      <p>
                        Você já percebeu como a primeira escolha da sua manhã dita as regras de todo o seu dia? Se abrimos o celular logo ao acordar, a avalanche de ansiedade, notícias e cobranças vence a nossa paz antes mesmo de colocarmos os pés fora da cama.
                      </p>
                      <p className="font-serif italic text-[#DCAE6C]/90 text-sm md:text-base border-l-2 border-[#DCAE6C]/30 pl-3">
                        "Mas existe um lugar de silêncio, café fresco e Palavra esperando por você a cada amanhecer..."
                      </p>
                      <p>
                        Aqui, você não é cobrado a alcançar metas religiosas impossíveis. Você é o herói de uma jornada real, e nosso papel é apenas servir o melhor café: um guia dócil de quietude, um altar livre para suas orações e uma mesa de irmãos para partir o pão da fé.
                      </p>
                    </div>
                  </div>

                  {/* Micro-interactive Streak card */}
                  <div className="flex items-center space-x-4 bg-[#1F1D1B] py-4 px-6 rounded-2xl shadow-lg border border-[#DCAE6C]/15 backdrop-blur-xs shrink-0 self-start md:self-auto hover:border-[#DCAE6C]/40 transition-colors duration-300">
                    <Flame size={24} fill="#DCAE6C" className="text-[#DCAE6C] animate-pulse" />
                    <div className="text-left font-mono">
                      <span className="text-2xl font-black text-[#DCAE6C]">{progress.streak} dias</span>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">À Mesa do Pai</p>
                    </div>
                  </div>
                </div>

                {/* Scannable Grid featuring the benefits instead of features (Ray Edwards style) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#DCAE6C]/15 relative z-10 text-left">
                  <div className="space-y-1.5">
                    <span className="text-xs md:text-sm font-mono font-black text-[#DCAE6C] uppercase tracking-wider block">✔ Respiro Coeso</span>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">Aquiete seu coração em 4 segundos e retome o controle diante do barulho do mundo.</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs md:text-sm font-mono font-black text-[#DCAE6C] uppercase tracking-wider block">✔ Sabedoria Diária</span>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">Se alimente de reflexões práticas que decifram a Bíblia numa linguagem do seu dia a dia.</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs md:text-sm font-mono font-black text-[#DCAE6C] uppercase tracking-wider block">✔ Altar Sem Fardos</span>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">Guarde suas próprias reflexões de quietude de forma segura, íntima e vitalícia.</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs md:text-sm font-mono font-black text-[#DCAE6C] uppercase tracking-wider block">✔ Mesa de Família</span>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans font-semibold">Faça parte de um movimento unificado de peregrinos sinceros longe das fachadas.</p>
                  </div>
                </div>
              </div>

              {/* Zero Fricção: Palavra do Silêncio Banner (Novo Poder) */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-[#C08261]/25 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-left relative overflow-hidden">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[9px] font-mono bg-[#C08261]/15 text-[#C08261] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold inline-block">
                    ☕ Corrente Elétrica do Espírito
                  </span>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-stone-850 leading-tight">
                    Sua fé não é para ser vivida no isolamento. Ninguém deveria enfrentar seus dias sozinho.
                  </h3>
                  <p className="text-stone-500 text-xs md:text-sm font-sans leading-relaxed">
                    Sentiu cansaço, ansiedade ou aperto no peito? Você não precisa fazer cadastros compridos, criar mesas ou assinar planos para receber um sopro de esperança. Toque abaixo para receber uma palavra do Secreto dócil e providencial para o seu fôlego de agora.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handlePullRandomQuote}
                  className="w-full md:w-auto py-3 px-6 bg-stone-900 border border-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-extrabold rounded-2xl shadow-sm transition transform active:scale-95 shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-400 shrink-0" />
                  <span>Puxar Palavra de Graça</span>
                </button>
              </div>

              {/* DESTAQUES DO ALTAR PÚBLICO (SPONSOR LOOP) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                
                {/* 1. PEDIDO DE ORAÇÃO DO DIA SPOTLIGHT */}
                <div className="bg-[#fffdfb] border border-[#C08261]/25 rounded-3xl p-6 shadow-xs space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C08261]/4 pointer-events-none rounded-bl-full" />
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-[10px] font-mono uppercase bg-[#C08261]/10 text-[#C08261] px-2.5 py-0.5 rounded-full font-bold">
                      🙏 Clamor do Dia
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">Selecionada no Altar</span>
                  </div>

                  {homePrayerOfTheDay ? (
                    <div className="space-y-3">
                      <p className="font-serif text-[14px] text-stone-750 italic leading-relaxed line-clamp-2">
                        "{homePrayerOfTheDay.descricaoCurta}"
                      </p>
                      
                      <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono">
                        <span>Por {homePrayerOfTheDay.criadorGenerico || 'Irmão'} {homePrayerOfTheDay.criadorNome || 'Membro'}</span>
                        <span>{homePrayerOfTheDay.contadorOracoes || 0} já oraram</span>
                      </div>

                      <div className="pt-1.5 flex gap-2">
                        <button
                          onClick={() => handleSupportPrayerFromHome(homePrayerOfTheDay.id)}
                          className="flex-1 py-2 bg-stone-900 hover:bg-[#C08261] text-white text-[10.5px] font-mono uppercase tracking-widest font-black rounded-xl transition shadow-3xs"
                        >
                          🙏 Unir minha Fé
                        </button>
                        <button
                          onClick={() => {
                            setActiveSection('mural');
                          }}
                          className="px-3.5 py-2 border border-stone-200 text-stone-600 text-[10.5px] font-mono uppercase tracking-wide rounded-xl font-bold hover:bg-stone-50 transition"
                        >
                          Mural
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Graceful fallback
                    <div className="space-y-3">
                      <p className="font-serif text-[14px] text-stone-500 italic leading-relaxed">
                        "Senhor, renova a esperança dos aflitos e cobre com Teu manto de graça todas as famílias que oram."
                      </p>
                      <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono">
                        <span>Por Irmão André • Geral</span>
                        <span>37 já oraram</span>
                      </div>
                      <div className="pt-1.5 flex gap-2">
                        <button
                          onClick={() => {
                            setActiveSection('mural');
                          }}
                          className="w-full py-2 bg-[#C08261]/10 hover:bg-[#C08261]/20 text-[#C08261] text-[10.5px] font-mono uppercase tracking-widest font-black rounded-xl transition text-center"
                        >
                          Visitar o Mural 🙏
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. TESTEMUNHO DO DIA SPOTLIGHT */}
                <div className="bg-[#fbfcfa] border border-emerald-500/15 rounded-3xl p-6 shadow-xs space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/4 pointer-events-none rounded-bl-full" />
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <span className="text-[10px] font-mono uppercase bg-emerald-700/10 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                      🌱 Testemunho do Dia
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">Graça Manifestada</span>
                  </div>

                  {homeTestimonyOfTheDay ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-stone-850 truncate">{homeTestimonyOfTheDay.titulo}</h4>
                        <p className="font-serif text-[13px] text-stone-605 italic line-clamp-2 leading-relaxed">
                          "{homeTestimonyOfTheDay.relato}"
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] text-stone-404 font-mono">
                        <span>Por {homeTestimonyOfTheDay.criadorGenerico || 'Irmão'} {homeTestimonyOfTheDay.criadorNome || 'Membro'}</span>
                        <span>{homeTestimonyOfTheDay.fortalecidos || 0} fortalecidos</span>
                      </div>

                      <div className="pt-1.5 flex gap-2">
                        <button
                          onClick={() => handleSupportTestimonyFromHome(homeTestimonyOfTheDay.id)}
                          className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-850 text-white text-[10.5px] font-mono uppercase tracking-widest font-black rounded-xl transition shadow-3xs"
                        >
                          ❤️ Fortaleceu-me
                        </button>
                        <button
                          onClick={() => {
                            setActiveSection('mural');
                          }}
                          className="px-3.5 py-2 border border-stone-200 text-stone-600 text-[10.5px] font-mono uppercase tracking-wide rounded-xl font-bold hover:bg-stone-50 transition"
                        >
                          Mural
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Graceful fallback
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-stone-850">Provisão e Sabedoria de Deus</h4>
                        <p className="font-serif text-[13px] text-stone-500 italic line-clamp-2 leading-relaxed">
                          "O Senhor supriu magnificamente nossas necessidades no momento mais crítico. Glórias sejam dadas!"
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono">
                        <span>Por Irmã Lara • Providência</span>
                        <span>89 fortalecidos</span>
                      </div>
                      <div className="pt-1.5 flex gap-2">
                        <button
                          onClick={() => {
                            setActiveSection('mural');
                          }}
                          className="w-full py-2 bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 text-[10.5px] font-mono uppercase tracking-widest font-black rounded-xl transition text-center"
                        >
                          Visitar o Mural 🌱
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* PHASE TWO: COMPROMISSOS DE QUIETUDE, CONSTÂNCIA & RETOMAR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. COMPROMISSOS DE QUIETUDE CARD */}
                <div id="card-compromissos-dia" className="bg-white border border-[#C08261]/25 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 md:col-span-2 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C08261]/3 pointer-events-none rounded-bl-full" />
                  <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                    <div className="space-y-1">
                      <span className="text-xs md:text-sm font-mono uppercase tracking-wider text-[#C08261] font-bold">Compromissos de Hoje</span>
                      <h4 className="font-serif text-lg md:text-2xl font-black text-stone-850 flex items-center gap-1.5">
                        Altar de Quietude Diária 🌿
                      </h4>
                    </div>
                    <span id="tracker-completed-challenges-count" className="text-xs md:text-sm bg-stone-100 text-stone-700 font-mono px-3.5 py-1.5 rounded-full font-bold">
                      {(progress.completedChallenges || []).length}/3 Concluídos
                    </span>
                  </div>

                  <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                    Desenvolva constância sem o fardo da obrigação. Cultive pequenas interações de graça e marque o que conseguiu realizar em espírito.
                  </p>

                  <div className="space-y-4 pt-2">
                    {/* Item 1: Respiração */}
                    <div 
                      id="challenge-item-breathe"
                      onClick={() => handleToggleChallenge('breathe')}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition cursor-pointer select-none gap-3 ${
                        (progress.completedChallenges || []).includes('breathe') 
                          ? 'bg-emerald-50/60 border-emerald-300' 
                          : 'bg-stone-50/50 border-stone-200 hover:bg-stone-100/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          (progress.completedChallenges || []).includes('breathe') 
                            ? 'bg-emerald-500 border-transparent text-white' 
                            : 'border-stone-400 bg-white'
                        }`}>
                          {(progress.completedChallenges || []).includes('breathe') && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <span className="text-sm md:text-base font-serif font-black text-stone-850 block">🌬️ Respiração no Secreto</span>
                          <span className="text-xs md:text-sm text-stone-500 font-sans block mt-0.5">Pratique a quietude de 4 segundos imersiva (+2 sementes)</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection('respiro');
                        }}
                        className="text-xs md:text-sm font-bold bg-[#C08261]/10 text-[#C08261] px-3 py-1.5 rounded-xl hover:bg-[#C08261]/20 transition self-start sm:self-auto cursor-pointer"
                      >
                        Praticar ➔
                      </button>
                    </div>

                    {/* Item 2: Leitura */}
                    <div 
                      id="challenge-item-read"
                      onClick={() => handleToggleChallenge('read')}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition cursor-pointer select-none gap-3 ${
                        (progress.completedChallenges || []).includes('read') 
                          ? 'bg-emerald-50/60 border-emerald-300' 
                          : 'bg-stone-50/50 border-stone-200 hover:bg-stone-100/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          (progress.completedChallenges || []).includes('read') 
                            ? 'bg-emerald-500 border-transparent text-white' 
                            : 'border-stone-400 bg-white'
                        }`}>
                          {(progress.completedChallenges || []).includes('read') && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <span className="text-sm md:text-base font-serif font-black text-stone-850 block">📖 Comer do Logos Divino</span>
                          <span className="text-xs md:text-sm text-stone-500 font-sans block mt-0.5">Cultive sabedoria lendo a Bíblia ou os Ebooks (+2 sementes)</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection('bible');
                        }}
                        className="text-xs md:text-sm font-bold bg-[#C08261]/10 text-[#C08261] px-3 py-1.5 rounded-xl hover:bg-[#C08261]/20 transition self-start sm:self-auto cursor-pointer"
                      >
                        Ler Bíblia ➔
                      </button>
                    </div>

                    {/* Item 3: Reflexão */}
                    <div 
                      id="challenge-item-reflection"
                      onClick={() => handleToggleChallenge('reflection')}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition cursor-pointer select-none gap-3 ${
                        (progress.completedChallenges || []).includes('reflection') 
                          ? 'bg-emerald-50/60 border-emerald-300' 
                          : 'bg-stone-50/50 border-stone-200 hover:bg-stone-100/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          (progress.completedChallenges || []).includes('reflection') 
                            ? 'bg-emerald-500 border-transparent text-white' 
                            : 'border-stone-400 bg-white'
                        }`}>
                          {(progress.completedChallenges || []).includes('reflection') && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <span className="text-sm md:text-base font-serif font-black text-stone-850 block">🖋️ Sussurro no Altar</span>
                          <span className="text-xs md:text-sm text-stone-500 font-sans block mt-0.5">Escreva uma oração ou reflexão sincera de conexão (+2 sementes)</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const altarSection = document.getElementById('altar-scripture-ref');
                          if (altarSection) altarSection.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs md:text-sm font-bold bg-[#C08261]/10 text-[#C08261] px-3 py-1.5 rounded-xl hover:bg-[#C08261]/20 transition self-start sm:self-auto cursor-pointer"
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
                      className="p-4 bg-amber-50/90 border border-[#DCAE6C]/40 rounded-2xl flex items-center space-x-3.5 text-left shadow-xs mt-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#DCAE6C]/15 flex items-center justify-center text-lg shrink-0">🌟</div>
                      <div className="space-y-0.5">
                        <p className="text-sm md:text-base font-serif font-bold text-stone-850">Comunhão Perfeita Consolidada!</p>
                        <p className="text-xs md:text-sm text-stone-650 leading-relaxed font-medium">Você concluiu todos os seus marcos de hoje e conquistou +4 sementes bônus! Seu altar brilha.</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 2. CONSTÂNCIA CARD / STREAK STATS */}
                <div id="card-constancia-habitos" className="bg-[#FAF8F5]/90 border border-stone-200/55 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-left h-full">
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-stone-200/50 space-y-1">
                      <span className="text-xs md:text-sm font-mono uppercase tracking-wider text-[#C08261] font-bold">Marcos de Comunhão</span>
                      <h4 className="font-serif text-lg md:text-2xl font-black text-stone-850">Constância Diária 🔥</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-stone-150 text-center">
                        <Flame size={22} fill="#C08261" className="text-[#C08261] mx-auto mb-1 animate-pulse" />
                        <span id="streak-indicator-val" className="text-base md:text-lg font-black text-stone-850 font-serif block">{progress.streak} dias</span>
                        <span className="text-xs text-stone-550 uppercase font-mono tracking-wider block mt-0.5 font-semibold">Sequência</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-stone-150 text-center">
                        <Award size={22} className="text-[#C08261] mx-auto mb-1" />
                        <span id="max-streak-indicator-val" className="text-base md:text-lg font-black text-stone-850 font-serif block">{progress.maxStreak || Math.max(3, progress.streak)} dias</span>
                        <span className="text-xs text-stone-550 uppercase font-mono tracking-wider block mt-0.5 font-semibold">Recorde</span>
                      </div>
                    </div>

                    {/* Cycle counter statistics block for Phase 2 Retention */}
                    <div className="bg-white p-4.5 rounded-2xl border border-stone-150 space-y-3.5">
                      <span className="text-xs md:text-sm uppercase font-mono tracking-widest font-black text-[#C08261] block">Ciclos de Quietude</span>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-stone-600 font-sans font-medium">Sessões Respiratórias:</span>
                        <span id="cycles-count-val" className="font-serif font-black text-stone-850 text-sm md:text-base">{progress.breathingCyclesCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-xs md:text-sm">
                        <span className="text-stone-600 font-sans font-medium">Dias Perfeitos de Aliança:</span>
                        <span id="perfect-days-count-val" className="font-serif font-black text-stone-850 text-sm md:text-base">{progress.perfectDaysCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* 7-DAY VISUAL TRACKER CHECKS */}
                  <div className="pt-4 mt-3 border-t border-stone-200/50 space-y-2">
                    <span className="text-xs uppercase font-mono text-stone-500 font-bold block">Histórico de Aliança Semanal</span>
                    <div className="flex justify-between items-center px-1">
                      {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => {
                        const isToday = idx === 4;
                        const isDone = isToday && (progress.completedChallenges || []).length > 0;
                        return (
                          <div key={idx} className="flex flex-col items-center space-y-1.5">
                            <span className="text-xs font-mono font-bold text-stone-500">{day}</span>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
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
                <div id="card-retomar-caminhada" className="bg-[#FAF8F5]/60 border border-[#C08261]/25 rounded-3xl p-6 text-left space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-[#C08261] rounded-full animate-ping shrink-0" />
                    <span className="text-xs md:text-sm font-mono uppercase tracking-widest font-extrabold text-[#C08261]">Retomar Caminhada</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bible Card */}
                    {progress.lastReadBibleInfo && (
                      <div id="resume-bible-box" className="bg-white border border-stone-200 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition duration-300 gap-3">
                        <div className="space-y-1.5 pr-2">
                          <span className="text-[10px] md:text-xs font-mono uppercase font-bold text-[#C08261]">Palavra de Alívio</span>
                          <h5 id="resume-bible-ref-title" className="font-serif font-black text-stone-850 text-sm md:text-base">
                            {progress.lastReadBibleInfo.bookName} • Capítulo {progress.lastReadBibleInfo.chapter}
                          </h5>
                          <p className="text-xs text-stone-500 font-sans leading-relaxed">Continue saboreando o Logos divino de onde você parou.</p>
                        </div>
                        <button
                          id="btn-resume-bible"
                          onClick={() => setActiveSection('bible')}
                          className="px-4 py-2 bg-[#C08261] hover:bg-[#b07353] text-white text-xs md:text-sm font-bold font-serif rounded-xl transition cursor-pointer whitespace-nowrap shadow-xs shrink-0"
                        >
                          Retomar ➔
                        </button>
                      </div>
                    )}

                    {/* Ebook Card */}
                    {progress.lastReadEbookInfo && (
                      <div id="resume-ebook-box" className="bg-white border border-stone-200 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition duration-300 w-full overflow-hidden gap-3">
                        <div className="space-y-1.5 pr-2 max-w-[70%]">
                          <span className="text-[10px] md:text-xs font-mono uppercase font-bold text-stone-400">Livro de Inspiração</span>
                          <h5 id="resume-ebook-title" className="font-serif font-black text-stone-850 text-sm md:text-base truncate">
                            {progress.lastReadEbookInfo.ebookTitle}
                          </h5>
                          <p id="resume-ebook-chapter-sub" className="text-xs md:text-sm text-stone-500 font-sans truncate font-medium">Capítulo {progress.lastReadEbookInfo.chapterIndex + 1}: {progress.lastReadEbookInfo.chapterTitle}</p>
                        </div>
                        <button
                          id="btn-resume-ebook"
                          onClick={() => setActiveSection('ebooks')}
                          className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs md:text-sm font-bold font-serif rounded-xl transition cursor-pointer whitespace-nowrap shadow-xs shrink-0"
                        >
                          Continuar ➔
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CAMINHO PRIMITIVO PROMOTION BANNER */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-[#C08261]/40 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left shadow-xs">
                <div className="space-y-3 md:max-w-3xl">
                  <span className="text-xs md:text-sm uppercase font-mono tracking-wider font-extrabold text-[#C08261] flex items-center gap-1.5 bg-[#C08261]/10 px-3 py-1.5 rounded-full w-fit">
                    <span className="w-2 h-2 bg-[#C08261] rounded-full animate-ping" />
                    Movimento de Co-Fundadores
                  </span>
                  <h4 className="font-serif text-xl md:text-2xl font-black text-stone-850">
                    A tecnologia como ponte para a comunhão primitiva.
                  </h4>
                  <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                    Usamos a tecnologia para nos conectar mais uns com os outros e com o Pai, unindo corações, mesas e lares em amor, fé e graça. Apoie nossa infraestrutura e reserve seu espaço pioneiro.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('primitiva')}
                  className="py-3.5 px-7 bg-stone-900 text-white rounded-2.5xl text-xs md:text-sm font-bold hover:bg-black transition active:scale-95 shrink-0 shadow-md cursor-pointer whitespace-nowrap"
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
            
            // Check if Comunhão has been started with a symbolic week (7 days) to allow users to easily test/experience
            const totalRequiredComunhaoDays = 7;
            const completedComunhaoDays = DEVOCIONAIS.filter(dev => progress.completedChapters.includes(dev.id)).length;
            const isComunhaoFullyComplete = completedComunhaoDays >= totalRequiredComunhaoDays;

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
                {/* Header Banner with Cozy Copywriting Styling (Sugarman & Edwards inspired) */}
                <div className="text-center py-8 max-w-3xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C08261]/10 text-[#C08261] rounded-full border border-[#C08261]/20">
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold">☕ Um Café na Presença do Pai</span>
                  </div>
                  <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 tracking-tight leading-tight">
                    Diário do Despertar: <span className="font-semibold text-[#C08261]">365 Dias</span> de Intimidade
                  </h3>
                  <p className="text-stone-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-sans mt-2">
                    Sente-se confortavelmente, feche os olhos por alguns segundos e saboreie este momento. Poucos minutos de sincera comunhão diária podem redirecionar o seu propósito e amparar sua alma.
                  </p>
                </div>

                {/* Highly intuitive segmented choice control */}
                <div id="devotionals-segmented-control" className="flex justify-center p-1 bg-stone-150/60 rounded-2xl max-w-md mx-auto border border-stone-200/50">
                  <button
                    id="tab-devotional-comunhao"
                    onClick={() => setActiveDevotionalTab('comunhao')}
                    className={`flex-1 flex flex-col items-center py-2.5 px-3 rounded-xl transition-all ${
                      activeDevotionalTab === 'comunhao'
                        ? 'bg-white text-[#C08261] shadow-sm font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <span className="text-xs font-serif leading-none">Comunhão Íntima</span>
                    <span className="text-[9px] font-mono uppercase opacity-75 mt-0.5 tracking-wider">Dias 1 a 180</span>
                  </button>
                  <button
                    id="tab-devotional-multiplicacao"
                    onClick={() => setActiveDevotionalTab('multiplicacao')}
                    className={`flex-1 flex flex-col items-center py-2.5 px-3 rounded-xl transition-all ${
                      activeDevotionalTab === 'multiplicacao'
                        ? 'bg-white text-[#C08261] shadow-sm font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <span className="text-xs font-serif leading-none flex items-center gap-1">
                      <span>A Multiplicação</span>
                      {!isComunhaoFullyComplete && <span className="text-[10px]">🔒</span>}
                    </span>
                    <span className="text-[9px] font-mono uppercase opacity-75 mt-0.5 tracking-wider">Dias 181 a 365</span>
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
                        O caminho da <span className="text-[#C08261] font-semibold">Multiplicação</span> se abre após o término de <span className="text-[#C08261] font-semibold">7 dias</span> da Jornada de Comunhão Íntima
                      </h4>
                    </div>

                    <div className="border-t border-stone-800/65 pt-6 space-y-4 max-w-lg mx-auto relative z-10 text-stone-400 text-xs md:text-sm leading-relaxed text-left font-serif font-light">
                      <p className="indent-4">
                        Assim como Jesus fortaleceu as estacas do Seu preparo no secreto antes de iniciar Seu ministério público, o seu chamado de transbordo e discipulado exige a consolidação prévia das suas primeiras estacas de integridade diária.
                      </p>
                      <p className="indent-4">
                        Sente-se à mesa, acolha o Espírito, e complete pelo menos as primeiras <strong>7 lições de Comunhão</strong> para provar de sua constância antes de partir para a multiplicação.
                      </p>
                      
                      <div className="bg-stone-900/50 rounded-2xl p-4.5 border border-stone-800 flex items-start gap-3.5 mt-3">
                        <span className="text-xl">🕊️</span>
                        <div className="space-y-1 flex-1 font-sans">
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wide block font-semibold">Atendimento ao Seu Progresso</span>
                          <span className="text-xs text-stone-300 font-medium">Você concluiu {completedComunhaoDays} de 7 encontros diários.</span>
                          <div className="w-full bg-stone-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-[#C08261] h-full" style={{ width: `${Math.min((completedComunhaoDays / 7) * 100, 100)}%` }} />
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
                        ⚡ Simular 7 dias (Bypass)
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
                  className="flex items-center space-x-1.5 py-1.5 px-3.5 hover:bg-stone-150 rounded-xl text-xs text-stone-600 transition"
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

                  {/* Gerador de Card de Identidade Espiritual (Novo Poder) */}
                  <div className="mt-8 pt-6 border-t border-stone-100 space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase bg-amber-50 text-[#8C6239] border border-amber-200/55 px-2 py-0.5 rounded-full font-bold inline-block">
                        🎨 Propagador de Fé Ativa
                      </span>
                      <h4 className="font-serif text-base font-bold text-stone-850">
                        Gerador de Card de Identidade Espiritual
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed font-sans">
                        As pessoas espalham o que as define. Crie um card personalizado com a verdade que impactou seu coração hoje para compartilhar em grupos ou conversas individuais.
                      </p>
                    </div>

                    {/* Customize tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Theme selection & custom signature inputs */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                            Selecione o Tema Visual do Card
                          </label>
                          <div className="flex gap-2">
                            {[
                              { id: 'cosmic', label: 'Cosmic Dark', bg: 'bg-stone-900 border-stone-800 text-stone-200' },
                              { id: 'linen', label: 'Sand Altar', bg: 'bg-[#FAF8F5] border-amber-200 text-[#8C6239]' },
                              { id: 'emerald', label: 'Emerald Prayer', bg: 'bg-emerald-950 border-emerald-800 text-emerald-100' }
                            ].map((thm) => (
                              <button
                                key={thm.id}
                                type="button"
                                onClick={() => setCardTheme(thm.id as any)}
                                className={`flex-1 py-2 px-1 border text-[10px] font-mono tracking-wide font-extrabold rounded-xl transition cursor-pointer text-center ${thm.bg} ${
                                  cardTheme === thm.id ? 'ring-2 ring-[#C08261] ring-offset-1' : 'opacity-70 hover:opacity-100'
                                }`}
                              >
                                {thm.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                            Sua Assinatura no Rodapé (Identidade)
                          </label>
                          <input
                            type="text"
                            value={cardSignature}
                            onChange={(e) => setCardSignature(e.target.value)}
                            maxLength={24}
                            placeholder={userProfile?.name || "Ex: Peregrino Lucas"}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition text-stone-800"
                          />
                        </div>
                      </div>

                      {/* Interactive Visual Preview */}
                      <div className={`p-5 rounded-2xl border flex flex-col justify-between h-[180px] transition shadow-xs ${
                        cardTheme === 'cosmic'
                          ? 'bg-gradient-to-br from-stone-900 via-stone-950 to-black text-stone-100 border-stone-800'
                          : cardTheme === 'linen'
                          ? 'bg-[#FAF8F5] text-stone-800 border-amber-100/80'
                          : 'bg-gradient-to-br from-emerald-950 to-stone-900 text-emerald-100 border-emerald-900'
                      }`}>
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest text-[#C08261] font-extrabold">
                            <span>Dia {currentIndex + 1} • {selectedDevotional.title}</span>
                            <span>🕊️</span>
                          </div>
                          
                          <p className="font-serif text-xs md:text-[13px] leading-relaxed italic line-clamp-4">
                            "{selectedDevotional.prayer}"
                          </p>
                        </div>

                        <div className="border-t border-stone-200/10 pt-2.5 flex justify-between items-center text-[9px] font-mono uppercase">
                          <span className={cardTheme === 'linen' ? 'text-stone-500 font-bold' : 'text-stone-400 font-bold'}>
                            — {cardSignature || userProfile?.name || 'Um Despertador'}
                          </span>
                          <span className="text-[#C08261] font-bold">SOMOS O DESPERTAR</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const signatureToUse = cardSignature.trim() || userProfile?.name || "Um Peregrino Sincero";
                          const formattedQuoteText = `🕊️ *CARD DE SEGREDO — O DESPERTAR* 🕯️\n*Estudo:* Dia ${currentIndex + 1} - ${selectedDevotional.title}\n\n_"${selectedDevotional.prayer}"_\n\n*Reflexão e Presença por:* — ${signatureToUse}\n\n"Você nunca deveria cear ou enfrentar seus dias sozinho. Puxe uma cadeira à mesa conosco!"\nSintonize: https://somosodespertar.com.br`;
                          handleCopyToClipboard(formattedQuoteText);
                          setCommittedToastMsg("Design de texto do Card copiado para o WhatsApp! 🎨📲");
                          setTimeout(() => setCommittedToastMsg(null), 3500);
                        }}
                        className="flex-1 py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-extrabold rounded-2xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Feather size={13} className="text-amber-400" />
                        <span>Copiar Card em Texto para WhatsApp</span>
                      </button>
                    </div>
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

          {/* ACTIVE PORT: COMMUNITY MURAL WALL */}
          {activeSection === 'mural' && !selectedDevotional && (
            <motion.div
              key="mural"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-2"
            >
              <MuralComunidade
                currentUser={currentUser}
                userProfile={userProfile}
                onShowAuthModal={() => setShowAuthModal(true)}
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
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

                 <div className="bg-[#f3faf5] border border-emerald-100/75 p-5 rounded-2xl flex flex-col align-left justify-center shadow-xs">
                   <span className="text-[9px] uppercase font-mono text-emerald-700 font-extrabold flex items-center space-x-1">
                     <span>🌱 Sementes do Reino</span>
                   </span>
                   <div className="flex items-baseline space-x-1 mt-1.5 text-emerald-800 font-bold">
                     <span className="text-2xl font-bold font-mono">{sementesSaldo}</span>
                     <span className="text-xs text-emerald-600 font-normal">plantadas</span>
                   </div>
                 </div>
               </div>

              {/* O JARDIM VISUAL DO SECRETO (Don Norman / Hooked feedback loop) */}
              <div className="bg-[#f7faf8] border border-emerald-100/60 p-6 md:p-8 rounded-3xl text-left space-y-6 relative overflow-hidden mt-6 animate-fade-in shadow-xs">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#dcfce7]/30 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold tracking-wider leading-none">
                      Metáfora Viva • O Jardim do Coração
                    </span>
                    <h4 className="font-serif text-xl md:text-2xl font-bold text-stone-850 flex items-center space-x-2">
                      <span>{(() => {
                        if (sementesSaldo <= 5) return '🌱 Jardim Sementeiro';
                        if (sementesSaldo <= 15) return '🔥 Cultivo das Chamas';
                        if (sementesSaldo <= 30) return '🌻 Semeador da Esperança';
                        if (sementesSaldo <= 50) return '🌳 Floresta da Intimidade';
                        return '👑 Arauto Real do Secreto';
                      })()}</span>
                    </h4>
                    <p className="text-stone-500 text-xs md:text-sm font-sans max-w-xl">
                      Para cada semente que você planta no secreto através de orações ou reflexões na comunidade, seu altar invisível floresce com novos galhos e frutos eternos.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-emerald-100/80 px-4 py-3 rounded-2xl shadow-2xs font-mono text-center shrink-0">
                    <span className="text-xl md:text-2xl font-black text-emerald-800 block">{sementesSaldo}</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#C08261] font-bold">Fidelidade Viva</span>
                  </div>
                </div>

                {/* Simulated physical grid representation of seeds that illuminate or bloom */}
                <div className="relative z-10 bg-white/70 border border-emerald-100/40 p-4 rounded-2xl">
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 md:gap-4 justify-items-center">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const seedThreshold = i + 1;
                      const hasSeed = sementesSaldo >= seedThreshold;
                      const isMultipleOf5 = seedThreshold % 5 === 0;
                      
                      return (
                        <div 
                          key={i} 
                          className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-500 relative group select-none ${
                            hasSeed 
                              ? isMultipleOf5 
                                ? 'bg-[#dcfce7] border border-emerald-300 text-base animate-pulse shadow-xs' 
                                : 'bg-[#f0fdf4] border border-emerald-200 text-sm hover:scale-105' 
                              : 'bg-stone-50 border border-stone-100 opacity-30 italic text-stone-300 hover:opacity-50'
                          }`}
                        >
                          {hasSeed ? (
                            isMultipleOf5 ? '🌸' : '🌱'
                          ) : (
                            '💤'
                          )}
                          <span className="absolute -bottom-2 text-[7.5px] font-mono text-stone-400 bg-white/90 border border-stone-100 px-1.5 py-0 rounded-full scale-75 leading-none">
                            {seedThreshold}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-stone-400 mt-5 pt-3 border-t border-emerald-50/50">
                    <span>🌱 Mudas Cultivadas</span>
                    <span className="flex items-center space-x-1"><span>🌸</span> <span>Flores de Alianças (Células de 5)</span></span>
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

              {/* Saved Verses, Reflections & Sementes list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                {/* Notes list */}
                <div className="space-y-4 animate-fade-in">
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
                <div className="space-y-4 animate-fade-in">
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

                {/* Sementes do Reino Timeline */}
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center space-x-1.5 text-stone-850 border-b border-stone-100 pb-2">
                    <span className="text-sm">🌱</span>
                    <h4 className="font-serif text-lg font-medium">Sementes no Secreto</h4>
                  </div>

                  {sementesMovimentos.length === 0 ? (
                    <div className="text-stone-450 text-xs py-8 px-5 text-center italic border border-dashed border-emerald-100 bg-[#fbfdfb] rounded-2xl space-y-3">
                      <p>Nenhuma semente registrada no histórico ainda.</p>
                      <p className="text-[11px] text-stone-400 font-sans not-italic leading-relaxed">
                        <strong>Como pontuar:</strong> Diga "vou orar" ou "estou orando" nas conversas das <strong>Mesas de Comunhão</strong>, ou salve uma reflexão na <strong>Nuvem de Testemunhas</strong>! 🌱✨
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {sementesMovimentos.map((mov, idx) => (
                        <div key={mov.id || idx} className="bg-white border border-stone-200/60 p-4 rounded-2xl text-left space-y-1.5 shadow-xs hover:border-emerald-250 transition-all duration-300">
                          <div className="flex justify-between items-center text-[10px] text-stone-405 font-mono">
                            <span className="font-extrabold uppercase text-emerald-700 tracking-wider flex items-center space-x-1">
                              <span>🌱</span>
                              <span>{mov.tipo === 'oracao' ? 'Oração' : 'Reflexão'}</span>
                            </span>
                            <span>{new Date(mov.criadoEm).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-stone-700 font-sans font-medium line-clamp-3">
                            {mov.descricao}
                          </p>
                          <div className="text-right">
                            <span className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                              +1 semente
                            </span>
                          </div>
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

          {/* ACTIVE PORT: APP SHOWCASE & DISCOVER PORTAL */}
          {activeSection === 'apps' && !selectedDevotional && (
            <motion.div
              key="apps"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <AppsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Zero Fricção: Palavra do Silêncio Modal Overlay */}
      <AnimatePresence>
        {showFrictionlessModal && randomQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0A09]/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-stone-100 max-w-lg w-full border border-[#DCAE6C]/30 p-6 md:p-8 rounded-3xl shadow-2xl relative space-y-6 text-left"
            >
              {/* Gold light burst */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-[#DCAE6C]/10 to-transparent pointer-events-none rounded-full blur-3xl" />
              
              <div className="flex justify-between items-center pb-3 border-b border-stone-800 relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#DCAE6C] animate-ping" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#DCAE6C] font-extrabold">
                    {randomQuote.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFrictionlessModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-xs transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <span className="text-[9px] font-mono text-stone-400 block uppercase tracking-wider">
                  📖 {randomQuote.scripture}
                </span>

                <blockquote className="font-serif text-lg md:text-xl italic text-stone-100 leading-relaxed border-l-2 border-[#C08261] pl-4">
                  "{randomQuote.text}"
                </blockquote>

                <p className="text-[10.5px] text-[#DCAE6C] font-serif leading-relaxed pt-2">
                  "Ninguém deveria enfrentar seus dias sozinho. Sentiu que esta centelha foi escrita exatamente para você? Não a guarde com exclusividade — faça a corrente elétrica circular."
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    const formatted = `🕊️ *CENTELHA ENCONTRADA NO SILÊNCIO* 🕯️\n\n_"${randomQuote.text}"_\n\n📖 *Passagem:* ${randomQuote.scripture}\n*Origem:* Café com o Despertar\n\n"Pensei em você hoje. O amor sempre andou de mesa em mesa, não enfrente seu dia sozinho!"\nSintonize: https://somosodespertar.com.br`;
                    handleCopyToClipboard(formatted);
                    setShowFrictionlessModal(false);
                    // Reward with a credit for sharing/doing!
                    const savedCredits = localStorage.getItem("despertar_user_credits");
                    const currentC = savedCredits ? parseInt(savedCredits) : 50;
                    localStorage.setItem("despertar_user_credits", (currentC + 3).toString());
                  }}
                  className="flex-1 py-3 bg-[#C08261] hover:bg-[#b07353] text-white text-xs font-mono uppercase tracking-wider font-extrabold rounded-2xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Share2 size={13} className="text-white shrink-0" />
                  <span>Enviar no WhatsApp (+3 Créditos)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFrictionlessModal(false)}
                  className="py-3 px-5 bg-stone-850 hover:bg-stone-800 border border-stone-850 text-stone-300 text-xs font-mono uppercase rounded-2xl transition cursor-pointer"
                >
                  Amém, Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sementes Particle/Popup System */}
      <div className="fixed bottom-10 right-6 z-50 pointer-events-none flex flex-col items-end space-y-2 max-w-sm md:max-w-md">
        <AnimatePresence>
          {floatingSementes.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -80, scale: 0.9, filter: 'blur(4px)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-emerald-950/98 text-stone-105 border-2 border-emerald-500/40 p-4 rounded-3xl shadow-2xl flex flex-col space-y-2 pointer-events-auto backdrop-blur-md w-80 md:w-96"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-505/20 border border-emerald-500/30 flex items-center justify-center text-lg animate-bounce shrink-0 select-none">
                  🌱
                </div>
                <div className="text-left leading-tight">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-emerald-300 font-black uppercase tracking-wider">
                      +{item.valor || 1} Sementes do Reino!
                    </span>
                    <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider block font-bold">
                      {item.tipo === 'oracao' ? '🙏 Oração' : '📖 Testemunho'}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300 font-sans font-medium line-clamp-1 mt-0.5">
                    {item.descricao}
                  </p>
                </div>
              </div>

              {item.mensagemEspecial && (
                <div className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl font-bold text-left">
                  🌟 {item.mensagemEspecial}
                </div>
              )}

              {item.versiculo && (
                <div className="text-[10px] font-serif italic text-emerald-100/90 bg-[#142d1d] border border-emerald-800/55 p-2 rounded-xl text-left leading-relaxed">
                  {item.versiculo}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * MesasSection — Tribos do Despertar
 * Modelo: Seth Godin "Tribos" — grupos online por temporada de vida.
 * Sem encontros presenciais. Sem endereços físicos.
 * A tribo se forma pela dor compartilhada, não pela proximidade geográfica.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, MessageSquare, Search, Flame, Heart,
  ArrowRight, Lock, Unlock, ChevronRight, X,
  Sparkles, BookOpen, Shield
} from 'lucide-react';
import {
  collection, onSnapshot, query, addDoc,
  updateDoc, doc, arrayUnion, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Tribo {
  id: string;
  emoji: string;
  nome: string;
  tagline: string;           // "Eu também passei por isso"
  descricao: string;         // o vale que une as pessoas
  cor: string;               // bg tailwind class
  corTexto: string;
  corBorda: string;
  membros: string[];         // UIDs
  mensagens?: number;        // contador aproximado
  createdBy?: string;
}

interface Pilgrim {
  uid: string;
  name: string;
  avatarEmoji: string;
  photoURL?: string;
  currentIdentityId: string;
  streak: number;
}

interface MesasSectionProps {
  onStartChat: (uid: string, name: string, emoji: string) => void;
  onOpenAuth: () => void;
  initialTab?: 'mesas' | 'pilgrims';
}

// ── Tribos iniciais (semente) ─────────────────────────────────────────────────
// Estas tribos existem desde o início — ninguém precisa criar a primeira.

const TRIBOS_SEMENTE: Omit<Tribo, 'membros' | 'mensagens' | 'createdBy'>[] = [
  {
    id: 'filho-prodigo',
    emoji: '🔥',
    nome: 'O Filho Pródigo',
    tagline: 'Voltei. Mas não sei se mereço voltar.',
    descricao: 'Para quem se afastou da fé, da família ou de si mesmo — e está encontrando o caminho de volta. Sem julgamento. Sem cobrança. Só presença.',
    cor: 'bg-amber-50',
    corTexto: 'text-amber-800',
    corBorda: 'border-amber-200',
  },
  {
    id: 'segunda-chance',
    emoji: '🌱',
    nome: 'Segunda Chance',
    tagline: 'Recomeçar não é fraqueza. É coragem.',
    descricao: 'Depois de uma queda, um fracasso, uma decisão que doeu. Aqui moram pessoas que decidiram tentar de novo — na fé, no trabalho, nos relacionamentos.',
    cor: 'bg-emerald-50',
    corTexto: 'text-emerald-800',
    corBorda: 'border-emerald-200',
  },
  {
    id: 'depois-do-divorcio',
    emoji: '💔',
    nome: 'Depois do Divórcio',
    tagline: 'Quando o que era dois virou um — de novo.',
    descricao: 'Fé quando a família se desfaz. Identidade quando o sobrenome muda. Criação de filhos sozinho. Reconstruir sem amargura. Esta tribo conhece esse vale.',
    cor: 'bg-rose-50',
    corTexto: 'text-rose-800',
    corBorda: 'border-rose-200',
  },
  {
    id: 'ansiedade-e-fe',
    emoji: '🌊',
    nome: 'Ansiedade e Fé',
    tagline: 'Oro e ainda assim o coração aperta.',
    descricao: 'Saúde mental e espiritualidade não são opostos. Esta tribo é para quem vive com ansiedade, síndrome do pânico ou depressão — e ainda quer caminhar com Deus.',
    cor: 'bg-sky-50',
    corTexto: 'text-sky-800',
    corBorda: 'border-sky-200',
  },
  {
    id: 'no-vale',
    emoji: '🏔️',
    nome: 'No Vale',
    tagline: 'Doença, luto, crise. E a fé ainda aqui.',
    descricao: 'Para quem está passando por diagnóstico difícil, perda de alguém, crise financeira severa. Um lugar onde ninguém manda você "ter mais fé" — só fica junto.',
    cor: 'bg-slate-50',
    corTexto: 'text-slate-700',
    corBorda: 'border-slate-200',
  },
  {
    id: 'terceira-idade',
    emoji: '🧓',
    nome: 'Terceira Idade',
    tagline: 'Há muito chão pela frente. E muito a oferecer.',
    descricao: 'Propósito, fé e comunidade na última estação da vida. Para quem tem 60, 70, 80 anos e ainda quer pertencer a algo vivo — não só a uma memória.',
    cor: 'bg-orange-50',
    corTexto: 'text-orange-800',
    corBorda: 'border-orange-200',
  },
  {
    id: 'pai-mae-solo',
    emoji: '👨‍👧',
    nome: 'Pai Solo / Mãe Solo',
    tagline: 'Criar filhos na fé quando você é os dois.',
    descricao: 'A responsabilidade duplica. O cansaço é real. Esta tribo é para quem está criando filhos sozinho e ainda quer que eles cresçam com raízes espirituais.',
    cor: 'bg-violet-50',
    corTexto: 'text-violet-800',
    corBorda: 'border-violet-200',
  },
  {
    id: 'primeiro-passo',
    emoji: '👣',
    nome: 'Primeiro Passo',
    tagline: 'Nunca tive fé. Mas algo aqui fez sentido.',
    descricao: 'Para quem está experimentando espiritualidade pela primeira vez. Sem vocabulário religioso, sem pressão, sem cobrança de conhecimento prévio. Só curiosidade respeitada.',
    cor: 'bg-teal-50',
    corTexto: 'text-teal-800',
    corBorda: 'border-teal-200',
  },
  {
    id: 'casamento-em-crise',
    emoji: '🕊️',
    nome: 'Casamento em Crise',
    tagline: 'O amor ainda está aqui. Mas está cansado.',
    descricao: 'Para casais — ou metades de casais — que querem reconstruir o que está rachado. Sem glamour de "casamento cristão perfeito". Só trabalho real e fé honesta.',
    cor: 'bg-pink-50',
    corTexto: 'text-pink-800',
    corBorda: 'border-pink-200',
  },
  {
    id: 'jovens-que-questionam',
    emoji: '⚡',
    nome: 'Jovens que Questionam',
    tagline: 'Tenho dúvidas. E isso não me faz menos crente.',
    descricao: 'Para quem tem entre 18 e 30 anos e cresceu na fé mas agora tem perguntas que a Igreja não respondeu bem. Ciência, política, identidade, propósito — tudo pode ser trazido aqui.',
    cor: 'bg-yellow-50',
    corTexto: 'text-yellow-800',
    corBorda: 'border-yellow-200',
  },
];

// ── Componente principal ──────────────────────────────────────────────────────

export default function MesasSection({ onStartChat, onOpenAuth, initialTab = 'mesas' }: MesasSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'mesas' | 'pilgrims'>(initialTab);
  const [tribos, setTribos] = useState<Tribo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [triboSelecionada, setTriboSelecionada] = useState<Tribo | null>(null);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [searchPilgrim, setSearchPilgrim] = useState('');

  const currentUser = auth.currentUser;
  const currentUserId = currentUser?.uid;

  useEffect(() => { setActiveSubTab(initialTab); }, [initialTab]);

  // ── Firestore: carregar tribos ─────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'tribos'));
    const unsub = onSnapshot(q, (snap) => {
      const fromFirestore: Tribo[] = [];
      snap.forEach(d => {
        const data = d.data();
        fromFirestore.push({
          id: d.id,
          emoji: data.emoji || '🕊️',
          nome: data.nome || '',
          tagline: data.tagline || '',
          descricao: data.descricao || '',
          cor: data.cor || 'bg-stone-50',
          corTexto: data.corTexto || 'text-stone-700',
          corBorda: data.corBorda || 'border-stone-200',
          membros: data.membros || [],
          mensagens: data.mensagens || 0,
          createdBy: data.createdBy || null,
        });
      });

      // Mesclar com sementes: usar semente se não existir no Firestore
      const ids = fromFirestore.map(t => t.id);
      const sementes: Tribo[] = TRIBOS_SEMENTE
        .filter(s => !ids.includes(s.id))
        .map(s => ({ ...s, membros: [], mensagens: 0 }));

      setTribos([...sementes, ...fromFirestore]);
      setLoading(false);
    }, () => {
      // fallback offline
      setTribos(TRIBOS_SEMENTE.map(s => ({ ...s, membros: [], mensagens: 0 })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Firestore: carregar peregrinos ────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Pilgrim[] = [];
      snap.forEach(d => {
        if (d.id !== currentUserId) {
          const data = d.data();
          list.push({
            uid: d.id,
            name: data.name || 'Peregrino',
            avatarEmoji: data.avatarEmoji || '🕊️',
            photoURL: data.photoURL || null,
            currentIdentityId: data.currentIdentityId || '',
            streak: data.streak || 0,
          });
        }
      });
      setPilgrims(list);
    });
    return () => unsub();
  }, [currentUserId]);

  // ── Entrar numa tribo ─────────────────────────────────────────────────────
  const handleEntrarTribo = async (tribo: Tribo) => {
    if (!currentUser) { onOpenAuth(); return; }
    if (joinedIds.includes(tribo.id)) return;

    try {
      // Tentar atualizar no Firestore; se não existe, criar
      const triboRef = doc(db, 'tribos', tribo.id);
      await updateDoc(triboRef, {
        membros: arrayUnion(currentUserId),
        updatedAt: serverTimestamp(),
      }).catch(async () => {
        // Documento não existe ainda — criar
        await addDoc(collection(db, 'tribos'), {
          ...tribo,
          membros: [currentUserId],
          createdAt: serverTimestamp(),
        });
      });

      setJoinedIds(prev => [...prev, tribo.id]);
      showNotification(`Você entrou na tribo "${tribo.nome}" 🕊️`);
    } catch (e) {
      console.error(e);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const tribosFiltradas = tribos.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pilgrimsFiltrados = pilgrims.filter(p =>
    p.name.toLowerCase().includes(searchPilgrim.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Notificação */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs font-mono px-4 py-2.5 rounded-full shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C08261] font-bold">
          ✦ Seth Godin · Tribos
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-800 leading-tight">
          Encontre sua tribo.<br />
          <span className="text-[#C08261]">Você não está sozinho neste vale.</span>
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
          Tribos não são grupos de interesses. São pessoas que vivem o mesmo vale
          ao mesmo tempo — e que entenderiam sua história sem você precisar explicar tudo.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-stone-100 pb-1">
        {[
          { id: 'mesas' as const, label: '🔥 Tribos', desc: 'por temporada de vida' },
          { id: 'pilgrims' as const, label: '🧭 Peregrinos', desc: 'conectar diretamente' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === tab.id
                ? 'bg-[#C08261] text-white'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            {tab.label}
            <span className={`hidden md:inline text-[10px] font-normal opacity-75`}>
              · {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ── ABA TRIBOS ── */}
      {activeSubTab === 'mesas' && (
        <div className="space-y-5">

          {/* Aviso de segurança — transparência total */}
          <div className="flex items-start gap-3 bg-stone-50 border border-stone-200/60 rounded-2xl px-4 py-3">
            <Shield size={15} className="text-[#C08261] shrink-0 mt-0.5" />
            <p className="text-xs text-stone-500 leading-relaxed">
              <span className="font-semibold text-stone-700">Tribos 100% online.</span>{' '}
              Estas comunidades existem aqui dentro, em texto assíncrono —
              como um grupo de WhatsApp, mas dentro do Despertar.
              Nenhum dado de localização é coletado. Nenhum encontro presencial é organizado por esta plataforma.
            </p>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar pelo que você está vivendo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 focus:border-[#C08261]/50 transition"
            />
          </div>

          {/* Grid de Tribos */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tribosFiltradas.map((tribo, index) => {
                const joined = joinedIds.includes(tribo.id) || tribo.membros.includes(currentUserId || '');
                return (
                  <motion.div
                    key={tribo.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${tribo.cor} border ${tribo.corBorda} rounded-2xl p-4 space-y-3 hover:shadow-sm transition-all duration-200 cursor-pointer group`}
                    onClick={() => setTriboSelecionada(tribo)}
                  >
                    {/* Header do card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{tribo.emoji}</span>
                        <div>
                          <h3 className={`font-serif text-sm font-bold leading-tight ${tribo.corTexto}`}>
                            {tribo.nome}
                          </h3>
                          <p className="text-[11px] text-stone-500 italic mt-0.5 leading-snug">
                            "{tribo.tagline}"
                          </p>
                        </div>
                      </div>
                      {joined && (
                        <span className="shrink-0 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ membro
                        </span>
                      )}
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {tribo.descricao}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {tribo.membros.length || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={10} />
                          online
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${tribo.corTexto} group-hover:translate-x-0.5 transition-transform flex items-center gap-1`}>
                        Ver tribo <ChevronRight size={10} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Frase Seth Godin */}
          <div className="text-center py-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 italic font-serif leading-relaxed max-w-sm mx-auto">
              "Uma tribo é um grupo de pessoas conectadas entre si, conectadas a um líder,
              e conectadas a uma ideia." — Seth Godin
            </p>
            <p className="text-[10px] font-mono text-stone-400 mt-1">
              Aqui o líder é quem diz "eu também passei por isso."
            </p>
          </div>
        </div>
      )}

      {/* ── ABA PEREGRINOS ── */}
      {activeSubTab === 'pilgrims' && (
        <div className="space-y-4">
          {!currentUser ? (
            <div className="text-center py-12 space-y-4">
              <span className="text-4xl">🔒</span>
              <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed">
                Para conectar com outros peregrinos, você precisa estar com uma conta ativa.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold rounded-2xl transition"
              >
                Entrar / Criar Conta
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar peregrino..."
                  value={searchPilgrim}
                  onChange={e => setSearchPilgrim(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 transition"
                />
              </div>

              {pilgrimsFiltrados.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-sm">
                  {pilgrims.length === 0
                    ? 'Ainda não há outros peregrinos conectados.'
                    : 'Nenhum peregrino encontrado.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {pilgrimsFiltrados.map((p, i) => (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between bg-white border border-stone-200/60 rounded-2xl px-4 py-3 hover:border-[#C08261]/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100/80 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                          {p.photoURL
                            ? <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover" />
                            : p.avatarEmoji}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-800 font-sans">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Flame size={9} className="text-[#C08261]" />
                              {p.streak} dias
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onStartChat(p.uid, p.name, p.avatarEmoji)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-black text-white text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl transition"
                      >
                        <MessageSquare size={11} />
                        Chat
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MODAL DETALHE DA TRIBO ── */}
      <AnimatePresence>
        {triboSelecionada && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setTriboSelecionada(null)}
              className="fixed inset-0 bg-stone-900 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full z-50 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
              style={{ maxHeight: '85vh' }}
            >
              {/* Barra de fechar */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{triboSelecionada.emoji}</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-800 leading-tight">
                      {triboSelecionada.nome}
                    </h3>
                    <p className="text-xs text-stone-400 italic">"{triboSelecionada.tagline}"</p>
                  </div>
                </div>
                <button
                  onClick={() => setTriboSelecionada(null)}
                  className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition"
                >
                  <X size={14} className="text-stone-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                {/* Descrição completa */}
                <p className="text-sm text-stone-600 leading-relaxed">
                  {triboSelecionada.descricao}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-stone-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-[#C08261]" />
                    {triboSelecionada.membros.length} peregrinos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#C08261]" />
                    conversa assíncrona
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-600" />
                    100% online
                  </span>
                </div>

                {/* O que você vai encontrar aqui */}
                <div className={`${triboSelecionada.cor} border ${triboSelecionada.corBorda} rounded-2xl p-4 space-y-2`}>
                  <p className={`text-[10px] font-mono uppercase font-bold tracking-widest ${triboSelecionada.corTexto}`}>
                    O que você vai encontrar aqui
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      'Pessoas que vivem o mesmo vale que você agora',
                      'Sem julgamento, sem pressão de "ter mais fé"',
                      'Histórias reais de quem está caminhando — não de quem já chegou',
                      'Um lugar para falar o que não cabe no culto de domingo',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                        <span className={`${triboSelecionada.corTexto} mt-0.5 shrink-0`}>✦</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aviso de segurança no modal */}
                <div className="flex items-start gap-2 text-[11px] text-stone-400 leading-relaxed">
                  <Shield size={12} className="shrink-0 mt-0.5 text-stone-400" />
                  <span>
                    Esta tribo existe dentro do Despertar, online.
                    Nenhum dado de localização é coletado e nenhum encontro
                    presencial é organizado por esta plataforma.
                  </span>
                </div>

                {/* CTA */}
                {joinedIds.includes(triboSelecionada.id) || triboSelecionada.membros.includes(currentUserId || '') ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-semibold">
                    <span>✓</span>
                    <span>Você já faz parte desta tribo</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEntrarTribo(triboSelecionada)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-black text-white text-sm font-mono uppercase tracking-wider font-bold rounded-2xl transition shadow-sm min-h-[48px]"
                  >
                    <Heart size={14} />
                    <span>Entrar nesta tribo</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

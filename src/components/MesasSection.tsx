/**
 * MesasSection — Tribos & Mesas do Despertar
 * "Deus mesmo organizou seu povo em tribos — doze nomes, doze caminhos,
 *  uma mesma aliança." (Nm 1–2)
 *
 * Fluxo de progresso comunitário:
 *   1. Tribos online (abertas agora)
 *   2. Mesas online (desbloqueiam ao atingir 12 tribos ativas)
 *   3. Mesas presenciais (futuro — decidido pelos próprios membros)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, MessageSquare, Search, Flame, Heart, Lock,
  ArrowRight, ChevronRight, X, Sparkles, Shield,
  Coffee, Globe, MapPin, Star
} from 'lucide-react';import {
  collection, onSnapshot, query, addDoc,
  updateDoc, doc, arrayUnion, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Tribo {
  id: string;
  emoji: string;
  nome: string;
  tagline: string;
  descricao: string;
  cor: string;
  corTexto: string;
  corBorda: string;
  membros: string[];
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
  initialTab?: 'tribos' | 'pilgrims' | 'mesas-online' | 'mesas-presenciais';
}

// ── 10 Tribos semente ─────────────────────────────────────────────────────────

const TRIBOS_SEMENTE: Omit<Tribo, 'membros' | 'createdBy'>[] = [
  {
    id: 'filho-prodigo',
    emoji: '🔥',
    nome: 'O Filho Pródigo',
    tagline: 'Voltei. Mas não sei se mereço voltar.',
    descricao: 'Para quem se afastou da fé, da família ou de si mesmo — e está encontrando o caminho de volta. Sem julgamento. Sem cobrança. Só presença.',
    cor: 'bg-amber-50', corTexto: 'text-amber-800', corBorda: 'border-amber-200',
  },
  {
    id: 'segunda-chance',
    emoji: '🌱',
    nome: 'Segunda Chance',
    tagline: 'Recomeçar não é fraqueza. É coragem.',
    descricao: 'Depois de uma queda, um fracasso, uma decisão que doeu. Aqui moram pessoas que decidiram tentar de novo — na fé, no trabalho, nos relacionamentos.',
    cor: 'bg-emerald-50', corTexto: 'text-emerald-800', corBorda: 'border-emerald-200',
  },
  {
    id: 'depois-do-divorcio',
    emoji: '💔',
    nome: 'Depois do Divórcio',
    tagline: 'Quando o que era dois virou um — de novo.',
    descricao: 'Fé quando a família se desfaz. Identidade quando o sobrenome muda. Criação de filhos sozinho. Reconstruir sem amargura. Esta tribo conhece esse vale.',
    cor: 'bg-rose-50', corTexto: 'text-rose-800', corBorda: 'border-rose-200',
  },
  {
    id: 'ansiedade-e-fe',
    emoji: '🌊',
    nome: 'Ansiedade e Fé',
    tagline: 'Oro e ainda assim o coração aperta.',
    descricao: 'Saúde mental e espiritualidade não são opostos. Esta tribo é para quem vive com ansiedade, síndrome do pânico ou depressão — e ainda quer caminhar com Deus.',
    cor: 'bg-sky-50', corTexto: 'text-sky-800', corBorda: 'border-sky-200',
  },
  {
    id: 'no-vale',
    emoji: '🏔️',
    nome: 'No Vale',
    tagline: 'Doença, luto, crise. E a fé ainda aqui.',
    descricao: 'Para quem está passando por diagnóstico difícil, perda de alguém, crise financeira severa. Um lugar onde ninguém manda você "ter mais fé" — só fica junto.',
    cor: 'bg-slate-50', corTexto: 'text-slate-700', corBorda: 'border-slate-200',
  },
  {
    id: 'terceira-idade',
    emoji: '🧓',
    nome: 'Terceira Idade',
    tagline: 'Há muito chão pela frente. E muito a oferecer.',
    descricao: 'Propósito, fé e comunidade na última estação da vida. Para quem tem 60, 70, 80 anos e ainda quer pertencer a algo vivo — não só a uma memória.',
    cor: 'bg-orange-50', corTexto: 'text-orange-800', corBorda: 'border-orange-200',
  },
  {
    id: 'pai-mae-solo',
    emoji: '👨‍👧',
    nome: 'Pai Solo / Mãe Solo',
    tagline: 'Criar filhos na fé quando você é os dois.',
    descricao: 'A responsabilidade duplica. O cansaço é real. Esta tribo é para quem está criando filhos sozinho e ainda quer que eles cresçam com raízes espirituais.',
    cor: 'bg-violet-50', corTexto: 'text-violet-800', corBorda: 'border-violet-200',
  },
  {
    id: 'primeiro-passo',
    emoji: '👣',
    nome: 'Primeiro Passo',
    tagline: 'Nunca tive fé. Mas algo aqui fez sentido.',
    descricao: 'Para quem está experimentando espiritualidade pela primeira vez. Sem vocabulário religioso, sem pressão, sem cobrança de conhecimento prévio. Só curiosidade respeitada.',
    cor: 'bg-teal-50', corTexto: 'text-teal-800', corBorda: 'border-teal-200',
  },
  {
    id: 'casamento-em-crise',
    emoji: '🕊️',
    nome: 'Casamento em Crise',
    tagline: 'O amor ainda está aqui. Mas está cansado.',
    descricao: 'Para casais — ou metades de casais — que querem reconstruir o que está rachado. Sem glamour de "casamento cristão perfeito". Só trabalho real e fé honesta.',
    cor: 'bg-pink-50', corTexto: 'text-pink-800', corBorda: 'border-pink-200',
  },
  {
    id: 'jovens-que-questionam',
    emoji: '⚡',
    nome: 'Jovens que Questionam',
    tagline: 'Tenho dúvidas. E isso não me faz menos crente.',
    descricao: 'Para quem cresceu na fé mas agora tem perguntas que a Igreja não respondeu bem. Ciência, política, identidade, propósito — tudo pode ser trazido aqui.',
    cor: 'bg-yellow-50', corTexto: 'text-yellow-800', corBorda: 'border-yellow-200',
  },
];

// ── Mesas futuras (preview bloqueado) ─────────────────────────────────────────

const MESAS_FUTURAS = [
  {
    id: 'mesa-estudo',
    emoji: '📖',
    nome: 'Mesa de Estudo Bíblico',
    descricao: 'Um grupo pequeno, ao redor da Palavra. Leitura, troca, aprofundamento.',
    tipo: 'online',
  },
  {
    id: 'mesa-oracao',
    emoji: '🙏',
    nome: 'Mesa de Intercessão',
    descricao: 'Peregrinos que se comprometem a orar uns pelos outros toda semana.',
    tipo: 'online',
  },
  {
    id: 'mesa-jovens',
    emoji: '⚡',
    nome: 'Mesa de Jovens',
    descricao: 'Fé, identidade e propósito para quem está descobrindo quem é.',
    tipo: 'online',
  },
  {
    id: 'mesa-mulheres',
    emoji: '🌸',
    nome: 'Mesa de Mulheres',
    descricao: 'Espaço seguro de fé, cuidado e crescimento para mulheres em jornada.',
    tipo: 'online',
  },
  {
    id: 'mesa-casais',
    emoji: '💑',
    nome: 'Mesa de Casais',
    descricao: 'Construir o lar sobre a rocha — junto com outros casais honestos.',
    tipo: 'online',
  },
  {
    id: 'mesa-lideranca',
    emoji: '🧭',
    nome: 'Mesa de Líderes',
    descricao: 'Para quem serve, lidera ou quer aprender a servir melhor.',
    tipo: 'online',
  },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function MesasSection({ onStartChat, onOpenAuth, initialTab = 'mesas' }: MesasSectionProps) {
  const [activeTab, setActiveTab] = useState<'tribos' | 'pilgrims' | 'mesas-online' | 'mesas-presenciais'>(initialTab || 'tribos');
  const [tribos, setTribos] = useState<Tribo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [triboSelecionada, setTriboSelecionada] = useState<Tribo | null>(null);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [searchPilgrim, setSearchPilgrim] = useState('');
  const [showCreateTribo, setShowCreateTribo] = useState(false);
  const [novaTriboNome, setNovaTriboNome] = useState('');
  const [novaTriboTagline, setNovaTriboTagline] = useState('');
  const [novaTriboDescricao, setNovaTriboDescricao] = useState('');
  const [novaTriboEmoji, setNovaTriboEmoji] = useState('🕊️');
  const [criandoTribo, setCriandoTribo] = useState(false);

  const currentUser = auth.currentUser;
  const currentUserId = currentUser?.uid;

  // Sincroniza com a navegação externa (sidebar/bottom nav)
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // ── Firestore: tribos ──────────────────────────────────────────────────────
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
          createdBy: data.createdBy || null,
        });
      });
      const ids = fromFirestore.map(t => t.id);
      const sementes: Tribo[] = TRIBOS_SEMENTE
        .filter(s => !ids.includes(s.id))
        .map(s => ({ ...s, membros: [] }));
      setTribos([...sementes, ...fromFirestore]);
      setLoading(false);
    }, () => {
      setTribos(TRIBOS_SEMENTE.map(s => ({ ...s, membros: [] })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Firestore: peregrinos ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = onSnapshot(query(collection(db, 'users')), (snap) => {
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

  // ── Entrar numa tribo ──────────────────────────────────────────────────────
  const handleEntrarTribo = async (tribo: Tribo) => {
    if (!currentUser) { onOpenAuth(); return; }
    if (joinedIds.includes(tribo.id) || tribo.membros.includes(currentUserId || '')) return;
    try {
      const triboRef = doc(db, 'tribos', tribo.id);
      try {
        await updateDoc(triboRef, {
          membros: arrayUnion(currentUserId),
          updatedAt: serverTimestamp(),
        });
      } catch {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(triboRef, {
          emoji: tribo.emoji, nome: tribo.nome, tagline: tribo.tagline,
          descricao: tribo.descricao, cor: tribo.cor, corTexto: tribo.corTexto,
          corBorda: tribo.corBorda, membros: [currentUserId],
          createdAt: serverTimestamp(),
        });
      }
      setJoinedIds(prev => [...prev, tribo.id]);
      setTriboSelecionada(null);
      showNotif(`Bem-vindo à tribo "${tribo.nome}" 🕊️`);
    } catch (e) { console.error(e); }
  };

  // ── Criar tribo ────────────────────────────────────────────────────────────
  const handleCriarTribo = async () => {
    if (!currentUser) { onOpenAuth(); return; }
    if (!novaTriboNome.trim() || !novaTriboDescricao.trim()) return;
    setCriandoTribo(true);
    const paletas = [
      { cor: 'bg-amber-50', corTexto: 'text-amber-800', corBorda: 'border-amber-200' },
      { cor: 'bg-violet-50', corTexto: 'text-violet-800', corBorda: 'border-violet-200' },
      { cor: 'bg-teal-50', corTexto: 'text-teal-800', corBorda: 'border-teal-200' },
      { cor: 'bg-rose-50', corTexto: 'text-rose-800', corBorda: 'border-rose-200' },
      { cor: 'bg-sky-50', corTexto: 'text-sky-800', corBorda: 'border-sky-200' },
    ];
    const cor = paletas[Math.floor(Math.random() * paletas.length)];
    try {
      await addDoc(collection(db, 'tribos'), {
        emoji: novaTriboEmoji,
        nome: novaTriboNome.trim(),
        tagline: novaTriboTagline.trim() || 'Um lugar para caminhar junto.',
        descricao: novaTriboDescricao.trim(),
        ...cor,
        membros: [currentUserId],
        createdBy: currentUserId,
        createdAt: serverTimestamp(),
      });
      setNovaTriboNome(''); setNovaTriboTagline('');
      setNovaTriboDescricao(''); setNovaTriboEmoji('🕊️');
      setShowCreateTribo(false);
      showNotif('Sua tribo foi criada 🕊️ Que ela floresça!');
    } catch (e) { console.error(e); }
    finally { setCriandoTribo(false); }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Dados derivados ────────────────────────────────────────────────────────
  const tribosFiltradas = tribos.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pilgrimsFiltrados = pilgrims.filter(p =>
    p.name.toLowerCase().includes(searchPilgrim.toLowerCase())
  );

  // Progresso: quantas tribos únicas têm pelo menos 1 membro
  const tribosMeta = 12;
  const tribosAtivas = tribos.filter(t => t.membros.length > 0).length;
  const mesasDesbloqueadas = tribosAtivas >= tribosMeta;
  const progressoPct = Math.min(100, Math.round((tribosAtivas / tribosMeta) * 100));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Toast de notificação */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold">
          ✦ Números 1–2 · Doze tribos, um povo
        </span>
        <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-800 leading-tight">
          Deus sempre organizou<br />
          <span className="text-[#C08261]">seu povo em tribos.</span>
        </h2>
        <p className="text-stone-600 text-base leading-relaxed max-w-xl">
          Desde o deserto até hoje, as pessoas se agrupam por afinidade, por caminho
          compartilhado, pela mesma dor ou pela mesma esperança.
          Não é estratégia — é como fomos feitos para caminhar.
        </p>
        <div className="flex items-start gap-3 bg-[#fdfaf7] border border-[#C08261]/20 rounded-2xl px-4 py-3">
          <span className="text-[#C08261] text-lg shrink-0">✦</span>
          <div>
            <p className="text-base font-serif text-stone-700 italic leading-relaxed">
              "E os filhos de Israel acamparão cada um junto à sua bandeira,
              com as insígnias da casa de seus pais."
            </p>
            <span className="text-xs font-mono text-stone-400 mt-1 block">Números 2:2</span>
          </div>
        </div>
      </div>

      {/* ── Barra de progresso comunitário ── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-800">
              Progresso do movimento
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {mesasDesbloqueadas
                ? '🎉 As 12 tribos foram formadas — as Mesas estão desbloqueadas!'
                : `${tribosAtivas} de ${tribosMeta} tribos ativas para desbloquear as Mesas`}
            </p>
          </div>
          <span className="text-2xl font-serif font-bold text-[#C08261]">
            {tribosAtivas}<span className="text-stone-400 text-lg">/{tribosMeta}</span>
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressoPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-3 rounded-full bg-gradient-to-r from-[#C08261] to-[#DCAE6C]"
          />
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          ✦ Cada tribo que você ajuda a crescer aproxima o movimento de um novo estágio.
          Você é parte disso.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-stone-100 pb-1 overflow-x-auto scrollbar-hide">
        {[
          { id: 'tribos'            as const, label: '🔥 Tribos',             sub: 'por temporada de vida'          },
          { id: 'pilgrims'          as const, label: '🧭 Peregrinos',          sub: 'conectar diretamente'           },
          { id: 'mesas-online'      as const, label: '☕ Mesas online',        sub: mesasDesbloqueadas ? 'abertas' : `🔒 ${tribosAtivas}/${tribosMeta}` },
          { id: 'mesas-presenciais' as const, label: '📍 Mesas presenciais',   sub: 'futuro'                         },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#C08261] text-white'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            {tab.label}
            <span className={`hidden md:inline text-xs font-normal ${activeTab === tab.id ? 'opacity-75' : 'opacity-60'}`}>
              · {tab.sub}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ABA TRIBOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tribos' && (
        <div className="space-y-5">

          {/* Busca + Criar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar pelo que você está vivendo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 transition"
              />
            </div>
            <button
              onClick={() => { if (!currentUser) { onOpenAuth(); return; } setShowCreateTribo(true); }}
              className="shrink-0 flex items-center gap-2 px-4 py-3 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-2xl transition min-h-[48px]"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Criar tribo</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 bg-stone-100 rounded-2xl animate-pulse" />
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
                    onClick={() => setTriboSelecionada(tribo)}
                    className={`${tribo.cor} border ${tribo.corBorda} rounded-2xl p-4 space-y-3 hover:shadow-sm transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tribo.emoji}</span>
                        <div>
                          <h3 className={`font-serif text-base font-bold leading-tight ${tribo.corTexto}`}>
                            {tribo.nome}
                          </h3>
                          <p className="text-xs text-stone-500 italic mt-0.5">"{tribo.tagline}"</p>
                        </div>
                      </div>
                      {joined && (
                        <span className="shrink-0 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ membro
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                      {tribo.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {tribo.membros.length || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe size={11} /> online
                        </span>
                      </div>
                      <span className={`text-xs font-semibold ${tribo.corTexto} group-hover:translate-x-0.5 transition-transform flex items-center gap-1`}>
                        Ver tribo <ChevronRight size={12} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Rodapé */}
          <div className="text-center py-4 border-t border-stone-100 space-y-1">
            <p className="text-sm text-stone-500 italic font-serif leading-relaxed max-w-sm mx-auto">
              "Como o ferro aguça o ferro, assim o homem aguça o semblante do seu amigo."
            </p>
            <p className="text-xs font-mono text-stone-400">Provérbios 27:17</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ABA MESAS ONLINE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mesas-online' && (
        <div className="space-y-5">
          {/* Banner de progresso */}
          {!mesasDesbloqueadas && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#C08261]/10 pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-[#DCAE6C]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#DCAE6C] font-bold">
                    Próximo estágio do movimento
                  </span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-light leading-tight">
                  As Mesas serão abertas<br />
                  <span className="text-[#C08261]">quando as 12 tribos estiverem vivas.</span>
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed max-w-lg">
                  Nas Escrituras, antes das mesas havia as tribos.
                  Antes da comunhão partilhada havia o povo reunido.
                  Quando {tribosMeta} tribos tiverem peregrinos ativos,
                  as Mesas do Despertar serão abertas para todos.
                </p>
                {/* Mini barra de progresso no banner */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-stone-400">
                    <span>{tribosAtivas} tribos ativas</span>
                    <span>meta: {tribosMeta}</span>
                  </div>
                  <div className="w-full bg-stone-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressoPct}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-2.5 rounded-full bg-gradient-to-r from-[#C08261] to-[#DCAE6C]"
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-xs text-stone-400 leading-relaxed">
                    ✦ Você pode ajudar: entre em uma tribo, convide alguém que precisa —
                    cada membro conta para o progresso do movimento.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cards das mesas — bloqueadas ou abertas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-stone-800">
                {mesasDesbloqueadas ? 'Mesas abertas' : 'Preview das Mesas'}
              </h3>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                {MESAS_FUTURAS.length} mesas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MESAS_FUTURAS.map((mesa, index) => (
                <motion.div
                  key={mesa.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`relative bg-white border rounded-2xl p-5 space-y-3 transition ${
                    mesasDesbloqueadas
                      ? 'border-stone-200 hover:border-[#C08261]/40 hover:shadow-sm cursor-pointer'
                      : 'border-stone-200/60 opacity-70'
                  }`}
                >
                  {/* Overlay de bloqueio */}
                  {!mesasDesbloqueadas && (
                    <div className="absolute top-3 right-3">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
                        <Lock size={13} className="text-stone-400" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pr-8">
                    <span className="text-2xl">{mesa.emoji}</span>
                    <div>
                      <h4 className="font-serif text-base font-bold text-stone-800 leading-tight">
                        {mesa.nome}
                      </h4>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full mt-1 inline-block ${
                        mesa.tipo === 'online'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {mesa.tipo === 'online' ? '🌐 Online' : '📍 Presencial (futuro)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-stone-500 leading-relaxed">
                    {mesa.descricao}
                  </p>

                  {mesasDesbloqueadas ? (
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition min-h-[48px]">
                      <Coffee size={14} />
                      Entrar nesta mesa
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                      <Lock size={11} />
                      <span>Disponível ao atingir {tribosMeta} tribos ativas</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {!mesasDesbloqueadas && (
            <div className="text-center py-2">
              <button
                onClick={() => setActiveTab('tribos')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C08261] hover:bg-[#A96D4D] text-white text-sm font-semibold rounded-2xl transition min-h-[48px]"
              >
                <Sparkles size={15} />
                Ajudar uma tribo a crescer agora
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ABA MESAS PRESENCIAIS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mesas-presenciais' && (
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#C08261]/10 pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#DCAE6C]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#DCAE6C] font-bold">
                  Próximo horizonte
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-light leading-tight">
                As Mesas presenciais nascerão<br />
                <span className="text-[#C08261]">de dentro das tribos.</span>
              </h3>
              <p className="text-stone-400 text-base leading-relaxed max-w-lg">
                Quando uma tribo online estiver madura — com peregrinos reais,
                conversas honestas e laços formados — ela própria decidirá
                se encontrar. Não será organizado pela plataforma.
                Será o movimento acontecendo naturalmente.
              </p>
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl px-4 py-3 mt-2">
                <span className="text-[#C08261] shrink-0">✦</span>
                <p className="text-sm text-stone-300 italic font-serif leading-relaxed">
                  "Porque onde estiverem dois ou três reunidos em meu nome,
                  aí estou no meio deles."
                </p>
              </div>
              <p className="text-[10px] font-mono text-stone-500 mt-1">Mateus 18:20</p>
            </div>
          </motion.div>

          {/* Timeline do caminho */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl text-stone-800">O caminho até aqui</h3>
            <div className="space-y-2">
              {[
                {
                  etapa: '1',
                  titulo: 'Tribos online',
                  desc: 'Pessoas ao redor do mesmo vale se encontram aqui, em texto assíncrono.',
                  status: 'ativo',
                },
                {
                  etapa: '2',
                  titulo: 'Mesas online',
                  desc: `Grupos menores e temáticos, com encontros regulares. Desbloqueiam com ${tribosMeta} tribos ativas.`,
                  status: tribosAtivas >= tribosMeta ? 'ativo' : 'bloqueado',
                },
                {
                  etapa: '3',
                  titulo: 'Mesas presenciais',
                  desc: 'Tribos maduras que decidem — por vontade própria — se encontrar no mundo real.',
                  status: 'futuro',
                },
              ].map((item) => (
                <div
                  key={item.etapa}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition ${
                    item.status === 'ativo'
                      ? 'bg-emerald-50 border-emerald-200'
                      : item.status === 'bloqueado'
                      ? 'bg-stone-50 border-stone-200 opacity-70'
                      : 'bg-[#fdfaf7] border-[#C08261]/20'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                    item.status === 'ativo'
                      ? 'bg-emerald-500 text-white'
                      : item.status === 'bloqueado'
                      ? 'bg-stone-300 text-white'
                      : 'bg-[#C08261] text-white'
                  }`}>
                    {item.status === 'ativo' ? '✓' : item.etapa}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{item.titulo}</p>
                    <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center py-2">
            <button
              onClick={() => setActiveTab('tribos')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C08261] hover:bg-[#A96D4D] text-white text-sm font-semibold rounded-2xl transition min-h-[48px]"
            >
              <Sparkles size={15} />
              Começar pela minha tribo
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ABA PEREGRINOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'pilgrims' && (
        <div className="space-y-4">
          {!currentUser ? (
            <div className="text-center py-12 space-y-4">
              <span className="text-5xl">🔒</span>
              <p className="text-stone-500 text-base max-w-xs mx-auto leading-relaxed">
                Para conectar com outros peregrinos, você precisa estar com uma conta ativa.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-2xl transition min-h-[48px]"
              >
                Entrar / Criar Conta
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar peregrino..."
                  value={searchPilgrim}
                  onChange={e => setSearchPilgrim(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 transition"
                />
              </div>
              {pilgrimsFiltrados.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-sm">
                  {pilgrims.length === 0 ? 'Ainda não há outros peregrinos conectados.' : 'Nenhum peregrino encontrado.'}
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
                        <div className="w-11 h-11 rounded-xl bg-orange-100/80 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {p.photoURL
                            ? <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover" />
                            : p.avatarEmoji}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-800">{p.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono mt-0.5">
                            <Flame size={10} className="text-[#C08261]" />
                            {p.streak} dias
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onStartChat(p.uid, p.name, p.avatarEmoji)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition min-h-[48px]"
                      >
                        <MessageSquare size={13} />
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

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — DETALHE DA TRIBO
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {triboSelecionada && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setTriboSelecionada(null)}
              className="fixed inset-0 bg-stone-900 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full z-50 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
              style={{ maxHeight: '88vh' }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{triboSelecionada.emoji}</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-800">{triboSelecionada.nome}</h3>
                    <p className="text-sm text-stone-400 italic mt-0.5">"{triboSelecionada.tagline}"</p>
                  </div>
                </div>
                <button
                  onClick={() => setTriboSelecionada(null)}
                  className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition"
                >
                  <X size={15} className="text-stone-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: 'calc(88vh - 88px)' }}>
                <p className="text-base text-stone-600 leading-relaxed">{triboSelecionada.descricao}</p>

                <div className="flex gap-4 text-sm text-stone-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#C08261]" />
                    {triboSelecionada.membros.length} peregrinos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe size={14} className="text-[#C08261]" />
                    online
                  </span>
                </div>

                <div className={`${triboSelecionada.cor} border ${triboSelecionada.corBorda} rounded-2xl p-4 space-y-2.5`}>
                  <p className={`text-xs font-mono uppercase font-bold tracking-widest ${triboSelecionada.corTexto}`}>
                    O que você vai encontrar aqui
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Pessoas que vivem o mesmo caminho que você agora',
                      'Sem julgamento, sem pressão de "ter mais fé"',
                      'Histórias reais de quem está caminhando — não de quem já chegou',
                      'Um lugar para falar o que não cabe no culto de domingo',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <span className={`${triboSelecionada.corTexto} mt-0.5 shrink-0`}>✦</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {joinedIds.includes(triboSelecionada.id) || triboSelecionada.membros.includes(currentUserId || '') ? (
                  <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-base font-semibold">
                    <span>✓</span>
                    <span>Você já faz parte desta tribo</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEntrarTribo(triboSelecionada)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-black text-white text-base font-semibold rounded-2xl transition shadow-sm min-h-[52px]"
                  >
                    <Heart size={16} />
                    Entrar nesta tribo
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — CRIAR TRIBO
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateTribo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateTribo(false)}
              className="fixed inset-0 bg-stone-900 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full z-50 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
              style={{ maxHeight: '92vh' }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-800">Criar uma tribo</h3>
                  <p className="text-sm text-stone-400 mt-0.5">
                    Você será o primeiro a dizer "eu também passei por isso."
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateTribo(false)}
                  className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition"
                >
                  <X size={15} className="text-stone-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: 'calc(92vh - 88px)' }}>

                {/* Emoji */}
                <div>
                  <label className="text-xs font-mono uppercase text-stone-400 font-bold tracking-wider block mb-2">
                    Escolha um emoji
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['🕊️','🔥','🌱','💔','🌊','🏔️','⚡','🧓','👨‍👧','👣','🌿','✝️','🙏','💡','🫂','🌸'].map(e => (
                      <button
                        key={e}
                        onClick={() => setNovaTriboEmoji(e)}
                        className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition ${
                          novaTriboEmoji === e
                            ? 'bg-[#C08261]/20 ring-2 ring-[#C08261]'
                            : 'bg-stone-100 hover:bg-stone-200'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nome */}
                <div>
                  <label className="text-xs font-mono uppercase text-stone-400 font-bold tracking-wider block mb-2">
                    Nome da tribo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mães Solo na Fé"
                    maxLength={50}
                    value={novaTriboNome}
                    onChange={e => setNovaTriboNome(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 transition"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="text-xs font-mono uppercase text-stone-400 font-bold tracking-wider block mb-2">
                    Uma frase que define este caminho
                  </label>
                  <input
                    type="text"
                    placeholder='Ex: "Criar filhos na fé quando você é os dois."'
                    maxLength={80}
                    value={novaTriboTagline}
                    onChange={e => setNovaTriboTagline(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 transition"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-xs font-mono uppercase text-stone-400 font-bold tracking-wider block mb-2">
                    O que une as pessoas desta tribo? *
                  </label>
                  <textarea
                    placeholder="Descreva o vale, a jornada ou o ponto do caminho que reúne este grupo. Seja honesto — pessoas se conectam pela honestidade, não pela perfeição."
                    maxLength={300}
                    rows={4}
                    value={novaTriboDescricao}
                    onChange={e => setNovaTriboDescricao(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C08261]/30 transition resize-none"
                  />
                  <span className="text-xs text-stone-400 font-mono">{novaTriboDescricao.length}/300</span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCriarTribo}
                  disabled={criandoTribo || !novaTriboNome.trim() || !novaTriboDescricao.trim()}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-base font-semibold rounded-2xl transition min-h-[52px]"
                >
                  {criandoTribo ? (
                    <span className="animate-pulse">Criando sua tribo...</span>
                  ) : (
                    <><Sparkles size={16} /> Criar minha tribo <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

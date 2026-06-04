import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  increment,
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { plantarSemente } from '../lib/sementes';
import { 
  Heart, 
  MapPin, 
  Plus, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  MessageCircle, 
  Map, 
  Share2, 
  UserPlus, 
  X,
  Lock,
  Compass
} from 'lucide-react';

interface MuralComunidadeProps {
  currentUser: any;
  userProfile: any;
  onShowAuthModal: () => void;
}

interface PedidoOracao {
  id: string;
  criadoPor: string;
  criadorNome: string;
  criadorGenerico: string;
  categorias: string[];
  descricaoCurta: string;
  cidade?: string;
  contadorOracoes: number;
  respondido: boolean;
  criadoEm: any;
}

interface Testemunho {
  id: string;
  criadoPor: string;
  criadorNome: string;
  criadorGenerico: string;
  categoria: string;
  titulo: string;
  relato: string;
  fortalecidos: number;
  criadoEm: any;
}

const ORACAO_CATEGORIES = [
  'Ansiedade', 'Saúde', 'Saúde emocional', 'Família', 'Casamento', 
  'Filhos', 'Trabalho', 'Finanças', 'Estudos', 'Direção de Deus', 
  'Libertação', 'Fé', 'Gratidão', 'Salvação de familiares'
];

const TESTEMUNHO_CATEGORIES = [
  'Cura', 'Ansiedade', 'Família', 'Casamento', 'Trabalho', 
  'Finanças', 'Libertação', 'Fé', 'Propósito', 'Gratidão'
];

const COMFORT_VERSES = [
  { ref: "Mateus 11:28", text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei." },
  { ref: "Salmos 23:1", text: "O Senhor é o meu pastor, nada me faltará." },
  { ref: "Isaías 41:10", text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus." },
  { ref: "Filipenses 4:13", text: "Posso todas as coisas naquele que me fortalece." },
  { ref: "João 14:27", text: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá." }
];

export default function MuralComunidade({ currentUser, userProfile, onShowAuthModal }: MuralComunidadeProps) {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'testemunhos' | 'respostas'>('pedidos');
  
  // Real-time lists
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);
  const [testemunhos, setTestemunhos] = useState<Testemunho[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [showTestemunhoForm, setShowTestemunhoForm] = useState(false);

  // Pedido Form State
  const [selectedOracaoCats, setSelectedOracaoCats] = useState<string[]>([]);
  const [pedidoDesc, setPedidoDesc] = useState('');
  const [pedidoCidade, setPedidoCidade] = useState('');
  const [submittingPedido, setSubmittingPedido] = useState(false);

  // Testemunho Form State
  const [selectedTestemunhoCat, setSelectedTestemunhoCat] = useState('');
  const [testemunhoTitle, setTestemunhoTitle] = useState('');
  const [testemunhoRelato, setTestemunhoRelato] = useState('');
  const [submittingTestemunho, setSubmittingTestemunho] = useState(false);

  // Interaction Feedback states
  const [showingVerseFor, setShowingVerseFor] = useState<string | null>(null);
  const [lastSelectedVerse, setLastSelectedVerse] = useState<string | null>(null);

  // Listen to active prayer requests
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'pedidosOracao'),
      where('respondido', '==', false),
      orderBy('criadoEm', 'desc'),
      limit(40)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: PedidoOracao[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        docsData.push({
          id: docSnap.id,
          criadoPor: d.criadoPor || '',
          criadorNome: d.criadorNome || 'Servo/a',
          criadorGenerico: d.criadorGenerico || 'Irmão',
          categorias: d.categorias || [],
          descricaoCurta: d.descricaoCurta || '',
          cidade: d.cidade || '',
          contadorOracoes: d.contadorOracoes || 0,
          respondido: !!d.respondido,
          criadoEm: d.criadoEm
        });
      });
      setPedidos(docsData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'pedidosOracao');
    });

    return () => unsubscribe();
  }, []);

  // Listen to testimonies
  useEffect(() => {
    const q = query(
      collection(db, 'testemunhos'),
      orderBy('criadoEm', 'desc'),
      limit(40)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: Testemunho[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        docsData.push({
          id: docSnap.id,
          criadoPor: d.criadoPor || '',
          criadorNome: d.criadorNome || 'Servo/a',
          criadorGenerico: d.criadorGenerico || 'Irmão',
          categoria: d.categoria || 'Fé',
          titulo: d.titulo || '',
          relato: d.relato || '',
          fortalecidos: d.fortalecidos || 0,
          criadoEm: d.criadoEm
        });
      });
      setTestemunhos(docsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'testemunhos');
    });

    return () => unsubscribe();
  }, []);

  // Filter answered prayers
  const [respostas, setRespostas] = useState<PedidoOracao[]>([]);
  useEffect(() => {
    const q = query(
      collection(db, 'pedidosOracao'),
      where('respondido', '==', true),
      orderBy('criadoEm', 'desc'),
      limit(40)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: PedidoOracao[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        docsData.push({
          id: docSnap.id,
          criadoPor: d.criadoPor || '',
          criadorNome: d.criadorNome || 'Servo/a',
          criadorGenerico: d.criadorGenerico || 'Irmão',
          categorias: d.categorias || [],
          descricaoCurta: d.descricaoCurta || '',
          cidade: d.cidade || '',
          contadorOracoes: d.contadorOracoes || 0,
          respondido: !!d.respondido,
          criadoEm: d.criadoEm
        });
      });
      setRespostas(docsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pedidosOracao');
    });

    return () => unsubscribe();
  }, []);

  // Handle addition of prayer request
  const handleAddPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onShowAuthModal();
      return;
    }
    if (selectedOracaoCats.length === 0) {
      alert("Por favor, selecione ao menos uma categoria para o seu pedido de oração.");
      return;
    }
    if (pedidoDesc.trim().length === 0) {
      alert("Por favor, compartilhe uma frase ou resumo do seu pedido.");
      return;
    }

    setSubmittingPedido(true);

    // Primitive naming based on Acts and user specifications (no last names, no exposure)
    const firstName = userProfile?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Peregrino';
    const dynamicGenerico = userProfile?.avatarEmoji === '👵' || userProfile?.avatarEmoji === '👩' ? 'Irmã' : 'Irmão';

    try {
      await addDoc(collection(db, 'pedidosOracao'), {
        criadoPor: currentUser.uid,
        criadorNome: firstName,
        criadorGenerico: dynamicGenerico,
        categorias: selectedOracaoCats,
        descricaoCurta: pedidoDesc.trim().substring(0, 500),
        cidade: pedidoCidade.trim() || null,
        contadorOracoes: 0,
        respondido: false,
        criadoEm: serverTimestamp()
      });

      // Clear states
      setSelectedOracaoCats([]);
      setPedidoDesc('');
      setPedidoCidade('');
      setShowPedidoForm(false);

      // Variable kingdom seed rewards loop
      await plantarSemente({
        uid: currentUser ? currentUser.uid : '',
        tipo: 'oracao',
        descricao: 'Plantou clamor de oração no Altar Público da Comunidade'
      });

    } catch (err) {
      console.error("Error submitting prayer request:", err);
    } finally {
      setSubmittingPedido(false);
    }
  };

  // Handle addition of testimony
  const handleAddTestemunho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onShowAuthModal();
      return;
    }
    if (!selectedTestemunhoCat) {
      alert("Por favor, selecione uma categoria.");
      return;
    }
    if (testemunhoTitle.trim().length === 0 || testemunhoRelato.trim().length === 0) {
      alert("Por favor, preencha o título e relato do testemunho.");
      return;
    }

    setSubmittingTestemunho(true);
    const firstName = userProfile?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Peregrino';
    const dynamicGenerico = userProfile?.avatarEmoji === '👵' || userProfile?.avatarEmoji === '👩' ? 'Irmã' : 'Irmão';

    try {
      await addDoc(collection(db, 'testemunhos'), {
        criadoPor: currentUser.uid,
        criadorNome: firstName,
        criadorGenerico: dynamicGenerico,
        categoria: selectedTestemunhoCat,
        titulo: testemunhoTitle.trim().substring(0, 80),
        relato: testemunhoRelato.trim().substring(0, 500),
        fortalecidos: 0,
        criadoEm: serverTimestamp()
      });

      // Clear states
      setSelectedTestemunhoCat('');
      setTestemunhoTitle('');
      setTestemunhoRelato('');
      setShowTestemunhoForm(false);

      // Variable kingdom seed rewards loop
      await plantarSemente({
        uid: currentUser ? currentUser.uid : '',
        tipo: 'testemunho',
        descricao: 'Comoveu corações postando um testemunho vivo no Mural público'
      });

    } catch (err) {
      console.error("Error submitting testimony:", err);
    } finally {
      setSubmittingTestemunho(false);
    }
  };

  // Handle increment prayer count
  const handleIncrementOracao = async (id: string) => {
    try {
      const docRef = doc(db, 'pedidosOracao', id);
      await updateDoc(docRef, {
        contadorOracoes: increment(1)
      });
    } catch (err) {
      console.error("Error supporting prayer request", err);
    }
  };

  // Handle increment testimony support ("fortalecidos")
  const handleIncrementTestemunho = async (id: string) => {
    try {
      const docRef = doc(db, 'testemunhos', id);
      await updateDoc(docRef, {
        fortalecidos: increment(1)
      });
    } catch (err) {
      console.error("Error supporting testimony", err);
    }
  };

  // Mark own prayer request as answered (Mover para respostas)
  const handleMarkAsAnswered = async (id: string) => {
    try {
      const docRef = doc(db, 'pedidosOracao', id);
      await updateDoc(docRef, {
        respondido: true
      });
    } catch (err) {
      console.error("Error marking prayer as answered", err);
    }
  };

  // Toggle category choice for prayers
  const toggleOracaoCat = (cat: string) => {
    if (selectedOracaoCats.includes(cat)) {
      setSelectedOracaoCats(prev => prev.filter(c => c !== cat));
    } else {
      if (selectedOracaoCats.length >= 3) {
        alert("Escolha no máximo 3 categorias.");
        return;
      }
      setSelectedOracaoCats(prev => [...prev, cat]);
    }
  };

  // Humanized short time duration converter
  const formatTimeAgo = (seconds: any) => {
    if (!seconds) return 'Agora mesmo';
    const date = seconds.toDate ? seconds.toDate() : new Date(seconds);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Há ${days} dias`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2">
      {/* Visual Identity Section Header */}
      <div className="text-center md:text-left space-y-2 border-b border-stone-100 pb-4">
        <span className="text-[10px] font-mono uppercase bg-[#C08261]/10 text-[#C08261] px-3 py-1 rounded-full font-bold tracking-widest inline-block leading-none">
          ✨ Comunhão de Atos 2
        </span>
        <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 tracking-tight leading-tight mt-1">
          Mural da Comunidade
        </h3>
        <p className="text-stone-500 font-sans text-xs md:text-sm max-w-2xl leading-relaxed">
          Sem likes barulhentos nem vaidade digital. Apenas uma mesa de acolhimento mútua orientada para apoiar, orar de forma pura e proclamar a fidelidade de Deus.
        </p>
      </div>

      {/* Styled Tabs (Café, Bege, Terracota) */}
      <div className="flex border-b border-stone-200/60 p-1 bg-stone-100/55 rounded-2xl md:max-w-md mx-auto md:mx-0 select-none">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono uppercase font-black transition-all duration-300 ${
            activeTab === 'pedidos' 
              ? 'bg-white text-stone-900 shadow-3xs' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          🙏 Orações
        </button>
        <button
          onClick={() => setActiveTab('testemunhos')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono uppercase font-black transition-all duration-300 ${
            activeTab === 'testemunhos' 
              ? 'bg-white text-stone-900 shadow-3xs' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          🌱 Testemunhos
        </button>
        <button
          onClick={() => setActiveTab('respostas')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono uppercase font-black transition-all duration-300 ${
            activeTab === 'respostas' 
              ? 'bg-white text-stone-900 shadow-3xs' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          ✨ Respondidas
        </button>
      </div>

      {/* RENDER CONTENT BASED ON ACTIVE TABS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: PRAYER REQUESTS WALL */}
        {activeTab === 'pedidos' && (
          <motion.div
            key="pedidos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* CTA Creation Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#fdfaf7] border border-[#C08261]/20 rounded-2xl gap-4">
              <div className="text-left">
                <h4 className="font-serif font-black text-stone-800 text-base">Altar de Clamor ao Senhor</h4>
                <p className="text-[11px] text-stone-500 max-w-md mt-0.5 font-sans leading-relaxed">
                  O altar está de braços abertos. Peça cobertura de oração em poucas palavras, com integridade espiritual.
                </p>
              </div>
              <button
                onClick={() => {
                  if(!currentUser) onShowAuthModal();
                  else setShowPedidoForm(!showPedidoForm);
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-[#C08261] hover:bg-[#A96D4D] text-white text-xs font-mono uppercase tracking-wider font-black rounded-xl transition flex items-center justify-center space-x-2 shrink-0 select-none shadow-3xs"
              >
                {showPedidoForm ? <X size={14} /> : <Plus size={14} />}
                <span>{showPedidoForm ? 'Fechar Altar' : 'Pedir Oração'}</span>
              </button>
            </div>

            {/* PRAYER INPUT FORM PANEL */}
            <AnimatePresence>
              {showPedidoForm && currentUser && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddPedido}
                  className="bg-stone-50/60 border border-stone-200/70 rounded-3xl p-5 md:p-6 text-left space-y-5 overflow-hidden shadow-2xs"
                >
                  <h4 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-200/50 pb-2 flex items-center space-x-2">
                    <span>🕊️ Como podemos orar por você?</span>
                  </h4>

                  {/* Categories selectable (At most 3) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase font-black text-stone-500 block">
                      Categorias do Clamor (Máximo 3)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ORACAO_CATEGORIES.map((cat) => {
                        const isSelected = selectedOracaoCats.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => toggleOracaoCat(cat)}
                            className={`px-3 py-1.5 rounded-full text-[10.5px] font-sans transition-all duration-200 ${
                              isSelected 
                                ? 'bg-[#C08261] text-white shadow-2xs' 
                                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Short description count and box */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase font-black text-stone-500">
                        Compartilhe em poucas palavras (Até 500 caracteres)
                      </label>
                      <span className="text-[10px] font-mono text-stone-400">
                        {pedidoDesc.length}/500
                      </span>
                    </div>
                    <textarea
                      placeholder="Ex: Entrego a ansiedade sobre as decisões familiares aos pés da cruz. Busco sabedoria de Deus."
                      value={pedidoDesc}
                      onChange={(e) => setPedidoDesc(e.target.value.substring(0, 500))}
                      rows={2}
                      maxLength={500}
                      className="w-full bg-white border border-stone-200 focus:border-[#C08261]/60 p-3 rounded-2xl text-[13.5px] text-stone-800 placeholder-stone-400 focus:outline-none transition leading-relaxed resize-none"
                    />
                  </div>

                  {/* City option (Optional) */}
                  <div className="space-y-1.5 max-w-xs">
                    <label className="text-[10px] font-mono uppercase font-black text-stone-500 block">
                      Sua Cidade (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Porto Alegre"
                      value={pedidoCidade}
                      onChange={(e) => setPedidoCidade(e.target.value)}
                      className="w-full bg-white border border-stone-200 focus:border-[#C08261]/60 px-3 py-2 rounded-xl text-[13.5px] text-stone-800 focus:outline-none transition"
                    />
                  </div>

                  {/* Active submission */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingPedido}
                      className="w-full py-3 bg-[#C08261] hover:bg-[#A96D4D] text-white font-mono uppercase tracking-wider text-xs font-black rounded-2xl transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 select-none"
                    >
                      {submittingPedido ? (
                        <span>Enviando Clamor...</span>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Plantar Pedido e Sementes 🕊️</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* LIST ACTIVE PRAYERS */}
            {loading ? (
              <div className="text-center py-10 font-mono text-xs text-stone-400 italic">
                Acolhendo pedidos do Secreto...
              </div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-150 p-6">
                <span className="text-2xl block mb-2 select-none">🕊️</span>
                <p className="font-serif text-base text-stone-600">Não há clamores ativos no momento.</p>
                <p className="text-xs text-stone-400 mt-1">Clique em 'Pedir Oração' e compartilhe o seu fardo com a irmandade.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pedidos.map((p) => {
                  const isOwnedByUser = currentUser && p.criadoPor === currentUser.uid;
                  return (
                    <motion.div
                      layout
                      key={p.id}
                      className="bg-white border border-stone-200/80 rounded-3xl p-5 text-left flex flex-col justify-between hover:border-stone-300 transition duration-300 shadow-3xs relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#C08261] bg-[#C08261]/10 px-2.5 py-0.5 rounded-full inline-block leading-normal">
                              🙏 Pedido de oração
                            </span>
                            <div className="text-stone-400 text-[10px] font-mono flex items-center gap-1">
                              <span className="font-semibold">{p.criadorGenerico} {p.criadorNome}</span>
                              {p.cidade && (
                                <span className="flex items-center gap-0.5 text-stone-500">
                                  • <MapPin size={10} className="inline" /> {p.cidade}
                                </span>
                              )}
                              <span>• {formatTimeAgo(p.criadoEm)}</span>
                            </div>
                          </div>

                          {/* Quick answers toggle */}
                          {isOwnedByUser && (
                            <button
                              onClick={() => handleMarkAsAnswered(p.id)}
                              className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/25 px-2 py-1 rounded-xl transition flex items-center space-x-1.5 select-none font-bold"
                              title="Glória a Deus! Esta oração foi respondida!"
                            >
                              <span className="animate-pulse">✨</span>
                              <span>Foi Respondida!</span>
                            </button>
                          )}
                        </div>

                        {/* Request Text */}
                        <p className="font-serif text-[14px] text-stone-700 italic leading-relaxed">
                          "{p.descricaoCurta}"
                        </p>

                        {/* Category Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {p.categorias.map(cat => (
                            <span key={cat} className="text-[9.5px] font-mono bg-stone-50 border border-stone-200/80 text-stone-500 px-2 py-0.5 rounded-md font-medium">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Buttons (Estou Orando, Amém, Enviar Versículo) */}
                      <div className="mt-5 pt-3 border-t border-stone-100 flex flex-col space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-stone-605">
                          <span>{p.contadorOracoes} {p.contadorOracoes === 1 ? 'irmão orou por isso' : 'irmãos já oraram por isso'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleIncrementOracao(p.id)}
                            className="flex-1 py-2 bg-stone-50 hover:bg-[#C08261]/10 hover:text-[#C08261] border border-stone-200 text-stone-650 text-[10px] font-mono uppercase tracking-widest font-bold rounded-xl transition flex items-center justify-center space-x-1 select-none shadow-3xs"
                          >
                            <span>🙏 Estou Orando</span>
                          </button>

                          <button
                            onClick={() => {
                              alert("Amém! Conectados na mesma fé. Deus ouve!");
                            }}
                            className="px-3 py-2 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200 text-stone-600 rounded-xl transition text-[11px] font-mono uppercase tracking-wider font-bold shadow-3xs select-none"
                            title="Declarar Amém"
                          >
                            <span>❤️ Amém</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowingVerseFor(showingVerseFor === p.id ? null : p.id);
                              setLastSelectedVerse(null);
                            }}
                            className="px-3 py-2 bg-stone-50 hover:bg-amber-50 hover:text-amber-700 border border-stone-200 text-stone-600 rounded-xl transition text-[11px] font-mono uppercase tracking-wider font-bold shadow-3xs select-none"
                            title="Partilhar Palavra"
                          >
                            <span>📖 Versículo</span>
                          </button>
                        </div>

                        {/* Verses selector drawer inside post */}
                        {showingVerseFor === p.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#fcfbf9] border border-[#C08261]/15 p-3 rounded-2xl text-left space-y-2 overflow-hidden mt-1"
                          >
                            <div className="flex justify-between items-center border-b border-stone-200/50 pb-1.5">
                              <span className="text-[9.5px] font-mono uppercase font-black text-[#C08261]">
                                Envie uma Promessa de Consolo:
                              </span>
                              <button onClick={() => setShowingVerseFor(null)} className="text-stone-400 hover:text-stone-600">
                                <X size={12} />
                              </button>
                            </div>
                            
                            {lastSelectedVerse ? (
                              <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                                <span className="text-[10px] font-mono text-[#C08261] font-bold">✨ Mensagem Consolata Enviada:</span>
                                <p className="text-[11px] text-stone-700 font-serif italic">
                                  {lastSelectedVerse}
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-1">
                                {COMFORT_VERSES.map((v) => (
                                  <button
                                    key={v.ref}
                                    onClick={() => {
                                      setLastSelectedVerse(`"${v.text}" — ${v.ref}`);
                                      // Optional seed planting trigger for giving encouraging verse
                                      plantarSemente({
                                        uid: currentUser ? currentUser.uid : '',
                                        tipo: 'oracao',
                                        descricao: 'Iluminou o caminhar de um irmão com versículo no altar público'
                                      });
                                    }}
                                    className="w-full text-left p-2 rounded-lg bg-white border border-stone-200 hover:border-[#C08261]/40 text-[11px] text-stone-700 hover:bg-[#fffcf9] flex justify-between items-center gap-2 group transition duration-300"
                                  >
                                    <div className="font-serif italic text-stone-600 truncate flex-1 group-hover:text-stone-800">
                                      "{v.text}"
                                    </div>
                                    <span className="font-mono text-[9px] text-[#C08261] shrink-0 font-bold bg-amber-50 p-1 rounded">
                                      {v.ref}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: TESTIMONY WALL */}
        {activeTab === 'testemunhos' && (
          <motion.div
            key="testemunhos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Testimony Creation CTA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#f2f7f4] border border-emerald-500/20 rounded-2xl gap-4">
              <div className="text-left">
                <h4 className="font-serif font-black text-stone-800 text-base">Nuvem de Milagres & Milagres de Deus</h4>
                <p className="text-[11px] text-stone-500 max-w-md mt-0.5 font-sans leading-relaxed">
                  Não enterre o milagre. O testemunho gera edificação na alma e no altar da igreja.
                </p>
              </div>
              <button
                onClick={() => {
                  if(!currentUser) onShowAuthModal();
                  else setShowTestemunhoForm(!showTestemunhoForm);
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono uppercase tracking-wider font-black rounded-xl transition flex items-center justify-center space-x-2 shrink-0 select-none shadow-3xs"
              >
                {showTestemunhoForm ? <X size={14} /> : <Plus size={14} />}
                <span>{showTestemunhoForm ? 'Fechar Mural' : 'Compartilhar Milagre'}</span>
              </button>
            </div>

            {/* TESTIMONY INPUT FORM PANEL */}
            <AnimatePresence>
              {showTestemunhoForm && currentUser && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTestemunho}
                  className="bg-stone-50/60 border border-stone-200/70 rounded-3xl p-5 md:p-6 text-left space-y-5 overflow-hidden shadow-2xs"
                >
                  <h4 className="font-serif text-lg font-bold text-stone-800 border-b border-stone-200/50 pb-2">
                    🌱 Compartilhe o agir de Deus na sua vida
                  </h4>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase font-black text-stone-500 block">
                      Qual a área principal do Testemunho?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TESTEMUNHO_CATEGORIES.map((cat) => {
                        const isSelected = selectedTestemunhoCat === cat;
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setSelectedTestemunhoCat(cat)}
                            className={`px-3 py-1.5 rounded-full text-[10.5px] font-sans transition-all duration-200 ${
                              isSelected 
                                ? 'bg-emerald-700 text-white shadow-2xs font-bold' 
                                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title of Testimony (Max 80 chars) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase font-black text-stone-500 block">
                        Título Breve (Máximo 80 caracteres)
                      </label>
                      <span className="text-[10px] font-mono text-stone-400">
                        {testemunhoTitle.length}/80
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: Restauração da minha saúde após meses de clamor"
                      value={testemunhoTitle}
                      onChange={(e) => setTestemunhoTitle(e.target.value.substring(0, 80))}
                      className="w-full bg-white border border-stone-200 focus:border-emerald-600/60 px-3 py-2.5 rounded-xl text-[13.5px] text-stone-800 focus:outline-none transition font-serif font-black"
                    />
                  </div>

                  {/* relato detail of Testimony (Max 500 chars) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase font-black text-[#224f34] block">
                        Seu relato sincero (Até 500 caracteres, evite nomes completos ou dados)
                      </label>
                      <span className="text-[10px] font-mono text-stone-400">
                        {testemunhoRelato.length}/500
                      </span>
                    </div>
                    <textarea
                      placeholder="Ex: Deus abriu portas inimagináveis de cura física. O diagnóstico final veio limpo. Glória ao nome do Senhor Jesus por nos carregar no colo!"
                      value={testemunhoRelato}
                      onChange={(e) => setTestemunhoRelato(e.target.value.substring(0, 500))}
                      rows={4}
                      maxLength={500}
                      className="w-full bg-white border border-stone-200 focus:border-emerald-600/60 p-3 rounded-2xl text-[13.5px] text-stone-800 focus:outline-none transition leading-relaxed resize-none"
                    />
                  </div>

                  {/* Create submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingTestemunho}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-mono uppercase tracking-wider text-xs font-black rounded-2xl transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 select-none"
                    >
                      {submittingTestemunho ? (
                        <span>Publicando Milagre...</span>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Disparar Testemunho de Fé 🌱</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* TESTIMONY DISP LIST */}
            {testemunhos.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-150 p-6">
                <span className="text-2xl block mb-2 select-none">🌱</span>
                <p className="font-serif text-base text-stone-600">Nenhum testemunho registrado ainda.</p>
                <p className="text-xs text-stone-400 mt-1">Seja o primeiro a contar o mover do Espírito Santo!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testemunhos.map((t) => (
                  <motion.div
                    layout
                    key={t.id}
                    className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-6 text-left flex flex-col justify-between hover:border-stone-300 transition duration-300 shadow-3xs relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="space-y-3.5 relative z-10">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full inline-block leading-normal">
                            🌱 Testemunho • {t.categoria}
                          </span>
                          <div className="text-stone-400 text-[10px] font-mono">
                            Contado por <span className="font-semibold">{t.criadorGenerico} {t.criadorNome}</span> • {formatTimeAgo(t.criadoEm)}
                          </div>
                        </div>
                      </div>

                      {/* Title of Testimony */}
                      <h4 className="font-serif text-lg font-black text-stone-850 leading-tight">
                        {t.titulo}
                      </h4>

                      {/* Detail story */}
                      <p className="font-serif text-[14.5px] text-stone-700 leading-relaxed italic whitespace-pre-line bg-stone-50/50 p-4 rounded-2xl border border-stone-100/80">
                        "{t.relato}"
                      </p>
                    </div>

                    {/* Testimony reinforcement controls */}
                    <div className="mt-5 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10 select-none">
                      <span className="text-[11px] font-mono text-stone-500">
                        {t.fortalecidos === 0 
                          ? 'Gere comunhão fortalecendo a fé de quem partilhou' 
                          : `Este testemunho fortaleceu a fé de ${t.fortalecidos} irmãos`}
                      </span>

                      {/* Staggered reactions triggers */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleIncrementTestemunho(t.id)}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-emerald-50 text-stone-700 border border-stone-200 hover:border-emerald-250 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl transition flex items-center space-x-1.5 shadow-3xs"
                        >
                          <span>❤️ Fortaleceu Minha Fé</span>
                        </button>
                        <button
                          onClick={() => handleIncrementTestemunho(t.id)}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-amber-50 text-stone-700 border border-stone-200 hover:border-amber-250 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl transition flex items-center space-x-1.5 shadow-3xs"
                        >
                          <span>🙏 Glória a Deus</span>
                        </button>
                        <button
                          onClick={() => handleIncrementTestemunho(t.id)}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-teal-50 text-stone-700 border border-stone-200 hover:border-teal-250 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl transition flex items-center space-x-1.5 shadow-3xs"
                        >
                          <span>🌱 Deu Esperança</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: ANSWERED PRAYERS CHRONICLE */}
        {activeTab === 'respostas' && (
          <motion.div
            key="respostas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Answer banner */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl text-left space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex items-center space-x-2 text-stone-800 relative z-10">
                <span className="text-xl select-none animate-bounce">✨</span>
                <span className="font-serif text-lg font-bold text-amber-900">Arauto da Vitória do Altar</span>
              </div>
              <p className="text-[12px] text-stone-600 max-w-2xl leading-relaxed relative z-10 font-sans">
                "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á." Mateus 7:7. 
                Aqui glorificamos ao Senhor pelas orações que subiram ao trono da graça e foram manifestadas com respostas visíveis na comunidade!
              </p>
            </div>

            {/* EXPOSURE DISP LIST */}
            {respostas.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-150 p-6">
                <span className="text-2xl block mb-2 select-none">✨</span>
                <p className="font-serif text-base text-stone-600">Nenhum clamor marcado como respondido ainda.</p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  A oração do justo é poderosa e eficaz. Logo mais veremos belos testemunhos de orações respondidas aqui!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {respostas.map((p) => (
                  <motion.div
                    layout
                    key={p.id}
                    className="bg-stone-50 border-2 border-amber-200/70 rounded-3xl p-5 text-left flex flex-col justify-between shadow-3xs relative overflow-hidden"
                  >
                    <div className="absolute -top-3 -right-3 w-[120px] h-[120px] bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-[9.5px] uppercase font-mono tracking-widest font-black text-amber-800 bg-amber-500/15 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block leading-normal">
                            ✨ Oração Respondida!
                          </span>
                          <div className="text-stone-400 text-[10px] font-mono flex items-center gap-1">
                            <span className="font-bold">{p.criadorGenerico} {p.criadorNome}</span>
                            {p.cidade && (
                              <span className="flex items-center gap-0.5 text-stone-500">
                                • <MapPin size={10} className="inline" /> {p.cidade}
                              </span>
                            )}
                            <span>• {formatTimeAgo(p.criadoEm)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Answer Quote details */}
                      <div className="bg-white border border-stone-150 px-4 py-3 rounded-2xl relative">
                        <span className="absolute -top-2 left-3 text-[10px] font-mono tracking-wider text-stone-400 bg-white px-2 rounded-md font-bold">
                          O Clamor Original:
                        </span>
                        <p className="font-serif text-[13.5px] text-stone-600 leading-relaxed italic mt-0.5 pt-1.5">
                          "{p.descricaoCurta}"
                        </p>
                      </div>

                      {/* Display Categories */}
                      <div className="flex flex-wrap gap-1.5">
                        {p.categorias.map(cat => (
                          <span key={cat} className="text-[9px] font-mono bg-[#C08261]/10 text-[#C08261] px-2 py-0.5 rounded-md font-bold">
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Celebration phrase */}
                      <div className="text-[11px] font-mono text-amber-805 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl flex items-center space-x-1.5 mt-2">
                        <span>🙌</span>
                        <span className="font-bold text-amber-900 leading-snug">O Senhor atendeu a este clamor! Glórias ao Seu nome! {p.contadorOracoes > 0 && `(Contou com apoio de ${p.contadorOracoes} irmãos)`}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

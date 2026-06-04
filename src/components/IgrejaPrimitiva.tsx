import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import bookCoverImg from "../assets/images/book_cover_1780394449410.png";
import {
  Heart,
  Compass,
  Gift,
  Check,
  Users,
  MapPin,
  Coffee,
  Sparkles,
  Award,
  Copy,
  CheckCircle,
  Flame,
  TrendingUp,
  HelpCircle,
  FileText,
  Smartphone,
  Plus,
  MessageSquare,
  PlusCircle,
  Share2,
  Clipboard,
  ArrowRight,
  User,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Clock,
  Lock,
  BookOpen,
  Star,
} from "lucide-react";

interface IgrejaPrimitivaProps {
  currentUser: any;
  userProfile: any;
  onShowAuthModal: () => void;
  onSaveProgress?: (newProgress: any) => void;
}

interface MuralItem {
  id: string;
  category: "necessidade" | "oferta" | "oracao" | "cadeira_vazia";
  author: string;
  avatarEmoji: string;
  location: string;
  title: string;
  description: string;
  timestamp: string;
  counter?: number;
  maxCounter?: number;
  actionsTaken?: string[];
  userInteracted?: boolean;
}

interface Fundador {
  name: string;
  location: string;
  service: string;
  type: "offer" | "receive";
  avatarEmoji: string;
  isDonator?: boolean;
}

export default function IgrejaPrimitiva({
  currentUser,
  userProfile,
  onShowAuthModal,
  onSaveProgress,
}: IgrejaPrimitivaProps) {
  const [activeTab, setActiveTab] = useState<"comunhao" | "chamado" | "cocriacao" | "livros">(
    "comunhao"
  );

  const [quizAnswer, setQuizAnswer] = useState<"old" | "new" | null>(null);
  const [centelhas, setCentelhas] = useState<{
    id: string;
    author: string;
    location: string;
    prompt: string;
    content: string;
    votes: number;
    voted?: boolean;
  }[]>([]);
  const [newCentelhaContent, setNewCentelhaContent] = useState("");
  const [newCentelhaAuthor, setNewCentelhaAuthor] = useState("");
  const [newCentelhaLocation, setNewCentelhaLocation] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("Qual foi a batalha que ninguém viu você vencer?");
  const [hasVotedPost, setHasVotedPost] = useState<Record<string, boolean>>({});

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("SP");
  const [chosenService, setChosenService] = useState("Oração");
  const [interactionType, setInteractionType] = useState<"offer" | "receive">("offer");
  const [isRegistered, setIsRegistered] = useState(false);
  const [vagasRestantes, setVagasRestantes] = useState(47);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [customValue, setCustomValue] = useState("");
  const [donatorName, setDonatorName] = useState("");
  const [confirmedDonation, setConfirmedDonation] = useState(false);

  const [selectedBookTier, setSelectedBookTier] = useState<
    "book_despertar" | "book_devocionais" | "physical" | "kit" | "custom" | "prayer"
  >("book_despertar");
  const [purchaseMode, setPurchaseMode] = useState<"self" | "gift">("self");
  const [giftName, setGiftName] = useState("");
  const [giftEmail, setGiftEmail] = useState("");
  const [prayerIntention, setPrayerIntention] = useState("");
  const [abacatStep, setAbacatStep] = useState<"select" | "form" | "qr" | "success">("select");
  const [customBookValue, setCustomBookValue] = useState("50");

  const [linkDespertar, setLinkDespertar] = useState<string>(
    () => localStorage.getItem("kiwify_link_despertar") || "https://pay.kiwify.com.br/JRqrznH"
  );
  const [linkDevocionais, setLinkDevocionais] = useState<string>(
    () => localStorage.getItem("kiwify_link_devocionais") || "https://pay.kiwify.com.br/X23KvCQ"
  );

  const [userCredits, setUserCredits] = useState<number>(12);

  const [muralItems, setMuralItems] = useState<MuralItem[]>([
    {
      id: "1",
      category: "necessidade",
      author: "Milena Rocha",
      avatarEmoji: "👩‍👶",
      location: "Curitiba, PR",
      title: "Mãe solo precisa de apoio com crianças",
      description:
        "Preciso de alguém maduro de fé para ficar com meus dois filhos (3 e 5 anos) na quarta-feira à noite das 19h às 21:30h, para que eu possa participar do grupo de discipulado local. A mesa precisa de mim lá.",
      timestamp: "Há 2 horas",
      actionsTaken: [],
      userInteracted: false,
    },
    {
      id: "2",
      category: "oferta",
      author: "Marcos de Souza",
      avatarEmoji: "🚗",
      location: "Curitiba, PR",
      title: "CaronaSolidária para o Grupo de Oração",
      description:
        "Posso ajudar com transporte prático aos domingos pela manhã e quintas à noite. Tenho 4 lugares disponíveis no carro saindo da região norte de Curitiba.",
      timestamp: "Há 5 horas",
      actionsTaken: [],
      userInteracted: false,
    },
    {
      id: "3",
      category: "oracao",
      author: "Juliana Mendes",
      avatarEmoji: "👩‍⚕️",
      location: "Belo Horizonte, MG",
      title: "Oração por tratamento de Pneumonia Crônica",
      description:
        "Minha amada mãe está hospitalizada lutando contra pneumonia grave. Peço que a família do Despertar se junte a mim em clamor urgente.",
      timestamp: "Há 1 hora",
      counter: 6,
      actionsTaken: ["Ana S.", "Roberto O."],
      userInteracted: false,
    },
    {
      id: "4",
      category: "cadeira_vazia",
      author: "Gabriel Krause",
      avatarEmoji: "☕",
      location: "Porto Alegre, RS",
      title: "Café de Ensino e Discipulado na Terça",
      description:
        "Vou abrir meu apartamento na terça-feira às 19:30h para passarmos o pão, orar e estudar o livro de João. Tenho vagas na mesa. Venha como está!",
      timestamp: "Há 8 horas",
      counter: 3,
      maxCounter: 5,
      actionsTaken: [],
      userInteracted: false,
    },
    {
      id: "5",
      category: "necessidade",
      author: "Pr. Antenor",
      avatarEmoji: "📖",
      location: "Limoeiro do Norte, CE",
      title: "Bíblias de estudo para novos convertidos",
      description:
        "Iniciamos um pequeno grupo em comunidade carente aqui no interior, mas temos apenas 2 Bíblias para 8 pessoas. Se alguém puder doar Bíblias usadas ou novas, faria toda diferença.",
      timestamp: "Há 1 dia",
      actionsTaken: [],
      userInteracted: false,
    },
    {
      id: "6",
      category: "cadeira_vazia",
      author: "Família Silva",
      avatarEmoji: "🍲",
      location: "Campinas, SP",
      title: "Jantar de Domingo — Cadeira Vazia Esperando",
      description:
        "Se no domingo de noite você costuma se sentir só, saiba que há um prato e uma cadeira esperando por você em nossa mesa de família. Venha compartilhar comunhão conosco.",
      timestamp: "Há 12 horas",
      counter: 1,
      maxCounter: 4,
      actionsTaken: [],
      userInteracted: false,
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newUF, setNewUF] = useState("SP");
  const [newCategory, setNewCategory] = useState<
    "necessidade" | "oferta" | "oracao" | "cadeira_vazia"
  >("necessidade");
  const [showPublishForm, setShowPublishForm] = useState(false);

  const [fundadores, setFundadores] = useState<Fundador[]>([
    { name: "Marcos F.", location: "Curitiba, PR", service: "discipulado", type: "offer", avatarEmoji: "👨‍👣", isDonator: true },
    { name: "Ana S.", location: "São Paulo, SP", service: "aconselhamento", type: "receive", avatarEmoji: "👩‍⚕️" },
    { name: "Roberto O.", location: "Fortaleza, CE", service: "líder de célula", type: "offer", avatarEmoji: "👨‍💼", isDonator: true },
    { name: "Juliana M.", location: "Belo Horizonte, MG", service: "Oração", type: "offer", avatarEmoji: "👩‍🙏" },
    { name: "Gabriel K.", location: "Porto Alegre, RS", service: "Ensino bíblico", type: "offer", avatarEmoji: "👨‍📖" },
  ]);

  useEffect(() => {
    const savedFounder = localStorage.getItem("somosodespertar_founder_status");
    if (savedFounder) { setIsRegistered(true); setVagasRestantes(46); }
    const savedCredits = localStorage.getItem("despertar_user_credits");
    if (savedCredits) setUserCredits(parseInt(savedCredits));
    const savedMural = localStorage.getItem("despertar_mural_v1");
    if (savedMural) { try { setMuralItems(JSON.parse(savedMural)); } catch (e) {} }

    const savedCentelhas = localStorage.getItem("despertar_cocreated_centelhas");
    if (savedCentelhas) {
      try { setCentelhas(JSON.parse(savedCentelhas)); } catch (e) {}
    } else {
      const initialCentelhas = [
        { id: "c1", author: "Priscila Alencar", location: "Fortaleza, CE", prompt: "Qual foi a batalha que ninguém viu você vencer?", content: "Silenciar o choro na cozinha para que meus filhos não se assustassem, e dobrar os joelhos no azulejo gelado. Senti uma mão quente no meu ombro dizendo: 'Eu estou cuidando de tudo'. E desde então, sei que não estou sozinha.", votes: 78, voted: false },
        { id: "c2", author: "Thiago Mendes", location: "Niterói, RJ", prompt: "Ninguém deveria enfrentar seus dias sozinho. O que você diria para alguém hoje?", content: "Você não está atrasado. Você está sendo preparado. O deserto não é o fim da sua história; é onde o poço de água viva é cavado no seu interior.", votes: 54, voted: false },
        { id: "c3", author: "Débora Santos", location: "Goiânia, GO", prompt: "Em qual momento desta semana você sentiu o sopro da graça?", content: "Quando eu ia apagar o aplicativo e desistir da minha constância de oração. Uma notificação me lembrou de respirar fundo por 4 segundos. Aquele respiro mudou meu dia.", votes: 91, voted: false }
      ];
      setCentelhas(initialCentelhas);
      localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(initialCentelhas));
    }

    const interval = setInterval(() => {
      setVagasRestantes((prev) => prev > 12 ? prev - (Math.random() > 0.85 ? 1 : 0) : prev);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const saveMuralToStorage = (updatedMural: MuralItem[]) => {
    setMuralItems(updatedMural);
    localStorage.setItem("despertar_mural_v1", JSON.stringify(updatedMural));
  };

  const handlePublishCentelha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCentelhaContent.trim()) { showTemporaryToast("Por favor, derrame a sua palavra antes de enviar."); return; }
    const authorToUse = newCentelhaAuthor.trim() || userProfile?.name || "Um Peregrino Sincero";
    const locationToUse = newCentelhaLocation.trim() || userProfile?.city || "Brasil";
    const newCent = { id: "cent_" + Date.now().toString(), author: authorToUse, location: locationToUse, prompt: selectedPrompt, content: newCentelhaContent.trim(), votes: 1, voted: true };
    const updated = [newCent, ...centelhas];
    setCentelhas(updated);
    localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(updated));
    const nextCredits = userCredits + 5;
    setUserCredits(nextCredits);
    localStorage.setItem("despertar_user_credits", nextCredits.toString());
    setNewCentelhaContent(""); setNewCentelhaAuthor(""); setNewCentelhaLocation("");
    showTemporaryToast("Chama acesa! Sua resposta brilha na mesa e você ganhou +5 créditos! 🕯️🔥");
  };

  const handleVoteCentelha = (id: string) => {
    if (hasVotedPost[id]) { showTemporaryToast("Você já somou sua fé a esta resposta."); return; }
    const updated = centelhas.map(c => c.id === id ? { ...c, votes: c.votes + 1, voted: true } : c);
    setCentelhas(updated);
    localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(updated));
    setHasVotedPost(prev => ({ ...prev, [id]: true }));
    const nextCredits = userCredits + 1;
    setUserCredits(nextCredits);
    localStorage.setItem("despertar_user_credits", nextCredits.toString());
    showTemporaryToast("Você concordou em oração! +1 Crédito! 🙏");
  };

  const showTemporaryToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRegisterFounder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !city) { showTemporaryToast("Por favor, preencha todos os campos."); return; }
    const newFounder: Fundador = { name, location: `${city}, ${stateCode}`, service: chosenService.toLowerCase(), type: interactionType, avatarEmoji: interactionType === "offer" ? "🕊️" : "🙌", isDonator: false };
    setFundadores((prev) => [newFounder, ...prev]);
    setIsRegistered(true);
    setVagasRestantes((prev) => Math.max(1, prev - 1));
    localStorage.setItem("somosodespertar_founder_status", "registered");
    localStorage.setItem("somosodespertar_founder_email", email);
    localStorage.setItem("somosodespertar_founder_name", name);
    showTemporaryToast("Reserva efetuada! Bem-vindo(a), Fundador! 🎉");
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newAuthor || !newCity) { showTemporaryToast("Por favor, preencha todos os campos."); return; }
    const emojisMap = { necessidade: "📌", oferta: "🎁", oracao: "🙏", cadeira_vazia: "🪑" };
    let cost = 0;
    if (newCategory === "necessidade") {
      if (userCredits < 2) { showTemporaryToast("Você precisa de pelo menos 2 créditos para postar uma necessidade."); return; }
      cost = -2;
    } else if (newCategory === "oferta") { cost = 3; }
    const newItem: MuralItem = {
      id: Date.now().toString(), category: newCategory, author: newAuthor,
      avatarEmoji: emojisMap[newCategory], location: `${newCity}, ${newUF}`,
      title: newTitle, description: newDesc, timestamp: "Agora mesmo",
      counter: newCategory === "oracao" ? 0 : newCategory === "cadeira_vazia" ? 0 : undefined,
      maxCounter: newCategory === "cadeira_vazia" ? 4 : undefined,
      actionsTaken: [], userInteracted: false,
    };
    const updatedMural = [newItem, ...muralItems];
    saveMuralToStorage(updatedMural);
    if (cost !== 0) {
      setUserCredits((prev) => { const next = prev + cost; localStorage.setItem("despertar_user_credits", next.toString()); return next; });
    }
    showTemporaryToast(`Anúncio publicado no Mural!`);
    setNewTitle(""); setNewDesc(""); setShowPublishForm(false);
  };

  const handleItemInteraction = (item: MuralItem) => {
    const activeName = name || (currentUser ? userProfile?.name || currentUser.displayName : "Você");
    const updated = muralItems.map((m) => {
      if (m.id === item.id) {
        if (m.userInteracted) {
          const nextActions = m.actionsTaken ? m.actionsTaken.filter((a) => a !== activeName) : [];
          let nextCounter = m.counter;
          if ((m.category === "oracao" || m.category === "cadeira_vazia") && typeof m.counter === "number") nextCounter = Math.max(0, m.counter - 1);
          return { ...m, userInteracted: false, actionsTaken: nextActions, counter: nextCounter };
        } else {
          const nextActions = [...(m.actionsTaken || []), activeName];
          let nextCounter = m.counter;
          let creditChange = 0;
          if (m.category === "oracao" && typeof m.counter === "number") { nextCounter = m.counter + 1; creditChange = 1; }
          else if (m.category === "cadeira_vazia" && typeof m.counter === "number" && m.maxCounter) {
            if (m.counter >= m.maxCounter) { showTemporaryToast("Esta mesa já está cheia!"); return m; }
            nextCounter = m.counter + 1;
          } else if (m.category === "necessidade") { creditChange = 2; }
          if (creditChange > 0) { setUserCredits((prev) => { const next = prev + creditChange; localStorage.setItem("despertar_user_credits", next.toString()); return next; }); }
          return { ...m, userInteracted: true, actionsTaken: nextActions, counter: nextCounter };
        }
      }
      return m;
    });
    saveMuralToStorage(updated);
    if (!item.userInteracted) {
      if (item.category === "oracao") showTemporaryToast(`Você assumiu oração por ${item.author}! 🕯️`);
      else if (item.category === "cadeira_vazia") showTemporaryToast(`Cadeira reservada com ${item.author}! 🍲`);
      else if (item.category === "necessidade") showTemporaryToast(`Você estendeu as mãos para ${item.author} (+2 créditos)! 🤝`);
      else showTemporaryToast(`Interesse registrado!`);
    } else { showTemporaryToast("Compromisso removido."); }
  };

  // ─── LIVROS: dados da biblioteca de leitura ───────────────────────────────
  const bibliotecaLivros = [
    {
      categoria: "Linguagem & Copywriting",
      cor: "from-amber-950 to-stone-950",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      livros: [
        { titulo: "Palavras Mágicas (Magic Words)", autor: "Jonah Berger", emoji: "✨", insight: "Como pequenas trocas de verbo mudam drasticamente a decisão do leitor. Ideal para botões de ação e mensagens de convite." },
        { titulo: "StoryBrand", autor: "Donald Miller", emoji: "🗺️", insight: "O usuário é o herói. Você é apenas o guia. Se você se colocar como herói, ele perde o interesse — e não abre o app." },
        { titulo: "The Adweek Copywriting Handbook", autor: "Joseph Sugarman", emoji: "🎯", insight: "A arte dos 'escorregadores mentais': uma primeira frase tão boa que obriga a leitura da segunda, até o botão de instalar." },
        { titulo: "How to Write Copy That Sells", autor: "Ray Edwards", emoji: "📋", insight: "Estrutura prática para explicar benefícios — não funcionalidades. O que muda na vida de quem usa, não o que o produto faz." },
      ],
    },
    {
      categoria: "Persuasão & Negociação",
      cor: "from-stone-950 to-slate-950",
      badge: "bg-[#C08261]/15 text-[#DCAE6C] border-[#C08261]/25",
      livros: [
        { titulo: "As Armas da Persuasão 2.0", autor: "Robert Cialdini", emoji: "🔑", insight: "O 7º princípio inédito — Unidade — ensina a fazer o usuário sentir que o app faz parte da identidade dele, de um grupo exclusivo." },
        { titulo: "Manual de Persuasão do FBI", autor: "Jack Schafer", emoji: "🤝", insight: "Como criar rapport instantâneo. Essencial para o onboarding: as primeiras telas precisam gerar confiança em menos de 90 segundos." },
        { titulo: "Como Convencer Alguém em 90 Segundos", autor: "Nicholas Boothman", emoji: "⚡", insight: "Linguagem e tom moldam a primeira impressão. Como passar autoridade e simpatia no exato segundo em que o app abre." },
        { titulo: "Never Split the Difference", autor: "Chris Voss", emoji: "🎙️", insight: "Rótulos emocionais mudam reações. Usado no app para escrever mensagens de erro que não irritam — e de renovação que não assustam." },
      ],
    },
    {
      categoria: "Indicação & Comunidade",
      cor: "from-emerald-950 to-stone-950",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      livros: [
        { titulo: "Influência e Persuasão (HBR)", autor: "Harvard Business Review", emoji: "🧠", insight: "Artigos científicos sobre como pedir favores e obter ajuda. Perfeito para mecânicas de 'Indique um irmão' no Despertar." },
        { titulo: "Give and Take (Dar e Receber)", autor: "Adam Grant", emoji: "🌱", insight: "Por que as pessoas ajudam. Como criar um ecossistema onde o usuário sente prazer em convidar, comentar e participar." },
        { titulo: "Presuasão", autor: "Robert Cialdini", emoji: "🎬", insight: "Não é o que você diz, é o que acontece antes. Como preparar o estado emocional certo para pedir uma avaliação na loja ou um convite." },
      ],
    },
  ];

  return (
    <div
      id="igreja-primitiva-hub"
      className="space-y-10 py-6 max-w-4xl mx-auto px-4 md:px-0"
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -45 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 border border-[#C08261]/40 px-5 py-3 rounded-full shadow-2xl text-xs md:text-sm font-semibold tracking-wide flex items-center space-x-2"
          >
            <Sparkles size={14} className="animate-pulse text-[#DCAE6C]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#FAF8F5] border border-stone-200/60 p-6 rounded-3xl gap-6 shadow-xs text-left">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C08261] animate-ping" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold">
              O Santuário do Amor Prático
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-stone-850">A Comunhão dos Santos</h2>
          <p className="text-stone-500 text-xs md:text-sm italic">
            "Ninguém dizia que alguma coisa sua era exclusivamente sua, mas tudo era comum entre eles." — Atos 4:32
          </p>
        </div>
        <div className="border border-[#C08261]/25 p-4 rounded-2xl flex items-center space-x-4 shrink-0 shadow-sm w-full md:w-auto">
          <div className="w-10 h-10 rounded-full bg-[#C08261]/10 flex items-center justify-center text-xl select-none">🪙</div>
          <div>
            <div className="flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#C08261]">
              <span>Seus Créditos de Mordomia</span>
              <HelpCircle size={11} className="text-stone-400 cursor-pointer" title="Obtidos ajudando outros e orando." />
            </div>
            <span className="font-serif text-2xl font-extrabold text-stone-900">{userCredits}</span>
            <span className="text-stone-450 text-[10px] block mt-0.5 font-medium">Virtuais e Inesgotáveis</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-stone-200 gap-1 md:gap-0 scrollbar-hide">
        {[
          { id: "comunhao", icon: <Users size={15} />, label: "O Mural Vivo", badge: muralItems.length.toString(), badgeCls: "bg-stone-900 text-white" },
          { id: "chamado", icon: <Flame size={15} />, label: "Nossa Visão & Apoio", badge: "Pioneiro", badgeCls: "bg-[#C08261] text-white" },
          { id: "cocriacao", icon: <Sparkles size={14} className="text-amber-500" />, label: "Centelhas", badge: "Fé Ativa", badgeCls: "bg-amber-500 text-white" },
          { id: "livros", icon: <BookOpen size={15} className="text-[#C08261]" />, label: "Os Livros", badge: "Adquirir", badgeCls: "bg-[#C08261] text-white animate-pulse" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-1 md:px-3 text-xs md:text-sm font-semibold tracking-wide transition relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.id ? "text-stone-900 border-b-2 border-[#C08261]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={`text-[10px] ${tab.badgeCls} px-1.5 py-0.5 rounded-full font-mono font-bold`}>{tab.badge}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1 — O MURAL VIVO */}
        {activeTab === "comunhao" && (
          <motion.div key="mural-walls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 text-left">
            {/* Conceito */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase bg-[#C08261]/10 text-[#C08261] px-2.5 py-1 rounded-full font-bold inline-block">⚡ O Ministério Primitivo</span>
                <h3 className="font-serif text-xl md:text-3xl font-light text-stone-850 leading-tight">Sacerdócio de Todos: Do Ouvinte Passivo para a Comunidade de Mesa</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">
                  O verdadeiro avivamento não acontece por templos centralizados, mas pelo mover do Espírito operando em cada coração sincero. A pergunta central de Atos é: <strong className="text-stone-850 font-semibold">"Queremos apenas ser espectadores ou parte integrante do Corpo vivo?"</strong>
                </p>
              </div>
              {/* Quiz Primitivo */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">🕯️</span>
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-stone-400 font-extrabold">Teste de Consciência</span>
                    <h4 className="font-serif text-sm md:text-base font-medium text-stone-850">Como você deseja canalizar a luz de Deus no seu cotidiano?</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { val: "old" as const, label: "Assistir a cultos e receber", desc: "Participar como ouvinte, receber ensinos e bençãos na estrutura tradicional.", icon: "🏛️" },
                    { val: "new" as const, label: "Servir e ser servido reciprocamente", desc: "Abrir a mesa, oferecer dons, interceder, acolher — como na Igreja Primitiva.", icon: "🔥" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setQuizAnswer(opt.val)}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${quizAnswer === opt.val ? "border-[#C08261] bg-[#C08261]/5" : "border-stone-200 hover:border-stone-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{opt.icon}</span>
                        <span className="font-semibold text-stone-850 text-xs">{opt.label}</span>
                      </div>
                      <p className="text-stone-500 text-[11px] leading-relaxed">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {quizAnswer === "new" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-[#C08261]/5 border border-[#C08261]/20 p-4 rounded-xl text-sm text-stone-700 font-serif italic">
                    "Você escolheu o caminho de Atos. O Mural Vivo abaixo é o seu espaço de missão — não de consumo." 🔥
                  </motion.div>
                )}
              </div>
            </div>

            {/* Controles do Mural */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-850">Mural de Comunhão</h3>
                <p className="text-stone-400 text-xs">{muralItems.length} anúncios ativos de irmãos ao redor do Brasil</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishForm(!showPublishForm)}
                className="py-3 px-5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Anunciar No Mural</span>
              </button>
            </div>

            {/* Formulário publicação */}
            <AnimatePresence>
              {showPublishForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white border-2 border-[#C08261]/25 p-6 rounded-2xl space-y-5 shadow-lg max-w-xl mx-auto text-left"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <h4 className="font-serif font-bold text-stone-850 flex items-center gap-1.5">
                      <Plus size={18} className="text-[#C08261]" /> Anunciar nova Ação
                    </h4>
                  </div>
                  <form onSubmit={handlePublishPost} className="space-y-4 text-xs md:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Seu Nome</label>
                        <input type="text" placeholder="Ex: Família Soares" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#C08261]" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Cidade</label>
                          <input type="text" placeholder="Ex: São Paulo" value={newCity} onChange={(e) => setNewCity(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#C08261]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">UF</label>
                          <input type="text" placeholder="SP" maxLength={2} value={newUF} onChange={(e) => setNewUF(e.target.value.toUpperCase())} required className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-center font-mono focus:outline-none focus:border-[#C08261]" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Categoria</label>
                        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-850 focus:outline-none focus:border-[#C08261]">
                          <option value="necessidade">📌 Necessidade (Gasta 2 cred.)</option>
                          <option value="oferta">🎁 Oferta (+3 cred.)</option>
                          <option value="oracao">🙏 Pedido de Oração (Grátis)</option>
                          <option value="cadeira_vazia">🪑 Cadeira Vazia (Grátis)</option>
                        </select>
                      </div>
                      <div className="md:col-span-7 space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Título</label>
                        <input type="text" placeholder="Resuma o pedido ou oferta" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#C08261]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Detalhes</label>
                      <textarea rows={3} placeholder="Quais os detalhes? Como as pessoas podem ajudar?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#C08261]" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button type="button" onClick={() => setShowPublishForm(false)} className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold">Cancelar</button>
                      <button type="submit" className="py-2.5 px-6 bg-[#C08261] hover:bg-[#b07353] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">Publicar Anúncio de Amor</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cards do Mural */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {muralItems.map((item) => {
                const styles = {
                  necessidade: { bg: "bg-[#C08261]/5 border-[#C08261]/20", badge: "bg-[#C08261]/10 text-[#C08261]", label: "Necessidade 📌" },
                  oferta: { bg: "bg-emerald-50/40 border-emerald-200/20", badge: "bg-emerald-100/40 text-emerald-800", label: "Oferta 🎁" },
                  oracao: { bg: "bg-amber-50/30 border-amber-200/20", badge: "bg-amber-100/50 text-amber-900", label: "Pedido de Oração 🙏" },
                  cadeira_vazia: { bg: "bg-stone-50 border-stone-200/50", badge: "bg-[#DCAE6C]/10 text-stone-800 border border-[#DCAE6C]/20", label: "Cadeira Vazia 🪑" },
                };
                const styled = styles[item.category] || styles.necessidade;
                return (
                  <div key={item.id} className={`p-6 rounded-3xl border shadow-xs transition hover:shadow-md hover:border-stone-300 flex flex-col justify-between space-y-4 ${styled.bg}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-mono tracking-widest uppercase font-extrabold px-2.5 py-1 rounded ${styled.badge}`}>{styled.label}</span>
                        <div className="flex items-center space-x-1.5 text-stone-400 font-mono text-[10px]">
                          <Clock size={11} /><span>{item.timestamp}</span>
                        </div>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-stone-900 leading-snug">{item.title}</h4>
                      <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-stone-150 text-xs text-stone-500">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-sm">{item.avatarEmoji}</span>
                          <div>
                            <span className="font-bold text-stone-800 block">{item.author}</span>
                            <span className="text-[9.5px] uppercase font-mono text-stone-400 font-extrabold flex items-center gap-0.5"><MapPin size={9} />{item.location}</span>
                          </div>
                        </div>
                        {item.category === "oracao" && <span className="text-[#C08261] font-mono font-bold uppercase text-[10px] bg-[#C08261]/10 px-2 py-0.5 rounded flex items-center gap-1"><Flame size={10} />{item.counter} clamando</span>}
                        {item.category === "cadeira_vazia" && <span className="text-stone-800 font-mono font-bold text-[10px] bg-stone-100 border px-2 py-0.5 rounded flex items-center gap-1"><Coffee size={10} />{item.counter}/{item.maxCounter} sentados</span>}
                      </div>
                      {item.actionsTaken && item.actionsTaken.length > 0 && (
                        <div className="bg-white/60 p-2.5 rounded-xl text-[10.5px] text-stone-500 border border-stone-200 flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-stone-700">Abraços de amor:</span>
                          {item.actionsTaken.map((ac, idx) => <span key={idx} className="bg-stone-100 text-stone-650 px-1 rounded">{ac}</span>)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleItemInteraction(item)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                          item.userInteracted ? "bg-emerald-900/10 text-emerald-800 hover:bg-emerald-100" : item.category === "oracao" ? "bg-stone-900 text-white hover:bg-black" : "bg-white border-2 border-stone-800 text-stone-900 hover:bg-stone-50"
                        }`}
                      >
                        {item.userInteracted ? <><Check size={14} className="text-emerald-500" /><span>Compromisso Assumido!</span></> :
                          item.category === "oracao" ? <><Flame size={13} className="text-amber-300 animate-pulse" /><span>Assumir Oração esta semana</span></> :
                          item.category === "cadeira_vazia" ? <><Coffee size={13} className="text-[#C08261]" /><span>Reservar Cadeira Vazia</span></> :
                          item.category === "necessidade" ? <><CheckCircle size={13} className="text-emerald-500" /><span>Estender as Mãos & Ajudar</span></> :
                          <><Heart size={13} className="text-rose-500" /><span>Interessar-me pela Oferta</span></>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cadeira Vazia inspiração */}
            <div className="bg-[#FAF8F5]/80 border-2 border-dashed border-[#C08261]/25 rounded-3xl p-6 md:p-8 space-y-4 max-w-2xl mx-auto text-center">
              <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl mx-auto select-none">🪑</span>
              <h4 className="font-serif text-lg font-bold text-stone-850">A Cadeira Vazia — Hospitalidade Real</h4>
              <p className="text-stone-550 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                <em className="text-stone-850 font-serif">"Na sua mesa, há sempre uma cadeira vazia para um irmão que ainda não tem grupo local."</em> Faça do seu lar um tabernáculo físico de graça.
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 2 — VISÃO & APOIO */}
        {activeTab === "chamado" && (
          <motion.div key="chamado-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 text-left">
            <div className="text-center space-y-4 py-4">
              <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 leading-tight">
                A tecnologia como ponte<br />
                <span className="font-semibold text-[#C08261]">para a comunhão primitiva.</span>
              </h3>
              <p className="text-stone-600 text-base leading-relaxed max-w-2xl mx-auto">
                No século XXI, usamos a tecnologia não para afastar, mas para reatar. Nossos apps e materiais servem como ponte para conectar vidas, mesas e corações, restaurando o pão partido em cada lar.
              </p>
            </div>

            <hr className="border-stone-150" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block">O Fardo Silencioso</span>
                <h4 className="font-serif text-2xl font-light text-stone-850">Comunhão de Domingo a Domingo</h4>
              </div>
              <div className="md:col-span-8 space-y-5">
                <p className="text-stone-650 text-sm md:text-base leading-relaxed">A maioria das pessoas vai à igreja no domingo e não compartilha uma conversa sincera com ninguém até o próximo culto. Há uma barreira invisível para expor fragilidade ou pedir amparo.</p>
                <blockquote className="border-l-4 border-[#C08261] pl-5 italic text-stone-700 font-serif bg-orange-50/20 py-2.5 rounded-r-2xl pr-3 text-sm">
                  "Não deixemos de reunir-nos, como alguns têm por costume; pelo contrário, encorajemo-nos uns aos outros."
                  <cite className="font-mono text-[10px] text-[#C08261] block mt-2 not-italic font-bold">— Hebreus 10:25</cite>
                </blockquote>
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* Bloco de Apoio (compra de livros — redireciona para aba livros) */}
            <div id="donation-block" className="bg-gradient-to-br from-[#1E1C1A] via-[#121110] to-[#080807] text-white rounded-3xl p-6 md:p-10 border border-[#DCAE6C]/25 shadow-2xl space-y-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DCAE6C]/10 border border-[#DCAE6C]/20 rounded-full text-[10px] font-mono text-[#DCAE6C] font-bold uppercase tracking-wider">
                  <Gift size={11} className="animate-pulse" /> Altar de Generosidade
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-stone-100 leading-tight">
                  Sustente este movimento.<br />
                  <span className="font-bold text-[#DCAE6C]">Adquira um dos livros.</span>
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  O ecossistema do Despertar é gratuito e sem patrocinadores. A forma mais concreta de manter viva esta chama é adquirindo um dos livros — cada compra financia servidores, manutenção e o alcance de novos lares.
                </p>
              </div>

              {/* Progress */}
              <div className="bg-[#181716] p-5 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex justify-between items-center text-xs flex-wrap gap-2 text-stone-400">
                  <span className="flex items-center gap-1.5 text-stone-200 font-semibold"><TrendingUp size={14} className="text-[#DCAE6C]" /> Fundo de Infraestrutura</span>
                  <span className="font-mono text-[#DCAE6C] font-bold"><strong>25% Concluído</strong> (R$ 1.247 / R$ 5.000)</span>
                </div>
                <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                  <div className="bg-gradient-to-r from-[#C28463] to-[#DCAE6C] h-2 rounded-full" style={{ width: "25%" }} />
                </div>
                <span className="text-[10px] font-mono text-stone-500 block">Faltam R$ 3.753 para a personificação legal e licenças LGPD.</span>
              </div>

              {/* CTA que leva para aba livros */}
              <div className="flex flex-col md:flex-row gap-4 items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("livros")}
                  className="w-full md:w-auto py-4 px-8 bg-gradient-to-r from-[#C28463] to-[#DCAE6C] hover:from-[#b07353] text-stone-950 font-black uppercase tracking-wider rounded-xl transition shadow-xl cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <BookOpen size={16} />
                  Ver os Livros e Adquirir
                  <ArrowRight size={14} />
                </button>
                <a
                  href="mailto:somosodespertar@gmail.com?subject=Apoio Voluntário — Movimento Despertar"
                  className="text-[#DCAE6C] underline underline-offset-4 text-sm font-serif hover:text-white transition"
                >
                  Ou envie uma semente voluntária por e-mail
                </a>
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* Transparência */}
            <div className="bg-[#FAF8F5]/90 border border-stone-200/80 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex items-center space-x-3.5 border-b border-stone-200/80 pb-4">
                <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 shadow-sm">
                  <ShieldCheck size={20} className="text-[#C08261]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C08261] font-bold block">Pacto de Confiança</span>
                  <h4 className="font-serif text-lg font-bold text-stone-850">Segurança & Transparência LGPD</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {[
                  { icon: <CheckCircle size={15} className="text-[#C08261]" />, title: "Arquitetura Limpa", desc: "Todas as ações são salvas exclusivamente no seu próprio navegador (LocalStorage). Nenhum dado pessoal é exposto sem sua autorização." },
                  { icon: <FileText size={15} className="text-[#C08261]" />, title: "Propósito do Apoio", desc: "O valor de cada livro adquirido via Kiwify é inteiramente destinado a custear infraestrutura, jurídico e conformidade legal." },
                  { icon: <Shield size={15} className="text-[#C08261]" />, title: "Blindagem LGPD", desc: "Seus dados nunca serão vendidos. Você tem direito integral à exclusão de qualquer postagem. Ecossistema livre de cookies de rastreamento." },
                ].map((item) => (
                  <div key={item.title} className="space-y-2">
                    <span className="flex items-center gap-1.5 text-stone-850 font-bold font-serif text-xs">{item.icon} {item.title}</span>
                    <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* Registro de Fundador */}
            <div id="sejaexclusivo-form" className="bg-[#FAF8F5]/80 border border-stone-200/60 p-8 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-xs">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C08261] font-extrabold">Seja um Pioneiro</span>
                <h4 className="font-serif text-2xl md:text-3xl font-light text-stone-850 max-w-lg mx-auto">Você acredita que a igreja ainda pode ser tudo o que ela já foi um dia?</h4>
                <p className="text-stone-600 text-xs md:text-sm leading-relaxed max-w-md mx-auto">Registre-se como co-fundador pioneiro e ganhe <strong className="text-stone-900">12 créditos de mordomia</strong> para estrear os serviços no lançamento.</p>
              </div>
              {isRegistered ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-[#C08261]/10 rounded-2xl border-2 border-dashed border-[#C08261] max-w-lg mx-auto space-y-3">
                  <Award size={48} className="text-[#C08261] mx-auto animate-bounce" />
                  <h5 className="font-serif text-lg font-bold text-stone-800">Inscrição de Co-Fundador Registrada!</h5>
                  <p className="text-stone-650 text-xs leading-relaxed">Você já está no rol oficial! Enviaremos atualizações e chaves de acesso no seu e-mail.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleRegisterFounder} className="max-w-xl mx-auto space-y-5 text-left bg-white p-6 rounded-2xl border border-stone-200/80 shadow-md text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Como deseja ser chamado?</label>
                      <input type="text" placeholder="Nome completo ou social" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#C08261]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Seu Melhor E-mail</label>
                      <input type="email" placeholder="exemplo@igreja.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#C08261]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Cidade</label>
                      <input type="text" placeholder="Ex: Curitiba" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#C08261]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">UF</label>
                      <input type="text" placeholder="PR" maxLength={2} value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase())} required className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-center font-mono focus:outline-none focus:border-[#C08261]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-6 text-xs font-semibold text-stone-650">
                      <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="founder_type" checked={interactionType === "offer"} onChange={() => setInteractionType("offer")} /><span>Quero Servir</span></label>
                      <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="founder_type" checked={interactionType === "receive"} onChange={() => setInteractionType("receive")} /><span>Preciso de Acolhimento</span></label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">Ministério / foco</label>
                      <select value={chosenService} onChange={(e) => setChosenService(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-[#C08261]">
                        <option value="Oração">Intercessão de Oração 🙏</option>
                        <option value="Discipulado">Discipulado do Reino 👣</option>
                        <option value="Aconselhamento">Aconselhamento e Apoio 👩‍⚕️</option>
                        <option value="Ensino bíblico">Exposição da Escritura 📖</option>
                        <option value="Louvor ao vivo">Louvor e Canção em Casa 🎸</option>
                        <option value="Mesa Aberta">Acolher na Cadeira Vazia 🍲</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-stone-900 text-stone-100 hover:bg-black uppercase tracking-wider font-extrabold rounded-xl transition cursor-pointer">Registrar-se como Co-Fundador Pioneiro</button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3 — CENTELHAS CO-CRIADAS */}
        {activeTab === "cocriacao" && (
          <motion.div key="cocriacao-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 text-left">
            <div className="bg-[#C08261]/5 border border-[#C08261]/15 p-6 rounded-3xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#C08261]/10 flex items-center justify-center text-2xl shrink-0">💡</div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-stone-850">Mesa de Semeação: Frutos de Edificação</h3>
                  <p className="text-stone-650 text-xs md:text-sm leading-relaxed">Aqui no Despertar, o Espírito flui de coração em coração. Escolha uma pergunta, partilhe sua história real e deixe sua centelha acender outros corações.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">🔥 +5 Créditos por Semeação</span>
                <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">❤️ +1 Crédito por Concordar</span>
                <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">📱 Livre Compartilhamento</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-5">
                <h4 className="font-serif font-bold text-stone-850 text-base border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" /> Derrame Sua Centelha na Mesa
                </h4>
                <form onSubmit={handlePublishCentelha} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Selecione a Pergunta do Dia</label>
                    <div className="grid grid-cols-1 gap-2">
                      {["Qual foi a batalha que ninguém viu você vencer?", "Ninguém deveria enfrentar seus dias sozinho. O que você diria para alguém hoje?", "Em qual momento desta semana você sentiu o sopro da graça?"].map((promptText) => (
                        <button key={promptText} type="button" onClick={() => setSelectedPrompt(promptText)} className={`p-3 border rounded-xl text-left cursor-pointer text-xs transition ${selectedPrompt === promptText ? "border-[#C08261] bg-[#C08261]/5 text-stone-850 font-medium" : "border-stone-150 bg-stone-50/50 text-stone-500 hover:bg-stone-50"}`}>{promptText}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Sua Resposta Sincera *</label>
                    <textarea rows={4} value={newCentelhaContent} onChange={(e) => setNewCentelhaContent(e.target.value)} placeholder="Derrame o seu coração aqui..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Seu Nome</label>
                      <input type="text" value={newCentelhaAuthor} onChange={(e) => setNewCentelhaAuthor(e.target.value)} placeholder={userProfile?.name || "Opcional"} maxLength={18} className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261] transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Cidade / UF</label>
                      <input type="text" value={newCentelhaLocation} onChange={(e) => setNewCentelhaLocation(e.target.value)} placeholder={userProfile?.city || "Opcional"} maxLength={24} className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261] transition" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold rounded-2xl transition flex items-center justify-center gap-2">
                    🕯️ Ecoar Minha Chama na Mesa (+5 Créditos)
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2 flex flex-col justify-between bg-stone-50/50 border border-stone-150 p-5 rounded-2xl text-left min-h-[300px]">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono uppercase bg-amber-50 text-[#8C6239] border border-amber-200/50 px-2.5 py-0.5 rounded-full font-bold">Visualização do Card</span>
                  <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-stone-100 p-6 rounded-2xl relative shadow-md overflow-hidden flex flex-col justify-between h-[230px] border border-stone-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C08261]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-3 relative z-10">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-[#DCAE6C]">{selectedPrompt}</p>
                      <p className="font-serif text-xs leading-normal italic text-stone-200">"{newCentelhaContent.trim() || "Sua resposta moldará este card compartilhável..."}"</p>
                    </div>
                    <div className="border-t border-stone-800 pt-3 flex justify-between items-center relative z-10">
                      <div>
                        <cite className="text-[10px] font-serif not-italic font-bold text-stone-100 block">{newCentelhaAuthor.trim() || userProfile?.name || "Um Peregrino Sincero"}</cite>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-stone-450 block">📍 {newCentelhaLocation.trim() || userProfile?.city || "Brasil"}</span>
                      </div>
                      <span className="text-[8px] font-mono border border-[#C08261]/40 px-2 py-0.5 rounded text-[#DCAE6C] font-bold">SOMOS O DESPERTAR</span>
                    </div>
                  </div>
                </div>
                <p className="pt-4 text-[10px] text-stone-400 font-serif leading-relaxed text-center">Estruturado para espalhar convites no WhatsApp.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-850">Mesa Redonda das Centelhas</h4>
                  <p className="text-stone-500 text-xs">Testemunhos ativos de peregrinos por todo o Brasil.</p>
                </div>
                <div className="flex items-center font-mono text-[10px] uppercase font-bold text-[#C08261] bg-[#C08261]/10 px-3 py-1 rounded-full">
                  🕯️ {centelhas.length} Centelhas Vivas
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {centelhas.map((cent) => (
                    <motion.div key={cent.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="bg-[#FAF8F5] border border-stone-200/60 p-5 rounded-2xl flex flex-col justify-between h-[280px] hover:border-[#C08261]/40 transition shadow-xs hover:shadow-md">
                      <div className="space-y-4 text-left">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono uppercase bg-stone-100 text-[#C08261] px-2 py-0.5 rounded font-extrabold max-w-[85%] truncate">{cent.prompt}</span>
                          <span className="text-xs">🕊️</span>
                        </div>
                        <p className="font-serif text-xs md:text-sm text-stone-850 leading-relaxed italic line-clamp-6">"{cent.content}"</p>
                      </div>
                      <div className="border-t border-stone-200/50 pt-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-stone-900 block font-serif">{cent.author}</span>
                          <span className="text-[9px] font-mono text-stone-450 block">{cent.location}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <button type="button" onClick={() => handleVoteCentelha(cent.id)} className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${hasVotedPost[cent.id] || cent.voted ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200" : "bg-white hover:bg-stone-100 text-stone-550 border border-stone-200"}`}>
                            <Heart size={11} className={hasVotedPost[cent.id] || cent.voted ? "fill-emerald-700 text-emerald-700" : ""} />
                            <span>{cent.votes}</span>
                          </button>
                          <button type="button" onClick={() => { const shareText = `*O DESPERTAR — CENTELHA VIVA* 🕯️\n\n_"${cent.content}"_\n\n*${cent.author}* (${cent.location})\n\nsomosodespertar.com.br`; try { navigator.clipboard.writeText(shareText); showTemporaryToast("Centelha copiada! 🕊️📲"); } catch (e) { showTemporaryToast("Copiado!"); } }} className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 hover:border-[#C08261] text-stone-550 cursor-pointer transition">
                            <Share2 size={11} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4 — OS LIVROS */}
        {activeTab === "livros" && (
          <motion.div key="livros-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-12 pb-10">

            {/* Hero */}
            <div className="text-center pt-6 pb-4">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#C08261] bg-[#C08261]/10 border border-[#C08261]/20 rounded-full px-4 py-1.5 mb-4">
                📖 Adquirir os Livros
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-900 leading-tight mb-3">
                Anos de escrita.<br />
                <span className="font-semibold text-[#C08261]">Uma jornada que você pode levar para casa.</span>
              </h2>
              <p className="text-stone-500 text-[15px] max-w-lg mx-auto leading-relaxed">
                Cada ebook é uma lamparina — escrita com tempo, oração e alma — para acender algo que talvez esteja adormecido em você.
              </p>
            </div>

            {/* Cards dos livros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1 — O Despertar */}
              <div className="flex flex-col gap-5 bg-gradient-to-br from-[#1E1C1A] to-[#0e0d0c] border-2 border-[#DCAE6C]/30 rounded-3xl p-6 shadow-xl relative">
                <div className="absolute -top-3 left-5">
                  <span className="text-[10px] font-mono font-black uppercase bg-[#C08261] text-white px-3 py-1 rounded-full tracking-wider shadow-sm">Mais adquirido ✨</span>
                </div>
                <div className="flex gap-4 items-start mt-3">
                  <img src={bookCoverImg} alt="Capa O Despertar" className="w-20 h-28 object-cover rounded-r-lg rounded-l-sm shadow-lg border-l-4 border-stone-950 shrink-0" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-serif text-xl font-semibold text-stone-100 mb-1">O Despertar</p>
                    <p className="text-stone-400 text-[13px] leading-relaxed">A geração que voltou a ouvir a voz de Deus. Em uma época de distrações, este livro é um convite para ouvir o Pai, encontrar propósito e viver uma fé autêntica.</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {["Ebook completo em PDF + ePub", "Acesso vitalício", "Entrega imediata por e-mail", "Apoia diretamente o projeto"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-stone-300"><Check size={14} className="text-[#DCAE6C] shrink-0" />{item}</li>
                  ))}
                </ul>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-stone-500 text-sm line-through font-mono">R$ 34,90</span>
                  <span className="text-2xl font-semibold text-[#DCAE6C] font-mono">R$ 24,90</span>
                </div>
                <a href={linkDespertar} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 bg-gradient-to-r from-[#C28463] to-[#DCAE6C] hover:from-[#b07353] text-stone-950 text-sm font-black rounded-2xl transition flex items-center justify-center gap-2">
                  Levar O Despertar para Casa →
                </a>
              </div>

              {/* Card 2 — Devocionais */}
              <div className="flex flex-col gap-5 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full">Aliança de Manhã ⛅</span>
                </div>
                <div>
                  <p className="font-serif text-xl font-semibold text-stone-900 mb-1">Devocionais Diários</p>
                  <p className="text-stone-500 text-[13px] leading-relaxed">Poucos minutos por dia mudam uma vida inteira. Reflexões, versículos, orações e desafios práticos para fortalecer sua fé e ouvir Deus com mais clareza.</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {["Ebook completo em PDF", "Acesso vitalício", "Entrega imediata por e-mail", "Apoia diretamente o projeto"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-stone-600"><Check size={14} className="text-[#C08261] shrink-0" />{item}</li>
                  ))}
                </ul>
                <div className="flex items-baseline gap-2 border-t border-stone-100 pt-4">
                  <span className="text-stone-400 text-sm line-through font-mono">R$ 39,90</span>
                  <span className="text-2xl font-semibold text-stone-900 font-mono">R$ 27,90</span>
                </div>
                <a href={linkDevocionais} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 bg-[#C08261] hover:bg-[#A96D4D] text-white text-sm font-black rounded-2xl transition flex items-center justify-center gap-2">
                  Começar Minha Manhã Diferente →
                </a>
              </div>
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 font-bold">A biblioteca que forma os líderes deste movimento</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Biblioteca de Leitura — Persuasão & Copywriting */}
            <div className="space-y-3">
              <div className="max-w-2xl mb-6">
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C08261] mb-2">Livros que leio e recuso</p>
                <h3 className="font-serif text-2xl font-light text-stone-900 leading-snug mb-2">
                  Não basta ter algo a dizer.<br />
                  <span className="font-semibold">É preciso saber como dizer.</span>
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Estes são os livros que formam a espinha dorsal de como o Despertar fala, convida e se comunica. Cada um ensina uma dimensão diferente de como as palavras certas, ditas no momento certo, mudam decisões — e vidas.
                </p>
              </div>

              <div className="space-y-8">
                {bibliotecaLivros.map((secao) => (
                  <div key={secao.categoria}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${secao.badge}`}>{secao.categoria}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {secao.livros.map((livro) => (
                        <div key={livro.titulo} className="bg-[#FAF8F5] border border-stone-200/70 rounded-2xl p-5 flex gap-4 hover:border-[#C08261]/30 hover:shadow-sm transition">
                          <span className="text-2xl shrink-0 mt-0.5">{livro.emoji}</span>
                          <div className="space-y-1 min-w-0">
                            <p className="font-serif font-semibold text-stone-900 text-[14px] leading-snug">{livro.titulo}</p>
                            <p className="text-[11px] font-mono text-stone-400 uppercase tracking-wide">{livro.autor}</p>
                            <p className="text-stone-600 text-[13px] leading-relaxed pt-1">{livro.insight}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Por que os livros existem */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "⏳", title: "Anos de escrita", desc: "Cada página foi revisitada dezenas de vezes — não para impressionar, mas para tocar." },
                { icon: "🙌", title: "Sem editora", desc: "São livros independentes — cada compra chega diretamente ao autor." },
                { icon: "🌱", title: "Sua compra semeia", desc: "Cada real financia servidores, licenças e o alcance de novos leitores." },
                { icon: "🔒", title: "Pagamento seguro", desc: "Via Kiwify — entrega automática após confirmação, sem assinaturas." },
              ].map((item) => (
                <div key={item.title} className="bg-stone-50 border border-stone-100 rounded-2xl p-4 flex flex-col gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <p className="font-semibold text-stone-800 text-[13px]">{item.title}</p>
                  <p className="text-stone-500 text-[12px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Presentear */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0 mt-0.5">🎁</span>
              <div>
                <p className="font-semibold text-stone-800 text-[14px] mb-1">Quer presentear alguém?</p>
                <p className="text-stone-500 text-[13px] leading-relaxed">Ao finalizar a compra no Kiwify, você pode alterar o e-mail de entrega para o endereço de quem receberá o livro. É o presente que chega em segundos e fica para sempre.</p>
              </div>
            </div>

            {/* Oração como apoio */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-stone-950 border border-emerald-800/30 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0 mt-0.5">🛡️</span>
              <div className="flex-1">
                <p className="font-semibold text-emerald-400 text-[13px] mb-1 font-mono uppercase tracking-wide">Não pode adquirir agora?</p>
                <p className="text-stone-400 text-[13px] leading-relaxed">Se seu momento não permite sementes financeiras, apoie com seu tempo sagrado. Comprometa-se a interceder pelo Despertar semanalmente — isso também sustenta o movimento.</p>
                <textarea
                  rows={2}
                  placeholder="Registre sua intenção de oração aqui (opcional)..."
                  value={prayerIntention}
                  onChange={(e) => setPrayerIntention(e.target.value)}
                  className="w-full mt-3 bg-stone-950 border border-stone-800 rounded-xl py-2 px-3 text-xs text-stone-200 focus:outline-none focus:border-emerald-600"
                />
                {prayerIntention && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserCredits(p => p + 5);
                      showTemporaryToast("Compromisso de intercessão registrado! +5 créditos. 🙏");
                      setPrayerIntention("");
                    }}
                    className="mt-2 py-2 px-5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Registrar Meu Compromisso de Oração
                  </button>
                )}
              </div>
            </div>

            {/* Rodapé segurança */}
            <div className="border-t border-stone-100 pt-5 flex items-center gap-2 text-stone-400 text-[13px]">
              <ShieldCheck size={15} />
              <span>Compra segura via Kiwify · Entrega imediata por e-mail · Sem assinaturas · LGPD compliant</span>
            </div>

            {/* Link config oculto */}
            <div className="text-center opacity-10 hover:opacity-100 transition-opacity duration-300">
              <details className="inline-block text-left">
                <summary className="text-[9px] text-stone-400 font-mono cursor-pointer list-none">⚙️ Configurar Links de Pagamento</summary>
                <div className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-3 w-72 absolute left-1/2 transform -translate-x-1/2 z-50 shadow-lg">
                  <div className="space-y-1">
                    <label className="text-stone-500 text-[9px] uppercase font-mono block">O Despertar (Link)</label>
                    <input type="text" value={linkDespertar} onChange={(e) => { setLinkDespertar(e.target.value); localStorage.setItem("kiwify_link_despertar", e.target.value); }} className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-700 font-mono text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-500 text-[9px] uppercase font-mono block">Devocionais (Link)</label>
                    <input type="text" value={linkDevocionais} onChange={(e) => { setLinkDevocionais(e.target.value); localStorage.setItem("kiwify_link_devocionais", e.target.value); }} className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-700 font-mono text-xs focus:outline-none" />
                  </div>
                </div>
              </details>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

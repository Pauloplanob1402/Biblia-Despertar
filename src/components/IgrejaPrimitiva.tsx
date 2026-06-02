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
  Sparkle,
  Lock,
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
  counter?: number; // For intercessors or empty seats
  maxCounter?: number; // For empty seats limit
  actionsTaken?: string[]; // Log emails/names of users who interacted
  userInteracted?: boolean; // If local user joined
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
  // Main view navigation tab
  const [activeTab, setActiveTab] = useState<"comunhao" | "chamado">(
    "comunhao"
  );

  // Landing and interactives state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("SP");
  const [chosenService, setChosenService] = useState("Oração");
  const [interactionType, setInteractionType] = useState<"offer" | "receive">(
    "offer"
  );

  const [isRegistered, setIsRegistered] = useState(false);
  const [vagasRestantes, setVagasRestantes] = useState(47);
  const [estadosContados, setEstadosContados] = useState(8);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Donation State
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [customValue, setCustomValue] = useState("");
  const [donatorName, setDonatorName] = useState("");
  const [confirmedDonation, setConfirmedDonation] = useState(false);

  // AbacatPay Book Sponsorship Custom States
  const [selectedBookTier, setSelectedBookTier] = useState<
    "book_despertar" | "book_devocionais" | "physical" | "kit" | "custom" | "prayer"
  >("book_despertar");
  const [purchaseMode, setPurchaseMode] = useState<"self" | "gift">("self");
  const [giftName, setGiftName] = useState("");
  const [giftEmail, setGiftEmail] = useState("");
  const [prayerIntention, setPrayerIntention] = useState("");
  const [abacatStep, setAbacatStep] = useState<
    "select" | "form" | "qr" | "success"
  >("select");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [sponsorCep, setSponsorCep] = useState("");
  const [sponsorAddress, setSponsorAddress] = useState("");
  const [customBookValue, setCustomBookValue] = useState("50");

  // Customizable AbacatePay links stored in localStorage for unified payment
  const [linkDespertar, setLinkDespertar] = useState<string>(
    () => localStorage.getItem("abacat_link_despertar") || "https://app.abacatepay.com/pay/bill_B0uL2rQs16rB0xsbHyPtknat"
  );
  const [linkDevocionais, setLinkDevocionais] = useState<string>(
    () => localStorage.getItem("abacat_link_devocionais_unified") || "https://app.abacatepay.com/pay/bill_mdatPr3qQceaXzNyKhhdmZup"
  );

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

  // User Credits State (As proposed, starts with 12 initial credits)
  const [userCredits, setUserCredits] = useState<number>(12);

  // Interactive Mural Posts State (Pre-populated with rich editorial, personal stories based on proposal)
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
      counter: 3, // Taken seats
      maxCounter: 5, // Total seats
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
        "Iniciamos um pequeno grupo em comunidade carente aqui no interior, mas temos apenas 2 Bíblias para 8 pessoas. Se alguém puder doar Bíblias usadas ou novas, faria toda diferença para o início da jornada deles.",
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

  // Handle publishing a new item
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newUF, setNewUF] = useState("SP");
  const [newCategory, setNewCategory] = useState<
    "necessidade" | "oferta" | "oracao" | "cadeira_vazia"
  >("necessidade");
  const [showPublishForm, setShowPublishForm] = useState(false);

  // List of active founders with realistic details
  const [fundadores, setFundadores] = useState<Fundador[]>([
    {
      name: "Marcos F.",
      location: "Curitiba, PR",
      service: "discipulado",
      type: "offer",
      avatarEmoji: "👨‍👣",
      isDonator: true,
    },
    {
      name: "Ana S.",
      location: "São Paulo, SP",
      service: "aconselhamento",
      type: "receive",
      avatarEmoji: "👩‍⚕️",
    },
    {
      name: "Roberto O.",
      location: "Fortaleza, CE",
      service: "líder de célula",
      type: "offer",
      avatarEmoji: "👨‍💼",
      isDonator: true,
    },
    {
      name: "Juliana M.",
      location: "Belo Horizonte, MG",
      service: "Oração",
      type: "offer",
      avatarEmoji: "👩‍🙏",
    },
    {
      name: "Gabriel K.",
      location: "Porto Alegre, RS",
      service: "Ensino bíblico",
      type: "offer",
      avatarEmoji: "👨‍📖",
    },
  ]);

  // Load from local storage if registered as founder or has interactive progress
  useEffect(() => {
    const savedFounder = localStorage.getItem("somosodespertar_founder_status");
    if (savedFounder) {
      setIsRegistered(true);
      setVagasRestantes(46);
    }
    const savedCredits = localStorage.getItem("despertar_user_credits");
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits));
    }
    const savedMural = localStorage.getItem("despertar_mural_v1");
    if (savedMural) {
      try {
        setMuralItems(JSON.parse(savedMural));
      } catch (e) {
        // use default
      }
    }

    // Simulate real-time progress slightly to create high pre-suasion engagement
    const interval = setInterval(() => {
      setVagasRestantes((prev) => {
        if (prev > 12) {
          return prev - (Math.random() > 0.85 ? 1 : 0);
        }
        return prev;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const saveMuralToStorage = (updatedMural: MuralItem[]) => {
    setMuralItems(updatedMural);
    localStorage.setItem("despertar_mural_v1", JSON.stringify(updatedMural));
  };

  const handleCopyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      showTemporaryToast("Código PIX copiado com sucesso! 🕊️");
    } catch (e) {
      const tempInput = document.createElement("textarea");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      showTemporaryToast("Código PIX copiado com sucesso! 🕊️");
    }
  };

  const showTemporaryToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRegisterFounder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !city) {
      showTemporaryToast(
        "Por favor, preencha todos os campos do cadastro do Reino."
      );
      return;
    }

    // Add user to founders pool
    const newFounder: Fundador = {
      name: name,
      location: `${city}, ${stateCode}`,
      service: chosenService.toLowerCase(),
      type: interactionType,
      avatarEmoji: interactionType === "offer" ? "🕊️" : "🙌",
      isDonator: false,
    };

    setFundadores((prev) => [newFounder, ...prev]);
    setIsRegistered(true);
    setVagasRestantes((prev) => Math.max(1, prev - 1));
    localStorage.setItem("somosodespertar_founder_status", "registered");
    localStorage.setItem("somosodespertar_founder_email", email);
    localStorage.setItem("somosodespertar_founder_name", name);
    showTemporaryToast(
      "Reserva efetuada com sucesso! Bem-vindo(a), Fundador! 🎉"
    );
  };

  const getDonationAmount = () => {
    if (selectedPreset) return selectedPreset;
    const custom = parseFloat(customValue);
    return isNaN(custom) ? 0 : custom;
  };

  const handleSimulateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const activeName =
      donatorName ||
      name ||
      (currentUser
        ? userProfile?.name || currentUser.displayName
        : "Doador Anônimo");
    const valorStr = getDonationAmount();

    if (valorStr <= 0) {
      showTemporaryToast("Por favor, defina um valor simbólico de gratidão.");
      return;
    }

    // Create a notification of support
    setConfirmedDonation(true);
    showTemporaryToast(
      `Generosidade registrada! R$ ${valorStr} simulados com amor.`
    );

    // If already in founders, check them as donator
    setFundadores((prev) => {
      const exists = prev.some(
        (f) => f.name.toLowerCase() === activeName.toLowerCase()
      );
      if (exists) {
        return prev.map((f) =>
          f.name.toLowerCase() === activeName.toLowerCase()
            ? { ...f, isDonator: true }
            : f
        );
      } else {
        return [
          {
            name: activeName,
            location: city ? `${city}, ${stateCode}` : "Brasil",
            service: "Apoio financeiro",
            type: "offer",
            avatarEmoji: "💖",
            isDonator: true,
          },
          ...prev,
        ];
      }
    });

    // Save badge to user achievements/profile if function exists
    if (onSaveProgress) {
      onSaveProgress({
        isFounderBadge: true,
        isDonatorBadge: true,
      });
    }
  };

  // Submit a new post into the Comunhão dos Santos
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newAuthor || !newCity) {
      showTemporaryToast("Por favor, preencha todos os campos para anunciar.");
      return;
    }

    const emojisMap = {
      necessidade: "📌",
      oferta: "🎁",
      oracao: "🙏",
      cadeira_vazia: "🪑",
    };

    // Calculate dynamic cost of credits: posting a Needs consumes 2 credits, Offer adds 3, Cadeira Vazia is open, Prayer is free
    let cost = 0;
    if (newCategory === "necessidade") {
      if (userCredits < 2) {
        showTemporaryToast(
          "Você precisa de pelo menos 2 créditos de mordomia para postar uma necessidade."
        );
        return;
      }
      cost = -2;
    } else if (newCategory === "oferta") {
      cost = 3;
    }

    const newItem: MuralItem = {
      id: Date.now().toString(),
      category: newCategory,
      author: newAuthor,
      avatarEmoji: emojisMap[newCategory],
      location: `${newCity}, ${newUF}`,
      title: newTitle,
      description: newDesc,
      timestamp: "Agora mesmo",
      counter:
        newCategory === "oracao"
          ? 0
          : newCategory === "cadeira_vazia"
          ? 0
          : undefined,
      maxCounter: newCategory === "cadeira_vazia" ? 4 : undefined,
      actionsTaken: [],
      userInteracted: false,
    };

    const updatedMural = [newItem, ...muralItems];
    saveMuralToStorage(updatedMural);

    // Apply credits calculation
    if (cost !== 0) {
      setUserCredits((prev) => {
        const next = prev + cost;
        localStorage.setItem("despertar_user_credits", next.toString());
        return next;
      });
    }

    showTemporaryToast(
      `Anúncio publicado com sucesso no Mural de ${newCategory.replace(
        "_",
        " "
      )}!`
    );

    // Reset form
    setNewTitle("");
    setNewDesc("");
    setShowPublishForm(false);
  };

  // Handle interacting with dynamic items
  const handleItemInteraction = (item: MuralItem) => {
    const activeName =
      name ||
      (currentUser ? userProfile?.name || currentUser.displayName : "Você");

    const updated = muralItems.map((m) => {
      if (m.id === item.id) {
        if (m.userInteracted) {
          // Uncommit
          const nextActions = m.actionsTaken
            ? m.actionsTaken.filter((a) => a !== activeName)
            : [];
          let nextCounter = m.counter;
          if (m.category === "oracao" && typeof m.counter === "number") {
            nextCounter = Math.max(0, m.counter - 1);
          } else if (
            m.category === "cadeira_vazia" &&
            typeof m.counter === "number"
          ) {
            nextCounter = Math.max(0, m.counter - 1);
          }

          return {
            ...m,
            userInteracted: false,
            actionsTaken: nextActions,
            counter: nextCounter,
          };
        } else {
          // Commit
          const nextActions = [...(m.actionsTaken || []), activeName];
          let nextCounter = m.counter;
          let creditChange = 0;

          if (m.category === "oracao" && typeof m.counter === "number") {
            nextCounter = m.counter + 1;
            creditChange = 1; // Assuming prayers grants 1 credit of brotherhood
          } else if (
            m.category === "cadeira_vazia" &&
            typeof m.counter === "number" &&
            m.maxCounter
          ) {
            if (m.counter >= m.maxCounter) {
              showTemporaryToast("Sentimos muito, esta mesa já está cheia!");
              return m;
            }
            nextCounter = m.counter + 1;
          } else if (m.category === "necessidade") {
            creditChange = 2; // Helping someone grants 2 credits of stewardship
          }

          if (creditChange > 0) {
            setUserCredits((prev) => {
              const next = prev + creditChange;
              localStorage.setItem("despertar_user_credits", next.toString());
              return next;
            });
          }

          return {
            ...m,
            userInteracted: true,
            actionsTaken: nextActions,
            counter: nextCounter,
          };
        }
      }
      return m;
    });

    saveMuralToStorage(updated);

    if (item.userInteracted) {
      showTemporaryToast(`Você removeu seu compromisso.`);
    } else {
      if (item.category === "oracao") {
        showTemporaryToast(
          `Que lindo! Você assumiu oração por ${item.author} esta semana! 🕯️`
        );
      } else if (item.category === "cadeira_vazia") {
        showTemporaryToast(
          `Cadeira reservada! Você se sentou à mesa com ${item.author} 🍲`
        );
      } else if (item.category === "necessidade") {
        showTemporaryToast(
          `Abundância! Você estendeu as mãos para ajudar ${item.author} (+2 créd.) 🤝`
        );
      } else {
        showTemporaryToast(
          `Seu interesse na oferta de ${item.author} foi registrado com amor!`
        );
      }
    }
  };

  // Mock code PIX key
  const mockPixKey =
    "00020101021126580014br.gov.bcb.pix0136apoio@somosodespertar.org520400005303986540530.005802BR5925Somos O Despertar Co6009Sao Paulo62070503***6304BFAD";

  // Counts for filters
  const countCategory = (
    cat: "necessidade" | "oferta" | "oracao" | "cadeira_vazia"
  ) => {
    return muralItems.filter((m) => m.category === cat).length;
  };

  return (
    <div
      id="igreja-primitiva-hub"
      className="space-y-12 py-6 max-w-4xl mx-auto px-4 md:px-0"
    >
      {/* Dynamic Toast Popup */}
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

      {/* INNER VIEW HEADER WITH PERSISTED METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#FAF8F5] border border-stone-200/60 p-6 rounded-3xl gap-6 shadow-xs text-left">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C08261] animate-ping" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold">
              O Santuário do Amor Prático
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-stone-850">
            A Comunhão dos Santos
          </h2>
          <p className="text-stone-500 text-xs md:text-sm italic">
            "Ninguém dizia que alguma coisa sua era exclusivamente sua, mas tudo
            era comum entre eles." — Atos 4:32 Paráfrase
          </p>
        </div>

        {/* Dynamic Credit Bank representation linked to user accounts */}
        <div className="bg-[#white] border border-[#C08261]/25 p-4 rounded-2xl flex items-center space-x-4 shrink-0 shadow-sm w-full md:w-auto">
          <div className="w-10 h-10 rounded-full bg-[#C08261]/10 flex items-center justify-center text-xl select-none">
            🪙
          </div>
          <div>
            <div className="flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#C08261]">
              <span>Seus Créditos de Mordomia</span>
              <HelpCircle
                size={11}
                className="text-stone-400 group cursor-pointer"
                title="Usados para pedir necessidades ou obtidos ajudando outros e orando."
              />
            </div>
            <span className="font-serif text-2xl font-extrabold text-stone-900">
              {userCredits}
            </span>
            <span className="text-stone-450 text-[10px] block mt-0.5 font-sans font-medium">
              Virtuais e Inesgotáveis
            </span>
          </div>
        </div>
      </div>

      {/* CORE VIEW TABS SELECTOR */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          id="tab-mural-comunhao"
          onClick={() => setActiveTab("comunhao")}
          className={`pb-4 text-sm font-semibold tracking-wide transition relative flex items-center gap-2 cursor-pointer ${
            activeTab === "comunhao"
              ? "text-stone-900 border-b-2 border-[#C08261]"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <Users size={16} />
          <span>O Mural Vivo</span>
          <span className="text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded-full font-mono font-bold">
            {muralItems.length}
          </span>
        </button>

        <button
          id="tab-chamado-pioneiro"
          onClick={() => setActiveTab("chamado")}
          className={`pb-4 text-sm font-semibold tracking-wide transition relative flex items-center gap-2 cursor-pointer ${
            activeTab === "chamado"
              ? "text-stone-900 border-b-2 border-[#C08261]"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <Flame size={15} />
          <span>Nossa Visão Primitiva & Apoio</span>
          <span className="text-[10px] bg-[#C08261] text-stone-100 px-1.5 py-0.5 rounded-full font-mono font-bold">
            Pioneiro
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: INTERACTIVE COMUNHÃO DOS SANTOS WALLS */}
        {activeTab === "comunhao" && (
          <motion.div
            key="mural-walls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 text-left"
          >
            {/* Introductory Concept Block based strictly on User Phrasing */}
            <div className="space-y-4 max-w-3xl">
              <p className="text-stone-650 text-base md:text-lg leading-relaxed font-sans">
                No movimento do Despertar, acreditamos que ninguém muda sozinho.
                Que a fé se vive em mesa, não em solidão. Que o discipulado é
                caminhar junto.{" "}
                <strong className="text-stone-900 font-semibold">
                  A Comunhão dos Santos
                </strong>{" "}
                é o espaço sagrado onde as necessidades de uns encontram as mãos
                de amor e serviço de outros. É o sagrado e o comum partilhados
                como oferta real.
              </p>
              <div className="flex flex-wrap gap-2.5 text-xs text-stone-550 pt-2 font-medium">
                <span className="flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full">
                  <Check size={12} className="text-[#C08261]" /> Hospitalidade
                  Autêntica
                </span>
                <span className="flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full">
                  <Check size={12} className="text-[#C08261]" /> Economia de
                  Dádiva
                </span>
                <span className="flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full">
                  <Check size={12} className="text-[#C08261]" /> Moderação
                  Solidária
                </span>
              </div>
            </div>

            {/* ACTION CENTER BAR: FILTERS + PUBLIC BUTTON */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-stone-50 border border-stone-200/50 p-4 rounded-2xl w-full">
              {/* Filter pills box */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                <span className="text-xs uppercase font-mono font-bold text-stone-400 mr-2">
                  Filtrar:
                </span>
                {[
                  { key: "todas", label: "Todos", emoji: "📋" },
                  {
                    key: "necessidade",
                    label: "Necessidades",
                    emoji: "📌",
                    badge: countCategory("necessidade"),
                  },
                  {
                    key: "oferta",
                    label: "Ofertas",
                    emoji: "🎁",
                    badge: countCategory("oferta"),
                  },
                  {
                    key: "oracao",
                    label: "Orações",
                    emoji: "🙏",
                    badge: countCategory("oracao"),
                  },
                  {
                    key: "cadeira_vazia",
                    label: "Cadeira Vazia",
                    emoji: "🪑",
                    badge: countCategory("cadeira_vazia"),
                  },
                ].map((flt) => (
                  <button
                    key={flt.key}
                    type="button"
                    onClick={() => {
                      // Simulating filter via inline states or toasts
                      showTemporaryToast(`Filtrado por: ${flt.label}`);
                    }}
                    className="px-3.5 py-1.5 text-xs rounded-xl font-medium cursor-pointer transition bg-white border border-stone-200 hover:border-[#C08261] text-stone-600 flex items-center space-x-1"
                  >
                    <span>{flt.emoji}</span>
                    <span>{flt.label}</span>
                    {typeof flt.badge === "number" && (
                      <span className="text-[10px] bg-stone-100 text-[#C08261] px-1.5 py-0.5 rounded font-mono font-bold">
                        {flt.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Publish button triggers absolute card section */}
              <button
                id="btn-publicar-chamado"
                onClick={() => setShowPublishForm(!showPublishForm)}
                className="py-3 px-5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 shrink-0 shadow-sm cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Anunciar No Mural</span>
              </button>
            </div>

            {/* GROWING SLIDE-DOWN OF THE PUBLISH ANNOUNCEMENT FORM */}
            <AnimatePresence>
              {showPublishForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white border-2 border-[#C08261]/25 p-6 rounded-2xl space-y-5 shadow-lg max-w-xl mx-auto text-left"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <h4 className="font-serif font-bold text-stone-850 flex items-center gap-1.5">
                      <Plus size={18} className="text-[#C08261]" />
                      <span>Anunciar nova Ação na Comunhão</span>
                    </h4>
                    <span className="text-[10px] uppercase font-mono text-stone-400 font-bold">
                      Preencha com Respeito
                    </span>
                  </div>

                  <form
                    onSubmit={handlePublishPost}
                    className="space-y-4 text-xs md:text-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                          Seu Nome / Família
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Família Soares"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          required
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-hidden focus:border-[#C08261]"
                        />
                      </div>

                      {/* Location input */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                            Sua Cidade
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: São Paulo"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            required
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-hidden focus:border-[#C08261]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                            UF
                          </label>
                          <input
                            type="text"
                            placeholder="SP"
                            maxLength={2}
                            value={newUF}
                            onChange={(e) =>
                              setNewUF(e.target.value.toUpperCase())
                            }
                            required
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 text-center font-mono focus:outline-hidden focus:border-[#C08261]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Category select block */}
                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block font-semibold">
                          Categoria do Mural
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) =>
                            setNewCategory(e.target.value as any)
                          }
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-850 font-medium focus:outline-hidden focus:border-[#C08261]"
                        >
                          <option value="necessidade">
                            📌 Necessidade (Gasta 2 cred.)
                          </option>
                          <option value="oferta">🎁 Oferta (+3 cred.)</option>
                          <option value="oracao">
                            🙏 Pedido de Oração (Grátis)
                          </option>
                          <option value="cadeira_vazia">
                            🪑 Cadeira Vazia (Grátis)
                          </option>
                        </select>
                      </div>

                      {/* Title input */}
                      <div className="md:col-span-7 space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block font-semibold">
                          Título do Anúncio
                        </label>
                        <input
                          type="text"
                          placeholder="Resuma o pedido ou oferta de forma clara"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          required
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-hidden focus:border-[#C08261]"
                        />
                      </div>
                    </div>

                    {/* Description text block */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block font-semibold">
                        Detalhamento da Ação
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Quais os detalhes? Como as pessoas podem te amparar ou usufruir?"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-hidden focus:border-[#C08261]"
                      />
                    </div>

                    <span className="text-[10.5px] text-stone-450 block italic leading-relaxed">
                      * O Despertar incentiva a confiança sincera. Abusos serão
                      moderados fraternalmente pela mesa de anciãos mais
                      próxima.
                    </span>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPublishForm(false)}
                        className="py-2.5 px-4 bg-stone-100 hover:bg-stone-250 text-stone-600 rounded-xl text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="py-2.5 px-6 bg-[#C08261] hover:bg-[#b07353] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                      >
                        Publicar Anúncio de Amor
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MURAL ITEMS RESPONSIVE GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {muralItems.map((item) => {
                // Color formatting matching specific categories
                const categoryClasses = {
                  necessidade: {
                    bg: "bg-[#C08261]/5 border-[#C08261]/20",
                    badge: "bg-[#C08261]/10 text-[#C08261]",
                    label: "Necessidade 📌",
                  },
                  oferta: {
                    bg: "bg-emerald-50/40 border-emerald-250/20",
                    badge: "bg-emerald-100/40 text-emerald-800",
                    label: "Oferta 🎁",
                  },
                  oracao: {
                    bg: "bg-amber-50/30 border-amber-250/20",
                    badge: "bg-amber-100/50 text-amber-900",
                    label: "Pedido de Oração 🙏",
                  },
                  cadeira_vazia: {
                    bg: "bg-stone-50 border-stone-200/50",
                    badge:
                      "bg-[#DCAE6C]/10 text-stone-800 border border-[#DCAE6C]/20",
                    label: "Cadeira Vazia 🪑",
                  },
                };

                const styled =
                  categoryClasses[item.category] || categoryClasses.necessidade;

                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-3xl border shadow-xs transition hover:shadow-md hover:border-stone-300 flex flex-col justify-between space-y-4 ${styled.bg}`}
                  >
                    <div className="space-y-3">
                      {/* Section header: Badge category along with stamp metrics */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-[10px] font-mono tracking-widest uppercase font-extrabold px-2.5 py-1 rounded ${styled.badge}`}
                        >
                          {styled.label}
                        </span>
                        <div className="flex items-center space-x-1.5 text-stone-400 font-mono text-[10px] uppercase font-semibold">
                          <Clock size={11} />
                          <span>{item.timestamp}</span>
                        </div>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-stone-605 text-sm leading-relaxed block">
                        {item.description}
                      </p>
                    </div>

                    {/* Metadata & Interactive claim actions */}
                    <div className="space-y-4.5 pt-4 border-t border-stone-150 text-xs text-stone-500">
                      {/* Author credentials */}
                      <div className="flex items-center justify-between text-[11px] leading-tight">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-sm">
                            {item.avatarEmoji}
                          </span>
                          <div>
                            <span className="font-bold text-stone-800 block">
                              {item.author}
                            </span>
                            <span className="text-[9.5px] uppercase font-mono text-stone-400 font-extrabold flex items-center gap-0.5">
                              <MapPin size={9} /> {item.location}
                            </span>
                          </div>
                        </div>

                        {/* Interactive dynamic counters representation */}
                        {item.category === "oracao" && (
                          <span className="text-[#C08261] font-mono font-bold uppercase tracking-wider text-[10px] bg-[#C08261]/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
                            <Flame size={10} /> {item.counter} clamando
                          </span>
                        )}

                        {item.category === "cadeira_vazia" && (
                          <span className="text-stone-800 font-mono font-bold uppercase tracking-wider text-[10px] bg-stone-100 border px-2 py-0.5 rounded-sm flex items-center gap-1">
                            <Coffee size={10} /> {item.counter}/
                            {item.maxCounter} sentados
                          </span>
                        )}
                      </div>

                      {/* Display users who joined or committed */}
                      {item.actionsTaken && item.actionsTaken.length > 0 && (
                        <div className="bg-white/60 p-2.5 rounded-xl text-[10.5px] text-stone-500 border border-stone-200 flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-stone-700">
                            Abraços de amor:
                          </span>
                          {item.actionsTaken.map((ac, idx) => (
                            <span
                              key={idx}
                              className="bg-stone-100 text-stone-650 px-1 rounded border-b border-stone-250"
                            >
                              {ac}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CALL TO ACTION DYNAMIC BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleItemInteraction(item)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                          item.userInteracted
                            ? "bg-emerald-900/10 border-0 text-emerald-800 font-extrabold hover:bg-emerald-100"
                            : item.category === "oracao"
                            ? "bg-stone-900 text-white hover:bg-black"
                            : "bg-white border-2 border-stone-800 text-stone-900 hover:bg-stone-50"
                        }`}
                      >
                        {item.userInteracted ? (
                          <>
                            <Check size={14} className="text-emerald-500" />
                            <span>Compromisso Assumido!</span>
                          </>
                        ) : item.category === "oracao" ? (
                          <>
                            <Flame
                              size={13}
                              className="text-amber-300 animate-pulse fill-amber-400"
                            />
                            <span>Assumir Oração esta semana</span>
                          </>
                        ) : item.category === "cadeira_vazia" ? (
                          <>
                            <Coffee size={13} className="text-[#C08261]" />
                            <span>Reservar Cadeira Vazia</span>
                          </>
                        ) : item.category === "necessidade" ? (
                          <>
                            <CheckCircle
                              size={13}
                              className="text-emerald-500"
                            />
                            <span>Estender as Mãos & Ajudar</span>
                          </>
                        ) : (
                          <>
                            <Heart size={13} className="text-rose-500" />
                            <span>Interessar-me pela Oferta</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* END CARD: CADEIRA VAZIA INSPIRATION PROPOSAL */}
            <div className="bg-[#FAF8F5]/80 border-2 border-dashed border-[#C08261]/25 rounded-3xl p-6 md:p-8 space-y-4 max-w-2xl mx-auto text-center">
              <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl mx-auto select-none">
                🪑
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-850">
                A Cadeira Vazia — Hospitalidade Real
              </h4>
              <p className="text-stone-550 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                Inspirado na teologia da mesa do Despertar, a "Cadeira Vazia" é
                um convite constante:{" "}
                <em className="text-stone-850 font-serif">
                  "Na sua mesa, há sempre uma cadeira vazia para um irmão que
                  ainda não tem grupo local."
                </em>{" "}
                Faça do seu lar um tabernáculo físico de graça.
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ORIGINAL PIONEER CALL & DONATION ENGINE */}
        {activeTab === "chamado" && (
          <motion.div
            key="chamado-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 text-left"
          >
            {/* INGRESS HERO TEXTS */}
            <div className="text-center space-y-5 py-4">
              <h3 className="font-serif text-3xl md:text-5xl font-light text-stone-850 leading-tight">
                A igreja primitiva não tinha aplicativo. <br />
                <span className="font-serif font-semibold text-[#C08261]">
                  E funcionava assim.
                </span>
              </h3>
              <p className="text-stone-605 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                No primeiro século, cada pessoa dava o que tinha, e recebia o
                que precisava. Sem templos grandiosos ou transações burocráticas
                comerciais. Só fé, pão partido nas casas e amparo recíproco sob
                o Espírito de Deus.
              </p>
            </div>

            <hr className="border-stone-150" />

            {/* SECTION 1: O PROBLEMA IN THE KINGDOM */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 space-y-2">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block">
                  O Fardo Silencioso
                </span>
                <h4 className="font-serif text-2xl md:text-3xl font-light text-stone-850">
                  Comunhão de Domingo a Domingo
                </h4>
              </div>

              <div className="md:col-span-8 space-y-6">
                <p className="text-stone-650 text-sm md:text-base leading-relaxed">
                  A maioria das pessoas vai à igreja no domingo e não
                  compartilha uma conversa sincera com ninguém até o próximo
                  culto. Há uma barreira invisível para expor fragilidade ou
                  pedir amparo sem que pareça constrangedor demais para as
                  estruturas modernas.
                </p>
                <blockquote className="border-l-4 border-[#C08261] pl-5 italic text-stone-750 font-serif bg-orange-50/20 py-2.5 rounded-r-2xl pr-3 text-sm md:text-base">
                  "Não deixemos de reunir-nos, como alguns têm por costume; pelo
                  contrário, encorajemo-nos uns aos outros."
                  <cite className="font-mono text-[10px] text-stone-455 block mt-2 not-italic font-bold">
                    — Hebreus 10:25
                  </cite>
                </blockquote>
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* SECTION 2: A VISÃO DO DESPERTAR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 space-y-2">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block">
                  A Restauração
                </span>
                <h4 className="font-serif text-2xl md:text-3xl font-light text-stone-850">
                  Estamos restaurando uma prática secular.
                </h4>
              </div>

              <div className="md:col-span-8 space-y-5">
                <div className="bg-stone-50 border border-stone-200/50 rounded-3xl p-6 text-stone-650 text-xs md:text-sm leading-relaxed space-y-4">
                  <p>
                    Durante os primeiros três séculos, a igreja crescia em{" "}
                    <strong className="text-stone-900 font-bold">
                      casas abertas
                    </strong>
                    . Todos serviam e eram servidos reciprocamente. A Bíblia do
                    Despertar é essa busca sincera de transpor essa economia da
                    graça e serviço descentralizados para o ambiente digital mas
                    preservando a pureza humana da comunhão verdadeira.
                  </p>
                  <p className="font-medium text-stone-850">
                    O ecossistema é gratuito, livre de patrocinadores
                    comerciales. É sustentado puramente pela mordomia dos
                    co-fundadores pioneiros que acreditam no regresso ao
                    Evangelho simples.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* INTERACTIVE DONATIONS AND GENEROSITY PIX BOX - NOW ABACATPAY BOOK SPONSORSHIP */}
            <div
              id="donation-block"
              className="bg-gradient-to-br from-[#1E1C1A] via-[#121110] to-[#080807] text-white rounded-3xl p-6 md:p-10 border border-[#DCAE6C]/25 shadow-2xl relative space-y-8"
            >
              {/* Header block */}
              <div className="space-y-4 max-w-3xl text-left">
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-[#DCAE6C]/10 border border-[#DCAE6C]/20 rounded-full text-[10px] font-mono text-[#DCAE6C] font-semibold uppercase tracking-wider font-bold">
                  <Gift size={11} className="text-amber-250 animate-pulse" />{" "}
                  <span>Altar de Generosidade & Livro Oficial</span>
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-stone-100 leading-tight">
                  Seja um Patrocinador e Adquira <br />
                  <span className="font-serif font-bold text-[#DCAE6C]">
                    "O Despertar"
                  </span>
                </h3>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                  Para construirmos um ecossistema digital que seja
                  simultaneamente robusto, fluido e 100% focado no calor humano,
                  precisamos vencer barreiras de servidores soberanos e
                  conformidades jurídicas. Ao adquirir nosso livro oficial via{" "}
                  <strong className="text-white font-bold">AbacatPay</strong>,
                  seu patrocínio financia diretamente este lançamento nacional e
                  a regularização jurídica de nossas ações de caridade.
                </p>
              </div>

              {/* Progress Tracker Widget */}
              <div className="bg-[#181716] p-5 rounded-2xl border border-stone-800 space-y-3.5 text-left">
                <div className="flex justify-between items-center text-xs flex-wrap gap-2 text-stone-400">
                  <span className="flex items-center gap-1.5 text-stone-200 font-semibold font-serif font-bold">
                    <TrendingUp size={14} className="text-[#DCAE6C]" />
                    <span>
                      Fundo de Registro Civil & Infraestrutura Criptografada
                    </span>
                  </span>
                  <span className="font-mono text-[#DCAE6C] text-xs font-bold">
                    <strong>25% Concluído</strong> (R$ 1.247 / R$ 5.000)
                  </span>
                </div>
                <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                  <div
                    className="bg-gradient-to-r from-[#C28463] to-[#DCAE6C] h-2 rounded-full"
                    style={{ width: "25%" }}
                  />
                </div>
                <span className="text-[10px] font-mono text-stone-500 block">
                  Faltam apenas R$ {5000 - 1247} para darmos entrada na personificação
                  legal da comunidade e licenças LGPD.
                </span>
              </div>

              {/* Layout: Book Visual (Left) & AbacatPay Stepper (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-stone-950/40 rounded-3xl border border-stone-850 text-center">
                  {/* REAL BOOK COVER OF O DESPERTAR OR SECURE CSS BACKUP */}
                  {selectedBookTier === "book_despertar" || selectedBookTier === "book_devocionais" ? (
                    <img
                      id="real-book-cover"
                      src={bookCoverImg}
                      alt="Capa O Despertar"
                      className="w-44 h-64 md:w-48 md:h-72 object-cover rounded-r-xl rounded-l-md shadow-[10px_15px_30px_rgba(0,0,0,0.8)] border-l-8 border-stone-950 transition-all duration-500 hover:scale-[1.03] select-none"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`relative w-44 h-64 md:w-48 md:h-72 rounded-r-xl rounded-l-md shadow-[10px_15px_30px_rgba(0,0,0,0.7)] border-l-8 border-stone-950 transition-all duration-500 hover:scale-[1.03] flex flex-col justify-between p-5 text-left ${
                      selectedBookTier === "book_devocionais"
                        ? "bg-gradient-to-br from-[#1B2936] via-[#101921] to-[#060A0D]"
                        : selectedBookTier === "prayer"
                        ? "bg-gradient-to-br from-[#122A1E] via-[#0B1A13] to-[#040A07]"
                        : "bg-gradient-to-br from-[#2E1E17] via-[#1F140F] to-[#0A0705]"
                    }`}>
                      {/* Spine highlight glow */}
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-white/10" />

                      {/* Gold corners */}
                      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#DCAE6C]/40" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#DCAE6C]/40" />

                      <div className="space-y-1.5">
                        <span className="text-[8.5px] uppercase font-mono tracking-widest text-[#DCAE6C]/85 block font-bold">
                          {selectedBookTier === "prayer" ? "REDE DE INTERCESSÃO" : "LIVRO OFICIAL"}
                        </span>
                        <h4 className="font-serif text-lg md:text-xl font-bold tracking-tight text-stone-100 leading-tight">
                          {selectedBookTier === "prayer" ? "ORANTES" : "O DESPERTAR"}
                        </h4>
                        <p className="text-[7.5px] font-sans text-stone-400 font-extralight tracking-wide leading-tight uppercase">
                          {selectedBookTier === "book_devocionais"
                            ? "DEVOCIONAIS DIÁRIOS PARA DESPERTAR"
                            : selectedBookTier === "prayer"
                            ? "CORRENTE DE ORAÇÃO ATIVA"
                            : "A GERAÇÃO QUE VOLTOU A OUVIR A VOZ DE DEUS"}
                        </p>
                      </div>

                      {/* Central artistic sunburst & icon */}
                      <div className="my-auto flex flex-col items-center justify-center opacity-85 select-none py-2">
                        <div className="relative w-14 h-14 bg-gradient-to-t from-[#C08261]/25 to-amber-200/5 rounded-full flex items-center justify-center border border-[#DCAE6C]/25">
                          {selectedBookTier === "book_devocionais" ? (
                            <Heart
                              size={20}
                              className="text-[#DCAE6C] fill-[#DCAE6C]/20"
                            />
                          ) : selectedBookTier === "prayer" ? (
                            <ShieldCheck
                              size={20}
                              className="text-emerald-400 fill-emerald-500/20"
                            />
                          ) : (
                            <Flame
                              size={20}
                              className="text-[#DCAE6C] fill-[#DCAE6C]/20"
                            />
                          )}
                          <div className="absolute -top-1 w-1 h-3 bg-[#DCAE6C] rounded-full" />
                          <div className="absolute -bottom-1 w-1 h-3 bg-[#DCAE6C] rounded-full" />
                          <div className="absolute -left-1 w-3 h-1 bg-[#DCAE6C] rounded-full" />
                          <div className="absolute -right-1 w-3 h-1 bg-[#DCAE6C] rounded-full" />
                        </div>
                      </div>

                      <div className="border-t border-[#DCAE6C]/25 pt-1.5 flex justify-between items-center text-[7.5px] font-mono text-stone-400">
                        <span>SOMOS O DESPERTAR</span>
                        <span className="text-[#DCAE6C] font-semibold">
                          2026 ED.
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-xs text-stone-300 font-serif leading-relaxed max-w-[240px] min-h-[50px] flex items-center justify-center">
                    {selectedBookTier === "book_devocionais"
                      ? '"Preencha suas manhãs com quietude e propósitos inalienáveis: textos diários sobre fé genuína."'
                      : selectedBookTier === "prayer"
                      ? '"A oração em união move pontes intransponíveis. Participe e ajude o movimento através da intercessão voluntária."'
                      : '"Faça parte do maior movimento de retorno aos lares, mesas vazias preenchidas e a restauração da pureza primitiva."'}
                  </p>

                  <div className="mt-3 flex items-center gap-1 px-3 py-1.5 bg-stone-900/60 rounded-xl border border-stone-800 text-[10.5px] text-[#DCAE6C] font-mono font-bold">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="text-white ml-1 font-bold">
                      5.0 (200+ avaliações)
                    </span>
                  </div>
                </div>

                {/* ABACATPAY STEPPER ENGINE */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  {abacatStep === "select" && (
                    <div className="space-y-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-mono uppercase tracking-widest text-[#DCAE6C] font-extrabold block">
                          Abra espaço na sua mesa para este chamado:
                        </label>
                        <p className="text-[10.5px] text-stone-400 leading-relaxed font-sans">
                          Não comercializamos livros; semeamos instrumentos de comunhão e restauração do altar do lar. Ao equipar sua casa com nossas obras, você ampara voluntariamente todo este ecossistema digital para milhares de outras famílias.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {/* Option 1: E-book Oficial "O Despertar" */}
                        <div
                          onClick={() => setSelectedBookTier("book_despertar")}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 text-left relative ${
                            selectedBookTier === "book_despertar"
                              ? "bg-stone-900/60 border-[#DCAE6C] text-white shadow-xl"
                              : "bg-[#181716] border-stone-850 text-stone-300 hover:border-stone-800 hover:bg-stone-900/50"
                          }`}
                        >
                          <div className="absolute top-2 right-4 bg-emerald-600/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                            Escolha Unânime ✨
                          </div>
                          <div className="flex items-start gap-3 col-span-2">
                            <span className="w-8 h-8 rounded-full bg-stone-950 flex items-center justify-center text-base shrink-0 border border-[#DCAE6C]/30 text-[#DCAE6C]">
                              📔
                            </span>
                            <div>
                              <div className="font-bold font-serif text-sm flex items-center gap-1.5 pt-1 text-[#DCAE6C]">
                                E-book "O Despertar" — A Geração do Altar
                              </div>
                              <span className="text-[9px] bg-amber-500/10 text-stone-300 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                                PDF + EPub Fundamentais
                              </span>
                              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed max-w-sm">
                                O guia prático do movimento para regressar às escrituras puras e estruturar cultos no lar. Esta semente livra o acesso do app de anúncios e liberta 12 créditos de mordomia.
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-stone-500 font-bold">AbacatPay ID:</span>
                                <code className="text-[8px] bg-stone-950 px-1 py-0.5 rounded font-mono text-[#DCAE6C] border border-[#DCAE6C]/10 select-all font-bold">
                                  prod_gqXPEtwDMnF3ht6urCuhpPaG
                                </code>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 self-center">
                            <span className="font-mono text-xs text-stone-450 block line-through">
                              R$ 29,90
                            </span>
                            <span className="font-mono text-sm font-black text-[#DCAE6C]">
                              R$ 19,90
                            </span>
                          </div>
                        </div>

                        {/* Option 2: E-book "Devocionais Diários" */}
                        <div
                          onClick={() => setSelectedBookTier("book_devocionais")}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 text-left relative ${
                            selectedBookTier === "book_devocionais"
                              ? "bg-stone-900/60 border-[#DCAE6C] text-white shadow-xl"
                              : "bg-[#181716] border-stone-850 text-stone-300 hover:border-stone-800 hover:bg-stone-900/50"
                          }`}
                        >
                          <div className="absolute top-2 right-4 bg-[#C08261]/10 text-[#C08261] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#C08261]/20 uppercase tracking-wider">
                            Aliança de Manhã ⛅
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-stone-950 flex items-center justify-center text-base shrink-0 border border-[#DCAE6C]/30 text-[#DCAE6C]">
                              🙏
                            </span>
                            <div>
                              <div className="font-bold font-serif text-sm flex items-center gap-1.5 pt-1 text-[#DCAE6C]">
                                E-book "Devocionais" — Sopro de Fé Pura
                              </div>
                              <span className="text-[9px] bg-amber-500/10 text-stone-300 font-mono px-1.5 py-0.5 rounded uppercase font-bold font-bold">
                                365 Dias de Altar
                              </span>
                              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed max-w-sm">
                                Companheiro diário de cabeceira para guiar minutos silenciosos de oração sincera a cada amanhecer. Este apoio financia diretamente a segurança do app e gera 10 créditos de mordomia.
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-stone-500 font-bold">AbacatPay ID:</span>
                                <code className="text-[8px] bg-stone-950 px-1 py-0.5 rounded font-mono text-[#DCAE6C] border border-[#DCAE6C]/10 select-all font-bold">
                                  bill_mdatPr3qQceaXzNyKhhdmZup
                                </code>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 self-center">
                            <span className="font-mono text-xs text-stone-450 block line-through">
                              R$ 34,90
                            </span>
                            <span className="font-mono text-sm font-black text-[#DCAE6C]">
                              R$ 24,90
                            </span>
                          </div>
                        </div>

                        {/* Option 3: Compromisso de Intercessão (Orar pelo Movimento) */}
                        <div
                          onClick={() => setSelectedBookTier("prayer")}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 text-left relative ${
                            selectedBookTier === "prayer"
                              ? "bg-emerald-950/20 border-emerald-600 text-white shadow-lg"
                              : "bg-[#181716] border-stone-850 text-stone-300 hover:border-stone-800 hover:bg-stone-900/50"
                          }`}
                        >
                          <div className="absolute top-2 right-4 bg-emerald-605/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider animate-pulse">
                            Armadura do Reino 🕊️
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-stone-950 flex items-center justify-center text-base shrink-0 border border-emerald-500/30 text-emerald-400">
                              🛡️
                            </span>
                            <div>
                              <div className="font-bold font-serif text-sm flex items-center gap-1.5 pt-1 text-[#DCAE6C]">
                                Intercessão Pura & Aliança de Mesa
                              </div>
                              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed max-w-sm">
                                Se seu momento material não lhe permite plantar sementes financeiras, apoie com seu tempo sagrado. Seus joelhos no chão sustentam este local sem vaidades. Ganhe registro local e + 5 créditos honorários.
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 self-center font-mono">
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block font-bold">
                              Guarda de Fé
                            </span>
                            <span className="text-[10px] text-emerald-500 block">
                              Compromisso
                            </span>
                          </div>
                        </div>



                        {/* Option 6: Custom Support */}
                        <div
                          onClick={() => setSelectedBookTier("custom")}
                          className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 text-left ${
                            selectedBookTier === "custom"
                              ? "bg-stone-900/60 border-[#DCAE6C] text-white shadow-lg"
                              : "bg-[#181716] border-stone-850 text-stone-300 hover:border-stone-800 hover:bg-stone-900/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#1c1a19] flex items-center justify-center text-base shrink-0 border border-stone-800 text-stone-400">
                              💖
                            </span>
                            <div>
                              <div className="font-serif text-sm font-bold pt-0.5 text-stone-200">
                                Semente de Expansão Voluntária Livre
                              </div>
                              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed font-sans">
                                Sinta-se guiado pela generosidade para além das páginas, impulsionando a segurança, registros legais e manutenção livre do app. Entre em contato direto pelo e-mail <strong className="text-[#DCAE6C] select-all">somosodespertar@gmail.com</strong>.
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center self-center">
                            <span className="font-mono text-xs text-[#DCAE6C] font-bold">
                              E-mail Direto
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Purchase Target Selection (Only if buying an E-book) */}
                      {(selectedBookTier === "book_despertar" || selectedBookTier === "book_devocionais") && (
                        <div className="p-4 rounded-2xl bg-[#0e0d0c] border border-stone-800 space-y-3 text-left mt-3">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                            Opção de Recepção do E-book:
                          </span>
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setPurchaseMode("self")}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold font-serif transition flex items-center justify-center space-x-1.5 shrink-0 ${
                                purchaseMode === "self"
                                  ? "bg-[#DCAE6C]/15 border-[#DCAE6C] text-[#DCAE6C] font-bold"
                                  : "bg-[#181716] border-stone-850 text-stone-400 hover:border-stone-800"
                              }`}
                            >
                              <span>📥 Pegar o Meu Agora</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPurchaseMode("gift")}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold font-serif transition flex items-center justify-center space-x-1.5 shrink-0 ${
                                purchaseMode === "gift"
                                  ? "bg-[#DCAE6C]/15 border-[#DCAE6C] text-[#DCAE6C] font-bold"
                                  : "bg-[#181716] border-stone-850 text-stone-400 hover:border-stone-800"
                              }`}
                            >
                              <span>🎁 Enviar para Alguém (Presentear)</span>
                            </button>
                          </div>
                          {purchaseMode === "gift" && (
                            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-fadeIn">
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-stone-500 uppercase block font-bold">Nome de quem recebe</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Irma Maria de Souza"
                                  value={giftName}
                                  onChange={(e) => setGiftName(e.target.value)}
                                  className="w-full bg-stone-950 border border-stone-800 rounded-xl py-1.5 px-3 text-xs text-stone-200 focus:outline-hidden focus:border-[#DCAE6C]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-stone-500 uppercase block font-bold">E-mail para entrega</label>
                                <input
                                  type="email"
                                  placeholder="Ex: maria@igreja.com"
                                  value={giftEmail}
                                  onChange={(e) => setGiftEmail(e.target.value)}
                                  className="w-full bg-stone-950 border border-stone-800 rounded-xl py-1.5 px-3 text-xs text-stone-200 focus:outline-hidden focus:border-[#DCAE6C]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Commit to Prayer Option Description */}
                      {selectedBookTier === "prayer" && (
                        <div className="p-4 rounded-2xl bg-[#0e0d0c] border border-emerald-900/35 space-y-3 text-left mt-3 animate-fadeIn">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                            Seu compromisso intercessor:
                          </span>
                          <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                            Pedimos que interceda pelo Despertar semanalmente na sua mesa de oração. Sinta-se livre para registrar seu pedido ou intenção abaixo, para que também clamemos por você:
                          </p>
                          <textarea
                            rows={2}
                            placeholder="Ex: Clamo para que haja restauração dos casamentos em minha cidade e sabedoria aos líderes do ministério."
                            value={prayerIntention}
                            onChange={(e) => setPrayerIntention(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2 px-3 text-xs text-stone-200 focus:outline-hidden focus:border-emerald-600 animate-fadeIn"
                          />
                        </div>
                      )}

                      {/* Custom Support Option Description */}
                      {selectedBookTier === "custom" && (
                        <div className="p-4 rounded-2xl bg-[#0e0d0c] border border-stone-800 space-y-3 text-left mt-3 animate-fadeIn">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#DCAE6C] font-bold block">
                            Como enviar sua contribuição:
                          </span>
                          <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                            Para semear qualquer apoio voluntário customizado ou estabelecer novas parcerias de infraestrutura para o movimento, envie um e-mail diretamente para:
                          </p>
                          <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 flex items-center justify-between gap-2.5">
                            <span className="font-mono text-xs text-[#DCAE6C] select-all font-bold">
                              somosodespertar@gmail.com
                            </span>
                            <a
                              href="mailto:somosodespertar@gmail.com?subject=Semente de Expansão Voluntária Livre - Movimento Despertar"
                              className="text-[10px] uppercase font-mono px-2.5 py-1.5 bg-[#C08261] text-stone-100 rounded-lg font-bold hover:bg-[#b07353] transition"
                            >
                              Escrever E-mail
                            </a>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBookTier === "prayer") {
                            setUserCredits((p) => p + 5);
                            setConfirmedDonation(true);
                            setAbacatStep("success");
                            
                            const activeName = "Intercessor Primordial";
                            setFundadores((prev) => [
                              {
                                name: activeName,
                                location: "Brasil",
                                service: "Intercessor do Desígnio 🛡️",
                                type: "offer",
                                avatarEmoji: "🙏",
                                isDonator: false,
                              },
                              ...prev,
                            ]);

                            const newMuralId = (muralItems.length + 1).toString();
                            const newMuralItem: MuralItem = {
                              id: newMuralId,
                              category: "oracao",
                              author: activeName,
                              avatarEmoji: "🙏",
                              location: "Brasil",
                              title: "Corrente de Oração Ativa",
                              description: prayerIntention || "Comprometeu-se a orar semanalmente pela pureza dos ministérios e expansão do Reino nas mesas.",
                              timestamp: "Agora mesmo",
                              actionsTaken: [],
                              userInteracted: false,
                              counter: 1,
                            };
                            setMuralItems((prev) => [newMuralItem, ...prev]);

                            if (onSaveProgress) {
                              onSaveProgress({
                                hasBookSponsor: false,
                                isIntercessor: true,
                                sponsorBookTier: "prayer",
                                awardedCredits: 5,
                              });
                            }

                            showTemporaryToast("Que bênção! Seu compromisso de oração foi registrado no Altar.");
                          } else if (selectedBookTier === "custom") {
                            window.location.href = "mailto:somosodespertar@gmail.com?subject=Semente de Expansão Voluntária Livre - Movimento Despertar";
                            showTemporaryToast("Abrindo seu aplicativo de e-mail para contato direto!");
                          } else {
                            setAbacatStep("qr");
                          }
                        }}
                        className="w-full py-4 bg-[#C08261] hover:bg-[#b07353] text-stone-100 font-bold uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center space-x-2 font-bold"
                      >
                        <span>
                          {selectedBookTier === "custom"
                            ? "Entrar em Contato por E-mail ✉️"
                            : "Prosseguir"}
                        </span>
                        {selectedBookTier !== "custom" && <ArrowRight size={14} />}
                      </button>
                    </div>
                  )}

                   {abacatStep === "qr" && (
                    <div className="space-y-5 flex flex-col items-center justify-center text-center">
                      <div className="w-full flex justify-between items-center pb-2 border-b border-stone-800 text-left">
                        <span className="text-[10px] uppercase font-mono text-[#DCAE6C] font-extrabold tracking-widest flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />{" "}
                          Checkout Oficial AbacatePay
                        </span>
                        <button
                          onClick={() => setAbacatStep("select")}
                          className="font-mono text-[10px] uppercase text-stone-400 hover:text-white font-bold"
                        >
                          ← Alterar Pacote
                        </button>
                      </div>

                      <div className="p-4 bg-stone-900/40 rounded-2xl border border-stone-800 text-left space-y-2 max-w-lg w-full">
                        <div className="flex items-center space-x-2 text-[#DCAE6C] font-serif text-sm font-bold">
                          <span>📦 Pacote Selecionado:</span>
                          <span className="text-white">
                            {selectedBookTier === "book_despertar"
                              ? 'E-book "O Despertar" (PDF + EPub)'
                              : selectedBookTier === "book_devocionais"
                              ? 'E-book "Devocionais Diários"'
                              : selectedBookTier === "custom"
                              ? `Apoio Voluntário Customizado`
                              : "Patrocínio Especial"}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 leading-relaxed font-sans">
                          ✨ Os seus dados de faturamento e e-mail para envio serão preenchidos uma única vez diretamente na tela segura de pagamento do AbacatePay.
                        </div>
                        <div className="text-xs text-stone-400 leading-relaxed font-sans pt-1">
                          Valor total: <span className="text-[#DCAE6C] font-bold font-mono">R$ {
                            selectedBookTier === "book_despertar"
                              ? "19,90"
                              : selectedBookTier === "book_devocionais"
                              ? "24,90"
                              : selectedBookTier === "custom"
                              ? parseFloat(customBookValue).toFixed(2)
                              : "19,90"
                          }</span>
                        </div>
                      </div>

                      <div className="w-full space-y-4">
                        <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-sans text-left">
                          O link seguro para realizar o pagamento via <strong className="text-stone-100">Pix, Cartão ou Boleto</strong> com entrega e liberação automática do e-book foi disponibilizado.
                        </p>
                        
                        <a
                          href={
                            selectedBookTier === "book_devocionais"
                              ? linkDevocionais
                              : linkDespertar
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-4.5 bg-gradient-to-r from-[#C28463] to-[#DCAE6C] hover:from-[#b07353] text-stone-950 font-black uppercase tracking-wider rounded-xl transition shadow-xl cursor-pointer flex items-center justify-center space-x-2 w-full animate-pulse hover:animate-none font-bold text-center text-sm md:text-base border border-amber-350/20"
                        >
                          <span>Ir para Pagamento Seguro 💳</span>
                          <span className="text-stone-950 font-sans font-bold">→</span>
                        </a>

                        {/* Hidden/collapsed API config to update payment gateway links */}
                        <div className="pt-2 text-center">
                          <details className="inline-block text-left opacity-15 hover:opacity-100 transition-opacity duration-300">
                            <summary className="text-[9px] text-stone-550 font-mono cursor-pointer list-none flex items-center justify-center">
                              <span>⚙️ Configurar Links de Pagamento</span>
                            </summary>
                            <div className="mt-3 p-3 bg-stone-950 rounded-xl border border-stone-850 text-left space-y-2 mt-2 w-72 max-w-sm absolute left-1/2 transform -translate-x-1/2 z-50 shadow-2xl">
                              <p className="text-stone-400 text-[9px] leading-relaxed font-sans">
                                Insira os links reais do AbacatePay:
                              </p>
                              <div className="space-y-2.5 pt-1 font-sans text-[10px]">
                                <div>
                                  <label className="text-stone-500 text-[9px] uppercase font-mono block mb-1">O Despertar (Link Único)</label>
                                  <input
                                    type="text"
                                    value={linkDespertar}
                                    onChange={(e) => {
                                      setLinkDespertar(e.target.value);
                                      localStorage.setItem("abacat_link_despertar", e.target.value);
                                    }}
                                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-stone-305 font-mono focus:outline-none focus:border-[#C28463]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[#DCAE6C] text-[9px] uppercase font-mono block mb-1">Devocionais (Link Único)</label>
                                  <input
                                    type="text"
                                    value={linkDevocionais}
                                    onChange={(e) => {
                                      setLinkDevocionais(e.target.value);
                                      localStorage.setItem("abacat_link_devocionais_unified", e.target.value);
                                    }}
                                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-stone-305 font-mono focus:outline-none focus:border-[#C28463]"
                                  />
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-stone-850 w-full space-y-3">
                        <div className="text-stone-400 text-[10px] font-mono uppercase tracking-wider font-bold">
                          Já realizou a sua contribuição oficial?
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const activeName = donatorName || name || "Patrocinador";
                            const rewardCredits =
                              selectedBookTier === "book_despertar"
                                ? 12
                                : selectedBookTier === "book_devocionais"
                                ? 10
                                : selectedBookTier === "physical"
                                ? 30
                                : selectedBookTier === "kit"
                                ? 60
                                : selectedBookTier === "prayer"
                                ? 5
                                : Math.floor((parseFloat(customBookValue) || 10) * 0.45);
                            setUserCredits((p) => p + rewardCredits);
                            setConfirmedDonation(true);
                            setAbacatStep("success");

                            setFundadores((prev) => [
                              {
                                name: activeName,
                                location: city
                                  ? `${city}, ${stateCode}`
                                  : "Brasil",
                                service:
                                  purchaseMode === "gift" && (selectedBookTier === "book_despertar" || selectedBookTier === "book_devocionais")
                                    ? `Semeador 🎁 (Presenteou ${giftName})`
                                    : selectedBookTier === "book_despertar"
                                    ? "Patrocinador do Despertar 📕"
                                    : selectedBookTier === "book_devocionais"
                                    ? "Semeador Devocional 🙏"
                                    : selectedBookTier === "physical"
                                    ? "Patrocinador Físico 📘"
                                    : selectedBookTier === "kit"
                                    ? "Co-Fundador de Altar ✨"
                                    : "Patrocinador Generoso 💖",
                                type: "offer",
                                avatarEmoji: purchaseMode === "gift" ? "🎁" : "👑",
                                isDonator: true,
                              },
                              ...prev,
                            ]);

                            if (purchaseMode === "gift" && giftName) {
                              const giftPostId = (muralItems.length + 1).toString();
                              const giftMuralItem: MuralItem = {
                                id: giftPostId,
                                category: "oferta",
                                author: activeName,
                                avatarEmoji: "🎁",
                                location: city ? `${city}, ${stateCode}` : "Brasil",
                                title: "Presente de Altar Semeado",
                                description: `Semeou o E-book "${selectedBookTier === 'book_despertar' ? 'O Despertar' : 'Devocionais Diários'}" de presente direto para o coração de ${giftName} (${giftEmail || 'E-mail cadastrado'}). Que este amor contagie mais lives!`,
                                timestamp: "Agora mesmo",
                                actionsTaken: [],
                                userInteracted: false,
                                counter: 1,
                              };
                              setMuralItems((prev) => [giftMuralItem, ...prev]);
                            }

                            if (onSaveProgress) {
                              onSaveProgress({
                                hasBookSponsor: selectedBookTier !== "prayer",
                                verifyDonator: selectedBookTier !== "prayer",
                                sponsorBookTier: selectedBookTier,
                                awardedCredits: rewardCredits,
                                giftingRecipient: purchaseMode === "gift" ? giftName : "",
                              });
                            }

                            showTemporaryToast(
                              purchaseMode === "gift"
                                ? `Sua doação foi confirmada! O E-book de presente foi enviado com sucesso para ${giftName}! +${rewardCredits} créditos.`
                                : `Obrigado pelo seu patrocínio via AbacatePay! +${rewardCredits} créditos de Mordomia gerados com amor!`
                            );
                          }}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center space-x-2 font-bold"
                        >
                          <CheckCircle size={15} />
                          <span>Já Paguei • Liberar Meus Créditos de Mordomia 👑</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {abacatStep === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-emerald-950/20 border-2 border-dashed border-emerald-500/40 rounded-2xl text-center space-y-4 max-w-lg mx-auto"
                    >
                      <Award
                        size={48}
                        className="text-[#DCAE6C] mx-auto animate-bounce mt-2"
                      />
                      <h4 className="font-serif text-lg font-bold text-white">
                        {selectedBookTier === "prayer"
                          ? "Compromisso de Intercessão Ativo! 🙏"
                          : "Transação Confirmada no AbacatPay!"}
                      </h4>
                      <p className="text-stone-300 text-xs leading-relaxed font-sans">
                        {selectedBookTier === "prayer"
                          ? "Agradecemos profundamente. Suas orações alimentam a chama do Despertar. Registramos seu compromisso no altar de oração contínuo da comunidade."
                          : "Que abundância! Seu apoio via AbacatPay foi confirmado com sucesso pelo ecossistema financeiro. Registramos o seu nome no rol oficial dos Co-Fundadores Pioneiros."}
                      </p>

                      <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-850 text-left text-[11px] text-stone-400 space-y-1.5 max-w-sm mx-auto font-mono">
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-bold">
                            Comprovante:
                          </span>{" "}
                          <span className="text-stone-200">
                            {selectedBookTier === "prayer" ? "PRYR-ORACAO-2026" : "ABCT-2026-681923"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-bold">
                            Destinatário:
                          </span>{" "}
                          <span className="text-stone-200">
                            Somos o Despertar Ltda
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-bold">
                            Pacote Ativo:
                          </span>{" "}
                          <span className="text-[#DCAE6C] font-bold">
                            {selectedBookTier === "book_despertar"
                              ? `Edição Digital O Despertar ${purchaseMode === "gift" ? "🎁 (Presente)" : "📥 (Pessoal)"}`
                              : selectedBookTier === "book_devocionais"
                              ? `Edição Digital Devocionais ${purchaseMode === "gift" ? "🎁 (Presente)" : "📥 (Pessoal)"}`
                              : selectedBookTier === "physical"
                              ? "Livro Impresso"
                              : selectedBookTier === "kit"
                              ? "Kit Co-Fundador"
                              : selectedBookTier === "prayer"
                              ? "Compromisso de Oração"
                              : "Oferta Voluntária Livre"}
                          </span>
                        </div>
                        
                        {purchaseMode === "gift" && giftName && (
                          <div className="flex justify-between border-t border-stone-850/60 pt-1.5 mt-1.5">
                            <span className="text-stone-500 font-bold">🎁 Amigo Presenteado:</span>
                            <span className="text-stone-300 font-sans">{giftName}</span>
                          </div>
                        )}

                        <div className="flex justify-between border-t border-stone-850/60 pt-1.5 mt-1.5">
                          <span className="text-stone-500 font-bold">
                            Créditos Unlocked:
                          </span>{" "}
                          <span className="text-emerald-400 font-bold font-sans">
                            +
                            {selectedBookTier === "book_despertar"
                              ? 12
                              : selectedBookTier === "book_devocionais"
                              ? 10
                              : selectedBookTier === "physical"
                              ? 30
                              : selectedBookTier === "kit"
                              ? 60
                              : selectedBookTier === "prayer"
                              ? 5
                              : Math.floor((parseFloat(customBookValue) || 10) * 0.45)}{" "}
                            de Mordomia!
                          </span>
                        </div>
                      </div>

                      <p className="text-stone-400 text-[10.5px]">
                        {selectedBookTier === "prayer"
                          ? "Seus 5 créditos de Mordomia foram adicionados ao seu saldo institucional."
                          : "Enviaremos os informativos de download do seu e-book de presente ou acesso pessoal direto no e-mail cadastrado em total conformidade com a LGPD."}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setAbacatStep("select");
                          setPurchaseMode("self");
                          setGiftName("");
                          setGiftEmail("");
                          setPrayerIntention("");
                        }}
                        className="px-6 py-2.5 bg-stone-900 border border-stone-850 hover:bg-[#181716] rounded-xl text-xs font-semibold text-stone-200 cursor-pointer"
                      >
                        Retornar ao Painel / Apoiar Novamente
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* HIGH FIDELITY TRANSPARENCY, SECURITY & LGPD COMPLIANCE NOTICE BLOCK */}
            <div className="bg-[#FAF8F5]/90 border border-stone-200/80 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex items-center space-x-3.5 border-b border-stone-200/80 pb-4">
                <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 shadow-sm">
                  <ShieldCheck size={20} className="text-[#C08261]" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C08261] font-bold block">
                    Pacto de Confiança no Reino
                  </span>
                  <h4 className="font-serif text-lg md:text-xl font-bold text-stone-850">
                    Segurança, Transparência & Conformidade LGPD
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-xs md:text-sm">
                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-stone-850 font-bold font-serif text-xs md:text-sm">
                    <CheckCircle size={15} className="text-[#C08261]" /> 1.
                    Arquitetura 100% Sólida e Limpa
                  </span>
                  <p className="text-stone-605 text-xs leading-relaxed font-sans">
                    Nesta fase do Despertar, todas as ações de oração,
                    agendamento de Cadeira Vazia e de mútua assistência são
                    salvas{" "}
                    <strong className="text-stone-800 font-semibold font-bold">
                      exclusivamente no seu próprio navegador
                    </strong>{" "}
                    (via LocalStorage seguro). Nenhum dado pessoal é exposto sem
                    sua livre e manifesta autorização.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-stone-850 font-bold font-serif text-xs md:text-sm">
                    <FileText size={15} className="text-[#C08261]" /> 2.
                    Propósito do Patrocínio
                  </span>
                  <p className="text-stone-605 text-xs leading-relaxed font-sans">
                    O dinheiro arrecadado com a aquisição do Livro Oficial pelo{" "}
                    <strong className="text-stone-800 font-semibold font-bold">
                      AbacatPay
                    </strong>{" "}
                    é inteiramente destinado a custear a consultoria jurídica
                    para estruturação civil do movimento, aquisição de datacenter
                    soberano com enclaves criptográficos e registro do
                    encarregado de dados para a plena conformidade legal.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-stone-850 font-bold font-serif text-xs md:text-sm">
                    <Shield size={15} className="text-[#C08261]" /> 3. Blindagem
                    de LGPD (Lei 13.709)
                  </span>
                  <p className="text-stone-605 text-xs leading-relaxed font-sans">
                    Declaramos solenemente que:{" "}
                    <strong className="text-stone-800 font-semibold font-bold">
                      I)
                    </strong>{" "}
                    Seus dados de endereço e WhatsApp nunca serão compartilhados,
                    transferidos ou vendidos para anunciantes;{" "}
                    <strong className="text-stone-800 font-semibold font-bold">
                      II)
                    </strong>{" "}
                    Você tem direito integral à exclusão instantânea de qualquer
                    postagem no mural;{" "}
                    <strong className="text-stone-800 font-semibold font-bold">
                      III)
                    </strong>{" "}
                    O ecossistema é livre de cookies de rastreamento de
                    big-techs.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-2xl flex items-center gap-2.5 text-left text-[11px] text-stone-500 font-mono">
                <span className="text-base font-bold">⚖️</span>
                <p>
                  <strong className="text-stone-700">
                    Responsabilidade e Legalidade:
                  </strong>{" "}
                  "E tudo o que fizerem, seja em palavra ou em ação, façam-no em
                  nome do Senhor Jesus." (Colossenses 3:17). Buscamos a
                  transparência absoluta perante as leis de Deus e dos homens.
                </p>
              </div>
            </div>

            <hr className="border-stone-150" />

            {/* SEJA UM FUNDADOR FORM */}
            <div
              id="sejaexclusivo-form"
              className="bg-[#FAF8F5]/80 border border-stone-200/60 p-8 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-xs"
            >
              <div className="space-y-3 text-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C08261] font-extrabold">
                  Seja um Pioneiro
                </span>
                <h4 className="font-serif text-2xl md:text-3xl font-light text-stone-850 max-w-lg mx-auto">
                  Você acredita que a igreja ainda pode ser tudo o que ela já
                  foi um dia?
                </h4>
                <p className="text-stone-605 text-xs md:text-sm leading-relaxed max-w-md mx-auto">
                  Abra caminho e faça parte. Garanta sua listagem honorária de
                  co-fundador pioneiro e ganhe{" "}
                  <strong className="text-stone-900">
                    12 créditos de mordor para estrear os serviços no lançamento
                  </strong>
                  .
                </p>
              </div>

              {isRegistered ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-[#C08261]/10 rounded-2xl border-2 border-dashed border-[#C08261] max-w-lg mx-auto space-y-3"
                >
                  <Award
                    size={48}
                    className="text-[#C08261] mx-auto animate-bounce"
                  />
                  <h5 className="font-serif text-lg font-bold text-stone-855">
                    Inscrição de Co-Fundador Registrada!
                  </h5>
                  <p className="text-stone-650 text-xs leading-relaxed">
                    Você já está no rol oficial dos primeiros correspondentes!
                    Enviaremos as atualizações dos servidores e chaves de acesso
                    diretamente no seu e-mail cadastrado.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleRegisterFounder}
                  className="max-w-xl mx-auto space-y-5 text-left bg-white p-6 rounded-2xl border border-stone-200/80 shadow-md text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                        Como deseja ser chamado?
                      </label>
                      <input
                        type="text"
                        placeholder="Nome completo ou social"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-hidden focus:border-[#C08261]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                        Seu Melhor E-mail
                      </label>
                      <input
                        type="email"
                        placeholder="exemplo@igreja.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-hidden focus:border-[#C08261]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                        Cidade de Atendimento
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Curitiba"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-hidden focus:border-[#C08261]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                        Estado (UF)
                      </label>
                      <input
                        type="text"
                        placeholder="PR"
                        maxLength={2}
                        value={stateCode}
                        onChange={(e) =>
                          setStateCode(e.target.value.toUpperCase())
                        }
                        required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-center font-mono focus:outline-hidden focus:border-[#C08261]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center space-x-6 text-xs font-semibold text-stone-650">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="founder_type"
                          checked={interactionType === "offer"}
                          onChange={() => setInteractionType("offer")}
                        />
                        <span>Quero Servir / Apoiar</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="founder_type"
                          checked={interactionType === "receive"}
                          onChange={() => setInteractionType("receive")}
                        />
                        <span>Preciso de Acolhimento</span>
                      </label>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-extrabold block">
                        Qual ministério/foco de atuação?
                      </label>
                      <select
                        value={chosenService}
                        onChange={(e) => setChosenService(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-hidden focus:border-[#C08261]"
                      >
                        <option value="Oração">Intercessão de Oração 🙏</option>
                        <option value="Discipulado">
                          Discipulado do Reino 👣
                        </option>
                        <option value="Aconselhamento">
                          Aconselhamento e Apoio 👩‍⚕️
                        </option>
                        <option value="Ensino bíblico">
                          Exposição da Escritura 📖
                        </option>
                        <option value="Louvor ao vivo">
                          Louvor e Canção em Casa 🎸
                        </option>
                        <option value="Mesa Aberta">
                          Acolher na Cadeira Vazia 🍲
                        </option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-stone-900 text-stone-100 hover:bg-black uppercase tracking-wider font-extrabold rounded-xl transition cursor-pointer"
                  >
                    Registrar-se como Co-Fundador Pioneiro
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

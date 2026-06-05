import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import bookCoverImg from "../assets/images/book_cover_kit.png";
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
  const [activeTab, setActiveTab] = useState<"comunhao" | "chamado" | "cocriacao" | "livros">(
    "comunhao"
  );

  // States for New Power vs Old Power Quiz & Co-creation
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

  // User Credits State
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

    // Initialize co-created centelhas
    const savedCentelhas = localStorage.getItem("despertar_cocreated_centelhas");
    if (savedCentelhas) {
      try {
        setCentelhas(JSON.parse(savedCentelhas));
      } catch (e) {
        // use default
      }
    } else {
      const initialCentelhas = [
        {
          id: "c1",
          author: "Priscila Alencar",
          location: "Fortaleza, CE",
          prompt: "Qual foi a batalha que ninguém viu você vencer?",
          content: "Silenciar o choro na cozinha para que meus filhos não se assustassem, e dobrar os joelhos no azulejo gelado. Senti uma mão quente no meu ombro dizendo: 'Eu estou cuidando de tudo'. E desde então, sei que não estou sozinha.",
          votes: 78,
          voted: false
        },
        {
          id: "c2",
          author: "Thiago Mendes",
          location: "Niterói, RJ",
          prompt: "Ninguém deveria enfrentar seus dias sozinho. O que você diria para alguém hoje?",
          content: "Você não está atrasado. Você está sendo preparado. O deserto não é o fim da sua história; é onde o poço de água viva é cavado no seu interior. A mesa da Presença do Pai está com o café quente te esperando a cada manhã.",
          votes: 54,
          voted: false
        },
        {
          id: "c3",
          author: "Débora Santos",
          location: "Goiânia, GO",
          prompt: "Em qual momento desta semana você sentiu o sopro da graça?",
          content: "Quando eu ia apagar o aplicativo e desistir da minha constância de oração. Uma notificação me lembrou de respirar fundo no Altar de quietude por 4 segundos. Aquele respiro mudou meu dia e me trouxe de volta ao aconchego.",
          votes: 91,
          voted: false
        }
      ];
      setCentelhas(initialCentelhas);
      localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(initialCentelhas));
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

  // Co-creation actions (New Power)
  const handlePublishCentelha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCentelhaContent.trim()) {
      showTemporaryToast("Por favor, derrame a sua palavra ou resposta antes de enviar.");
      return;
    }

    const authorToUse = newCentelhaAuthor.trim() || userProfile?.name || "Um Peregrino Sincero";
    const locationToUse = newCentelhaLocation.trim() || userProfile?.city || "Brasil";

    const newCent: {
      id: string;
      author: string;
      location: string;
      prompt: string;
      content: string;
      votes: number;
      voted?: boolean;
    } = {
      id: "cent_" + Date.now().toString(),
      author: authorToUse,
      location: locationToUse,
      prompt: selectedPrompt,
      content: newCentelhaContent.trim(),
      votes: 1, // Start with their own vote
      voted: true
    };

    const updated = [newCent, ...centelhas];
    setCentelhas(updated);
    localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(updated));

    // Reward active participation (New Power mechanism: circulation of credits)
    const nextCredits = userCredits + 5;
    setUserCredits(nextCredits);
    localStorage.setItem("despertar_user_credits", nextCredits.toString());

    setNewCentelhaContent("");
    setNewCentelhaAuthor("");
    setNewCentelhaLocation("");
    showTemporaryToast("Chama acesa! Sua resposta brilha na mesa de Co-Criação e você ganhou +5 créditos! 🕯️🔥");
  };

  const handleVoteCentelha = (id: string) => {
    if (hasVotedPost[id]) {
      showTemporaryToast("Você já somou sua fé a esta resposta.");
      return;
    }

    const updated = centelhas.map(c => {
      if (c.id === id) {
        return { ...c, votes: c.votes + 1, voted: true };
      }
      return c;
    });

    setCentelhas(updated);
    localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(updated));
    setHasVotedPost(prev => ({ ...prev, [id]: true }));

    // Circulate power: reward voter
    const nextCredits = userCredits + 1;
    setUserCredits(nextCredits);
    localStorage.setItem("despertar_user_credits", nextCredits.toString());

    showTemporaryToast("Você concordou em oração! +1 de Crédito de Mordomia! 🙏");
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
      className="space-y-12 py-6 max-w-4xl mx-auto px-5 md:px-8"
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
      <div className="tabs-scroll-wrapper">
        <div className="tabs-scroll flex border-b border-stone-200 gap-6">
          <button
            id="tab-mural-comunhao"
            onClick={() => setActiveTab("comunhao")}
            className={`pb-4 text-sm font-semibold tracking-wide transition relative flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
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
            className={`pb-4 text-sm font-semibold tracking-wide transition relative flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "chamado"
                ? "text-stone-900 border-b-2 border-[#C08261]"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <FileText size={15} className="text-[#C08261]" />
            <span>📖 Livros & Apoio</span>
            <span className="text-[10px] bg-[#C08261] text-stone-100 px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
              Apoiar
            </span>
          </button>

          <button
            id="tab-cocriacao-pioneira"
            onClick={() => setActiveTab("cocriacao")}
            className={`pb-4 text-sm font-semibold tracking-wide transition relative flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "cocriacao"
                ? "text-stone-900 border-b-2 border-[#C08261]"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Sparkles size={15} className="text-amber-500 animate-pulse" />
            <span>💡 Centelhas Co-Criadas</span>
            <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
              Fé Ativa
            </span>
          </button>
        </div>
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
            {/* Painel do Sacerdócio Universal: O Chamado Primitivo */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-mono uppercase bg-[#C08261]/10 text-[#C08261] px-2.5 py-1 rounded-full font-bold inline-block">
                  ⚡ O Ministério Primitivo
                </span>
                <h3 className="font-serif text-xl md:text-3xl font-light text-stone-850 tracking-tight leading-tight">
                  Sacerdócio de Todos: Do Ouvinte Passivo para a Comunidade de Mesa
                </h3>
                <p className="text-stone-600 font-medium font-serif text-[17px] md:text-[18px] leading-[1.85] max-w-2xl">
                  O verdadeiro avivamento na história da Igreja não acontece por templos centralizados, mas pelo mover do Espírito Santo operando em cada coração sincero. A pergunta central da Igreja de Atos é: <strong className="text-stone-850 hover:text-[#C08261] transition font-semibold">"Desejamos apenas ser espectadores na casa de Deus ou parte integrante do Seu Corpo vivo?"</strong>
                </p>
              </div>

              {/* Comparative Matrix (Religiosidade Passiva vs Sacerdócio Vivo) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* VELHO PODER CARD -> RELIGIOSIDADE PASSIVA */}
                <div className="bg-white border text-stone-700 border-stone-200/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-stone-400 font-mono text-[10px] uppercase tracking-wider font-extrabold">
                      <span>🏦 A Religiosidade de Consumo</span>
                      <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">Ritos de Palco</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-stone-850">Estruturas Centralizadas</h4>
                    <ul className="space-y-2 text-xs text-stone-500 list-disc list-inside">
                      <li><strong>Ação concentrada:</strong> O sacerdócio e o serviço concentram-se em poucos nomes influentes ou profissionais da fé.</li>
                      <li><strong>Espectadores da graça:</strong> A liturgia convida à passividade – as pessoas assistem ao invés de viverem em comunhão.</li>
                      <li><strong>Paredes e templos isolados:</strong> Forte barreira de convívio fora do dia do culto; a fé se encerra no cronograma semanal.</li>
                      <li className="list-none text-stone-400 italic py-1 border-t border-stone-100 mt-2">Foco: Programações pesadas e estéreis de consumo espiritual.</li>
                    </ul>
                  </div>
                  <div className="text-[10.5px] font-medium text-stone-450 mt-4 font-mono uppercase border-l-2 border-stone-300 pl-2">
                    O povo apenas obedece, assiste e consome.
                  </div>
                </div>

                {/* NOVO PODER CARD -> SACERDÓCIO VIVO & DISTRIBUÍDO */}
                <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-stone-100 border border-[#C08261]/25 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  {/* Glowing light effect inside */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-[#C08261]/15 to-transparent pointer-events-none rounded-full blur-3xl -mr-8 -mt-8 opacity-80" />
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center space-x-2 text-[#DCAE6C] font-mono text-[10px] uppercase tracking-wider font-extrabold">
                      <span>🔥 O Sacerdócio Vivo</span>
                      <span className="bg-[#C08261]/25 text-[#DCAE6C] px-1.5 py-0.5 rounded font-bold">Como Fogo Pentecostal</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#DCAE6C]">O Movimento de Mesa</h4>
                    <ul className="space-y-2 text-xs text-stone-300 list-disc list-inside">
                      <li><strong>Dádiva que circula:</strong> O sacerdócio pertence a todos os crentes. Flui de lar em lar, de mesa em mesa diariamente.</li>
                      <li><strong>Participação ativa:</strong> Co-criação de pão, de testemunhos, orações sinceras e acolhimento mútuo.</li>
                      <li><strong>Comunidade orgânica:</strong> Qualquer discípulo pode iniciar uma mesa nos lares e espalhar a chama da Revelação.</li>
                      <li className="list-none text-stone-400 italic py-1 border-t border-[#C59B63]/20 mt-2">Exemplos: A Igreja Primitiva do livro de Atos e redes orgânicas de compaixão.</li>
                    </ul>
                  </div>
                  <div className="text-[10.5px] font-medium text-[#DCAE6C] mt-4 font-mono uppercase border-l-2 border-[#C08261] pl-2 relative z-10">
                    Quanto mais gente participa, mais forte brilha a mesa.
                  </div>
                </div>
              </div>

              {/* Pilgrim Mindset Test (Interactive Quiz) */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-5 md:p-6 text-left space-y-4">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">🕯️</span>
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-stone-400 font-extrabold">Teste de Consciência Primitiva</span>
                    <h4 className="font-serif text-sm md:text-base font-medium text-stone-850">
                      Como você deseja canalizar a luz de Deus em seu cotidiano?
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswer("old");
                      showTemporaryToast("Interessante... Mas lembre-se: discípulos passivos esvaziam a efervescência da Igreja primitiva!");
                    }}
                    className={`p-3 border rounded-xl text-left cursor-pointer transition ${
                      quizAnswer === "old"
                        ? "border-amber-300 bg-amber-50/20 text-stone-800 font-medium"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-600"
                    }`}
                  >
                    <span className="text-xs font-serif block font-bold mb-1">⛪ Consumidor da fé</span>
                    <span className="text-[10px] leading-relaxed block text-stone-500">
                      Entrar passivamente nos templos murados, ouvir uma boa mensagem e delegar a obra espiritual para que outros gerenciem.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswer("new");
                      // Reward them with user credits for discovering!
                      if (quizAnswer !== "new") {
                        const nextCredits = userCredits + 10;
                        setUserCredits(nextCredits);
                        localStorage.setItem("despertar_user_credits", nextCredits.toString());
                      }
                      showTemporaryToast("Excelente! Você escolheu o Sacerdócio Vivo! +10 Créditos de Mordomia! ⚡🔥");
                    }}
                    className={`p-3 border rounded-xl text-left cursor-pointer transition ${
                      quizAnswer === "new"
                        ? "border-emerald-300 bg-emerald-50/30 text-stone-850 font-medium"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-600"
                    }`}
                  >
                    <span className="text-xs font-serif block font-bold text-stone-850 mb-1 flex items-center gap-1">
                      <span>🔥 Condutor do Despertar</span>
                      {quizAnswer === "new" && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Ativo</span>}
                    </span>
                    <span className="text-[10px] leading-relaxed block text-stone-500">
                      Sacerdócio de todos os crentes. Abrir a mesa de casa, co-criar o socorro e espalhar mensagens vivas sem depender de palcos intermediários.
                    </span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {quizAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-4 rounded-xl text-xs font-sans border bg-stone-50 border-stone-150 text-stone-700 leading-relaxed"
                    >
                      {quizAnswer === "old" ? (
                        <p>
                          <strong>Reflexão para o Caminho:</strong> A passividade silenciosa limita os frutos do Reino de Deus — ela centraliza a ação litúrgica em poucas mãos profissionais e faz com que os santos se sintam apenas espectadores secundários. Mas Deus deseja reviver o sacerdócio ativo e real em cada um de nós! Que tal reacender sua mesa e partilhar a revelação no Secreto de forma dócil e ativa?
                        </p>
                      ) : (
                        <p>
                          <strong>Você ativou o Sacerdócio Universal de Atos!</strong> Exatamente! No princípio, a Igreja primitiva dependia do fluxo contínuo de afeto e testemunho que vertia das mesas habitadas (Atos 4:32). Nenhum membro guardava para si os recursos carismáticos ou espirituais; todos os faziam circular. Você acaba de receber mais <strong>+10 créditos virtuais de mordomia</strong> para espalhar gratidão, socorrer necessitados ou semear graça no painel abaixo!
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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

                      <p className="text-stone-700 font-serif text-[17px] leading-[1.85] block">
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
                Inspirado na teologia da mesa do Despertar, a "Cadeira Vazia" é um convite constante:{" "}
                <em className="text-stone-850 font-serif">
                  "Na sua mesa, há sempre uma cadeira vazia para um irmão que ainda não tem grupo local."
                </em>{" "}
                Faça do seu lar um tabernáculo físico de graça.
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CO-CREATION OF CENTELHAS (Sacerdócio Universal / Atos 4) */}
        {activeTab === "cocriacao" && (
          <motion.div
            key="cocriacao-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 text-left"
          >
            {/* Call to action & concept block */}
            <div className="bg-[#C08261]/5 border border-[#C08261]/15 p-6 rounded-3xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#C08261]/10 flex items-center justify-center text-2xl shrink-0 select-none">
                  💡
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-stone-850">
                    Mesa de Semeação: Frutos de Edificação e Testemunho
                  </h3>
                  <p className="text-stone-700 font-serif text-[17px] md:text-[18px] leading-[1.85]">
                    Na religiosidade centralizada e passiva, apenas os grandes púlpitos determinam a vivência prática, restando para nós apenas assistir. Mas aqui no <strong>Despertar</strong>, o Espírito e a fé de Atos fluem de coração em coração através de mesas de comunhão. Você é parte ativa da edificação mútua do Corpo! Escolha uma das perguntas profundas abaixo, partilhe sua história real de forma sincera e faça com que a sua centelha de graça console, edifique e acenda outros corações.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs pt-1">
                <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">
                  🔥 +5 Créditos por Semeação
                </span>
                <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">
                  ❤️ +1 Crédito por Concordar
                </span>
                <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">
                  📱 Livre Compartilhamento
                </span>
              </div>
            </div>

            {/* Main Interactive Form section */}
            <div className="bg-white border border-stone-200 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form Side */}
              <div className="lg:col-span-3 space-y-5">
                <h4 className="font-serif font-bold text-stone-850 text-base border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Derrame Sua Centelha na Mesa</span>
                </h4>

                <form onSubmit={handlePublishCentelha} className="space-y-4">
                  {/* Select interactive question prompt */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                      Selecione a Pergunta do Dia
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        "Qual foi a batalha que ninguém viu você vencer?",
                        "Ninguém deveria enfrentar seus dias sozinho. O que você diria para alguém hoje?",
                        "Em qual momento desta semana você sentiu o sopro da graça?",
                      ].map((promptText) => (
                        <button
                          key={promptText}
                          type="button"
                          onClick={() => setSelectedPrompt(promptText)}
                          className={`p-3 border rounded-xl text-left cursor-pointer text-xs transition ${
                            selectedPrompt === promptText
                              ? "border-[#C08261] bg-[#C08261]/5 text-stone-850 font-medium"
                              : "border-stone-150 bg-stone-50/50 text-stone-500 hover:bg-stone-50"
                          }`}
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message body input */}
                  <div className="space-y-1.1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                      Sua Resposta Sincera (Faça vibrar a alma de quem lê) *
                    </label>
                    <textarea
                      rows={4}
                      value={newCentelhaContent}
                      onChange={(e) => setNewCentelhaContent(e.target.value)}
                      placeholder="Derrame sua inspiração aqui, em poucas frases sinceras..."
                      maxLength={320}
                      className="w-full bg-stone-50/75 border border-stone-200 rounded-2xl p-4 text-xs md:text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition"
                    />
                    <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1 font-mono">
                      <span>* Máximo de 320 caracteres para caber com elegância nos cards.</span>
                      <span>{newCentelhaContent.length}/320</span>
                    </div>
                  </div>

                  {/* Profile parameters (Frictionless / Fast) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                        Assinar como (Nome)
                      </label>
                      <input
                        type="text"
                        value={newCentelhaAuthor}
                        onChange={(e) => setNewCentelhaAuthor(e.target.value)}
                        placeholder={userProfile?.name || "Opcional (Ex: Lucas R.)"}
                        maxLength={18}
                        className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                        Cidade / UF
                      </label>
                      <input
                        type="text"
                        value={newCentelhaLocation}
                        onChange={(e) => setNewCentelhaLocation(e.target.value)}
                        placeholder={userProfile?.city || "Opcional (Ex: Recife, PE)"}
                        maxLength={24}
                        className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold rounded-2xl transition flex items-center justify-center space-x-2"
                  >
                    <span>🕯️ Ecoar Minha Chama na Mesa (+5 Créditos)</span>
                  </button>
                </form>
              </div>

              {/* Preview Side */}
              <div className="lg:col-span-2 flex flex-col justify-between bg-stone-50/50 border border-stone-150 p-5 rounded-2xl text-left min-h-[300px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase bg-amber-50 text-[#8C6239] border border-amber-200/50 px-2.5 py-0.5 rounded-full font-bold">
                      Visualização do Card de Identidade
                    </span>
                    <span className="text-sm">🔥</span>
                  </div>

                  {/* Card Content representation */}
                  <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-stone-100 p-6 rounded-2xl relative shadow-md overflow-hidden flex flex-col justify-between h-[230px] border border-stone-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C08261]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-3 relative z-10">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-[#DCAE6C]">
                        {selectedPrompt}
                      </p>
                      <p className="font-serif text-xs leading-normal italic text-stone-200">
                        "{newCentelhaContent.trim() || "Derrame o seu coração no formulário ao lado para moldar o seu card de identidade espiritual compartilhável..."}"
                      </p>
                    </div>

                    <div className="border-t border-stone-800 pt-3 flex justify-between items-center relative z-10">
                      <div className="space-y-0.5">
                        <cite className="text-[10px] font-serif not-italic font-bold text-stone-100 block">
                          {newCentelhaAuthor.trim() || userProfile?.name || "Um Peregrino Sincero"}
                        </cite>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-stone-450 block">
                          📍 {newCentelhaLocation.trim() || userProfile?.city || "Brasil"}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono border border-[#C08261]/40 px-2 py-0.5 rounded text-[#DCAE6C] font-bold">
                        SOMOS O DESPERTAR
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-stone-400 font-serif leading-relaxed">
                    Sua assinatura (identidade) se torna um farol de esperança. Esse card representa quem você é em Deus e é estruturado especificamente para espalhar convites no WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Commmunity Centelhas list */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-serif text-lg font-bold text-stone-850">
                    Mesa Redonda das Centelhas de Graça
                  </h4>
                  <p className="text-stone-500 text-xs">
                    Testemunhos ativos e respostas dos despertar-peregrinos por todo o Brasil. Respostas reais, nada de robôs.
                  </p>
                </div>
                <div className="flex items-center space-x-1 font-mono text-[10px] uppercase font-bold text-[#C08261] bg-[#C08261]/10 px-3 py-1 rounded-full">
                  <span>🕯️ {centelhas.length} Centelhas Vivas Circulando</span>
                </div>
              </div>

              {/* Centelha list grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {centelhas.map((cent) => (
                    <motion.div
                      key={cent.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="bg-[#FAF8F5] border border-stone-200/60 p-5 rounded-2xl flex flex-col justify-between h-[280px] hover:border-[#C08261]/40 transition shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-4 text-left">
                        {/* Prompt title */}
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono uppercase bg-stone-100 text-[#C08261] px-2 py-0.5 rounded font-extrabold max-w-[85%] truncate">
                            {cent.prompt}
                          </span>
                          <span className="text-xs">🕊️</span>
                        </div>
                        {/* Content text */}
                        <p className="font-serif text-xs md:text-sm text-stone-850 leading-relaxed italic line-clamp-6">
                          "{cent.content}"
                        </p>
                      </div>

                      {/* Footer signatures and actions */}
                      <div className="border-t border-stone-200/50 pt-3 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-stone-900 block font-serif">
                            {cent.author}
                          </span>
                          <span className="text-[9px] font-mono text-stone-450 block">
                            {cent.location}
                          </span>
                        </div>

                        {/* Actions: Align with Novo Poder (Amém vote + WhatsApp share text) */}
                        <div className="flex items-center space-x-1.5">
                          {/* Vote action */}
                          <button
                            type="button"
                            onClick={() => handleVoteCentelha(cent.id)}
                            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                              hasVotedPost[cent.id] || cent.voted
                                ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200"
                                : "bg-white hover:bg-stone-100 text-stone-550 border border-stone-200"
                            }`}
                          >
                            <Heart size={11} className={hasVotedPost[cent.id] || cent.voted ? "fill-emerald-700 text-emerald-700" : ""} />
                            <span>{cent.votes}</span>
                          </button>

                          {/* Share textual card on WhatsApp */}
                          <button
                            type="button"
                            onClick={() => {
                              const shareText = `*O DESPERTAR — CENTELHA VIVA* 🕯️\n\n_"${cent.content}"_\n\n*Assinado por:* ${cent.author} (${cent.location})\n*Pergunta:* ${cent.prompt}\n\nouça a voz de Deus. Caminhe em mesa conosco: https://somosodespertar.com.br`;
                              try {
                                navigator.clipboard.writeText(shareText);
                                showTemporaryToast("Centelha copiada! Compartilhe no seu grupo do WhatsApp! 🕊️📲");
                              } catch (e) {
                                showTemporaryToast("Copiado com sucesso!");
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 hover:border-[#C08261] text-stone-550 cursor-pointer transition text-xs"
                            title="Compartilhar no WhatsApp"
                          >
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
                A tecnologia como ponte para a comunhão primitiva. <br />
                <span className="font-serif font-semibold text-[#C08261]">
                  Conectando vidas, mesas e corações a Deus.
                </span>
              </h3>
              <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                No século XXI, usamos a tecnologia não para afastar as pessoas, mas para reatar nossa união. Nossos aplicativos, materiais exclusivos e rico conteúdo no site servem como uma ponte bendita para nos conectar mais uns com os outros e com o Pai, restaurando o pão partido em cada lar.
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
                <p className="text-stone-700 font-serif text-[17px] md:text-[18px] leading-[1.85]">
                  A maioria das pessoas vai à igreja no domingo e não
                  compartilha uma conversa sincera com ninguém até o próximo
                  culto. Há uma barreira invisível para expor fragilidade ou
                  pedir amparo sem que pareça constrangedor demais para as
                  estruturas modernas.
                </p>
                <blockquote className="border-l-4 border-[#C08261] pl-5 italic text-stone-700 font-serif bg-orange-50/20 py-2.5 rounded-r-2xl pr-3 text-sm md:text-base">
                  "Não deixemos de reunir-nos, como alguns têm por costume; pelo
                  contrário, encorajemo-nos uns aos outros."
                  <cite className="font-mono text-[10px] text-[#C08261] block mt-2 not-italic font-bold">
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
                <div className="bg-stone-50 border border-stone-200/50 rounded-3xl p-6 text-stone-700 font-serif text-[17px] md:text-[18px] leading-[1.85] space-y-4">
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

            {/* APOIO AO MOVIMENTO — Kit dos livros com capas reais */}
            <div className="bg-gradient-to-br from-[#1E1C1A] via-[#121110] to-[#080807] text-white rounded-3xl p-8 md:p-10 border border-[#DCAE6C]/25 shadow-xl overflow-hidden relative">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#DCAE6C]/8 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">

                {/* Capa do Kit */}
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={bookCoverImg}
                      alt="Kit O Despertar — 2 livros"
                      className="w-56 md:w-64 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition duration-300 border border-[#DCAE6C]/10"
                    />
                    <span className="absolute -top-3 -right-3 bg-[#C08261] text-white text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-[#DCAE6C]/20">
                      2 livros · 1 propósito
                    </span>
                  </div>
                </div>

                {/* Texto + CTA */}
                <div className="space-y-5 text-left">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DCAE6C]/10 border border-[#DCAE6C]/20 rounded-full text-[10px] font-mono text-[#DCAE6C] font-bold uppercase tracking-wider">
                      <Gift size={11} className="text-amber-300 animate-pulse" />
                      <span>Kit Oficial do Despertar</span>
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-light text-stone-100 leading-tight">
                      Leve o Despertar para <span className="text-[#DCAE6C] font-semibold">sua mesa</span>
                    </h3>
                    <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                      Os dois livros oficiais juntos — para transformar sua visão de fé e viver isso todo dia de manhã.
                    </p>
                  </div>

                  {/* Mini cards dos livros */}
                  <div className="space-y-2">
                    {[
                      { emoji: '📔', title: 'O Despertar', sub: 'A geração que voltou a ouvir a voz de Deus', orig: 'R$ 34,90', price: 'R$ 24,90' },
                      { emoji: '🙏', title: 'O Despertar Devocional', sub: 'Devocionais diários para fé, transformação e propósito', orig: 'R$ 29,90', price: 'R$ 19,90' },
                    ].map((livro) => (
                      <div key={livro.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                        <span className="text-lg shrink-0">{livro.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif font-semibold text-[#DCAE6C] text-xs truncate">{livro.title}</p>
                          <p className="text-[10px] text-stone-400 truncate">{livro.sub}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-stone-500 line-through block">{livro.orig}</span>
                          <span className="font-mono font-black text-[#DCAE6C] text-xs">{livro.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preço do Kit */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-500 text-sm line-through">R$ 64,80</span>
                    <span className="font-mono font-black text-[#DCAE6C] text-2xl">R$ 34,80</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">Economize R$ 30</span>
                  </div>

                  {/* CTA — link direto do kit */}
                  <button
                    type="button"
                    onClick={() => window.open('https://pay.kiwify.com.br/Fbksh0o', '_blank')}
                    className="w-full py-4 bg-[#C08261] hover:bg-[#b07353] text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <span>Adquirir o Kit — R$ 34,80</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] text-stone-500 flex-wrap">
                    <span>🔒 Compra segura via Kiwify</span>
                    <span>📧 Entrega imediata no e-mail</span>
                  </div>
                </div>
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
                <p className="text-stone-600 text-xs md:text-sm leading-relaxed max-w-md mx-auto">
                  Abra caminho e faça parte. Garanta sua listagem honorária de
                  co-fundador pioneiro e ganhe{" "}
                  <strong className="text-stone-900 font-bold">
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
                  <h5 className="font-serif text-lg font-bold text-stone-800">
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

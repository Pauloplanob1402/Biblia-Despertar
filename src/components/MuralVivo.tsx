import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus, Share2, PlusCircle, ArrowRight } from "lucide-react";

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

interface MuralVivoProps {
  currentUser: any;
  userProfile: any;
  onShowAuthModal: () => void;
}

export default function MuralVivo({ currentUser, userProfile, onShowAuthModal }: MuralVivoProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(12);
  const [name, setName] = useState("");

  const [muralItems, setMuralItems] = useState<MuralItem[]>([
    { id: "1", category: "necessidade", author: "Milena Rocha", avatarEmoji: "👩‍👶", location: "Curitiba, PR", title: "Mãe solo precisa de apoio com crianças", description: "Preciso de alguém maduro de fé para ficar com meus dois filhos (3 e 5 anos) na quarta-feira à noite das 19h às 21:30h, para que eu possa participar do grupo de discipulado local. A mesa precisa de mim lá.", timestamp: "Há 2 horas", actionsTaken: [], userInteracted: false },
    { id: "2", category: "oferta", author: "Marcos de Souza", avatarEmoji: "🚗", location: "Curitiba, PR", title: "CaronaSolidária para o Grupo de Oração", description: "Posso ajudar com transporte prático aos domingos pela manhã e quintas à noite. Tenho 4 lugares disponíveis no carro saindo da região norte de Curitiba.", timestamp: "Há 5 horas", actionsTaken: [], userInteracted: false },
    { id: "3", category: "oracao", author: "Juliana Mendes", avatarEmoji: "👩‍⚕️", location: "Belo Horizonte, MG", title: "Oração por tratamento de Pneumonia Crônica", description: "Minha amada mãe está hospitalizada lutando contra pneumonia grave. Peço que a família do Despertar se junte a mim em clamor urgente.", timestamp: "Há 1 hora", counter: 6, actionsTaken: ["Ana S.", "Roberto O."], userInteracted: false },
    { id: "4", category: "cadeira_vazia", author: "Gabriel Krause", avatarEmoji: "☕", location: "Porto Alegre, RS", title: "Café de Ensino e Discipulado na Terça", description: "Vou abrir meu apartamento na terça-feira às 19:30h para passarmos o pão, orar e estudar o livro de João. Tenho vagas na mesa. Venha como está!", timestamp: "Há 8 horas", counter: 3, maxCounter: 5, actionsTaken: [], userInteracted: false },
    { id: "5", category: "necessidade", author: "Pr. Antenor", avatarEmoji: "📖", location: "Limoeiro do Norte, CE", title: "Bíblias de estudo para novos convertidos", description: "Iniciamos um pequeno grupo em comunidade carente aqui no interior, mas temos apenas 2 Bíblias para 8 pessoas. Se alguém puder doar Bíblias usadas ou novas, faria toda diferença.", timestamp: "Há 1 dia", actionsTaken: [], userInteracted: false },
    { id: "6", category: "cadeira_vazia", author: "Família Silva", avatarEmoji: "🍲", location: "Campinas, SP", title: "Jantar de Domingo — Cadeira Vazia Esperando", description: "Se no domingo de noite você costuma se sentir só, saiba que há um prato e uma cadeira esperando por você em nossa mesa de família.", timestamp: "Há 12 horas", counter: 1, maxCounter: 4, actionsTaken: [], userInteracted: false },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newUF, setNewUF] = useState("SP");
  const [newCategory, setNewCategory] = useState<"necessidade" | "oferta" | "oracao" | "cadeira_vazia">("necessidade");
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"todos" | "necessidade" | "oferta" | "oracao" | "cadeira_vazia">("todos");

  const showTemporaryToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveMuralToStorage = (updatedMural: MuralItem[]) => {
    setMuralItems(updatedMural);
    localStorage.setItem("despertar_mural_v1", JSON.stringify(updatedMural));
  };

  useEffect(() => {
    const savedMural = localStorage.getItem("despertar_mural_v1");
    if (savedMural) {
      try { setMuralItems(JSON.parse(savedMural)); } catch {}
    }
    const savedCredits = localStorage.getItem("despertar_user_credits");
    if (savedCredits) setUserCredits(parseInt(savedCredits) || 12);
  }, []);

  const countCategory = (cat: "necessidade" | "oferta" | "oracao" | "cadeira_vazia") =>
    muralItems.filter((m) => m.category === cat).length;

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newAuthor || !newCity) {
      showTemporaryToast("Por favor, preencha todos os campos para anunciar.");
      return;
    }
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
      counter: newCategory === "oracao" || newCategory === "cadeira_vazia" ? 0 : undefined,
      maxCounter: newCategory === "cadeira_vazia" ? 4 : undefined,
      actionsTaken: [], userInteracted: false,
    };
    saveMuralToStorage([newItem, ...muralItems]);
    if (cost !== 0) {
      setUserCredits(prev => { const next = prev + cost; localStorage.setItem("despertar_user_credits", next.toString()); return next; });
    }
    showTemporaryToast(`Anúncio publicado no Mural!`);
    setNewTitle(""); setNewDesc(""); setShowPublishForm(false);
  };

  const handleItemInteraction = (item: MuralItem) => {
    const activeName = name || (currentUser ? userProfile?.name || currentUser.displayName : "Você");
    const updated = muralItems.map((m) => {
      if (m.id !== item.id) return m;
      if (m.userInteracted) {
        return { ...m, userInteracted: false, actionsTaken: m.actionsTaken?.filter(a => a !== activeName) || [], counter: typeof m.counter === "number" && (m.category === "oracao" || m.category === "cadeira_vazia") ? Math.max(0, m.counter - 1) : m.counter };
      } else {
        let nextCounter = m.counter;
        let creditChange = 0;
        if (m.category === "oracao" && typeof m.counter === "number") { nextCounter = m.counter + 1; creditChange = 1; }
        else if (m.category === "cadeira_vazia" && typeof m.counter === "number" && m.maxCounter) {
          if (m.counter >= m.maxCounter) { showTemporaryToast("Esta mesa já está cheia!"); return m; }
          nextCounter = m.counter + 1;
        } else if (m.category === "necessidade") { creditChange = 2; }
        if (creditChange > 0) { setUserCredits(prev => { const next = prev + creditChange; localStorage.setItem("despertar_user_credits", next.toString()); return next; }); }
        return { ...m, userInteracted: true, actionsTaken: [...(m.actionsTaken || []), activeName], counter: nextCounter };
      }
    });
    saveMuralToStorage(updated);
    if (!item.userInteracted) {
      if (item.category === "oracao") showTemporaryToast(`Você assumiu oração por ${item.author}! 🕯️`);
      else if (item.category === "cadeira_vazia") showTemporaryToast(`Cadeira reservada com ${item.author}! 🍲`);
      else if (item.category === "necessidade") showTemporaryToast(`Você ajudou ${item.author}! (+2 créd.) 🤝`);
      else showTemporaryToast(`Interesse registrado!`);
    } else { showTemporaryToast("Compromisso removido."); }
  };

  const filteredItems = activeFilter === "todos" ? muralItems : muralItems.filter(m => m.category === activeFilter);

  const categoryConfig = {
    necessidade: { label: "Necessidade", emoji: "📌", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
    oferta: { label: "Oferta", emoji: "🎁", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    oracao: { label: "Oração", emoji: "🙏", color: "text-[#C08261]", bg: "bg-amber-50", border: "border-amber-200" },
    cadeira_vazia: { label: "Cadeira Vazia", emoji: "🪑", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-4">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 border border-[#C08261]/40 px-5 py-3 rounded-full shadow-2xl text-xs font-semibold flex items-center space-x-2">
            <Sparkles size={14} className="animate-pulse text-[#DCAE6C]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-2 border-b border-stone-100 pb-5">
        <span className="text-[10px] font-mono uppercase bg-[#C08261]/10 text-[#C08261] px-3 py-1 rounded-full font-bold tracking-widest inline-block">
          ✨ Comunhão de Atos 2
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-850 tracking-tight">O Mural Vivo</h2>
        <p className="text-stone-500 text-xs md:text-sm max-w-2xl leading-relaxed">
          Necessidades reais, ofertas de serviço, pedidos de oração e mesas abertas — a comunhão prática do Corpo de Cristo em tempo real.
        </p>
      </div>

      {/* Créditos + Publicar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-[#fdfaf7] border border-[#C08261]/20 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#C08261]/10 flex items-center justify-center text-lg">🪙</div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C08261]">Seus Créditos</div>
            <div className="font-serif text-xl font-extrabold text-stone-900">{userCredits}</div>
          </div>
        </div>
        <button onClick={() => { if (!currentUser) { onShowAuthModal(); return; } setShowPublishForm(v => !v); }}
          className="w-full sm:w-auto py-2.5 px-5 bg-[#C08261] hover:bg-[#A96D4D] text-white text-xs font-mono uppercase tracking-wider font-black rounded-xl transition flex items-center justify-center space-x-2 shadow-sm">
          {showPublishForm ? <span>✕ Fechar</span> : <><PlusCircle size={14} /><span>Anunciar no Mural</span></>}
        </button>
      </div>

      {/* Formulário de publicação */}
      <AnimatePresence>
        {showPublishForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handlePublishPost} className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-4 overflow-hidden">
            <h4 className="font-serif font-bold text-stone-800">Anunciar no Mural</h4>
            <div className="flex flex-wrap gap-2">
              {(["necessidade", "oferta", "oracao", "cadeira_vazia"] as const).map(cat => (
                <button type="button" key={cat} onClick={() => setNewCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-mono font-bold transition ${newCategory === cat ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
                  {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                </button>
              ))}
            </div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título breve" maxLength={80}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#C08261]/60 transition" />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descreva com sinceridade..." rows={3} maxLength={300}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#C08261]/60 transition resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Seu nome" className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C08261]/60 transition" />
              <input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Cidade" className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C08261]/60 transition" />
            </div>
            <button type="submit" className="w-full py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold rounded-2xl transition">
              Publicar no Mural
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveFilter("todos")}
          className={`px-3 py-1.5 rounded-full text-[10.5px] font-mono font-bold transition ${activeFilter === "todos" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
          Todos ({muralItems.length})
        </button>
        {(["necessidade", "oferta", "oracao", "cadeira_vazia"] as const).map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-[10.5px] font-mono font-bold transition ${activeFilter === cat ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"}`}>
            {categoryConfig[cat].emoji} {categoryConfig[cat].label} ({countCategory(cat)})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const cfg = categoryConfig[item.category];
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-stone-200/80 rounded-3xl p-5 flex flex-col justify-between hover:border-stone-300 transition shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-0.5 rounded-full inline-block leading-normal ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                        {cfg.emoji} {cfg.label}
                      </span>
                      <div className="text-stone-400 text-[10px] font-mono">
                        <span className="font-semibold">{item.avatarEmoji} {item.author}</span> · {item.location} · {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <h4 className="font-serif text-base font-bold text-stone-850 leading-snug">{item.title}</h4>
                  <p className="text-stone-600 text-[13px] leading-relaxed">{item.description}</p>
                  {item.category === "cadeira_vazia" && typeof item.counter === "number" && item.maxCounter && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-stone-100 rounded-full h-1.5">
                        <div className="bg-[#C08261] h-1.5 rounded-full transition-all" style={{ width: `${(item.counter / item.maxCounter) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">{item.counter}/{item.maxCounter} lugares</span>
                    </div>
                  )}
                  {item.category === "oracao" && typeof item.counter === "number" && (
                    <p className="text-[11px] font-mono text-stone-500">{item.counter} {item.counter === 1 ? "irmão orando" : "irmãos orando"}</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex gap-2">
                  <button onClick={() => handleItemInteraction(item)}
                    className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-wider font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${item.userInteracted ? "bg-[#C08261] text-white" : "bg-stone-50 hover:bg-[#C08261]/10 border border-stone-200 text-stone-700"}`}>
                    {item.category === "oracao" ? (item.userInteracted ? "✓ Orando" : "🙏 Orar") :
                     item.category === "cadeira_vazia" ? (item.userInteracted ? "✓ Reservado" : "🪑 Reservar") :
                     item.category === "necessidade" ? (item.userInteracted ? "✓ Ajudando" : "🤝 Ajudar") :
                     (item.userInteracted ? "✓ Interessado" : "🎁 Tenho Interesse")}
                  </button>
                  <button onClick={() => { if (navigator.share) navigator.share({ title: item.title, text: item.description }); else showTemporaryToast("Link copiado!"); }}
                    className="px-3 py-2 bg-stone-50 border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-100 transition">
                    <Share2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200">
          <span className="text-2xl block mb-2">🕊️</span>
          <p className="font-serif text-stone-600">Nenhum item nesta categoria ainda.</p>
          <p className="text-xs text-stone-400 mt-1">Seja o primeiro a anunciar!</p>
        </div>
      )}

      {/* Inspiração final */}
      <div className="bg-[#FAF8F5]/80 border-2 border-dashed border-[#C08261]/25 rounded-3xl p-6 space-y-3 max-w-2xl mx-auto text-center">
        <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl mx-auto">🪑</span>
        <h4 className="font-serif text-lg font-bold text-stone-850">A Cadeira Vazia — Hospitalidade Real</h4>
        <p className="text-stone-550 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
          <em className="text-stone-850 font-serif">"Na sua mesa, há sempre uma cadeira vazia para um irmão que ainda não tem grupo local."</em>{" "}
          Faça do seu lar um tabernáculo físico de graça.
        </p>
      </div>
    </div>
  );
}

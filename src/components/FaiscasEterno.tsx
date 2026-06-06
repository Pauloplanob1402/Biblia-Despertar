import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles, Share2 } from "lucide-react";

interface FaiscasEternoProps {
  currentUser: any;
  userProfile: any;
  onShowAuthModal: () => void;
}

export default function FaiscasEterno({ currentUser, userProfile, onShowAuthModal }: FaiscasEternoProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(12);
  const [hasVotedPost, setHasVotedPost] = useState<Record<string, boolean>>({});
  const [selectedPrompt, setSelectedPrompt] = useState("Qual foi a batalha que ninguém viu você vencer?");
  const [newCentelhaContent, setNewCentelhaContent] = useState("");
  const [newCentelhaAuthor, setNewCentelhaAuthor] = useState("");
  const [newCentelhaLocation, setNewCentelhaLocation] = useState("");

  const [centelhas, setCentelhas] = useState<{
    id: string; author: string; location: string;
    prompt: string; content: string; votes: number; voted?: boolean;
  }[]>([]);

  const showTemporaryToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const savedCredits = localStorage.getItem("despertar_user_credits");
    if (savedCredits) setUserCredits(parseInt(savedCredits) || 12);

    const savedCentelhas = localStorage.getItem("despertar_cocreated_centelhas");
    if (savedCentelhas) {
      try { setCentelhas(JSON.parse(savedCentelhas)); } catch {}
    } else {
      const initial = [
        { id: "c1", author: "Ana Beatriz", location: "Recife, PE", prompt: "Qual foi a batalha que ninguém viu você vencer?", content: "Passei três anos lutando sozinha contra a ansiedade, sorrindo para o mundo enquanto por dentro havia um furacão. Deus me sustentou em silêncio. Ninguém viu, mas Ele viu.", votes: 14, voted: false },
        { id: "c2", author: "Marcos Filipe", location: "Goiânia, GO", prompt: "Ninguém deveria enfrentar seus dias sozinho. O que você diria para alguém hoje?", content: "Que você não precisa ter tudo resolvido pra merecer amor. A graça não espera você chegar perfeito. Ela te encontra onde você está.", votes: 22, voted: false },
        { id: "c3", author: "Priscila M.", location: "Florianópolis, SC", prompt: "Em qual momento desta semana você sentiu o sopro da graça?", content: "Quando meu filho de 6 anos me perguntou se Deus tinha tempo para ouvir ele. Parei tudo e oramos juntos. A presença era tão real que os dois choramos.", votes: 31, voted: false },
      ];
      setCentelhas(initial);
      localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(initial));
    }
  }, []);

  const handlePublishCentelha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCentelhaContent.trim()) {
      showTemporaryToast("Por favor, derrame a sua palavra antes de enviar.");
      return;
    }
    const authorToUse = newCentelhaAuthor.trim() || userProfile?.name || "Um Peregrino Sincero";
    const locationToUse = newCentelhaLocation.trim() || userProfile?.city || "Brasil";
    const newCent = {
      id: "cent_" + Date.now().toString(),
      author: authorToUse, location: locationToUse,
      prompt: selectedPrompt, content: newCentelhaContent.trim(),
      votes: 1, voted: true,
    };
    const updated = [newCent, ...centelhas];
    setCentelhas(updated);
    localStorage.setItem("despertar_cocreated_centelhas", JSON.stringify(updated));
    const nextCredits = userCredits + 5;
    setUserCredits(nextCredits);
    localStorage.setItem("despertar_user_credits", nextCredits.toString());
    setNewCentelhaContent(""); setNewCentelhaAuthor(""); setNewCentelhaLocation("");
    showTemporaryToast("Faísca acesa! +5 créditos! 🕯️🔥");
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-4 text-left">
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
        <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full font-bold tracking-widest inline-block">
          🔥 Fé Ativa
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-850 tracking-tight">Faíscas do Eterno</h2>
        <p className="text-stone-500 text-xs md:text-sm max-w-2xl leading-relaxed">
          Reflexões co-criadas, testemunhos vivos e perguntas que acendem corações — a sua voz na edificação do Corpo.
        </p>
      </div>

      {/* Créditos */}
      <div className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-200/40 rounded-2xl">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg">🪙</div>
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">Seus Créditos</div>
          <div className="font-serif text-xl font-extrabold text-stone-900">{userCredits}</div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2 text-[10px]">
          <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">🔥 +5 por Semeação</span>
          <span className="bg-white border border-stone-200 px-3 py-1 rounded-full text-stone-500 font-mono">❤️ +1 por Concordar</span>
        </div>
      </div>

      {/* Form + Preview */}
      <div className="bg-white border border-stone-200 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-5">
          <h4 className="font-serif font-bold text-stone-850 text-base border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            <span>Acenda Sua Faísca na Mesa</span>
          </h4>
          <form onSubmit={handlePublishCentelha} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Selecione a Pergunta do Dia</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Qual foi a batalha que ninguém viu você vencer?",
                  "Ninguém deveria enfrentar seus dias sozinho. O que você diria para alguém hoje?",
                  "Em qual momento desta semana você sentiu o sopro da graça?",
                ].map((promptText) => (
                  <button key={promptText} type="button" onClick={() => setSelectedPrompt(promptText)}
                    className={`p-3 border rounded-xl text-left cursor-pointer text-xs transition ${selectedPrompt === promptText ? "border-[#C08261] bg-[#C08261]/5 text-stone-850 font-medium" : "border-stone-150 bg-stone-50/50 text-stone-500 hover:bg-stone-50"}`}>
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Sua Resposta Sincera *</label>
              <textarea rows={4} value={newCentelhaContent} onChange={e => setNewCentelhaContent(e.target.value)}
                placeholder="Derrame sua inspiração aqui, em poucas frases sinceras..." maxLength={320}
                className="w-full bg-stone-50/75 border border-stone-200 rounded-2xl p-4 text-xs md:text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition" />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>Máximo 320 caracteres</span><span>{newCentelhaContent.length}/320</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Assinar como</label>
                <input type="text" value={newCentelhaAuthor} onChange={e => setNewCentelhaAuthor(e.target.value)}
                  placeholder={userProfile?.name || "Opcional"} maxLength={18}
                  className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">Cidade / UF</label>
                <input type="text" value={newCentelhaLocation} onChange={e => setNewCentelhaLocation(e.target.value)}
                  placeholder={userProfile?.city || "Opcional"} maxLength={24}
                  className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C08261] transition" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold rounded-2xl transition flex items-center justify-center space-x-2">
              <span>🕯️ Lançar Minha Faísca na Mesa (+5 Créditos)</span>
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-stone-50/50 border border-stone-150 p-5 rounded-2xl text-left min-h-[300px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono uppercase bg-amber-50 text-[#8C6239] border border-amber-200/50 px-2.5 py-0.5 rounded-full font-bold">Visualização do Card</span>
              <span className="text-sm">🔥</span>
            </div>
            <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-stone-100 p-6 rounded-2xl relative shadow-md overflow-hidden flex flex-col justify-between h-[230px] border border-stone-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C08261]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#DCAE6C]">{selectedPrompt}</p>
                <p className="font-serif text-xs leading-normal italic text-stone-200">
                  "{newCentelhaContent.trim() || "Derrame o seu coração no formulário ao lado..."}"
                </p>
              </div>
              <div className="border-t border-stone-800 pt-3 flex justify-between items-center relative z-10">
                <div className="space-y-0.5">
                  <cite className="text-[10px] font-serif not-italic font-bold text-stone-100 block">{newCentelhaAuthor.trim() || userProfile?.name || "Um Peregrino Sincero"}</cite>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-stone-450 block">📍 {newCentelhaLocation.trim() || userProfile?.city || "Brasil"}</span>
                </div>
                <span className="text-[8px] font-mono border border-[#C08261]/40 px-2 py-0.5 rounded text-[#DCAE6C] font-bold">SOMOS O DESPERTAR</span>
              </div>
            </div>
          </div>
          <div className="pt-4 text-center">
            <p className="text-[10px] text-stone-400 font-serif leading-relaxed">Sua assinatura se torna um farol de esperança — estruturado para espalhar convites no WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Lista de faíscas */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h4 className="font-serif text-lg font-bold text-stone-850">Mesa das Faíscas do Eterno</h4>
            <p className="text-stone-500 text-xs">Testemunhos reais dos peregrinos do Despertar por todo o Brasil.</p>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[10px] uppercase font-bold text-[#C08261] bg-[#C08261]/10 px-3 py-1 rounded-full">
            <span>🕯️ {centelhas.length} Faíscas Circulando</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {centelhas.map(cent => (
              <motion.div key={cent.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-[#FAF8F5] border border-stone-200/60 p-5 rounded-2xl flex flex-col justify-between h-[280px] hover:border-[#C08261]/40 transition shadow-xs hover:shadow-md">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-mono uppercase bg-stone-100 text-[#C08261] px-2 py-0.5 rounded font-extrabold max-w-[85%] truncate">{cent.prompt}</span>
                    <span className="text-xs">🕊️</span>
                  </div>
                  <p className="font-serif text-xs md:text-sm text-stone-850 leading-relaxed italic line-clamp-6">"{cent.content}"</p>
                </div>
                <div className="border-t border-stone-200/50 pt-3 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-stone-900 block font-serif">{cent.author}</span>
                    <span className="text-[9px] font-mono text-stone-450 block">{cent.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button type="button" onClick={() => handleVoteCentelha(cent.id)}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${hasVotedPost[cent.id] || cent.voted ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200" : "bg-white hover:bg-stone-100 text-stone-550 border border-stone-200"}`}>
                      <Heart size={11} className={hasVotedPost[cent.id] || cent.voted ? "fill-emerald-700 text-emerald-700" : ""} />
                      <span>{cent.votes}</span>
                    </button>
                    <button type="button"
                      onClick={() => {
                        const shareText = `*O DESPERTAR — FAÍSCA VIVA* 🕯️\n\n_"${cent.content}"_\n\n*Assinado por:* ${cent.author} (${cent.location})\n*Pergunta:* ${cent.prompt}\n\nhttps://somosodespertar.com.br`;
                        navigator.clipboard.writeText(shareText).then(() => showTemporaryToast("Faísca copiada! Compartilhe no WhatsApp! 🕊️📲")).catch(() => showTemporaryToast("Copiado!"));
                      }}
                      className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 hover:border-[#C08261] text-stone-550 cursor-pointer transition text-xs">
                      <Share2 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

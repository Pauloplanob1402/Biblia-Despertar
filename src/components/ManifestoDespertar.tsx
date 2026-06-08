import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { BookOpen, Heart, Mail, Share2, Smartphone, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface ManifestoDespertarProps {
  onGoToApoiar: () => void;
  sementesSaldo: number;
}

const experiences = [
  { emoji: '🌅', titulo: 'Comece Hoje', beneficio: 'Sua primeira quietude guiada. Sem cobrança, sem culpa.' },
  { emoji: '🫁', titulo: 'Respire', beneficio: 'Pare o caos em 4 segundos. Seu coração vai agradecer.' },
  { emoji: '☕', titulo: 'Palavra do Dia', beneficio: 'Um café com Deus. Todo dia. Em 7 minutos.' },
  { emoji: '📖', titulo: 'Escrituras', beneficio: '66 livros. Favoritos, reflexões. Sem pagar nada.' },
  { emoji: '🕊️', titulo: 'Quem Você É', beneficio: '12 identidades espirituais. Qual a sua?' },
  { emoji: '🔍', titulo: 'Seu Arquétipo', beneficio: 'Descubra qual discípulo fala sobre você agora.' },
  { emoji: '🙏', titulo: 'Ore por Alguém', beneficio: 'Seu pedido chegará a centenas de peregrinos hoje.' },
  { emoji: '✨', titulo: 'Compartilhe', beneficio: 'Uma palavra sua pode reacender uma fé hoje.' },
  { emoji: '🌿', titulo: 'Testemunhe', beneficio: 'Veja o que Deus está fazendo em vidas reais.' },
  { emoji: '⚡', titulo: 'História Viva', beneficio: 'Caminhe com os gigantes da fé de todos os séculos.' },
  { emoji: '🏡', titulo: 'Sua Mesa', beneficio: 'Crie um espaço de fé real na sua cidade.' },
  { emoji: '🤝', titulo: 'Peregrinos', beneficio: 'Encontre alguém caminhando pelo mesmo vale.' },
  { emoji: '📓', titulo: 'Sua Jornada', beneficio: 'Seu diário espiritual. Offline. Vitalício. Seguro.' },
  { emoji: '🌱', titulo: 'Sementes', beneficio: 'Cada ação aqui planta algo eterno no invisível.' },
];

const SHARE_TEXT = `🕊️ Encontrei algo diferente.

É gratuito, é profundo e é real.

Respiração guiada, Bíblia completa, devocional de 365 dias,
mural de oração, comunidade viva — tudo sem pagar nada.

biblia-despertar.vercel.app

(E tem app no Android também 📱)`;

export default function ManifestoDespertar({ onGoToApoiar }: ManifestoDespertarProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const block5Ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: block5Ref,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: SHARE_TEXT });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(SHARE_TEXT);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      } catch {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      }
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* ─────────────────────────────────────────────────────────
          BLOCO 1 — O Espelho
      ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center px-4 py-10 space-y-5 max-w-2xl mx-auto"
      >
        <p className="font-serif text-2xl md:text-3xl text-stone-700 leading-relaxed tracking-tight">
          Parece que você encontrou algo{' '}
          <span className="text-[#C08261]">diferente</span> aqui.
        </p>
        <p className="text-stone-500 text-base md:text-lg leading-relaxed">
          Não é mais um app de versículos.{' '}
          Não é mais uma plataforma religiosa.
        </p>
        <p className="font-serif text-xl md:text-2xl text-stone-700 leading-relaxed">
          É um lugar onde pessoas{' '}
          <span className="text-[#C08261]">reais</span>{' '}
          voltam a respirar.
        </p>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────
          BLOCO 2 — As 14 Experiências
      ───────────────────────────────────────────────────────── */}
      <div className="px-4 space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C08261] font-bold block">
            O que você vai viver aqui
          </span>
          <h3 className="font-serif text-2xl md:text-3xl text-stone-800 font-light">
            14 experiências. Todas gratuitas.
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.titulo}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
              className="bg-[#fdfaf7] border border-stone-200 rounded-2xl p-4 space-y-2 flex flex-col"
            >
              <span className="text-3xl leading-none">{exp.emoji}</span>
              <p className="font-serif text-stone-800 font-semibold text-sm leading-snug">
                {exp.titulo}
              </p>
              <p className="text-stone-500 text-xs leading-relaxed flex-1 break-words">
                {exp.beneficio}
              </p>
              <span className="inline-block self-start mt-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                Gratuito
              </span>
            </motion.div>
          ))}
        </div>

        {/* Contador animado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center py-4"
        >
          <span className="font-mono text-lg md:text-xl text-[#C08261] font-bold tracking-tight">
            14 experiências. R$ 0,00. Sempre.
          </span>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          Transição Sugarman → Bloco 3
      ───────────────────────────────────────────────────────── */}
      <div className="text-center px-4">
        <p className="font-serif text-xl md:text-2xl text-stone-600 italic">
          "E se o Despertar pudesse ir com você para onde quer que você vá?"
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────
          BLOCO 3 — Os Apps do Ecossistema
      ───────────────────────────────────────────────────────── */}
      <div className="bg-[#1E1C1A] rounded-3xl p-6 md:p-8 space-y-4 mx-4">
        <div className="text-center space-y-1">
          <Smartphone size={20} className="text-[#DCAE6C] mx-auto" />
          <h4 className="font-serif text-xl text-stone-100 font-light">O Movimento no seu bolso</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* App 1 */}
          <div className="bg-[#121110] rounded-2xl p-5 space-y-3 border border-stone-700">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-serif text-stone-100 font-semibold text-base">Bíblia do Despertar</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-stone-700 text-stone-400 text-[10px] font-mono uppercase tracking-wider">
                  Já no site
                </span>
              </div>
              <span className="text-2xl">📱</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              O app Android que leva toda essa experiência para o seu bolso.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.break_app.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 min-h-[48px] px-4 py-3 rounded-xl bg-[#C08261] hover:bg-[#A96D4D] text-white text-sm font-semibold transition-colors w-full justify-center"
            >
              <ExternalLink size={14} />
              Baixar Grátis
            </a>
          </div>

          {/* App 2 */}
          <div className="bg-[#121110] rounded-2xl p-5 space-y-3 border border-stone-700">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-serif text-stone-100 font-semibold text-base">Despertar para Jovens</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
                  Novo
                </span>
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Para os filhos, sobrinhos, primos e amigos que você quer ver despertar.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.sparksresiliencia.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 min-h-[48px] px-4 py-3 rounded-xl bg-[#C08261] hover:bg-[#A96D4D] text-white text-sm font-semibold transition-colors w-full justify-center"
            >
              <ExternalLink size={14} />
              Baixar Grátis
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          BLOCO 4 — O Convite
      ───────────────────────────────────────────────────────── */}
      <div className="bg-[#fdfaf7] border border-[#C08261]/25 rounded-3xl p-6 md:p-8 mx-4 space-y-6">
        {/* Rótulo emocional Chris Voss */}
        <div className="text-center space-y-2">
          <Sparkles size={18} className="text-[#C08261] mx-auto" />
          <p className="font-serif text-xl md:text-2xl text-stone-700 leading-relaxed">
            Você provavelmente já percebeu que aqui ninguém está tentando vender nada.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed">
            Tudo isso existe porque alguém acreditou que vale a pena.
            Agora essa crença precisa de você.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Ação 1 — Ebook */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex gap-4 items-start"
          >
            <span className="text-2xl mt-0.5 shrink-0">📚</span>
            <div className="space-y-2 flex-1">
              <p className="font-serif text-stone-800 font-semibold text-base">Adquira um Ebook</p>
              <p className="text-stone-500 text-sm leading-relaxed">
                Cada ebook comprado paga o servidor que serve 1.000 peregrinos este mês.
                Você não está comprando um livro. Está plantando.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onGoToApoiar(); }}
                className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-[#C08261] hover:bg-[#A96D4D] text-white text-sm font-semibold transition-colors"
              >
                Ver os Livros <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>

          <div className="border-t border-stone-200" />

          {/* Ação 2 — Oração (sem CTA intencional) */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex gap-4 items-start"
          >
            <span className="text-2xl mt-0.5 shrink-0">🙏</span>
            <div className="space-y-2 flex-1">
              <p className="font-serif text-stone-800 font-semibold text-base">Ore por Este Movimento</p>
              <p className="text-stone-500 text-sm leading-relaxed">
                Não há equipe de marketing aqui. Há peregrinos que acordaram às 5h
                e escreveram estas palavras pensando em você. Ore por quem as escreveu.
              </p>
            </div>
          </motion.div>

          <div className="border-t border-stone-200" />

          {/* Ação 3 — Escreva */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex gap-4 items-start"
          >
            <span className="text-2xl mt-0.5 shrink-0">✉️</span>
            <div className="space-y-2 flex-1">
              <p className="font-serif text-stone-800 font-semibold text-base">Escreva para Nós</p>
              <p className="text-stone-500 text-sm leading-relaxed">
                Testemunho, dúvida, ideia ou só um "obrigado" — cada mensagem sustenta
                quem ainda hesita em continuar construindo isso.
              </p>
              <a
                href="mailto:somosodespertar@gmail.com"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-[#C08261] hover:text-[#A96D4D] text-sm font-semibold transition-colors underline underline-offset-2"
              >
                <Mail size={14} />
                somosodespertar@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          BLOCO 5 — O Escorregador Final
      ───────────────────────────────────────────────────────── */}
      <div ref={block5Ref} className="relative overflow-hidden rounded-3xl mx-4 bg-[#121110]">
        <motion.div
          style={{ y: parallaxY }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#C08261]/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-[#DCAE6C]/8 blur-2xl rounded-full" />
        </motion.div>

        <div className="relative z-10 px-6 md:px-10 py-12 text-center space-y-6">
          <p className="font-serif text-2xl md:text-4xl text-stone-100 leading-snug tracking-tight">
            O próximo peregrino está esperando que você{' '}
            <span className="text-[#C08261]">mencione isso.</span>
          </p>
          <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Não porque você foi pago para fazer isso.
            Porque você sabe o que é não ter um lugar assim
            quando mais precisou.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="inline-flex items-center gap-2 min-h-[52px] px-8 py-3.5 rounded-2xl bg-[#C08261] hover:bg-[#A96D4D] text-white font-semibold text-base transition-colors shadow-lg shadow-[#C08261]/25"
          >
            <Share2 size={16} />
            Enviar para alguém agora →
          </button>
        </div>
      </div>

      {/* Toast de confirmação */}
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-stone-800 text-stone-100 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl whitespace-nowrap"
        >
          Copiado! Agora é só colar no WhatsApp 🕊️
        </motion.div>
      )}
    </div>
  );
}

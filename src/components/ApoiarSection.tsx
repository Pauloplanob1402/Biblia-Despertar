/**
 * ApoiarSection — Como Apoiar O Despertar
 * Mostra os 3 livros principais com capas + coleção dos 12 discípulos.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Heart, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, Coffee, Star, Check, Shield, ArrowRight,
} from 'lucide-react';
import { DESPERTAR_EBOOKS } from '../data/ebooks';

// ── Capas dos 3 livros principais ─────────────────────────────────────────────
import bookCoverImg   from '../assets/images/book_cover_1780394449410.png';
import bookCoverWebp  from '../assets/images/book_cover_1780394449410.webp';
import devocCoverImg  from '../assets/images/book_cover_devocional.png';
import devocCoverWebp from '../assets/images/book_cover_devocional.webp';
import kitCoverImg    from '../assets/images/book_cover_kit.png';
import kitCoverWebp   from '../assets/images/book_cover_kit.webp';

// ── Links de compra ───────────────────────────────────────────────────────────
const LINK_DESPERTAR   = 'https://pay.kiwify.com.br/JRqrznH';
const LINK_DEVOCIONAIS = 'https://pay.kiwify.com.br/X23KvCQ';
const LINK_KIT         = 'https://pay.kiwify.com.br/Fbksh0o';
const EBOOK_SITE       = 'https://www.somosodespertar.com.br';

// ── Dados dos 3 livros principais ─────────────────────────────────────────────
const LIVROS_PRINCIPAIS = [
  {
    id: 'despertar',
    link: LINK_DESPERTAR,
    title: 'O Despertar',
    subtitle: 'A geração que voltou a ouvir a voz de Deus',
    description:
      'Em uma época de distrações e vazio espiritual, este livro é um convite para ouvir o Pai, encontrar propósito e viver uma fé autêntica. Mais do que páginas — é o início de um movimento.',
    priceOriginal: 'R$ 34,90',
    price: 'R$ 24,90',
    badge: 'Mais lido',
    badgeColor: 'bg-emerald-500/15 text-emerald-700',
    pages: '142 páginas',
    format: 'PDF + EPUB',
    cover: bookCoverImg,
    coverWebp: bookCoverWebp,
  },
  {
    id: 'devocionais',
    link: LINK_DEVOCIONAIS,
    title: 'O Despertar Devocional',
    subtitle: '365 dias de quietude com o Pai',
    description:
      'Um ano inteiro de encontros diários com Deus. Reflexões curtas, versículos âncora e espaço para escrever — projetado para quem quer consistência na fé, não apenas inspiração passageira.',
    priceOriginal: 'R$ 29,90',
    price: 'R$ 19,90',
    badge: 'Devocional',
    badgeColor: 'bg-[#C08261]/15 text-[#C08261]',
    pages: '365 reflexões',
    format: 'PDF',
    cover: devocCoverImg,
    coverWebp: devocCoverWebp,
  },
  {
    id: 'kit',
    link: LINK_KIT,
    title: 'Kit Completo do Despertar',
    subtitle: 'Os dois livros + bônus exclusivos',
    description:
      'O kit reúne O Despertar + O Devocional com desconto especial, além de materiais bônus exclusivos para quem quer ir mais fundo na jornada. A escolha de quem leva a fé a sério.',
    priceOriginal: 'R$ 64,80',
    price: 'R$ 39,90',
    badge: 'Melhor valor',
    badgeColor: 'bg-amber-500/15 text-amber-700',
    pages: '2 ebooks',
    format: '+ bônus',
    cover: kitCoverImg,
    coverWebp: kitCoverWebp,
  },
];

// ── Emojis dos discípulos ─────────────────────────────────────────────────────
const DISCIPLE_EMOJIS: Record<string, string> = {
  andre_conector: '🤝',
  pedro_faisca: '🔥',
  joao_guardiao: '🕊️',
  tiago_profeta: '📢',
  filipe_questionador: '🔍',
  natanael_honesto: '🪞',
  mateus_restaurado: '✨',
  tome_investigador: '🔬',
  tiago_alfeu_fiel: '🌿',
  tadeu_intercessor: '🙏',
  simao_ativador: '⚡',
  paulo_semeador: '🌱',
};

export default function ApoiarSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4 py-2">

      {/* ── Header ── */}
      <div className="text-center space-y-4 border-b border-stone-100 pb-8">
        <span className="text-[10px] font-mono uppercase bg-[#C08261]/10 text-[#C08261] px-3 py-1 rounded-full font-bold tracking-widest inline-block">
          ✦ Sustente o Movimento
        </span>
        <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-800 leading-tight tracking-tight">
          Leve o Despertar para<br />
          <span className="text-[#C08261]">dentro de casa</span>
        </h2>
        <p className="text-stone-500 text-sm max-w-xl mx-auto leading-relaxed font-sans">
          Além das leituras gratuitas, estas obras completas aprofundam sua jornada espiritual
          com conteúdo exclusivo, devocional diário estruturado e o kit completo para transformação real.
        </p>
      </div>

      {/* ── 3 Livros principais com capas ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LIVROS_PRINCIPAIS.map((livro, index) => (
            <motion.div
              key={livro.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative flex flex-col rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 ${
                livro.id === 'kit'
                  ? 'bg-stone-900 border-stone-700 text-white'
                  : 'bg-white border-stone-200'
              }`}
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className={`text-[9px] font-mono uppercase tracking-wider font-black px-2.5 py-1 rounded-full ${livro.badgeColor}`}>
                  {livro.id === 'kit' ? '⭐ ' : ''}{livro.badge}
                </span>
              </div>

              {/* Capa */}
              <div className={`relative flex items-center justify-center pt-10 pb-4 px-6 ${
                livro.id === 'kit' ? 'bg-stone-800' : 'bg-stone-50'
              }`}>
                <picture>
                  <source srcSet={livro.coverWebp} type="image/webp" />
                  <img
                    src={livro.cover}
                    alt={`Capa ${livro.title}`}
                    className={`rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:scale-[1.03] transition duration-300 ${
                      livro.id === 'kit'
                        ? 'w-full max-w-[160px]'
                        : 'w-28 h-40 object-cover border-l-4 border-stone-900'
                    }`}
                  />
                </picture>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-5 space-y-3">
                <div>
                  <h3 className={`font-serif text-base font-bold leading-snug ${
                    livro.id === 'kit' ? 'text-white' : 'text-stone-800'
                  }`}>
                    {livro.title}
                  </h3>
                  <p className={`text-[11px] font-mono mt-0.5 ${
                    livro.id === 'kit' ? 'text-[#C08261]' : 'text-[#C08261]'
                  }`}>
                    {livro.subtitle}
                  </p>
                </div>

                <p className={`text-xs leading-relaxed flex-1 ${
                  livro.id === 'kit' ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  {livro.description}
                </p>

                {/* Detalhes */}
                <div className={`flex gap-2 text-[10px] font-mono ${
                  livro.id === 'kit' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  <span className={`px-2 py-0.5 rounded ${
                    livro.id === 'kit' ? 'bg-stone-800' : 'bg-stone-100'
                  }`}>{livro.pages}</span>
                  <span className={`px-2 py-0.5 rounded ${
                    livro.id === 'kit' ? 'bg-stone-800' : 'bg-stone-100'
                  }`}>{livro.format}</span>
                </div>

                {/* Preço */}
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs line-through ${
                    livro.id === 'kit' ? 'text-stone-600' : 'text-stone-400'
                  }`}>{livro.priceOriginal}</span>
                  <span className="font-mono font-black text-[#C08261] text-sm">{livro.price}</span>
                </div>

                {/* CTA */}
                <a
                  href={livro.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-mono uppercase tracking-wider font-black transition shadow-sm ${
                    livro.id === 'kit'
                      ? 'bg-[#C08261] hover:bg-[#A96D4D] text-white'
                      : 'bg-stone-900 hover:bg-black text-white'
                  }`}
                >
                  <BookOpen size={12} />
                  <span>
                    {livro.id === 'kit' ? 'Adquirir Kit' : 'Adquirir'} por {livro.price}
                  </span>
                  <ArrowRight size={11} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Garantias */}
        <div className="flex items-center justify-center gap-6 text-[10px] text-stone-400 flex-wrap pt-1">
          <span className="flex items-center gap-1">
            <Shield size={11} className="text-emerald-500" />
            Compra 100% segura via Kiwify
          </span>
          <span className="flex items-center gap-1">
            <Sparkles size={11} />
            Entrega imediata no e-mail
          </span>
          <span className="flex items-center gap-1">
            <Check size={11} />
            Sem assinatura
          </span>
        </div>
      </div>

      {/* ── Manifesto do Apoio ── */}
      <div className="bg-[#fdfaf7] border border-[#C08261]/20 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C08261]/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-[#C08261]">
            <Coffee size={18} />
            <span className="font-mono text-xs uppercase font-black tracking-widest">Uma palavra honesta</span>
          </div>
          <p className="font-serif text-lg text-stone-700 leading-relaxed">
            "Escrevi cada um desses livros durante anos — noites, madrugadas, momentos de silêncio
            roubados do caos. Não são produtos. São conversas que eu precisava ter com alguém."
          </p>
          <p className="text-stone-500 text-sm font-sans leading-relaxed">
            Cada ebook adquirido sustenta diretamente a continuidade deste site, dos recursos gratuitos
            disponíveis aqui e do trabalho de construir comunidade real no Brasil.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Heart size={14} className="text-[#C08261]" />
            <span className="text-xs font-mono text-stone-500">
              100% do valor vai diretamente para o movimento
            </span>
          </div>
        </div>
      </div>

      {/* ── Coleção dos Discípulos ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl text-stone-800 font-light">
            A Coleção dos Discípulos
          </h3>
          <span className="text-xs font-mono text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
            {DESPERTAR_EBOOKS.length} títulos
          </span>
        </div>
        <p className="text-stone-500 text-sm font-sans leading-relaxed">
          Doze discípulos. Doze identidades espirituais. Uma coleção que não fala sobre heróis distantes —
          fala sobre quem você já é, ou está se tornando.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DESPERTAR_EBOOKS.map((book, index) => {
            const emoji = DISCIPLE_EMOJIS[book.id] || '📖';
            const isExpanded = expandedId === book.id;

            return (
              <motion.div
                key={book.id}
                layout
                className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:border-[#C08261]/30 transition-all duration-300 shadow-sm"
              >
                {/* Card Header */}
                <button
                  onClick={() => toggleExpand(book.id)}
                  className="w-full text-left p-4 flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C08261]/10 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-mono text-[#C08261] uppercase tracking-wider font-bold">
                        {book.subtitle}
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-stone-800 leading-tight">
                      {book.title}
                    </h4>
                    <p className="text-[12px] text-stone-500 mt-1 leading-relaxed line-clamp-2 font-sans">
                      {book.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-stone-400 group-hover:text-[#C08261] transition mt-1">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded Preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3">
                        {book.chapters[0] && (
                          <div className="bg-stone-50/70 rounded-xl p-3 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold tracking-wider">
                              Prévia — {book.chapters[0].title}
                            </span>
                            <p className="text-[13px] font-serif text-stone-600 leading-relaxed italic line-clamp-4">
                              {book.chapters[0].content.substring(0, 220)}...
                            </p>
                          </div>
                        )}
                        <a
                          href={EBOOK_SITE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#C08261] hover:bg-[#A96D4D] text-white text-xs font-mono uppercase tracking-wider font-black rounded-xl transition shadow-sm"
                        >
                          <BookOpen size={13} />
                          <span>Adquirir este Livro</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CTA Final ── */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-center space-y-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#C08261]/10 rounded-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h3 className="font-serif text-2xl md:text-3xl text-white font-light leading-tight">
            Cada livro é um convite.<br />
            <span className="text-[#C08261]">Não uma transação.</span>
          </h3>
          <p className="text-stone-400 text-sm max-w-md mx-auto font-sans leading-relaxed">
            Se um único capítulo mudar a forma como você vê a si mesmo, o investimento
            já valeu. E o movimento continua vivo por mais um dia.
          </p>
          <a
            href={EBOOK_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C08261] hover:bg-[#A96D4D] text-white font-mono uppercase tracking-wider text-sm font-black rounded-2xl transition shadow-lg"
          >
            <Sparkles size={15} />
            <span>Ver Todos os Livros</span>
            <ExternalLink size={13} />
          </a>
          <p className="text-stone-500 text-[11px] font-mono">
            somosodespertar.com.br
          </p>
        </div>
      </div>

    </div>
  );
}

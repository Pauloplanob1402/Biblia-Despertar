/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ArrowRight, Check, Star, Users, Sparkles, Shield } from 'lucide-react';
import bookCoverImg from '../assets/images/book_cover_1780394449410.png';

interface LivrosDespertarProps {
  currentUser: any;
  userProfile: any;
}

// ─── Links Kiwify ────────────────────────────────────────────────────────────
const LINK_DESPERTAR    = 'https://pay.kiwify.com.br/JRqrznH';
const LINK_DEVOCIONAIS  = 'https://pay.kiwify.com.br/X23KvCQ';
const LINK_KIT          = 'https://pay.kiwify.com.br/Fbksh0o';

// ─── Capas (imagens hospedadas no projeto) ───────────────────────────────────
// bookCoverImg  → capa d"O Despertar" (livro 1) — já importada acima
// CAPA_KIT      → imagem do kit dos dois livros  (ChatGPT_Image…_23_44_56.png)
// CAPA_DEVOC    → capa do Devocional             (ChatGPT_Image…_23_47_58.png)
//
// Como as imagens do ChatGPT estão em /src/assets/images, importe-as abaixo
// depois de mover os arquivos para essa pasta.  Enquanto isso, usamos os
// imports com caminhos relativos que você pode ajustar.
import kitCoverImg   from '../assets/images/book_cover_kit.png';
import devocCoverImg from '../assets/images/book_cover_devocional.png';

// ─── Dados dos produtos ───────────────────────────────────────────────────────
const LIVROS = [
  {
    id: 'despertar',
    link: LINK_DESPERTAR,
    title: 'O Despertar',
    subtitle: 'A geração que voltou a ouvir a voz de Deus',
    description:
      'Em uma época de distrações, ansiedade e vazio espiritual, este livro é um convite para ouvir o Pai, encontrar propósito e viver uma fé autêntica. Mais do que páginas — é o início de um movimento.',
    priceOriginal: 'R$ 34,90',
    price: 'R$ 24,90',
    badge: 'Mais lido',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
    pages: '142 páginas',
    format: 'PDF + EPUB',
    cover: bookCoverImg,
    highlights: [
      'Como reconectar com o silêncio e ouvir a voz de Deus',
      'Da religião de fachada para uma fé que transforma',
      'A mesa como altar: comunhão que restaura famílias',
    ],
  },
  {
    id: 'devocionais',
    link: LINK_DEVOCIONAIS,
    title: 'O Despertar Devocional',
    subtitle: 'Devocionais diários para despertar fé, transformação e propósito',
    description:
      'Quarenta reflexões práticas e honestas para começar o dia com o Pai antes de abrir qualquer outra tela. Cada devocional cabe em 7 minutos — e muda o tom de todo o dia.',
    priceOriginal: 'R$ 29,90',
    price: 'R$ 19,90',
    badge: 'Aliança de Manhã',
    badgeColor: 'bg-[#C08261]/15 text-[#C08261] border-[#C08261]/20',
    pages: '98 páginas',
    format: 'PDF + EPUB',
    cover: devocCoverImg,
    highlights: [
      '40 reflexões para 40 dias de quietude matinal',
      'Versículo, meditação e desafio prático por dia',
      'Formato de 7 minutos — sem culpa, sem fardo',
    ],
  },
] as const;

type SelectOption = 'despertar' | 'devocionais' | 'kit';

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LivrosDespertar({ currentUser, userProfile }: LivrosDespertarProps) {
  const [selected, setSelected] = useState<SelectOption>('kit'); // Kit selecionado por padrão (opção de maior valor)
  const [mode, setMode] = useState<'self' | 'gift'>('self');
  const [giftName, setGiftName]   = useState('');
  const [giftEmail, setGiftEmail] = useState('');

  const precoKit         = 'R$ 34,80';
  const precoKitOriginal = 'R$ 64,80';

  const handleComprar = () => {
    if (selected === 'kit') {
      window.open(LINK_KIT, '_blank');
      return;
    }
    const livro = LIVROS.find(l => l.id === selected);
    if (livro) window.open(livro.link, '_blank');
  };

  const livroAtivo = selected === 'kit' ? null : LIVROS.find(l => l.id === selected)!;

  // Preço mostrado no CTA
  const precoLabel =
    selected === 'kit'
      ? precoKit
      : LIVROS.find(l => l.id === selected)?.price ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-10 text-left pb-16"
    >
      {/* ── Header ── */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C08261] font-bold">
          Livros Oficiais
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-850 leading-tight">
          O Despertar em Palavras
        </h2>
        <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-xl">
          Dois livros escritos para equipar sua mesa, aprofundar sua fé e transformar a forma como você começa cada dia.
        </p>
      </div>

      {/* ── Prova social ── */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-[#C08261]" />
          <span>+1.200 leitores ativos</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span>4,9 de avaliação média</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#C08261]" />
          <span>Entrega imediata por e-mail</span>
        </span>
      </div>

      {/* ── Seletor de produto — 3 opções ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Kit — destaque máximo, selecionado por padrão */}
        <button
          onClick={() => setSelected('kit')}
          className={`relative p-4 rounded-2xl border-2 text-left transition space-y-2 md:order-3 ${
            selected === 'kit'
              ? 'border-[#C08261] bg-orange-50/60 shadow-md ring-2 ring-[#C08261]/10'
              : 'border-amber-200 bg-amber-50/40 hover:border-[#C08261]/50'
          }`}
        >
          {/* Selo "Melhor escolha" */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono uppercase tracking-wider font-black px-3 py-1 rounded-full bg-[#C08261] text-white shadow">
            ✦ Melhor escolha
          </span>
          <span className="inline-block text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 mt-2">
            Kit — Economize R$ 10
          </span>
          <div>
            <p className="font-serif font-semibold text-stone-850 text-sm leading-snug">Os Dois Livros</p>
            <p className="text-[11px] text-stone-500 mt-0.5">O Despertar + Devocional</p>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-stone-400 line-through">{precoKitOriginal}</span>
            <span className="font-mono font-black text-[#C08261] text-sm">{precoKit}</span>
          </div>
          {selected === 'kit' && (
            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C08261] flex items-center justify-center">
              <Check size={11} className="text-white" />
            </span>
          )}
        </button>

        {/* Livros individuais */}
        {LIVROS.map((livro, idx) => (
          <button
            key={livro.id}
            onClick={() => setSelected(livro.id)}
            className={`relative p-4 rounded-2xl border-2 text-left transition space-y-2 ${
              idx === 0 ? 'md:order-1' : 'md:order-2'
            } ${
              selected === livro.id
                ? 'border-[#C08261] bg-orange-50/60 shadow-sm'
                : 'border-stone-150 bg-white hover:border-stone-250 hover:bg-stone-50'
            }`}
          >
            <span className={`inline-block text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${livro.badgeColor}`}>
              {livro.badge}
            </span>
            <div>
              <p className="font-serif font-semibold text-stone-850 text-sm leading-snug">{livro.title}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">{livro.subtitle}</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-stone-400 line-through">{livro.priceOriginal}</span>
              <span className="font-mono font-black text-[#C08261] text-sm">{livro.price}</span>
            </div>
            {selected === livro.id && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C08261] flex items-center justify-center">
                <Check size={11} className="text-white" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Painel de detalhes animado ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
        >
          {/* Capa */}
          <div className="md:col-span-4 flex justify-center">
            {selected === 'kit' ? (
              /* Capa do Kit — imagem do marketing com os dois livros */
              <div className="relative w-56 md:w-64">
                <img
                  src={kitCoverImg}
                  alt="Kit O Despertar — 2 livros"
                  className="w-full rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition duration-300"
                />
                <span className="absolute -top-3 -right-3 bg-stone-900 text-[#DCAE6C] text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-[#DCAE6C]/20">
                  2 livros
                </span>
              </div>
            ) : (
              /* Capa individual */
              <img
                src={livroAtivo!.cover}
                alt={`Capa ${livroAtivo!.title}`}
                className="w-36 h-52 object-cover rounded-r-xl rounded-l-sm shadow-[6px_10px_24px_rgba(0,0,0,0.25)] border-l-4 border-stone-900 hover:scale-[1.02] transition duration-300"
              />
            )}
          </div>

          {/* Informações + CTA */}
          <div className="md:col-span-8 space-y-5">

            {/* Texto do produto */}
            {selected === 'kit' ? (
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold text-stone-850">Kit Completo do Despertar</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Os dois livros juntos para uma jornada completa: leia <em>O Despertar</em> para mudar sua visão de fé, e use o <em>Devocional</em> para viver isso todo dia de manhã. Um propósito: transformar vidas.
                </p>
                <div className="space-y-1.5">
                  {[
                    'Direção para sua caminhada espiritual',
                    'Reflexões profundas e inspiradoras',
                    'Devocionais práticos para o dia a dia',
                    'Fortalecimento da fé e da esperança',
                    'Ferramentas para desenvolver intimidade com Deus',
                    'Incentivo para viver o propósito para o qual foi criado',
                  ].map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <Check size={14} className="text-[#C08261] mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-serif text-xl font-semibold text-stone-850">{livroAtivo!.title}</h3>
                  <div className="flex gap-2 text-[10px] font-mono text-stone-400">
                    <span className="bg-stone-100 px-2 py-0.5 rounded">{livroAtivo!.pages}</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded">{livroAtivo!.format}</span>
                  </div>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed">{livroAtivo!.description}</p>
                <div className="space-y-1.5">
                  {livroAtivo!.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <Check size={14} className="text-[#C08261] mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modo: para mim ou presente */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('self')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                  mode === 'self'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >
                📥 Para mim
              </button>
              <button
                onClick={() => setMode('gift')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                  mode === 'gift'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >
                🎁 Presentear alguém
              </button>
            </div>

            <AnimatePresence>
              {mode === 'gift' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-500 uppercase font-bold">Nome de quem recebe</label>
                    <input
                      type="text"
                      placeholder="Ex: Maria de Souza"
                      value={giftName}
                      onChange={e => setGiftName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-sm text-stone-700 focus:outline-none focus:border-[#C08261]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-500 uppercase font-bold">E-mail para entrega</label>
                    <input
                      type="email"
                      placeholder="Ex: maria@email.com"
                      value={giftEmail}
                      onChange={e => setGiftEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-sm text-stone-700 focus:outline-none focus:border-[#C08261]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CTA principal ── */}
            <button
              onClick={handleComprar}
              className="w-full py-4 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 group"
            >
              <BookOpen size={16} />
              <span>
                {mode === 'gift'
                  ? `Presentear com ${selected === 'kit' ? 'o Kit' : 'este livro'}`
                  : `${selected === 'kit' ? 'Adquirir o Kit' : 'Adquirir agora'} — ${precoLabel}`}
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </button>

            {/* Garantias */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400 flex-wrap">
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

            {/* Tagline final */}
            <p className="text-center text-[11px] font-mono text-stone-300 uppercase tracking-wider">
              Desperte. Cresça. Caminhe com Deus.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Separador ── */}
      <hr className="border-stone-100" />

      {/* ── Upsell suave: conteúdo também está no app ── */}
      <div className="bg-stone-50 border border-stone-150 rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#C08261]/10 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-[#C08261]" />
          </div>
          <div className="space-y-1">
            <p className="font-serif font-semibold text-stone-850">Já tem o livro? Leia aqui dentro.</p>
            <p className="text-sm text-stone-500 leading-relaxed">
              Os conteúdos do Despertar também estão disponíveis na seção <strong>Devocional Diário</strong> do app — com destaque do versículo do dia, reflexão prática e modo de leitura exclusivo.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

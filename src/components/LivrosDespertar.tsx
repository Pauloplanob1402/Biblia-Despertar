/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Gift, ArrowRight, Check, Star, Users, Sparkles } from 'lucide-react';
import bookCoverImg from '../assets/images/book_cover_1780394449410.png';

interface LivrosDespertarProps {
  currentUser: any;
  userProfile: any;
}

const LIVROS = [
  {
    id: 'despertar',
    kiwifyId: 'JRqrznH',
    title: 'O Despertar',
    subtitle: 'A geração que voltou a ouvir a voz de Deus',
    description: 'Em uma época de distrações, ansiedade e vazio espiritual, este livro é um convite para ouvir o Pai, encontrar propósito e viver uma fé autêntica. Mais do que páginas — é o início de um movimento.',
    priceOriginal: 'R$ 34,90',
    price: 'R$ 24,90',
    badge: 'Mais lido',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    credits: 12,
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
    kiwifyId: 'X23KvCQ',
    title: 'Devocionais Diários',
    subtitle: '40 reflexões para despertar sua manhã',
    description: 'Quarenta reflexões práticas e honestas para começar o dia com o Pai antes de abrir qualquer outra tela. Cada devocional cabe em 7 minutos — e muda o tom de todo o dia.',
    priceOriginal: 'R$ 29,90',
    price: 'R$ 19,90',
    badge: 'Aliança de Manhã',
    badgeColor: 'bg-[#C08261]/15 text-[#C08261] border-[#C08261]/20',
    credits: 8,
    pages: '98 páginas',
    format: 'PDF + EPUB',
    cover: null,
    highlights: [
      '40 reflexões para 40 dias de quietude matinal',
      'Versículo, meditação e desafio prático por dia',
      'Formato de 7 minutos — sem culpa, sem fardo',
    ],
  },
];

const KIT_DESCONTO = 10; // R$ de desconto no kit

export default function LivrosDespertar({ currentUser, userProfile }: LivrosDespertarProps) {
  // Nudge: livro 1 selecionado por padrão (ancoragem + opção dominante)
  const [selected, setSelected] = useState<'despertar' | 'devocionais' | 'kit'>('despertar');
  const [mode, setMode] = useState<'self' | 'gift'>('self');
  const [giftName, setGiftName] = useState('');
  const [giftEmail, setGiftEmail] = useState('');

  const getLinkDespertar = () =>
    localStorage.getItem('kiwify_link_despertar') || 'https://pay.kiwify.com.br/JRqrznH';
  const getLinkDevocionais = () =>
    localStorage.getItem('kiwify_link_devocionais') || 'https://pay.kiwify.com.br/X23KvCQ';

  const handleComprar = () => {
    if (selected === 'kit') {
      // Abre os dois em sequência
      window.open(getLinkDespertar(), '_blank');
      setTimeout(() => window.open(getLinkDevocionais(), '_blank'), 800);
      return;
    }
    const url = selected === 'despertar' ? getLinkDespertar() : getLinkDevocionais();
    window.open(url, '_blank');
  };

  const livroAtivo = selected === 'kit' ? null : LIVROS.find(l => l.id === selected)!;

  const precoKit = `R$ ${(24.90 + 19.90 - KIT_DESCONTO).toFixed(2).replace('.', ',')}`;
  const precoKitOriginal = `R$ ${(34.90 + 29.90).toFixed(2).replace('.', ',')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-10 text-left pb-16"
    >
      {/* Header */}
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

      {/* Prova social */}
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

      {/* Seletor de livro — Nudge: 3 opções, padrão = livro 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LIVROS.map((livro) => (
          <button
            key={livro.id}
            onClick={() => setSelected(livro.id as any)}
            className={`relative p-4 rounded-2xl border-2 text-left transition space-y-2 ${
              selected === livro.id
                ? 'border-[#C08261] bg-orange-50/60 shadow-sm'
                : 'border-stone-150 bg-white hover:border-stone-250 hover:bg-stone-50'
            }`}
          >
            {/* Nudge: badge "Mais lido" no livro padrão */}
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

        {/* Kit — Nudge: ancoragem de desconto */}
        <button
          onClick={() => setSelected('kit')}
          className={`relative p-4 rounded-2xl border-2 text-left transition space-y-2 ${
            selected === 'kit'
              ? 'border-[#C08261] bg-orange-50/60 shadow-sm'
              : 'border-stone-150 bg-white hover:border-stone-250 hover:bg-stone-50'
          }`}
        >
          <span className="inline-block text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Kit completo — Economize R$ {KIT_DESCONTO}
          </span>
          <div>
            <p className="font-serif font-semibold text-stone-850 text-sm leading-snug">Os Dois Livros</p>
            <p className="text-[11px] text-stone-500 mt-0.5">O Despertar + Devocionais Diários</p>
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
      </div>

      {/* Detalhes do livro selecionado */}
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
              <div className="relative">
                <div className="w-32 h-48 rounded-r-xl rounded-l-sm shadow-xl border-l-4 border-stone-900 bg-gradient-to-br from-[#1B2936] to-[#060A0D] flex items-center justify-center absolute -left-4 top-3 opacity-70">
                  <BookOpen size={24} className="text-[#DCAE6C]/60" />
                </div>
                <img
                  src={bookCoverImg}
                  alt="Capa O Despertar"
                  className="w-32 h-48 object-cover rounded-r-xl rounded-l-sm shadow-[6px_10px_24px_rgba(0,0,0,0.3)] border-l-4 border-stone-900 relative"
                />
              </div>
            ) : livroAtivo?.cover ? (
              <img
                src={livroAtivo.cover}
                alt={`Capa ${livroAtivo.title}`}
                className="w-36 h-52 object-cover rounded-r-xl rounded-l-sm shadow-[6px_10px_24px_rgba(0,0,0,0.25)] border-l-4 border-stone-900 hover:scale-[1.02] transition"
              />
            ) : (
              <div className="w-36 h-52 rounded-r-xl rounded-l-sm shadow-xl border-l-4 border-stone-900 bg-gradient-to-br from-[#1B2936] via-[#101921] to-[#060A0D] flex flex-col items-center justify-center gap-3 p-5">
                <BookOpen size={28} className="text-[#DCAE6C]/70" />
                <span className="font-serif text-xs text-stone-300 text-center leading-snug">{livroAtivo?.title}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-8 space-y-5">
            {selected === 'kit' ? (
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-semibold text-stone-850">Kit Completo do Despertar</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Os dois livros juntos para uma jornada completa: leia O Despertar para mudar sua visão de fé, e use os Devocionais Diários para viver isso todo dia de manhã.
                </p>
                <div className="space-y-1.5">
                  {[...LIVROS[0].highlights, ...LIVROS[1].highlights.slice(0, 1)].map((h, i) => (
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
                  <h3 className="font-serif text-xl font-semibold text-stone-850">{livroAtivo?.title}</h3>
                  <div className="flex gap-2 text-[10px] font-mono text-stone-400">
                    <span className="bg-stone-100 px-2 py-0.5 rounded">{livroAtivo?.pages}</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded">{livroAtivo?.format}</span>
                  </div>
                </div>
                <p className="text-stone-500 text-sm leading-relaxed">{livroAtivo?.description}</p>
                <div className="space-y-1.5">
                  {livroAtivo?.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <Check size={14} className="text-[#C08261] mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modo: para mim ou presente — Nudge: "para mim" já selecionado */}
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

            {/* CTA principal — único, claro, sem ruído */}
            <button
              onClick={handleComprar}
              className="w-full py-3.5 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-2xl shadow transition flex items-center justify-center gap-2 group"
            >
              <BookOpen size={16} />
              <span>
                {mode === 'gift'
                  ? `Presentear com ${selected === 'kit' ? 'o Kit' : 'este livro'}`
                  : `Adquirir ${selected === 'kit' ? 'o Kit' : 'agora'} — ${selected === 'kit' ? precoKit : livroAtivo?.price}`}
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </button>

            <p className="text-[10px] text-stone-400 text-center">
              Compra segura via Kiwify · Entrega imediata no e-mail · Sem assinatura
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Separador */}
      <hr className="border-stone-100" />

      {/* Bloco devocional grátis — upsell suave para ler dentro do app */}
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

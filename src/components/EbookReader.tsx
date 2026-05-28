/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DESPERTAR_EBOOKS } from '../data/ebooks';
import { Ebook } from '../types';
import { BookOpen, AlertCircle, ShoppingBag, Lock, Check, ChevronLeft, ChevronRight, Minimize2, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EbookReaderProps {
  completedChapters: string[];
  onCompleteChapter: (ebookId: string, chapterIdx: number) => void;
}

export default function EbookReader({ completedChapters, onCompleteChapter }: EbookReaderProps) {
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [unlockedBooks, setUnlockedBooks] = useState<string[]>([]);
  const [showBillingDialog, setShowBillingDialog] = useState<boolean>(false);
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);

  // Reader cosmetic settings
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerTheme, setReaderTheme] = useState<'ivory' | 'white' | 'dark'>('ivory');

  const handleBookClick = (book: Ebook) => {
    if (book.isPremium && !unlockedBooks.includes(book.id)) {
      setSelectedBook(book);
      setShowBillingDialog(true);
    } else {
      setSelectedBook(book);
      setActiveChapterIndex(0);
      setIsReadingMode(false);
    }
  };

  const handleSimulatedPurchase = () => {
    if (selectedBook) {
      setUnlockedBooks(prev => [...prev, selectedBook.id]);
      setShowBillingDialog(false);
      setActiveChapterIndex(0);
      setIsReadingMode(true);
    }
  };

  const currentChapter = selectedBook?.chapters[activeChapterIndex];

  const getFontClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-base';
      case 'md': return 'text-lg';
      case 'lg': return 'text-xl md:text-2xl';
      case 'xl': return 'text-2xl md:text-3xl';
    }
  };

  const getThemeClass = () => {
    switch (readerTheme) {
      case 'white': return 'bg-white text-stone-800';
      case 'ivory': return 'bg-[#FAF6F0] text-stone-850 border border-[#eddcc4]/40';
      case 'dark': return 'bg-[#1C1A18] text-stone-200';
    }
  };

  const isChapterRead = (ebookId: string, idx: number) => {
    return completedChapters.includes(`${ebookId}_${idx}`);
  };

  return (
    <div className="space-y-6">
      {/* Catalog Home View */}
      {!isReadingMode ? (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C08261] font-bold">Livros da Jornada</span>
            <h3 className="font-serif text-3xl font-light text-stone-800">Cultura de Graça</h3>
            <p className="text-stone-500 text-sm">
              Explore os livros e guias oficiais do movimento O Despertar. Leituras leves e transformadoras para renovar sua caminhada sem o peso de performances.
            </p>
          </div>

          <div id="ebooks-catalog-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {DESPERTAR_EBOOKS.map((book) => {
              const isLocked = book.isPremium && !unlockedBooks.includes(book.id);
              return (
                <div
                  id={`ebook-card-${book.id}`}
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between h-80 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 group-hover:bg-[#C08261]/5 transition-colors rounded-bl-full -z-10" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase ${
                        isLocked 
                          ? 'bg-amber-100/80 text-amber-900 border border-amber-200/50' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isLocked ? 'Premium' : 'Livre'}
                      </span>
                      {isLocked && <Lock size={12} className="text-amber-600 animate-pulse" />}
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-medium text-stone-800 group-hover:text-[#C08261] transition-colors">{book.title}</h4>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">{book.author}</p>
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-4">{book.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400 font-medium">{book.chapters.length} Capítulos</span>
                    <button
                      id={`btn-open-ebook-${book.id}`}
                      className="text-xs font-semibold text-[#C08261] flex items-center space-x-1 hover:underline"
                    >
                      <span>{isLocked ? 'Comprar' : 'Acessar'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Immersive Reading Mode Panel */
        selectedBook && (
          <div id="ebook-reading-workspace" className="max-w-3xl mx-auto space-y-6">
            {/* Header / Config Bar */}
            <div className="flex flex-wrap items-center justify-between bg-stone-100 rounded-3xl p-4 gap-4">
              <button
                id="btn-reader-exit"
                onClick={() => setIsReadingMode(false)}
                className="flex items-center space-x-1 py-1.5 px-3 hover:bg-stone-200 rounded-xl text-xs text-stone-600 transition"
              >
                <ChevronLeft size={14} />
                <span>Voltar ao Catálogo</span>
              </button>

              {/* Reader Settings and font config */}
              <div className="flex items-center space-x-4">
                {/* Font selector */}
                <div className="flex items-center border-r border-stone-200 pr-4 space-x-1.5">
                  <span className="text-xs text-stone-500 font-mono uppercase mr-1.5">Fonte:</span>
                  <button
                    id="btn-font-sm"
                    onClick={() => setFontSize('sm')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${fontSize === 'sm' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-stone-150/70'}`}
                  >
                    A-
                  </button>
                  <button
                    id="btn-font-md"
                    onClick={() => setFontSize('md')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${fontSize === 'md' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-stone-150/70'}`}
                  >
                    A
                  </button>
                  <button
                    id="btn-font-lg"
                    onClick={() => setFontSize('lg')}
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold ${fontSize === 'lg' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-stone-150/70'}`}
                  >
                    A+
                  </button>
                  <button
                    id="btn-font-xl"
                    onClick={() => setFontSize('xl')}
                    className={`px-2.5 py-1.5 rounded-lg text-base font-semibold ${fontSize === 'xl' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-stone-150/70'}`}
                  >
                    A++
                  </button>
                </div>

                {/* Reader themes */}
                <div className="flex items-center space-x-1.5">
                  <button
                    id="theme-ivory"
                    onClick={() => setReaderTheme('ivory')}
                    className={`w-5 h-5 rounded-full bg-[#FAF6F0] border ${readerTheme === 'ivory' ? 'ring-1 ring-amber-700 border-transparent scale-105' : 'border-stone-300'}`}
                    title="Ivory"
                  />
                  <button
                    id="theme-white"
                    onClick={() => setReaderTheme('white')}
                    className={`w-5 h-5 rounded-full bg-white border ${readerTheme === 'white' ? 'ring-1 ring-amber-700 border-transparent scale-105' : 'border-stone-300'}`}
                    title="White"
                  />
                  <button
                    id="theme-dark"
                    onClick={() => setReaderTheme('dark')}
                    className={`w-5 h-5 rounded-full bg-[#1C1A18] border ${readerTheme === 'dark' ? 'ring-1 ring-stone-300 border-transparent scale-105' : 'border-stone-500'}`}
                    title="Night Mode"
                  />
                </div>
              </div>
            </div>

            {/* Book Reader Shell */}
            <div className={`p-8 md:p-12 rounded-3xl min-h-[480px] shadow-sm flex flex-col justify-between transition-all ${getThemeClass()}`}>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200/20 pb-4 mb-4">
                  <span className="font-mono text-xs uppercase text-amber-700/60 font-semibold tracking-wide">{selectedBook.title}</span>
                  <span className="font-mono text-[10px] text-stone-400">Tempo: {currentChapter?.estimatedReadTime} min</span>
                </div>

                {currentChapter && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-800 tracking-tight leading-normal">
                      {currentChapter.title}
                    </h2>
                    <p className={`font-serif leading-relaxed text-justify space-y-4 whitespace-pre-line ${getFontClass()}`}>
                      {currentChapter.content}
                    </p>

                    {/* Contemplative Chapter Ending Actions following movement guidelines */}
                    <div className="mt-12 pt-8 border-t border-stone-200/20 space-y-6">
                      <div className="text-center font-serif italic text-sm md:text-base text-stone-600 font-medium">
                        O que queima no seu coração agora?
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-3">
                        {activeChapterIndex < selectedBook.chapters.length - 1 ? (
                          <button
                            id="btn-cozy-next"
                            onClick={() => {
                              onCompleteChapter(selectedBook.id, activeChapterIndex);
                              setActiveChapterIndex(idx => idx + 1);
                            }}
                            className="px-5 py-2.5 bg-[#C08261] hover:bg-[#b07353] text-white text-sm font-semibold rounded-xl tracking-wide transition shadow-xs"
                          >
                            Continue caminhando
                          </button>
                        ) : (
                          <button
                            id="btn-cozy-finish"
                            onClick={() => {
                              onCompleteChapter(selectedBook.id, activeChapterIndex);
                              setIsReadingMode(false);
                            }}
                            className="px-5 py-2.5 bg-[#C08261] hover:bg-[#b07353] text-white text-sm font-semibold rounded-xl tracking-wide transition shadow-xs"
                          >
                            Concluir esta leitura
                          </button>
                        )}

                        <button
                          id="btn-cozy-dark"
                          onClick={() => {
                            setReaderTheme(readerTheme === 'dark' ? 'ivory' : 'dark');
                          }}
                          className="px-5 py-2.5 bg-stone-500/10 hover:bg-stone-500/15 text-stone-700 text-sm font-medium rounded-xl transition"
                        >
                          {readerTheme === 'dark' ? 'Iluminar leitura' : 'Ler em silêncio (Modo Escuro)'}
                        </button>

                        <button
                          id="btn-cozy-quiet"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('change-section', { detail: 'home' }));
                          }}
                          className="px-5 py-2.5 bg-stone-500/10 hover:bg-stone-500/15 text-stone-700 text-sm font-medium rounded-xl transition"
                        >
                          Sentar mais um pouco (Respirar)
                        </button>

                        <button
                          id="btn-cozy-table"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('change-section', { detail: 'mesas' }));
                          }}
                          className="px-5 py-2.5 bg-[#8C6239]/10 hover:bg-[#8C6239]/15 text-[#8C6239] text-sm font-semibold rounded-xl transition border border-[#8C6239]/20"
                        >
                          Levar isso para uma Mesa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Control and Checkmark */}
              <div className="border-t border-stone-200/20 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  id="btn-complete-chapter"
                  onClick={() => onCompleteChapter(selectedBook.id, activeChapterIndex)}
                  className={`flex items-center space-x-1.5 px-4.5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                    isChapterRead(selectedBook.id, activeChapterIndex)
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-800/90 text-white hover:bg-stone-900 border border-stone-800'
                  }`}
                >
                  <Check size={14} />
                  <span>{isChapterRead(selectedBook.id, activeChapterIndex) ? 'Concluído' : 'Marcar capítulo como lido'}</span>
                </button>

                {/* Chapter pagination */}
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-prev-chapter"
                    disabled={activeChapterIndex === 0}
                    onClick={() => setActiveChapterIndex(idx => idx - 1)}
                    className="p-2 bg-stone-300/20 hover:bg-stone-300/45 text-stone-600 rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-stone-500 font-mono text-xs font-medium">
                    {activeChapterIndex + 1} de {selectedBook.chapters.length}
                  </span>
                  <button
                    id="btn-next-chapter"
                    disabled={activeChapterIndex === selectedBook.chapters.length - 1}
                    onClick={() => setActiveChapterIndex(idx => idx + 1)}
                    className="p-2 bg-stone-300/20 hover:bg-stone-300/45 text-stone-600 rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Simulated AbacatePay Billing Dialog with precise details */}
      <AnimatePresence>
        {showBillingDialog && selectedBook && (
          <motion.div
            id="billing-overlay-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5F3A6]/30 shadow-2xl flex flex-col space-y-6"
            >
              <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2 text-stone-800">
                  <ShoppingBag size={18} className="text-[#C08261]" />
                  <h4 className="font-serif font-semibold text-stone-800">Pagamento via AbacatePay</h4>
                </div>
                <button id="btn-close-billing" onClick={() => setShowBillingDialog(false)} className="text-stone-400 hover:text-stone-700">
                  <Minimize2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FAF6F0] border border-[#eddcc4]/45 p-4 rounded-2xl flex flex-col text-left">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#C08261] mb-1 font-bold">Lendo na Estrada</span>
                  <h5 className="font-serif text-[#8C6239] font-semibold text-base">{selectedBook.title}</h5>
                  <p className="text-stone-500 text-xs mt-1">{selectedBook.subtitle}</p>
                  <div className="mt-4 border-t border-stone-200/50 pt-3 flex justify-between items-center">
                    <span className="text-xs text-stone-500 font-mono">Valor único:</span>
                    <span className="text-base font-bold text-stone-800 font-mono text-[#8C6239]">R$ 19,90</span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl space-y-2 text-justify">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700">
                    <Sparkles size={14} className="text-[#8C6239]" />
                    <span>Entrega Direta no AbacatePay</span>
                  </div>
                  <p className="text-[10px] text-stone-600 leading-relaxed font-sans">
                    Como planejado na nossa cultura horizontal, o <strong>AbacatePay</strong> processa este pagamento em segundos (via Pix ou cartão) e libera o acesso instantaneamente para você continuar sua caminhada.
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-2.5">
                <button
                  id="btn-confirm-billing-checkout"
                  onClick={handleSimulatedPurchase}
                  className="w-full py-3 bg-[#6B8A30] hover:bg-[#587326] text-white font-semibold rounded-2xl text-xs shadow-md transition"
                >
                  Confirmar via AbacatePay (Simulação)
                </button>
                <button
                  id="btn-cancel-billing-checkout"
                  onClick={() => setShowBillingDialog(false)}
                  className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-500 font-semibold rounded-2xl text-xs transition"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

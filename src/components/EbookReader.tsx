/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DESPERTAR_EBOOKS } from '../data/ebooks';
import { Ebook } from '../types';
import { BookOpen, AlertCircle, Check, ChevronLeft, ChevronRight, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EbookReaderProps {
  completedChapters: string[];
  onCompleteChapter: (ebookId: string, chapterIdx: number) => void;
}

export default function EbookReader({ completedChapters, onCompleteChapter }: EbookReaderProps) {
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);

  // Reader cosmetic settings
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerTheme, setReaderTheme] = useState<'ivory' | 'white' | 'dark'>('ivory');

  const handleBookClick = (book: Ebook) => {
    setSelectedBook(book);
    setActiveChapterIndex(0);
    setIsReadingMode(true);
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
      case 'white': return 'bg-white text-stone-850';
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
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C08261] font-bold">Livros da Jornada</span>
            <h3 className="font-serif text-3xl font-light text-stone-800">Cultura de Graça</h3>
            <p className="text-stone-500 text-sm">
              Conheça os 12 inspiradores do movimento O Despertar. Todas as pessoas são diferentes e todas são fundamentais e importantes para o Reino. Leituras livres de performances e máscaras.
            </p>
          </div>

          <div id="ebooks-catalog-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {DESPERTAR_EBOOKS.map((book) => {
              return (
                <div
                  id={`ebook-card-${book.id}`}
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="bg-white border border-stone-250/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between h-[300px] relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 group-hover:bg-[#C08261]/5 transition-colors rounded-bl-full -z-10" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase bg-green-50 text-green-700 border border-green-200/50">
                        LIVRE
                      </span>
                      <BookOpen size={14} className="text-stone-400 group-hover:text-[#C08261] transition-all" />
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-medium text-stone-800 group-hover:text-[#C08261] transition-colors line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-[#C08261] font-mono mt-0.5">{book.subtitle}</p>
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 md:line-clamp-4">{book.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 z-10">
                    <span className="text-[10px] text-stone-400 font-medium">{book.chapters.length} Capítulos</span>
                    <button
                      id={`btn-open-ebook-${book.id}`}
                      className="text-xs font-semibold text-[#C08261] flex items-center space-x-0.5 hover:underline"
                    >
                      <span>Acessar</span>
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
            <div className="flex flex-wrap items-center justify-between bg-stone-100/95 rounded-3xl p-4 gap-4">
              <button
                id="btn-reader-exit"
                onClick={() => setIsReadingMode(false)}
                className="flex items-center space-x-1 py-1.5 px-3 hover:bg-stone-200 rounded-xl text-xs text-stone-600 transition"
              >
                <ChevronLeft size={14} />
                <span>Voltar à Jornada</span>
              </button>

              {/* Reader Settings and font config */}
              <div className="flex items-center space-x-4">
                {/* Font selector */}
                <div className="flex items-center border-r border-stone-200 pr-4 space-x-1.5">
                  <span className="text-[10px] text-stone-500 font-mono uppercase mr-1.5 hidden sm:inline-block">Fonte:</span>
                  <button
                    id="btn-font-sm"
                    onClick={() => setFontSize('sm')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${fontSize === 'sm' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-white shadow-xs'}`}
                  >
                    A-
                  </button>
                  <button
                    id="btn-font-md"
                    onClick={() => setFontSize('md')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${fontSize === 'md' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-white shadow-xs'}`}
                  >
                    A
                  </button>
                  <button
                    id="btn-font-lg"
                    onClick={() => setFontSize('lg')}
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold ${fontSize === 'lg' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-white shadow-xs'}`}
                  >
                    A+
                  </button>
                  <button
                    id="btn-font-xl"
                    onClick={() => setFontSize('xl')}
                    className={`px-2.5 py-1.5 rounded-lg text-base font-semibold ${fontSize === 'xl' ? 'bg-stone-800 text-white font-bold' : 'text-stone-600 hover:bg-stone-200 bg-white shadow-xs'}`}
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
                  <span className="font-mono text-xs uppercase text-[#C08261] font-semibold tracking-wide">{selectedBook.title} ({selectedBook.subtitle})</span>
                  <span className="font-mono text-[10px] text-stone-400">Tempo: {currentChapter?.estimatedReadTime} min</span>
                </div>

                {currentChapter && (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight leading-normal">
                      {currentChapter.title}
                    </h2>
                    <p className={`font-serif leading-relaxed text-justify space-y-4 whitespace-pre-line ${getFontClass()}`}>
                      {currentChapter.content}
                    </p>

                    {/* Contemplative Chapter Ending Actions following movement guidelines */}
                    <div className="mt-12 pt-8 border-t border-stone-200/25 space-y-6">
                      <div className="text-center font-serif italic text-sm md:text-base text-stone-500 font-medium">
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
                          className={`px-5 py-2.5 text-sm font-medium rounded-xl transition ${
                            readerTheme === 'dark' 
                              ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' 
                              : 'bg-stone-150 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {readerTheme === 'dark' ? 'Iluminar leitura' : 'Ler em silêncio (Modo Escuro)'}
                        </button>

                        <button
                          id="btn-cozy-quiet"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('change-section', { detail: 'home' }));
                          }}
                          className={`px-5 py-2.5 text-sm font-medium rounded-xl transition ${
                            readerTheme === 'dark' 
                              ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' 
                              : 'bg-stone-150 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          Sentar mais um pouco (Respirar)
                        </button>

                        <button
                          id="btn-cozy-table"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('change-section', { detail: 'mesas' }));
                          }}
                          className="px-5 py-2.5 bg-[#C08261]/10 hover:bg-[#C08261]/15 text-[#C08261] text-sm font-semibold rounded-xl transition border border-[#C08261]/20"
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
                      ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-250/40'
                      : 'bg-stone-800 text-white hover:bg-stone-900 border border-stone-850'
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
                    className="p-2 bg-stone-300/20 hover:bg-stone-300/40 text-stone-600 rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition"
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
                    className="p-2 bg-stone-300/20 hover:bg-stone-300/40 text-stone-600 rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

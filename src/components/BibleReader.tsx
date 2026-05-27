/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../data/bible';
import { BookOpen, Highlighter, Bookmark, FileText, ChevronRight, X, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BibleReaderProps {
  onAddFavorite: (ref: string, text: string) => void;
  onRemoveFavorite: (ref: string) => void;
  onAddReflection: (ref: string, text: string) => void;
  favorites: { ref: string; text: string }[];
  reflections: { id: string; verseRef: string; reflectionText: string; createdAt: string }[];
}

export default function BibleReader({
  onAddFavorite,
  onRemoveFavorite,
  onAddReflection,
  favorites,
  reflections
}: BibleReaderProps) {
  const [selectedBookId, setSelectedBookId] = useState('salmos');
  const [selectedChapter, setSelectedChapter] = useState<number>(23);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null); // e.g. "salmos_23_3"
  const [highlightedVerses, setHighlightedVerses] = useState<{ [key: string]: string }>({}); // refKey -> colorClass
  const [reflectionText, setReflectionText] = useState('');
  const [showReflectionsPanel, setShowReflectionsPanel] = useState(false);

  const selectedBook = BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[0];
  const chaptersAvailable = Object.keys(selectedBook.chapters).map(Number).sort((a,b)=>a-b);

  // Auto-correct chapter if selected book changes and earlier selected chapter isn't available
  useEffect(() => {
    if (!selectedBook.chapters[selectedChapter]) {
      const firstAvailable = Object.keys(selectedBook.chapters).map(Number).sort((a,b)=>a-b)[0];
      setSelectedChapter(firstAvailable || 1);
    }
    setSelectedVerseKey(null);
  }, [selectedBookId]);

  const verses = selectedBook.chapters[selectedChapter] || [];

  const handleVerseClick = (verseNum: number, verseText: string) => {
    const key = `${selectedBook.id}_${selectedChapter}_${verseNum}`;
    setSelectedVerseKey(prev => prev === key ? null : key);
    
    // Autofill note input if active reflection exists
    const currentRefText = `${selectedBook.name} ${selectedChapter}:${verseNum}`;
    const existingRef = reflections.find(r => r.verseRef === currentRefText);
    setReflectionText(existingRef ? existingRef.reflectionText : '');
  };

  const toggleHighlight = (key: string, colorClass: string) => {
    setHighlightedVerses(prev => {
      const copy = { ...prev };
      if (copy[key] === colorClass) {
        delete copy[key]; // Turn off
      } else {
        copy[key] = colorClass;
      }
      return copy;
    });
  };

  const isFavorited = (verseNum: number) => {
    const refStr = `${selectedBook.name} ${selectedChapter}:${verseNum}`;
    return favorites.some(fav => fav.ref === refStr);
  };

  const handleFavoriteToggle = (verseNum: number, text: string) => {
    const refStr = `${selectedBook.name} ${selectedChapter}:${verseNum}`;
    if (isFavorited(verseNum)) {
      onRemoveFavorite(refStr);
    } else {
      onAddFavorite(refStr, text);
    }
  };

  const saveReflection = (verseNum: number) => {
    if (!reflectionText.trim()) return;
    const refStr = `${selectedBook.name} ${selectedChapter}:${verseNum}`;
    onAddReflection(refStr, reflectionText);
    setReflectionText('');
    setSelectedVerseKey(null); // Close
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Sidebar: Navigation Books & Chapters */}
      <div id="bible-navigation-panel" className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/50 space-y-5 lg:col-span-1">
        <div className="flex items-center space-x-2 text-[#8C6239] border-b border-stone-200 pb-3">
          <BookOpen size={18} />
          <h4 className="font-serif font-medium text-stone-800">Livros & Capítulos</h4>
        </div>

        {/* Book Selector */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Testamento</span>
            <div className="flex flex-col space-y-1.5 mt-1.5">
              {BIBLE_BOOKS.map((book) => (
                <button
                  id={`btn-select-book-${book.id}`}
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-all ${
                    selectedBookId === book.id
                      ? 'bg-[#C08261]/10 text-[#C08261] font-semibold border-l-2 border-[#C08261]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{book.name}</span>
                  <span className="text-[10px] text-stone-400 font-normal">{book.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Grid */}
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Capítulo</span>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {chaptersAvailable.map((ch) => (
                <button
                  id={`btn-select-chapter-${ch}`}
                  key={ch}
                  onClick={() => {
                    setSelectedChapter(ch);
                    setSelectedVerseKey(null);
                  }}
                  className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                    selectedChapter === ch
                      ? 'bg-stone-800 text-white font-bold'
                      : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          id="btn-toggle-saved-reflections"
          onClick={() => setShowReflectionsPanel(!showReflectionsPanel)}
          className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200/80 rounded-xl text-xs text-stone-600 transition"
        >
          <FileText size={14} />
          <span>{showReflectionsPanel ? "Ocultar Anotações" : "Ver Minhas Anotações"}</span>
        </button>
      </div>

      {/* Main Study Read Window */}
      <div id="bible-verse-container" className="lg:col-span-3 bg-white border border-stone-200/40 rounded-3xl p-8 shadow-sm relative min-h-[480px]">
        {/* Book Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-5 mb-6">
          <div>
            <h2 className="text-3xl font-serif font-light text-stone-900 tracking-tight">
              {selectedBook.name} <span className="font-mono text-xl text-[#C08261]">Cap. {selectedChapter}</span>
            </h2>
            <p className="text-amber-700/70 text-xs font-mono tracking-widest uppercase mt-1">Almeida Corrigida Fiel (ACF)</p>
          </div>
          <div className="flex space-x-1">
            <span className="w-2 h-2 rounded-full bg-stone-200" />
            <span className="w-2 h-2 rounded-full bg-[#C08261]/40" />
            <span className="w-2 h-2 rounded-full bg-[#C08261]" />
          </div>
        </div>

        {/* Text Pane */}
        {showReflectionsPanel ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-stone-800">Minhas Reflexões Espirituais</h3>
              <button onClick={() => setShowReflectionsPanel(false)} className="text-stone-400 hover:text-stone-700 text-xs flex items-center space-x-0.5">
                <span>Leitor</span> <ChevronRight size={14} />
              </button>
            </div>

            {reflections.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                Nenhuma nota salva pelo caminho ainda. Toque em qualquer versículo para registrar um devocional íntimo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reflections.map((ref) => (
                  <div key={ref.id} className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl relative">
                    <span className="text-[10px] font-mono text-stone-400 absolute top-3 right-4">
                      {new Date(ref.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <h5 className="font-serif text-[#C08261] font-semibold text-sm mb-1">{ref.verseRef}</h5>
                    <p className="text-stone-600 text-xs leading-relaxed italic">"{ref.reflectionText}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 select-text">
            {verses.map((verse) => {
              const key = `${selectedBook.id}_${selectedChapter}_${verse.number}`;
              const highlightColor = highlightedVerses[key];
              const isSelected = selectedVerseKey === key;

              return (
                <div key={verse.number} className="relative group">
                  <p
                    id={`verse-${verse.number}`}
                    onClick={() => handleVerseClick(verse.number, verse.text)}
                    className={`font-serif text-base md:text-lg leading-relaxed text-stone-800 cursor-pointer rounded-lg p-2.5 transition-all text-justify ${
                      highlightColor ? highlightColor : ''
                    } ${
                      isSelected ? 'ring-1 ring-[#C08261]/30 bg-[#C08261]/5' : 'hover:bg-stone-50/50'
                    }`}
                  >
                    <span className="font-mono text-xs text-[#C08261]/80 mr-2 font-normal select-none inline-block w-6 text-right">
                      {verse.number}
                    </span>
                    {verse.text}
                  </p>

                  {/* Inline interactive verse toolbox */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        id={`toolbar-${key}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2.5 p-4 bg-stone-50 border border-stone-200 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 items-center z-10 relative"
                      >
                        {/* Selector highlight color */}
                        <div className="md:col-span-2 flex items-center space-x-2">
                          <Highlighter size={14} className="text-stone-500" />
                          <span className="text-xs text-stone-500">Destaque:</span>
                          <div className="flex space-x-1.5">
                            <button
                              id="btn-highlight-clay"
                              onClick={() => toggleHighlight(key, 'bg-[#C08261]/15 decoration-[#C08261]')}
                              className="w-5 h-5 rounded-full bg-[#C08261]/30 border border-orange-300 hover:scale-110 transition"
                            />
                            <button
                              id="btn-highlight-gold"
                              onClick={() => toggleHighlight(key, 'bg-amber-100 decoration-amber-400')}
                              className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 hover:scale-110 transition"
                            />
                            <button
                              id="btn-highlight-sky"
                              onClick={() => toggleHighlight(key, 'bg-blue-50 decoration-blue-300')}
                              className="w-5 h-5 rounded-full bg-blue-50 border border-blue-300 hover:scale-110 transition"
                            />
                            <button
                              id="btn-highlight-none"
                              onClick={() => toggleHighlight(key, 'bg-transparent')}
                              className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:scale-110 transition text-[9px]"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Favorite switch */}
                        <div className="flex md:col-span-1">
                          <button
                            id="btn-toggle-favorite-verse"
                            onClick={() => handleFavoriteToggle(verse.number, verse.text)}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-xl transition ${
                              isFavorited(verse.number)
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-white hover:bg-stone-200/60 text-stone-600 border border-stone-200'
                            }`}
                          >
                            <Bookmark size={13} fill={isFavorited(verse.number) ? 'currentColor' : 'none'} />
                            <span>{isFavorited(verse.number) ? 'Salvo' : 'Favoritar'}</span>
                          </button>
                        </div>

                        {/* Reflection field */}
                        <div className="md:col-span-2 flex space-x-1.5">
                          <input
                            id="input-reflection-verse"
                            type="text"
                            placeholder="Anote algo no secreto..."
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                            className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveReflection(verse.number);
                            }}
                          />
                          <button
                            id="btn-save-reflection"
                            onClick={() => saveReflection(verse.number)}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-xl transition flex items-center justify-center"
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

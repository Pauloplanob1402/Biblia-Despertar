/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BIBLE_BOOKS } from '../data/bible';
import { BookOpen, Highlighter, Bookmark, FileText, ChevronRight, X, Sparkles, Check, Search, Globe, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BibleReaderProps {
  onAddFavorite: (ref: string, text: string) => void;
  onRemoveFavorite: (ref: string) => void;
  onAddReflection: (ref: string, text: string) => void;
  favorites: { ref: string; text: string }[];
  reflections: { id: string; verseRef: string; reflectionText: string; createdAt: string }[];
}

interface RawTranslationBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

function getFallbackVerses(bookId: string, chapter: number): { chapter: number; number: number; text: string }[] {
  const offlineBookData = BIBLE_BOOKS.find(b => b.id === bookId);
  const bookName = offlineBookData?.name || bookId;
  
  const baseVerses: { [key: string]: string[] } = {
    genesis: [
      "No princípio, criou Deus os céus e a terra.",
      "E o Espírito de Deus se movia sobre a face das águas, sussurrando harmonia.",
      "E disse Deus: Haja luz; e houve luz na caminhada e na mesa da criação.",
      "E viu Deus que isso era muito bom, estabelecendo um pacto eterno de presença."
    ],
    exodo: [
      "Eu ouvi o clamor sincero do meu povo diante do esgotamento profundo no deserto.",
      "Não temas, pois eu serei contigo como uma coluna de nuvem mansa de dia e chama de noite.",
      "Abrirei os caminhos mais improváveis diante de ti para encontrar pastos seguros.",
      "O local onde pisas é solo sagrado; tire os vossos sapatos e simplesmente descanse."
    ],
    mateus: [
      "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos darei o meu alívio.",
      "Tomai sobre vós o meu jugo, que é mansa graça, e aprendei que meu fardo é leve.",
      "Os humildes de coração e os cansados de provar valor são os convidados de honra para a minha mesa.",
      "Buscai em primeiro lugar o reino do amor sincero, e todas as outras provisões vos acompanharão."
    ],
    marcos: [
      "O Filho do Homem não veio para ser bajulado, mas para servir e doar-se em silêncio pelos outros.",
      "Quem acolhe uma criança em meu nome, a mim mesmo acolhe na mesa comum.",
      "Tudo é possível àquele que carrega uma fé sincera, vestindo sua honestidade e dúvidas perante Deus.",
      "Ide por todo o mundo e plantai generosamente as sementes da cura espiritual."
    ],
    lucas: [
      "O amor do Pai avistou o filho necessitado quando ele ainda estava longe, correndo ao seu abraço.",
      "Preparai uma mesa especial de festa e digam: este meu filho retornou e reviveu.",
      "No Despertar da alma, a graça de Deus chega sempre antes de qualquer cobrança ou mudança.",
      "Eu vim procurar e abraçar todos os que se sentiam perdidos ou isolados pelo caminho."
    ],
    joao: [
      "No princípio era o Verbo da graça, e nele estava a luz que ilumina todo ser humano.",
      "Eu sou o pão da vida; quem vem a mim e assenta-se à minha mesa jamais terá fome.",
      "Como o Pai me amou, yo também vos amei na quietude do secreto; permanecei nesse aconchego.",
      "Se tiverdes amor uns pelos outros na mesa da vida, ali todos saberão que sois meus discípulos."
    ],
    romanos: [
      "Portanto, agora nenhuma acusação há para os que encontraram refúgio mansa em Cristo Jesus.",
      "Pois estou certo de que nada neste mundo pode nos desatar do afeto eterno de Deus.",
      "O Teu Espírito compreende o nosso cansaço e traduz nossas aflições com sussurros indizíveis.",
      "Acolhei-vos uns aos outros fraternalmente, como o próprio Mestre nos recebeu na mesa eterna."
    ],
    salmos: [
      "O SENHOR é o meu pastor; por causa da Sua consistência fiel, nada me faltará.",
      "Deitar-me faz em pastos verdejantes e guia-me com paciência às águas da tranquilidade.",
      "Ainda que eu andasse pela sombra da morte física, não temeria e descansaria no Teu cajado mansa.",
      "Preparas uma mesa de comunhão perante mim, unges a minha fronte e fazes meu cálice transbordar."
    ],
    proverbios: [
      "O olhar amigo e a palavra de brandura trazem doce remédio ao peito angustiado.",
      "Melhor é uma refeição simples onde reina paz e comunhão do que mansões repletas de cobranças.",
      "Aquele que caminha com verdade e afasta-se de performances vazias encontra solo firme no deserto.",
      "Acima de tudo o que deve ser guardado, guarda bem o teu coração, pois dele brota o caminhar puro."
    ]
  };

  const bookKey = bookId.toLowerCase();
  const templates = baseVerses[bookKey] || [
    `Em ${bookName} capítulo ${chapter}, encontramos o convite para aproximar nossa vida da verdade divina.`,
    "Lembra que, no silêncio e no aconchego do quarto fechado, as maiores sementes começam a brotar.",
    "Jesus nunca nos pediu para sermos perfeitos ou inabaláveis; Ele pediu que fôssemos reais e autênticos.",
    "Caminhe devagar, respeite os seus limites e confie que a graça sustenta cada passo invisível."
  ];

  return templates.map((vText, idx) => ({
    chapter: chapter,
    number: idx + 1,
    text: vText
  }));
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

  // Search & testament filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestament, setActiveTestament] = useState<'todos' | 'velho' | 'novo'>('todos');

  // Single-translation (Using ACF - Almeida Corrigida Fiel, copyright/royalty-free)
  const translationName = 'acf';
  const [loadedBibles, setLoadedBibles] = useState<{ [key: string]: RawTranslationBook[] }>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const selectedBook = BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[0];

  // Dynamically load the selected raw Bible translation from reliable CDN mirrors
  useEffect(() => {
    if (loadedBibles[translationName]) {
      setSyncStatus('success');
      return;
    }

    setSyncStatus('loading');

    const urls = [
      `https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/${translationName}.json`,
      `https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/${translationName}.json`,
      `https://gcore.jsdelivr.net/gh/thiagobodruk/bible@master/json/${translationName}.json`,
      `https://raw.githubusercontent.com/thiagobodruk/bible/master/json/${translationName}.json`
    ];

    const fetchWithFallback = async (urlsArray: string[]): Promise<RawTranslationBook[]> => {
      let lastError: any = null;
      for (const url of urlsArray) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Falha na rede');
          const data = await res.json();
          return data;
        } catch (err) {
          lastError = err;
          console.warn(`Tentativa falhou no mirror: ${url}`, err);
        }
      }
      throw lastError || new Error('Falha na rede');
    };

    fetchWithFallback(urls)
      .then((data: RawTranslationBook[]) => {
        setLoadedBibles(prev => ({
          ...prev,
          [translationName]: data
        }));
        setSyncStatus('success');
      })
      .catch(err => {
        console.warn('Erro ao ler bíblia nos espelhos. Ativando modo conforto offline:', err);
        setSyncStatus('error');
      });
  }, [translationName, loadedBibles]);

  // Dynamic correct selected default chapter when selected book updates due to chapter limits
  useEffect(() => {
    if (selectedChapter > selectedBook.chapterCount) {
      setSelectedChapter(1);
    }
    setSelectedVerseKey(null);
  }, [selectedBookId, selectedBook]);

  // Compute verses based on loaded translation or local comfort fallback
  const currentVerses = useMemo(() => {
    const activeBible = loadedBibles[translationName];
    if (activeBible) {
      // Find book index (0 to 65) matching chronological order
      const bookIdx = BIBLE_BOOKS.findIndex(b => b.id === selectedBookId);
      if (bookIdx !== -1 && activeBible[bookIdx]) {
        const rawBook = activeBible[bookIdx];
        const rawChapterVerses = rawBook.chapters?.[selectedChapter - 1]; // index is chapter - 1
        if (rawChapterVerses) {
          return rawChapterVerses.map((vText: string, idx: number) => ({
            chapter: selectedChapter,
            number: idx + 1,
            text: vText
          }));
        }
      }
    }

    // Dynamic standard fallback to local comfort verses or graceful procedural generation
    const offlineBookData = BIBLE_BOOKS.find(b => b.id === selectedBookId);
    if (offlineBookData) {
      if (offlineBookData.chapters[selectedChapter]) {
        return offlineBookData.chapters[selectedChapter];
      }
      return getFallbackVerses(selectedBookId, selectedChapter);
    }
    return [];
  }, [translationName, loadedBibles, selectedBookId, selectedChapter]);

  // Generate responsive chapter buttons array based on the book's chapter counts
  const chaptersAvailable = useMemo(() => {
    return Array.from({ length: selectedBook.chapterCount }, (_, i) => i + 1);
  }, [selectedBook]);

  // Filter 66 books instantly by input search query and testament choice
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(book => {
      const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTestament =
        activeTestament === 'todos' ||
        (activeTestament === 'velho' && book.category === 'Velho Testamento') ||
        (activeTestament === 'novo' && book.category === 'Novo Testamento');
      return matchesSearch && matchesTestament;
    });
  }, [searchQuery, activeTestament]);

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

  const translateVersionName = (vName: 'acf') => {
    return 'Almeida Corrigida Fiel (ACF)';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Sidebar: Navigation Books & Chapters */}
      <div id="bible-navigation-panel" className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/50 space-y-4 lg:col-span-1 shadow-sm">
        <div className="flex items-center space-x-2 text-[#8C6239] border-b border-stone-200 pb-3">
          <BookOpen size={18} />
          <h4 className="font-serif font-medium text-stone-800">Livros & Capítulos</h4>
        </div>

        {/* Search Input Filter */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="input-search-bible-book"
            type="text"
            placeholder="Ir para o livro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Testament Tab Selectors */}
        <div className="flex bg-stone-100 p-0.75 rounded-lg border border-stone-200/50">
          <button
            id="btn-filter-all"
            onClick={() => setActiveTestament('todos')}
            className={`flex-1 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md transition ${
              activeTestament === 'todos' ? 'bg-white text-stone-800 font-bold shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Todos
          </button>
          <button
            id="btn-filter-velho"
            onClick={() => setActiveTestament('velho')}
            className={`flex-1 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md transition ${
              activeTestament === 'velho' ? 'bg-white text-stone-800 font-bold shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Velho
          </button>
          <button
            id="btn-filter-novo"
            onClick={() => setActiveTestament('novo')}
            className={`flex-1 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md transition ${
              activeTestament === 'novo' ? 'bg-white text-stone-800 font-bold shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Novo
          </button>
        </div>

        {/* Book Selector (Filtered Scrollable Box) */}
        <div className="space-y-4">
          <div>
            <span className="text-[12px] uppercase font-mono tracking-wider text-stone-550 font-bold">Selecione o Livro</span>
            <div className="flex flex-col space-y-1 mt-1.5 max-h-[190px] overflow-y-auto pr-1 border border-stone-200/40 rounded-xl p-1 bg-white shadow-inner">
              {filteredBooks.length === 0 ? (
                <span className="text-[11px] text-stone-400 py-3 text-center">Nenhum livro encontrado</span>
              ) : (
                filteredBooks.map((book) => (
                  <button
                    id={`btn-select-book-${book.id}`}
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg text-left transition-all ${
                      selectedBookId === book.id
                        ? 'bg-[#C08261]/10 text-[#C08261] font-semibold border-l-2 border-[#C08261]'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">{book.name}</span>
                    <span className="text-[10px] text-stone-500 shrink-0 font-mono font-normal">
                      {book.category === 'Velho Testamento' ? 'VT' : 'NT'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chapter Grid */}
          <div>
            <span className="text-[12px] uppercase font-mono tracking-wider text-stone-550 font-bold">
              Capítulos ({selectedBook.chapterCount})
            </span>
            <div className="grid grid-cols-4 gap-1 mt-1.5 max-h-[150px] overflow-y-auto pr-1 border border-stone-200/40 rounded-xl p-1 bg-white shadow-inner">
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
                      ? 'bg-stone-850 text-white font-bold shadow-md'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/50'
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
          className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 bg-stone-100 hover:bg-[#C08261]/5 hover:text-[#C08261] rounded-xl text-xs text-stone-600 transition duration-200"
        >
          <FileText size={14} />
          <span>{showReflectionsPanel ? "Voltar ao Leitor" : "Ver Minhas Anotações"}</span>
        </button>
      </div>

      {/* Main Study Read Window */}
      <div id="bible-verse-container" className="lg:col-span-3 bg-white border border-stone-200/40 rounded-3xl p-6 md:p-8 shadow-sm relative min-h-[480px]">
        {/* Book Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-5 mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-light text-stone-900 tracking-tight">
              {selectedBook.name} <span className="font-mono text-xl text-[#C08261] font-semibold">Cap. {selectedChapter}</span>
            </h2>

            {/* Translation switch and sync indicators */}
            <div className="flex flex-wrap items-center mt-2.5 gap-2">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-stone-100 border border-stone-200 text-stone-700/90 rounded-md shadow-sm">
                Almeida Corrigida Fiel (ACF)
              </span>

              {/* Status Badge */}
              <div className="text-[10px] font-mono text-stone-500 flex items-center gap-1.5 shadow-inner">
                {syncStatus === 'loading' && (
                  <span className="flex items-center text-amber-600 gap-1 animate-pulse font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Sincronizando bíblia...
                  </span>
                )}
                {syncStatus === 'success' && (
                  <span className="flex items-center text-emerald-600 gap-1 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Completa Off-line
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="flex items-center text-amber-700 gap-1 bg-amber-50 px-2 py-0.5 rounded-md" title="Passagens offline de segurança. Sincronize para ler todos os 66 livros.">
                    <WifiOff size={11} className="text-amber-600" />
                    Conforto Offline
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-1 self-end md:self-center">
            <span className="w-2 h-2 rounded-full bg-stone-200" />
            <span className="w-2 h-2 rounded-full bg-[#C08261]/40" />
            <span className="w-2 h-2 rounded-full bg-[#C08261]" />
          </div>
        </div>

        {/* Text Pane */}
        {showReflectionsPanel ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-stone-800 font-medium">Minhas Reflexões Espirituais</h3>
              <button onClick={() => setShowReflectionsPanel(false)} className="text-stone-400 hover:text-[#C08261] text-xs flex items-center space-x-0.5 transition">
                <span>Leitor</span> <ChevronRight size={14} />
              </button>
            </div>

            {reflections.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                Nenhuma nota salva pelo caminho ainda. Toque em qualquer versículo para registrar um devocional íntimo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reflections.map((ref) => (
                  <div key={ref.id} className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl relative shadow-sm hover:border-[#C08261]/30 transition duration-150">
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
          <div className="select-text">
            {currentVerses.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                {syncStatus === 'loading' ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-[#C08261] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-stone-500 font-mono">Buscando as escrituras sagradas para você...</span>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-3 px-4">
                    <span className="text-amber-600 bg-amber-50 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 font-bold text-lg">💡</span>
                    <p className="text-stone-700 font-serif text-sm font-semibold">
                      Esta passagem ({selectedBook.name} {selectedChapter}) está disponível na nuvem.
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Conecte-se à internet para carregar instantaneamente qualquer um dos 66 livros da bíblia em múltiplos formatos.
                    </p>
                    <button
                      onClick={() => {
                        setLoadedBibles(prev => {
                          const copy = { ...prev };
                          delete copy[translationName];
                          return copy;
                        });
                        setSyncStatus('loading');
                      }}
                      className="mt-4 px-5 py-2 bg-stone-850 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95 duration-150 inline-block"
                    >
                      Tentar Sincronizar Agora
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8 select-text">
                {currentVerses.map((verse) => {
                  const key = `${selectedBook.id}_${selectedChapter}_${verse.number}`;
                  const highlightColor = highlightedVerses[key];
                  const isSelected = selectedVerseKey === key;

                  return (
                    <div key={verse.number} className="relative group">
                      <p
                        id={`verse-${verse.number}`}
                        onClick={() => handleVerseClick(verse.number, verse.text)}
                        className={`font-serif text-[17px] sm:text-xl leading-relaxed text-stone-850 cursor-pointer rounded-lg p-3 transition-all text-justify ${
                          highlightColor ? highlightColor : ''
                        } ${
                          isSelected ? 'ring-1 ring-[#C08261]/35 bg-[#C08261]/5 shadow-sm' : 'hover:bg-stone-50/50'
                        }`}
                      >
                        <span className="font-mono text-sm text-[#C08261] mr-2 font-normal select-none inline-block w-6 text-right">
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
                            className="mt-2.5 p-4 bg-stone-50 border border-stone-200 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 items-center z-10 relative shadow-inner"
                          >
                            {/* Selector highlight color */}
                            <div className="md:col-span-2 flex items-center space-x-2">
                              <Highlighter size={14} className="text-stone-500" />
                              <span className="text-xs text-stone-500 font-mono">Destaque:</span>
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
                                    ? 'bg-amber-100 text-amber-800 font-semibold'
                                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
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
        )}
      </div>
    </div>
  );
}

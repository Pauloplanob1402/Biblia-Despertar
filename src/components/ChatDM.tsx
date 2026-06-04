import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { plantarSemente } from '../lib/sementes';
import { ArrowLeft, Send, Check, CheckCheck, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatDMProps {
  contactUid: string;       // UID do outro usuário no Firebase
  contactName: string;      // Nome exibido no header
  contactEmoji?: string;    // Emoji do avatar (padrão '👤')
  isOnline?: boolean;       // Mostra ponto verde e "online agora"
  sharedVotes?: number;     // Qtd de votos em comum (badge + banner)
  onBack: () => void;       // Callback do botão voltar
}

interface Message {
  id: string;
  text: string;
  senderUid: string;
  createdAt: Timestamp | null;
  readBy?: string[];
  reactions?: Record<string, string[]>;
}

export default function ChatDM({
  contactUid,
  contactName,
  contactEmoji = '👤',
  isOnline = false,
  sharedVotes = 0,
  onBack
}: ChatDMProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const myUid = auth.currentUser?.uid;

  const convoId = [myUid || '', contactUid].sort().join('_');

  // Load / Setup Conversation Metadata
  useEffect(() => {
    if (!myUid) return;

    const setupConvo = async () => {
      const convoRef = doc(db, 'conversations', convoId);
      try {
        await setDoc(convoRef, {
          participants: [myUid, contactUid],
          lastAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error writing conversation document:", err);
      }
    };
    setupConvo();
  }, [convoId, myUid, contactUid]);

  // Real-time Chat listener
  useEffect(() => {
    if (!myUid) return;

    const messagesQuery = query(
      collection(db, 'conversations', convoId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          text: data.text || '',
          senderUid: data.senderUid || '',
          createdAt: data.createdAt || null,
          readBy: data.readBy || [],
          reactions: data.reactions || {}
        });
      });
      setMessages(msgs);

      // Automatically mark as read any incoming messages that other sent
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.senderUid !== myUid && !(data.readBy || []).includes(myUid)) {
          try {
            await updateDoc(doc(db, 'conversations', convoId, 'messages', docSnap.id), {
              readBy: arrayUnion(myUid)
            });
          } catch (err) {
            console.error("Error updating readBy status", err);
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `conversations/${convoId}/messages`);
    });

    return () => unsubscribe();
  }, [convoId, myUid]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Textarea auto grows height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Enter to Submit, Shift+Enter to break line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : text;
    if (!textToSend.trim() || !myUid) return;

    if (customText === undefined) setText('');

    try {
      const messagesColRef = collection(db, 'conversations', convoId, 'messages');
      await addDoc(messagesColRef, {
        text: textToSend.trim(),
        senderUid: myUid,
        createdAt: serverTimestamp(),
        readBy: [myUid],
        reactions: {}
      });

      await updateDoc(doc(db, 'conversations', convoId), {
        lastMessage: textToSend.trim(),
        lastAt: serverTimestamp()
      });

      // Gatilho: detecta intenção de oração
      const textoNormalizado = textToSend.toLowerCase().trim();
      const ehOracao =
        textoNormalizado.includes('vou orar') ||
        textoNormalizado.includes('estou orando') ||
        textoNormalizado.includes('orando por você') ||
        textoNormalizado.includes('orando por voce') ||
        textoNormalizado === '🙏';

      if (ehOracao) {
        await plantarSemente({
          uid: myUid,
          tipo: 'oracao',
          descricao: `Orou por ${contactName}`
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${convoId}/messages`);
    }
  };

  // Quick emoji click send
  const sendQuickEmoji = (emoji: string) => {
    handleSend(emoji);
  };

  // Add Reaction on double click bubble
  const handleReaction = async (msgId: string, emoji: string) => {
    if (!myUid) return;
    try {
      const msgRef = doc(db, 'conversations', convoId, 'messages', msgId);
      const msg = messages.find(m => m.id === msgId);
      if (!msg) return;

      const currentReactions = msg.reactions || {};
      const usersWithEmoji = currentReactions[emoji] || [];

      let updatedUsers = [...usersWithEmoji];
      if (usersWithEmoji.includes(myUid)) {
        updatedUsers = updatedUsers.filter(u => u !== myUid);
      } else {
        updatedUsers.push(myUid);
      }

      const nextReactions = { ...currentReactions };
      if (updatedUsers.length === 0) {
        delete nextReactions[emoji];
      } else {
        nextReactions[emoji] = updatedUsers;
      }

      await updateDoc(msgRef, { reactions: nextReactions });
    } catch (err) {
      console.error("Error setting reaction", err);
    }
  };

  // Grouping messages by date
  const getGroupedMessages = () => {
    const groups: Record<string, Message[]> = {};
    messages.forEach((msg) => {
      if (!msg.createdAt) {
        const todayStr = 'Hoje';
        groups[todayStr] = groups[todayStr] || [];
        groups[todayStr].push(msg);
        return;
      }
      const date = msg.createdAt.toDate();
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey = '';
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ontem';
      } else {
        groupKey = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
      }

      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(msg);
    });
    return groups;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Simulated Typing Indicator Behavior
    if (!isTyping) {
      setIsTyping(true);
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
    setTypingTimer(timer);
  };

  const grouped = getGroupedMessages();
  const quickEmojis = ['🙏', '❤️', '🙌', '🌟', '🕊️', '🔥', '🌸', '☕'];

  return (
    <div className="flex flex-col bg-stone-50 border border-stone-200 rounded-3xl h-[600px] overflow-hidden shadow-sm relative w-full">
      
      {/* HEADER */}
      <div className="bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3.5">
          <button 
            id="chat-dm-back-btn"
            onClick={onBack}
            className="text-stone-500 hover:text-stone-850 p-1.5 hover:bg-stone-50 rounded-xl transition"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{contactEmoji}</span>
            <div className="text-left">
              <h4 className="font-serif font-medium text-stone-850 text-base leading-tight">{contactName}</h4>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                <span className="text-[10px] text-stone-550 font-mono">
                  {isOnline ? 'Conectado agora' : 'Ausente'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {sharedVotes > 0 && (
          <div className="hidden sm:flex items-center space-x-1 bg-amber-50 border border-amber-200/55 px-3 py-1.5 rounded-full text-[10px] font-mono text-[#8C6239] font-medium leading-none">
            <span>🔥</span>
            <span>{sharedVotes} leituras em comum</span>
          </div>
        )}
      </div>

      {/* SHARED DEPRECATED BANNER FOR SMALL MESSAGES */}
      {sharedVotes > 0 && (
        <div className="sm:hidden bg-amber-50/70 border-b border-amber-200/40 py-1.5 text-center text-[10px] font-mono text-[#8C6239]">
          🔥 Vocês compartilham {sharedVotes} afinidades de fé
        </div>
      )}

      {/* MESSAGES LIST AREA */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-stone-50/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <span className="text-3xl text-stone-400">🕊️</span>
            <h5 className="font-serif font-medium text-stone-700 text-sm">O silêncio do coração também é oração</h5>
            <p className="text-stone-400 text-xs max-w-xs leading-relaxed">
              Inicie a conversa partilhando uma reflexão ou envie um dos emojis fraternos rápidos abaixo.
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([dateGroup, msgs]) => (
          <div key={dateGroup} className="space-y-4">
            {/* Group date bubble */}
            <div className="flex justify-center">
              <span className="bg-stone-200/65 text-[10px] text-stone-550 font-mono font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                {dateGroup}
              </span>
            </div>

            {/* Sub messages */}
            {msgs.map((msg) => {
              const isMine = msg.senderUid === myUid;
              const hasBeenRead = msg.readBy && msg.readBy.filter(u => u !== myUid).length > 0;
              const formattedTime = msg.createdAt 
                ? msg.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group max-w-[85%] ${isMine ? 'ml-auto' : 'mr-auto'}`}
                >
                  <span className="text-[9px] text-stone-400 font-mono mb-1 select-none opacity-0 group-hover:opacity-100 transition">
                    Duplo clique para apoiar ❤️
                  </span>
                  
                  {/* Bubble content */}
                  <div 
                    onDoubleClick={() => handleReaction(msg.id, '❤️')}
                    className={`p-3.5 rounded-2xl relative select-none cursor-pointer transition max-w-full ${
                      isMine 
                        ? 'bg-stone-900 border border-stone-900 text-stone-50 rounded-tr-none text-left shadow-xs' 
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none text-left shadow-xs'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Reactions array */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="absolute -bottom-2 -right-1 flex space-x-1">
                        {Object.entries(msg.reactions).map(([emoji, uids]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="bg-white border border-stone-200 hover:scale-110 shadow-sm transition px-1.5 py-0.5 rounded-full text-xs flex items-center space-x-1"
                          >
                            <span>{emoji}</span>
                            {uids.length > 1 && (
                              <span className="text-[8px] text-stone-500 font-semibold">{uids.length}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status checklist and time */}
                  <div className={`flex items-center space-x-1 text-[10px] text-stone-400/80 font-mono mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <span>{formattedTime}</span>
                    {isMine && (
                      <span>
                        {hasBeenRead ? (
                          <CheckCheck size={12} className="text-[#C08261]" />
                        ) : (
                          <Check size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Simulate Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center space-x-2 bg-stone-100 p-3 rounded-2xl w-fit border border-stone-200/40 text-stone-500"
            >
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK EMOJI DRAWER BAR */}
      <div className="bg-white border-t border-stone-150 px-4 py-2 flex items-center space-x-2 overflow-x-auto select-none">
        <Smile size={14} className="text-stone-400 shrink-0" />
        <span className="text-[9px] uppercase tracking-wider font-mono text-stone-400 shrink-0 mr-1">Rápidos:</span>
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendQuickEmoji(emoji)}
            className="text-lg hover:scale-125 transition active:scale-95 px-1 pb-1"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* INPUT EDITOR AREA */}
      <div className="bg-white border-t border-stone-200 px-4 py-3 pb-4">
        <div className="relative flex items-end bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua reflexão baseada..."
            className="flex-1 bg-transparent border-none text-stone-800 text-xs md:text-sm focus:outline-none resize-none py-1.5 leading-relaxed placeholder-stone-405"
            style={{ maxHeight: '120px' }}
          />

          <button
            id="chat-send-message-btn"
            onClick={() => handleSend()}
            disabled={!text.trim()}
            className={`p-2.5 rounded-xl text-white transition shrink-0 ml-2 ${
              text.trim() 
                ? 'bg-[#C08261] hover:bg-[#b07353] shadow-xs cursor-pointer' 
                : 'bg-stone-200 text-stone-450 cursor-default'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-left mt-2 pl-1 select-none font-mono">
          Enter envia • Shift+Enter quebra linha • Duplo clique gera um ❤️ fraternidade.
        </p>
      </div>

    </div>
  );
}

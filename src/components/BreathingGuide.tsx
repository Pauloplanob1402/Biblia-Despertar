/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

export default function BreathingGuide() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inspire' | 'segure' | 'expire' | 'medite'>('inspire');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Audio oscillator logic for a subtle celestial hum
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let osc1: OscillatorNode | null = null;
    let osc2: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;

    if (isPlaying && audioEnabled) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtxClass();
        
        osc1 = audioCtx.createOscillator();
        osc2 = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        // Harmonious, soothing frequency pair (C3 and G3)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(196.00, audioCtx.currentTime); // G3

        gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
        // Soft fade in of the ambient hum to not startle the ear
        gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
      } catch (err) {
        console.warn('AudioContext not supported or gesture blocked.', err);
      }
    }

    return () => {
      // Clean up audio nodes smoothly
      if (gainNode && audioCtx) {
        try {
          gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.3);
          setTimeout(() => {
            osc1?.stop();
            osc2?.stop();
            audioCtx?.close();
          }, 350);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isPlaying, audioEnabled]);

  // Rhythm loop (4-4-4 seconds cycle)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (phase === 'inspire') {
              setPhase('segure');
              return 4;
            } else if (phase === 'segure') {
              setPhase('expire');
              return 4;
            } else if (phase === 'expire') {
              setPhase('medite');
              return 4;
            } else {
              setPhase('inspire');
              setCyclesCompleted(c => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPhase('inspire');
      setSecondsLeft(4);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, phase]);

  const getPhaseConfig = () => {
    switch (phase) {
      case 'inspire':
        return {
          text: 'Inhale o ar lentamente...',
          desc: 'Sinta os pulmões expandindo com vida.',
          color: 'bg-[#C08261]', // Terracota
          scale: [1.0, 1.3],
          textColor: 'text-[#C08261]',
          duration: 4
        };
      case 'segure':
        return {
          text: 'Retenha no peito...',
          desc: 'Aquiete a mente, contemple o silêncio.',
          color: 'bg-[#8C6239]', // Argila
          scale: 1.3,
          textColor: 'text-[#8C6239]',
          duration: 4
        };
      case 'expire':
        return {
          text: 'Solte devagar...',
          desc: 'Entregue as pressões e dores para fora.',
          color: 'bg-[#5C3D2E]', // Espresso escuro
          scale: [1.3, 1.0],
          textColor: 'text-[#5C3D2E]',
          duration: 4
        };
      case 'medite':
        return {
          text: 'Pausa de quietude...',
          desc: 'Descanse plenamente na graça divina.',
          color: 'bg-[#3F4E4F]', // Deep Forest Grey
          scale: 1.0,
          textColor: 'text-[#3F4E4F]',
          duration: 4
        };
    }
  };

  const config = getPhaseConfig();

  return (
    <div id="breathing-session-card" className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-stone-200/50 shadow-xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
      {/* Background soft light glow */}
      <div className="absolute inset-0 bg-radial from-amber-50/20 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center justify-between w-full border-b border-stone-100 pb-4 mb-2 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
          <p className="text-xs font-mono tracking-widest text-stone-500 uppercase">Espaço Contemplativo</p>
        </div>
        <button
          id="btn-toggle-hum-sound"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-2 rounded-full transition-all duration-300 ${
            audioEnabled ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400 hover:text-stone-700'
          }`}
          title={audioEnabled ? "Silenciar ambiente" : "Ativar som de meditação"}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="h-64 flex items-center justify-center relative w-64">
        {/* Pulsing Aura Rings */}
        <AnimatePresence mode="popLayout">
          {isPlaying && (
            <motion.div
              key={`ring-1-${phase}`}
              className="absolute inset-0 rounded-full border border-stone-200/50"
              initial={{ transform: `scale(${phase === 'inspire' ? 1.0 : 1.3})`, opacity: 0.8 }}
              animate={{
                transform: `scale(${phase === 'inspire' ? 1.4 : phase === 'expire' ? 1.0 : 1.3})`,
                opacity: phase === 'segure' ? [0.4, 0.6, 0.4] : 0.2
              }}
              transition={{
                duration: 4,
                repeat: phase === 'segure' ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          )}
          {isPlaying && (
            <motion.div
              key={`ring-2-${phase}`}
              className="absolute inset-4 rounded-full border border-stone-300/30"
              initial={{ transform: "scale(1)", opacity: 0.5 }}
              animate={{
                transform: phase === 'inspire' ? 'scale(1.2)' : phase === 'expire' ? 'scale(0.95)' : 'scale(1.1)',
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Core Breathing Orb */}
        <motion.div
          id="breathing-orb-visual"
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer ${config.color} transition-all duration-1000 relative`}
          animate={{
            scale: isPlaying ? config.scale : 1.0,
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
          }}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <div className="absolute inset-0 rounded-full bg-radial from-white/20 to-transparent pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.span
              key={isPlaying ? secondsLeft : 'ready'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="font-serif text-3xl font-light text-cream-50 text-white"
            >
              {isPlaying ? secondsLeft : 'Respirar'}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="space-y-2 z-10">
        <h3 className={`text-xl font-serif font-light transition-all duration-500 ${config.textColor}`}>
          {isPlaying ? config.text : 'Aquiete o seu coração'}
        </h3>
        <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
          {isPlaying ? config.desc : 'Clique em começar para darmos início a um ciclo prânico de 4 segundos de equilíbrio.'}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-3 pt-4 w-full z-10">
        <button
          id="btn-breathing-control"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-medium shadow-md transition-all duration-300 ${
            isPlaying 
              ? 'bg-stone-800 text-white hover:bg-stone-900' 
              : 'bg-[#C08261] text-white hover:bg-[#b07353] hover:shadow-lg'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={16} fill="white" />
              <span>Pausar Ritmo</span>
            </>
          ) : (
            <>
              <Play size={16} fill="white" />
              <span>Começar Quietude</span>
            </>
          )}
        </button>

        {cyclesCompleted > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-1.5 text-xs text-[#8C6239] font-mono mt-1"
          >
            <Sparkles size={12} />
            <span>{cyclesCompleted} {cyclesCompleted === 1 ? 'ciclo concluído' : 'ciclos concluídos'} nesta pausa</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

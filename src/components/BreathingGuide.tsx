/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Square, Volume2, VolumeX, Sparkles, BookOpen, 
  HelpCircle, ChevronRight, Check, Heart, Info, InfoIcon, Clock
} from 'lucide-react';

interface BreathingGuideProps {
  mode?: 'widget' | 'sanctuary';
}

export default function BreathingGuide({ mode = 'widget' }: BreathingGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inspire' | 'segure' | 'expire' | 'medite'>('inspire');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  
  // Sound controls
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [soundType, setSoundType] = useState<'solfeggio' | 'brown' | 'water' | 'harp' | 'none'>('solfeggio');
  const [volume, setVolume] = useState(0.2); // scale: 0.0 - 1.0
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [tibetanEnabled, setTibetanEnabled] = useState(true);

  // Audio nodes references for continuous streaming and modification
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const harpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize main gain volume in real-time
  useEffect(() => {
    if (mainGainRef.current && audioCtxRef.current) {
      const targetGain = audioEnabled ? volume : 0;
      mainGainRef.current.gain.linearRampToValueAtTime(targetGain, audioCtxRef.current.currentTime + 0.1);
    }
  }, [volume, audioEnabled]);

  // Voice synthesis slow guide
  const speakVoice = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; // Slow pacing for meditation state
      utterance.pitch = 0.95; // Warm presence
      utterance.volume = 0.55; 
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis block:", e);
    }
  };

  // Beautiful Warm Synthesizer Prayer Pad (Fundo de Oração)
  const playTibetanBowl = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    // G major add9 chord for that ultimate, heavenly emotional/devotional warmth
    // G2 (98Hz), D3 (146.8Hz), G3 (196Hz), B3 (246.9Hz), D4 (293.7Hz), A4 (440Hz)
    const notes = [98.00, 146.83, 196.00, 246.94, 293.66, 440.00];
    
    // Create a filter to warm up the sound and remove sharp high-frequency elements
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(1.2, now);
    filter.connect(ctx.destination);

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      // Triangle waves are cozy and soft, mimicking classical synthesizer pads in devotionals
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      // Detune to create a lush, rich ensemble/chorus width
      osc.detune.setValueAtTime((idx % 2 === 0 ? 8 : -8), now);

      oscGain.gain.setValueAtTime(0.0001, now);
      // Soft, lingering attack
      oscGain.gain.linearRampToValueAtTime(0.12 * volume, now + 2.0);
      // Very elegant, long spiritual decay
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 10.0);

      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start(now);
      osc.stop(now + 10.5);
    });
  };

  // Celestial physical-modeling Harp pluck synthesizer
  const playHarpPluck = (ctx: AudioContext, frequency: number, time: number, volumeFactor: number = 1.0) => {
    try {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      // Triangle wave has some beautiful string-like warmth, perfect for natural harps
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, time);
      osc.detune.setValueAtTime(Math.random() * 6 - 3, time);

      // Lowpass filter with exponential sweep to mimic natural string dampening/damping
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, time);
      filter.frequency.exponentialRampToValueAtTime(350, time + 2.8);

      oscGain.gain.setValueAtTime(0.0001, time);
      // Instant harp pluck strike physics
      oscGain.gain.linearRampToValueAtTime(0.16 * volume * volumeFactor, time + 0.015);
      // Pure ringing resonance decays beautifully over 4.5 seconds
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 4.5);
      
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 5.0);
    } catch (e) {
      console.warn("Harp string synthesis failed:", e);
    }
  };

  // Cascades a beautiful, sweeping G Major add9 chord pluck sequence
  const playHarpArpeggio = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    // G3 (196Hz), B3 (246.94Hz), D4 (293.66Hz), F#4 (369.99Hz), A4 (440Hz), B4 (493.88Hz), D5 (587.33Hz), G5 (784Hz)
    const harpNotes = [196.00, 246.94, 293.66, 369.99, 440.00, 493.88, 587.33, 784.00];
    
    harpNotes.forEach((freq, idx) => {
      // Cascade notes 120ms apart to simulate a glorious hand swipe across strings
      playHarpPluck(ctx, freq, now + (idx * 0.12), 1.0 - (idx * 0.04));
    });
  };

  // Continuous loop that runs the celestial harp atmosphere
  const startHarpSimulation = (ctx: AudioContext, dest: AudioNode) => {
    // 1. Instantly swipe the celestial harp strings upon starting the quietude
    playHarpArpeggio(ctx);
    
    // 2. Play beautiful background synth pad drone as the resonance chamber of the harp structure
    const oscG = ctx.createOscillator();
    const oscD = ctx.createOscillator();
    const gainG = ctx.createGain();
    
    oscG.type = 'sine';
    oscG.frequency.setValueAtTime(98.00, ctx.currentTime); // G2 root key
    oscD.type = 'sine';
    oscD.frequency.setValueAtTime(146.83, ctx.currentTime); // D3 harmonious fifth

    gainG.gain.setValueAtTime(0.03 * volume, ctx.currentTime); // subliminal cozy box resonance

    oscG.connect(gainG);
    oscD.connect(gainG);
    gainG.connect(dest);

    oscG.start();
    oscD.start();

    osc1Ref.current = oscG;
    osc2Ref.current = oscD;

    // 3. Cycle through beautiful emotional, heart-touching chord sweeps every 13 seconds
    let chordIndex = 0;
    const progressions = [
      [196.00, 246.94, 293.66, 369.99, 440.00, 493.88, 587.33, 784.00], // Gmaj9
      [174.61, 220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 698.46], // Fmaj9 (soft breeze)
      [164.81, 196.00, 246.94, 293.66, 329.63, 392.00, 440.00, 659.25], // Em9 (deep surrender)
    ];

    harpIntervalRef.current = setInterval(() => {
      if (ctx.state === 'suspended') return;
      const now = ctx.currentTime;
      chordIndex = (chordIndex + 1) % progressions.length;
      const currentChord = progressions[chordIndex];
      currentChord.forEach((freq, idx) => {
        playHarpPluck(ctx, freq, now + (idx * 0.15), 1.0 - (idx * 0.05));
      });
    }, 13000);
  };

  // Helper to destroy active sound objects
  const stopSoundLoops = () => {
    // Clear active harp loops and intervals
    if (harpIntervalRef.current) {
      clearInterval(harpIntervalRef.current);
      harpIntervalRef.current = null;
    }

    // Stop all stored active oscillators
    activeOscillatorsRef.current.forEach((osc) => {
      try { osc.stop(); } catch(e){}
    });
    activeOscillatorsRef.current = [];

    if (osc1Ref.current) {
      try { osc1Ref.current.stop(); } catch(e){}
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); } catch(e){}
      osc2Ref.current = null;
    }
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch(e){}
      noiseSourceRef.current = null;
    }
    if (lfoRef.current) {
      try { lfoRef.current.stop(); } catch(e){}
      lfoRef.current = null;
    }
    filterNodeRef.current = null;
  };

  // Generates math brownian noise buffer
  const createBrownNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 4.0; // amplify loss of power
    }
    return noiseBuffer;
  };

  // Continuous Warm Synthesizer Prayer Pad (Fundo de Oração)
  const startSolfeggioHum = (ctx: AudioContext, dest: AudioNode) => {
    // Beautiful, warm G-major add9 open chord cluster
    // G2 (98Hz), D3 (146.8Hz), F#3 (185Hz), A3 (220Hz), D4 (293.6Hz)
    const notes = [98.00, 146.83, 185.00, 220.00, 293.66];
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);
    filter.connect(dest);

    // Very slow filter sweep (LFO) mimicking the slow breath of a devotional keyboard pad
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // slow 16.6s cycles

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(90, ctx.currentTime); // sweep between 170Hz and 350Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slight detuning for beautiful lush analog synthesizer width
      osc.detune.setValueAtTime((idx % 2 === 0 ? 10 : -10), ctx.currentTime);

      oscGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      // Soft introduction over 4 seconds
      oscGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4.0);

      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start();
      
      // Save to active lists for instant silence / cleanup
      activeOscillatorsRef.current.push(osc);
    });

    // Save LFO so it can be cleanly turned off in stopSoundLoops
    lfoRef.current = lfo;
  };

  // Procedural Brown noise play
  const startBrownNoise = (ctx: AudioContext, dest: AudioNode) => {
    const buffer = createBrownNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to make elements deeper and cozy
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(320, ctx.currentTime);

    source.connect(lowpass);
    lowpass.connect(dest);
    source.start();

    noiseSourceRef.current = source;
  };

  // Water current / creek simulation by modulating pink-passed brown noise filter cutoff
  const startWaterSimulation = (ctx: AudioContext, dest: AudioNode) => {
    const buffer = createBrownNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

    // LFO to slowly sweep the frequencies
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second cycles

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime); // Sweeps 230Hz - 670Hz

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    source.connect(bandpass);
    bandpass.connect(dest);

    lfo.start();
    source.start();

    noiseSourceRef.current = source;
    lfoRef.current = lfo;
  };

  // React effect mapping sounds with active isPlaying states
  useEffect(() => {
    if (isPlaying && audioEnabled) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtxClass();
        }
        
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Set up master nodes
        if (!mainGainRef.current) {
          mainGainRef.current = ctx.createGain();
          mainGainRef.current.connect(ctx.destination);
        }

        mainGainRef.current.gain.setValueAtTime(0.0001, ctx.currentTime);
        mainGainRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.2);

        // Strike bowl at start up
        if (tibetanEnabled) {
          playTibetanBowl(ctx);
        }

        // Engage continuous noise loops
        stopSoundLoops();
        if (soundType === 'solfeggio') {
          startSolfeggioHum(ctx, mainGainRef.current);
        } else if (soundType === 'brown') {
          startBrownNoise(ctx, mainGainRef.current);
        } else if (soundType === 'water') {
          startWaterSimulation(ctx, mainGainRef.current);
        } else if (soundType === 'harp') {
          startHarpSimulation(ctx, mainGainRef.current);
        }
      } catch (err) {
        console.warn("Web Audio block/unsupported:", err);
      }
    } else {
      // Gentle fade out of active loop
      if (mainGainRef.current && audioCtxRef.current) {
        try {
          const ctx = audioCtxRef.current;
          mainGainRef.current.gain.setValueAtTime(mainGainRef.current.gain.value, ctx.currentTime);
          mainGainRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          setTimeout(() => {
            stopSoundLoops();
          }, 350);
        } catch(e) {
          stopSoundLoops();
        }
      } else {
        stopSoundLoops();
      }
    }

    return () => {
      // Safeguard cleanup on unmount
      stopSoundLoops();
    };
  }, [isPlaying, soundType, audioEnabled]);

  // Main 4s breathing rhythm engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      // Guided speech for first breath cycles
      triggerPhaseVoice(phase);

      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Trigger next state transition
            let nextPhase: 'inspire' | 'segure' | 'expire' | 'medite';
            if (phase === 'inspire') {
              nextPhase = 'segure';
            } else if (phase === 'segure') {
              nextPhase = 'expire';
            } else if (phase === 'expire') {
              nextPhase = 'medite';
            } else {
              nextPhase = 'inspire';
              setCyclesCompleted(c => c + 1);
            }
            setPhase(nextPhase);
            triggerPhaseVoice(nextPhase);
            return 4;
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

  // Handle gentle voz synthesis alerts
  const triggerPhaseVoice = (p: 'inspire' | 'segure' | 'expire' | 'medite') => {
    if (cyclesCompleted > 0) return; // Speak phrases on first full box-cycle to protect attention
    switch (p) {
      case 'inspire':
        speakVoice("Inspire... sinta o Espírito preenchendo com vida.");
        break;
      case 'segure':
        speakVoice("Aquiete... resguarde a presença no secreto.");
        break;
      case 'expire':
        speakVoice("Expire... solte o medo e o peso do amanhã.");
        break;
      case 'medite':
        speakVoice("Silêncio... apenas seja. Deus habita em você.");
        break;
    }
  };

  const terminateQuietude = () => {
    if (isPlaying) {
      setIsPlaying(false);
      // Play bowl completion bells
      if (tibetanEnabled && audioCtxRef.current) {
        playTibetanBowl(audioCtxRef.current);
      }
      speakVoice("O Santo dos Santos está de portas abertas em você. Leve essa paz ao seu dia.");
    } else {
      setCyclesCompleted(0);
      setIsPlaying(true);
    }
  };

  // Phase layout configurations (Sensação and action descriptions from custom text request)
  const getPhaseConfiguration = () => {
    switch (phase) {
      case 'inspire':
        return {
          header: 'Inspirar (4s)',
          text: 'Inhale o ar lentamente...',
          desc: 'Sinta os pulmões expandindo com vida. O Espírito Santo preenche.',
          color: 'bg-amber-600',
          ringColor: 'border-amber-400',
          scale: [1.0, 1.35],
          textColor: 'text-amber-700 font-serif'
        };
      case 'segure':
        return {
          header: 'Pausar (4s)',
          text: 'Segure suavemente...',
          desc: 'O véu se rasga. Você está na presença.',
          color: 'bg-yellow-750 bg-[#C08261]',
          ringColor: 'border-yellow-600',
          scale: 1.35,
          textColor: 'text-[#C08261] font-serif'
        };
      case 'expire':
        return {
          header: 'Expirar (4s)',
          text: 'Solte o ar devagar...',
          desc: 'Entregue o medo, a pressa, o controle ordinário.',
          color: 'bg-stone-700',
          ringColor: 'border-stone-500',
          scale: [1.35, 1.0],
          textColor: 'text-stone-705 text-stone-700 font-serif'
        };
      case 'medite':
        return {
          header: 'Pausar (4s)',
          text: 'Aguarde em silêncio...',
          desc: 'Apenas seja. O Santo dos Santos está em você.',
          color: 'bg-[#3F4E4F]',
          ringColor: 'border-[#3F4E4F]/70',
          scale: 1.0,
          textColor: 'text-[#3F4E4F] font-serif'
        };
    }
  };

  const currentConf = getPhaseConfiguration();

  // layout mapping: 1. Compact home dashboard widget, 2. Dedicated Sanctuary tab
  if (mode === 'widget') {
    return (
      <div 
        id="breathing-session-card" 
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-stone-200/50 shadow-sm flex flex-col items-center justify-center text-center space-y-5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between w-full border-b border-stone-100 pb-3 mb-1">
          <div className="flex items-center space-x-2">
            <Heart size={14} className="text-[#C08261] animate-pulse" />
            <p className="text-[10.5px] font-mono tracking-wider text-stone-500 uppercase font-bold">Respiro do Secreto</p>
          </div>
          <button
            id="btn-toggle-hum-sound"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 rounded-xl transition-all ${
              audioEnabled ? 'bg-[#C08261]/15 text-[#C08261]' : 'bg-stone-50 text-stone-400 hover:text-stone-700'
            }`}
            title={audioEnabled ? "Mutar som de fundo" : "Ativar som espiritual"}
          >
            {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>

        {/* Breathing Orb Area */}
        <div className="h-44 flex items-center justify-center relative w-44">
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                key={`ring-1-${phase}`}
                className={`absolute inset-0 rounded-full border ${currentConf.ringColor} opacity-50`}
                initial={{ transform: "scale(1.0)", opacity: 0.6 }}
                animate={{
                  transform: phase === 'inspire' ? 'scale(1.3)' : phase === 'expire' ? 'scale(1.0)' : 'scale(1.15)',
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          <motion.div
            id="breathing-orb-visual"
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-md cursor-pointer ${currentConf.color} transition-all duration-1000 relative z-10`}
            animate={{ scale: isPlaying ? currentConf.scale : 1.0 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            onClick={terminateQuietude}
          >
            <span className="font-serif text-2xl font-light text-white">
              {isPlaying ? secondsLeft : 'Entrar'}
            </span>
          </motion.div>
        </div>

        <div className="space-y-1.5">
          <h4 className={`text-base font-serif font-medium transition-all duration-500 ${currentConf.textColor}`}>
            {isPlaying ? currentConf.header : 'Presença & Graça'}
          </h4>
          <p className="text-stone-500 text-[11.5px] leading-relaxed max-w-[240px]">
            {isPlaying ? currentConf.desc : 'Pratique a oração silenciosa de 4 fases para reconfigurar a pressa e entrar no véu.'}
          </p>
        </div>

        <button
          id="btn-breathing-control"
          onClick={terminateQuietude}
          className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
            isPlaying 
              ? 'bg-stone-850 text-white hover:bg-stone-900' 
              : 'bg-[#C08261] text-white hover:bg-[#b07353]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={12} fill="white" />
              <span>Pausar Ritmo</span>
            </>
          ) : (
            <>
              <Play size={12} fill="white" />
              <span>Começar Quietude</span>
            </>
          )}
        </button>

        {cyclesCompleted > 0 && (
          <span className="text-[10px] text-stone-400 font-mono tracking-tight flex items-center space-x-1">
            <Sparkles size={10} className="text-[#C08261]" />
            <span>{cyclesCompleted} {cyclesCompleted === 1 ? 'ciclo sagrado concluído' : 'ciclos sagrados concluídos'}</span>
          </span>
        )}
      </div>
    );
  }

  // Standalone premium sanctuary layout view
  return (
    <div id="sanctuary-respiro-container" className="max-w-5xl mx-auto space-y-10 text-left">
      
      {/* Theological Brand Header Banner */}
      <div className="bg-gradient-to-br from-[#1F1C1A] via-[#141211] to-[#0A0A09] p-8 md:p-12 rounded-3xl border border-[#DCAE6C]/20 shadow-lg text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#DCAE6C]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="space-y-4 max-w-3xl relative z-10">
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-[#DCAE6C]/10 border border-[#DCAE6C]/25 rounded-md text-[10.5px] font-mono uppercase tracking-widest text-[#DCAE6C]">
            <Heart size={11} />
            <span>O Lugar Secreto</span>
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-100">Respiro do Secreto</h2>
          <blockquote className="text-stone-420 italic border-l border-[#DCAE6C]/30 pl-4 py-0.5 text-xs md:text-sm text-stone-300 font-serif max-w-2xl leading-relaxed">
            “Aquietai-vos e sabei que eu sou Deus.” — Salmo 46:10
          </blockquote>
          <p className="text-stone-400 text-xs md:text-sm font-sans leading-relaxed max-w-xl">
            O véu se rasgou. O Santo dos Santos não é mais um templo de pedras. É em seu interior. <br />
            Entre neste espaço de silêncio absoluto. Aqui, você não precisa de palavras. Apenas respire, acolha a graça e descanse na presença Consoladora do Espírito.
          </p>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Orb Panel (Col Span: 7) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/50 p-8 md:p-10 rounded-3xl shadow-sm space-y-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="absolute top-4 left-4 flex items-center space-x-1.5 text-[10px] text-stone-400 font-mono">
            <Clock size={11} />
            <span>Fases: 4s - 4s - 4s - 4s</span>
          </div>

          <div className="h-64 flex items-center justify-center relative w-64 mt-4">
            <AnimatePresence>
              {isPlaying && (
                <>
                  <motion.div
                    key={`ring-bg-${phase}`}
                    className={`absolute inset-0 rounded-full border-2 ${currentConf.ringColor} opacity-40`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    key={`ring-soft-${phase}`}
                    className="absolute inset-6 rounded-full border border-dashed border-stone-300/30 opacity-60"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  />
                </>
              )}
            </AnimatePresence>

            <motion.div
              id="breathing-orb-visual"
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer ${currentConf.color} transition-all duration-1000 relative z-10`}
              animate={{ scale: isPlaying ? currentConf.scale : 1.0 }}
              transition={{ duration: 4, ease: "easeInOut" }}
              onClick={terminateQuietude}
            >
              <div className="absolute inset-0 rounded-full bg-radial from-white/10 to-transparent pointer-events-none" />
              <span className="font-serif text-4xl font-light text-white select-none">
                {isPlaying ? secondsLeft : 'Começar'}
              </span>
              {!isPlaying && (
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#DCAE6C] mt-1 font-bold">Início</span>
              )}
            </motion.div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className={`text-2xl font-serif font-medium transition-all duration-500 tracking-tight leading-snug ${currentConf.textColor}`}>
              {isPlaying ? currentConf.header : 'Aquiete o seu coração'}
            </h3>
            <p className="text-stone-605 text-stone-500 font-sans text-sm leading-relaxed min-h-[44px]">
              {isPlaying ? currentConf.desc : 'Encontre uma posição confortável, relaxe a sua mente e clique em começar quietude.'}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 pt-1 w-full max-w-sm">
            <button
              id="btn-breathing-control"
              onClick={terminateQuietude}
              className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-md w-full ${
                isPlaying 
                  ? 'bg-stone-900 hover:bg-black text-white' 
                  : 'bg-[#C08261] hover:bg-[#A06C51] text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square size={13} fill="currentColor" />
                  <span>Pausar Ritmo</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>Começar Quietude</span>
                </>
              )}
            </button>

            {cyclesCompleted > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-1.5 text-xs text-[#8C6239] font-mono"
              >
                <Sparkles size={12} className="text-[#C08261]" />
                <span>{cyclesCompleted} {cyclesCompleted === 1 ? 'ciclo concluído' : 'ciclos concluídos'} nesta quietude</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Ambient Sanctuary Controls & Info (Col Span: 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sound Dashboard Panel */}
          <div className="bg-white border border-stone-200/50 p-6 rounded-3xl shadow-sm space-y-5">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#8C6239] border-b border-stone-100 pb-3 flex items-center space-x-2">
              <Volume2 size={14} />
              <span>Ambiente Sonoro</span>
            </h4>

            {/* Enable/Disable Sound Audio switch */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs md:text-sm font-serif font-medium text-stone-800">Sintonia Sonora</span>
                <p className="text-[10.5px] text-stone-400 font-mono">Ligar/desligar música e drones</p>
              </div>
              <button
                id="btn-toggle-ambient-audio"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  audioEnabled ? 'bg-[#C08261]' : 'bg-stone-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    audioEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Custom volume input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-stone-500 font-mono">
                <span>Volume de Fundo</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                id="volume-slider-control"
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#C08261] h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                disabled={!audioEnabled}
              />
              <p className="text-[9.5px] text-stone-400 font-mono leading-tight">
                *Nota: Para sua melhor absorção, sugerimos fones de ouvido e sons em volume sutil, quase na percepção subliminar.
              </p>
            </div>

            {/* Select Sound Source Modes (List selections requested by user) */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10.5px] font-mono text-zinc-500 tracking-wider">Escolha o seu Foco de Atenção:</span>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="sound-opt-solfeggio"
                  onClick={() => setSoundType('solfeggio')}
                  className={`p-3 rounded-2xl flex items-center gap-3 text-left border transition-all ${
                    soundType === 'solfeggio' 
                      ? 'border-[#C08261] bg-[#C08261]/5 text-[#C08261] font-semibold shadow-xs' 
                      : 'border-stone-200/55 hover:bg-stone-50 text-stone-605'
                  }`}
                  disabled={!audioEnabled}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border border-[#C08261] flex items-center justify-center ${soundType === 'solfeggio' ? 'bg-[#C08261]' : ''}`}>
                    {soundType === 'solfeggio' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <h5 className="text-[12.5px] font-serif leading-none">Fundo de Oração (Warm Pad)</h5>
                    <p className="text-[10px] text-stone-400 font-mono leading-normal mt-0.5">Suave som de teclado e string flutuante de fundo (fundo de pregação).</p>
                  </div>
                </button>

                <button
                  id="sound-opt-brown"
                  onClick={() => setSoundType('brown')}
                  className={`p-3 rounded-2xl flex items-center gap-3 text-left border transition-all ${
                    soundType === 'brown' 
                      ? 'border-[#C08261] bg-[#C08261]/5 text-stone-900 font-semibold shadow-xs' 
                      : 'border-stone-200/55 hover:bg-stone-50 text-stone-650'
                  }`}
                  disabled={!audioEnabled}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border border-[#C08261] flex items-center justify-center ${soundType === 'brown' ? 'bg-[#C08261]' : ''}`}>
                    {soundType === 'brown' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <h5 className="text-[12.5px] font-serif leading-none">Ruído Marrom (Cachoeira)</h5>
                    <p className="text-[10px] text-stone-400 font-mono leading-normal mt-0.5">Frequências graves e densas que eliminam ruídos externos.</p>
                  </div>
                </button>

                <button
                  id="sound-opt-water"
                  onClick={() => setSoundType('water')}
                  className={`p-3 rounded-2xl flex items-center gap-3 text-left border transition-all ${
                    soundType === 'water' 
                      ? 'border-[#C08261] bg-[#C08261]/5 text-stone-900 font-semibold shadow-xs' 
                      : 'border-stone-200/55 hover:bg-stone-50 text-stone-600'
                  }`}
                  disabled={!audioEnabled}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border border-[#C08261] flex items-center justify-center ${soundType === 'water' ? 'bg-[#C08261]' : ''}`}>
                    {soundType === 'water' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <h5 className="text-[12.5px] font-serif leading-none">Água Corrente</h5>
                    <p className="text-[10px] text-stone-400 font-mono leading-normal mt-0.5">O fluir do riacho para lembrar as águas do Espírito.</p>
                  </div>
                </button>

                <button
                  id="sound-opt-harp"
                  onClick={() => setSoundType('harp')}
                  className={`p-3 rounded-2xl flex items-center gap-3 text-left border transition-all ${
                    soundType === 'harp' 
                      ? 'border-[#C08261] bg-[#C08261]/5 text-stone-900 font-semibold shadow-xs' 
                      : 'border-stone-200/55 hover:bg-stone-50 text-stone-600'
                  }`}
                  disabled={!audioEnabled}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border border-[#C08261] flex items-center justify-center ${soundType === 'harp' ? 'bg-[#C08261]' : ''}`}>
                    {soundType === 'harp' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <h5 className="text-[12.5px] font-serif leading-none">Harpa Celestial de Davi 🕊️</h5>
                    <p className="text-[10px] text-[#C08261] font-mono leading-normal mt-0.5 font-semibold">Suaves dedilhados e cascatas de harpa pura (som que toca o profundo).</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Toggle signals options */}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2.5">
              <label id="lbl-voice-guide-opt" className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="rounded border-stone-300 text-[#C08261] focus:ring-[#C08261]"
                />
                <span className="font-serif">Voz guiada espiritual (primeiro ciclo)</span>
              </label>

              <label id="lbl-bell-signal-opt" className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tibetanEnabled}
                  onChange={(e) => setTibetanEnabled(e.target.checked)}
                  className="rounded border-stone-300 text-[#C08261] focus:ring-[#C08261]"
                />
                <span className="font-serif">Acorde de fundo suave / Pad (início/fim)</span>
              </label>
            </div>
          </div>

          {/* Theological guide information */}
          <div className="bg-amber-50/20 border border-amber-200/35 p-6 rounded-3xl shadow-xs space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#C08261] flex items-center gap-1.5 leading-none">
              <InfoIcon size={13} />
              <span>O Segredo do Ciclo</span>
            </h4>
            
            <div className="space-y-3 font-serif text-xs md:text-[13px] leading-relaxed text-stone-700">
              <p>
                O Ritmo de 4 segundos imita a quietude profunda da Nova Aliança:
              </p>
              <div className="space-y-2 border-l border-amber-300/40 pl-3">
                <div>
                  <strong className="text-stone-850 block">1. Inspirar lentamente (4s)</strong>
                  <span className="text-stone-500 font-sans tracking-wide text-[11px]">Inhale o fôlego da graça. O Espírito Santo preenche a sua estrutura.</span>
                </div>
                <div>
                  <strong className="text-stone-850 block">2. Pausa e absorção (4s)</strong>
                  <span className="text-stone-500 font-sans tracking-wide text-[11px]">O véu se rasgou. Você está retido na presença secreta divina.</span>
                </div>
                <div>
                  <strong className="text-stone-850 block">3. Expirar mansamente (4s)</strong>
                  <span className="text-[#C08261] font-sans tracking-wide text-[11px]">Solte todo o ar — entregue a pressa, a ansiedade, o controle mundano.</span>
                </div>
                <div>
                  <strong className="text-stone-850 block">4. Aguardar em silêncio (4s)</strong>
                  <span className="text-stone-500 font-sans tracking-wide text-[11px]">Repouse. Deus é o seu tudo. Deus está aqui.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

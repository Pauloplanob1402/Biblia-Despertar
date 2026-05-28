/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';
import { Folder, FileCode, Copy, Check, Terminal, Play, AlertTriangle, Cpu, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AndroidExporter() {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(ANDROID_PROJECT_FILES[0].path);
  const [copySuccess, setCopySuccess] = useState(false);
  const [codeFontSize, setCodeFontSize] = useState<number>(13); // default is 13px (larger and clearer by default)

  const selectedFile = ANDROID_PROJECT_FILES.find(f => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.sourceCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch border border-stone-200/50 rounded-3xl overflow-hidden shadow-lg bg-stone-900 text-stone-100 min-h-[580px]">
      
      {/* LEFT: Project Explorer Tree */}
      <div className="lg:col-span-1 bg-stone-950 border-r border-stone-800 p-5 flex flex-col justify-between">
        <div className="space-y-5 text-left">
          <div className="flex items-center space-x-2 text-amber-200/90 pb-3 border-b border-stone-800">
            <Cpu size={16} />
            <h4 className="font-mono text-xs tracking-wider uppercase font-semibold">Android Directory</h4>
          </div>

          <div className="space-y-4">
            {/* Root files */}
            <div>
              <span className="text-[9px] uppercase font-mono text-stone-500 tracking-widest pl-1">PROJETO ROOT (GRADLE 8.9)</span>
              <div className="flex flex-col space-y-1 mt-1.5 font-mono text-[11px]">
                {ANDROID_PROJECT_FILES.filter(f => !f.path.includes('app/')).map(file => (
                  <button
                    id={`btn-explore-file-${file.path.replace(/\//g, '-')}`}
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-left transition ${
                      selectedFilePath === file.path 
                        ? 'bg-amber-600/20 text-amber-200 font-bold border-l-2 border-amber-500' 
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <FileCode size={12} className="text-amber-500 shrink-0" />
                    <span className="truncate">{file.path.split('/').pop()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Application modules */}
            <div>
              <span className="text-[9px] uppercase font-mono text-stone-500 tracking-widest pl-1">APP MODULE (SDK 35)</span>
              <div className="flex flex-col space-y-1 mt-1.5 font-mono text-[11px]">
                {ANDROID_PROJECT_FILES.filter(f => f.path.includes('app/')).map(file => (
                  <button
                    id={`btn-explore-file-${file.path.replace(/\//g, '-')}`}
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-left transition ${
                      selectedFilePath === file.path 
                        ? 'bg-amber-600/20 text-amber-200 font-semibold border-l-2 border-amber-500' 
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <FileCode size={12} className="text-stone-400 shrink-0" />
                    <span className="truncate" title={file.path}>{file.path.split('/').pop()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Guidance label */}
        <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl space-y-2 mt-4 text-left">
          <div className="flex items-center space-x-1 text-[10px] text-amber-200 font-bold">
            <Terminal size={12} />
            <span>Google Play Sign off ready</span>
          </div>
          <p className="text-[9px] text-stone-400 leading-normal">
            Compatible with Android Gradle Plugin 8.7.2, Hilt dependency injection, and billing APIs out-of-the-box.
          </p>
        </div>
      </div>

      {/* RIGHT: Dynamic Code View pane */}
      <div className="lg:col-span-3 p-6 flex flex-col justify-between space-y-4">
        
        {/* Code Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800 pb-4 gap-3 text-left">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-amber-200/70 tracking-widest">
              Arquivo: {selectedFile.path}
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xl">
              {selectedFile.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Font Sizer */}
            <div className="flex items-center space-x-1 bg-stone-850 px-2.5 py-1.5 rounded-xl border border-stone-800 text-[11px] font-mono shrink-0">
              <span className="text-stone-400 mr-1.5">Fonte:</span>
              <button 
                id="btn-decrease-font"
                onClick={() => setCodeFontSize(prev => Math.max(10, prev - 1))} 
                className="w-5 h-5 flex items-center justify-center bg-stone-900 rounded-lg hover:bg-stone-950 text-white font-bold transition active:scale-95"
                title="Diminuir fonte"
              >-</button>
              <span className="text-amber-250 font-bold w-9 text-center text-stone-200">{codeFontSize}px</span>
              <button 
                id="btn-increase-font"
                onClick={() => setCodeFontSize(prev => Math.min(24, prev + 1))} 
                className="w-5 h-5 flex items-center justify-center bg-stone-900 rounded-lg hover:bg-stone-950 text-white font-bold transition active:scale-95"
                title="Aumentar fonte"
              >+</button>
            </div>

            <button
              id="btn-copy-android-source"
              onClick={handleCopyCode}
              className={`flex items-center space-x-1.5 px-4.5 py-2 rounded-xl text-xs font-semibold shadow transition-all shrink-0 ${
                copySuccess 
                  ? 'bg-emerald-600 text-white shadow-emerald-900/10' 
                  : 'bg-stone-800 hover:bg-stone-700 hover:border-stone-600 text-white border border-stone-700'
              }`}
            >
              {copySuccess ? (
                <>
                  <Check size={14} />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main code editor representation window */}
        <div className="flex-1 bg-stone-950 rounded-2xl border border-stone-800 p-5 font-mono overflow-auto max-h-[420px] shadow-inner text-left">
          <pre 
            className="text-amber-50 opacity-90 leading-relaxed whitespace-pre font-mono"
            style={{ fontSize: `${codeFontSize}px` }}
          >
            {selectedFile.sourceCode}
          </pre>
        </div>

        {/* Integration guides */}
        <div className="bg-stone-950/40 border border-stone-800/80 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="flex space-x-2">
            <Globe className="text-[#C08261] shrink-0 mt-0.5" size={14} />
            <div className="space-y-0.5">
              <strong className="text-[10px] uppercase font-mono text-stone-300">Supabase RLS Ready</strong>
              <p className="text-[9px] text-stone-400 leading-normal">
                Securely fetch and add community tables with built-in client configuration.
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Play className="text-[#C08261] shrink-0 mt-0.5" size={14} />
            <div className="space-y-0.5">
              <strong className="text-[10px] uppercase font-mono text-stone-300">Release Build Guarded</strong>
              <p className="text-[9px] text-stone-400 leading-normal">
                Includes full Proguard rules preventing optimization breakdown on Supabase serialization.
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <AlertTriangle className="text-[#C08261] shrink-0 mt-0.5" size={14} />
            <div className="space-y-0.5">
              <strong className="text-[10px] uppercase font-mono text-stone-300">Play Billing v7</strong>
              <p className="text-[9px] text-stone-400 leading-normal">
                Pre-configured Google Play purchases mapping and product details fetch routines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

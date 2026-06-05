import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, AlertCircle, Sparkles, X, LogIn } from 'lucide-react';
import AvatarUpload from './AvatarUpload';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState('contemplative');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedPhotoURL, setUploadedPhotoURL] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        // SIGN UP
        if (!name.trim()) {
          throw new Error('Por favor, informe seu nome.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Set native display name
        await updateProfile(user, {
          displayName: name.trim()
        });

        // Set user record under /users/{uid} using the specified named database instance (auth handles binding)
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          name: name.trim(),
          email: email.trim(),
          avatarEmoji: uploadedPhotoURL || '🕊️',
          photoURL: uploadedPhotoURL || null,
          currentIdentityId: selectedArchetype,
          streak: 4,
          totalVotes: 0,
          ideasShared: 0,
          joinedAt: serverTimestamp()
        }, { merge: true });
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      let translated = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        translated = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        translated = 'Este e-mail já está sendo utilizado por outro fiel.';
      } else if (err.code === 'auth/weak-password') {
        translated = 'A senha deve possuir pelo menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        translated = 'E-mail inválido.';
      }
      setError(translated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-stone-200 shadow-xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close trigger button */}
          <button 
            id="close-auth-modal"
            onClick={onClose} 
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-50 transition"
          >
            <X size={18} />
          </button>

          {/* Heading */}
          <div className="text-center space-y-2 mb-6">
            <span className="text-2xl">🕊️</span>
            <h3 className="font-serif text-2xl font-light text-stone-850">
              {isLogin ? 'Retornar à Jornada' : 'Iniciar Novo Caminho'}
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              {isLogin 
                ? 'Conecte-se para reaver suas anotações, notas de leitura e mesas fraternas.'
                : 'Crie sua conta para registrar seus momentos de quietude e caminhar com outros peregrinos de Deus.'
              }
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200/60 text-rose-800 text-xs p-3.5 rounded-xl flex items-start space-x-2 leading-relaxed text-left mb-4">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {!isLogin && (
              <>
                {/* Nome Completo */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Nome ou Apelido *</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-3.5 text-stone-400" />
                    <input
                      id="auth-signup-name"
                      type="text"
                      required
                      placeholder="Como deseja ser chamado?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200/60 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>
                </div>

                {/* Avatar upload */}
                <div className="flex flex-col items-center space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Sua Foto de Perfil</label>
                  <AvatarUpload
                    currentAvatar={uploadedPhotoURL || '🕊️'}
                    onUploadSuccess={(url) => setUploadedPhotoURL(url)}
                  />
                </div>

                {/* Initial Archetype select */}
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Como você prefere se aproximar de Deus?</label>
                  <select
                    id="auth-signup-archetype"
                    value={selectedArchetype}
                    onChange={(e) => setSelectedArchetype(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                  >
                    <option value="contemplative">No Silêncio e Secreto (Introspectivo)</option>
                    <option value="rational">Na Leitura e Estudo (Teológico)</option>
                    <option value="emotional">Na Entrega e Canto (Expressivo)</option>
                    <option value="practician">Nas Atitudes e Serviço (Prático)</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Input */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">E-mail de Acesso *</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-3.5 text-stone-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="fiel@despertar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200/60 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Senha de Acesso *</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-3.5 text-stone-400" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200/60 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition flex items-center justify-center space-x-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={14} />
                  <span>{isLogin ? 'Entrar no Templo' : 'Consagrar Inscrição'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="text-center mt-6 pt-4 border-t border-stone-100">
            <button
              id="auth-tab-toggle"
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[#C08261] hover:text-[#b07353] text-[11px] font-medium font-mono"
            >
              {isLogin 
                ? "Deseja participar pela primeira vez? Cadastre-se."
                : "Já possui conta para login? Faça login por aqui."
              }
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Camera, Loader2 } from 'lucide-react';

// ✅ Cole aqui suas credenciais do Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dkeyilacc'; // Ex: 'despertar123'
const CLOUDINARY_UPLOAD_PRESET = 'Bibliadespertar'; // O preset que você criou

interface AvatarUploadProps {
  currentAvatar?: string; // URL atual ou emoji
  onUploadSuccess?: (url: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    // Mostra preview local imediatamente
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      // 1. Faz upload direto para o Cloudinary (sem backend)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'avatars');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Falha no upload.');

      const data = await response.json();
      const imageUrl: string = data.secure_url;

      // 2. Salva a URL no Firestore
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: imageUrl,
        });

        // 3. Atualiza o perfil do Firebase Auth também
        await updateProfile(user, { photoURL: imageUrl });
      }

      setPreview(imageUrl);
      onUploadSuccess?.(imageUrl);
    } catch (err) {
      setError('Erro ao enviar imagem. Tente novamente.');
      setPreview(null);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Determina o que mostrar: preview, foto atual, ou emoji
  const isUrl = (val?: string) => val?.startsWith('http');
  const displayImage = preview || (isUrl(currentAvatar) ? currentAvatar : null);
  const displayEmoji = !displayImage ? (currentAvatar || '👤') : null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar clicável */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-stone-200 hover:border-[#C08261] transition group"
      >
        {displayImage ? (
          <img src={displayImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-4xl bg-stone-100">
            {displayEmoji}
          </span>
        )}

        {/* Overlay ao passar o mouse */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          {uploading
            ? <Loader2 size={20} className="text-white animate-spin" />
            : <Camera size={20} className="text-white" />
          }
        </div>
      </button>

      <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
        {uploading ? 'Enviando...' : 'Clique para alterar foto'}
      </p>

      {error && (
        <p className="text-[10px] text-rose-500">{error}</p>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

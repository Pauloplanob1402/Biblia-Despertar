import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  increment,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export type TipoSemente = 'oracao' | 'testemunho';

interface PlantarSementeParams {
  uid: string;
  tipo: TipoSemente;
  descricao: string;
}

export async function plantarSemente({
  uid,
  tipo,
  descricao
}: PlantarSementeParams): Promise<void> {
  // Always update local storage first as a graceful client-side immediate reference
  const localVal = localStorage.getItem('despertar_sementes_saldo');
  const currentLocal = localVal ? parseInt(localVal) : 0;
  const newSaldo = currentLocal + 1;
  localStorage.setItem('despertar_sementes_saldo', newSaldo.toString());

  // Also store local movements history
  const localMovsStr = localStorage.getItem('despertar_sementes_movimentos');
  const localMovs = localMovsStr ? JSON.parse(localMovsStr) : [];
  const newMov = {
    tipo,
    descricao,
    valor: 1,
    criadoEm: new Date().toISOString()
  };
  localMovs.unshift(newMov); // newest first
  localStorage.setItem('despertar_sementes_movimentos', JSON.stringify(localMovs));

  // Dispatch events so the UI updates and animates immediately
  window.dispatchEvent(new Event('storage-sementes-updated'));
  window.dispatchEvent(new CustomEvent('semente-plantada', {
    detail: { tipo, descricao, newSaldo }
  }));

  if (!uid) return;
  try {
    const sementeRef = doc(db, 'sementes', uid);

    // Cria ou atualiza o documento raiz com saldo acumulado
    await setDoc(sementeRef, {
      saldo: increment(1),
      ultimaAtualizacao: serverTimestamp()
    }, { merge: true });

    // Registra o movimento individual
    await addDoc(collection(db, 'sementes', uid, 'movimentos'), {
      tipo,
      descricao,
      valor: 1,
      criadoEm: serverTimestamp()
    });
  } catch (err) {
    console.warn("Firestore save sementes skipped or failed (safe fallback active):", err);
  }
}

export async function buscarSaldo(uid: string): Promise<number> {
  if (!uid) {
    const localVal = localStorage.getItem('despertar_sementes_saldo');
    return localVal ? parseInt(localVal) : 0;
  }
  try {
    const snap = await getDoc(doc(db, 'sementes', uid));
    if (!snap.exists()) {
      const localVal = localStorage.getItem('despertar_sementes_saldo');
      return localVal ? parseInt(localVal) : 0;
    }
    return snap.data().saldo ?? 0;
  } catch (err) {
    const localVal = localStorage.getItem('despertar_sementes_saldo');
    return localVal ? parseInt(localVal) : 0;
  }
}

export async function buscarMovimentos(uid: string): Promise<any[]> {
  const localMovsStr = localStorage.getItem('despertar_sementes_movimentos');
  const localMovs = localMovsStr ? JSON.parse(localMovsStr) : [];

  if (!uid) {
    return localMovs;
  }

  try {
    const movsCol = collection(db, 'sementes', uid, 'movimentos');
    const q = query(movsCol, orderBy('criadoEm', 'desc'), limit(50));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return localMovs;
    }

    return snap.docs.map(d => {
      const data = d.data();
      let criadoEmStr = new Date().toISOString();
      if (data.criadoEm) {
        criadoEmStr = typeof data.criadoEm.toDate === 'function' 
          ? data.criadoEm.toDate().toISOString() 
          : new Date(data.criadoEm).toISOString();
      }
      return {
        id: d.id,
        tipo: data.tipo || 'oracao',
        descricao: data.descricao || '',
        valor: data.valor || 1,
        criadoEm: criadoEmStr
      };
    });
  } catch (err) {
    console.warn("Error fetching firestore movements, falling back to local:", err);
    return localMovs;
  }
}

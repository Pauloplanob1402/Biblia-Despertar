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

  let valor = 1;
  let mensagemEspecial = '';
  let versiculo = '';
  
  const rand = Math.random();
  if (rand < 0.15) {
    valor = 3;
    const proverbios = [
      { text: "O homem bom deixa uma herança para os filhos de seus filhos.", ref: "Provérbios 13:22" },
      { text: "O coração alegre serve de bom remédio, mas o espírito abatido seca os ossos.", ref: "Provérbios 17:22" },
      { text: "Como o ferro com o ferro se afia, assim o homem ao seu amigo.", ref: "Provérbios 27:17" },
      { text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", ref: "Provérbios 3:5" },
      { text: "A resposta branda desvia o furor, mas a palavra dura suscita a ira.", ref: "Provérbios 15:1" }
    ];
    const escolhido = proverbios[Math.floor(Math.random() * proverbios.length)];
    mensagemEspecial = "🔥 Colheita Especial Triplicada! (Sua oração tocou profundamente o Secreto)";
    versiculo = `"${escolhido.text}" — ${escolhido.ref}`;
  } else if (rand < 0.35) {
    valor = 2;
    mensagemEspecial = " ✨ Sua semente ecoou com força no invisível!";
  } else {
    valor = 1;
  }

  const newSaldo = currentLocal + valor;
  localStorage.setItem('despertar_sementes_saldo', newSaldo.toString());

  // Also store local movements history with the correct valor
  const localMovsStr = localStorage.getItem('despertar_sementes_movimentos');
  const localMovs = localMovsStr ? JSON.parse(localMovsStr) : [];
  const newMov = {
    id: Math.random().toString(),
    tipo,
    descricao,
    valor,
    criadoEm: new Date().toISOString()
  };
  localMovs.unshift(newMov); // newest first
  localStorage.setItem('despertar_sementes_movimentos', JSON.stringify(localMovs));

  // Dispatch events so the UI updates and animates immediately
  window.dispatchEvent(new Event('storage-sementes-updated'));
  window.dispatchEvent(new CustomEvent('semente-plantada', {
    detail: { tipo, descricao, newSaldo, valor, mensagemEspecial, versiculo }
  }));

  if (!uid) return;
  try {
    const sementeRef = doc(db, 'sementes', uid);

    // Cria ou atualiza o documento raiz com saldo acumulado
    await setDoc(sementeRef, {
      saldo: increment(valor),
      ultimaAtualizacao: serverTimestamp()
    }, { merge: true });

    // Registra o movimento individual
    await addDoc(collection(db, 'sementes', uid, 'movimentos'), {
      tipo,
      descricao,
      valor,
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

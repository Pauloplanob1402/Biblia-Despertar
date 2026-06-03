/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Devotional {
  id: string;
  title: string;
  scripture: string;
  text: string;
  pauseInstruction: string;
  prayer: string;
  graceInPractice: string;
  reflectiveQuestion: string;
  category: string;
}

const getCategoryAndDayName = (dayNumber: number): { category: string; formattedTitle: string } => {
  let category = '';
  if (dayNumber <= 30) {
    category = 'Mês 1 — O Despertar';
  } else if (dayNumber <= 60) {
    category = 'Mês 2 — O Altar do Encontro';
  } else if (dayNumber <= 90) {
    category = 'Mês 3 — Doce Comunhão';
  } else if (dayNumber <= 120) {
    category = 'Mês 4 — Transformados pela Luz';
  } else if (dayNumber <= 150) {
    category = 'Mês 5 — O Sopro e a Vida';
  } else if (dayNumber <= 180) {
    category = 'Mês 6 — Palavras e Vida';
  } else if (dayNumber <= 210) {
    category = 'Mês 7 — No Secreto com o Pai';
  } else if (dayNumber <= 240) {
    category = 'Mês 8 — Sabedoria e Justiça';
  } else if (dayNumber <= 270) {
    category = 'Mês 9 — A Graça e a Verdade';
  } else if (dayNumber <= 300) {
    category = 'Mês 10 — Frutos do Reino';
  } else if (dayNumber <= 330) {
    category = 'Mês 11 — Firmeza no Caminho';
  } else {
    category = 'Mês 12 — O Despertamento Supremo';
  }
  return { category, formattedTitle: `Dia ${dayNumber}` };
};

const run = () => {
  const devotionals: Devotional[] = [];

  for (let i = 1; i <= 7; i++) {
    const filePath = path.join(__dirname, `raw_part${i}.txt`);
    if (!fs.existsSync(filePath)) {
      console.warn(`File raw_part${i}.txt not found.`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const blocks = content.split(/(?=Dia \d+)/i).map(b => b.trim()).filter(b => b.length > 0 && b.toLowerCase().startsWith('dia'));

    for (const block of blocks) {
      // Find lines
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) continue;

      const firstLine = lines[0];
      const idMatch = firstLine.match(/^Dia (\d+)/i);
      if (!idMatch) {
         console.warn(`Could not parse day number from: ${firstLine}`);
         continue;
      }
      const dayNum = parseInt(idMatch[1]);
      const title = firstLine.replace(/^Dia \d+\s*[-—:\s]\s*/i, '').trim();

      // Find scripture
      const scriptureLineMatch = block.match(/Leia:\s*(.*)$/m);
      const scripture = scriptureLineMatch ? scriptureLineMatch[1].trim() : "";

      // Find Question
      const questionMatch = block.match(/Pergunta:\s*([\s\S]*?)(?=\nDesafio:|\nOração:|$)/i);
      const reflectiveQuestion = questionMatch ? questionMatch[1].trim() : "";

      // Find Challenge
      const challengeMatch = block.match(/Desafio:\s*([\s\S]*?)(?=\nOração:|$)/i);
      const graceInPractice = challengeMatch ? challengeMatch[1].trim() : "";

      // Find Prayer
      const prayerMatch = block.match(/Oração:\s*([\s\S]*?)$/i);
      const prayer = prayerMatch ? prayerMatch[1].trim() : "";

      // Extract raw text (Pensamento)
      let textStart = block.indexOf('Pensamento');
      if (textStart === -1) {
         textStart = block.indexOf('Thoughts (Pensamento)');
      }
      if (textStart === -1 && scriptureLineMatch) {
         textStart = block.indexOf(scriptureLineMatch[0]) + scriptureLineMatch[0].length;
      }
      if (textStart === -1) {
         textStart = firstLine.length;
      } else {
         const word = block.includes('Thoughts (Pensamento)') ? 'Thoughts (Pensamento)' : 'Pensamento';
         textStart += word.length;
      }

      const textEnd = block.search(/Pergunta:|Desafio:|Oração:/i);
      let text = textEnd !== -1 ? block.substring(textStart, textEnd).trim() : block.substring(textStart).trim();

      // Clean the text
      text = text.replace(/^[-—:\s]+/, '').trim();

      const pauseInstruction = `Feche os olhos por alguns instantes. Respire devagar, acalme seus pensamentos sobre "${title}" e sinta a presença invisível de Deus antes de prosseguir com a leitura.`;
      const { category } = getCategoryAndDayName(dayNum);

      devotionals.push({
        id: `day_${dayNum}`,
        title,
        scripture,
        text,
        pauseInstruction,
        prayer,
        graceInPractice,
        reflectiveQuestion,
        category
      });
    }
  }

  // Sort devotionals by day index
  devotionals.sort((a, b) => {
    const aNum = parseInt(a.id.replace('day_', ''));
    const bNum = parseInt(b.id.replace('day_', ''));
    return aNum - bNum;
  });

  console.log(`Successfully parsed ${devotionals.length} devotionals!`);

  // Split into COMUNHAO and MULTIPLICACAO
  // Days 1-180 (Comunhão)
  const devList = devotionals.filter(d => {
    const num = parseInt(d.id.replace('day_', ''));
    return num <= 180;
  });

  // Days 181-365 (Multiplicação)
  const multList = devotionals.filter(d => {
    const num = parseInt(d.id.replace('day_', ''));
    return num > 180;
  });

  const devFileContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Devotional } from '../types';

export const DEVOCIONAIS: Devotional[] = ${JSON.stringify(devList, null, 2)};
`;

  const multFileContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Devotional } from '../types';

export const MULTIPLICACAO: Devotional[] = ${JSON.stringify(multList, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, 'devotionals.ts'), devFileContent, 'utf-8');
  fs.writeFileSync(path.join(__dirname, 'multiplication.ts'), multFileContent, 'utf-8');

  console.log(`Written devotionals.ts (${devList.length} items)`);
  console.log(`Written multiplication.ts (${multList.length} items)`);
};

run();

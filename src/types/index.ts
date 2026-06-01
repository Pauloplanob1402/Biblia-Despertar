/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpiritualIdentity {
  id: string;
  name: string;
  subtitle: string;
  quote: string;
  description: string;
  scripture: string;
  reflectiveQuestion: string;
  prayer: string;
  archetype: string;
  emotionalTrigger: string;
  coreFeeling: string;
  hexColor: string;
}

export interface Devotional {
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

export interface BibleVerse {
  chapter: number;
  number: number;
  text: string;
}

export interface BibleBook {
  id: string;
  name: string;
  category: 'Velho Testamento' | 'Novo Testamento';
  chapterCount: number;
  chapters: { [chapterNumber: number]: BibleVerse[] };
}

export interface Mesa {
  id: string;
  title: string;
  hostName: string;
  hostBio: string;
  city: string;
  state: string;
  type: 'In-person' | 'Online';
  address?: string;
  frequency: string;
  description: string;
  slotsTotal: number;
  slotsTaken: number;
  members: string[]; // User IDs or names participating
}

export interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  coverImage?: string;
  description: string;
  isPremium: boolean;
  chapters: {
    title: string;
    content: string;
    estimatedReadTime: number;
  }[];
}

export interface UserProgress {
  streak: number;
  lastActive: string | null;
  savedReflections: {
    id: string;
    verseRef: string;
    reflectionText: string;
    createdAt: string;
  }[];
  favoriteVerses: {
    ref: string; // e.g. "Salmos 23:1"
    text: string;
  }[];
  completedChapters: string[]; // e.g. "ebookId_chapterIndex"
  currentIdentityId: string | null;
  answers: { [questionId: string]: string };
  // Retention & Consistency attributes added in Fase 2
  maxStreak?: number;
  lastReadBibleInfo?: { bookId: string; bookName: string; chapter: number };
  lastReadEbookInfo?: { ebookId: string; ebookTitle: string; chapterIndex: number; chapterTitle: string };
  lastReadDevotionalInfo?: { devotionalId: string; title: string; dayIndex: number };
  breathingCyclesCount?: number;
  dailyChallengesDate?: string;
  completedChallenges?: string[]; // e.g. ["breath", "read", "reflection"]
  perfectDaysCount?: number;
}

import type { Question, QuizConfig, GameResult } from '../types';

export interface StoredAnswer {
  question: Question;
  selectedKey: string;
  isCorrect: boolean;
}

export interface StoredActiveQuiz {
  namaPeserta: string;
  config: QuizConfig;
  questions: Question[];
  currentIdx: number;
  answers: StoredAnswer[];
  startTime: number;
  savedAt: number;
}

export interface StoredResultSession {
  gameResult: GameResult;
  config: QuizConfig;
  savedAt: number;
}

const ACTIVE_QUIZ_KEY = 'minigames_hima_active_quiz';
const RESULT_SESSION_KEY = 'minigames_hima_result_session';

// Sesi kedaluwarsa setelah 12 jam agar tidak terkunci selamanya
const MAX_SESSION_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Simpan progress kuis yang sedang berjalan
 */
export function saveActiveQuiz(data: {
  namaPeserta: string;
  config: QuizConfig;
  questions: Question[];
  currentIdx: number;
  answers: StoredAnswer[];
  startTime: number;
}): void {
  try {
    const payload: StoredActiveQuiz = {
      ...data,
      savedAt: Date.now()
    };
    localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Gagal menyimpan sesi aktif kuis ke localStorage:', err);
  }
}

/**
 * Update indeks dan jawaban kuis yang sedang aktif
 */
export function updateActiveQuizProgress(currentIdx: number, answers: StoredAnswer[]): void {
  try {
    const raw = localStorage.getItem(ACTIVE_QUIZ_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredActiveQuiz;
    parsed.currentIdx = currentIdx;
    parsed.answers = answers;
    parsed.savedAt = Date.now();
    localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn('Gagal memperbarui progress kuis di localStorage:', err);
  }
}

/**
 * Ambil sesi kuis yang sedang berjalan jika ada dan valid
 */
export function getActiveQuiz(): StoredActiveQuiz | null {
  try {
    const raw = localStorage.getItem(ACTIVE_QUIZ_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredActiveQuiz;

    // Validasi masa berlaku (12 jam)
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_SESSION_AGE_MS) {
      clearActiveQuiz();
      return null;
    }

    // Validasi kelengkapan struktur data kuis
    if (
      !parsed.namaPeserta ||
      !parsed.config ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      clearActiveQuiz();
      return null;
    }

    if (!Array.isArray(parsed.answers)) {
      parsed.answers = [];
    }

    return parsed;
  } catch {
    clearActiveQuiz();
    return null;
  }
}

/**
 * Hapus sesi kuis aktif
 */
export function clearActiveQuiz(): void {
  try {
    localStorage.removeItem(ACTIVE_QUIZ_KEY);
  } catch {
    // Ignore error
  }
}

/**
 * Simpan hasil akhir kuis (Result Screen)
 */
export function saveResultSession(gameResult: GameResult, config: QuizConfig): void {
  try {
    const payload: StoredResultSession = {
      gameResult,
      config,
      savedAt: Date.now()
    };
    localStorage.setItem(RESULT_SESSION_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Gagal menyimpan sesi hasil kuis ke localStorage:', err);
  }
}

/**
 * Ambil sesi hasil akhir kuis jika ada dan valid
 */
export function getResultSession(): StoredResultSession | null {
  try {
    const raw = localStorage.getItem(RESULT_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredResultSession;

    // Validasi masa berlaku (12 jam)
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_SESSION_AGE_MS) {
      clearResultSession();
      return null;
    }

    // Validasi kelengkapan struktur result
    if (
      !parsed.gameResult ||
      !parsed.config ||
      typeof parsed.gameResult.skor !== 'number' ||
      !Array.isArray(parsed.gameResult.answers)
    ) {
      clearResultSession();
      return null;
    }

    return parsed;
  } catch {
    clearResultSession();
    return null;
  }
}

/**
 * Hapus sesi hasil akhir kuis
 */
export function clearResultSession(): void {
  try {
    localStorage.removeItem(RESULT_SESSION_KEY);
  } catch {
    // Ignore error
  }
}

/**
 * Hapus semua sesi kuis (reset total)
 */
export function clearAllSessions(): void {
  clearActiveQuiz();
  clearResultSession();
}

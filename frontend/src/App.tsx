import React, { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './components/game/WelcomeScreen';
import { FlashcardGame } from './components/game/FlashcardGame';
import { ResultScreen } from './components/game/ResultScreen';
import { LeaderboardModal } from './components/game/LeaderboardModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Question, QuizConfig, GameResult } from './types';
import { bgm } from './lib/bgm';
import {
  getActiveQuiz,
  saveActiveQuiz,
  clearActiveQuiz,
  getResultSession,
  saveResultSession,
  clearResultSession,
  StoredAnswer
} from './lib/session';

interface RestoredState {
  screen: 'playing' | 'result';
  namaPeserta: string;
  config: QuizConfig;
  questions: Question[];
  gameResult: GameResult | null;
  initialIdx: number;
  initialAnswers: StoredAnswer[];
  initialStartTime: number;
}

export function App() {
  // Pulihkan sesi jika pengguna me-refresh halaman saat kuis berlangsung atau di layar hasil
  const [initialSessionState] = useState<RestoredState | null>(() => {
    const active = getActiveQuiz();
    if (active) {
      // Jika semua soal sudah dijawab (misal reload saat jeda transisi soal terakhir)
      if (active.answers.length >= active.questions.length && active.questions.length > 0) {
        const benarCount = active.answers.filter((a) => a.isCorrect).length;
        const totalQuestions = active.questions.length;
        const skorTotal = Math.round((benarCount / totalQuestions) * 100);
        const isLolosCap = benarCount >= active.config.minBenarCap;
        const totalWaktu = (Date.now() - active.startTime) / 1000;
        const result: GameResult = {
          namaPeserta: active.namaPeserta,
          skor: skorTotal,
          totalSoal: totalQuestions,
          waktuDetik: Math.round(totalWaktu * 10) / 10,
          isLolosCap,
          answers: active.answers
        };
        saveResultSession(result, active.config);
        clearActiveQuiz();
        return {
          screen: 'result',
          namaPeserta: active.namaPeserta,
          config: active.config,
          questions: active.questions,
          gameResult: result,
          initialIdx: 0,
          initialAnswers: active.answers,
          initialStartTime: active.startTime
        };
      }

      // Tentukan indeks lanjut: jika soal currentIdx sudah dijawab, lanjut ke nomor berikutnya
      const resumeIdx =
        active.answers.length > active.currentIdx
          ? active.answers.length
          : active.currentIdx;

      return {
        screen: 'playing',
        namaPeserta: active.namaPeserta,
        config: active.config,
        questions: active.questions,
        gameResult: null,
        initialIdx: resumeIdx,
        initialAnswers: active.answers,
        initialStartTime: active.startTime
      };
    }

    // Jika tidak ada kuis aktif, cek apakah sedang berada di layar hasil kuis sebelumnya
    const resSession = getResultSession();
    if (resSession) {
      return {
        screen: 'result',
        namaPeserta: resSession.gameResult.namaPeserta,
        config: resSession.config,
        questions: [],
        gameResult: resSession.gameResult,
        initialIdx: 0,
        initialAnswers: [],
        initialStartTime: 0
      };
    }

    return null;
  });

  const [screen, setScreen] = useState<'welcome' | 'playing' | 'result'>(
    initialSessionState ? initialSessionState.screen : 'welcome'
  );
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [namaPeserta, setNamaPeserta] = useState(
    initialSessionState ? initialSessionState.namaPeserta : ''
  );
  const [config, setConfig] = useState<QuizConfig | null>(
    initialSessionState ? initialSessionState.config : null
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialSessionState ? initialSessionState.questions : []
  );
  const [gameResult, setGameResult] = useState<GameResult | null>(
    initialSessionState ? initialSessionState.gameResult : null
  );
  const [resumeState, setResumeState] = useState<{
    initialIdx: number;
    initialAnswers: StoredAnswer[];
    initialStartTime: number;
  } | null>(
    initialSessionState && initialSessionState.screen === 'playing'
      ? {
          initialIdx: initialSessionState.initialIdx,
          initialAnswers: initialSessionState.initialAnswers,
          initialStartTime: initialSessionState.initialStartTime
        }
      : null
  );

  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Ambil konfigurasi game awal dari backend
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        const s = data.data;
        const loaded: QuizConfig = {
          totalSoal: parseInt(s.soalPerSesi) || 5,
          timerDetik: parseInt(s.timerDetik) || 10,
          minBenarCap: parseInt(s.minBenarCap) || 4,
          animasiStyle: s.animasiStyle || 'combo',
          misiCapText: s.misiCapText || 'Follow IG @himati_official & Sapa 1 kakak pengurus di stand!',
          fotoFokus: s.fotoFokus || 'tengah_atas',
          spillJawaban: (s.spillJawaban as 'akhir' | 'langsung') || 'akhir'
        };
        setConfig((prev) => (screen === 'welcome' || !prev ? loaded : prev));
      }
    } catch (err) {
      console.error('Gagal mengambil pengaturan:', err);
    }
  }, [screen]);

  useEffect(() => {
    loadConfig();
    if (bgm.isMusicEnabled()) {
      bgm.start();
    }
  }, [loadConfig]);

  // Mulai sesi kuis baru
  const handleStartGame = async (name: string) => {
    setNamaPeserta(name);
    setIsLoadingSession(true);
    setSessionError('');

    try {
      const res = await fetch('/api/quiz-session');
      const data = await res.json();

      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        const resolvedConfig = data.config || config;
        if (data.config) {
          setConfig(data.config);
        }

        const startTime = Date.now();
        setResumeState({
          initialIdx: 0,
          initialAnswers: [],
          initialStartTime: startTime
        });

        // Simpan sesi aktif ke localStorage agar tahan refresh
        if (resolvedConfig) {
          saveActiveQuiz({
            namaPeserta: name,
            config: resolvedConfig,
            questions: data.questions,
            currentIdx: 0,
            answers: [],
            startTime
          });
        }

        // Hapus sesi result sebelumnya
        clearResultSession();

        setScreen('playing');
      } else {
        setSessionError(data.message || 'Gagal memuat soal kuis.');
      }
    } catch {
      setSessionError('Koneksi ke backend server gagal.');
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Sesi permainan selesai
  const handleFinishGame = async (result: GameResult) => {
    setGameResult(result);
    setScreen('result');

    // Hapus sesi kuis aktif dan simpan sesi result agar tahan refresh
    clearActiveQuiz();
    if (config) {
      saveResultSession(result, config);
    }

    // Catat ke database SQLite leaderboard
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_peserta: result.namaPeserta,
          skor: result.skor,
          total_soal: result.totalSoal,
          waktu_detik: result.waktuDetik,
          status_cap: result.isLolosCap ? 'lolos' : 'misi'
        })
      });
    } catch (err) {
      console.error('Gagal menyimpan nilai ke leaderboard:', err);
    }
  };

  // Mulai main lagi dari layar hasil
  const handlePlayAgain = () => {
    clearResultSession();
    clearActiveQuiz();
    setGameResult(null);
    setResumeState(null);
    setScreen('welcome');
  };

  // Batalkan kuis dari layar bermain
  const handleCancelGame = () => {
    clearActiveQuiz();
    setResumeState(null);
    setScreen('welcome');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-[#f8fafc] flex flex-col justify-between selection:bg-[#2563eb] selection:text-white relative overflow-x-hidden">
      {/* Main Game Screens */}
      <main className="relative z-10 flex-1 flex flex-col justify-center w-full items-center">
        {isLoadingSession && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#2563eb] border-t-transparent animate-spin mb-4" />
            <p className="font-mono text-[#94a3b8] text-xs tracking-wider uppercase">
              MENYIAPKAN FLASHCARD STAND PENGURUS...
            </p>
          </div>
        )}

        {sessionError && screen === 'welcome' && (
          <div className="max-w-md mx-auto my-4 p-3 bg-[#0d1424] border-2 border-[#f43f5e] text-[#f43f5e] text-xs font-mono text-center shadow-tactile">
            {sessionError}
          </div>
        )}

        {!isLoadingSession && screen === 'welcome' && (
          <WelcomeScreen
            config={config}
            onStart={handleStartGame}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenAdmin={() => setShowAdmin(true)}
          />
        )}

        {!isLoadingSession && screen === 'playing' && config && questions.length > 0 && (
          <FlashcardGame
            questions={questions}
            config={config}
            namaPeserta={namaPeserta}
            initialIdx={resumeState?.initialIdx ?? 0}
            initialAnswers={resumeState?.initialAnswers ?? []}
            initialStartTime={resumeState?.initialStartTime}
            onFinishGame={handleFinishGame}
            onCancel={handleCancelGame}
          />
        )}

        {!isLoadingSession && screen === 'result' && gameResult && config && (
          <ResultScreen
            result={gameResult}
            config={config}
            onPlayAgain={handlePlayAgain}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
      </main>

      {/* Modals */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showAdmin && (
        <AdminDashboard
          onClose={() => setShowAdmin(false)}
          onRefreshGameConfig={loadConfig}
        />
      )}
    </div>
  );
}

export default App;

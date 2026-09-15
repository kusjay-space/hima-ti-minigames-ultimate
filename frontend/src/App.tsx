import React, { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './components/game/WelcomeScreen';
import { FlashcardGame } from './components/game/FlashcardGame';
import { ResultScreen } from './components/game/ResultScreen';
import { LeaderboardModal } from './components/game/LeaderboardModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Question, QuizConfig, GameResult } from './types';
import { bgm } from './lib/bgm';
import { themeManager, type ThemeMode, type LightPalettePreset } from './lib/theme';

export function App() {
  const [screen, setScreen] = useState<'welcome' | 'playing' | 'result'>('welcome');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [, setThemeState] = useState({
    mode: themeManager.getMode(),
    preset: themeManager.getPreset()
  });

  const [namaPeserta, setNamaPeserta] = useState('');
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Ambil konfigurasi game awal
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        const s = data.data;
        if (s.themeMode) {
          themeManager.setMode(s.themeMode as ThemeMode);
        }
        if (s.themePreset) {
          themeManager.setPreset(s.themePreset as LightPalettePreset);
        }
        setConfig({
          totalSoal: parseInt(s.soalPerSesi) || 5,
          timerDetik: parseInt(s.timerDetik) || 10,
          minBenarCap: parseInt(s.minBenarCap) || 4,
          animasiStyle: s.animasiStyle || 'combo',
          misiCapText: s.misiCapText || 'Follow IG @himati_official & Sapa 1 kakak pengurus di stand!',
          fotoFokus: s.fotoFokus || 'tengah_atas',
          themeMode: (s.themeMode as ThemeMode) || themeManager.getMode(),
          themePreset: (s.themePreset as LightPalettePreset) || themeManager.getPreset()
        });
      }
    } catch (err) {
      console.error('Gagal mengambil pengaturan:', err);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    if (bgm.isMusicEnabled()) {
      bgm.start();
    }
    const unsub = themeManager.subscribe((mode, preset) => {
      setThemeState({ mode, preset });
      setConfig(prev => prev ? { ...prev, themeMode: mode, themePreset: preset } : null);
    });
    return () => unsub();
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
        if (data.config) {
          setConfig(data.config);
        }
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

  return (
    <div className="min-h-screen bg-canvas text-default flex flex-col justify-between selection:bg-primary selection:text-white relative overflow-x-hidden transition-colors duration-200">
      {/* Main Game Screens */}
      <main className="relative z-10 flex-1 flex flex-col justify-center w-full items-center">
        {isLoadingSession && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin mb-4" />
            <p className="font-mono text-muted text-xs tracking-wider uppercase">MENYIAPKAN FLASHCARD STAND PENGURUS...</p>
          </div>
        )}

        {sessionError && screen === 'welcome' && (
          <div className="max-w-md mx-auto my-4 p-3 bg-default border-2 border-error text-error text-xs font-mono text-center shadow-tactile">
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
            onFinishGame={handleFinishGame}
            onCancel={() => setScreen('welcome')}
          />
        )}

        {!isLoadingSession && screen === 'result' && gameResult && config && (
          <ResultScreen
            result={gameResult}
            config={config}
            onPlayAgain={() => setScreen('welcome')}
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

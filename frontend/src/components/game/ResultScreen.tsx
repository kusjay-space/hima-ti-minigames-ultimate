import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X, RotateCcw, Trophy, Shield, Camera, MessageSquare, Music, Volume2, VolumeX, Disc } from 'lucide-react';
import type { GameResult, QuizConfig } from '../../types';
import { soundFx } from '../../lib/sound';
import { bgm } from '../../lib/bgm';

interface ResultScreenProps {
  result: GameResult;
  config: QuizConfig;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  config,
  onPlayAgain,
  onOpenLeaderboard
}) => {
  const benarCount = result.answers.filter((a) => a.isCorrect).length;
  const salahCount = result.totalSoal - benarCount;
  const isLolos = result.isLolosCap;

  useEffect(() => {
    if (isLolos) {
      soundFx.playWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#014097', '#16a34a', '#f59e0b', '#ffffff']
      });

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 50,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 50,
          origin: { x: 1 }
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isLolos]);

  const [isMuted, setIsMuted] = React.useState(soundFx.isMuted());
  const [isMusicEnabled, setIsMusicEnabled] = React.useState(bgm.isMusicEnabled());
  const [trackInfo, setTrackInfo] = React.useState(bgm.getCurrentTrackInfo());

  React.useEffect(() => {
    return bgm.subscribe((enabled) => {
      setIsMusicEnabled(enabled);
      setTrackInfo(bgm.getCurrentTrackInfo());
    });
  }, []);

  const handleToggleMusic = () => {
    const enabled = bgm.toggle();
    setIsMusicEnabled(enabled);
  };

  const handleCycleTrack = () => {
    bgm.cycleNextTrack();
    setTrackInfo(bgm.getCurrentTrackInfo());
  };

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full min-h-[100dvh] md:h-[100dvh] md:max-h-[100dvh] flex flex-col justify-between max-w-6xl mx-auto p-2.5 sm:p-4 md:p-6 overflow-y-auto md:overflow-hidden select-none bg-canvas text-default transition-colors">
      {/* Top Header Tag */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 pb-2 sm:pb-2.5 border-b-2 border-default shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className={`w-2 h-2 shrink-0 ${isLolos ? 'bg-success' : 'bg-warning'}`} />
          <span className="text-[10px] sm:text-xs font-mono uppercase text-subtle font-bold tracking-wider sm:tracking-widest truncate">
            HASIL FLASHCARD // STAND GMTI HIMA TI 2026
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="text-[10px] sm:text-xs font-mono text-default font-bold bg-default px-1.5 sm:px-3 py-0.5 sm:py-1 border border-default truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none shadow-sm">
            PESERTA: {result.namaPeserta}
          </div>

          {/* BGM Track Cycle Button */}
          <button
            type="button"
            onClick={handleCycleTrack}
            className="p-1 sm:p-1.5 bg-default border border-default hover:border-primary hover:bg-subtle text-muted hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title={`Ganti Tema Musik (${trackInfo.name})`}
          >
            <Disc className={`w-3.5 h-3.5 text-primary ${isMusicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-primary hidden sm:inline">
              {trackInfo.tag}
            </span>
          </button>

          {/* BGM Toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`p-1 sm:p-1.5 border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm ${
              isMusicEnabled
                ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                : 'bg-default border-default text-muted hover:text-default'
            }`}
            title={isMusicEnabled ? 'Musik BGM: ON' : 'Musik BGM: OFF'}
          >
            <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMusicEnabled ? 'animate-pulse' : ''}`} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              BGM {isMusicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* SFX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-1 sm:p-1.5 bg-default border border-default hover:border-primary hover:bg-subtle text-muted hover:text-default transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title={isMuted ? 'SFX Bisu' : 'SFX Aktif'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-error" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />}
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              SFX
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 py-3 sm:py-4 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch min-h-0 md:min-h-[500px]">
          {/* Left Column: Big Cap Status Box */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className={`p-5 md:p-6 border-2 text-center shadow-tactile flex flex-col justify-between h-full relative bg-default ${
                isLolos
                  ? 'border-success shadow-tactile-emerald'
                  : 'border-warning shadow-tactile-amber'
              }`}
            >
              <div>
                {/* Stamp Square Mark */}
                <div
                  className={`w-14 h-14 mx-auto flex items-center justify-center mb-3 font-bold border-2 ${
                    isLolos
                      ? 'bg-success text-white border-success'
                      : 'bg-warning text-white border-warning'
                  }`}
                >
                  <Shield className="w-8 h-8 stroke-[2.5]" />
                </div>

                {isLolos ? (
                  <>
                    <span className="inline-block border border-success bg-success/10 px-2.5 py-0.5 text-success font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                      STATUS: MEMENUHI SYARAT CAP RESMI
                    </span>

                    <h2 className="text-xl md:text-2xl font-extrabold text-default tracking-tight leading-tight">
                      SELAMAT! KAMU BERHAK MENDAPATKAN CAP STAND!
                    </h2>

                    <p className="text-xs text-subtle mt-2 max-w-md mx-auto leading-relaxed">
                      Kamu berhasil menjawab <strong>{benarCount} dari {result.totalSoal} soal</strong> dengan benar.
                    </p>

                    <div className="mt-3 p-3 bg-subtle border border-success/40">
                      <p className="text-xs font-bold text-success font-mono text-center">
                        [ Tunjukkan layar ini ke panitia di stand untuk dicap buku GMTI-mu ]
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-block border border-warning bg-warning/10 px-2.5 py-0.5 text-warning font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                      STATUS: JALUR MISI STAND
                    </span>

                    <h2 className="text-lg md:text-xl font-extrabold text-default tracking-tight leading-tight">
                      BELUM CAP OTOMATIS, KLAIM LEWAT MISI STAND!
                    </h2>

                    <p className="text-xs text-subtle mt-1 max-w-md mx-auto">
                      Kamu menjawab benar <strong>{benarCount} dari {result.totalSoal} soal</strong> (salah {salahCount}).
                    </p>

                    <div className="mt-3 p-3 bg-subtle border border-warning/40 text-left">
                      <span className="text-[10px] font-bold text-warning uppercase font-mono block mb-1.5">
                        MISI KLAIM CAP STAND:
                      </span>
                      <ul className="space-y-1.5 text-xs text-subtle">
                        <li className="flex items-start gap-2">
                          <Camera className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />
                          <span>Follow Instagram resmi HIMA TI (@himati_official).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>Sapa dan perkenalkan dirimu ke salah satu kakak pengurus di stand.</span>
                        </li>
                      </ul>
                      <p className="text-[10px] text-muted mt-2 font-mono text-center border-t border-default pt-1">
                        Tunjukkan bukti follow dan sapa panitia untuk mendapatkan Cap Stand.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-default">
                <button
                  type="button"
                  onClick={onPlayAgain}
                  className="py-3 px-3 bg-primary hover:bg-secondary text-white font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-tactile hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>MAIN LAGI (GILIRAN BARU)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="py-3 px-3 bg-default border-2 border-default hover:border-primary text-default font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-tactile-sm hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-warning" />
                  <span>LIHAT PAPAN SKOR</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stats & Zero-Scroll Recap */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-default border border-default p-2 text-center shadow-tactile-sm">
                <p className="text-[9px] font-mono uppercase text-muted">Skor</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-primary">{result.skor}</p>
              </div>
              <div className="bg-default border border-default p-2 text-center shadow-tactile-sm">
                <p className="text-[9px] font-mono uppercase text-muted">Benar</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-success">{benarCount}/{result.totalSoal}</p>
              </div>
              <div className="bg-default border border-default p-2 text-center shadow-tactile-sm">
                <p className="text-[9px] font-mono uppercase text-muted">Waktu</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-warning">{result.waktuDetik}s</p>
              </div>
            </div>

            {/* Answer Review Box */}
            <div className="bg-default border border-default p-3 flex-1 flex flex-col justify-between overflow-hidden shadow-tactile-sm">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-default">
                <h4 className="text-[10px] font-mono uppercase text-muted font-bold">
                  REKAP KARTU PENGURUS:
                </h4>
                <span className="text-[9px] font-mono text-muted">{result.totalSoal} KARTU</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[360px] pr-1">
                {result.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 bg-subtle border border-default text-xs rounded-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={ans.question.foto_url}
                        alt="Thumb"
                        className="w-7 h-9 object-cover object-[center_18%] bg-default shrink-0 border border-default"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-default text-[11px] truncate leading-tight">{ans.question.correctNama}</p>
                        <p className="text-[10px] text-muted font-mono truncate">{ans.question.correctDivisi}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2 font-mono">
                      {ans.isCorrect ? (
                        <span className="text-success flex items-center gap-1 font-semibold text-[10px] border border-success/30 bg-success/10 px-1.5 py-0.5 rounded-sm">
                          <Check className="w-3 h-3 stroke-[3]" /> BENAR
                        </span>
                      ) : (
                        <span className="text-error flex items-center gap-1 font-semibold text-[10px] border border-error/30 bg-error/10 px-1.5 py-0.5 rounded-sm">
                          <X className="w-3 h-3 stroke-[3]" /> SALAH
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="pt-2 border-t-2 border-default text-center text-[10px] font-mono text-muted shrink-0">
        HIMA TI // GEMA MAHASISWA TEKNOLOGI INFORMASI 2026
      </footer>
    </div>
  );
};

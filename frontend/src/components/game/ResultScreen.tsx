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
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ffffff']
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
    <div className="w-full min-h-[100dvh] md:h-[100dvh] md:max-h-[100dvh] flex flex-col justify-between max-w-6xl mx-auto p-2.5 sm:p-4 md:p-6 overflow-y-auto md:overflow-hidden select-none">
      {/* Top Header Tag */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 pb-2 sm:pb-2.5 border-b-2 border-[#1c2b46] shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className={`w-2 h-2 shrink-0 ${isLolos ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#cbd5e1] font-bold tracking-wider sm:tracking-widest truncate">
            HASIL FLASHCARD // STAND GMTI HIMA TI 2026
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className="text-[10px] sm:text-xs font-mono text-[#f8fafc] font-bold bg-[#0d1424] px-1.5 sm:px-3 py-0.5 sm:py-1 border border-[#1e2b46] truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none">
            PESERTA: {result.namaPeserta}
          </div>

          {/* BGM Track Cycle Button - Icon Only on Mobile */}
          <button
            type="button"
            onClick={handleCycleTrack}
            className="p-1 sm:p-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title={`Ganti Tema Musik (Saat ini: ${trackInfo.name}) - Klik untuk ganti musik`}
          >
            <Disc className={`w-3.5 h-3.5 text-[#38bdf8] ${isMusicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#38bdf8] hidden sm:inline">
              {trackInfo.tag}
            </span>
          </button>

          {/* Dedicated Quizizz-style BGM Toggle - Icon Only on Mobile */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`p-1 sm:p-1.5 border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              isMusicEnabled
                ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8] hover:bg-[#112544] hover:shadow-tactile-sm'
                : 'bg-[#0d1424] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8] hover:border-[#273b5e]'
            }`}
            title={isMusicEnabled ? 'Musik Latar (BGM): Aktif - Klik untuk Matikan' : 'Musik Latar (BGM): Nonaktif - Klik untuk Nyalakan'}
          >
            <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMusicEnabled ? 'animate-pulse' : ''}`} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              BGM {isMusicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Dedicated Sound Effects (SFX) Toggle - Icon Only on Mobile */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-1 sm:p-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-y-[-1px] text-[#94a3b8] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
            title={isMuted ? 'Efek Suara (SFX): Bisu - Klik untuk Nyalakan' : 'Efek Suara (SFX): Aktif - Klik untuk Bisukan'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f43f5e]" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10b981]" />}
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              SFX
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area: 2-Column Desktop Viewport */}
      <main className="flex-1 min-h-0 py-3 sm:py-4 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch min-h-0 md:min-h-[500px]">
          {/* Left Column: Big Cap Status Box (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className={`p-5 md:p-6 border-2 text-center shadow-tactile flex flex-col justify-between h-full relative ${
                isLolos
                  ? 'bg-[#0d1424] border-[#10b981] shadow-tactile-emerald'
                  : 'bg-[#0d1424] border-[#f59e0b] shadow-tactile-amber'
              }`}
            >
              {/* Corner Crosshairs */}
              <div className="absolute top-1 left-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

              <div>
                {/* Stamp Square Mark */}
                <div
                  className={`w-14 h-14 mx-auto flex items-center justify-center mb-3 font-bold border-2 ${
                    isLolos
                      ? 'bg-[#10b981] text-[#080c14] border-[#34d399]'
                      : 'bg-[#f59e0b] text-[#080c14] border-[#fbbf24]'
                  }`}
                >
                  <Shield className="w-8 h-8 stroke-[2.5]" />
                </div>

                {isLolos ? (
                  <>
                    <span className="inline-block border border-[#10b981] bg-[#052e16] px-2.5 py-0.5 text-[#10b981] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                      STATUS: MEMENUHI SYARAT CAP RESMI
                    </span>

                    <h2 className="text-xl md:text-2xl font-extrabold text-[#f8fafc] tracking-tight leading-tight">
                      SELAMAT! KAMU BERHAK MENDAPATKAN CAP STAND!
                    </h2>

                    <p className="text-xs text-[#94a3b8] mt-2 max-w-md mx-auto leading-relaxed">
                      Kamu berhasil menjawab <strong>{benarCount} dari {result.totalSoal} soal</strong> dengan benar.
                    </p>

                    <div className="mt-3 p-3 bg-[#080c14] border border-[#10b981]/50">
                      <p className="text-xs font-bold text-[#10b981] font-mono text-center">
                        [ Tunjukkan layar ini ke panitia di stand untuk dicap buku GMTI-mu ]
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-block border border-[#f59e0b] bg-[#451a03] px-2.5 py-0.5 text-[#f59e0b] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                      STATUS: JALUR MISI STAND
                    </span>

                    <h2 className="text-lg md:text-xl font-extrabold text-[#f8fafc] tracking-tight leading-tight">
                      BELUM CAP OTOMATIS, KLAIM LEWAT MISI STAND!
                    </h2>

                    <p className="text-xs text-[#94a3b8] mt-1 max-w-md mx-auto">
                      Kamu menjawab benar <strong>{benarCount} dari {result.totalSoal} soal</strong> (salah {salahCount}).
                    </p>

                    <div className="mt-3 p-3 bg-[#080c14] border border-[#f59e0b]/50 text-left">
                      <span className="text-[10px] font-bold text-[#f59e0b] uppercase font-mono block mb-1.5">
                        MISI KLAIM CAP STAND:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#cbd5e1]">
                        <li className="flex items-start gap-2">
                          <Camera className="w-3.5 h-3.5 text-[#f43f5e] shrink-0 mt-0.5" />
                          <span>Follow Instagram resmi HIMA TI (@himati_official).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                          <span>Sapa dan perkenalkan dirimu ke salah satu kakak pengurus di stand.</span>
                        </li>
                      </ul>
                      <p className="text-[10px] text-[#64748b] mt-2 font-mono text-center border-t border-[#1e2b46] pt-1">
                        Tunjukkan bukti follow dan sapa panitia untuk mendapatkan Cap Stand.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-[#1e2b46]">
                <button
                  type="button"
                  onClick={onPlayAgain}
                  className="py-3 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-tactile hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>MAIN LAGI (GILIRAN BARU)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="py-3 px-3 bg-[#0d1424] border-2 border-[#1e2b46] hover:border-[#38bdf8] text-[#cbd5e1] font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-tactile-sm hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-[#f59e0b]" />
                  <span>LIHAT PAPAN SKOR</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stats & Zero-Scroll Recap (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-[#0d1424] border border-[#1e2b46] p-2 text-center shadow-tactile-sm">
                <p className="text-[9px] font-mono uppercase text-[#64748b]">Skor</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-[#38bdf8]">{result.skor}</p>
              </div>
              <div className="bg-[#0d1424] border border-[#1e2b46] p-2 text-center shadow-tactile-sm">
                <p className="text-[9px] font-mono uppercase text-[#64748b]">Benar</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-[#10b981]">{benarCount}/{result.totalSoal}</p>
              </div>
              <div className="bg-[#0d1424] border border-[#1e2b46] p-2 text-center shadow-tactile-sm">
                <p className="text-[9px] font-mono uppercase text-[#64748b]">Waktu</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-[#f59e0b]">{result.waktuDetik}s</p>
              </div>
            </div>

            {/* Answer Review Box */}
            <div className="bg-[#0d1424] border border-[#1e2b46] p-3 flex-1 flex flex-col justify-between overflow-hidden shadow-tactile-sm">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1e2b46]">
                <h4 className="text-[10px] font-mono uppercase text-[#94a3b8] font-bold">
                  REKAP KARTU PENGURUS:
                </h4>
                <span className="text-[9px] font-mono text-[#64748b]">{result.totalSoal} KARTU</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[360px] pr-1">
                {result.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 bg-[#080c14] border border-[#1e2b46] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={ans.question.foto_url}
                        alt="Thumb"
                        className="w-7 h-9 object-cover object-[center_18%] bg-[#0d1424] shrink-0 border border-[#1e2b46]"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#f8fafc] text-[11px] truncate leading-tight">{ans.question.correctNama}</p>
                        <p className="text-[10px] text-[#94a3b8] font-mono truncate">{ans.question.correctDivisi}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2 font-mono">
                      {ans.isCorrect ? (
                        <span className="text-[#10b981] flex items-center gap-1 font-semibold text-[10px] border border-[#10b981]/40 bg-[#052e16] px-1.5 py-0.5">
                          <Check className="w-3 h-3 stroke-[3]" /> BENAR
                        </span>
                      ) : (
                        <span className="text-[#f43f5e] flex items-center gap-1 font-semibold text-[10px] border border-[#f43f5e]/40 bg-[#4c0519] px-1.5 py-0.5">
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
      <footer className="pt-2 border-t-2 border-[#1c2b46] text-center text-[10px] font-mono text-[#64748b] shrink-0">
        HIMA TI // GEMA MAHASISWA TEKNOLOGI INFORMASI 2026
      </footer>
    </div>
  );
};

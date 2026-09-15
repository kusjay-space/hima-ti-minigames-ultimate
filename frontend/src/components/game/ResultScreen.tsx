import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X, RotateCcw, Trophy, Shield, Camera, MessageSquare, Music, Volume2, VolumeX, Disc, Eye, Sparkles, ChevronLeft, ChevronRight, RotateCw, Sliders } from 'lucide-react';
import type { GameResult, QuizConfig } from '../../types';
import { soundFx } from '../../lib/sound';
import { bgm } from '../../lib/bgm';
import { FlashcardCard } from './FlashcardCard';
import { AudioMixerModal } from './AudioMixerModal';

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
  const [inspectingIndex, setInspectingIndex] = useState<number | null>(null);
  const [inspectFlipped, setInspectFlipped] = useState<boolean>(true);
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
  const [showAudioMixer, setShowAudioMixer] = React.useState(false);

  React.useEffect(() => {
    setIsMuted(soundFx.isMuted());
    const unsubSfx = soundFx.subscribe((muted) => {
      setIsMuted(muted);
    });
    const unsubBgm = bgm.subscribe((enabled) => {
      setIsMusicEnabled(enabled);
      setTrackInfo(bgm.getCurrentTrackInfo());
    });
    return () => {
      unsubSfx();
      unsubBgm();
    };
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

  // Keyboard navigation for card review carousel
  useEffect(() => {
    if (inspectingIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectingIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setInspectingIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : result.answers.length - 1));
        setInspectFlipped(true);
      } else if (e.key === 'ArrowRight') {
        setInspectingIndex((prev) => (prev !== null && prev < result.answers.length - 1 ? prev + 1 : 0));
        setInspectFlipped(true);
      } else if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setInspectFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingIndex, result.answers.length]);

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
              SFX {isMuted ? 'OFF' : 'ON'}
            </span>
          </button>

          {/* Dedicated Audio Volume Mixer Button */}
          <button
            type="button"
            onClick={() => setShowAudioMixer(true)}
            className="p-1 sm:p-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-y-[-1px] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title="Buka Mixer Volume Audio (Atur Besar/Kecil Suara BGM & SFX)"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8]" />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              VOL
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
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <h4 className="text-[10px] font-mono uppercase text-[#f8fafc] font-bold tracking-wider">
                    {config.spillJawaban === 'akhir' ? 'PENGUNGKAPAN JAWABAN (REVEAL):' : 'REKAP KARTU PENGURUS:'}
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-[#38bdf8] bg-[#080c14] px-1.5 py-0.5 border border-[#1e2b46]">
                  {result.totalSoal} KARTU
                </span>
              </div>

              {config.spillJawaban === 'akhir' && (
                <div className="mb-2 px-2.5 py-1.5 bg-[#0c1e3d]/80 border border-[#38bdf8]/40 text-[9.5px] font-mono text-[#38bdf8] flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                    ★ ELEMENT OF SURPRISE DIUNGKAP ★
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingIndex(0);
                      setInspectFlipped(true);
                    }}
                    className="px-2 py-0.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[9px] border border-[#38bdf8] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-tactile-sm"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    BUKA KARTU 3D
                  </button>
                </div>
              )}

              <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[340px] pr-1">
                {result.answers.map((ans, idx) => {
                  const selectedOpt = ans.question.options.find(o => o.key === ans.selectedKey);
                  const correctOpt = ans.question.options.find(o => o.isCorrect);
                  const isTimeout = ans.selectedKey === 'TIMEOUT';

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      onClick={() => {
                        setInspectingIndex(idx);
                        setInspectFlipped(true);
                      }}
                      className="p-2 bg-[#080c14] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] transition-all cursor-pointer text-xs space-y-1 group relative overflow-hidden"
                      title="Klik untuk membuka ID Card 3D resmi pengurus ini"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 flex items-center justify-center font-mono font-bold text-[10px] bg-[#162238] text-[#38bdf8] shrink-0 border border-[#273b5e]">
                            #{idx + 1}
                          </span>
                          <img
                            src={ans.question.foto_url}
                            alt="Thumb"
                            className="w-7 h-9 object-cover object-[center_18%] bg-[#0d1424] shrink-0 border border-[#1e2b46] group-hover:border-[#38bdf8]"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#f8fafc] text-[11px] truncate leading-tight group-hover:text-[#38bdf8]">
                              {ans.question.correctNama}
                            </p>
                            <p className="text-[10px] text-[#94a3b8] font-mono truncate">{ans.question.correctDivisi}</p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2 font-mono flex items-center gap-1">
                          {ans.isCorrect ? (
                            <span className="text-[#10b981] flex items-center gap-1 font-semibold text-[10px] border border-[#10b981]/40 bg-[#052e16] px-1.5 py-0.5">
                              <Check className="w-3 h-3 stroke-[3]" /> BENAR
                            </span>
                          ) : (
                            <span className="text-[#f43f5e] flex items-center gap-1 font-semibold text-[10px] border border-[#f43f5e]/40 bg-[#4c0519] px-1.5 py-0.5">
                              <X className="w-3 h-3 stroke-[3]" /> SALAH
                            </span>
                          )}
                          <span className="text-[#64748b] group-hover:text-[#38bdf8] ml-1">
                            <Eye className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Detail Pilihan Peserta vs Kunci Jawaban Resmi */}
                      <div className="pl-7 pt-1 border-t border-[#162238] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono gap-0.5">
                        <span className={`truncate max-w-[200px] ${ans.isCorrect ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                          Pilihan: {isTimeout ? '[WAKTU HABIS]' : `[${ans.selectedKey}] ${selectedOpt?.text || ''}`}
                        </span>
                        {!ans.isCorrect && correctOpt && (
                          <span className="text-[#38bdf8] font-bold truncate max-w-[200px]">
                            Kunci: [{correctOpt.key}] {correctOpt.text}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="pt-2 border-t-2 border-[#1c2b46] text-center text-[10px] font-mono text-[#64748b] shrink-0">
        HIMA TI // GEMA MAHASISWA TEKNOLOGI INFORMASI 2026
      </footer>

      {/* Modal Detail Kartu Pengurus yang Diinspeksi (3D Interactive Carousel) */}
      <AnimatePresence>
        {inspectingIndex !== null && result.answers[inspectingIndex] && (() => {
          const currentAns = result.answers[inspectingIndex];
          const selectedOpt = currentAns.question.options.find(o => o.key === currentAns.selectedKey);
          const correctOpt = currentAns.question.options.find(o => o.isCorrect);
          const isTimeout = currentAns.selectedKey === 'TIMEOUT';

          const handlePrev = () => {
            setInspectingIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : result.answers.length - 1));
            setInspectFlipped(true);
          };

          const handleNext = () => {
            setInspectingIndex((prev) => (prev !== null && prev < result.answers.length - 1 ? prev + 1 : 0));
            setInspectFlipped(true);
          };

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
              onClick={() => setInspectingIndex(null)}
            >
              <motion.div 
                initial={{ scale: 0.94, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, y: 15, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                className="relative w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-[#080c14] border-2 border-[#1e2b46] shadow-tactile p-3 sm:p-4 md:p-5 my-auto max-h-[96dvh] md:max-h-[640px] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Top Header Bar */}
                <div className="flex items-center justify-between w-full pb-2.5 mb-2.5 border-b border-[#1e2b46] shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] shrink-0" />
                    <span className="text-xs sm:text-sm font-mono text-[#38bdf8] font-bold uppercase tracking-wider truncate">
                      INSPEKSI IDENTITAS PENGURUS // KARTU #{inspectingIndex + 1} DARI {result.totalSoal}
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono font-bold bg-[#0d1424] border border-[#1e2b46] text-[#94a3b8]">
                      STAND GMTI 2026
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-mono text-[#64748b] hidden md:inline">
                      [ESC] KELUAR
                    </span>
                    <button
                      type="button"
                      onClick={() => setInspectingIndex(null)}
                      className="px-2.5 py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#f43f5e] hover:text-[#f43f5e] text-[#94a3b8] text-xs font-mono font-bold transition-all cursor-pointer shadow-tactile-sm active:translate-y-0.5"
                    >
                      ✕ TUTUP
                    </button>
                  </div>
                </div>

                {/* Main Body Area: 2 Columns on Desktop (md:grid), Stacked on Mobile */}
                <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-4 md:gap-6 items-center md:items-stretch overflow-y-auto md:overflow-hidden py-0.5">
                  {/* Left Column: 3D Flashcard Showcase + Flip Button */}
                  <div className="w-full md:col-span-5 flex flex-col items-center justify-center shrink-0">
                    <div className="w-full flex items-center justify-center">
                      <FlashcardCard
                        key={`inspect-${inspectingIndex}`}
                        question={currentAns.question}
                        animasiStyle={config.animasiStyle}
                        fotoFokus={config.fotoFokus}
                        isAnswered={true}
                        isCorrect={currentAns.isCorrect}
                        totalQuestions={result.totalSoal}
                        currentNumber={currentAns.question.nomor}
                        interactivePreview={true}
                        isFlippedControlled={inspectFlipped}
                        onCardFlipped={(f) => setInspectFlipped(f)}
                        spillJawaban="langsung"
                        inspectMode={true}
                      />
                    </div>

                    {/* Dedicated 3D Flip Action Button */}
                    <div className="w-full max-w-[240px] xs:max-w-[255px] sm:max-w-[270px] md:max-w-[285px] mt-2 flex flex-col items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setInspectFlipped(prev => !prev)}
                        className="w-full py-1.5 px-3 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] text-[#38bdf8] hover:text-[#f8fafc] text-[11px] font-mono font-bold flex items-center justify-center gap-2 shadow-tactile-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>{inspectFlipped ? 'LIHAT SISI DEPAN (FOTO PENGURUS)' : 'LIHAT SISI BELAKANG (ID & JAWABAN)'}</span>
                      </button>
                      <span className="text-[9px] font-mono text-[#64748b] text-center">
                        Klik kartu / tekan Spasi untuk membalik 3D
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Carousel Navigator + Answer Evaluation + Profile */}
                  <div className="w-full md:col-span-7 flex flex-col justify-between space-y-2.5 sm:space-y-3 min-w-0">
                    {/* Carousel Navigator Strip (Pills & Prev/Next) */}
                    <div className="flex items-center justify-between w-full p-1.5 bg-[#0d1424] border border-[#1e2b46] shadow-tactile-sm shrink-0">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="px-2 sm:px-3 py-1 bg-[#080c14] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-[#38bdf8] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-tactile-sm"
                        title="Kartu Sebelumnya (Panah Kiri)"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PREV</span>
                      </button>

                      {/* 5 Card Pills */}
                      <div className="flex items-center gap-1.5">
                        {result.answers.map((ans, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInspectingIndex(idx);
                              setInspectFlipped(true);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 font-mono font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                              inspectingIndex === idx
                                ? ans.isCorrect
                                  ? 'bg-[#10b981] text-[#080c14] border-[#34d399] ring-2 ring-[#10b981]/60 scale-105 shadow-tactile-emerald'
                                  : 'bg-[#f43f5e] text-white border-[#fb7185] ring-2 ring-[#f43f5e]/60 scale-105 shadow-tactile-coral'
                                : ans.isCorrect
                                ? 'bg-[#052e16] text-[#10b981] border-[#10b981]/50 hover:border-[#10b981]'
                                : 'bg-[#4c0519] text-[#f43f5e] border-[#f43f5e]/50 hover:border-[#f43f5e]'
                            }`}
                            title={`Lihat Kartu #${idx + 1} (${ans.isCorrect ? 'Benar' : 'Salah'})`}
                          >
                            #{idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-2 sm:px-3 py-1 bg-[#080c14] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-[#38bdf8] text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-tactile-sm"
                        title="Kartu Selanjutnya (Panah Kanan)"
                      >
                        <span className="hidden sm:inline">NEXT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Detail Evaluasi Jawaban Peserta vs Kunci Resmi */}
                    <div className="w-full bg-[#0d1424] border-2 border-[#1e2b46] p-2.5 sm:p-3.5 space-y-2 font-mono shadow-tactile relative flex-1 flex flex-col justify-between">
                      {/* Tech Corner Accents */}
                      <div className="absolute top-1 left-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
                      <div className="absolute top-1 right-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
                      <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
                      <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

                      {/* Header Status */}
                      <div className="flex items-center justify-between border-b border-[#1e2b46] pb-1.5">
                        <span className="text-[10px] sm:text-[11px] text-[#94a3b8] uppercase tracking-wider font-bold">
                          STATUS JAWABAN KARTU #{inspectingIndex + 1}:
                        </span>
                        {currentAns.isCorrect ? (
                          <span className="text-[11px] sm:text-xs text-[#10b981] font-bold flex items-center gap-1 bg-[#052e16] border border-[#10b981]/60 px-2 py-0.5 shadow-tactile-emerald">
                            <Check className="w-3 h-3 stroke-[3]" /> BENAR (+20 POIN)
                          </span>
                        ) : (
                          <span className="text-[11px] sm:text-xs text-[#f43f5e] font-bold flex items-center gap-1 bg-[#4c0519] border border-[#f43f5e]/60 px-2 py-0.5 shadow-tactile-coral">
                            <X className="w-3 h-3 stroke-[3]" /> SALAH (+0 POIN)
                          </span>
                        )}
                      </div>

                      {/* Soal Prompt */}
                      <div className="bg-[#080c14] border border-[#1e2b46] p-2">
                        <div className="text-[9px] uppercase text-[#38bdf8] font-bold flex items-center gap-1 mb-0.5">
                          <Shield className="w-2.5 h-2.5 text-[#38bdf8]" />
                          {currentAns.question.questionType === 'tebak_nama' ? 'MISI // TEBAK NAMA PENGURUS' : 'MISI // TEBAK AMANAH & DIVISI'}
                        </div>
                        <p className="text-xs sm:text-sm font-sans font-bold text-[#f8fafc] leading-snug">
                          {currentAns.question.questionText}
                        </p>
                      </div>

                      {/* Jawaban Comparison */}
                      <div className="grid grid-cols-1 gap-1.5 text-xs">
                        <div className={`p-1.5 sm:p-2 border flex items-center justify-between ${
                          currentAns.isCorrect
                            ? 'bg-[#052e16]/70 border-[#10b981]/50 text-[#10b981]'
                            : 'bg-[#4c0519]/70 border-[#f43f5e]/50 text-[#f43f5e]'
                        }`}>
                          <span className="text-[9.5px] uppercase text-[#94a3b8] font-bold">Pilihan Kamu:</span>
                          <span className="font-bold truncate max-w-[240px] text-right">
                            {isTimeout ? '[WAKTU HABIS]' : `[${currentAns.selectedKey}] ${selectedOpt?.text || ''}`}
                          </span>
                        </div>

                        {!currentAns.isCorrect && correctOpt && (
                          <div className="p-1.5 sm:p-2 border bg-[#0c1e3d]/70 border-[#38bdf8]/50 text-[#38bdf8] flex items-center justify-between">
                            <span className="text-[9.5px] uppercase text-[#94a3b8] font-bold">Kunci Jawaban Resmi:</span>
                            <span className="font-bold truncate max-w-[240px] text-right">
                              [{correctOpt.key}] {correctOpt.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Identitas Pengurus Info Strip */}
                      <div className="bg-[#080c14] border border-[#1e2b46] p-2 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="text-[8.5px] uppercase text-[#64748b]">IDENTITAS PENGURUS:</div>
                          <div className="font-bold text-[#f8fafc] truncate text-xs sm:text-sm">{currentAns.question.correctNama}</div>
                          <div className="text-[10px] text-[#38bdf8] font-mono truncate">{currentAns.question.correctDivisi}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 bg-[#0c1e3d] text-[#38bdf8] border border-[#2563eb]/50 text-[9px] font-mono font-bold block">
                            ID: TI-{currentAns.question.nomor.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[8px] text-[#10b981] font-mono block mt-0.5">
                            TERDAFTAR RESMI
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Hotkey Guide Strip */}
                    <div className="bg-[#080c14] border border-[#1e2b46] px-3 py-1.5 flex items-center justify-between text-[9.5px] font-mono text-[#64748b] shrink-0">
                      <span className="flex items-center gap-1">
                        <span className="text-[#38bdf8] font-bold">[◀ / ▶]</span> Ganti Kartu
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#38bdf8] font-bold">[SPASI / F]</span> Balik 3D
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#38bdf8] font-bold">[ESC]</span> Tutup
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Audio Mixer Modal */}
      <AudioMixerModal isOpen={showAudioMixer} onClose={() => setShowAudioMixer(false)} />
    </div>
  );
};

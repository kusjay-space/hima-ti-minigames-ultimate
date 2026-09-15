import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, ArrowLeft, Keyboard, Terminal, ArrowRight, Music, Disc } from 'lucide-react';
import type { Question, QuizConfig, GameResult } from '../../types';
import { soundFx } from '../../lib/sound';
import { bgm } from '../../lib/bgm';
import { FlashcardCard } from './FlashcardCard';
import { OptionButton } from './OptionButton';
import { TimerBar } from './TimerBar';

interface FlashcardGameProps {
  questions: Question[];
  config: QuizConfig;
  namaPeserta: string;
  onFinishGame: (result: GameResult) => void;
  onCancel: () => void;
}

export const FlashcardGame: React.FC<FlashcardGameProps> = ({
  questions,
  config,
  namaPeserta,
  onFinishGame,
  onCancel
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timerDetik);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [isMusicEnabled, setIsMusicEnabled] = useState(bgm.isMusicEnabled());
  const [trackInfo, setTrackInfo] = useState(bgm.getCurrentTrackInfo());
  const [postAnswerCountdown, setPostAnswerCountdown] = useState(5);

  useEffect(() => {
    if (bgm.isMusicEnabled()) {
      bgm.start();
    }
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

  const answersRef = useRef<{
    question: Question;
    selectedKey: string;
    isCorrect: boolean;
  }[]>([]);

  const timerRef = useRef<any>(null);
  const nextTimerRef = useRef<any>(null);
  const postAnswerTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  useEffect(() => {
    if (
      config.animasiStyle === 'combo' || 
      config.animasiStyle === 'combo_tactical_sonar' || 
      config.animasiStyle === 'combo_matrix_overdrive' || 
      config.animasiStyle === 'combo_grand_stand' ||
      config.animasiStyle === 'combo_kinetic_glitch'
    ) {
      soundFx.playCyberScan();
    }
  }, [currentIdx, config.animasiStyle]);

  const goToNextQuestion = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
    if (postAnswerTimerRef.current) {
      clearInterval(postAnswerTimerRef.current);
      postAnswerTimerRef.current = null;
    }
    setPostAnswerCountdown(5);

    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedKey(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      const totalWaktu = (Date.now() - startTimeRef.current) / 1000;
      const benarCount = answersRef.current.filter((a) => a.isCorrect).length;
      const skorTotal = Math.round((benarCount / totalQuestions) * 100);
      const isLolosCap = benarCount >= config.minBenarCap;

      onFinishGame({
        namaPeserta,
        skor: skorTotal,
        totalSoal: totalQuestions,
        waktuDetik: Math.round(totalWaktu * 10) / 10,
        isLolosCap,
        answers: answersRef.current
      });
    }
  }, [currentIdx, totalQuestions, config.minBenarCap, namaPeserta, onFinishGame]);

  // Handle Timeout (Waktu Habis)
  const handleTimeout = useCallback(() => {
    if (isAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsAnswered(true);
    setIsCorrect(false);
    setSelectedKey(null);
    soundFx.playWrong();

    answersRef.current.push({
      question: currentQuestion,
      selectedKey: 'TIMEOUT',
      isCorrect: false
    });

    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);
    setPostAnswerCountdown(5);
    postAnswerTimerRef.current = setInterval(() => {
      setPostAnswerCountdown((prev) => {
        if (prev <= 1) {
          if (postAnswerTimerRef.current) {
            clearInterval(postAnswerTimerRef.current);
            postAnswerTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5000ms (5 detik) agar pemain bisa melihat jawaban dan kartu belakang sebelum lanjut
    nextTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, 5000);
  }, [isAnswered, currentQuestion, goToNextQuestion]);

  const handleTimeoutRef = useRef(handleTimeout);
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  // Timer Countdown Logic: berjalan per nomor soal, otomatis berhenti saat dijawab
  useEffect(() => {
    setTimeLeft(config.timerDetik);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleTimeoutRef.current();
          return 0;
        }
        if (prev <= 4) {
          soundFx.playTick(prev - 1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIdx, config.timerDetik]);

  // Handle Player Selects Option
  const handleSelectOption = useCallback((key: string) => {
    if (isAnswered) return;

    // Hentikan interval timer segera saat opsi dipilih
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const chosenOption = currentQuestion.options.find((o) => o.key === key);
    const correct = chosenOption ? chosenOption.isCorrect : false;

    setSelectedKey(key);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }

    answersRef.current.push({
      question: currentQuestion,
      selectedKey: key,
      isCorrect: correct
    });

    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);
    setPostAnswerCountdown(5);
    postAnswerTimerRef.current = setInterval(() => {
      setPostAnswerCountdown((prev) => {
        if (prev <= 1) {
          if (postAnswerTimerRef.current) {
            clearInterval(postAnswerTimerRef.current);
            postAnswerTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5000ms (5 detik) agar pemain punya waktu membaca info pengurus di kartu belakang sebelum lanjut
    nextTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, 5000);
  }, [isAnswered, currentQuestion, goToNextQuestion]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);
    };
  }, []);

  // Keyboard Shortcuts (A, B, C, D atau Spasi/Enter untuk lewati delay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          goToNextQuestion();
        }
        return;
      }
      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') handleSelectOption('A');
      if (key === 'B' || key === '2') handleSelectOption('B');
      if (key === 'C' || key === '3') handleSelectOption('C');
      if (key === 'D' || key === '4') handleSelectOption('D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, handleSelectOption, goToNextQuestion]);

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between max-w-6xl mx-auto p-1.5 xs:p-2 sm:p-3 md:p-6 overflow-hidden select-none bg-transparent text-default transition-colors">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2.5 border-b-2 border-default shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] sm:text-xs font-mono text-muted hover:text-default p-1 sm:py-1.5 sm:px-3 bg-default border border-default hover:border-primary flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
            title="Batal dan kembali ke menu utama"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BATAL</span>
          </button>

          <div className="hidden xs:flex items-center gap-1">
            <span className="text-[9px] sm:text-[10px] font-mono text-muted uppercase hidden sm:inline">PESERTA:</span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-default px-1.5 sm:px-2 py-0.5 bg-default border border-default truncate max-w-[75px] xs:max-w-[100px] sm:max-w-none shadow-sm">
              {namaPeserta}
            </span>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex-1 min-w-0 mx-1.5 sm:mx-3 md:max-w-sm">
          <TimerBar timeLeft={timeLeft} totalTime={config.timerDetik} />
        </div>

        {/* Right Info & Audio Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* BGM Track Cycle Button */}
          <button
            type="button"
            onClick={handleCycleTrack}
            className="p-1 sm:p-1.5 bg-default border border-default hover:border-primary hover:bg-subtle text-muted hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title={`Ganti Tema Musik (Saat ini: ${trackInfo.name}) - Klik untuk ganti musik`}
          >
            <Disc className={`w-3.5 h-3.5 text-primary ${isMusicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-primary hidden sm:inline">
              {trackInfo.tag}
            </span>
          </button>

          {/* Dedicated Quizizz-style BGM Toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`p-1 sm:p-1.5 border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm ${
              isMusicEnabled
                ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                : 'bg-default border-default text-muted hover:text-default'
            }`}
            title={isMusicEnabled ? 'Musik Latar (BGM): Aktif - Klik untuk Matikan' : 'Musik Latar (BGM): Nonaktif - Klik untuk Nyalakan'}
          >
            <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMusicEnabled ? 'animate-pulse' : ''}`} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              BGM {isMusicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Dedicated Sound Effects (SFX) Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-1 sm:p-1.5 bg-default border border-default text-muted hover:text-default hover:border-primary cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title={isMuted ? 'Efek Suara (SFX): Bisu - Klik untuk Nyalakan' : 'Efek Suara (SFX): Aktif - Klik untuk Bisukan'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-error" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />}
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              SFX
            </span>
          </button>

          <div className="text-[10px] sm:text-xs font-mono font-bold text-default bg-default px-1.5 sm:px-3 py-0.5 sm:py-1 border border-default shadow-sm">
            {currentIdx + 1}/{totalQuestions}
          </div>
        </div>
      </header>

      {/* Main Play Arena */}
      <main className="flex-1 min-h-0 py-1 xs:py-1.5 sm:py-2 md:py-3 flex flex-col justify-center w-full overflow-visible">
        <div className="w-full h-full flex flex-col md:grid md:grid-cols-12 gap-1.5 xs:gap-2 sm:gap-3 md:gap-6 lg:gap-8 items-center justify-between md:justify-center min-h-0 overflow-visible">
          {/* Left/Top Column: The Portrait Flashcard */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center md:flex-none md:col-span-5 md:h-auto py-2 xs:py-2.5 md:py-2 overflow-visible">
            <AnimatePresence mode="wait">
              <FlashcardCard
                key={currentQuestion.id + '-' + currentIdx}
                question={currentQuestion}
                nextQuestion={currentIdx + 1 < questions.length ? questions[currentIdx + 1] : undefined}
                animasiStyle={config.animasiStyle}
                fotoFokus={config.fotoFokus}
                isAnswered={isAnswered}
                isCorrect={isCorrect}
                totalQuestions={totalQuestions}
                currentNumber={currentIdx + 1}
                compactOnMobile={true}
              />
            </AnimatePresence>
          </div>

          {/* Right/Bottom Column: Question Box & ABCD 2x2 Options Grid */}
          <div className="shrink-0 w-full md:flex-none md:col-span-7 flex flex-col justify-center space-y-2 xs:space-y-2.5 sm:space-y-3 min-w-0 pb-0.5 md:pb-0">
            {/* Question Card Box */}
            <div className="bg-default border-2 border-default p-2.5 xs:p-3 sm:p-3.5 md:p-5 shadow-tactile relative">
              <div className="absolute top-1 left-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>

              <div className="flex items-center justify-between mb-1 pb-1 sm:mb-2 sm:pb-1.5 border-b border-default">
                <span className="text-[10px] xs:text-[10.5px] sm:text-[11px] font-mono text-primary uppercase tracking-wider font-bold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  {currentQuestion.questionType === 'tebak_nama' ? 'MISI: NAMA PENGURUS' : 'MISI: JABATAN PENGURUS'}
                </span>
                <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-muted">
                  <Keyboard className="w-3 h-3 text-muted" />
                  [A / B / C / D]
                </span>
              </div>

              <h2 className="text-[13px] xs:text-sm sm:text-base md:text-xl font-bold text-default leading-snug">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* ABCD Options 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 xs:gap-2.5 sm:gap-2.5 md:gap-3">
              {currentQuestion.options.map((opt, idx) => (
                <OptionButton
                  key={opt.key + '-' + currentIdx}
                  option={opt}
                  index={idx}
                  selectedKey={selectedKey}
                  isAnswered={isAnswered}
                  animasiStyle={config.animasiStyle}
                  onSelect={handleSelectOption}
                />
              ))}
            </div>

            {/* Post-Answer Transition Notice & Fast-Forward Action */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-1.5 xs:p-2 sm:p-2.5 md:p-3 border-2 shadow-tactile ${
                  isCorrect
                    ? 'bg-success/15 border-success text-default shadow-tactile-emerald'
                    : 'bg-error/15 border-error text-default shadow-tactile-coral'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-success' : 'bg-error'} animate-ping`} />
                  <span className="text-[10px] xs:text-[11px] sm:text-xs font-mono font-bold text-default">
                    {isCorrect ? 'BENAR!' : 'SALAH!'} Lanjut {postAnswerCountdown}s
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => goToNextQuestion()}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary hover:bg-secondary text-white border border-primary font-mono font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-tactile-sm transition-all active:translate-y-0.5 cursor-pointer"
                >
                  <span>LEWATI ({postAnswerCountdown}s)</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-[9px] text-white/80 hidden sm:inline">[ENTER]</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="pt-1 sm:pt-2 border-t-2 border-default flex items-center justify-between text-[9.5px] sm:text-[11px] font-mono text-muted shrink-0">
        <span className="hidden sm:inline">HIMA TI GMTI 2026 // STAND MINIGAME</span>
        <span className="text-subtle truncate">PILIHAN GANDA [A-D]</span>
        <span className="shrink-0">TARGET: &ge; {config.minBenarCap} BENAR</span>
      </footer>
    </div>
  );
};

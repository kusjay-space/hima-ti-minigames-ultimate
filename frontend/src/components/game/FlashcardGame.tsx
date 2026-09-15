import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, ArrowLeft, Keyboard, Terminal, ArrowRight, Music, Disc, Sliders } from 'lucide-react';
import type { Question, QuizConfig, GameResult } from '../../types';
import { soundFx } from '../../lib/sound';
import { bgm } from '../../lib/bgm';
import { FlashcardCard } from './FlashcardCard';
import { OptionButton } from './OptionButton';
import { TimerBar } from './TimerBar';
import { updateActiveQuizProgress, clearActiveQuiz } from '../../lib/session';
import { AudioMixerModal } from './AudioMixerModal';

interface FlashcardGameProps {
  questions: Question[];
  config: QuizConfig;
  namaPeserta: string;
  initialIdx?: number;
  initialAnswers?: {
    question: Question;
    selectedKey: string;
    isCorrect: boolean;
  }[];
  initialStartTime?: number;
  onFinishGame: (result: GameResult) => void;
  onCancel: () => void;
}

export const FlashcardGame: React.FC<FlashcardGameProps> = ({
  questions,
  config,
  namaPeserta,
  initialIdx = 0,
  initialAnswers = [],
  initialStartTime,
  onFinishGame,
  onCancel
}) => {
  const safeInitialIdx = Math.min(Math.max(0, initialIdx), Math.max(0, questions.length - 1));
  const [currentIdx, setCurrentIdx] = useState(safeInitialIdx);
  const [timeLeft, setTimeLeft] = useState(config.timerDetik);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [isMusicEnabled, setIsMusicEnabled] = useState(bgm.isMusicEnabled());
  const [trackInfo, setTrackInfo] = useState(bgm.getCurrentTrackInfo());
  const [postAnswerCountdown, setPostAnswerCountdown] = useState(5);
  const [showAudioMixer, setShowAudioMixer] = useState(false);

  useEffect(() => {
    setIsMuted(soundFx.isMuted());
    const unsubSfx = soundFx.subscribe((muted) => {
      setIsMuted(muted);
    });
    if (bgm.isMusicEnabled()) {
      bgm.start();
    }
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

  const answersRef = useRef<{
    question: Question;
    selectedKey: string;
    isCorrect: boolean;
  }[]>(initialAnswers);

  const timerRef = useRef<any>(null);
  const nextTimerRef = useRef<any>(null);
  const postAnswerTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(initialStartTime ?? Date.now());

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
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedKey(null);
      setIsAnswered(false);
      setIsCorrect(false);
      updateActiveQuizProgress(nextIdx, answersRef.current);
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

  const isSecretMode = (config.spillJawaban || 'akhir') === 'akhir';

  // Handle Timeout (Waktu Habis)
  const handleTimeout = useCallback(() => {
    if (isAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsAnswered(true);
    setIsCorrect(false);
    setSelectedKey('TIMEOUT');
    
    if (isSecretMode) {
      soundFx.playTick(0);
    } else {
      soundFx.playWrong();
    }

    const updatedAnswers = [
      ...answersRef.current,
      {
        question: currentQuestion,
        selectedKey: 'TIMEOUT',
        isCorrect: false
      }
    ];
    answersRef.current = updatedAnswers;
    updateActiveQuizProgress(currentIdx, updatedAnswers);

    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);

    const delayMs = 5000;
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

    nextTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, delayMs);
  }, [isAnswered, isSecretMode, currentQuestion, goToNextQuestion]);

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
        const nextTime = prev - 1;
        if (nextTime <= 5 && nextTime >= 1) {
          soundFx.playTick(nextTime);
        }
        return nextTime;
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

    if (isSecretMode) {
      // Pada mode rahasia (Element of Surprise): Suara kunci taktis tanpa spoiler menang/kalah
      soundFx.playClick();
    } else {
      if (correct) {
        soundFx.playCorrect();
      } else {
        soundFx.playWrong();
      }
    }

    const updatedAnswers = [
      ...answersRef.current,
      {
        question: currentQuestion,
        selectedKey: key,
        isCorrect: correct
      }
    ];
    answersRef.current = updatedAnswers;
    updateActiveQuizProgress(currentIdx, updatedAnswers);

    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);

    const delayMs = 5000;
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

    nextTimerRef.current = setTimeout(() => {
      goToNextQuestion();
    }, delayMs);
  }, [isAnswered, isSecretMode, currentQuestion, goToNextQuestion, currentIdx]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);
    };
  }, []);

  // Handle pembatalan kuis (bersihkan sesi aktif dan kembali ke welcome)
  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (postAnswerTimerRef.current) clearInterval(postAnswerTimerRef.current);
    clearActiveQuiz();
    onCancel();
  }, [onCancel]);

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
    <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between max-w-6xl mx-auto p-1.5 xs:p-2 sm:p-3 md:p-6 overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2.5 border-b-2 border-[#1c2b46] shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="text-[11px] sm:text-xs font-mono text-[#94a3b8] hover:text-white p-1 sm:py-1.5 sm:px-3 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] flex items-center gap-1 transition-colors cursor-pointer"
            title="Batal dan kembali ke menu utama"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BATAL</span>
          </button>

          <div className="hidden xs:flex items-center gap-1">
            <span className="text-[9px] sm:text-[10px] font-mono text-[#64748b] uppercase hidden sm:inline">PESERTA:</span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-[#f8fafc] px-1.5 sm:px-2 py-0.5 bg-[#0d1424] border border-[#1e2b46] truncate max-w-[75px] xs:max-w-[100px] sm:max-w-none">
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
            className="p-1 sm:p-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title={`Ganti Tema Musik (Saat ini: ${trackInfo.name}) - Klik untuk ganti musik`}
          >
            <Disc className={`w-3.5 h-3.5 text-[#38bdf8] ${isMusicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#38bdf8] hidden sm:inline">
              {trackInfo.tag}
            </span>
          </button>

          {/* Dedicated Quizizz-style BGM Toggle */}
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

          {/* Dedicated Sound Effects (SFX) Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(soundFx.toggleMute())}
            className="p-1 sm:p-1.5 bg-[#0d1424] border border-[#1e2b46] text-[#94a3b8] hover:text-white cursor-pointer flex items-center justify-center gap-1"
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
            className="p-1 sm:p-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title="Buka Mixer Volume Audio (Atur Besar/Kecil Suara BGM & SFX)"
          >
            <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              VOL
            </span>
          </button>

          <div className="text-[10px] sm:text-xs font-mono font-bold text-[#f8fafc] bg-[#0d1424] px-1.5 sm:px-3 py-0.5 sm:py-1 border border-[#1e2b46]">
            {currentIdx + 1}/{totalQuestions}
          </div>
        </div>
      </header>

      {/* Main Play Arena: Dynamic Adaptive Mobile Layout, Zero Scroll, Original Desktop Layout */}
      <main className="flex-1 min-h-0 py-1 xs:py-1.5 sm:py-2 md:py-3 flex flex-col justify-center w-full overflow-visible">
        <div className="w-full h-full flex flex-col md:grid md:grid-cols-12 gap-1.5 xs:gap-2 sm:gap-3 md:gap-6 lg:gap-8 items-center justify-between md:justify-center min-h-0 overflow-visible">
          {/* Left/Top Column: The Portrait Flashcard (Fills available vertical space on mobile, original fixed height on desktop) */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center md:flex-none md:col-span-5 md:h-auto py-2 xs:py-2.5 md:py-2 overflow-visible relative">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Sibling Background Next Card in Deck (Continuously sitting underneath, blurred photo, never unmounts prematurely) */}
              {currentIdx + 1 < totalQuestions && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0 select-none flex items-center justify-center translate-x-2.5 translate-y-3 scale-[0.94] rotate-[2.5deg] md:translate-x-5 md:translate-y-6 md:scale-[0.93] md:rotate-[3deg] opacity-85 transition-all duration-300"
                >
                  <FlashcardCard
                    key={`bg-${questions[currentIdx + 1].id}`}
                    question={questions[currentIdx + 1]}
                    animasiStyle={config.animasiStyle}
                    fotoFokus={config.fotoFokus}
                    isAnswered={false}
                    isCorrect={true}
                    totalQuestions={totalQuestions}
                    currentNumber={currentIdx + 2}
                    isBackgroundCard={true}
                    compactOnMobile={true}
                    spillJawaban={config.spillJawaban || 'akhir'}
                  />
                </div>
              )}

              {/* Active Foreground Card with Smooth PopLayout Deck Transition */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentQuestion.id + '-' + currentIdx}
                  className="w-full h-full flex items-center justify-center z-10"
                  initial={
                    currentIdx === 0 
                      ? { opacity: 0, scale: 0.96, y: 10 } 
                      : { scale: 0.94, x: 18, y: 22, rotate: 2.5, opacity: 0.92 }
                  }
                  animate={{ 
                    scale: 1, 
                    x: 0, 
                    y: 0, 
                    rotate: 0, 
                    opacity: 1 
                  }}
                  exit={{ 
                    x: 480, 
                    y: 28, 
                    rotate: 16, 
                    opacity: 0,
                    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } 
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 260, 
                    damping: 24,
                    mass: 0.8
                  }}
                >
                  <FlashcardCard
                    question={currentQuestion}
                    animasiStyle={config.animasiStyle}
                    fotoFokus={config.fotoFokus}
                    isAnswered={isAnswered}
                    isCorrect={isCorrect}
                    totalQuestions={totalQuestions}
                    currentNumber={currentIdx + 1}
                    compactOnMobile={true}
                    spillJawaban={config.spillJawaban || 'akhir'}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right/Bottom Column: Question Box & ABCD 2x2 Options Grid (Guaranteed zero-scroll shrink-0 on mobile) */}
          <div className="shrink-0 w-full md:flex-none md:col-span-7 flex flex-col justify-center space-y-2 xs:space-y-2.5 sm:space-y-3 min-w-0 pb-0.5 md:pb-0">
            {/* Question Card Box */}
            <div className="bg-[#0d1424] border-2 border-[#1e2b46] p-2.5 xs:p-3 sm:p-3.5 md:p-5 shadow-tactile relative">
              <div className="absolute top-1 left-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

              <div className="flex items-center justify-between mb-1 pb-1 sm:mb-2 sm:pb-1.5 border-b border-[#1e2b46]">
                <span className="text-[10px] xs:text-[10.5px] sm:text-[11px] font-mono text-[#38bdf8] uppercase tracking-wider font-bold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  {currentQuestion.questionType === 'tebak_nama' ? 'MISI: NAMA PENGURUS' : 'MISI: JABATAN PENGURUS'}
                </span>
                <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-[#64748b]">
                  <Keyboard className="w-3 h-3 text-[#94a3b8]" />
                  [A / B / C / D]
                </span>
              </div>

              <h2 className="text-[13px] xs:text-sm sm:text-base md:text-xl font-bold text-[#f8fafc] leading-snug">
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
                  spillJawaban={config.spillJawaban || 'akhir'}
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
                  isSecretMode
                    ? 'bg-[#0c1e3d]/90 border-[#38bdf8] shadow-tactile-blue'
                    : isCorrect
                    ? 'bg-[#052e16]/80 border-[#10b981] shadow-tactile-emerald'
                    : 'bg-[#4c0519]/80 border-[#f43f5e] shadow-tactile-coral'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSecretMode ? 'bg-[#38bdf8]' : isCorrect ? 'bg-[#10b981]' : 'bg-[#f43f5e]'
                    } animate-ping`}
                  />
                  <span className="text-[10px] xs:text-[11px] sm:text-xs font-mono font-bold text-[#f8fafc] truncate">
                    {isSecretMode
                      ? selectedKey === 'TIMEOUT'
                        ? `WAKTU HABIS // SOAL BERIKUTNYA ${postAnswerCountdown}s`
                        : `JAWABAN TERKUNCI // SOAL BERIKUTNYA ${postAnswerCountdown}s`
                      : `${isCorrect ? 'BENAR!' : 'SALAH!'} Lanjut ${postAnswerCountdown}s`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => goToNextQuestion()}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#1e2b46] hover:bg-[#2563eb] text-[#f8fafc] border border-[#38bdf8] font-mono font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-tactile-sm transition-all active:translate-y-0.5 cursor-pointer shrink-0 ml-1.5"
                >
                  <span>LEWATI</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-[9px] text-[#94a3b8] hidden sm:inline">[ENTER]</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="pt-1 sm:pt-2 border-t-2 border-[#1c2b46] flex items-center justify-between text-[9.5px] sm:text-[11px] font-mono text-[#64748b] shrink-0">
        <span className="hidden sm:inline">HIMA TI GMTI 2026 // STAND MINIGAME</span>
        <span className="text-[#94a3b8] truncate">PILIHAN GANDA [A-D]</span>
        <span className="shrink-0">TARGET: &ge; {config.minBenarCap} BENAR</span>
      </footer>

      {/* Audio Mixer Modal */}
      <AudioMixerModal isOpen={showAudioMixer} onClose={() => setShowAudioMixer(false)} />
    </div>
  );
};

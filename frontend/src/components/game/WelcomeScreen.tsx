import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Settings, Volume2, VolumeX, Shield, Users, Clock, AlertCircle, ArrowRight, User, RefreshCw, Layers, RotateCw, Music, Disc, X } from 'lucide-react';
import { soundFx } from '../../lib/sound';
import { bgm, BGM_TRACKS, type BgmTrackMode } from '../../lib/bgm';
import type { QuizConfig, LeaderboardEntry } from '../../types';
import { FlashcardCard } from './FlashcardCard';

interface WelcomeScreenProps {
  config: QuizConfig | null;
  onStart: (namaPeserta: string) => void;
  onOpenLeaderboard: () => void;
  onOpenAdmin: () => void;
}

const challengerCards = [
  {
    index: 0,
    label: 'PASS #1',
    tab: '01. MISI',
    title: 'MISI 34 PENGURUS',
    sub: 'Tantangan Identifikasi',
    color: '#38bdf8'
  },
  {
    index: 1,
    label: 'PASS #2',
    tab: '02. SYARAT CAP',
    title: 'SYARAT CAP GMTI',
    sub: 'Minimal 4 Benar',
    color: '#10b981'
  },
  {
    index: 2,
    label: 'PASS #3',
    tab: '03. REWARD',
    title: 'TOP 10 LEADERBOARD',
    sub: 'Merchandise & Hadiah',
    color: '#f59e0b'
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  config,
  onStart,
  onOpenLeaderboard,
  onOpenAdmin
}) => {
  const [namaPeserta, setNamaPeserta] = useState('');
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [isMusicEnabled, setIsMusicEnabled] = useState(bgm.isMusicEnabled());
  const [bgmThemeName, setBgmThemeName] = useState(bgm.getActiveThemeName());
  const [bgmTrackMode, setBgmTrackMode] = useState<BgmTrackMode>(bgm.getTrackMode());
  const [error, setError] = useState('');
  const [isValidatingName, setIsValidatingName] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setLeaderboardEntries(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil leaderboard:', err);
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (bgm.isMusicEnabled() && !bgm.isMusicPlaying()) {
      bgm.start();
    }
    return bgm.subscribe((enabled, track, themeName) => {
      setIsMusicEnabled(enabled);
      setBgmTrackMode(track);
      setBgmThemeName(themeName);
    });
  }, []);

  // Real 3D Physical Card Deck Stack States [topCard, midCard, backCard]
  const [deck, setDeck] = useState<number[]>([0, 1, 2]);
  const [transition, setTransition] = useState<{
    swipingCard: number;
    direction: 'left' | 'right';
    phase: 'out' | 'docking';
    targetDeck: number[];
  } | null>(null);
  const [isAutoSwitch, setIsAutoSwitch] = useState(true);
  const [isHoveringStack, setIsHoveringStack] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const isSwipingRef = useRef(false);

  const handleNext = (direction: 'left' | 'right' = 'left') => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    soundFx.playCardHover();

    const topCard = deck[0];
    const targetDeck = [deck[1], deck[2], deck[0]];

    // Phase 1: Kartu depan peel out ke samping di atas stack (zIndex 35)
    setTransition({
      swipingCard: topCard,
      direction,
      phase: 'out',
      targetDeck,
    });

    // Phase 2: Setelah membersihkan batas stack (~200ms), kartu turun ke zIndex 5 di belakang stack lalu glide masuk ke slot pojok kanan bawah
    setTimeout(() => {
      setIsCardFlipped(false);
      setTransition({
        swipingCard: topCard,
        direction,
        phase: 'docking',
        targetDeck,
      });

      // Phase 3: Settle (~240ms kemudian)
      setTimeout(() => {
        setDeck(targetDeck);
        setTransition(null);
        isSwipingRef.current = false;
      }, 240);
    }, 200);
  };

  const handlePrev = (direction: 'left' | 'right' = 'right') => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    soundFx.playCardHover();

    const bottomCard = deck[2];
    const targetDeck = [deck[2], deck[0], deck[1]];

    // Phase 1: Kartu belakang peel out ke samping (zIndex 35)
    setTransition({
      swipingCard: bottomCard,
      direction,
      phase: 'out',
      targetDeck,
    });

    // Phase 2: Kartu meluncur mulus ke posisi depan tengah (zIndex 30)
    setTimeout(() => {
      setIsCardFlipped(false);
      setTransition({
        swipingCard: bottomCard,
        direction,
        phase: 'docking',
        targetDeck,
      });

      // Phase 3: Settle (~240ms kemudian)
      setTimeout(() => {
        setDeck(targetDeck);
        setTransition(null);
        isSwipingRef.current = false;
      }, 240);
    }, 200);
  };

  const handleSelectCard = (targetIndex: number) => {
    if (isSwipingRef.current || deck[0] === targetIndex) return;
    const currentPos = deck.indexOf(targetIndex);
    if (currentPos === 1) {
      handleNext('left');
    } else if (currentPos === 2) {
      handlePrev('right');
    }
  };

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  // Auto-switch: otomatis balik kartu ke sisi belakang, lalu geser ke kartu berikutnya!
  useEffect(() => {
    if (!isAutoSwitch || isHoveringStack || transition !== null) return;

    const timer = setTimeout(() => {
      if (!isCardFlipped) {
        // Step 1: Otomatis membalikkan kartu ke sisi belakang (menampilkan briefing / rules)
        soundFx.playFlip();
        setIsCardFlipped(true);
      } else {
        // Step 2: Otomatis geser ke kartu berikutnya di tumpukan 3D
        handleNextRef.current('left');
      }
    }, 3600);

    return () => clearTimeout(timer);
  }, [isAutoSwitch, isHoveringStack, isCardFlipped, transition]);

  const getCardMotion = (cardIdx: number) => {
    // Keadaan diam (Idle): Tumpukan kartu fisik fanned out ke pojok kanan bawah dengan pencahayaan bertingkat (tanpa blur agar teks selalu tajam)
    if (!transition) {
      const pos = deck.indexOf(cardIdx); // 0: Front, 1: Middle, 2: Bottom
      if (pos === 0) {
        return {
          zIndex: 30,
          animate: {
            x: 0,
            y: 0,
            scale: 1.0,
            rotateZ: 0,
            rotateY: 0,
            opacity: 1,
            filter: 'none',
          },
          transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 25,
            mass: 0.85,
          },
        };
      }
      if (pos === 1) {
        return {
          zIndex: 20,
          animate: {
            x: 22,
            y: 24,
            scale: 0.93,
            rotateZ: 3,
            rotateY: 0,
            opacity: 0.92,
            filter: 'none',
          },
          transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 25,
            mass: 0.85,
          },
        };
      }
      // pos === 2 (Bottom card)
      return {
        zIndex: 10,
        animate: {
          x: 42,
          y: 46,
          scale: 0.86,
          rotateZ: 5.5,
          rotateY: 0,
          opacity: 0.82,
          filter: 'none',
        },
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 25,
          mass: 0.85,
        },
      };
    }

    // Transisi sedang berlangsung
    const { swipingCard, direction, phase, targetDeck } = transition;
    const isMovingNext = targetDeck[0] === deck[1]; // Next: deck[0] goes to back

    if (isMovingNext) {
      // 1. Kartu depan yang berpindah ke belakang
      if (cardIdx === swipingCard) {
        if (phase === 'out') {
          return {
            zIndex: 35,
            animate: {
              x: direction === 'left' ? -65 : 65,
              y: -22,
              scale: 0.98,
              rotateZ: direction === 'left' ? -4.5 : 4.5,
              rotateY: direction === 'left' ? 8 : -8,
              opacity: 0.98,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 300,
              damping: 24,
              mass: 0.8,
            },
          };
        } else {
          // phase === 'docking' -> meluncur masuk ke slot belakang di bawah kartu lainnya (zIndex: 5)
          return {
            zIndex: 5,
            animate: {
              x: 42,
              y: 46,
              scale: 0.86,
              rotateZ: 5.5,
              rotateY: 0,
              opacity: 0.82,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 280,
              damping: 24,
              mass: 0.85,
            },
          };
        }
      }

      // 2. Kartu tengah yang maju ke depan
      if (cardIdx === deck[1]) {
        return {
          zIndex: phase === 'out' ? 25 : 30,
          animate: {
            x: 0,
            y: 0,
            scale: 1.0,
            rotateZ: 0,
            rotateY: 0,
            opacity: 1,
            filter: 'none',
          },
          transition: {
            type: 'spring' as const,
            stiffness: 280,
            damping: 24,
            mass: 0.85,
          },
        };
      }

      // 3. Kartu bawah yang maju ke posisi tengah
      return {
        zIndex: phase === 'out' ? 15 : 20,
        animate: {
          x: 22,
          y: 24,
          scale: 0.93,
          rotateZ: 3,
          rotateY: 0,
          opacity: 0.92,
          filter: 'none',
        },
        transition: {
          type: 'spring' as const,
          stiffness: 280,
          damping: 24,
          mass: 0.85,
        },
      };
    } else {
      // Prev: Kartu belakang yang maju ke depan (targetDeck[0] === deck[2])
      if (cardIdx === swipingCard) {
        if (phase === 'out') {
          // Tetap di bawah deck (zIndex: 5) saat menarik keluar ke samping
          return {
            zIndex: 5,
            animate: {
              x: direction === 'left' ? -65 : 65,
              y: 15,
              scale: 0.92,
              rotateZ: direction === 'left' ? -4 : 4,
              rotateY: direction === 'left' ? 6 : -6,
              opacity: 0.95,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 300,
              damping: 24,
              mass: 0.8,
            },
          };
        } else {
          // phase === 'docking' -> naik ke atas deck (zIndex: 35) dan meluncur mulus ke posisi depan tengah
          return {
            zIndex: 35,
            animate: {
              x: 0,
              y: 0,
              scale: 1.0,
              rotateZ: 0,
              rotateY: 0,
              opacity: 1,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 280,
              damping: 24,
              mass: 0.85,
            },
          };
        }
      }

      // Kartu depan mundur ke posisi tengah
      if (cardIdx === deck[0]) {
        return {
          zIndex: phase === 'out' ? 25 : 20,
          animate: {
            x: 22,
            y: 24,
            scale: 0.93,
            rotateZ: 3,
            rotateY: 0,
            opacity: 0.92,
            filter: 'none',
          },
          transition: {
            type: 'spring' as const,
            stiffness: 280,
            damping: 24,
            mass: 0.85,
          },
        };
      }

      // Kartu tengah mundur ke posisi paling bawah
      return {
        zIndex: phase === 'out' ? 15 : 10,
        animate: {
          x: 42,
          y: 46,
          scale: 0.86,
          rotateZ: 5.5,
          rotateY: 0,
          opacity: 0.82,
          filter: 'none',
        },
        transition: {
          type: 'spring' as const,
          stiffness: 280,
          damping: 24,
          mass: 0.85,
        },
      };
    }
  };

  const totalSoal = config?.totalSoal ?? 5;
  const timerDetik = config?.timerDetik ?? 10;
  const minBenarCap = config?.minBenarCap ?? 4;

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const enabled = bgm.toggle();
    setIsMusicEnabled(enabled);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = namaPeserta.trim();
    if (!cleanName) {
      setError('Harap masukkan nama peserta atau nama tim kamu!');
      return;
    }
    if (cleanName.length < 2) {
      setError('Nama minimal terdiri dari 2 karakter!');
      return;
    }

    setError('');
    setIsValidatingName(true);

    try {
      const res = await fetch(`/api/check-name?name=${encodeURIComponent(cleanName)}`);
      const data = await res.json();

      if (!data.available) {
        setError(data.message || `Nama tim "${cleanName}" sudah terdaftar di leaderboard! Gunakan nama pembeda.`);
        soundFx.playWrong();
        setIsValidatingName(false);
        return;
      }

      soundFx.playTick();
      onStart(cleanName);
    } catch {
      soundFx.playTick();
      onStart(cleanName);
    } finally {
      setIsValidatingName(false);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col justify-center max-w-[1880px] mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 select-none relative overflow-visible">
      {/* Top-Right Settings Gear Icon */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40">
        <button
          type="button"
          onClick={() => {
            soundFx.playCardHover();
            setIsSettingsOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white backdrop-blur-md transition-all cursor-pointer group flex items-center gap-2.5 shadow-sm"
          title="Buka Pengaturan Game & Audio"
        >
          <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-sky-400 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-semibold uppercase tracking-wider hidden md:inline text-slate-300 group-hover:text-white">
            Pengaturan
          </span>
        </button>
      </div>

      {/* Main Hero & Console Area */}
      <main className="flex-1 min-h-0 py-2 sm:py-4 flex items-center justify-center w-full overflow-visible">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4 sm:gap-6 xl:gap-8 overflow-visible">
          {/* Left Column: Real 3D Physical Card Deck Stack with Dynamic Layers & Gesture Swiping (Preserved intact) */}
          <div className="w-full lg:w-[380px] xl:w-[420px] 2xl:w-[460px] shrink-0 flex flex-col items-center justify-center overflow-visible relative z-20">
            <div 
              className="relative w-full flex flex-col items-center select-none overflow-visible"
              onMouseEnter={() => setIsHoveringStack(true)}
              onMouseLeave={() => setIsHoveringStack(false)}
            >
              {/* Stack Stage Container - with padding to accommodate fanned-out layers without clipping */}
              <div className="relative w-full max-w-[310px] xs:max-w-[335px] sm:max-w-[365px] md:max-w-[385px] lg:max-w-[400px] xl:max-w-[420px] mx-auto perspective-1200 flex flex-col items-center overflow-visible">
                <div className="relative w-full pb-16 pr-14 overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Invisible Sizer to naturally dictate container dimensions without hardcoding */}
                  <div className="invisible pointer-events-none opacity-0 select-none" aria-hidden="true">
                    <FlashcardCard
                      isChallengerCard={true}
                      challengerIndex={0}
                      isBackgroundCard={true}
                      animasiStyle={config?.animasiStyle || 'combo'}
                      fotoFokus={config?.fotoFokus || 'tengah_atas'}
                      isAnswered={false}
                      isCorrect={true}
                      totalQuestions={totalSoal}
                      currentNumber={1}
                      interactivePreview={false}
                    />
                  </div>

                  {/* 3 Real Persistent Cards (Fixed Key per card = Zero DOM destruction, Zero Flicker!) */}
                  {[0, 1, 2].map((cardIdx) => {
                    const stackPos = deck.indexOf(cardIdx); // 0: Front, 1: Middle, 2: Bottom
                    const isFront = stackPos === 0;
                    const isMid = stackPos === 1;
                    const isBottom = stackPos === 2;
                    const motionProps = getCardMotion(cardIdx);

                    return (
                      <motion.div
                        key={`challenger-stack-card-${cardIdx}`}
                        initial={false}
                        style={{
                          zIndex: motionProps.zIndex,
                          transformStyle: 'preserve-3d',
                        }}
                        animate={motionProps.animate}
                        transition={motionProps.transition}
                        onClick={() => {
                          if (transition) return;
                          if (isMid) handleNext('left');
                          else if (isBottom) handlePrev('right');
                        }}
                        className={`absolute inset-0 w-full overflow-visible ${!isFront ? 'cursor-pointer pointer-events-auto' : ''}`}
                        title={!isFront ? `Klik untuk geser kartu [ ${challengerCards[cardIdx].label} ] ke depan` : undefined}
                      >
                        <FlashcardCard
                          isChallengerCard={true}
                          challengerIndex={cardIdx}
                          isBackgroundCard={!isFront}
                          animasiStyle={config?.animasiStyle || 'combo'}
                          fotoFokus={config?.fotoFokus || 'tengah_atas'}
                          isAnswered={false}
                          isCorrect={true}
                          totalQuestions={totalSoal}
                          currentNumber={1}
                          interactivePreview={isFront && transition === null}
                          isFlippedControlled={isFront && transition === null ? isCardFlipped : false}
                          onSwipeCard={isFront ? (dir) => handleNext(dir) : undefined}
                          onCardFlipped={isFront ? (flipped) => setIsCardFlipped(flipped) : undefined}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls & Auto-Switch Toolbar (Flat & Elegant) */}
              <div className="mt-2 w-full max-w-[310px] xs:max-w-[335px] sm:max-w-[365px] md:max-w-[385px] lg:max-w-[400px] xl:max-w-[420px] flex flex-col items-center gap-2.5">
                {/* 3 Clickable Full-Width Segmented Tabs */}
                <div className="w-full grid grid-cols-3 gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
                  {challengerCards.map((card) => {
                    const isActive = card.index === deck[0];
                    return (
                      <button
                        key={card.index}
                        type="button"
                        onClick={() => handleSelectCard(card.index)}
                        disabled={transition !== null}
                        className={`py-2 px-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer rounded-lg flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="truncate">{card.tab}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub Action Bar: Prev, Next, Auto, and Flip State */}
                <div className="w-full flex items-center justify-between gap-2 px-0.5">
                  {/* Left: Previous & Next Arrow Nav */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePrev('right')}
                      disabled={transition !== null}
                      className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
                      title="Kartu Sebelumnya"
                    >
                      <span>&larr;</span>
                      <span className="text-[11px] hidden xs:inline">Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNext('left')}
                      disabled={transition !== null}
                      className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
                      title="Kartu Selanjutnya"
                    >
                      <span className="text-[11px] hidden xs:inline">Next</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  {/* Right: Auto-Switch and Flip Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAutoSwitch((prev) => !prev)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isAutoSwitch 
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/60' 
                          : 'border-slate-800 text-slate-400 bg-slate-900/90 hover:text-slate-300 hover:border-slate-700'
                      }`}
                      title={isAutoSwitch ? 'Jeda Switch Otomatis' : 'Aktifkan Switch Otomatis'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAutoSwitch ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                      <span>Auto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCardFlipped((prev) => !prev)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCardFlipped 
                          ? 'border-sky-500/40 text-sky-400 bg-sky-950/40' 
                          : 'border-slate-800 text-slate-300 bg-slate-900/90 hover:border-slate-700 hover:text-white'
                      }`}
                      title="Klik untuk membalik kartu"
                    >
                      <RotateCw className="w-3 h-3 text-sky-400" />
                      <span>{isCardFlipped ? 'Belakang' : 'Depan'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Middle Column: Title, Cap Target & Player Input (Flat, Elegant, Modern) */}
          <div className="w-full lg:flex-1 max-w-[660px] xl:max-w-[740px] 2xl:max-w-[800px] flex flex-col justify-center space-y-4 sm:space-y-5">
            {/* Header Title Block */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400 tracking-wide mb-3">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>STAND RESMI HIMA TI // GMTI 2026</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                FLASHCARD <span className="text-sky-400">PENGURUS</span>
              </h1>
            </div>

            {/* Unified Flat Cockpit: Target Cap Stand Banner + 3 Key Metrics (All-Green Flat Design) */}
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-900/85 backdrop-blur-sm p-4 sm:p-5 space-y-3">
              {/* Target Cap Stand Emerald Banner */}
              <div className="rounded-xl border border-emerald-400/50 bg-emerald-800/80 p-4 flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/25 text-emerald-300 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider">
                      Target Klaim Cap Stand Resmi
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 text-[11px] font-semibold">
                      GMTI 2026
                    </span>
                  </div>
                  <p className="text-sm sm:text-base md:text-[16px] font-semibold text-emerald-50 leading-snug mt-1">
                    Jawab benar minimal <span className="text-white font-extrabold underline underline-offset-4 decoration-emerald-400">{minBenarCap} dari {totalSoal} soal</span> untuk langsung dapat Cap Stand!
                  </p>
                </div>
              </div>

              {/* 3 Parameter Metrics Badges (All Green Boxes) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-800/60 p-3 sm:p-3.5 text-center transition-colors hover:bg-emerald-700/60 hover:border-emerald-300/60">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-200 text-xs font-semibold uppercase mb-1">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Bank Soal</span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    34 <span className="text-xs sm:text-sm text-emerald-200/80 font-normal">Pengurus</span>
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-400/40 bg-emerald-800/60 p-3 sm:p-3.5 text-center transition-colors hover:bg-emerald-700/60 hover:border-emerald-300/60">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-200 text-xs font-semibold uppercase mb-1">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Waktu / Soal</span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-300 tracking-tight">
                    {timerDetik} <span className="text-xs sm:text-sm text-emerald-200/80 font-normal">Detik</span>
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-400/40 bg-emerald-800/60 p-3 sm:p-3.5 text-center transition-colors hover:bg-emerald-700/60 hover:border-emerald-300/60">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-200 text-xs font-semibold uppercase mb-1">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Syarat Cap</span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-300 tracking-tight">
                    &ge; {minBenarCap} <span className="text-xs sm:text-sm text-emerald-200/80 font-normal">Benar</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Input Form (Flat, Elegant, Rounded) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 sm:p-6 transition-colors">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <User className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Registrasi Peserta Stand
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase text-slate-300 mb-2 tracking-wide">
                    Nama Mahasiswa Baru / Tim:
                  </label>
                  <input
                    type="text"
                    value={namaPeserta}
                    onChange={(e) => {
                      setNamaPeserta(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ketik namamu di sini (contoh: Putu Arya)..."
                    maxLength={35}
                    autoFocus
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base sm:text-lg font-medium transition-all"
                  />
                  {error && (
                    <p className="text-rose-400 text-xs sm:text-sm mt-2 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isValidatingName}
                  className={`w-full py-4 sm:py-4.5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    isValidatingName
                      ? 'bg-slate-800 text-slate-400 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white shadow-sm'
                  }`}
                >
                  {isValidatingName ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Memeriksa Validasi Nama...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Tantangan Flashcard</span>
                      <ArrowRight className="w-5 h-5 stroke-[2.2]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Leaderboard Panel (Flat, Elegant, Modern) */}
          <div className="w-full lg:w-[360px] xl:w-[410px] 2xl:w-[450px] shrink-0 flex flex-col justify-center">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 sm:p-5 flex flex-col h-[520px] sm:h-[560px] lg:h-[600px] xl:h-[640px] transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                        Papan Skor
                      </h3>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Top Peserta Stand GMTI</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fetchLeaderboard()}
                  disabled={isLeaderboardLoading}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Segarkan data leaderboard"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isLeaderboardLoading ? 'animate-spin text-sky-400' : ''}`} />
                </button>
              </div>

              {/* Leaderboard List Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0 select-none">
                {isLeaderboardLoading && leaderboardEntries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs sm:text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    <span>Memuat Skor Stand...</span>
                  </div>
                ) : leaderboardEntries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs sm:text-sm p-4">
                    <Trophy className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                    <p className="font-semibold text-slate-300 text-sm sm:text-base">Belum Ada Data Skor</p>
                    <p className="text-xs mt-1 text-slate-500">Jadilah yang pertama menyelesaikan kuis!</p>
                  </div>
                ) : (
                  leaderboardEntries.map((entry, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <div
                        key={entry.id || idx}
                        className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                          isTop1
                            ? 'bg-slate-900/80 border-amber-500/35 shadow-sm'
                            : isTop2
                            ? 'bg-slate-900/60 border-slate-700/80'
                            : isTop3
                            ? 'bg-slate-900/40 border-amber-800/40'
                            : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          {/* Rank & Name */}
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <span
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                                isTop1
                                  ? 'bg-amber-500 text-slate-950'
                                  : isTop2
                                  ? 'bg-slate-300 text-slate-950'
                                  : isTop3
                                  ? 'bg-amber-800 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              #{idx + 1}
                            </span>

                            <div className="min-w-0">
                              <p className="font-semibold text-sm sm:text-base text-slate-100 truncate" title={entry.nama_peserta}>
                                {entry.nama_peserta}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                                <span>{entry.waktu_detik}s</span>
                              </div>
                            </div>
                          </div>

                          {/* Score & Stamp */}
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <span className="font-bold text-sm sm:text-base md:text-[16px] text-sky-400">
                              {entry.skor} PTS
                            </span>
                            <div className="mt-0.5 text-[10px] sm:text-[11px] font-semibold uppercase">
                              {entry.status_cap === 'lolos' ? (
                                <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">
                                  Cap: Lolos
                                </span>
                              ) : (
                                <span className="border border-amber-500/30 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md">
                                  Cap: Misi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{leaderboardEntries.length} Peserta</span>
                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 transition-colors cursor-pointer font-semibold text-xs sm:text-sm"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal (Housing all former header functions - Flat & Elegant) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Pengaturan Game &amp; Audio</h2>
                    <p className="text-xs text-slate-400">Stand Booth HIMA TI // GMTI 2026</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Pengaturan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-3 py-3.5">
                {/* 1. BGM Section */}
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Music className={`w-4 h-4 ${isMusicEnabled ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`} />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Musik Latar (BGM)</h4>
                        <p className="text-[11px] text-slate-400">Soundtrack arcade bebas copyright</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleMusic}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isMusicEnabled
                          ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {isMusicEnabled ? 'BGM ON' : 'BGM OFF'}
                    </button>
                  </div>

                  {/* Track Selector */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>TEMA SOUNDTRACK:</span>
                      <button
                        type="button"
                        onClick={() => bgm.cycleNextTrack()}
                        className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Disc className={`w-3.5 h-3.5 ${isMusicEnabled ? 'animate-spin' : ''}`} />
                        <span>Ganti Tema</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {BGM_TRACKS.map((t) => {
                        const isSelected = bgmTrackMode === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => bgm.setTrackMode(t.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{t.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 ml-1">{t.tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. SFX Section */}
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Efek Suara (SFX)</h4>
                      <p className="text-[11px] text-slate-400">Suara flip kartu, klik &amp; feedback jawaban</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isMuted) handleToggleSound();
                        setTimeout(() => soundFx.playCorrect(), 50);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Tes Suara Efek"
                    >
                      Tes
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleSound}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        !isMuted
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {!isMuted ? 'SFX ON' : 'SFX OFF'}
                    </button>
                  </div>
                </div>

                {/* 3. Auto-Switch Kartu 3D */}
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <RotateCw className="w-4 h-4 text-sky-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Auto-Switch Kartu 3D</h4>
                      <p className="text-[11px] text-slate-400">Balik sisi &amp; rotasi kartu preview otomatis</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutoSwitch((prev) => !prev)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isAutoSwitch
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {isAutoSwitch ? 'AUTO ON' : 'AUTO OFF'}
                  </button>
                </div>

                {/* 4. Papan Skor Modal Link */}
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Papan Skor Layar Penuh</h4>
                      <p className="text-[11px] text-slate-400">Buka tampilan riwayat lengkap seluruh peringkat</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenLeaderboard();
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer"
                  >
                    Buka Skor
                  </button>
                </div>

                {/* 5. Admin Dashboard Access */}
                <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-3.5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wide">Panel Admin Stand</h4>
                      <p className="text-[11px] text-slate-400">Kelola 34 data pengurus &amp; pengaturan sesi kuis</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenAdmin();
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Buka Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

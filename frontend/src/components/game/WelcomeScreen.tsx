import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Settings, Volume2, VolumeX, Shield, Users, Clock, AlertCircle, 
  ArrowRight, User, RefreshCw, Sparkles, Layers, RotateCw, Music, Disc, Sliders,
  X, Check
} from 'lucide-react';
import { soundFx, CARD_SOUND_STYLES, type CardSoundStyle } from '../../lib/sound';
import { bgm, BGM_TRACKS, type BgmTrackMode } from '../../lib/bgm';
import type { QuizConfig, LeaderboardEntry } from '../../types';
import { FlashcardCard } from './FlashcardCard';

interface WelcomeScreenProps {
  config: QuizConfig | null;
  onStart: (namaPeserta: string) => void;
  onOpenLeaderboard: () => void;
  onOpenAdmin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  config,
  onStart,
  onOpenLeaderboard,
  onOpenAdmin
}) => {
  const totalSoal = config?.totalSoal ?? 5;
  const timerDetik = config?.timerDetik ?? 10;
  const minBenarCap = config?.minBenarCap ?? 4;

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
      sub: `Minimal ${minBenarCap} Benar`,
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

  const [namaPeserta, setNamaPeserta] = useState('');
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [sfxVolume, setSfxVolume] = useState(Math.round(soundFx.getVolume() * 100));
  const [cardSoundStyle, setCardSoundStyle] = useState<CardSoundStyle>(soundFx.getCardSoundStyle());
  const [isMusicEnabled, setIsMusicEnabled] = useState(bgm.isMusicEnabled());
  const [bgmVolume, setBgmVolume] = useState(Math.round(bgm.getVolume() * 100));
  const [bgmThemeName, setBgmThemeName] = useState(bgm.getActiveThemeName());
  const [bgmTrackMode, setBgmTrackMode] = useState<BgmTrackMode>(bgm.getTrackMode());
  const [error, setError] = useState('');
  const [isValidatingName, setIsValidatingName] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Live Leaderboard Panel States
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setLeaderboardEntries(data.data || []);
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
    const unsubBgm = bgm.subscribe((enabled, track, themeName, vol) => {
      setIsMusicEnabled(enabled);
      setBgmTrackMode(track);
      setBgmThemeName(themeName);
      setBgmVolume(Math.round(vol * 100));
    });
    const unsubSfx = soundFx.subscribe((muted) => {
      setIsMuted(muted);
    });
    const unsubSfxVol = soundFx.subscribeVolume((vol) => {
      setSfxVolume(Math.round(vol * 100));
    });
    const unsubStyle = soundFx.subscribeCardStyle((style) => {
      setCardSoundStyle(style);
    });
    return () => {
      unsubBgm();
      unsubSfx();
      unsubSfxVol();
      unsubStyle();
    };
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

  const handleNext = (direction: 'left' | 'right' = 'left', isManual = false) => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    if (isManual) {
      soundFx.playCardHover(false);
    }
    setIsCardFlipped(false);

    const topCard = deck[0];
    const targetDeck = [deck[1], deck[2], deck[0]];

    // Phase 1: Kartu depan peel out ke samping di atas stack (zIndex 40)
    setTransition({
      swipingCard: topCard,
      direction,
      phase: 'out',
      targetDeck,
    });

    // Phase 2: Setelah membersihkan batas stack (280ms), kartu turun ke zIndex 5 di belakang stack lalu glide masuk ke slot belakang
    setTimeout(() => {
      setTransition({
        swipingCard: topCard,
        direction,
        phase: 'docking',
        targetDeck,
      });

      // Phase 3: Settle (320ms kemudian)
      setTimeout(() => {
        setDeck(targetDeck);
        setTransition(null);
        isSwipingRef.current = false;
      }, 320);
    }, 280);
  };

  const handlePrev = (direction: 'left' | 'right' = 'right', isManual = false) => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    if (isManual) {
      soundFx.playCardHover(false);
    }
    setIsCardFlipped(false);

    const bottomCard = deck[2];
    const targetDeck = [deck[2], deck[0], deck[1]];

    // Phase 1: Kartu belakang peel out ke samping di bawah stack (zIndex 5)
    setTransition({
      swipingCard: bottomCard,
      direction,
      phase: 'out',
      targetDeck,
    });

    // Phase 2: Kartu naik ke zIndex 40 di depan dan meluncur mulus ke posisi depan tengah
    setTimeout(() => {
      setTransition({
        swipingCard: bottomCard,
        direction,
        phase: 'docking',
        targetDeck,
      });

      // Phase 3: Settle
      setTimeout(() => {
        setDeck(targetDeck);
        setTransition(null);
        isSwipingRef.current = false;
      }, 320);
    }, 280);
  };

  const handleSelectCard = (targetIndex: number) => {
    if (isSwipingRef.current || deck[0] === targetIndex) return;
    const currentPos = deck.indexOf(targetIndex);
    if (currentPos === 1) {
      handleNext('left', true);
    } else if (currentPos === 2) {
      handlePrev('right', true);
    }
  };

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  // Smooth Auto-Play Slideshow: Rotasi kartu otomatis setiap 4.5 detik jika tidak di-hover dan kartu tidak sedang dibalik
  useEffect(() => {
    if (!isAutoSwitch || isHoveringStack || isCardFlipped || transition !== null) {
      return;
    }

    const timer = setTimeout(() => {
      handleNextRef.current('left', false);
    }, 4500);

    return () => clearTimeout(timer);
  }, [isAutoSwitch, isHoveringStack, isCardFlipped, transition]);

  const getCardMotion = (cardIdx: number) => {
    // Keadaan diam (Idle): Tumpukan kartu fanned out ke pojok kanan bawah dengan zIndex bertingkat
    if (!transition) {
      const pos = deck.indexOf(cardIdx); // 0: Front, 1: Middle, 2: Bottom
      if (pos === 0) {
        return {
          zIndex: 30,
          animate: {
            x: 0,
            y: 0,
            scale: 1.0,
            rotate: 0,
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
            rotate: 3,
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
          rotate: 5.5,
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
            zIndex: 40,
            animate: {
              x: direction === 'left' ? -360 : 360,
              y: -10,
              scale: 0.96,
              rotate: direction === 'left' ? -8 : 8,
              opacity: 0.98,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 260,
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
              rotate: 5.5,
              opacity: 0.82,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 240,
              damping: 22,
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
            rotate: 0,
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
          rotate: 3,
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
              x: direction === 'left' ? -360 : 360,
              y: 10,
              scale: 0.94,
              rotate: direction === 'left' ? -6 : 6,
              opacity: 0.95,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 260,
              damping: 24,
              mass: 0.8,
            },
          };
        } else {
          // phase === 'docking' -> naik ke atas deck (zIndex: 40) dan meluncur mulus ke posisi depan tengah
          return {
            zIndex: 40,
            animate: {
              x: 0,
              y: 0,
              scale: 1.0,
              rotate: 0,
              opacity: 1,
              filter: 'none',
            },
            transition: {
              type: 'spring' as const,
              stiffness: 260,
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
            rotate: 3,
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
          rotate: 5.5,
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

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleCycleCardSound = () => {
    const nextStyle = soundFx.cycleCardStyle();
    setCardSoundStyle(nextStyle);
    soundFx.playFlip(false);
  };

  const handleCycleTrack = () => {
    bgm.cycleNextTrack();
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
    <div className="w-full min-h-[100dvh] flex flex-col justify-center max-w-[1880px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 select-none relative overflow-visible bg-transparent text-[#f8fafc] transition-colors">
      {/* Top-Right Settings Toolbar (As in branch nvn) */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => {
            soundFx.playCardHover();
            setIsSettingsOpen(true);
          }}
          className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-[#0d1424] hover:bg-[#0c182c] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer group flex items-center gap-2 shadow-tactile-sm select-none"
          title="Buka Pengaturan Game & Audio"
        >
          <Settings className="w-4 h-4 text-[#64748b] group-hover:text-[#38bdf8] group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider hidden md:inline">
            Pengaturan
          </span>
        </button>
      </div>

      {/* Main Area: 3 SECTIONS SEJAJAR (Vertically centered, uncompressed full ratio) */}
      <main className="flex-1 min-h-0 py-1 sm:py-2 flex items-center justify-center w-full overflow-visible">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 overflow-visible">
          
          {/* ========================================================================= */}
          {/* SECTION 1 (KIRI): Real 3D Physical Card Deck Stack & Controls             */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[285px] xl:w-[315px] 2xl:w-[365px] shrink-0 flex flex-col items-center justify-center overflow-visible relative z-20">
            <div 
              className="relative w-full flex flex-col items-center select-none overflow-visible"
              onMouseEnter={() => setIsHoveringStack(true)}
              onMouseLeave={() => setIsHoveringStack(false)}
            >
              {/* Stack Stage Container (Preserving original exact uncompressed aspect ratio) */}
              <div className="relative w-full max-w-[250px] xs:max-w-[270px] sm:max-w-[290px] lg:max-w-[275px] xl:max-w-[305px] 2xl:max-w-[350px] mx-auto perspective-1200 flex flex-col items-center overflow-visible">
                <div className="relative w-full pb-9 pr-8 sm:pb-10 sm:pr-9 xl:pb-12 xl:pr-10 overflow-visible">
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
                      minBenarCap={minBenarCap}
                      currentNumber={1}
                      interactivePreview={false}
                    />
                  </div>

                  {/* 3 Real Persistent Cards */}
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
                        }}
                        animate={motionProps.animate}
                        transition={motionProps.transition}
                        onClick={() => {
                          if (transition) return;
                          if (isMid) handleNext('left', true);
                          else if (isBottom) handlePrev('right', true);
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
                          minBenarCap={minBenarCap}
                          currentNumber={1}
                          interactivePreview={isFront && transition === null}
                          isFlippedControlled={isFront && transition === null ? isCardFlipped : false}
                          onSwipeCard={isFront ? (dir) => handleNext(dir, true) : undefined}
                          onCardFlipped={isFront ? (flipped) => setIsCardFlipped(flipped) : undefined}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls & Auto-Switch Toolbar */}
              <div className="mt-2 sm:mt-2.5 w-full max-w-[250px] xs:max-w-[270px] sm:max-w-[290px] lg:max-w-[275px] xl:max-w-[305px] 2xl:max-w-[350px] flex flex-col items-center gap-1.5 sm:gap-2">
                {/* 3 Clickable Full-Width Segmented Tabs */}
                <div className="w-full grid grid-cols-3 gap-1 bg-[#0d1424] border border-[#1e2b46] p-1 shadow-tactile-sm">
                  {challengerCards.map((card) => {
                    const isActive = card.index === deck[0];
                    return (
                      <button
                        key={card.index}
                        type="button"
                        onClick={() => handleSelectCard(card.index)}
                        disabled={transition !== null}
                        className={`py-1.5 px-1 text-[9.5px] sm:text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isActive
                            ? 'bg-[#1e2b46] text-[#38bdf8] border border-[#38bdf8] shadow-tactile-sm'
                            : 'text-[#64748b] hover:text-[#cbd5e1] border border-transparent hover:bg-[#0c1322]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-[#38bdf8] animate-pulse' : 'bg-[#475569]'}`} />
                        <span className="truncate">{card.tab}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub Action Bar: Prev, Next, Auto, Flip State, and Sound Profile */}
                <div className="w-full flex items-center justify-between gap-1.5 px-0.5">
                  {/* Left: Previous & Next Arrow Nav */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePrev('right', true)}
                      disabled={transition !== null}
                      className="px-2.5 py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-white text-[11px] font-mono font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 shadow-tactile-sm"
                      title="Kartu Sebelumnya"
                    >
                      <span>&larr;</span>
                      <span className="hidden xs:inline">Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNext('left', true)}
                      disabled={transition !== null}
                      className="px-2.5 py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-white text-[11px] font-mono font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 shadow-tactile-sm"
                      title="Kartu Selanjutnya"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  {/* Right: Auto-Switch, Flip Toggle, and Quick SFX Cycler */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAutoSwitch((prev) => !prev)}
                      className={`px-2 py-1 text-[9px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-tactile-sm ${
                        isAutoSwitch 
                          ? 'border-[#10b981]/60 text-[#10b981] bg-[#052e16]/60' 
                          : 'border-[#1e2b46] text-[#64748b] bg-[#0d1424]'
                      }`}
                      title={isAutoSwitch ? 'Jeda Switch Otomatis' : 'Aktifkan Switch Otomatis'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAutoSwitch ? 'bg-[#10b981] animate-ping' : 'bg-[#475569]'}`} />
                      <span>AUTO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playFlip(false);
                        setIsCardFlipped((prev) => !prev);
                      }}
                      className={`px-2 py-1 border text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-tactile-sm ${
                        isCardFlipped 
                          ? 'border-[#38bdf8]/60 text-[#38bdf8] bg-[#0c1a2e]' 
                          : 'border-[#1e2b46] text-[#94a3b8] bg-[#080c14] hover:border-[#38bdf8] hover:text-white'
                      }`}
                      title="Klik untuk membalik kartu"
                    >
                      <RotateCw className="w-2.5 h-2.5 text-[#38bdf8]" />
                      <span>{isCardFlipped ? 'BACK' : 'FRONT'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCycleCardSound}
                      className="px-2 py-1 border border-[#1e2b46] text-[#38bdf8] bg-[#0d1424] hover:border-[#38bdf8] text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-tactile-sm"
                      title={`Karakter Suara Kartu: ${CARD_SOUND_STYLES.find(s => s.id === cardSoundStyle)?.name}. Klik untuk ganti variasi suara.`}
                    >
                      <Volume2 className="w-2.5 h-2.5 text-[#38bdf8]" />
                      <span>{cardSoundStyle.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2 (TENGAH): Hero Header, Cap Cockpit, & Registrasi Form           */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[340px] xl:w-[380px] 2xl:w-[440px] shrink-0 flex flex-col justify-center space-y-2 sm:space-y-2.5 xl:space-y-3">
            {/* Header Title Block (Elevated Typography & Cyberpunk Hierarchy) */}
            <div>
              <div className="inline-flex items-center gap-1.5 border border-[#38bdf8]/40 bg-[#0d1424] px-2.5 py-0.5 sm:py-1 text-[#38bdf8] text-[9px] sm:text-[9.5px] xl:text-[10px] font-mono mb-1 font-bold uppercase tracking-widest shadow-tactile-sm cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span>STAND RESMI HIMA TI // GMTI 2026</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-black tracking-tight text-[#f8fafc] leading-tight font-mono">
                FLASHCARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#818cf8]">PENGURUS</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-[#94a3b8] mt-0.5 sm:mt-1 leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
                Kenali seluruh <strong className="text-[#f8fafc] font-semibold">34 Pengurus HIMA TI 2026</strong> dan buktikan ketangkasanmu untuk klaim Cap Stand resmi di buku kendali GMTI-mu!
              </p>
            </div>

            {/* Target Cap Stand & Parameters Unified Cockpit */}
            <div className="bg-[#0d1424] border-2 border-[#10b981]/60 p-2.5 sm:p-3 xl:p-3.5 shadow-tactile-sm relative cursor-default space-y-2">
              <div className="absolute top-1 left-1 text-[8px] font-mono text-[#10b981]/70 font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-[#10b981]/70 font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#10b981]/70 font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#10b981]/70 font-bold pointer-events-none">+</div>

              {/* Target Banner Header */}
              <div className="flex items-center justify-between border-b border-[#10b981]/30 pb-1.5 sm:pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#10b981] text-[#080c14] flex items-center justify-center font-black shadow-sm">
                    <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#10b981] uppercase tracking-wider font-mono block">
                      MISI STAND: KLAIM CAP RESMI
                    </span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 bg-[#052e16] border border-[#10b981]/70 text-[#10b981] font-extrabold shadow-sm">
                  &ge; {minBenarCap} SOAL BENAR
                </span>
              </div>

              {/* 3 Inline Metrics */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center pt-0.5">
                <div className="bg-[#080c14] border border-[#1e2b46] p-1.5 sm:p-2 hover:border-[#38bdf8]/50 transition-colors shadow-sm">
                  <div className="text-[#38bdf8] flex justify-center mb-0.5 sm:mb-1">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <p className="text-[8px] sm:text-[8.5px] text-[#64748b] font-mono uppercase font-bold tracking-wider">Bank Soal</p>
                  <p className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-[#f8fafc] font-mono">34 Pengurus</p>
                </div>

                <div className="bg-[#080c14] border border-[#1e2b46] p-1.5 sm:p-2 hover:border-[#f59e0b]/50 transition-colors shadow-sm">
                  <div className="text-[#f59e0b] flex justify-center mb-0.5 sm:mb-1">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <p className="text-[8px] sm:text-[8.5px] text-[#64748b] font-mono uppercase font-bold tracking-wider">Waktu / Soal</p>
                  <p className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-[#f8fafc] font-mono">{timerDetik} Detik</p>
                </div>

                <div className="bg-[#080c14] border border-[#1e2b46] p-1.5 sm:p-2 hover:border-[#10b981]/50 transition-colors shadow-sm">
                  <div className="text-[#10b981] flex justify-center mb-0.5 sm:mb-1">
                    <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <p className="text-[8px] sm:text-[8.5px] text-[#64748b] font-mono uppercase font-bold tracking-wider">Target Cap</p>
                  <p className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-[#10b981] font-mono">{minBenarCap}/{totalSoal} Soal</p>
                </div>
              </div>
            </div>

            {/* Registration Input Form (Elevated High-Contrast HUD Form) */}
            <div className="bg-[#0d1424] border border-[#1e2b46] p-2.5 sm:p-3 xl:p-3.5 shadow-tactile-sm">
              <div className="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-[#1e2b46]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38bdf8]" />
                  <h3 className="text-[11px] sm:text-xs font-extrabold text-[#f8fafc] tracking-wider font-mono uppercase">
                    REGISTRASI PESERTA STAND
                  </h3>
                </div>
                <span className="text-[8.5px] sm:text-[9px] font-mono text-[#64748b] font-semibold">
                  [ STEP 01/02 ]
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[9.5px] sm:text-[10px] font-mono uppercase text-[#94a3b8] font-bold tracking-wider">
                      Nama Mahasiswa Baru / Tim:
                    </label>
                    <span className="text-[#64748b] text-[8.5px] sm:text-[9px] font-mono">Maks 35 Karakter</span>
                  </div>
                  <input
                    type="text"
                    value={namaPeserta}
                    onChange={(e) => {
                      setNamaPeserta(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Contoh: Putu Arya / Tim Turing"
                    maxLength={35}
                    autoFocus
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#080c14] border border-[#1e2b46] hover:border-[#334b75] text-[#f8fafc] placeholder-[#475569] focus:outline-none focus:border-[#38bdf8] text-xs sm:text-sm font-mono font-medium transition-all"
                  />
                  {error && (
                    <p className="text-[#f43f5e] text-[10px] sm:text-[10.5px] mt-1.5 flex items-center gap-1.5 font-mono font-bold bg-[#4c0519]/40 border border-[#f43f5e]/40 p-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#f43f5e]" />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isValidatingName}
                  className={`w-full py-2 sm:py-2.5 xl:py-3 font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 tracking-wider uppercase transition-all cursor-pointer ${
                    isValidatingName
                      ? 'bg-[#1e2b46] text-[#94a3b8] cursor-wait'
                      : 'bg-gradient-to-r from-[#0284c7] to-[#2563eb] hover:from-[#0369a1] hover:to-[#1d4ed8] text-white hover:shadow-tactile-blue active:scale-[0.99]'
                  }`}
                >
                  {isValidatingName ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MEMERIKSA VALIDASI NAMA...</span>
                    </>
                  ) : (
                    <>
                      <span>MULAI TANTANGAN SEKARANG</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3 (KANAN): Live Leaderboard Panel                                 */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[275px] xl:w-[300px] 2xl:w-[340px] shrink-0 flex flex-col justify-center">
            <div className="bg-[#0d1424] border border-[#1e2b46] p-2.5 sm:p-3 xl:p-3.5 flex flex-col h-[420px] sm:h-[450px] lg:h-[450px] xl:h-[480px] 2xl:h-[530px] max-h-[calc(100dvh-60px)] shadow-tactile-sm transition-colors relative">
              {/* Corner Accents */}
              <div className="absolute top-1 left-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

              {/* Leaderboard Panel Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e2b46]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center font-bold">
                    <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-[#f8fafc] font-mono uppercase tracking-wider">
                        PAPAN SKOR
                      </h3>
                      <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-[#10b981] bg-[#052e16] border border-[#10b981]/40 px-1 py-0.2 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                        LIVE
                      </span>
                    </div>
                    <p className="text-[9.5px] text-[#64748b] font-mono">Top Peserta Stand GMTI</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fetchLeaderboard()}
                  disabled={isLeaderboardLoading}
                  className="p-1 bg-[#080c14] border border-[#1e2b46] hover:border-[#38bdf8] text-[#64748b] hover:text-[#38bdf8] transition-all cursor-pointer"
                  title="Segarkan data leaderboard"
                >
                  <RefreshCw className={`w-3 h-3 ${isLeaderboardLoading ? 'animate-spin text-[#38bdf8]' : ''}`} />
                </button>
              </div>

              {/* Scrollable Leaderboard List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-0 select-none">
                {isLeaderboardLoading && leaderboardEntries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#64748b] text-[11px] font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-[#38bdf8]" />
                    <span>Memuat Skor Stand...</span>
                  </div>
                ) : leaderboardEntries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#64748b] text-[11px] p-3 font-mono">
                    <Trophy className="w-6 h-6 mx-auto mb-1.5 text-[#475569]/60" />
                    <p className="font-bold text-[#94a3b8]">Belum Ada Data Skor</p>
                    <p className="text-[9.5px] mt-0.5 text-[#475569]">Jadilah yang pertama menyelesaikan kuis!</p>
                  </div>
                ) : (
                  leaderboardEntries.map((entry, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <div
                        key={entry.id || idx}
                        className={`p-1.5 sm:p-2 border transition-all ${
                          isTop1
                            ? 'bg-[#1f1606]/80 border-[#f59e0b] shadow-tactile-sm'
                            : isTop2
                            ? 'bg-[#0a192f]/70 border-[#2563eb]'
                            : isTop3
                            ? 'bg-[#0a192f]/50 border-[#38bdf8]/60'
                            : 'bg-[#080c14] border-[#1e2b46] hover:border-[#273b5e]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          {/* Rank & Name */}
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <span
                              className={`w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center font-mono font-bold text-[10.5px] shrink-0 ${
                                isTop1
                                  ? 'bg-[#f59e0b] text-[#080c14]'
                                  : isTop2
                                  ? 'bg-[#2563eb] text-white'
                                  : isTop3
                                  ? 'bg-[#38bdf8] text-[#080c14]'
                                  : 'bg-[#1e2b46] text-[#94a3b8]'
                              }`}
                            >
                              #{idx + 1}
                            </span>

                            <div className="min-w-0">
                              <p className="font-bold text-[11px] sm:text-xs text-[#f8fafc] truncate" title={entry.nama_peserta}>
                                {entry.nama_peserta}
                              </p>
                              <div className="flex items-center gap-1 text-[9px] text-[#64748b] font-mono">
                                <Clock className="w-2.5 h-2.5 text-[#38bdf8]" />
                                <span>{entry.waktu_detik}s</span>
                              </div>
                            </div>
                          </div>

                          {/* Score & Cap Status */}
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <span className="font-mono font-bold text-[11px] sm:text-xs text-[#38bdf8]">
                              {entry.skor} PTS
                            </span>
                            <div className="mt-0.5 text-[8.5px] font-mono font-bold uppercase">
                              {entry.status_cap === 'lolos' ? (
                                <span className="border border-[#10b981]/40 bg-[#052e16]/80 text-[#10b981] px-1 py-0.2 rounded">
                                  Cap: Lolos
                                </span>
                              ) : (
                                <span className="border border-[#f59e0b]/40 bg-[#1f1606]/80 text-[#f59e0b] px-1 py-0.2 rounded">
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

              {/* Leaderboard Panel Footer */}
              <div className="pt-2 mt-1.5 border-t border-[#1e2b46] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                <span>{leaderboardEntries.length} Peserta</span>
                <button
                  type="button"
                  onClick={onOpenLeaderboard}
                  className="text-[#38bdf8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold text-[10.5px]"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Settings Modal (Housing audio, tracks, SFX profiles, auto-switch & links) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-3xl xl:max-w-4xl bg-[#080c14] border-2 border-[#1e2b46] p-4 sm:p-5 md:p-6 shadow-tactile flex flex-col max-h-[92vh] text-[#f8fafc] relative select-none"
            >
              {/* Corner Crosshairs */}
              <div className="absolute top-1.5 left-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

              {/* Modal Top Header Bar with Prominent Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1e2b46] shrink-0">
                {/* Title & Badge */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#0d1424] border border-[#1e2b46] text-[#38bdf8] flex items-center justify-center font-bold shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold uppercase font-mono tracking-wider text-[#f8fafc]">
                      PENGATURAN GAME &amp; AUDIO
                    </h2>
                    <p className="text-[10px] sm:text-[10.5px] text-[#64748b] font-mono">
                      STAND BOOTH HIMA TI // GMTI 2026
                    </p>
                  </div>
                </div>

                {/* Right Quick Actions: Admin & Close Button */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenAdmin();
                    }}
                    className="px-2.5 py-1.5 bg-[#0d1424] hover:bg-[#0c1a30] border border-[#2563eb] hover:border-[#38bdf8] text-[#38bdf8] hover:text-white text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-tactile-sm"
                    title="Buka Panel Admin Stand"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>PANEL ADMIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 bg-[#0d1424] border border-[#1e2b46] text-[#94a3b8] hover:text-white hover:border-[#38bdf8] transition-colors cursor-pointer"
                    title="Tutup Pengaturan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Two-Column Responsive Grid on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 py-3 font-mono overflow-y-auto flex-1 pr-0.5">
                {/* ========================================================= */}
                {/* KOLOM 1: MUSIK LATAR (BGM)                                */}
                {/* ========================================================= */}
                <div className="bg-[#0d1424] border border-[#1e2b46] p-3 sm:p-3.5 space-y-3 flex flex-col justify-between">
                  <div>
                    {/* BGM Toggle Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2b46]/60">
                      <div className="flex items-center gap-2">
                        <Music className={`w-4 h-4 ${isMusicEnabled ? 'text-[#38bdf8] animate-pulse' : 'text-[#64748b]'}`} />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Musik Latar (BGM)</h4>
                          <p className="text-[10px] text-[#64748b]">Arcade dinamis &amp; DJ Crossfade</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleMusic}
                        className={`px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
                          isMusicEnabled
                            ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8] shadow-tactile-sm'
                            : 'bg-[#080c14] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8]'
                        }`}
                      >
                        {isMusicEnabled ? 'BGM ON' : 'BGM OFF'}
                      </button>
                    </div>

                    {/* BGM Volume Slider */}
                    <div className="space-y-1 pt-2">
                      <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                          <span>Volume Musik:</span>
                        </span>
                        <span className="font-bold text-[#38bdf8]">{bgmVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={bgmVolume}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setBgmVolume(val);
                          bgm.setVolume(val / 100);
                          if (val > 0 && !isMusicEnabled) {
                            bgm.toggle();
                            setIsMusicEnabled(true);
                          }
                        }}
                        className="w-full accent-[#38bdf8] cursor-pointer h-1.5 bg-[#1e2b46]"
                      />
                    </div>

                    {/* Soundtrack Tracks Grid */}
                    <div className="pt-2.5 border-t border-[#1e2b46]/60 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                        <span className="uppercase font-bold">PILIHAN TRACK:</span>
                        <button
                          type="button"
                          onClick={handleCycleTrack}
                          className="text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer font-semibold text-[10.5px]"
                        >
                          <Disc className={`w-3 h-3 ${isMusicEnabled ? 'animate-spin' : ''}`} />
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
                              className={`p-2 text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8] font-bold shadow-tactile-sm'
                                  : 'bg-[#080c14] border-[#1e2b46] text-[#94a3b8] hover:border-[#38bdf8]/50 hover:text-white'
                              }`}
                            >
                              <span className="truncate text-[11px]">{t.name}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-[#1e2b46] text-[#38bdf8] ml-1 font-mono shrink-0">
                                {t.tag}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* KOLOM 2: EFEK SUARA (SFX) & FITUR STAND                   */}
                {/* ========================================================= */}
                <div className="space-y-3 flex flex-col justify-between">
                  {/* SFX Section */}
                  <div className="bg-[#0d1424] border border-[#1e2b46] p-3 sm:p-3.5 space-y-3 flex-1">
                    {/* SFX Header & Toggle */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2b46]/60">
                      <div className="flex items-center gap-2">
                        {isMuted ? <VolumeX className="w-4 h-4 text-[#f43f5e]" /> : <Volume2 className="w-4 h-4 text-[#10b981]" />}
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Efek Suara (SFX)</h4>
                          <p className="text-[10px] text-[#64748b]">Flip kartu &amp; feedback kuis</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isMuted) handleToggleSound();
                            setTimeout(() => soundFx.playCorrect(), 50);
                          }}
                          className="px-2 py-1 text-xs bg-[#080c14] border border-[#1e2b46] hover:border-[#10b981] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
                          title="Tes Suara Efek"
                        >
                          Tes
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleSound}
                          className={`px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
                            !isMuted
                              ? 'bg-[#062c19] border-[#10b981] text-[#10b981] shadow-tactile-sm'
                              : 'bg-[#080c14] border-[#1e2b46] text-[#64748b]'
                          }`}
                        >
                          {!isMuted ? 'SFX ON' : 'SFX OFF'}
                        </button>
                      </div>
                    </div>

                    {/* SFX Volume Slider */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
                          <span>Volume SFX:</span>
                        </span>
                        <span className="font-bold text-[#10b981]">{sfxVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sfxVolume}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setSfxVolume(val);
                          soundFx.setVolume(val / 100);
                          if (val > 0 && isMuted) {
                            soundFx.setMuted(false);
                            setIsMuted(false);
                          }
                        }}
                        className="w-full accent-[#10b981] cursor-pointer h-1.5 bg-[#1e2b46]"
                      />
                    </div>

                    {/* SFX Sound Profile Selector */}
                    <div className="pt-2 border-t border-[#1e2b46]/60 space-y-1.5">
                      <span className="text-[10.5px] text-[#94a3b8] uppercase font-bold">Karakter Suara Kartu:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {CARD_SOUND_STYLES.map((style) => {
                          const isSelected = cardSoundStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => {
                                soundFx.setCardSoundStyle(style.id);
                                setCardSoundStyle(style.id);
                                soundFx.playFlip(false);
                              }}
                              className={`p-1.5 text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#062c19] border-[#10b981] text-[#10b981] font-bold shadow-tactile-sm'
                                  : 'bg-[#080c14] border-[#1e2b46] text-[#94a3b8] hover:border-[#10b981]/40 hover:text-white'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold">{style.name}</p>
                                <p className="text-[9px] text-[#64748b] truncate">{style.desc}</p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Auto-Switch Kartu 3D Card */}
                  <div className="bg-[#0d1424] border border-[#1e2b46] p-2.5 sm:p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-[#38bdf8]" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Auto-Switch Kartu 3D</h4>
                        <p className="text-[10px] text-[#64748b]">Rotasi &amp; bolak-balik otomatis</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutoSwitch((prev) => !prev)}
                      className={`px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
                        isAutoSwitch
                          ? 'bg-[#062c19] border-[#10b981] text-[#10b981] shadow-tactile-sm'
                          : 'bg-[#080c14] border-[#1e2b46] text-[#64748b]'
                      }`}
                    >
                      {isAutoSwitch ? 'AUTO ON' : 'AUTO OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


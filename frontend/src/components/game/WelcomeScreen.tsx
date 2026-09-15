import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, Volume2, VolumeX, Shield, Users, Clock, AlertCircle, ArrowRight, User, RefreshCw, Sparkles, Layers, RotateCw, Music, Disc, Sliders } from 'lucide-react';
import { soundFx, CARD_SOUND_STYLES, type CardSoundStyle } from '../../lib/sound';
import { bgm, type BgmTrackMode } from '../../lib/bgm';
import type { QuizConfig } from '../../types';
import { FlashcardCard } from './FlashcardCard';
import { AudioMixerModal } from './AudioMixerModal';

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
  const [cardSoundStyle, setCardSoundStyle] = useState<CardSoundStyle>(soundFx.getCardSoundStyle());
  const [isMusicEnabled, setIsMusicEnabled] = useState(bgm.isMusicEnabled());
  const [bgmThemeName, setBgmThemeName] = useState(bgm.getActiveThemeName());
  const [bgmTrackMode, setBgmTrackMode] = useState<BgmTrackMode>(bgm.getTrackMode());
  const [error, setError] = useState('');
  const [isValidatingName, setIsValidatingName] = useState(false);
  const [showAudioMixer, setShowAudioMixer] = useState(false);

  useEffect(() => {
    if (bgm.isMusicEnabled() && !bgm.isMusicPlaying()) {
      bgm.start();
    }
    const unsubBgm = bgm.subscribe((enabled, track, themeName) => {
      setIsMusicEnabled(enabled);
      setBgmTrackMode(track);
      setBgmThemeName(themeName);
    });
    const unsubSfx = soundFx.subscribe((muted) => {
      setIsMuted(muted);
    });
    const unsubStyle = soundFx.subscribeCardStyle((style) => {
      setCardSoundStyle(style);
    });
    return () => {
      unsubBgm();
      unsubSfx();
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

    const topCard = deck[0];
    const targetDeck = [deck[1], deck[2], deck[0]];

    // Phase 1: Kartu depan peel out ke samping di atas stack (zIndex 35)
    setTransition({
      swipingCard: topCard,
      direction,
      phase: 'out',
      targetDeck,
    });

    // Phase 2: Setelah membersihkan batas stack (~240ms), kartu turun ke zIndex 5 di belakang stack lalu glide masuk ke slot pojok kanan bawah
    setTimeout(() => {
      setIsCardFlipped(false);
      setTransition({
        swipingCard: topCard,
        direction,
        phase: 'docking',
        targetDeck,
      });

      // Phase 3: Settle (~280ms kemudian)
      setTimeout(() => {
        setDeck(targetDeck);
        setTransition(null);
        isSwipingRef.current = false;
      }, 280);
    }, 240);
  };

  const handlePrev = (direction: 'left' | 'right' = 'right', isManual = false) => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    if (isManual) {
      soundFx.playCardHover(false);
    }

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

      // Phase 3: Settle
      setTimeout(() => {
        setDeck(targetDeck);
        setTransition(null);
        isSwipingRef.current = false;
      }, 280);
    }, 240);
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
  }, [handleNext]);

  // Auto-switch: otomatis balik kartu ke sisi belakang, lalu geser ke kartu berikutnya!
  useEffect(() => {
    if (!isAutoSwitch || isHoveringStack || transition !== null) return;

    const timer = setTimeout(() => {
      if (!isCardFlipped) {
        // Step 1: Otomatis membalikkan kartu ke sisi belakang (menampilkan briefing / rules)
        // Gunakan suara sangat lembut (isAuto = true) agar standby booth nyaman & tidak risih
        soundFx.playFlip(true);
        setIsCardFlipped(true);
      } else {
        // Step 2: Otomatis geser ke kartu berikutnya di tumpukan 3D
        handleNextRef.current('left', false);
      }
    }, 4500);

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
              x: direction === 'left' ? -250 : 250,
              y: -8,
              scale: 0.96,
              rotateZ: direction === 'left' ? -8 : 8,
              rotateY: direction === 'left' ? 8 : -8,
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
              rotateZ: 5.5,
              rotateY: 0,
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
              x: direction === 'left' ? -250 : 250,
              y: 10,
              scale: 0.94,
              rotateZ: direction === 'left' ? -6 : 6,
              rotateY: direction === 'left' ? 6 : -6,
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
      if (data.exists) {
        setError(`Nama "${cleanName}" sudah pernah main di peringkat #${data.rank} (Skor: ${data.skor}). Gunakan nama lain / tambahkan kode pembeda!`);
        soundFx.playWrong();
        setIsValidatingName(false);
        return;
      }
      onStart(cleanName);
    } catch {
      onStart(cleanName);
    } finally {
      setIsValidatingName(false);
    }
  };

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between max-w-7xl mx-auto p-2 sm:p-3 md:p-4 overflow-hidden select-none">
      {/* Top Technical Status Bar */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b-2 border-[#1e2b46] shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#38bdf8] shrink-0 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          <div className="truncate min-w-0">
            <h1 className="font-mono text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>HIMA TI // STAND-PASS</span>
              <span className="text-[10px] sm:text-xs text-[#38bdf8] hidden xs:inline font-normal">GMTI 2026</span>
            </h1>
          </div>
        </div>

        {/* Global Action Bar with Music & SFX Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-y-[-1px] text-[#94a3b8] hover:text-[#38bdf8] text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-tactile-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="hidden xs:inline">PAPAN SKOR</span>
          </button>

          {/* Dedicated Music Track Selector Button */}
          <button
            type="button"
            onClick={handleCycleTrack}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-y-[-1px] text-[#94a3b8] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
            title={`Musik Latar: ${bgmThemeName} (${bgm.getCurrentTrackInfo().tag}). Klik untuk ganti musik.`}
          >
            <Disc className={`w-3.5 h-3.5 text-[#38bdf8] ${isMusicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#38bdf8] hidden sm:inline">
              {bgm.getCurrentTrackInfo().tag}
            </span>
          </button>

          {/* Dedicated Quizizz-style BGM Toggle - Icon Only on Mobile */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 border transition-all cursor-pointer flex items-center justify-center gap-1 ${
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
            className={`p-1.5 sm:px-2.5 sm:py-1.5 border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              isMuted
                ? 'bg-[#0d1424] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8] hover:border-[#273b5e]'
                : 'bg-[#0c182c] border-[#10b981] text-[#10b981] hover:bg-[#112544] hover:shadow-tactile-sm'
            }`}
            title={isMuted ? 'Efek Suara (SFX): Bisu - Klik untuk Nyalakan' : `Efek Suara (SFX): Aktif [${cardSoundStyle.toUpperCase()}] - Klik untuk Bisukan`}
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
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-y-[-1px] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title="Buka Mixer Volume Audio (Atur Besar/Kecil Suara BGM & SFX)"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8]" />
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold hidden sm:inline">
              VOL
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-y-[-1px] text-[#94a3b8] hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Pengaturan Admin Stand"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* Main Hero & Console Area */}
      <main className="flex-1 min-h-0 py-3 sm:py-4 md:py-4 flex items-center justify-center">
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 lg:gap-8 items-center">
          {/* Left Column: Real 3D Physical Card Deck Stack with Dynamic Layers & Gesture Swiping */}
          <div className="md:col-span-5 flex flex-col items-center justify-center w-full">
            <div 
              className="relative w-full flex flex-col items-center select-none"
              onMouseEnter={() => setIsHoveringStack(true)}
              onMouseLeave={() => setIsHoveringStack(false)}
            >
              {/* Stack Stage Container */}
              <div className="relative w-full max-w-[285px] xs:max-w-[310px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[375px] mx-auto perspective-1200 flex flex-col items-center">
                <div className="relative w-full">
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
                        }}
                        animate={motionProps.animate}
                        transition={motionProps.transition}
                        onClick={() => {
                          if (transition) return;
                          if (isMid) handleNext('left', true);
                          else if (isBottom) handlePrev('right', true);
                        }}
                        className={`absolute inset-0 w-full ${!isFront ? 'cursor-pointer pointer-events-auto' : ''}`}
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
                          onSwipeCard={isFront ? (dir) => handleNext(dir, true) : undefined}
                          onCardFlipped={isFront ? (flipped) => setIsCardFlipped(flipped) : undefined}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls & Auto-Switch Toolbar */}
              <div className="mt-4 sm:mt-6 w-full max-w-[285px] xs:max-w-[310px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[375px] flex flex-col items-center gap-2">
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
                        className={`py-1.5 px-1.5 text-[10px] sm:text-[10.5px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-[#1e2b46] text-[#38bdf8] border border-[#38bdf8] shadow-tactile-sm hover:bg-[#253659]'
                            : 'text-[#64748b] hover:text-[#cbd5e1] border border-transparent hover:border-[#1e2b46] hover:bg-[#0c1322]'
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
                      className="px-2.5 py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-x-[-1px] text-[#94a3b8] hover:text-white text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
                      title="Kartu Sebelumnya"
                    >
                      <span>&larr;</span>
                      <span className="text-[10px] hidden xs:inline">PREV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNext('left', true)}
                      disabled={transition !== null}
                      className="px-2.5 py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] hover:translate-x-[1px] text-[#94a3b8] hover:text-white text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
                      title="Kartu Selanjutnya"
                    >
                      <span className="text-[10px] hidden xs:inline">NEXT</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  {/* Right: Auto-Switch, Flip Toggle, and Sound Style Switcher */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAutoSwitch((prev) => !prev)}
                      className={`px-2 py-1 text-[9.5px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 hover:translate-y-[-1px] ${
                        isAutoSwitch 
                          ? 'border-[#10b981]/60 text-[#10b981] bg-[#052e16]/60 hover:bg-[#052e16]' 
                          : 'border-[#1e2b46] text-[#64748b] bg-[#0d1424] hover:text-[#94a3b8] hover:border-[#2a3c5a]'
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
                      className={`px-2 py-1 border text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer hover:translate-y-[-1px] ${
                        isCardFlipped 
                          ? 'border-[#38bdf8]/60 text-[#38bdf8] bg-[#0c1a2e]' 
                          : 'border-[#1e2b46] text-[#94a3b8] bg-[#080c14] hover:border-[#38bdf8] hover:text-white'
                      }`}
                      title="Klik untuk membalik kartu (Manual)"
                    >
                      <RotateCw className="w-2.5 h-2.5 text-[#38bdf8]" />
                      <span>{isCardFlipped ? 'BELAKANG' : 'DEPAN'}</span>
                    </button>

                    {/* Quick Sound Profile Cycler */}
                    <button
                      type="button"
                      onClick={handleCycleCardSound}
                      className="px-2 py-1 border border-[#1e2b46] text-[#38bdf8] bg-[#0d1424] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer hover:translate-y-[-1px]"
                      title={`Karakter Suara Kartu: ${CARD_SOUND_STYLES.find(s => s.id === cardSoundStyle)?.name}. Klik untuk ganti variasi suara.`}
                    >
                      <Volume2 className="w-2.5 h-2.5 text-[#38bdf8]" />
                      <span className="hidden xxs:inline">{cardSoundStyle.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                {/* Micro Hint */}
                <div className="text-[9px] font-mono text-[#64748b] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#38bdf8]" />
                  <span>Klik atau drag kartu untuk membalik &amp; melihat detail info</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Cap Target & Player Input (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-3 md:space-y-4">
            {/* Header Title Block */}
            <div>
              <div className="inline-block border border-[#273b5e] bg-[#0d1424] px-2.5 py-0.5 text-[#38bdf8] text-[11px] font-mono mb-2 font-bold uppercase tracking-wider transition-all duration-200 hover:border-[#38bdf8] hover:bg-[#0f1d38] hover:shadow-tactile-sm cursor-default">
                STAND HIMPUNAN MAHASISWA TEKNOLOGI INFORMASI
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8fafc] leading-tight">
                FLASHCARD <span className="text-[#2563eb]">PENGURUS</span>
              </h1>
              <p className="text-xs md:text-sm text-[#94a3b8] mt-1 leading-relaxed">
                Uji pengetahuanmu mengenali wajah dan amanah 34 pengurus HIMA TI masa bakti 2026. Raih cap stempel resmi untuk buku kendali GMTI-mu!
              </p>
            </div>

            {/* Target Cap Stand Box with Interactive Hover */}
            <div className="group bg-[#0d1424] border-2 border-[#10b981] p-3.5 shadow-tactile relative transition-all duration-200 hover:border-[#34d399] hover:shadow-tactile-emerald hover:translate-y-[-2px] cursor-default">
              <div className="absolute top-1 left-1 text-[8px] font-mono text-[#059669] group-hover:text-[#34d399] transition-colors font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-[#059669] group-hover:text-[#34d399] transition-colors font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#059669] group-hover:text-[#34d399] transition-colors font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#059669] group-hover:text-[#34d399] transition-colors font-bold pointer-events-none">+</div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#10b981] text-[#080c14] flex items-center justify-center shrink-0 font-bold transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#34d399]">
                  <Shield className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#10b981] group-hover:text-[#34d399] transition-colors uppercase tracking-wider font-mono">
                    TARGET: KLAIM CAP STAND RESMI HIMA TI
                  </h4>
                  <p className="text-xs text-[#f8fafc] mt-0.5 leading-snug">
                    Jawab benar <strong>minimal {minBenarCap} dari {totalSoal} soal</strong> (maksimal salah 1) untuk langsung memperoleh <strong>Cap Stand</strong> di buku GMTI.
                  </p>
                  <p className="text-[10px] text-[#f59e0b] mt-1 font-mono">
                    *Jika salah 2 atau lebih, cap tetap bisa diperoleh melalui misi follow IG dan sapa pengurus.
                  </p>
                </div>
              </div>
            </div>

            {/* Parameter Badges with Tactile Hover */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="group bg-[#0d1424] border border-[#1e2b46] p-2 shadow-tactile-sm transition-all duration-200 hover:border-[#38bdf8] hover:bg-[#0f1d38] hover:translate-y-[-2px] hover:shadow-tactile-blue cursor-default">
                <div className="text-[#64748b] group-hover:text-[#38bdf8] transition-colors duration-200 flex justify-center mb-0.5">
                  <Users className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <p className="text-[9px] text-[#64748b] group-hover:text-[#94a3b8] transition-colors font-mono uppercase">Bank Soal</p>
                <p className="text-xs font-bold text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors font-mono">34 Pengurus</p>
              </div>

              <div className="group bg-[#0d1424] border border-[#1e2b46] p-2 shadow-tactile-sm transition-all duration-200 hover:border-[#f59e0b] hover:bg-[#1a150b] hover:translate-y-[-2px] hover:shadow-tactile-amber cursor-default">
                <div className="text-[#64748b] group-hover:text-[#f59e0b] transition-colors duration-200 flex justify-center mb-0.5">
                  <Clock className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <p className="text-[9px] text-[#64748b] group-hover:text-[#94a3b8] transition-colors font-mono uppercase">Waktu / Soal</p>
                <p className="text-xs font-bold text-[#f8fafc] group-hover:text-[#f59e0b] transition-colors font-mono">{timerDetik} Detik</p>
              </div>

              <div className="group bg-[#0d1424] border border-[#1e2b46] p-2 shadow-tactile-sm transition-all duration-200 hover:border-[#10b981] hover:bg-[#091f16] hover:translate-y-[-2px] hover:shadow-tactile-emerald cursor-default">
                <div className="text-[#10b981] group-hover:text-[#34d399] transition-colors duration-200 flex justify-center mb-0.5">
                  <Layers className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <p className="text-[9px] text-[#64748b] group-hover:text-[#94a3b8] transition-colors font-mono uppercase">Syarat Cap</p>
                <p className="text-xs font-bold text-[#10b981] group-hover:text-[#34d399] transition-colors font-mono">&ge; {minBenarCap} Benar</p>
              </div>
            </div>

            {/* Registration Input Form */}
            <div className="bg-[#0d1424] border-2 border-[#1e2b46] hover:border-[#2a3c5a] p-4 shadow-tactile relative transition-colors duration-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e2b46]">
                <User className="w-4 h-4 text-[#2563eb]" />
                <h3 className="text-sm font-bold text-[#f8fafc] tracking-tight">
                  Registrasi Peserta Stand
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#94a3b8] font-bold mb-1.5 tracking-wider">
                    Nama Mahasiswa Baru / Nama Tim:
                  </label>
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
                    className="w-full px-3.5 py-2.5 bg-[#080c14] border-2 border-[#1e2b46] hover:border-[#334b75] hover:bg-[#0a0f1c] text-[#f8fafc] placeholder-[#475569] focus:outline-none focus:border-[#2563eb] focus:bg-[#091020] text-sm font-medium transition-all"
                  />
                  {error && (
                    <p className="text-[#f43f5e] text-xs mt-1.5 flex items-center gap-1.5 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isValidatingName}
                  className={`w-full py-3.5 font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-tactile transition-all cursor-pointer ${
                    isValidatingName
                      ? 'bg-[#1e2b46] text-[#94a3b8] cursor-wait'
                      : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                  }`}
                >
                  {isValidatingName ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>MEMERIKSA VALIDASI NAMA...</span>
                    </>
                  ) : (
                    <>
                      <span>MULAI TANTANGAN FLASHCARD</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="pt-2 border-t-2 border-[#1c2b46] flex items-center justify-between text-[11px] font-mono text-[#64748b] shrink-0">
        <span>HIMA TI // GEMA MAHASISWA TEKNOLOGI INFORMASI 2026</span>
        <span>STAND BOOTH HIMA TI</span>
      </footer>

      {/* Audio Mixer Modal */}
      <AudioMixerModal isOpen={showAudioMixer} onClose={() => setShowAudioMixer(false)} />
    </div>
  );
};

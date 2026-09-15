import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Settings, Volume2, VolumeX, Shield, Users, Clock, AlertCircle, 
  ArrowRight, User, RefreshCw, Sparkles, Layers, RotateCw, Music, Disc, Sliders 
} from 'lucide-react';
import { soundFx, CARD_SOUND_STYLES, type CardSoundStyle } from '../../lib/sound';
import { bgm, type BgmTrackMode } from '../../lib/bgm';
import type { QuizConfig, LeaderboardEntry } from '../../types';
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
    // Keadaan diam (Idle): Tumpukan kartu fisik fanned out ke pojok kanan bawah dengan pencahayaan bertingkat
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
            x: 16,
            y: 18,
            scale: 0.94,
            rotateZ: 2.5,
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
          x: 30,
          y: 34,
          scale: 0.88,
          rotateZ: 4.5,
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
              x: direction === 'left' ? -210 : 210,
              y: -6,
              scale: 0.96,
              rotateZ: direction === 'left' ? -7 : 7,
              rotateY: direction === 'left' ? 7 : -7,
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
              x: 30,
              y: 34,
              scale: 0.88,
              rotateZ: 4.5,
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
          x: 16,
          y: 18,
          scale: 0.94,
          rotateZ: 2.5,
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
              x: direction === 'left' ? -210 : 210,
              y: 8,
              scale: 0.94,
              rotateZ: direction === 'left' ? -5 : 5,
              rotateY: direction === 'left' ? 5 : -5,
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
            x: 16,
            y: 18,
            scale: 0.94,
            rotateZ: 2.5,
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
          x: 30,
          y: 34,
          scale: 0.88,
          rotateZ: 4.5,
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
    <div className="w-full min-h-[100dvh] flex flex-col justify-between max-w-[1720px] mx-auto px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 select-none relative overflow-x-hidden text-[#f8fafc]">
      {/* Sleek, Compact Top Status Bar (Adapted from nvn: minimal vertical consumption) */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b border-[#1e2b46]/70 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-2.5 h-2.5 bg-[#38bdf8] shrink-0 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          <div className="truncate min-w-0">
            <h1 className="font-mono text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>HIMA TI // STAND-PASS</span>
              <span className="text-[10px] text-[#38bdf8] hidden xs:inline font-normal px-1.5 py-0.2 bg-[#0c1a2e] border border-[#38bdf8]/30 rounded">
                GMTI 2026
              </span>
            </h1>
          </div>
        </div>

        {/* Global Action Bar with Music, SFX, Leaderboard & Admin Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {/* Full Leaderboard Modal Button */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="px-2 py-1 sm:px-2.5 sm:py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-[#38bdf8] text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-tactile-sm"
            title="Buka Papan Skor Lengkap"
          >
            <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="hidden md:inline">PAPAN SKOR</span>
          </button>

          {/* Dedicated Music Track Selector Button */}
          <button
            type="button"
            onClick={handleCycleTrack}
            className="px-2 py-1 sm:px-2.5 sm:py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
            title={`Musik Latar: ${bgmThemeName} (${bgm.getCurrentTrackInfo().tag}). Klik untuk ganti musik.`}
          >
            <Disc className={`w-3.5 h-3.5 text-[#38bdf8] ${isMusicEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[10px] font-mono font-bold text-[#38bdf8] hidden sm:inline">
              {bgm.getCurrentTrackInfo().tag}
            </span>
          </button>

          {/* BGM Toggle */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`px-2 py-1 sm:px-2.5 sm:py-1 border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              isMusicEnabled
                ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8] hover:bg-[#112544]'
                : 'bg-[#0d1424] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8]'
            }`}
            title={isMusicEnabled ? 'Musik Latar: ON - Klik untuk Matikan' : 'Musik Latar: OFF - Klik untuk Nyalakan'}
          >
            <Music className={`w-3.5 h-3.5 ${isMusicEnabled ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">
              BGM {isMusicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* SFX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-2 py-1 sm:px-2.5 sm:py-1 border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              isMuted
                ? 'bg-[#0d1424] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8]'
                : 'bg-[#0c182c] border-[#10b981] text-[#10b981] hover:bg-[#112544]'
            }`}
            title={isMuted ? 'Efek Suara: OFF - Klik untuk Nyalakan' : `Efek Suara: ON [${cardSoundStyle.toUpperCase()}]`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#f43f5e]" /> : <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />}
            <span className="text-[10px] font-mono font-bold hidden sm:inline">
              SFX {isMuted ? 'OFF' : 'ON'}
            </span>
          </button>

          {/* Audio Volume Mixer Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowAudioMixer(true)}
            className="px-2 py-1 sm:px-2.5 sm:py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-tactile-sm"
            title="Buka Mixer Volume Audio (Atur Suara BGM, SFX & Profil Suara)"
          >
            <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">
              MIXER
            </span>
          </button>

          {/* Admin Dashboard Trigger */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-1 sm:px-2 sm:py-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] hover:bg-[#0c182c] text-[#94a3b8] hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Panel Pengaturan Admin Stand"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Area: 3 SECTIONS SEJAJAR (Calibrated for Standard Laptops <= 1366x768 & 1440x900) */}
      <main className="flex-1 min-h-0 py-2 sm:py-3 flex items-center justify-center w-full overflow-visible">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-3 sm:gap-4 xl:gap-6 overflow-visible">
          
          {/* ========================================================================= */}
          {/* SECTION 1 (KIRI): 3D Card Stack (Compact & Proportional for Laptops)       */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[270px] xl:w-[310px] 2xl:w-[350px] shrink-0 flex flex-col items-center justify-center overflow-visible relative z-20">
            <div 
              className="relative w-full flex flex-col items-center select-none overflow-visible"
              onMouseEnter={() => setIsHoveringStack(true)}
              onMouseLeave={() => setIsHoveringStack(false)}
            >
              {/* Stack Stage Container */}
              <div className="relative w-full max-w-[230px] xs:max-w-[250px] sm:max-w-[270px] lg:max-w-[250px] xl:max-w-[275px] 2xl:max-w-[300px] mx-auto perspective-1200 flex flex-col items-center overflow-visible">
                <div className="relative w-full pb-10 pr-9 overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
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
                          transformStyle: 'preserve-3d',
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
              <div className="mt-1.5 w-full max-w-[230px] xs:max-w-[250px] sm:max-w-[270px] lg:max-w-[250px] xl:max-w-[275px] 2xl:max-w-[300px] flex flex-col items-center gap-1.5">
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
                        className={`py-1 px-1 text-[9px] sm:text-[9.5px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
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
                <div className="w-full flex items-center justify-between gap-1 px-0.5">
                  {/* Left: Previous & Next Arrow Nav */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePrev('right', true)}
                      disabled={transition !== null}
                      className="px-2 py-0.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-0.5"
                      title="Kartu Sebelumnya"
                    >
                      <span>&larr;</span>
                      <span className="hidden xs:inline">Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNext('left', true)}
                      disabled={transition !== null}
                      className="px-2 py-0.5 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-0.5"
                      title="Kartu Selanjutnya"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span>&rarr;</span>
                    </button>
                  </div>

                  {/* Right: Auto-Switch, Flip Toggle, and Quick SFX Cycler */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsAutoSwitch((prev) => !prev)}
                      className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 ${
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
                      className={`px-1.5 py-0.5 border text-[8.5px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
                      className="px-1.5 py-0.5 border border-[#1e2b46] text-[#38bdf8] bg-[#0d1424] hover:border-[#38bdf8] text-[8.5px] font-mono font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                      title={`Karakter Suara Kartu: ${CARD_SOUND_STYLES.find(s => s.id === cardSoundStyle)?.name}. Klik untuk ganti variasi suara.`}
                    >
                      <Volume2 className="w-2.5 h-2.5 text-[#38bdf8]" />
                      <span>{cardSoundStyle.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                {/* Micro Hint */}
                <div className="text-[8.5px] font-mono text-[#64748b] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#38bdf8]" />
                  <span>Klik / drag kartu untuk bolak-balik</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2 (TENGAH): Hero Header, Cap Cockpit, & Registrasi Form           */}
          {/* ========================================================================= */}
          <div className="w-full lg:flex-1 min-w-0 max-w-[480px] xl:max-w-[560px] 2xl:max-w-[620px] flex flex-col justify-center space-y-2.5 sm:space-y-3">
            {/* Header Title Block */}
            <div>
              <div className="inline-block border border-[#273b5e] bg-[#0d1424] px-2 py-0.5 text-[#38bdf8] text-[9.5px] sm:text-[10px] font-mono mb-1 font-bold uppercase tracking-wider transition-all duration-200 hover:border-[#38bdf8] cursor-default">
                STAND RESMI HIMA TI // GMTI 2026
              </div>
              <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight text-[#f8fafc] leading-tight">
                FLASHCARD <span className="text-[#38bdf8]">PENGURUS</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-[#94a3b8] mt-0.5 leading-relaxed line-clamp-2">
                Uji kemampuanmu mengenali wajah dan divisi 34 pengurus HIMA TI masa bakti 2026. Raih cap stempel resmi untuk buku kendali GMTI-mu!
              </p>
            </div>

            {/* Target Cap Stand Box */}
            <div className="group bg-[#0d1424] border border-[#10b981] p-2.5 sm:p-3 shadow-tactile-sm relative transition-all duration-200 hover:border-[#34d399] hover:shadow-tactile-emerald cursor-default">
              <div className="absolute top-1 left-1 text-[8px] font-mono text-[#059669] font-bold pointer-events-none">+</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-[#059669] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#059669] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#059669] font-bold pointer-events-none">+</div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#10b981] text-[#080c14] flex items-center justify-center shrink-0 font-bold">
                  <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider font-mono">
                    TARGET: KLAIM CAP STAND RESMI HIMA TI
                  </h4>
                  <p className="text-[11.5px] sm:text-xs text-[#f8fafc] mt-0.5 leading-snug">
                    Jawab benar <strong>minimal {minBenarCap} dari {totalSoal} soal</strong> (maksimal salah 1) untuk langsung memperoleh <strong>Cap Stand</strong> di buku GMTI.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Parameter Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0d1424] border border-[#1e2b46] p-1.5 sm:p-2 shadow-tactile-sm">
                <div className="text-[#64748b] flex justify-center mb-0.5">
                  <Users className="w-3 h-3 text-[#38bdf8]" />
                </div>
                <p className="text-[8.5px] text-[#64748b] font-mono uppercase">Bank Soal</p>
                <p className="text-xs sm:text-sm font-bold text-[#f8fafc] font-mono">34 Pengurus</p>
              </div>

              <div className="bg-[#0d1424] border border-[#1e2b46] p-1.5 sm:p-2 shadow-tactile-sm">
                <div className="text-[#64748b] flex justify-center mb-0.5">
                  <Clock className="w-3 h-3 text-[#f59e0b]" />
                </div>
                <p className="text-[8.5px] text-[#64748b] font-mono uppercase">Waktu / Soal</p>
                <p className="text-xs sm:text-sm font-bold text-[#f8fafc] font-mono">{timerDetik} Detik</p>
              </div>

              <div className="bg-[#0d1424] border border-[#1e2b46] p-1.5 sm:p-2 shadow-tactile-sm">
                <div className="text-[#10b981] flex justify-center mb-0.5">
                  <Layers className="w-3 h-3 text-[#10b981]" />
                </div>
                <p className="text-[8.5px] text-[#64748b] font-mono uppercase">Syarat Cap</p>
                <p className="text-xs sm:text-sm font-bold text-[#10b981] font-mono">&ge; {minBenarCap} Benar</p>
              </div>
            </div>

            {/* Registration Input Form */}
            <div className="bg-[#0d1424] border border-[#1e2b46] p-3 sm:p-3.5 shadow-tactile-sm">
              <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#1e2b46]">
                <User className="w-3.5 h-3.5 text-[#38bdf8]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#f8fafc] tracking-tight font-mono">
                  Registrasi Peserta Stand
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#94a3b8] font-bold mb-1 tracking-wider">
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
                    className="w-full px-3 py-2 bg-[#080c14] border border-[#1e2b46] hover:border-[#334b75] text-[#f8fafc] placeholder-[#475569] focus:outline-none focus:border-[#38bdf8] text-xs sm:text-sm font-medium transition-all"
                  />
                  {error && (
                    <p className="text-[#f43f5e] text-[11px] mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isValidatingName}
                  className={`w-full py-2.5 sm:py-3 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-tactile-sm transition-all cursor-pointer ${
                    isValidatingName
                      ? 'bg-[#1e2b46] text-[#94a3b8] cursor-wait'
                      : 'bg-[#0284c7] hover:bg-[#0369a1] text-white hover:shadow-tactile-blue active:scale-[0.99]'
                  }`}
                >
                  {isValidatingName ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MEMERIKSA VALIDASI NAMA...</span>
                    </>
                  ) : (
                    <>
                      <span>MULAI TANTANGAN FLASHCARD</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3 (KANAN): Live Leaderboard Panel (Calibrated for Laptop Heights)  */}
          {/* ========================================================================= */}
          <div className="w-full lg:w-[270px] xl:w-[310px] 2xl:w-[350px] shrink-0 flex flex-col justify-center">
            <div className="bg-[#0d1424] border border-[#1e2b46] p-3 sm:p-3.5 flex flex-col h-[400px] sm:h-[430px] lg:h-[440px] xl:h-[480px] 2xl:h-[520px] shadow-tactile-sm transition-colors relative">
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

      {/* Footer Meta (Minimal and non-intrusive as in nvn) */}
      <footer className="py-1 text-center font-mono text-[10px] text-[#64748b] tracking-wider shrink-0 flex items-center justify-between px-1 border-t border-[#1e2b46]/50">
        <span>HIMA TI // GEMA MAHASISWA TEKNOLOGI INFORMASI 2026</span>
        <span>STAND BOOTH HIMA TI</span>
      </footer>

      {/* Audio Mixer Modal */}
      <AudioMixerModal isOpen={showAudioMixer} onClose={() => setShowAudioMixer(false)} />
    </div>
  );
};

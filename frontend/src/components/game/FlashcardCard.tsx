import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Aperture, RotateCw, Shield, QrCode, Cpu, Zap, Compass, Star, Lock } from 'lucide-react';
import type { Question, AnimationStyle, FotoFokus } from '../../types';
import { soundFx } from '../../lib/sound';

interface FlashcardCardProps {
  question?: Question;
  nextQuestion?: Question;
  animasiStyle: AnimationStyle;
  isAnswered: boolean;
  isCorrect: boolean;
  totalQuestions: number;
  currentNumber: number;
  fotoFokus?: FotoFokus;
  onSwipeAnswer?: (direction: 'left' | 'right') => void;
  interactivePreview?: boolean;
  isChallengerCard?: boolean;
  challengerIndex?: number;
  onSwipeCard?: (direction: 'left' | 'right') => void;
  onCardFlipped?: (isFlipped: boolean) => void;
  isBackgroundCard?: boolean;
  isFlippedControlled?: boolean;
  compactOnMobile?: boolean;
  spillJawaban?: 'akhir' | 'langsung';
  inspectMode?: boolean;
  minBenarCap?: number;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  question,
  nextQuestion,
  animasiStyle,
  isAnswered,
  isCorrect,
  totalQuestions,
  currentNumber,
  fotoFokus = 'tengah_atas',
  onSwipeAnswer,
  interactivePreview = false,
  isChallengerCard = false,
  challengerIndex = 0,
  onSwipeCard,
  onCardFlipped,
  isBackgroundCard = false,
  isFlippedControlled,
  compactOnMobile = false,
  spillJawaban = 'akhir',
  inspectMode = false,
  minBenarCap = 4
}) => {
  const safeMinBenar = minBenarCap ?? 4;
  const safeTotal = totalQuestions || 5;
  const maxSalah = Math.max(0, safeTotal - safeMinBenar);
  const cadanganSalah = maxSalah + 1;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(isFlippedControlled ?? false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isFlippedControlled !== undefined) {
      setIsFlipped(isFlippedControlled);
    }
  }, [isFlippedControlled]);

  // Deteksi 16 Fitur Kombo Aktif
  const isGrand = animasiStyle === 'combo_grand_stand';
  const isFlagship = animasiStyle === 'combo' || isGrand;
  const isQuantumHolo = animasiStyle === 'combo_quantum_holo' || isGrand;
  const isTacticalSonar = animasiStyle === 'combo_tactical_sonar' || isGrand;
  const isKineticArcade = animasiStyle === 'combo_kinetic_arcade';
  const isSurveillanceVhs = animasiStyle === 'combo_surveillance_vhs';
  const isApertureSpy = animasiStyle === 'combo_aperture_spy';
  const isMatrixOverdrive = animasiStyle === 'combo_matrix_overdrive' || isGrand;
  const isBlueprintCad = animasiStyle === 'combo_blueprint_cad';
  const isCosmicNeon = animasiStyle === 'combo_cosmic_neon';
  const isSynthwaveSunset = animasiStyle === 'combo_synthwave_sunset';
  const isOverclockVoltage = animasiStyle === 'combo_overclock_voltage';
  const isLiquidMagnetic = animasiStyle === 'combo_liquid_magnetic';
  const isHyperShimmer = animasiStyle === 'combo_hyper_shimmer';
  const isKineticGlitch = animasiStyle === 'combo_kinetic_glitch';
  const isGlassDepth = animasiStyle === 'combo_glass_depth';
  const isCyberPrism = animasiStyle === 'combo_cyber_prism';
  const isNeonOverdrive = animasiStyle === 'combo_neon_overdrive';
  const isTacticalQuantum = animasiStyle === 'combo_tactical_quantum';

  const hasLaser = isFlagship || isMatrixOverdrive || isGrand || isBlueprintCad || isKineticGlitch || isCyberPrism;
  const hasStack = isFlagship || isKineticArcade || isGrand || isOverclockVoltage || isGlassDepth || isCyberPrism;
  const hasMatrix = isFlagship || isMatrixOverdrive || isGrand || isKineticGlitch || isTacticalQuantum;
  const hasZoomFocus = isApertureSpy || isCosmicNeon || isLiquidMagnetic || isNeonOverdrive;
  const hasHolo = isQuantumHolo || isSynthwaveSunset || isHyperShimmer || isCyberPrism;
  const hasRadar = isTacticalSonar || isTacticalQuantum;
  const hasVhs = isSurveillanceVhs;
  const hasShutter = isApertureSpy;
  const isElastic = isKineticArcade || isLiquidMagnetic || isNeonOverdrive;
  const hasBlueprint = isBlueprintCad || isTacticalQuantum;
  const hasCosmic = isCosmicNeon;
  const hasSynthwave = isSynthwaveSunset || isNeonOverdrive;
  const hasVoltage = isOverclockVoltage || isNeonOverdrive;
  const hasLiquid = isLiquidMagnetic;
  const hasHyper = isHyperShimmer || isCyberPrism;
  const hasGlitch = isKineticGlitch || isNeonOverdrive;
  const hasGlass = isGlassDepth || isCyberPrism;

  // Posisi crop wajah Golden Ratio untuk foto potret 1067x1600
  const objectPositionClass = 
    fotoFokus === 'atas' 
      ? 'object-[center_8%]' 
      : fotoFokus === 'tengah' 
      ? 'object-center' 
      : 'object-[center_18%]';

  // 3D Parallax Tilt Values with Continuous Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: isElastic ? 450 : 320, damping: isElastic ? 16 : 22 });
  const springY = useSpring(mouseY, { stiffness: isElastic ? 450 : 320, damping: isElastic ? 16 : 22 });

  // Motion value & physics-driven spring for 3D flip angle (0 deg to 180 deg)
  const flipAngleSource = useMotionValue(isFlippedControlled ? 180 : (isFlipped ? 180 : 0));
  const flipSpring = useSpring(flipAngleSource, {
    stiffness: 170,
    damping: 22,
    mass: 0.8
  });

  useEffect(() => {
    flipAngleSource.set(isFlipped ? 180 : 0);
  }, [isFlipped, flipAngleSource]);

  // Base isometric tilt angle: flat upright by default (0) so card is not crooked
  const baseTiltX = 0;
  const baseTiltY = 0;

  // Combined smooth rotation math: allows 3D tilt on both front and back on mouse hover without default tilt
  const tiltX = useTransform(springY, [-0.5, 0.5], isElastic ? [20, -20] : [12, -12]);
  const tiltY = useTransform(springX, [-0.5, 0.5], isElastic ? [-20, 20] : [-12, 12]);

  const combinedRotateY = useTransform([flipSpring, tiltY], ([flip, tilt]) => {
    const isPastHalf = (flip as number) > 90;
    const currentBaseY = isPastHalf ? -baseTiltY : baseTiltY;
    return (flip as number) + currentBaseY + (tilt as number);
  });

  const combinedRotateX = useTransform([flipSpring, tiltX], ([flip, tilt]) => {
    const isPastHalf = (flip as number) > 90;
    const currentBaseX = isPastHalf ? -baseTiltX : baseTiltX;
    const currentTilt = tilt as number;
    return currentBaseX + (isPastHalf ? -currentTilt : currentTilt);
  });

  const sheenX = useTransform(springX, [-0.5, 0.5], ['0%', '100%']);
  const sheenY = useTransform(springY, [-0.5, 0.5], ['0%', '100%']);

  // Drag Gesture Values for Interactive Swiping
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-150, 150], isElastic ? [-20, 20] : [-12, 12]);
  const dragScale = useTransform(dragX, [-150, 0, 150], [0.96, 1, 0.96]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBackgroundCard || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    if (isBackgroundCard) return;
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMouseEnter = () => {
    if (isBackgroundCard) return;
    setIsHovered(true);
    soundFx.playCardHover();
  };

  const handleFlipCard = (e?: React.MouseEvent) => {
    if (isBackgroundCard) return;
    if (e) e.stopPropagation();
    soundFx.playFlip();
    setIsFlipped((prev) => {
      const next = !prev;
      onCardFlipped?.(next);
      return next;
    });
  };

  // Reset flip saat soal berganti dan picu soundscape (hanya untuk kartu aktif kuis, BUKAN di preview card homepage)
  useEffect(() => {
    if (isBackgroundCard) return;
    if (isFlippedControlled === undefined) {
      setIsFlipped(false);
    }
    // HANYA bunyikan soundscape dramatis (radar/shutter/holo glitch) saat game kuis bermain
    if (!isChallengerCard) {
      if (hasRadar) soundFx.playSonarPing();
      if (hasShutter) soundFx.playShutter();
      if (hasHolo) soundFx.playGlitch();
    }
  }, [question?.id, challengerIndex, isBackgroundCard, hasRadar, hasShutter, hasHolo, isFlippedControlled, isChallengerCard]);

  // Otomatis balik kartu saat dijawab (di mode spillJawaban='akhir' menampilkan status terkunci yang disensor)
  useEffect(() => {
    if (isAnswered && !isChallengerCard && isFlippedControlled === undefined) {
      const flipTimer = setTimeout(() => {
        soundFx.playFlip();
        setIsFlipped(true);
      }, 250);

      const stampTimer = setTimeout(() => {
        soundFx.playStamp();
      }, 550);

      return () => {
        clearTimeout(flipTimer);
        clearTimeout(stampTimer);
      };
    }
  }, [isAnswered, isChallengerCard, isFlippedControlled]);

  return (
    <div className={`relative ${
      isChallengerCard
        ? 'w-full h-full'
        : inspectMode
        ? 'w-full max-w-[260px] xs:max-w-[285px] sm:max-w-[310px] md:max-w-[335px]'
        : compactOnMobile 
        ? 'h-full max-h-[calc(100%-36px)] md:max-h-none w-auto aspect-[3/4.15] max-w-[min(325px,calc(100vw-64px))] md:h-auto md:w-full md:max-w-[360px] lg:max-w-[375px] md:aspect-auto' 
        : 'w-full max-w-[285px] xs:max-w-[310px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[375px]'
    } mx-auto perspective-1200 flex flex-col items-center justify-center select-none ${
      hasLiquid ? 'animate-liquid-levitate' : ''
    }`}>
      {/* 3D Physical Real Next Card in Stack (Real next card, never dummy boxes!) */}
      {!isBackgroundCard && nextQuestion && !isChallengerCard && currentNumber < totalQuestions && (
        <div 
          className={`absolute inset-0 pointer-events-none z-0 select-none transition-all duration-300 ease-out opacity-85 ${
            compactOnMobile
              ? 'translate-x-2.5 translate-y-3 scale-[0.94] rotate-[2.5deg] md:translate-x-5 md:translate-y-6 md:scale-[0.93] md:rotate-[3deg]'
              : 'translate-x-5 translate-y-6 scale-[0.93] rotate-[3deg]'
          }`}
          style={{ 
            filter: 'none' 
          }}
        >
          <FlashcardCard
            question={nextQuestion}
            animasiStyle={animasiStyle}
            fotoFokus={fotoFokus}
            isAnswered={false}
            isCorrect={true}
            totalQuestions={totalQuestions}
            currentNumber={currentNumber + 1}
            isBackgroundCard={true}
            compactOnMobile={compactOnMobile}
          />
        </div>
      )}

      {/* Main Flashcard Card Body with Real 3D Flip, Spring Hover Lift, & Continuous Tilt */}
      <motion.div
        ref={cardRef}
        drag={!isBackgroundCard && (interactivePreview || !isAnswered) ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={isElastic ? 0.4 : 0.25}
        onDragEnd={(_, info) => {
          if (isBackgroundCard) return;
          if (Math.abs(info.offset.x) > 60) {
            const dir = info.offset.x > 0 ? 'right' : 'left';
            if (onSwipeCard) {
              onSwipeCard(dir);
            } else if (onSwipeAnswer) {
              onSwipeAnswer(dir);
            }
          }
        }}
        whileHover={!isBackgroundCard ? {
          y: -8,
          scale: isElastic ? 1.035 : 1.025,
          transition: { type: 'spring', stiffness: 400, damping: 22 }
        } : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={isBackgroundCard ? undefined : handleFlipCard}
        style={{
          x: dragX,
          scale: isElastic ? dragScale : 1,
          rotateZ: dragRotate,
          rotateX: combinedRotateX,
          rotateY: combinedRotateY,
          transformStyle: 'preserve-3d'
        }}
        initial={isBackgroundCard ? false : { opacity: 1 }}
        animate={{ 
          opacity: 1, 
          rotateZ: isAnswered && !isFlipped && spillJawaban !== 'akhir' ? (isCorrect ? [0, -2, 2, 0] : [0, -5, 5, -3, 3, 0]) : 0
        }}
        transition={{ 
          type: 'spring', 
          stiffness: isElastic ? 380 : 280, 
          damping: isElastic ? 18 : 22 
        }}
        className={`relative z-10 ${
          compactOnMobile ? 'w-full h-full md:h-auto flex flex-col md:block' : 'w-full'
        } ${
          hasGlass
            ? `glass-3d-slab ${isHovered ? 'border-cyan-300' : 'border-white/25'}`
            : `card-3d-slab bg-[#101827] border-2 ${
                isAnswered
                  ? spillJawaban === 'akhir'
                    ? 'border-[#38bdf8] shadow-tactile-blue'
                    : isCorrect
                    ? 'border-[#10b981] shadow-tactile-emerald'
                    : 'border-[#f43f5e] shadow-tactile-coral'
                  : isHovered
                  ? 'border-[#38bdf8]'
                  : 'border-[#1e2b46]'
              }`
        } transition-colors duration-200 ${
          isBackgroundCard ? 'cursor-default' : 'cursor-pointer'
        } ${
          hasVoltage ? 'animate-voltage-border' : ''
        } ${
          hasHyper ? 'animate-chromatic-border' : ''
        } ${
          hasGlass && isAnswered
            ? spillJawaban === 'akhir'
              ? 'border-[#38bdf8] !shadow-[0_0_18px_rgba(56,189,248,0.3)]'
              : isCorrect
              ? 'border-[#10b981] !shadow-[0_0_18px_rgba(16,185,129,0.3)]'
              : 'border-[#f43f5e] !shadow-[0_0_18px_rgba(244,63,94,0.3)]'
            : ''
        }`}
      >
        {/* ================= SISI DEPAN (FRONT: FOTO / CHALLENGER PASS) ================= */}
        <div 
          className={`w-full ${
            inspectMode
              ? 'p-2 sm:p-2.5'
              : compactOnMobile ? 'h-full md:h-auto flex flex-col justify-between md:block p-2 sm:p-2.5 md:p-3.5' : 'p-3 sm:p-3.5'
          } backface-hidden relative overflow-hidden rounded-[5px] ${
            hasGlass 
              ? 'frosted-glass-surface backdrop-blur-xl' 
              : 'idcard-security-bg'
          }`}
          style={{ 
            transform: 'rotateY(0deg) translateZ(1px)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Synchronized Themed Animations on Front Card (Edge-to-Edge Atmosphere) */}
          {hasLaser && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className="absolute left-2 right-2 h-0.5 animate-laser">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_10px_#38bdf8]" />
                <div className="absolute -top-1 left-0 right-0 h-2.5 bg-gradient-to-r from-transparent via-[#38bdf8]/25 to-transparent blur-[2px]" />
              </div>
            </div>
          )}

          {hasHolo && (
            <div className="absolute inset-0 pointer-events-none holo-sheen-sweep opacity-30 z-10" />
          )}

          {hasHyper && (
            <div className="absolute inset-0 pointer-events-none hyper-diffraction-sweep opacity-35 z-10" />
          )}

          {/* Frosted Glass Layers & Specular Sheen (Front - Edge-to-Edge Synchronized) */}
          {hasGlass && (
            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
              <div className="absolute inset-0 glass-sheen-sweep" />
              <div className="w-3 h-3 bg-white/40 rounded-full blur-[1px] animate-crystal-dust absolute top-6 right-8" />
              <div className="w-2 h-2 bg-[#38bdf8]/50 rounded-full blur-[0.5px] animate-crystal-dust absolute bottom-12 left-10" />
              <div className="w-2.5 h-2.5 bg-[#c084fc]/40 rounded-full blur-[1px] animate-crystal-dust absolute top-28 left-6" />
              <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-crystal-dust absolute bottom-8 right-12" />
            </div>
          )}

          {/* Smooth Cyberpunk Scanline on Front */}
          {hasGlitch && (
            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
              <div className="absolute inset-0 cyber-telemetry-stream opacity-20" />
              <div className="absolute left-2 right-2 h-0.5 animate-cyber-scanline">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent shadow-[0_0_8px_#06b6d4]" />
              </div>
            </div>
          )}

          {hasRadar && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-15">
              <div className="w-32 h-32 rounded-full border border-[#2563eb]/25 animate-sonar absolute" />
              <div 
                className="w-full h-full absolute animate-radar opacity-30"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(37, 99, 235, 0.25) 0deg, transparent 55deg, transparent 360deg)'
                }}
              />
            </div>
          )}

          {hasVhs && (
            <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-65 z-15" />
          )}

          {hasMatrix && (
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none z-10" />
          )}

          {hasBlueprint && (
            <div className="absolute inset-0 pointer-events-none cad-blueprint-grid opacity-35 z-10 overflow-hidden">
              <div className="absolute left-2 right-2 h-0.5 animate-cad-ruler">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_8px_#38bdf8]" />
                <div className="absolute -top-1 left-0 right-0 h-2.5 bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent blur-[1.5px]" />
              </div>
            </div>
          )}

          {hasCosmic && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
              <div className="w-44 h-44 rounded-full border border-[#a855f7]/25 animate-cosmic-orbit absolute" />
            </div>
          )}

          {hasSynthwave && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-24 synthwave-wireframe-grid opacity-30" />
            </div>
          )}

          {/* Dynamic Light Specular Reflection Following Mouse on Front Card */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden z-20"
            style={{
              background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.45), transparent 60%)`
            }}
          />

          {/* Subtle Continuous Shimmer Drift on Front Card */}
          <div className="absolute inset-0 pointer-events-none back-sheen-drift z-10" />

          {/* Security Guilloche Pattern Overlay */}
          {!hasGlass && (
            <div className="absolute inset-0 pointer-events-none guilloche-pattern opacity-40" />
          )}

          {/* Corner Registration Crosshair Marks */}
          <div className="absolute top-1 left-1 text-[9px] font-mono text-[#475569] pointer-events-none font-bold z-25">+</div>
          <div className="absolute top-1 right-1 text-[9px] font-mono text-[#475569] pointer-events-none font-bold z-25">+</div>
          <div className="absolute bottom-1 left-1 text-[9px] font-mono text-[#475569] pointer-events-none font-bold z-25">+</div>
          <div className="absolute bottom-1 right-1 text-[9px] font-mono text-[#475569] pointer-events-none font-bold z-25">+</div>

          {/* Physical ID Badge Top Lanyard Slot / Punch Hole */}
          <div className={`relative z-25 shrink-0 flex justify-center ${compactOnMobile ? 'mb-1 sm:mb-1.5' : 'mb-1.5'} pointer-events-none`}>
            <div className={`${compactOnMobile ? 'w-8 h-1 sm:w-11 sm:h-1.5' : 'w-11 h-1.5'} bg-[#050912] border border-[#1e2b46]/70 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center`}>
              <div className={`${compactOnMobile ? 'w-4 h-0.5 sm:w-5 sm:h-0.5' : 'w-5 h-0.5'} bg-[#121c30] rounded-full`} />
            </div>
          </div>

          {/* Card Header Data Bar */}
          <div className={`relative z-25 shrink-0 flex items-center justify-between ${compactOnMobile ? 'mb-1 pb-1 sm:mb-2 sm:pb-2 text-[9px] sm:text-xs' : 'mb-2 pb-2 text-xs'} border-b border-[#1e2b46] font-mono select-none pointer-events-none`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 ${isHovered ? 'bg-[#38bdf8] animate-ping' : 'bg-[#2563eb]'}`} />
              <span className={`font-bold text-[#f8fafc] uppercase tracking-wider ${compactOnMobile ? 'text-[9.5px] sm:text-[11px]' : 'text-[11px]'} truncate`}>
                {isChallengerCard ? (
                  challengerIndex === 1 ? 'DOKUMEN KENDALI // CAP' :
                  challengerIndex === 2 ? 'HALL OF FAME // REWARDS' :
                  'CHALLENGER // MABA'
                ) : isBackgroundCard ? (
                  `ID CARD // NEXT (#${question?.nomor || currentNumber})`
                ) : `ID CARD // #${question?.nomor || 1}`}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className={`border border-[#273b5e] bg-[#090d16] ${compactOnMobile ? 'px-1.5 py-0.2 text-[8.5px] sm:text-[10px]' : 'px-2 py-0.5 text-[10px]'} font-bold text-[#cbd5e1]`}>
                {isChallengerCard ? (
                  challengerIndex === 1 ? 'PASS #2' :
                  challengerIndex === 2 ? 'PASS #3' :
                  'PASS #1'
                ) : `${currentNumber} / ${totalQuestions}`}
              </span>
            </div>
          </div>

          {/* Container Foto / Visual Utama (Dynamic Proportional 3:4 Aspect Ratio) - Pass-through to Card Drag */}
          <div className={`relative w-full ${
            inspectMode
              ? 'h-[200px] xs:h-[220px] sm:h-[240px] md:h-[295px] lg:h-[315px]'
              : compactOnMobile
              ? 'flex-1 min-h-0 md:flex-none md:aspect-[347/400]'
              : 'aspect-[347/400]'
          } select-none pointer-events-none ${
            hasGlass 
              ? 'bg-slate-950/40 border-2 border-white/20 backdrop-blur-sm' 
              : 'bg-[#080c14] border border-[#1e2b46]'
          } overflow-hidden flex items-center justify-center`}>
            {isChallengerCard ? (
              /* Visual Hero Tantangan Maba (3 Variasi Kartu: Misi, Syarat Cap, Rewards) */
              <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#0c1424] via-[#080d17] to-[#0d1627] overflow-hidden">
                {/* Background Tech Hex Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-25" />

                {/* Top Badge */}
                <div className="relative z-10 text-center">
                  <span className={`border px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold ${
                    challengerIndex === 1 
                      ? 'border-[#10b981]/60 bg-[#080c14] text-[#10b981]' 
                      : challengerIndex === 2 
                      ? 'border-[#f59e0b]/60 bg-[#080c14] text-[#f59e0b]' 
                      : 'border-[#2563eb]/60 bg-[#080c14] text-[#38bdf8]'
                  }`}>
                    {challengerIndex === 1 ? 'PROTOKOL KELULUSAN RESMI' :
                     challengerIndex === 2 ? 'PAPAN REKOR TERTINGGI' :
                     'TANTANGAN IDENTIFIKASI RESMI'}
                  </span>
                </div>

                {/* Central Emblem Cyber Shield */}
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className={`relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center border-2 ${
                      challengerIndex === 1 
                        ? 'border-[#10b981] bg-[#092218]/90 shadow-tactile-emerald' 
                        : challengerIndex === 2 
                        ? 'border-[#f59e0b] bg-[#221706]/90 shadow-tactile-amber' 
                        : 'border-[#2563eb] bg-[#0f1b33]/90 shadow-tactile-blue'
                    }`}
                  >
                    <div className={`absolute -inset-1 border animate-pulse ${
                      challengerIndex === 1 ? 'border-[#10b981]/40' :
                      challengerIndex === 2 ? 'border-[#f59e0b]/40' :
                      'border-[#38bdf8]/40'
                    }`} />
                    {challengerIndex === 1 ? (
                      <Shield className="w-12 h-12 text-[#10b981]" />
                    ) : challengerIndex === 2 ? (
                      <Star className="w-12 h-12 text-[#f59e0b]" />
                    ) : (
                      <Cpu className="w-12 h-12 text-[#38bdf8]" />
                    )}
                    <div className={`absolute bottom-1 text-[8px] font-mono font-bold tracking-wider ${
                      challengerIndex === 1 ? 'text-[#10b981]' :
                      challengerIndex === 2 ? 'text-[#f59e0b]' :
                      'text-[#f59e0b]'
                    }`}>
                      {challengerIndex === 1 ? 'CAP STAND' : challengerIndex === 2 ? 'TOP 10' : 'HIMA TI'}
                    </div>
                  </motion.div>

                  <h3 className="text-base md:text-lg font-extrabold text-[#f8fafc] text-center mt-4 tracking-tight leading-snug">
                    {challengerIndex === 1 ? 'SYARAT CAP RESMI' :
                     challengerIndex === 2 ? 'TOP 10 LEADERBOARD' :
                     'TARGET: 34 PENGURUS'}
                  </h3>
                  <p className="text-[11px] text-[#94a3b8] text-center max-w-[210px] mt-1 font-mono">
                    {challengerIndex === 1 ? `Jawab benar minimal ${safeMinBenar} dari ${safeTotal} soal untuk klaim cap resmi GMTI!` :
                     challengerIndex === 2 ? 'Catat waktu tercepat untuk memuncaki skor stand & raih merchandise!' :
                     'Bisakah kamu mengenali seluruh wajah & amanah pengurus HIMA TI?'}
                  </p>
                </div>

                {/* Bottom Callout */}
                <div className="relative z-10 w-full text-center border-t border-[#1e2b46] pt-2">
                  <span className={`text-[9px] font-mono flex items-center justify-center gap-1 ${
                    challengerIndex === 1 ? 'text-[#10b981]' :
                    challengerIndex === 2 ? 'text-[#f59e0b]' :
                    'text-[#f59e0b]'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {challengerIndex === 1 ? 'KLIK KARTU UNTUK CARA KLAIM' :
                     challengerIndex === 2 ? 'KLIK KARTU UNTUK TIPS & TRIK' :
                     'KLIK KARTU UNTUK LIHAT PROTOKOL'}
                  </span>
                </div>
              </div>
            ) : isBackgroundCard ? (
              /* Kartu Antrean Berikutnya: Design Locked (Bukan Blur) */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-5 bg-gradient-to-b from-[#0c1424] via-[#080d17] to-[#0d1627] overflow-hidden select-none">
                <div className="absolute inset-0 bg-[radial-gradient(#1e2b46_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-35 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-[#1e2b46] bg-[#090d16]/90 shadow-tactile mb-2.5">
                    <div className="absolute -inset-1 border border-[#38bdf8]/30 animate-pulse pointer-events-none" />
                    <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[#64748b]" />
                    <div className="absolute -bottom-2 bg-[#080c14] border border-[#1e2b46] px-1.5 py-0.2 text-[7.5px] font-mono text-[#94a3b8] font-bold tracking-wider">
                      TERKUNCI
                    </div>
                  </div>
                  <span className="inline-block border border-[#1e2b46] bg-[#0d1424] px-2 py-0.5 text-[8.5px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-[#38bdf8] mb-1">
                    KARTU #{currentNumber}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#cbd5e1] font-mono tracking-tight">
                    IDENTITAS TERKUNCI
                  </h4>
                  <p className="text-[9.5px] text-[#64748b] font-mono mt-1 max-w-[190px]">
                    Selesaikan pertanyaan saat ini untuk membuka kartu ini
                  </p>
                </div>
              </div>
            ) : (
              /* Foto Pengurus Potret - Drag Disabled to delegate gestures to Card */
              <motion.img
                src={question?.foto_url}
                alt={question?.correctNama}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                animate={hasZoomFocus && !isAnswered ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-full h-full object-cover select-none pointer-events-none ${objectPositionClass} transition-all duration-300 ${
                  isAnswered && !isCorrect && spillJawaban !== 'akhir' ? 'grayscale contrast-125 brightness-75' : ''
                } ${hasHolo ? 'animate-holo-smooth' : ''} ${
                  hasGlitch ? 'animate-cyber-glitch-subtle' : ''
                }`}
              />
            )}

            {/* Subtle Cyberpunk Telemetry Badge */}
            {hasGlitch && (
              <div className="absolute top-2 left-2 z-20 pointer-events-none">
                <div className="text-[8.5px] font-mono text-[#06b6d4] bg-[#080c14]/85 px-1.5 py-0.5 border border-[#06b6d4]/40 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-ping" />
                  CYBER_HUD // ONLINE
                </div>
              </div>
            )}

            {/* Frosted Glass Subtle Optics & Crystal Embers (Clean, No Box Seams) */}
            {hasGlass && (
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                <div className="w-2.5 h-2.5 bg-white/40 rounded-full blur-[1px] animate-crystal-dust absolute top-8 left-8" />
                <div className="w-2 h-2 bg-[#38bdf8]/50 rounded-full blur-[0.5px] animate-crystal-dust absolute bottom-12 right-10" />
                <div className="absolute top-2 left-2 text-[8.5px] font-mono text-cyan-200 bg-slate-950/70 backdrop-blur-md border border-cyan-400/30 px-1.5 py-0.5 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  ISOMETRIC GLASS
                </div>
              </div>
            )}

            {/* Smooth Biometric Laser Target Brackets */}
            {hasLaser && !isAnswered && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#38bdf8]" />
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#38bdf8]" />
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#38bdf8]" />
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#38bdf8]" />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-[#080c14]/90 border border-[#1e2b46] text-[#38bdf8] text-[8.5px] font-mono px-2 py-0.5 uppercase tracking-widest shadow-sm">
                    [ BIOMETRIC SCANNER ]
                  </span>
                </div>
              </div>
            )}

            {/* Tactical Sonar Radar Sweep */}
            {hasRadar && !isAnswered && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-15">
                <div className="w-28 h-28 rounded-full border border-[#2563eb]/40 animate-sonar absolute" />
                <div className="w-56 h-56 rounded-full border border-[#2563eb]/20 absolute" />
                <div 
                  className={`w-full h-full absolute animate-radar ${isHovered ? 'opacity-80' : 'opacity-40'}`}
                  style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, rgba(37, 99, 235, 0.3) 0deg, transparent 55deg, transparent 360deg)'
                  }}
                />
                <div className="absolute top-2 left-2 text-[8.5px] font-mono text-[#38bdf8] bg-[#080c14]/90 px-1.5 py-0.5 border border-[#1e2b46]">
                  SONAR: TARGET ACQUIRED
                </div>
              </div>
            )}

            {/* VHS Analog CRT Tape Overlay */}
            {hasVhs && (
              <div className="absolute inset-0 pointer-events-none vhs-scanlines flex flex-col justify-between p-2 z-15">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#10b981] bg-[#080c14]/80 px-1.5 py-0.5 border border-[#1e2b46]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#f43f5e] animate-pulse" />
                    REC
                  </span>
                  <span>CAM-01 24FPS</span>
                </div>
                <div className="text-right text-[8.5px] font-mono text-[#94a3b8]">
                  ANALOG TAPE // STAND 2026
                </div>
              </div>
            )}

            {/* Camera Aperture Shutter Iris */}
            {hasShutter && (
              <div className="absolute inset-0 pointer-events-none border-2 border-[#080c14]/60 flex items-center justify-center z-15">
                <div className="absolute top-2 right-2 text-[#94a3b8] flex items-center gap-1 text-[8.5px] font-mono bg-[#080c14]/80 px-1.5 py-0.5 border border-[#1e2b46]">
                  <Aperture className={`w-3 h-3 text-[#38bdf8] ${isHovered ? 'animate-shutter' : ''}`} />
                  <span>f/1.8 1/500s</span>
                </div>
              </div>
            )}

            {/* Architect Blueprint CAD Overlay */}
            {hasBlueprint && (
              <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
                <div className="absolute top-2 left-2 text-[8.5px] font-mono text-[#38bdf8] bg-[#080c14]/90 px-1.5 py-0.5 border border-[#1e2b46] flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  CAD: 3:4 [1067x1600]
                </div>
              </div>
            )}

            {/* Cosmic Nebula Orbit & Starlight */}
            {hasCosmic && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-15">
                <div className="w-48 h-48 rounded-full border border-[#a855f7]/30 animate-cosmic-orbit absolute" />
                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#c084fc] rounded-full animate-starlight" />
                <div className="absolute bottom-5 left-5 w-1 h-1 bg-[#38bdf8] rounded-full animate-starlight" />
                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#c084fc] bg-[#080c14]/90 px-1 border border-[#1e2b46] flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  COSMIC PULSAR
                </div>
              </div>
            )}

            {/* Synthwave 80s Wireframe Horizon */}
            {hasSynthwave && (
              <div className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-between overflow-hidden">
                <div className="w-full h-16 bg-gradient-to-b from-[#ec4899]/20 to-transparent animate-sunset-pulse" />
                <div className="w-full h-24 synthwave-wireframe-grid opacity-40" />
                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#f472b6] bg-[#080c14]/90 px-1 border border-[#1e2b46]">
                  SYNTHWAVE // 80S
                </div>
              </div>
            )}

            {/* Overclock Voltage Surge Telemetry */}
            {hasVoltage && (
              <div className="absolute top-2 left-2 text-[9px] font-mono text-[#38bdf8] bg-[#080c14]/90 px-1.5 py-0.5 border border-[#2563eb] z-15 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#f59e0b]" />
                1.48V OVERCLOCK
              </div>
            )}

            {/* Matrix Digital Hex Grid */}
            {hasMatrix && !isAnswered && (
              <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:14px_14px] opacity-25 pointer-events-none z-10" />
            )}

            {/* Dynamic Specular Holographic Glare (Follows Mouse) */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-25"
              style={{
                background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.6), transparent 60%)`
              }}
            />

          </div>

          {/* Card Footer Technical Meta */}
          <div className={`relative z-25 shrink-0 ${compactOnMobile ? 'mt-1 pt-1 sm:mt-2 sm:pt-2 text-[8.5px] sm:text-[10px]' : 'mt-2 pt-2 text-[10px]'} border-t border-[#1e2b46] flex items-center justify-between font-mono text-[#64748b] select-none pointer-events-none`}>
            <span className="text-[#94a3b8] uppercase font-semibold truncate">
              HIMA TI // STAND-PASS
            </span>
            <span className="text-[#38bdf8] flex items-center gap-1 font-bold shrink-0">
              <RotateCw className="w-2.5 h-2.5 text-[#38bdf8]" />
              <span className="hidden xs:inline">KLIK UNTUK BALIK</span>
              <span className="xs:hidden">BALIK</span>
            </span>
          </div>
        </div>

        {/* ================= SISI BELAKANG (BACK: OFFICIAL ID CARD / STAND RULES) ================= */}
        <div 
          className={`absolute inset-0 ${
            inspectMode ? 'p-2 sm:p-2.5' : compactOnMobile ? 'p-2 sm:p-2.5 md:p-3.5' : 'p-3 sm:p-3.5'
          } rounded-[5px] ${
            hasGlass 
              ? 'frosted-glass-surface backdrop-blur-xl' 
              : 'idcard-security-bg'
          } flex flex-col justify-between backface-hidden overflow-hidden`}
          style={{ 
            transform: 'rotateY(180deg) translateZ(1px)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Synchronized Themed Animations on the Back Card */}
          {hasLaser && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className="absolute left-2 right-2 h-0.5 animate-laser">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_10px_#38bdf8]" />
                <div className="absolute -top-1 left-0 right-0 h-2.5 bg-gradient-to-r from-transparent via-[#38bdf8]/25 to-transparent blur-[2px]" />
              </div>
            </div>
          )}

          {hasHolo && (
            <div className="absolute inset-0 pointer-events-none holo-sheen-sweep opacity-30 z-10" />
          )}

          {hasHyper && (
            <div className="absolute inset-0 pointer-events-none hyper-diffraction-sweep opacity-35 z-10" />
          )}

          {/* Frosted Glass Layers & Specular Sheen (Back - Perfectly Synchronized) */}
          {hasGlass && (
            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
              <div className="absolute inset-0 glass-sheen-sweep" />
              <div className="w-3 h-3 bg-white/40 rounded-full blur-[1px] animate-crystal-dust absolute top-6 right-8" />
              <div className="w-2 h-2 bg-[#38bdf8]/50 rounded-full blur-[0.5px] animate-crystal-dust absolute bottom-12 left-10" />
              <div className="w-2 h-2 bg-[#c084fc]/40 rounded-full blur-[1px] animate-crystal-dust absolute top-28 left-6" />
            </div>
          )}

          {/* Smooth Cyberpunk Scanline on Back */}
          {hasGlitch && (
            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
              <div className="absolute inset-0 cyber-telemetry-stream opacity-20" />
              <div className="absolute left-2 right-2 h-0.5 animate-cyber-scanline">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent shadow-[0_0_8px_#06b6d4]" />
              </div>
            </div>
          )}

          {hasRadar && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-15">
              <div className="w-32 h-32 rounded-full border border-[#2563eb]/25 animate-sonar absolute" />
              <div 
                className="w-full h-full absolute animate-radar opacity-30"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(37, 99, 235, 0.25) 0deg, transparent 55deg, transparent 360deg)'
                }}
              />
            </div>
          )}

          {hasVhs && (
            <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-65 z-15" />
          )}

          {hasMatrix && (
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none z-10" />
          )}

          {hasBlueprint && (
            <div className="absolute inset-0 pointer-events-none cad-blueprint-grid opacity-35 z-10 overflow-hidden">
              <div className="absolute left-2 right-2 h-0.5 animate-cad-ruler">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_8px_#38bdf8]" />
                <div className="absolute -top-1 left-0 right-0 h-2.5 bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent blur-[1.5px]" />
              </div>
            </div>
          )}

          {hasCosmic && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
              <div className="w-44 h-44 rounded-full border border-[#a855f7]/25 animate-cosmic-orbit absolute" />
            </div>
          )}

          {hasSynthwave && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-24 synthwave-wireframe-grid opacity-30" />
            </div>
          )}

          {/* Dynamic Light Specular Reflection Following Mouse on Back Card */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden z-20"
            style={{
              background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255, 255, 255, 0.45), transparent 60%)`
            }}
          />

          {/* Subtle Continuous Shimmer Drift on Back Card */}
          <div className="absolute inset-0 pointer-events-none back-sheen-drift z-10" />

          {/* Security Guilloche Pattern Overlay */}
          {!hasGlass && (
            <div className="absolute inset-0 pointer-events-none guilloche-pattern opacity-40" />
          )}

          {/* Physical ID Badge Top Lanyard Slot / Punch Hole */}
          <div className={`relative z-25 shrink-0 flex justify-center ${compactOnMobile ? 'mb-0.5 sm:mb-1' : 'mb-1'} pointer-events-none`}>
            <div className={`${compactOnMobile ? 'w-8 h-1 sm:w-11 sm:h-1.5' : 'w-11 h-1.5'} bg-[#050912] border border-[#1e2b46]/70 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center`}>
              <div className={`${compactOnMobile ? 'w-4 h-0.5 sm:w-5 sm:h-0.5' : 'w-5 h-0.5'} bg-[#121c30] rounded-full`} />
            </div>
          </div>

          {/* ID Card Header */}
          <div className={`relative z-25 shrink-0 ${compactOnMobile ? 'pb-1 text-[9px] sm:text-xs' : 'pb-2 text-xs'} border-b border-[#1e2b46] flex items-center justify-between font-mono`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
              <span className={`font-bold text-[#f8fafc] ${compactOnMobile ? 'text-[8.5px] sm:text-[10px]' : 'text-[10px]'} tracking-wider uppercase truncate`}>
                {isChallengerCard 
                  ? (challengerIndex === 1 ? 'DOKUMEN KELULUSAN STAND' :
                     challengerIndex === 2 ? 'STRATEGI & REWARD STAND' :
                     'BRIEFING STAND HIMA TI')
                  : hasGlass 
                  ? 'FROSTED GLASS // IDENTITY DEPTH' 
                  : 'KARTU IDENTITAS RESMI PENGURUS'}
              </span>
            </div>
            <span className={`text-[8px] sm:text-[9px] text-[#38bdf8] font-mono border border-[#273b5e] ${compactOnMobile ? 'px-1 py-0.2' : 'px-1.5 py-0.2'} bg-[#080c14] shrink-0`}>
              RESMI 2026
            </span>
          </div>

          {/* ID Card Body Content */}
          <div className={`relative z-25 flex-1 min-h-0 flex flex-col justify-between ${compactOnMobile ? 'py-1 space-y-1 sm:space-y-2 md:py-2 md:space-y-3' : 'py-2 space-y-3'}`}>
            {/* Big Official Clearance Stamp */}
            <div className="flex justify-center">
              {isChallengerCard ? (
                challengerIndex === 1 ? (
                  <div className="border-2 border-[#10b981] text-[#10b981] px-3.5 py-1 font-mono font-bold text-xs tracking-wider uppercase bg-[#052e16]/90 shadow-tactile-emerald hover:scale-105 transition-transform">
                    ★ SYARAT CAP STEMPEL RESMI ★
                  </div>
                ) : challengerIndex === 2 ? (
                  <div className="border-2 border-[#f59e0b] text-[#f59e0b] px-3.5 py-1 font-mono font-bold text-xs tracking-wider uppercase bg-[#221706]/90 shadow-tactile-amber hover:scale-105 transition-transform">
                    ★ REWARD & STRATEGI SKOR ★
                  </div>
                ) : (
                  <div className="border-2 border-[#38bdf8] text-[#38bdf8] px-3.5 py-1 font-mono font-bold text-xs tracking-wider uppercase bg-[#080c14]/90 shadow-tactile-blue hover:scale-105 transition-transform">
                    ★ STAND OPERATIONAL BRIEFING ★
                  </div>
                )
              ) : isAnswered ? (
                !interactivePreview && !isChallengerCard && spillJawaban === 'akhir' ? (
                  /* Saat sesi kuis: Identitas & status benar/salah dirahasiakan hingga akhir sesi */
                  <div className={`border-2 border-[#38bdf8] text-[#38bdf8] ${compactOnMobile ? 'px-2 py-0.5 text-[8.5px] sm:text-xs' : 'px-3.5 py-1 text-xs'} font-mono font-bold tracking-wider uppercase bg-[#0c1e3d]/80 shadow-tactile-blue flex items-center gap-1.5`}>
                    <Lock className="w-3.5 h-3.5 text-[#38bdf8]" />
                    JAWABAN TERKUNCI // RAHASIA STAND
                  </div>
                ) : isCorrect ? (
                  <motion.div 
                    initial={{ scale: 1.4, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: -7 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className={`border-2 md:border-4 border-[#10b981] text-[#10b981] ${compactOnMobile ? 'px-2 py-0.5 text-[9.5px] sm:text-xs md:text-sm' : 'px-4 py-1.5 text-sm'} font-mono font-black tracking-widest uppercase bg-[#052e16]/80 shadow-tactile-emerald animate-stamp-alive`}
                  >
                    ★ VERIFIED // BENAR ★
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 1.4, opacity: 0, rotate: 15 }}
                    animate={{ scale: 1, opacity: 1, rotate: 7 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className={`border-2 md:border-4 border-[#f43f5e] text-[#f43f5e] ${compactOnMobile ? 'px-2 py-0.5 text-[9.5px] sm:text-xs md:text-sm' : 'px-4 py-1.5 text-sm'} font-mono font-black tracking-widest uppercase bg-[#4c0519]/80 shadow-tactile-coral`}
                  >
                    ✕ ACCESS DENIED // SALAH ✕
                  </motion.div>
                )
              ) : (
                /* Stamp Saat Belum Dijawab: Disensor & Terkunci */
                <div className={`border-2 border-[#f43f5e] text-[#f43f5e] ${compactOnMobile ? 'px-2 py-0.5 text-[8.5px] sm:text-xs' : 'px-3.5 py-1 text-xs'} font-mono font-bold tracking-wider uppercase bg-[#4c0519]/60 shadow-tactile-coral flex items-center gap-1.5 animate-pulse`}>
                  <Lock className="w-3.5 h-3.5 text-[#f43f5e]" />
                  IDENTITAS DIRAHASIAKAN // JAWAB KUIS
                </div>
              )}
            </div>

            {/* Profile Information Block / Rules Briefing with Interactive Hover */}
            {isChallengerCard ? (
              /* Penjelasan Aturan Stand Sesuai Index Kartu */
              <div className={`border p-3 space-y-2 shadow-tactile-sm transition-colors duration-200 ${
                hasGlass 
                  ? 'bg-white/[0.08] backdrop-blur-xl border-white/20' 
                  : 'bg-[#080c14]/95 border-[#1e2b46] hover:border-[#38bdf8]'
              }`}>
                {challengerIndex === 1 ? (
                  <div>
                    <span className="text-[9px] font-mono text-[#10b981] block uppercase tracking-wider font-bold">
                      KETENTUAN KLAIM CAP STAND:
                    </span>
                    <ul className="space-y-1.5 mt-1.5 text-[11px] text-[#cbd5e1] font-sans">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#10b981] font-mono font-bold">1.</span>
                        <span><strong>Benar &ge; {safeMinBenar} Soal:</strong> Langsung dapat Cap Stempel Basah HIMA TI di buku kendali.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#38bdf8] font-mono font-bold">2.</span>
                        <span><strong>Jalur Cadangan (Salah &ge; {cadanganSalah}):</strong> Follow Instagram @himaprodi_ti & Spinwheel.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#f59e0b] font-mono font-bold">3.</span>
                        <span>Semua maba yang mencoba pasti dibantu panitia untuk kelulusan GMTI!</span>
                      </li>
                    </ul>
                  </div>
                ) : challengerIndex === 2 ? (
                  <div>
                    <span className="text-[9px] font-mono text-[#f59e0b] block uppercase tracking-wider font-bold">
                      TIPS MENJADI JUARA STAND:
                    </span>
                    <ul className="space-y-1.5 mt-1.5 text-[11px] text-[#cbd5e1] font-sans">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#f59e0b] font-mono font-bold">1.</span>
                        <span>Jawab cepat untuk menghemat waktu dan naik di papan skor Leaderboard.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#38bdf8] font-mono font-bold">2.</span>
                        <span>Perhatikan foto pengurus dengan teliti sebelum memilih opsi A, B, C, atau D.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#10b981] font-mono font-bold">3.</span>
                        <span><strong>Minimal {safeMinBenar} Benar</strong> (maksimal salah {maxSalah}) untuk dapat <strong>Cap Stand HIMA TI</strong>.</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <span className="text-[9px] font-mono text-[#38bdf8] block uppercase tracking-wider font-bold">
                      MISI STAND HIMA TI 2026:
                    </span>
                    <ul className="space-y-1.5 mt-1.5 text-[11px] text-[#cbd5e1] font-sans">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#38bdf8] font-mono font-bold">1.</span>
                        <span>Kenali wajah & amanah kakak-kakak pengurus HIMA TI.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#10b981] font-mono font-bold">2.</span>
                        <span>Coba tantangan flashcard interaktif beranimasi cybernetic.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#10b981] font-mono font-bold">3.</span>
                        <span><strong>Minimal {safeMinBenar} Benar</strong> (maksimal salah {maxSalah}) untuk dapat <strong>Cap Stand HIMA TI</strong>.</span>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="pt-1.5 border-t border-[#1e2b46] flex items-center justify-between text-[9px] font-mono text-[#94a3b8]">
                  <span>{challengerIndex === 1 ? 'BUKU KENDALI MABA' : challengerIndex === 2 ? 'REWARD SYSTEM' : 'OFFLINE SQLITE DB'}</span>
                  <span className={challengerIndex === 1 ? 'text-[#10b981] font-bold' : challengerIndex === 2 ? 'text-[#f59e0b] font-bold' : 'text-[#38bdf8] font-bold'}>
                    STAND BOOTH 2026
                  </span>
                </div>
              </div>
            ) : (
              /* Kartu Identitas Resmi Pengurus with Sensor Saat Belum Dijawab / Sesi Berjalan */
              <div className={`group ${
                hasGlass 
                  ? 'bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-inner' 
                  : isAnswered && (interactivePreview || isChallengerCard || spillJawaban === 'langsung')
                  ? 'bg-[#080c14]/90 border border-[#1e2b46] hover:border-[#2563eb]' 
                  : isAnswered && spillJawaban === 'akhir'
                  ? 'bg-[#080c14]/90 border border-[#38bdf8]/40 shadow-tactile-blue'
                  : 'bg-[#080c14]/90 border border-[#f43f5e]/50 shadow-tactile-coral'
              } ${compactOnMobile ? 'p-1.5 sm:p-2.5 md:p-3 space-y-1 sm:space-y-2' : 'p-3 space-y-2'} shadow-tactile-sm transition-all duration-200`}>
                <div>
                  <span className={`${compactOnMobile ? 'text-[8px] sm:text-[9px]' : 'text-[9px]'} font-mono text-[#64748b] group-hover:text-[#38bdf8] block uppercase tracking-wider transition-colors`}>
                    NAMA LENGKAP PENGURUS:
                  </span>
                  {isAnswered && (interactivePreview || isChallengerCard || spillJawaban === 'langsung') ? (
                    <p className={`${compactOnMobile ? 'text-xs sm:text-sm md:text-base' : 'text-sm md:text-base'} font-extrabold text-[#f8fafc] leading-tight mt-0.5 group-hover:translate-x-0.5 transition-transform`}>
                      {question?.correctNama}
                    </p>
                  ) : (
                    /* SENSOR NAMA: Muncul saat maba membalik kartu sebelum akhir sesi */
                    <div className={`mt-1 flex items-center justify-between bg-[#080d16] ${isAnswered ? 'border border-[#38bdf8]/40' : 'border border-[#f43f5e]/40'} ${compactOnMobile ? 'p-1 sm:p-2' : 'p-2'} font-mono`}>
                      <div className="flex items-center gap-1.5">
                        <Lock className={`w-3 h-3 ${isAnswered ? 'text-[#38bdf8]' : 'text-[#f43f5e]'} shrink-0 animate-pulse`} />
                        <span className={`${compactOnMobile ? 'text-[9.5px] sm:text-xs' : 'text-xs'} font-bold ${isAnswered ? 'text-[#38bdf8]' : 'text-[#f43f5e]'} tracking-wider uppercase`}>
                          [TERKUNCI]
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-[#94a3b8] font-bold">BUKA DI AKHIR SESI</span>
                    </div>
                  )}
                </div>

                <div className="pt-1 border-t border-[#1e2b46]">
                  <span className={`${compactOnMobile ? 'text-[8px] sm:text-[9px]' : 'text-[9px]'} font-mono text-[#64748b] group-hover:text-[#38bdf8] block uppercase tracking-wider transition-colors`}>
                    DIVISI / AMANAH:
                  </span>
                  {isAnswered && (interactivePreview || isChallengerCard || spillJawaban === 'langsung') ? (
                    <p className={`${compactOnMobile ? 'text-[10px] sm:text-xs' : 'text-xs'} font-bold text-[#38bdf8] font-mono mt-0.5 group-hover:text-[#60a5fa] transition-colors`}>
                      {question?.correctDivisi}
                    </p>
                  ) : (
                    /* SENSOR DIVISI: Muncul saat maba membalik kartu sebelum akhir sesi */
                    <div className={`mt-1 flex items-center justify-between bg-[#080d16] border border-[#1e2b46] ${compactOnMobile ? 'p-1 sm:p-2' : 'p-2'} font-mono`}>
                      <span className={`${compactOnMobile ? 'text-[10px] sm:text-xs' : 'text-xs'} tracking-wider text-[#64748b] font-bold`}>
                        ████████████
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-[#f59e0b] font-bold">[RAHASIA]</span>
                    </div>
                  )}
                </div>

                <div className={`pt-1 border-t border-[#1e2b46] flex items-center justify-between ${compactOnMobile ? 'text-[8px] sm:text-[9px]' : 'text-[9px]'} font-mono text-[#94a3b8]`}>
                  {isAnswered && (interactivePreview || isChallengerCard || spillJawaban === 'langsung') ? (
                    <>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping" />
                        STATUS: AKTIF
                      </span>
                      <span className="text-[#10b981] font-bold border border-[#10b981]/40 px-1 py-0.2 bg-[#052e16]/60">
                        TERVERIFIKASI
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`flex items-center gap-1 ${isAnswered ? 'text-[#38bdf8]' : 'text-[#f43f5e]'}`}>
                        <Lock className="w-2.5 h-2.5" />
                        STATUS: TERKUNCI
                      </span>
                      <span className={`${isAnswered ? 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#0c1e3d]/60' : 'text-[#f43f5e] border-[#f43f5e]/40 bg-[#4c0519]/40'} font-bold border px-1 py-0.2`}>
                        DIRAHASIAKAN
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Fun Fact / Quote */}
            <div className={`p-2 text-center transition-colors ${
              hasGlass ? 'bg-white/[0.04] border border-white/10' : 'bg-[#0d1524] border border-[#1e2b46]'
            }`}>
              <p className="text-[10px] text-[#cbd5e1] italic leading-tight">
                {isChallengerCard 
                  ? '“Buktikan keakrabanmu dan klaim cap stempel buku GMTI-mu di stand!”'
                  : isAnswered
                  ? '“Dedikasi dan kebersamaan untuk Teknologi Informasi yang unggul.”'
                  : '“Pilih jawaban (A, B, C, atau D) terlebih dahulu untuk membuka berkas identitas ini!”'}
              </p>
            </div>
          </div>

          {/* ID Card Footer with Barcode & Re-flip Action */}
          <div className="relative z-25 shrink-0 pt-1.5 sm:pt-2 border-t border-[#1e2b46] flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-[#64748b]">
              <QrCode className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-[8px] tracking-tight text-[#94a3b8]">
                {isAnswered ? 'TI-SEC-2026-OK' : 'TI-LOCKED-WAITING'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFlipCard}
              className="px-2 py-0.5 bg-[#172338] hover:bg-[#2563eb] text-[#f8fafc] border border-[#273b5e] text-[9px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCw className="w-2.5 h-2.5" />
              {isChallengerCard ? 'LIHAT EMBLEM' : 'LIHAT FOTO'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

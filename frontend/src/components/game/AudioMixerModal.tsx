import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  Disc,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';
import { bgm, BGM_TRACKS, type BgmTrackMode } from '../../lib/bgm';
import { soundFx, CARD_SOUND_STYLES, type CardSoundStyle } from '../../lib/sound';

interface AudioMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioMixerModal: React.FC<AudioMixerModalProps> = ({ isOpen, onClose }) => {
  // BGM States
  const [isBgmEnabled, setIsBgmEnabled] = useState(bgm.isMusicEnabled());
  const [bgmVolume, setBgmVolume] = useState(Math.round(bgm.getVolume() * 100));
  const [bgmTrackMode, setBgmTrackMode] = useState<BgmTrackMode>(bgm.getTrackMode());
  const [bgmThemeName, setBgmThemeName] = useState(bgm.getActiveThemeName());

  // SFX States
  const [isSfxMuted, setIsSfxMuted] = useState(soundFx.isMuted());
  const [sfxVolume, setSfxVolume] = useState(Math.round(soundFx.getVolume() * 100));
  const [cardSoundStyle, setCardSoundStyle] = useState<CardSoundStyle>(soundFx.getCardSoundStyle());

  // Sync state when opened and subscribe to external changes
  useEffect(() => {
    if (!isOpen) return;

    setIsBgmEnabled(bgm.isMusicEnabled());
    setBgmVolume(Math.round(bgm.getVolume() * 100));
    setBgmTrackMode(bgm.getTrackMode());
    setBgmThemeName(bgm.getActiveThemeName());

    setIsSfxMuted(soundFx.isMuted());
    setSfxVolume(Math.round(soundFx.getVolume() * 100));
    setCardSoundStyle(soundFx.getCardSoundStyle());

    const unsubBgm = bgm.subscribe((enabled, track, themeName, vol) => {
      setIsBgmEnabled(enabled);
      setBgmTrackMode(track);
      setBgmThemeName(themeName);
      setBgmVolume(Math.round(vol * 100));
    });

    const unsubMute = soundFx.subscribe((muted) => {
      setIsSfxMuted(muted);
    });

    const unsubSfxVol = soundFx.subscribeVolume((vol) => {
      setSfxVolume(Math.round(vol * 100));
    });

    const unsubStyle = soundFx.subscribeCardStyle((style) => {
      setCardSoundStyle(style);
    });

    return () => {
      unsubBgm();
      unsubMute();
      unsubSfxVol();
      unsubStyle();
    };
  }, [isOpen]);

  // Handle BGM Volume Change
  const handleBgmVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBgmVolume(val);
    bgm.setVolume(val / 100);
    // If user moves slider above 0 while disabled, automatically enable BGM
    if (val > 0 && !isBgmEnabled) {
      bgm.toggle();
      setIsBgmEnabled(true);
    }
  };

  // Handle SFX Volume Change
  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSfxVolume(val);
    soundFx.setVolume(val / 100);
    // If user moves slider above 0 while muted, automatically unmute SFX
    if (val > 0 && isSfxMuted) {
      soundFx.setMuted(false);
      setIsSfxMuted(false);
    }
  };

  // Quick Preset Handlers (Exact Synchronized Percentages)
  const applyPresetQuiet = () => {
    soundFx.setVolume(0);
    setSfxVolume(0);
    soundFx.setMuted(true);
    setIsSfxMuted(true);
    bgm.setVolume(0);
    setBgmVolume(0);
    if (isBgmEnabled) {
      bgm.toggle();
      setIsBgmEnabled(false);
    }
  };

  const applyPresetBalanced = () => {
    if (isSfxMuted) {
      soundFx.setMuted(false);
      setIsSfxMuted(false);
    }
    if (!isBgmEnabled) {
      bgm.toggle();
      setIsBgmEnabled(true);
    }
    soundFx.setVolume(0.5);
    setSfxVolume(50);
    bgm.setVolume(0.5);
    setBgmVolume(50);
    soundFx.playCardHover(false);
  };

  const applyPresetLoud = () => {
    if (isSfxMuted) {
      soundFx.setMuted(false);
      setIsSfxMuted(false);
    }
    if (!isBgmEnabled) {
      bgm.toggle();
      setIsBgmEnabled(true);
    }
    soundFx.setVolume(1.0);
    setSfxVolume(100);
    bgm.setVolume(1.0);
    setBgmVolume(100);
    soundFx.playCardHover(false);
  };

  // Test Sound Triggers
  const testCardFlip = () => {
    soundFx.playFlip(false);
  };

  const testCorrect = () => {
    soundFx.playCorrect();
  };

  const testTick = () => {
    soundFx.playTick(5);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050811]/85 backdrop-blur-md select-none">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg bg-[#080c14] border-2 border-[#1e2b46] shadow-tactile p-3.5 sm:p-5 my-auto max-h-[95dvh] overflow-y-auto text-[#f8fafc]"
          >
            {/* Corner Decorative Tech Markers */}
            <div className="absolute top-1.5 left-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
            <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
            <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
            <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b-2 border-[#1c2b46] mb-3.5 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#0c182c] border border-[#38bdf8] text-[#38bdf8] shadow-tactile-sm">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                    <span>AUDIO MIXER // STAND VOLUME</span>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 bg-[#1e2b46] text-[#38bdf8] border border-[#38bdf8]/50">
                      LIVE
                    </span>
                  </h3>
                  <p className="font-mono text-[10px] sm:text-[11px] text-[#64748b]">
                    Atur intensitas volume musik latar & efek suara
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 sm:p-1.5 text-[#94a3b8] hover:text-white bg-[#0d1424] border border-[#1e2b46] hover:border-[#f43f5e] hover:bg-[#4c0519]/40 transition-colors cursor-pointer"
                title="Tutup Mixer Audio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: BGM (Musik Latar) Control */}
            <div className="bg-[#0d1424] border border-[#1e2b46] p-3 sm:p-3.5 mb-3 shadow-tactile-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`p-1 border shrink-0 ${
                      isBgmEnabled
                        ? 'border-[#38bdf8] bg-[#0c182c] text-[#38bdf8]'
                        : 'border-[#1e2b46] bg-[#080c14] text-[#64748b]'
                    }`}
                  >
                    <Music className={`w-3.5 h-3.5 ${isBgmEnabled ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-white tracking-wider block">
                      MUSIK LATAR (BGM)
                    </span>
                    <span className="font-mono text-[10px] text-[#38bdf8] block truncate max-w-[150px] xs:max-w-[190px] sm:max-w-[220px]">
                      {isBgmEnabled ? bgmThemeName : 'DINONAKTIFKAN'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#080c14] border border-[#1e2b46] text-[#38bdf8]">
                    {isBgmEnabled ? `${bgmVolume}%` : '0% (MUTE)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const enabled = bgm.toggle();
                      setIsBgmEnabled(enabled);
                    }}
                    className={`px-2 py-1 font-mono text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                      isBgmEnabled
                        ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8]'
                        : 'bg-[#080c14] border-[#1e2b46] text-[#64748b]'
                    }`}
                  >
                    {isBgmEnabled ? 'NYALA' : 'MATI'}
                  </button>
                </div>
              </div>

              {/* BGM Volume Slider */}
              <div className="flex items-center gap-2.5 my-2">
                <button
                  type="button"
                  onClick={() => {
                    setBgmVolume(0);
                    bgm.setVolume(0);
                  }}
                  className="p-1 text-[#64748b] hover:text-[#f43f5e] transition-colors cursor-pointer"
                  title="Set volume BGM ke 0%"
                >
                  <VolumeX className="w-4 h-4" />
                </button>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isBgmEnabled ? bgmVolume : 0}
                    onChange={handleBgmVolumeChange}
                    className="w-full h-2 bg-[#080c14] rounded-none appearance-none cursor-pointer accent-[#38bdf8] border border-[#1e2b46]"
                    style={{
                      background: `linear-gradient(to right, #38bdf8 ${
                        isBgmEnabled ? bgmVolume : 0
                      }%, #080c14 ${isBgmEnabled ? bgmVolume : 0}%)`
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBgmVolume(100);
                    bgm.setVolume(1.0);
                    if (!isBgmEnabled) {
                      bgm.toggle();
                      setIsBgmEnabled(true);
                    }
                  }}
                  className="p-1 text-[#64748b] hover:text-[#38bdf8] transition-colors cursor-pointer"
                  title="Set volume BGM maksimal (100%)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* BGM Track Mode Selector */}
              <div className="pt-2 border-t border-[#1e2b46]/70 mt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-[#94a3b8] uppercase flex items-center gap-1">
                    <Disc className="w-3 h-3 text-[#38bdf8]" />
                    PILIHAN TEMA MUSIK:
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {BGM_TRACKS.map((t) => {
                    const isSelected = bgmTrackMode === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          bgm.setTrackMode(t.id);
                          setBgmTrackMode(t.id);
                          setBgmThemeName(bgm.getActiveThemeName());
                        }}
                        className={`p-1.5 text-center font-mono text-[9.5px] font-bold border truncate transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#112544] border-[#38bdf8] text-[#38bdf8] shadow-tactile-sm'
                            : 'bg-[#080c14] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8] hover:border-[#273b5e]'
                        }`}
                        title={`${t.name} (${t.bpm} BPM) - ${t.desc}`}
                      >
                        <span className="truncate w-full">{t.tag}</span>
                        <span className="text-[8px] opacity-75 font-normal">{t.bpm} BPM</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 2: SFX (Efek Suara) Control */}
            <div className="bg-[#0d1424] border border-[#1e2b46] p-3 sm:p-3.5 mb-3 shadow-tactile-sm">
              {(() => {
                const sfxProfile = CARD_SOUND_STYLES.find((s) => s.id === cardSoundStyle);
                const sfxCleanTitle = sfxProfile ? sfxProfile.name.split('(')[0].trim() : cardSoundStyle.toUpperCase();
                return (
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`p-1 border shrink-0 ${
                          !isSfxMuted
                            ? 'border-[#10b981] bg-[#052e16] text-[#10b981]'
                            : 'border-[#1e2b46] bg-[#080c14] text-[#64748b]'
                        }`}
                      >
                        {!isSfxMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[#f43f5e]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-white tracking-wider block">
                          EFEK SUARA (SFX)
                        </span>
                        <span 
                          className="font-mono text-[10px] text-[#10b981] block truncate max-w-[150px] xs:max-w-[190px] sm:max-w-[220px]"
                          title={!isSfxMuted ? `PROFIL: ${sfxProfile?.name || sfxCleanTitle}` : 'DIBISUKAN (MUTED)'}
                        >
                          {!isSfxMuted ? `PROFIL: ${sfxCleanTitle}` : 'DIBISUKAN (MUTED)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#080c14] border border-[#1e2b46] text-[#10b981]">
                        {!isSfxMuted ? `${sfxVolume}%` : '0% (MUTE)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const muted = soundFx.toggleMute();
                          setIsSfxMuted(muted);
                        }}
                        className={`px-2 py-1 font-mono text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                          !isSfxMuted
                            ? 'bg-[#052e16] border-[#10b981] text-[#10b981]'
                            : 'bg-[#080c14] border-[#1e2b46] text-[#64748b]'
                        }`}
                      >
                        {!isSfxMuted ? 'NYALA' : 'BISU'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* SFX Volume Slider */}
              <div className="flex items-center gap-2.5 my-2">
                <button
                  type="button"
                  onClick={() => {
                    setSfxVolume(0);
                    soundFx.setVolume(0);
                  }}
                  className="p-1 text-[#64748b] hover:text-[#f43f5e] transition-colors cursor-pointer"
                  title="Set volume SFX ke 0%"
                >
                  <VolumeX className="w-4 h-4" />
                </button>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={!isSfxMuted ? sfxVolume : 0}
                    onChange={handleSfxVolumeChange}
                    className="w-full h-2 bg-[#080c14] rounded-none appearance-none cursor-pointer accent-[#10b981] border border-[#1e2b46]"
                    style={{
                      background: `linear-gradient(to right, #10b981 ${
                        !isSfxMuted ? sfxVolume : 0
                      }%, #080c14 ${!isSfxMuted ? sfxVolume : 0}%)`
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSfxVolume(100);
                    soundFx.setVolume(1.0);
                    if (isSfxMuted) {
                      soundFx.setMuted(false);
                      setIsSfxMuted(false);
                    }
                  }}
                  className="p-1 text-[#64748b] hover:text-[#10b981] transition-colors cursor-pointer"
                  title="Set volume SFX maksimal (100%)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sound Profile Selector */}
              <div className="pt-2 border-t border-[#1e2b46]/70 mt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-[#94a3b8] uppercase">
                    PROFIL SUARA BALIK KARTU:
                  </span>
                  <span className="font-mono text-[9px] text-[#10b981] truncate max-w-[200px]">
                    {CARD_SOUND_STYLES.find((s) => s.id === cardSoundStyle)?.tag} // AKTIF
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {CARD_SOUND_STYLES.map((s) => {
                    const isSelected = cardSoundStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          soundFx.setCardSoundStyle(s.id);
                          setCardSoundStyle(s.id);
                          soundFx.playFlip(false);
                        }}
                        className={`p-1.5 text-center font-mono text-[9.5px] font-bold border truncate transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#064e3b] border-[#10b981] text-[#10b981] shadow-tactile-sm'
                            : 'bg-[#080c14] border-[#1e2b46] text-[#64748b] hover:text-[#94a3b8] hover:border-[#273b5e]'
                        }`}
                        title={`${s.name} - ${s.desc}`}
                      >
                        <span className="truncate w-full">{s.tag}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="font-mono text-[9px] text-[#64748b] mt-1.5 leading-snug truncate">
                  {CARD_SOUND_STYLES.find((s) => s.id === cardSoundStyle)?.desc}
                </p>
              </div>

              {/* Test SFX Buttons */}
              <div className="pt-2.5 border-t border-[#1e2b46]/70 mt-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] text-[#64748b]">UJI DENGAR SFX:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={testCardFlip}
                    className="px-2 py-1 font-mono text-[9.5px] font-bold bg-[#080c14] border border-[#1e2b46] hover:border-[#10b981] text-[#94a3b8] hover:text-[#10b981] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5" />
                    KARTU
                  </button>
                  <button
                    type="button"
                    onClick={testTick}
                    className="px-2 py-1 font-mono text-[9.5px] font-bold bg-[#080c14] border border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-[#38bdf8] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5" />
                    TIMER TIK
                  </button>
                  <button
                    type="button"
                    onClick={testCorrect}
                    className="px-2 py-1 font-mono text-[9.5px] font-bold bg-[#080c14] border border-[#1e2b46] hover:border-[#f59e0b] text-[#94a3b8] hover:text-[#f59e0b] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5" />
                    BENAR
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Quick Presets */}
            {(() => {
              const isQuietActive = (!isBgmEnabled || bgmVolume === 0) && (isSfxMuted || sfxVolume === 0);
              const isBalancedActive = isBgmEnabled && !isSfxMuted && bgmVolume === 50 && sfxVolume === 50;
              const isLoudActive = isBgmEnabled && !isSfxMuted && bgmVolume === 100 && sfxVolume === 100;

              return (
                <div className="flex items-center justify-between gap-1.5 pt-1 mb-3.5">
                  <span className="font-mono text-[10px] text-[#64748b] uppercase shrink-0">PRESET STAND:</span>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={applyPresetQuiet}
                      className={`px-2 py-1 font-mono text-[9.5px] sm:text-[10px] font-bold border transition-all cursor-pointer ${
                        isQuietActive
                          ? 'bg-[#4c0519]/70 border-[#f43f5e] text-[#f43f5e] shadow-tactile-sm'
                          : 'bg-[#0d1424] border-[#1e2b46] hover:border-[#f43f5e] text-[#94a3b8] hover:text-[#f43f5e]'
                      }`}
                    >
                      SENYAP (0%)
                    </button>
                    <button
                      type="button"
                      onClick={applyPresetBalanced}
                      className={`px-2 py-1 font-mono text-[9.5px] sm:text-[10px] font-bold border transition-all cursor-pointer ${
                        isBalancedActive
                          ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8] shadow-tactile-sm'
                          : 'bg-[#0d1424] border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-[#38bdf8]'
                      }`}
                    >
                      SANTAI (50%)
                    </button>
                    <button
                      type="button"
                      onClick={applyPresetLoud}
                      className={`px-2 py-1 font-mono text-[9.5px] sm:text-[10px] font-bold border transition-all cursor-pointer ${
                        isLoudActive
                          ? 'bg-[#0c182c] border-[#38bdf8] text-[#38bdf8] shadow-tactile-sm'
                          : 'bg-[#0d1424] border-[#1e2b46] hover:border-[#38bdf8] text-[#94a3b8] hover:text-[#38bdf8]'
                      }`}
                    >
                      RAMAI (100%)
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Footer Close Button */}
            <div className="pt-2.5 border-t-2 border-[#1c2b46] flex items-center justify-between">
              <span className="font-mono text-[9.5px] text-[#64748b]">
                PENGATURAN TERSIMPAN OTOMATIS DI BROWSER
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono font-bold text-xs tracking-wider border border-[#38bdf8] shadow-tactile cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                SELESAI
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

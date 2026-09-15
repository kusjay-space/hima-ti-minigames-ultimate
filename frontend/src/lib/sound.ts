// Web Audio API Synthesizer - Zero External Files, 100% Reliable Offline
// Enhanced Interactive & Dynamic Audio Engine with Multi-Sound Profiles & Master Gain Control

export type CardSoundStyle = 'snap' | 'holo' | 'mechanical' | 'marimba' | 'paper' | 'velvet' | 'aero';

export interface CardSoundStyleInfo {
  id: CardSoundStyle;
  name: string;
  tag: string;
  desc: string;
}

export const CARD_SOUND_STYLES: CardSoundStyleInfo[] = [
  {
    id: 'snap',
    name: '01. Card Snap & Swish (Renyah, Mantap & Taktil)',
    tag: 'SNAP',
    desc: 'Suara jepretan kartu tebal yang mantap, renyah, dan berbobot dengan desiran angin tajam (Default).'
  },
  {
    id: 'holo',
    name: '02. Cyber Holo Badge (Futuristik HIMA TI)',
    tag: 'HOLO',
    desc: 'Efek hologram kaca futuristik berfrekuensi jernih dengan desiran laser halus khas identitas TI.'
  },
  {
    id: 'mechanical',
    name: '03. Tactile Switch (Klik Saklar Mekanikal)',
    tag: 'TACTILE',
    desc: 'Sensasi switch mechanical keyboard tactile yang tegas, presisi, dan sangat berbobot di setiap klik.'
  },
  {
    id: 'marimba',
    name: '04. Marimba Pop (Melodi Kayu Hangat & Ceria)',
    tag: 'MARIMBA',
    desc: 'Ketukan bilah kayu marimba bernada pentatonik ceria yang jernih, estetik, dan nyaman di telinga.'
  },
  {
    id: 'paper',
    name: '05. Acoustic Shuffle (Gesekan Kartu Kertas & Tap)',
    tag: 'PAPER',
    desc: 'Gesekan kartu kertas tebal di meja laken dan ketukan mendarat yang padat, hangat, dan alami.'
  }
];

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;
let sfxVolume = 0.85; // Default 85% volume
let currentCardStyle: CardSoundStyle = 'snap';
let marimbaNoteIndex = 0;

// Persistent Settings Initialization
if (typeof window !== 'undefined') {
  try {
    const savedMute = localStorage.getItem('minigames_hima_sfx_muted');
    if (savedMute !== null) {
      isMuted = savedMute === 'true';
    }
    const savedVol = localStorage.getItem('minigames_hima_sfx_volume');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed)) {
        sfxVolume = Math.max(0, Math.min(1, parsed));
      }
    }
    const savedCardStyle = localStorage.getItem('minigames_hima_card_sound');
    if (savedCardStyle === 'velvet') {
      currentCardStyle = 'snap';
    } else if (savedCardStyle === 'aero') {
      currentCardStyle = 'holo';
    } else if (savedCardStyle && CARD_SOUND_STYLES.some((s) => s.id === savedCardStyle)) {
      currentCardStyle = savedCardStyle as CardSoundStyle;
    }
  } catch {
    // Ignore localStorage errors
  }
}

const muteListeners = new Set<(muted: boolean) => void>();
const volumeListeners = new Set<(volume: number) => void>();
const cardStyleListeners = new Set<(style: CardSoundStyle) => void>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx) {
    if (!masterGain) {
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : sfxVolume, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }
  return audioCtx;
}

function getMasterOutput(ctx: AudioContext): AudioNode {
  if (masterGain) return masterGain;
  return ctx.destination;
}

// Helper to synthesize soft or punchy noise burst with variable frequency, Q & delay
function playNoiseBurst(
  ctx: AudioContext,
  duration = 0.08,
  gainVal = 0.08,
  filterFreq = 1800,
  filterType: BiquadFilterType = 'bandpass',
  qVal = 1.4,
  delaySeconds = 0
) {
  if (isMuted) return;
  try {
    const startTime = ctx.currentTime + delaySeconds;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, startTime);
    filter.Q.setValueAtTime(qVal, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(getMasterOutput(ctx));

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + duration + 0.01);
  } catch {
    // Ignore audio error
  }
}

export const soundFx = {
  // Toggle SFX Mute with LocalStorage & Subscriptions
  toggleMute: () => {
    isMuted = !isMuted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('minigames_hima_sfx_muted', String(isMuted));
      } catch {
        // Ignore localStorage error
      }
    }
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : sfxVolume, audioCtx.currentTime);
    }
    muteListeners.forEach((fn) => fn(isMuted));
    return isMuted;
  },

  setMuted: (muted: boolean) => {
    isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('minigames_hima_sfx_muted', String(isMuted));
      } catch {
        // Ignore localStorage error
      }
    }
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : sfxVolume, audioCtx.currentTime);
    }
    muteListeners.forEach((fn) => fn(isMuted));
  },

  isMuted: () => isMuted,

  subscribe: (callback: (muted: boolean) => void) => {
    muteListeners.add(callback);
    return () => {
      muteListeners.delete(callback);
    };
  },

  // SFX Master Volume Control (0.0 to 1.0)
  getVolume: (): number => sfxVolume,

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    sfxVolume = clamped;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('minigames_hima_sfx_volume', String(clamped));
      } catch {
        // Ignore localStorage error
      }
    }
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : sfxVolume, audioCtx.currentTime);
    }
    volumeListeners.forEach((fn) => fn(sfxVolume));
  },

  subscribeVolume: (callback: (volume: number) => void) => {
    volumeListeners.add(callback);
    callback(sfxVolume);
    return () => {
      volumeListeners.delete(callback);
    };
  },

  // Card Sound Style Selection with Backwards Compatibility
  setCardSoundStyle: (style: CardSoundStyle | 'velvet' | 'aero') => {
    let target: CardSoundStyle = 'snap';
    if (style === 'velvet') target = 'snap';
    else if (style === 'aero') target = 'holo';
    else if (CARD_SOUND_STYLES.some((s) => s.id === style)) target = style as CardSoundStyle;

    currentCardStyle = target;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('minigames_hima_card_sound', target);
      } catch {
        // Ignore localStorage error
      }
    }
    cardStyleListeners.forEach((fn) => fn(target));
  },

  cycleCardStyle: (): CardSoundStyle => {
    const styles = CARD_SOUND_STYLES.map((s) => s.id);
    const idx = styles.indexOf(currentCardStyle);
    const next = styles[(idx + 1) % styles.length];
    soundFx.setCardSoundStyle(next);
    return next;
  },

  getCardSoundStyle: (): CardSoundStyle => currentCardStyle,

  subscribeCardStyle: (callback: (style: CardSoundStyle) => void) => {
    cardStyleListeners.add(callback);
    return () => {
      cardStyleListeners.delete(callback);
    };
  },

  // -------------------------------------------------------------
  // CARD SOUND PROFILES (Flip & Slide - Punchy, Crisp & Tactile)
  // -------------------------------------------------------------

  /**
   * Realistic, High-Impact Physical Card Flip
   * @param isAuto - true when triggered by auto-slideshow (calibrated level)
   */
  playFlip: (isAuto = false) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volScale = isAuto ? 0.35 : 1.0;
    const pitchJitter = 1 + (Math.random() * 0.06 - 0.03); // +/- 3% natural organic variation

    const effectiveStyle: CardSoundStyle =
      currentCardStyle === 'velvet' ? 'snap' : currentCardStyle === 'aero' ? 'holo' : currentCardStyle;

    switch (effectiveStyle) {
      case 'holo': {
        // CYBER HOLO BADGE: Futuristik HIMA TI (Laser Whoosh + Dual Glass Resonance + Magnetic Punch)
        // 1. Digital laser whoosh
        playNoiseBurst(ctx, 0.055, 0.14 * volScale, 3800 * pitchJitter, 'bandpass', 2.2);

        // 2. Dual Glass Chime Sine Harmonics
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainHolo = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77 * pitchJitter, now + 0.005); // B5
        osc1.frequency.exponentialRampToValueAtTime(1244.5, now + 0.09); // D#6

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1479.98 * pitchJitter, now + 0.005); // F#6
        osc2.frequency.exponentialRampToValueAtTime(1760.0, now + 0.08); // A6

        gainHolo.gain.setValueAtTime(0.20 * volScale, now + 0.005);
        gainHolo.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

        osc1.connect(gainHolo);
        osc2.connect(gainHolo);
        gainHolo.connect(getMasterOutput(ctx));

        osc1.start(now + 0.005);
        osc2.start(now + 0.005);
        osc1.stop(now + 0.11);
        osc2.stop(now + 0.11);

        // 3. Magnetic Locking Thud
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(320 * pitchJitter, now + 0.01);
        subOsc.frequency.exponentialRampToValueAtTime(90, now + 0.07);
        subGain.gain.setValueAtTime(0.18 * volScale, now + 0.01);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

        subOsc.connect(subGain);
        subGain.connect(getMasterOutput(ctx));
        subOsc.start(now + 0.01);
        subOsc.stop(now + 0.08);
        break;
      }

      case 'mechanical': {
        // TACTILE SWITCH: Heavy Clicky Box Navy / Lubed Tactile Switch Clack
        // 1. Sharp Contact Snap Transient
        playNoiseBurst(ctx, 0.014, 0.28 * volScale, 4800, 'highpass', 2.8);

        // 2. Leaf Spring Metallic Click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(1900 * pitchJitter, now);
        clickOsc.frequency.exponentialRampToValueAtTime(480, now + 0.02);
        clickGain.gain.setValueAtTime(0.22 * volScale, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
        clickOsc.connect(clickGain);
        clickGain.connect(getMasterOutput(ctx));
        clickOsc.start(now);
        clickOsc.stop(now + 0.025);

        // 3. Deep Bottom-out Housing Impact (Delayed 8ms)
        const clackOsc = ctx.createOscillator();
        const clackFilter = ctx.createBiquadFilter();
        const clackGain = ctx.createGain();
        clackOsc.type = 'triangle';
        clackOsc.frequency.setValueAtTime(380 * pitchJitter, now + 0.008);
        clackOsc.frequency.exponentialRampToValueAtTime(115, now + 0.055);

        clackFilter.type = 'lowpass';
        clackFilter.frequency.setValueAtTime(1100, now + 0.008);
        clackFilter.Q.setValueAtTime(1.6, now + 0.008);

        clackGain.gain.setValueAtTime(0.32 * volScale, now + 0.008);
        clackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        clackOsc.connect(clackFilter);
        clackFilter.connect(clackGain);
        clackGain.connect(getMasterOutput(ctx));
        clackOsc.start(now + 0.008);
        clackOsc.stop(now + 0.065);
        break;
      }

      case 'marimba': {
        // MARIMBA POP: Melodi Kayu Pentatonik Cerah & Hangat
        const notes = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]; // D5, E5, G5, A5, C6, D6
        const freq = notes[marimbaNoteIndex % notes.length];
        marimbaNoteIndex = (marimbaNoteIndex + 1) % notes.length;

        // 1. Soft Mallet Strike Tap
        playNoiseBurst(ctx, 0.01, 0.16 * volScale, 3600, 'bandpass', 1.8);

        // 2. Rich Wooden Bar Fundamental + Harmonic
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq * pitchJitter, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 3.01 * pitchJitter, now); // 3rd harmonic gives rich wooden character

        gain.gain.setValueAtTime(0.24 * volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(getMasterOutput(ctx));

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);
        break;
      }

      case 'paper': {
        // ACOUSTIC SHUFFLE: Gesekan Kartu Kertas Tebal 350gsm + Tap Meja Felt
        // 1. Paper Surface Friction Swish
        playNoiseBurst(ctx, 0.06, 0.20 * volScale, 2400 * pitchJitter, 'bandpass', 1.5);

        // 2. Crisp Paper Edge Snap
        playNoiseBurst(ctx, 0.015, 0.24 * volScale, 4200, 'highpass', 2.0, 0.018);

        // 3. Felt Mat Landing Tap
        const tapOsc = ctx.createOscillator();
        const tapGain = ctx.createGain();
        tapOsc.type = 'triangle';
        tapOsc.frequency.setValueAtTime(310 * pitchJitter, now + 0.02);
        tapOsc.frequency.exponentialRampToValueAtTime(95, now + 0.08);

        tapGain.gain.setValueAtTime(0.26 * volScale, now + 0.02);
        tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

        tapOsc.connect(tapGain);
        tapGain.connect(getMasterOutput(ctx));
        tapOsc.start(now + 0.02);
        tapOsc.stop(now + 0.09);
        break;
      }

      case 'snap':
      default: {
        // CARD SNAP & SWISH (DEFAULT): Renyah, Taktil & Mantap
        // Terdiri dari multi-layer sinergis:
        // 1. Air Whoosh (desiran angin kartu berputar tajam)
        playNoiseBurst(ctx, 0.055, 0.16 * volScale, 3200 * pitchJitter, 'bandpass', 1.8);

        // 2. High-frequency Edge Flick Click (jepretan ujung kartu)
        playNoiseBurst(ctx, 0.016, 0.26 * volScale, 4500, 'highpass', 2.4, 0.012);

        // 3. Thick Card Body Resonant Snap & Solid Sub-Punch (ketukan kartu tebal mendarat)
        const snapOsc = ctx.createOscillator();
        const snapFilter = ctx.createBiquadFilter();
        const snapGain = ctx.createGain();

        snapOsc.type = 'triangle';
        snapOsc.frequency.setValueAtTime(420 * pitchJitter, now + 0.015);
        snapOsc.frequency.exponentialRampToValueAtTime(145, now + 0.08);

        snapFilter.type = 'lowpass';
        snapFilter.frequency.setValueAtTime(1600, now + 0.015);
        snapFilter.Q.setValueAtTime(1.4, now + 0.015);

        snapGain.gain.setValueAtTime(0.28 * volScale, now + 0.015);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

        snapOsc.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(getMasterOutput(ctx));
        snapOsc.start(now + 0.015);
        snapOsc.stop(now + 0.09);

        // 4. Sub-bass Body Weight (solid grounded feeling)
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(180, now + 0.015);
        subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.07);
        subGain.gain.setValueAtTime(0.22 * volScale, now + 0.015);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
        subOsc.connect(subGain);
        subGain.connect(getMasterOutput(ctx));
        subOsc.start(now + 0.015);
        subOsc.stop(now + 0.08);
        break;
      }
    }
  },

  /**
   * Subtle Card Hover / Slide
   * @param isAuto - true when triggered by auto-carousel
   */
  playCardHover: (isAuto = false) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volScale = isAuto ? 0.25 : 1.0;
    const pitchJitter = 1 + (Math.random() * 0.06 - 0.03);

    const effectiveStyle: CardSoundStyle =
      currentCardStyle === 'velvet' ? 'snap' : currentCardStyle === 'aero' ? 'holo' : currentCardStyle;

    switch (effectiveStyle) {
      case 'holo': {
        // Micro Hologram Shimmer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1175 * pitchJitter, now);
        osc.frequency.exponentialRampToValueAtTime(1480, now + 0.035);
        gain.gain.setValueAtTime(0.07 * volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(getMasterOutput(ctx));
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'mechanical': {
        // Light Micro-Switch Contact
        playNoiseBurst(ctx, 0.012, 0.08 * volScale, 4200, 'bandpass', 2.0);
        break;
      }

      case 'marimba': {
        // Soft Glassy Wood Pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 * pitchJitter, now);
        osc.frequency.exponentialRampToValueAtTime(1046, now + 0.035);
        gain.gain.setValueAtTime(0.08 * volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(getMasterOutput(ctx));
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'paper': {
        // Soft Card Glide Friction
        playNoiseBurst(ctx, 0.04, 0.07 * volScale, 2000, 'bandpass', 1.2);
        break;
      }

      case 'snap':
      default: {
        // Crisp Card Slide / Whoosh Glide
        playNoiseBurst(ctx, 0.035, 0.08 * volScale, 2800 * pitchJitter, 'bandpass', 1.6);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540 * pitchJitter, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
        gain.gain.setValueAtTime(0.07 * volScale, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(getMasterOutput(ctx));
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
    }
  },

  // Interactive Micro-Pop on Option Hover (Clean tactile marimba/glass pop)
  playOptionHover: (index: number) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const pitches = [587.33, 659.25, 783.99, 880.0, 1046.5]; // D5, E5, G5, A5, C6
    const freq = pitches[index % pitches.length] || 659.25;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.045);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    gain2.gain.setValueAtTime(0.025, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(getMasterOutput(ctx));
    gain2.connect(getMasterOutput(ctx));

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.05);
    osc2.stop(now + 0.05);
  },

  // Crisp Tactile Button Click
  playClick: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Transient snap
    playNoiseBurst(ctx, 0.012, 0.16, 3800, 'bandpass', 2.0);

    // Resonant clack
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(gain);
    gain.connect(getMasterOutput(ctx));
    osc.start(now);
    osc.stop(now + 0.04);

    // Sub thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(60, now + 0.03);
    subGain.gain.setValueAtTime(0.12, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
    subOsc.connect(subGain);
    subGain.connect(getMasterOutput(ctx));
    subOsc.start(now);
    subOsc.stop(now + 0.035);
  },

  // Rich Multi-Voice Crystalline Chime for Correct Answers
  playCorrect: (variation = 0) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25, 783.99, 1046.5, 1318.51], // C5, E5, G5, C6, E6
      [587.33, 739.99, 880.0, 1174.66, 1479.98]   // D5, F#5, A5, D6, F#6
    ];
    const notes = chords[variation % chords.length];

    const padStart = ctx.currentTime;
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = 'triangle';
    padOsc.frequency.setValueAtTime(notes[0] / 2, padStart);
    padGain.gain.setValueAtTime(0.07, padStart);
    padGain.gain.exponentialRampToValueAtTime(0.0001, padStart + 0.65);
    padOsc.connect(padGain);
    padGain.connect(getMasterOutput(ctx));
    padOsc.start(padStart);
    padOsc.stop(padStart + 0.65);

    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.06;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, start);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, start);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4500, start);

      const vol = 0.12 / (idx * 0.15 + 1);
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(getMasterOutput(ctx));

      osc1.start(start);
      osc2.start(start);
      osc1.stop(start + 0.55);
      osc2.stop(start + 0.55);
    });

    setTimeout(() => {
      if (isMuted || !ctx) return;
      const spkNow = ctx.currentTime;
      const spkOsc = ctx.createOscillator();
      const spkGain = ctx.createGain();
      spkOsc.type = 'sine';
      spkOsc.frequency.setValueAtTime(2093, spkNow);
      spkGain.gain.setValueAtTime(0.045, spkNow);
      spkGain.gain.exponentialRampToValueAtTime(0.0001, spkNow + 0.4);
      spkOsc.connect(spkGain);
      spkGain.connect(getMasterOutput(ctx));
      spkOsc.start(spkNow);
      spkOsc.stop(spkNow + 0.4);
    }, 240);
  },

  // Game-Show Clean Declined Chime
  playWrong: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const tones = [311.13, 233.08];
    tones.forEach((freq, idx) => {
      const start = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, start + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, start);

      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(getMasterOutput(ctx));

      osc.start(start);
      osc.stop(start + 0.22);
    });

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(125, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.26);
    subGain.gain.setValueAtTime(0.14, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    subOsc.connect(subGain);
    subGain.connect(getMasterOutput(ctx));
    subOsc.start(now);
    subOsc.stop(now + 0.26);
  },

  // High-Tension Arcade Digital Countdown Heartbeat Ticker
  playTick: (secondsLeft = 5) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Crisp Woodblock/Metallic Transient Snap (Cuts through BGM clearly)
    const snapFreq = secondsLeft <= 2 ? 3400 : secondsLeft <= 3 ? 2900 : 2400;
    playNoiseBurst(ctx, 0.016, secondsLeft <= 2 ? 0.12 : 0.08, snapFreq);

    // 2. Frequency Ladder with Escalating Tension for 5, 4, 3, 2, 1
    const pitchMap: Record<number, number> = {
      5: 700,
      4: 840,
      3: 1040,
      2: 1300,
      1: 1620,
      0: 1750
    };
    const baseFreq = pitchMap[secondsLeft] || (secondsLeft <= 2 ? 1400 : 800);

    // Primary Pure Pulse (Crisp Sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.12, now + 0.045);

    // Harmonic Body (Triangle Overtone for rich presence)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, now + 0.035);

    // Sub-harmonic Punch (Tactile clock thump / heartbeat)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

    // Volume scaling: Significantly louder, clear, and punchy
    const baseVol = secondsLeft <= 1 ? 0.28 : secondsLeft <= 3 ? 0.23 : 0.18;

    gain1.gain.setValueAtTime(baseVol, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + (secondsLeft <= 2 ? 0.08 : 0.06));

    gain2.gain.setValueAtTime(baseVol * 0.45, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    subGain.gain.setValueAtTime(baseVol * 0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    const master = getMasterOutput(ctx);
    osc1.connect(gain1);
    gain1.connect(master);
    osc2.connect(gain2);
    gain2.connect(master);
    subOsc.connect(subGain);
    subGain.connect(master);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now);
    osc2.stop(now + 0.06);
    subOsc.start(now);
    subOsc.stop(now + 0.05);

    // 3. Urgent Double Pulse for the final critical seconds (2s & 1s)
    if (secondsLeft <= 2) {
      setTimeout(() => {
        if (isMuted || !ctx) return;
        const now2 = ctx.currentTime;
        const echoOsc = ctx.createOscillator();
        const echoGain = ctx.createGain();
        echoOsc.type = 'sine';
        echoOsc.frequency.setValueAtTime(baseFreq * 1.22, now2);
        echoGain.gain.setValueAtTime(baseVol * 0.65, now2);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.04);
        echoOsc.connect(echoGain);
        echoGain.connect(getMasterOutput(ctx));
        echoOsc.start(now2);
        echoOsc.stop(now2 + 0.04);
      }, 75);
    }
  },

  // Heavy Physical Verification Stamp Thud
  playStamp: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playNoiseBurst(ctx, 0.05, 0.08, 750);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(getMasterOutput(ctx));
    osc.start(now);
    osc.stop(now + 0.2);
  },

  // Triumphant Grand Arcade Fanfare for Quiz Victory
  playWin: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const fanfare = [
      { freq: 523.25, time: 0.00, dur: 0.14, type: 'triangle' as const },
      { freq: 659.25, time: 0.12, dur: 0.14, type: 'triangle' as const },
      { freq: 783.99, time: 0.24, dur: 0.14, type: 'triangle' as const },
      { freq: 1046.5, time: 0.38, dur: 0.45, type: 'sine' as const },
      { freq: 1318.5, time: 0.44, dur: 0.50, type: 'sine' as const },
      { freq: 1567.9, time: 0.50, dur: 0.60, type: 'sine' as const },
      { freq: 2093.0, time: 0.56, dur: 0.75, type: 'sine' as const },
    ];

    fanfare.forEach((note) => {
      const start = ctx.currentTime + note.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, start);

      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

      osc.connect(gain);
      gain.connect(getMasterOutput(ctx));
      osc.start(start);
      osc.stop(start + note.dur);
    });
  },

  // High-Tech Cyber Scan Sweep (Game Mode Only)
  playCyberScan: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.14);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(getMasterOutput(ctx));
    osc.start(now);
    osc.stop(now + 0.14);
  },

  // High-Tech Cyber Glitch Pulse (Game Mode Only)
  playGlitch: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.setValueAtTime(320, now + 0.02);
    osc.frequency.setValueAtTime(1400, now + 0.045);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(getMasterOutput(ctx));
    osc.start(now);
    osc.stop(now + 0.07);
  },

  // Tactical Sonar Ping (Game Mode Only)
  playSonarPing: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.35);

    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(gain);
    gain.connect(getMasterOutput(ctx));
    osc.start(now);
    osc.stop(now + 0.38);
  },

  // Aperture Camera Shutter (Game Mode Only)
  playShutter: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playNoiseBurst(ctx, 0.06, 0.05, 2000);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(80, now + 0.025);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(getMasterOutput(ctx));
    osc.start(now);
    osc.stop(now + 0.06);
  }
};

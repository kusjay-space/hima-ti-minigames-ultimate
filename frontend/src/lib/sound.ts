// Web Audio API Synthesizer - Zero External Files, 100% Reliable Offline
// Enhanced Interactive & Dynamic Audio Engine

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Helper to synthesize soft white noise burst
function playNoiseBurst(ctx: AudioContext, duration = 0.08, gainVal = 0.03, filterFreq = 1800) {
  try {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(ctx.currentTime);
  } catch {
    // Ignore audio error
  }
}

export const soundFx = {
  toggleMute: () => {
    isMuted = !isMuted;
    return isMuted;
  },

  isMuted: () => isMuted,

  // Interactive Micro-Pop on Option Hover (Clean tactile marimba/glass pop with harmonic sparkle)
  playOptionHover: (index: number) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const pitches = [587.33, 659.25, 783.99, 880.0, 1046.5]; // D5, E5, G5, A5, C6 (pentatonic scale)
    const freq = pitches[index % pitches.length] || 659.25;

    const now = ctx.currentTime;
    // Fundamental sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.04);

    // Soft glassy overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    gain2.gain.setValueAtTime(0.012, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.045);
    osc2.stop(now + 0.045);
  },

  // Interactive Subtle Hover on Card (Airy holographic shimmer glide)
  playCardHover: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(840, now);
    osc.frequency.exponentialRampToValueAtTime(1420, now + 0.05);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.value = 2.5;

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  },

  // Crisp Tactile Mechanical Switch Click
  playClick: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Transient 1: Mechanical contact micro-click
    playNoiseBurst(ctx, 0.012, 0.04, 3400);

    // Transient 2: Subtle bottom-out tactile resonance
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, now + 0.006);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

    gain.gain.setValueAtTime(0.05, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + 0.006);
    osc.stop(now + 0.038);
  },

  // Rich Multi-Voice Crystalline Chime for Correct Answers (High-end arcade reward fanfare)
  playCorrect: (variation = 0) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25, 783.99, 1046.5, 1318.51], // C5, E5, G5, C6, E6
      [587.33, 739.99, 880.0, 1174.66, 1479.98]   // D5, F#5, A5, D6, F#6
    ];
    const notes = chords[variation % chords.length];

    // 1. Warm harmonic pad underneath
    const padStart = ctx.currentTime;
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = 'triangle';
    padOsc.frequency.setValueAtTime(notes[0] / 2, padStart); // C4 base
    padGain.gain.setValueAtTime(0.08, padStart);
    padGain.gain.exponentialRampToValueAtTime(0.0001, padStart + 0.65);
    padOsc.connect(padGain);
    padGain.connect(ctx.destination);
    padOsc.start(padStart);
    padOsc.stop(padStart + 0.65);

    // 2. Crystalline Celeste Arpeggio with smooth decay
    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.06;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Pure fundamental bell
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, start);

      // High shimmer overtone
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, start);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4500, start);

      const vol = 0.13 / (idx * 0.15 + 1);
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(start);
      osc2.start(start);
      osc1.stop(start + 0.55);
      osc2.stop(start + 0.55);
    });

    // 3. Ultra-high sparkle chime at the peak
    setTimeout(() => {
      if (!ctx) return;
      const spkNow = ctx.currentTime;
      const spkOsc = ctx.createOscillator();
      const spkGain = ctx.createGain();
      spkOsc.type = 'sine';
      spkOsc.frequency.setValueAtTime(2093, spkNow); // C7 sparkle
      spkGain.gain.setValueAtTime(0.05, spkNow);
      spkGain.gain.exponentialRampToValueAtTime(0.0001, spkNow + 0.4);
      spkOsc.connect(spkGain);
      spkGain.connect(ctx.destination);
      spkOsc.start(spkNow);
      spkOsc.stop(spkNow + 0.4);
    }, 240);
  },

  // Game-Show Clean Declined Chime (Warm descending 2-tone soft bonk + gentle sub-bass)
  playWrong: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Two-tone descending soft "rejected" chime (Eb4 -> Bb3)
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

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.22);
    });

    // Soft sub thud at beginning
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(125, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.26);
    subGain.gain.setValueAtTime(0.16, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.26);
  },

  // Escalating High-Tech Digital Stopwatch Tick
  playTick: (secondsLeft = 3) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Crisp woodblock/sonar transient click
    playNoiseBurst(ctx, 0.012, 0.025, 2600);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freqs = [1480, 1150, 920, 750]; // 1s, 2s, 3s, 4s+
    const baseFreq = freqs[Math.min(Math.max(secondsLeft - 1, 0), 3)] || 880;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.08, now + 0.04);

    const vol = secondsLeft <= 2 ? 0.09 : 0.045;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    // Urgent double-pulse when 1s remains
    if (secondsLeft === 1) {
      setTimeout(() => {
        if (!ctx) return;
        const now2 = ctx.currentTime;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1680, now2);
        gain2.gain.setValueAtTime(0.07, now2);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.04);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.04);
      }, 65);
    }
  },

  // Realistic Physical Card Flip with Aerodynamic Flutter
  playFlip: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Filtered air noise burst
    playNoiseBurst(ctx, 0.14, 0.05, 1600);

    // Resonant card flutter
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  },

  // Heavy Physical Verification Stamp Thud
  playStamp: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playNoiseBurst(ctx, 0.05, 0.09, 750);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

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

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + note.dur);
    });
  },

  playCyberScan: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.16);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  },

  playGlitch: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.setValueAtTime(280, now + 0.02);
    osc.frequency.setValueAtTime(1900, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  },

  playSonarPing: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  },

  playShutter: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playNoiseBurst(ctx, 0.07, 0.06, 2400);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(90, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }
};

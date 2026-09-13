// Web Audio API Procedural Background Music Engine - Multi-Variation Arcade Soundtrack
// Features 4 Distinct Quizizz / Kahoot / Cyberpunk Themes + Auto-Cycling + Zero-Lag Scheduling

export type BgmTrackMode = 'auto' | 'funky' | 'blitz' | 'cyber' | 'pixel';

export interface BgmTrackInfo {
  id: BgmTrackMode;
  name: string;
  tag: string;
  bpm: number;
}

export const BGM_TRACKS: BgmTrackInfo[] = [
  { id: 'auto', name: 'Auto-Cycle (Berganti Otomatis)', tag: 'AUTO', bpm: 126 },
  { id: 'funky', name: '01. Funky Quizizz (Arcade Bounce)', tag: 'FUNK', bpm: 126 },
  { id: 'blitz', name: '02. Kahoot Blitz (Tension Rush)', tag: 'BLITZ', bpm: 130 },
  { id: 'cyber', name: '03. Cyberpunk 80s (Outrun Neon)', tag: 'CYBER', bpm: 122 },
  { id: 'pixel', name: '04. 8-Bit Pixel (Retro Gameboy)', tag: 'PIXEL', bpm: 128 },
];

class BgmEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private isEnabled = true;
  private trackMode: BgmTrackMode = 'auto';
  private activeThemeIndex = 0; // 0: funky, 1: blitz, 2: cyber, 3: pixel
  private currentStep = 0;
  private nextStepTime = 0;
  private timerId: number | null = null;
  private listeners: Set<(enabled: boolean, track: BgmTrackMode, themeName: string) => void> = new Set();
  private noiseBuffer: AudioBuffer | null = null;

  private readonly TOTAL_STEPS = 128; // 8-bar loop (16 steps per bar)
  private readonly LOOKAHEAD_MS = 25;
  private readonly SCHEDULE_AHEAD_TIME = 0.12; // 120ms lookahead

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('minigames_hima_bgm_enabled');
      // Default to true (music ON) unless user explicitly turned it off
      this.isEnabled = savedEnabled === null ? true : savedEnabled === 'true';

      const savedTrack = localStorage.getItem('minigames_hima_bgm_track') as BgmTrackMode;
      if (savedTrack && BGM_TRACKS.some((t) => t.id === savedTrack)) {
        this.trackMode = savedTrack;
        if (savedTrack !== 'auto') {
          this.activeThemeIndex = ['funky', 'blitz', 'cyber', 'pixel'].indexOf(savedTrack);
        }
      }

      // Proactively start if enabled
      if (this.isEnabled) {
        setTimeout(() => {
          this.start();
        }, 50);
      }

      // Unconditional gesture & movement listeners to unlock/resume audio in case browser blocked autoplay
      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.isEnabled && !this.isRunning) {
          this.start();
        }
      };

      const interactionEvents = ['pointerdown', 'pointermove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];
      interactionEvents.forEach((evt) => {
        window.addEventListener(evt, unlockAudio, { passive: true });
      });
    }
  }

  private initAudio() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Warm master filter to keep music soft & smooth under SFX
    const warmFilter = this.ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.setValueAtTime(10500, this.ctx.currentTime);
    warmFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.masterGain.connect(warmFilter);
    warmFilter.connect(this.ctx.destination);

    // Pre-generate white noise buffer for drums & percussions
    const bufferSize = this.ctx.sampleRate * 1;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private m2f(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private getCurrentBPM(): number {
    const theme = this.getActiveThemeId();
    switch (theme) {
      case 'blitz': return 130;
      case 'cyber': return 122;
      case 'pixel': return 128;
      case 'funky':
      default: return 126;
    }
  }

  private getStepDuration(): number {
    return (60 / this.getCurrentBPM()) / 4; // 16th note step
  }

  public getActiveThemeId(): 'funky' | 'blitz' | 'cyber' | 'pixel' {
    if (this.trackMode !== 'auto') {
      return this.trackMode as 'funky' | 'blitz' | 'cyber' | 'pixel';
    }
    const themes: ('funky' | 'blitz' | 'cyber' | 'pixel')[] = ['funky', 'blitz', 'cyber', 'pixel'];
    return themes[this.activeThemeIndex % themes.length];
  }

  public getActiveThemeName(): string {
    const active = this.getActiveThemeId();
    const track = BGM_TRACKS.find((t) => t.id === active);
    return track ? track.name : '01. Funky Quizizz';
  }

  public getTrackMode(): BgmTrackMode {
    return this.trackMode;
  }

  public getCurrentTrackInfo(): { mode: BgmTrackMode; tag: string; name: string } {
    const track = BGM_TRACKS.find((t) => t.id === this.trackMode);
    return {
      mode: this.trackMode,
      tag: track ? track.tag : 'BGM',
      name: track ? track.name : 'Theme',
    };
  }

  // --- Instrument Synthesizers ---

  private playKick(time: number, punch = 1) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(155 * punch, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.085);

    gain.gain.setValueAtTime(0.38 * punch, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playSnare(time: number, gated = false) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(gated ? 1800 : 2200, time);
    filter.Q.setValueAtTime(gated ? 1.2 : 2.0, time);

    const noiseGain = this.ctx.createGain();
    const dur = gated ? 0.18 : 0.11;
    noiseGain.gain.setValueAtTime(gated ? 0.17 : 0.14, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + dur + 0.01);

    // Body tone
    const osc = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.075);

    toneGain.gain.setValueAtTime(0.12, time);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.075);

    osc.connect(toneGain);
    toneGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  private playHiHat(time: number, isOpen = false, isChiptune = false) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isChiptune ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(isChiptune ? 4500 : 8000, time);
    filter.Q.setValueAtTime(isChiptune ? 3.5 : 2.0, time);

    const gain = this.ctx.createGain();
    const duration = isOpen ? 0.14 : 0.038;
    const volume = isOpen ? 0.075 : 0.045;

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration + 0.01);
  }

  private playBass(note: number, time: number, type: 'funky' | 'blitz' | 'cyber' | 'pixel' = 'funky', isAccent = false) {
    if (!this.ctx || !this.masterGain) return;
    const freq = this.m2f(note);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (type === 'pixel') {
      osc.type = 'square';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.Q.setValueAtTime(1.0, time);
      gain.gain.setValueAtTime(isAccent ? 0.18 : 0.13, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    } else if (type === 'cyber') {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(2.2, time);
      filter.frequency.setValueAtTime(isAccent ? 900 : 600, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + 0.15);
      gain.gain.setValueAtTime(0.20, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    } else if (type === 'blitz') {
      // Galloping energetic electro bass
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4.5, time);
      filter.frequency.setValueAtTime(isAccent ? 1600 : 950, time);
      filter.frequency.exponentialRampToValueAtTime(200, time + 0.095);
      gain.gain.setValueAtTime(isAccent ? 0.23 : 0.17, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.10);
    } else {
      // Squelchy Funky Quizizz Moog/Juno Bass
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4.0, time);
      filter.frequency.setValueAtTime(isAccent ? 1400 : 850, time);
      filter.frequency.exponentialRampToValueAtTime(170, time + 0.125);
      gain.gain.setValueAtTime(isAccent ? 0.22 : 0.16, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playPluck(note: number, time: number, type: 'funky' | 'blitz' | 'cyber' | 'pixel' = 'funky', isHigh = false) {
    if (!this.ctx || !this.masterGain) return;
    const freq = this.m2f(note);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (type === 'pixel') {
      osc1.type = 'square';
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 2, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, time);
      filter.Q.setValueAtTime(1.0, time);
      gain.gain.setValueAtTime(isHigh ? 0.08 : 0.065, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
    } else if (type === 'cyber') {
      // Lush synthwave analog pluck
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.003, time); // Subtle lush detune
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHigh ? 3800 : 2800, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + 0.2);
      filter.Q.setValueAtTime(2.0, time);
      gain.gain.setValueAtTime(isHigh ? 0.09 : 0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    } else if (type === 'blitz') {
      // Punchy Kahoot electro brass stab
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHigh ? 4200 : 3200, time);
      filter.frequency.exponentialRampToValueAtTime(1100, time + 0.13);
      filter.Q.setValueAtTime(3.2, time);
      gain.gain.setValueAtTime(isHigh ? 0.11 : 0.085, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    } else {
      // Playful chiptune pluck
      osc1.type = 'square';
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHigh ? 3600 : 2600, time);
      filter.frequency.exponentialRampToValueAtTime(650, time + 0.15);
      filter.Q.setValueAtTime(1.5, time);
      gain.gain.setValueAtTime(isHigh ? 0.09 : 0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    }

    osc1.frequency.setValueAtTime(freq, time);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.23);
    osc2.stop(time + 0.23);
  }

  // --- Theme Step Sequencer Logic ---

  private scheduleTheme(theme: 'funky' | 'blitz' | 'cyber' | 'pixel', step: number, time: number) {
    const isTensionSection = step >= 64;

    if (theme === 'blitz') {
      // ===== THEME 2: KAHOOT BLITZ (130 BPM, A Minor / Electro Tension) =====
      // Drums: Driving four-on-the-floor
      if (step % 4 === 0) this.playKick(time, 1.1);
      if (step % 8 === 4) this.playSnare(time);
      if (step % 2 === 0) this.playHiHat(time, isTensionSection && (step % 4 === 2));
      if (step >= 120) this.playHiHat(time, false);

      // Galloping 16th Bass
      const roots = [45, 45, 41, 43]; // A1, A1, F1, G1
      const barRoot = isTensionSection ? (step < 80 ? 45 : step < 96 ? 48 : step < 112 ? 50 : 52) : roots[Math.floor((step % 64) / 16)];
      if (step % 2 === 0) {
        const isUpper = (step % 4 === 2);
        this.playBass(isUpper ? barRoot + 12 : barRoot, time, 'blitz', step % 4 === 0);
      }

      // Melodic Stabs & Tension Arp
      const blitzStabs: Record<number, number> = {
        0: 69, 4: 72, 8: 76, 12: 81,
        16: 67, 20: 71, 24: 74, 28: 79,
        32: 65, 36: 69, 40: 72, 44: 77,
        48: 64, 52: 68, 56: 71, 60: 76,
        // Tension Countdown Ascents
        64: 81, 66: 81, 68: 84, 72: 86, 76: 88,
        80: 81, 82: 81, 86: 88, 90: 86, 92: 84,
        96: 77, 98: 81, 102: 84, 104: 88, 108: 91,
        112: 93, 114: 93, 116: 91, 118: 88, 120: 86, 122: 84, 124: 81, 126: 76
      };
      if (blitzStabs[step]) {
        this.playPluck(blitzStabs[step], time, 'blitz', blitzStabs[step] >= 76);
      }

    } else if (theme === 'cyber') {
      // ===== THEME 3: CYBERPUNK 80s (122 BPM, F# Minor Outrun) =====
      if (step % 8 === 0 || step % 16 === 10) this.playKick(time, 1.2);
      if (step % 8 === 4) this.playSnare(time, true); // Gated 80s snare
      if (step % 2 === 0) this.playHiHat(time, step % 4 === 2);

      // Rolling 80s Synthwave Bass
      const cyberRoots = [42, 45, 38, 40]; // F#1, A1, D1, E1
      const root = cyberRoots[Math.floor((step % 64) / 16)];
      if (step % 2 === 0) {
        this.playBass(root, time, 'cyber', step % 4 === 0);
      }

      // Neon Lead Melody
      const cyberLead: Record<number, number> = {
        0: 73, 4: 76, 8: 78, 14: 81,
        16: 80, 20: 78, 24: 76, 28: 73,
        32: 74, 36: 78, 40: 81, 46: 85,
        48: 83, 52: 81, 56: 80, 60: 78,
        // Chorus hook
        64: 85, 68: 85, 72: 83, 76: 81,
        80: 80, 84: 81, 88: 83, 92: 85,
        96: 86, 100: 85, 104: 83, 108: 81,
        112: 80, 116: 78, 120: 76, 124: 73
      };
      if (cyberLead[step]) {
        this.playPluck(cyberLead[step], time, 'cyber', true);
      }

    } else if (theme === 'pixel') {
      // ===== THEME 4: 8-BIT PIXEL ARCADE (128 BPM, C Major Chiptune) =====
      if (step % 4 === 0) this.playKick(time, 0.9);
      if (step % 8 === 4) this.playSnare(time);
      if (step % 2 === 0) this.playHiHat(time, false, true);

      // Walking Chiptune Bass
      const pixelBass: Record<number, number> = {
        0: 36, 4: 40, 8: 43, 12: 45,
        16: 41, 20: 45, 24: 48, 28: 50,
        32: 43, 36: 47, 40: 50, 44: 53,
        48: 36, 52: 43, 56: 48, 60: 47,
        // Tension section
        64: 36, 68: 36, 72: 41, 76: 41,
        80: 43, 84: 43, 88: 45, 92: 45,
        96: 48, 100: 48, 104: 50, 108: 50,
        112: 52, 116: 50, 120: 47, 124: 43
      };
      if (pixelBass[step]) {
        this.playBass(pixelBass[step], time, 'pixel', step % 4 === 0);
      }

      // Cheerful Mario/NES Arcade Melody
      const pixelLead: Record<number, number> = {
        0: 60, 2: 64, 4: 67, 6: 72, 8: 76, 10: 72, 12: 67, 14: 64,
        16: 65, 18: 69, 20: 72, 22: 77, 24: 76, 26: 72, 28: 69, 30: 65,
        32: 67, 34: 71, 36: 74, 38: 79, 40: 77, 42: 74, 44: 71, 46: 67,
        48: 60, 50: 64, 52: 67, 54: 72, 56: 76, 58: 79, 60: 84, 62: 83,
        // High hook
        64: 84, 66: 84, 70: 84, 74: 79, 78: 81,
        80: 83, 82: 83, 86: 84, 90: 81, 94: 79,
        96: 81, 98: 84, 102: 88, 106: 91,
        112: 96, 114: 95, 116: 93, 118: 91, 120: 88, 122: 84, 124: 79, 126: 72
      };
      if (pixelLead[step]) {
        this.playPluck(pixelLead[step], time, 'pixel', pixelLead[step] >= 76);
      }

    } else {
      // ===== THEME 1: FUNKY QUIZIZZ (126 BPM, D Dorian Bounce) =====
      const isMainBeat = step % 4 === 0;
      const isPickupKick = step % 16 === 14;
      if (isMainBeat || isPickupKick) this.playKick(time);
      if (step % 8 === 4) this.playSnare(time);
      if (step % 2 === 0) this.playHiHat(time, isTensionSection && (step % 4 === 2));
      if ((step >= 60 && step <= 63) || (step >= 124 && step <= 127)) this.playHiHat(time, false);

      if (!isTensionSection) {
        const bassTable: Record<number, { note: number; accent?: boolean }> = {
          0: { note: 38, accent: true }, 2: { note: 38 }, 5: { note: 41 },
          8: { note: 43, accent: true }, 10: { note: 43 }, 12: { note: 45 }, 14: { note: 48 },
          16: { note: 38, accent: true }, 18: { note: 38 }, 22: { note: 41 },
          24: { note: 43, accent: true }, 26: { note: 45 }, 28: { note: 41 }, 30: { note: 40 },
          32: { note: 34, accent: true }, 34: { note: 34 }, 38: { note: 38 },
          40: { note: 41, accent: true }, 42: { note: 41 }, 44: { note: 43 }, 46: { note: 45 },
          48: { note: 36, accent: true }, 50: { note: 36 }, 54: { note: 40 },
          56: { note: 43, accent: true }, 58: { note: 45 }, 60: { note: 48 }, 62: { note: 49 },
        };
        if (bassTable[step]) this.playBass(bassTable[step].note, time, 'funky', !!bassTable[step].accent);

        const arpTable: Record<number, number> = {
          0: 62, 2: 65, 4: 69, 6: 74, 8: 72, 10: 69, 12: 65, 14: 67,
          16: 62, 18: 65, 20: 67, 22: 69, 24: 77, 26: 76, 28: 74, 30: 72,
          32: 62, 34: 65, 36: 70, 38: 74, 40: 72, 42: 70, 44: 69, 46: 65,
          48: 64, 50: 67, 52: 72, 54: 76, 56: 74, 58: 72, 60: 69, 62: 73,
        };
        if (arpTable[step] !== undefined) this.playPluck(arpTable[step], time, 'funky', arpTable[step] >= 72);
      } else {
        const root = step < 80 ? 38 : step < 96 ? 41 : step < 112 ? 43 : 45;
        if (step % 2 === 0) {
          const isUpper = (step % 4 === 2);
          this.playBass(isUpper ? root + 12 : root, time, 'funky', step % 4 === 0);
        }
        const hookTable: Record<number, number> = {
          64: 74, 66: 74, 70: 77, 74: 79, 76: 81,
          80: 74, 82: 74, 86: 84, 88: 81, 92: 79,
          96: 77, 98: 79, 102: 81, 104: 84, 108: 86,
          112: 88, 114: 88, 116: 86, 118: 84, 120: 81, 122: 79, 124: 76, 126: 73
        };
        if (hookTable[step] !== undefined) this.playPluck(hookTable[step], time, 'funky', true);
      }
    }
  }

  // Lookahead scheduler loop
  private scheduler = () => {
    if (!this.isRunning || !this.ctx) return;

    while (this.nextStepTime < this.ctx.currentTime + this.SCHEDULE_AHEAD_TIME) {
      const activeTheme = this.getActiveThemeId();
      this.scheduleTheme(activeTheme, this.currentStep, this.nextStepTime);

      const stepDuration = this.getStepDuration();
      this.nextStepTime += stepDuration;

      const nextStep = (this.currentStep + 1) % this.TOTAL_STEPS;
      // When a loop completes (after 128 steps):
      if (nextStep === 0 && this.trackMode === 'auto') {
        // Automatically progress to next musical variation
        this.activeThemeIndex = (this.activeThemeIndex + 1) % 4;
        this.notifyListeners();
      }
      this.currentStep = nextStep;
    }
  };

  public start() {
    if (this.isRunning) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Smooth fade in
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.35);

    this.isRunning = true;
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
    this.timerId = window.setInterval(this.scheduler, this.LOOKAHEAD_MS);
    this.notifyListeners();
  }

  public stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) {
      this.isRunning = false;
      return;
    }

    try {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
    } catch {
      // Ignore audio error
    }

    window.setTimeout(() => {
      if (!this.isEnabled) {
        if (this.timerId !== null) {
          window.clearInterval(this.timerId);
          this.timerId = null;
        }
        this.isRunning = false;
      }
    }, 220);
    this.notifyListeners();
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('minigames_hima_bgm_enabled', String(this.isEnabled));
    }

    if (this.isEnabled) {
      this.start();
    } else {
      this.stop();
    }

    this.notifyListeners();
    return this.isEnabled;
  }

  public setTrackMode(mode: BgmTrackMode) {
    this.trackMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('minigames_hima_bgm_track', mode);
    }
    if (mode !== 'auto') {
      const idx = ['funky', 'blitz', 'cyber', 'pixel'].indexOf(mode);
      if (idx !== -1) this.activeThemeIndex = idx;
    }
    this.notifyListeners();
  }

  public cycleNextTrack(): BgmTrackMode {
    const modes: BgmTrackMode[] = ['auto', 'funky', 'blitz', 'cyber', 'pixel'];
    const currentIdx = modes.indexOf(this.trackMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    this.setTrackMode(nextMode);
    return nextMode;
  }

  public isMusicEnabled(): boolean {
    return this.isEnabled;
  }

  public isMusicPlaying(): boolean {
    return this.isRunning && this.isEnabled;
  }

  public subscribe(listener: (enabled: boolean, track: BgmTrackMode, themeName: string) => void): () => void {
    this.listeners.add(listener);
    listener(this.isEnabled, this.trackMode, this.getActiveThemeName());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const themeName = this.getActiveThemeName();
    this.listeners.forEach((l) => l(this.isEnabled, this.trackMode, themeName));
  }
}

export const bgm = new BgmEngine();

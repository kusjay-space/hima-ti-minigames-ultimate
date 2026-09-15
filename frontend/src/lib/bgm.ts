// Web Audio API Procedural Background Music Engine - Multi-Genre Stand Soundtrack
// Features 5 Truly Distinct Musical Genres with Authentic Instruments, Rhythms, and Smooth Crossfades

export type BgmTrackMode = 'auto' | 'funky' | 'blitz' | 'cyber' | 'pixel' | 'lofi';

export interface BgmTrackInfo {
  id: BgmTrackMode;
  name: string;
  tag: string;
  bpm: number;
  genre: string;
  desc: string;
}

export const BGM_TRACKS: BgmTrackInfo[] = [
  {
    id: 'auto',
    name: 'Auto-Cycle (Ganti Tema Tiap Selesai Loop)',
    tag: 'AUTO',
    bpm: 124,
    genre: 'Dynamic Mix',
    desc: 'Berganti gaya musik secara otomatis dan mulus setiap kali putaran lagu selesai.'
  },
  {
    id: 'funky',
    name: '01. Funky Arcade (Quizizz Bounce)',
    tag: 'FUNK',
    bpm: 124,
    genre: 'Disco Funk',
    desc: 'Beat disko ceria, slap bass lincah, dan synth playful bergaya game show Quizizz.'
  },
  {
    id: 'blitz',
    name: '02. Kahoot Blitz (Tension Rush)',
    tag: 'BLITZ',
    bpm: 134,
    genre: 'Electro Tension',
    desc: 'Beat 4-on-the-floor cepat, rolling bassline EDM, dan akord brass menegangkan.'
  },
  {
    id: 'cyber',
    name: '03. Synthwave 80s (Retro Outrun)',
    tag: 'CYBER',
    bpm: 112,
    genre: '80s Retrowave',
    desc: 'Ketukan lambat berbobot, gated snare 80s, analog sub-bass, dan pad neon bernuansa cyberpunk.'
  },
  {
    id: 'pixel',
    name: '04. 8-Bit Pixel (Chiptune Gameboy)',
    tag: 'PIXEL',
    bpm: 138,
    genre: 'Chiptune NES',
    desc: 'Suara asli konsol retro 8-bit: gelombang square arpeggio dan triangle bass yang seru dan nostalgia.'
  },
  {
    id: 'lofi',
    name: '05. Lo-Fi Chill (Jazzy Stand Beat)',
    tag: 'LO-FI',
    bpm: 88,
    genre: 'Lo-Fi Hip-Hop',
    desc: 'Tempo santai 88 BPM, Rhodes electric piano dengan akord jazz hangat, rimshot empuk, dan sub bass santai.'
  },
];

type ActiveThemeId = 'funky' | 'blitz' | 'cyber' | 'pixel' | 'lofi';

class BgmEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private warmFilter: BiquadFilterNode | null = null;
  private isRunning = false;
  private isEnabled = true;
  private volume = 0.65; // Default 65% volume
  private trackMode: BgmTrackMode = 'auto';
  private activeThemeIndex = 0; // 0: funky, 1: blitz, 2: cyber, 3: pixel, 4: lofi
  private currentStep = 0;
  private nextStepTime = 0;
  private timerId: number | null = null;
  private transitionTimer: number | null = null;
  private isCrossfading = false;
  private listeners: Set<(enabled: boolean, track: BgmTrackMode, themeName: string, volume: number) => void> = new Set();
  private noiseBuffer: AudioBuffer | null = null;

  private readonly TOTAL_STEPS = 128; // 8 bars (16 steps per bar)
  private readonly LOOKAHEAD_MS = 25;
  private readonly SCHEDULE_AHEAD_TIME = 0.14; // 140ms lookahead

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('minigames_hima_bgm_enabled');
      this.isEnabled = savedEnabled === null ? true : savedEnabled === 'true';

      const savedVol = localStorage.getItem('minigames_hima_bgm_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) {
          this.volume = Math.max(0, Math.min(1, parsed));
        }
      }

      const savedTrack = localStorage.getItem('minigames_hima_bgm_track') as BgmTrackMode;
      if (savedTrack && BGM_TRACKS.some((t) => t.id === savedTrack)) {
        this.trackMode = savedTrack;
        if (savedTrack !== 'auto') {
          const themes: ActiveThemeId[] = ['funky', 'blitz', 'cyber', 'pixel', 'lofi'];
          const idx = themes.indexOf(savedTrack as ActiveThemeId);
          if (idx !== -1) this.activeThemeIndex = idx;
        }
      }

      if (this.isEnabled) {
        setTimeout(() => {
          this.start();
        }, 50);
      }

      // Auto-unlock audio on user gesture
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

  private getEffectiveGain(): number {
    return this.volume * 0.28;
  }

  private initAudio() {
    if (this.ctx) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isEnabled ? this.getEffectiveGain() : 0.0001, this.ctx.currentTime);

    // Warm master filter
    this.warmFilter = this.ctx.createBiquadFilter();
    this.warmFilter.type = 'lowpass';
    this.warmFilter.frequency.setValueAtTime(11000, this.ctx.currentTime);
    this.warmFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.masterGain.connect(this.warmFilter);
    this.warmFilter.connect(this.ctx.destination);

    // Noise buffer for drums & percussions
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

  public getActiveThemeId(): ActiveThemeId {
    if (this.trackMode !== 'auto') {
      return this.trackMode as ActiveThemeId;
    }
    const themes: ActiveThemeId[] = ['funky', 'blitz', 'cyber', 'pixel', 'lofi'];
    return themes[this.activeThemeIndex % themes.length];
  }

  public getActiveThemeName(): string {
    const active = this.getActiveThemeId();
    const track = BGM_TRACKS.find((t) => t.id === active);
    return track ? track.name : '01. Funky Arcade';
  }

  public getCurrentBPM(): number {
    const theme = this.getActiveThemeId();
    switch (theme) {
      case 'lofi':
        return 88;
      case 'cyber':
        return 112;
      case 'blitz':
        return 134;
      case 'pixel':
        return 138;
      case 'funky':
      default:
        return 124;
    }
  }

  private getStepDuration(): number {
    return (60 / this.getCurrentBPM()) / 4; // 16th note step
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

  // =========================================================================
  // INSTRUMENT SYNTHESIZERS (Customized Per Genre)
  // =========================================================================

  /**
   * KICK DRUM: Genre-specific punch, body, and curve
   */
  private playKick(time: number, genre: ActiveThemeId, punch = 1) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (genre === 'lofi') {
      // Muffled, warm low-end thump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);
      gain.gain.setValueAtTime(0.32 * punch, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
    } else if (genre === 'cyber') {
      // 80s Deep Gated Kick with punchy click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * punch, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.14);
      gain.gain.setValueAtTime(0.42 * punch, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    } else if (genre === 'blitz') {
      // High-energy EDM four-on-the-floor kick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 * punch, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);
      gain.gain.setValueAtTime(0.44 * punch, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
    } else if (genre === 'pixel') {
      // 8-bit sweep kick
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.06);
      gain.gain.setValueAtTime(0.25 * punch, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.065);
    } else {
      // Funky acoustic-style disco kick with click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(155 * punch, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.09);
      gain.gain.setValueAtTime(0.38 * punch, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  /**
   * SNARE / CLAP / RIMSHOT: Genre-specific backbeat
   */
  private playSnare(time: number, genre: ActiveThemeId, isAccent = false) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    if (genre === 'lofi') {
      // Warm jazzy cross-stick / rimshot
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, time);
      osc.frequency.exponentialRampToValueAtTime(160, time + 0.04);
      oscGain.gain.setValueAtTime(0.24, time);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.05);

      // Subtle noise tap
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.Q.setValueAtTime(1.0, time);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.05);
      return;
    }

    if (genre === 'pixel') {
      // Chiptune white-noise snare
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, time);
      filter.Q.setValueAtTime(1.2, time);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.09);
      return;
    }

    // Noise body for Funky, Blitz, Cyber
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';

    const isCyber = genre === 'cyber';
    filter.frequency.setValueAtTime(isCyber ? 1800 : 2300, time);
    filter.Q.setValueAtTime(isCyber ? 1.1 : 2.0, time);

    const noiseGain = this.ctx.createGain();
    const dur = isCyber ? 0.20 : 0.11; // 80s gated snare has longer tail
    const vol = isCyber ? 0.20 : isAccent ? 0.18 : 0.14;
    noiseGain.gain.setValueAtTime(vol, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + dur + 0.01);

    // Body tone
    const osc = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    osc.type = isCyber ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isCyber ? 220 : 190, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.075);
    toneGain.gain.setValueAtTime(isCyber ? 0.16 : 0.12, time);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.075);

    osc.connect(toneGain);
    toneGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  /**
   * HI-HAT: Genre-specific texture
   */
  private playHiHat(time: number, genre: ActiveThemeId, isOpen = false) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (genre === 'lofi') {
      // Soft vinyl brush hat
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4200, time);
      filter.Q.setValueAtTime(1.4, time);
      const dur = isOpen ? 0.08 : 0.025;
      gain.gain.setValueAtTime(isOpen ? 0.045 : 0.028, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    } else if (genre === 'pixel') {
      // 8-bit periodic noise hat
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, time);
      filter.Q.setValueAtTime(3.0, time);
      const dur = isOpen ? 0.07 : 0.025;
      gain.gain.setValueAtTime(isOpen ? 0.06 : 0.035, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    } else {
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(isOpen ? 7500 : 8500, time);
      filter.Q.setValueAtTime(2.2, time);
      const dur = isOpen ? 0.13 : 0.035;
      const vol = isOpen ? 0.075 : 0.042;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + (isOpen ? 0.14 : 0.04));
  }

  /**
   * BASS: Truly distinct waveforms, envelopes, and character per genre
   */
  private playBass(note: number, time: number, genre: ActiveThemeId, isAccent = false) {
    if (!this.ctx || !this.masterGain) return;
    const freq = this.m2f(note);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (genre === 'lofi') {
      // Warm Sub / Upright Jazz Bass (sine + gentle lowpass)
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, time);
      filter.Q.setValueAtTime(1.0, time);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.30);
      return;
    }

    if (genre === 'pixel') {
      // Pure 8-bit NES Triangle Bass
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.Q.setValueAtTime(0.8, time);

      gain.gain.setValueAtTime(isAccent ? 0.22 : 0.16, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.15);
      return;
    }

    if (genre === 'cyber') {
      // 80s Moog Taurus Sub Bass with analog warmth
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(2.2, time);
      filter.frequency.setValueAtTime(isAccent ? 750 : 500, time);
      filter.frequency.exponentialRampToValueAtTime(110, time + 0.18);

      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.19);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.20);
      return;
    }

    if (genre === 'blitz') {
      // Tight EDM Rolling Sawtooth Bass
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4.2, time);
      filter.frequency.setValueAtTime(isAccent ? 1700 : 1050, time);
      filter.frequency.exponentialRampToValueAtTime(180, time + 0.09);

      gain.gain.setValueAtTime(isAccent ? 0.24 : 0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.10);
      return;
    }

    // Default: Funky Moog Slap Bass with squelchy envelope
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(5.0, time);
    filter.frequency.setValueAtTime(isAccent ? 1500 : 900, time);
    filter.frequency.exponentialRampToValueAtTime(160, time + 0.12);

    gain.gain.setValueAtTime(isAccent ? 0.24 : 0.17, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  /**
   * HARMONIC CHORD STABS / PADS (Distinct Instrument Character)
   */
  private playChord(notes: number[], time: number, genre: ActiveThemeId, duration = 0.25) {
    if (!this.ctx || !this.masterGain) return;

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const freq = this.m2f(note);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      if (genre === 'lofi') {
        // Dreamy Rhodes Electric Piano (sine + subtle harmonic)
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, time);
        filter.Q.setValueAtTime(1.0, time);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      } else if (genre === 'cyber') {
        // Lush Analog Pad with detune
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, time);
        filter.Q.setValueAtTime(1.5, time);

        gain.gain.setValueAtTime(0.04, time);
        gain.gain.linearRampToValueAtTime(0.0001, time + duration);
      } else if (genre === 'blitz') {
        // EDM Synth Brass Stab
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, time);
        filter.frequency.exponentialRampToValueAtTime(800, time + duration);
        filter.Q.setValueAtTime(2.5, time);

        gain.gain.setValueAtTime(0.055, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      } else {
        // Funky Clavinet Staccato Stab
        osc.type = 'square';
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, time);
        filter.Q.setValueAtTime(2.0, time);

        gain.gain.setValueAtTime(0.045, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      }

      osc.frequency.setValueAtTime(freq, time);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    });
  }

  /**
   * LEAD MELODY / SOLO / ARPEGGIO SYNTH
   */
  private playLead(note: number, time: number, genre: ActiveThemeId, isHigh = false) {
    if (!this.ctx || !this.masterGain) return;
    const freq = this.m2f(note);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (genre === 'lofi') {
      // Mellow Jazz Guitar / Glockenspiel Bell
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, time);
      filter.Q.setValueAtTime(1.0, time);

      gain.gain.setValueAtTime(isHigh ? 0.08 : 0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    } else if (genre === 'pixel') {
      // Pure 8-bit Square Wave Lead
      osc.type = 'square';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, time);
      filter.Q.setValueAtTime(0.9, time);

      gain.gain.setValueAtTime(isHigh ? 0.075 : 0.055, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    } else if (genre === 'cyber') {
      // Neon Outrun Sawtooth Lead with lush vibrato
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHigh ? 3800 : 2600, time);
      filter.frequency.exponentialRampToValueAtTime(900, time + 0.22);
      filter.Q.setValueAtTime(2.2, time);

      gain.gain.setValueAtTime(isHigh ? 0.09 : 0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
    } else if (genre === 'blitz') {
      // High-Tension Electro Pluck / Arp
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHigh ? 4500 : 3400, time);
      filter.frequency.exponentialRampToValueAtTime(1200, time + 0.12);
      filter.Q.setValueAtTime(3.5, time);

      gain.gain.setValueAtTime(isHigh ? 0.10 : 0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
    } else {
      // Funky Whistle / Chiptune Bounce Lead
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isHigh ? 3600 : 2500, time);
      filter.frequency.exponentialRampToValueAtTime(600, time + 0.15);
      filter.Q.setValueAtTime(1.8, time);

      gain.gain.setValueAtTime(isHigh ? 0.09 : 0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    }

    osc.frequency.setValueAtTime(freq, time);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.30);
  }

  // =========================================================================
  // SONG COMPOSITIONS & SEQUENCER (Totally Distinct Per Track)
  // =========================================================================

  private scheduleTheme(theme: ActiveThemeId, step: number, time: number) {
    const isTension = step >= 64;

    // -----------------------------------------------------------------------
    // TRACK 1: FUNKY ARCADE (124 BPM, D Dorian Disco Funk)
    // -----------------------------------------------------------------------
    if (theme === 'funky') {
      // Syncopated Disco Funk Beat
      const isKickStep = (step % 16 === 0) || (step % 16 === 6) || (step % 16 === 10);
      if (isKickStep) this.playKick(time, 'funky');
      if (step % 8 === 4) this.playSnare(time, 'funky', true);
      // Open hi-hat on every off-beat
      if (step % 4 === 2) this.playHiHat(time, 'funky', true);
      else if (step % 2 === 0) this.playHiHat(time, 'funky', false);

      // Funky Clavinet Chords on off-beats
      if (step % 8 === 2) {
        this.playChord([62, 65, 69], time, 'funky', 0.15); // Dm
      } else if (step % 8 === 6) {
        this.playChord([60, 64, 67], time, 'funky', 0.15); // C
      }

      // Funky Slap Bassline
      const funkBass: Record<number, number> = {
        0: 38, 2: 38, 4: 50, 6: 41, 8: 43, 10: 45, 12: 41, 14: 40,
        16: 38, 18: 38, 22: 48, 24: 43, 26: 45, 28: 48, 30: 49,
        32: 34, 34: 34, 38: 46, 40: 41, 42: 43, 44: 45, 46: 48,
        48: 36, 50: 36, 54: 48, 56: 43, 58: 45, 60: 48, 62: 50,
      };
      if (funkBass[step % 64]) {
        this.playBass(funkBass[step % 64], time, 'funky', step % 8 === 0);
      }

      // Playful Lead Whistle
      const funkLead: Record<number, number> = {
        0: 65, 4: 69, 8: 72, 12: 74, 14: 72,
        16: 69, 20: 65, 24: 67, 28: 65,
        32: 70, 36: 72, 40: 74, 44: 77, 46: 76,
        48: 72, 52: 69, 56: 67, 60: 65, 62: 64,
        // Chorus Hook
        64: 77, 68: 77, 72: 76, 76: 74, 80: 72,
        84: 74, 88: 77, 92: 79, 96: 81, 100: 79,
        104: 77, 108: 74, 112: 72, 116: 69, 120: 65, 124: 62
      };
      if (funkLead[step]) {
        this.playLead(funkLead[step], time, 'funky', funkLead[step] >= 74);
      }
      return;
    }

    // -----------------------------------------------------------------------
    // TRACK 2: KAHOOT BLITZ (134 BPM, A Minor Electro Tension)
    // -----------------------------------------------------------------------
    if (theme === 'blitz') {
      // Four-on-the-Floor EDM Kick
      if (step % 4 === 0) this.playKick(time, 'blitz', 1.15);
      if (step % 8 === 4) this.playSnare(time, 'blitz', true);
      if (step % 2 === 0) this.playHiHat(time, 'blitz', isTension && (step % 4 === 2));

      // Rolling 16th EDM Bass
      const roots = [45, 45, 41, 43]; // Am, Am, F, G
      const barRoot = isTension ? (step < 80 ? 45 : step < 96 ? 48 : step < 112 ? 50 : 52) : roots[Math.floor((step % 64) / 16)];
      if (step % 2 === 0) {
        const isOctave = (step % 4 === 2);
        this.playBass(isOctave ? barRoot + 12 : barRoot, time, 'blitz', step % 4 === 0);
      }

      // Tension Brass Chord Stabs
      if (step % 16 === 0 || step % 16 === 6 || step % 16 === 12) {
        const chordNotes = isTension
          ? [barRoot + 24, barRoot + 27, barRoot + 31]
          : [barRoot + 24, barRoot + 28, barRoot + 31];
        this.playChord(chordNotes, time, 'blitz', 0.18);
      }

      // Fast Tension Countdown Lead
      const blitzLead: Record<number, number> = {
        0: 69, 4: 72, 8: 76, 12: 81,
        16: 67, 20: 71, 24: 74, 28: 79,
        32: 65, 36: 69, 40: 72, 44: 77,
        48: 64, 52: 68, 56: 71, 60: 76,
        64: 81, 68: 84, 72: 86, 76: 88,
        80: 89, 84: 88, 88: 86, 92: 84,
        96: 86, 100: 88, 104: 91, 108: 93,
        112: 96, 116: 93, 120: 91, 124: 88
      };
      if (blitzLead[step]) {
        this.playLead(blitzLead[step], time, 'blitz', true);
      }
      return;
    }

    // -----------------------------------------------------------------------
    // TRACK 3: SYNTHWAVE 80s (112 BPM, D Minor Retro Cyberpunk)
    // -----------------------------------------------------------------------
    if (theme === 'cyber') {
      // 80s Drum Machine Groove
      if (step % 16 === 0 || step % 16 === 10) this.playKick(time, 'cyber', 1.25);
      if (step % 8 === 4) this.playSnare(time, 'cyber', true); // Gated 80s snare
      if (step % 2 === 0) this.playHiHat(time, 'cyber', step % 4 === 2);

      // Lush Analog Synth Pads (Dm -> Bb -> C -> Am)
      if (step % 16 === 0) {
        const barIdx = Math.floor(step / 16) % 4;
        const padChords = [
          [50, 57, 62, 65], // Dm
          [46, 53, 58, 62], // Bb
          [48, 55, 60, 64], // C
          [45, 52, 57, 60], // Am
        ];
        this.playChord(padChords[barIdx], time, 'cyber', 0.95);
      }

      // Rolling 80s Moog Bassline
      const cyberRoots = [38, 34, 36, 33]; // D, Bb, C, A
      const root = cyberRoots[Math.floor((step % 64) / 16)];
      if (step % 2 === 0) {
        this.playBass(root, time, 'cyber', step % 4 === 0);
      }

      // Cinematic Neon Outrun Lead Melody
      const cyberLead: Record<number, number> = {
        0: 62, 6: 65, 8: 69, 14: 72,
        16: 70, 22: 69, 24: 67, 30: 65,
        32: 67, 38: 70, 40: 72, 46: 76,
        48: 74, 54: 72, 56: 69, 60: 67, 62: 65,
        // High Horizon Hook
        64: 74, 68: 74, 72: 72, 76: 70,
        80: 72, 84: 74, 88: 76, 92: 77,
        96: 76, 100: 74, 104: 72, 108: 70,
        112: 69, 116: 67, 120: 65, 124: 62
      };
      if (cyberLead[step]) {
        this.playLead(cyberLead[step], time, 'cyber', cyberLead[step] >= 70);
      }
      return;
    }

    // -----------------------------------------------------------------------
    // TRACK 4: 8-BIT PIXEL (138 BPM, C Major Chiptune Gameboy)
    // -----------------------------------------------------------------------
    if (theme === 'pixel') {
      // 8-bit Fast Arcade Beat
      if (step % 4 === 0) this.playKick(time, 'pixel');
      if (step % 8 === 4) this.playSnare(time, 'pixel');
      if (step % 2 === 0) this.playHiHat(time, 'pixel', step % 4 === 2);

      // Walking NES Triangle Bass
      const pixelBass: Record<number, number> = {
        0: 36, 4: 40, 8: 43, 12: 45,
        16: 41, 20: 45, 24: 48, 28: 50,
        32: 43, 36: 47, 40: 50, 44: 53,
        48: 36, 52: 43, 56: 48, 60: 47,
        64: 36, 68: 40, 72: 43, 76: 48,
        80: 41, 84: 45, 88: 48, 92: 53,
        96: 43, 100: 47, 104: 50, 108: 55,
        112: 36, 116: 43, 120: 48, 124: 47
      };
      if (pixelBass[step % 128]) {
        this.playBass(pixelBass[step % 128], time, 'pixel', step % 4 === 0);
      }

      // Fast NES Arpeggiated Melody
      const pixelLead: Record<number, number> = {
        0: 60, 2: 64, 4: 67, 6: 72, 8: 76, 10: 72, 12: 67, 14: 64,
        16: 65, 18: 69, 20: 72, 22: 77, 24: 76, 26: 72, 28: 69, 30: 65,
        32: 67, 34: 71, 36: 74, 38: 79, 40: 77, 42: 74, 44: 71, 46: 67,
        48: 60, 50: 64, 52: 67, 54: 72, 56: 76, 58: 79, 60: 84, 62: 83,
        // High Boss Fight Jump
        64: 84, 66: 84, 70: 84, 74: 79, 78: 81,
        80: 83, 82: 83, 86: 84, 90: 81, 94: 79,
        96: 81, 98: 84, 102: 88, 106: 91,
        112: 96, 114: 95, 116: 93, 118: 91, 120: 88, 122: 84, 124: 79, 126: 72
      };
      if (pixelLead[step]) {
        this.playLead(pixelLead[step], time, 'pixel', pixelLead[step] >= 76);
      }
      return;
    }

    // -----------------------------------------------------------------------
    // TRACK 5: LO-FI CHILL (88 BPM, Jazzy Stand Coffee House)
    // -----------------------------------------------------------------------
    if (theme === 'lofi') {
      // Laid-back Boom-Bap Swing Beat
      const isKick = (step % 16 === 0) || (step % 16 === 7) || (step % 16 === 10);
      if (isKick) this.playKick(time, 'lofi', 1.0);
      // Soft wood rimshot on beats 2 and 4
      if (step % 8 === 4) this.playSnare(time, 'lofi');
      // Subtle vinyl hi-hat
      if (step % 2 === 0) this.playHiHat(time, 'lofi', step % 8 === 6);

      // Dreamy Rhodes Jazz Chords (Dm9 -> G13 -> Cmaj9 -> Am9)
      if (step % 16 === 0) {
        const bar = Math.floor(step / 16) % 4;
        const jazzChords = [
          [50, 57, 60, 64, 65], // Dm9
          [43, 55, 59, 64, 67], // G13
          [48, 55, 59, 62, 64], // Cmaj9
          [45, 57, 60, 64, 67], // Am9
        ];
        this.playChord(jazzChords[bar], time, 'lofi', 1.15);
      }

      // Smooth Walking Sub Bassline
      const lofiRoots = [38, 43, 36, 45]; // D, G, C, A
      if (step % 8 === 0) {
        const bar = Math.floor(step / 16) % 4;
        const root = lofiRoots[bar];
        this.playBass(root, time, 'lofi');
      } else if (step % 8 === 4) {
        const bar = Math.floor(step / 16) % 4;
        const root = lofiRoots[bar];
        this.playBass(root + 7, time, 'lofi'); // 5th step
      }

      // Gentle Melodic Bell / Guitar Lick
      const lofiLicks: Record<number, number> = {
        8: 69, 12: 72, 14: 76,
        24: 74, 28: 71,
        40: 67, 44: 71, 46: 74,
        56: 72, 60: 69,
        // Second Section Mellow Fill
        72: 76, 76: 79, 80: 81, 86: 83,
        90: 79, 94: 76, 96: 74, 102: 71,
        108: 67, 114: 69, 120: 72, 124: 74
      };
      if (lofiLicks[step]) {
        this.playLead(lofiLicks[step], time, 'lofi', lofiLicks[step] >= 74);
      }
      return;
    }
  }

  // =========================================================================
  // LOOKAHEAD SCHEDULER & SMOOTH TRANSITION ENGINE
  // =========================================================================

  private scheduler = () => {
    if (!this.isRunning || !this.ctx) return;

    while (this.nextStepTime < this.ctx.currentTime + this.SCHEDULE_AHEAD_TIME) {
      const activeTheme = this.getActiveThemeId();
      this.scheduleTheme(activeTheme, this.currentStep, this.nextStepTime);

      const stepDuration = this.getStepDuration();
      this.nextStepTime += stepDuration;

      const nextStep = (this.currentStep + 1) % this.TOTAL_STEPS;
      // Auto-Cycle: Saat 128 steps (8 bar) selesai, transisi halus ke lagu berikutnya
      if (nextStep === 0 && this.trackMode === 'auto') {
        this.transitionToNextTheme();
        return;
      }
      this.currentStep = nextStep;
    }
  };

  /**
   * Transisi otomatis antar lagu di mode auto (Smooth Crossfade)
   */
  private transitionToNextTheme() {
    this.activeThemeIndex = (this.activeThemeIndex + 1) % 5;
    this.currentStep = 0;
    if (this.ctx) {
      this.nextStepTime = this.ctx.currentTime + 0.05;
    }
    this.notifyListeners();
  }

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
    this.masterGain.gain.linearRampToValueAtTime(this.getEffectiveGain(), this.ctx.currentTime + 0.35);

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
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);
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
    }, 240);
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

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('minigames_hima_bgm_volume', String(clamped));
      } catch {
        // Ignore localStorage error
      }
    }
    if (this.masterGain && this.ctx && this.isRunning && this.isEnabled && !this.isCrossfading) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.getEffectiveGain(), this.ctx.currentTime + 0.05);
    }
    this.notifyListeners();
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Ganti lagu dengan transisi smooth crossfade profesional
   */
  public setTrackMode(mode: BgmTrackMode) {
    if (this.trackMode === mode && mode !== 'auto') return;

    this.trackMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('minigames_hima_bgm_track', mode);
    }

    if (!this.isRunning || !this.ctx || !this.masterGain || !this.isEnabled) {
      if (mode !== 'auto') {
        const themes: ActiveThemeId[] = ['funky', 'blitz', 'cyber', 'pixel', 'lofi'];
        const idx = themes.indexOf(mode as ActiveThemeId);
        if (idx !== -1) this.activeThemeIndex = idx;
      }
      this.notifyListeners();
      return;
    }

    // Smooth DJ Crossfade:
    // 1. Fade out track sebelumnya (200ms)
    this.isCrossfading = true;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.20);
    } catch {
      // Ignore
    }

    if (this.transitionTimer !== null) {
      window.clearTimeout(this.transitionTimer);
    }

    this.transitionTimer = window.setTimeout(() => {
      if (!this.ctx || !this.masterGain) {
        this.isCrossfading = false;
        return;
      }

      if (mode !== 'auto') {
        const themes: ActiveThemeId[] = ['funky', 'blitz', 'cyber', 'pixel', 'lofi'];
        const idx = themes.indexOf(mode as ActiveThemeId);
        if (idx !== -1) this.activeThemeIndex = idx;
      }

      // Mulai lagu baru dari step 0 (beat 1) dengan sinkronisasi tempo yang baru
      this.currentStep = 0;
      this.nextStepTime = this.ctx.currentTime + 0.05;

      // 2. Fade in track baru (300ms)
      try {
        const rampStart = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(rampStart);
        this.masterGain.gain.setValueAtTime(0.0001, rampStart);
        this.masterGain.gain.linearRampToValueAtTime(this.getEffectiveGain(), rampStart + 0.30);
      } catch {
        // Ignore
      }

      this.isCrossfading = false;
      this.notifyListeners();
    }, 220);
  }

  public cycleNextTrack(): BgmTrackMode {
    const modes: BgmTrackMode[] = ['auto', 'funky', 'blitz', 'cyber', 'pixel', 'lofi'];
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

  public subscribe(listener: (enabled: boolean, track: BgmTrackMode, themeName: string, volume: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.isEnabled, this.trackMode, this.getActiveThemeName(), this.volume);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const themeName = this.getActiveThemeName();
    this.listeners.forEach((l) => l(this.isEnabled, this.trackMode, themeName, this.volume));
  }
}

export const bgm = new BgmEngine();

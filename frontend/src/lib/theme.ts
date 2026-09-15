// Theme and Color Palette Management for HIMAPRODI TI Minigames
// Integrated with Tailwind 4 Semantic Design Tokens & DaisyUI 5 conventions

export type ThemeMode = 'light' | 'dark';
export type LightPalettePreset = 'biru-klasik' | 'modern-tech' | 'hijau-forest' | 'ungu-royal';

export interface PalettePresetInfo {
  id: LightPalettePreset;
  name: string;
  badge: string;
  desc: string;
  primary: string;
  secondary: string;
  accent: string;
  canvas: string;
  card: string;
  subtle: string;
  muted: string;
  textDefault: string;
  textSubtle: string;
  borderDefault: string;
}

export const PALETTE_PRESETS: Record<LightPalettePreset, PalettePresetInfo> = {
  'biru-klasik': {
    id: 'biru-klasik',
    name: 'Biru Klasik (HIMAPRODI TI)',
    badge: 'DEFAULT RESMI',
    desc: 'Identitas resmi HIMAPRODI TI ITB STIKOM Bali. Kontras tinggi, tegas, dan berwibawa.',
    primary: '#014097',
    secondary: '#012B66',
    accent: '#EAF2FF',
    canvas: '#FFFFFF',
    card: '#FFFFFF',
    subtle: '#F8FAFC',
    muted: '#E2E8F0',
    textDefault: '#0F172A',
    textSubtle: '#334155',
    borderDefault: '#E2E8F0'
  },
  'modern-tech': {
    id: 'modern-tech',
    name: 'Modern Tech (Indigo & Electric Sky)',
    badge: 'TECH PLATFORM',
    desc: 'Kesan modern, dinamis ala platform teknologi kekinian (GitHub/Stripe).',
    primary: '#2563EB',
    secondary: '#1E3A8A',
    accent: '#EFF6FF',
    canvas: '#FAFAFA',
    card: '#FFFFFF',
    subtle: '#F1F5F9',
    muted: '#E5E7EB',
    textDefault: '#0F172A',
    textSubtle: '#334155',
    borderDefault: '#E5E7EB'
  },
  'hijau-forest': {
    id: 'hijau-forest',
    name: 'Hijau Forest (Deep Forest)',
    badge: 'BUILT-IN PRESET',
    desc: 'Kesan fresh, tenang, berwibawa khas kampus hijau dan ekosistem terpadu.',
    primary: '#14532D',
    secondary: '#166534',
    accent: '#DCFCE7',
    canvas: '#FFFFFF',
    card: '#FFFFFF',
    subtle: '#F0FDF4',
    muted: '#DCFCE7',
    textDefault: '#064E3B',
    textSubtle: '#14532D',
    borderDefault: '#E2E8F0'
  },
  'ungu-royal': {
    id: 'ungu-royal',
    name: 'Ungu Royal (Royal Violet)',
    badge: 'BUILT-IN PRESET',
    desc: 'Kesan premium, kreatif, inovasi mahasiswa dengan sentuhan lavender mist.',
    primary: '#5B21B6',
    secondary: '#4C1D95',
    accent: '#EDE9FE',
    canvas: '#FFFFFF',
    card: '#FFFFFF',
    subtle: '#FAF5FF',
    muted: '#EDE9FE',
    textDefault: '#1E1B4B',
    textSubtle: '#4C1D95',
    borderDefault: '#E2E8F0'
  }
};

const STORAGE_THEME_KEY = 'himati_game_theme_mode';
const STORAGE_PALETTE_KEY = 'himati_game_palette_preset';

type ThemeChangeListener = (mode: ThemeMode, preset: LightPalettePreset) => void;
const listeners = new Set<ThemeChangeListener>();

class ThemeManager {
  private currentMode: ThemeMode = 'light';
  private currentPreset: LightPalettePreset = 'biru-klasik';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    const savedMode = localStorage.getItem(STORAGE_THEME_KEY) as ThemeMode | null;
    const savedPreset = localStorage.getItem(STORAGE_PALETTE_KEY) as LightPalettePreset | null;

    if (savedMode === 'light' || savedMode === 'dark') {
      this.currentMode = savedMode;
    } else {
      // Default light mode sesuai identitas resmi HIMAPRODI TI
      this.currentMode = 'light';
    }

    if (savedPreset && PALETTE_PRESETS[savedPreset]) {
      this.currentPreset = savedPreset;
    } else {
      this.currentPreset = 'biru-klasik';
    }

    this.applyToDOM();
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }

  public getPreset(): LightPalettePreset {
    return this.currentPreset;
  }

  public setMode(mode: ThemeMode) {
    this.currentMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_THEME_KEY, mode);
    }
    this.applyToDOM();
    this.notify();
  }

  public setPreset(preset: LightPalettePreset) {
    if (PALETTE_PRESETS[preset]) {
      this.currentPreset = preset;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PALETTE_KEY, preset);
      }
      this.applyToDOM();
      this.notify();
    }
  }

  public toggleMode() {
    this.setMode(this.currentMode === 'light' ? 'dark' : 'light');
  }

  public applyToDOM() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.setAttribute('data-theme', this.currentMode);
    root.setAttribute('data-palette', this.currentPreset);

    if (this.currentMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }

  public subscribe(listener: ThemeChangeListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of listeners) {
      listener(this.currentMode, this.currentPreset);
    }
  }
}

export const themeManager = new ThemeManager();

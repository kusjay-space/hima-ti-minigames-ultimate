export interface Option {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  nomor: number;
  foto_url: string;
  questionText: string;
  questionType: 'tebak_nama' | 'tebak_divisi';
  correctNama: string;
  correctDivisi: string;
  options: Option[];
}

export type AnimationStyle = 
  | 'combo' 
  | 'combo_quantum_holo'
  | 'combo_tactical_sonar'
  | 'combo_kinetic_arcade'
  | 'combo_surveillance_vhs'
  | 'combo_aperture_spy'
  | 'combo_matrix_overdrive'
  | 'combo_grand_stand'
  | 'combo_blueprint_cad'
  | 'combo_cosmic_neon'
  | 'combo_synthwave_sunset'
  | 'combo_overclock_voltage'
  | 'combo_liquid_magnetic'
  | 'combo_hyper_shimmer'
  | 'combo_kinetic_glitch'
  | 'combo_glass_depth'
  | 'combo_cyber_prism'
  | 'combo_neon_overdrive'
  | 'combo_tactical_quantum';

export type FotoFokus = 'atas' | 'tengah_atas' | 'tengah';

export interface QuizConfig {
  totalSoal: number;
  timerDetik: number;
  minBenarCap: number;
  animasiStyle: AnimationStyle;
  misiCapText: string;
  fotoFokus?: FotoFokus;
  spillJawaban?: 'akhir' | 'langsung';
}

export interface Pengurus {
  id: number;
  nama: string;
  divisi: string;
  foto_url: string;
  is_active: number;
}

export interface LeaderboardEntry {
  id: number;
  nama_peserta: string;
  skor: number;
  total_soal: number;
  waktu_detik: number;
  status_cap: 'lolos' | 'misi';
  created_at: string;
}

export interface GameResult {
  namaPeserta: string;
  skor: number;
  totalSoal: number;
  waktuDetik: number;
  isLolosCap: boolean;
  answers: {
    question: Question;
    selectedKey: string;
    isCorrect: boolean;
  }[];
}

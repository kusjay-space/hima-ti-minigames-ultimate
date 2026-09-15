import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Trophy, Download, Upload, Plus, Trash2, 
  Check, X, Shield, Lock, Sliders, RefreshCw, AlertCircle, Eye, EyeOff, 
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Search, Focus, Sparkles,
  Palette, Sun, Moon
} from 'lucide-react';
import type { Pengurus, QuizConfig, AnimationStyle, FotoFokus } from '../../types';
import { themeManager, PALETTE_PRESETS, ThemeMode, LightPalettePreset } from '../../lib/theme';
import { FlashcardCard } from '../game/FlashcardCard';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshGameConfig: () => void;
}

const ANIMATION_CHOICES: { id: AnimationStyle; title: string; desc: string; badge: string }[] = [
  {
    id: 'combo',
    title: 'Cyber Biometric Protocol',
    desc: 'Laser biometrik vertikal + 3D Parallax Gyro sheen + tumpukan 3 lapis deck fisik + text scramble decode.',
    badge: 'FLAGSHIP STAND'
  },
  {
    id: 'combo_quantum_holo',
    title: 'Quantum Hologram Spectrum',
    desc: 'Dispersi aberasi optik halus (no harsh flicker) + film hologram foil pelangi + pantulan cahaya gyroskopik.',
    badge: 'SCI-FI HOLO'
  },
  {
    id: 'combo_tactical_sonar',
    title: 'Tactical Sonar Interceptor',
    desc: 'Sinar radar berputar 360 derajat + gelombang sonar melingkar konsentris + efek audio ping pelacak target.',
    badge: 'MILITARY RADAR'
  },
  {
    id: 'combo_kinetic_arcade',
    title: 'Kinetic Arcade Spring',
    desc: 'Fisika pegas kinetik berenergi tinggi: squash & stretch saat drag, pantulan overshoot membal + lemparan kartu.',
    badge: 'PHYSICS ARCADE'
  },
  {
    id: 'combo_surveillance_vhs',
    title: 'Analog Tape Surveillance',
    desc: 'Tekstur scanline tabung CRT halus + vertical frame drift stabil + HUD timestamp REC [00:14:26] + CRT flash.',
    badge: 'RETRO SURVEILLANCE'
  },
  {
    id: 'combo_aperture_spy',
    title: 'Aperture Spy Identity',
    desc: 'Bilah aperture kamera mekanik berputar + zoom sinematik punch-in ke wajah + retikel bidik agen pengenal.',
    badge: 'SECRET AGENT'
  },
  {
    id: 'combo_matrix_overdrive',
    title: 'Matrix Cipher Overdrive',
    desc: 'Hamparan matriks kode hijau-biru + dekripsi teks real-time huruf per huruf pada pilihan ganda A/B/C/D.',
    badge: 'CYBER DECRYPT'
  },
  {
    id: 'combo_grand_stand',
    title: 'The Grand Stand Masterpiece',
    desc: 'Masterpiece kombinasi lengkap: Biometric laser + Hologram foil sheen + 3D physical deck stack + Sonar HUD + Matrix.',
    badge: 'ALL-STARS SHOWCASE'
  },
  {
    id: 'combo_blueprint_cad',
    title: 'Architect Blueprint CAD',
    desc: 'Grid cetak biru arsitektur + panduan dimensi teknikal [75x100mm] + laser cyan drafting ruler sweep pada sisi depan & belakang.',
    badge: 'BLUEPRINT CAD'
  },
  {
    id: 'combo_cosmic_neon',
    title: 'Cosmic Nebula Pulsar',
    desc: 'Atmosfer nebula ungu kosmik + orbit cincin planet 3D berputar mengelilingi kartu + kelap-kelip partikel starlight.',
    badge: 'COSMIC PULSAR'
  },
  {
    id: 'combo_synthwave_sunset',
    title: 'Synthwave Neon Wireframe',
    desc: 'Perspektif grid wireframe 80s + sunset horizon glow pulse + highlight magenta-cyan retro cyberpunk.',
    badge: '80S SYNTHWAVE'
  },
  {
    id: 'combo_overclock_voltage',
    title: 'Overclock Voltage Surge',
    desc: 'Loncatan voltase listrik berenergi tinggi mengitari perimeter kartu + pulse biru kobalt + telemetri [1.48V OVERCLOCK].',
    badge: 'OVERCLOCK SURGE'
  },
  {
    id: 'combo_liquid_magnetic',
    title: 'Liquid Magnetic Spring',
    desc: 'Framer spring physics: Efek levitasi mengambang organik + tarikan magnetis dinamis mengikuti posisi kursor.',
    badge: 'MAGNETIC SPRING'
  },
  {
    id: 'combo_hyper_shimmer',
    title: 'Holo Hyper-Shimmer Beam',
    desc: 'Pancaran difraksi prisma pelangi multi-sudut menyapu diagonal + denyut border aberasi kromatik dinamis.',
    badge: 'HYPER SHIMMER'
  },
  {
    id: 'combo_kinetic_glitch',
    title: 'Cyberpunk Kinetic Glitch',
    desc: 'Slice translasi RGB color-split saat disentuh + scanline telemetri data matrix cybernetic futuristik.',
    badge: 'CYBER GLITCH'
  },
  {
    id: 'combo_glass_depth',
    title: 'Isometric Frosted Glass',
    desc: 'Kaca buram frosted glass multi-lapisan + partikel kristal melayang halus + elevasi kedalaman 3D ultra bersih.',
    badge: 'GLASS DEPTH'
  },
  {
    id: 'combo_cyber_prism',
    title: 'Cyber Prism Diffraction',
    desc: 'Refraksi prisma pelangi multi-lapis + kilauan kaca sheen swept + scanline taktis grid 3D ultra tajam.',
    badge: 'CYBER PRISM'
  },
  {
    id: 'combo_neon_overdrive',
    title: 'Neon Overdrive Circuit',
    desc: 'Aliran sirkuit neon bertegangan tinggi + border pendar kosmik pulsasi + aksen laser scan futuristik.',
    badge: 'NEON OVERDRIVE'
  },
  {
    id: 'combo_tactical_quantum',
    title: 'Tactical Quantum Core',
    desc: 'Partikel kuantum melayang + HUD telemetri taktis militer + kedalaman kristal es isotropik.',
    badge: 'QUANTUM CORE'
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onRefreshGameConfig }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Tab Active
  type AdminTab = 'settings' | 'pengurus' | 'leaderboard' | 'theme';
  const [activeTab, setActiveTab] = useState<AdminTab>('settings');

  // Theme & Palette State
  const [themeMode, setThemeMode] = useState<ThemeMode>(themeManager.getMode());
  const [themePreset, setThemePreset] = useState<LightPalettePreset>(themeManager.getPreset());
  const [themeSaveBtnState, setThemeSaveBtnState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Settings State
  const [settings, setSettings] = useState<QuizConfig>({
    totalSoal: 5,
    timerDetik: 10,
    minBenarCap: 4,
    animasiStyle: 'combo',
    misiCapText: 'Follow Instagram @himati_official & Sapa 1 kakak pengurus di stand HIMA!',
    fotoFokus: 'tengah_atas'
  });
  const [modeKuis, setModeKuis] = useState('tebak_nama');

  // Button Save Feedback States
  const [settingsBtnState, setSettingsBtnState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [addPengurusBtnState, setAddPengurusBtnState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Live Animation Preview State
  const [previewAnswered, setPreviewAnswered] = useState(false);
  const [previewCorrect, setPreviewCorrect] = useState(true);
  const [previewIdx, setPreviewIdx] = useState(0);

  // Pengurus CRUD State
  const [pengurusList, setPengurusList] = useState<Pengurus[]>([]);
  const [searchPengurus, setSearchPengurus] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newDivisi, setNewDivisi] = useState('');
  const [newFotoFile, setNewFotoFile] = useState<File | null>(null);

  // Leaderboard State
  const [isResettingLeaderboard, setIsResettingLeaderboard] = useState(false);

  // Dynamic sample question for the interactive live preview in Admin
  const currentPreviewPengurus = pengurusList.length > 0 
    ? pengurusList[previewIdx % pengurusList.length] 
    : { id: 1, nama: 'Ni Nyoman Putri Kirana', divisi: 'Ketua Umum (BPH)', foto_url: '/uploads/ni-nyoman-putri-kirana.webp', is_active: 1 };

  const previewQuestion = {
    id: 900 + (previewIdx % 100),
    nomor: (previewIdx % 5) + 1,
    foto_url: currentPreviewPengurus.foto_url,
    questionText: modeKuis === 'tebak_nama' 
      ? 'Siapakah nama pengurus HIMA TI pada foto di samping?' 
      : 'Pengurus pada foto di samping memegang amanah apa?',
    questionType: (modeKuis === 'tebak_divisi' ? 'tebak_divisi' : 'tebak_nama') as 'tebak_nama' | 'tebak_divisi',
    correctNama: currentPreviewPengurus.nama,
    correctDivisi: currentPreviewPengurus.divisi,
    options: [
      { key: 'A', text: currentPreviewPengurus.nama, isCorrect: true },
      { key: 'B', text: 'Putu Kencana Sridewi', isCorrect: false },
      { key: 'C', text: 'Ida Ayu Ika Pramesti', isCorrect: false },
      { key: 'D', text: 'Dewa Ayu Dwicahya', isCorrect: false },
    ]
  };

  const nextPreviewPengurus = pengurusList.length > 1 
    ? pengurusList[(previewIdx + 1) % pengurusList.length] 
    : undefined;

  const nextPreviewQuestion = nextPreviewPengurus ? {
    id: 900 + ((previewIdx + 1) % 100),
    nomor: ((previewIdx + 1) % 5) + 1,
    foto_url: nextPreviewPengurus.foto_url,
    questionText: modeKuis === 'tebak_nama' 
      ? 'Siapakah nama pengurus HIMA TI pada foto di samping?' 
      : 'Pengurus pada foto di samping memegang amanah apa?',
    questionType: (modeKuis === 'tebak_divisi' ? 'tebak_divisi' : 'tebak_nama') as 'tebak_nama' | 'tebak_divisi',
    correctNama: nextPreviewPengurus.nama,
    correctDivisi: nextPreviewPengurus.divisi,
    options: []
  } : undefined;

  const loadData = async () => {
    try {
      const resSettings = await fetch('/api/settings');
      const dataSettings = await resSettings.json();
      if (dataSettings.success) {
        const s = dataSettings.data;
        setSettings({
          totalSoal: parseInt(s.soalPerSesi) || 5,
          timerDetik: parseInt(s.timerDetik) || 10,
          minBenarCap: parseInt(s.minBenarCap) || 4,
          animasiStyle: (s.animasiStyle as AnimationStyle) || 'combo',
          misiCapText: s.misiCapText || '',
          fotoFokus: (s.fotoFokus as FotoFokus) || 'tengah_atas'
        });
        setModeKuis(s.modeKuis || 'tebak_nama');

        if (s.themeMode === 'light' || s.themeMode === 'dark') {
          setThemeMode(s.themeMode);
          themeManager.setMode(s.themeMode);
        }
        if (s.themePreset && PALETTE_PRESETS[s.themePreset as LightPalettePreset]) {
          setThemePreset(s.themePreset as LightPalettePreset);
          themeManager.setPreset(s.themePreset as LightPalettePreset);
        }
      }

      loadPengurus();
    } catch (err) {
      console.error('Gagal memuat data:', err);
    }
  };

  const handleSelectMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    themeManager.setMode(mode);
  };

  const handleSelectPreset = (preset: LightPalettePreset) => {
    setThemePreset(preset);
    themeManager.setPreset(preset);
    if (themeMode !== 'light') {
      setThemeMode('light');
      themeManager.setMode('light');
    }
  };

  const handleSaveTheme = async () => {
    setThemeSaveBtnState('saving');
    try {
      themeManager.setMode(themeMode);
      themeManager.setPreset(themePreset);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: pinInput,
          themeMode,
          themePreset
        })
      });
      const data = await res.json();
      if (data.success) {
        setThemeSaveBtnState('saved');
        onRefreshGameConfig();
        setTimeout(() => setThemeSaveBtnState('idle'), 2500);
      } else {
        setThemeSaveBtnState('idle');
        alert(data.message || 'Gagal menyimpan pengaturan tema');
      }
    } catch (err) {
      setThemeSaveBtnState('idle');
      alert('Terjadi kesalahan saat menyimpan pengaturan tema');
    }
  };

  const loadPengurus = async () => {
    try {
      const res = await fetch('/api/pengurus?all=true');
      const data = await res.json();
      if (data.success) {
        setPengurusList(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pengurus:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const serverPin = data.data?.adminPin || '2026';

      if (pinInput === serverPin) {
        setIsAuthenticated(true);
        setPinError('');
        loadData();
      } else {
        setPinError('PIN Admin salah! (Default: 2026)');
      }
    } catch (err) {
      setPinError('Gagal memverifikasi ke server');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsBtnState('saving');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: pinInput,
          soalPerSesi: settings.totalSoal,
          timerDetik: settings.timerDetik,
          minBenarCap: settings.minBenarCap,
          modeKuis,
          animasiStyle: settings.animasiStyle,
          misiCapText: settings.misiCapText,
          fotoFokus: settings.fotoFokus || 'tengah_atas'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsBtnState('saved');
        onRefreshGameConfig();
        setTimeout(() => setSettingsBtnState('idle'), 2500);
      } else {
        setSettingsBtnState('idle');
        alert(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      setSettingsBtnState('idle');
      alert('Terjadi kesalahan saat menyimpan pengaturan');
    }
  };

  const handleAddPengurus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newDivisi) return;

    setAddPengurusBtnState('saving');
    const formData = new FormData();
    formData.append('nama', newNama);
    formData.append('divisi', newDivisi);
    if (newFotoFile) {
      formData.append('foto', newFotoFile);
    }

    try {
      const res = await fetch('/api/pengurus', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAddPengurusBtnState('saved');
        setNewNama('');
        setNewDivisi('');
        setNewFotoFile(null);
        loadPengurus();
        onRefreshGameConfig();
        setTimeout(() => setAddPengurusBtnState('idle'), 2500);
      } else {
        setAddPengurusBtnState('idle');
        alert(data.message || 'Gagal menambah pengurus');
      }
    } catch (err) {
      setAddPengurusBtnState('idle');
      alert('Gagal mengunggah foto pengurus');
    }
  };

  const handleTogglePengurusActive = async (pengurus: Pengurus) => {
    try {
      const res = await fetch(`/api/pengurus/${pengurus.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: pengurus.is_active ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        loadPengurus();
        onRefreshGameConfig();
      }
    } catch (err) {
      alert('Gagal mengubah status pengurus');
    }
  };

  const handleDeletePengurus = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pengurus ini dari bank flashcard?')) return;
    try {
      const res = await fetch(`/api/pengurus/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadPengurus();
        onRefreshGameConfig();
      }
    } catch (err) {
      alert('Gagal menghapus pengurus');
    }
  };

  const handleResetLeaderboard = async () => {
    if (!confirm('Yakin ingin mereset semua skor di leaderboard? Data tidak bisa dikembalikan.')) return;
    setIsResettingLeaderboard(true);
    try {
      const res = await fetch('/api/leaderboard/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin: pinInput })
      });
      const data = await res.json();
      if (data.success) {
        alert('Leaderboard berhasil direset!');
      }
    } catch (err) {
      alert('Gagal me-reset leaderboard');
    } finally {
      setIsResettingLeaderboard(false);
    }
  };

  const handleExportBackup = () => {
    window.open('/api/backup/export', '_blank');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/backup/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminPin: pinInput, backupData })
        });
        const data = await res.json();
        if (data.success) {
          alert('Data backup berhasil dipulihkan!');
          loadData();
          onRefreshGameConfig();
        } else {
          alert(data.message || 'Gagal restore');
        }
      } catch (err) {
        alert('File JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const filteredPengurus = pengurusList.filter(p => 
    p.nama.toLowerCase().includes(searchPengurus.toLowerCase()) || 
    p.divisi.toLowerCase().includes(searchPengurus.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative w-[98vw] max-w-[1550px] h-[95vh] max-h-[96vh] bg-default border-2 border-default p-4 sm:p-6 shadow-tactile flex flex-col overflow-hidden text-default"
      >
        {/* Corner Registration Crosshairs */}
        <div className="absolute top-1.5 left-1.5 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
        <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-muted font-bold pointer-events-none">+</div>

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-default tracking-tight">Console Admin Stand</h2>
              <p className="text-xs font-mono text-muted">Pengelolaan Flashcard, Framer Motion Animation & Database SQLite</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-subtle border border-default hover:border-primary text-subtle hover:text-default transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Jika Belum Login PIN */}
        {!isAuthenticated ? (
          <div className="py-20 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center">
            <div className="w-14 h-14 bg-subtle border-2 border-default flex items-center justify-center text-primary mb-4 shadow-tactile">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-default mb-1">Otentikasi Panitia Stand</h3>
            <p className="text-xs text-muted mb-6 font-mono">Masukkan PIN untuk mengelola parameter game dan bank soal.</p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Default: 2026"
                maxLength={10}
                autoFocus
                className="w-full px-4 py-3 bg-canvas border-2 border-default text-center font-mono text-2xl tracking-widest text-default focus:outline-none focus:border-primary"
              />

              {pinError && (
                <p className="text-xs text-error flex items-center justify-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:opacity-90 text-white font-bold transition-all shadow-tactile active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                MASUK KE COMMAND CONSOLE
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden pt-3">
            {/* Tabs Navigation (Neo-Brutalist Buttons) */}
            <div className="flex items-center gap-2 border-b-2 border-default pb-3 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-2 ${
                  activeTab === 'settings'
                    ? 'bg-primary text-white border-primary shadow-tactile-sm'
                    : 'bg-subtle text-muted border-default hover:text-default'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                PENGATURAN KUIS & ANIMASI ({ANIMATION_CHOICES.length} GAYA)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pengurus')}
                className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-2 ${
                  activeTab === 'pengurus'
                    ? 'bg-primary text-white border-primary shadow-tactile-sm'
                    : 'bg-subtle text-muted border-default hover:text-default'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                KELOLA PENGURUS ({pengurusList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-2 ${
                  activeTab === 'leaderboard'
                    ? 'bg-primary text-white border-primary shadow-tactile-sm'
                    : 'bg-subtle text-muted border-default hover:text-default'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                REKAP SKOR & BACKUP
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-2 ${
                  activeTab === 'theme'
                    ? 'bg-primary text-white border-primary shadow-tactile-sm'
                    : 'bg-subtle text-muted border-default hover:text-default'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                PENGATURAN SITUS → TEMA & WARNA
              </button>
            </div>

            {/* Tab Contents: Spacious Viewport */}
            <div className="flex-1 overflow-y-auto py-3 pr-1">
              {/* TAB 1: SETTINGS & 12 ANIMATIONS + EXPANDED LIVE PREVIEW STUDIO */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT PANEL: CONFIGURATION CONTROLS (7 Cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Box 1: Parameter Sesi Stand */}
                      <div className="bg-subtle border-2 border-default p-4 space-y-4 shadow-tactile-sm">
                        <h3 className="text-xs font-bold text-primary uppercase font-mono flex items-center gap-1.5 border-b border-default pb-1.5">
                          <Sliders className="w-4 h-4" />
                          1. Parameter Sesi Kuis di Stand
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-subtle mb-1">
                              Jumlah Soal Per Sesi ({settings.totalSoal} Soal)
                            </label>
                            <input
                              type="range"
                              min={3}
                              max={Math.max(5, Math.min(20, pengurusList.length))}
                              value={settings.totalSoal}
                              onChange={(e) => setSettings({ ...settings, totalSoal: parseInt(e.target.value) })}
                              className="w-full accent-primary cursor-pointer"
                            />
                            <p className="text-[10px] text-muted font-mono mt-0.5">Diambil acak dari bank {pengurusList.length} pengurus.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-subtle mb-1">
                              Timer Per Soal ({settings.timerDetik} Detik)
                            </label>
                            <input
                              type="range"
                              min={5}
                              max={20}
                              step={1}
                              value={settings.timerDetik}
                              onChange={(e) => setSettings({ ...settings, timerDetik: parseInt(e.target.value) })}
                              className="w-full accent-primary cursor-pointer"
                            />
                            <p className="text-[10px] text-muted font-mono mt-0.5">Waktu berpikir maba sebelum timeout.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-default">
                          <div>
                            <label className="block text-xs font-mono text-subtle mb-1">
                              Syarat Benar untuk Cap Stand
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={settings.totalSoal}
                              value={settings.minBenarCap}
                              onChange={(e) => setSettings({ ...settings, minBenarCap: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-2 bg-default border border-default text-default font-mono text-sm"
                            />
                            <p className="text-[10px] text-success font-mono mt-1">
                              Minimal {settings.minBenarCap} dari {settings.totalSoal} benar (maksimal salah {settings.totalSoal - settings.minBenarCap}).
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-subtle mb-1">
                              Mode Pertanyaan
                            </label>
                            <select
                              value={modeKuis}
                              onChange={(e) => setModeKuis(e.target.value)}
                              className="w-full px-3 py-2 bg-default border border-default text-default font-mono text-sm"
                            >
                              <option value="tebak_nama">Tebak Nama Pengurus</option>
                              <option value="tebak_divisi">Tebak Divisi / Jabatan</option>
                              <option value="campuran">Campuran Acak (Nama & Divisi)</option>
                            </select>
                          </div>
                        </div>

                        {/* Setting Fokus Crop Foto Pengurus */}
                        <div className="pt-3 border-t border-default">
                          <label className="block text-xs font-mono text-subtle mb-1 flex items-center gap-1.5">
                            <Focus className="w-3.5 h-3.5 text-primary" />
                            <span>Posisi Crop Wajah Pengurus (Foto Vertikal 1067x1600):</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2 mt-1.5">
                            {[
                              { id: 'tengah_atas', label: 'Tengah-Atas (Rekomendasi)', note: 'Wajah di tengah atas (Golden Ratio)' },
                              { id: 'atas', label: 'Atas (Head Top)', note: 'Fokus puncak rambut' },
                              { id: 'tengah', label: 'Tengah (Full Frame)', note: 'Pusat badan' },
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, fotoFokus: f.id as FotoFokus })}
                                className={`p-2 border text-left cursor-pointer transition-all ${
                                  (settings.fotoFokus || 'tengah_atas') === f.id
                                    ? 'bg-accent border-primary text-accent-content font-bold'
                                    : 'bg-default border-default text-muted hover:text-default'
                                }`}
                              >
                                <p className="text-xs font-bold font-mono">{f.label}</p>
                                <p className="text-[10px] text-muted mt-0.5">{f.note}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Katalog Kombo Animasi Interaktif */}
                      <div className="bg-subtle border-2 border-default p-4 space-y-3 shadow-tactile-sm">
                        <div className="flex items-center justify-between border-b border-default pb-1.5">
                          <h3 className="text-xs font-bold text-primary uppercase font-mono flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            2. Pilih Kombo Animasi Flashcard ({ANIMATION_CHOICES.length} Kombo Interaktif)
                          </h3>
                          <span className="text-[10px] font-mono text-muted">Aktif: [{settings.animasiStyle}]</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                          {ANIMATION_CHOICES.map((item) => (
                            <label
                              key={item.id}
                              className={`p-2.5 border-2 flex flex-col justify-between cursor-pointer transition-all ${
                                settings.animasiStyle === item.id
                                  ? 'bg-accent border-primary shadow-tactile-sm text-accent-content'
                                  : 'bg-default border-default hover:border-primary/50 text-default'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-bold text-default font-mono">{item.title}</span>
                                  <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider">
                                    [ {item.badge} ]
                                  </span>
                                </div>
                                <input
                                  type="radio"
                                  name="animasiStyle"
                                  value={item.id}
                                  checked={settings.animasiStyle === item.id}
                                  onChange={() => {
                                    setSettings({ ...settings, animasiStyle: item.id });
                                    setPreviewAnswered(false);
                                  }}
                                  className="accent-primary cursor-pointer shrink-0"
                                />
                              </div>
                              <p className="text-[10px] text-subtle leading-tight font-sans mt-0.5">{item.desc}</p>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Box 3: Teks Misi Tambahan */}
                      <div className="bg-subtle border-2 border-default p-4 space-y-1.5 shadow-tactile-sm">
                        <label className="block text-xs font-mono text-subtle font-bold uppercase">
                          Teks Misi Stand (Jika Mahasiswa Baru Salah &ge; 2 Soal):
                        </label>
                        <textarea
                          value={settings.misiCapText}
                          onChange={(e) => setSettings({ ...settings, misiCapText: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-default border border-default text-default text-xs focus:outline-none focus:border-primary font-sans"
                        />
                      </div>

                      {/* Tombol Simpan dengan Status Berubah Jelas */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={settingsBtnState === 'saving'}
                          className={`w-full py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-tactile transition-all cursor-pointer ${
                            settingsBtnState === 'saved'
                              ? 'bg-success text-white shadow-tactile-emerald'
                              : settingsBtnState === 'saving'
                              ? 'bg-muted text-muted cursor-wait'
                              : 'bg-primary hover:opacity-90 text-white shadow-tactile active:translate-x-[1px] active:translate-y-[1px]'
                          }`}
                        >
                          {settingsBtnState === 'saved' ? (
                            <>
                              <Check className="w-5 h-5 stroke-[3]" />
                              <span>PENGATURAN BERHASIL DISIMPAN!</span>
                            </>
                          ) : settingsBtnState === 'saving' ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              <span>Menyimpan ke SQLite...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5 stroke-[3]" />
                              <span>SIMPAN SEMUA PENGATURAN</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* RIGHT PANEL: SPACIOUS LIVE INTERACTIVE CARD SIMULATION STUDIO (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col">
                      <div className="bg-subtle border-2 border-default p-4 flex flex-col justify-between shadow-tactile relative">
                        <div className="absolute top-1 left-1 text-[8px] font-mono text-muted font-bold">+</div>
                        <div className="absolute top-1 right-1 text-[8px] font-mono text-muted font-bold">+</div>
                        <div className="absolute bottom-1 left-1 text-[8px] font-mono text-muted font-bold">+</div>
                        <div className="absolute bottom-1 right-1 text-[8px] font-mono text-muted font-bold">+</div>

                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-default">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-success rounded-full" />
                              <span className="text-xs font-mono text-default font-bold uppercase tracking-wider">
                                STUDIO SIMULASI KARTU
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="border border-default bg-default px-2 py-0.5 text-primary uppercase">
                                [{settings.animasiStyle}]
                              </span>
                              <span className="border border-default bg-default px-2 py-0.5 text-muted uppercase">
                                [{settings.fotoFokus || 'tengah_atas'}]
                              </span>
                            </div>
                          </div>

                          {/* Quick Member Dropdown Picker to inspect any of 34 pengurus */}
                          <div className="mb-2">
                            <label className="block text-[10px] font-mono text-muted mb-1 uppercase">
                              Pilih Pengurus untuk Uji Visual Wajah:
                            </label>
                            <select
                              value={previewIdx}
                              onChange={(e) => {
                                setPreviewIdx(parseInt(e.target.value));
                                setPreviewAnswered(false);
                              }}
                              className="w-full px-2.5 py-1.5 bg-default border border-default text-default font-mono text-xs focus:outline-none focus:border-primary"
                            >
                              {pengurusList.map((p, i) => (
                                <option key={p.id} value={i}>
                                  #{i + 1} {p.nama} ({p.divisi})
                                </option>
                              ))}
                            </select>
                          </div>

                          <p className="text-[11px] text-muted mb-2 text-center font-mono">
                            *Hover kartu untuk 3D tilt sheen, drag kiri/kanan untuk uji physics spring.
                          </p>

                          {/* Rendered Live Card */}
                          <div className="flex flex-col items-center justify-center py-2">
                            <AnimatePresence mode="wait">
                              <FlashcardCard
                                key={previewQuestion.id + '-' + settings.animasiStyle + '-' + (settings.fotoFokus || 'tengah_atas')}
                                question={previewQuestion}
                                nextQuestion={nextPreviewQuestion}
                                animasiStyle={settings.animasiStyle}
                                fotoFokus={settings.fotoFokus}
                                isAnswered={previewAnswered}
                                isCorrect={previewCorrect}
                                totalQuestions={5}
                                currentNumber={(previewIdx % 5) + 1}
                                interactivePreview={true}
                              />
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Interactive Navigation & Simulation Controls */}
                        <div className="space-y-2 pt-3 border-t-2 border-default">
                          {/* Next / Prev Card Simulation */}
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAnswered(false);
                                setPreviewIdx(prev => (prev > 0 ? prev - 1 : pengurusList.length - 1));
                              }}
                              className="flex-1 py-2 px-2 bg-default border border-default text-xs font-mono text-subtle hover:text-default hover:border-primary flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              PREV KARTU
                            </button>

                            <span className="text-xs font-mono text-primary font-bold px-2">
                              {((previewIdx % Math.max(1, pengurusList.length)) + 1)} / {Math.max(1, pengurusList.length)}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAnswered(false);
                                setPreviewIdx(prev => (prev + 1) % Math.max(1, pengurusList.length));
                              }}
                              className="flex-1 py-2 px-2 bg-default border border-default text-xs font-mono text-subtle hover:text-default hover:border-primary flex items-center justify-center gap-1 cursor-pointer"
                            >
                              NEXT KARTU
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Test Answer Simulation Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAnswered(true);
                                setPreviewCorrect(true);
                              }}
                              className="py-2 px-2 bg-success/15 border border-success text-success text-xs font-mono font-bold hover:bg-success/25 flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              SIMULASI BENAR
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAnswered(true);
                                setPreviewCorrect(false);
                              }}
                              className="py-2 px-2 bg-error/15 border border-error text-error text-xs font-mono font-bold hover:bg-error/25 flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              SIMULASI SALAH
                            </button>
                          </div>

                          {previewAnswered && (
                            <button
                              type="button"
                              onClick={() => setPreviewAnswered(false)}
                              className="w-full py-1.5 bg-default border border-default text-xs font-mono text-muted hover:text-default cursor-pointer"
                            >
                              RESET STATUS KARTU PREVIEW
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: PENGURUS CRUD */}
              {activeTab === 'pengurus' && (
                <div className="space-y-5">
                  {/* Form Tambah Pengurus Baru */}
                  <div className="bg-subtle border-2 border-default p-4 shadow-tactile-sm">
                    <h3 className="text-xs font-bold text-primary uppercase font-mono mb-3 flex items-center gap-1.5 border-b border-default pb-1.5">
                      <Plus className="w-4 h-4" />
                      Tambah Foto & Pengurus Baru HIMA TI
                    </h3>

                    <form onSubmit={handleAddPengurus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-subtle mb-1">Nama Lengkap:</label>
                        <input
                          type="text"
                          value={newNama}
                          onChange={(e) => setNewNama(e.target.value)}
                          placeholder="Misal: Budi Santoso"
                          required
                          className="w-full px-3 py-2 bg-default border border-default text-default text-xs focus:outline-none focus:border-primary font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-subtle mb-1">Divisi / Jabatan:</label>
                        <input
                          type="text"
                          value={newDivisi}
                          onChange={(e) => setNewDivisi(e.target.value)}
                          placeholder="Misal: Anggota Minat dan Bakat"
                          required
                          className="w-full px-3 py-2 bg-default border border-default text-default text-xs focus:outline-none focus:border-primary font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-subtle mb-1">Upload Foto:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewFotoFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-muted file:mr-2 file:py-1.5 file:px-3 file:border file:border-default file:text-xs file:bg-default file:text-primary hover:file:bg-subtle cursor-pointer"
                        />
                      </div>

                      <div className="sm:col-span-3 mt-1">
                        <button
                          type="submit"
                          disabled={addPengurusBtnState === 'saving'}
                          className={`w-full py-3 font-bold text-xs flex items-center justify-center gap-1.5 shadow-tactile transition-all cursor-pointer ${
                            addPengurusBtnState === 'saved'
                              ? 'bg-success text-white'
                              : addPengurusBtnState === 'saving'
                              ? 'bg-muted text-muted'
                              : 'bg-primary hover:opacity-90 text-white'
                          }`}
                        >
                          {addPengurusBtnState === 'saved' ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>PENGURUS BERHASIL DITAMBAHKAN!</span>
                            </>
                          ) : addPengurusBtnState === 'saving' ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Mengunggah Foto & Menyimpan ke SQLite...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 stroke-[3]" />
                              <span>TAMBAHKAN KE BANK FLASHCARD</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Search & Header Koleksi Pengurus */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-default pb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xs font-mono uppercase text-subtle font-bold">
                          Koleksi Pengurus ({pengurusList.length} Orang)
                        </h4>
                        <button
                          type="button"
                          onClick={loadPengurus}
                          className="text-xs font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted" />
                        <input
                          type="text"
                          value={searchPengurus}
                          onChange={(e) => setSearchPengurus(e.target.value)}
                          placeholder="Cari nama / divisi..."
                          className="w-full pl-8 pr-3 py-1.5 bg-default border border-default text-xs text-default placeholder-muted focus:outline-none focus:border-primary font-sans"
                        />
                      </div>
                    </div>

                    {/* Grid Koleksi Pengurus (Persegi Panjang Pass) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                      {filteredPengurus.map((p) => (
                        <div
                          key={p.id}
                          className={`border-2 p-2 flex flex-col items-center text-center relative transition-all ${
                            p.is_active 
                              ? 'bg-default border-default shadow-tactile-sm' 
                              : 'bg-default/40 border-default/40 opacity-40'
                          }`}
                        >
                          <div className="w-full aspect-[3/4] overflow-hidden bg-subtle mb-1.5 border border-default">
                            <img 
                              src={p.foto_url} 
                              alt={p.nama} 
                              className={`w-full h-full object-cover ${
                                (settings.fotoFokus || 'tengah_atas') === 'atas' 
                                  ? 'object-[center_8%]' 
                                  : (settings.fotoFokus || 'tengah_atas') === 'tengah' 
                                  ? 'object-center' 
                                  : 'object-[center_18%]'
                              }`} 
                            />
                          </div>

                          <h5 className="font-bold text-[11px] text-default line-clamp-1 leading-tight">{p.nama}</h5>
                          <p className="text-[10px] text-primary font-mono line-clamp-1 mb-2">{p.divisi}</p>

                          <div className="flex items-center gap-1 mt-auto pt-1 border-t border-default w-full justify-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePengurusActive(p)}
                              title={p.is_active ? 'Nonaktifkan Kartu' : 'Aktifkan Kartu'}
                              className="p-1 bg-subtle border border-default hover:border-primary text-subtle hover:text-default cursor-pointer"
                            >
                              {p.is_active ? <Eye className="w-3 h-3 text-success" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePengurus(p.id)}
                              title="Hapus Pengurus"
                              className="p-1 bg-subtle border border-default hover:border-error text-subtle hover:text-error cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEADERBOARD & BACKUP */}
              {activeTab === 'leaderboard' && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <div className="bg-subtle border-2 border-default p-5 shadow-tactile-sm">
                    <h3 className="text-xs font-bold text-primary uppercase font-mono mb-2 flex items-center gap-1.5 border-b border-default pb-1.5">
                      <Download className="w-4 h-4" />
                      Cadangkan Data Kuis (Backup & Restore)
                    </h3>
                    <p className="text-xs text-muted mb-4 leading-relaxed font-sans">
                      Download file cadangan JSON ke laptop stand untuk mengamankan seluruh data pengurus, pengaturan kuis, dan skor maba.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="py-3 px-4 bg-default hover:bg-subtle text-default font-mono text-xs flex items-center justify-center gap-2 border border-default shadow-tactile-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-primary" />
                        DOWNLOAD BACKUP JSON
                      </button>

                      <label className="py-3 px-4 bg-default hover:bg-subtle text-default font-mono text-xs flex items-center justify-center gap-2 border border-default shadow-tactile-sm cursor-pointer text-center">
                        <Upload className="w-4 h-4 text-success" />
                        <span>RESTORE DARI FILE JSON</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="bg-subtle border-2 border-error/50 p-5 shadow-tactile-sm">
                    <h3 className="text-xs font-bold text-error uppercase font-mono mb-1 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      Reset Papan Peringkat Sesi
                    </h3>
                    <p className="text-xs text-muted mb-3 font-sans">
                      Hapus seluruh daftar nilai maba saat pergantian hari GMTI stand.
                    </p>

                    <button
                      type="button"
                      onClick={handleResetLeaderboard}
                      disabled={isResettingLeaderboard}
                      className="py-2.5 px-4 bg-error hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-tactile hover:shadow-tactile-coral transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isResettingLeaderboard ? 'MERESET...' : 'KOSONGKAN SEMUA SKOR LEADERBOARD'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PENGATURAN SITUS -> TEMA & WARNA */}
              {activeTab === 'theme' && (
                <div className="space-y-6 max-w-5xl mx-auto pb-6">
                  {/* Top Intro Banner */}
                  <div className="bg-subtle border-2 border-default p-5 shadow-tactile-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-default pb-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary text-white flex items-center justify-center font-bold">
                          <Palette className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-default font-mono uppercase tracking-tight">
                            Pengaturan Tema & Palet Warna Stand
                          </h3>
                          <p className="text-xs text-muted font-sans">
                            Integrasi Tailwind 4 + DaisyUI 5 // Identitas Resmi HIMAPRODI TI & Presets
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-accent text-accent-content font-bold border border-default">
                          AKTIF: {themeMode.toUpperCase()} // {PALETTE_PRESETS[themePreset]?.name.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-subtle font-sans leading-relaxed">
                      Sistem warna web game minigames HIMAPRODI TI terintegrasi dengan design tokens semantik (Surface, Text, Garis, dan Brand) tanpa hardcoded hex. Anda dapat memilih mode tampilan utama serta 4 variasi palet Light Mode resmi untuk menyesuaikan pencahayaan stand dan monitor.
                    </p>
                  </div>

                  {/* Section 1: Mode Tampilan Utama */}
                  <div className="bg-subtle border-2 border-default p-5 shadow-tactile-sm space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase font-mono flex items-center gap-1.5 border-b border-default pb-2">
                      <Sliders className="w-4 h-4" />
                      1. Mode Tampilan Utama (Light vs Dark Mode)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Light Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleSelectMode('light')}
                        className={`p-4 border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          themeMode === 'light'
                            ? 'bg-default border-primary shadow-tactile-sm ring-1 ring-primary/40'
                            : 'bg-default border-default hover:border-primary/50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Sun className="w-5 h-5 text-amber-500" />
                              <span className="font-bold text-sm text-default font-mono">Light Mode (Mode Terang)</span>
                            </div>
                            {themeMode === 'light' && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-success/10 text-success border border-success/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> AKTIF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-subtle font-sans leading-relaxed mb-3">
                            Karakteristik identitas resmi HIMAPRODI TI ITB STIKOM Bali dengan kartu ID putih bersih, kontras tinggi, dan teks navy pekat yang sangat nyaman dibaca maba di stand.
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-muted border-t border-default pt-2 flex items-center justify-between">
                          <span>CANVAS: PUTIH // KARTU: BERSIH</span>
                          <span className="text-primary font-bold">STAND SIANG / INDOOR</span>
                        </div>
                      </button>

                      {/* Dark Mode Card */}
                      <button
                        type="button"
                        onClick={() => handleSelectMode('dark')}
                        className={`p-4 border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          themeMode === 'dark'
                            ? 'bg-default border-primary shadow-tactile-sm ring-1 ring-primary/40'
                            : 'bg-default border-default hover:border-primary/50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Moon className="w-5 h-5 text-indigo-400" />
                              <span className="font-bold text-sm text-default font-mono">Dark Mode (Mode Gelap)</span>
                            </div>
                            {themeMode === 'dark' && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-success/10 text-success border border-success/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> AKTIF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-subtle font-sans leading-relaxed mb-3">
                            Nuansa kokpit cybernetic taktis dengan latar belakang hitam pekat, grid futuristik, dan pendar neon sci-fi untuk pengalaman visual cyber stand.
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-muted border-t border-default pt-2 flex items-center justify-between">
                          <span>CANVAS: #080C14 // PENDAR NEON</span>
                          <span className="text-primary font-bold">STAND MALAM / CYBER</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section 2: 4 Pilihan Palet Warna Light Mode */}
                  <div className="bg-subtle border-2 border-default p-5 shadow-tactile-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default pb-2">
                      <h4 className="text-xs font-bold text-primary uppercase font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        2. Pilihan Palet Warna Light Mode (4 Built-in Presets)
                      </h4>
                      <span className="text-[10px] font-mono text-muted">
                        *Klik kartu untuk preview instan langsung di layar
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.values(PALETTE_PRESETS).map((p) => {
                        const isSelected = themePreset === p.id && themeMode === 'light';
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPreset(p.id)}
                            className={`p-4 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-default border-primary shadow-tactile-sm ring-1 ring-primary/40'
                                : 'bg-default border-default hover:border-primary/50'
                            }`}
                          >
                            <div>
                              {/* Header Card */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-black/20" 
                                    style={{ backgroundColor: p.primary }}
                                  />
                                  <h5 className="text-xs font-bold font-mono text-default leading-tight">{p.name}</h5>
                                </div>
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                                  p.id === 'biru-klasik'
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-subtle text-subtle border-default'
                                }`}>
                                  {p.badge}
                                </span>
                              </div>

                              <p className="text-xs text-subtle font-sans mb-3 leading-relaxed">
                                {p.desc}
                              </p>

                              {/* Color Chips Palette Matrix */}
                              <div className="grid grid-cols-5 gap-1.5 p-2 bg-subtle border border-default mb-3 text-center">
                                <div>
                                  <div 
                                    className="h-7 w-full border border-black/10 rounded-sm mb-1" 
                                    style={{ backgroundColor: p.primary }}
                                  />
                                  <span className="text-[8px] font-mono text-muted block leading-none">Primary</span>
                                  <span className="text-[8.5px] font-mono font-bold text-default block mt-0.5">{p.primary}</span>
                                </div>
                                <div>
                                  <div 
                                    className="h-7 w-full border border-black/10 rounded-sm mb-1" 
                                    style={{ backgroundColor: p.secondary }}
                                  />
                                  <span className="text-[8px] font-mono text-muted block leading-none">Secondary</span>
                                  <span className="text-[8.5px] font-mono font-bold text-default block mt-0.5">{p.secondary}</span>
                                </div>
                                <div>
                                  <div 
                                    className="h-7 w-full border border-black/10 rounded-sm mb-1" 
                                    style={{ backgroundColor: p.accent }}
                                  />
                                  <span className="text-[8px] font-mono text-muted block leading-none">Accent</span>
                                  <span className="text-[8.5px] font-mono font-bold text-default block mt-0.5">{p.accent}</span>
                                </div>
                                <div>
                                  <div 
                                    className="h-7 w-full border border-black/10 rounded-sm mb-1" 
                                    style={{ backgroundColor: p.canvas }}
                                  />
                                  <span className="text-[8px] font-mono text-muted block leading-none">Canvas</span>
                                  <span className="text-[8.5px] font-mono font-bold text-default block mt-0.5">{p.canvas}</span>
                                </div>
                                <div>
                                  <div 
                                    className="h-7 w-full border border-black/10 rounded-sm mb-1" 
                                    style={{ backgroundColor: p.textDefault }}
                                  />
                                  <span className="text-[8px] font-mono text-muted block leading-none">Text</span>
                                  <span className="text-[8.5px] font-mono font-bold text-default block mt-0.5">{p.textDefault}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-default pt-2 text-[10px] font-mono">
                              <span className="text-muted">BORDER: {p.borderDefault}</span>
                              {isSelected ? (
                                <span className="text-success font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> DIPILIH SEBAGAI AKTIF
                                </span>
                              ) : (
                                <span className="text-primary hover:underline font-bold">
                                  KLIK UNTUK TERAPKAN
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Status Colors Specification Display */}
                  <div className="bg-subtle border-2 border-default p-5 shadow-tactile-sm space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase font-mono flex items-center gap-1.5 border-b border-default pb-2">
                      <Shield className="w-4 h-4" />
                      3. Status Colors Tetap (Fixed Status Tokens // DaisyUI 5 Standard)
                    </h4>

                    <p className="text-xs text-subtle font-sans">
                      Warna status di bawah ini bersifat konsisten lintas seluruh palet untuk menjamin kejelasan status permainan kuis stand:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 bg-default border border-default flex flex-col items-center text-center">
                        <div className="w-6 h-6 rounded-full bg-success mb-1.5 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-default">SUCCESS (#16A34A)</span>
                        <span className="text-[9px] font-sans text-muted">Jawaban Benar & Lulus Cap</span>
                        <div className="mt-2 px-2 py-0.5 bg-success/10 text-success border border-success/30 text-[9px] font-mono font-bold">
                          bg-success/10
                        </div>
                      </div>

                      <div className="p-2.5 bg-default border border-default flex flex-col items-center text-center">
                        <div className="w-6 h-6 rounded-full bg-warning mb-1.5 flex items-center justify-center text-white">
                          <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-default">WARNING (#F59E0B)</span>
                        <span className="text-[9px] font-sans text-muted">Timer Menipis & Misi</span>
                        <div className="mt-2 px-2 py-0.5 bg-warning/10 text-warning border border-warning/30 text-[9px] font-mono font-bold">
                          bg-warning/10
                        </div>
                      </div>

                      <div className="p-2.5 bg-default border border-default flex flex-col items-center text-center">
                        <div className="w-6 h-6 rounded-full bg-error mb-1.5 flex items-center justify-center text-white">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-default">ERROR (#DC2626)</span>
                        <span className="text-[9px] font-sans text-muted">Jawaban Salah & Timeout</span>
                        <div className="mt-2 px-2 py-0.5 bg-error/10 text-error border border-error/30 text-[9px] font-mono font-bold">
                          bg-error/10
                        </div>
                      </div>

                      <div className="p-2.5 bg-default border border-default flex flex-col items-center text-center">
                        <div className="w-6 h-6 rounded-full bg-info mb-1.5 flex items-center justify-center text-white">
                          <Sparkles className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-default">INFO (#0EA5E9)</span>
                        <span className="text-[9px] font-sans text-muted">Panduan & Bantuan Stand</span>
                        <div className="mt-2 px-2 py-0.5 bg-info/10 text-info border border-info/30 text-[9px] font-mono font-bold">
                          bg-info/10
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Save & Action Bar */}
                  <div className="bg-subtle border-2 border-default p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-tactile-sm">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectMode('light');
                          handleSelectPreset('biru-klasik');
                        }}
                        className="px-3 py-2 bg-default border border-default hover:border-primary text-xs font-mono text-subtle hover:text-default transition-all cursor-pointer"
                      >
                        RESET KE DEFAULT RESMI (BIRU KLASIK)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveTheme}
                      disabled={themeSaveBtnState === 'saving'}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:opacity-90 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-tactile active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      {themeSaveBtnState === 'saved' ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>PENGATURAN TEMA TERSIMPAN KE SQLITE!</span>
                        </>
                      ) : themeSaveBtnState === 'saving' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menyimpan ke SQLite Server...</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4" />
                          <span>SIMPAN PENGATURAN TEMA SEBAGAI DEFAULT STAND</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

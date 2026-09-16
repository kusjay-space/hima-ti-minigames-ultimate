import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Trophy, Download, Upload, Plus, Minus, Trash2, 
  Check, X, Shield, Lock, Sliders, RefreshCw, AlertCircle, Eye, EyeOff, 
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Search, Focus, Sparkles, Pencil
} from 'lucide-react';
import type { Pengurus, QuizConfig, AnimationStyle, FotoFokus } from '../../types';
import { FlashcardCard } from '../game/FlashcardCard';
import { AudioMixerModal } from '../game/AudioMixerModal';

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
  const [activeTab, setActiveTab] = useState<'settings' | 'pengurus' | 'leaderboard'>('settings');

  // Settings State
  const [settings, setSettings] = useState<QuizConfig>({
    totalSoal: 5,
    timerDetik: 10,
    minBenarCap: 4,
    animasiStyle: 'combo',
    misiCapText: 'Follow Instagram @himati_official & Sapa 1 kakak pengurus di stand HIMA!',
    fotoFokus: 'tengah_atas',
    spillJawaban: 'akhir'
  });
  const [modeKuis, setModeKuis] = useState('tebak_nama');

  // Dedicated string inputs to allow complete clearing / free-typing without snap-back
  const [totalSoalInput, setTotalSoalInput] = useState('5');
  const [timerDetikInput, setTimerDetikInput] = useState('10');
  const [minBenarCapInput, setMinBenarCapInput] = useState('4');

  // Button Save Feedback States
  const [settingsBtnState, setSettingsBtnState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [addPengurusBtnState, setAddPengurusBtnState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAudioMixer, setShowAudioMixer] = useState(false);

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

  // Edit Pengurus Modal State
  const [editingPengurus, setEditingPengurus] = useState<Pengurus | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editDivisi, setEditDivisi] = useState('');
  const [editFotoFile, setEditFotoFile] = useState<File | null>(null);
  const [editPengurusBtnState, setEditPengurusBtnState] = useState<'idle' | 'saving' | 'saved'>('idle');

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
        const loadedTotalSoal = parseInt(s.soalPerSesi) || 5;
        const loadedTimerDetik = parseInt(s.timerDetik) || 10;
        const loadedMinBenar = parseInt(s.minBenarCap) || 4;

        setSettings({
          totalSoal: loadedTotalSoal,
          timerDetik: loadedTimerDetik,
          minBenarCap: loadedMinBenar,
          animasiStyle: (s.animasiStyle as AnimationStyle) || 'combo',
          misiCapText: s.misiCapText || '',
          fotoFokus: (s.fotoFokus as FotoFokus) || 'tengah_atas',
          spillJawaban: (s.spillJawaban as 'akhir' | 'langsung') || 'akhir'
        });
        setTotalSoalInput(String(loadedTotalSoal));
        setTimerDetikInput(String(loadedTimerDetik));
        setMinBenarCapInput(String(loadedMinBenar));
        setModeKuis(s.modeKuis || 'tebak_nama');
      }

      loadPengurus();
    } catch (err) {
      console.error('Gagal memuat data:', err);
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
      if (data.success) {
        const correctPin = data.data.adminPin || '2026';
        if (pinInput === correctPin) {
          setIsAuthenticated(true);
          setPinError('');
          loadData();
        } else {
          setPinError('PIN Admin salah!');
        }
      }
    } catch (err) {
      setPinError('Gagal memverifikasi ke server');
    }
  };

  // Helper handlers for Sesi Stand Parameters (Total Soal, Timer, Min Benar Cap)
  const maxAvailableSoal = Math.max(5, pengurusList.length > 0 ? pengurusList.length : 34);

  const updateTotalSoal = (newVal: number) => {
    const clamped = Math.max(3, Math.min(maxAvailableSoal, newVal));
    setTotalSoalInput(String(clamped));
    setSettings(prev => {
      const newMin = prev.minBenarCap > clamped ? clamped : prev.minBenarCap;
      if (prev.minBenarCap > clamped) {
        setMinBenarCapInput(String(clamped));
      }
      return { ...prev, totalSoal: clamped, minBenarCap: newMin };
    });
  };

  const updateTimerDetik = (newVal: number) => {
    const clamped = Math.max(3, Math.min(60, newVal));
    setTimerDetikInput(String(clamped));
    setSettings(prev => ({ ...prev, timerDetik: clamped }));
  };

  const updateMinBenarCap = (newVal: number) => {
    const currentTotal = parseInt(totalSoalInput, 10) || settings.totalSoal || 5;
    const clamped = Math.max(1, Math.min(currentTotal, newVal));
    setMinBenarCapInput(String(clamped));
    setSettings(prev => ({ ...prev, minBenarCap: clamped }));
  };

  const handleTotalSoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setTotalSoalInput(val);
      if (val !== '') {
        const num = parseInt(val, 10);
        setSettings(prev => {
          const newMin = prev.minBenarCap > num ? num : prev.minBenarCap;
          if (prev.minBenarCap > num) {
            setMinBenarCapInput(String(num));
          }
          return { ...prev, totalSoal: num, minBenarCap: newMin };
        });
      }
    }
  };

  const handleTotalSoalBlur = () => {
    const num = parseInt(totalSoalInput, 10);
    if (!num || isNaN(num) || num < 3) {
      updateTotalSoal(3);
    } else if (num > maxAvailableSoal) {
      updateTotalSoal(maxAvailableSoal);
    } else {
      updateTotalSoal(num);
    }
  };

  const handleTimerDetikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setTimerDetikInput(val);
      if (val !== '') {
        const num = parseInt(val, 10);
        setSettings(prev => ({ ...prev, timerDetik: num }));
      }
    }
  };

  const handleTimerDetikBlur = () => {
    const num = parseInt(timerDetikInput, 10);
    if (!num || isNaN(num) || num < 3) {
      updateTimerDetik(5);
    } else if (num > 60) {
      updateTimerDetik(60);
    } else {
      updateTimerDetik(num);
    }
  };

  const handleMinBenarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow deleting completely to empty string without snapping to 1!
    if (/^\d*$/.test(val)) {
      setMinBenarCapInput(val);
      if (val !== '') {
        const num = parseInt(val, 10);
        setSettings(prev => ({ ...prev, minBenarCap: num }));
      }
    }
  };

  const handleMinBenarBlur = () => {
    const num = parseInt(minBenarCapInput, 10);
    const currentTotal = parseInt(totalSoalInput, 10) || settings.totalSoal || 5;
    if (!num || isNaN(num) || num < 1) {
      updateMinBenarCap(1);
    } else if (num > currentTotal) {
      updateMinBenarCap(currentTotal);
    } else {
      updateMinBenarCap(num);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsBtnState('saving');
    
    // Resolve any empty/partial inputs safely
    const resolvedTotalSoal = Math.max(3, Math.min(maxAvailableSoal, parseInt(totalSoalInput, 10) || settings.totalSoal || 5));
    const resolvedTimerDetik = Math.max(3, Math.min(60, parseInt(timerDetikInput, 10) || settings.timerDetik || 10));
    const resolvedMinBenar = Math.min(
      resolvedTotalSoal,
      Math.max(1, parseInt(minBenarCapInput, 10) || settings.minBenarCap || 1)
    );

    setTotalSoalInput(String(resolvedTotalSoal));
    setTimerDetikInput(String(resolvedTimerDetik));
    setMinBenarCapInput(String(resolvedMinBenar));
    setSettings(prev => ({
      ...prev,
      totalSoal: resolvedTotalSoal,
      timerDetik: resolvedTimerDetik,
      minBenarCap: resolvedMinBenar
    }));

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: pinInput,
          soalPerSesi: resolvedTotalSoal,
          timerDetik: resolvedTimerDetik,
          minBenarCap: resolvedMinBenar,
          modeKuis,
          animasiStyle: settings.animasiStyle,
          misiCapText: settings.misiCapText,
          fotoFokus: settings.fotoFokus || 'tengah_atas',
          spillJawaban: settings.spillJawaban || 'akhir'
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

  const handleStartEditPengurus = (p: Pengurus) => {
    setEditingPengurus(p);
    setEditNama(p.nama);
    setEditDivisi(p.divisi);
    setEditFotoFile(null);
    setEditPengurusBtnState('idle');
  };

  const handleSaveEditPengurus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPengurus || !editNama.trim() || !editDivisi.trim()) return;

    setEditPengurusBtnState('saving');
    try {
      let res;
      if (editFotoFile) {
        const formData = new FormData();
        formData.append('nama', editNama.trim());
        formData.append('divisi', editDivisi.trim());
        formData.append('foto', editFotoFile);
        formData.append('is_active', String(editingPengurus.is_active));
        res = await fetch(`/api/pengurus/${editingPengurus.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        res = await fetch(`/api/pengurus/${editingPengurus.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: editNama.trim(),
            divisi: editDivisi.trim(),
            is_active: editingPengurus.is_active
          })
        });
      }

      const data = await res.json();
      if (data.success) {
        setEditPengurusBtnState('saved');
        loadPengurus();
        onRefreshGameConfig();
        setTimeout(() => {
          setEditingPengurus(null);
          setEditPengurusBtnState('idle');
        }, 700);
      } else {
        setEditPengurusBtnState('idle');
        alert(data.message || 'Gagal mengubah data pengurus');
      }
    } catch (err) {
      setEditPengurusBtnState('idle');
      alert('Terjadi kesalahan saat mengupdate data pengurus');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#080c14]/90 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative w-[98vw] max-w-[1550px] h-[95vh] max-h-[96vh] bg-[#0d1424] border-2 border-[#1e2b46] p-4 sm:p-6 shadow-tactile flex flex-col overflow-hidden"
      >
        {/* Corner Registration Crosshairs */}
        <div className="absolute top-1.5 left-1.5 text-[9px] font-mono text-zinc-600 font-bold pointer-events-none">+</div>
        <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-zinc-600 font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-zinc-600 font-bold pointer-events-none">+</div>
        <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-zinc-600 font-bold pointer-events-none">+</div>

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#1e2b46] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Console Admin Stand</h2>
              <p className="text-xs font-mono text-zinc-400">Pengelolaan Flashcard, Framer Motion Animation & Database SQLite</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#131e33] border border-[#273b5e] hover:border-zinc-500 text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Jika Belum Login PIN */}
        {!isAuthenticated ? (
          <div className="py-20 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center">
            <div className="w-14 h-14 bg-[#131e33] border-2 border-[#273b5e] flex items-center justify-center text-blue-400 mb-4 shadow-tactile">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Otentikasi Panitia Stand</h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">Masukkan PIN untuk mengelola parameter game dan bank soal.</p>

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
                className="w-full px-4 py-3 bg-[#080c14] border-2 border-[#273b5e] text-center font-mono text-2xl tracking-widest text-white focus:outline-none focus:border-blue-500"
              />

              {pinError && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-tactile hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                MASUK KE COMMAND CONSOLE
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden pt-3">
            {/* Tabs Navigation (Neo-Brutalist Buttons) */}
            <div className="flex items-center gap-2 border-b-2 border-[#1e2b46] pb-3 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-2 ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm'
                    : 'bg-[#131e33] text-zinc-400 border-[#1e2b46] hover:text-white'
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
                    ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm'
                    : 'bg-[#131e33] text-zinc-400 border-[#1e2b46] hover:text-white'
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
                    ? 'bg-blue-600 text-white border-blue-500 shadow-tactile-sm'
                    : 'bg-[#131e33] text-zinc-400 border-[#1e2b46] hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                REKAP SKOR & BACKUP
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
                      <div className="bg-[#080c14] border-2 border-[#1e2b46] p-4 space-y-4 shadow-tactile-sm">
                        <h3 className="text-xs font-bold text-blue-400 uppercase font-mono flex items-center gap-1.5 border-b border-[#1e2b46] pb-1.5">
                          <Sliders className="w-4 h-4" />
                          1. Parameter Sesi Kuis di Stand
                        </h3>

                        {/* 1. JUMLAH SOAL & TIMER (STEPPER CONTROLS, TANPA SLIDER) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Parameter 1: Jumlah Soal Per Sesi */}
                          <div className="bg-[#0b1220] border border-[#1e2b46] p-3 rounded">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-mono font-bold text-zinc-200">
                                Jumlah Soal Per Sesi
                              </label>
                              <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                                {settings.totalSoal} Soal
                              </span>
                            </div>

                            {/* Stepper with direct editable number */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateTotalSoal((parseInt(totalSoalInput, 10) || settings.totalSoal) - 1)}
                                disabled={settings.totalSoal <= 3}
                                className="w-10 h-10 flex items-center justify-center bg-[#131e33] hover:bg-blue-600/30 text-zinc-300 hover:text-white border border-[#273b5e] hover:border-blue-500 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-95"
                                title="Kurangi 1 Soal"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={totalSoalInput}
                                onChange={handleTotalSoalChange}
                                onBlur={handleTotalSoalBlur}
                                className="flex-1 h-10 bg-[#0d1424] border border-[#273b5e] focus:border-blue-500 focus:outline-none text-white font-mono text-center text-base font-bold rounded"
                                placeholder="5"
                              />
                              <button
                                type="button"
                                onClick={() => updateTotalSoal((parseInt(totalSoalInput, 10) || settings.totalSoal) + 1)}
                                disabled={settings.totalSoal >= maxAvailableSoal}
                                className="w-10 h-10 flex items-center justify-center bg-[#131e33] hover:bg-blue-600/30 text-zinc-300 hover:text-white border border-[#273b5e] hover:border-blue-500 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-95"
                                title="Tambah 1 Soal"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex flex-wrap items-center gap-1 mt-2">
                              {[3, 5, 7, 10].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => updateTotalSoal(preset)}
                                  className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                    settings.totalSoal === preset
                                      ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-tactile-sm'
                                      : 'bg-[#131e33] text-zinc-400 border-[#1e2b46] hover:text-zinc-200 hover:border-zinc-500'
                                  }`}
                                >
                                  {preset} Soal
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1.5">
                              Diambil acak dari bank {pengurusList.length} pengurus aktif.
                            </p>
                          </div>

                          {/* Parameter 2: Timer Per Soal */}
                          <div className="bg-[#0b1220] border border-[#1e2b46] p-3 rounded">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-mono font-bold text-zinc-200">
                                Timer Per Soal
                              </label>
                              <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                                {settings.timerDetik} Detik
                              </span>
                            </div>

                            {/* Stepper with direct editable number */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateTimerDetik((parseInt(timerDetikInput, 10) || settings.timerDetik) - 1)}
                                disabled={settings.timerDetik <= 3}
                                className="w-10 h-10 flex items-center justify-center bg-[#131e33] hover:bg-amber-600/30 text-zinc-300 hover:text-white border border-[#273b5e] hover:border-amber-500 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-95"
                                title="Kurangi 1 Detik"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={timerDetikInput}
                                onChange={handleTimerDetikChange}
                                onBlur={handleTimerDetikBlur}
                                className="flex-1 h-10 bg-[#0d1424] border border-[#273b5e] focus:border-amber-500 focus:outline-none text-white font-mono text-center text-base font-bold rounded"
                                placeholder="10"
                              />
                              <button
                                type="button"
                                onClick={() => updateTimerDetik((parseInt(timerDetikInput, 10) || settings.timerDetik) + 1)}
                                disabled={settings.timerDetik >= 60}
                                className="w-10 h-10 flex items-center justify-center bg-[#131e33] hover:bg-amber-600/30 text-zinc-300 hover:text-white border border-[#273b5e] hover:border-amber-500 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-95"
                                title="Tambah 1 Detik"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex flex-wrap items-center gap-1 mt-2">
                              {[5, 10, 15, 20].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => updateTimerDetik(preset)}
                                  className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                    settings.timerDetik === preset
                                      ? 'bg-amber-600 text-white border-amber-400 font-bold shadow-tactile-sm'
                                      : 'bg-[#131e33] text-zinc-400 border-[#1e2b46] hover:text-zinc-200 hover:border-zinc-500'
                                  }`}
                                >
                                  {preset}s {preset === 10 ? '(Standar)' : ''}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1.5">
                              Waktu berpikir peserta per soal sebelum timeout.
                            </p>
                          </div>
                        </div>

                        {/* 2. SYARAT BENAR & MODE PERTANYAAN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1e2b46]">
                          {/* Parameter 3: Syarat Benar untuk Cap Stand */}
                          <div className="bg-[#0b1220] border border-[#1e2b46] p-3 rounded">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-mono font-bold text-zinc-200">
                                Syarat Benar Cap Stand
                              </label>
                              <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                &ge; {settings.minBenarCap} Benar
                              </span>
                            </div>

                            {/* Stepper with clearable input */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateMinBenarCap((parseInt(minBenarCapInput, 10) || settings.minBenarCap) - 1)}
                                disabled={settings.minBenarCap <= 1}
                                className="w-10 h-10 flex items-center justify-center bg-[#131e33] hover:bg-emerald-600/30 text-zinc-300 hover:text-white border border-[#273b5e] hover:border-emerald-500 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-95"
                                title="Kurangi 1 Syarat Benar"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={minBenarCapInput}
                                onChange={handleMinBenarChange}
                                onBlur={handleMinBenarBlur}
                                className="flex-1 h-10 bg-[#0d1424] border border-[#273b5e] focus:border-emerald-500 focus:outline-none text-white font-mono text-center text-base font-bold rounded"
                                placeholder="4"
                              />
                              <button
                                type="button"
                                onClick={() => updateMinBenarCap((parseInt(minBenarCapInput, 10) || settings.minBenarCap) + 1)}
                                disabled={settings.minBenarCap >= settings.totalSoal}
                                className="w-10 h-10 flex items-center justify-center bg-[#131e33] hover:bg-emerald-600/30 text-zinc-300 hover:text-white border border-[#273b5e] hover:border-emerald-500 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none active:scale-95"
                                title="Tambah 1 Syarat Benar"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Presets for Cap Threshold */}
                            <div className="flex flex-wrap items-center gap-1 mt-2">
                              {[
                                { label: 'Semua Benar', val: settings.totalSoal },
                                { label: 'Salah 1', val: Math.max(1, settings.totalSoal - 1) },
                                { label: 'Salah 2', val: Math.max(1, settings.totalSoal - 2) },
                                { label: '50%', val: Math.max(1, Math.ceil(settings.totalSoal * 0.5)) }
                              ]
                                .filter((p, idx, arr) => arr.findIndex(x => x.val === p.val) === idx)
                                .map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => updateMinBenarCap(p.val)}
                                    className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                      settings.minBenarCap === p.val
                                        ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-tactile-sm'
                                        : 'bg-[#131e33] text-zinc-400 border-[#1e2b46] hover:text-zinc-200 hover:border-zinc-500'
                                    }`}
                                  >
                                    {p.label} ({p.val})
                                  </button>
                                ))}
                            </div>

                            <p className="text-[10px] text-emerald-400 font-mono mt-1.5">
                              Minimal {settings.minBenarCap} dari {settings.totalSoal} benar (maksimal salah {Math.max(0, settings.totalSoal - settings.minBenarCap)}).
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-zinc-300 mb-1">
                              Mode Pertanyaan
                            </label>
                            <select
                              value={modeKuis}
                              onChange={(e) => setModeKuis(e.target.value)}
                              className="w-full px-3 py-2 bg-[#0d1424] border border-[#273b5e] text-white font-mono text-sm"
                            >
                              <option value="tebak_nama">Tebak Nama Pengurus</option>
                              <option value="tebak_divisi">Tebak Divisi / Jabatan</option>
                              <option value="campuran">Campuran Acak (Nama & Divisi)</option>
                            </select>
                          </div>
                        </div>

                        {/* Setting Fokus Crop Foto Pengurus */}
                        <div className="pt-3 border-t border-[#1e2b46]">
                          <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                            <Focus className="w-3.5 h-3.5 text-blue-400" />
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
                                    ? 'bg-blue-950 border-blue-500 text-white'
                                    : 'bg-[#0d1424] border-[#1e2b46] text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                <p className="text-xs font-bold font-mono">{f.label}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{f.note}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Setting Mode Pengungkapan Jawaban (Element of Surprise) */}
                        <div className="pt-3 border-t border-[#1e2b46]">
                          <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>Mode Pengungkapan Jawaban (Stand Review):</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                            {[
                              {
                                id: 'akhir',
                                label: 'Tahan di Akhir (Element of Surprise)',
                                badge: 'REKOMENDASI STAND',
                                desc: 'Jawaban dikunci tanpa spoiler. Tidak ada kartu berbalik atau indikator benar/salah saat kuis. Skor & identitas resmi diungkap dramatis di akhir sesi.'
                              },
                              {
                                id: 'langsung',
                                label: 'Spill Langsung Tiap Soal',
                                badge: 'MODE LATIHAN',
                                desc: 'Kartu langsung berbalik ke sisi belakang untuk menampilkan ID Card resmi dan indikator warna hijau/merah segera setelah peserta memilih jawaban.'
                              }
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setSettings({ ...settings, spillJawaban: m.id as 'akhir' | 'langsung' })}
                                className={`p-2.5 border-2 text-left cursor-pointer transition-all ${
                                  (settings.spillJawaban || 'akhir') === m.id
                                    ? 'bg-blue-950/80 border-blue-500 shadow-tactile-blue text-white'
                                    : 'bg-[#0d1424] border-[#1e2b46] text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-xs font-bold font-mono text-white">{m.label}</span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${
                                    (settings.spillJawaban || 'akhir') === m.id
                                      ? 'bg-blue-900/60 border-blue-400 text-blue-300 font-bold'
                                      : 'border-[#1e2b46] text-zinc-500'
                                  }`}>
                                    {m.badge}
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-zinc-400 leading-snug">{m.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Katalog 8 Kombo Animasi Interaktif */}
                      <div className="bg-[#080c14] border-2 border-[#1e2b46] p-4 space-y-3 shadow-tactile-sm">
                        <div className="flex items-center justify-between border-b border-[#1e2b46] pb-1.5">
                          <h3 className="text-xs font-bold text-blue-400 uppercase font-mono flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            2. Pilih Kombo Animasi Flashcard ({ANIMATION_CHOICES.length} Kombo Interaktif)
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-400">Aktif: [{settings.animasiStyle}]</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                          {ANIMATION_CHOICES.map((item) => (
                            <label
                              key={item.id}
                              className={`p-2.5 border-2 flex flex-col justify-between cursor-pointer transition-all ${
                                settings.animasiStyle === item.id
                                  ? 'bg-blue-950/80 border-blue-500 shadow-tactile-blue'
                                  : 'bg-[#0d1424] border-[#1e2b46] hover:border-[#273b5e]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-bold text-white font-mono">{item.title}</span>
                                  <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider">
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
                                  className="accent-blue-500 cursor-pointer shrink-0"
                                />
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-tight font-sans mt-0.5">{item.desc}</p>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Box 3: Teks Misi Tambahan */}
                      <div className="bg-[#080c14] border-2 border-[#1e2b46] p-4 space-y-1.5 shadow-tactile-sm">
                        <label className="block text-xs font-mono text-zinc-300 font-bold uppercase">
                          Teks Misi Stand (Jika Mahasiswa Baru Salah &ge; 2 Soal):
                        </label>
                        <textarea
                          value={settings.misiCapText}
                          onChange={(e) => setSettings({ ...settings, misiCapText: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-[#0d1424] border border-[#273b5e] text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                        />
                      </div>

                      {/* Box 4: Kontrol Volume Audio Browser (BGM & SFX) */}
                      <div className="bg-[#080c14] border-2 border-[#1e2b46] p-4 space-y-2.5 shadow-tactile-sm">
                        <div className="flex items-center justify-between border-b border-[#1e2b46] pb-1.5">
                          <h3 className="text-xs font-bold text-blue-400 uppercase font-mono flex items-center gap-1.5">
                            <Sliders className="w-4 h-4" />
                            4. Kontrol Volume Audio Stand (BGM & SFX)
                          </h3>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug font-sans">
                          Sesuaikan volume musik latar arcade dan efek suara flip kartu secara presisi di browser agar pas dengan suasana ramai stand.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAudioMixer(true)}
                          className="w-full py-2.5 px-3 bg-[#0d1424] hover:bg-[#112544] border-2 border-[#38bdf8] text-[#38bdf8] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-tactile-sm transition-all cursor-pointer"
                        >
                          <Sliders className="w-4 h-4" />
                          <span>BUKA MIXER VOLUME AUDIO BROWSER</span>
                        </button>
                      </div>

                      {/* Tombol Simpan dengan Status Berubah Jelas */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={settingsBtnState === 'saving'}
                          className={`w-full py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-tactile transition-all cursor-pointer ${
                            settingsBtnState === 'saved'
                              ? 'bg-emerald-500 text-zinc-950 shadow-tactile-emerald'
                              : settingsBtnState === 'saving'
                              ? 'bg-zinc-700 text-zinc-300 cursor-wait'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-tactile hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
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
                    <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-0">
                      <div className="bg-[#080c14] border-2 border-[#1e2b46] p-4 flex flex-col justify-between shadow-tactile relative">
                        <div className="absolute top-1 left-1 text-[8px] font-mono text-zinc-700 font-bold">+</div>
                        <div className="absolute top-1 right-1 text-[8px] font-mono text-zinc-700 font-bold">+</div>
                        <div className="absolute bottom-1 left-1 text-[8px] font-mono text-zinc-700 font-bold">+</div>
                        <div className="absolute bottom-1 right-1 text-[8px] font-mono text-zinc-700 font-bold">+</div>

                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e2b46]">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500" />
                              <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                                STUDIO SIMULASI KARTU
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="border border-[#273b5e] bg-[#0d1424] px-2 py-0.5 text-blue-400 uppercase">
                                [{settings.animasiStyle}]
                              </span>
                              <span className="border border-[#273b5e] bg-[#0d1424] px-2 py-0.5 text-zinc-400 uppercase">
                                [{settings.fotoFokus || 'tengah_atas'}]
                              </span>
                            </div>
                          </div>

                          {/* Quick Member Dropdown Picker to inspect any of 34 pengurus */}
                          <div className="mb-2">
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                              Pilih Pengurus untuk Uji Visual Wajah:
                            </label>
                            <select
                              value={previewIdx}
                              onChange={(e) => {
                                setPreviewIdx(parseInt(e.target.value));
                                setPreviewAnswered(false);
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#0d1424] border border-[#273b5e] text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                            >
                              {pengurusList.map((p, i) => (
                                <option key={p.id} value={i}>
                                  #{i + 1} {p.nama} ({p.divisi})
                                </option>
                              ))}
                            </select>
                          </div>

                          <p className="text-[11px] text-zinc-500 mb-2 text-center font-mono">
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
                        <div className="space-y-2 pt-3 border-t-2 border-[#1e2b46]">
                          {/* Next / Prev Card Simulation */}
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAnswered(false);
                                setPreviewIdx(prev => (prev > 0 ? prev - 1 : pengurusList.length - 1));
                              }}
                              className="flex-1 py-2 px-2 bg-[#0d1424] border border-[#273b5e] text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-500 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              PREV KARTU
                            </button>

                            <span className="text-xs font-mono text-blue-400 font-bold px-2">
                              {((previewIdx % Math.max(1, pengurusList.length)) + 1)} / {Math.max(1, pengurusList.length)}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAnswered(false);
                                setPreviewIdx(prev => (prev + 1) % Math.max(1, pengurusList.length));
                              }}
                              className="flex-1 py-2 px-2 bg-[#0d1424] border border-[#273b5e] text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-500 flex items-center justify-center gap-1 cursor-pointer"
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
                              className="py-2 px-2 bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-900 flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm"
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
                              className="py-2 px-2 bg-rose-950 border border-rose-500 text-rose-400 text-xs font-mono font-bold hover:bg-rose-900 flex items-center justify-center gap-1.5 cursor-pointer shadow-tactile-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              SIMULASI SALAH
                            </button>
                          </div>

                          {previewAnswered && (
                            <button
                              type="button"
                              onClick={() => setPreviewAnswered(false)}
                              className="w-full py-1.5 bg-[#0d1424] border border-[#273b5e] text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
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
                  <div className="bg-[#080c14] border-2 border-[#1e2b46] p-4 shadow-tactile-sm">
                    <h3 className="text-xs font-bold text-blue-400 uppercase font-mono mb-3 flex items-center gap-1.5 border-b border-[#1e2b46] pb-1.5">
                      <Plus className="w-4 h-4" />
                      Tambah Foto & Pengurus Baru HIMA TI
                    </h3>

                    <form onSubmit={handleAddPengurus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-zinc-300 mb-1">Nama Lengkap:</label>
                        <input
                          type="text"
                          value={newNama}
                          onChange={(e) => setNewNama(e.target.value)}
                          placeholder="Misal: Budi Santoso"
                          required
                          className="w-full px-3 py-2 bg-[#0d1424] border border-[#273b5e] text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-300 mb-1">Divisi / Jabatan:</label>
                        <input
                          type="text"
                          value={newDivisi}
                          onChange={(e) => setNewDivisi(e.target.value)}
                          placeholder="Misal: Anggota Minat dan Bakat"
                          required
                          className="w-full px-3 py-2 bg-[#0d1424] border border-[#273b5e] text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-300 mb-1">Upload Foto:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewFotoFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:border file:border-[#273b5e] file:text-xs file:bg-[#131e33] file:text-blue-400 hover:file:bg-zinc-800 cursor-pointer"
                        />
                      </div>

                      <div className="sm:col-span-3 mt-1">
                        <button
                          type="submit"
                          disabled={addPengurusBtnState === 'saving'}
                          className={`w-full py-3 font-bold text-xs flex items-center justify-center gap-1.5 shadow-tactile transition-all cursor-pointer ${
                            addPengurusBtnState === 'saved'
                              ? 'bg-emerald-500 text-zinc-950'
                              : addPengurusBtnState === 'saving'
                              ? 'bg-zinc-700 text-zinc-300'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[#1e2b46] pb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xs font-mono uppercase text-zinc-300 font-bold">
                          Koleksi Pengurus ({pengurusList.length} Orang)
                        </h4>
                        <button
                          type="button"
                          onClick={loadPengurus}
                          className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                        <input
                          type="text"
                          value={searchPengurus}
                          onChange={(e) => setSearchPengurus(e.target.value)}
                          placeholder="Cari nama / divisi..."
                          className="w-full pl-8 pr-3 py-1.5 bg-[#080c14] border border-[#1e2b46] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-sans"
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
                              ? 'bg-[#080c14] border-[#1e2b46] shadow-tactile-sm' 
                              : 'bg-[#080c14]/40 border-zinc-900 opacity-40'
                          }`}
                        >
                          <div className="w-full aspect-[3/4] overflow-hidden bg-[#0d1424] mb-1.5 border border-[#1e2b46]">
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

                          <h5 className="font-bold text-[11px] text-white line-clamp-1 leading-tight">{p.nama}</h5>
                          <p className="text-[10px] text-blue-400 font-mono line-clamp-1 mb-2">{p.divisi}</p>

                          <div className="flex items-center gap-1 mt-auto pt-1 border-t border-zinc-900 w-full justify-center">
                            <button
                              type="button"
                              onClick={() => handleStartEditPengurus(p)}
                              title="Edit Nama / Jabatan / Foto"
                              className="p-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#38bdf8] text-zinc-400 hover:text-[#38bdf8] cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePengurusActive(p)}
                              title={p.is_active ? 'Nonaktifkan Kartu' : 'Aktifkan Kartu'}
                              className="p-1 bg-[#0d1424] border border-[#1e2b46] hover:border-[#273b5e] text-zinc-400 hover:text-white cursor-pointer"
                            >
                              {p.is_active ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePengurus(p.id)}
                              title="Hapus Pengurus"
                              className="p-1 bg-[#0d1424] border border-[#1e2b46] hover:border-rose-600 text-zinc-400 hover:text-rose-400 cursor-pointer"
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
                  <div className="bg-[#080c14] border-2 border-[#1e2b46] p-5 shadow-tactile-sm">
                    <h3 className="text-xs font-bold text-blue-400 uppercase font-mono mb-2 flex items-center gap-1.5 border-b border-[#1e2b46] pb-1.5">
                      <Download className="w-4 h-4" />
                      Cadangkan Data Kuis (Backup & Restore)
                    </h3>
                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">
                      Download file cadangan JSON ke laptop stand untuk mengamankan seluruh data pengurus, pengaturan kuis, dan skor maba.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="py-3 px-4 bg-[#0d1424] hover:bg-[#131e33] text-white font-mono text-xs flex items-center justify-center gap-2 border border-[#273b5e] shadow-tactile-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-blue-400" />
                        DOWNLOAD BACKUP JSON
                      </button>

                      <label className="py-3 px-4 bg-[#0d1424] hover:bg-[#131e33] text-white font-mono text-xs flex items-center justify-center gap-2 border border-[#273b5e] shadow-tactile-sm cursor-pointer text-center">
                        <Upload className="w-4 h-4 text-emerald-400" />
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

                  <div className="bg-[#080c14] border-2 border-rose-600/70 p-5 shadow-tactile-sm">
                    <h3 className="text-xs font-bold text-rose-400 uppercase font-mono mb-1 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      Reset Papan Peringkat Sesi
                    </h3>
                    <p className="text-xs text-zinc-400 mb-3 font-sans">
                      Hapus seluruh daftar nilai maba saat pergantian hari GMTI stand.
                    </p>

                    <button
                      type="button"
                      onClick={handleResetLeaderboard}
                      disabled={isResettingLeaderboard}
                      className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-tactile hover:shadow-tactile-coral transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isResettingLeaderboard ? 'MERESET...' : 'KOSONGKAN SEMUA SKOR LEADERBOARD'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Edit Pengurus */}
      <AnimatePresence>
        {editingPengurus && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-[#050811]/90 backdrop-blur-md select-none">
            <div className="absolute inset-0" onClick={() => setEditingPengurus(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="relative w-full max-w-md bg-[#080c14] border-2 border-[#1e2b46] p-4 sm:p-5 shadow-tactile text-[#f8fafc] z-10 my-auto"
            >
              {/* Decorative Corner Marks */}
              <div className="absolute top-1.5 left-1.5 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute top-1.5 right-1.5 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>
              <div className="absolute bottom-1.5 right-1.5 text-[8px] font-mono text-[#273b5e] font-bold pointer-events-none">+</div>

              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#1e2b46]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#0c182c] border border-[#38bdf8] text-[#38bdf8]">
                    <Pencil className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                      EDIT PENGURUS #{editingPengurus.id}
                    </h4>
                    <span className="text-[9.5px] font-mono text-[#64748b]">Perbarui nama, jabatan, atau ganti foto</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPengurus(null)}
                  className="p-1 text-zinc-400 hover:text-white bg-[#0d1424] border border-[#1e2b46] hover:border-[#f43f5e] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditPengurus} className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 p-2.5 bg-[#0d1424] border border-[#1e2b46]">
                  <img
                    src={editingPengurus.foto_url}
                    alt={editingPengurus.nama}
                    className="w-11 h-14 object-cover object-[center_18%] bg-[#080c14] border border-[#1e2b46] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] text-[#38bdf8] block font-bold uppercase tracking-wider">DATA AKTIF DI DATABASE</span>
                    <p className="font-bold text-white truncate text-xs">{editingPengurus.nama}</p>
                    <p className="text-[#94a3b8] text-[10px] truncate">{editingPengurus.divisi}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-300 mb-1 uppercase font-bold">
                    Nama Lengkap Pengurus:
                  </label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#0d1424] border border-[#273b5e] text-white text-xs focus:outline-none focus:border-[#38bdf8] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-300 mb-1 uppercase font-bold">
                    Divisi / Jabatan Pengurus:
                  </label>
                  <input
                    type="text"
                    value={editDivisi}
                    onChange={(e) => setEditDivisi(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#0d1424] border border-[#273b5e] text-white text-xs focus:outline-none focus:border-[#38bdf8] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-300 mb-1 uppercase font-bold">
                    Ganti Foto Pengurus (Opsional):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditFotoFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:border file:border-[#273b5e] file:text-[10px] file:bg-[#131e33] file:text-[#38bdf8] hover:file:bg-zinc-800 cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 block mt-0.5">Biarkan kosong jika tidak ingin mengubah foto.</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#1e2b46]">
                  <button
                    type="button"
                    onClick={() => setEditingPengurus(null)}
                    className="py-2.5 bg-[#0d1424] border border-[#1e2b46] hover:border-zinc-500 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={editPengurusBtnState === 'saving'}
                    className={`py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-tactile transition-all cursor-pointer ${
                      editPengurusBtnState === 'saved'
                        ? 'bg-emerald-500 text-zinc-950 shadow-tactile-emerald'
                        : editPengurusBtnState === 'saving'
                        ? 'bg-zinc-700 text-zinc-300 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-tactile hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px]'
                    }`}
                  >
                    {editPengurusBtnState === 'saved' ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>TERSAMPAN!</span>
                      </>
                    ) : editPengurusBtnState === 'saving' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>SIMPAN PERUBAHAN</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audio Mixer Modal */}
      <AudioMixerModal isOpen={showAudioMixer} onClose={() => setShowAudioMixer(false)} />
    </div>
  );
};

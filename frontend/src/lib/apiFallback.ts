import { Pengurus, Question, LeaderboardEntry, QuizConfig } from '../types';

export const officialStaticPengurus: Pengurus[] = [
  { id: 1, nama: 'Ni Nyoman Putri Kirana', divisi: 'Ketua Umum', foto_url: '/uploads/ni-nyoman-putri-kirana.webp', is_active: 1 },
  { id: 2, nama: 'I Made Bintang Kartika Yasa', divisi: 'Wakil Ketua 1', foto_url: '/uploads/i-made-bintang-kartika-yasa.webp', is_active: 1 },
  { id: 3, nama: 'I Gede Angga Yudistira', divisi: 'Wakil Ketua 2', foto_url: '/uploads/i-gede-angga-yudistira.webp', is_active: 1 },
  { id: 4, nama: 'Putu Kencana Sridewi', divisi: 'Sekretaris 1', foto_url: '/uploads/putu-kencana-sridewi.webp', is_active: 1 },
  { id: 5, nama: 'Dewa Ayu Dwicahya Dewanti', divisi: 'Sekretaris 2', foto_url: '/uploads/dewa-ayu-dwicahya-dewanti.webp', is_active: 1 },
  { id: 6, nama: 'Ida Ayu Ika Pramesti Kesuma', divisi: 'Bendahara 1', foto_url: '/uploads/ida-ayu-ika-pramesti-kesuma.webp', is_active: 1 },
  { id: 7, nama: 'Ida Ayu Gede Sri Widiani', divisi: 'Bendahara 2', foto_url: '/uploads/ida-ayu-gede-sri-widiani.webp', is_active: 1 },
  { id: 8, nama: 'Kadek Yuni Dwiyantini Savitri', divisi: 'Kabid Minat dan Bakat', foto_url: '/uploads/kadek-yuni-dwiyantini-savitri.webp', is_active: 1 },
  { id: 9, nama: 'I Putu Adhiatman', divisi: 'Kabid Media dan Humas', foto_url: '/uploads/i-putu-adhiatman.webp', is_active: 1 },
  { id: 10, nama: 'Kadek Novan Suhaliem Chandra', divisi: 'Kabid Penelitian dan Pengabdian Masyarakat', foto_url: '/uploads/kadek-novan-suhaliem-chandra.webp', is_active: 1 },
  { id: 11, nama: 'I Komang Bayu Kurniawan', divisi: 'Kadiv Media', foto_url: '/uploads/i-komang-bayu-kurniawan.webp', is_active: 1 },
  { id: 12, nama: 'I Gst.N.Pt.Diana Putra Pratama', divisi: 'Kadiv Humas', foto_url: '/uploads/i-gst-n-pt-diana-putra-pratama.webp', is_active: 1 },
  { id: 13, nama: 'Fiji Firmanda', divisi: 'Kadiv Penelitian', foto_url: '/uploads/fiji-firmanda.webp', is_active: 1 },
  { id: 14, nama: 'Putu Raditya Dharma Putra', divisi: 'Kadiv Pengabdian Masyarakat', foto_url: '/uploads/putu-raditya-dharma-putra.webp', is_active: 1 },
  { id: 15, nama: 'Ida Bagus Gede Dharmayoga Iswara', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/ida-bagus-gede-dharmayoga-iswara.webp', is_active: 1 },
  { id: 16, nama: 'I Wayan Oka Eswara Candrana', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/i-wayan-oka-eswara-candrana.webp', is_active: 1 },
  { id: 17, nama: 'Ni Putu Dewi Candra Wangi', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/ni-putu-dewi-candra-wangi.webp', is_active: 1 },
  { id: 18, nama: 'I Made Arya Krisna Sanjaya', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/i-made-arya-krisna-sanjaya.webp', is_active: 1 },
  { id: 19, nama: 'I Made Agastya Wedastika', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-made-agastya-wedastika.webp', is_active: 1 },
  { id: 20, nama: 'I Gusti Bagus Agung Andra Pradnyana Pandji', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-gusti-bagus-agung-andra-pradnyana-pandji.webp', is_active: 1 },
  { id: 21, nama: 'I Made Adhi Pranaya Kusuma Putra', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-made-adhi-pranaya-kusuma-putra.webp', is_active: 1 },
  { id: 22, nama: 'I Kadek Abi Prawira', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-kadek-abi-prawira.webp', is_active: 1 },
  { id: 23, nama: 'Ida Bagus Windu Diwangkara', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/ida-bagus-windu-diwangkara.webp', is_active: 1 },
  { id: 24, nama: 'I Dewa Gede Ariesta Dharmayuda', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/i-dewa-gede-ariesta-dharmayuda.webp', is_active: 1 },
  { id: 25, nama: 'I Made Chandra Yudi Saskara', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/i-made-chandra-yudi-saskara.webp', is_active: 1 },
  { id: 26, nama: 'Ni Kadek Ayu Dea Santika Dewi', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/ni-kadek-ayu-dea-santika-dewi.webp', is_active: 1 },
  { id: 27, nama: 'I Made Kusuma Jaya Wardana', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/i-made-kusuma-jaya-wardana.webp', is_active: 1 },
  { id: 28, nama: 'Gede Satya Devra Widyanatha', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/gede-satya-devra-widyanatha.webp', is_active: 1 },
  { id: 29, nama: 'Putu Gde Adyatma Putra', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/putu-gde-adyatma-putra.webp', is_active: 1 },
  { id: 30, nama: 'Ngurah Gde Rheino Darma Tenaya Perean', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/ngurah-gde-rheino-darma-tenaya-perean.webp', is_active: 1 },
  { id: 31, nama: 'Luh Gede Manik Prascita Yoga', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/luh-gede-manik-prascita-yoga.webp', is_active: 1 },
  { id: 32, nama: 'Ni Wayan Ananda Oktavianti', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/ni-wayan-ananda-oktavianti.webp', is_active: 1 },
  { id: 33, nama: 'Ni Made Adinda Oktaviani', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/ni-made-adinda-oktaviani.webp', is_active: 1 },
  { id: 34, nama: 'Ton Klein Pandesolan', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/ton-klein-pandesolan.webp', is_active: 1 }
];

export const defaultStaticSettings: Record<string, string> = {
  soalPerSesi: '5',
  timerDetik: '15',
  minBenarCap: '4',
  modeKuis: 'tebak_nama',
  animasiStyle: 'combo',
  misiCapText: 'Follow Instagram @himaprodi_ti & Spinwheel.',
  adminPin: '2026',
  fotoFokus: 'tengah_atas',
  spillJawaban: 'akhir',
  cooldownDetik: '3'
};

const STORAGE_KEYS = {
  SETTINGS: 'himati_static_settings',
  PENGURUS: 'himati_static_pengurus',
  LEADERBOARD: 'himati_static_leaderboard'
};

function getLocalSettings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      let changed = false;
      if (parsed.misiCapText && parsed.misiCapText.includes('@himati_official')) {
        parsed.misiCapText = 'Follow Instagram @himaprodi_ti & Spinwheel.';
        changed = true;
      }
      if (parsed.timerDetik === '10') {
        parsed.timerDetik = '15';
        changed = true;
      }
      if (changed) {
        setLocalSettings(parsed);
      }
      return { ...defaultStaticSettings, ...parsed };
    }
  } catch {
    // Ignore error
  }
  return { ...defaultStaticSettings };
}

function setLocalSettings(settings: Record<string, string>) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

function getLocalPengurus(): Pengurus[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGURUS);
    if (raw) {
      const parsed: Pengurus[] = JSON.parse(raw);
      let hasBph = false;
      const cleaned = parsed.map(p => {
        if (p.divisi && p.divisi.includes('(BPH)')) {
          hasBph = true;
          return { ...p, divisi: p.divisi.replace(/\s*\(BPH\)/g, '').trim() };
        }
        return p;
      });
      if (hasBph) {
        setLocalPengurus(cleaned);
      }
      return cleaned;
    }
  } catch {
    // Ignore error
  }
  return [...officialStaticPengurus];
}

function setLocalPengurus(pengurus: Pengurus[]) {
  localStorage.setItem(STORAGE_KEYS.PENGURUS, JSON.stringify(pengurus));
}

function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore error
  }
  return [];
}

function setLocalLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries));
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function detectGender(name: string): 'cewek' | 'cowok' {
  const lower = name.toLowerCase();
  const femaleIndicators = ['ni ', 'ayu', 'dewi', 'putri', 'kencana', 'sridewi', 'dwicahya', 'savitri', 'oktavianti', 'oktaviani', 'dea', 'candra wangi', 'prascita'];
  for (const f of femaleIndicators) {
    if (lower.includes(f)) return 'cewek';
  }
  return 'cowok';
}

function generateClientQuizSession(): { success: boolean; config: QuizConfig; questions: Question[] } {
  const settings = getLocalSettings();
  const soalCount = Math.max(1, parseInt(settings.soalPerSesi) || 5);
  const activePengurus = getLocalPengurus().filter(p => p.is_active === 1);
  const available = activePengurus.length >= 4 ? activePengurus : officialStaticPengurus;

  const shuffledPengurus = shuffle(available);
  const targets = shuffledPengurus.slice(0, Math.min(soalCount, shuffledPengurus.length));

  const questions: Question[] = targets.map((target, idx) => {
    const isName = settings.modeKuis === 'tebak_divisi' ? false : (settings.modeKuis === 'campuran' ? (idx % 2 === 0) : true);
    const correctAnswer = isName ? target.nama : target.divisi;
    const targetGender = detectGender(target.nama);

    const distractors: string[] = [];
    const others = available.filter(p => p.id !== target.id);

    if (isName) {
      const sameGender = shuffle(others.filter(p => detectGender(p.nama) === targetGender));
      for (const p of sameGender) {
        if (p.nama !== correctAnswer && !distractors.includes(p.nama)) {
          distractors.push(p.nama);
        }
        if (distractors.length >= 3) break;
      }
      if (distractors.length < 3) {
        const diffGender = shuffle(others.filter(p => detectGender(p.nama) !== targetGender));
        for (const p of diffGender) {
          if (p.nama !== correctAnswer && !distractors.includes(p.nama)) {
            distractors.push(p.nama);
          }
          if (distractors.length >= 3) break;
        }
      }
    } else {
      const shuffledOthers = shuffle(others);
      for (const p of shuffledOthers) {
        if (p.divisi !== correctAnswer && !distractors.includes(p.divisi)) {
          distractors.push(p.divisi);
        }
        if (distractors.length >= 3) break;
      }
    }

    const defaultDivs = ['Divisi Media & Humas', 'Divisi Minat dan Bakat', 'Divisi Penelitian', 'Divisi Pengabdian Masyarakat', 'Pengurus Inti'];
    let fallbackCounter = 0;
    while (distractors.length < 3) {
      const fb = isName ? `Pengurus HIMA ${fallbackCounter + 1}` : defaultDivs[fallbackCounter % defaultDivs.length];
      if (fb !== correctAnswer && !distractors.includes(fb)) {
        distractors.push(fb);
      }
      fallbackCounter++;
    }

    const correctKey = ['A', 'B', 'C', 'D'][idx % 4];
    const wrongKeys = shuffle(['A', 'B', 'C', 'D'].filter(k => k !== correctKey));
    const finalDistractors = shuffle(distractors.slice(0, 3));

    const options = ['A', 'B', 'C', 'D'].map(key => {
      if (key === correctKey) {
        return { key, text: correctAnswer, isCorrect: true };
      }
      const wrongIdx = wrongKeys.indexOf(key);
      return { key, text: finalDistractors[wrongIdx] || 'Pilihan', isCorrect: false };
    });

    return {
      id: target.id,
      nomor: idx + 1,
      foto_url: target.foto_url,
      questionText: isName ? `Siapakah nama pengurus dari ${target.divisi} berikut?` : `Dari divisi manakah kakak pengurus ${target.nama} ini?`,
      questionType: isName ? 'tebak_nama' : 'tebak_divisi',
      correctNama: target.nama,
      correctDivisi: target.divisi,
      options
    };
  });

  const config: QuizConfig = {
    totalSoal: questions.length,
    timerDetik: parseInt(settings.timerDetik) || 10,
    cooldownDetik: parseInt(settings.cooldownDetik) || 3,
    minBenarCap: parseInt(settings.minBenarCap) || 4,
    animasiStyle: (settings.animasiStyle as QuizConfig['animasiStyle']) || 'combo',
    misiCapText: settings.misiCapText || 'Follow Instagram @himaprodi_ti & Spinwheel.',
    fotoFokus: (settings.fotoFokus as QuizConfig['fotoFokus']) || 'tengah_atas',
    spillJawaban: (settings.spillJawaban as QuizConfig['spillJawaban']) || 'akhir'
  };

  return { success: true, config, questions };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Fallback': 'true'
    }
  });
}

export async function handleClientApiFallback(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const parsedUrl = new URL(url, window.location.origin);
  const pathname = parsedUrl.pathname;

  // 1. GET /api/settings
  if (pathname === '/api/settings' && method === 'GET') {
    return jsonResponse({ success: true, data: getLocalSettings() });
  }

  // 2. POST /api/settings
  if (pathname === '/api/settings' && method === 'POST') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      const current = getLocalSettings();
      if (body.adminPin && body.adminPin !== current.adminPin) {
        return jsonResponse({ success: false, message: 'PIN Admin salah!' }, 401);
      }
      const { adminPin, settings: nestedSettings, ...directSettings } = body;
      const payloadSettings = (nestedSettings && Object.keys(nestedSettings).length > 0) ? nestedSettings : directSettings;
      const updated = { ...current, ...payloadSettings };
      setLocalSettings(updated);
      return jsonResponse({ success: true, message: 'Pengaturan berhasil diperbarui!' });
    } catch {
      return jsonResponse({ success: false, message: 'Invalid payload' }, 400);
    }
  }

  // 3. GET /api/pengurus
  if (pathname === '/api/pengurus' && method === 'GET') {
    const all = parsedUrl.searchParams.get('all') === 'true';
    const list = getLocalPengurus();
    const data = all ? list : list.filter(p => p.is_active === 1);
    return jsonResponse({ success: true, data });
  }

  // 4. POST /api/pengurus
  if (pathname === '/api/pengurus' && method === 'POST') {
    const list = getLocalPengurus();
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
    const entry: Pengurus = {
      id: newId,
      nama: body.nama || 'Pengurus Baru',
      divisi: body.divisi || 'Anggota',
      foto_url: body.foto_url || '/uploads/default-avatar.svg',
      is_active: 1
    };
    list.push(entry);
    setLocalPengurus(list);
    return jsonResponse({ success: true, message: 'Pengurus berhasil ditambahkan!', id: newId });
  }

  // 5. PUT /api/pengurus/:id
  if (pathname.startsWith('/api/pengurus/') && method === 'PUT') {
    const id = parseInt(pathname.split('/').pop() || '0');
    const list = getLocalPengurus();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      list[idx] = { ...list[idx], ...body };
      setLocalPengurus(list);
      return jsonResponse({ success: true, message: 'Data pengurus berhasil diupdate!' });
    }
    return jsonResponse({ success: false, message: 'Pengurus tidak ditemukan' }, 404);
  }

  // 6. DELETE /api/pengurus/:id
  if (pathname.startsWith('/api/pengurus/') && method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop() || '0');
    const list = getLocalPengurus().filter(p => p.id !== id);
    setLocalPengurus(list);
    return jsonResponse({ success: true, message: 'Pengurus berhasil dihapus!' });
  }

  // 7. GET /api/check-name
  if (pathname === '/api/check-name' && method === 'GET') {
    const name = parsedUrl.searchParams.get('name')?.trim().toLowerCase() || '';
    const leaderboard = getLocalLeaderboard();
    const exists = leaderboard.some(e => e.nama_peserta.trim().toLowerCase() === name);
    return jsonResponse({ success: true, available: !exists });
  }

  // 8. GET /api/leaderboard
  if (pathname === '/api/leaderboard' && method === 'GET') {
    const leaderboard = getLocalLeaderboard();
    // Urutkan skor DESC, waktu_detik ASC
    const sorted = [...leaderboard].sort((a, b) => {
      if (b.skor !== a.skor) return b.skor - a.skor;
      return a.waktu_detik - b.waktu_detik;
    });
    return jsonResponse({ success: true, data: sorted });
  }

  // 9. POST /api/leaderboard
  if (pathname === '/api/leaderboard' && method === 'POST') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      const leaderboard = getLocalLeaderboard();
      const newEntry: LeaderboardEntry = {
        id: leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.id)) + 1 : 1,
        nama_peserta: body.nama_peserta || 'Anonim',
        skor: body.skor || 0,
        total_soal: body.total_soal || 5,
        waktu_detik: body.waktu_detik || 0,
        status_cap: body.status_cap || 'lolos',
        created_at: new Date().toISOString()
      };
      leaderboard.push(newEntry);
      setLocalLeaderboard(leaderboard);
      return jsonResponse({ success: true, message: 'Skor berhasil dicatat!' });
    } catch {
      return jsonResponse({ success: false, message: 'Format data tidak valid' }, 400);
    }
  }

  // 10. POST /api/leaderboard/reset
  if (pathname === '/api/leaderboard/reset' && method === 'POST') {
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
    const settings = getLocalSettings();
    if (body.adminPin && body.adminPin !== settings.adminPin) {
      return jsonResponse({ success: false, message: 'PIN Admin salah!' }, 401);
    }
    setLocalLeaderboard([]);
    return jsonResponse({ success: true, message: 'Leaderboard berhasil direset!' });
  }

  // 11. POST /api/backup/import
  if (pathname === '/api/backup/import' && method === 'POST') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
      const settings = getLocalSettings();
      if (body.adminPin && body.adminPin !== settings.adminPin) {
        return jsonResponse({ success: false, message: 'PIN Admin salah!' }, 401);
      }
      if (body.backupData?.pengurus && Array.isArray(body.backupData.pengurus)) {
        setLocalPengurus(body.backupData.pengurus);
      }
      if (body.backupData?.settings && typeof body.backupData.settings === 'object') {
        setLocalSettings({ ...settings, ...body.backupData.settings });
      }
      return jsonResponse({ success: true, message: 'Data backup berhasil di-restore!' });
    } catch {
      return jsonResponse({ success: false, message: 'Gagal merestore backup' }, 400);
    }
  }

  // 12. GET /api/quiz-session
  if (pathname === '/api/quiz-session' && method === 'GET') {
    const session = generateClientQuizSession();
    return jsonResponse(session);
  }

  return jsonResponse({ success: false, message: 'Endpoint tidak ditemukan' }, 404);
}

export function installApiInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.toString() 
        : input.url;

    if (url.startsWith('/api/') || url.includes('/api/')) {
      try {
        const response = await originalFetch(input, init);
        // Jika server backend merespons valid (bukan 404, 502, 503)
        if (response.status < 400 || response.status === 401 || response.status === 403) {
          return response;
        }
      } catch {
        // Backend offline / network failed -> lanjut ke fallback
      }

      // Gunakan mock engine client-side jika backend tidak tersedia
      return handleClientApiFallback(url, init);
    }

    return originalFetch(input, init);
  };
}

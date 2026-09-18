import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { seedInitialData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// Muat environment variable dari .env jika tersedia
function loadEnv() {
  const rootEnv = path.join(__dirname, '..', '.env');
  const backendEnv = path.join(__dirname, '.env');
  const envPath = fs.existsSync(rootEnv) ? rootEnv : fs.existsSync(backendEnv) ? backendEnv : null;
  if (envPath) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch {
      // Abaikan jika gagal membaca
    }
  }
}
loadEnv();

// Jalankan seed data awal
seedInitialData();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(uploadsDir));

// Konfigurasi Multer untuk Upload Foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'pengurus-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Helper untuk mengambil settings
function getSettingsMap() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const map = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

// -------------------------------------------------------------
// 1. ENDPOINTS SETTINGS
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  try {
    const settings = getSettingsMap();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const { adminPin, ...newSettings } = req.body;
    const currentSettings = getSettingsMap();

    // Verifikasi PIN jika diberikan
    if (adminPin && adminPin !== currentSettings.adminPin) {
      return res.status(401).json({ success: false, message: 'PIN Admin salah!' });
    }

    const updateStmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(newSettings)) {
      updateStmt.run(key, String(value));
    }

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui!', data: getSettingsMap() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 2. ENDPOINTS PENGURUS (CRUD)
// -------------------------------------------------------------
app.get('/api/pengurus', (req, res) => {
  try {
    const { all } = req.query;
    const query = all === 'true' 
      ? 'SELECT * FROM pengurus ORDER BY id ASC' 
      : 'SELECT * FROM pengurus WHERE is_active = 1 ORDER BY id ASC';
    const rows = db.prepare(query).all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/pengurus', upload.single('foto'), (req, res) => {
  try {
    const { nama, divisi } = req.body;
    if (!nama || !divisi) {
      return res.status(400).json({ success: false, message: 'Nama dan divisi wajib diisi!' });
    }

    let foto_url = '/uploads/default-avatar.svg';
    if (req.file) {
      foto_url = `/uploads/${req.file.filename}`;
    } else if (req.body.foto_url) {
      foto_url = req.body.foto_url;
    }

    const insertStmt = db.prepare('INSERT INTO pengurus (nama, divisi, foto_url, is_active) VALUES (?, ?, ?, 1)');
    const result = insertStmt.run(nama, divisi, foto_url);

    res.json({
      success: true,
      message: 'Pengurus berhasil ditambahkan!',
      data: { id: result.lastInsertRowid, nama, divisi, foto_url, is_active: 1 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/pengurus/:id', upload.single('foto'), (req, res) => {
  try {
    const { id } = req.params;
    const { nama, divisi, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM pengurus WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data pengurus tidak ditemukan' });
    }

    let foto_url = existing.foto_url;
    if (req.file) {
      foto_url = `/uploads/${req.file.filename}`;
    }

    const updateStmt = db.prepare(`
      UPDATE pengurus 
      SET nama = ?, divisi = ?, foto_url = ?, is_active = ? 
      WHERE id = ?
    `);

    updateStmt.run(
      nama !== undefined ? nama : existing.nama,
      divisi !== undefined ? divisi : existing.divisi,
      foto_url,
      is_active !== undefined ? Number(is_active) : existing.is_active,
      id
    );

    res.json({ success: true, message: 'Data pengurus berhasil diupdate!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/pengurus/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM pengurus WHERE id = ?').run(id);
    res.json({ success: true, message: 'Pengurus berhasil dihapus!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 3. GENERATE QUIZ SESSION (AUTO-DISTRACTOR & RANDOMIZER)
// -------------------------------------------------------------
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deteksi klaster divisi untuk stratified sampling
function getDivisiCluster(divisi) {
  const d = (divisi || '').toLowerCase();
  if (d.includes('bph') || d.includes('ketua') || d.includes('sekretaris') || d.includes('bendahara')) return 'bph';
  if (d.includes('minat') || d.includes('bakat')) return 'minat_bakat';
  if (d.includes('media')) return 'media';
  if (d.includes('humas')) return 'humas';
  if (d.includes('penelitian')) return 'penelitian';
  if (d.includes('pengabdian') || d.includes('pengmas')) return 'pengmas';
  return 'umum';
}

// Deteksi gender nama pengurus untuk smart distractors yang natural
function detectGender(nama) {
  const n = (nama || '').toLowerCase();
  if (
    /^(ni |luh |dewa ayu|ida ayu|putu kencana|kadek yuni)/i.test(n) ||
    /dewi|oktaviani|oktavianti|dwiyantini|prascita|candra wangi|pramesti|widiani/i.test(n)
  ) {
    return 'female';
  }
  return 'male';
}

// Generator kunci jawaban seimbang tanpa streak beruntun (Anti-Streak Uniform ABCD)
function generateBalancedKeys(count) {
  const baseKeys = ['A', 'B', 'C', 'D'];
  const pool = [];
  while (pool.length < count) {
    pool.push(...shuffleArray(baseKeys));
  }
  const keys = pool.slice(0, count);

  // Pencegahan streak: pastikan tidak ada keys[i] yang bernilai sama dengan keys[i-1]
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] === keys[i - 1]) {
      let swapped = false;
      for (let j = i + 1; j < keys.length; j++) {
        if (keys[j] !== keys[i - 1] && (j + 1 >= keys.length || keys[j] !== keys[j + 1])) {
          [keys[i], keys[j]] = [keys[j], keys[i]];
          swapped = true;
          break;
        }
      }
      if (!swapped) {
        const diff = baseKeys.filter(k => k !== keys[i - 1]);
        keys[i] = diff[Math.floor(Math.random() * diff.length)];
      }
    }
  }
  return keys;
}

// Global Usage Frequency & Cooldown Tracker lintas sesi kuis
const pengurusUsageStats = new Map(); // id -> { count: number, lastSessionTurn: number }
let sessionTurnCounter = 0;

app.get('/api/quiz-session', (req, res) => {
  try {
    const settings = getSettingsMap();
    const soalPerSesi = Math.max(1, parseInt(settings.soalPerSesi) || 5);
    const modeKuis = settings.modeKuis || 'tebak_nama';
    const timerDetik = parseInt(settings.timerDetik) || 10;
    const cooldownDetik = Math.max(1, Math.min(10, parseInt(settings.cooldownDetik) || 3));
    const minBenarCap = parseInt(settings.minBenarCap) || 4;
    const animasiStyle = settings.animasiStyle || 'combo';
    const misiCapText = settings.misiCapText || 'Follow IG HIMA TI & Sapa Pengurus Stand!';
    const fotoFokus = settings.fotoFokus || 'tengah_atas';
    const spillJawaban = settings.spillJawaban || 'akhir';

    const allPengurus = db.prepare('SELECT * FROM pengurus WHERE is_active = 1').all();

    if (allPengurus.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Minimal butuh 4 data pengurus aktif di database untuk membuat kuis ABCD!'
      });
    }

    sessionTurnCounter++;

    // 1. STRATIFIED SAMPLING: Kelompokkan pengurus ke dalam klaster divisi
    const clusters = {
      bph: [],
      media: [],
      humas: [],
      minat_bakat: [],
      penelitian: [],
      pengmas: [],
      umum: []
    };

    for (const p of allPengurus) {
      const c = getDivisiCluster(p.divisi);
      if (clusters[c]) {
        clusters[c].push(p);
      } else {
        clusters.umum.push(p);
      }
    }

    // Hitung score prioritas berdasarkan frekuensi kemunculan & turn cooldown
    const getCandidateScore = (p) => {
      const stats = pengurusUsageStats.get(p.id) || { count: 0, lastSessionTurn: 0 };
      // Semakin kecil count & semakin lama turn, skor semakin kecil (prioritas paling tinggi)
      const turnsSince = sessionTurnCounter - stats.lastSessionTurn;
      return (stats.count * 100) - Math.min(50, turnsSince) + (Math.random() * 2);
    };

    // Urutkan kandidat dalam masing-masing klaster
    for (const key of Object.keys(clusters)) {
      clusters[key].sort((a, b) => getCandidateScore(a) - getCandidateScore(b));
    }

    // Tentukan urutan klaster yang akan diambil untuk sesi ini
    const availableClusterKeys = Object.keys(clusters).filter(k => clusters[k].length > 0);
    const clusterOrder = shuffleArray(availableClusterKeys);

    let selectedQuestions = [];
    const chosenIds = new Set();

    // Ambil 1 perwakilan dari tiap klaster berbeda terlebih dahulu
    for (const clusterKey of clusterOrder) {
      if (selectedQuestions.length >= soalPerSesi) break;
      const candidate = clusters[clusterKey].find(p => !chosenIds.has(p.id));
      if (candidate) {
        selectedQuestions.push(candidate);
        chosenIds.add(candidate.id);
      }
    }

    // Jika soal per sesi lebih banyak dari jumlah klaster, ambil kandidat berikutnya dengan score terendah
    if (selectedQuestions.length < soalPerSesi) {
      const remainingPool = allPengurus
        .filter(p => !chosenIds.has(p.id))
        .sort((a, b) => getCandidateScore(a) - getCandidateScore(b));

      for (const candidate of remainingPool) {
        if (selectedQuestions.length >= soalPerSesi) break;
        selectedQuestions.push(candidate);
        chosenIds.add(candidate.id);
      }
    }

    // Acak urutan tampil soal agar urutan divisi tidak tertebak
    selectedQuestions = shuffleArray(selectedQuestions);

    // Update usage stats untuk pengurus terpilih
    selectedQuestions.forEach(p => {
      const cur = pengurusUsageStats.get(p.id) || { count: 0, lastSessionTurn: 0 };
      pengurusUsageStats.set(p.id, {
        count: cur.count + 1,
        lastSessionTurn: sessionTurnCounter
      });
    });

    // 2. GENERATE BALANCED ANTI-STREAK ABCD KEYS
    const balancedCorrectKeys = generateBalancedKeys(selectedQuestions.length);

    // 3. SIAPKAN SOAL DENGAN SMART GENDER-AWARE DISTRACTOR
    const questions = selectedQuestions.map((target, idx) => {
      let questionType = modeKuis;
      if (modeKuis === 'campuran') {
        questionType = Math.random() > 0.5 ? 'tebak_nama' : 'tebak_divisi';
      }

      const isNameQuestion = questionType === 'tebak_nama';
      const questionText = isNameQuestion
        ? 'Siapakah nama pengurus HIMA TI pada foto di atas?'
        : 'Pengurus pada foto di atas memegang amanah/divisi apa?';

      const correctAnswer = isNameQuestion ? target.nama : target.divisi;
      const targetGender = detectGender(target.nama);

      // Kumpulkan distractor unik & cerdas
      const otherPengurus = allPengurus.filter(p => p.id !== target.id);
      const distractorSet = new Set();

      if (isNameQuestion) {
        // Tebak nama: prioritaskan distractor yang gender-nya sama agar tidak mudah ditebak
        const sameGenderOthers = shuffleArray(otherPengurus.filter(p => detectGender(p.nama) === targetGender));
        for (const p of sameGenderOthers) {
          if (p.nama !== correctAnswer && !distractorSet.has(p.nama)) {
            distractorSet.add(p.nama);
          }
          if (distractorSet.size >= 3) break;
        }

        // Jika opsi se-gender kurang dari 3, tambahkan dari sisa pengurus lainnya
        if (distractorSet.size < 3) {
          const diffGenderOthers = shuffleArray(otherPengurus.filter(p => detectGender(p.nama) !== targetGender));
          for (const p of diffGenderOthers) {
            if (p.nama !== correctAnswer && !distractorSet.has(p.nama)) {
              distractorSet.add(p.nama);
            }
            if (distractorSet.size >= 3) break;
          }
        }
      } else {
        // Tebak divisi: prioritaskan divisi yang berbeda dari divisi jawaban yang benar
        const shuffledOthers = shuffleArray(otherPengurus);
        for (const p of shuffledOthers) {
          if (p.divisi !== correctAnswer && !distractorSet.has(p.divisi)) {
            distractorSet.add(p.divisi);
          }
          if (distractorSet.size >= 3) break;
        }
      }

      // Fallback cadangan jika divisi/nama unik masih kurang dari 3
      const distractors = Array.from(distractorSet);
      const defaultDivisions = [
        'Divisi Hubungan Masyarakat',
        'Divisi Media & Informasi',
        'Divisi Minat & Bakat',
        'Divisi Penelitian & Pengembangan',
        'Divisi Pengabdian Masyarakat',
        'Pengurus Inti'
      ];
      let fallbackIdx = 0;
      while (distractors.length < 3) {
        const fb = isNameQuestion
          ? `Pengurus HIMA ${distractors.length + 1}`
          : defaultDivisions[fallbackIdx % defaultDivisions.length];
        fallbackIdx++;
        if (fb !== correctAnswer && !distractors.includes(fb)) {
          distractors.push(fb);
        }
      }

      // 4. SUSUN ABCD: Tempatkan kunci jawaban di posisi seimbang & acak posisi distractor
      const targetCorrectKey = balancedCorrectKeys[idx];
      const otherKeys = shuffleArray(['A', 'B', 'C', 'D'].filter(k => k !== targetCorrectKey));
      const shuffledDistractors = shuffleArray(distractors.slice(0, 3));

      const optionsMap = {
        [targetCorrectKey]: { text: correctAnswer, isCorrect: true },
        [otherKeys[0]]: { text: shuffledDistractors[0], isCorrect: false },
        [otherKeys[1]]: { text: shuffledDistractors[1], isCorrect: false },
        [otherKeys[2]]: { text: shuffledDistractors[2], isCorrect: false }
      };

      const options = ['A', 'B', 'C', 'D'].map(key => ({
        key,
        text: optionsMap[key].text,
        isCorrect: optionsMap[key].isCorrect
      }));

      return {
        id: target.id,
        nomor: idx + 1,
        foto_url: target.foto_url,
        questionText,
        questionType,
        correctNama: target.nama,
        correctDivisi: target.divisi,
        options
      };
    });

    res.json({
      success: true,
      config: {
        totalSoal: questions.length,
        timerDetik,
        cooldownDetik,
        minBenarCap,
        animasiStyle,
        misiCapText,
        fotoFokus,
        spillJawaban
      },
      questions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 4. LEADERBOARD
// -------------------------------------------------------------
app.get('/api/check-name', (req, res) => {
  try {
    const { name } = req.query;
    if (!name || !name.trim()) {
      return res.status(400).json({ available: false, message: 'Nama peserta tidak boleh kosong!' });
    }
    const cleanName = name.trim();
    const existing = db.prepare('SELECT id, nama_peserta FROM leaderboard WHERE LOWER(TRIM(nama_peserta)) = LOWER(?)').get(cleanName);
    if (existing) {
      return res.json({
        available: false,
        message: `Nama "${existing.nama_peserta}" sudah terdaftar di leaderboard! Gunakan nama tim/peserta lain.`
      });
    }
    res.json({ available: true, message: 'Nama tersedia' });
  } catch (err) {
    res.status(500).json({ available: false, message: err.message });
  }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM leaderboard 
      ORDER BY skor DESC, waktu_detik ASC, id ASC 
      LIMIT 100
    `).all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/leaderboard', (req, res) => {
  try {
    const { nama_peserta, skor, total_soal, waktu_detik, status_cap } = req.body;
    if (!nama_peserta || !nama_peserta.trim()) {
      return res.status(400).json({ success: false, message: 'Nama peserta wajib diisi!' });
    }

    const cleanName = nama_peserta.trim();
    const existing = db.prepare('SELECT id, nama_peserta FROM leaderboard WHERE LOWER(TRIM(nama_peserta)) = LOWER(?)').get(cleanName);
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Nama peserta "${existing.nama_peserta}" sudah pernah bermain dan tercatat di leaderboard!` 
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO leaderboard (nama_peserta, skor, total_soal, waktu_detik, status_cap)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      cleanName,
      Number(skor) || 0,
      Number(total_soal) || 5,
      Number(waktu_detik) || 0,
      status_cap || 'misi'
    );

    res.json({
      success: true,
      message: 'Skor berhasil dicatat ke leaderboard!',
      data: { id: result.lastInsertRowid }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/leaderboard/reset', (req, res) => {
  try {
    const { adminPin } = req.body;
    const settings = getSettingsMap();
    if (adminPin !== settings.adminPin) {
      return res.status(401).json({ success: false, message: 'PIN Admin salah!' });
    }

    db.prepare('DELETE FROM leaderboard').run();
    res.json({ success: true, message: 'Papan peringkat berhasil direset!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 5. EXPORT & IMPORT BACKUP JSON
// -------------------------------------------------------------
app.get('/api/backup/export', (req, res) => {
  try {
    const pengurus = db.prepare('SELECT * FROM pengurus').all();
    const settings = getSettingsMap();
    const leaderboard = db.prepare('SELECT * FROM leaderboard').all();

    const backupData = {
      app: 'HIMA_TI_FLASHCARD_MINIGAMES',
      exportedAt: new Date().toISOString(),
      settings,
      pengurus,
      leaderboard
    };

    res.setHeader('Content-Disposition', 'attachment; filename="hima_games_backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/backup/import', (req, res) => {
  try {
    const { adminPin, backupData } = req.body;
    const settings = getSettingsMap();
    if (adminPin !== settings.adminPin) {
      return res.status(401).json({ success: false, message: 'PIN Admin salah!' });
    }

    if (!backupData || !backupData.pengurus) {
      return res.status(400).json({ success: false, message: 'Format file backup tidak valid!' });
    }

    // Import Pengurus
    if (Array.isArray(backupData.pengurus)) {
      db.prepare('DELETE FROM pengurus').run();
      const insertPengurus = db.prepare('INSERT INTO pengurus (id, nama, divisi, foto_url, is_active) VALUES (?, ?, ?, ?, ?)');
      for (const p of backupData.pengurus) {
        insertPengurus.run(p.id, p.nama, p.divisi, p.foto_url, p.is_active ?? 1);
      }
    }

    // Import Settings
    if (backupData.settings && typeof backupData.settings === 'object') {
      const updateStmt = db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      for (const [k, v] of Object.entries(backupData.settings)) {
        updateStmt.run(k, String(v));
      }
    }

    res.json({ success: true, message: 'Data backup berhasil di-restore!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 6. SERVE FRONTEND (STATIC BUILD) JIKA ADA
// -------------------------------------------------------------
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Minigames HIMA TI berjalan di http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`
================================================================================
❌ [PORT CONFLICT ERROR]
Port ${PORT} sudah digunakan oleh proses / aplikasi lain di komputer Anda!

Solusi:
1. Jalankan aplikasi dengan port lain, contoh:
   - Linux / macOS:  PORT=3001 npm start
   - Windows (CMD):   set PORT=3001 && npm start
   - Windows (PS):    $env:PORT=3001; npm start
   - Atau atur PORT=3001 di file .env
2. Atau hentikan proses yang sedang menggunakan port ${PORT}.
================================================================================
`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

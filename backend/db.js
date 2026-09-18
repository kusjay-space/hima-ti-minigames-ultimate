import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'hima_games.sqlite');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Inisialisasi Database SQLite dengan Fallback Driver
let DatabaseClass = null;

try {
  const sqlite = await import('node:sqlite');
  if (sqlite && sqlite.DatabaseSync) {
    DatabaseClass = sqlite.DatabaseSync;
  }
} catch {
  // node:sqlite tidak tersedia pada versi Node.js ini (< v22.5.0)
}

if (!DatabaseClass) {
  try {
    const betterSqlite = await import('better-sqlite3');
    DatabaseClass = betterSqlite.default || betterSqlite;
  } catch {
    // better-sqlite3 belum terinstal
  }
}

if (!DatabaseClass) {
  console.error(`
================================================================================
❌ [DATABASE ERROR] Driver SQLite tidak ditemukan pada Node.js ${process.version}
--------------------------------------------------------------------------------
Fitur bawaan 'node:sqlite' memerlukan Node.js v22.5.0 ke atas.

Solusi Mudah:
1. Update Node.js Anda ke versi LTS terbaru (Node v22+):
   👉 Unduh di: https://nodejs.org
   👉 Atau dengan NVM: nvm install 22 && nvm use 22

2. Atau instal driver 'better-sqlite3':
   👉 npm install better-sqlite3
================================================================================
`);
  process.exit(1);
}

export const db = new DatabaseClass(dbPath);

// Inisialisasi Tabel
db.exec(`
  CREATE TABLE IF NOT EXISTS pengurus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    divisi TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_peserta TEXT NOT NULL,
    skor INTEGER NOT NULL,
    total_soal INTEGER NOT NULL,
    waktu_detik REAL NOT NULL,
    status_cap TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Inisialisasi Pengaturan Default
const defaultSettings = [
  ['soalPerSesi', '5'],
  ['timerDetik', '10'],
  ['minBenarCap', '4'],
  ['modeKuis', 'tebak_nama'], // 'tebak_nama' | 'tebak_divisi' | 'campuran'
  ['animasiStyle', 'combo'],  // 'combo' | 'biometric_laser' | 'tilt_3d' | 'card_stack' | 'matrix_decode' | 'standard_flip'
  ['misiCapText', 'Follow Instagram @himaprodi_ti & Spinwheel.'],
  ['adminPin', '2026'],
  ['spillJawaban', 'akhir'] // 'akhir' (element of surprise) | 'langsung' (per-question review)
];

const checkSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

for (const [key, val] of defaultSettings) {
  const row = checkSetting.get(key);
  if (!row) {
    insertSetting.run(key, val);
  }
}

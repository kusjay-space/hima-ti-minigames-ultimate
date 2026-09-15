import { DatabaseSync } from 'node:sqlite';
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

export const db = new DatabaseSync(dbPath);

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
  ['misiCapText', 'Follow Instagram @himati_official & Sapa 1 kakak pengurus di stand HIMA!'],
  ['adminPin', '2026'],
  ['themeMode', 'light'],
  ['themePreset', 'biru-klasik']
];

const checkSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

for (const [key, val] of defaultSettings) {
  const row = checkSetting.get(key);
  if (!row) {
    insertSetting.run(key, val);
  }
}

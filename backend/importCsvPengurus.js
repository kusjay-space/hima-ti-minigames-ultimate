import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const defaultCsvPath = path.join(__dirname, 'struktur-kepengurusan-web-version.csv');
const csvPath = process.env.CSV_PATH || (fs.existsSync(defaultCsvPath) ? defaultCsvPath : (fs.existsSync('/home/jay/Downloads/struktur-kepengurusan-web-version.csv') ? '/home/jay/Downloads/struktur-kepengurusan-web-version.csv' : null));

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  values.push(current.trim());
  return values;
}

function formatJabatan(level, bidang, divisi, jabatan) {
  if (level === 'inti') return `${jabatan} (BPH)`;
  if (level === 'bidang' && jabatan === 'Kepala Bidang') {
    return `Kabid ${bidang.replace('Bidang ', '')}`;
  }
  if (level === 'divisi' && jabatan === 'Kepala Divisi') {
    return `Kadiv ${divisi.replace('Divisi ', '')}`;
  }
  if (level === 'anggota') {
    if (divisi) return `Anggota ${divisi}`;
    if (bidang) return `Anggota ${bidang.replace('Bidang ', '')}`;
  }
  return jabatan || 'Pengurus HIMA TI';
}

function getPhotoFileName(nama) {
  // Gst.N.Pt. -> gst-n-pt
  let slug = nama.toLowerCase()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}.webp`;
}

export function importOfficialPengurus() {
  console.log('🔄 Membaca file struktur-kepengurusan-web-version.csv...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(l => l.trim().length > 0);

  // Bersihkan data lama
  db.prepare('DELETE FROM pengurus').run();

  const insertStmt = db.prepare('INSERT INTO pengurus (nama, divisi, foto_url, is_active) VALUES (?, ?, ?, 1)');
  const files = fs.readdirSync(uploadsDir);

  let insertedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const [nama, level, bidang, divisi, jabatan] = parseCsvLine(lines[i]);
    if (!nama || nama.includes('Ardiyasa') || nama.includes('Rosalia')) continue; // Skip pembina (dosen)

    const jabatanFormatted = formatJabatan(level, bidang, divisi, jabatan);
    const photoFile = getPhotoFileName(nama);
    const photoExists = files.includes(photoFile);

    const foto_url = photoExists ? `/uploads/${photoFile}` : '/uploads/default-avatar.svg';

    insertStmt.run(nama, jabatanFormatted, foto_url);
    insertedCount++;
    console.log(`✅ [${insertedCount}/34] ${nama} - ${jabatanFormatted} (${photoFile} - ${photoExists ? 'OK' : 'MISSING'})`);
  }

  console.log(`\n🎉 Selesai! Berhasil mengimpor ${insertedCount} pengurus asli HIMA TI ke dalam SQLite!`);
}

// Jalankan import jika file CSV ditemukan
if (csvPath && fs.existsSync(csvPath)) {
  importOfficialPengurus();
} else {
  console.log('ℹ️ Script importCsvPengurus: File CSV tidak ditemukan, melewati proses impor CSV.');
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const officialPengurusData = [
  { nama: 'Ni Nyoman Putri Kirana', divisi: 'Ketua Umum', foto_url: '/uploads/ni-nyoman-putri-kirana.webp' },
  { nama: 'I Made Bintang Kartika Yasa', divisi: 'Wakil Ketua 1', foto_url: '/uploads/i-made-bintang-kartika-yasa.webp' },
  { nama: 'I Gede Angga Yudistira', divisi: 'Wakil Ketua 2', foto_url: '/uploads/i-gede-angga-yudistira.webp' },
  { nama: 'Putu Kencana Sridewi', divisi: 'Sekretaris 1', foto_url: '/uploads/putu-kencana-sridewi.webp' },
  { nama: 'Dewa Ayu Dwicahya Dewanti', divisi: 'Sekretaris 2', foto_url: '/uploads/dewa-ayu-dwicahya-dewanti.webp' },
  { nama: 'Ida Ayu Ika Pramesti Kesuma', divisi: 'Bendahara 1', foto_url: '/uploads/ida-ayu-ika-pramesti-kesuma.webp' },
  { nama: 'Ida Ayu Gede Sri Widiani', divisi: 'Bendahara 2', foto_url: '/uploads/ida-ayu-gede-sri-widiani.webp' },
  { nama: 'Kadek Yuni Dwiyantini Savitri', divisi: 'Kabid Minat dan Bakat', foto_url: '/uploads/kadek-yuni-dwiyantini-savitri.webp' },
  { nama: 'I Putu Adhiatman', divisi: 'Kabid Media dan Humas', foto_url: '/uploads/i-putu-adhiatman.webp' },
  { nama: 'Kadek Novan Suhaliem Chandra', divisi: 'Kabid Penelitian dan Pengabdian Masyarakat', foto_url: '/uploads/kadek-novan-suhaliem-chandra.webp' },
  { nama: 'I Komang Bayu Kurniawan', divisi: 'Kadiv Media', foto_url: '/uploads/i-komang-bayu-kurniawan.webp' },
  { nama: 'I Gst.N.Pt.Diana Putra Pratama', divisi: 'Kadiv Humas', foto_url: '/uploads/i-gst-n-pt-diana-putra-pratama.webp' },
  { nama: 'Fiji Firmanda', divisi: 'Kadiv Penelitian', foto_url: '/uploads/fiji-firmanda.webp' },
  { nama: 'Putu Raditya Dharma Putra', divisi: 'Kadiv Pengabdian Masyarakat', foto_url: '/uploads/putu-raditya-dharma-putra.webp' },
  { nama: 'Ida Bagus Gede Dharmayoga Iswara', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/ida-bagus-gede-dharmayoga-iswara.webp' },
  { nama: 'I Wayan Oka Eswara Candrana', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/i-wayan-oka-eswara-candrana.webp' },
  { nama: 'Ni Putu Dewi Candra Wangi', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/ni-putu-dewi-candra-wangi.webp' },
  { nama: 'I Made Arya Krisna Sanjaya', divisi: 'Anggota Minat dan Bakat', foto_url: '/uploads/i-made-arya-krisna-sanjaya.webp' },
  { nama: 'I Made Agastya Wedastika', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-made-agastya-wedastika.webp' },
  { nama: 'I Gusti Bagus Agung Andra Pradnyana Pandji', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-gusti-bagus-agung-andra-pradnyana-pandji.webp' },
  { nama: 'I Made Adhi Pranaya Kusuma Putra', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-made-adhi-pranaya-kusuma-putra.webp' },
  { nama: 'I Kadek Abi Prawira', divisi: 'Anggota Divisi Media', foto_url: '/uploads/i-kadek-abi-prawira.webp' },
  { nama: 'Ida Bagus Windu Diwangkara', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/ida-bagus-windu-diwangkara.webp' },
  { nama: 'I Dewa Gede Ariesta Dharmayuda', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/i-dewa-gede-ariesta-dharmayuda.webp' },
  { nama: 'I Made Chandra Yudi Saskara', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/i-made-chandra-yudi-saskara.webp' },
  { nama: 'Ni Kadek Ayu Dea Santika Dewi', divisi: 'Anggota Divisi Humas', foto_url: '/uploads/ni-kadek-ayu-dea-santika-dewi.webp' },
  { nama: 'I Made Kusuma Jaya Wardana', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/i-made-kusuma-jaya-wardana.webp' },
  { nama: 'Gede Satya Devra Widyanatha', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/gede-satya-devra-widyanatha.webp' },
  { nama: 'Putu Gde Adyatma Putra', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/putu-gde-adyatma-putra.webp' },
  { nama: 'Ngurah Gde Rheino Darma Tenaya Perean', divisi: 'Anggota Divisi Penelitian', foto_url: '/uploads/ngurah-gde-rheino-darma-tenaya-perean.webp' },
  { nama: 'Luh Gede Manik Prascita Yoga', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/luh-gede-manik-prascita-yoga.webp' },
  { nama: 'Ni Wayan Ananda Oktavianti', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/ni-wayan-ananda-oktavianti.webp' },
  { nama: 'Ni Made Adinda Oktaviani', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/ni-made-adinda-oktaviani.webp' },
  { nama: 'Ton Klein Pandesolan', divisi: 'Anggota Divisi Pengabdian Masyarakat', foto_url: '/uploads/ton-klein-pandesolan.webp' }
];

export function seedInitialData() {
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM pengurus');
  const { total } = countStmt.get();

  if (total === 0) {
    console.log('⚡ Mengisi 34 data pengurus resmi HIMA TI ke SQLite...');
    const insertStmt = db.prepare('INSERT INTO pengurus (nama, divisi, foto_url, is_active) VALUES (?, ?, ?, 1)');

    for (const p of officialPengurusData) {
      insertStmt.run(p.nama, p.divisi, p.foto_url);
    }
    console.log(`✅ Berhasil menginisialisasi ${officialPengurusData.length} pengurus resmi HIMA TI!`);
  }
}

# ⚡ Minigames Flashcard HIMA TI // Stand GMTI 2026

Aplikasi kuis interaktif tebak pengurus Himpunan Mahasiswa Program Studi Teknik Informatika (HIMA TI) yang dirancang khusus untuk **Stand Booth Ospek / GMTI Mahasiswa Baru 2026**.

Aplikasi berjalan **100% lokal, cepat, dan offline**, didukung database internal **SQLite (Node:sqlite)**, backend **Express**, antarmuka modern **React 19 + Vite + Tailwind CSS v4**, serta animasi kartu 3D berbasis **Framer Motion**.

---

## 📋 Fitur Utama

- **3-Section Parallel Layout:**
  - **Seksi Kiri:** Interaktif 3D Card Stack Preview dengan simulasi gestur swipe, rotasi bolak-balik (front/back), dan ganti kartu otomatis (auto-switch).
  - **Seksi Tengah:** Cockpit Misi Stand (syarat cap, waktu, bank 34 soal pengurus) dan formulir registrasi peserta dengan validasi nama unik agar tidak ada duplikasi tim.
  - **Seksi Kanan:** Papan skor (*Live Leaderboard*) yang diperbarui secara otomatis setiap 15 detik dari database SQLite lokal.
- **Validasi Cap Stand Otomatis & Misi Alternatif:**
  - **Lolos Cap Langsung:** Peserta yang memenuhi batas minimal benar (misal ≥ 4 dari 5 soal) langsung berhak mendapatkan Cap Stand di buku kendali GMTI dengan selebrasi konfeti.
  - **Jalur Misi Stand:** Peserta yang belum mencapai batas skor diarahkan untuk menyelesaikan misi interaktif (follow Instagram resmi HIMA TI & sapa panitia pengurus di stand) agar tetap termotivasi dan bisa memperoleh cap.
- **Audio Engine Lengkap (Tanpa Aset Eksternal):**
  - **BGM Synthesizer (Web Audio API):** Pilihan musik latar bergaya arcade 8-bit, cyberpunk synthwave, ambient lofi, dan EDM stadium.
  - **5 Profil Efek Suara (SFX):** Cyber Laser, Mechanical Tactile, Arcade Pop, Digital Chime, dan Acoustic Shuffle.
  - **Audio Mixer Modal:** Kontrol volume master BGM dan SFX yang independen.
- **Command Center Admin (Terproteksi PIN):**
  - **PIN Default:** `2026`
  - Tambah/edit data nama dan divisi pengurus langsung dari antarmuka atau modal edit (`PUT /api/pengurus/:id`).
  - Upload foto pengurus lokal.
  - Uji simulasi kartu pengurus real-time (Card Studio).
  - Backup & restore database dalam format JSON, serta tombol reset leaderboard sekali klik.

---

## 🚀 Panduan Instalasi & Menjalankan

### Persyaratan Sistem
- **Node.js**: Versi `v20.0.0` ke atas (Direkomendasikan Node `v22+` untuk modul bawaan `node:sqlite`. Node v20 didukung via driver `better-sqlite3`).
- **npm**: Versi `v8.0.0` ke atas (disertakan bersama instalasi Node.js).

---

### Langkah 1: Clone Repository
```bash
git clone <URL_REPOSITORY>
cd minigames-hima-ti
```

---

### Langkah 2: Install Dependensi
Repository ini menggunakan **npm workspaces**. Cukup jalankan satu perintah di folder utama (root):

```bash
npm install
```
*Perintah ini akan langsung mengunduh dan menginstal seluruh dependensi backend dan frontend secara otomatis tanpa perlu masuk ke subfolder.*

---

### Langkah 3: Konfigurasi Port & Lingkungan (Opsional)
Jika port default `3000` sudah dipakai oleh aplikasi lain, salin file contoh konfigurasi:
```bash
cp .env.example .env
```
Lalu ubah `PORT=3000` menjadi port yang diinginkan (misal `PORT=3005`).

---

### Langkah 4: Menjalankan Aplikasi

#### Opsi A: Mode Siap Pakai / Hari-H Stand (Rekomendasi)
Mode ini mengompilasi frontend ke aset produksi dan melayani aplikasi via 1 port:

```bash
npm start
```
Buka browser di laptop stand:
👉 **`http://localhost:3000`** (atau port yang Anda atur).

---

#### Opsi B: Mode Pengembangan (Live Reload)
Jika ingin mengedit antarmuka atau logika kode secara langsung:

```bash
npm run dev
```
Perintah ini menyalakan secara bersamaan:
- **Backend Server** di `http://localhost:3000`
- **Vite Dev Server** di `http://localhost:5173` (dengan proxy otomatis ke backend untuk `/api` dan `/uploads`).

Buka browser di:
👉 **`http://localhost:5173`**

---

## ⚙️ Ringkasan Script `package.json`

| Script | Deskripsi |
|---|---|
| `npm install` | Menginstal seluruh dependensi root, backend, dan frontend sekaligus via workspaces. |
| `npm start` | Melakukan build frontend lalu menjalankan server backend. |
| `npm run dev` | Menjalankan backend dan frontend dev server secara paralel (cross-platform). |
| `npm run build` | Melakukan build produksi Vite & TypeScript pada folder `frontend/`. |
| `npm run lint` | Melakukan pemeriksaan kode frontend dengan oxlint. |

---

## 🔧 Akses Smartphone untuk Maba (Jaringan Lokal)

Jika terjadi antrean panjang di meja stand:
1. Hubungkan laptop stand dan smartphone peserta/panitia ke hotspot atau Wi-Fi yang sama.
2. Cari tahu alamat IP lokal laptop stand (contoh di terminal: `ip a` atau `ipconfig` -> `192.168.1.15`).
3. Buka URL berikut di browser smartphone:
   ```
   http://192.168.1.15:3000
   ```
4. Seluruh fitur, animasi, dan input nama dapat dimainkan langsung dari layar smartphone secara responsif.

---

## 🛠️ Pemecahan Masalah (Troubleshooting)

1. **Port 3000 Sudah Terpakai (`EADDRINUSE`):**
   - Atur port lain melalui environment variable:
     - Linux / macOS: `PORT=3005 npm start`
     - Windows (CMD): `set PORT=3005 && npm start`
     - Windows (PowerShell): `$env:PORT=3005; npm start`
     - Atau isi `PORT=3005` di file `.env`.
2. **Versi Node.js:**
   - Cek versi Node.js Anda dengan perintah `node -v`.
   - Pastikan minimal versi Node v20.x atau v22+ LTS.
3. **Database Reset ke Data Awal:**
   - Database SQLite otomatis diinisialisasi dan diisi 34 data pengurus resmi saat pertama kali server dijalankan. File disimpan di [`backend/hima_games.sqlite`](backend/hima_games.sqlite). Jangan hapus file ini jika ingin mempertahankan skor leaderboard yang sudah terekam.

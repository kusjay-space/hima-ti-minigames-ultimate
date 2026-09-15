# ⚡ Website Minigames Flashcard HIMA TI
**Stand Booth HIMA TI: Masa Orientasi Mahasiswa Baru (Ospek Maba) 2026**

Website minigames tebak foto pengurus Himpunan Mahasiswa Program Studi Teknik Informatika (HIMA TI) yang berjalan **100% lokal dan offline**, didukung database **SQLite**, animasi modern **Framer Motion**, desain neo-brutalist teknikal, dan sistem penentuan **Cap Stand Ospek**.

---

## 🚀 Cara Menjalankan di Laptop Stand

### 1. Jalankan Mode Siap Pakai (Rekomendasi untuk Hari-H Stand)
Buka terminal di folder proyek:
```bash
cd /home/jay/minigames-hima-ti
npm start
```
Buka browser laptop ke: **`http://localhost:3001`**  
*(Aplikasi langsung berjalan penuh secara offline, melayani frontend dan backend SQLite dalam 1 port).*

### 2. Jalankan Mode Development
Jika ingin mengubah kode dengan live reload:
```bash
npm run dev:backend   # Terminal 1: backend server (port 3001)
npm run dev:frontend  # Terminal 2: Vite frontend (http://localhost:3000)
```

---

## 🎮 Fitur Utama & Validasi Sesi

1. **Validasi Unik Nama Tim / Peserta:**
   - Nama tim atau peserta divalidasi langsung ke database SQLite sebelum kuis dimulai.
   - Jika nama tim sudah pernah dimainkan dan tercatat di leaderboard, sistem menampilkan peringatan langsung dan meminta nama pembeda agar tidak ada duplikasi data.
2. **Desain Kotak-Kotak Neo-Brutalist (Anti-Slop):**
   - Menggunakan estetika teknis dengan border tegas (`border-2 border-zinc-800`), offset drop-shadow taktil (`shadow-[4px_4px_0px_#000]`), font monospaced untuk telemetri, serta palet Deep Obsidian dan Electric Cobalt.
   - Tanpa elemen generik AI (tanpa pill badge monoton, tanpa gradien ungu-pink generik).
3. **Format Card Vertikal Portrait 3:4 & Face Crop Presisi:**
   - Card foto berukuran proporsional 3:4 (~360x480px) yang pas di layar laptop tanpa perlu scroll.
   - Dilengkapi pengaturan focal crop (`atas`, `tengah_atas`, `tengah`). Default `tengah_atas` (golden ratio 18%) memastikan wajah seluruh 34 pengurus HIMA TI berada tepat di tengah tanpa terpotong dahi atau dagu.
4. **8 Kombo Animasi Interaktif (Tanpa Efek Tunggal Membosankan):**
   Semua opsi efek kini berupa rangkaian kombo sinematik dan interaktif (16 Pilihan Suite):
   - **Cyber Biometric Protocol:** Laser scanning vertikal, grid HUD biometrik, target crosshairs, dan unscramble teks.
   - **Quantum Hologram Spectrum:** Kilau pelangi prismatik halus, chromatic aberration lembut tanpa glitch kasar, dan corner ticks.
   - **Tactical Sonar Interceptor:** Radar sweep cone 360 derajat, radar sweep line, cincin sonar berdenyut, dan audio ping.
   - **Kinetic Arcade Spring:** Entrance pegas dinamis, particle bursts, dan getaran taktil saat dijawab.
   - **Analog Tape Surveillance:** CRT scanlines drift lembut, cap REC retro, cap waktu telemetri, dan vignette analog.
   - **Aperture Spy Identity:** Iris aperture blade reveal, efek flash kamera, audio shutter, dan stempel kartu identitas resmi.
   - **Matrix Cipher Overdrive:** Matrix rain code cascade, font cipher hijau phosphor, dan de-scrambler karakter real-time.
   - **The Grand Stand Masterpiece:** Master combo yang menggabungkan seluruh layer efek terbaik untuk festival stand.
   - **Architect Blueprint CAD:** Grid kertas kalkir biru arsitektur + panduan dimensi teknikal [75x100mm] + laser cyan drafting ruler.
   - **Cosmic Nebula Pulsar:** Atmosfer nebula ungu kosmik + orbit cincin planet 3D berputar mengelilingi kartu + starlight.
   - **Synthwave Neon Wireframe:** Perspektif grid wireframe 80s + sunset horizon glow pulse + highlight magenta-cyan retro cyberpunk.
   - **Overclock Voltage Surge:** Loncatan voltase listrik berenergi tinggi mengitari perimeter kartu + telemetri [1.48V OVERCLOCK].
   - **Liquid Magnetic Spring:** Levitasi mengambang organik + tarikan magnetis dinamis mengikuti posisi kursor.
   - **Holo Hyper-Shimmer Beam:** Pancaran difraksi prisma pelangi multi-sudut menyapu diagonal + denyut border aberasi kromatik.
   - **Cyberpunk Kinetic Glitch:** Slice translasi RGB color-split saat disentuh + scanline telemetri data matrix cybernetic.
   - **Isometric Frosted Glass:** Kaca buram frosted glass multi-lapisan + partikel kristal melayang halus + elevasi kedalaman 3D.
5. **Penentuan Cap Ospek Otomatis & Misi Stand:**
   - **Lolos Cap Otomatis (Maksimal Salah 1 dari 5 Soal):**
     - Banner kemenangan emas: **"STATUS: LOLOS! BERHAK MENDAPATKAN CAP STAND HIMA TI"**
     - Efek konfeti selebrasi + audio chime kemenangan.
     - Panitia langsung membubuhkan cap di kartu kendali maba.
   - **Misi Stand Alternatif (Salah 2 Soal atau Lebih):**
     - Banner misi alternatif: **"STATUS: TANTANGAN TAMBAHAN UNTUK DAPAT CAP"**
     - Menampilkan misi follow Instagram HIMA TI dan menyapa pengurus di stand agar maba tetap termotivasi dan bisa mendapatkan cap.

---

## ⚙️ Command Center Admin Stand

Klik ikon gembok di pojok kanan atas layar untuk membuka panel admin.
- **PIN Default:** `2026`

### Fitur Admin:
- **Pilihan 8 Kombo Animasi:** Pilih salah satu dari 8 suite kombo animasi.
- **Interactive Live Preview:** Uji animasi langsung di panel admin, ganti foto pengurus (tersedia 34 anggota pengurus HIMA TI), atur fokus crop foto, serta simulasi jawaban Benar / Salah.
- **Indikator Simpan Responsif:** Tombol simpan memberikan visual feedback bertahap (*Menyimpan...* -> *Tersimpan! ✓* -> normal).
- **Pengaturan Kuis Fleksibel:** Atur jumlah soal per sesi (3 - 15), timer per soal (5 - 30s), batas minimal benar cap, dan teks misi alternatif.
- **Manajemen Pengurus Lengkap:** Tambah, edit, aktifkan/nonaktifkan, atau hapus pengurus. Mendukung upload foto lokal.
- **Leaderboard & Backup:** Tabel rekap peserta, reset leaderboard harian, export JSON, dan restore database dalam satu klik.

---

## 📱 Responsif di Smartphone Maba (Opsional)
Jika meja stand sangat padat antrean:
1. Hubungkan laptop stand dan smartphone maba ke jaringan Wi-Fi atau hotspot yang sama.
2. Buka IP lokal laptop dari browser smartphone maba (misal: `http://192.168.1.10:3001`).
3. Layout otomatis menyesuaikan ukuran layar ponsel tanpa kehilangan fitur animasi ataupun visual feedback.

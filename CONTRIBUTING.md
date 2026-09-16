# 🤝 Panduan Kontribusi - Minigames Flashcard HIMA TI

Terima kasih telah tertarik untuk berkontribusi pada pengembangan **Minigames Flashcard HIMA TI (Stand GMTI 2026)**! Dokumen ini memuat panduan bagi panitia, pengembang, dan kontributor yang ingin menambahkan fitur atau memperbaiki bug.

---

## 🛠️ Alur Pengembangan Lokal

1. **Fork & Clone:**
   ```bash
   git clone https://github.com/kusjay-space/hima-ti-minigames-ultimate.git
   cd hima-ti-minigames-ultimate
   ```

2. **Install Dependensi:**
   Proyek ini menggunakan **npm workspaces**. Cukup jalankan perintah berikut di root:
   ```bash
   npm install
   ```
   > ⚠️ **PENTING:** Jangan menjalankan `npm install` manual di dalam folder `backend/` atau `frontend/`, dan jangan menambahkan script `postinstall` bertingkat agar tidak merusak sinkronisasi `package-lock.json`.

3. **Jalankan Mode Development:**
   ```bash
   npm run dev
   ```
   - Frontend Vite: `http://localhost:5173`
   - Backend Express: `http://localhost:3000`

---

## 🧪 Aturan & Standar Kode

- **TypeScript:** Pastikan tidak ada error tipe sebelum membuat commit:
  ```bash
  npm run build
  ```
- **Linting:** Periksa kualitas kode frontend:
  ```bash
  npm run lint
  ```
- **Aset Gambar Pengurus:**
  - Jika menambah foto pengurus baru, masukkan foto ke `backend/uploads/` **DAN** salin ke `frontend/public/uploads/` agar aset tetap dapat dimuat di hosting statis (GitHub Pages).
  - Format foto yang direkomendasikan adalah `.webp` (rasio potret 4:5 atau 1:1, ukuran di bawah 150KB).

---

## 🚀 Alur Pull Request (PR)

1. Buat branch baru dari `main`:
   ```bash
   git checkout -b feat/nama-fitur-baru
   ```
2. Lakukan perubahan dan commit dengan pesan yang deskriptif:
   ```bash
   git commit -m "feat(gameplay): tambah efek suara baru saat jawaban benar"
   ```
3. Push branch ke remote:
   ```bash
   git push origin feat/nama-fitur-baru
   ```
4. Buka Pull Request di GitHub dan jelaskan fitur yang ditambahkan serta langkah pengujiannya.

---

## 🔒 Keamanan & File Rahasia

- **Jangan pernah commit:**
  - File database lokal SQLite (`*.sqlite`, `*.db`).
  - File konfigurasi lingkungan (`.env`).
  - File lockfile di subfolder (`backend/package-lock.json`, `frontend/package-lock.json`).
- Pastikan PIN Admin default tetap terkonfigurasi di `2026` kecuali disepakati lain oleh panitia inti.

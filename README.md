# 🍪 Netflix Cookie to NFToken Converter

Aplikasi web interaktif untuk mengubah cookie Netflix menjadi tautan akses instan (NFToken). Dibuat untuk tujuan edukasi dan pengembangan pribadi.

![Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)

🔗 **Demo:** https://netflix-cookie-converter.vercel.app

---

## 📖 Daftar Isi
1. Tentang Proyek
2. Fitur Utama
3. Teknologi yang Digunakan
4. Cara Menjalankan di Lokal
5. Cara Deploy ke Vercel
6. Panduan Penggunaan
7. Disclaimer & Etika
8. Lisensi

---

## 🧠 Tentang Proyek

Proyek ini adalah alat edukasi yang menunjukkan bagaimana cookie sesi dapat digunakan untuk menghasilkan token akses sementara (NFToken) pada layanan streaming Netflix.

Tujuan:
- Memahami mekanisme autentikasi berbasis cookie dan cara kerja API Netflix.
- Praktik membangun aplikasi full-stack dengan Next.js dan mendeploy di Vercel.
- Portofolio pengembangan web pribadi.

> ⚠️ **Peringatan:** Proyek ini HANYA untuk tujuan edukasi. Menggunakan alat ini untuk mengakses akun orang lain tanpa izin adalah melanggar hukum dan Ketentuan Layanan Netflix. Gunakan hanya untuk akun milik sendiri.

---

## ✨ Fitur Utama

### 1. ⚡ Auto Generate
- Menghasilkan satu tautan NFToken secara acak dari daftar cookie yang dikonfigurasi di backend.
- Pengguna tidak melihat daftar cookie.
- Satu klik, sistem mencari cookie aktif dan menghasilkan tautan.

### 2. 🔄 Converter
- Mengubah cookie Netflix (berbagai format) menjadi tautan NFToken.
- Mendukung 3 format input:
  - String HTTP: `NetflixId=xxx; SecureNetflixId=yyy; ...`
  - JSON Array: `[{"name":"NetflixId","value":"xxx"}, ...]`
  - JSON Object: `{"NetflixId":"yyy","SecureNetflixId":"www"}`
- Menampilkan URL login, masa berlaku, dan profil akun (negara, mata uang, paket, email).
- Fitur Simpan Cookie di localStorage browser.

### 3. 🔍 Checker
- Mengecek validitas cookie yang tersimpan.
- Menampilkan status Valid/Invalid.
- Jika valid, menampilkan tanggal kadaluarsa (expiry).

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Deskripsi |
|-----------|-----------|
| Next.js | React framework untuk full-stack dengan server-side rendering. |
| Vercel | Platform hosting dan deployment dengan serverless functions. |
| CSS-in-JS | Styling menggunakan built-in CSS Next.js (styled-jsx). |
| LocalStorage API | Penyimpanan data cookie di sisi klien. |

---

## 🚀 Cara Menjalankan di Lokal

**Prasyarat:** Node.js (v18+) dan Git (opsional).

1. Clone repository:
bash
   git clone https://github.com/MarvellAlvin/netflix-cookie-converter.git
   cd netflix-cookie-converter
   
2. Instal dependensi:
bash
   npm install
   
3. (Opsional) Isi `data/cookies.json` dengan cookie untuk Auto Generate:
json
   [
     "NetflixId=xxx; SecureNetflixId=yyy; ...",
     "NetflixId=aaa; SecureNetflixId=bbb; ..."
   ]
   
4. Jalankan server development:
bash
   npm run dev
   
5. Buka `http://localhost:3000` di browser.

---

## 🌐 Cara Deploy ke Vercel

1. Push kode ke GitHub.
2. Buka [vercel.com](https://vercel.com), login dengan GitHub.
3. Klik **Add New → Project**, pilih repository ini.
4. Framework Preset: **Next.js** (otomatis terdeteksi).
5. Klik **Deploy**. Selesai. URL akan diberikan (contoh: `https://netflix-cookie-converter.vercel.app`).

---

## 📖 Panduan Penggunaan

### ⚡ Auto Generate
1. Buka tab **AUTO GENERATE**.
2. Klik tombol **⚡ Generate Link**.
3. Sistem mencari cookie aktif dari `data/cookies.json` dan menampilkan tautan.

### 🔄 Converter
1. Buka tab **CONVERTER**.
2. Tempel cookie (format String, JSON Array, atau JSON Object).
3. Klik **⚡ FORGE TOKEN**.
4. Jika valid, tampilkan URL login dan info akun.
5. Untuk menyimpan: isi "Nama akun" → klik **💾 Simpan**.

### 🔍 Checker
1. Buka tab **CHECKER**.
2. Lihat daftar cookie tersimpan.
3. Klik **🔍 Check** pada cookie yang ingin dicek.
4. Status Valid/Invalid dan expiry (jika valid) akan ditampilkan.

---

## ⚠️ Disclaimer & Etika

Proyek ini dibuat untuk **tujuan edukasi dan pengembangan pribadi**. Dengan menggunakan proyek ini, Anda setuju untuk:
- Hanya menggunakan akun Netflix milik sendiri.
- Tidak menyalahgunakan alat ini untuk akses ilegal.
- Tidak menggunakan untuk tujuan komersial.
- Memahami risiko pelanggaran Ketentuan Layanan Netflix.

Penulis tidak bertanggung jawab atas penyalahgunaan atau konsekuensi hukum yang timbul.

---

## 📄 Lisensi

MIT License.

# 🎯 Jeopardy - Platform Game Interaktif

> Platform Jeopardy modern berbasis web yang dibangun dengan Next.js dan Firebase untuk pengalaman bermain game yang real-time dan interaktif.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Stack Teknologi](#stack-teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Project](#menjalankan-project)
- [Struktur Project](#struktur-project)
- [Penggunaan](#penggunaan)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)
- [Kontribusi](#kontribusi)

---

## 🚀 Fitur Utama

### Untuk Host (Pembuat Game)
- ✅ **Buat Template Game**: Tentukan ukuran grid, kategori, dan nilai poin
- ✅ **Pertanyaan & Jawaban**: Tambahkan pertanyaan dan jawaban dalam setiap cell
- ✅ **Simpan Draft**: Simpan template yang belum selesai
- ✅ **Kelola Sesi**: Buat sesi dengan kode 4-digit unik
- ✅ **Kontrol Board**: Klik cell di board untuk menampilkan pertanyaan/jawaban
- ✅ **Kelola Skor**: Update skor pemain secara real-time

### Untuk Pemain
- 👥 **Bergabung dengan Mudah**: Masukkan kode sesi 4-digit dan nama
- 🎮 **Sistem Buzzer**: Klik nama Anda untuk aktifkan buzzer
- 📊 **Lihat Skor**: Pantau skor pemain secara real-time
- 🔴 **Status Buzzer**: Lihat urutan buzzer (siapa yang paling cepat)

### Keamanan
- 🔐 **Autentikasi Firebase**: Login dengan email/password
- 🛡️ **Firestore Security Rules**: Validasi role-based access
- 🚫 **Privilege Protection**: Pemain tidak bisa mengakses kontrol host

---

## 🛠️ Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 16+ (App Router) |
| **UI Framework** | React 19+ |
| **Styling** | Tailwind CSS 4 |
| **Autentikasi** | Firebase Authentication |
| **Database** | Firebase Firestore (Real-time) |
| **Bahasa** | TypeScript |
| **Linting** | ESLint |

---

## 📦 Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** atau **yarn** atau **pnpm**
- **Firebase Project** (dengan Firestore dan Authentication diaktifkan)

---

## 🔧 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd jeopardy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Firebase
1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan **Authentication** (Email/Password)
3. Buat **Firestore Database** di mode production
4. Copy konfigurasi Firebase Anda

### 4. Setup Environment Variables
Buat file `.env.local` di root project:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## ▶️ Menjalankan Project

### Mode Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000)

### Mode Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

---

## 📁 Struktur Project

```
jeopardy/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Halaman dashboard
│   ├── dashboard/               # Dashboard templates
│   ├── editor/                  # Template editor
│   │   ├── [templateId]/        # Edit existing template
│   │   └── new/                 # Create new template
│   ├── host/                    # Host game view
│   │   └── [sessionCode]/       # Kontrol game
│   └── player/                  # Player game view
│       └── [sessionCode]/       # Tampilan pemain
│
├── components/                  # Reusable React Components
│   ├── auth/                    # Login & Register forms
│   ├── dashboard/               # Template cards & views
│   ├── editor/                  # Template editor components
│   ├── game/                    # Game board components
│   └── ui/                      # UI utilities (Button, Modal, etc)
│
├── context/                     # React Context
│   └── AuthContext.tsx          # Autentikasi global
│
├── hooks/                       # Custom React Hooks
│   ├── useAuth.ts              # Auth logic
│   ├── useSession.ts           # Session management
│   ├── useTemplate.ts          # Template operations
│   ├── useTemplates.ts         # List templates
│   └── usePlayers.ts           # Player management
│
├── lib/                         # Utilities & konfigurasi
│   ├── firebase.ts             # Firebase initialization
│   ├── types.ts                # TypeScript definitions
│   ├── firestore/              # Firestore operations
│   │   ├── templates.ts        # Template queries
│   │   └── sessions.ts         # Session queries
│   └── utils/                  # Helper functions
│       ├── cellHelpers.ts      # Cell utilities
│       ├── generateCode.ts     # Generate session code
│       └── roleGuard.ts        # Role-based access
│
└── public/                      # Static assets
```

---

## 💡 Penggunaan

### 1. Daftar & Login
1. Kunjungi halaman utama
2. Klik "Register" untuk membuat akun baru
3. Masukkan email dan password
4. Login dengan kredensial Anda

### 2. Buat Template Game
1. Klik "Template Baru" di dashboard
2. Masukkan informasi game:
   - Judul game
   - Jumlah kategori (kolom)
   - Jumlah difficulty tier (baris)
   - Nilai poin per baris
3. Tambahkan kategori dan pertanyaan/jawaban
4. Klik "Simpan" untuk menyimpan draft
5. Setelah semua cell terisi, template siap dimainkan

### 3. Mulai Game
1. Pilih template yang sudah selesai
2. Klik "Mulai Game"
3. Bagikan kode 4-digit kepada pemain
4. Pemain bergabung menggunakan kode tersebut
5. Klik cell di board untuk menampilkan pertanyaan/jawaban
6. Kelola skor pemain dengan tombol `+` dan `-`

### 4. Bergabung sebagai Pemain
1. Kunjungi halaman player
2. Masukkan kode sesi 4-digit
3. Masukkan nama display Anda
4. Klik nama Anda untuk aktifkan buzzer saat diminta
5. Lihat skor Anda terupdate secara real-time

---

## 🔐 Konfigurasi Environment

### Firebase Firestore Rules
Project ini dilengkapi dengan Firestore Security Rules yang melindungi:
- Template hanya bisa diakses oleh owner-nya
- Sesi hanya bisa diakses oleh host dan joined players
- Player tidak bisa memodifikasi data game yang tidak authorized

Lihat `firestore.rules` untuk detail lengkap.

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi teknis yang lebih detail, silakan baca:
- **[JEOPARDY_PROJECT.md](./JEOPARDY_PROJECT.md)** - Dokumentasi lengkap project termasuk:
  - Database schema
  - Game flow & state machine
  - Real-time architecture
  - Privilege escalation prevention
  - Component architecture

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Untuk berkontribusi:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📝 Lisensi

Project ini berlisensi MIT - lihat file LICENSE untuk detail.

---

## 📞 Support

Jika Anda menemukan bug atau memiliki pertanyaan, silakan buka issue di repository ini.

---

**Dibuat dengan ❤️ menggunakan Next.js & Firebase**

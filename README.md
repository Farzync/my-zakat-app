# Zakat App

Aplikasi manajemen zakat modern berbasis web dengan Next.js, Prisma, dan Tailwind CSS. Mendukung pencatatan, pelaporan, ekspor, dan verifikasi transaksi zakat fitrah, mal, infak, dan lainnya.

---

## Fitur Utama

- **Dashboard**: Statistik total zakat, grafik, dan transaksi terbaru.
- **Manajemen Transaksi**: Tambah, edit, hapus, dan lihat detail transaksi zakat.
- **Laporan**: Filter, sortir, dan ekspor laporan zakat ke PDF/Excel.
- **Ekspor Data**: Pilih tipe zakat, metode pembayaran, dan format ekspor.
- **Verifikasi Struk**: Scan QR code atau input manual untuk validasi keaslian struk digital.
- **Autentikasi**: Login berbasis username & password, session dengan JWT.
- **Role User**: Admin & Staff.

## Teknologi

- **Next.js** (App Router, SSR, API Routes)
- **Prisma ORM** (PostgreSQL/MySQL/SQLite)
- **Tailwind CSS** (UI modern & responsif)
- **React** 19
- **Lucide Icons, Radix UI, React Hook Form, jsPDF, ExcelJS, QR Scanner**

## Struktur Folder

- `app/` : Routing utama (dashboard, transaksi, laporan, login, verifikasi)
- `components/` : Komponen UI (form, dialog, chart, dsb)
- `lib/` : Logic backend (auth, data, prisma, utils)
- `prisma/` : Skema & migrasi database
- `scripts/` : Seeder & utilitas

## Alur Penggunaan

1. **Login**: Masuk sebagai admin/staff.
2. **Dashboard**: Lihat statistik, grafik, dan transaksi terbaru.
3. **Transaksi**: Tambah/edit/hapus transaksi zakat (fitrah, mal, infak, lainnya).
4. **Laporan**: Filter & ekspor laporan per periode (harian, mingguan, bulanan, tahunan).
5. **Ekspor**: Pilih data & format, unduh PDF/Excel.
6. **Verifikasi**: Scan QR struk atau input ID untuk cek keaslian.

## Instalasi & Setup

1. **Clone repo**
2. **Install dependencies**
   ```bash
   pnpm install
   # atau npm install
   ```
3. **Setup environment**
   - Copy `.env.example` ke `.env` dan isi variabel DB & JWT
4. **Migrasi & Seed database**
   ```bash
   pnpm prisma migrate dev
   pnpm tsx scripts/seed-transactions.ts
   ```
5. **Jalankan aplikasi**
   ```bash
   pnpm dev
   ```

## Penjelasan Fitur

### Transaksi Zakat

- Input: Nama pemberi, penerima, atas nama, nominal, tanggal, metode, tipe zakat, catatan, tanda tangan.
- Tipe zakat: Fitrah, Mal, Infak, Lainnya.
- Metode: Cash, Bank Transfer, E-Wallet, Lainnya.
- Setiap transaksi bisa diverifikasi keasliannya via QR.

### Laporan & Ekspor

- Filter periode, tipe zakat, metode pembayaran.
- Ekspor PDF/Excel dengan format tabel & summary.

### Verifikasi Struk

- Scan QR atau input ID → tampilkan detail transaksi & status validitas.

### Autentikasi & Role

- Login → session JWT (cookie).
- Role: Admin (akses penuh), Staff (akses terbatas).

## Struktur Data (Prisma Model)

- **User**: id, username, password (hash), name, role
- **Transaction**: id, donorName, recipientName, onBehalfOf, amount, date, paymentMethod, zakatType, notes, signatures, userId
- **OnBehalfOf**: type, name

## Scripts

- `scripts/seed-transactions.ts`: Seeder data dummy transaksi zakat
- `scripts/hash-plain-passwords.tsx`: Hash password user yang masih plaintext

## Pengembangan

- Next.js App Router, SSR, API Route
- Prisma ORM, migrasi & seed
- Tailwind CSS, Radix UI, Lucide
- React Hook Form, Toast, Dialog, dsb

## Lisensi

MIT

---

> Dokumentasi lebih detail akan ditambahkan. Untuk pertanyaan, silakan cek kode dan fahami sendiri.

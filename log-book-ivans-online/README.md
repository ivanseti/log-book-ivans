# Log book IvanS — versi online

Aplikasi Next.js + Supabase untuk logbook kegiatan harian. Landing page dapat dilihat publik; dashboard dan data kegiatan hanya tersedia setelah login. Row Level Security (RLS) membatasi setiap akun hanya pada data miliknya.

## 1. Siapkan Supabase (gratis untuk mulai)

1. Buat project di https://supabase.com dan simpan Project URL serta anon/public key dari **Project Settings → API**.
2. Buka **SQL Editor → New query**, salin seluruh isi `supabase/schema.sql`, lalu klik Run.
3. Buka **Authentication → URL Configuration**. Setelah deployment, isi Site URL dengan alamat Vercel dan tambahkan URL tersebut ke Redirect URLs.
4. Untuk uji coba, Authentication → Providers → Email aktif. Jika ingin pendaftaran langsung tanpa konfirmasi email, atur Email confirmations sesuai kebutuhan keamanan. Disarankan tetap memakai konfirmasi email.

## 2. Jalankan lokal

1. Instal Node.js versi LTS.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key Supabase
4. Di folder proyek, jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Buka http://localhost:3000.

**Jangan pernah memasukkan `service_role` key ke aplikasi browser atau ke variabel `NEXT_PUBLIC_*`.** Aplikasi hanya menggunakan anon/public key; akses data dilindungi RLS.

## 3. Deploy ke Vercel

1. Buat akun di https://vercel.com dan https://github.com.
2. Buat repository GitHub baru, unggah seluruh isi folder proyek ini.
3. Di Vercel pilih **Add New → Project**, impor repository tersebut.
4. Di **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **Deploy**. Vercel akan memberi alamat publik seperti `https://nama-proyek.vercel.app`.
6. Kembali ke Supabase → Authentication → URL Configuration:
   - Site URL: alamat Vercel
   - Redirect URLs: tambahkan `https://nama-proyek.vercel.app/**`
7. Redeploy jika mengubah environment variables.

## 4. Membuat akun dan mengatur akses

- Buka `https://alamat-website/login`, pilih daftar akun, lalu buat akun menggunakan email dan password.
- Pengguna harus login untuk melihat dashboard.
- RLS memastikan pengguna hanya dapat membaca, menambah, mengubah, dan menghapus baris dengan `user_id` miliknya.
- Jangan membagikan akun/password. Jika website hanya untuk Ivan, buat akun Ivan sendiri dan jangan bagikan halaman pendaftaran. Untuk membatasi pendaftaran lebih lanjut, nonaktifkan sign-up publik di Supabase setelah akun pemilik dibuat.

## Fitur

- Halaman depan publik.
- Login dan pendaftaran akun melalui Supabase Auth.
- Dashboard terlindungi login.
- Tanggal/jam saat ini, tambah/edit/hapus kegiatan, filter tanggal.
- Ringkasan total kegiatan, durasi, dan hari aktif.
- Unduh CSV (dapat dibuka di Excel) dan cetak / Save as PDF.

## Catatan penting

Paket ini adalah source code siap deploy, bukan website yang sudah online. Publikasi memerlukan akun Vercel, project Supabase, pengisian environment variables, dan proses deploy. Link `vercel.app` baru terbentuk setelah deployment berhasil. Paket ini tidak memuat password maupun kunci rahasia.

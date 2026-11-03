# CV Builder

Web pembuat CV ATS-friendly yang gratis, dalam Bahasa Indonesia atau Inggris. Tanpa login dan tanpa backend: data tersimpan di browser pengguna, dan PDF dibuat di browser.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tes ATS dan karakter
npm run typecheck
npm run lint
npm run build
```

Butuh Node.js 22.12 atau lebih baru.

## Struktur

| Lokasi | Isi |
|---|---|
| `src/lib/cv/schema.ts` | Struktur data CV dan validasinya |
| `src/lib/cv/templates.ts` | Daftar template, masing-masing berupa satu set gaya |
| `src/lib/cv/i18n.ts` | Semua teks Indonesia dan Inggris |
| `src/lib/cv/store.ts` | Draf dan autosave ke localStorage |
| `src/lib/pdf/CvDocument.tsx` | Satu-satunya layout PDF, dipakai semua template |
| `src/lib/pdf/pdf.worker.ts` | Pembuatan PDF di Web Worker |
| `src/lib/pdf/ats.test.ts` | Tes keterbacaan ATS |
| `src/components/` | Halaman awal, form, panel tampilan, dan preview |

## Menambah template

1. Tambahkan gaya baru di `TEMPLATES` pada `src/lib/cv/templates.ts`.
2. Tambahkan nama dan deskripsinya dalam dua bahasa di `src/lib/cv/i18n.ts`.
3. Jalankan `npm test`. Template baru otomatis ikut diuji.

## Foto

Foto bersifat opsional. Setelah diunggah, pengguna meng-crop foto dengan rasio 4:5 (lebar:tinggi). Hasilnya disimpan sebagai JPEG 600x750 dan tampil di header PDF berukuran 2,8 x 3,5 cm. Foto asli juga disimpan dalam versi yang diperkecil (maksimal 1600 px), supaya crop bisa diatur ulang. Lihat `src/lib/photo/image.ts` dan `src/components/PhotoCropDialog.tsx`.

## Aturan ATS

Jangan menambahkan layout dua kolom, tabel, gambar, ikon, atau skill bar ke `CvDocument.tsx`. Pemenggalan kata juga harus tetap mati karena bisa memotong kata kunci.

Font bawaan PDF hanya mendukung karakter Latin (Windows-1252). Karakter lain tidak tampil dengan benar, dan editor akan memberi peringatan jika pengguna memasukkannya.

# Catatan desain situs YES

Dokumen ini mencatat keputusan yang dipakai di kode, bukan rencana.

## Arah

Situs dibaca seperti lembar pengumuman yang dicetak rapi. Dua kolom: margin kiri berisi keterangan kecil yang benar-benar informatif, kolom kanan berisi isi. Tidak ada kartu, tidak ada bayangan, pemisah selalu garis 1 px.

## Palet

Diambil dari poster YES sendiri, bukan dari situs referensi.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--paper` | `#FCFDFE` | latar halaman |
| `--ink` | `#0F2231` | teks utama |
| `--ink-soft` | `#4A6172` | keterangan, caption |
| `--blue` | `#1C77B5` | tautan, penanda buka-tutup |
| `--blue-deep` | `#10557F` | bidang hero, satu-satunya bidang pekat |

Kontras terukur: teks utama 15,9:1, teks di atas hero 8,0:1, teks keterangan 5,2:1.

## Tipografi

Dua famili, perannya jelas berbeda.

- Display: Bricolage Grotesque 800 untuk judul hero dan judul seksi.
- Teks: Instrument Sans 400/500 untuk body, keterangan, dan label.

| Peran | Ukuran |
|---|---|
| Hero | `min(9.4vw, 116px)`, line-height 0,94, tracking -0,038em |
| Judul seksi | `clamp(1.7rem, 3.2vw, 2.6rem)` |
| Lede | `clamp(1.0625rem, 1.35vw, 1.25rem)` |
| Body | 17 px, line-height 1,65 |
| Keterangan | 14 px |

Panjang baris body 56 karakter di desktop, 39 di ponsel.

## Ukuran hero

Bukan tebakan. Saya ukur lebar baris terpanjang pada setiap lebar viewport 300 sampai 1600 px, lalu cari ukuran font terbesar yang masih muat dalam satu baris. Hasilnya rasio 9,2 sampai 9,5 vw, sehingga dipakai `min(9.4vw, 116px)` dengan pengali 0,97 di bawah 400 px. Baris hero tidak pecah di lebar mana pun.

## Struktur

1. Hero: pernyataan tiga baris di atas bidang biru, keterangan di bawahnya.
2. Tentang: dua paragraf, tiga pilar sebagai daftar definisi, tahun 2007 dan 2012 di margin.
3. Jadwal: lima sesi berurutan, catatan di margin.
4. Dokumentasi: poster 440 px dengan caption.
5. Gabung: tiga pertanyaan, kontak di margin.

Nomor urut hanya dipakai di daftar sesi, karena sesi memang berurutan dalam seminggu.

## Gerak

Satu momen saja: tiga baris hero naik 0,4em sambil memudar saat halaman dimuat, berurutan 90 ms. Tidak ada animasi masuk per seksi, tidak ada parallax. Semua berhenti pada `prefers-reduced-motion`.

## Batasan teknis

- Tanpa JavaScript. FAQ memakai `<details>`, navigasi memakai anchor, kolom margin memakai `position: sticky`.
- Tanpa dependensi runtime. Dua webfont dari Google Fonts, sisanya CSS.
- Diuji pada 1440, 1024, 768, 390, dan 320 px: tidak ada overflow horizontal, anchor tidak tertutup header, kontras lulus, target sentuh minimal 24 px.

## Yang dihapus

`site.js` dihapus karena isinya efek parallax langit yang tidak lagi dipakai. Berkasnya masih ada di riwayat git.

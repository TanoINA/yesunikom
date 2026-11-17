# YES UNIKOM

Situs Youth English Society (YES), UKM bahasa Inggris di Universitas Komputer Indonesia. Isinya profil singkat, kegiatan, kontak pengurus, dan informasi acara Sunny Side Up.

[Buka situs](https://tanoina.github.io/yesunikom/)

Situs ini memakai HTML, CSS, dan JavaScript biasa, tanpa framework atau backend. Pengunjung yang ingin bertanya soal pendaftaran diarahkan ke Instagram atau email pengurus; situs tidak menyimpan data pendaftar.

## Menjalankan di komputer sendiri

Buka `index.html` langsung di browser. Tidak perlu memasang Node.js untuk melihat situs.

Node.js dan npm hanya diperlukan untuk menjalankan perintah build dan tes. Dari folder proyek, pasang dependensi dengan:

```sh
npm ci
```

## Mengubah situs

| File | Kegunaan |
| --- | --- |
| `index.html` | Teks halaman, jadwal kegiatan, tautan kontak, dan detail acara |
| `input.css` | Sumber CSS untuk tata letak, warna, tipografi, dan tampilan mobile |
| `style.css` | CSS yang dibaca browser, hasil salinan dari `input.css` |
| `site.js` | Menu mobile, dialog informasi acara, dan tahun di footer |
| `poster-gabung.png` | Poster yang tampil di halaman utama dan dialog |
| `logo-yes.png`, `logo-unikom.png` | Logo YES dan UNIKOM |
| `tests/site.cjs` | Tes browser dengan Playwright |

Setelah mengubah `input.css`, jalankan:

```sh
npm run build
```

Perintah ini hanya menyalin `input.css` ke `style.css`. Tidak ada compiler CSS atau Tailwind dalam versi ini. Jangan mengedit `style.css` saja karena perubahan itu akan tertimpa saat build berikutnya.

### Mengganti poster atau detail acara

Ganti `poster-gabung.png` jika ingin memakai poster baru dengan nama yang sama. Kalau nama file berubah, perbarui juga semua rujukannya di `index.html`.

Sesuaikan teks alternatif gambar, nama acara, tanggal, waktu, tempat, dan dress code di `index.html`. Mengganti gambar saja tidak mengubah keterangan acara di halaman.

Poster Sunny Side Up saat ini adalah poster YES First Gathering, bukan formulir pendaftaran anggota. Konfirmasikan jadwal acara, jadwal kegiatan rutin, status penerimaan anggota, dan kontak kepada pengurus sebelum menerbitkan perubahan.

## Tampilan dan aksesibilitas

Poster menjadi bagian utama di pembuka halaman. Tombol "Gabung YES" membuka dialog berisi poster lengkap, detail acara, dan kontak pengurus. Di layar kecil, navigasi memakai tombol menu dan isi dialog tersusun dalam satu kolom.

Dialog bisa ditutup lewat tombol Tutup, tombol Escape, atau klik di luar dialog. Setelah ditutup, fokus kembali ke pemicunya atau tombol menu jika pemicunya sudah tersembunyi. Situs juga mengikuti pengaturan reduced motion. Tanpa JavaScript, navigasi tetap terlihat dan tautan pendaftaran menuju bagian kontak pendaftaran di halaman.

Font Bricolage Grotesque dan Source Sans 3 dimuat lewat Google Fonts. Browser memakai font cadangan jika layanan itu tidak tersedia.

## Pengujian

Tes memakai Playwright dan Microsoft Edge yang terpasang di komputer. Konfigurasi browser saat ini ditujukan untuk pengujian di Windows.

```sh
npm ci
npm test
```

Skrip tes menjalankan server lokal sementara dan menutupnya setelah selesai. Tes memeriksa enam ukuran layar, mulai dari lebar 320 px hingga desktop 1440 px, termasuk orientasi landscape. Pemeriksaannya mencakup pemuatan poster, menu mobile, batas dan scroll dialog, cara menutup dialog, pemulihan fokus, reduced motion, serta navigasi tanpa JavaScript.

Screenshot hasil tes masuk ke `test-results/`. Folder ini tidak ikut masuk Git. Tes browser tidak memverifikasi kebenaran jadwal atau informasi dari pengurus.

## Menerbitkan perubahan

GitHub Pages menerbitkan situs dari root branch `master`. Pastikan perubahan CSS sudah disalin ke `style.css`, lalu periksa file yang akan dikirim:

```sh
git status
git diff
```

Tambahkan hanya file yang diubah. Contoh untuk perubahan konten dan CSS:

```sh
git add index.html input.css style.css
git commit -m "Perbarui konten dan tampilan situs"
git push origin master
```

Jika poster atau JavaScript ikut berubah, tambahkan file tersebut juga. Pantau hasil deployment di [GitHub Actions](https://github.com/TanoINA/yesunikom/actions). Versi online berubah setelah deployment selesai, bukan saat file lokal disimpan.

Untuk hosting statis lain atau membuat ZIP, letakkan enam file berikut dalam direktori yang sama:

```text
index.html
style.css
site.js
logo-yes.png
logo-unikom.png
poster-gabung.png
```

ZIP lokal `yes-situs.zip` tidak masuk Git dan tidak diperbarui otomatis oleh perintah build. Buat ulang arsip jika file situs berubah.

# YES UNIKOM

Situs statis Youth English Society, Universitas Komputer Indonesia.

## Pengembangan

- Edit `index.html` untuk konten, `input.css` untuk tampilan, dan `site.js` untuk interaksi.
- Jalankan `npm run build` setelah mengubah CSS. Perintah ini menyalin CSS sumber ke `style.css`, tanpa compiler atau framework.
- Font web bersifat opsional; browser memakai Arial jika Google Fonts tidak tersedia.

## Pengujian

Jalankan `npm ci`, lalu `npm test`. Pengujian memakai Playwright dengan Microsoft Edge yang terpasang di Windows. Screenshot disimpan di `test-results/` (tidak masuk Git).

Pengujian mencakup enam ukuran layar, pemuatan poster, navigasi mobile, posisi dan scroll dialog, penutupan dialog, pemulihan fokus, reduced motion, dan fallback tanpa JavaScript.

## Deploy

File runtime yang harus tersedia dalam direktori yang sama:

- `index.html`
- `style.css`
- `site.js`
- `logo-yes.png`
- `logo-unikom.png`
- `poster-gabung.png`

`yes-situs.zip` berisi enam file tersebut langsung di root arsip.

GitHub Pages saat ini memakai branch `master`. Perubahan lokal tidak diterbitkan sebelum di-commit dan di-push. Jangan gunakan `git add .` tanpa memeriksa file yang akan dimasukkan.

## Konten

Poster Sunny Side Up adalah poster YES First Gathering, bukan formulir pendaftaran anggota. Tombol kontak mengarahkan pengunjung ke pengurus untuk menanyakan pendaftaran; tidak mengklaim Instagram sebagai formulir resmi. Pastikan pengurus mengonfirmasi jadwal, status penerimaan anggota, dan kontak sebelum publikasi.

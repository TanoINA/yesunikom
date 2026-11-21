# YES UNIKOM

Youth English Society (YES) adalah UKM bahasa Inggris di Universitas Komputer Indonesia, Bandung. Anggota berlatih lewat diskusi hari Kamis dan kelas berbicara hari Jumat, pukul 15.30 sampai 17.30 WIB.

[Buka situs YES](https://tanoina.github.io/yesunikom/)

## Struktur

- `index.html` halaman tunggal
- `input.css` sumber gaya, `style.css` salinan hasil `npm run build`
- `tests/site.cjs` tes Playwright
- `DESIGN.md` catatan keputusan desain

Tanpa framework, tanpa JavaScript, tanpa bundler. Situs ini hanya HTML dan CSS, dengan dua webfont dari Google Fonts.

## Menjalankan

```
npm install
npm run build
npm test
```

`npm run build` menyalin `input.css` ke `style.css`. `npm test` menjalankan Chromium dan memeriksa isi, jadwal, kontras, serta tata letak pada lima lebar layar.

## Kontak

- Instagram: [@yesunikom](https://www.instagram.com/yesunikom/)
- Email: [hallo.yesunikom@gmail.com](mailto:hallo.yesunikom@gmail.com)

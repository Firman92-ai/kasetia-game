# Teknologi — Kasetia Game

## 1. Prinsip pemilihan
Aplikasi dibangun sebagai website frontend statis menggunakan **HTML5, CSS3, dan JavaScript murni (native ES modules)**. Arsitektur ini mengutamakan kecepatan muat, kemudahan pemeliharaan kode katalog, biaya operasional sangat rendah, serta kemampuan berjalan langsung melalui server HTTP statis tanpa ketergantungan framework antarmuka.

## 2. Stack yang dipilih
| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Struktur halaman | HTML5 semantik (`lang="id"`) | Menyediakan landmark aksesibilitas, tabel kompatibilitas, dan akordion native `<details>` tanpa library |
| Tampilan | CSS3 murni (Custom Properties, Grid, Flexbox) | Tata letak responsif 320 px–1440 px, kontras terukur, dan tanpa ketergantungan CSS eksternal |
| Logika browser | JavaScript ES Modules (`type="module"`) | Memisahkan konfigurasi, katalog, kalkulasi keranjang, penyimpanan, dan validasi checkout secara modular |
| Framework UI | Tidak digunakan | Menjaga kesederhanaan sesuai ruang lingkup MVP murni native |
| Data katalog | Array objek beku (`Object.freeze`) di `js/data.js` | Mudah diperbarui pengelola dan aman dari mutasi tidak sengaja |
| Aset visual | Ilustrasi SVG lokal di `assets/images/` | Ukuran berkas sangat ringan, tajam pada layar kepadatan tinggi, bebas blokir domain pihak ketiga |
| Penyimpanan browser | `localStorage` dengan validasi skema | Menyimpan isi keranjang pada browser yang sama tanpa server |
| Integrasi pesanan | Tautan `https://wa.me/` dengan `encodeURIComponent` | Meneruskan draf pesanan terstruktur yang diperiksa dan dikirim sendiri oleh pembeli |
| Pengujian otomatis | Node.js built-in test runner (`node --test`) | Menguji fungsi murni kalkulasi, sanitasi storage, dan validasi checkout tanpa paket penguji tambahan |

## 3. Kompatibilitas browser
Mendukung browser modern Chrome, Edge, Firefox, dan Safari (desktop serta Android/iOS terkini). Memanfaatkan input tanggal dan tipe input telepon native HTML5 yang diperkuat validasi JavaScript lintas zona waktu.

## 4. Pengelolaan data dan privasi
- `localStorage` (`kasetia-game:cart:v1`) **hanya** menyimpan `schemaVersion`, daftar `{ productId, quantity }`, `fulfillmentMethod`, dan `pickupDate`.
- Data pribadi pembeli (nama, nomor WhatsApp, kota/kecamatan tujuan, catatan tambahan) hanya hidup sementara di memori formulir browser dan **dilarang** disimpan ke `localStorage`.
- Harga satuan selalu dibaca ulang dari `js/data.js`; nilai harga hasil modifikasi di penyimpanan lokal diabaikan sepenuhnya.
- Tidak ada kunci rahasia, token API, atau kredensial sensitif pada kode frontend.

## 5. Performa dan ketahanan aset
Seluruh 14 berkas ilustrasi SVG disimpan secara lokal dengan atribut `width` dan `height` eksplisit untuk mencegah pergeseran tata letak (CLS), `loading="lazy"` untuk kartu produk di bawah lipatan awal, serta mekanisme fallback lokal otomatis (`fallback-media.svg`) apabila suatu aset gagal dimuat. Font menggunakan `system-ui` bawaan sistem operasi sehingga tidak ada penundaan pemuatan font eksternal.

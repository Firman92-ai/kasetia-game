# Kasetia Game

Website katalog dan pemesanan media fisik game original (**Blu-ray Disc PS5**, **Cartridge Nintendo Switch 1**, dan **Cartridge Nintendo Switch 2**) menggunakan HTML, CSS, dan JavaScript murni (native ES modules), tanpa framework antarmuka atau ketergantungan backend.

## Menjalankan Secara Lokal

Melalui server pengembangan:

```bash
npm run dev
```

Atau menggunakan server HTTP statis murni tanpa paket tambahan:

```bash
python3 -m http.server 5500 --bind 127.0.0.1
```

Buka `http://localhost:5500` (atau port preview `3000`). Jangan membuka berkas langsung melalui protokol `file://` karena browser modern mewajibkan HTTP/HTTPS untuk memuat ES modules.

## Isi Proyek

- **20 judul fisik game contoh** yang terbagi ke dalam **3 kategori platform utama**: 12 Blu-ray Disc PS5, 4 Cartridge Nintendo Switch 1, dan 4 Cartridge Nintendo Switch 2 (mencakup kondisi Segel Baru BNIB dan Bekas Terawat CIB), dilengkapi ilustrasi SVG lokal tanpa ketergantungan gambar eksternal.
- **Pencarian kata kunci dan penyaringan gabungan** berdasarkan platform serta kondisi fisik.
- **Keranjang belanja persisten** di `localStorage` dengan batas jumlah teknis 1–99 unit per judul, validasi skema, dan penghitungan ulang harga resmi dari katalog.
- **Pilihan penerimaan barang**: Ambil langsung di toko (dengan validasi tanggal rencana ambil) atau Kirim Kurir/Ekspedisi (dengan pencatatan kota dan kecamatan tujuan).
- **Formulir kontak, pemeriksaan ringkasan di halaman, penyalin draf, dan pembentuk tautan WhatsApp** (`wa.me`).
- **Panduan kompatibilitas konsol**, FAQ berbasis elemen native `<details>`/`<summary>`, tata letak responsif mulai lebar 320 px, serta dukungan navigasi keyboard.

Nama toko, harga, dan spesifikasi pada kode saat ini merupakan data contoh. Ketersediaan stok dan ongkos kirim dikonfirmasi secara manual oleh pengelola toko. Tidak ada akun pengguna, database server, pembayaran otomatis, atau penguncian stok real-time.

## Konfigurasi Usaha Sebelum Rilis

Edit `js/config.js` untuk memasukkan nomor WhatsApp internasional toko (hanya digit, contoh `"6281234567890"`), alamat toko sebenarnya, dan jam operasional. Alamat di footer ditandai sebagai contoh demonstrasi selama `addressIsExample: true`; ubah menjadi `false` setelah diganti alamat resmi. Biarkan `whatsappNumber: ""` apabila nomor resmi belum siap agar tombol WhatsApp dinonaktifkan secara aman tanpa mengirim pesan ke nomor acak.

Nama pembeli, nomor kontak, kota tujuan, dan catatan tambahan **tidak pernah disimpan** di `localStorage`. Saat pengguna menekan tombol WhatsApp, rincian pesanan dimasukkan ke URL `wa.me` dan pengguna tetap harus menekan kirim sendiri di aplikasi WhatsApp.

## Pengujian dan Pembuatan Paket Statis

Jalankan rangkaian pengujian otomatis dan pembentuk paket publik:

```bash
npm test
python3 scripts/package_site.py
```

Paket siap unggah akan tersimpan di `artifacts/kasetia-game.zip` yang hanya memuat aset runtime (`index.html`, `css/`, `js/`, `assets/images/`).

Dokumentasi lengkap tersedia pada:
- Kebutuhan produk: [prd.md](prd.md)
- Pilihan teknologi: [tech_stack.md](tech_stack.md)
- Arsitektur sistem: [arsitektur.md](arsitektur.md)
- Panduan desain & aksesibilitas: [ui.ux.md](ui.ux.md)
- Catatan verifikasi: [verification.md](verification.md)

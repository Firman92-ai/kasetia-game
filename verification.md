# Catatan Verifikasi — Kasetia Game

Tanggal pemeriksaan: 3 November 2026. Status: implementasi MVP lokal dengan 12 produk contoh media fisik (**Blu-ray Disc PS5**, **Cartridge Nintendo Switch 1**, dan **Cartridge Nintendo Switch 2**); belum terhubung ke nomor WhatsApp toko aktif dan belum menjadi sistem reservasi otomatis.

## Hasil pemeriksaan teknis

- **8 kelompok pengujian otomatis lulus** melalui `npm test` (`node --test tests/*.test.mjs`), meliputi:
  1. Keunikan ID, kelengkapan 12 produk pada 3 kategori platform, serta validitas harga bilangan bulat Rupiah.
  2. Pencarian kata kunci dan penyaringan gabungan platform serta kondisi fisik (BNIB & CIB).
  3. Perhitungan dan validasi tanggal kalender lintas bulan/tahun serta tahun kabisat menggunakan `Date.UTC`.
  4. Penggabungan item ber-ID sama di keranjang, batas jumlah 1–99 unit, penghapusan item, dan ketepatan total Rupiah (`Rp2.587.000`).
  5. Pemulihan aman JSON rusak di `localStorage`, pengabaian manipulasi harga/ID palsu, dan pembersihan otomatis tanggal rencana ambil yang sudah lewat.
  6. Jaminan privasi penyimpanan: nama pembeli, nomor WhatsApp, dan kota tujuan tidak pernah masuk ke `localStorage`.
  7. Normalisasi nomor kontak WhatsApp (`08...`, `+62...`, tanda hubung/kurung) serta urutan fokus field tidak valid.
  8. Pembentukan teks draf pesanan dan encoding penuh URL `https://wa.me/` dengan `encodeURIComponent`, termasuk penonaktifan aman saat nomor toko kosong.
- **Pemeriksaan sintaks seluruh modul JavaScript lulus** (`node --check`) dan build statis berhasil tanpa error.
- **14 ilustrasi SVG lokal terverifikasi** di `assets/images/` (1 ilustrasi hero, 1 fallback lokal, dan 12 ilustrasi produk spesifik platform), bebas ketergantungan gambar eksternal.
- **Paket distribusi statis berhasil dibentuk** melalui `python3 scripts/package_site.py` ke `artifacts/kasetia-game.zip` yang hanya memuat berkas runtime (`index.html`, `css/`, `js/`, `assets/images/`).

## Batas verifikasi dan kesiapan rilis

- Nomor WhatsApp toko pada `js/config.js` sengaja dibiarkan kosong (`""`) sesuai SOP keamanan sehingga tombol pembuka WhatsApp berada dalam keadaan nonaktif aman; fitur penyusunan keranjang, validasi formulir, pemeriksaan ringkasan, dan tombol **Salin Draf Pesanan** tetap berfungsi penuh.
- Alamat toko di footer merupakan alamat contoh demonstrasi (`addressIsExample: true`). Pengelola wajib mengganti nomor WhatsApp, alamat toko, jam operasional, serta daftar harga aktual di `js/config.js` dan `js/data.js` sebelum publikasi.
- Tidak terdapat backend, sinkronisasi stok gudang real-time, kalkulator tarif kurir otomatis, ataupun gerbang pembayaran online; seluruh konfirmasi stok fisik dan total akhir dilakukan secara manual oleh admin melalui WhatsApp.

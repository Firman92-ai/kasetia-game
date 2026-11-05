# Product Requirement Document — Kasetia Game

Status: MVP lokal telah diimplementasikan dengan 12 produk fisik game dari 3 platform konsol. Hasil pemeriksaan dan batas kesiapan rilis dicatat pada `verification.md`. Nama usaha "Kasetia Game", harga contoh, lokasi toko, dan nomor WhatsApp harus diperbarui dengan data usaha sebenarnya sebelum peluncuran publik.

## 1. Visi produk
Memudahkan pemain konsol di Indonesia menemukan, memeriksa kompatibilitas perangkat keras, dan mengajukan pemesanan media fisik game original (**Disc PS5**, **Cartridge Nintendo Switch 1**, dan **Cartridge Nintendo Switch 2**) melalui website berbahasa Indonesia yang ringan, jujur, dan nyaman diakses lewat ponsel.

## 2. Masalah yang dipecahkan
- Calon pembeli kesulitan membedakan kompatibilitas fisik antara PS5 Disc vs Digital Edition, serta Cartridge Nintendo Switch 1 vs Cartridge eksklusif Nintendo Switch 2.
- Pertanyaan berulang melalui chat sering tidak mencantumkan judul lengkap, kondisi (Segel Baru BNIB atau Bekas Terawat CIB), jumlah unit, ataupun metode penerimaan.
- Pembeli ingin mengetahui perkiraan total harga barang sebelum menghubungi admin toko.
- Pengelola toko membutuhkan format pesanan masuk yang rapi agar pengecekan stok fisik, kode region DLC, dan ongkos kirim lebih cepat.

## 3. Target pengguna
| Pengguna | Kebutuhan utama |
| --- | --- |
| Pemilik konsol baru (PS5 / Switch 1 / Switch 2) | Memastikan kaset atau disc yang dipilih kompatibel dengan varian konsol miliknya |
| Kolektor media fisik game | Memeriksa kode region, kondisi segel/kotak (BNIB vs CIB), dan menyusun beberapa judul sekaligus |
| Pembeli hadiah / keluarga | Melihat informasi jumlah pemain, genre, dan estimasi harga dengan cepat di ponsel |
| Pengelola toko game | Menerima ringkasan pesanan terstruktur di WhatsApp untuk pengecekan stok dan ongkos kirim manual |

## 4. Ruang lingkup MVP
1. Beranda berisi penjelasan keunggulan media fisik original, ajakan menelusuri katalog, alur pemesanan, panduan kompatibilitas, dan kontak toko.
2. Katalog memuat nama judul, platform media, kondisi fisik (Segel Baru BNIB / Bekas Terawat CIB), kode region, deskripsi isi kotak, catatan kompatibilitas konsol, ilustrasi lokal, serta harga satuan dalam Rupiah.
3. Pencarian kata kunci dan penyaringan gabungan berdasarkan platform (**Disc PS5**, **Cartridge Switch 1**, **Cartridge Switch 2**) serta kondisi fisik.
4. Keranjang belanja: tambah barang, ubah jumlah (1–99 unit), hapus barang, dan hitung subtotal otomatis.
5. Pemilihan metode penerimaan: **Ambil di Toko** (dengan validasi tanggal rencana ambil) atau **Kirim Kurir** (dengan input kota/kecamatan tujuan untuk cek ongkir manual).
6. Formulir nama pembeli, nomor WhatsApp aktif, dan catatan opsional, diikuti panel pemeriksaan ringkasan pesanan sebelum membuka WhatsApp toko.
7. Penyimpanan draf keranjang di browser menggunakan `localStorage` dengan pemulihan aman jika data rusak atau kedaluwarsa.
8. Tabel panduan kompatibilitas konsol, ketentuan transaksi, FAQ, dan pemberitahuan bahwa stok perlu dikonfirmasi manual.
9. Tata letak responsif bebas gulir horizontal pada ponsel dan seluruh interaksi dapat dioperasikan menggunakan keyboard.

### Di luar MVP
Akun pengguna, panel admin, sinkronisasi stok real-time, pembayaran online otomatis, hitung ongkir API otomatis, unggah identitas, ulasan pelanggan, dan database transaksi server.

## 5. Aturan bisnis
- Mata uang IDR; seluruh harga disimpan sebagai bilangan bulat Rupiah dan diformat menggunakan standar Indonesia (`Rp799.000`).
- Untuk metode **Ambil di Toko**, tanggal rencana pengambilan tidak boleh sebelum tanggal hari ini pada kalender lokal perangkat (dihitung dengan selisih hari kalender `Date.UTC`, maksimum 30 hari ke depan).
- Untuk metode **Kirim Kurir**, kota dan kecamatan tujuan wajib diisi (3–100 karakter) agar admin dapat menghitung ongkos kirim dan asuransi secara manual.
- Subtotal per judul = harga satuan katalog × jumlah unit. Estimasi harga barang = jumlah seluruh subtotal.
- Batas jumlah teknis adalah 1–99 unit per judul; angka ini bukan indikator ketersediaan stok gudang.
- Total di website merupakan estimasi harga fisik game, belum termasuk ongkos kirim ekspedisi.
- Membuka tautan WhatsApp tidak mengunci stok secara otomatis. Transaksi baru disepakati setelah admin memeriksa ketersediaan unit fisik dan pembeli menyetujui total akhir di WhatsApp.
- Pembeli wajib menekan tombol kirim sendiri pada aplikasi WhatsApp.

## 6. Alur utama
Buka beranda → telusuri katalog / cek kompatibilitas → cari & saring platform/kondisi → tambah ke keranjang → atur jumlah & metode penerimaan → isi kontak → periksa ringkasan pesanan → buka WhatsApp (atau salin draf) → kirim pesan → admin konfirmasi stok & ongkir manual.

## 7. Kriteria penerimaan
- Pencarian, filter platform, dan filter kondisi bekerja bersamaan; hasil kosong menampilkan pesan jelas dan tombol reset.
- Penambahan produk dengan ID yang sama digabung menjadi satu baris di keranjang.
- Keranjang kosong, jumlah di luar 1–99, tanggal ambil masa lalu, nama di luar 2–80 karakter, atau nomor telepon tidak valid ditolak dengan pesan error spesifik dan fokus otomatis ke isian pertama yang bermasalah.
- Contoh verifikasi hitung: 2 unit *Astro Bot* (`Rp799.000`) dan 1 unit *Mario Kart World* (`Rp989.000`) menghasilkan `Rp2.587.000`.
- Draf WhatsApp memuat nama pembeli, kontak WhatsApp, metode penerimaan (tanggal ambil atau kota tujuan), daftar judul beserta platform/region/kondisi/jumlah/subtotal, total estimasi barang, serta permohonan konfirmasi stok fisik.
- Apabila `whatsappNumber` pada `js/config.js` masih kosong, tombol pengajuan WhatsApp dinonaktifkan dengan pemberitahuan sopan tanpa mengekspos instruksi teknis di antarmuka publik.
- Muat ulang halaman memulihkan isi keranjang yang valid; kegagalan `localStorage` tidak menghentikan fungsi katalog maupun penyusunan pesanan sesi berjalan.
- Tidak terjadi gulir horizontal halaman pada lebar viewport 320 px dan 360 px.

# Panduan UI/UX — Kasetia Game

## 1. Arah desain
Tampilan bersih, terstruktur, dan berorientasi kejelasan informasi koleksi fisik konsol. Fokus utama antarmuka adalah membantu pembeli membedakan media fisik (**Blu-ray Disc PS5**, **Cartridge Switch 1**, **Cartridge Switch 2**), memeriksa kondisi serta kompatibilitas konsol, dan menyusun pesanan tanpa hambatan. Seluruh teks antarmuka dan pesan validasi menggunakan bahasa Indonesia.

## 2. Token visual utama
| Elemen | Nilai / Pedoman |
| --- | --- |
| Latar kanvas utama (60%) | `#F6F8FA` |
| Permukaan kartu & panel (30%) | `#FFFFFF` dengan garis batas halus `#D8E0EA` |
| Teks utama | `#111827` (rasio kontras > 15:1 terhadap putih) |
| Teks sekunder | `#475467` (rasio kontras > 7:1 terhadap putih) |
| Aksen tindakan utama (10%) | `#1D4ED8` dengan teks putih `#FFFFFF` (kontras > 6.7:1) |
| Tombol WhatsApp | `#157347` dengan teks putih `#FFFFFF` (kontras > 4.6:1) |
| Indikator kesalahan | `#B42318` di atas latar lembut `#FEF3F2`, selalu disertai teks jelas |
| Font | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Angka harga & jumlah | `font-variant-numeric: tabular-nums` |
| Radius sudut | Kartu `16px`, tombol/input `10px`, elemen dalam `8px` |
| Lebar maksimum kontainer | `1200px` dengan padding tepi `16px` (ponsel) dan `24px` (tablet/desktop) |

## 3. Susunan halaman
Header navigasi 3 zona → Hero pengenalan produk fisik → Area kerja 2 kolom (Katalog di kiri, Keranjang & Formulir di kanan pada desktop; bertumpuk vertikal di ponsel dengan tombol lompat ke keranjang) → Alur pemesanan 4 langkah → Tabel panduan kompatibilitas konsol → Ketentuan & FAQ (`<details>`) → Kontak & Footer. Tanpa jendela modal atau popup kedatangan agar alur keyboard tetap lurus dan ramah pengguna ponsel.

## 4. Komponen dan perilaku keadaan
- **Navigasi atas:** Satu baris ringkas berisi merek kata tunggal, tautan bagian halaman, dan tombol penunjuk unit keranjang. Dilengkapi *skip link* `Lewati ke konten utama`.
- **Kartu produk fisik:** Rasio gambar tetap `4:3`, metadata teks bersih tanpa tumpukan lencana warna-warni (`Disc PS5 · Reg 3 Asia · Segel Baru`), judul, spesifikasi, catatan kompatibilitas konsol, harga per unit, dan tombol `Tambah ke Keranjang` (tinggi minimal `44px`).
- **Pencarian & filter:** Input pencarian berlabel jelas dengan tombol `Bersihkan`, tombol filter platform dengan `aria-pressed`, dropdown kondisi fisik, penghitung hasil live, serta kotak keadaan kosong dengan tombol `Reset Filter & Pencarian`.
- **Kontrol jumlah keranjang:** Tombol `−` dan `+` berukuran `44 × 44 px`, input angka bulat 1–99 berlabel nama judul spesifik, serta tombol `Hapus`.
- **Metode penerimaan:** Pilihan radio `Ambil di Toko` (menampilkan input tanggal rencana ambil) atau `Kirim Kurir` (menampilkan input kota & kecamatan tujuan).
- **Ringkasan pemeriksaan:** Ditampilkan langsung di halaman setelah validasi formulir berhasil. Setiap perubahan pada keranjang, metode penerimaan, atau isian kontak membatalkan ringkasan lama dan meminta pemeriksaan ulang agar draf WhatsApp selalu sinkron.

## 5. Aksesibilitas (Prinsip WCAG 2.2 AA)
- Atribut `lang="id"`, satu elemen `<h1>`, dan hierarki heading berurutan (`h1` → `h2` → `h3`).
- Seluruh elemen interaktif menggunakan kontrol HTML native (`<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `<details>`/`<summary>`).
- Setiap input terhubung dengan `<label>` dan pesan kesalahan terkait melalui `aria-describedby` serta `aria-invalid="true"`.
- Fokus otomatis berpindah ke field bermasalah pertama saat validasi formulir gagal.
- Area pengumuman `aria-live="polite"` mengabarkan perubahan keranjang tanpa merebut fokus.
- Menghormati preferensi sistem `@media (prefers-reduced-motion: reduce)`.

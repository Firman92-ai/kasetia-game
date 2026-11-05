/**
 * Konfigurasi identitas usaha Kasetia Game.
 *
 * Petunjuk sebelum rilis produksi:
 * 1. Isi `whatsappNumber` dengan nomor WhatsApp bisnis format internasional
 *    hanya digit tanpa tanda tambah, spasi, atau tanda hubung (contoh: "6281234567890").
 *    Biarkan string kosong ("") selama nomor asli toko belum tersedia agar tombol
 *    WhatsApp dinonaktifkan secara aman sesuai SOP.
 * 2. Ganti `address` dan `operationalHours` dengan data toko sebenarnya,
 *    lalu ubah `addressIsExample` menjadi `false`.
 */
export const STORE_CONFIG = Object.freeze({
  storeName: 'Kasetia Game',
  tagline: 'Toko Fisik Original Disc PS5, Cartridge Switch 1 & Switch 2',
  whatsappNumber: '',
  operationalHours: 'Senin–Sabtu, 10.00–20.00 WIB (Minggu & hari libur nasional tutup)',
  address: 'Jl. Kemang Raya No. 18, Bangka, Mampang Prapatan, Jakarta Selatan',
  addressIsExample: true,
  pickupPolicy: 'Pengambilan langsung di toko tersedia setelah admin mengonfirmasi ketersediaan unit melalui WhatsApp.',
  shippingPolicy: 'Pengiriman luar area menggunakan kardus pelindung dan bubble wrap berlapis; ongkos kirim dihitung manual sesuai kota tujuan.',
  storageKey: 'kasetia-game:cart:v1',
  schemaVersion: 1,
  minQuantity: 1,
  maxQuantity: 99,
});

import {
  calculateCartSummary,
  formatIndonesianDate,
  formatRupiah,
  validatePickupDate,
} from './cart.js';
import { ALLOWED_FULFILLMENT_METHODS } from './storage.js';

/**
 * Menormalisasi nomor WhatsApp pengguna:
 * - Menghapus spasi, tanda hubung (-), tanda kurung (), dan tanda tambah (+) di awal.
 * - Memastikan seluruh karakter tersisa adalah digit dengan panjang 8–15 digit.
 * - Menerima awalan 08... maupun kode negara seperti 62...
 *
 * @param {string} rawPhone
 * @returns {{ valid: boolean, normalized: string, error: string }}
 */
export function normalizeContactPhone(rawPhone) {
  if (typeof rawPhone !== 'string' || rawPhone.trim() === '') {
    return {
      valid: false,
      normalized: '',
      error: 'Masukkan nomor WhatsApp aktif Anda.',
    };
  }

  let cleaned = rawPhone.trim();
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  cleaned = cleaned.replace(/[\s\-()]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return {
      valid: false,
      normalized: '',
      error: 'Nomor WhatsApp hanya boleh berisi angka, spasi, tanda hubung, atau awalan +.',
    };
  }

  if (cleaned.length < 8 || cleaned.length > 15) {
    return {
      valid: false,
      normalized: '',
      error: 'Nomor WhatsApp harus terdiri dari 8 hingga 15 digit angka.',
    };
  }

  return {
    valid: true,
    normalized: cleaned,
    error: '',
  };
}

/**
 * Memeriksa apakah nomor WhatsApp usaha pada konfigurasi sudah valid
 * (format internasional hanya digit 8–15 angka, tidak diawali angka 0).
 * @param {string} storeWhatsApp
 * @returns {boolean}
 */
export function isStoreWhatsAppConfigured(storeWhatsApp) {
  if (typeof storeWhatsApp !== 'string') {
    return false;
  }
  const trimmed = storeWhatsApp.trim();
  return /^[1-9]\d{7,14}$/.test(trimmed);
}

/**
 * Memvalidasi seluruh formulir pemesanan sebelum menampilkan ringkasan pemeriksaan.
 * @param {object} input
 * @param {readonly Array<object>} catalog
 * @param {Date} [now]
 */
export function validateCheckoutSubmission(input, catalog, now = new Date()) {
  const errors = {};
  const fieldOrder = [];

  const registerError = (field, message) => {
    if (!errors[field]) {
      errors[field] = message;
      fieldOrder.push(field);
    }
  };

  const summary = calculateCartSummary(input.items || [], catalog);
  if (summary.detailedItems.length === 0) {
    registerError('cart', 'Belum ada kaset atau disc di keranjang. Pilih minimal 1 judul terlebih dahulu.');
  }

  const fulfillmentMethod = ALLOWED_FULFILLMENT_METHODS.includes(input.fulfillmentMethod)
    ? input.fulfillmentMethod
    : '';

  if (!fulfillmentMethod) {
    registerError('fulfillmentMethod', 'Pilih metode penerimaan barang.');
  } else if (fulfillmentMethod === 'pickup') {
    const dateCheck = validatePickupDate(input.pickupDate || '', now);
    if (!dateCheck.valid) {
      registerError('pickupDate', dateCheck.error);
    }
  } else if (fulfillmentMethod === 'courier') {
    const city = typeof input.destinationCity === 'string' ? input.destinationCity.trim() : '';
    if (city.length < 3 || city.length > 100) {
      registerError(
        'destinationCity',
        'Masukkan kota dan kecamatan tujuan pengiriman (3–100 karakter) untuk cek ongkos kirim.'
      );
    }
  }

  const trimmedName = typeof input.customerName === 'string' ? input.customerName.trim() : '';
  if (trimmedName.length < 2 || trimmedName.length > 80) {
    registerError('customerName', 'Nama pembeli wajib diisi antara 2 hingga 80 karakter.');
  }

  const phoneCheck = normalizeContactPhone(input.customerPhone || '');
  if (!phoneCheck.valid) {
    registerError('customerPhone', phoneCheck.error);
  }

  const trimmedNotes = typeof input.notes === 'string' ? input.notes.trim() : '';
  if (trimmedNotes.length > 160) {
    registerError('notes', 'Catatan tambahan maksimal 160 karakter.');
  }

  return {
    valid: fieldOrder.length === 0,
    errors,
    firstInvalidField: fieldOrder[0] || null,
    summary,
    normalized: {
      customerName: trimmedName,
      customerPhone: phoneCheck.normalized,
      fulfillmentMethod: fulfillmentMethod || 'pickup',
      pickupDate: fulfillmentMethod === 'pickup' ? (input.pickupDate || '').trim() : '',
      destinationCity:
        fulfillmentMethod === 'courier' && typeof input.destinationCity === 'string'
          ? input.destinationCity.trim()
          : '',
      notes: trimmedNotes,
    },
  };
}

/**
 * Menyusun draf pesan WhatsApp terstruktur menggunakan harga katalog terkini.
 * @param {object} params
 * @returns {string}
 */
export function buildWhatsAppDraftMessage({
  storeName,
  summary,
  normalized,
}) {
  const lines = [
    `Halo Admin ${storeName}, saya ingin mengajukan pemesanan fisik game berikut:`,
    '',
    '*Data Pembeli*',
    `- Nama: ${normalized.customerName}`,
    `- Kontak WhatsApp: ${normalized.customerPhone}`,
  ];

  if (normalized.fulfillmentMethod === 'pickup') {
    lines.push('- Metode Penerimaan: Ambil langsung di toko');
    lines.push(`- Rencana Tanggal Ambil: ${formatIndonesianDate(normalized.pickupDate)} (${normalized.pickupDate})`);
  } else {
    lines.push('- Metode Penerimaan: Kirim Ekspedisi / Kurir');
    lines.push(`- Kota / Kecamatan Tujuan: ${normalized.destinationCity}`);
  }

  if (normalized.notes) {
    lines.push(`- Catatan: ${normalized.notes}`);
  }

  lines.push('', '*Rincian Pesanan*');
  summary.detailedItems.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} (${item.categoryLabel} · ${item.region} · ${item.conditionLabel}) — ${item.quantity} unit × ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}`
    );
  });

  lines.push('');
  lines.push(`*Total Unit:* ${summary.totalUnits} unit`);
  lines.push(`*Estimasi Harga Barang:* ${formatRupiah(summary.estimatedItemsTotal)}`);
  if (normalized.fulfillmentMethod === 'courier') {
    lines.push('*(Belum termasuk ongkos kirim & asuransi ekspedisi)*');
  }
  lines.push('');
  lines.push(
    'Mohon konfirmasi ketersediaan stok fisik, kondisi segel/kelengkapan kotak, dan total pembayaran akhir. Terima kasih.'
  );

  return lines.join('\n');
}

/**
 * Membentuk URL https://wa.me/<nomor>?text=<pesan> dengan encodeURIComponent penuh.
 * Mengembalikan string kosong bila nomor usaha belum terkonfigurasi valid.
 * @param {string} storeWhatsApp
 * @param {string} messageText
 * @returns {string}
 */
export function buildWhatsAppUrl(storeWhatsApp, messageText) {
  if (!isStoreWhatsAppConfigured(storeWhatsApp)) {
    return '';
  }
  const cleanStoreNumber = storeWhatsApp.trim();
  const encodedMessage = encodeURIComponent(messageText);
  return `https://wa.me/${cleanStoreNumber}?text=${encodedMessage}`;
}

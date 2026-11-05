import { STORE_CONFIG } from './config.js';

export const MIN_QUANTITY = STORE_CONFIG.minQuantity;
export const MAX_QUANTITY = STORE_CONFIG.maxQuantity;

const rupiahFormatter = new Intl.NumberFormat('id-ID');

/**
 * Memformat bilangan bulat Rupiah menjadi teks format Indonesia (contoh: Rp799.000).
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    return 'Rp0';
  }
  return `Rp${rupiahFormatter.format(amount)}`;
}

/**
 * Mengambil tanggal hari ini dari komponen kalender lokal perangkat (YYYY-MM-DD)
 * tanpa menggunakan toISOString() agar bebas pergeseran zona waktu.
 * @param {Date} [now]
 * @returns {string}
 */
export function getLocalTodayString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mem-parse string YYYY-MM-DD dan memvalidasi komponen kalendernya (termasuk tahun kabisat)
 * menggunakan Date.UTC(year, month - 1, day).
 * @param {string} dateStr
 * @returns {{ year: number, month: number, day: number, utcMs: number } | null}
 */
export function parseCalendarDate(dateStr) {
  if (typeof dateStr !== 'string') {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const utcMs = Date.UTC(year, month - 1, day);
  const check = new Date(utcMs);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, utcMs };
}

/**
 * Memvalidasi tanggal rencana pengambilan di toko (minimal hari ini pada kalender lokal,
 * maksimal 30 hari kalender ke depan agar jadwal realistis).
 * @param {string} dateStr
 * @param {Date} [now]
 * @returns {{ valid: boolean, error: string, daysFromToday?: number }}
 */
export function validatePickupDate(dateStr, now = new Date()) {
  if (typeof dateStr !== 'string' || dateStr.trim() === '') {
    return {
      valid: false,
      error: 'Pilih tanggal rencana pengambilan di toko.',
    };
  }

  const parsedTarget = parseCalendarDate(dateStr);
  if (!parsedTarget) {
    return {
      valid: false,
      error: 'Format tanggal pengambilan tidak valid. Gunakan kalender yang tersedia.',
    };
  }

  const todayStr = getLocalTodayString(now);
  const parsedToday = parseCalendarDate(todayStr);
  const diffDays = Math.round((parsedTarget.utcMs - parsedToday.utcMs) / 86400000);

  if (diffDays < 0) {
    return {
      valid: false,
      error: 'Tanggal pengambilan tidak boleh sebelum hari ini.',
    };
  }

  if (diffDays > 30) {
    return {
      valid: false,
      error: 'Tanggal rencana pengambilan maksimal 30 hari ke depan.',
    };
  }

  return {
    valid: true,
    error: '',
    daysFromToday: diffDays,
  };
}

/**
 * Memformat YYYY-MM-DD menjadi tampilan tanggal Indonesia yang mudah dibaca.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatIndonesianDate(dateStr) {
  const parsed = parseCalendarDate(dateStr);
  if (!parsed) {
    return '';
  }
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${parsed.day} ${monthNames[parsed.month - 1]} ${parsed.year}`;
}

/**
 * Memeriksa apakah nilai jumlah merupakan bilangan bulat dalam batas teknis 1–99.
 * @param {unknown} quantity
 * @returns {boolean}
 */
export function isValidQuantity(quantity) {
  return (
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity >= MIN_QUANTITY &&
    quantity <= MAX_QUANTITY
  );
}

/**
 * Mencari produk pada katalog berdasarkan ID.
 * @param {readonly Array<object>} catalog
 * @param {string} productId
 * @returns {object | undefined}
 */
export function findProductById(catalog, productId) {
  if (typeof productId !== 'string' || !Array.isArray(catalog)) {
    return undefined;
  }
  return catalog.find((item) => item.id === productId);
}

/**
 * Menambah produk ke keranjang atau menggabungkan jumlahnya bila ID sudah ada.
 * Mengembalikan objek hasil baru tanpa memutasi array asal.
 * @param {Array<{ productId: string, quantity: number }>} items
 * @param {string} productId
 * @param {readonly Array<object>} catalog
 * @param {number} [delta=1]
 * @returns {{ items: Array<{ productId: string, quantity: number }>, added: boolean, capped: boolean, error: string }}
 */
export function addItemToCart(items, productId, catalog, delta = 1) {
  const product = findProductById(catalog, productId);
  if (!product) {
    return {
      items: [...items],
      added: false,
      capped: false,
      error: 'Produk tidak ditemukan pada katalog.',
    };
  }

  if (!Number.isInteger(delta) || delta < 1) {
    return {
      items: [...items],
      added: false,
      capped: false,
      error: 'Jumlah penambahan tidak valid.',
    };
  }

  const existingIndex = items.findIndex((entry) => entry.productId === productId);
  if (existingIndex === -1) {
    const initialQty = Math.min(MAX_QUANTITY, delta);
    return {
      items: [...items, { productId, quantity: initialQty }],
      added: true,
      capped: delta > MAX_QUANTITY,
      error: '',
    };
  }

  const currentQty = items[existingIndex].quantity;
  const rawNext = currentQty + delta;
  const capped = rawNext > MAX_QUANTITY;
  const nextQty = Math.min(MAX_QUANTITY, rawNext);

  const nextItems = items.map((entry, idx) =>
    idx === existingIndex ? { productId, quantity: nextQty } : { ...entry }
  );

  return {
    items: nextItems,
    added: nextQty > currentQty,
    capped,
    error: capped ? `Batas teknis per judul adalah ${MAX_QUANTITY} unit.` : '',
  };
}

/**
 * Mengubah jumlah barang tertentu pada keranjang dengan validasi bilangan bulat 1–99.
 * @param {Array<{ productId: string, quantity: number }>} items
 * @param {string} productId
 * @param {number} nextQuantity
 * @param {readonly Array<object>} catalog
 * @returns {{ items: Array<{ productId: string, quantity: number }>, valid: boolean, error: string }}
 */
export function setCartItemQuantity(items, productId, nextQuantity, catalog) {
  const product = findProductById(catalog, productId);
  if (!product) {
    return {
      items: [...items],
      valid: false,
      error: 'Produk tidak dikenal pada katalog.',
    };
  }

  if (!isValidQuantity(nextQuantity)) {
    return {
      items: [...items],
      valid: false,
      error: `Jumlah harus berupa angka bulat antara ${MIN_QUANTITY} hingga ${MAX_QUANTITY} unit.`,
    };
  }

  const exists = items.some((entry) => entry.productId === productId);
  if (!exists) {
    return {
      items: [...items, { productId, quantity: nextQuantity }],
      valid: true,
      error: '',
    };
  }

  const nextItems = items.map((entry) =>
    entry.productId === productId ? { productId, quantity: nextQuantity } : { ...entry }
  );

  return {
    items: nextItems,
    valid: true,
    error: '',
  };
}

/**
 * Menghapus satu jenis barang dari keranjang berdasarkan ID.
 * @param {Array<{ productId: string, quantity: number }>} items
 * @param {string} productId
 * @returns {Array<{ productId: string, quantity: number }>}
 */
export function removeCartItem(items, productId) {
  return items
    .filter((entry) => entry.productId !== productId)
    .map((entry) => ({ ...entry }));
}

/**
 * Menghitung ulang rincian keranjang menggunakan harga katalog resmi terkini.
 * Harga dari penyimpanan lokal tidak pernah digunakan.
 * @param {Array<{ productId: string, quantity: number }>} items
 * @param {readonly Array<object>} catalog
 */
export function calculateCartSummary(items, catalog) {
  const detailedItems = [];
  let totalUnits = 0;
  let estimatedItemsTotal = 0;

  for (const entry of items) {
    if (!entry || typeof entry.productId !== 'string' || !isValidQuantity(entry.quantity)) {
      continue;
    }
    const product = findProductById(catalog, entry.productId);
    if (!product || !Number.isSafeInteger(product.unitPrice) || product.unitPrice < 0) {
      continue;
    }
    const subtotal = product.unitPrice * entry.quantity;
    totalUnits += entry.quantity;
    estimatedItemsTotal += subtotal;
    detailedItems.push({
      productId: product.id,
      name: product.name,
      categoryLabel: product.categoryLabel,
      conditionLabel: product.conditionLabel,
      region: product.region,
      unitPrice: product.unitPrice,
      quantity: entry.quantity,
      subtotal,
    });
  }

  return {
    detailedItems,
    distinctCount: detailedItems.length,
    totalUnits,
    estimatedItemsTotal,
  };
}

/**
 * Menyaring produk berdasarkan kata kunci pencarian, kategori platform, dan kondisi fisik.
 * @param {readonly Array<object>} catalog
 * @param {{ query?: string, category?: string, condition?: string }} filters
 * @returns {Array<object>}
 */
export function filterCatalogProducts(catalog, filters = {}) {
  const normalizedQuery = typeof filters.query === 'string'
    ? filters.query.trim().toLowerCase()
    : '';
  const selectedCategory = typeof filters.category === 'string' && filters.category !== ''
    ? filters.category
    : 'all';
  const selectedCondition = typeof filters.condition === 'string' && filters.condition !== ''
    ? filters.condition
    : 'all';

  return catalog.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    if (selectedCondition !== 'all' && product.conditionId !== selectedCondition) {
      return false;
    }
    if (normalizedQuery === '') {
      return true;
    }
    const searchable = [
      product.name,
      product.categoryLabel,
      product.genre,
      product.region,
      product.conditionLabel,
      product.specification,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

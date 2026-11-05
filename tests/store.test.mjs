import test from 'node:test';
import assert from 'node:assert/strict';

import { STORE_CONFIG } from '../js/config.js';
import { CATEGORIES, CONDITIONS, PRODUCTS } from '../js/data.js';
import {
  MIN_QUANTITY,
  MAX_QUANTITY,
  addItemToCart,
  calculateCartSummary,
  filterCatalogProducts,
  formatRupiah,
  parseCalendarDate,
  removeCartItem,
  setCartItemQuantity,
  validatePickupDate,
} from '../js/cart.js';
import {
  loadCartDraft,
  sanitizeStoredDraft,
  saveCartDraft,
} from '../js/storage.js';
import {
  buildWhatsAppDraftMessage,
  buildWhatsAppUrl,
  isStoreWhatsAppConfigured,
  normalizeContactPhone,
  validateCheckoutSubmission,
} from '../js/checkout.js';

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    dump() {
      return Object.fromEntries(map.entries());
    },
  };
}

test('1. Integritas katalog produk dan kategori platform', () => {
  assert.equal(PRODUCTS.length, 20);

  const ids = new Set(PRODUCTS.map((p) => p.id));
  assert.equal(ids.size, PRODUCTS.length, 'Seluruh ID produk harus unik');

  const validCategoryIds = new Set(
    CATEGORIES.filter((c) => c.id !== 'all').map((c) => c.id)
  );
  assert.deepEqual([...validCategoryIds], ['ps5-disc', 'switch-1', 'switch-2']);

  const validConditionIds = new Set(
    CONDITIONS.filter((c) => c.id !== 'all').map((c) => c.id)
  );

  for (const product of PRODUCTS) {
    assert.ok(validCategoryIds.has(product.category));
    assert.ok(validConditionIds.has(product.conditionId));
    assert.equal(Number.isSafeInteger(product.unitPrice), true);
    assert.ok(product.unitPrice > 0);
    assert.ok(product.image.startsWith('./assets/images/'));
    assert.ok(product.imageAlt.length >= 10);
  }
});

test('2. Pencarian dan penyaringan gabungan platform serta kondisi', () => {
  const ps5Only = filterCatalogProducts(PRODUCTS, { category: 'ps5-disc' });
  assert.equal(ps5Only.length, 12);

  const sw2Preowned = filterCatalogProducts(PRODUCTS, {
    category: 'switch-2',
    condition: 'preowned',
  });
  assert.equal(sw2Preowned.length, 1);
  assert.equal(sw2Preowned[0].id, 'nsw2-zelda-totk-s2e');

  const zeldaAcrossPlatforms = filterCatalogProducts(PRODUCTS, {
    query: 'zelda',
    category: 'all',
  });
  assert.equal(zeldaAcrossPlatforms.length, 2);

  const emptySearch = filterCatalogProducts(PRODUCTS, {
    query: 'judul-tidak-ada-xyz',
    category: 'switch-1',
  });
  assert.equal(emptySearch.length, 0);
});

test('3. Validasi kalender lintas bulan, tahun, dan tahun kabisat', () => {
  assert.equal(parseCalendarDate('2028-02-29') !== null, true, '2028 adalah tahun kabisat');
  assert.equal(parseCalendarDate('2026-02-29'), null, '2026 bukan tahun kabisat');
  assert.equal(parseCalendarDate('2026-11-31'), null, 'November hanya 30 hari');

  const fixedNow = new Date(2026, 10, 3, 20, 15, 0); // 3 November 2026 lokal
  assert.equal(validatePickupDate('2026-11-03', fixedNow).valid, true);
  assert.equal(validatePickupDate('2026-11-02', fixedNow).valid, false);
  assert.equal(validatePickupDate('2026-12-01', fixedNow).valid, true);
  assert.equal(validatePickupDate('2026-12-20', fixedNow).valid, false, 'Melebihi 30 hari');
});

test('4. Manipulasi keranjang, penggabungan barang sama, batas 1-99, dan akurasi Rupiah', () => {
  let items = [];
  // 2x Astro Bot (Rp799.000) + 1x Mario Kart World Switch 2 (Rp989.000) = Rp2.587.000
  items = addItemToCart(items, 'ps5-astro-bot', PRODUCTS, 1).items;
  items = addItemToCart(items, 'ps5-astro-bot', PRODUCTS, 1).items;
  items = addItemToCart(items, 'nsw2-mario-kart-world', PRODUCTS, 1).items;

  assert.equal(items.length, 2, 'Produk dengan ID sama digabung satu baris');
  const summary = calculateCartSummary(items, PRODUCTS);
  assert.equal(summary.totalUnits, 3);
  assert.equal(summary.estimatedItemsTotal, 799000 * 2 + 989000);
  assert.equal(formatRupiah(summary.estimatedItemsTotal), 'Rp2.587.000');

  // Penolakan jumlah tidak valid
  const zeroRes = setCartItemQuantity(items, 'ps5-astro-bot', 0, PRODUCTS);
  assert.equal(zeroRes.valid, false);

  const overRes = setCartItemQuantity(items, 'ps5-astro-bot', 100, PRODUCTS);
  assert.equal(overRes.valid, false);

  const maxRes = setCartItemQuantity(items, 'ps5-astro-bot', MAX_QUANTITY, PRODUCTS);
  assert.equal(maxRes.valid, true);
  assert.equal(maxRes.items[0].quantity, 99);

  const afterRemove = removeCartItem(maxRes.items, 'ps5-astro-bot');
  assert.equal(afterRemove.length, 1);
  assert.equal(afterRemove[0].productId, 'nsw2-mario-kart-world');
  assert.equal(MIN_QUANTITY, 1);
});

test('5. Pemulihan localStorage, penolakan manipulasi harga, dan penghapusan tanggal lewat', () => {
  const fixedNow = new Date(2026, 10, 10, 9, 0, 0); // 10 Nov 2026

  // JSON rusak harus dipulihkan aman tanpa crash
  const brokenStorage = createMemoryStorage({
    [STORE_CONFIG.storageKey]: '{broken-json',
  });
  const recovered = loadCartDraft(PRODUCTS, brokenStorage, fixedNow);
  assert.equal(recovered.corruptedRecovered, true);
  assert.deepEqual(recovered.draft.items, []);

  // Data manipulasi harga, ID palsu, dan tanggal masa lalu
  const tamperedPayload = {
    schemaVersion: 1,
    items: [
      { productId: 'nsw1-zelda-totk', quantity: 2, unitPrice: 1 },
      { productId: 'id-palsu', quantity: 5 },
      { productId: 'ps5-astro-bot', quantity: -3 },
    ],
    fulfillmentMethod: 'pickup',
    pickupDate: '2026-11-01', // Sudah lewat dari 10 Nov 2026
    customerName: 'Harus Dibuang',
    customerPhone: '08123456789',
  };

  const sanitized = sanitizeStoredDraft(tamperedPayload, PRODUCTS, fixedNow);
  assert.equal(sanitized.expiredDateCleared, true);
  assert.equal(sanitized.draft.pickupDate, '');
  assert.equal(sanitized.draft.items.length, 1);
  assert.deepEqual(sanitized.draft.items[0], { productId: 'nsw1-zelda-totk', quantity: 2 });
  assert.equal('customerName' in sanitized.draft, false);

  // Perhitungan tetap menggunakan harga katalog resmi Rp749.000 x 2 = Rp1.498.000
  const calc = calculateCartSummary(sanitized.draft.items, PRODUCTS);
  assert.equal(calc.estimatedItemsTotal, 1498000);
});

test('6. Privasi penyimpanan: nama, nomor kontak, dan alamat tidak disimpan di localStorage', () => {
  const mem = createMemoryStorage();
  saveCartDraft(
    {
      items: [{ productId: 'nsw2-donkey-kong-bananza', quantity: 1 }],
      fulfillmentMethod: 'courier',
      pickupDate: '',
      customerName: 'Budi Raharjo',
      customerPhone: '081299998888',
      destinationCity: 'Kebayoran Baru, Jakarta Selatan',
    },
    mem
  );

  const rawSaved = mem.getItem(STORE_CONFIG.storageKey);
  assert.equal(rawSaved.includes('Budi Raharjo'), false);
  assert.equal(rawSaved.includes('081299998888'), false);
  assert.equal(rawSaved.includes('Kebayoran Baru'), false);
});

test('7. Validasi nomor kontak WhatsApp dan formulir pemesanan', () => {
  assert.equal(normalizeContactPhone('0812-3456-7890').valid, true);
  assert.equal(normalizeContactPhone('+62 812 (3456) 7890').normalized, '6281234567890');
  assert.equal(normalizeContactPhone('08123').valid, false, 'Kurang dari 8 digit');
  assert.equal(normalizeContactPhone('0812abc56789').valid, false, 'Mengandung huruf');

  const fixedNow = new Date(2026, 10, 3, 12, 0, 0);
  const invalidNameRes = validateCheckoutSubmission(
    {
      items: [{ productId: 'ps5-astro-bot', quantity: 1 }],
      fulfillmentMethod: 'pickup',
      pickupDate: '2026-11-05',
      customerName: ' A ',
      customerPhone: '081234567890',
    },
    PRODUCTS,
    fixedNow
  );
  assert.equal(invalidNameRes.valid, false);
  assert.equal(invalidNameRes.firstInvalidField, 'customerName');
});

test('8. Pembentukan draf pesan dan encoding URL WhatsApp', () => {
  const fixedNow = new Date(2026, 10, 3, 12, 0, 0);
  const validSubmission = validateCheckoutSubmission(
    {
      items: [
        { productId: 'ps5-astro-bot', quantity: 1 },
        { productId: 'nsw2-mario-kart-world', quantity: 1 },
      ],
      fulfillmentMethod: 'courier',
      destinationCity: 'Coblong, Kota Bandung',
      customerName: 'Siti & Dika',
      customerPhone: '+62 812-9876-5432',
      notes: 'Mohon packing bubble tebal',
    },
    PRODUCTS,
    fixedNow
  );

  assert.equal(validSubmission.valid, true);

  const draft = buildWhatsAppDraftMessage({
    storeName: 'Kasetia Game',
    summary: validSubmission.summary,
    normalized: validSubmission.normalized,
  });

  assert.ok(draft.includes('Siti & Dika'));
  assert.ok(draft.includes('6281298765432'));
  assert.ok(draft.includes('Astro Bot'));
  assert.ok(draft.includes('Mario Kart World'));
  assert.ok(draft.includes('Rp1.788.000'));
  assert.ok(draft.includes('konfirmasi ketersediaan stok fisik'));

  // Saat nomor usaha kosong sesuai SOP default, URL kosong dan status nonaktif
  assert.equal(isStoreWhatsAppConfigured(''), false);
  assert.equal(buildWhatsAppUrl('', draft), '');

  // Saat nomor usaha valid di memori pengujian, URL ter-encode penuh
  const url = buildWhatsAppUrl('6281122334455', draft);
  assert.ok(url.startsWith('https://wa.me/6281122334455?text='));
  assert.ok(url.includes('Siti%20%26%20Dika'));
});

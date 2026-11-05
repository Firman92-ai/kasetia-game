import { STORE_CONFIG } from './config.js';
import {
  MIN_QUANTITY,
  MAX_QUANTITY,
  findProductById,
  validatePickupDate,
} from './cart.js';

export const ALLOWED_FULFILLMENT_METHODS = Object.freeze(['pickup', 'courier']);

/**
 * Membuat state draf awal yang bersih.
 */
export function createEmptyDraft() {
  return {
    schemaVersion: STORE_CONFIG.schemaVersion,
    items: [],
    fulfillmentMethod: 'pickup',
    pickupDate: '',
  };
}

/**
 * Memvalidasi dan menyanitasi objek draf dari localStorage.
 * - Mengabaikan produk yang tidak dikenal atau jumlah tidak valid.
 * - Menggabungkan duplikasi ID produk dan membatasi jumlah pada rentang 1–99.
 * - Menghapus tanggal pengambilan yang sudah lewat.
 * - Membuang seluruh properti tak dikenal (seperti harga manipulasi atau data kontak).
 *
 * @param {unknown} rawData
 * @param {readonly Array<object>} catalog
 * @param {Date} [now]
 */
export function sanitizeStoredDraft(rawData, catalog, now = new Date()) {
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
    return {
      draft: createEmptyDraft(),
      resetReason: 'invalid-root',
      expiredDateCleared: false,
    };
  }

  if (rawData.schemaVersion !== STORE_CONFIG.schemaVersion) {
    return {
      draft: createEmptyDraft(),
      resetReason: 'unsupported-version',
      expiredDateCleared: false,
    };
  }

  const mergedQuantities = new Map();
  if (Array.isArray(rawData.items)) {
    for (const entry of rawData.items) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const { productId, quantity } = entry;
      if (typeof productId !== 'string' || !findProductById(catalog, productId)) {
        continue;
      }
      if (
        typeof quantity !== 'number' ||
        !Number.isInteger(quantity) ||
        quantity < MIN_QUANTITY ||
        quantity > MAX_QUANTITY
      ) {
        continue;
      }
      const prev = mergedQuantities.get(productId) || 0;
      mergedQuantities.set(productId, Math.min(MAX_QUANTITY, prev + quantity));
    }
  }

  const sanitizedItems = Array.from(mergedQuantities.entries()).map(
    ([productId, quantity]) => ({ productId, quantity })
  );

  const fulfillmentMethod = ALLOWED_FULFILLMENT_METHODS.includes(rawData.fulfillmentMethod)
    ? rawData.fulfillmentMethod
    : 'pickup';

  let pickupDate = '';
  let expiredDateCleared = false;

  if (typeof rawData.pickupDate === 'string' && rawData.pickupDate.trim() !== '') {
    const check = validatePickupDate(rawData.pickupDate.trim(), now);
    if (check.valid) {
      pickupDate = rawData.pickupDate.trim();
    } else {
      expiredDateCleared = true;
    }
  }

  return {
    draft: {
      schemaVersion: STORE_CONFIG.schemaVersion,
      items: sanitizedItems,
      fulfillmentMethod,
      pickupDate,
    },
    resetReason: null,
    expiredDateCleared,
  };
}

/**
 * Membaca draf keranjang secara aman dari storage (default window.localStorage).
 * @param {readonly Array<object>} catalog
 * @param {Storage | null} [storage]
 * @param {Date} [now]
 */
export function loadCartDraft(
  catalog,
  storage = typeof window !== 'undefined' ? window.localStorage : null,
  now = new Date()
) {
  if (!storage) {
    return {
      draft: createEmptyDraft(),
      storageAvailable: false,
      expiredDateCleared: false,
      corruptedRecovered: false,
    };
  }

  try {
    const rawText = storage.getItem(STORE_CONFIG.storageKey);
    if (rawText === null || rawText.trim() === '') {
      return {
        draft: createEmptyDraft(),
        storageAvailable: true,
        expiredDateCleared: false,
        corruptedRecovered: false,
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      storage.removeItem(STORE_CONFIG.storageKey);
      return {
        draft: createEmptyDraft(),
        storageAvailable: true,
        expiredDateCleared: false,
        corruptedRecovered: true,
      };
    }

    const result = sanitizeStoredDraft(parsed, catalog, now);
    if (result.resetReason !== null || result.expiredDateCleared) {
      storage.setItem(STORE_CONFIG.storageKey, JSON.stringify(result.draft));
    }

    return {
      draft: result.draft,
      storageAvailable: true,
      expiredDateCleared: result.expiredDateCleared,
      corruptedRecovered: result.resetReason !== null,
    };
  } catch {
    return {
      draft: createEmptyDraft(),
      storageAvailable: false,
      expiredDateCleared: false,
      corruptedRecovered: false,
    };
  }
}

/**
 * Menyimpan hanya bagian state yang diizinkan (schemaVersion, items, fulfillmentMethod, pickupDate).
 * Data pribadi pembeli (nama, nomor WhatsApp, kota tujuan, catatan) TIDAK PERNAH disimpan.
 *
 * @param {{ items: Array<{ productId: string, quantity: number }>, fulfillmentMethod: string, pickupDate: string }} state
 * @param {Storage | null} [storage]
 * @returns {{ saved: boolean }}
 */
export function saveCartDraft(
  state,
  storage = typeof window !== 'undefined' ? window.localStorage : null
) {
  if (!storage) {
    return { saved: false };
  }

  const safePayload = {
    schemaVersion: STORE_CONFIG.schemaVersion,
    items: Array.isArray(state.items)
      ? state.items.map((item) => ({
          productId: String(item.productId),
          quantity: Number(item.quantity),
        }))
      : [],
    fulfillmentMethod: ALLOWED_FULFILLMENT_METHODS.includes(state.fulfillmentMethod)
      ? state.fulfillmentMethod
      : 'pickup',
    pickupDate: typeof state.pickupDate === 'string' ? state.pickupDate.trim() : '',
  };

  try {
    storage.setItem(STORE_CONFIG.storageKey, JSON.stringify(safePayload));
    return { saved: true };
  } catch {
    return { saved: false };
  }
}

import { STORE_CONFIG } from './config.js';
import { CATEGORIES, CONDITIONS, PRODUCTS } from './data.js';
import {
  MIN_QUANTITY,
  MAX_QUANTITY,
  addItemToCart,
  calculateCartSummary,
  filterCatalogProducts,
  formatIndonesianDate,
  formatRupiah,
  getLocalTodayString,
  removeCartItem,
  setCartItemQuantity,
} from './cart.js';
import { loadCartDraft, saveCartDraft } from './storage.js';
import {
  buildWhatsAppDraftMessage,
  buildWhatsAppUrl,
  isStoreWhatsAppConfigured,
  validateCheckoutSubmission,
} from './checkout.js';

const FALLBACK_IMAGE_PATH = './assets/images/fallback-media.svg';

const appState = {
  items: [],
  fulfillmentMethod: 'pickup',
  pickupDate: '',
  searchQuery: '',
  selectedCategory: 'all',
  selectedCondition: 'all',
  storageAvailable: true,
  reviewedSubmission: null,
};

const dom = {};

function cacheDomElements() {
  dom.headerCartLink = document.getElementById('header-cart-link');
  dom.mobileCartJump = document.getElementById('mobile-cart-jump');
  dom.searchInput = document.getElementById('catalog-search');
  dom.clearSearchBtn = document.getElementById('clear-search-btn');
  dom.categoryTabs = document.getElementById('category-tabs');
  dom.conditionSelect = document.getElementById('condition-filter');
  dom.catalogCount = document.getElementById('catalog-result-count');
  dom.catalogGrid = document.getElementById('catalog-grid');
  dom.catalogEmpty = document.getElementById('catalog-empty');
  dom.resetFilterBtn = document.getElementById('reset-filter-btn');

  dom.liveStatus = document.getElementById('cart-live-status');
  dom.storageNotice = document.getElementById('storage-warning');
  dom.cartItemsList = document.getElementById('cart-items-list');
  dom.cartEmptyMsg = document.getElementById('cart-empty-message');
  dom.cartUnitBadge = document.getElementById('cart-total-units');
  dom.cartError = document.getElementById('error-cart');

  dom.fulfillmentPickupRadio = document.getElementById('fulfillment-pickup');
  dom.fulfillmentCourierRadio = document.getElementById('fulfillment-courier');
  dom.pickupDateGroup = document.getElementById('pickup-date-group');
  dom.pickupDateInput = document.getElementById('pickup-date');
  dom.pickupDateError = document.getElementById('error-pickupDate');
  dom.courierCityGroup = document.getElementById('courier-city-group');
  dom.destinationCityInput = document.getElementById('destination-city');
  dom.destinationCityError = document.getElementById('error-destinationCity');

  dom.estimatedTotalValue = document.getElementById('estimated-total-value');
  dom.fulfillmentCostNote = document.getElementById('fulfillment-cost-note');

  dom.checkoutForm = document.getElementById('checkout-form');
  dom.customerNameInput = document.getElementById('customer-name');
  dom.customerNameError = document.getElementById('error-customerName');
  dom.customerPhoneInput = document.getElementById('customer-phone');
  dom.customerPhoneError = document.getElementById('error-customerPhone');
  dom.customerNotesInput = document.getElementById('customer-notes');
  dom.customerNotesError = document.getElementById('error-notes');
  dom.reviewOrderBtn = document.getElementById('review-order-btn');

  dom.reviewPanel = document.getElementById('order-review-panel');
  dom.reviewInvalidatedNotice = document.getElementById('review-invalidated-notice');
  dom.reviewMetaList = document.getElementById('review-meta-list');
  dom.reviewItemsList = document.getElementById('review-items-list');
  dom.reviewTotalText = document.getElementById('review-total-text');
  dom.reviewDraftPreview = document.getElementById('review-draft-preview');
  dom.editOrderBtn = document.getElementById('edit-order-btn');
  dom.copyDraftBtn = document.getElementById('copy-draft-btn');
  dom.whatsappLink = document.getElementById('whatsapp-submit-link');
  dom.whatsappDisabledMsg = document.getElementById('whatsapp-disabled-msg');

  dom.storeAddressText = document.getElementById('store-address-text');
  dom.storeAddressExampleNote = document.getElementById('store-address-example-note');
  dom.storeHoursText = document.getElementById('store-hours-text');
  dom.storePickupPolicy = document.getElementById('store-pickup-policy');
  dom.storeShippingPolicy = document.getElementById('store-shipping-policy');
}

function announceStatus(message) {
  if (!dom.liveStatus) {
    return;
  }
  dom.liveStatus.textContent = message;
}

function persistState() {
  const result = saveCartDraft({
    items: appState.items,
    fulfillmentMethod: appState.fulfillmentMethod,
    pickupDate: appState.pickupDate,
  });

  if (!result.saved) {
    appState.storageAvailable = false;
    if (dom.storageNotice) {
      dom.storageNotice.hidden = false;
      dom.storageNotice.textContent =
        'Keranjang tetap dapat digunakan selama sesi ini, tetapi belum bisa disimpan pada browser ini.';
    }
  } else if (dom.storageNotice && appState.storageAvailable) {
    dom.storageNotice.hidden = true;
  }
}

function invalidateReviewIfNeeded(reasonMessage = '') {
  if (appState.reviewedSubmission !== null) {
    appState.reviewedSubmission = null;
    if (dom.reviewPanel) {
      dom.reviewPanel.hidden = true;
    }
    if (dom.reviewInvalidatedNotice) {
      dom.reviewInvalidatedNotice.hidden = false;
      dom.reviewInvalidatedNotice.textContent =
        reasonMessage ||
        'Rincian keranjang atau metode penerimaan telah berubah. Silakan klik "Periksa Pesanan" kembali untuk memperbarui ringkasan.';
    }
  }
}

function setFieldError(inputEl, errorEl, message) {
  if (!errorEl) {
    return;
  }
  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    if (inputEl) {
      inputEl.setAttribute('aria-invalid', 'true');
    }
  } else {
    errorEl.textContent = '';
    errorEl.hidden = true;
    if (inputEl) {
      inputEl.removeAttribute('aria-invalid');
    }
  }
}

function clearAllFormErrors() {
  setFieldError(null, dom.cartError, '');
  setFieldError(dom.pickupDateInput, dom.pickupDateError, '');
  setFieldError(dom.destinationCityInput, dom.destinationCityError, '');
  setFieldError(dom.customerNameInput, dom.customerNameError, '');
  setFieldError(dom.customerPhoneInput, dom.customerPhoneError, '');
  setFieldError(dom.customerNotesInput, dom.customerNotesError, '');
}

function renderStoreIdentity() {
  if (dom.storeAddressText) {
    dom.storeAddressText.textContent = STORE_CONFIG.address;
  }
  if (dom.storeAddressExampleNote) {
    dom.storeAddressExampleNote.hidden = !STORE_CONFIG.addressIsExample;
  }
  if (dom.storeHoursText) {
    dom.storeHoursText.textContent = STORE_CONFIG.operationalHours;
  }
  if (dom.storePickupPolicy) {
    dom.storePickupPolicy.textContent = STORE_CONFIG.pickupPolicy;
  }
  if (dom.storeShippingPolicy) {
    dom.storeShippingPolicy.textContent = STORE_CONFIG.shippingPolicy;
  }
}

function renderCategoryControls() {
  if (!dom.categoryTabs) {
    return;
  }
  dom.categoryTabs.textContent = '';

  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isActive = appState.selectedCategory === cat.id;
    btn.className = isActive ? 'filter-tab is-active' : 'filter-tab';
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.textContent = cat.label;
    btn.addEventListener('click', () => {
      appState.selectedCategory = cat.id;
      renderCategoryControls();
      renderCatalog();
    });
    dom.categoryTabs.appendChild(btn);
  });
}

function renderConditionOptions() {
  if (!dom.conditionSelect) {
    return;
  }
  dom.conditionSelect.textContent = '';
  CONDITIONS.forEach((cond) => {
    const opt = document.createElement('option');
    opt.value = cond.id;
    opt.textContent = cond.label;
    opt.selected = appState.selectedCondition === cond.id;
    dom.conditionSelect.appendChild(opt);
  });
}

function attachSafeImage(imgEl, src, alt, isEager = false) {
  imgEl.alt = alt;
  imgEl.width = 600;
  imgEl.height = 450;
  imgEl.decoding = 'async';
  imgEl.loading = isEager ? 'eager' : 'lazy';
  imgEl.referrerPolicy = 'no-referrer';
  imgEl.addEventListener(
    'error',
    () => {
      if (!imgEl.dataset.fallbackApplied) {
        imgEl.dataset.fallbackApplied = 'true';
        imgEl.src = FALLBACK_IMAGE_PATH;
      }
    },
    { once: true }
  );
  imgEl.src = src;
}

function createProductCard(product, index) {
  const article = document.createElement('article');
  article.className = 'product-card';

  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'product-media';
  const img = document.createElement('img');
  attachSafeImage(img, product.image, product.imageAlt, index < 3);
  mediaWrap.appendChild(img);

  const body = document.createElement('div');
  body.className = 'product-body';

  // Clean unboxed metadata per Zero-Pill design standard
  const metaLine = document.createElement('p');
  metaLine.className = 'product-meta';
  metaLine.textContent = `${product.categoryLabel} · ${product.region} · ${product.conditionLabel}`;

  const title = document.createElement('h3');
  title.className = 'product-title';
  title.textContent = product.name;

  const spec = document.createElement('p');
  spec.className = 'product-spec';
  spec.textContent = `${product.genre} · ${product.specification}`;

  const desc = document.createElement('p');
  desc.className = 'product-desc';
  desc.textContent = product.description;

  const compat = document.createElement('p');
  compat.className = 'product-compat';
  const compatStrong = document.createElement('strong');
  compatStrong.textContent = 'Kompatibilitas: ';
  compat.appendChild(compatStrong);
  compat.appendChild(document.createTextNode(product.compatibility));

  const footer = document.createElement('div');
  footer.className = 'product-footer';

  const priceBlock = document.createElement('div');
  priceBlock.className = 'product-price-block';
  const priceValue = document.createElement('span');
  priceValue.className = 'product-price';
  priceValue.textContent = formatRupiah(product.unitPrice);
  const priceUnit = document.createElement('span');
  priceUnit.className = 'product-unit';
  priceUnit.textContent = ' / unit';
  priceBlock.append(priceValue, priceUnit);

  const existingEntry = appState.items.find((entry) => entry.productId === product.id);
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-primary product-add-btn';
  addBtn.textContent = existingEntry
    ? `Tambah Lagi (${existingEntry.quantity} di keranjang)`
    : 'Tambah ke Keranjang';
  addBtn.setAttribute('aria-label', `Tambah ${product.name} ke keranjang`);
  addBtn.addEventListener('click', () => {
    handleAddProduct(product.id);
  });

  footer.append(priceBlock, addBtn);
  body.append(metaLine, title, spec, desc, compat, footer);
  article.append(mediaWrap, body);

  return article;
}

function renderCatalog() {
  if (!dom.catalogGrid) {
    return;
  }

  const filtered = filterCatalogProducts(PRODUCTS, {
    query: appState.searchQuery,
    category: appState.selectedCategory,
    condition: appState.selectedCondition,
  });

  if (dom.clearSearchBtn) {
    dom.clearSearchBtn.hidden = appState.searchQuery.trim() === '';
  }

  if (dom.catalogCount) {
    dom.catalogCount.textContent = `Menampilkan ${filtered.length} dari ${PRODUCTS.length} judul fisik`;
  }

  dom.catalogGrid.textContent = '';

  if (filtered.length === 0) {
    dom.catalogGrid.hidden = true;
    if (dom.catalogEmpty) {
      dom.catalogEmpty.hidden = false;
    }
    return;
  }

  dom.catalogGrid.hidden = false;
  if (dom.catalogEmpty) {
    dom.catalogEmpty.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((product, idx) => {
    fragment.appendChild(createProductCard(product, idx));
  });
  dom.catalogGrid.appendChild(fragment);
}

function renderFulfillmentSection() {
  const isPickup = appState.fulfillmentMethod === 'pickup';
  if (dom.fulfillmentPickupRadio) {
    dom.fulfillmentPickupRadio.checked = isPickup;
  }
  if (dom.fulfillmentCourierRadio) {
    dom.fulfillmentCourierRadio.checked = !isPickup;
  }
  if (dom.pickupDateGroup) {
    dom.pickupDateGroup.hidden = !isPickup;
  }
  if (dom.courierCityGroup) {
    dom.courierCityGroup.hidden = isPickup;
  }

  if (dom.pickupDateInput) {
    const todayStr = getLocalTodayString();
    dom.pickupDateInput.min = todayStr;
    if (dom.pickupDateInput.value !== appState.pickupDate) {
      dom.pickupDateInput.value = appState.pickupDate;
    }
  }

  if (dom.fulfillmentCostNote) {
    dom.fulfillmentCostNote.textContent = isPickup
      ? 'Ambil di toko tidak dikenakan biaya pengiriman. Konfirmasi jadwal ambil melalui WhatsApp sebelum datang.'
      : 'Estimasi belum termasuk ongkos kirim dan asuransi ekspedisi; admin akan menginformasikan biaya kirim sesuai kota tujuan.';
  }
}

function renderCart() {
  const summary = calculateCartSummary(appState.items, PRODUCTS);

  const unitLabel = `Keranjang (${summary.totalUnits} unit)`;
  if (dom.headerCartLink) {
    dom.headerCartLink.textContent = unitLabel;
  }
  if (dom.mobileCartJump) {
    dom.mobileCartJump.textContent = `Lihat ${unitLabel}`;
  }
  if (dom.cartUnitBadge) {
    dom.cartUnitBadge.textContent = `${summary.totalUnits} unit`;
  }
  if (dom.estimatedTotalValue) {
    dom.estimatedTotalValue.textContent = formatRupiah(summary.estimatedItemsTotal);
  }

  if (!dom.cartItemsList) {
    return;
  }
  dom.cartItemsList.textContent = '';

  if (summary.detailedItems.length === 0) {
    dom.cartItemsList.hidden = true;
    if (dom.cartEmptyMsg) {
      dom.cartEmptyMsg.hidden = false;
    }
    return;
  }

  dom.cartItemsList.hidden = false;
  if (dom.cartEmptyMsg) {
    dom.cartEmptyMsg.hidden = true;
  }

  summary.detailedItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'cart-item';

    const topRow = document.createElement('div');
    topRow.className = 'cart-item-header';

    const infoWrap = document.createElement('div');
    const itemTitle = document.createElement('p');
    itemTitle.className = 'cart-item-title';
    itemTitle.textContent = item.name;

    const itemMeta = document.createElement('p');
    itemMeta.className = 'cart-item-meta';
    itemMeta.textContent = `${item.categoryLabel} · ${item.conditionLabel} · ${formatRupiah(item.unitPrice)} / unit`;
    infoWrap.append(itemTitle, itemMeta);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-text-danger';
    removeBtn.textContent = 'Hapus';
    removeBtn.setAttribute('aria-label', `Hapus ${item.name} dari keranjang`);
    removeBtn.addEventListener('click', () => {
      handleRemoveItem(item.productId, item.name);
    });

    topRow.append(infoWrap, removeBtn);

    const controlsRow = document.createElement('div');
    controlsRow.className = 'cart-item-controls';

    const stepper = document.createElement('div');
    stepper.className = 'qty-stepper';

    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'qty-btn';
    decBtn.textContent = '−';
    decBtn.disabled = item.quantity <= MIN_QUANTITY;
    decBtn.setAttribute('aria-label', `Kurangi jumlah ${item.name}`);
    decBtn.addEventListener('click', () => {
      handleQuantityChange(item.productId, item.quantity - 1);
    });

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'qty-input';
    qtyInput.min = String(MIN_QUANTITY);
    qtyInput.max = String(MAX_QUANTITY);
    qtyInput.step = '1';
    qtyInput.inputMode = 'numeric';
    qtyInput.value = String(item.quantity);
    qtyInput.setAttribute('aria-label', `Jumlah unit untuk ${item.name}`);

    const itemError = document.createElement('p');
    itemError.className = 'field-error cart-qty-error';
    itemError.id = `qty-error-${item.productId}`;
    itemError.hidden = true;
    qtyInput.setAttribute('aria-describedby', itemError.id);

    qtyInput.addEventListener('change', () => {
      const parsed = Number(qtyInput.value);
      const updateResult = setCartItemQuantity(appState.items, item.productId, parsed, PRODUCTS);
      if (!updateResult.valid) {
        setFieldError(qtyInput, itemError, updateResult.error);
        return;
      }
      setFieldError(qtyInput, itemError, '');
      appState.items = updateResult.items;
      invalidateReviewIfNeeded();
      persistState();
      renderCart();
      renderCatalog();
      announceStatus(`Jumlah ${item.name} diperbarui menjadi ${parsed} unit.`);
    });

    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'qty-btn';
    incBtn.textContent = '+';
    incBtn.disabled = item.quantity >= MAX_QUANTITY;
    incBtn.setAttribute('aria-label', `Tambah jumlah ${item.name}`);
    incBtn.addEventListener('click', () => {
      handleQuantityChange(item.productId, item.quantity + 1);
    });

    stepper.append(decBtn, qtyInput, incBtn);

    const subtotalEl = document.createElement('p');
    subtotalEl.className = 'cart-item-subtotal';
    subtotalEl.textContent = formatRupiah(item.subtotal);

    controlsRow.append(stepper, subtotalEl);
    li.append(topRow, controlsRow, itemError);
    dom.cartItemsList.appendChild(li);
  });
}

function handleAddProduct(productId) {
  const result = addItemToCart(appState.items, productId, PRODUCTS, 1);
  appState.items = result.items;
  setFieldError(null, dom.cartError, '');
  invalidateReviewIfNeeded();
  persistState();
  renderCart();
  renderCatalog();

  const product = PRODUCTS.find((p) => p.id === productId);
  if (result.capped && product) {
    announceStatus(`Jumlah ${product.name} sudah mencapai batas maksimum ${MAX_QUANTITY} unit.`);
  } else if (result.added && product) {
    announceStatus(`${product.name} ditambahkan ke keranjang.`);
  }
}

function handleQuantityChange(productId, nextQty) {
  const result = setCartItemQuantity(appState.items, productId, nextQty, PRODUCTS);
  if (!result.valid) {
    announceStatus(result.error);
    return;
  }
  appState.items = result.items;
  invalidateReviewIfNeeded();
  persistState();
  renderCart();
  renderCatalog();
}

function handleRemoveItem(productId, productName) {
  appState.items = removeCartItem(appState.items, productId);
  invalidateReviewIfNeeded();
  persistState();
  renderCart();
  renderCatalog();
  announceStatus(`${productName} dihapus dari keranjang.`);
}

function focusFirstInvalidField(fieldName) {
  const map = {
    cart: dom.searchInput,
    pickupDate: dom.pickupDateInput,
    destinationCity: dom.destinationCityInput,
    customerName: dom.customerNameInput,
    customerPhone: dom.customerPhoneInput,
    notes: dom.customerNotesInput,
  };
  const target = map[fieldName];
  if (target && typeof target.focus === 'function') {
    target.focus();
  }
}

function renderOrderReview(validationResult) {
  if (!dom.reviewPanel) {
    return;
  }

  const { summary, normalized } = validationResult;
  const draftMessage = buildWhatsAppDraftMessage({
    storeName: STORE_CONFIG.storeName,
    summary,
    normalized,
  });

  appState.reviewedSubmission = {
    summary,
    normalized,
    draftMessage,
  };

  if (dom.reviewInvalidatedNotice) {
    dom.reviewInvalidatedNotice.hidden = true;
  }

  if (dom.reviewMetaList) {
    dom.reviewMetaList.textContent = '';
    const rows = [
      ['Nama Pembeli', normalized.customerName],
      ['Nomor WhatsApp', normalized.customerPhone],
      [
        'Metode Penerimaan',
        normalized.fulfillmentMethod === 'pickup'
          ? 'Ambil langsung di toko'
          : 'Kirim Ekspedisi / Kurir',
      ],
    ];
    if (normalized.fulfillmentMethod === 'pickup') {
      rows.push(['Rencana Tanggal Ambil', formatIndonesianDate(normalized.pickupDate)]);
    } else {
      rows.push(['Kota / Kecamatan Tujuan', normalized.destinationCity]);
    }
    if (normalized.notes) {
      rows.push(['Catatan Tambahan', normalized.notes]);
    }

    rows.forEach(([label, val]) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = val;
      dom.reviewMetaList.append(dt, dd);
    });
  }

  if (dom.reviewItemsList) {
    dom.reviewItemsList.textContent = '';
    summary.detailedItems.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'review-line-item';

      const left = document.createElement('span');
      left.textContent = `${item.name} (${item.categoryLabel}) × ${item.quantity} unit`;

      const right = document.createElement('strong');
      right.className = 'tabular-nums';
      right.textContent = formatRupiah(item.subtotal);

      li.append(left, right);
      dom.reviewItemsList.appendChild(li);
    });
  }

  if (dom.reviewTotalText) {
    dom.reviewTotalText.textContent = `${formatRupiah(summary.estimatedItemsTotal)} (${summary.totalUnits} unit)`;
  }

  if (dom.reviewDraftPreview) {
    dom.reviewDraftPreview.textContent = draftMessage;
  }

  const whatsappUrl = buildWhatsAppUrl(STORE_CONFIG.whatsappNumber, draftMessage);
  if (dom.whatsappLink && dom.whatsappDisabledMsg) {
    if (isStoreWhatsAppConfigured(STORE_CONFIG.whatsappNumber) && whatsappUrl !== '') {
      dom.whatsappLink.href = whatsappUrl;
      dom.whatsappLink.classList.remove('is-disabled');
      dom.whatsappLink.removeAttribute('aria-disabled');
      dom.whatsappLink.tabIndex = 0;
      dom.whatsappDisabledMsg.hidden = true;
    } else {
      dom.whatsappLink.removeAttribute('href');
      dom.whatsappLink.classList.add('is-disabled');
      dom.whatsappLink.setAttribute('aria-disabled', 'true');
      dom.whatsappLink.tabIndex = -1;
      dom.whatsappDisabledMsg.hidden = false;
      dom.whatsappDisabledMsg.textContent =
        'Pengajuan online via WhatsApp belum tersedia saat ini. Anda dapat menyalin draf pesanan di atas atau menghubungi kontak toko yang tercantum.';
    }
  }

  dom.reviewPanel.hidden = false;
  dom.reviewPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  announceStatus('Ringkasan pesanan siap diperiksa.');
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  clearAllFormErrors();

  const validation = validateCheckoutSubmission(
    {
      items: appState.items,
      fulfillmentMethod: appState.fulfillmentMethod,
      pickupDate: dom.pickupDateInput ? dom.pickupDateInput.value : appState.pickupDate,
      destinationCity: dom.destinationCityInput ? dom.destinationCityInput.value : '',
      customerName: dom.customerNameInput ? dom.customerNameInput.value : '',
      customerPhone: dom.customerPhoneInput ? dom.customerPhoneInput.value : '',
      notes: dom.customerNotesInput ? dom.customerNotesInput.value : '',
    },
    PRODUCTS
  );

  if (!validation.valid) {
    appState.reviewedSubmission = null;
    if (dom.reviewPanel) {
      dom.reviewPanel.hidden = true;
    }

    if (validation.errors.cart) {
      setFieldError(null, dom.cartError, validation.errors.cart);
    }
    if (validation.errors.pickupDate) {
      setFieldError(dom.pickupDateInput, dom.pickupDateError, validation.errors.pickupDate);
    }
    if (validation.errors.destinationCity) {
      setFieldError(
        dom.destinationCityInput,
        dom.destinationCityError,
        validation.errors.destinationCity
      );
    }
    if (validation.errors.customerName) {
      setFieldError(dom.customerNameInput, dom.customerNameError, validation.errors.customerName);
    }
    if (validation.errors.customerPhone) {
      setFieldError(
        dom.customerPhoneInput,
        dom.customerPhoneError,
        validation.errors.customerPhone
      );
    }
    if (validation.errors.notes) {
      setFieldError(dom.customerNotesInput, dom.customerNotesError, validation.errors.notes);
    }

    focusFirstInvalidField(validation.firstInvalidField);
    announceStatus('Terdapat isian formulir yang perlu diperbaiki sebelum memeriksa pesanan.');
    return;
  }

  renderOrderReview(validation);
}

function bindEvents() {
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', () => {
      appState.searchQuery = dom.searchInput.value;
      renderCatalog();
    });
  }

  if (dom.clearSearchBtn) {
    dom.clearSearchBtn.addEventListener('click', () => {
      appState.searchQuery = '';
      if (dom.searchInput) {
        dom.searchInput.value = '';
        dom.searchInput.focus();
      }
      renderCatalog();
    });
  }

  if (dom.conditionSelect) {
    dom.conditionSelect.addEventListener('change', () => {
      appState.selectedCondition = dom.conditionSelect.value;
      renderCatalog();
    });
  }

  if (dom.resetFilterBtn) {
    dom.resetFilterBtn.addEventListener('click', () => {
      appState.searchQuery = '';
      appState.selectedCategory = 'all';
      appState.selectedCondition = 'all';
      if (dom.searchInput) {
        dom.searchInput.value = '';
      }
      renderCategoryControls();
      renderConditionOptions();
      renderCatalog();
      if (dom.searchInput) {
        dom.searchInput.focus();
      }
    });
  }

  const handleFulfillmentChange = (method) => {
    if (appState.fulfillmentMethod === method) {
      return;
    }
    appState.fulfillmentMethod = method;
    setFieldError(dom.pickupDateInput, dom.pickupDateError, '');
    setFieldError(dom.destinationCityInput, dom.destinationCityError, '');
    invalidateReviewIfNeeded();
    persistState();
    renderFulfillmentSection();
  };

  if (dom.fulfillmentPickupRadio) {
    dom.fulfillmentPickupRadio.addEventListener('change', () => {
      if (dom.fulfillmentPickupRadio.checked) {
        handleFulfillmentChange('pickup');
      }
    });
  }

  if (dom.fulfillmentCourierRadio) {
    dom.fulfillmentCourierRadio.addEventListener('change', () => {
      if (dom.fulfillmentCourierRadio.checked) {
        handleFulfillmentChange('courier');
      }
    });
  }

  if (dom.pickupDateInput) {
    dom.pickupDateInput.addEventListener('change', () => {
      appState.pickupDate = dom.pickupDateInput.value.trim();
      setFieldError(dom.pickupDateInput, dom.pickupDateError, '');
      invalidateReviewIfNeeded();
      persistState();
    });
  }

  const invalidateOnTransientInput = (inputEl, errorEl) => {
    if (!inputEl) {
      return;
    }
    inputEl.addEventListener('input', () => {
      setFieldError(inputEl, errorEl, '');
      invalidateReviewIfNeeded(
        'Data kontak atau tujuan telah diubah. Klik "Periksa Pesanan" kembali untuk memperbarui draf WhatsApp.'
      );
    });
  };

  invalidateOnTransientInput(dom.destinationCityInput, dom.destinationCityError);
  invalidateOnTransientInput(dom.customerNameInput, dom.customerNameError);
  invalidateOnTransientInput(dom.customerPhoneInput, dom.customerPhoneError);
  invalidateOnTransientInput(dom.customerNotesInput, dom.customerNotesError);

  if (dom.checkoutForm) {
    dom.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  if (dom.editOrderBtn) {
    dom.editOrderBtn.addEventListener('click', () => {
      appState.reviewedSubmission = null;
      if (dom.reviewPanel) {
        dom.reviewPanel.hidden = true;
      }
      if (dom.customerNameInput) {
        dom.customerNameInput.focus();
      }
    });
  }

  if (dom.copyDraftBtn) {
    dom.copyDraftBtn.addEventListener('click', async () => {
      if (!appState.reviewedSubmission) {
        return;
      }
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(appState.reviewedSubmission.draftMessage);
          announceStatus('Teks draf pesanan berhasil disalin ke papan klip.');
          const prevLabel = dom.copyDraftBtn.textContent;
          dom.copyDraftBtn.textContent = 'Teks Tersalin';
          window.setTimeout(() => {
            dom.copyDraftBtn.textContent = prevLabel;
          }, 2000);
        }
      } catch {
        announceStatus('Gagal menyalin otomatis. Anda dapat menyalin teks draf secara manual.');
      }
    });
  }

  if (dom.whatsappLink) {
    dom.whatsappLink.addEventListener('click', (event) => {
      if (dom.whatsappLink.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        return;
      }
      // Keranjang tetap dipertahankan sesuai SOP karena tautan WhatsApp belum menjamin transaksi selesai.
      announceStatus(
        'Membuka WhatsApp. Pastikan Anda menekan tombol kirim di aplikasi WhatsApp untuk meneruskan pesanan.'
      );
    });
  }
}

function initApp() {
  cacheDomElements();
  renderStoreIdentity();

  const loaded = loadCartDraft(PRODUCTS);
  appState.items = loaded.draft.items;
  appState.fulfillmentMethod = loaded.draft.fulfillmentMethod;
  appState.pickupDate = loaded.draft.pickupDate;
  appState.storageAvailable = loaded.storageAvailable;

  if (!loaded.storageAvailable && dom.storageNotice) {
    dom.storageNotice.hidden = false;
    dom.storageNotice.textContent =
      'Keranjang dapat digunakan, tetapi belum bisa disimpan pada browser ini.';
  } else if (loaded.expiredDateCleared) {
    announceStatus(
      'Tanggal pengambilan sebelumnya sudah lewat dan telah direset. Silakan pilih tanggal baru.'
    );
  } else if (loaded.corruptedRecovered) {
    announceStatus('Data keranjang lama telah disesuaikan ke format terbaru.');
  }

  renderCategoryControls();
  renderConditionOptions();
  renderFulfillmentSection();
  renderCatalog();
  renderCart();
  bindEvents();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

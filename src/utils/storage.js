import { DEFAULT_PRICES } from '../data/scrapItems.js';

export const STORAGE_KEY_V2 = 'scrap_shop_v2';
export const STORAGE_KEY_LEGACY = 'scrap_shop_data';

export const ITEM_CATEGORIES = [
  'Paper & Cardboard',
  'Ferrous Metal',
  'Non-Ferrous Metal',
  'E-Waste & Motors',
  'Plastics',
  'Other',
];

const DEFAULT_CATEGORY_MAP = {
  'Paper': 'Paper & Cardboard',
  'Books': 'Paper & Cardboard',
  'Cotton Box': 'Paper & Cardboard',
  'Iron': 'Ferrous Metal',
  'Steel': 'Ferrous Metal',
  'Aluminum B': 'Non-Ferrous Metal',
  'Aluminum M': 'Non-Ferrous Metal',
  'Aluminum AW': 'Non-Ferrous Metal',
  'Aluminum AE': 'Non-Ferrous Metal',
  'Brass': 'Non-Ferrous Metal',
  'Wire': 'Non-Ferrous Metal',
  'RC': 'E-Waste & Motors',
  'OC': 'E-Waste & Motors',
  'OCP': 'E-Waste & Motors',
  'Plastic': 'Plastics',
};

// Generate standard default items array from DEFAULT_PRICES
export function getInitialDefaultItems() {
  return Object.entries(DEFAULT_PRICES).map(([name, price]) => ({
    id: `item_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name,
    price: Number(price) || 0,
    category: DEFAULT_CATEGORY_MAP[name] || 'Other',
    unit: 'KG',
    active: true,
    createdAt: new Date().toISOString(),
  }));
}

export const DEFAULT_SHOP_PROFILE = {
  shopName: 'NEXTGEN SCRAP TRADERS',
  subtitle: 'Eco-Friendly Scrap Recycling & Metal Trading',
  tagline: 'Smart Recycling, Better Living.',
  mobileNumber: '+91 9611399943/9663495417',
  email: 'scrapbilling@gmail.com',
  address: 'Shop No. 12, City Plaza, MG Road, Bangalore - 452001',
  pinCode: '452001',
  qrCode: '',
  cashierName: 'Nanda',
  invoicePrefix: '000',
  terms: 'Goods once weighed and sold will not be taken back. Rates are subject to daily scrap market conditions. Thank you for your valuable visit!',
};

export function getFormattedTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function generateInvoiceNumber(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return '000125';
  }

  // Find max numeric value from history
  let maxNum = 124;
  history.forEach(inv => {
    const cleanStr = String(inv.invoiceNo || '').replace(/\D/g, '');
    const num = parseInt(cleanStr, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  return String(maxNum + 1).padStart(6, '0');
}

export function loadApplicationData() {
  try {
    // 1. Try modern versioned storage
    const v2Raw = localStorage.getItem(STORAGE_KEY_V2);
    if (v2Raw) {
      const parsed = JSON.parse(v2Raw);
      return sanitizeLoadedData(parsed);
    }

    // 2. Try legacy storage migration
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      return migrateLegacyData(legacy);
    }
  } catch (err) {
    console.error('Error loading application data from storage:', err);
  }

  // 3. Fallback to clean defaults
  const initialHistory = [];
  return {
    version: 2,
    items: getInitialDefaultItems(),
    shopProfile: { ...DEFAULT_SHOP_PROFILE },
    invoiceHistory: initialHistory,
    bill: {
      customerName: '',
      notes: 'Thank you for recycling with us!',
      paymentMode: 'Cash',
      cashier: 'Nanda',
      invoiceNo: generateInvoiceNumber(initialHistory),
      date: new Date().toISOString(),
      time: getFormattedTime(),
      discount: 0,
      rows: [],
    },
  };
}

function sanitizeLoadedData(data) {
  let items = Array.isArray(data.items) && data.items.length > 0 ? data.items : getInitialDefaultItems();

  if (items.length === 0) {
    items = getInitialDefaultItems();
  }

  const shopProfile = {
    ...DEFAULT_SHOP_PROFILE,
    ...(data.shopProfile || {}),
  };

  const invoiceHistory = Array.isArray(data.invoiceHistory) ? data.invoiceHistory : [];

  const bill = {
    customerName: data.bill?.customerName ?? '',
    customerMobile: data.bill?.customerMobile ?? '',
    customerAddress: data.bill?.customerAddress ?? '',
    customerPin: data.bill?.customerPin ?? '',
    notes: data.bill?.notes ?? 'Thank you for recycling with us!',
    paymentMode: data.bill?.paymentMode || 'Cash',
    cashier: data.bill?.cashier || shopProfile.cashierName || 'Nanda',
    invoiceNo: data.bill?.invoiceNo || generateInvoiceNumber(invoiceHistory),
    date: data.bill?.date || new Date().toISOString(),
    time: data.bill?.time || getFormattedTime(),
    discount: Number(data.bill?.discount) || 0,
    rows: Array.isArray(data.bill?.rows) ? data.bill.rows : [],
  };

  return {
    version: 2,
    items,
    shopProfile,
    invoiceHistory,
    bill,
  };
}

function migrateLegacyData(legacy) {
  const legacyPrices = legacy.prices || {};
  const defaultItems = getInitialDefaultItems();

  const itemsMap = new Map();
  defaultItems.forEach(item => {
    itemsMap.set(item.name, {
      ...item,
      price: legacyPrices[item.name] !== undefined ? Number(legacyPrices[item.name]) : item.price,
    });
  });

  Object.entries(legacyPrices).forEach(([name, price]) => {
    if (!itemsMap.has(name)) {
      itemsMap.set(name, {
        id: `item_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name,
        price: Number(price) || 0,
        category: 'Other',
        unit: 'KG',
        active: true,
        createdAt: new Date().toISOString(),
      });
    }
  });

  const items = Array.from(itemsMap.values());

  const shopProfile = {
    ...DEFAULT_SHOP_PROFILE,
    shopName: legacy.shopName || DEFAULT_SHOP_PROFILE.shopName,
    mobileNumber: legacy.mobileNumber || DEFAULT_SHOP_PROFILE.mobileNumber,
    address: legacy.address || DEFAULT_SHOP_PROFILE.address,
    qrCode: legacy.qrCode || '',
  };

  const rows = Array.isArray(legacy.rows)
    ? legacy.rows.map(r => ({
      id: r.id || crypto.randomUUID(),
      item: r.item || '',
      price: Number(r.price) || 0,
      qty: r.qty === '' ? '' : Number(r.qty),
    }))
    : [];

  const invoiceHistory = [];

  const bill = {
    customerName: 'Unknown',
    customerMobile: '',
    customerAddress: '',
    customerPin: '',
    notes: 'Thank you for recycling with us!',
    paymentMode: 'Cash',
    cashier: 'Nanda',
    invoiceNo: '000125',
    date: legacy.date ? new Date(legacy.date).toISOString() : new Date().toISOString(),
    time: getFormattedTime(),
    discount: 0,
    rows,
  };

  const migrated = {
    version: 2,
    items,
    shopProfile,
    invoiceHistory,
    bill,
  };

  saveToStorage(migrated);
  return migrated;
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));

    // Mirror to legacy format for backward compatibility
    const pricesObj = {};
    if (Array.isArray(data.items)) {
      data.items.forEach(it => {
        if (it.active !== false) {
          pricesObj[it.name] = it.price;
        }
      });
    }

    const legacyPayload = {
      shopName: data.shopProfile?.shopName || '',
      mobileNumber: data.shopProfile?.mobileNumber || '',
      address: data.shopProfile?.address || '',
      qrCode: data.shopProfile?.qrCode || '',
      date: data.bill?.date || new Date().toISOString(),
      prices: pricesObj,
      rows: data.bill?.rows || [],
    };
    localStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify(legacyPayload));
  } catch (err) {
    console.error('Failed to persist scrap shop data to localStorage:', err);
  }
}

export function formatINR(val) {
  const num = Number(val) || 0;
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumberOnly(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

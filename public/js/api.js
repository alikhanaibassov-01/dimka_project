const API = {
  async getCategories() {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v != null) qs.set(k, v);
    });
    const res = await fetch(`/api/products?${qs}`);
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async getRegions() {
    const res = await fetch('/api/products/regions');
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json;
  },

  async createProduct(data) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  async createCheckoutSession(data) {
    const res = await fetch('/api/payments/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Payment failed');
    return json;
  },

  async verifyOrder(orderId) {
    const res = await fetch(`/api/payments/verify/${orderId}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },
};

function productName(p) {
  return I18n.lang === 'kk' ? p.nameKk : p.nameRu;
}

function productDescription(p) {
  return I18n.lang === 'kk' ? p.descriptionKk : p.descriptionRu;
}

function categoryName(c) {
  return I18n.lang === 'kk' ? c.name_kk : c.name_ru;
}

function formatPrice(price) {
  return `${price.toLocaleString('ru-KZ')} ${I18n.t('currency')}`;
}

function badgeLabel(badge) {
  if (!badge) return '';
  if (badge === 'organic') return I18n.t('trust.organic');
  if (badge === 'local') return I18n.t('trust.local');
  return badge;
}

const API = {
  fetchOpts: { credentials: 'include' },

  async getCategories() {
    const res = await fetch('/api/categories', API.fetchOpts);
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async getProducts(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v != null) qs.set(k, v);
    });
    const res = await fetch(`/api/products?${qs}`, API.fetchOpts);
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`/api/products/${id}`, API.fetchOpts);
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async getRegions() {
    const res = await fetch('/api/products/regions', API.fetchOpts);
    if (!res.ok) throw new Error('API error');
    return res.json();
  },

  async uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json;
  },

  async createProduct(data) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  async updateProduct(id, data) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  async deleteProduct(id) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  async createOrder(data) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Order failed');
    return json;
  },

  async getOrder(id) {
    const res = await fetch(`/api/orders/${id}`, API.fetchOpts);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async getMe() {
    const res = await fetch('/api/auth/me', API.fetchOpts);
    if (!res.ok) return null;
    return res.json();
  },

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async register(email, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Register failed');
    return json;
  },

  async updateProfile(data) {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  },

  async getMyOrders() {
    const res = await fetch('/api/orders/mine', API.fetchOpts);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },

  async getAdminOrders() {
    const res = await fetch('/api/orders/admin', API.fetchOpts);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },

  async confirmOrderPayment(orderId, paymentStatus) {
    const res = await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ paymentStatus }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },
};

function productName(p) {
  if (I18n.lang === 'kk') return p.nameKk;
  if (I18n.lang === 'en') return p.nameEn || p.nameRu;
  return p.nameRu;
}

function productDescription(p) {
  if (I18n.lang === 'kk') return p.descriptionKk;
  if (I18n.lang === 'en') return p.descriptionEn || p.descriptionRu;
  return p.descriptionRu;
}

function categoryName(c) {
  if (I18n.lang === 'kk') return c.name_kk;
  if (I18n.lang === 'en') return c.name_en || c.name_ru;
  return c.name_ru;
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

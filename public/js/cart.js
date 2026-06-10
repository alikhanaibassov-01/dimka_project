const CART_KEY = 'qazcart';

const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
    window.dispatchEvent(new Event('cart-updated'));
  },

  add(productId, qty = 1) {
    const items = Cart.get();
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ productId, qty });
    }
    Cart.save(items);
  },

  setQty(productId, qty) {
    let items = Cart.get();
    if (qty < 1) {
      items = items.filter((i) => i.productId !== productId);
    } else {
      const item = items.find((i) => i.productId === productId);
      if (item) item.qty = qty;
    }
    Cart.save(items);
  },

  remove(productId) {
    Cart.save(Cart.get().filter((i) => i.productId !== productId));
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    Cart.updateBadge();
    window.dispatchEvent(new Event('cart-updated'));
  },

  count() {
    return Cart.get().reduce((sum, i) => sum + i.qty, 0);
  },

  // Убирает из корзины товары, которых больше нет в каталоге
  // (например, после очистки БД или удаления товара админом).
  prune(validIds) {
    const items = Cart.get().filter((i) => validIds.includes(i.productId));
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
    return items;
  },

  updateBadge() {
    const el = document.getElementById('cart-badge');
    if (!el) return;
    const n = Cart.count();
    el.textContent = n;
    el.classList.toggle('hidden', n === 0);
  },
};

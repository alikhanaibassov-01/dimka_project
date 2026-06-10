// Загружает товары корзины; недоступные (удалённые) возвращает как null.
async function loadCartProducts(items) {
  const results = await Promise.all(
    items.map((i) => API.getProduct(i.productId).catch(() => null))
  );
  const validItems = [];
  const validProducts = [];
  items.forEach((item, idx) => {
    if (results[idx]) {
      validItems.push(item);
      validProducts.push(results[idx]);
    }
  });
  if (validItems.length !== items.length) {
    Cart.prune(validItems.map((i) => i.productId));
  }
  return { items: validItems, products: validProducts };
}

async function renderCart() {
  const container = document.getElementById('cart-content');
  const { items, products } = await loadCartProducts(Cart.get());

  if (!items.length) {
    container.innerHTML = `
      <div class="py-16 text-center">
        <p class="text-lg text-gray-500" data-i18n="cart.empty"></p>
        <a href="/catalog.html" class="btn-primary mt-6 inline-flex" data-i18n="cart.goCatalog"></a>
      </div>
    `;
    I18n.apply();
    return;
  }

  let total = 0;
  const rows = items.map((item, idx) => {
    const p = products[idx];
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    return `
      <li class="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <img src="${p.imageUrl}" alt="" class="h-24 w-24 shrink-0 rounded-lg object-cover bg-teal-50" />
        <div class="flex-1">
          <a href="/product.html?id=${p.id}" class="font-semibold text-gray-900 hover:text-qaz-teal">${productName(p)}</a>
          <p class="text-sm text-gray-500">${p.region}</p>
          <p class="mt-1 font-bold text-qaz-teal">${formatPrice(p.price)}</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-500">${I18n.t('cart.qty')}</label>
          <button type="button" class="qty-minus rounded border px-2 py-1" data-id="${p.id}">−</button>
          <span class="w-8 text-center font-medium">${item.qty}</span>
          <button type="button" class="qty-plus rounded border px-2 py-1" data-id="${p.id}">+</button>
        </div>
        <div class="text-right">
          <p class="font-bold">${formatPrice(lineTotal)}</p>
          <button type="button" class="mt-2 text-sm text-red-500 hover:underline remove-btn" data-id="${p.id}" data-i18n="cart.remove"></button>
        </div>
      </li>
    `;
  });

  container.innerHTML = `
    <ul class="space-y-4">${rows.join('')}</ul>
    <div class="mt-8 flex flex-col items-end gap-4 border-t pt-6">
      <p class="text-xl"><span data-i18n="cart.total"></span>: <strong class="text-qaz-teal">${formatPrice(total)}</strong></p>
      <a href="/checkout.html" class="btn-primary" data-i18n="cart.checkout"></a>
    </div>
  `;
  I18n.apply();

  container.querySelectorAll('.qty-minus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = Cart.get().find((i) => i.productId === id);
      Cart.setQty(id, (item?.qty || 1) - 1);
      renderCart();
    });
  });
  container.querySelectorAll('.qty-plus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = Cart.get().find((i) => i.productId === id);
      Cart.setQty(id, (item?.qty || 0) + 1);
      renderCart();
    });
  });
  container.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Cart.remove(Number(btn.dataset.id));
      renderCart();
    });
  });
}

window.addEventListener('cart-updated', renderCart);
window.addEventListener('lang-changed', renderCart);

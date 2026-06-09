async function renderCheckoutSummary() {
  const summary = document.getElementById('checkout-summary');
  const items = Cart.get();
  if (!items.length) {
    window.location.href = '/cart.html';
    return;
  }
  const products = await Promise.all(items.map((i) => API.getProduct(i.productId)));
  let total = 0;
  const lines = items.map((item, idx) => {
    const p = products[idx];
    const line = p.price * item.qty;
    total += line;
    return `<li class="flex justify-between text-sm"><span>${productName(p)} × ${item.qty}</span><span>${formatPrice(line)}</span></li>`;
  });
  summary.innerHTML = `
    <ul class="space-y-2 border-b pb-4">${lines.join('')}</ul>
    <p class="mt-4 text-right text-lg font-bold">${I18n.t('cart.total')}: ${formatPrice(total)}</p>
    <div class="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
      <span>Kaspi</span><span>·</span><span data-i18n="checkout.cod"></span>
    </div>
  `;
  I18n.apply();
}

async function initCheckout() {
  await renderCheckoutSummary();

  const user = getCurrentUser();
  if (user?.role === 'client') {
    const nameInput = document.querySelector('#checkout-form [name="name"]');
    if (nameInput && !nameInput.value) nameInput.value = user.name;
  }

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('checkout-error');
    errEl.classList.add('hidden');
    errEl.textContent = '';

    const fd = new FormData(e.target);
    const items = Cart.get();
    const paymentMethod = fd.get('paymentMethod') || 'cod';
    const payload = {
      customerName: fd.get('name'),
      phone: fd.get('phone'),
      city: fd.get('city'),
      address: fd.get('address'),
      comment: fd.get('comment'),
      paymentMethod,
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
    };

    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      const { orderId } = await API.createOrder(payload);
      Cart.clear();
      window.location.href = `/order-success.html?orderId=${orderId}`;
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
      btn.disabled = false;
    }
  });
}

window.addEventListener('lang-changed', renderCheckoutSummary);

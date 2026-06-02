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
    <p class="mt-2 flex items-center gap-2 text-xs text-gray-500">
      <span>Visa</span><span>·</span><span>Mastercard</span>
    </p>
  `;
}

function initCheckout() {
  renderCheckoutSummary();

  const params = new URLSearchParams(window.location.search);
  if (params.get('cancelled')) {
    const errEl = document.getElementById('checkout-error');
    errEl.textContent = I18n.t('checkout.cancelled');
    errEl.classList.remove('hidden');
  }

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('checkout-error');
    errEl.classList.add('hidden');
    errEl.textContent = '';

    const fd = new FormData(e.target);
    const items = Cart.get();
    const payload = {
      customerName: fd.get('name'),
      phone: fd.get('phone'),
      city: fd.get('city'),
      address: fd.get('address'),
      comment: fd.get('comment'),
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
    };

    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      const { url } = await API.createCheckoutSession(payload);
      Cart.clear();
      window.location.href = url;
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
      btn.disabled = false;
    }
  });
}

window.addEventListener('lang-changed', renderCheckoutSummary);

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

function getDeliveryMethod(form) {
  const checked = form.querySelector('[name="deliveryMethod"]:checked');
  return checked?.value || 'delivery';
}

function toggleDeliveryMode(form) {
  try {
    const isPickup = getDeliveryMethod(form) === 'pickup';
    const deliveryFields = document.getElementById('delivery-fields');
    const mapBlock = document.getElementById('pickup-map-checkout');
    const cityInput = form.querySelector('[name="city"]');
    const addressInput = form.querySelector('[name="address"]');

    if (deliveryFields) deliveryFields.classList.toggle('hidden', isPickup);

    if (mapBlock) {
      if (isPickup) {
        mapBlock.classList.remove('hidden');
        renderPickupMap('pickup-map-checkout');
      } else {
        mapBlock.classList.add('hidden');
      }
    }

    if (cityInput) cityInput.required = !isPickup;
    if (addressInput) addressInput.required = !isPickup;
    if (isPickup) {
      if (cityInput) cityInput.value = '';
      if (addressInput) addressInput.value = '';
    }
  } catch (err) {
    console.error('toggleDeliveryMode:', err);
  }
}

function prefillCheckoutFromUser(form, user) {
  if (!user || user.role !== 'client') return;
  const lastName = form.querySelector('[name="lastName"]');
  const firstName = form.querySelector('[name="firstName"]');
  const phone = form.querySelector('[name="phone"]');
  if (user.lastName && lastName && !lastName.value) lastName.value = user.lastName;
  if (user.firstName && firstName && !firstName.value) firstName.value = user.firstName;
  if (user.phone && phone && !phone.value) phone.value = user.phone;
}

async function initCheckout() {
  try {
    await renderCheckoutSummary();

    const form = document.getElementById('checkout-form');
    if (!form) return;

  const user = getCurrentUser();
  prefillCheckoutFromUser(form, user);

  if (user?.role === 'client' && (!user.firstName || !user.lastName || !user.phone)) {
    const warn = document.createElement('p');
    warn.className = 'rounded-lg bg-amber-50 p-3 text-sm text-amber-800';
    warn.innerHTML = `${I18n.t('checkout.fillProfile')} <a href="/account.html" class="font-semibold underline">${I18n.t('nav.account')}</a>`;
    form.prepend(warn);
  }

  form.querySelectorAll('[name="deliveryMethod"]').forEach((radio) => {
    radio.addEventListener('change', () => toggleDeliveryMode(form));
  });
  toggleDeliveryMode(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('checkout-error');
    errEl.classList.add('hidden');
    errEl.textContent = '';

    const fd = new FormData(form);
    const items = Cart.get();
    const isPickup = fd.get('deliveryMethod') === 'pickup';
    const payload = {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      phone: fd.get('phone'),
      city: isPickup ? PICKUP.city : fd.get('city'),
      address: isPickup ? PICKUP.address : fd.get('address'),
      comment: fd.get('comment'),
      paymentMethod: fd.get('paymentMethod') || 'cod',
      deliveryMethod: fd.get('deliveryMethod') || 'delivery',
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
    };

    const btn = form.querySelector('[type="submit"]');
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
  } catch (err) {
    console.error('initCheckout:', err);
    const errEl = document.getElementById('checkout-error');
    if (errEl) {
      errEl.textContent = err.message || 'Error';
      errEl.classList.remove('hidden');
    }
  }
}

window.addEventListener('lang-changed', renderCheckoutSummary);

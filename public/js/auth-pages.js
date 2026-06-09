function initLogin() {
  const form = document.getElementById('login-form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('auth-error');
    errEl.classList.add('hidden');
    const fd = new FormData(form);
    try {
      const user = await API.login(fd.get('email'), fd.get('password'));
      currentUser = user;
      if (user.role === 'admin') {
        window.location.href = '/manage-products.html';
      } else {
        window.location.href = '/account.html';
      }
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });
}

function initRegister() {
  const form = document.getElementById('register-form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('auth-error');
    errEl.classList.add('hidden');
    const fd = new FormData(form);
    try {
      const user = await API.register(fd.get('email'), fd.get('password'));
      currentUser = user;
      window.location.href = '/account.html';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });
}

function initAdminLogin() {
  const form = document.getElementById('admin-login-form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('auth-error');
    errEl.classList.add('hidden');
    const fd = new FormData(form);
    try {
      const user = await API.login(fd.get('email'), fd.get('password'));
      if (user.role !== 'admin') {
        await API.logout();
        throw new Error(I18n.t('auth.adminHint'));
      }
      currentUser = user;
      window.location.href = '/manage-products.html';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });
}

async function initAccount() {
  const user = await requireClient();
  if (!user) return;

  document.getElementById('account-email').textContent = user.email;

  const profileForm = document.getElementById('profile-form');
  profileForm.lastName.value = user.lastName || '';
  profileForm.firstName.value = user.firstName || '';
  profileForm.phone.value = user.phone || '';

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('profile-error');
    const okEl = document.getElementById('profile-success');
    errEl.classList.add('hidden');
    okEl.classList.add('hidden');
    const fd = new FormData(profileForm);
    try {
      const updated = await API.updateProfile({
        lastName: fd.get('lastName'),
        firstName: fd.get('firstName'),
        phone: fd.get('phone'),
      });
      currentUser = updated;
      okEl.classList.remove('hidden');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  const container = document.getElementById('account-orders');
  try {
    const orders = await API.getMyOrders();
    if (!orders.length) {
      container.innerHTML = `<p class="text-gray-500">${I18n.t('account.noOrders')}</p>`;
      return;
    }
    container.innerHTML = orders
      .map((o) => {
        const delivery =
          o.delivery_method === 'pickup' ? I18n.t('checkout.pickup') : o.city;
        return `
      <div class="rounded-lg border bg-white p-4 text-sm">
        <div class="flex justify-between font-medium">
          <span>#${o.id}</span>
          <span>${formatPrice(o.total)}</span>
        </div>
        <p class="mt-1 text-gray-500">${o.created_at?.slice(0, 10) || ''} · ${delivery}</p>
        <p class="mt-1 text-qaz-teal">${paymentStatusLabel(o.payment_status, o.payment_method)}</p>
      </div>
    `;
      })
      .join('');
  } catch {
    container.innerHTML = '<p class="text-red-500">Error</p>';
  }
}

async function initAdminOrders() {
  const user = await requireAdminUser();
  if (!user) return;

  const container = document.getElementById('admin-orders-list');

  async function load() {
    try {
      const orders = await API.getAdminOrders();
      container.innerHTML = orders
        .map((o) => {
          const deliveryLabel =
            o.delivery_method === 'pickup'
              ? `${I18n.t('checkout.pickup')}: ${o.address}`
              : `${o.city}, ${o.address}`;
          return `
        <div class="rounded-lg border bg-white p-4 text-sm">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p class="font-semibold">#${o.id} · ${o.customer_name}</p>
              <p class="text-gray-500">${o.phone}</p>
              <p class="text-gray-500">${deliveryLabel}</p>
              <p class="mt-1">${formatPrice(o.total)} · ${paymentStatusLabel(o.payment_status, o.payment_method)}</p>
            </div>
            ${
              o.payment_method === 'kaspi' && o.payment_status === 'awaiting_kaspi'
                ? `<button type="button" class="confirm-paid-btn btn-primary text-xs" data-id="${o.id}">${I18n.t('admin.confirmPaid')}</button>`
                : ''
            }
          </div>
        </div>
      `;
        })
        .join('');

      container.querySelectorAll('.confirm-paid-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await API.confirmOrderPayment(btn.dataset.id, 'paid');
          load();
        });
      });
    } catch (err) {
      container.innerHTML = `<p class="text-red-500">${err.message}</p>`;
    }
  }

  load();
}

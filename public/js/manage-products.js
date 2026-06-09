async function initManageProducts() {
  const ok = await requireAdminUser();
  if (!ok) return;
  loadManageProducts();
}

async function loadManageProducts() {
  const container = document.getElementById('manage-list');
  if (!container) return;

  try {
    const { items } = await API.getProducts({ all: '1', limit: '100' });
    if (!items.length) {
      container.innerHTML = `<p class="text-gray-500">${I18n.t('manage.empty')}</p>`;
      return;
    }
    container.innerHTML = items
      .map(
        (p) => `
      <div class="card flex items-center gap-4 p-4 ${p.deleted ? 'opacity-50' : ''}">
        <img src="${p.imageUrl}" alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover bg-teal-50" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold truncate">${productName(p)}</p>
          <p class="text-sm text-gray-500">${formatPrice(p.price)} · ${p.region}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <a href="/edit-product.html?id=${p.id}" class="btn-secondary text-sm" data-i18n="edit.link"></a>
          <button type="button" class="delete-product-btn rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50" data-id="${p.id}" data-i18n="manage.delete"></button>
        </div>
      </div>
    `
      )
      .join('');
    I18n.apply();

    container.querySelectorAll('.delete-product-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm(I18n.t('manage.deleteConfirm'))) return;
        try {
          await API.deleteProduct(btn.dataset.id);
          loadManageProducts();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<p class="text-red-500">${err.message}</p>`;
  }
}

window.addEventListener('lang-changed', loadManageProducts);

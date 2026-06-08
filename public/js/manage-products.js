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
      <div class="card flex items-center gap-4 p-4">
        <img src="${p.imageUrl}" alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover bg-teal-50" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold truncate">${productName(p)}</p>
          <p class="text-sm text-gray-500">${formatPrice(p.price)} · ${p.region}</p>
        </div>
        <a href="/edit-product.html?id=${p.id}" class="btn-secondary shrink-0 text-sm" data-i18n="edit.link"></a>
      </div>
    `
      )
      .join('');
    I18n.apply();
  } catch {
    container.innerHTML = '<p class="text-red-500">Error</p>';
  }
}

window.addEventListener('lang-changed', loadManageProducts);

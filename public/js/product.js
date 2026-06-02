async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('product-detail');
  if (!id) {
    window.location.href = '/catalog.html';
    return;
  }

  try {
    const p = await API.getProduct(id);
    document.title = `${productName(p)} — QazMarket`;
    container.innerHTML = `
      <a href="/catalog.html" class="mb-6 inline-flex text-sm text-qaz-teal hover:underline" data-i18n="product.back"></a>
      <div class="grid gap-8 md:grid-cols-2">
        <div class="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-amber-50">
          ${p.badge ? `<span class="absolute left-4 top-4 rounded-full bg-qaz-gold px-3 py-1 text-sm font-semibold">${badgeLabel(p.badge)}</span>` : ''}
          <img src="${p.imageUrl}" alt="${productName(p)}" class="h-full w-full object-cover" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-qaz-dark">${productName(p)}</h1>
          <p class="mt-4 text-2xl font-bold text-qaz-teal">${formatPrice(p.price)}</p>
          <dl class="mt-6 space-y-3 text-sm">
            <div class="flex gap-2"><dt class="font-medium text-gray-500">${I18n.t('trust.region')}:</dt><dd>${p.region}</dd></div>
            <div class="flex gap-2"><dt class="font-medium text-gray-500">${I18n.t('trust.producer')}:</dt><dd>${p.producerName}</dd></div>
            <div class="flex gap-2"><dt class="font-medium text-gray-500">Status:</dt><dd>${p.inStock ? I18n.t('product.inStock') : I18n.t('product.outOfStock')}</dd></div>
          </dl>
          <p class="mt-6 text-gray-600 leading-relaxed">${productDescription(p)}</p>
          <button id="add-cart-btn" type="button" class="btn-primary mt-8 w-full sm:w-auto" ${p.inStock ? '' : 'disabled'} data-i18n="product.addToCart"></button>
        </div>
      </div>
    `;

    I18n.apply();
    document.getElementById('add-cart-btn').addEventListener('click', () => {
      Cart.add(p.id, 1);
      const btn = document.getElementById('add-cart-btn');
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = I18n.t('product.addToCart'); }, 1200);
    });
  } catch {
    container.innerHTML = '<p class="text-red-500">Not found</p>';
  }
}

window.addEventListener('lang-changed', loadProduct);

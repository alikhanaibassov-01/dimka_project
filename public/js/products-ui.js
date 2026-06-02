function productCardHtml(p) {
  const badge = p.badge
    ? `<span class="absolute left-2 top-2 rounded-full bg-qaz-gold px-2 py-0.5 text-xs font-semibold text-qaz-dark">${badgeLabel(p.badge)}</span>`
    : '';
  return `
    <article class="card group overflow-hidden">
      <a href="/product.html?id=${p.id}" class="block">
        <div class="relative aspect-square overflow-hidden bg-gradient-to-br from-teal-50 to-amber-50">
          ${badge}
          <img src="${p.imageUrl}" alt="${productName(p)}" class="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 line-clamp-2">${productName(p)}</h3>
          <p class="mt-1 text-sm text-gray-500">${p.region} · ${p.producerName}</p>
          <p class="mt-2 text-lg font-bold text-qaz-teal">${formatPrice(p.price)}</p>
        </div>
      </a>
      <div class="px-4 pb-4">
        <button type="button" class="btn-primary w-full add-to-cart-btn" data-id="${p.id}" ${p.inStock ? '' : 'disabled'}>
          ${I18n.t('product.addToCart')}
        </button>
      </div>
    </article>
  `;
}

function bindAddToCart(container) {
  container.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = Number(btn.dataset.id);
      Cart.add(id, 1);
      btn.textContent = '✓';
      setTimeout(() => {
        btn.textContent = I18n.t('product.addToCart');
      }, 1200);
    });
  });
}

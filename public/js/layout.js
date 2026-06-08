function renderLayout() {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (!header) return;

  header.innerHTML = `
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <a href="/" class="flex items-center gap-2">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-qaz-teal text-lg font-bold text-white">Q</span>
        <span>
          <span class="block text-lg font-bold text-qaz-dark" data-i18n="siteName">QazMarket</span>
          <span class="block text-xs text-gray-500" data-i18n="tagline"></span>
        </span>
      </a>
      <nav class="hidden items-center gap-6 text-sm font-medium text-gray-700 sm:flex">
        <a href="/" class="hover:text-qaz-teal" data-i18n="nav.home"></a>
        <a href="/catalog.html" class="hover:text-qaz-teal" data-i18n="nav.catalog"></a>
        <a href="/cart.html" class="relative hover:text-qaz-teal">
          <span data-i18n="nav.cart"></span>
          <span id="cart-badge" class="absolute -right-4 -top-2 hidden min-w-[1.25rem] rounded-full bg-qaz-gold px-1 text-center text-xs font-bold text-qaz-dark">0</span>
        </a>
      </nav>
      <div class="flex items-center gap-2">
        <div class="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-semibold">
          <button type="button" data-lang-btn="kk" class="px-2.5 py-1.5">Қаз</button>
          <button type="button" data-lang-btn="ru" class="px-2.5 py-1.5">Рус</button>
        </div>
        <a href="/cart.html" class="relative rounded-lg p-2 hover:bg-gray-100 sm:hidden" aria-label="Cart">
          <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </a>
      </div>
    </div>
  `;

  if (footer) {
    footer.innerHTML = `
      <div class="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-500">
        <p data-i18n="footer.text"></p>
        <p class="mt-2 font-medium text-qaz-teal" data-i18n="tagline"></p>
        <a href="/add-product.html" class="mt-3 inline-block text-xs text-gray-400 hover:text-qaz-teal" data-i18n="add.link"></a>
        <span class="mx-1 text-xs text-gray-300">·</span>
        <a href="/manage-products.html" class="mt-3 inline-block text-xs text-gray-400 hover:text-qaz-teal" data-i18n="manage.link"></a>
      </div>
    `;
  }
}

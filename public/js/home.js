async function loadFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const { items } = await API.getProducts({ featured: '1', sort: 'newest', limit: '12' });
    grid.innerHTML = items.map(productCardHtml).join('');
    bindAddToCart(grid);
  } catch (err) {
    grid.innerHTML = '<p class="text-gray-500 col-span-full">Error loading products</p>';
  }
}

window.addEventListener('lang-changed', loadFeatured);

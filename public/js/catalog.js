let categories = [];
let regions = [];

function getFiltersFromForm() {
  const form = document.getElementById('filter-form');
  const fd = new FormData(form);
  return {
    category: fd.get('category') || '',
    region: fd.get('region') || '',
    q: fd.get('q') || '',
    minPrice: fd.get('minPrice') || '',
    maxPrice: fd.get('maxPrice') || '',
    sort: fd.get('sort') || 'id',
    page: fd.get('page') || '1',
    limit: '12',
  };
}

async function populateFilters() {
  const [cats, regs] = await Promise.all([API.getCategories(), API.getRegions()]);
  categories = cats;
  regions = regs;

  const catSelect = document.getElementById('filter-category');
  const regSelect = document.getElementById('filter-region');
  const params = new URLSearchParams(window.location.search);

  catSelect.innerHTML = `<option value="">${I18n.t('catalog.all')}</option>` +
    cats.map((c) => `<option value="${c.slug}">${categoryName(c)}</option>`).join('');

  regSelect.innerHTML = `<option value="">${I18n.t('catalog.all')}</option>` +
    regs.map((r) => `<option value="${r}">${r}</option>`).join('');

  if (params.get('category')) catSelect.value = params.get('category');
  if (params.get('region')) regSelect.value = params.get('region');
  if (params.get('q')) document.getElementById('filter-q').value = params.get('q');
}

async function loadCatalog() {
  const grid = document.getElementById('catalog-grid');
  const meta = document.getElementById('catalog-meta');
  const filters = getFiltersFromForm();

  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) qs.set(k, v); });
  window.history.replaceState({}, '', `?${qs}`);

  grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-12">...</p>';

  try {
    const data = await API.getProducts(filters);
    if (!data.items.length) {
      grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">${I18n.t('catalog.empty')}</p>`;
      meta.textContent = '';
      return;
    }
    grid.innerHTML = data.items.map(productCardHtml).join('');
    bindAddToCart(grid);
    meta.textContent = `${data.total} ${I18n.t('catalog.results')}`;
  } catch {
    grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error</p>';
  }
}

function initCatalog() {
  document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadCatalog();
  });
  populateFilters().then(loadCatalog);
}

window.addEventListener('lang-changed', () => {
  populateFilters().then(loadCatalog);
});

async function initAddProduct() {
  const form = document.getElementById('add-product-form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  const select = document.getElementById('add-category');
  const fileInput = document.getElementById('add-image');
  const preview = document.getElementById('add-preview');

  const categories = await API.getCategories();
  select.innerHTML = categories
    .map((c) => `<option value="${c.id}">${categoryName(c)}</option>`)
    .join('');

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) {
      preview.classList.add('hidden');
      preview.src = '';
      return;
    }
    preview.src = URL.createObjectURL(file);
    preview.classList.remove('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('add-error');
    const okEl = document.getElementById('add-success');
    errEl.classList.add('hidden');
    okEl.classList.add('hidden');

    const fd = new FormData(form);
    const file = fileInput.files[0];
    if (!file) {
      errEl.textContent = I18n.t('add.imageRequired');
      errEl.classList.remove('hidden');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      const { imageUrl } = await API.uploadImage(file);
      const product = await API.createProduct({
        categoryId: fd.get('categoryId'),
        nameKk: fd.get('nameKk'),
        nameRu: fd.get('nameRu'),
        descriptionKk: fd.get('descriptionKk'),
        descriptionRu: fd.get('descriptionRu'),
        price: fd.get('price'),
        region: fd.get('region'),
        producerName: fd.get('producerName'),
        imageUrl,
        featured: fd.get('featured') === '1',
      });
      okEl.textContent = `${I18n.t('add.success')} #${product.id}`;
      okEl.classList.remove('hidden');
      form.reset();
      preview.classList.add('hidden');
      preview.src = '';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

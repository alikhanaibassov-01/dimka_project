async function initEditProduct() {
  const ok = await requireAdminUser();
  if (!ok) return;

  const form = document.getElementById('edit-product-form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = '/manage-products.html';
    return;
  }

  const select = document.getElementById('edit-category');
  const fileInput = document.getElementById('edit-image');
  const currentImg = document.getElementById('edit-current-image');

  const [categories, product] = await Promise.all([
    API.getCategories(),
    API.getProduct(id),
  ]);

  select.innerHTML = categories
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id === product.categoryId ? 'selected' : ''}>${categoryName(c)}</option>`
    )
    .join('');

  form.nameKk.value = product.nameKk;
  form.nameRu.value = product.nameRu;
  if (form.nameEn) form.nameEn.value = product.nameEn || '';
  form.price.value = product.price;
  form.region.value = product.region;
  form.producerName.value = product.producerName;
  form.descriptionKk.value = product.descriptionKk;
  form.descriptionRu.value = product.descriptionRu;
  if (form.descriptionEn) form.descriptionEn.value = product.descriptionEn || '';
  form.featured.checked = product.featured;
  form.inStock.checked = product.inStock;
  currentImg.src = product.imageUrl;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) currentImg.src = URL.createObjectURL(file);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('edit-error');
    const okEl = document.getElementById('edit-success');
    errEl.classList.add('hidden');
    okEl.classList.add('hidden');

    const fd = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      let imageUrl = product.imageUrl;
      const file = fileInput.files[0];
      if (file) {
        const uploaded = await API.uploadImage(file);
        imageUrl = uploaded.imageUrl;
      }

      await API.updateProduct(id, {
        categoryId: fd.get('categoryId'),
        nameKk: fd.get('nameKk'),
        nameRu: fd.get('nameRu'),
        nameEn: fd.get('nameEn'),
        descriptionKk: fd.get('descriptionKk'),
        descriptionRu: fd.get('descriptionRu'),
        descriptionEn: fd.get('descriptionEn'),
        price: fd.get('price'),
        region: fd.get('region'),
        producerName: fd.get('producerName'),
        imageUrl,
        featured: fd.get('featured') === '1',
        inStock: fd.get('inStock') === '1',
      });

      okEl.textContent = I18n.t('edit.success');
      okEl.classList.remove('hidden');
      product.imageUrl = imageUrl;
      fileInput.value = '';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  renderLayout();
  await I18n.init();
  Cart.updateBadge();

  if (document.getElementById('featured-grid')) loadFeatured();
  if (document.getElementById('filter-form')) initCatalog();
  if (document.getElementById('product-detail')) loadProduct();
  if (document.getElementById('cart-content')) renderCart();
  if (document.getElementById('checkout-form')) initCheckout();
  if (document.getElementById('order-id')) showOrderSuccess();
  if (document.getElementById('add-product-form')) initAddProduct();
});

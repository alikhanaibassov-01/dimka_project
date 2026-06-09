document.addEventListener('DOMContentLoaded', async () => {
  await loadAuthState();
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
  if (document.getElementById('edit-product-form')) initEditProduct();
  if (document.getElementById('manage-list')) initManageProducts();
  if (document.getElementById('login-form')) initLogin();
  if (document.getElementById('register-form')) initRegister();
  if (document.getElementById('admin-login-form')) initAdminLogin();
  if (document.getElementById('account-orders')) initAccount();
  if (document.getElementById('admin-orders-list')) initAdminOrders();
});

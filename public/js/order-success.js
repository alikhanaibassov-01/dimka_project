async function showOrderSuccess() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  if (!orderId) {
    window.location.href = '/';
    return;
  }

  try {
    const order = await API.verifyOrder(orderId);
    document.getElementById('order-id').textContent = `#${order.orderId}`;
    document.getElementById('order-total').textContent = formatPrice(order.total);
    const statusEl = document.getElementById('order-status');
    if (statusEl) {
      statusEl.textContent =
        order.paymentStatus === 'paid' ? I18n.t('success.paid') : I18n.t('success.pending');
    }
  } catch {
    document.getElementById('order-id').textContent = `#${orderId}`;
  }
}

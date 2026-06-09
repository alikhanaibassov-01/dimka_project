async function showOrderSuccess() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  if (!orderId) {
    window.location.href = '/';
    return;
  }

  const kaspiBlock = document.getElementById('kaspi-instructions');
  const statusEl = document.getElementById('order-status');

  try {
    const order = await API.getOrder(orderId);
    document.getElementById('order-id').textContent = `#${order.orderId}`;
    document.getElementById('order-total').textContent = formatPrice(order.total);

    if (order.paymentMethod === 'kaspi' && kaspiBlock) {
      kaspiBlock.classList.remove('hidden');
      document.getElementById('kaspi-phone').textContent = order.kaspiPhone || '';
      document.getElementById('kaspi-recipient').textContent = order.kaspiRecipient || 'QazMarket';
      document.getElementById('kaspi-amount').textContent = formatPrice(order.total);
      document.getElementById('kaspi-comment').textContent = `QazMarket #${order.orderId}`;
      if (statusEl) statusEl.textContent = I18n.t('success.pending');
    } else if (statusEl) {
      statusEl.textContent = I18n.t('success.cod');
    }
  } catch {
    document.getElementById('order-id').textContent = `#${orderId}`;
  }
}

window.addEventListener('lang-changed', showOrderSuccess);

let currentUser = null;

async function loadAuthState() {
  currentUser = await API.getMe();
  return currentUser;
}

function getCurrentUser() {
  return currentUser;
}

async function requireClient(redirect = '/login.html') {
  const user = await loadAuthState();
  if (!user) {
    window.location.href = redirect;
    return null;
  }
  return user;
}

async function requireAdminUser(redirect = '/admin-login.html') {
  const user = await loadAuthState();
  if (!user || user.role !== 'admin') {
    window.location.href = redirect;
    return null;
  }
  return user;
}

function paymentStatusLabel(status, method) {
  if (status === 'paid') return I18n.t('admin.payment.paid');
  if (status === 'cod' || method === 'cod') return I18n.t('admin.payment.cod_status');
  if (status === 'awaiting_kaspi') return I18n.t('admin.payment.awaiting_kaspi');
  return I18n.t('success.pending');
}

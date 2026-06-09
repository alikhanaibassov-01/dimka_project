/** Точка самовывоза: пр. Аль-Фараби, 93, Алматы */
const PICKUP = {
  address: 'пр. Аль-Фараби, 93',
  city: 'Алматы',
  lat: 43.221362,
  lon: 76.926891,
  gisUrl: 'https://2gis.kz/almaty/geo/76.926891,43.221362/17',
  mapEmbed: 'https://2gis.kz/almaty?m=76.926891,43.221362/17',
};

const KASPI_URL = 'https://kaspi.kz';
const KASPI_QR_IMG = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(KASPI_URL)}`;

function renderPickupMap(containerId) {
  const el = document.getElementById(containerId);
  if (!el || el.dataset.loaded) return;
  el.dataset.loaded = '1';

  el.innerHTML = `
    <div class="rounded-xl border bg-white p-4 text-left">
      <p class="text-sm font-medium text-gray-800" data-i18n="pickup.title"></p>
      <p class="mt-1 text-sm font-semibold text-qaz-teal">${PICKUP.address}, ${PICKUP.city}</p>
      <iframe
        title="2GIS"
        class="mt-3 w-full rounded-lg border-0"
        height="320"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src="${PICKUP.mapEmbed}"
      ></iframe>
      <a href="${PICKUP.gisUrl}" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-qaz-teal">
        <span data-i18n="pickup.open2gis"></span> →
      </a>
    </div>
  `;
  I18n.apply();
}

function renderKaspiQr(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="mt-4 border-t border-red-100 pt-4">
      <p class="text-center text-sm font-medium text-gray-700" data-i18n="success.kaspiQr"></p>
      <a href="${KASPI_URL}" target="_blank" rel="noopener" class="mx-auto mt-3 block w-fit">
        <img src="${KASPI_QR_IMG}" width="160" height="160" alt="Kaspi QR" class="rounded-lg border bg-white p-2 shadow-sm" />
      </a>
      <p class="mt-2 text-center">
        <a href="${KASPI_URL}" target="_blank" rel="noopener" class="text-sm font-semibold text-red-600 hover:underline">kaspi.kz</a>
      </p>
    </div>
  `;
  I18n.apply();
}

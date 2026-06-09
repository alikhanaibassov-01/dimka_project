/** Точка самовывоза — https://go.2gis.com/Pr8me */
const PICKUP = {
  address: 'пр. Аль-Фараби, 93',
  city: 'Алматы',
  lat: 43.212667,
  lon: 76.911417,
  gisUrl: 'https://go.2gis.com/Pr8me',
  /** OpenStreetMap — стабильный embed с меткой в тех же координатах */
  osmEmbed:
    'https://www.openstreetmap.org/export/embed.html?bbox=76.901667%2C43.207667%2C76.921667%2C43.217667&layer=mapnik&marker=43.212667%2C76.911417',
};

const KASPI_URL = 'https://kaspi.kz';
const KASPI_QR_IMG = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(KASPI_URL)}`;

function renderPickupMap(containerId) {
  const el = document.getElementById(containerId);
  if (!el || el.dataset.ready) return;
  el.dataset.ready = '1';

  el.innerHTML = `
    <div class="rounded-xl border bg-white p-4 text-left">
      <p class="text-sm font-medium text-gray-800" data-i18n="pickup.title"></p>
      <p class="mt-1 text-sm font-semibold text-qaz-teal">${PICKUP.address}, ${PICKUP.city}</p>
      <iframe
        title="Карта самовывоза"
        class="mt-3 w-full rounded-lg border border-gray-200"
        height="280"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src="${PICKUP.osmEmbed}"
      ></iframe>
      <a
        href="${PICKUP.gisUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-qaz-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
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
      <a href="${KASPI_URL}" target="_blank" rel="noopener noreferrer" class="mx-auto mt-3 block w-fit">
        <img src="${KASPI_QR_IMG}" width="160" height="160" alt="Kaspi QR" class="rounded-lg border bg-white p-2 shadow-sm" />
      </a>
      <p class="mt-2 text-center">
        <a href="${KASPI_URL}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-red-600 hover:underline">kaspi.kz</a>
      </p>
    </div>
  `;
  I18n.apply();
}

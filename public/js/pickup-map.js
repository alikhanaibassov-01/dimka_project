/** Точка самовывоза — https://go.2gis.com/Pr8me */
const PICKUP = {
  address: 'пр. Аль-Фараби, 93',
  city: 'Алматы',
  lat: 43.212667,
  lon: 76.911417,
  zoom: 16,
  firmId: '9429940001710865',
  gisUrl: 'https://go.2gis.com/Pr8me',
  mapEmbed: 'https://2gis.kz/almaty/firm/9429940001710865?m=76.911417,43.212667/16',
};

const KASPI_URL = 'https://kaspi.kz';
const KASPI_QR_IMG = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(KASPI_URL)}`;

let dgWidgetScriptPromise = null;

function loadDgWidgetScript() {
  if (window.DGWidgetLoader) return Promise.resolve();
  if (dgWidgetScriptPromise) return dgWidgetScriptPromise;
  dgWidgetScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.charset = 'utf-8';
    s.src = 'https://widgets.2gis.com/js/DGWidgetLoader.js';
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
  return dgWidgetScriptPromise;
}

function embed2gisWidget(host) {
  loadDgWidgetScript()
    .then(() => {
      // eslint-disable-next-line no-undef, no-new
      new DGWidgetLoader({
        width: '100%',
        height: 320,
        borderRadius: 12,
        pos: { lat: PICKUP.lat, lon: PICKUP.lon, zoom: PICKUP.zoom },
        opt: { city: 'almaty' },
        org: [{ id: PICKUP.firmId }],
      });
      setTimeout(() => {
        const iframe = document.querySelector('iframe[src*="2gis"]');
        if (iframe && host && !host.contains(iframe)) {
          iframe.classList.add('w-full', 'rounded-lg', 'border-0');
          host.appendChild(iframe);
        }
      }, 600);
    })
    .catch(() => {
      host.innerHTML = `<iframe title="2GIS" class="w-full rounded-lg border-0" height="320" loading="lazy" src="${PICKUP.mapEmbed}"></iframe>`;
    });
}

function renderPickupMap(containerId) {
  const el = document.getElementById(containerId);
  if (!el || el.dataset.loaded) return;
  el.dataset.loaded = '1';

  el.innerHTML = `
    <div class="rounded-xl border bg-white p-4 text-left">
      <p class="text-sm font-medium text-gray-800" data-i18n="pickup.title"></p>
      <p class="mt-1 text-sm font-semibold text-qaz-teal">${PICKUP.address}, ${PICKUP.city}</p>
      <div id="${containerId}-widget" class="mt-3 min-h-[320px] overflow-hidden rounded-lg bg-gray-100"></div>
      <a href="${PICKUP.gisUrl}" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-qaz-teal">
        <span data-i18n="pickup.open2gis"></span> →
      </a>
    </div>
  `;
  I18n.apply();

  const widgetHost = document.getElementById(`${containerId}-widget`);
  if (widgetHost) embed2gisWidget(widgetHost);
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

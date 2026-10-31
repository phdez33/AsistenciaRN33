// Service worker: guarda la app para que abra sin internet. Las llamadas a Apps Script nunca se guardan.
const VERSION = 'rn33-v4';
const ARCHIVOS = ['./', 'index.html', 'jsQR.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'logo-160.webp', 'logo-360.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Red primero (para recibir actualizaciones); si no hay red, la copia guardada.
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});

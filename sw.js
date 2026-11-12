/* Service worker: precache dell'app per l'uso offline. La versione cambia a ogni build. */
const V = 'dvp-c0b6f9c076';
const ASSETS = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","maskable-512.png","apple-touch-icon.png","exceljs.min.js","pdf.min.js","pdf.worker.min.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('dvp-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // chiamate esterne (es. servizio AI) non passano dalla cache
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});

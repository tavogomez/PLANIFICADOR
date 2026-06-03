const CACHE = 'eco-v1';
const ASSETS = ['/Economia---Personal/', '/Economia---Personal/index.html', '/Economia---Personal/manifest.json', '/Economia---Personal/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(r => {
        if (r && r.status === 200 && r.type === 'basic') {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }
        return r;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

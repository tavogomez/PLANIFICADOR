const CACHE = 'eco-v4';
const STATIC = ['/Economia---Personal/manifest.json', '/Economia---Personal/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname === '/Economia---Personal';

  if (isHTML) {
    // Network-first para HTML: siempre busca actualización, cae al caché si offline
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first para assets estáticos
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(r => {
          if (r && r.status === 200 && r.type === 'basic') {
            caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          }
          return r;
        });
      })
    );
  }
});

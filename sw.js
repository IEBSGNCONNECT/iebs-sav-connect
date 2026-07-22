/* IEBS SAV Connect — Service Worker partagé
   v2 : ne met en cache QUE les icônes. Toutes les pages (HTML) sont toujours
   rechargées depuis le réseau pour éviter de servir une version obsolète. */
const CACHE_NAME = 'iebs-sav-connect-v2';
const PRECACHE_URLS = ['./icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = event.request.url;

  if(url.endsWith('.png')){
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Pages, scripts, manifests: toujours réseau, jamais de cache obsolète
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
  );
});

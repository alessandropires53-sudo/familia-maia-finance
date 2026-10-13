const CACHE_NAME = 'maia-finance-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through padrão para garantir funcionamento da rede
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
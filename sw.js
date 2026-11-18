/* Portfolio service worker — retire the old cache-first version.
   The portfolio is served online-first; legacy site caches are removed. */
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('musaddiq-portfolio-'))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// No fetch handler: use the current deployed files from the network.

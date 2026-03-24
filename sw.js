self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Logic for offline caching can go here later
  event.respondWith(fetch(event.request));
});

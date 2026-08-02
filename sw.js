/* Katha Kids — Service Worker (offline-first shell caching) */
const CACHE = 'kathakids-v3';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/db.js',
  './js/tts.js',
  './js/ai.js',
  './js/firebase-config.js',
  './js/firebase.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache AI provider calls — always go to network.
  if (url.hostname.includes('openai.com') ||
      url.hostname.includes('googleapis.com')) {
    return;
  }

  // For same-origin app shell: serve cached immediately (offline-capable)
  // and re-fetch in the background so updates propagate automatically.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        }).catch(() => cached || caches.match('./index.html'));
        return cached || network;
      })
    );
  }
});

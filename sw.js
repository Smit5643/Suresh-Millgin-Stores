// Suresh Millgin Stores — SW v20260302_082943
// Always loads from: https://sureshmillginstores.vercel.app

const CACHE = 'sms-assets-v20260302_082943';
const APP_URL = 'https://sureshmillginstores.vercel.app';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([
      APP_URL + '/icon-192.png',
      APP_URL + '/icon-512.png',
    ]).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname !== location.hostname) return;

  // HTML — always fresh from Vercel, never cached
  if (e.request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(APP_URL + '/', {cache: 'no-store'})
        .catch(() => fetch(e.request, {cache: 'no-store'}))
    );
    return;
  }

  // Icons — cache for speed
  if (url.pathname.endsWith('.png') || url.pathname.endsWith('.ico')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

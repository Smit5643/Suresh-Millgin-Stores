// Suresh Millgin Stores — PWABuilder SW v20260228_091607
// Always loads from: https://sureshmillginstores.vercel.app

const CACHE = 'sms-pwa-v20260228_091607';
const APP_URL = 'https://sureshmillginstores.vercel.app';

self.addEventListener('install', e => { self.skipWaiting(); });

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

  // Always load HTML from the correct Vercel URL
  if (e.request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(APP_URL + '/', {cache: 'no-store'})
        .catch(() => fetch(e.request, {cache: 'no-store'}))
    );
    return;
  }
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

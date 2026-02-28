// Suresh Millgin Stores — Service Worker v20260228_070906
// Strategy: NETWORK FIRST — always get latest version
// Falls back to cache only when offline

const CACHE_NAME = 'sms-v20260228_070906';
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: pre-cache but don't block
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// Activate: delete ALL old caches immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // take control immediately
  );
});

// Fetch: NETWORK FIRST — always try network, cache only as fallback
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and external API calls entirely
  if (e.request.method !== 'GET') return;
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('emailjs') ||
      url.hostname.includes('ipify') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('workbox')) return;

  e.respondWith(
    // Always try network first — gets latest version
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          // Update cache with fresh version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Only use cache when offline
        return caches.match(e.request)
          .then(cached => cached || caches.match('/index.html'));
      })
  );
});

// Listen for skip-waiting message
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

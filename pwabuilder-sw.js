// Suresh Millgin Stores — PWABuilder SW v20260228_070906
// Network first — always loads latest version from server

const CACHE = "sms-pwa-v20260228_070906";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  await self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add('/index.html').catch(() => {}))
  );
});

self.addEventListener('activate', async (event) => {
  // Delete all old caches
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  await self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase') || url.hostname.includes('ipify')) return;

  event.respondWith(
    // Network first — gets latest index.html every time
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('/index.html')))
  );
});

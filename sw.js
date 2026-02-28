// ═══════════════════════════════════════════════════════════
// Suresh Millgin Stores — Service Worker
// Strategy: Network-first for API calls, Cache-first for assets
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'sms-v20260228';
const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// ── Install: pre-cache static assets ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Partial failure OK — cache what we can
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing ──
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // NEVER intercept Supabase API calls — let them go to network directly
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('supabase.io') ||
      url.hostname.includes('emailjs.com') ||
      url.hostname.includes('ipify.org') ||
      url.hostname.includes('jsdelivr.net')) {
    return; // bypass SW entirely for these
  }

  // For HTML/JS/CSS/icons: cache-first with network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET responses for static assets
        if (response.ok && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: return cached HTML if available
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

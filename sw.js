// Offline support: pages are fetched from the network first and cached; when offline the cached copy is shown.
// Videos and PDFs are never cached (too large). Redirects (e.g. to the login page) are never cached.
const CACHE = 'jip-v2';
const SHELL = ['login.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  // Cache the shell one file at a time; a failure on one file must not stop the app from installing.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(SHELL.map(u => fetch(u).then(r => r.ok && !r.redirected ? c.put(u, r) : null).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', e => {
  if (e.data === 'logout') e.waitUntil(caches.delete(CACHE));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin !== location.origin) {
    // Google Fonts: cache-first so the app looks right offline
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
      })));
    }
    return;
  }
  if (/\.(mp4|pdf)$/i.test(url.pathname) || url.pathname.includes('/api/')) return; // network only

  e.respondWith(fetch(req).then(res => {
    if (res.ok && !res.redirected && res.type === 'basic') {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })
    .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html').then(h => h || caches.match('./')) : undefined))
    .then(hit => hit || new Response('You are offline and this page has not been opened before.', { status: 503, headers: { 'Content-Type': 'text/plain' } }))));
});

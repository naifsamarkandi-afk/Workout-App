/**
 * Service worker for Swolemates.
 *
 * Hand-written rather than generated, so there's no build-time dependency and
 * nothing to keep in sync. The strategy leans on the fact that Vite gives every
 * built asset a content hash:
 *
 *   /assets/*        cache-first   — the hash changes when the file does, so a
 *                                    cached copy can never be stale
 *   navigations      network-first — always try for a fresh index.html, fall
 *                                    back to the cached shell when offline
 *   everything else  stale-while-revalidate for icons, manifest, fonts
 *   /api/*           never cached  — estimates must hit the network
 *
 * Bump CACHE when changing this file; `activate` deletes every other cache.
 */

const CACHE = 'swolemates-v1'
const APP_SHELL = '/index.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([APP_SHELL, '/manifest.webmanifest']))
      // A failed precache must not block activation — runtime caching will
      // pick these up on the next request anyway.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Food estimates are never served from cache.
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(APP_SHELL, copy))
          return res
        })
        .catch(() => caches.match(APP_SHELL).then((r) => r ?? Response.error())),
    )
    return
  }

  // Content-hashed build output: safe to serve from cache indefinitely.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
            return res
          }),
      ),
    )
    return
  }

  // Icons, manifest, anything else static.
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => hit ?? Response.error())
      return hit ?? network
    }),
  )
})

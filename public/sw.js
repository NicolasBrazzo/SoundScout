const CACHE_NAME = 'soundscout-v1'

const PRECACHE_URLS = [
  '/',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ── Install: precache app shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch strategies ──
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests (POST token exchanges, etc.)
  if (request.method !== 'GET') return

  // Never cache Spotify auth endpoints
  if (url.hostname === 'accounts.spotify.com') return

  // Network-first for API calls (Spotify + MusicBrainz)
  if (
    url.hostname === 'api.spotify.com' ||
    url.hostname === 'musicbrainz.org'
  ) {
    event.respondWith(networkFirst(request))
    return
  }

  // Cache-first for same-origin assets (HTML, CSS, JS, icons)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
    return
  }
})

// ── Cache-first strategy ──
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    if (request.mode === 'navigate') {
      return offlineFallback()
    }
    return new Response('Offline', { status: 503 })
  }
}

// ── Network-first strategy ──
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    return new Response(
      JSON.stringify({ error: 'offline', message: 'Connettiti per vedere le nuove uscite' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ── Offline fallback page ──
function offlineFallback() {
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SoundScout - Offline</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d0d0f;
      color: #f3f4f6;
      font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 2rem;
    }
    h1 { color: #863bff; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #9ca3af; font-size: 1rem; }
  </style>
</head>
<body>
  <div>
    <h1>SoundScout</h1>
    <p>Connettiti per vedere le nuove uscite</p>
  </div>
</body>
</html>`
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

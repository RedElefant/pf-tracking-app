const CACHE_NAME = "PFStrength-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./styles.css",
  "https://cdn.jsdelivr.net/npm/chart.js", // External dependency
];

// ✅ Install: Cache app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[Service Worker] Caching app shell...");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ✅ Activate: Clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch: Serve cached first, then network fallback
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then(networkResponse => {
          // Cache new resource dynamically
          if (
            event.request.url.startsWith(self.location.origin) &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Optional: fallback offline page could go here
          return new Response(
            "<h1>Offline</h1><p>You're offline. Reconnect to sync workouts.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        });
    })
  );
});

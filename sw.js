const CACHE_NAME = "pf-circuit-cache-v1";
const urlsToCache = [
  "./index.html",
  "./manifest.json",
  "./sw.js"
  // add any other files you reference, e.g., CSS or JS
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

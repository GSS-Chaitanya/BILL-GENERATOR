// sw.js
const cacheName = "hardware-site-cache-v1";
const assets = [
  "/",
  "/demo.html",
  "/demo.css",
  "/demoscript.js",
  "/icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});

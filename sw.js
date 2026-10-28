/* Offline support: precache every file the guide needs, then serve from cache.
   Bump CACHE_VERSION whenever you edit content or code so phones update. */
const CACHE_VERSION = "ldn26-v2";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/app.js",
  "./js/sun.js",
  "./data/itinerary.js",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./fonts/playfair-display-latin-400-italic.woff2",
  "./fonts/playfair-display-latin-600-normal.woff2",
  "./fonts/playfair-display-latin-700-normal.woff2",
  "./fonts/source-serif-4-latin-400-normal.woff2",
  "./fonts/source-serif-4-latin-400-italic.woff2",
  "./fonts/source-serif-4-latin-600-normal.woff2",
  "./fonts/source-serif-4-latin-700-normal.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Google Maps links etc. go straight to the network

  // Page loads (including ?today=… test URLs) always get the cached app shell.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((hit) => hit || fetch(req))
    );
    return;
  }

  // Cache first, then network; anything new and same-origin gets stored for next time.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});

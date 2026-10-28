/* Offline support: precache every file the guide needs, then serve from cache.
   Bump CACHE_VERSION whenever you edit content or code so phones update. */
const CACHE_VERSION = "ldn26-v8";
const PHOTO_CACHE = "ldn26-photos"; // Wikimedia photos; kept across app updates
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
  "./fonts/inter-latin-var.woff2",
  "./fonts/inter-latin-var-italic.woff2",
  "./fonts/jost-latin-var.woff2",
  "./fonts/vt323-latin.woff2",
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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION && k !== PHOTO_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Location photos from Wikimedia: cache first, so they keep working offline once seen.
  if (url.hostname === "upload.wikimedia.org") {
    event.respondWith(
      caches.open(PHOTO_CACHE).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === "opaque") cache.put(req, res.clone());
        return res;
      })))
    );
    return;
  }
  if (url.origin !== self.location.origin) return; // Google Maps links, Wikipedia API etc. go straight to the network

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

const CACHE_NAME = "project-prime-invictus-ignis-v47";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=46",
  "./app.js?v=46",
  "./manifest.webmanifest",
  "./assets/logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isFreshAsset =
    event.request.mode === "navigate" ||
    [".html", ".css", ".js"].some((extension) => requestUrl.pathname.endsWith(extension));

  if (isFreshAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SHOW_NOTIFICATION") return;
  const { title, options } = event.data;
  event.waitUntil(self.registration.showNotification(title, options || {}));
});

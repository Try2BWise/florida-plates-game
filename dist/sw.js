const APP_CACHE = "florida-plates-app-v2";
const RUNTIME_CACHE = "florida-plates-runtime-v2";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/app-icon.svg",
  "/apple-touch-icon.png",
  "/pwa-192.png",
  "/pwa-512.png",
  "/plate-assets.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async (cache) => {
      await cache.addAll(APP_SHELL);

      const assetResponse = await fetch("/plate-assets.json");
      if (!assetResponse.ok) {
        throw new Error("Unable to load plate asset list");
      }

      const plateAssets = await assetResponse.json();
      if (Array.isArray(plateAssets) && plateAssets.length > 0) {
        await cache.addAll(plateAssets);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![APP_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  if (isSameOrigin && request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (!response.ok) {
            return response;
          }

          const responseClone = response.clone();
          void caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (!response.ok) {
            return response;
          }

          const responseClone = response.clone();
          void caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});

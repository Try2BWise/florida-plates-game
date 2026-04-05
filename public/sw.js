const APP_CACHE = "every-pl8-app-v9";
const RUNTIME_CACHE = "every-pl8-runtime-v9";
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/pwa-192.png`,
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/pwa-192.png`,
  `${BASE_PATH}/pwa-512.png`,
  `${BASE_PATH}/plate-assets.json`,
  `${BASE_PATH}/badge-assets.json`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async (cache) => {
      await cache.addAll(APP_SHELL);

      const assetResponse = await fetch(`${BASE_PATH}/plate-assets.json`);
      if (!assetResponse.ok) {
        throw new Error("Unable to load plate asset list");
      }

      const badgeAssetResponse = await fetch(`${BASE_PATH}/badge-assets.json`);
      if (!badgeAssetResponse.ok) {
        throw new Error("Unable to load badge asset list");
      }

      const plateAssets = await assetResponse.json();
      const badgeAssets = await badgeAssetResponse.json();
      if (Array.isArray(plateAssets) && plateAssets.length > 0) {
        await cache.addAll(
          plateAssets.map((assetPath) => new URL(assetPath, self.location.origin + BASE_PATH + "/").toString())
        );
      }
      if (Array.isArray(badgeAssets) && badgeAssets.length > 0) {
        await cache.addAll(
          badgeAssets.map((assetPath) => new URL(assetPath, self.location.origin + BASE_PATH + "/").toString())
        );
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
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  const staleWhileRevalidate = async (cacheName, cacheKey = request, fallback = null) => {
    const cache = await caches.open(cacheName);
    const cached = await caches.match(cacheKey);

    const networkPromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          void cache.put(cacheKey, response.clone());
        }
        return response;
      })
      .catch(() => null);

    if (cached) {
      void networkPromise;
      return cached;
    }

    const networkResponse = await networkPromise;
    return networkResponse ?? (fallback ? caches.match(fallback) : null);
  };

  const cacheFirst = async (cacheName, cacheKey = request) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
      void cache.put(cacheKey, response.clone());
    }
    return response;
  };

  if (request.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(APP_CACHE, `${BASE_PATH}/`, `${BASE_PATH}/`));
    return;
  }

  const isAppShellAsset =
    isSameOrigin &&
    (
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "manifest" ||
      requestUrl.pathname.startsWith(`${BASE_PATH}/assets/`) ||
      requestUrl.pathname === `${BASE_PATH}/manifest.webmanifest`
    );

  if (isAppShellAsset) {
    event.respondWith(staleWhileRevalidate(RUNTIME_CACHE));
    return;
  }

  if (isSameOrigin && request.destination === "image") {
    event.respondWith(cacheFirst(RUNTIME_CACHE));
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
        .catch(() => caches.match(`${BASE_PATH}/`));
    })
  );
});

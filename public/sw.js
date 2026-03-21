const APP_CACHE = "florida-plates-app-v5";
const RUNTIME_CACHE = "florida-plates-runtime-v5";
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/app-icon.svg`,
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/pwa-192.png`,
  `${BASE_PATH}/pwa-512.png`,
  `${BASE_PATH}/plate-assets.json`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async (cache) => {
      await cache.addAll(APP_SHELL);

      const assetResponse = await fetch(`${BASE_PATH}/plate-assets.json`);
      if (!assetResponse.ok) {
        throw new Error("Unable to load plate asset list");
      }

      const plateAssets = await assetResponse.json();
      if (Array.isArray(plateAssets) && plateAssets.length > 0) {
        await cache.addAll(
          plateAssets.map((assetPath) => new URL(assetPath, `${BASE_PATH}/`).toString())
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
    )
  );
  self.clients.claim();
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

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE_PATH}/`))
    );
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
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) {
            return response;
          }

          const responseClone = response.clone();
          void caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
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
        .catch(() => caches.match(`${BASE_PATH}/`));
    })
  );
});

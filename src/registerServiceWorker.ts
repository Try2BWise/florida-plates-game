export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const baseUrl = import.meta.env.BASE_URL;
      const serviceWorkerUrl = `${baseUrl}sw.js`;
      let hasPendingRefresh = false;

      void navigator.serviceWorker
        .register(serviceWorkerUrl, { scope: baseUrl })
        .then((registration) => {
          // Always check for updates after registration
          registration.update();
          const notifyUpdateReady = () => {
            window.dispatchEvent(
              new CustomEvent("fl-plates:update-ready", {
                detail: { registration }
              })
            );
          };

          if (registration.waiting) {
            notifyUpdateReady();
          }

          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (!installingWorker) {
              return;
            }

            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                notifyUpdateReady();
              }
            });
          });

          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (hasPendingRefresh) {
              return;
            }
            hasPendingRefresh = true;
            window.location.reload();
          });

          // Also check for updates on every page load
          window.addEventListener("focus", () => {
            registration.update();
          });
        });
    });
  }
}

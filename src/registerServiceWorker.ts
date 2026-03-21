export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const baseUrl = import.meta.env.BASE_URL;
      const serviceWorkerUrl = `${baseUrl}sw.js`;
      void navigator.serviceWorker.register(serviceWorkerUrl, { scope: baseUrl });
    });
  }
}

import { Network } from "@capacitor/network";

type NetworkListener = (isConnected: boolean) => void;

let currentStatus = true; // assume online until proven otherwise
const listeners = new Set<NetworkListener>();

/**
 * Initialize network monitoring. Call once at startup.
 * Uses Capacitor Network plugin on native, falls back to
 * navigator.onLine + events on PWA/browser.
 */
export async function initNetworkMonitor(): Promise<void> {
  try {
    const status = await Network.getStatus();
    currentStatus = status.connected;

    Network.addListener("networkStatusChange", (status) => {
      currentStatus = status.connected;
      for (const listener of listeners) {
        listener(currentStatus);
      }
    });
  } catch {
    // Fallback to web APIs
    currentStatus = navigator.onLine;
    window.addEventListener("online", () => {
      currentStatus = true;
      for (const listener of listeners) listener(true);
    });
    window.addEventListener("offline", () => {
      currentStatus = false;
      for (const listener of listeners) listener(false);
    });
  }
}

/** Synchronous check — is the device currently online? */
export function isOnline(): boolean {
  return currentStatus;
}

/** Subscribe to network status changes. Returns unsubscribe function. */
export function onNetworkChange(listener: NetworkListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

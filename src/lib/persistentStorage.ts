import { Preferences } from "@capacitor/preferences";

/**
 * Persistent storage layer that uses Capacitor Preferences (native)
 * with localStorage as sync fallback (PWA).
 *
 * Reads are synchronous from an in-memory cache.
 * Writes go to both the cache and the backing store.
 *
 * Call `initStorage()` at app startup before any reads.
 */

const cache = new Map<string, string>();
let initialized = false;
let useNative = false;

/**
 * Initialize storage — loads all known keys from Capacitor Preferences
 * into the in-memory cache. Falls back to localStorage if Preferences
 * is unavailable (PWA/browser).
 */
export async function initStorage(keys: string[]): Promise<void> {
  // Try Capacitor Preferences first
  try {
    await Preferences.get({ key: "__storage_probe" });
    // If we got here without throwing, native is available
    useNative = true;

    // Migrate: if a key exists in localStorage but not Preferences, copy it over
    for (const key of keys) {
      const { value: nativeValue } = await Preferences.get({ key });
      const localValue = safeLocalGet(key);

      if (nativeValue != null) {
        cache.set(key, nativeValue);
      } else if (localValue != null) {
        // Migrate from localStorage to Preferences
        cache.set(key, localValue);
        await Preferences.set({ key, value: localValue });
      }
    }
  } catch {
    // Capacitor Preferences not available — pure localStorage mode
    useNative = false;
    for (const key of keys) {
      const value = safeLocalGet(key);
      if (value != null) {
        cache.set(key, value);
      }
    }
  }

  initialized = true;
}

/** Synchronous read from cache. Returns null if key not found. */
export function getItem(key: string): string | null {
  return cache.get(key) ?? safeLocalGet(key);
}

/** Write to cache + persist to backing store. */
export function setItem(key: string, value: string): void {
  cache.set(key, value);
  safeLocalSet(key, value);

  if (useNative) {
    void Preferences.set({ key, value });
  }
}

/** Remove from cache + backing store. */
export function removeItem(key: string): void {
  cache.delete(key);
  safeLocalRemove(key);

  if (useNative) {
    void Preferences.remove({ key });
  }
}

/** Check if storage has been initialized. */
export function isInitialized(): boolean {
  return initialized;
}

// ── localStorage helpers (never throw) ──

function safeLocalGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable — native Preferences still works
  }
}

function safeLocalRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

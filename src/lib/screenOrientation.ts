import { ScreenOrientation } from "@capacitor/screen-orientation";

/**
 * Lock the app to portrait orientation.
 * No-op on PWA/browser.
 */
export async function lockPortrait(): Promise<void> {
  try {
    await ScreenOrientation.lock({ orientation: "portrait" });
  } catch {
    // Not available
  }
}

/** Release orientation lock. */
export async function unlockOrientation(): Promise<void> {
  try {
    await ScreenOrientation.unlock();
  } catch {
    // Not available
  }
}

import { Clipboard } from "@capacitor/clipboard";

/**
 * Copy text to clipboard. Tries Capacitor native first, falls back to web API.
 * Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.write({ string: text });
    return true;
  } catch {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through
    }
    return false;
  }
}

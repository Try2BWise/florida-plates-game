import { Browser } from "@capacitor/browser";

/**
 * Open a URL in the in-app browser (SFSafariViewController on iOS).
 * Falls back to window.open on PWA/browser.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  try {
    await Browser.open({ url, presentationStyle: "popover" });
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

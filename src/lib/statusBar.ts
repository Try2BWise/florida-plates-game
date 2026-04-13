import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Set the status bar text/icon style to match the current theme.
 * Light theme → dark status bar content. Dark theme → light content.
 * No-ops gracefully on PWA/browser.
 */
export async function updateStatusBarStyle(resolvedTheme: "light" | "dark"): Promise<void> {
  try {
    await StatusBar.setStyle({
      style: resolvedTheme === "dark" ? Style.Dark : Style.Light,
    });
  } catch {
    // Not available on this platform
  }
}

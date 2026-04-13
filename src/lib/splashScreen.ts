import { SplashScreen } from "@capacitor/splash-screen";

/**
 * Hide the native splash screen with a fade.
 * No-op on PWA/browser.
 */
export async function hideSplashScreen(): Promise<void> {
  try {
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    // Not available
  }
}

import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { setSelectedStateId } from "../games/activeGame";

type ResumeListener = () => void;
const resumeListeners = new Set<ResumeListener>();

/**
 * Initialize app lifecycle handlers. Call once at startup.
 *
 * - Handles deep links: everypl8://state/{stateId}
 * - Fires resume callbacks when app returns to foreground
 * - Handles Android back button (exits app from home view)
 */
export async function initAppLifecycle(): Promise<void> {
  try {
    // Deep link handler
    App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);
      // Handle everypl8://state/{stateId}
      const stateMatch = url.pathname.match(/^\/state\/(.+)$/);
      if (stateMatch) {
        const stateId = stateMatch[1];
        setSelectedStateId(stateId);
        window.location.reload();
      }
    });

    // Resume handler — fires when app returns to foreground
    App.addListener("resume", () => {
      for (const listener of resumeListeners) {
        listener();
      }
    });

    // Back button handler (Android) — exit app from home view
    App.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack) {
        void App.exitApp();
      } else {
        window.history.back();
      }
    });
  } catch {
    // Not available on web — no-op
  }
}

/** Subscribe to app resume events. Returns unsubscribe function. */
export function onAppResume(listener: ResumeListener): () => void {
  resumeListeners.add(listener);
  return () => resumeListeners.delete(listener);
}

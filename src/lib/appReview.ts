import { InAppReview } from "@capacitor-community/in-app-review";
import { getItem, setItem } from "./persistentStorage";

const LAST_REVIEW_PROMPT_KEY = "every-pl8-last-review-prompt";
const REVIEW_PROMPT_COOLDOWN_DAYS = 90;

/**
 * Request an App Store review prompt. Apple throttles to ~3x per year per app,
 * so we additionally throttle ourselves to once per 90 days to avoid wasting
 * prompts on users who won't complete them.
 *
 * Safe to call after any positive moment (badge earned, milestone hit).
 * No-op on PWA/browser.
 */
export async function requestAppReview(): Promise<void> {
  try {
    const lastPromptIso = getItem(LAST_REVIEW_PROMPT_KEY);
    if (lastPromptIso) {
      const last = new Date(lastPromptIso).getTime();
      const msSince = Date.now() - last;
      const days = msSince / (1000 * 60 * 60 * 24);
      if (days < REVIEW_PROMPT_COOLDOWN_DAYS) return;
    }

    await InAppReview.requestReview();
    setItem(LAST_REVIEW_PROMPT_KEY, new Date().toISOString());
  } catch {
    // Not available or rate-limited by Apple — silently no-op
  }
}

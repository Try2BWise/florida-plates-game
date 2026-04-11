import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// Graceful no-op if haptics aren't available (PWA/browser, simulator)
async function safeHaptic(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch {
    // Not available on this platform — ignore
  }
}

export async function hapticsPlateFound(): Promise<void> {
  await safeHaptic(() => Haptics.impact({ style: ImpactStyle.Medium }));
}

export async function hapticsBadgeEarned(): Promise<void> {
  await safeHaptic(() => Haptics.notification({ type: NotificationType.Success }));
}

export async function hapticsPlateCleared(): Promise<void> {
  await safeHaptic(() => Haptics.impact({ style: ImpactStyle.Light }));
}

export async function hapticsPinToggled(): Promise<void> {
  await safeHaptic(() => Haptics.impact({ style: ImpactStyle.Light }));
}

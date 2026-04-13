import { LocalNotifications } from "@capacitor/local-notifications";

let permissionGranted = false;

/**
 * Request notification permission. Call once at startup or
 * when the user enables notifications in settings.
 * No-ops on PWA/browser.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    permissionGranted = result.display === "granted";
    return permissionGranted;
  } catch {
    return false;
  }
}

/**
 * Check if notifications are permitted without prompting.
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.checkPermissions();
    permissionGranted = result.display === "granted";
    return permissionGranted;
  } catch {
    return false;
  }
}

/**
 * Schedule a "badge proximity" notification.
 * E.g., "You're 1 plate away from earning New England Spotter!"
 */
export async function notifyBadgeProximity(badgeName: string, remaining: number): Promise<void> {
  if (!permissionGranted) return;
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashCode(badgeName),
        title: "Almost there!",
        body: `${remaining} more plate${remaining === 1 ? "" : "s"} to earn ${badgeName}`,
        smallIcon: "ic_stat_notify",
        largeIcon: "ic_launcher",
      }]
    });
  } catch {
    // Not available
  }
}

/**
 * Schedule a daily reminder notification.
 * Fires at the given hour (local time) every day.
 */
export async function scheduleDailyReminder(hour: number): Promise<void> {
  if (!permissionGranted) return;
  try {
    // Cancel any existing daily reminder first
    await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });

    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: "Spot any plates today?",
        body: "Open Every PL8 to log your latest finds.",
        smallIcon: "ic_stat_notify",
        largeIcon: "ic_launcher",
        schedule: {
          on: { hour, minute: 0 },
          repeats: true,
        }
      }]
    });
  } catch {
    // Not available
  }
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
  } catch {
    // Not available
  }
}

/**
 * Schedule an inactivity tickler — fires after `days` days.
 * Call this every time the app opens; it resets the timer so
 * the notification only fires if the user doesn't return.
 */
export async function scheduleInactivityTickler(days: number = 3): Promise<void> {
  if (!permissionGranted) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 9998 }] });

    const fireAt = new Date();
    fireAt.setDate(fireAt.getDate() + days);
    fireAt.setHours(12, 0, 0, 0); // noon on that day

    await LocalNotifications.schedule({
      notifications: [{
        id: 9998,
        title: "We miss you!",
        body: "There are plates out there waiting to be spotted. Open Every PL8 and keep collecting!",
        smallIcon: "ic_stat_notify",
        largeIcon: "ic_launcher",
        schedule: { at: fireAt },
      }]
    });
  } catch {
    // Not available
  }
}

/**
 * Cancel the inactivity tickler (e.g., if notifications are disabled).
 */
export async function cancelInactivityTickler(): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 9998 }] });
  } catch {
    // Not available
  }
}

/** Simple string hash for generating stable notification IDs */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100000;
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import { registerServiceWorker } from "./registerServiceWorker";
import { initStorage, getItem } from "./lib/persistentStorage";
import { initNetworkMonitor } from "./lib/networkStatus";
import { checkNotificationPermission, scheduleInactivityTickler } from "./lib/notifications";
import { initAppLifecycle, onAppResume } from "./lib/appLifecycle";
import { initKeyboardManager } from "./lib/keyboardManager";
import { hideSplashScreen } from "./lib/splashScreen";
import { lockPortrait } from "./lib/screenOrientation";
import { stateRegistry } from "./games/stateRegistry";

// All known storage keys — init loads them into the sync cache
// and migrates localStorage → Capacitor Preferences on native
const storageKeys = [
  "every-pl8-selected-state",
  "every-pl8-pinned-states",
  "every-pl8-browse-prefs",
  "every-pl8-safe-use-acknowledged",
  "florida-plates-theme",
  "florida-plates-ui-preferences",
  "florida-plates-onboarding-dismissed",
  "every-pl8-last-geo-prompt",
  "every-pl8-last-review-prompt",
  // Per-state discovery keys
  ...stateRegistry.map(s => `${s.id}-plates-discoveries`),
  // Per-state custom plates
  ...stateRegistry.map(s => `${s.id}-custom-plates`),
  // Per-state badge history (when each badge was earned, plus "seen" flag)
  ...stateRegistry.map(s => `${s.id}-plates-badge-history`),
];

Promise.all([
  initStorage(storageKeys),
  initNetworkMonitor(),
  initAppLifecycle(),
  initKeyboardManager(),
  lockPortrait(),
]).then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  registerServiceWorker();

  // Reset inactivity tickler on every app open/resume (if notifications enabled)
  const resetTickler = () => {
    const uiPrefsRaw = getItem("florida-plates-ui-preferences");
    if (!uiPrefsRaw) return;
    try {
      const prefs = JSON.parse(uiPrefsRaw);
      if (prefs.notificationsEnabled) {
        void checkNotificationPermission().then((granted) => {
          if (granted) void scheduleInactivityTickler(3);
        });
      }
    } catch { /* ignore */ }
  };

  resetTickler();
  onAppResume(resetTickler);

  // Hide splash screen after first paint
  requestAnimationFrame(() => void hideSplashScreen());
});

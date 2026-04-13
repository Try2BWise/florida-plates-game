import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { PageView } from "./PageView";
import { developer } from "../config/developer";
import { requestNotificationPermission, notifyBadgeProximity, scheduleInactivityTickler } from "../lib/notifications";
import { isOnline } from "../lib/networkStatus";
import { isInitialized } from "../lib/persistentStorage";
import { checkGeoPrompt } from "../lib/geoPrompt";
import { openInAppBrowser } from "../lib/inAppBrowser";
import { InAppReview } from "@capacitor-community/in-app-review";

interface SettingsPageProps {
  onBack: () => void;
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  onThemeChange: (t: "light" | "dark" | "system") => void;
  uiPreferences: { showSearch: boolean; showCategories: boolean; showArrangement: boolean; hapticsEnabled: boolean; notificationsEnabled: boolean; dailyReminderEnabled: boolean };
  onToggleUiPreference: (key: "showSearch" | "showCategories" | "showArrangement" | "hapticsEnabled" | "notificationsEnabled" | "dailyReminderEnabled") => void;
  onForceReload: () => void;
  foundCount: number;
  onExportProgress: () => void;
  onImportProgress: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDiscoveries: () => void;
  onShareApp: () => void;
  onChangeState: () => void;
  buildVersion: string;
  buildDateLabel: string;
  attribution: {
    text: string;
    agencyName: string;
    agencyUrl: string;
    logoPath: string;
    logoAlt: string;
  };
}

export function SettingsPage({
  onBack, theme, resolvedTheme, onThemeChange, uiPreferences, onToggleUiPreference,
  onForceReload, foundCount, onExportProgress, onImportProgress, onClearDiscoveries,
  onShareApp, onChangeState, buildVersion, buildDateLabel, attribution
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "about">("settings");
  const [debugBadge, setDebugBadge] = useState<string | null>(null);
  const [debugTickler, setDebugTickler] = useState<string | null>(null);
  const [debugGeo, setDebugGeo] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <PageView
      title="Settings"
      onBack={onBack}
      tabs={
        <>
          {(["settings", "about"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`view-toggle__chip ${activeTab === tab ? "view-toggle__chip--active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "settings" ? "Settings" : "About"}
            </button>
          ))}
        </>
      }
    >
      {activeTab === "settings" && (
        <div className="ios-list">
          <div>
            <div className="ios-list__section-label">Display</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={() => onThemeChange(theme === "system" ? resolvedTheme : "system")}>
                <span className="ios-list__row-label">Follow system</span>
                <span className={`toggle-switch ${theme === "system" ? "toggle-switch--on" : ""}`} />
              </button>
              <button
                type="button"
                className={`ios-list__row ${theme === "system" ? "ios-list__row--disabled" : ""}`}
                onClick={() => theme !== "system" && onThemeChange(resolvedTheme === "dark" ? "light" : "dark")}
                aria-disabled={theme === "system"}
              >
                <span className="ios-list__row-label">Dark mode</span>
                <span className={`toggle-switch ${resolvedTheme === "dark" ? "toggle-switch--on" : ""} ${theme === "system" ? "toggle-switch--muted" : ""}`} />
              </button>
              <button type="button" className="ios-list__row" onClick={() => onToggleUiPreference("showSearch")}>
                <span className="ios-list__row-label">Show search</span>
                <span className={`toggle-switch ${uiPreferences.showSearch ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="ios-list__row" onClick={() => onToggleUiPreference("showCategories")}>
                <span className="ios-list__row-label">Show categories</span>
                <span className={`toggle-switch ${uiPreferences.showCategories ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="ios-list__row" onClick={() => onToggleUiPreference("showArrangement")}>
                <span className="ios-list__row-label">Show sort</span>
                <span className={`toggle-switch ${uiPreferences.showArrangement ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="ios-list__row" onClick={() => onToggleUiPreference("hapticsEnabled")}>
                <span className="ios-list__row-label">Haptics</span>
                <span className={`toggle-switch ${uiPreferences.hapticsEnabled ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="ios-list__row" onClick={() => onToggleUiPreference("notificationsEnabled")}>
                <span className="ios-list__row-label">Badge alerts</span>
                <span className={`toggle-switch ${uiPreferences.notificationsEnabled ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className={`ios-list__row ${!uiPreferences.notificationsEnabled ? "ios-list__row--disabled" : ""}`} onClick={() => uiPreferences.notificationsEnabled && onToggleUiPreference("dailyReminderEnabled")} disabled={!uiPreferences.notificationsEnabled}>
                <span className="ios-list__row-label">Daily reminder</span>
                <span className={`toggle-switch ${uiPreferences.dailyReminderEnabled ? "toggle-switch--on" : ""} ${!uiPreferences.notificationsEnabled ? "toggle-switch--muted" : ""}`} />
              </button>
            </div>
            <div className="ios-list__section-footer">Badge alerts notify you when you're 1–2 plates away from earning a badge. Daily reminder fires at 6 PM.</div>
          </div>

          <div>
            <div className="ios-list__section-label">App</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={onForceReload}>
                <span className="ios-list__row-label">Force Reload / Sync</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
              <button type="button" className="ios-list__row" onClick={onChangeState}>
                <span className="ios-list__row-label">Change State</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
            </div>
          </div>

          <div>
            <div className="ios-list__section-label">Progress</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={onExportProgress} disabled={foundCount === 0}>
                <span className="ios-list__row-label">Export Progress</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
              <button type="button" className="ios-list__row" onClick={() => importRef.current?.click()}>
                <span className="ios-list__row-label">Import Progress</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
              <input ref={importRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onImportProgress} />
            </div>
            <div className="ios-list__section-footer">Export saves your found plates as a backup file. Import restores from a backup.</div>
          </div>

          <div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row ios-list__row--destructive" onClick={onClearDiscoveries} disabled={foundCount === 0}>
                Clear Found Plates
              </button>
            </div>
            <div className="ios-list__section-footer">Removes all found plates from this device.</div>
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div className="ios-list">
          <div className="ios-list__hero">
            <img
              className="ios-list__hero-icon"
              src={`${import.meta.env.BASE_URL}apple-touch-icon.png`}
              alt="Every PL8"
            />
            <p className="ios-list__hero-name">Every PL8</p>
            <p className="ios-list__hero-meta">Version {buildVersion} · Built {buildDateLabel}</p>
            <button type="button" className="app-footer__share utility-card__action about-card__share" onClick={onShareApp} style={{ width: "auto", marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Icon name="share" size={16} /> Share
            </button>
          </div>

          <div>
            <div className="ios-list__section-label">Developer</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={() => void openInAppBrowser(developer.url)}>
                <span className="ios-list__row-label">{developer.name}</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
            </div>
          </div>

          <div>
            <div className="ios-list__section-label">Data Source</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={() => void openInAppBrowser(attribution.agencyUrl)}>
                <span className="ios-list__row-label">{attribution.agencyName}</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
            </div>
            <div className="ios-list__section-footer">{attribution.text.replace("{agency}", attribution.agencyName)}</div>
          </div>

          <div>
            <div className="ios-list__section-label">Acknowledgments</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={() => void openInAppBrowser("https://github.com/microsoft/fluentui-emoji")}>
                <span className="ios-list__row-label">Microsoft Fluent Emoji</span>
                <span className="ios-list__row-value">MIT License</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
              <button type="button" className="ios-list__row" onClick={() => void openInAppBrowser("https://proicons.com/icon-collections/stateface")}>
                <span className="ios-list__row-label">StateFace by ProPublica</span>
                <span className="ios-list__row-value">MIT License</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </button>
            </div>
          </div>

          <div>
            <div className="ios-list__section-label">Legal</div>
            <div className="ios-list__group">
              <a className="ios-list__row" href="privacy.html" target="_blank" rel="noreferrer">
                <span className="ios-list__row-label">Privacy Policy</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </a>
            </div>
            <div className="ios-list__section-footer">&copy; 2026 Gorilla Grin. All rights reserved.</div>
          </div>

          <div>
            <div className="ios-list__section-label">Debug</div>
            <div className="ios-list__group">
              <button type="button" className="ios-list__row" onClick={async () => {
                const granted = await requestNotificationPermission();
                if (granted) {
                  await notifyBadgeProximity("New England Spotter", 2);
                  setDebugBadge("Sent");
                } else {
                  setDebugBadge("Denied");
                }
              }}>
                <span className="ios-list__row-label">Test Badge Proximity</span>
                <span className="ios-list__row-value">{debugBadge ?? "Tap to fire"}</span>
              </button>
              <button type="button" className="ios-list__row" onClick={async () => {
                const granted = await requestNotificationPermission();
                if (granted) {
                  await scheduleInactivityTickler(0.003);
                  setDebugTickler("~4 min");
                } else {
                  setDebugTickler("Denied");
                }
              }}>
                <span className="ios-list__row-label">Test Inactivity Tickler</span>
                <span className="ios-list__row-value">{debugTickler ?? "Tap to schedule"}</span>
              </button>
              <button type="button" className="ios-list__row" onClick={async () => {
                const result = await checkGeoPrompt("__debug_force__");
                setDebugGeo(result ? result.message : "No match");
              }}>
                <span className="ios-list__row-label">Test Geo-Prompt</span>
                <span className="ios-list__row-value">{debugGeo ?? "Tap to check"}</span>
              </button>
              <button type="button" className="ios-list__row" onClick={async () => {
                try { await InAppReview.requestReview(); } catch { /* no-op */ }
              }}>
                <span className="ios-list__row-label">Test Review Prompt</span>
                <span className="ios-list__row-value">Tap to request</span>
              </button>
              <div className="ios-list__row">
                <span className="ios-list__row-label">Persistent Storage</span>
                <span className="ios-list__row-value">{isInitialized() ? "Active" : "Not init"}</span>
              </div>
              <div className="ios-list__row">
                <span className="ios-list__row-label">Network</span>
                <span className="ios-list__row-value">{isOnline() ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageView>
  );
}

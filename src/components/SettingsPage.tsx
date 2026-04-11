import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { PageView } from "./PageView";
import { developer } from "../config/developer";

interface SettingsPageProps {
  onBack: () => void;
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  onThemeChange: (t: "light" | "dark" | "system") => void;
  uiPreferences: { showSearch: boolean; showCategories: boolean; showArrangement: boolean; hapticsEnabled: boolean };
  onToggleUiPreference: (key: "showSearch" | "showCategories" | "showArrangement" | "hapticsEnabled") => void;
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
            </div>
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
              <a className="ios-list__row" href={developer.url} target="_blank" rel="noreferrer">
                <span className="ios-list__row-label">{developer.name}</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </a>
            </div>
          </div>

          <div>
            <div className="ios-list__section-label">Data Source</div>
            <div className="ios-list__group">
              <a className="ios-list__row" href={attribution.agencyUrl} target="_blank" rel="noreferrer">
                <span className="ios-list__row-label">{attribution.agencyName}</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </a>
            </div>
            <div className="ios-list__section-footer">{attribution.text.replace("{agency}", attribution.agencyName)}</div>
          </div>

          <div>
            <div className="ios-list__section-label">Acknowledgments</div>
            <div className="ios-list__group">
              <a className="ios-list__row" href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noreferrer">
                <span className="ios-list__row-label">Microsoft Fluent Emoji</span>
                <span className="ios-list__row-value">MIT License</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </a>
              <a className="ios-list__row" href="https://proicons.com/icon-collections/stateface" target="_blank" rel="noreferrer">
                <span className="ios-list__row-label">StateFace by ProPublica</span>
                <span className="ios-list__row-value">MIT License</span>
                <Icon name="chevron-right" size={14} className="ios-list__row-chevron" />
              </a>
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
        </div>
      )}
    </PageView>
  );
}

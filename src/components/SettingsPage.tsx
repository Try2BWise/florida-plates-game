import { useState } from "react";
import { Icon } from "./Icon";
import { PageView } from "./PageView";
import { developer } from "../config/developer";

interface SettingsPageProps {
  onBack: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  uiPreferences: { showSearch: boolean; showCategories: boolean; showArrangement: boolean };
  onToggleUiPreference: (key: "showSearch" | "showCategories" | "showArrangement") => void;
  onForceReload: () => void;
  foundCount: number;
  onExportProgress: () => void;
  onImportProgress: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDiscoveries: () => void;
  onShareApp: () => void;
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
  onBack, theme, onThemeToggle, uiPreferences, onToggleUiPreference,
  onForceReload, foundCount, onExportProgress, onImportProgress, onClearDiscoveries,
  onShareApp, buildVersion, buildDateLabel, attribution
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "about">("settings");

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
      {activeTab === "settings" ? (
        <div className="utility-stack">
          <section className="utility-card">
            <h3>Main screen controls</h3>
            <p className="utility-card__meta" style={{ marginBottom: 8 }}>These toggles only change which controls appear on the main game screen.</p>
            <div className="settings-list">
              <button type="button" className="settings-row settings-row--compact" onClick={onThemeToggle}>
                <span>Dark mode</span>
                <span className={`toggle-switch ${theme === "dark" ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="settings-row settings-row--compact" onClick={() => onToggleUiPreference("showSearch")}>
                <span>Show search</span>
                <span className={`toggle-switch ${uiPreferences.showSearch ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="settings-row settings-row--compact" onClick={() => onToggleUiPreference("showCategories")}>
                <span>Show categories</span>
                <span className={`toggle-switch ${uiPreferences.showCategories ? "toggle-switch--on" : ""}`} />
              </button>
              <button type="button" className="settings-row settings-row--compact" onClick={() => onToggleUiPreference("showArrangement")}>
                <span>Show sort</span>
                <span className={`toggle-switch ${uiPreferences.showArrangement ? "toggle-switch--on" : ""}`} />
              </button>
            </div>
          </section>
          <section className="utility-card utility-card--about">
            <h3>App Management</h3>
            <button type="button" className="view-toggle__chip" style={{ marginTop: 12, whiteSpace: 'nowrap', maxWidth: 'max-content', alignSelf: 'start' }} onClick={onForceReload}>Force Reload / Sync</button>
          </section>
          <section className="utility-card">
            <h3>Progress Management</h3>
            <div className="utility-card__meta" style={{ marginBottom: 12 }}>
              <ol style={{ paddingLeft: 18, margin: 0 }}>
                <li>To export your progress, click <strong>Export Progress</strong>.</li>
                <li>To import progress, click <strong>Import Progress</strong> and select a backup file.</li>
              </ol>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <button type="button" className="view-toggle__chip" onClick={onExportProgress} disabled={foundCount === 0}>Export Progress</button>
              <label style={{ display: 'inline-block' }}>
                <span style={{ display: 'none' }}>Import Progress</span>
                <input type="file" accept="application/json" style={{ display: 'none' }} onChange={onImportProgress} />
                <button type="button" className="view-toggle__chip" onClick={e => { (e.currentTarget.previousSibling as HTMLInputElement)?.click(); }}>Import Progress</button>
              </label>
            </div>
            <div className="utility-card__meta" style={{ marginBottom: 8 }}>Clear all found plates from this device.</div>
            <button type="button" className="clear-discoveries utility-card__action" onClick={onClearDiscoveries} disabled={foundCount === 0}>Clear found</button>
          </section>
        </div>
      ) : null}
      {activeTab === "about" ? (
        <div className="utility-stack">
          <section className="utility-card">
            <h3>About</h3>
            <div className="about-table" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'start', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 140, justifySelf: 'center' }}>
                <a className="about-card__logo-link" href={developer.url} target="_blank" rel="noreferrer" aria-label={`Visit ${developer.name}`}>
                  <img className="about-card__logo" src={`${import.meta.env.BASE_URL}${developer.logoPath}`} alt={developer.name} style={{ maxWidth: 120, height: 'auto', marginBottom: 8, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                </a>
              </div>
              <div>
                <p className="utility-card__meta" style={{ marginBottom: 4 }}>Developed by <a className="app-footer__link" href={developer.url} target="_blank" rel="noreferrer">{developer.name}</a>.</p>
                <p className="utility-card__meta" style={{ marginBottom: 4 }}>Version {buildVersion} • Built {buildDateLabel}</p>
                <button type="button" className="app-footer__share utility-card__action about-card__share" onClick={onShareApp} style={{ width: 'auto', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon name="share" size={16} /> Share
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 140, justifySelf: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 8, width: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={`${import.meta.env.BASE_URL}${attribution.logoPath}`} alt={attribution.logoAlt} style={{ maxWidth: 104, height: 'auto', display: 'block' }} />
                </div>
              </div>
              <div>
                <p className="utility-card__meta" style={{ marginBottom: 0 }} dangerouslySetInnerHTML={{ __html: attribution.text.replace('{agency}', `<a href="${attribution.agencyUrl}" target="_blank" rel="noopener noreferrer">${attribution.agencyName}</a>`) }} />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </PageView>
  );
}

import { useState } from "react";
import { PageView } from "./PageView";

interface HelpPageProps {
  onBack: () => void;
  helpContent: {
    install: string[];
    howToPlay: string[];
    usefulTools: string[];
    safeUse: string[];
  };
}

export function HelpPage({ onBack, helpContent }: HelpPageProps) {
  const [activeTab, setActiveTab] = useState<"help" | "safe">("help");

  return (
    <PageView
      title="Help"
      onBack={onBack}
      tabs={
        <>
          {(["help", "safe"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`view-toggle__chip ${activeTab === tab ? "view-toggle__chip--active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "help" ? "Help" : "Safe Use"}
            </button>
          ))}
        </>
      }
    >
      {activeTab === "help" ? (
        <div className="utility-stack">
          <section className="utility-card">
            <h3>Install the app</h3>
            {helpContent.install.map((item) => (
              <p className="utility-card__meta" key={item}>{item}</p>
            ))}
          </section>
          <section className="utility-card">
            <h3>How to play</h3>
            <div className="utility-list utility-list--compact">
              {helpContent.howToPlay.map((item) => (
                <p className="utility-card__meta" key={item}>{item}</p>
              ))}
            </div>
          </section>
          <section className="utility-card">
            <h3>Useful tools</h3>
            <div className="utility-list utility-list--compact">
              {helpContent.usefulTools.map((item) => (
                <p className="utility-card__meta" key={item}>{item}</p>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      {activeTab === "safe" ? (
        <div className="utility-stack">
          <section className="utility-card utility-card--warning">
            <h3>
              <span className="warning-heading__icon" aria-hidden="true">!</span>
              <span>Safe use</span>
            </h3>
            <div className="utility-list utility-list--compact">
              {helpContent.safeUse.map((item) => (
                <p className="utility-card__meta" key={item}>{item}</p>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </PageView>
  );
}

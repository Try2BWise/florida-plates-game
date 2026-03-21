import { useEffect, useMemo, useRef, useState } from "react";
import { PlateCard } from "./components/PlateCard";
import { groupedPlates, plates } from "./data/plates";
import { createDiscovery } from "./lib/geolocation";
import { loadDiscoveries, saveDiscoveries } from "./lib/storage";
import type { Plate, PlateCategory, PlateDiscoveryMap } from "./types";

const THEME_STORAGE_KEY = "florida-plates-theme";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [discoveries, setDiscoveries] = useState<PlateDiscoveryMap>(() =>
    loadDiscoveries()
  );
  const [activePlateId, setActivePlateId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [activeCategory, setActiveCategory] = useState<PlateCategory>(
    groupedPlates[0].category
  );
  const sectionRefs = useRef<Record<PlateCategory, HTMLElement | null>>({
    Environmental: null,
    Miscellaneous: null,
    "Professional Sports": null,
    Universities: null
  });

  useEffect(() => {
    saveDiscoveries(discoveries);
  }, [discoveries]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        const [mostVisibleEntry] = visibleEntries;
        if (!mostVisibleEntry) {
          return;
        }

        const category = mostVisibleEntry.target.getAttribute(
          "data-category"
        ) as PlateCategory | null;

        if (category) {
          setActiveCategory(category);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7]
      }
    );

    for (const { category } of groupedPlates) {
      const section = sectionRefs.current[category];
      if (section) {
        observer.observe(section);
      }
    }

    return () => observer.disconnect();
  }, []);

  const foundCount = useMemo(
    () => Object.keys(discoveries).length,
    [discoveries]
  );

  async function handleTogglePlate(plate: Plate, isFound: boolean) {
    if (isFound) {
      setDiscoveries((current) => {
        const next = { ...current };
        delete next[plate.id];
        return next;
      });
      return;
    }

    setActivePlateId(plate.id);
    const discovery = await createDiscovery();
    setDiscoveries((current) => ({
      ...current,
      [plate.id]: discovery
    }));
    setActivePlateId(null);
  }

  function handleJumpToCategory(category: PlateCategory) {
    setActiveCategory(category);
    sectionRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__top">
          <div>
            <p className="app-header__eyebrow">Florida Specialty Plate Game</p>
            <h1>Spot every plate</h1>
          </div>
          <div className="app-header__actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <span className="theme-toggle__label">
                {theme === "light" ? "Dark mode" : "Light mode"}
              </span>
            </button>
            <div className="app-header__meter" aria-live="polite">
              <span className="app-header__meter-value">
                {foundCount}/{plates.length}
              </span>
              <span className="app-header__meter-label">plates found</span>
            </div>
          </div>
        </div>
        <nav className="category-jump" aria-label="Jump to category">
          {groupedPlates.map(({ category, plates: categoryPlates }) => (
            <button
              type="button"
              key={category}
              className={`category-jump__chip ${
                activeCategory === category ? "category-jump__chip--active" : ""
              }`}
              onClick={() => handleJumpToCategory(category)}
            >
              <span>{category}</span>
              <span className="category-jump__count">{categoryPlates.length}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="plate-groups">
        {groupedPlates.map(({ category, plates: categoryPlates }) => (
          <section
            className="plate-group"
            key={category}
            data-category={category}
            ref={(node) => {
              sectionRefs.current[category] = node;
            }}
          >
            <div className="plate-group__heading">
              <h2>{category}</h2>
              <span>{categoryPlates.length}</span>
            </div>
            <div className="plate-list">
              {categoryPlates.map((plate) => (
                <PlateCard
                  key={plate.id}
                  plate={plate}
                  discovery={discoveries[plate.id]}
                  onToggle={handleTogglePlate}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="app-footer">
        <p className="app-footer__credit">
          Developed by{" "}
          <a
            className="app-footer__link"
            href="https://gorillagrin.com"
            target="_blank"
            rel="noreferrer"
          >
            Gorilla Grin
          </a>
          .
        </p>
        <p className="app-footer__disclaimer">
          Specialty plate images are not the intellectual property of Gorilla
          Grin. They belong to the Florida Department of Highway Safety and
          Motor Vehicles and are displayed here for identification purposes
          under a fair use claim.
        </p>
      </footer>

      {activePlateId ? (
        <div className="saving-banner" role="status">
          Saving sighting...
        </div>
      ) : null}
    </div>
  );
}

export default App;

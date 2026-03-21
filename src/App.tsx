import { useEffect, useMemo, useRef, useState } from "react";
import { PlateCard } from "./components/PlateCard";
import { groupedPlates, plates } from "./data/plates";
import { createDiscovery } from "./lib/geolocation";
import { reverseGeocodeLocality } from "./lib/reverseGeocode";
import { loadDiscoveries, saveDiscoveries } from "./lib/storage";
import type { Plate, PlateCategory, PlateDiscoveryMap } from "./types";

const THEME_STORAGE_KEY = "florida-plates-theme";

type ThemeMode = "light" | "dark";
type PlateVisibilityFilter = "all" | "found" | "missing";
type PlateArrangement = "category" | "az" | "za";

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
  const appShareUrl = "https://try2bwise.github.io/florida-plates-game/";
  const shareMessage = [
    "I’ve been playing FL Plates, a Florida specialty plate spotting game.",
    "",
    `Play it here: ${appShareUrl}`,
    "",
    "On iPhone: open the link in Safari, tap Share, then choose Add to Home Screen to install it like an app."
  ].join("\n");
  const [discoveries, setDiscoveries] = useState<PlateDiscoveryMap>(() =>
    loadDiscoveries()
  );
  const [activePlateId, setActivePlateId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [visibilityFilter, setVisibilityFilter] =
    useState<PlateVisibilityFilter>("all");
  const [arrangement, setArrangement] = useState<PlateArrangement>("category");
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PlateCategory>(
    groupedPlates[0].category
  );
  const sectionRefs = useRef<Record<PlateCategory, HTMLElement | null>>({
    Environmental: null,
    Miscellaneous: null,
    "Professional Sports": null,
    Universities: null
  });
  const resolvingLocalitiesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    saveDiscoveries(discoveries);
  }, [discoveries]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    function handleUpdateReady() {
      setIsUpdateReady(true);
    }

    window.addEventListener("fl-plates:update-ready", handleUpdateReady);
    return () =>
      window.removeEventListener("fl-plates:update-ready", handleUpdateReady);
  }, []);

  useEffect(() => {
    const pendingEntry = Object.entries(discoveries).find(
      ([plateId, discovery]) =>
        discovery.locality === null &&
        discovery.latitude !== null &&
        discovery.longitude !== null &&
        !resolvingLocalitiesRef.current.has(plateId)
    );

    if (!pendingEntry) {
      return;
    }

    const [plateId, discovery] = pendingEntry;
    resolvingLocalitiesRef.current.add(plateId);

    void reverseGeocodeLocality(discovery.latitude!, discovery.longitude!)
      .then((locality) => {
        if (!locality) {
          return;
        }

        setDiscoveries((current) => {
          const currentDiscovery = current[plateId];
          if (
            !currentDiscovery ||
            currentDiscovery.locality !== null ||
            currentDiscovery.latitude !== discovery.latitude ||
            currentDiscovery.longitude !== discovery.longitude
          ) {
            return current;
          }

          return {
            ...current,
            [plateId]: {
              ...currentDiscovery,
              locality
            }
          };
        });
      })
      .finally(() => {
        resolvingLocalitiesRef.current.delete(plateId);
      });
  }, [discoveries]);

  const foundCount = useMemo(
    () => Object.keys(discoveries).length,
    [discoveries]
  );
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredPlates = useMemo(
    () =>
      plates.filter((plate) => {
        const isFound = Boolean(discoveries[plate.id]);
        const matchesVisibility =
          visibilityFilter === "all" ||
          (visibilityFilter === "found" && isFound) ||
          (visibilityFilter === "missing" && !isFound);
        const matchesSearch =
          normalizedSearchTerm.length === 0 ||
          plate.name.toLowerCase().includes(normalizedSearchTerm);

        return matchesVisibility && matchesSearch;
      }),
    [discoveries, normalizedSearchTerm, visibilityFilter]
  );
  const filteredGroups = useMemo(() => {
    if (arrangement === "category") {
      return groupedPlates
        .map(({ category, plates: categoryPlates }) => ({
          category,
          plates: categoryPlates.filter((plate) =>
            filteredPlates.some((filteredPlate) => filteredPlate.id === plate.id)
          )
        }))
        .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);
    }

    const sortedPlates = [...filteredPlates].sort((left, right) => {
      const comparison = left.name.localeCompare(right.name);
      return arrangement === "az" ? comparison : -comparison;
    });

    return sortedPlates.length > 0
      ? [{ category: "Miscellaneous" as PlateCategory, plates: sortedPlates }]
      : [];
  }, [arrangement, filteredPlates]);
  const visiblePlateCount = useMemo(
    () =>
      filteredGroups.reduce(
        (total, group) => total + group.plates.length,
        0
      ),
    [filteredGroups]
  );

  useEffect(() => {
    if (arrangement !== "category") {
      return;
    }

    if (filteredGroups.length === 0) {
      return;
    }

    if (!filteredGroups.some((group) => group.category === activeCategory)) {
      setActiveCategory(filteredGroups[0].category);
    }
  }, [activeCategory, arrangement, filteredGroups]);

  useEffect(() => {
    if (arrangement !== "category") {
      return;
    }

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

    for (const { category } of filteredGroups) {
      const section = sectionRefs.current[category];
      if (section) {
        observer.observe(section);
      }
    }

    return () => observer.disconnect();
  }, [arrangement, filteredGroups]);

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

  function handleClearDiscoveries() {
    if (foundCount === 0) {
      return;
    }

    const shouldClear = window.confirm(
      "Clear all found plates? This will remove every saved timestamp and location."
    );

    if (!shouldClear) {
      return;
    }

    setDiscoveries({});
    setActivePlateId(null);
  }

  async function handleShareApp() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "FL Plates",
          text: shareMessage,
          url: appShareUrl
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMessage);
        setShareStatus("Share text copied");
        window.setTimeout(() => setShareStatus(null), 2500);
        return;
      }

      window.prompt("Copy and share this message:", shareMessage);
    } catch {
      setShareStatus("Share canceled");
      window.setTimeout(() => setShareStatus(null), 2000);
    }
  }

  function handleApplyUpdate() {
    setIsUpdateReady(false);
    void navigator.serviceWorker
      .getRegistration(import.meta.env.BASE_URL)
      .then((registration) => {
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__title-block app-header__title-block--sign">
            <div className="welcome-sign" aria-label="Florida plate tracker">
              <span className="welcome-sign__welcome">Welcome to</span>
              <span className="welcome-sign__state">FLORIDA</span>
              <span className="welcome-sign__tagline">the sunshine state</span>
            </div>
            <p className="app-header__eyebrow">Florida plate tracker</p>
          </div>
          <div className="app-header__actions">
            <div className="app-header__meter app-header__meter--compact" aria-live="polite">
              <span className="app-header__meter-value">
                {foundCount}/{plates.length}
              </span>
              <span className="app-header__meter-label">found</span>
            </div>
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
          </div>
        </div>
        <div className="control-panel">
          <div className="control-panel__topline">
            <button
              type="button"
              className={`search-toggle ${
                isSearchOpen || searchTerm ? "search-toggle--open" : ""
              }`}
              aria-expanded={isSearchOpen || searchTerm.length > 0}
              aria-controls="plate-search"
              aria-label="Search plates"
              onClick={() => {
                if (isSearchOpen && searchTerm.length === 0) {
                  setIsSearchOpen(false);
                  return;
                }

                setIsSearchOpen(true);
              }}
            >
              <span className="search-toggle__icon" aria-hidden="true">
                o
              </span>
            </button>
            {isSearchOpen || searchTerm ? (
              <label className="search-inline" htmlFor="plate-search">
                <input
                  id="plate-search"
                  className="search-inline__input"
                  type="search"
                  placeholder="Search by plate name"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm ? (
                  <button
                    type="button"
                    className="search-inline__clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    className="search-inline__clear"
                    onClick={() => setIsSearchOpen(false)}
                    aria-label="Close search"
                  >
                    Close
                  </button>
                )}
              </label>
            ) : null}
            {arrangement === "category" ? (
              <nav className="category-jump" aria-label="Jump to category">
                {filteredGroups.map(({ category, plates: categoryPlates }) => (
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
            ) : (
              <div className="category-jump category-jump--summary" aria-live="polite">
                <span className="category-jump__chip category-jump__chip--static">
                  {arrangement === "az" ? "All plates A-Z" : "All plates Z-A"}
                </span>
              </div>
            )}
          </div>
          <div className="control-panel__bottomline">
            <div
              className="view-toggle"
              role="group"
              aria-label="Filter by found status"
            >
              <button
                type="button"
                className={`view-toggle__chip ${
                  visibilityFilter === "all" ? "view-toggle__chip--active" : ""
                }`}
                onClick={() => setVisibilityFilter("all")}
                aria-pressed={visibilityFilter === "all"}
              >
                All
              </button>
              <button
                type="button"
                className={`view-toggle__chip ${
                  visibilityFilter === "found" ? "view-toggle__chip--active" : ""
                }`}
                onClick={() => setVisibilityFilter("found")}
                aria-pressed={visibilityFilter === "found"}
              >
                Found
              </button>
              <button
                type="button"
                className={`view-toggle__chip ${
                  visibilityFilter === "missing" ? "view-toggle__chip--active" : ""
                }`}
                onClick={() => setVisibilityFilter("missing")}
                aria-pressed={visibilityFilter === "missing"}
              >
                Not found
              </button>
            </div>
            {foundCount > 0 ? (
              <button
                type="button"
                className="clear-discoveries"
                onClick={handleClearDiscoveries}
              >
                Clear found
              </button>
            ) : null}
          </div>
          <div className="control-panel__arrangement" role="group" aria-label="Arrange plates">
            <button
              type="button"
              className={`view-toggle__chip ${
                arrangement === "category" ? "view-toggle__chip--active" : ""
              }`}
              onClick={() => setArrangement("category")}
              aria-pressed={arrangement === "category"}
            >
              Categories
            </button>
            <button
              type="button"
              className={`view-toggle__chip ${
                arrangement === "az" ? "view-toggle__chip--active" : ""
              }`}
              onClick={() => setArrangement("az")}
              aria-pressed={arrangement === "az"}
            >
              A-Z
            </button>
            <button
              type="button"
              className={`view-toggle__chip ${
                arrangement === "za" ? "view-toggle__chip--active" : ""
              }`}
              onClick={() => setArrangement("za")}
              aria-pressed={arrangement === "za"}
            >
              Z-A
            </button>
          </div>
          <p className="control-panel__summary" aria-live="polite">
            Showing {visiblePlateCount} of {plates.length} plates
          </p>
        </div>
      </header>

      <main className="plate-groups">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(({ category, plates: categoryPlates }, index) => (
            <section
              className="plate-group"
              key={arrangement === "category" ? category : `flat-${index}`}
              data-category={arrangement === "category" ? category : null}
              ref={(node) => {
                if (arrangement === "category") {
                  sectionRefs.current[category] = node;
                }
              }}
            >
              <div className="plate-group__heading">
                <h2>
                  {arrangement === "category"
                    ? category
                    : arrangement === "az"
                      ? "All Plates A-Z"
                      : "All Plates Z-A"}
                </h2>
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
          ))
        ) : (
          <section className="empty-state">
            <h2>No plates match this view</h2>
            <p>
              Try clearing the search or cycling back to a different filter.
            </p>
          </section>
        )}
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
        <button
          type="button"
          className="app-footer__share"
          onClick={handleShareApp}
        >
          Share FL Plates
        </button>
      </footer>

      {activePlateId ? (
        <div className="saving-banner" role="status">
          Saving sighting...
        </div>
      ) : null}
      {shareStatus ? (
        <div className="saving-banner" role="status">
          {shareStatus}
        </div>
      ) : null}
      {isUpdateReady ? (
        <div className="update-banner" role="status">
          <span>A new version is ready.</span>
          <button
            type="button"
            className="update-banner__action"
            onClick={handleApplyUpdate}
          >
            Update
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;

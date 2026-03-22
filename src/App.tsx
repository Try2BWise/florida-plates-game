import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeIcon } from "./components/BadgeIcon";
import { PlateCard } from "./components/PlateCard";
import { groupedPlates, plates } from "./data/plates";
import { buildInfo } from "./generated/buildInfo";
import { evaluateBadges, type BadgeGroup } from "./lib/badges";
import { formatDiscoveryTime } from "./lib/format";
import { createDiscovery } from "./lib/geolocation";
import { reverseGeocodeLocality } from "./lib/reverseGeocode";
import { loadDiscoveries, saveDiscoveries } from "./lib/storage";
import type { Plate, PlateCategory, PlateDiscoveryMap } from "./types";

const THEME_STORAGE_KEY = "florida-plates-theme";
const UI_PREFERENCES_STORAGE_KEY = "florida-plates-ui-preferences";

type ThemeMode = "light" | "dark";
type PlateVisibilityFilter = "all" | "found" | "missing";
type PlateArrangement = "category" | "az" | "za";
type ExploreTab = "badges" | "stats" | "map";
type UtilityTab = "settings" | "help" | "safe" | "about";

interface UiPreferences {
  showSearch: boolean;
  showCategories: boolean;
  showArrangement: boolean;
}

const defaultUiPreferences: UiPreferences = {
  showSearch: true,
  showCategories: true,
  showArrangement: true
};

function loadUiPreferences(): UiPreferences {
  try {
    const rawValue = window.localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
    if (!rawValue) {
      return defaultUiPreferences;
    }

    const parsed = JSON.parse(rawValue) as Partial<UiPreferences>;
    return {
      showSearch: parsed.showSearch ?? defaultUiPreferences.showSearch,
      showCategories: parsed.showCategories ?? defaultUiPreferences.showCategories,
      showArrangement: parsed.showArrangement ?? defaultUiPreferences.showArrangement
    };
  } catch {
    return defaultUiPreferences;
  }
}

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
    "To install:",
    "iPhone: open in Safari, tap Share, then Add to Home Screen.",
    "Android: open in Chrome, then use Add to Home screen or Install app."
  ].join("\n");
  const [discoveries, setDiscoveries] = useState<PlateDiscoveryMap>(() =>
    loadDiscoveries()
  );
  const [activePlateId, setActivePlateId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(() =>
    loadUiPreferences()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [visibilityFilter, setVisibilityFilter] =
    useState<PlateVisibilityFilter>("all");
  const [arrangement, setArrangement] = useState<PlateArrangement>("category");
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [isExplorePanelOpen, setIsExplorePanelOpen] = useState(false);
  const [isUtilityPanelOpen, setIsUtilityPanelOpen] = useState(false);
  const [previewPlate, setPreviewPlate] = useState<Plate | null>(null);
  const [activeExploreTab, setActiveExploreTab] = useState<ExploreTab>("badges");
  const [activeUtilityTab, setActiveUtilityTab] = useState<UtilityTab>("settings");
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
  const buildDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(buildInfo.builtAtIso)),
    []
  );

  useEffect(() => {
    saveDiscoveries(discoveries);
  }, [discoveries]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify(uiPreferences)
    );
  }, [uiPreferences]);

  useEffect(() => {
    if (!uiPreferences.showSearch) {
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  }, [uiPreferences.showSearch]);

  useEffect(() => {
    if (!isUtilityPanelOpen && !isExplorePanelOpen && !previewPlate) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, [isExplorePanelOpen, isUtilityPanelOpen, previewPlate]);

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
  const discoveryEntries = useMemo(
    () =>
      Object.entries(discoveries)
        .map(([plateId, discovery]) => {
          const plate = plates.find((candidatePlate) => candidatePlate.id === plateId);
          if (!plate) {
            return null;
          }

          return {
            plate,
            discovery
          };
        })
        .filter((entry): entry is { plate: Plate; discovery: (typeof discoveries)[string] } =>
          entry !== null
        )
        .sort(
          (left, right) =>
            new Date(right.discovery.foundAtIso).getTime() -
            new Date(left.discovery.foundAtIso).getTime()
        ),
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
  const categoryStats = useMemo(
    () =>
      groupedPlates.map(({ category, plates: categoryPlates }) => {
        const found = categoryPlates.filter((plate) => discoveries[plate.id]).length;
        return {
          category,
          found,
          total: categoryPlates.length,
          percent: Math.round((found / categoryPlates.length) * 100)
        };
      }),
    [discoveries]
  );
  const topLocalities = useMemo(() => {
    const localityCounts = new Map<string, number>();

    for (const { discovery } of discoveryEntries) {
      const locality = discovery.locality;
      if (!locality) {
        continue;
      }

      localityCounts.set(locality, (localityCounts.get(locality) ?? 0) + 1);
    }

    return [...localityCounts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 6);
  }, [discoveryEntries]);
  const mapPins = useMemo(
    () => {
      const plottedEntries = discoveryEntries.filter(
        ({ discovery }) =>
          discovery.latitude !== null && discovery.longitude !== null
      );

      if (plottedEntries.length === 0) {
        return [];
      }

      const latitudes = plottedEntries.map(({ discovery }) => discovery.latitude!);
      const longitudes = plottedEntries.map(({ discovery }) => discovery.longitude!);
      const minLatitude = Math.min(...latitudes);
      const maxLatitude = Math.max(...latitudes);
      const minLongitude = Math.min(...longitudes);
      const maxLongitude = Math.max(...longitudes);
      const latitudePadding = Math.max(0.35, (maxLatitude - minLatitude) * 0.18);
      const longitudePadding = Math.max(0.35, (maxLongitude - minLongitude) * 0.18);
      const boundedMinLatitude = minLatitude - latitudePadding;
      const boundedMaxLatitude = maxLatitude + latitudePadding;
      const boundedMinLongitude = minLongitude - longitudePadding;
      const boundedMaxLongitude = maxLongitude + longitudePadding;

      return plottedEntries.map(({ plate, discovery }) => {
        const x =
          ((discovery.longitude! - boundedMinLongitude) /
            (boundedMaxLongitude - boundedMinLongitude)) *
          100;
        const y =
          (1 -
            (discovery.latitude! - boundedMinLatitude) /
              (boundedMaxLatitude - boundedMinLatitude)) *
          100;

        return {
          id: plate.id,
          plateName: plate.name,
          locality: discovery.locality,
          latitude: discovery.latitude!,
          longitude: discovery.longitude!,
          left: Math.min(96, Math.max(4, x)),
          top: Math.min(94, Math.max(6, y))
        };
      });
    },
    [discoveryEntries]
  );
  const mapBounds = useMemo(() => {
    if (mapPins.length === 0) {
      return null;
    }

    const latitudes = mapPins.map((pin) => pin.latitude);
    const longitudes = mapPins.map((pin) => pin.longitude);
    return {
      north: Math.max(...latitudes).toFixed(2),
      south: Math.min(...latitudes).toFixed(2),
      east: Math.max(...longitudes).toFixed(2),
      west: Math.min(...longitudes).toFixed(2)
    };
  }, [mapPins]);
  const newestSighting = discoveryEntries[0] ?? null;
  const oldestSighting =
    discoveryEntries.length > 0
      ? discoveryEntries[discoveryEntries.length - 1]
      : null;
  const evaluatedBadges = useMemo(
    () => evaluateBadges(plates, discoveries),
    [discoveries]
  );
  const earnedBadges = useMemo(
    () => evaluatedBadges.filter((badge) => badge.earned),
    [evaluatedBadges]
  );
  const remainingBadges = useMemo(
    () => evaluatedBadges.filter((badge) => !badge.earned),
    [evaluatedBadges]
  );
  const badgeGroupLabels: Record<BadgeGroup, string> = {
    progress: "Progress",
    category: "Categories",
    collection: "Collections",
    college: "College Track",
    locality: "Places"
  };
  const badgeGroupSymbols: Record<BadgeGroup, string> = {
    progress: "star",
    category: "grid",
    collection: "rings",
    college: "cap",
    locality: "pin"
  };
  const earnedBadgeGroups = useMemo(
    () =>
      Object.entries(
        earnedBadges.reduce<Record<string, typeof earnedBadges>>((groups, badge) => {
          const key = badge.group;
          groups[key] = [...(groups[key] ?? []), badge];
          return groups;
        }, {})
      ) as Array<[BadgeGroup, typeof earnedBadges]>,
    [earnedBadges]
  );
  const remainingBadgeGroups = useMemo(
    () =>
      Object.entries(
        remainingBadges.reduce<Record<string, typeof remainingBadges>>((groups, badge) => {
          const key = badge.group;
          groups[key] = [...(groups[key] ?? []), badge];
          return groups;
        }, {})
      ) as Array<[BadgeGroup, typeof remainingBadges]>,
    [remainingBadges]
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

  async function handleShareText(title: string, text: string) {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: appShareUrl
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareStatus("Share text copied");
        window.setTimeout(() => setShareStatus(null), 2500);
        return;
      }

      window.prompt("Copy and share this message:", text);
    } catch {
      setShareStatus("Share canceled");
      window.setTimeout(() => setShareStatus(null), 2000);
    }
  }

  async function handleShareApp() {
    await handleShareText("FL Plates", shareMessage);
  }

  async function handleShareBadge(badgeName: string) {
    const badgeShareMessage = [
      `I just earned ${badgeName} on FL Plates!`,
      "",
      `Play it here: ${appShareUrl}`,
      "",
      "To install:",
      "iPhone: open in Safari, tap Share, then Add to Home Screen.",
      "Android: open in Chrome, then use Add to Home screen or Install app."
    ].join("\n");

    await handleShareText(`FL Plates - ${badgeName}`, badgeShareMessage);
  }

  function handleApplyUpdate() {
    setIsUpdateReady(false);
    void navigator.serviceWorker
      .getRegistration(import.meta.env.BASE_URL)
      .then((registration) => {
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
  }

  function toggleUiPreference(key: keyof UiPreferences) {
    setUiPreferences((current) => ({
      ...current,
      [key]: !current[key]
    }));
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
              <span className="app-header__meter-label">plates</span>
            </div>
            <button
              type="button"
              className="app-header__meter app-header__meter--compact app-header__badge-meter"
              aria-live="polite"
              onClick={() => {
                setActiveExploreTab("badges");
                setIsUtilityPanelOpen(false);
                setIsExplorePanelOpen(true);
              }}
              aria-label="Open merit badges"
            >
              <span className="app-header__meter-value app-header__badge-meter-value">
                {earnedBadges.length}/{evaluatedBadges.length}
              </span>
              <span className="app-header__meter-label app-header__badge-meter-label">
                badges
              </span>
            </button>
          </div>
        </div>
        <div className="control-panel">
          <div className="control-panel__topline">
            {uiPreferences.showSearch ? (
              <>
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
              </>
            ) : null}
            {uiPreferences.showCategories && arrangement === "category" ? (
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
            ) : uiPreferences.showCategories ? (
              <div className="category-jump category-jump--summary" aria-live="polite">
                <span className="category-jump__chip category-jump__chip--static">
                  {arrangement === "az" ? "All plates A-Z" : "All plates Z-A"}
                </span>
              </div>
            ) : null}
          </div>
          <div className="control-panel__scroller">
            <div
              className="view-toggle"
              role="group"
              aria-label="Filter by found status and arrangement"
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
              {uiPreferences.showArrangement ? (
                <>
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
                </>
              ) : null}
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
                    onPreview={setPreviewPlate}
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

      <nav className="bottom-dock" aria-label="Primary app navigation">
        <button
          type="button"
          className={`bottom-dock__item ${
            !isUtilityPanelOpen && !isExplorePanelOpen ? "bottom-dock__item--active" : ""
          }`}
          onClick={() => {
            setIsUtilityPanelOpen(false);
            setIsExplorePanelOpen(false);
          }}
          aria-label="Home"
        >
          <span className="bottom-dock__icon bottom-dock__icon--home" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`bottom-dock__item ${
            isExplorePanelOpen ? "bottom-dock__item--active" : ""
          }`}
          onClick={() => {
            setIsUtilityPanelOpen(false);
            setActiveExploreTab("badges");
            setIsExplorePanelOpen(true);
          }}
          aria-label="Explore"
        >
          <span className="bottom-dock__icon bottom-dock__icon--globe" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`bottom-dock__item ${
            isUtilityPanelOpen && activeUtilityTab === "help"
              ? "bottom-dock__item--active"
              : ""
          }`}
          onClick={() => {
            setIsExplorePanelOpen(false);
            setActiveUtilityTab("help");
            setIsUtilityPanelOpen(true);
          }}
          aria-label="Help"
        >
          <span className="bottom-dock__icon bottom-dock__icon--help" aria-hidden="true">
            ?
          </span>
        </button>
        <button
          type="button"
          className={`bottom-dock__item ${
            isUtilityPanelOpen && activeUtilityTab === "settings"
              ? "bottom-dock__item--active"
              : ""
          }`}
          onClick={() => {
            setIsExplorePanelOpen(false);
            setActiveUtilityTab("settings");
            setIsUtilityPanelOpen(true);
          }}
          aria-label="Settings"
        >
          <span className="bottom-dock__icon bottom-dock__icon--gear" aria-hidden="true" />
        </button>
      </nav>

      {previewPlate ? (
        <div
          className="plate-preview-backdrop"
          role="presentation"
          onClick={() => setPreviewPlate(null)}
        >
          <div
            className="plate-preview"
            role="dialog"
            aria-modal="true"
            aria-label={`${previewPlate.name} plate preview`}
            onClick={() => setPreviewPlate(null)}
          >
            <img
              className="plate-preview__image"
              src={`${import.meta.env.BASE_URL}plates/${previewPlate.imageKey}.png`}
              alt={previewPlate.name}
              onError={(event) => {
                const target = event.currentTarget;
                if (!target.dataset.fallbackApplied) {
                  target.dataset.fallbackApplied = "true";
                  target.src = `${import.meta.env.BASE_URL}plates/${previewPlate.imageKey}.jpg`;
                }
              }}
            />
            <p className="plate-preview__caption">{previewPlate.name}</p>
            {!discoveries[previewPlate.id] ? (
              <button
                type="button"
                className="plate-preview__action"
                onClick={(event) => {
                  event.stopPropagation();
                  handleTogglePlate(previewPlate, false);
                  setPreviewPlate(null);
                }}
              >
                Found
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isExplorePanelOpen ? (
        <div
          className="utility-panel-backdrop"
          role="presentation"
          onClick={() => setIsExplorePanelOpen(false)}
        >
          <section
            className="utility-panel"
            role="dialog"
            aria-modal="true"
            aria-label="FL Plates explore panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="utility-panel__header">
              <div>
                <p className="utility-panel__eyebrow">Explore</p>
                <h2 className="utility-panel__title">FL Plates explore panel</h2>
              </div>
              <button
                type="button"
                className="utility-panel__close"
                onClick={() => setIsExplorePanelOpen(false)}
                aria-label="Close explore panel"
              >
                Close
              </button>
            </div>
            <div className="utility-panel__tabs" role="tablist" aria-label="Explore views">
              {(["badges", "stats", "map"] as ExploreTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`view-toggle__chip ${
                    activeExploreTab === tab ? "view-toggle__chip--active" : ""
                  }`}
                  role="tab"
                  aria-selected={activeExploreTab === tab}
                  onClick={() => setActiveExploreTab(tab)}
                >
                  {tab === "badges" ? "Badges" : tab === "stats" ? "Stats" : "Map"}
                </button>
              ))}
            </div>
            <div className="utility-panel__content">
              {activeExploreTab === "stats" ? (
                <div className="utility-stack stats-dashboard">
                  <section className="stats-kpi-grid">
                    <article className="utility-card utility-card--stat">
                      <h3>Plates found</h3>
                      <p className="utility-card__metric">{foundCount}</p>
                      <p className="utility-card__meta">of {plates.length} total</p>
                    </article>
                    <article className="utility-card utility-card--stat">
                      <h3>Completion</h3>
                      <p className="utility-card__metric">
                        {Math.round((foundCount / plates.length) * 100)}%
                      </p>
                      <p className="utility-card__meta">overall progress</p>
                    </article>
                    <article className="utility-card utility-card--stat">
                      <h3>Badges earned</h3>
                      <p className="utility-card__metric">{earnedBadges.length}</p>
                      <p className="utility-card__meta">of {evaluatedBadges.length}</p>
                    </article>
                    <article className="utility-card utility-card--stat">
                      <h3>Localities</h3>
                      <p className="utility-card__metric">
                        {new Set(
                          Object.values(discoveries)
                            .map((discovery) => discovery.locality)
                            .filter((locality): locality is string => Boolean(locality))
                        ).size}
                      </p>
                      <p className="utility-card__meta">distinct named places</p>
                    </article>
                  </section>
                  <section className="utility-card stats-card stats-card--span-2">
                    <h3>Category progress</h3>
                    <div className="utility-list">
                      {categoryStats.map((stat) => (
                        <article className="utility-card utility-card--stat-row" key={stat.category}>
                          <div className="utility-card__header">
                            <h3>{stat.category}</h3>
                            <span>{stat.percent}%</span>
                          </div>
                          <div className="stats-bar">
                            <span
                              className="stats-bar__fill"
                              style={{ width: `${stat.percent}%` }}
                            />
                          </div>
                          <p className="utility-card__meta">
                            {stat.found} of {stat.total} found
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className="utility-grid stats-grid">
                    <article className="utility-card">
                      <h3>First sighting</h3>
                      <p className="utility-card__meta">
                        {oldestSighting
                          ? `${oldestSighting.plate.name} on ${formatDiscoveryTime(
                              oldestSighting.discovery.foundAtIso
                            )}`
                          : "No sightings yet"}
                      </p>
                    </article>
                    <article className="utility-card">
                      <h3>Most recent</h3>
                      <p className="utility-card__meta">
                        {newestSighting
                          ? `${newestSighting.plate.name} on ${formatDiscoveryTime(
                              newestSighting.discovery.foundAtIso
                            )}`
                          : "No sightings yet"}
                      </p>
                    </article>
                  </section>
                  <section className="utility-card stats-card stats-card--span-2">
                    <h3>Top localities</h3>
                    {topLocalities.length > 0 ? (
                      <div className="utility-list utility-list--compact">
                        {topLocalities.map(([locality, count]) => (
                          <div className="utility-row" key={locality}>
                            <span>{locality}</span>
                            <strong>{count}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="utility-card__meta">
                        Locality counts will appear as sightings pick up place names.
                      </p>
                    )}
                  </section>
                </div>
              ) : null}
              {activeExploreTab === "map" ? (
                mapPins.length > 0 ? (
                  <div className="utility-stack">
                    <section className="map-card">
                      <div className="map-card__surface">
                        <div className="map-card__grid" />
                        {mapBounds ? (
                          <>
                            <div className="map-card__label map-card__label--north">
                              N {mapBounds.north}
                            </div>
                            <div className="map-card__label map-card__label--south">
                              S {mapBounds.south}
                            </div>
                            <div className="map-card__label map-card__label--west">
                              W {mapBounds.west}
                            </div>
                            <div className="map-card__label map-card__label--east">
                              E {mapBounds.east}
                            </div>
                          </>
                        ) : null}
                        {mapPins.map((pin) => (
                          <button
                            key={pin.id}
                            type="button"
                            className="map-card__pin"
                            style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
                            title={`${pin.plateName}${pin.locality ? ` - ${pin.locality}` : ""}`}
                            aria-label={`${pin.plateName}${pin.locality ? ` in ${pin.locality}` : ""}`}
                          />
                        ))}
                      </div>
                      <p className="map-card__note">
                        Dynamic pushpin plot based on the current spread of saved GPS sightings.
                      </p>
                    </section>
                    <div className="utility-list utility-list--compact">
                      {discoveryEntries
                        .filter(
                          ({ discovery }) =>
                            discovery.latitude !== null && discovery.longitude !== null
                        )
                        .slice(0, 10)
                        .map(({ plate, discovery }) => (
                          <article className="utility-card" key={`${plate.id}-map`}>
                            <div className="utility-card__header">
                              <h3>{plate.name}</h3>
                              <span>{discovery.locality ?? "Pinned"}</span>
                            </div>
                            <p className="utility-card__meta">
                              {discovery.latitude?.toFixed(4)}, {discovery.longitude?.toFixed(4)}
                            </p>
                          </article>
                        ))}
                    </div>
                  </div>
                ) : (
                  <section className="empty-state">
                    <h2>No map pins yet</h2>
                    <p>Find a few plates with location enabled and they will appear here.</p>
                  </section>
                )
              ) : null}
              {activeExploreTab === "badges" ? (
                <div className="utility-stack">
                  <section className="utility-card utility-card--about">
                    <h3>Merit badges</h3>
                    <p className="utility-card__metric">
                      {earnedBadges.length} of {evaluatedBadges.length} earned
                    </p>
                    <p className="utility-card__meta">
                      Badges in v1.1 reflect your current saved state.
                    </p>
                  </section>
                  <section className="utility-card">
                    <h3>Earned</h3>
                    {earnedBadges.length > 0 ? (
                      <div className="utility-stack">
                        {earnedBadgeGroups.map(([group, badges]) => (
                          <section className="badge-group" key={`earned-${group}`}>
                            <div className="badge-group__header">
                              <h4>
                                <span
                                  className={`badge-group__icon badge-group__icon--${badgeGroupSymbols[group]} badge-group__icon--${group}`}
                                  aria-hidden="true"
                                />
                                {badgeGroupLabels[group]}
                              </h4>
                              <span>{badges.length}</span>
                            </div>
                            <div className="utility-list">
                              {badges.map((badge) => (
                                <article
                                  className={`utility-card utility-card--badge utility-card--badge-${badge.group}`}
                                  key={badge.id}
                                >
                                  <div className="badge-card__icon-shell">
                                    <BadgeIcon badge={badge} />
                                  </div>
                                  <div className="badge-card__body">
                                    <div className="utility-card__header badge-card__header">
                                      <h3>{badge.name}</h3>
                                      <span>Earned</span>
                                    </div>
                                    <div className="badge-card__meta-row">
                                      <div className={`badge-chip badge-chip--${badge.group}`}>
                                        <span
                                          className={`badge-chip__icon badge-group__icon badge-group__icon--${badgeGroupSymbols[badge.group]} badge-group__icon--${badge.group}`}
                                          aria-hidden="true"
                                        />
                                        <span>{badgeGroupLabels[badge.group]}</span>
                                      </div>
                                      {badge.progressCurrent !== undefined &&
                                      badge.progressTarget !== undefined ? (
                                        <span className="badge-progress-pill">
                                          {badge.progressCurrent} / {badge.progressTarget}
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="utility-card__meta badge-card__description">
                                      {badge.description}
                                    </p>
                                    <button
                                      type="button"
                                      className="app-footer__share utility-card__action badge-card__share"
                                      onClick={() => handleShareBadge(badge.name)}
                                    >
                                      Share
                                    </button>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <p className="utility-card__meta">
                        Earn your first plate to unlock your first merit badge.
                      </p>
                    )}
                  </section>
                  <section className="utility-card">
                    <h3>Not yet earned</h3>
                    <div className="utility-stack">
                      {remainingBadgeGroups.map(([group, badges]) => (
                        <section className="badge-group" key={`remaining-${group}`}>
                          <div className="badge-group__header">
                            <h4>
                              <span
                                className={`badge-group__icon badge-group__icon--${badgeGroupSymbols[group]} badge-group__icon--${group}`}
                                aria-hidden="true"
                              />
                              {badgeGroupLabels[group]}
                            </h4>
                            <span>{badges.length}</span>
                          </div>
                          <div className="utility-list">
                            {badges.map((badge) => (
                              <article
                                className={`utility-card utility-card--badge utility-card--badge-muted utility-card--badge-${badge.group}`}
                                key={badge.id}
                              >
                                <div className="badge-card__icon-shell">
                                  <BadgeIcon badge={badge} />
                                </div>
                                <div className="badge-card__body">
                                  <div className="utility-card__header badge-card__header">
                                    <h3>{badge.name}</h3>
                                    <span>Not yet</span>
                                  </div>
                                  <div className="badge-card__meta-row">
                                    <div className={`badge-chip badge-chip--${badge.group}`}>
                                      <span
                                        className={`badge-chip__icon badge-group__icon badge-group__icon--${badgeGroupSymbols[badge.group]} badge-group__icon--${badge.group}`}
                                        aria-hidden="true"
                                      />
                                      <span>{badgeGroupLabels[badge.group]}</span>
                                    </div>
                                    {badge.progressCurrent !== undefined &&
                                    badge.progressTarget !== undefined ? (
                                      <span className="badge-progress-pill">
                                        {badge.progressCurrent} / {badge.progressTarget}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="utility-card__meta badge-card__description">
                                    {badge.description}
                                  </p>
                                </div>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {isUtilityPanelOpen ? (
        <div
          className="utility-panel-backdrop"
          role="presentation"
          onClick={() => setIsUtilityPanelOpen(false)}
        >
          <section
            className="utility-panel"
            role="dialog"
            aria-modal="true"
            aria-label="FL Plates utility panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="utility-panel__header">
              <div>
                <p className="utility-panel__eyebrow">Utility</p>
                <h2 className="utility-panel__title">FL Plates utility panel</h2>
              </div>
              <button
                type="button"
                className="utility-panel__close"
                onClick={() => setIsUtilityPanelOpen(false)}
                aria-label="Close utility panel"
              >
                Close
              </button>
            </div>
            <div className="utility-panel__tabs" role="tablist" aria-label="Utility views">
              {(["settings", "help", "safe", "about"] as UtilityTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`view-toggle__chip ${
                    activeUtilityTab === tab ? "view-toggle__chip--active" : ""
                  }`}
                  role="tab"
                  aria-selected={activeUtilityTab === tab}
                  onClick={() => setActiveUtilityTab(tab)}
                >
                  {tab === "settings"
                    ? "Settings"
                    : tab === "help"
                      ? "Help"
                      : tab === "safe"
                        ? "Safe Use"
                        : "About"}
                </button>
              ))}
            </div>
            <div className="utility-panel__content">
              {activeUtilityTab === "settings" ? (
                <div className="utility-stack">
                  <section className="utility-card">
                    <h3>Main screen controls</h3>
                    <div className="settings-list">
                      <button
                        type="button"
                        className="settings-row"
                        onClick={() =>
                          setTheme((current) => (current === "light" ? "dark" : "light"))
                        }
                      >
                        <span>Color mode</span>
                        <strong>{theme === "light" ? "Light" : "Dark"}</strong>
                      </button>
                      <button
                        type="button"
                        className="settings-row"
                        onClick={() => toggleUiPreference("showSearch")}
                      >
                        <span>Show search control</span>
                        <strong>{uiPreferences.showSearch ? "On" : "Off"}</strong>
                      </button>
                      <button
                        type="button"
                        className="settings-row"
                        onClick={() => toggleUiPreference("showCategories")}
                      >
                        <span>Show category buttons</span>
                        <strong>{uiPreferences.showCategories ? "On" : "Off"}</strong>
                      </button>
                      <button
                        type="button"
                        className="settings-row"
                        onClick={() => toggleUiPreference("showArrangement")}
                      >
                        <span>Show sort buttons</span>
                        <strong>{uiPreferences.showArrangement ? "On" : "Off"}</strong>
                      </button>
                    </div>
                  </section>
                  <section className="utility-card">
                    <h3>About these settings</h3>
                    <p className="utility-card__meta">
                      These toggles only change which controls appear on the main game screen.
                      Your progress and filter state stay intact.
                    </p>
                  </section>
                </div>
              ) : null}
              {activeUtilityTab === "help" ? (
                <div className="utility-stack">
                  <section className="utility-card">
                    <h3>How to play</h3>
                    <div className="utility-list utility-list--compact">
                      <p className="utility-card__meta">
                        Tap a plate tile to mark it found.
                      </p>
                      <p className="utility-card__meta">
                        Tap the same tile again to clear that sighting.
                      </p>
                      <p className="utility-card__meta">
                        If location access is allowed, the app saves the time and a place name when available.
                      </p>
                      <p className="utility-card__meta">
                        Use the visibility buttons to show all plates, only found plates, or only missing plates.
                      </p>
                      <p className="utility-card__meta">
                        Use the arrangement buttons to keep category groups or switch to a flat A-Z or Z-A list.
                      </p>
                    </div>
                  </section>
                  <section className="utility-card">
                    <h3>Useful tools</h3>
                    <div className="utility-list utility-list--compact">
                      <p className="utility-card__meta">
                        <strong>Explore</strong> opens badges, a stats dashboard, and your map view.
                      </p>
                      <p className="utility-card__meta">
                        <strong>Settings</strong> lets you hide optional controls and switch color mode.
                      </p>
                      <p className="utility-card__meta">
                        <strong>Share FL Plates</strong> opens a share sheet with the app link and install instructions.
                      </p>
                    </div>
                  </section>
                  <section className="utility-card">
                    <h3>Install the app</h3>
                    <p className="utility-card__meta">
                      iPhone: open the game in Safari, tap Share, then choose Add to Home Screen.
                    </p>
                    <p className="utility-card__meta">
                      Android: open the game in Chrome, then use Add to Home screen or Install app.
                    </p>
                    <p className="utility-card__meta">
                      Once it loads online at least once, it can keep working offline.
                    </p>
                  </section>
                </div>
              ) : null}
              {activeUtilityTab === "safe" ? (
                <div className="utility-stack">
                  <section className="utility-card utility-card--warning">
                    <h3>
                      <span className="warning-heading__icon" aria-hidden="true">
                        !
                      </span>
                      <span>Safe use</span>
                    </h3>
                    <div className="utility-list utility-list--compact">
                      <p className="utility-card__meta">
                        For your safety and the safety of others, never use this app while driving.
                      </p>
                      <p className="utility-card__meta">
                        Always comply with all applicable traffic laws, including hands-free and
                        distracted-driving regulations in your area.
                      </p>
                      <p className="utility-card__meta">
                        Use this app only when your vehicle is parked in a safe location or when
                        operated by a passenger.
                      </p>
                      <p className="utility-card__meta">
                        By using this app, you agree that you are solely responsible for how and
                        when it is used.
                      </p>
                    </div>
                  </section>
                </div>
              ) : null}
              {activeUtilityTab === "about" ? (
                <div className="utility-stack">
                  <section className="utility-card">
                    <h3>About</h3>
                    <div className="about-card">
                      <div className="about-card__brand">
                        <a
                          className="about-card__logo-link"
                          href="https://gorillagrin.com"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Visit Gorilla Grin"
                        >
                          <img
                            className="about-card__logo"
                            src={`${import.meta.env.BASE_URL}gorilla-grin-horizontal.png`}
                            alt="Gorilla Grin"
                          />
                        </a>
                        <button
                          type="button"
                          className="app-footer__share utility-card__action about-card__share"
                          onClick={handleShareApp}
                        >
                          Share FL Plates
                        </button>
                      </div>
                      <div className="about-card__body">
                        <p className="utility-card__meta">
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
                        <p className="utility-card__meta">
                          Specialty plate images are not the intellectual property of Gorilla
                          Grin. They belong to the Florida Department of Highway Safety and Motor
                          Vehicles and are displayed here for identification, educational, and
                          entertainment purposes under a fair use claim.
                        </p>
                        <p className="utility-card__meta">
                          Version {buildInfo.version} • Built {buildDateLabel}
                        </p>
                        {buildInfo.branch || buildInfo.commit ? (
                          <p className="utility-card__meta">
                            {buildInfo.branch ? `Branch ${buildInfo.branch}` : null}
                            {buildInfo.branch && buildInfo.commit ? " • " : null}
                            {buildInfo.commit ? `Commit ${buildInfo.commit}` : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

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

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeIcon } from "./components/BadgeIcon";
import {
  floridaBadgeCounties,
  floridaBadgeGroupLabels,
  floridaBadgeGroupSymbols,
  floridaGame,
  floridaMixedBagCategories,
  floridaPanhandleScoutCounties
} from "./config/floridaGame";
import { PlateCard } from "./components/PlateCard";
import { getPlateVersionById, groupedPlates, plates } from "./data/plates";
import { buildInfo } from "./generated/buildInfo";
import { evaluateBadges, type BadgeGroup, type EvaluatedBadge } from "./lib/badges";
import { formatDiscoveryTime } from "./lib/format";
import { createDiscovery } from "./lib/geolocation";
import { reverseGeocodePlace } from "./lib/reverseGeocode";
import { loadDiscoveries, saveDiscoveries } from "./lib/storage";
import type { Plate, PlateCategory, PlateDiscoveryMap, PlateVersion } from "./types";

const THEME_STORAGE_KEY = "florida-plates-theme";
const UI_PREFERENCES_STORAGE_KEY = "florida-plates-ui-preferences";
const ONBOARDING_HINT_DISMISSED_STORAGE_KEY = "florida-plates-onboarding-dismissed";

type ThemeMode = "light" | "dark";
type PlateVisibilityFilter = "all" | "found" | "missing";
type PlateArrangement = "category" | "az" | "za";
type ExploreTab = "badges" | "stats" | "map" | "timeline";
type UtilityTab = "settings" | "help" | "safe" | "about";
type TimelineSort = "desc" | "asc";

const badgePlateSets: Record<string, string[]> = {
  "grand-slam": ["Miami Marlins (Baseball)", "Tampa Bay Rays (Baseball)"],
  touchdown: [
    "Jacksonville Jaguars (Football)",
    "Miami Dolphins (Football)",
    "Tampa Bay Buccaneers (Football)"
  ],
  "hat-trick": ["Florida Panthers (Hockey)", "Tampa Bay Lightning (Hockey)"],
  "slam-dunk": ["Miami Heat (Basketball)", "Orlando Magic (Basketball)"],
  "all-branches": [
    "U.S. Army",
    "U.S. Navy",
    "U.S. Air Force",
    "U.S. Marine Corps",
    "U.S. Coast Guard"
  ],
  "back-the-blue": [
    "Fallen Law Enforcement Officers",
    "Florida Sheriffs Association",
    "Fraternal Order of Police",
    "Police Athletic League",
    "Police Benevolent Association",
    "Support Law Enforcement"
  ],
  "fire-watch": ["Salutes Firefighters"],
  "united-front": [
    "Fallen Law Enforcement Officers",
    "Florida Sheriffs Association",
    "Fraternal Order of Police",
    "Police Athletic League",
    "Police Benevolent Association",
    "Support Law Enforcement",
    "Salutes Firefighters"
  ],
  "air-support": ["Blue Angels"],
  airborne: ["U.S. Paratroopers"],
  "bronze-star-honor": ["Bronze Star"],
  distinguished: ["Air Force Cross", "Distinguished Flying Cross", "Distinguished Service Cross"],
  "combat-ready": [
    "Combat Action Badge",
    "Combat Action Ribbon",
    "Combat Infantry Badge",
    "Combat Medical Badge"
  ],
  "decorated-service": [
    "Air Force Combat Action Medal",
    "Air Force Cross",
    "Army of Occupation",
    "Bronze Star",
    "Combat Action Badge",
    "Combat Action Ribbon",
    "Combat Infantry Badge",
    "Combat Medical Badge",
    "Distinguished Flying Cross",
    "Distinguished Service Cross"
  ]
};


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

function loadOnboardingHintDismissed(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_HINT_DISMISSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function App() {
  const appShareUrl = floridaGame.branding.shareUrl;
  const shareMessage = floridaGame.share.appMessage;
  const [discoveries, setDiscoveries] = useState<PlateDiscoveryMap>(() =>
    loadDiscoveries()
  );
  const [activePlateId, setActivePlateId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(() =>
    loadUiPreferences()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<PlateVisibilityFilter>("all");
  const [arrangement, setArrangement] = useState<PlateArrangement>("category");
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isOnboardingHintDismissed, setIsOnboardingHintDismissed] = useState<boolean>(() =>
    loadOnboardingHintDismissed()
  );
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isExplorePanelOpen, setIsExplorePanelOpen] = useState(false);
  const [isUtilityPanelOpen, setIsUtilityPanelOpen] = useState(false);
  const [previewPlate, setPreviewPlate] = useState<Plate | null>(null);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<EvaluatedBadge | null>(null);
  const [activeExploreTab, setActiveExploreTab] = useState<ExploreTab>("badges");
  const [timelineSort, setTimelineSort] = useState<TimelineSort>("desc");
  const [collapsedTimelineDates, setCollapsedTimelineDates] = useState<Set<string>>(
    () => new Set()
  );
  const [activeUtilityTab, setActiveUtilityTab] = useState<UtilityTab>("settings");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PlateCategory | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const resolvingLocalitiesRef = useRef<Set<string>>(new Set());
  const plateById = useMemo(
    () => new Map(plates.map((plate) => [plate.id, plate])),
    []
  );
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
    window.localStorage.setItem(
      ONBOARDING_HINT_DISMISSED_STORAGE_KEY,
      String(isOnboardingHintDismissed)
    );
  }, [isOnboardingHintDismissed]);

  useEffect(() => {
    if (!uiPreferences.showSearch) {
      setSearchTerm("");
    }
  }, [uiPreferences.showSearch]);

  useEffect(() => {
    if (!uiPreferences.showSearch) {
      return;
    }

    const focusHandle = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(focusHandle);
  }, [uiPreferences.showSearch]);

  useEffect(() => {
    if (
      !isUtilityPanelOpen &&
      !isExplorePanelOpen &&
      !previewPlate &&
      !isClearConfirmOpen &&
      !activeBadgeDetail
    ) {
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
  }, [isExplorePanelOpen, isUtilityPanelOpen, previewPlate, isClearConfirmOpen, activeBadgeDetail]);

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
        (discovery.locality === null || discovery.county === null || discovery.state === null) &&
        discovery.latitude !== null &&
        discovery.longitude !== null &&
        !resolvingLocalitiesRef.current.has(plateId)
    );

    if (!pendingEntry) {
      return;
    }

    const [plateId, discovery] = pendingEntry;
    resolvingLocalitiesRef.current.add(plateId);

    void reverseGeocodePlace(discovery.latitude!, discovery.longitude!)
      .then((place) => {
        if (!place.locality && !place.county && !place.state) {
          return;
        }

        setDiscoveries((current) => {
          const currentDiscovery = current[plateId];
          if (
            !currentDiscovery ||
            currentDiscovery.latitude !== discovery.latitude ||
            currentDiscovery.longitude !== discovery.longitude
          ) {
            return current;
          }

          return {
            ...current,
            [plateId]: {
              ...currentDiscovery,
              locality: currentDiscovery.locality ?? place.locality,
              county: currentDiscovery.county ?? place.county,
              state: currentDiscovery.state ?? place.state
            }
          };
        });
      })
      .finally(() => {
        resolvingLocalitiesRef.current.delete(plateId);
      });
  }, [discoveries]);

  const discoveryEntries = useMemo(
    () =>
      Object.entries(discoveries)
        .map(([plateId, discovery]) => {
          const plate = plateById.get(plateId);
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
    [discoveries, plateById]
  );
  const normalizedDiscoveries = useMemo(
    () =>
      Object.fromEntries(
        discoveryEntries.map(({ plate, discovery }) => [plate.id, discovery])
      ),
    [discoveryEntries]
  );
  const foundCount = discoveryEntries.length;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibilityAndSearchFilteredPlates = useMemo(
    () =>
      plates.filter((plate) => {
        const isFound = Boolean(normalizedDiscoveries[plate.id]);
        const matchesVisibility =
          visibilityFilter === "all" ||
          (visibilityFilter === "found" && isFound) ||
          (visibilityFilter === "missing" && !isFound);
        const matchesSearch =
          normalizedSearchTerm.length === 0 ||
          plate.searchText.includes(normalizedSearchTerm);

        return matchesVisibility && matchesSearch;
      }),
    [normalizedDiscoveries, normalizedSearchTerm, visibilityFilter]
  );
  const categoryFilterOptions = useMemo(
    () =>
      groupedPlates
        .map(({ category, plates: categoryPlates }) => ({
          category,
          plates: categoryPlates.filter((plate) =>
            visibilityAndSearchFilteredPlates.some(
              (filteredPlate) => filteredPlate.id === plate.id
            )
          )
        }))
        .filter(({ plates: categoryPlates }) => categoryPlates.length > 0),
    [visibilityAndSearchFilteredPlates]
  );
  const filteredPlates = useMemo(
    () =>
      selectedCategoryFilter === null
        ? visibilityAndSearchFilteredPlates
        : visibilityAndSearchFilteredPlates.filter(
            (plate) => plate.category === selectedCategoryFilter
          ),
    [selectedCategoryFilter, visibilityAndSearchFilteredPlates]
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
      ? [{ category: groupedPlates[0].category, plates: sortedPlates }]
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
        const found = categoryPlates.filter((plate) => normalizedDiscoveries[plate.id]).length;
        return {
          category,
          found,
          total: categoryPlates.length,
          percent: Math.round((found / categoryPlates.length) * 100)
        };
      }),
    [normalizedDiscoveries]
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
  const timelineGroups = useMemo(() => {
    const sortedEntries = [...discoveryEntries].sort((left, right) => {
      const comparison =
        new Date(left.discovery.foundAtIso).getTime() -
        new Date(right.discovery.foundAtIso).getTime();
      return timelineSort === "asc" ? comparison : -comparison;
    });

    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    const groups = new Map<
      string,
      Array<(typeof discoveryEntries)[number]>
    >();

    for (const entry of sortedEntries) {
      const key = formatter.format(new Date(entry.discovery.foundAtIso));
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }

    return [...groups.entries()];
  }, [discoveryEntries, timelineSort]);

  useEffect(() => {
    setCollapsedTimelineDates((current) => {
      const availableDates = new Set(timelineGroups.map(([dateLabel]) => dateLabel));
      return new Set([...current].filter((dateLabel) => availableDates.has(dateLabel)));
    });
  }, [timelineGroups]);

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
    () => evaluateBadges(plates, normalizedDiscoveries),
    [normalizedDiscoveries]
  );
  // Filter for earned badges
  const earnedBadges = useMemo(
    () => evaluatedBadges.filter((badge) => badge.earned),
    [evaluatedBadges]
  );
  // Group all badges (earned and unearned) by group for display
  const badgeGroupLabels: Record<BadgeGroup, string> = floridaBadgeGroupLabels;
  const badgeGroupSymbols: Record<BadgeGroup, string> = floridaBadgeGroupSymbols;
  const allBadgeGroups = useMemo(
    () =>
      Object.entries(
        evaluatedBadges.reduce<Record<string, typeof evaluatedBadges>>((groups, badge) => {
          const key = badge.group;
          groups[key] = [...(groups[key] ?? []), badge];
          return groups;
        }, {})
      ) as Array<[BadgeGroup, typeof evaluatedBadges]>,
    [evaluatedBadges]
  );

  useEffect(() => {
    if (
      selectedCategoryFilter !== null &&
      !categoryFilterOptions.some(({ category }) => category === selectedCategoryFilter)
    ) {
      setSelectedCategoryFilter(null);
    }
  }, [categoryFilterOptions, selectedCategoryFilter]);

  useEffect(() => {
    if (!previewPlate) {
      setPreviewVersionId(null);
      return;
    }

    setPreviewVersionId(previewPlate.defaultVersion.id);
  }, [previewPlate]);

  const previewVersion = useMemo<PlateVersion | null>(
    () => (previewPlate ? getPlateVersionById(previewPlate, previewVersionId) : null),
    [previewPlate, previewVersionId]
  );
  // Removed unused activeBadgeProgressLabel
  const activeBadgeSupportingDiscoveries = activeBadgeDetail
    ? getBadgeSupportingDiscoveries(activeBadgeDetail)
    : [];

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

  function handleClearDiscoveries() {
    if (foundCount === 0) {
      return;
    }
    setIsClearConfirmOpen(true);
  }

  function confirmClearDiscoveries() {
    setDiscoveries({});
    setActivePlateId(null);
    setIsClearConfirmOpen(false);
  }

  function setTransientStatus(message: string, durationMs = 2500) {
    setShareStatus(message);
    window.setTimeout(() => setShareStatus(null), durationMs);
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
        setTransientStatus("Share text copied");
        return;
      }

      window.prompt("Copy and share this message:", text);
    } catch {
      setTransientStatus("Share canceled", 2000);
    }
  }

  async function handleShareApp() {
    await handleShareText(floridaGame.branding.appShareName, shareMessage);
  }

  async function handleShareBadge(badgeName: string) {
    const badgeShareMessage = floridaGame.share.badgeMessage(badgeName);

    await handleShareText(`${floridaGame.branding.appShareName} - ${badgeName}`, badgeShareMessage);
  }

  function toggleTimelineDate(dateLabel: string) {
    setCollapsedTimelineDates((current) => {
      const next = new Set(current);
      if (next.has(dateLabel)) {
        next.delete(dateLabel);
      } else {
        next.add(dateLabel);
      }
      return next;
    });
  }

  // Removed unused getBadgeProgressLabel function

  function findDiscoveriesForPlateNames(plateNames: string[]) {
    const plateNameSet = new Set(plateNames);
    return discoveryEntries.filter(({ plate }) => plateNameSet.has(plate.name));
  }

  // (Removed unused getBadgeProgressLabel)

  function findDiscoveriesForCounties(counties: string[]) {
    const countySet = new Set(counties);
    return discoveryEntries.filter(({ discovery }) => {
      const county = discovery.county?.replace(/\s+County$/i, "").trim() ?? null;
      return county ? countySet.has(county) : false;
    });
  }

  function findDiscoveriesForCategories(categories: string[]) {
    const categorySet = new Set(categories);
    return discoveryEntries.filter(({ plate }) => categorySet.has(plate.category));
  }

  function getBadgeSupportingDiscoveries(badge: EvaluatedBadge) {
    switch (badge.id) {
      case "first-spot":
        return oldestSighting ? [oldestSighting] : [];
      case "five-alive":
        return discoveryEntries.slice(-5);
      case "ten-down":
        return discoveryEntries.slice(-10);
      case "quarter-mark":
      case "halfway-home":
      case "closing-in":
      case "complete-set":
        return discoveryEntries;
      case "first-day-of-school":
        return discoveryEntries.filter(({ plate }) => plate.category === "Universities").slice(-1);
      case "campus-tour":
      case "freshman":
      case "sophomore":
      case "junior":
      case "senior":
      case "graduation-day":
        return findDiscoveriesForCategories(["Universities"]);
      case "green-light":
      case "eco-scout":
        return findDiscoveriesForCategories(["Nature & Wildlife"]);
      case "sports-fan":
      case "all-teams":
        return findDiscoveriesForCategories(["Professional Sports"]);
      case "mixed-bag":
      case "full-spectrum":
        return discoveryEntries.filter(({ plate }) => floridaMixedBagCategories.has(plate.category));
      case "reporting-for-duty":
      case "on-call":
      case "in-service":
      case "those-who-serve":
        return discoveryEntries.filter(
          ({ plate }) =>
            plate.category === "Military & Veterans" || plate.category === "Public Safety"
        );
      case "i-get-around":
      case "road-trip": {
        const seenLocalities = new Set<string>();
        return discoveryEntries.filter(({ discovery }) => {
          const locality = discovery.locality;
          if (!locality || seenLocalities.has(locality)) {
            return false;
          }
          seenLocalities.add(locality);
          return true;
        });
      }
      case "escapee":
        return discoveryEntries.filter(({ discovery }) => {
          if (discovery.state) {
            return discovery.state !== "Florida";
          }

          if (discovery.latitude !== null && discovery.longitude !== null) {
            return !(
              discovery.latitude >= 24.3 &&
              discovery.latitude <= 31.1 &&
              discovery.longitude >= -87.8 &&
              discovery.longitude <= -79.7
            );
          }

          return false;
        });
      case "panhandle-scout":
        return discoveryEntries.filter(({ discovery }) => {
          const county = discovery.county?.replace(/\s+County$/i, "").trim() ?? null;
          return county ? floridaPanhandleScoutCounties.has(county) : false;
        });
      default:
        if (badgePlateSets[badge.id]) {
          return findDiscoveriesForPlateNames(badgePlateSets[badge.id]);
        }

        if (floridaBadgeCounties[badge.id]) {
          return findDiscoveriesForCounties(floridaBadgeCounties[badge.id]);
        }

        return [];
    }
  }

  function renderBadgeCard(badge: EvaluatedBadge) {
    // All badges are now medals: icon + text, no container, no pill
    return (
      <div
        className="badge-icon-grid-item"
        key={badge.id}
        tabIndex={0}
        role="button"
        aria-label={badge.name}
        onClick={() => setActiveBadgeDetail(badge)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveBadgeDetail(badge); }}
        style={{ outline: 'none', cursor: 'pointer' }}
      >
        <BadgeIcon badge={badge} />
        <span className="badge-medal-label">{badge.name}</span>
      </div>
    );
  }


  function handleApplyUpdate() {
    setIsUpdateReady(false);
    void navigator.serviceWorker
      .getRegistration(import.meta.env.BASE_URL)
      .then((registration) => {
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
  }

  // Export discoveries as JSON file
  function handleExportProgress() {
    const data = JSON.stringify(discoveries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'florida-plates-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  // Import discoveries from JSON file
  function handleImportProgress(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported && typeof imported === 'object') {
          setDiscoveries(imported);
          setTransientStatus('Progress imported!');
        } else {
          setTransientStatus('Invalid file format');
        }
      } catch {
        setTransientStatus('Import failed');
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be re-imported if needed
    event.target.value = '';
  }

  // Force reload the PWA and check for updates
  function handleForceReload() {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL).then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        } else {
          registration?.update();
        }
        // Always reload the page to ensure the latest version
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
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
            <p className="app-header__eyebrow">{floridaGame.branding.appTagline}</p>
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
              <label className="search-inline" htmlFor="plate-search">
                <input
                  ref={searchInputRef}
                  id="plate-search"
                  className="search-inline__input"
                  type="search"
                  placeholder="Search names, aliases, and causes"
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
                ) : null}
              </label>
            ) : null}
            {uiPreferences.showCategories ? (
              <label className="category-select-inline" htmlFor="category-filter">
                <span className="visually-hidden">Filter by category</span>
                <select
                  id="category-filter"
                  className="category-select-inline__select"
                  value={selectedCategoryFilter ?? ""}
                  onChange={(event) => {
                    const value = event.target.value as PlateCategory | "";
                    setSelectedCategoryFilter(value || null);
                  }}
                >
                  <option value="">All Categories</option>
                  {categoryFilterOptions.map(({ category }) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
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
            </div>
          </div>
          <p className="control-panel__summary" aria-live="polite">
            Showing {visiblePlateCount} of {plates.length} plates
          </p>
          {!isOnboardingHintDismissed ? (
            <section className="onboarding-tip" aria-label="How to interact with plate tiles">
              <div className="onboarding-tip__content">
                <p className="onboarding-tip__title">Quick tip</p>
                <p className="onboarding-tip__text">Tap a plate image to enlarge it.</p>
                <p className="onboarding-tip__text">
                  Tap the title area to mark it found.
                </p>
              </div>
              <button
                type="button"
                className="onboarding-tip__dismiss"
                onClick={() => setIsOnboardingHintDismissed(true)}
                aria-label="Dismiss quick tip"
              >
                Dismiss
              </button>
            </section>
          ) : null}
        </div>
      </header>

      <main className="plate-groups">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(({ category, plates: categoryPlates }, index) => (
            <section
              className="plate-group"
              key={arrangement === "category" ? category : `flat-${index}`}
            >
              <div className="plate-group__heading">
                <h2>
                  {arrangement === "category"
                    ? category
                    : selectedCategoryFilter
                      ? `${selectedCategoryFilter} ${arrangement === "az" ? "A-Z" : "Z-A"}`
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
                    discovery={normalizedDiscoveries[plate.id]}
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

      {previewPlate && previewVersion ? (
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
            <div className="plate-preview__image-stage">
              <img
                className="plate-preview__image"
                src={`${import.meta.env.BASE_URL}${previewVersion.imagePath}`}
                alt={previewPlate.name}
              />
            </div>
            <p className="plate-preview__caption">{previewPlate.name}</p>
            {previewPlate.versions.length > 1 ? (
              <div
                className="plate-preview__versions"
                role="tablist"
                aria-label={`${previewPlate.name} versions`}
                onClick={(event) => event.stopPropagation()}
              >
                {previewPlate.versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    className={`plate-preview__version-chip ${
                      previewVersion.id === version.id
                        ? "plate-preview__version-chip--active"
                        : ""
                    }`}
                    role="tab"
                    aria-selected={previewVersion.id === version.id}
                    onClick={() => setPreviewVersionId(version.id)}
                  >
                    {version.label}
                  </button>
                ))}
              </div>
            ) : null}
            {!normalizedDiscoveries[previewPlate.id] ? (
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
            <div
              className="plate-preview__details"
              onClick={(event) => event.stopPropagation()}
            >
              {previewPlate.sponsor.name ? (
                <div className="plate-preview__detail-row">
                  <span className="plate-preview__detail-label">Beneficiary</span>
                  <strong>{previewPlate.sponsor.name}</strong>
                </div>
              ) : null}
              <div className="plate-preview__detail-row">
                <span className="plate-preview__detail-label">Category</span>
                <strong>{previewPlate.category}</strong>
              </div>
              {previewPlate.sponsor.notes ? (
                <p className="plate-preview__notes">{previewPlate.sponsor.notes}</p>
              ) : previewVersion.notes ? (
                <p className="plate-preview__notes">{previewVersion.notes}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isClearConfirmOpen ? (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={() => setIsClearConfirmOpen(false)}
        >
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-confirm-title"
            aria-describedby="clear-confirm-description"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="confirm-modal__eyebrow">Clear found plates</p>
            <h2 className="confirm-modal__title" id="clear-confirm-title">
              Remove all saved sightings?
            </h2>
            <p className="confirm-modal__description" id="clear-confirm-description">
              This will clear every found plate, timestamp, and saved location from this
              device.
            </p>
            <div className="confirm-modal__actions">
              <button
                type="button"
                className="confirm-modal__button confirm-modal__button--secondary"
                onClick={() => setIsClearConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-modal__button confirm-modal__button--danger"
                onClick={confirmClearDiscoveries}
              >
                Clear found
              </button>
            </div>
          </section>
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
            aria-label={`${floridaGame.branding.appName} explore panel`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="utility-panel__header">
              <div>
                <p className="utility-panel__eyebrow">Explore</p>
                <h2 className="utility-panel__title">{floridaGame.branding.appName} explore panel</h2>
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
              {(["badges", "stats", "timeline", "map"] as ExploreTab[]).map((tab) => (
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
                  {tab === "badges"
                    ? "Badges"
                    : tab === "stats"
                      ? "Stats"
                      : tab === "timeline"
                        ? "Timeline"
                        : "Map"}
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
              {activeExploreTab === "timeline" ? (
                <div className="utility-stack">
                  <section className="utility-card utility-card--about">
                    <div className="utility-card__header">
                      <div>
                        <h3>Timeline</h3>
                        <p className="utility-card__meta">
                          Plate sightings grouped by date.
                        </p>
                      </div>
                      <div className="view-toggle" role="group" aria-label="Timeline sort">
                        <button
                          type="button"
                          className={`view-toggle__chip ${
                            timelineSort === "desc" ? "view-toggle__chip--active" : ""
                          }`}
                          onClick={() => setTimelineSort("desc")}
                          aria-pressed={timelineSort === "desc"}
                        >
                          Newest first
                        </button>
                        <button
                          type="button"
                          className={`view-toggle__chip ${
                            timelineSort === "asc" ? "view-toggle__chip--active" : ""
                          }`}
                          onClick={() => setTimelineSort("asc")}
                          aria-pressed={timelineSort === "asc"}
                        >
                          Oldest first
                        </button>
                      </div>
                    </div>
                  </section>
                  {timelineGroups.length > 0 ? (
                    <div className="timeline-groups">
                      {timelineGroups.map(([dateLabel, entries]) => (
                        <section className="utility-card timeline-group" key={dateLabel}>
                          <button
                            type="button"
                            className="timeline-group__header"
                            onClick={() => toggleTimelineDate(dateLabel)}
                            aria-expanded={!collapsedTimelineDates.has(dateLabel)}
                          >
                            <h3>{dateLabel}</h3>
                            <span>
                              {entries.length}
                              <strong
                                className={`timeline-group__chevron ${
                                  collapsedTimelineDates.has(dateLabel)
                                    ? "timeline-group__chevron--collapsed"
                                    : ""
                                }`}
                                aria-hidden="true"
                              >
                                ▾
                              </strong>
                            </span>
                          </button>
                          {!collapsedTimelineDates.has(dateLabel) ? (
                            <div className="timeline-list">
                              {entries.map(({ plate, discovery }) => (
                                <article
                                  className="utility-card timeline-entry"
                                  key={`${plate.id}-${discovery.foundAtIso}`}
                                >
                                  <div className="timeline-entry__plate">
                                    <img
                                      className="timeline-entry__image"
                                      src={`${import.meta.env.BASE_URL}${plate.defaultVersion.imagePath}`}
                                      alt={plate.name}
                                    />
                                    <div className="timeline-entry__copy">
                                      <h4>{plate.name}</h4>
                                      <p className="utility-card__meta">
                                        {formatDiscoveryTime(discovery.foundAtIso)}
                                      </p>
                                      <p className="utility-card__meta">
                                        {discovery.locality ?? "Location unavailable"}
                                      </p>
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <section className="empty-state">
                      <h2>No timeline yet</h2>
                      <p>Find a few plates and your sightings will appear here.</p>
                    </section>
                  )}
                </div>
              ) : null}
              {activeExploreTab === "badges" ? (
                <div className="utility-stack">
                  <section className="utility-card utility-card--about">
                    <h3>Merit badges</h3>
                    <p className="utility-card__metric">
                      {earnedBadges.length} of {evaluatedBadges.length} earned
                    </p>
                    <p className="utility-card__meta">
                      Badges currently reflect your saved state.
                    </p>
                  </section>
                  <section className="utility-card">
                    {earnedBadges.length > 0 ? (
                      <div className="utility-stack">
                        {allBadgeGroups.map(([group, badges]) => (
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
                            <div className="badge-icon-grid">
                              {badges.map((badge) => renderBadgeCard(badge))}
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
                  {/* Remove Not yet earned section, all badges shown in one grid by group */}
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
            aria-label={`${floridaGame.branding.appName} utility panel`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="utility-panel__header">
              <div>
                <p className="utility-panel__eyebrow">Utility</p>
                <h2 className="utility-panel__title">{floridaGame.branding.appName} utility panel</h2>
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
                    <p className="utility-card__meta" style={{ marginBottom: 8 }}>
                      These toggles only change which controls appear on the main game screen. Your progress and filter state stay intact.
                    </p>
                    <div className="settings-list">
                      <button
                        type="button"
                        className="settings-row settings-row--compact"
                        onClick={() =>
                          setTheme((current) => (current === "light" ? "dark" : "light"))
                        }
                      >
                        <span>Color mode</span>
                        <strong>{theme === "light" ? "Light" : "Dark"}</strong>
                      </button>
                      <button
                        type="button"
                        className="settings-row settings-row--compact"
                        onClick={() => toggleUiPreference("showSearch")}
                      >
                        <span>Show search control</span>
                        <strong>{uiPreferences.showSearch ? "On" : "Off"}</strong>
                      </button>
                      <button
                        type="button"
                        className="settings-row settings-row--compact"
                        onClick={() => toggleUiPreference("showCategories")}
                      >
                        <span>Show category buttons</span>
                        <strong>{uiPreferences.showCategories ? "On" : "Off"}</strong>
                      </button>
                      <button
                        type="button"
                        className="settings-row settings-row--compact"
                        onClick={() => toggleUiPreference("showArrangement")}
                      >
                        <span>Show sort buttons</span>
                        <strong>{uiPreferences.showArrangement ? "On" : "Off"}</strong>
                      </button>
                    </div>
                  </section>
                  <section className="utility-card utility-card--about">
                    <h3>App Management</h3>
                    <button
                      type="button"
                      className="view-toggle__chip"
                      style={{ marginTop: 12, width: undefined, minWidth: 0, whiteSpace: 'nowrap', maxWidth: 'max-content', alignSelf: 'start' }}
                      onClick={handleForceReload}
                    >
                      Force Reload / Sync
                    </button>
                  </section>
                  <section className="utility-card">
                    <h3>Progress Management</h3>
                    <div className="utility-card__meta" style={{ marginBottom: 12 }}>
                      <ol style={{ paddingLeft: 18, margin: 0 }}>
                        <li>To export your progress, click <strong>Export Progress</strong>. This will download a backup file of your found plates and stats.</li>
                        <li>To import progress, click <strong>Import Progress</strong> and select a previously exported file. This will restore your found plates and stats from that backup.</li>
                        <li>Your progress is stored only on this device unless you export and import it elsewhere.</li>
                      </ol>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      <button
                        type="button"
                        className="view-toggle__chip"
                        onClick={handleExportProgress}
                        disabled={foundCount === 0}
                      >
                        Export Progress
                      </button>
                      <label style={{ display: 'inline-block' }}>
                        <span style={{ display: 'none' }}>Import Progress</span>
                        <input
                          type="file"
                          accept="application/json"
                          style={{ display: 'none' }}
                          onChange={handleImportProgress}
                        />
                        <button
                          type="button"
                          className="view-toggle__chip"
                          onClick={e => {
                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                            input?.click();
                          }}
                        >
                          Import Progress
                        </button>
                      </label>
                    </div>
                    <div className="utility-card__meta" style={{ marginBottom: 8 }}>
                      Clear all found plates, timestamps, and saved locations from this device.
                    </div>
                    <button
                      type="button"
                      className="clear-discoveries utility-card__action"
                      onClick={handleClearDiscoveries}
                      disabled={foundCount === 0}
                    >
                      Clear found
                    </button>
                  </section>
                </div>
              ) : null}
              {activeUtilityTab === "help" ? (
                <div className="utility-stack">
                  <section className="utility-card">
                    <h3>Install the app</h3>
                    {floridaGame.help.install.map((item) => (
                      <p className="utility-card__meta" key={item}>
                        {item}
                      </p>
                    ))}
                  </section>
                  <section className="utility-card">
                    <h3>How to play</h3>
                    <div className="utility-list utility-list--compact">
                      {floridaGame.help.howToPlay.map((item) => (
                        <p className="utility-card__meta" key={item}>
                          {item}
                        </p>
                      ))}
                    </div>
                  </section>
                  <section className="utility-card">
                    <h3>Useful tools</h3>
                    <div className="utility-list utility-list--compact">
                      {floridaGame.help.usefulTools.map((item) => (
                        <p className="utility-card__meta" key={item}>
                          {item}
                        </p>
                      ))}
                    </div>
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
                      {floridaGame.help.safeUse.map((item) => (
                        <p className="utility-card__meta" key={item}>
                          {item}
                        </p>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}
              {activeUtilityTab === "about" ? (
                <div className="utility-stack">
                  <section className="utility-card">
                    <h3>About</h3>
                    <div className="about-table" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'start', width: '100%' }}>
                      {/* Row 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 140, justifySelf: 'center' }}>
                        <a
                          className="about-card__logo-link"
                          href={floridaGame.branding.developerUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Visit ${floridaGame.branding.developerName}`}
                        >
                          <img
                            className="about-card__logo"
                            src={`${import.meta.env.BASE_URL}${floridaGame.branding.developerLogoPath}`}
                            alt={floridaGame.branding.developerName}
                            style={{ maxWidth: 120, height: 'auto', marginBottom: 8, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                          />
                        </a>
                      </div>
                      <div>
                        <p className="utility-card__meta" style={{ marginBottom: 4 }}>
                          Developed by{' '}
                          <a
                            className="app-footer__link"
                            href={floridaGame.branding.developerUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {floridaGame.branding.developerName}
                          </a>
                          .
                        </p>
                        <p className="utility-card__meta" style={{ marginBottom: 4 }}>
                          Version {buildInfo.version} • Built {buildDateLabel}
                        </p>
                        {buildInfo.branch || buildInfo.commit ? (
                          <p className="utility-card__meta" style={{ marginBottom: 4 }}>
                            {buildInfo.branch ? `Branch ${buildInfo.branch}` : null}
                            {buildInfo.branch && buildInfo.commit ? ' • ' : null}
                            {buildInfo.commit ? `Commit ${buildInfo.commit}` : null}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          className="app-footer__share utility-card__action about-card__share"
                          onClick={handleShareApp}
                          style={{ width: 'auto', marginTop: 8 }}
                        >
                          Share FL Plates
                        </button>
                      </div>
                      {/* Row 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 140, justifySelf: 'center' }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 8, boxSizing: 'border-box', width: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <img
                            src="https://www.flhsmv.gov/wp-content/themes/flhsmv/images/logo.png"
                            alt="FLHSMV logo"
                            style={{ maxWidth: 104, height: 'auto', display: 'block' }}
                          />
                        </div>
                      </div>
                      <div>
                        <p
                          className="utility-card__meta"
                          style={{ marginBottom: 0 }}
                          dangerouslySetInnerHTML={{ __html: floridaGame.about.fairUseNotice.replace(
                            'Florida Department of Highway Safety and Motor Vehicles',
                            '<a href="https://www.flhsmv.gov/" target="_blank" rel="noopener noreferrer">Florida Department of Highway Safety and Motor Vehicles</a>'
                          ) }}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {activeBadgeDetail ? (
        <div
          className="utility-panel-backdrop"
          role="presentation"
          onClick={() => setActiveBadgeDetail(null)}
        >
          <section
            className="badge-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeBadgeDetail.name} badge details`}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Badge image removed as requested */}
            <section className="badge-modal-main-card">
              <div className="badge-modal-main-card__category">
                <span className={`badge-chip badge-chip--${activeBadgeDetail.group}`}> 
                  <span className={`badge-chip__icon badge-group__icon badge-group__icon--${badgeGroupSymbols[activeBadgeDetail.group]} badge-group__icon--${activeBadgeDetail.group}`} aria-hidden="true" />
                  <span>{badgeGroupLabels[activeBadgeDetail.group]}</span>
                </span>
              </div>
              <div className="badge-modal-main-card__name">{activeBadgeDetail.name}</div>
              <div className="badge-modal-main-card__desc">{activeBadgeDetail.description}</div>
              <div className="badge-modal-main-card__actions">
                <button
                  type="button"
                  className="app-footer__share badge-modal-main-card__share"
                  onClick={() => handleShareBadge(activeBadgeDetail.name)}
                >
                  Share
                </button>
              </div>
            </section>
            {/* Show counties for regional badges */}
            {activeBadgeDetail.group === "florida" &&
              typeof activeBadgeDetail.id === "string" &&
              activeBadgeDetail.id.endsWith("-explorer") &&
              window.floridaBadgeCounties &&
              window.floridaBadgeCounties[activeBadgeDetail.id] ? (
                <section className="utility-card badge-detail-modal__section">
                  <h3>Counties in this region</h3>
                  <ul className="badge-detail-modal__county-list">
                    {window.floridaBadgeCounties[activeBadgeDetail.id].map((county: string) => (
                      <li key={county}>{county} County</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            {/* Supported Sightings section (unchanged) */}
            {activeBadgeDetail.earned && activeBadgeSupportingDiscoveries.length > 0 ? (
              <section className="utility-card badge-detail-modal__section">
                <h3>
                  {activeBadgeSupportingDiscoveries.length === 1
                    ? "Supporting sighting"
                    : "Supporting sightings"}
                </h3>
                <div className="badge-detail-modal__sightings">
                  {activeBadgeSupportingDiscoveries.map(({ plate, discovery }) => (
                    <article
                      className="badge-detail-modal__sighting"
                      key={`${activeBadgeDetail.id}-${plate.id}-${discovery.foundAtIso}`}
                    >
                      <h4>{plate.name}</h4>
                      <p className="utility-card__meta">
                        {formatDiscoveryTime(discovery.foundAtIso)}
                      </p>
                      <p className="utility-card__meta">
                        {discovery.locality ?? "Location unavailable"}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
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

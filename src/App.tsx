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
  const earnedBadges = useMemo(
    () => evaluatedBadges.filter((badge) => badge.earned),
    [evaluatedBadges]
  );
  const remainingBadges = useMemo(
    () => evaluatedBadges.filter((badge) => !badge.earned),
    [evaluatedBadges]
  );
  const badgeGroupLabels: Record<BadgeGroup, string> = floridaBadgeGroupLabels;
  const badgeGroupSymbols: Record<BadgeGroup, string> = floridaBadgeGroupSymbols;
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
  const activeBadgeProgressLabel = activeBadgeDetail
    ? getBadgeProgressLabel(activeBadgeDetail)
    : null;
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

  function getBadgeProgressLabel(badge: EvaluatedBadge): string | null {
    if (
      badge.progressCurrent === undefined ||
      badge.progressTarget === undefined ||
      badge.progressTarget <= 1
    ) {
      return null;
    }

    return `${Math.min(badge.progressCurrent, badge.progressTarget)} / ${badge.progressTarget}`;
  }

  function findDiscoveriesForPlateNames(plateNames: string[]) {
    const plateNameSet = new Set(plateNames);
    return discoveryEntries.filter(({ plate }) => plateNameSet.has(plate.name));
  }

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
    return (
      <button
        type="button"
        className={`utility-card utility-card--badge utility-card--badge-${badge.group} ${
          badge.earned ? "" : "utility-card--badge-muted"
        }`}
        key={badge.id}
        onClick={() => setActiveBadgeDetail(badge)}
      >
        <div className="badge-card__icon-shell">
          <BadgeIcon badge={badge} />
        </div>
        <div className="badge-card__body">
          <h3>{badge.name}</h3>
          <span
            className={`badge-card__status ${
              badge.earned ? "badge-card__status--earned" : "badge-card__status--pending"
            }`}
          >
            {badge.earned ? "Earned" : "Not yet"}
          </span>
        </div>
      </button>
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
                            <div className="badge-grid">
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
                          <div className="badge-grid">
                            {badges.map((badge) => renderBadgeCard(badge))}
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
                  <section className="utility-card utility-card--about">
                    <h3>About these settings</h3>
                    <p className="utility-card__meta">
                      These toggles only change which controls appear on the main game screen.
                      Your progress and filter state stay intact.
                    </p>
                  </section>
                  <section className="utility-card">
                    <h3>Progress</h3>
                    <p className="utility-card__meta">
                      Clear all found plates, timestamps, and saved locations from this device.
                    </p>
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
                  <section className="utility-card">
                    <h3>Install the app</h3>
                    {floridaGame.help.install.map((item) => (
                      <p className="utility-card__meta" key={item}>
                        {item}
                      </p>
                    ))}
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
                    <div className="about-card">
                      <div className="about-card__brand">
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
                            href={floridaGame.branding.developerUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {floridaGame.branding.developerName}
                          </a>
                          .
                        </p>
                        <p className="utility-card__meta">
                          {floridaGame.about.fairUseNotice}
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
            <div className="badge-detail-modal__header">
              <div
                className={`badge-detail-modal__icon-shell badge-detail-modal__icon-shell--${activeBadgeDetail.group}`}
              >
                <BadgeIcon badge={activeBadgeDetail} />
              </div>
              <div className="badge-detail-modal__intro">
                <div className="badge-detail-modal__intro-copy">
                  <p className="utility-panel__eyebrow">Merit badge</p>
                  <h2 className="badge-detail-modal__title">{activeBadgeDetail.name}</h2>
                  <p className="badge-detail-modal__lede">
                    {activeBadgeDetail.description}
                  </p>
                </div>
                <div className="badge-detail-modal__header-actions">
                  <span
                    className={`badge-card__status ${
                      activeBadgeDetail.earned
                        ? "badge-card__status--earned"
                        : "badge-card__status--pending"
                    }`}
                  >
                    {activeBadgeDetail.earned ? "Earned" : "Not yet"}
                  </span>
                  {activeBadgeDetail.earned ? (
                    <button
                      type="button"
                      className="app-footer__share badge-detail-modal__share"
                      onClick={() => handleShareBadge(activeBadgeDetail.name)}
                    >
                      Share
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="badge-detail-modal__body">
              <div className="badge-detail-modal__meta">
                <div className={`badge-chip badge-chip--${activeBadgeDetail.group}`}>
                  <span
                    className={`badge-chip__icon badge-group__icon badge-group__icon--${badgeGroupSymbols[activeBadgeDetail.group]} badge-group__icon--${activeBadgeDetail.group}`}
                    aria-hidden="true"
                  />
                  <span>{badgeGroupLabels[activeBadgeDetail.group]}</span>
                </div>
                {activeBadgeProgressLabel ? (
                  <span className="badge-progress-pill badge-progress-pill--modal">
                    {activeBadgeProgressLabel}
                  </span>
                ) : null}
              </div>
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

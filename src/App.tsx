import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BadgeIcon } from "./components/BadgeIcon";
import { ExplorePage } from "./components/ExplorePage";
import { HelpPage } from "./components/HelpPage";
import { SettingsPage } from "./components/SettingsPage";
import { StatePicker } from "./components/StatePicker";
import { getSelectedStateId } from "./games/activeGame";
import { Icon } from "./components/Icon";
import {
  activeGame,
  activeBadgeCounties,
  activeBadgeGroupLabels,
  activeBadgeGroupSymbols,
  activeMixedBagCategories,
  activePanhandleScoutCounties
} from "./games/activeGame";
import { PlateCard } from "./components/PlateCard";
import { groupedPlates, plates } from "./data/plates";
import { buildInfo } from "./generated/buildInfo";
import { evaluateBadges, type BadgeGroup, type EvaluatedBadge } from "./lib/badges";
import { formatDiscoveryTime } from "./lib/format";
import { createDiscovery, enrichDiscoveryLocation } from "./lib/geolocation";
import { reverseGeocodePlace } from "./lib/reverseGeocode";
import { loadDiscoveries, saveDiscoveries } from "./lib/storage";
import type { Plate, PlateCategory, PlateDiscoveryMap } from "./types";

const THEME_STORAGE_KEY = "florida-plates-theme";
const UI_PREFERENCES_STORAGE_KEY = "florida-plates-ui-preferences";
const ONBOARDING_HINT_DISMISSED_STORAGE_KEY = "florida-plates-onboarding-dismissed";

type ThemeMode = "light" | "dark";
type PlateVisibilityFilter = "all" | "found" | "missing";
type PlateArrangement = "category" | "az" | "za";
type ExploreTab = "badges" | "stats" | "map" | "timeline";
type ActiveView = "home" | "explore" | "help" | "settings" | "state-picker";
type TimelineSort = "desc" | "asc";

const badgePlateSets: Record<string, string[]> = {
  "coastal-cruiser": [
    "Discover Florida's Oceans",
    "Florida Bay Forever",
    "Indian River Lagoon",
    "Protect Marine Wildlife",
    "Protect Our Reefs",
    "Save Our Seas",
    "Tampa Bay Estuary"
  ],
  "farm-fresh": [
    "Agriculture",
    "Agricultural Education",
    "Agriculture & Consumer Services"
  ],
  "grand-slam": ["Miami Marlins (Baseball)", "Tampa Bay Rays (Baseball)"],
  touchdown: [
    "Jacksonville Jaguars (Football)",
    "Miami Dolphins (Football)",
    "Tampa Bay Buccaneers (Football)"
  ],
  "hat-trick": ["Florida Panthers (Hockey)", "Tampa Bay Lightning (Hockey)"],
  "slam-dunk": ["Miami Heat (Basketball)", "Orlando Magic (Basketball)"],
  goal: ["Inter Miami FC (Soccer)", "Orlando City (Soccer)"],
  "checkered-flag": ["NASCAR"],
  "thrill-ride": ["Walt Disney World"],
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

function getDiscoveryLocationStatus(discovery: PlateDiscoveryMap[string]): string {
  if (discovery.locality) {
    return discovery.locality;
  }

  if (discovery.latitude !== null && discovery.longitude !== null) {
    return "Coordinates saved";
  }

  return "Location permission unavailable";
}
/* ── Swipe-to-dismiss hook ── */
function useSwipeDismiss(onDismiss: () => void) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ startY: 0, currentY: 0, isDragging: false });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragState.current = { startY: touch.clientY, currentY: touch.clientY, isDragging: true };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragState.current.isDragging || !sheetRef.current) return;
    const touch = e.touches[0];
    const deltaY = Math.max(0, touch.clientY - dragState.current.startY);
    dragState.current.currentY = touch.clientY;
    sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    sheetRef.current.style.transition = "none";
    if (deltaY > 0) e.preventDefault();
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragState.current.isDragging || !sheetRef.current) return;
    const deltaY = dragState.current.currentY - dragState.current.startY;
    dragState.current.isDragging = false;
    if (deltaY > 80) {
      sheetRef.current.style.transition = "transform 0.2s ease-out";
      sheetRef.current.style.transform = "translateY(100%)";
      setTimeout(onDismiss, 200);
    } else {
      sheetRef.current.style.transition = "transform 0.2s ease-out";
      sheetRef.current.style.transform = "translateY(0)";
    }
  }, [onDismiss]);

  return {
    sheetRef,
    grabberProps: { onTouchStart, onTouchMove, onTouchEnd },
  };
}

function App() {
  const appShareUrl = activeGame.branding.shareUrl;
  const shareMessage = activeGame.share.appMessage;
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
  const [activeView, setActiveView] = useState<ActiveView>(() =>
    getSelectedStateId() ? "home" : "state-picker"
  );
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [previewPlate, setPreviewPlate] = useState<Plate | null>(null);
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<EvaluatedBadge | null>(null);
  const [activeExploreTab, setActiveExploreTab] = useState<ExploreTab>("badges");
  const [timelineSort, setTimelineSort] = useState<TimelineSort>("desc");
  const [collapsedTimelineDates, setCollapsedTimelineDates] = useState<Set<string>>(
    () => new Set()
  );
  /* Help/Settings tab state moved to their respective page components */
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PlateCategory | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const headerSentinelRef = useRef<HTMLDivElement | null>(null);
  const categorySwipe = useSwipeDismiss(() => setIsCategorySheetOpen(false));
  const filterSwipe = useSwipeDismiss(() => setIsFilterSheetOpen(false));
  const sortSwipe = useSwipeDismiss(() => setIsSortSheetOpen(false));
  /* exploreSwipe/utilitySwipe removed — panels are now full pages */
  const previewSwipe = useSwipeDismiss(() => setPreviewPlate(null));
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
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

  /* Sort menu click-outside effect removed — sheets use backdrop dismiss */

  useEffect(() => {
    const sentinel = headerSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeaderCompact(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
      !previewPlate &&
      !isClearConfirmOpen &&
      !activeBadgeDetail
    ) {
      return;
    }

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };
  }, [previewPlate, isClearConfirmOpen, activeBadgeDetail]);

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
  const localityCount = useMemo(() => new Set(
    Object.values(discoveries).map((d) => d.locality).filter((l): l is string => Boolean(l))
  ).size, [discoveries]);
  const geotaggedEntries = useMemo(() =>
    discoveryEntries.filter(({ discovery }) => discovery.latitude !== null && discovery.longitude !== null),
    [discoveryEntries]
  );
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
          (
            (Array.isArray(plate.searchTerms) &&
              plate.searchTerms.some(term =>
                term && term.toLowerCase().includes(normalizedSearchTerm)
              )) ||
            (plate.name && plate.name.toLowerCase().includes(normalizedSearchTerm)) ||
            (plate.displayName && plate.displayName.toLowerCase().includes(normalizedSearchTerm)) ||
            (plate.baseName && plate.baseName.toLowerCase().includes(normalizedSearchTerm))
          );

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
    () => evaluateBadges(plates, normalizedDiscoveries, activeGame.id),
    [normalizedDiscoveries]
  );
  // Filter for earned badges
  const earnedBadges = useMemo(
    () => evaluatedBadges.filter((badge) => badge.earned),
    [evaluatedBadges]
  );
  // Group all badges (earned and unearned) by group for display
  const badgeGroupLabels: Record<BadgeGroup, string> = activeBadgeGroupLabels;
  const badgeGroupSymbols: Record<BadgeGroup, string> = activeBadgeGroupSymbols;
  const allBadgeGroups = useMemo(
    (): Array<[BadgeGroup, typeof evaluatedBadges]> =>
      (Object.entries(
        evaluatedBadges.reduce<Record<string, typeof evaluatedBadges>>((groups, badge) => {
          const key = badge.group;
          groups[key] = [...(groups[key] ?? []), badge];
          return groups;
        }, {})
      ) as Array<[BadgeGroup, typeof evaluatedBadges]>).map(
        ([group, badges]): [BadgeGroup, typeof evaluatedBadges] => [
          group,
          [...badges].sort((left, right) => left.name.localeCompare(right.name))
        ]
      ),
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

  const previewVersion = previewPlate;
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

    void enrichDiscoveryLocation(discovery.foundAtIso)
      .then((enrichedDiscovery) => {
        if (
          enrichedDiscovery.latitude === null &&
          enrichedDiscovery.longitude === null &&
          enrichedDiscovery.locality === null &&
          enrichedDiscovery.county === null &&
          enrichedDiscovery.state === null
        ) {
          return;
        }

        setDiscoveries((current) => {
          const currentDiscovery = current[plate.id];
          if (!currentDiscovery || currentDiscovery.foundAtIso !== discovery.foundAtIso) {
            return current;
          }

          return {
            ...current,
            [plate.id]: {
              ...currentDiscovery,
              latitude: currentDiscovery.latitude ?? enrichedDiscovery.latitude,
              longitude: currentDiscovery.longitude ?? enrichedDiscovery.longitude,
              locality: currentDiscovery.locality ?? enrichedDiscovery.locality,
              county: currentDiscovery.county ?? enrichedDiscovery.county,
              state: currentDiscovery.state ?? enrichedDiscovery.state
            }
          };
        });
      })
      .finally(() => {
        setActivePlateId((current) => (current === plate.id ? null : current));
      });
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
    await handleShareText(activeGame.branding.appShareName, shareMessage);
  }

  async function handleShareBadge(badgeName: string) {
    const badgeShareMessage = activeGame.share.badgeMessage(badgeName);

    await handleShareText(`${activeGame.branding.appShareName} - ${badgeName}`, badgeShareMessage);
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
      case "healing-hands":
        return findDiscoveriesForCategories(["Health & Family"]);
      case "sports-fan":
      case "all-teams":
        return findDiscoveriesForCategories(["Professional Sports"]);
      case "game-on":
        return findDiscoveriesForCategories(["Sports & Recreation"]);
      case "mixed-bag":
      case "full-spectrum":
        return discoveryEntries.filter(({ plate }) => activeMixedBagCategories.has(plate.category));
      case "reporting-for-duty":
      case "on-call":
      case "in-service":
      case "those-who-serve":
        return discoveryEntries.filter(
          ({ plate }) =>
            plate.category === "Military Service" ||
            plate.category === "Military Honors & History" ||
            plate.category === "Public Service"
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
          return county ? activePanhandleScoutCounties.has(county) : false;
        });
      default:
        if (badgePlateSets[badge.id]) {
          return findDiscoveriesForPlateNames(badgePlateSets[badge.id]);
        }

        if (activeBadgeCounties[badge.id]) {
          return findDiscoveriesForCounties(activeBadgeCounties[badge.id]);
        }

        return [];
    }
  }

  /* renderBadgeCard moved to ExplorePage component */

  function handleApplyUpdate() {
    setIsUpdateReady(false);
    void navigator.serviceWorker
      .getRegistration(import.meta.env.BASE_URL)
      .then((registration) => {
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
  }

  function waitForServiceWorkerUpdate(registration: ServiceWorkerRegistration, timeoutMs = 4000) {
    return new Promise<"waiting" | "no-update">((resolve) => {
      if (registration.waiting) {
        resolve("waiting");
        return;
      }

      let resolved = false;
      let timeoutId: number | null = null;

      const finish = (result: "waiting" | "no-update") => {
        if (resolved) {
          return;
        }
        resolved = true;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        registration.removeEventListener("updatefound", handleUpdateFound);
        resolve(result);
      };

      const handleInstalled = (worker: ServiceWorker) => {
        if (worker.state === "installed" && registration.waiting) {
          finish("waiting");
        }
      };

      const handleUpdateFound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        const handleStateChange = () => {
          if (installingWorker.state === "installed") {
            installingWorker.removeEventListener("statechange", handleStateChange);
            handleInstalled(installingWorker);
          }
        };

        installingWorker.addEventListener("statechange", handleStateChange);
      };

      registration.addEventListener("updatefound", handleUpdateFound);
      timeoutId = window.setTimeout(() => {
        finish(registration.waiting ? "waiting" : "no-update");
      }, timeoutMs);
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

  // Check for updates and reload only after a new service worker takes control
  async function handleForceReload() {
    if (!("serviceWorker" in navigator)) {
      window.location.reload();
      return;
    }

    setTransientStatus("Checking for updates...", 5000);

    const registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
    if (!registration) {
      setTransientStatus("Reloading app...", 2000);
      window.location.reload();
      return;
    }

    const initialWaitingWorker: ServiceWorker | null = registration.waiting;
    if (initialWaitingWorker) {
      setTransientStatus("Installing update...", 5000);
      initialWaitingWorker.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    await registration.update();
    const updateResult = await waitForServiceWorkerUpdate(registration);

    const readyWaitingWorker: ServiceWorker | null = registration.waiting;
    if (updateResult === "waiting" && readyWaitingWorker) {
      setTransientStatus("Installing update...", 5000);
      readyWaitingWorker.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    setTransientStatus("Already up to date");
  }

  function toggleUiPreference(key: keyof UiPreferences) {
    setUiPreferences((current) => ({
      ...current,
      [key]: !current[key]
    }));
  }

  function navigateHome() {
    setActiveView("home");
    setIsHeaderCompact(false);
    window.scrollTo(0, 0);
  }

  return (
    <div className="app-shell">
      {activeView === "home" ? (
      <>
      <div ref={headerSentinelRef} className="header-sentinel" aria-hidden="true" />
      <header className={`app-header ${isHeaderCompact ? "app-header--compact" : ""}`}>
        <div className="app-header__top">
          <div className="app-header__brand">
            {activeGame.branding.headerImage.type === "logo" ? (
              <button type="button" className="app-header__logo-btn" onClick={() => setActiveView("state-picker")} aria-label="Switch state">
                <img
                  className="app-header__logo"
                  src={`${import.meta.env.BASE_URL}${activeGame.branding.headerImage.path}`}
                  alt={activeGame.branding.headerImage.alt}
                />
              </button>
            ) : (
              <div className="welcome-sign" aria-label={activeGame.branding.appTagline} role="button" tabIndex={0} onClick={() => setActiveView("state-picker")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveView("state-picker"); }}>
                <span className="welcome-sign__welcome">{activeGame.branding.headerImage.line1}</span>
                <span className="welcome-sign__state">{activeGame.branding.headerImage.line2}</span>
                <span className="welcome-sign__tagline">{activeGame.branding.headerImage.line3}</span>
              </div>
            )}
            <button type="button" className="app-header__edition" onClick={() => setActiveView("state-picker")}>{activeGame.branding.appTagline}</button>
          </div>
          <div className="app-header__stats" aria-live="polite">
            <div className="app-header__kpi">
              <span className="app-header__kpi-value">{foundCount}</span>
              <span className="app-header__kpi-context">of {plates.length} plates</span>
            </div>
            <div className="app-header__kpi-divider" aria-hidden="true" />
            <button
              type="button"
              className="app-header__kpi app-header__kpi--secondary"
              onClick={() => {
                setActiveExploreTab("badges");
                setActiveView("explore");
              }}
              aria-label="Open merit badges"
            >
              <span className="app-header__kpi-value">{earnedBadges.length}</span>
              <span className="app-header__kpi-context">of {evaluatedBadges.length} badges</span>
            </button>
          </div>
        </div>
        <div className="control-panel">
          <div className="control-bar__search-row">
            {uiPreferences.showSearch ? (
              <label className="search-inline" htmlFor="plate-search">
                <Icon name="search" size={16} className="search-inline__icon" />
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
              <button
                type="button"
                className="control-bar__btn"
                onClick={() => setIsCategorySheetOpen(true)}
              >
                {selectedCategoryFilter ?? "All Categories"}
              </button>
            ) : null}
          </div>
          <div className="control-bar__filter-sort">
            <button
              type="button"
              className={`control-bar__btn ${visibilityFilter !== "all" ? "control-bar__btn--active" : ""}`}
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <Icon name="filter" size={14} />
              Filter
            </button>
            {uiPreferences.showArrangement ? (
              <button
                type="button"
                className="control-bar__btn control-bar__btn--sort"
                onClick={() => setIsSortSheetOpen(true)}
              >
                Sort by: {arrangement === "category" ? "Categories" : arrangement === "az" ? "A–Z" : "Z–A"}
              </button>
            ) : null}
          </div>
          <p className="control-panel__summary" aria-live="polite">
            Showing {visiblePlateCount} of {plates.length} plates
          </p>
        </div>
      </header>

      <main className="plate-groups">
        {!isOnboardingHintDismissed ? (
          <div className="onboarding-tip" role="status">
            <p className="onboarding-tip__text">
              Tap image to preview &middot; Tap &#x2295; to mark found
            </p>
            <button
              type="button"
              className="onboarding-tip__dismiss"
              onClick={() => setIsOnboardingHintDismissed(true)}
              aria-label="Dismiss tip"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        ) : null}
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
          className="bottom-dock__item bottom-dock__item--active"
          aria-label="Home"
        >
          <Icon name="home" size={22} className="bottom-dock__icon" />
          <span className="bottom-dock__label">Home</span>
        </button>
        <button
          type="button"
          className="bottom-dock__item"
          onClick={() => { setActiveExploreTab("badges"); setActiveView("explore"); }}
          aria-label="Explore"
        >
          <Icon name="globe" size={22} className="bottom-dock__icon" />
          <span className="bottom-dock__label">Explore</span>
        </button>
        <button
          type="button"
          className="bottom-dock__item"
          onClick={() => setActiveView("help")}
          aria-label="Help"
        >
          <Icon name="help" size={22} className="bottom-dock__icon" />
          <span className="bottom-dock__label">Help</span>
        </button>
        <button
          type="button"
          className="bottom-dock__item"
          onClick={() => setActiveView("settings")}
          aria-label="Settings"
        >
          <Icon name="gear" size={22} className="bottom-dock__icon" />
          <span className="bottom-dock__label">Settings</span>
        </button>
      </nav>
      </>
      ) : null}

      {previewPlate && previewVersion ? (
        <div
          className="sheet-backdrop"
          style={{ zIndex: 33 }}
          role="presentation"
          onClick={() => setPreviewPlate(null)}
        >
          <div
            className="sheet preview-sheet"
            ref={previewSwipe.sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${previewPlate.name} plate preview`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet__header" {...previewSwipe.grabberProps} style={{ touchAction: "none" }}>
              <h3 className="sheet__title">{previewPlate.name}</h3>
              <button
                type="button"
                className="sheet__close"
                aria-label="Close plate preview"
                onClick={() => setPreviewPlate(null)}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
            <div className="sheet__body">
              <div className="preview-sheet__image-wrap">
                <img
                  className="preview-sheet__image"
                  src={`${import.meta.env.BASE_URL}${previewPlate.image.path}`}
                  alt={previewPlate.name}
                />
              </div>
              {previewPlate.sponsor ? (
                <div className="preview-sheet__row">
                  <span className="preview-sheet__label">Beneficiary</span>
                  <strong>{previewPlate.sponsor}</strong>
                </div>
              ) : null}
              <div className="preview-sheet__row">
                <span className="preview-sheet__label">Category</span>
                <strong>{previewPlate.category}</strong>
              </div>
              {previewPlate.notes ? (
                <p className="preview-sheet__notes">{previewPlate.notes}</p>
              ) : null}
            </div>
            {!normalizedDiscoveries[previewPlate.id] ? (
              <div className="sheet__footer">
                <button
                  type="button"
                  className="preview-sheet__found-btn"
                  onClick={() => {
                    handleTogglePlate(previewPlate, false);
                    setPreviewPlate(null);
                  }}
                >
                  Mark Found
                </button>
              </div>
            ) : null}
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

      {/* ── Bottom sheets for Category, Filter, Sort ── */}

      {isCategorySheetOpen ? (
        <div className="sheet-backdrop" role="presentation" onClick={() => setIsCategorySheetOpen(false)}>
          <div className="sheet" ref={categorySwipe.sheetRef} onClick={(e) => e.stopPropagation()}>
            <div className="sheet__header" {...categorySwipe.grabberProps} style={{ touchAction: "none" }}>
              <h3 className="sheet__title">Category</h3>
              <button type="button" className="sheet__close" onClick={() => setIsCategorySheetOpen(false)} aria-label="Close"><Icon name="close" size={14} /></button>
            </div>
            <div className="sheet__body">
              <button
                type="button"
                className={`sheet__option ${selectedCategoryFilter === null ? "sheet__option--active" : ""}`}
                onClick={() => { setSelectedCategoryFilter(null); setIsCategorySheetOpen(false); }}
              >
                <span className="sheet__radio" aria-hidden="true" />
                All Categories
              </button>
              {categoryFilterOptions.map(({ category }) => (
                <button
                  key={category}
                  type="button"
                  className={`sheet__option ${selectedCategoryFilter === category ? "sheet__option--active" : ""}`}
                  onClick={() => { setSelectedCategoryFilter(category); setIsCategorySheetOpen(false); }}
                >
                  <span className="sheet__radio" aria-hidden="true" />
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isFilterSheetOpen ? (
        <div className="sheet-backdrop" role="presentation" onClick={() => setIsFilterSheetOpen(false)}>
          <div className="sheet" ref={filterSwipe.sheetRef} onClick={(e) => e.stopPropagation()}>
            <div className="sheet__header" {...filterSwipe.grabberProps} style={{ touchAction: "none" }}>
              <h3 className="sheet__title">Filter</h3>
              <button type="button" className="sheet__close" onClick={() => setIsFilterSheetOpen(false)} aria-label="Close"><Icon name="close" size={14} /></button>
            </div>
            <div className="sheet__body">
              {(["all", "found", "missing"] as PlateVisibilityFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`sheet__option ${visibilityFilter === option ? "sheet__option--active" : ""}`}
                  onClick={() => { setVisibilityFilter(option); setIsFilterSheetOpen(false); }}
                >
                  <span className="sheet__radio" aria-hidden="true" />
                  {option === "all" ? "All" : option === "found" ? "Found" : "Not found"}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isSortSheetOpen ? (
        <div className="sheet-backdrop" role="presentation" onClick={() => setIsSortSheetOpen(false)}>
          <div className="sheet" ref={sortSwipe.sheetRef} onClick={(e) => e.stopPropagation()}>
            <div className="sheet__header" {...sortSwipe.grabberProps} style={{ touchAction: "none" }}>
              <h3 className="sheet__title">Sort</h3>
              <button type="button" className="sheet__close" onClick={() => setIsSortSheetOpen(false)} aria-label="Close"><Icon name="close" size={14} /></button>
            </div>
            <div className="sheet__body">
              {([["category", "Categories"], ["az", "A to Z"], ["za", "Z to A"]] as [PlateArrangement, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`sheet__option ${arrangement === value ? "sheet__option--active" : ""}`}
                  onClick={() => { setArrangement(value); setIsSortSheetOpen(false); }}
                >
                  <span className="sheet__radio" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeView === "state-picker" ? (
        <StatePicker />
      ) : null}

      {activeView === "explore" ? (
        <ExplorePage
          onBack={navigateHome}
          activeTab={activeExploreTab}
          onTabChange={setActiveExploreTab}
          foundCount={foundCount}
          totalPlates={plates.length}
          localityCount={localityCount}
          categoryStats={categoryStats}
          topLocalities={topLocalities}
          newestSighting={newestSighting}
          oldestSighting={oldestSighting}
          evaluatedBadges={evaluatedBadges}
          earnedBadges={earnedBadges}
          allBadgeGroups={allBadgeGroups}
          badgeGroupLabels={badgeGroupLabels}
          badgeGroupSymbols={badgeGroupSymbols}
          onBadgeDetail={setActiveBadgeDetail}
          timelineSort={timelineSort}
          onTimelineSortChange={setTimelineSort}
          timelineGroups={timelineGroups}
          collapsedTimelineDates={collapsedTimelineDates}
          onToggleTimelineDate={toggleTimelineDate}
          mapPins={mapPins}
          mapBounds={mapBounds}
          geotaggedEntries={geotaggedEntries}
        />
      ) : null}

      {activeView === "help" ? (
        <HelpPage onBack={navigateHome} helpContent={activeGame.help} />
      ) : null}

      {activeView === "settings" ? (
        <SettingsPage
          onBack={navigateHome}
          theme={theme}
          onThemeToggle={() => setTheme((c) => c === "light" ? "dark" : "light")}
          uiPreferences={uiPreferences}
          onToggleUiPreference={toggleUiPreference}
          onForceReload={handleForceReload}
          foundCount={foundCount}
          onExportProgress={handleExportProgress}
          onImportProgress={handleImportProgress}
          onClearDiscoveries={handleClearDiscoveries}
          onShareApp={handleShareApp}
          onChangeState={() => setActiveView("state-picker")}
          buildVersion={buildInfo.version}
          buildDateLabel={buildDateLabel}
          attribution={activeGame.branding.attribution}
        />
      ) : null}

      {activeBadgeDetail ? (
        <div
          className="sheet-backdrop"
          style={{ zIndex: 34 }}
          role="presentation"
          onClick={() => setActiveBadgeDetail(null)}
        >
          <div
            className="sheet preview-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeBadgeDetail.name} badge details`}
          >
            <div className="sheet__header">
              <h3 className="sheet__title">{activeBadgeDetail.name}</h3>
              <button type="button" className="sheet__close" onClick={() => setActiveBadgeDetail(null)} aria-label="Close">
                <Icon name="close" size={14} />
              </button>
            </div>
            <div className="sheet__body">
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
                <BadgeIcon badge={activeBadgeDetail} size={120} />
              </div>
              <div className="preview-sheet__row">
                <span className="preview-sheet__label">Group</span>
                <span className={`badge-chip badge-chip--${activeBadgeDetail.group}`}>
                  <Icon
                    name={badgeGroupSymbols[activeBadgeDetail.group] as import("./components/Icon").IconName}
                    size={12}
                    className={`badge-group__icon--${activeBadgeDetail.group}`}
                  />
                  <span>{badgeGroupLabels[activeBadgeDetail.group]}</span>
                </span>
              </div>
              <div className="preview-sheet__row">
                <span className="preview-sheet__label">Status</span>
                <strong>{activeBadgeDetail.earned ? "Earned" : "Not yet"}</strong>
              </div>
              {activeBadgeDetail.progressTarget ? (
                <div className="preview-sheet__row">
                  <span className="preview-sheet__label">Progress</span>
                  <strong>{activeBadgeDetail.progressCurrent ?? 0} / {activeBadgeDetail.progressTarget}</strong>
                </div>
              ) : null}
              <p className="preview-sheet__notes">{activeBadgeDetail.description}</p>

              {activeBadgeDetail.earned ? (
                <button
                  type="button"
                  className="preview-sheet__found-btn"
                  onClick={() => handleShareBadge(activeBadgeDetail.name)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Icon name="share" size={18} /> Share
                </button>
              ) : null}

              {activeBadgeDetail.group === "florida" &&
              activeBadgeDetail.id.endsWith("-explorer") &&
              activeBadgeCounties?.[activeBadgeDetail.id] ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600 }}>Counties in this region</p>
                  {activeBadgeCounties[activeBadgeDetail.id].map((county: string) => (
                    <p key={county} style={{ margin: '0.15rem 0', fontSize: '0.84rem' }}>{county} County</p>
                  ))}
                </div>
              ) : null}

              {activeBadgeDetail.earned && activeBadgeSupportingDiscoveries.length > 0 ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 600 }}>
                    {activeBadgeSupportingDiscoveries.length === 1 ? "Supporting sighting" : "Supporting sightings"}
                  </p>
                  {activeBadgeSupportingDiscoveries.map(({ plate, discovery }) => (
                    <div key={`${activeBadgeDetail.id}-${plate.id}-${discovery.foundAtIso}`} className="preview-sheet__row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}>
                      <strong style={{ fontSize: '0.88rem' }}>{plate.name}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{formatDiscoveryTime(discovery.foundAtIso)} · {getDiscoveryLocationStatus(discovery)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
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


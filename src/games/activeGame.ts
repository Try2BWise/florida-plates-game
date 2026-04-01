import floridaDriverData from "../data/generated/florida-plate-driver.generated.json";
import floridaLegacyIdMap from "../data/generated/legacy-id-map.generated.json";
import mississippiDriverData from "./mississippi/mississippi-plate-driver.preview.json";
import mississippiLegacyIdMap from "./mississippi/legacy-id-map.preview.json";
import {
  floridaBadgeCounties,
  floridaBadgeGroupLabels,
  floridaBadgeGroupSymbols,
  floridaGame,
  floridaMixedBagCategories,
  floridaPanhandleScoutCounties
} from "../config/floridaGame";
import {
  mississippiBadgeCounties,
  mississippiBadgeGroupLabels,
  mississippiBadgeGroupSymbols,
  mississippiGame,
  mississippiMixedBagCategories,
  mississippiPanhandleScoutCounties
} from "./mississippi/mississippiGame";
import { plateCategories, type Plate, type PlateCategory } from "../types";

const validCategories = new Set<string>(plateCategories);
const activeGameId = (import.meta.env.VITE_ACTIVE_GAME ?? "florida").toLowerCase();

function toPlateCategory(value: string): PlateCategory {
  if (validCategories.has(value)) {
    return value as PlateCategory;
  }

  return "Civic & Causes";
}

function normalizeSearchTerms(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((term): term is string => typeof term === "string" && term.length > 0);
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return undefined;
}

function normalizeImagePath(pathValue: unknown, assetBasePath: string): string {
  const path = String(pathValue ?? "");
  if (!path) {
    return path;
  }

  if (!assetBasePath || path.startsWith("http") || path.startsWith("state-packs/")) {
    return path;
  }

  return `${assetBasePath}${path}`;
}

function normalizeNotes(notesValue: unknown): string | null {
  if (typeof notesValue !== "string") {
    return null;
  }

  const notes = notesValue.trim();
  if (!notes) {
    return null;
  }

  if (notes === "Second-pass official Mississippi scrape. Review category, search terms, and variant relationships.") {
    return null;
  }

  return notes;
}

function normalizePlate(plate: any, assetBasePath: string): Plate {
  return {
    ...plate,
    category: toPlateCategory(plate.category),
    searchTerms: normalizeSearchTerms(plate.searchTerms),
    relatedPlates: Array.isArray(plate.relatedPlates) ? plate.relatedPlates : [],
    variantOf: plate.variantOf ?? null,
    sponsor: plate.sponsor ?? null,
    notes: normalizeNotes(plate.notes),
    image: {
      path: normalizeImagePath(plate.image?.path, assetBasePath),
      remoteUrl: plate.image?.remoteUrl ?? null
    }
  };
}

const floridaSetup = {
  game: floridaGame,
  driverData: floridaDriverData,
  legacyIdMap: floridaLegacyIdMap as Record<string, string>,
  badgeCounties: floridaBadgeCounties,
  badgeGroupLabels: floridaBadgeGroupLabels,
  badgeGroupSymbols: floridaBadgeGroupSymbols,
  mixedBagCategories: floridaMixedBagCategories,
  panhandleScoutCounties: floridaPanhandleScoutCounties,
  assetBasePath: "",
  storage: {
    discoveriesKey: "florida-plates-discoveries",
    themeKey: "florida-plates-theme",
    uiPreferencesKey: "florida-plates-ui-preferences",
    onboardingHintKey: "florida-plates-onboarding-dismissed",
    progressExportFilename: "florida-plates-progress.json"
  }
};

const mississippiSetup = {
  game: mississippiGame,
  driverData: mississippiDriverData,
  legacyIdMap: mississippiLegacyIdMap as Record<string, string>,
  badgeCounties: mississippiBadgeCounties,
  badgeGroupLabels: mississippiBadgeGroupLabels,
  badgeGroupSymbols: mississippiBadgeGroupSymbols,
  mixedBagCategories: mississippiMixedBagCategories,
  panhandleScoutCounties: mississippiPanhandleScoutCounties,
  assetBasePath: "state-packs/mississippi/",
  storage: {
    discoveriesKey: "mississippi-plates-discoveries",
    themeKey: "mississippi-plates-theme",
    uiPreferencesKey: "mississippi-plates-ui-preferences",
    onboardingHintKey: "mississippi-plates-onboarding-dismissed",
    progressExportFilename: "mississippi-plates-progress.json"
  }
};

const activeSetup = activeGameId === "mississippi" ? mississippiSetup : floridaSetup;

export const activeGame = activeSetup.game;
export const activeBadgeCounties = activeSetup.badgeCounties;
export const activeBadgeGroupLabels = activeSetup.badgeGroupLabels;
export const activeBadgeGroupSymbols = activeSetup.badgeGroupSymbols;
export const activeMixedBagCategories = activeSetup.mixedBagCategories;
export const activePanhandleScoutCounties = activeSetup.panhandleScoutCounties;
export const activeLegacyIdMap = activeSetup.legacyIdMap;
export const activeStorage = activeSetup.storage;

export const activePlates: Plate[] = activeSetup.driverData.plates.map((plate) => normalizePlate(plate, activeSetup.assetBasePath));

export const activeGroupedPlates = plateCategories
  .map((category) => ({
    category,
    plates: activePlates.filter((plate) => plate.category === category)
  }))
  .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);

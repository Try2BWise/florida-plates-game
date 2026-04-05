import driverData from "../data/generated/florida-plate-driver.generated.json";
import legacyIdMap from "../data/generated/legacy-id-map.generated.json";
import {
  floridaBadgeCounties,
  floridaBadgeGroupLabels,
  floridaBadgeGroupSymbols,
  floridaGame,
  floridaMixedBagCategories,
  floridaPanhandleScoutCounties
} from "../config/floridaGame";
import { plateCategories, type Plate, type PlateCategory } from "../types";

/* ── State selection persistence ── */

const SELECTED_STATE_KEY = "every-pl8-selected-state";

export function getSelectedStateId(): string | null {
  try {
    return window.localStorage.getItem(SELECTED_STATE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedStateId(id: string): void {
  window.localStorage.setItem(SELECTED_STATE_KEY, id);
}

/* ── State pack loader ── */

const validCategories = new Set<string>(plateCategories);

function toPlateCategory(value: string): PlateCategory {
  if (validCategories.has(value)) {
    return value as PlateCategory;
  }
  return "Civic & Causes";
}

function loadFloridaPack() {
  const plates: Plate[] = driverData.plates.map((plate) => ({
    ...plate,
    category: toPlateCategory(plate.category)
  }));

  const groupedPlates = plateCategories
    .map((category) => ({
      category,
      plates: plates.filter((plate) => plate.category === category)
    }))
    .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);

  return {
    game: floridaGame,
    badgeCounties: floridaBadgeCounties,
    badgeGroupLabels: floridaBadgeGroupLabels,
    badgeGroupSymbols: floridaBadgeGroupSymbols,
    mixedBagCategories: floridaMixedBagCategories,
    panhandleScoutCounties: floridaPanhandleScoutCounties,
    legacyIdMap: legacyIdMap as Record<string, string>,
    plates,
    groupedPlates,
  };
}

// Future state packs will add cases here
function loadStatePack(stateId: string) {
  switch (stateId) {
    // case "mississippi": return loadMississippiPack();
    case "florida":
    default:
      return loadFloridaPack();
  }
}

/* ── Active exports ── */

const selectedId = getSelectedStateId() ?? "florida";
const pack = loadStatePack(selectedId);

export const activeStateId = selectedId;
export const activeGame = pack.game;
export const activeBadgeCounties = pack.badgeCounties;
export const activeBadgeGroupLabels = pack.badgeGroupLabels;
export const activeBadgeGroupSymbols = pack.badgeGroupSymbols;
export const activeMixedBagCategories = pack.mixedBagCategories;
export const activePanhandleScoutCounties = pack.panhandleScoutCounties;
export const activeLegacyIdMap = pack.legacyIdMap;
export const activePlates = pack.plates;
export const activeGroupedPlates = pack.groupedPlates;

export const activeStorage = {
  discoveriesKey: `${selectedId}-plates-discoveries`,
  themeKey: "every-pl8-theme",
  uiPreferencesKey: "every-pl8-ui-preferences",
  onboardingHintKey: `${selectedId}-plates-onboarding-dismissed`,
  progressExportFilename: `${selectedId}-plates-progress.json`
};

import floridaDriverData from "../data/generated/florida-plate-driver.generated.json";
import floridaLegacyIdMap from "../data/generated/florida-legacy-id-map.generated.json";
import mississippiDriverData from "../data/generated/mississippi-plate-driver.generated.json";
import mississippiLegacyIdMap from "../data/generated/mississippi-legacy-id-map.generated.json";
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
  mississippiRegionScoutCounties
} from "../config/mississippiGame";
import arkansasDriverData from "../data/generated/arkansas-plate-driver.generated.json";
import arkansasLegacyIdMap from "../data/generated/arkansas-legacy-id-map.generated.json";
import {
  arkansasBadgeCounties,
  arkansasBadgeGroupLabels,
  arkansasBadgeGroupSymbols,
  arkansasGame,
  arkansasMixedBagCategories,
  arkansasRegionScoutCounties
} from "../config/arkansasGame";
import missouriDriverData from "../data/generated/missouri-plate-driver.generated.json";
import missouriLegacyIdMap from "../data/generated/missouri-legacy-id-map.generated.json";
import {
  missouriBadgeCounties,
  missouriBadgeGroupLabels,
  missouriBadgeGroupSymbols,
  missouriGame,
  missouriMixedBagCategories,
  missouriRegionScoutCounties
} from "../config/missouriGame";
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

function buildPlates(driverData: { plates: Array<{ category: string } & Record<string, unknown>> }): Plate[] {
  return driverData.plates.map((plate) => ({
    ...plate,
    category: toPlateCategory(plate.category)
  })) as Plate[];
}

function buildGroupedPlates(plates: Plate[]) {
  return plateCategories
    .map((category) => ({
      category,
      plates: plates.filter((plate) => plate.category === category)
    }))
    .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);
}

function loadFloridaPack() {
  const plates = buildPlates(floridaDriverData);

  return {
    game: floridaGame,
    badgeCounties: floridaBadgeCounties,
    badgeGroupLabels: floridaBadgeGroupLabels,
    badgeGroupSymbols: floridaBadgeGroupSymbols,
    mixedBagCategories: floridaMixedBagCategories,
    panhandleScoutCounties: floridaPanhandleScoutCounties,
    legacyIdMap: floridaLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadMississippiPack() {
  const plates = buildPlates(mississippiDriverData);
  return {
    game: mississippiGame,
    badgeCounties: mississippiBadgeCounties,
    badgeGroupLabels: mississippiBadgeGroupLabels,
    badgeGroupSymbols: mississippiBadgeGroupSymbols,
    mixedBagCategories: mississippiMixedBagCategories,
    panhandleScoutCounties: mississippiRegionScoutCounties,
    legacyIdMap: mississippiLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadArkansasPack() {
  const plates = buildPlates(arkansasDriverData);
  return {
    game: arkansasGame,
    badgeCounties: arkansasBadgeCounties,
    badgeGroupLabels: arkansasBadgeGroupLabels,
    badgeGroupSymbols: arkansasBadgeGroupSymbols,
    mixedBagCategories: arkansasMixedBagCategories,
    panhandleScoutCounties: arkansasRegionScoutCounties,
    legacyIdMap: arkansasLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadMissouriPack() {
  const plates = buildPlates(missouriDriverData);
  return {
    game: missouriGame,
    badgeCounties: missouriBadgeCounties,
    badgeGroupLabels: missouriBadgeGroupLabels,
    badgeGroupSymbols: missouriBadgeGroupSymbols,
    mixedBagCategories: missouriMixedBagCategories,
    panhandleScoutCounties: missouriRegionScoutCounties,
    legacyIdMap: missouriLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadStatePack(stateId: string) {
  switch (stateId) {
    case "mississippi": return loadMississippiPack();
    case "arkansas": return loadArkansasPack();
    case "missouri": return loadMissouriPack();
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

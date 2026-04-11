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
import tennesseeDriverData from "../data/generated/tennessee-plate-driver.generated.json";
import tennesseeLegacyIdMap from "../data/generated/tennessee-legacy-id-map.generated.json";
import {
  tennesseeBadgeCounties,
  tennesseeBadgeGroupLabels,
  tennesseeBadgeGroupSymbols,
  tennesseeGame,
  tennesseeMixedBagCategories,
  tennesseeRegionScoutCounties
} from "../config/tennesseeGame";
import georgiaDriverData from "../data/generated/georgia-plate-driver.generated.json";
import georgiaLegacyIdMap from "../data/generated/georgia-legacy-id-map.generated.json";
import {
  georgiaBadgeCounties,
  georgiaBadgeGroupLabels,
  georgiaBadgeGroupSymbols,
  georgiaGame,
  georgiaMixedBagCategories,
  georgiaRegionScoutCounties
} from "../config/georgiaGame";
import kansasDriverData from "../data/generated/kansas-plate-driver.generated.json";
import kansasLegacyIdMap from "../data/generated/kansas-legacy-id-map.generated.json";
import {
  kansasBadgeCounties,
  kansasBadgeGroupLabels,
  kansasBadgeGroupSymbols,
  kansasGame,
  kansasMixedBagCategories,
  kansasRegionScoutCounties
} from "../config/kansasGame";
import kentuckyDriverData from "../data/generated/kentucky-plate-driver.generated.json";
import kentuckyLegacyIdMap from "../data/generated/kentucky-legacy-id-map.generated.json";
import {
  kentuckyBadgeCounties,
  kentuckyBadgeGroupLabels,
  kentuckyBadgeGroupSymbols,
  kentuckyGame,
  kentuckyMixedBagCategories,
  kentuckyRegionScoutCounties
} from "../config/kentuckyGame";
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
  return "Civic";
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

function loadTennesseePack() {
  const plates = buildPlates(tennesseeDriverData);
  return {
    game: tennesseeGame,
    badgeCounties: tennesseeBadgeCounties,
    badgeGroupLabels: tennesseeBadgeGroupLabels,
    badgeGroupSymbols: tennesseeBadgeGroupSymbols,
    mixedBagCategories: tennesseeMixedBagCategories,
    panhandleScoutCounties: tennesseeRegionScoutCounties,
    legacyIdMap: tennesseeLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadGeorgiaPack() {
  const plates = buildPlates(georgiaDriverData);
  return {
    game: georgiaGame,
    badgeCounties: georgiaBadgeCounties,
    badgeGroupLabels: georgiaBadgeGroupLabels,
    badgeGroupSymbols: georgiaBadgeGroupSymbols,
    mixedBagCategories: georgiaMixedBagCategories,
    panhandleScoutCounties: georgiaRegionScoutCounties,
    legacyIdMap: georgiaLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadKansasPack() {
  const plates = buildPlates(kansasDriverData);
  return {
    game: kansasGame,
    badgeCounties: kansasBadgeCounties,
    badgeGroupLabels: kansasBadgeGroupLabels,
    badgeGroupSymbols: kansasBadgeGroupSymbols,
    mixedBagCategories: kansasMixedBagCategories,
    panhandleScoutCounties: kansasRegionScoutCounties,
    legacyIdMap: kansasLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadKentuckyPack() {
  const plates = buildPlates(kentuckyDriverData);
  return {
    game: kentuckyGame,
    badgeCounties: kentuckyBadgeCounties,
    badgeGroupLabels: kentuckyBadgeGroupLabels,
    badgeGroupSymbols: kentuckyBadgeGroupSymbols,
    mixedBagCategories: kentuckyMixedBagCategories,
    panhandleScoutCounties: kentuckyRegionScoutCounties,
    legacyIdMap: kentuckyLegacyIdMap as Record<string, string>,
    plates,
    groupedPlates: buildGroupedPlates(plates),
  };
}

function loadStatePack(stateId: string) {
  switch (stateId) {
    case "mississippi": return loadMississippiPack();
    case "arkansas": return loadArkansasPack();
    case "missouri": return loadMissouriPack();
    case "tennessee": return loadTennesseePack();
    case "georgia": return loadGeorgiaPack();
    case "kansas": return loadKansasPack();
    case "kentucky": return loadKentuckyPack();
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
};

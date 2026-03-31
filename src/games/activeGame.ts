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

const validCategories = new Set<string>(plateCategories);

function toPlateCategory(value: string): PlateCategory {
  if (validCategories.has(value)) {
    return value as PlateCategory;
  }

  return "Civic & Causes";
}

export const activeGame = floridaGame;
export const activeBadgeCounties = floridaBadgeCounties;
export const activeBadgeGroupLabels = floridaBadgeGroupLabels;
export const activeBadgeGroupSymbols = floridaBadgeGroupSymbols;
export const activeMixedBagCategories = floridaMixedBagCategories;
export const activePanhandleScoutCounties = floridaPanhandleScoutCounties;
export const activeLegacyIdMap = legacyIdMap as Record<string, string>;
export const activeStorage = {
  discoveriesKey: "florida-plates-discoveries",
  themeKey: "florida-plates-theme",
  uiPreferencesKey: "florida-plates-ui-preferences",
  onboardingHintKey: "florida-plates-onboarding-dismissed",
  progressExportFilename: "florida-plates-progress.json"
};

export const activePlates: Plate[] = driverData.plates.map((plate) => ({
  ...plate,
  category: toPlateCategory(plate.category)
}));

export const activeGroupedPlates = plateCategories
  .map((category) => ({
    category,
    plates: activePlates.filter((plate) => plate.category === category)
  }))
  .filter(({ plates: categoryPlates }) => categoryPlates.length > 0);

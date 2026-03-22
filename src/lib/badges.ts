import type { Plate, PlateCategory, PlateDiscoveryMap } from "../types";

export type BadgeGroup =
  | "progress"
  | "category"
  | "collection"
  | "college"
  | "locality";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  group: BadgeGroup;
  availableIn: "v1.1";
}

export interface EvaluatedBadge extends BadgeDefinition {
  earned: boolean;
  progressCurrent?: number;
  progressTarget?: number;
}

const natureCategory: PlateCategory = "Nature & Wildlife";
const sportsCategory: PlateCategory = "Professional Sports";
const universitiesCategory: PlateCategory = "Universities";

const legacyMiscCategories = new Set<PlateCategory>([
  "Military & Veterans",
  "Public Safety",
  "Health & Family",
  "Civic & Causes",
  "Education & Culture",
  "Recreation & Tourism"
]);

const baseballPlateNames = ["Miami Marlins (Baseball)", "Tampa Bay Rays (Baseball)"];
const footballPlateNames = [
  "Jacksonville Jaguars (Football)",
  "Miami Dolphins (Football)",
  "Tampa Bay Buccaneers (Football)"
];
const hockeyPlateNames = ["Florida Panthers (Hockey)", "Tampa Bay Lightning (Hockey)"];
const basketballPlateNames = ["Miami Heat (Basketball)", "Orlando Magic (Basketball)"];

export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: "first-spot",
    name: "First Spot",
    description: "Earn your first plate.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "five-alive",
    name: "Five Alive",
    description: "Find 5 plates.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "ten-down",
    name: "Ten Down",
    description: "Find 10 plates.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "quarter-way-there",
    name: "Quarter Way There",
    description: "Find 25% of all plates.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "halfway-home",
    name: "Halfway Home",
    description: "Find 50% of all plates.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "closing-in",
    name: "Closing In",
    description: "Find 75% of all plates.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "full-collection",
    name: "Full Collection",
    description: "Find every plate in the game.",
    group: "progress",
    availableIn: "v1.1"
  },
  {
    id: "green-light",
    name: "Green Light",
    description: "Find 5 nature and wildlife plates.",
    group: "category",
    availableIn: "v1.1"
  },
  {
    id: "campus-tour",
    name: "Campus Tour",
    description: "Find 5 university plates.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "sports-fan",
    name: "Sports Fan",
    description: "Find 5 professional sports plates.",
    group: "category",
    availableIn: "v1.1"
  },
  {
    id: "odds-and-ends",
    name: "Odds and Ends",
    description: "Find 5 plates from the broader civic, health, culture, safety, and tourism groups.",
    group: "category",
    availableIn: "v1.1"
  },
  {
    id: "eco-scout",
    name: "Eco Scout",
    description: "Complete the nature and wildlife category.",
    group: "category",
    availableIn: "v1.1"
  },
  {
    id: "sideline-complete",
    name: "Sideline Complete",
    description: "Complete the professional sports category.",
    group: "category",
    availableIn: "v1.1"
  },
  {
    id: "campus-complete",
    name: "Campus Complete",
    description: "Complete the universities category.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "catch-all-complete",
    name: "Catch-All Complete",
    description: "Complete the broader civic, health, culture, safety, and tourism groups.",
    group: "category",
    availableIn: "v1.1"
  },
  {
    id: "diamond-run",
    name: "Diamond Run",
    description: "Find all baseball team plates.",
    group: "collection",
    availableIn: "v1.1"
  },
  {
    id: "sunday-lineup",
    name: "Sunday Lineup",
    description: "Find all football team plates.",
    group: "collection",
    availableIn: "v1.1"
  },
  {
    id: "center-ice",
    name: "Center Ice",
    description: "Find all hockey team plates.",
    group: "collection",
    availableIn: "v1.1"
  },
  {
    id: "tip-off",
    name: "Tip-Off",
    description: "Find all basketball team plates.",
    group: "collection",
    availableIn: "v1.1"
  },
  {
    id: "state-school-start",
    name: "State School Start",
    description: "Find your first college plate.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "freshman",
    name: "Freshman",
    description: "Find 5 college plates.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "sophomore",
    name: "Sophomore",
    description: "Find 10 college plates.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "junior",
    name: "Junior",
    description: "Find 20 college plates.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "senior",
    name: "Senior",
    description: "Find 30 college plates.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "commencement",
    name: "Commencement",
    description: "Complete all college plates.",
    group: "college",
    availableIn: "v1.1"
  },
  {
    id: "everywhere-all-at-once",
    name: "Everywhere All at Once",
    description: "Find plates in 10 different localities.",
    group: "locality",
    availableIn: "v1.1"
  }
];

function countFoundInCategory(
  plates: Plate[],
  discoveries: PlateDiscoveryMap,
  category: PlateCategory
): number {
  return plates.filter(
    (plate) => plate.category === category && discoveries[plate.id]
  ).length;
}

function countFoundInLegacyMisc(
  plates: Plate[],
  discoveries: PlateDiscoveryMap
): number {
  return plates.filter(
    (plate) => legacyMiscCategories.has(plate.category) && discoveries[plate.id]
  ).length;
}

function countTotalInLegacyMisc(plates: Plate[]): number {
  return plates.filter((plate) => legacyMiscCategories.has(plate.category)).length;
}

function countFoundInCollection(
  plates: Plate[],
  discoveries: PlateDiscoveryMap,
  plateNames: string[]
): number {
  return plateNames.filter((plateName) => {
    const plate = plates.find((candidatePlate) => candidatePlate.name === plateName);
    return plate ? Boolean(discoveries[plate.id]) : false;
  }).length;
}

function createThresholdBadge(
  definition: BadgeDefinition,
  current: number,
  target: number
): EvaluatedBadge {
  return {
    ...definition,
    earned: current >= target,
    progressCurrent: current,
    progressTarget: target
  };
}

export function evaluateBadges(
  plates: Plate[],
  discoveries: PlateDiscoveryMap
): EvaluatedBadge[] {
  const totalFound = Object.keys(discoveries).length;
  const totalPlates = plates.length;
  const environmentalFound = countFoundInCategory(plates, discoveries, natureCategory);
  const miscellaneousFound = countFoundInLegacyMisc(plates, discoveries);
  const sportsFound = countFoundInCategory(plates, discoveries, sportsCategory);
  const universitiesFound = countFoundInCategory(plates, discoveries, universitiesCategory);
  const environmentalTotal = plates.filter(
    (plate) => plate.category === natureCategory
  ).length;
  const miscellaneousTotal = countTotalInLegacyMisc(plates);
  const sportsTotal = plates.filter((plate) => plate.category === sportsCategory).length;
  const universitiesTotal = plates.filter(
    (plate) => plate.category === universitiesCategory
  ).length;
  const uniqueLocalities = new Set(
    Object.values(discoveries)
      .map((discovery) => discovery.locality)
      .filter((locality): locality is string => Boolean(locality))
  ).size;

  const lookup = new Map<string, EvaluatedBadge>([
    ["first-spot", createThresholdBadge(badgeDefinitions[0], totalFound, 1)],
    ["five-alive", createThresholdBadge(badgeDefinitions[1], totalFound, 5)],
    ["ten-down", createThresholdBadge(badgeDefinitions[2], totalFound, 10)],
    [
      "quarter-way-there",
      createThresholdBadge(badgeDefinitions[3], totalFound, Math.ceil(totalPlates * 0.25))
    ],
    [
      "halfway-home",
      createThresholdBadge(badgeDefinitions[4], totalFound, Math.ceil(totalPlates * 0.5))
    ],
    [
      "closing-in",
      createThresholdBadge(badgeDefinitions[5], totalFound, Math.ceil(totalPlates * 0.75))
    ],
    ["full-collection", createThresholdBadge(badgeDefinitions[6], totalFound, totalPlates)],
    ["green-light", createThresholdBadge(badgeDefinitions[7], environmentalFound, 5)],
    ["campus-tour", createThresholdBadge(badgeDefinitions[8], universitiesFound, 5)],
    ["sports-fan", createThresholdBadge(badgeDefinitions[9], sportsFound, 5)],
    ["odds-and-ends", createThresholdBadge(badgeDefinitions[10], miscellaneousFound, 5)],
    ["eco-scout", createThresholdBadge(badgeDefinitions[11], environmentalFound, environmentalTotal)],
    ["sideline-complete", createThresholdBadge(badgeDefinitions[12], sportsFound, sportsTotal)],
    ["campus-complete", createThresholdBadge(badgeDefinitions[13], universitiesFound, universitiesTotal)],
    ["catch-all-complete", createThresholdBadge(badgeDefinitions[14], miscellaneousFound, miscellaneousTotal)],
    [
      "diamond-run",
      createThresholdBadge(
        badgeDefinitions[15],
        countFoundInCollection(plates, discoveries, baseballPlateNames),
        baseballPlateNames.length
      )
    ],
    [
      "sunday-lineup",
      createThresholdBadge(
        badgeDefinitions[16],
        countFoundInCollection(plates, discoveries, footballPlateNames),
        footballPlateNames.length
      )
    ],
    [
      "center-ice",
      createThresholdBadge(
        badgeDefinitions[17],
        countFoundInCollection(plates, discoveries, hockeyPlateNames),
        hockeyPlateNames.length
      )
    ],
    [
      "tip-off",
      createThresholdBadge(
        badgeDefinitions[18],
        countFoundInCollection(plates, discoveries, basketballPlateNames),
        basketballPlateNames.length
      )
    ],
    ["state-school-start", createThresholdBadge(badgeDefinitions[19], universitiesFound, 1)],
    ["freshman", createThresholdBadge(badgeDefinitions[20], universitiesFound, 5)],
    ["sophomore", createThresholdBadge(badgeDefinitions[21], universitiesFound, 10)],
    ["junior", createThresholdBadge(badgeDefinitions[22], universitiesFound, 20)],
    ["senior", createThresholdBadge(badgeDefinitions[23], universitiesFound, 30)],
    ["commencement", createThresholdBadge(badgeDefinitions[24], universitiesFound, universitiesTotal)],
    ["everywhere-all-at-once", createThresholdBadge(badgeDefinitions[25], uniqueLocalities, 10)]
  ]);

  return badgeDefinitions.map((definition) => lookup.get(definition.id) ?? { ...definition, earned: false });
}

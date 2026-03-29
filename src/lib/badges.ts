import type { Plate, PlateCategory, PlateDiscoveryMap } from "../types";

export type BadgeGroup =
  | "progress"
  | "category"
  | "collection"
  | "sports"
  | "college"
  | "locality"
  | "service"
  | "florida"
  | "test";

type BadgeAvailability = "v1.4" | "later";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  group: BadgeGroup;
  availableIn: BadgeAvailability;
}

export interface EvaluatedBadge extends BadgeDefinition {
  earned: boolean;
  progressCurrent?: number;
  progressTarget?: number;
}

const natureCategory: PlateCategory = "Nature & Wildlife";
const sportsCategory: PlateCategory = "Professional Sports";
const universitiesCategory: PlateCategory = "Universities";
const militaryServiceCategory: PlateCategory = "Military Service";
const militaryHonorsCategory: PlateCategory = "Military Honors & History";
const publicServiceCategory: PlateCategory = "Public Service";

const mixedBagCategories = new Set<PlateCategory>([
  "Civic & Causes",
  "Health & Family",
  "Education & Culture",
  "Public Service",
  "Travel & Tourism"
]);

const floridaPanhandleCounties = new Set([
  "Escambia",
  "Bay",
  "Calhoun",
  "Franklin",
  "Gulf",
  "Holmes",
  "Jackson",
  "Liberty",
  "Okaloosa",
  "Santa Rosa",
  "Walton",
  "Washington"
]);



const baseballPlateNames = ["Miami Marlins (Baseball)", "Tampa Bay Rays (Baseball)"];
const footballPlateNames = [
  "Jacksonville Jaguars (Football)",
  "Miami Dolphins (Football)",
  "Tampa Bay Buccaneers (Football)"
];
const lawEnforcementPlateNames = [
  "Fallen Law Enforcement Officers",
  "Florida Sheriffs Association",
  "Fraternal Order of Police",
  "Police Athletic League",
  "Police Benevolent Association",
  "Support Law Enforcement"
];
const publicSafetyPlateNames = [
  ...lawEnforcementPlateNames,
  "Salutes Firefighters"
];
const coastalCruiserPlateNames = [
  "Discover Florida's Oceans",
  "Florida Bay Forever",
  "Indian River Lagoon",
  "Protect Marine Wildlife",
  "Protect Our Reefs",
  "Save Our Seas",
  "Tampa Bay Estuary"
];
const farmFreshPlateNames = [
  "Agriculture",
  "Agricultural Education",
  "Agriculture & Consumer Services"
];
const distinguishedPlateNames = [
  "Distinguished Flying Cross",
  "Distinguished Service Cross",
  "Air Force Cross"
];
const combatBadgePlateNames = [
  "Combat Action Badge",
  "Combat Action Ribbon",
  "Combat Infantry Badge",
  "Combat Medical Badge"
];
const honorAndMedalPlateNames = [
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
];

import { floridaBadgeCounties } from "../config/floridaGame";

const allBranchesPlateNames = [
  "U.S. Army",
  "U.S. Navy",
  "U.S. Air Force",
  "U.S. Marine Corps",
  "U.S. Coast Guard"
];

const hockeyPlateNames = [
  "Florida Panthers (Hockey)",
  "Tampa Bay Lightning (Hockey)"
];

const basketballPlateNames = [
  "Miami Heat (Basketball)",
  "Orlando Magic (Basketball)"
];
const soccerPlateNames = [
  "Inter Miami FC (Soccer)",
  "Orlando City (Soccer)"
];

export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: "first-spot",
    name: "First Spot",
    description: "Spot your first plate.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "five-alive",
    name: "Five Alive",
    description: "Spot 5 plates.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "ten-down",
    name: "Ten Down",
    description: "Spot 10 plates.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "quarter-mark",
    name: "Quarter Mark",
    description: "Spot 25% of all plates.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "halfway-home",
    name: "Halfway Home",
    description: "Spot 50% of all plates.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "closing-in",
    name: "Closing In",
    description: "Spot 75% of all plates.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "complete-set",
    name: "Complete Set",
    description: "Spot every plate in the game.",
    group: "progress",
    availableIn: "v1.4"
  },
  {
    id: "mixed-bag",
    name: "Mixed Bag",
    description:
      "Find 5 plates from the civic, health, culture, service, and tourism groups.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "green-light",
    name: "Green Light",
    description: "Find 5 nature and wildlife plates.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "sports-fan",
    name: "Sports Fan",
    description: "Find 5 professional sports plates.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "healing-hands",
    name: "Healing Hands",
    description: "Find 5 health and family plates.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "game-on",
    name: "Game On",
    description: "Find 5 sports and recreation plates.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "coastal-cruiser",
    name: "Coastal Cruiser",
    description: "Find 5 coastal or ocean-themed plates.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "farm-fresh",
    name: "Farm Fresh",
    description: "Find 3 agriculture-themed plates.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "reporting-for-duty",
    name: "Reporting for Duty",
    description: "Find your first Those Who Serve plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "on-call",
    name: "On Call",
    description: "Find 5 Those Who Serve plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "in-service",
    name: "In Service",
    description: "Find 10 Those Who Serve plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "eco-scout",
    name: "Eco Scout",
    description: "Complete the nature and wildlife category.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "all-teams",
    name: "All Teams",
    description: "Complete the professional sports category.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "full-spectrum",
    name: "Full Spectrum",
    description:
      "Complete the civic, health, culture, safety, and tourism groups.",
    group: "category",
    availableIn: "v1.4"
  },
  {
    id: "all-branches",
    name: "All Branches",
    description: "Find all five U.S. military branch plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "back-the-blue",
    name: "Back the Blue",
    description: "Find any 3 law enforcement plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "fire-watch",
    name: "Fire Watch",
    description: "Find the Salutes Firefighters plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "united-front",
    name: "United Front",
    description: "Find 5 public safety plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "air-support",
    name: "Air Support",
    description: "Find the Blue Angels plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "airborne",
    name: "Airborne",
    description: "Find the U.S. Paratroopers plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "those-who-serve",
    name: "Those Who Serve",
    description: "Find all standard military and public safety plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "bronze-star-honor",
    name: "Bronze Star",
    description: "Find the Bronze Star plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "distinguished",
    name: "Distinguished",
    description: "Find any Distinguished Cross plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "combat-ready",
    name: "Combat Ready",
    description: "Find any combat badge plate.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "decorated-service",
    name: "Decorated Service",
    description: "Find 3 different medal or honor plates.",
    group: "service",
    availableIn: "v1.4"
  },
  {
    id: "first-day-of-school",
    name: "First Day of School",
    description: "Find your first university plate.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "campus-tour",
    name: "Campus Tour",
    description: "Find 5 university plates.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "freshman",
    name: "Freshman",
    description: "Find 20% of university plates.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "sophomore",
    name: "Sophomore",
    description: "Find 40% of university plates.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "junior",
    name: "Junior",
    description: "Find 60% of university plates.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "senior",
    name: "Senior",
    description: "Find 80% of university plates.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "graduation-day",
    name: "Graduation Day",
    description: "Complete all university plates.",
    group: "college",
    availableIn: "v1.4"
  },
  {
    id: "grand-slam",
    name: "Grand Slam",
    description: "Find all baseball team plates.",
    group: "sports",
    availableIn: "v1.4"
  },
  {
    id: "touchdown",
    name: "Touchdown",
    description: "Find all football team plates.",
    group: "sports",
    availableIn: "v1.4"
  },
  {
    id: "hat-trick",
    name: "Hat Trick",
    description: "Find all hockey team plates.",
    group: "sports",
    availableIn: "v1.4"
  },
  {
    id: "slam-dunk",
    name: "Slam Dunk",
    description: "Find all basketball team plates.",
    group: "sports",
    availableIn: "v1.4"
  },
  {
    id: "goal",
    name: "GOAL!",
    description: "Find all soccer plates.",
    group: "sports",
    availableIn: "v1.4"
  },
  {
    id: "checkered-flag",
    name: "Checkered Flag",
    description: "Find the NASCAR plate.",
    group: "sports",
    availableIn: "v1.4"
  },
  {
    id: "thrill-ride",
    name: "Thrill Ride",
    description: "Find the Walt Disney World plate.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "escapee",
    name: "Escapee",
    description: "Find a plate outside of Florida.",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "i-get-around",
    name: "I Get Around",
    description: "Find plates in 5 different places.",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "road-trip",
    name: "Road Trip",
    description: "Find plates in 10 different places.",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "panhandle-scout",
    name: "Panhandle Scout",
    description: "Find a plate in a Florida panhandle county.",
    group: "locality",
    availableIn: "v1.4"
  },
  // Florida Explorer region badges
  {
    id: "northwest-florida-explorer",
    name: "Northwest Florida Explorer",
    description: "Find a plate in every Northwest Florida (Panhandle) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "north-central-florida-explorer",
    name: "North Central Florida Explorer",
    description: "Find a plate in every North Central Florida (Big Bend) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "northeast-florida-explorer",
    name: "Northeast Florida Explorer",
    description: "Find a plate in every Northeast Florida (First Coast) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "central-west-florida-explorer",
    name: "Central West Florida Explorer",
    description: "Find a plate in every Central West Florida (Suncoast) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "central-florida-explorer",
    name: "Central Florida Explorer",
    description: "Find a plate in every Central Florida (Heart of Florida) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "central-east-florida-explorer",
    name: "Central East Florida Explorer",
    description: "Find a plate in every Central East Florida (Space Coast) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "southwest-florida-explorer",
    name: "Southwest Florida Explorer",
    description: "Find a plate in every Southwest Florida (Paradise Coast) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "southeast-florida-explorer",
    name: "Southeast Florida Explorer",
    description: "Find a plate in every Southeast Florida (Gold Coast) county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "florida-keys-explorer",
    name: "Florida Keys Explorer",
    description: "Find a plate in Monroe County (Florida Keys).",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-florida",
    name: "All Around Florida",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  }
];

export const deferredBadgeIdeas: BadgeDefinition[] = [
  {
    id: "afternoon-delight",
    name: "Afternoon Delight",
    description: "Find a plate between 1:00 PM and 4:59 PM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "happy-hour",
    name: "Happy Hour",
    description: "Find a plate between 5:00 PM and 6:59 PM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "prime-time",
    name: "Prime Time",
    description: "Find a plate between 7:00 PM and 10:59 PM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "late-night",
    name: "Late Night",
    description: "Find a plate between 11:00 PM and 1:59 AM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "graveyard-shift",
    name: "Graveyard Shift",
    description: "Find a plate between 2:00 AM and 4:59 AM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Find a plate between 5:00 AM and 6:59 AM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "morning-rush",
    name: "Morning Rush",
    description: "Find a plate between 7:00 AM and 9:59 AM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "brunch-time",
    name: "Brunch Time",
    description: "Find a plate between 10:00 AM and 11:59 AM.",
    group: "progress",
    availableIn: "later"
  },
  {
    id: "lunch-break",
    name: "Lunch Break",
    description: "Find a plate between 12:00 PM and 12:59 PM.",
    group: "progress",
    availableIn: "later"
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

function countFoundInMixedBag(
  plates: Plate[],
  discoveries: PlateDiscoveryMap
): number {
  return plates.filter(
    (plate) => mixedBagCategories.has(plate.category) && discoveries[plate.id]
  ).length;
}

function countTotalInMixedBag(plates: Plate[]): number {
  return plates.filter((plate) => mixedBagCategories.has(plate.category)).length;
}

function countFoundInCollection(
  plates: Plate[],
  discoveries: PlateDiscoveryMap,
  plateNames: string[]
): number {
  return plateNames.filter((plateName) => {
    return plates.some(
      (candidatePlate) => candidatePlate.name === plateName && Boolean(discoveries[candidatePlate.id])
    );
  }).length;
}

function isHonorOrMedalPlate(plate: Plate): boolean {
  return honorAndMedalPlateNames.includes(plate.name);
}

function isServiceCategoryPlate(plate: Plate): boolean {
  return (
    plate.category === militaryServiceCategory ||
    plate.category === militaryHonorsCategory ||
    plate.category === publicServiceCategory
  );
}

function isThoseWhoServeCompletionPlate(plate: Plate): boolean {
  return (
    (plate.category === militaryServiceCategory || plate.category === publicServiceCategory) &&
    !isHonorOrMedalPlate(plate)
  );
}

function countFoundInServiceCategory(
  plates: Plate[],
  discoveries: PlateDiscoveryMap
): number {
  return plates.filter((plate) => isServiceCategoryPlate(plate) && discoveries[plate.id]).length;
}

function countFoundInThoseWhoServeCompletion(
  plates: Plate[],
  discoveries: PlateDiscoveryMap
): number {
  return plates.filter((plate) => isThoseWhoServeCompletionPlate(plate) && discoveries[plate.id]).length;
}

function countTotalInThoseWhoServeCompletion(plates: Plate[]): number {
  return plates.filter((plate) => isThoseWhoServeCompletionPlate(plate)).length;
}

function countFoundByNames(
  plates: Plate[],
  discoveries: PlateDiscoveryMap,
  plateNames: string[]
): number {
  return countFoundInCollection(plates, discoveries, plateNames);
}

function createBadgeDefinitionLookup(definitions: BadgeDefinition[]) {
  return new Map(definitions.map((definition) => [definition.id, definition]));
}

function getBadgeDefinition(
  definitionsById: Map<string, BadgeDefinition>,
  id: string
): BadgeDefinition {
  const definition = definitionsById.get(id);
  if (!definition) {
    throw new Error(`Missing badge definition for ${id}`);
  }

  return definition;
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

function normalizeCountyName(county: string | null | undefined): string | null {
  if (!county) {
    return null;
  }

  return county.replace(/\s+county$/i, "").trim();
}


function isLikelyInFlorida(latitude: number, longitude: number): boolean {
  return latitude >= 24.3 && latitude <= 31.1 && longitude >= -87.8 && longitude <= -79.7;
}

export function evaluateBadges(
  plates: Plate[],
  discoveries: PlateDiscoveryMap
): EvaluatedBadge[] {
  const totalFound = Object.keys(discoveries).length;
  const totalPlates = plates.length;
  const natureFound = countFoundInCategory(plates, discoveries, natureCategory);
  const sportsFound = countFoundInCategory(plates, discoveries, sportsCategory);
  const recreationFound = countFoundInCategory(plates, discoveries, "Sports & Recreation");
  const healthFound = countFoundInCategory(plates, discoveries, "Health & Family");
  const universitiesFound = countFoundInCategory(plates, discoveries, universitiesCategory);
  const thoseWhoServeFound = countFoundInServiceCategory(plates, discoveries);
  const thoseWhoServeCompletionFound = countFoundInThoseWhoServeCompletion(plates, discoveries);
  const mixedBagFound = countFoundInMixedBag(plates, discoveries);
  const natureTotal = plates.filter((plate) => plate.category === natureCategory).length;
  const sportsTotal = plates.filter((plate) => plate.category === sportsCategory).length;
  const universitiesTotal = plates.filter(
    (plate) => plate.category === universitiesCategory
  ).length;
  const thoseWhoServeCompletionTotal = countTotalInThoseWhoServeCompletion(plates);
  const mixedBagTotal = countTotalInMixedBag(plates);
  const definitionsById = createBadgeDefinitionLookup(badgeDefinitions);

  const uniqueLocalities = new Set(
    Object.values(discoveries)
      .map((discovery) => discovery.locality)
      .filter((locality): locality is string => Boolean(locality))
  ).size;

  const outsideFloridaCount = Object.values(discoveries).filter((discovery) => {
    if (discovery.state) {
      return discovery.state !== "Florida";
    }

    if (discovery.latitude !== null && discovery.longitude !== null) {
      return !isLikelyInFlorida(discovery.latitude, discovery.longitude);
    }

    return false;
  }).length;

  const panhandleCount = Object.values(discoveries).filter((discovery) => {
    const county = normalizeCountyName(discovery.county);
    return county ? floridaPanhandleCounties.has(county) : false;
  }).length;
  // Removed visitedCounties and countVisitedCounties (no longer used)

  // Florida Explorer region badge logic
  // Helper: map county name to normalized form
  function normalizeCounty(county: string | null | undefined): string | null {
    if (!county) return null;
    return county.replace(/\s+county$/i, "").trim();
  }

  // For each region, count unique counties found
  const foundCountiesByRegion: Record<string, Set<string>> = {};
  Object.keys(floridaBadgeCounties).forEach((regionId) => {
    foundCountiesByRegion[regionId] = new Set<string>();
  });
  Object.values(discoveries).forEach((discovery) => {
    const county = normalizeCounty(discovery.county);
    if (!county) return;
    for (const [regionId, counties] of Object.entries(floridaBadgeCounties)) {
      if (counties.includes(county)) {
        foundCountiesByRegion[regionId].add(county);
      }
    }
  });

  // Compose region badge entries for lookup (earned if ANY county in region is found)
  const regionBadgeEntries: [string, EvaluatedBadge][] = Object.keys(floridaBadgeCounties).map((regionId) => [
    regionId,
    createThresholdBadge(
      getBadgeDefinition(definitionsById, regionId),
      foundCountiesByRegion[regionId].size,
      1 // Only one county needed to earn the badge
    )
  ]);

  // All Around Florida badge: earned if all region badges are earned
  const allRegionBadgesEarned = regionBadgeEntries.every(([, badge]) => badge.earned);
  const allAroundFloridaBadge = {
    ...getBadgeDefinition(definitionsById, "all-around-florida"),
    earned: allRegionBadgesEarned,
    progressCurrent: regionBadgeEntries.filter(([, badge]) => badge.earned).length,
    progressTarget: regionBadgeEntries.length
  };

  const lookup = new Map<string, EvaluatedBadge>([
    ["first-spot", createThresholdBadge(getBadgeDefinition(definitionsById, "first-spot"), totalFound, 1)],
    ["five-alive", createThresholdBadge(getBadgeDefinition(definitionsById, "five-alive"), totalFound, 5)],
    ["ten-down", createThresholdBadge(getBadgeDefinition(definitionsById, "ten-down"), totalFound, 10)],
    [
      "quarter-mark",
      createThresholdBadge(getBadgeDefinition(definitionsById, "quarter-mark"), totalFound, Math.ceil(totalPlates * 0.25))
    ],
    [
      "halfway-home",
      createThresholdBadge(getBadgeDefinition(definitionsById, "halfway-home"), totalFound, Math.ceil(totalPlates * 0.5))
    ],
    [
      "closing-in",
      createThresholdBadge(getBadgeDefinition(definitionsById, "closing-in"), totalFound, Math.ceil(totalPlates * 0.75))
    ],
    ["complete-set", createThresholdBadge(getBadgeDefinition(definitionsById, "complete-set"), totalFound, totalPlates)],
    ["mixed-bag", createThresholdBadge(getBadgeDefinition(definitionsById, "mixed-bag"), mixedBagFound, 5)],
    ["green-light", createThresholdBadge(getBadgeDefinition(definitionsById, "green-light"), natureFound, 5)],
    ["sports-fan", createThresholdBadge(getBadgeDefinition(definitionsById, "sports-fan"), sportsFound, 5)],
    ["healing-hands", createThresholdBadge(getBadgeDefinition(definitionsById, "healing-hands"), healthFound, 5)],
    ["game-on", createThresholdBadge(getBadgeDefinition(definitionsById, "game-on"), recreationFound, 5)],
    [
      "coastal-cruiser",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "coastal-cruiser"),
        countFoundInCollection(plates, discoveries, coastalCruiserPlateNames),
        5
      )
    ],
    [
      "farm-fresh",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "farm-fresh"),
        countFoundInCollection(plates, discoveries, farmFreshPlateNames),
        3
      )
    ],
    ["reporting-for-duty", createThresholdBadge(getBadgeDefinition(definitionsById, "reporting-for-duty"), thoseWhoServeFound, 1)],
    ["on-call", createThresholdBadge(getBadgeDefinition(definitionsById, "on-call"), thoseWhoServeFound, 5)],
    ["in-service", createThresholdBadge(getBadgeDefinition(definitionsById, "in-service"), thoseWhoServeFound, 10)],
    ["eco-scout", createThresholdBadge(getBadgeDefinition(definitionsById, "eco-scout"), natureFound, natureTotal)],
    ["all-teams", createThresholdBadge(getBadgeDefinition(definitionsById, "all-teams"), sportsFound, sportsTotal)],
    ["full-spectrum", createThresholdBadge(getBadgeDefinition(definitionsById, "full-spectrum"), mixedBagFound, mixedBagTotal)],
    [
      "all-branches",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "all-branches"),
        countFoundByNames(plates, discoveries, allBranchesPlateNames),
        allBranchesPlateNames.length
      )
    ],
    [
      "back-the-blue",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "back-the-blue"),
        countFoundByNames(plates, discoveries, lawEnforcementPlateNames),
        3
      )
    ],
    [
      "fire-watch",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "fire-watch"),
        countFoundByNames(plates, discoveries, ["Salutes Firefighters"]),
        1
      )
    ],
    [
      "united-front",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "united-front"),
        countFoundByNames(plates, discoveries, publicSafetyPlateNames),
        5
      )
    ],
    [
      "air-support",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "air-support"),
        countFoundByNames(plates, discoveries, ["Blue Angels"]),
        1
      )
    ],
    [
      "airborne",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "airborne"),
        countFoundByNames(plates, discoveries, ["U.S. Paratroopers"]),
        1
      )
    ],
    [
      "those-who-serve",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "those-who-serve"),
        thoseWhoServeCompletionFound,
        thoseWhoServeCompletionTotal
      )
    ],
    [
      "bronze-star-honor",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "bronze-star-honor"),
        countFoundByNames(plates, discoveries, ["Bronze Star"]),
        1
      )
    ],
    [
      "distinguished",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "distinguished"),
        countFoundByNames(plates, discoveries, distinguishedPlateNames),
        1
      )
    ],
    [
      "combat-ready",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "combat-ready"),
        countFoundByNames(plates, discoveries, combatBadgePlateNames),
        1
      )
    ],
    [
      "decorated-service",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "decorated-service"),
        countFoundByNames(plates, discoveries, honorAndMedalPlateNames),
        3
      )
    ],
    ["first-day-of-school", createThresholdBadge(getBadgeDefinition(definitionsById, "first-day-of-school"), universitiesFound, 1)],
    ["campus-tour", createThresholdBadge(getBadgeDefinition(definitionsById, "campus-tour"), universitiesFound, 5)],
    [
      "freshman",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "freshman"),
        universitiesFound,
        Math.ceil(universitiesTotal * 0.2)
      )
    ],
    [
      "sophomore",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "sophomore"),
        universitiesFound,
        Math.ceil(universitiesTotal * 0.4)
      )
    ],
    [
      "junior",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "junior"),
        universitiesFound,
        Math.ceil(universitiesTotal * 0.6)
      )
    ],
    [
      "senior",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "senior"),
        universitiesFound,
        Math.ceil(universitiesTotal * 0.8)
      )
    ],
    [
      "graduation-day",
      createThresholdBadge(getBadgeDefinition(definitionsById, "graduation-day"), universitiesFound, universitiesTotal)
    ],
    [
      "grand-slam",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "grand-slam"),
        countFoundInCollection(plates, discoveries, baseballPlateNames),
        baseballPlateNames.length
      )
    ],
    [
      "touchdown",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "touchdown"),
        countFoundInCollection(plates, discoveries, footballPlateNames),
        footballPlateNames.length
      )
    ],
    [
      "hat-trick",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "hat-trick"),
        countFoundInCollection(plates, discoveries, hockeyPlateNames),
        hockeyPlateNames.length
      )
    ],
    [
      "slam-dunk",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "slam-dunk"),
        countFoundInCollection(plates, discoveries, basketballPlateNames),
        basketballPlateNames.length
      )
    ],
    [
      "goal",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "goal"),
        countFoundInCollection(plates, discoveries, soccerPlateNames),
        soccerPlateNames.length
      )
    ],
    [
      "checkered-flag",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "checkered-flag"),
        countFoundInCollection(plates, discoveries, ["NASCAR"]),
        1
      )
    ],
    [
      "thrill-ride",
      createThresholdBadge(
        getBadgeDefinition(definitionsById, "thrill-ride"),
        countFoundInCollection(plates, discoveries, ["Walt Disney World"]),
        1
      )
    ],
    ["escapee", createThresholdBadge(getBadgeDefinition(definitionsById, "escapee"), outsideFloridaCount, 1)],
    ["i-get-around", createThresholdBadge(getBadgeDefinition(definitionsById, "i-get-around"), uniqueLocalities, 5)],
    ["road-trip", createThresholdBadge(getBadgeDefinition(definitionsById, "road-trip"), uniqueLocalities, 10)],
    ["panhandle-scout", createThresholdBadge(getBadgeDefinition(definitionsById, "panhandle-scout"), panhandleCount, 1)],
    ...regionBadgeEntries,
    ["all-around-florida", allAroundFloridaBadge],
  ]);

  return badgeDefinitions.map((definition) => lookup.get(definition.id) ?? { ...definition, earned: false });
}

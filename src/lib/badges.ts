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

const natureCategory: PlateCategory = "Wildlife & Nature";
const sportsCategory: PlateCategory = "Sports";
const universitiesCategory: PlateCategory = "Universities";
const militaryCategory: PlateCategory = "Military";
const firstRespondersCategory: PlateCategory = "First Responders";


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

import { activeBadgeCounties, activeMixedBagCategories, activePanhandleScoutCounties } from "../games/activeGame";
// ── 50 States plate ID sets ──
const lower48Ids = new Set([
  "a250-alabama", "a250-arizona", "a250-arkansas", "a250-california", "a250-colorado",
  "a250-connecticut", "a250-delaware", "a250-florida", "a250-georgia", "a250-idaho",
  "a250-illinois", "a250-indiana", "a250-iowa", "a250-kansas", "a250-kentucky",
  "a250-louisiana", "a250-maine", "a250-maryland", "a250-massachusetts", "a250-michigan",
  "a250-minnesota", "a250-mississippi", "a250-missouri", "a250-montana", "a250-nebraska",
  "a250-nevada", "a250-new-hampshire", "a250-new-jersey", "a250-new-mexico", "a250-new-york",
  "a250-north-carolina", "a250-north-dakota", "a250-ohio", "a250-oklahoma", "a250-oregon",
  "a250-pennsylvania", "a250-rhode-island", "a250-south-carolina", "a250-south-dakota",
  "a250-tennessee", "a250-texas", "a250-utah", "a250-vermont", "a250-virginia",
  "a250-washington", "a250-west-virginia", "a250-wisconsin", "a250-wyoming"
]);
const all50StateIds = new Set([...lower48Ids, "a250-alaska", "a250-hawaii"]);
const territoryIds = [
  "a250-puerto-rico", "a250-us-virgin-islands", "a250-guam",
  "a250-american-samoa", "a250-northern-mariana-islands"
];

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
  // Mississippi Explorer region badges
  {
    id: "ms-hills-explorer",
    name: "Hills Explorer",
    description: "Find a plate in every Hills region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ms-delta-explorer",
    name: "Delta Explorer",
    description: "Find a plate in every Delta region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ms-capital-river-explorer",
    name: "Capital/River Explorer",
    description: "Find a plate in every Capital/River region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ms-pines-explorer",
    name: "Pines Explorer",
    description: "Find a plate in every Pines region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ms-coastal-explorer",
    name: "Coastal Explorer",
    description: "Find a plate in every Coastal region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-mississippi",
    name: "All Around Mississippi",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Arkansas Explorer region badges
  {
    id: "ar-ozarks-explorer",
    name: "Ozarks Explorer",
    description: "Find a plate in every Ozarks region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ar-delta-explorer",
    name: "Delta Explorer",
    description: "Find a plate in every Delta region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ar-capital-explorer",
    name: "Capital Explorer",
    description: "Find a plate in every Capital region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ar-river-valley-explorer",
    name: "River Valley Explorer",
    description: "Find a plate in every River Valley region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ar-ouachitas-explorer",
    name: "Ouachitas Explorer",
    description: "Find a plate in every Ouachitas region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ar-timberlands-explorer",
    name: "Timberlands Explorer",
    description: "Find a plate in every Timberlands region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-arkansas",
    name: "All Around Arkansas",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Tennessee Explorer region badges (Grand Divisions)
  {
    id: "tn-east-explorer",
    name: "East Tennessee Explorer",
    description: "Find a plate in every East Tennessee county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "tn-middle-explorer",
    name: "Middle Tennessee Explorer",
    description: "Find a plate in every Middle Tennessee county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "tn-west-explorer",
    name: "West Tennessee Explorer",
    description: "Find a plate in every West Tennessee county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-tennessee",
    name: "All Around Tennessee",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Kentucky Explorer region badges
  {
    id: "ky-bluegrass-explorer",
    name: "Bluegrass Explorer",
    description: "Find a plate in every Bluegrass region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ky-eastern-mountain-explorer",
    name: "Eastern Mountain Explorer",
    description: "Find a plate in every Eastern Mountain Coal Fields county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ky-knobs-explorer",
    name: "Knobs Arc Explorer",
    description: "Find a plate in every Knobs Arc county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ky-pennyrile-explorer",
    name: "Pennyrile Explorer",
    description: "Find a plate in every Pennyrile region county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ky-jackson-purchase-explorer",
    name: "Jackson Purchase Explorer",
    description: "Find a plate in every Jackson Purchase county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ky-western-coalfields-explorer",
    name: "Western Coal Fields Explorer",
    description: "Find a plate in every Western Coal Fields county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-kentucky",
    name: "All Around Kentucky",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Missouri Explorer region badges
  {
    id: "mo-northwest-explorer",
    name: "Northwest Missouri Explorer",
    description: "Find a plate in every Northwest Missouri county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "mo-northeast-explorer",
    name: "Northeast Missouri Explorer",
    description: "Find a plate in every Northeast Missouri county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "mo-central-explorer",
    name: "Central Missouri Explorer",
    description: "Find a plate in every Central Missouri county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "mo-southwest-explorer",
    name: "Southwest Missouri Explorer",
    description: "Find a plate in every Southwest Missouri county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "mo-southeast-explorer",
    name: "Southeast Missouri Explorer",
    description: "Find a plate in every Southeast Missouri county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-missouri",
    name: "All Around Missouri",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Alabama Explorer region badges (derived from AL Regional Councils)
  {
    id: "al-north-alabama-explorer",
    name: "North Alabama Explorer",
    description: "Find a plate in every North Alabama county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "al-central-alabama-explorer",
    name: "Central Alabama Explorer",
    description: "Find a plate in every Central Alabama county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "al-west-alabama-explorer",
    name: "West Alabama Explorer",
    description: "Find a plate in every West Alabama county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "al-southeast-alabama-explorer",
    name: "Southeast Alabama Explorer",
    description: "Find a plate in every Southeast Alabama county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "al-gulf-coast-explorer",
    name: "Gulf Coast Explorer",
    description: "Find a plate in every Gulf Coast county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-alabama",
    name: "All Around Alabama",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Georgia Explorer region badges (derived from GA Regional Commissions)
  {
    id: "ga-north-georgia-explorer",
    name: "North Georgia Explorer",
    description: "Find a plate in every North Georgia county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ga-metro-atlanta-explorer",
    name: "Metro Atlanta Explorer",
    description: "Find a plate in every Metro Atlanta county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ga-central-georgia-explorer",
    name: "Central Georgia Explorer",
    description: "Find a plate in every Central Georgia county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ga-southwest-georgia-explorer",
    name: "Southwest Georgia Explorer",
    description: "Find a plate in every Southwest Georgia county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ga-southeast-georgia-explorer",
    name: "Southeast Georgia Explorer",
    description: "Find a plate in every Southeast Georgia county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-georgia",
    name: "All Around Georgia",
    description: "Earn every regional explorer badge.",
    group: "florida",
    availableIn: "v1.4"
  },
  // Kansas Explorer region badges
  {
    id: "ks-northwest-explorer",
    name: "Northwest Kansas Explorer",
    description: "Find a plate in every Northwest Kansas county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ks-northeast-explorer",
    name: "Northeast Kansas Explorer",
    description: "Find a plate in every Northeast Kansas county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ks-southwest-explorer",
    name: "Southwest Kansas Explorer",
    description: "Find a plate in every Southwest Kansas county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ks-south-central-explorer",
    name: "South Central Kansas Explorer",
    description: "Find a plate in every South Central Kansas county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "ks-southeast-explorer",
    name: "Southeast Kansas Explorer",
    description: "Find a plate in every Southeast Kansas county.",
    group: "florida",
    availableIn: "v1.4"
  },
  {
    id: "all-around-kansas",
    name: "All Around Kansas",
    description: "Earn every regional explorer badge.",
    group: "florida",
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
  },
  // ── 50 States badges ──
  // Region Spotter badges (Census divisions)
  {
    id: "new-england-spotter",
    name: "New England Spotter",
    description: "Spot a plate from every New England state (CT, ME, MA, NH, RI, VT).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "middle-atlantic-spotter",
    name: "Middle Atlantic Spotter",
    description: "Spot a plate from every Middle Atlantic state (NJ, NY, PA).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "east-north-central-spotter",
    name: "East North Central Spotter",
    description: "Spot a plate from every East North Central state (IL, IN, MI, OH, WI).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "west-north-central-spotter",
    name: "West North Central Spotter",
    description: "Spot a plate from every West North Central state (IA, KS, MN, MO, NE, ND, SD).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "south-atlantic-spotter",
    name: "South Atlantic Spotter",
    description: "Spot a plate from every South Atlantic state (DE, DC, FL, GA, MD, NC, SC, VA, WV).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "east-south-central-spotter",
    name: "East South Central Spotter",
    description: "Spot a plate from every East South Central state (AL, KY, MS, TN).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "west-south-central-spotter",
    name: "West South Central Spotter",
    description: "Spot a plate from every West South Central state (AR, LA, OK, TX).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "mountain-spotter",
    name: "Mountain Spotter",
    description: "Spot a plate from every Mountain state (AZ, CO, ID, MT, NV, NM, UT, WY).",
    group: "locality",
    availableIn: "v1.4"
  },
  {
    id: "pacific-spotter",
    name: "Pacific Spotter",
    description: "Spot a plate from every Pacific state (AK, CA, HI, OR, WA).",
    group: "locality",
    availableIn: "v1.4"
  },
  // Special milestones
  {
    id: "north-to-alaska",
    name: "North to Alaska",
    description: "Spot an Alaska plate.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "aloha",
    name: "Aloha",
    description: "Spot a Hawaii plate.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "no-taxation-without-representation",
    name: "No Taxation Without Representation",
    description: "Spot a District of Columbia plate.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "lower-48",
    name: "Lower 48",
    description: "Spot a plate from all 48 contiguous states.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "happy-250th",
    name: "Happy 250th!",
    description: "Spot a plate from all 50 states.",
    group: "collection",
    availableIn: "v1.4"
  },
  {
    id: "island-hopper",
    name: "Island Hopper",
    description: "Spot a plate from every US territory (PR, USVI, GU, AS, CNMI).",
    group: "collection",
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
    (plate) => activeMixedBagCategories.has(plate.category) && discoveries[plate.id]
  ).length;
}

function countTotalInMixedBag(plates: Plate[]): number {
  return plates.filter((plate) => activeMixedBagCategories.has(plate.category)).length;
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
    plate.category === militaryCategory ||
    plate.category === firstRespondersCategory
  );
}

function isThoseWhoServeCompletionPlate(plate: Plate): boolean {
  return (
    (plate.category === militaryCategory || plate.category === firstRespondersCategory) &&
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
    earned: target > 0 && current >= target,
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

const genericBadgeIds = new Set([
  // Progress
  "first-spot", "five-alive", "ten-down", "quarter-mark", "halfway-home", "closing-in", "complete-set",
  // Category (reference category names, not specific plates)
  "mixed-bag", "green-light", "sports-fan", "healing-hands", "game-on", "eco-scout", "all-teams", "full-spectrum",
  // College (any state with universities)
  "first-day-of-school", "campus-tour", "freshman", "sophomore", "junior", "senior", "graduation-day",
  // Service (count-based)
  "reporting-for-duty", "on-call", "in-service",
  // Locality (generic)
  "i-get-around", "road-trip",
]);

export function evaluateBadges(
  plates: Plate[],
  discoveries: PlateDiscoveryMap,
  stateId: string = "florida"
): EvaluatedBadge[] {
  const totalFound = Object.keys(discoveries).length;
  const totalPlates = plates.length;
  const natureFound = countFoundInCategory(plates, discoveries, natureCategory);
  const sportsFound = countFoundInCategory(plates, discoveries, sportsCategory);
  const healthFound = countFoundInCategory(plates, discoveries, "Health");
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
    return county ? activePanhandleScoutCounties.has(county) : false;
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
  Object.keys(activeBadgeCounties).forEach((regionId) => {
    foundCountiesByRegion[regionId] = new Set<string>();
  });
  Object.values(discoveries).forEach((discovery) => {
    const county = normalizeCounty(discovery.county);
    if (!county) return;
    for (const [regionId, counties] of Object.entries(activeBadgeCounties)) {
      if (counties.includes(county)) {
        foundCountiesByRegion[regionId].add(county);
      }
    }
  });

  // Compose region badge entries for lookup (earned if ANY county in region is found)
  const regionBadgeEntries: [string, EvaluatedBadge][] = Object.keys(activeBadgeCounties).map((regionId) => [
    regionId,
    createThresholdBadge(
      getBadgeDefinition(definitionsById, regionId),
      foundCountiesByRegion[regionId].size,
      1 // Only one county needed to earn the badge
    )
  ]);

  // "All Around" badge: earned if all region badges are earned
  const allAroundIdMap: Record<string, string> = {
    alabama: "all-around-alabama",
    florida: "all-around-florida",
    georgia: "all-around-georgia",
    mississippi: "all-around-mississippi",
    arkansas: "all-around-arkansas",
    missouri: "all-around-missouri",
    tennessee: "all-around-tennessee",
    kentucky: "all-around-kentucky",
    kansas: "all-around-kansas",
  };
  const allAroundId = allAroundIdMap[stateId];
  const allRegionBadgesEarned = regionBadgeEntries.every(([, badge]) => badge.earned);
  const allAroundBadge = allAroundId ? {
    ...getBadgeDefinition(definitionsById, allAroundId),
    earned: allRegionBadgesEarned,
    progressCurrent: regionBadgeEntries.filter(([, badge]) => badge.earned).length,
    progressTarget: regionBadgeEntries.length
  } : null;

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
    ["game-on", createThresholdBadge(getBadgeDefinition(definitionsById, "game-on"), sportsFound, 5)],
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
    ...(allAroundId && allAroundBadge ? [[allAroundId, allAroundBadge] as [string, EvaluatedBadge]] : []),
  ]);

  // ── 50 States pack badges ──
  if (stateId === "fifty-states") {
    // Region Spotter badges — earned when ALL plates in a Census division are found
    const divisionBadgeMap: [string, string][] = [
      ["new-england-spotter", "New England"],
      ["middle-atlantic-spotter", "Middle Atlantic"],
      ["east-north-central-spotter", "East North Central"],
      ["west-north-central-spotter", "West North Central"],
      ["south-atlantic-spotter", "South Atlantic"],
      ["east-south-central-spotter", "East South Central"],
      ["west-south-central-spotter", "West South Central"],
      ["mountain-spotter", "Mountain"],
      ["pacific-spotter", "Pacific"],
    ];
    for (const [badgeId, category] of divisionBadgeMap) {
      const total = plates.filter(p => p.category === category).length;
      const found = countFoundInCategory(plates, discoveries, category as PlateCategory);
      lookup.set(badgeId, createThresholdBadge(getBadgeDefinition(definitionsById, badgeId), found, total));
    }

    // Special milestone badges
    const foundIds = new Set(Object.keys(discoveries));
    const lower48Found = [...lower48Ids].filter(id => foundIds.has(id)).length;
    const all50Found = [...all50StateIds].filter(id => foundIds.has(id)).length;
    const territoriesFound = territoryIds.filter(id => foundIds.has(id)).length;

    lookup.set("north-to-alaska", createThresholdBadge(
      getBadgeDefinition(definitionsById, "north-to-alaska"),
      foundIds.has("a250-alaska") ? 1 : 0, 1
    ));
    lookup.set("aloha", createThresholdBadge(
      getBadgeDefinition(definitionsById, "aloha"),
      foundIds.has("a250-hawaii") ? 1 : 0, 1
    ));
    lookup.set("no-taxation-without-representation", createThresholdBadge(
      getBadgeDefinition(definitionsById, "no-taxation-without-representation"),
      foundIds.has("a250-district-of-columbia") ? 1 : 0, 1
    ));
    lookup.set("lower-48", createThresholdBadge(
      getBadgeDefinition(definitionsById, "lower-48"), lower48Found, 48
    ));
    lookup.set("happy-250th", createThresholdBadge(
      getBadgeDefinition(definitionsById, "happy-250th"), all50Found, 50
    ));
    lookup.set("island-hopper", createThresholdBadge(
      getBadgeDefinition(definitionsById, "island-hopper"), territoriesFound, territoryIds.length
    ));
  }

  const allEvaluated = badgeDefinitions.map((definition) => lookup.get(definition.id) ?? { ...definition, earned: false });

  // State-specific badge IDs
  const floridaBadgeIds = new Set([
    "northwest-florida-explorer", "north-central-florida-explorer", "northeast-florida-explorer",
    "central-west-florida-explorer", "central-florida-explorer", "central-east-florida-explorer",
    "southwest-florida-explorer", "southeast-florida-explorer", "florida-keys-explorer",
    "all-around-florida",
    // Florida-only locality badges
    "panhandle-scout", "escapee", "coastal-cruiser", "farm-fresh", "thrill-ride",
    // Florida-only sports
    "grand-slam", "touchdown", "hat-trick", "slam-dunk", "goal", "checkered-flag",
    // Florida-only service
    "those-who-serve", "back-the-blue", "fire-watch",
  ]);

  const mississippiBadgeIds = new Set([
    "ms-hills-explorer", "ms-delta-explorer", "ms-capital-river-explorer",
    "ms-pines-explorer", "ms-coastal-explorer", "all-around-mississippi",
  ]);

  const arkansasBadgeIds = new Set([
    "ar-ozarks-explorer", "ar-delta-explorer", "ar-capital-explorer",
    "ar-river-valley-explorer", "ar-ouachitas-explorer", "ar-timberlands-explorer",
    "all-around-arkansas",
  ]);

  const missouriBadgeIds = new Set([
    "mo-northwest-explorer", "mo-northeast-explorer", "mo-central-explorer",
    "mo-southwest-explorer", "mo-southeast-explorer", "all-around-missouri",
  ]);

  // States with no region badges yet get an empty set (generic badges only)
  const emptyBadgeIds = new Set<string>();

  // Filter to generic badges + badges for the active state
  const stateBadgeMap: Record<string, Set<string>> = {
    florida: floridaBadgeIds,
    mississippi: mississippiBadgeIds,
    arkansas: arkansasBadgeIds,
    missouri: missouriBadgeIds,
    tennessee: new Set([
      "tn-east-explorer", "tn-middle-explorer", "tn-west-explorer",
      "all-around-tennessee",
    ]),
    alabama: new Set([
      "al-north-alabama-explorer", "al-central-alabama-explorer", "al-west-alabama-explorer",
      "al-southeast-alabama-explorer", "al-gulf-coast-explorer",
      "all-around-alabama",
    ]),
    georgia: new Set([
      "ga-north-georgia-explorer", "ga-metro-atlanta-explorer", "ga-central-georgia-explorer",
      "ga-southwest-georgia-explorer", "ga-southeast-georgia-explorer",
      "all-around-georgia",
    ]),
    kansas: new Set([
      "ks-northwest-explorer", "ks-northeast-explorer", "ks-southwest-explorer",
      "ks-south-central-explorer", "ks-southeast-explorer",
      "all-around-kansas",
    ]),
    kentucky: new Set([
      "ky-bluegrass-explorer", "ky-eastern-mountain-explorer", "ky-knobs-explorer",
      "ky-pennyrile-explorer", "ky-jackson-purchase-explorer", "ky-western-coalfields-explorer",
      "all-around-kentucky",
    ]),
    "fifty-states": new Set([
      "new-england-spotter", "middle-atlantic-spotter", "east-north-central-spotter",
      "west-north-central-spotter", "south-atlantic-spotter", "east-south-central-spotter",
      "west-south-central-spotter", "mountain-spotter", "pacific-spotter",
      "north-to-alaska", "aloha", "no-taxation-without-representation",
      "lower-48", "happy-250th", "island-hopper",
    ]),
  };
  const activeBadgeIds = stateBadgeMap[stateId] || emptyBadgeIds;
  return allEvaluated.filter((badge) => genericBadgeIds.has(badge.id) || activeBadgeIds.has(badge.id));
}

/* ── Player Rank System ── */

export type PlayerRank = "rookie" | "spotter" | "collector" | "road-scholar" | "plate-master";

export interface PlayerRankInfo {
  rank: PlayerRank;
  label: string;
  nextRank: { rank: PlayerRank; label: string } | null;
  badgesForNext: number;
  progress: number;
}

const rankTiers: { rank: PlayerRank; label: string; minPercent: number }[] = [
  { rank: "rookie", label: "Rookie", minPercent: 0 },
  { rank: "spotter", label: "Spotter", minPercent: 0 },
  { rank: "collector", label: "Collector", minPercent: 25 },
  { rank: "road-scholar", label: "Road Scholar", minPercent: 50 },
  { rank: "plate-master", label: "Plate Master", minPercent: 90 },
];

export function computePlayerRank(earnedCount: number, totalCount: number): PlayerRankInfo {
  if (totalCount === 0) {
    return { rank: "rookie", label: "Rookie", nextRank: null, badgesForNext: 0, progress: 0 };
  }

  // Spotter threshold is 1 badge (not percentage-based)
  const thresholds = rankTiers.map((tier) =>
    tier.rank === "spotter" ? 1 : Math.ceil((tier.minPercent / 100) * totalCount)
  );

  let currentIndex = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (earnedCount >= thresholds[i]) {
      currentIndex = i;
      break;
    }
  }

  const current = rankTiers[currentIndex];
  const isMax = currentIndex === rankTiers.length - 1;
  const next = isMax ? null : rankTiers[currentIndex + 1];
  const nextThreshold = isMax ? thresholds[currentIndex] : thresholds[currentIndex + 1];
  const currentThreshold = thresholds[currentIndex];

  const rangeSize = nextThreshold - currentThreshold;
  const progress = isMax
    ? 100
    : rangeSize > 0
      ? Math.min(100, Math.round(((earnedCount - currentThreshold) / rangeSize) * 100))
      : 100;

  return {
    rank: current.rank,
    label: current.label,
    nextRank: next ? { rank: next.rank, label: next.label } : null,
    badgesForNext: isMax ? 0 : Math.max(0, nextThreshold - earnedCount),
    progress,
  };
}

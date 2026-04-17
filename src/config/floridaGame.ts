import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const floridaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "First Responders",
  "Heritage",
  "Wildlife & Nature"
]);

export const floridaPanhandleScoutCounties = new Set([
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

export const floridaBadgeCounties: Record<string, string[]> = {
  // Northwest Florida — The Panhandle
  "northwest-florida-explorer": [
    "Escambia", "Santa Rosa", "Okaloosa", "Walton", "Holmes", "Washington", "Bay", "Jackson", "Calhoun", "Gulf", "Franklin", "Liberty", "Gadsden", "Leon", "Wakulla"
  ],
  // North Central Florida — The Big Bend
  "north-central-florida-explorer": [
    "Jefferson", "Madison", "Taylor", "Lafayette", "Suwannee", "Dixie", "Levy", "Gilchrist"
  ],
  // Northeast Florida — The First Coast
  "northeast-florida-explorer": [
    "Nassau", "Duval", "Clay", "St. Johns", "Putnam", "Flagler"
  ],
  // Central West Florida — The Suncoast
  "central-west-florida-explorer": [
    "Pinellas", "Hillsborough", "Pasco", "Hernando", "Citrus", "Manatee", "Sarasota"
  ],
  // Central Florida — The Heart of Florida
  "central-florida-explorer": [
    "Orange", "Seminole", "Osceola", "Lake", "Polk", "Sumter", "Hardee", "Highlands", "Marion"
  ],
  // Central East Florida — The Space Coast
  "central-east-florida-explorer": [
    "Volusia", "Brevard", "Indian River", "St. Lucie"
  ],
  // Southwest Florida — The Paradise Coast
  "southwest-florida-explorer": [
    "Charlotte", "Lee", "Collier", "Hendry", "Glades"
  ],
  // Southeast Florida — The Gold Coast
  "southeast-florida-explorer": [
    "Martin", "Palm Beach", "Broward", "Miami-Dade"
  ],
  // The Florida Keys — The Conch Republic
  "florida-keys-explorer": ["Monroe"],
};

// Expose county groupings for badge detail UI
// Tickle: 2026-03-25 - force redeploy for badge update
declare global {
  interface Window {
    floridaBadgeCounties?: Record<string, string[]>;
  }
}
if (typeof window !== "undefined") {
  window.floridaBadgeCounties = floridaBadgeCounties;
}

export const floridaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Professional Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Florida Explorer",
  test: "Test"
};

export const floridaBadgeGroupSymbols: Record<BadgeGroup, string> = {
  progress: "star",
  category: "grid",
  collection: "rings",
  sports: "trophy",
  college: "cap",
  locality: "pin",
  service: "shield",
  regional: "compass",
  test: "star"
};

/**
 * Plate-name lists feeding Florida-only collection/service/sports badges.
 * Keyed by badge id. Other states get an empty object; the state-filtering
 * in evaluateBadges() ensures Florida-specific badges don't surface on them.
 */
export const floridaBadgePlateSets: Record<string, string[]> = {
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

/**
 * State-specific badge IDs for Florida: the nine regional-explorer badges,
 * the all-around completion, plus Florida-only locality/sports/service
 * collection badges. Generic badges (progress, category, etc.) are not
 * listed here — they're in `genericBadgeIds` inside badges.ts.
 */
export const floridaBadgeIds = new Set<string>([
  // Regional explorers
  "northwest-florida-explorer", "north-central-florida-explorer", "northeast-florida-explorer",
  "central-west-florida-explorer", "central-florida-explorer", "central-east-florida-explorer",
  "southwest-florida-explorer", "southeast-florida-explorer", "florida-keys-explorer",
  "all-around-florida",
  // Florida-only locality badges
  "panhandle-scout", "coastal-cruiser", "farm-fresh", "thrill-ride",
  // Florida-only sports
  "grand-slam", "touchdown", "hat-trick", "slam-dunk", "goal", "checkered-flag",
  // Florida-only service
  "those-who-serve", "back-the-blue", "fire-watch",
]);

export const floridaGame: GameDefinition & {
  share: {
    appMessage: string;
    badgeMessage: (badgeName: string) => string;
  };
  help: {
    howToPlay: string[];
    usefulTools: string[];
    install: string[];
    safeUse: string[];
  };
  about: {
    fairUseNotice: string;
  };
} = {
  id: "florida",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Florida",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Florida Department of Highway Safety and Motor Vehicles",
      agencyUrl: "https://www.flhsmv.gov/",
      logoPath: "state-packs/florida/dmv-logo.png",
      logoAlt: "Florida DHSMV logo"
    }
  },
  share: {
    appMessage: [
      "I’ve been playing Every PL8 — a license plate collecting game!",
      "",
      "Play it here: https://gorillagrin.com/florida-plates-game/",
      "",
      "To install:",
      "iPhone: open in Safari, tap Share, then Add to Home Screen.",
      "Android: open in Chrome, then use Add to Home screen or Install app."
    ].join("\n"),
    badgeMessage: (badgeName: string) =>
      [
        `I just earned ${badgeName} on Every PL8!`,
        "",
        "Play it here: https://gorillagrin.com/florida-plates-game/",
        "",
        "To install:",
        "iPhone: open in Safari, tap Share, then Add to Home Screen.",
        "Android: open in Chrome, then use Add to Home screen or Install app."
      ].join("\n")
  },
  help: {
    howToPlay: [
      "Tap a plate image to enlarge it.",
      "Tap the title area to mark it found.",
      "Tap the title area again to clear that sighting.",
      "If location access is allowed, the app saves the time and a place name when available.",
      "Use the visibility buttons to show all plates, only found plates, or only missing plates.",
      "Use the arrangement buttons to keep category groups or switch to a flat A-Z or Z-A list."
    ],
    usefulTools: [
      "Explore opens badges, a stats dashboard, and your map view.",
      "Settings lets you hide optional controls and switch color mode.",
      "Share Every PL8 opens a share sheet with the app link and install instructions."
    ],
    install: [
      "iPhone: open the game in Safari, tap Share, then choose Add to Home Screen.",
      "Android: open the game in Chrome, then use Add to Home screen or Install app.",
      "Once it loads online at least once, it can keep working offline."
    ],
    safeUse: [
      "For your safety and the safety of others, never use this app while driving.",
      "Always comply with all applicable traffic laws, including hands-free and distracted-driving regulations in your area.",
      "Use this app only when your vehicle is parked in a safe location or when operated by a passenger.",
      "By using this app, you agree that you are solely responsible for how and when it is used."
    ]
  },
  about: {
    fairUseNotice:
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Florida Department of Highway Safety and Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Florida Department of Highway Safety and Motor Vehicles."
  }
};

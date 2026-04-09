import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const arkansasMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "First Responders",
  "Heritage",
  "Wildlife & Nature"
]);

// Arkansas has no panhandle equivalent — empty set for now
export const arkansasRegionScoutCounties = new Set<string>();

// Arkansas regional badge counties
// Regions defined by Arkansas Tourism & State Parks (arkansas.com)
export const arkansasBadgeCounties: Record<string, string[]> = {
  // The Ozarks — Northwest and north-central highlands
  "ar-ozarks-explorer": [
    "Benton", "Boone", "Baxter", "Carroll", "Cleburne", "Fulton",
    "Independence", "Izard", "Lawrence", "Madison", "Marion", "Newton",
    "Randolph", "Searcy", "Sharp", "Stone", "Van Buren", "Washington"
  ],
  // The Delta — Eastern lowlands along the Mississippi River
  "ar-delta-explorer": [
    "Arkansas", "Chicot", "Clay", "Craighead", "Crittenden", "Cross",
    "Desha", "Greene", "Jackson", "Lee", "Mississippi", "Monroe",
    "Phillips", "Poinsett", "Prairie", "St. Francis", "Woodruff"
  ],
  // Capital — Central Arkansas around Little Rock
  "ar-capital-explorer": [
    "Faulkner", "Grant", "Jefferson", "Lincoln", "Lonoke", "Pulaski",
    "Saline", "White"
  ],
  // River Valley — Along the Arkansas River corridor
  "ar-river-valley-explorer": [
    "Conway", "Crawford", "Franklin", "Johnson", "Logan", "Perry",
    "Pope", "Scott", "Sebastian", "Yell"
  ],
  // The Ouachitas — Southwestern mountains
  "ar-ouachitas-explorer": [
    "Clark", "Garland", "Hot Spring", "Montgomery", "Pike", "Polk"
  ],
  // The Timberlands — Southern pine forests
  "ar-timberlands-explorer": [
    "Ashley", "Bradley", "Calhoun", "Cleveland", "Columbia", "Dallas",
    "Drew", "Hempstead", "Howard", "Lafayette", "Little River", "Miller",
    "Nevada", "Ouachita", "Sevier", "Union"
  ],
};

export const arkansasBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Arkansas Explorer",
  test: "Test"
};

export const arkansasBadgeGroupSymbols: Record<BadgeGroup, string> = {
  progress: "star",
  category: "grid",
  collection: "rings",
  sports: "trophy",
  college: "cap",
  locality: "pin",
  service: "shield",
  florida: "compass",
  test: "star"
};

export const arkansasGame: GameDefinition & {
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
  id: "arkansas",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Arkansas Edition",
    headerImage: {
      type: "logo",
      path: "state-pl8-logo.png",
      alt: "State PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Arkansas Department of Finance and Administration",
      agencyUrl: "https://www.dfa.arkansas.gov/",
      logoPath: "state-packs/arkansas/dfa-logo.svg",
      logoAlt: "Arkansas DFA logo"
    }
  },
  share: {
    appMessage: [
      "I've been playing Every PL8 — a license plate collecting game!",
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
      "Tap the circle icon to mark it found.",
      "Tap the checkmark to clear that sighting.",
      "If location access is allowed, the app saves the time and a place name when available.",
      "Use Filter to show all plates, only found, or only missing.",
      "Use Sort to arrange by category, A-Z, or Z-A."
    ],
    usefulTools: [
      "Explore opens badges, a stats dashboard, and your map view.",
      "Settings lets you hide optional controls and switch color mode.",
      "Share opens a share sheet with the app link and install instructions."
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Arkansas Department of Finance and Administration and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

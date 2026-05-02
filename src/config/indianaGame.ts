import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const indianaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// No panhandle equivalent — regional explorers cover the whole state.
export const indianaRegionScoutCounties = new Set<string>();

// Indiana regional badge counties — 5 regions covering all 92 counties.
// Roughly aligned with the state's economic / tourism quadrants plus the
// distinct Calumet Region in the northwest.
export const indianaBadgeCounties: Record<string, string[]> = {
  // Northwest — Calumet Region (Gary/Hammond) + Wabash Valley north +
  // Tippecanoe / Lafayette
  "in-northwest-explorer": [
    "Lake", "Porter", "LaPorte", "Newton", "Jasper", "Starke", "Pulaski",
    "Marshall", "Fulton", "Cass", "White", "Benton", "Warren", "Vermillion",
    "Parke", "Fountain", "Tippecanoe", "Tipton", "Clinton", "Carroll",
    "Howard", "Montgomery"
  ],
  // Northeast — Fort Wayne metro + Lakes Country
  "in-northeast-explorer": [
    "Allen", "Adams", "DeKalb", "Steuben", "LaGrange", "Noble", "Whitley",
    "Wells", "Huntington", "Wabash", "Miami", "Kosciusko", "St. Joseph",
    "Elkhart", "Grant", "Blackford", "Jay"
  ],
  // Central — Indianapolis metro + east-central
  "in-central-explorer": [
    "Marion", "Hamilton", "Hancock", "Hendricks", "Boone", "Madison",
    "Delaware", "Henry", "Randolph", "Wayne", "Fayette", "Union", "Rush",
    "Shelby", "Johnson", "Morgan", "Putnam"
  ],
  // Southwest — Evansville + Bloomington + Wabash Valley south
  "in-southwest-explorer": [
    "Vanderburgh", "Posey", "Gibson", "Pike", "Warrick", "Spencer", "Perry",
    "Dubois", "Crawford", "Orange", "Knox", "Daviess", "Martin", "Sullivan",
    "Greene", "Owen", "Lawrence", "Monroe", "Brown", "Vigo", "Clay"
  ],
  // Southeast — Madison / Cincinnati borderlands + hill country / Knobs
  "in-southeast-explorer": [
    "Bartholomew", "Decatur", "Franklin", "Dearborn", "Ohio", "Switzerland",
    "Jefferson", "Jennings", "Ripley", "Jackson", "Scott", "Washington",
    "Clark", "Floyd", "Harrison"
  ],
};

export const indianaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Indiana Explorer",
  test: "Test"
};

export const indianaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const indianaBadgePlateSets: Record<string, string[]> = {};

export const indianaBadgeIds = new Set<string>([
  "in-northwest-explorer",
  "in-northeast-explorer",
  "in-central-explorer",
  "in-southwest-explorer",
  "in-southeast-explorer",
  "all-around-indiana",
]);

export const indianaGame: GameDefinition & {
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
  id: "indiana",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Indiana",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Indiana Bureau of Motor Vehicles",
      agencyUrl: "https://www.in.gov/bmv/",
      logoPath: "state-packs/indiana/bmv-logo.png",
      logoAlt: "Indiana BMV logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Indiana Bureau of Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Indiana Bureau of Motor Vehicles."
  }
};

import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const southCarolinaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// South Carolina has no panhandle equivalent at the county-set level —
// the regional explorers cover the whole state.
export const southCarolinaRegionScoutCounties = new Set<string>();

// South Carolina regional badge counties — 4 regions covering all 46 counties.
// Mirrors the state's official tourism regions (discoversouthcarolina.com).
export const southCarolinaBadgeCounties: Record<string, string[]> = {
  // Upstate / Upcountry — Greenville-Spartanburg corridor and the Blue Ridge
  "sc-upstate-explorer": [
    "Abbeville", "Anderson", "Cherokee", "Greenville", "Greenwood",
    "Laurens", "McCormick", "Oconee", "Pickens", "Spartanburg", "Union"
  ],
  // Midlands — Columbia metro and the central piedmont
  "sc-midlands-explorer": [
    "Aiken", "Calhoun", "Chester", "Edgefield", "Fairfield", "Kershaw",
    "Lancaster", "Lexington", "Newberry", "Richland", "Saluda", "York"
  ],
  // Pee Dee — Florence, Myrtle Beach, and the northeast tobacco belt
  "sc-pee-dee-explorer": [
    "Chesterfield", "Darlington", "Dillon", "Florence", "Horry", "Lee",
    "Marion", "Marlboro", "Sumter"
  ],
  // Lowcountry — Charleston, Beaufort, Hilton Head, and the coastal plain
  "sc-lowcountry-explorer": [
    "Allendale", "Bamberg", "Barnwell", "Beaufort", "Berkeley", "Charleston",
    "Clarendon", "Colleton", "Dorchester", "Georgetown", "Hampton", "Jasper",
    "Orangeburg", "Williamsburg"
  ],
};

export const southCarolinaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "South Carolina Explorer",
  test: "Test"
};

export const southCarolinaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const southCarolinaBadgePlateSets: Record<string, string[]> = {};

export const southCarolinaBadgeIds = new Set<string>([
  "sc-upstate-explorer",
  "sc-midlands-explorer",
  "sc-pee-dee-explorer",
  "sc-lowcountry-explorer",
  "all-around-south-carolina",
]);

export const southCarolinaGame: GameDefinition & {
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
  id: "south-carolina",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — South Carolina",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "South Carolina Department of Motor Vehicles",
      agencyUrl: "https://dmv.sc.gov/",
      logoPath: "state-packs/south-carolina/dmv-logo.png",
      logoAlt: "South Carolina DMV logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the South Carolina Department of Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the South Carolina Department of Motor Vehicles."
  }
};

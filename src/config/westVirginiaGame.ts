import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const westVirginiaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// West Virginia has no panhandle equivalent at the county-set level —
// the "Eastern Panhandle" geography is handled as a regional explorer.
export const westVirginiaRegionScoutCounties = new Set<string>();

// West Virginia regional badge counties — 5 regions covering all 55 counties.
// Consolidated from the state's 9 official tourism regions (see
// wvtourism.com) to keep the badge grid tight.
export const westVirginiaBadgeCounties: Record<string, string[]> = {
  // Eastern Panhandle — DC-adjacent
  "wv-eastern-panhandle-explorer": [
    "Berkeley", "Jefferson", "Morgan"
  ],
  // Potomac Highlands — the mountainous spine
  "wv-potomac-highlands-explorer": [
    "Grant", "Hampshire", "Hardy", "Mineral", "Pendleton", "Pocahontas",
    "Randolph", "Tucker"
  ],
  // Mountaineer Country & Northern Panhandle — north, Morgantown to Wheeling
  "wv-mountaineer-country-explorer": [
    "Barbour", "Brooke", "Doddridge", "Gilmer", "Hancock", "Harrison",
    "Lewis", "Marion", "Marshall", "Monongalia", "Ohio", "Pleasants",
    "Preston", "Ritchie", "Taylor", "Tyler", "Upshur", "Wetzel", "Wirt",
    "Wood"
  ],
  // Metro Valley — Charleston / Huntington corridor
  "wv-metro-valley-explorer": [
    "Boone", "Cabell", "Jackson", "Kanawha", "Lincoln", "Logan", "Mason",
    "Mingo", "Putnam", "Roane", "Wayne"
  ],
  // New River & Mountain Lakes — south and central highlands
  "wv-new-river-mountain-lakes-explorer": [
    "Braxton", "Calhoun", "Clay", "Fayette", "Greenbrier", "McDowell",
    "Mercer", "Monroe", "Nicholas", "Raleigh", "Summers", "Webster",
    "Wyoming"
  ],
};

export const westVirginiaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "West Virginia Explorer",
  test: "Test"
};

export const westVirginiaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const westVirginiaBadgePlateSets: Record<string, string[]> = {};

export const westVirginiaBadgeIds = new Set<string>([
  "wv-eastern-panhandle-explorer", "wv-potomac-highlands-explorer",
  "wv-mountaineer-country-explorer", "wv-metro-valley-explorer",
  "wv-new-river-mountain-lakes-explorer",
  "all-around-west-virginia",
]);

export const westVirginiaGame: GameDefinition & {
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
  id: "west-virginia",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — West Virginia",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "West Virginia Division of Motor Vehicles",
      agencyUrl: "https://transportation.wv.gov/DMV/",
      logoPath: "state-packs/west-virginia/dmv-logo.png",
      logoAlt: "West Virginia DMV logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the West Virginia Division of Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the West Virginia Division of Motor Vehicles."
  }
};

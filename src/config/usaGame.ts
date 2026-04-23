import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

// The 50-State Challenge mode has no category groupings (every plate is
// category "Standard"), no county regions, no panhandle concept.
export const usaMixedBagCategories = new Set<PlateCategory>();
export const usaRegionScoutCounties = new Set<string>();

// Regional badges in the 50-state game group STATES (not counties).
// The existing badgePlateSets → activeBadgePlateSets mechanism handles
// this cleanly: each regional badge lists its qualifying plate names.
// US Census divisions, consolidated into five regions:
//   - Northeast  (9)
//   - Midwest   (12)
//   - South     (16)
//   - West      (8)
//   - Pacific   (5 — includes AK and HI)
export const usaBadgePlateSets: Record<string, string[]> = {
  "usa-northeast-explorer": [
    "Maine", "New Hampshire", "Vermont", "Massachusetts", "Rhode Island",
    "Connecticut", "New York", "New Jersey", "Pennsylvania"
  ],
  "usa-midwest-explorer": [
    "Ohio", "Indiana", "Illinois", "Michigan", "Wisconsin",
    "Minnesota", "Iowa", "Missouri", "North Dakota", "South Dakota",
    "Nebraska", "Kansas"
  ],
  "usa-south-explorer": [
    "Delaware", "Maryland", "Virginia", "West Virginia", "North Carolina",
    "South Carolina", "Georgia", "Florida", "Kentucky", "Tennessee",
    "Alabama", "Mississippi", "Arkansas", "Louisiana", "Oklahoma", "Texas"
  ],
  "usa-west-explorer": [
    "Montana", "Idaho", "Wyoming", "Colorado", "New Mexico",
    "Arizona", "Utah", "Nevada"
  ],
  "usa-pacific-explorer": [
    "Washington", "Oregon", "California", "Alaska", "Hawaii"
  ],
  // Iconic hard-to-spot singletons
  "usa-alaska": ["Alaska"],
  "usa-hawaii": ["Hawaii"],
};

// No county-based regions in this mode — the badge-county map is empty.
export const usaBadgeCounties: Record<string, string[]> = {};

export const usaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "USA Regions",
  test: "Test"
};

export const usaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const usaBadgeIds = new Set<string>([
  "usa-northeast-explorer",
  "usa-midwest-explorer",
  "usa-south-explorer",
  "usa-west-explorer",
  "usa-pacific-explorer",
  "usa-alaska",
  "usa-hawaii",
  "all-around-usa",
]);

export const usaGame: GameDefinition & {
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
  id: "usa",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — 50-State Challenge",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the respective state motor vehicle agencies of the United States and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners.",
      agencyName: "U.S. State Motor Vehicle Agencies",
      agencyUrl: "https://www.usa.gov/motor-vehicle-services",
      logoPath: "",
      logoAlt: ""
    }
  },
  share: {
    appMessage: [
      "I've been playing Every PL8 — the classic road-trip game!",
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
      "Tap the circle icon to mark it found when you spot a car from that state.",
      "Tap the checkmark to clear that sighting.",
      "If location access is allowed, the app saves the time and a place name when available.",
      "Use Filter to show all plates, only found, or only missing.",
      "Use Sort to arrange A-Z or Z-A."
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the respective state motor vehicle agencies of the United States and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners."
  }
};

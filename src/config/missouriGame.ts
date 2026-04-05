import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const missouriMixedBagCategories = new Set<PlateCategory>([
  "Civic & Causes",
  "Health & Family",
  "Education & Culture",
  "Public Service",
  "Travel & Tourism"
]);

// Missouri has no panhandle equivalent — empty set for now
export const missouriRegionScoutCounties = new Set<string>();

// Missouri regional badge counties
// Regions defined by the Missouri Division of Tourism (visitmo.com)
export const missouriBadgeCounties: Record<string, string[]> = {
  // Northwest Missouri
  "mo-northwest-explorer": [
    "Andrew", "Atchison", "Buchanan", "Caldwell", "Carroll", "Cass",
    "Clay", "Clinton", "Daviess", "DeKalb", "Gentry", "Grundy",
    "Harrison", "Henry", "Holt", "Jackson", "Johnson", "Lafayette",
    "Livingston", "Mercer", "Nodaway", "Platte", "Ray", "St. Clair",
    "Sullivan", "Vernon", "Worth"
  ],
  // Northeast Missouri
  "mo-northeast-explorer": [
    "Adair", "Audrain", "Callaway", "Chariton", "Clark", "Franklin",
    "Gasconade", "Knox", "Lewis", "Lincoln", "Linn", "Macon",
    "Marion", "Monroe", "Montgomery", "Osage", "Pike", "Putnam",
    "Ralls", "Randolph", "Schuyler", "Scotland", "Shelby", "St. Charles",
    "St. Louis", "St. Louis City", "Warren"
  ],
  // Central Missouri
  "mo-central-explorer": [
    "Bates", "Benton", "Boone", "Camden", "Cole", "Cooper", "Dallas",
    "Hickory", "Howard", "Laclede", "Maries", "Miller", "Moniteau",
    "Morgan", "Pettis", "Phelps", "Polk", "Pulaski", "Saline",
    "Webster", "Wright"
  ],
  // Southwest Missouri
  "mo-southwest-explorer": [
    "Barry", "Barton", "Cedar", "Christian", "Dade", "Douglas",
    "Greene", "Jasper", "Lawrence", "McDonald", "Newton", "Ozark",
    "Stone", "Taney"
  ],
  // Southeast Missouri
  "mo-southeast-explorer": [
    "Bollinger", "Butler", "Cape Girardeau", "Carter", "Crawford",
    "Dent", "Dunklin", "Howell", "Iron", "Jefferson", "Madison",
    "Mississippi", "New Madrid", "Oregon", "Pemiscot", "Perry",
    "Reynolds", "Ripley", "Scott", "Shannon", "St. Francois",
    "Ste. Genevieve", "Stoddard", "Texas", "Washington", "Wayne"
  ],
};

export const missouriBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Missouri Explorer",
  test: "Test"
};

export const missouriBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const missouriGame: GameDefinition & {
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
  id: "missouri",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Missouri Edition",
    headerImage: {
      type: "logo",
      path: "state-pl8-logo.png",
      alt: "State PL8 logo"
    },
    attribution: {
      text: "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Missouri Department of Revenue",
      agencyUrl: "https://dor.mo.gov/",
      logoPath: "state-packs/missouri/dor-logo.png",
      logoAlt: "Missouri DOR logo"
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
      "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the Missouri Department of Revenue and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

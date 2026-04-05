import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const mississippiMixedBagCategories = new Set<PlateCategory>([
  "Civic & Causes",
  "Health & Family",
  "Education & Culture",
  "Public Service",
  "Travel & Tourism"
]);

// Mississippi has no panhandle equivalent — empty set for now
export const mississippiRegionScoutCounties = new Set<string>();

// Mississippi regional badge counties
// Regions defined by the Mississippi Development Authority (visitmississippi.org)
export const mississippiBadgeCounties: Record<string, string[]> = {
  // The Hills — Northeast Mississippi
  "ms-hills-explorer": [
    "Alcorn", "Benton", "Calhoun", "Chickasaw", "Clay", "Grenada",
    "Itawamba", "Lafayette", "Lee", "Marshall", "Monroe", "Montgomery",
    "Pontotoc", "Prentiss", "Tippah", "Tishomingo", "Union", "Webster",
    "Yalobusha"
  ],
  // The Delta — Northwest Mississippi (alluvial floodplain)
  "ms-delta-explorer": [
    "Bolivar", "Carroll", "Coahoma", "DeSoto", "Holmes", "Humphreys",
    "Issaquena", "Leflore", "Panola", "Quitman", "Sharkey", "Sunflower",
    "Tallahatchie", "Tate", "Tunica", "Warren", "Washington", "Yazoo"
  ],
  // Capital/River — Central Mississippi & river corridor
  "ms-capital-river-explorer": [
    "Adams", "Amite", "Attala", "Claiborne", "Copiah", "Franklin",
    "Hinds", "Jefferson", "Lawrence", "Leake", "Lincoln", "Madison",
    "Pike", "Rankin", "Scott", "Simpson", "Walthall", "Wilkinson"
  ],
  // The Pines — East-central Mississippi
  "ms-pines-explorer": [
    "Choctaw", "Clarke", "Jasper", "Kemper", "Lauderdale", "Lowndes",
    "Neshoba", "Newton", "Noxubee", "Oktibbeha", "Smith", "Wayne",
    "Winston"
  ],
  // Coastal — Southern Mississippi & Gulf Coast
  "ms-coastal-explorer": [
    "Covington", "Forrest", "George", "Greene", "Hancock", "Harrison",
    "Jackson", "Jefferson Davis", "Jones", "Lamar", "Marion",
    "Pearl River", "Perry", "Stone"
  ],
};

export const mississippiBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Mississippi Explorer",
  test: "Test"
};

export const mississippiBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const mississippiGame: GameDefinition & {
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
  id: "mississippi",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Mississippi Edition",
    headerImage: {
      type: "logo",
      path: "state-pl8-logo.png",
      alt: "State PL8 logo"
    },
    attribution: {
      text: "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Mississippi Department of Revenue",
      agencyUrl: "https://www.dor.ms.gov/",
      logoPath: "state-packs/mississippi/dor-logo.png",
      logoAlt: "Mississippi DOR logo"
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
      "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the Mississippi Department of Revenue and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

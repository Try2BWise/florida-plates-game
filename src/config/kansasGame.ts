import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const kansasMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// Kansas has no panhandle equivalent — empty set
export const kansasRegionScoutCounties = new Set<string>();

// Kansas regional badge counties — 6 regions across 105 counties
export const kansasBadgeCounties: Record<string, string[]> = {
  // Northwest Plains
  "ks-northwest-explorer": [
    "Cheyenne", "Decatur", "Ellis", "Gove", "Graham", "Logan",
    "Norton", "Osborne", "Phillips", "Rawlins", "Rooks", "Russell",
    "Sheridan", "Sherman", "Smith", "Thomas", "Trego", "Wallace"
  ],
  // Northeast — Kansas City metro, college towns, capital
  "ks-northeast-explorer": [
    "Atchison", "Brown", "Doniphan", "Douglas", "Geary", "Jackson",
    "Jefferson", "Johnson", "Leavenworth", "Marshall", "Miami",
    "Nemaha", "Pottawatomie", "Riley", "Shawnee", "Wabaunsee",
    "Wyandotte"
  ],
  // North Central
  "ks-north-central-explorer": [
    "Clay", "Cloud", "Dickinson", "Ellsworth", "Jewell", "Lincoln",
    "Mitchell", "Morris", "Ottawa", "Republic", "Saline", "Washington"
  ],
  // South Central — Wichita metro
  "ks-south-central-explorer": [
    "Butler", "Chase", "Cowley", "Harper", "Harvey", "Kingman",
    "Marion", "McPherson", "Reno", "Rice", "Sedgwick", "Sumner"
  ],
  // Southwest
  "ks-southwest-explorer": [
    "Clark", "Comanche", "Edwards", "Finney", "Ford", "Grant",
    "Gray", "Greeley", "Hamilton", "Haskell", "Hodgeman", "Kearny",
    "Kiowa", "Lane", "Meade", "Morton", "Ness", "Pawnee", "Rush",
    "Scott", "Seward", "Stafford", "Stanton", "Stevens", "Wichita"
  ],
  // Southeast
  "ks-southeast-explorer": [
    "Allen", "Anderson", "Bourbon", "Chautauqua", "Cherokee", "Coffey",
    "Crawford", "Elk", "Franklin", "Greenwood", "Labette", "Linn",
    "Lyon", "Montgomery", "Neosho", "Osage", "Wilson", "Woodson"
  ],
};

export const kansasBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Kansas Explorer",
  test: "Test"
};

export const kansasBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const kansasGame: GameDefinition & {
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
  id: "kansas",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Kansas Edition",
    headerImage: {
      type: "logo",
      path: "state-pl8-logo.png",
      alt: "State PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Kansas Department of Revenue",
      agencyUrl: "https://ksrevenue.gov/",
      logoPath: "state-packs/kansas/kdor-logo.svg",
      logoAlt: "Kansas DOR logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Kansas Department of Revenue and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

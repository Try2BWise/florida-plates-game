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

// Kansas regional badge counties — KDWP official 5 regions, 105 counties
// Source: Kansas Dept of Wildlife & Parks (ksoutdoors.gov)
export const kansasBadgeCounties: Record<string, string[]> = {
  // Northwest (KDWP Region 1)
  "ks-northwest-explorer": [
    "Cheyenne", "Cloud", "Decatur", "Ellis", "Ellsworth", "Gove",
    "Graham", "Jewell", "Lincoln", "Logan", "Mitchell", "Norton",
    "Osborne", "Ottawa", "Phillips", "Rawlins", "Republic", "Rooks",
    "Russell", "Saline", "Sheridan", "Sherman", "Smith", "Thomas",
    "Trego", "Wallace"
  ],
  // Northeast (KDWP Region 2) — KC metro, Topeka, Lawrence, Manhattan
  "ks-northeast-explorer": [
    "Atchison", "Brown", "Clay", "Dickinson", "Doniphan", "Douglas",
    "Geary", "Jackson", "Jefferson", "Johnson", "Leavenworth", "Marshall",
    "Miami", "Nemaha", "Pottawatomie", "Riley", "Shawnee", "Wabaunsee",
    "Washington", "Wyandotte"
  ],
  // Southwest (KDWP Region 3)
  "ks-southwest-explorer": [
    "Barber", "Barton", "Clark", "Comanche", "Edwards", "Finney",
    "Ford", "Grant", "Gray", "Greeley", "Hamilton", "Haskell",
    "Hodgeman", "Kearny", "Kiowa", "Lane", "Meade", "Morton",
    "Ness", "Pawnee", "Pratt", "Rush", "Scott", "Seward",
    "Stafford", "Stanton", "Stevens", "Wichita"
  ],
  // South Central (KDWP Region 4) — Wichita metro
  "ks-south-central-explorer": [
    "Butler", "Chase", "Cowley", "Harper", "Harvey", "Kingman",
    "Marion", "McPherson", "Morris", "Reno", "Rice", "Sedgwick",
    "Sumner"
  ],
  // Southeast (KDWP Region 5)
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
    appTagline: "Every PL8 — Kansas",
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

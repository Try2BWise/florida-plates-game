import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const alabamaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

export const alabamaRegionScoutCounties = new Set<string>();

// Alabama regional badge counties — 5 regions derived from the 12 official
// Alabama Regional Councils (alarc.org), consolidated for gameplay.
// All 67 counties covered, zero overlaps.
export const alabamaBadgeCounties: Record<string, string[]> = {
  // North Alabama (NACOLG + TARCOG + NARCOG — Regions 1, 11, 12)
  "al-north-alabama-explorer": [
    "Colbert", "Cullman", "DeKalb", "Franklin", "Jackson", "Lauderdale",
    "Lawrence", "Limestone", "Madison", "Marion", "Marshall", "Morgan", "Winston"
  ],
  // Central Alabama (RPCGB + EARPDC + LRCOG + CARPDC — Regions 3, 4, 9, 10)
  "al-central-alabama-explorer": [
    "Autauga", "Blount", "Calhoun", "Chambers", "Cherokee", "Chilton",
    "Clay", "Cleburne", "Coosa", "Elmore", "Etowah", "Jefferson",
    "Lee", "Montgomery", "Randolph", "Russell", "Shelby", "St. Clair",
    "Talladega", "Tallapoosa", "Walker"
  ],
  // West Alabama (WARC + ATRC — Regions 2, 6)
  "al-west-alabama-explorer": [
    "Bibb", "Choctaw", "Clarke", "Conecuh", "Dallas", "Fayette",
    "Greene", "Hale", "Lamar", "Marengo", "Monroe", "Perry",
    "Pickens", "Sumter", "Tuscaloosa", "Washington", "Wilcox"
  ],
  // Southeast Alabama (SCADC + SEARPDC — Regions 5, 7)
  "al-southeast-alabama-explorer": [
    "Barbour", "Bullock", "Butler", "Coffee", "Covington", "Crenshaw",
    "Dale", "Geneva", "Henry", "Houston", "Lowndes", "Macon", "Pike"
  ],
  // Gulf Coast (SARPC — Region 8)
  "al-gulf-coast-explorer": [
    "Baldwin", "Escambia", "Mobile"
  ],
};

export const alabamaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Alabama Explorer",
  test: "Test"
};

export const alabamaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const alabamaGame: GameDefinition & {
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
  id: "alabama",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Alabama",
    headerImage: {
      type: "logo",
      path: "state-pl8-logo.png",
      alt: "State PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Alabama Department of Revenue",
      agencyUrl: "https://www.revenue.alabama.gov/",
      logoPath: "state-packs/alabama/al-dor-logo.png",
      logoAlt: "Alabama DOR logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Alabama Department of Revenue and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const iowaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// Iowa has no panhandle equivalent — empty set
export const iowaRegionScoutCounties = new Set<string>();

// Iowa regional badge counties — 5 regions covering all 99 Iowa counties.
// Grouping follows a clean quadrant + central split, approximating the
// state's commonly-used NW / NE / Central / SW / SE regional shorthand
// (Des Moines metro is Central, Sioux City is NW, Cedar Rapids / Iowa
// City / Quad Cities are SE, etc.).
export const iowaBadgeCounties: Record<string, string[]> = {
  // Northwest Iowa — Sioux City area + northwest corner
  "ia-northwest-explorer": [
    "Audubon", "Buena Vista", "Calhoun", "Carroll", "Cherokee", "Clay",
    "Crawford", "Dickinson", "Emmet", "Greene", "Ida", "Lyon", "Monona",
    "O'Brien", "Osceola", "Palo Alto", "Plymouth", "Pocahontas", "Sac",
    "Sioux", "Woodbury"
  ],
  // Northeast Iowa — Driftless region / Mason City / Dubuque
  "ia-northeast-explorer": [
    "Allamakee", "Black Hawk", "Bremer", "Buchanan", "Butler", "Cerro Gordo",
    "Chickasaw", "Clayton", "Delaware", "Dubuque", "Fayette", "Floyd",
    "Franklin", "Hancock", "Howard", "Humboldt", "Kossuth", "Mitchell",
    "Winnebago", "Winneshiek", "Worth", "Wright"
  ],
  // Central Iowa — Des Moines metro + surrounding
  "ia-central-explorer": [
    "Benton", "Boone", "Dallas", "Grundy", "Guthrie", "Hamilton", "Hardin",
    "Iowa", "Jasper", "Madison", "Mahaska", "Marion", "Marshall", "Polk",
    "Poweshiek", "Story", "Tama", "Warren", "Webster"
  ],
  // Southwest Iowa — Council Bluffs + southwest counties
  "ia-southwest-explorer": [
    "Adair", "Adams", "Cass", "Clarke", "Decatur", "Fremont", "Harrison",
    "Lucas", "Mills", "Montgomery", "Page", "Pottawattamie", "Ringgold",
    "Shelby", "Taylor", "Union", "Wayne"
  ],
  // Southeast Iowa — Quad Cities / Iowa City / Cedar Rapids / Burlington
  "ia-southeast-explorer": [
    "Appanoose", "Cedar", "Clinton", "Davis", "Des Moines", "Henry",
    "Jackson", "Jefferson", "Johnson", "Jones", "Keokuk", "Lee", "Linn",
    "Louisa", "Monroe", "Muscatine", "Scott", "Van Buren", "Wapello",
    "Washington"
  ],
};

export const iowaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Iowa Explorer",
  test: "Test"
};

export const iowaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const iowaBadgePlateSets: Record<string, string[]> = {};

export const iowaBadgeIds = new Set<string>([
  "ia-northwest-explorer", "ia-northeast-explorer", "ia-central-explorer",
  "ia-southwest-explorer", "ia-southeast-explorer",
  "all-around-iowa",
]);

export const iowaGame: GameDefinition & {
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
  id: "iowa",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Iowa",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Iowa Department of Transportation",
      agencyUrl: "https://iowadot.gov/",
      logoPath: "state-packs/iowa/dot-logo.png",
      logoAlt: "Iowa DOT logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Iowa Department of Transportation and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Iowa Department of Transportation."
  }
};

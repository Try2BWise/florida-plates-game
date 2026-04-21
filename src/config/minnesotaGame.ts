import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const minnesotaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

export const minnesotaRegionScoutCounties = new Set<string>();

// Minnesota regional badge counties — 5 regions covering all 87 counties.
// The Twin Cities metro is broken out as its own region because of the
// population density and tourism draw; everything else falls into
// geographic quadrants.
export const minnesotaBadgeCounties: Record<string, string[]> = {
  // Northwest Minnesota — Red River Valley / Bemidji
  "mn-northwest-explorer": [
    "Beltrami", "Clay", "Clearwater", "Hubbard", "Kittson",
    "Lake of the Woods", "Mahnomen", "Marshall", "Norman", "Pennington",
    "Polk", "Red Lake", "Roseau"
  ],
  // Northeast Minnesota — Arrowhead / Lake Superior / Iron Range
  "mn-northeast-explorer": [
    "Aitkin", "Carlton", "Cook", "Crow Wing", "Itasca", "Koochiching",
    "Lake", "Pine", "St. Louis"
  ],
  // Central Minnesota — North-central lakes + west-central
  "mn-central-explorer": [
    "Becker", "Benton", "Cass", "Chisago", "Douglas", "Grant", "Isanti",
    "Kanabec", "Kandiyohi", "McLeod", "Meeker", "Mille Lacs", "Morrison",
    "Otter Tail", "Pope", "Sherburne", "Stearns", "Stevens", "Swift",
    "Todd", "Traverse", "Wadena", "Wilkin", "Wright"
  ],
  // Twin Cities Metro — the 7-county metro area
  "mn-metro-explorer": [
    "Anoka", "Carver", "Dakota", "Hennepin", "Ramsey", "Scott", "Washington"
  ],
  // Southern Minnesota — everything south of the metro, spanning SW to SE
  "mn-southern-explorer": [
    "Big Stone", "Blue Earth", "Brown", "Chippewa", "Cottonwood", "Dodge",
    "Faribault", "Fillmore", "Freeborn", "Goodhue", "Houston", "Jackson",
    "Lac qui Parle", "Le Sueur", "Lincoln", "Lyon", "Martin", "Mower",
    "Murray", "Nicollet", "Nobles", "Olmsted", "Pipestone", "Redwood",
    "Renville", "Rice", "Rock", "Sibley", "Steele", "Wabasha", "Waseca",
    "Watonwan", "Winona", "Yellow Medicine"
  ],
};

export const minnesotaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Minnesota Explorer",
  test: "Test"
};

export const minnesotaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const minnesotaBadgePlateSets: Record<string, string[]> = {};

export const minnesotaBadgeIds = new Set<string>([
  "mn-northwest-explorer", "mn-northeast-explorer", "mn-central-explorer",
  "mn-metro-explorer", "mn-southern-explorer",
  "all-around-minnesota",
]);

export const minnesotaGame: GameDefinition & {
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
  id: "minnesota",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Minnesota",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Minnesota Department of Public Safety — Driver and Vehicle Services",
      agencyUrl: "https://dps.mn.gov/divisions/dvs/",
      logoPath: "state-packs/minnesota/dvs-logo.png",
      logoAlt: "Minnesota DVS logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Minnesota Department of Public Safety's Driver and Vehicle Services division and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Minnesota DVS."
  }
};

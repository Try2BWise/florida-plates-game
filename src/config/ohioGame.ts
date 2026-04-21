import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const ohioMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// Ohio has no panhandle equivalent — empty set
export const ohioRegionScoutCounties = new Set<string>();

// Ohio regional badge counties — 5 regions covering all 88 Ohio counties.
// Grouping follows general geographic convention (NW, NE, Central, SW,
// Appalachian SE) used by Ohio tourism and ODNR districts.
export const ohioBadgeCounties: Record<string, string[]> = {
  // Northwest Ohio — Toledo / Lima / Findlay
  "oh-northwest-explorer": [
    "Allen", "Auglaize", "Defiance", "Fulton", "Hancock", "Hardin", "Henry",
    "Lucas", "Mercer", "Ottawa", "Paulding", "Putnam", "Sandusky", "Van Wert",
    "Williams", "Wood", "Wyandot"
  ],
  // Northeast Ohio — Cleveland / Akron / Youngstown / Canton / Mansfield
  "oh-northeast-explorer": [
    "Ashland", "Ashtabula", "Carroll", "Columbiana", "Crawford", "Cuyahoga",
    "Erie", "Geauga", "Harrison", "Huron", "Jefferson", "Lake", "Lorain",
    "Mahoning", "Medina", "Portage", "Richland", "Seneca", "Stark", "Summit",
    "Trumbull", "Tuscarawas", "Wayne"
  ],
  // Central Ohio — Columbus metro
  "oh-central-explorer": [
    "Delaware", "Fairfield", "Fayette", "Franklin", "Knox", "Licking",
    "Madison", "Marion", "Morrow", "Pickaway", "Union"
  ],
  // Southwest Ohio — Cincinnati / Dayton / Springfield
  "oh-southwest-explorer": [
    "Adams", "Brown", "Butler", "Champaign", "Clark", "Clermont", "Clinton",
    "Darke", "Greene", "Hamilton", "Highland", "Logan", "Miami", "Montgomery",
    "Preble", "Shelby", "Warren"
  ],
  // Southeast Ohio — Appalachian / Ohio River valley
  "oh-southeast-explorer": [
    "Athens", "Belmont", "Coshocton", "Gallia", "Guernsey", "Hocking",
    "Holmes", "Jackson", "Lawrence", "Meigs", "Monroe", "Morgan", "Muskingum",
    "Noble", "Perry", "Pike", "Ross", "Scioto", "Vinton", "Washington"
  ],
};

export const ohioBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Ohio Explorer",
  test: "Test"
};

export const ohioBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const ohioBadgePlateSets: Record<string, string[]> = {};

export const ohioBadgeIds = new Set<string>([
  "oh-northwest-explorer", "oh-northeast-explorer", "oh-central-explorer",
  "oh-southwest-explorer", "oh-southeast-explorer",
  "all-around-ohio",
]);

export const ohioGame: GameDefinition & {
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
  id: "ohio",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Ohio",
    headerImage: {
      type: "logo",
      path: "every-pl8-logo.png",
      alt: "Every PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Ohio Bureau of Motor Vehicles",
      agencyUrl: "https://bmv.ohio.gov/",
      logoPath: "state-packs/ohio/bmv-logo.png",
      logoAlt: "Ohio BMV logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Ohio Bureau of Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Ohio Bureau of Motor Vehicles."
  }
};

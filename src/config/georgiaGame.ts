import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const georgiaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Standard",
  "Wildlife & Nature"
]);

// Georgia has no panhandle equivalent — empty set
export const georgiaRegionScoutCounties = new Set<string>();

// Georgia regional badge counties — 5 regions derived from the 12 official
// Georgia Regional Commissions (garc.ga.gov), consolidated for gameplay.
// All 159 counties covered, zero overlaps.
export const georgiaBadgeCounties: Record<string, string[]> = {
  // North Georgia (Northwest RC + Georgia Mountains RC)
  "ga-north-georgia-explorer": [
    "Banks", "Bartow", "Catoosa", "Chattooga", "Dade", "Dawson", "Fannin",
    "Floyd", "Franklin", "Gilmer", "Gordon", "Habersham", "Hall", "Haralson",
    "Hart", "Lumpkin", "Murray", "Paulding", "Pickens", "Polk", "Rabun",
    "Stephens", "Towns", "Union", "Walker", "White", "Whitfield"
  ],
  // Metro Atlanta (Atlanta RC + Three Rivers RC + Northeast Georgia RC)
  "ga-metro-atlanta-explorer": [
    "Barrow", "Butts", "Carroll", "Cherokee", "Clarke", "Clayton", "Cobb",
    "Coweta", "DeKalb", "Douglas", "Elbert", "Fayette", "Forsyth", "Fulton",
    "Greene", "Gwinnett", "Heard", "Henry", "Jackson", "Jasper", "Lamar",
    "Madison", "Meriwether", "Morgan", "Newton", "Oconee", "Oglethorpe",
    "Pike", "Rockdale", "Spalding", "Troup", "Upson", "Walton"
  ],
  // Central Georgia (Middle Georgia RC + Central Savannah River Area RC)
  "ga-central-georgia-explorer": [
    "Baldwin", "Bibb", "Burke", "Columbia", "Crawford", "Glascock", "Hancock",
    "Houston", "Jefferson", "Jenkins", "Jones", "Lincoln", "McDuffie", "Monroe",
    "Peach", "Pulaski", "Putnam", "Richmond", "Taliaferro", "Twiggs", "Warren",
    "Washington", "Wilkes", "Wilkinson"
  ],
  // Southwest Georgia (River Valley RC + Southwest Georgia RC)
  "ga-southwest-georgia-explorer": [
    "Baker", "Calhoun", "Chattahoochee", "Clay", "Colquitt", "Crisp", "Decatur",
    "Dooly", "Dougherty", "Early", "Grady", "Harris", "Lee", "Macon", "Marion",
    "Miller", "Mitchell", "Muscogee", "Quitman", "Randolph", "Schley", "Seminole",
    "Stewart", "Sumter", "Talbot", "Taylor", "Terrell", "Thomas", "Webster", "Worth"
  ],
  // Southeast Georgia (Heart of GA-Altamaha RC + Southern GA RC + Coastal RC)
  "ga-southeast-georgia-explorer": [
    "Appling", "Atkinson", "Bacon", "Ben Hill", "Berrien", "Bleckley", "Brantley",
    "Brooks", "Bryan", "Bulloch", "Camden", "Candler", "Charlton", "Chatham",
    "Clinch", "Coffee", "Cook", "Dodge", "Echols", "Effingham", "Emanuel",
    "Evans", "Glynn", "Irwin", "Jeff Davis", "Johnson", "Lanier", "Laurens",
    "Liberty", "Long", "Lowndes", "McIntosh", "Montgomery", "Pierce", "Screven",
    "Tattnall", "Telfair", "Tift", "Toombs", "Treutlen", "Turner", "Ware",
    "Wayne", "Wheeler", "Wilcox"
  ],
};

export const georgiaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Georgia Explorer",
  test: "Test"
};

export const georgiaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const georgiaGame: GameDefinition & {
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
  id: "georgia",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Georgia",
    headerImage: {
      type: "logo",
      path: "state-pl8-logo.png",
      alt: "State PL8 logo"
    },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Georgia Department of Revenue",
      agencyUrl: "https://dor.georgia.gov/",
      logoPath: "state-packs/georgia/ga-dor-logo.png",
      logoAlt: "Georgia DOR logo"
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
      "Plate images are not the intellectual property of Gorilla Grin. They belong to the Georgia Department of Revenue and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

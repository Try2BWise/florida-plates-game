import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const floridaMixedBagCategories = new Set<PlateCategory>([
  "Civic & Causes",
  "Health & Family",
  "Education & Culture",
  "Public Safety",
  "Recreation & Tourism"
]);

export const floridaPanhandleScoutCounties = new Set([
  "Escambia",
  "Bay",
  "Calhoun",
  "Franklin",
  "Gulf",
  "Holmes",
  "Jackson",
  "Liberty",
  "Okaloosa",
  "Santa Rosa",
  "Walton",
  "Washington"
]);

export const floridaBadgeCounties: Record<string, string[]> = {
  // Northwest Florida — The Panhandle
  "northwest-florida-explorer": [
    "Escambia", "Santa Rosa", "Okaloosa", "Walton", "Holmes", "Washington", "Bay", "Jackson", "Calhoun", "Gulf", "Franklin", "Liberty", "Gadsden", "Leon", "Wakulla"
  ],
  // North Central Florida — The Big Bend
  "north-central-florida-explorer": [
    "Jefferson", "Madison", "Taylor", "Lafayette", "Suwannee", "Dixie", "Levy", "Gilchrist"
  ],
  // Northeast Florida — The First Coast
  "northeast-florida-explorer": [
    "Nassau", "Duval", "Clay", "St. Johns", "Putnam", "Flagler"
  ],
  // Central West Florida — The Suncoast
  "central-west-florida-explorer": [
    "Pinellas", "Hillsborough", "Pasco", "Hernando", "Citrus", "Manatee", "Sarasota"
  ],
  // Central Florida — The Heart of Florida
  "central-florida-explorer": [
    "Orange", "Seminole", "Osceola", "Lake", "Polk", "Sumter", "Hardee", "Highlands", "Marion"
  ],
  // Central East Florida — The Space Coast
  "central-east-florida-explorer": [
    "Volusia", "Brevard", "Indian River", "St. Lucie"
  ],
  // Southwest Florida — The Paradise Coast
  "southwest-florida-explorer": [
    "Charlotte", "Lee", "Collier", "Hendry", "Glades"
  ],
  // Southeast Florida — The Gold Coast
  "southeast-florida-explorer": [
    "Martin", "Palm Beach", "Broward", "Miami-Dade"
  ],
  // The Florida Keys — The Conch Republic
  "florida-keys-explorer": ["Monroe"],
  // All Florida Explorer (all counties)
  "all-florida-explorer": [
    "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "St. Johns", "St. Lucie", "Santa Rosa", "Sarasota", "Seminole", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
  ]
};

// Expose county groupings for badge detail UI
// Tickle: 2026-03-25 - force redeploy for badge update
declare global {
  interface Window {
    floridaBadgeCounties?: Record<string, string[]>;
  }
}
if (typeof window !== "undefined") {
  window.floridaBadgeCounties = floridaBadgeCounties;
}

export const floridaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "All Florida Explorer"
};

export const floridaBadgeGroupSymbols: Record<BadgeGroup, string> = {
  progress: "star",
  category: "grid",
  collection: "rings",
  college: "cap",
  locality: "pin",
  service: "shield",
  florida: "compass"
};

export const floridaGame: GameDefinition & {
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
  id: "florida",
  branding: {
    appName: "FL Plates",
    appShareName: "FL Plates",
    shareUrl: "https://try2bwise.github.io/florida-plates-game/",
    appTagline: "Florida plate tracker",
    developerName: "Gorilla Grin",
    developerUrl: "https://gorillagrin.com",
    developerLogoPath: "gorilla-grin-horizontal.png"
  },
  share: {
    appMessage: [
      "I’ve been playing FL Plates, a Florida specialty plate spotting game.",
      "",
      "Play it here: https://try2bwise.github.io/florida-plates-game/",
      "",
      "To install:",
      "iPhone: open in Safari, tap Share, then Add to Home Screen.",
      "Android: open in Chrome, then use Add to Home screen or Install app."
    ].join("\n"),
    badgeMessage: (badgeName: string) =>
      [
        `I just earned ${badgeName} on FL Plates!`,
        "",
        "Play it here: https://try2bwise.github.io/florida-plates-game/",
        "",
        "To install:",
        "iPhone: open in Safari, tap Share, then Add to Home Screen.",
        "Android: open in Chrome, then use Add to Home screen or Install app."
      ].join("\n")
  },
  help: {
    howToPlay: [
      "Tap a plate image to enlarge it.",
      "Tap the title area to mark it found.",
      "Tap the title area again to clear that sighting.",
      "If location access is allowed, the app saves the time and a place name when available.",
      "Use the visibility buttons to show all plates, only found plates, or only missing plates.",
      "Use the arrangement buttons to keep category groups or switch to a flat A-Z or Z-A list."
    ],
    usefulTools: [
      "Explore opens badges, a stats dashboard, and your map view.",
      "Settings lets you hide optional controls and switch color mode.",
      "Share FL Plates opens a share sheet with the app link and install instructions."
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
      "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the Florida Department of Highway Safety and Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

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
  "emerald-coast-explorer": ["Escambia", "Santa Rosa", "Okaloosa", "Walton"],
  "forgotten-coast-explorer": ["Bay", "Calhoun", "Gulf", "Franklin", "Liberty"],
  "big-bend-explorer": ["Wakulla", "Jefferson", "Madison", "Taylor", "Lafayette"],
  "capital-region-explorer": ["Leon", "Gadsden", "Jackson", "Holmes", "Washington"],
  "suwannee-valley-explorer": ["Hamilton", "Suwannee", "Columbia", "Baker", "Union", "Bradford"],
  "first-coast-explorer": ["Nassau", "Duval", "St. Johns", "Flagler"],
  "nature-coast-explorer": ["Dixie", "Levy", "Citrus", "Hernando"],
  "suncoast-explorer": ["Pasco", "Pinellas", "Hillsborough", "Manatee", "Sarasota"],
  "florida-heartland-explorer": ["Polk", "Hardee", "Highlands", "DeSoto", "Okeechobee"],
  "treasure-coast-explorer": ["Indian River", "St. Lucie", "Martin"],
  "space-coast-explorer": ["Brevard"],
  "gold-coast-explorer": ["Palm Beach", "Broward", "Miami-Dade"],
  "paradise-coast-explorer": ["Charlotte", "Lee", "Collier", "Hendry", "Glades"],
  "florida-keys-explorer": ["Monroe"]
};

export const floridaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "All Around Florida"
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

import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const tennesseeMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "First Responders",
  "Heritage",
  "Wildlife & Nature"
]);

export const tennesseeRegionScoutCounties = new Set<string>();

// Tennessee Grand Divisions (Tennessee Code Annotated Title 4, Chapter 1)
export const tennesseeBadgeCounties: Record<string, string[]> = {
  "tn-east-explorer": [
    "Anderson", "Bledsoe", "Blount", "Bradley", "Campbell", "Carter",
    "Claiborne", "Cocke", "Cumberland", "Grainger", "Greene", "Hamblen",
    "Hamilton", "Hancock", "Hawkins", "Jefferson", "Johnson", "Knox",
    "Loudon", "Marion", "McMinn", "Meigs", "Monroe", "Morgan", "Polk",
    "Rhea", "Roane", "Scott", "Sevier", "Sullivan", "Unicoi", "Union",
    "Washington"
  ],
  "tn-middle-explorer": [
    "Bedford", "Cannon", "Cheatham", "Clay", "Coffee", "Davidson",
    "DeKalb", "Dickson", "Fentress", "Franklin", "Giles", "Grundy",
    "Hickman", "Houston", "Humphreys", "Jackson", "Lawrence", "Lewis",
    "Lincoln", "Macon", "Marshall", "Maury", "Montgomery", "Moore",
    "Overton", "Perry", "Pickett", "Putnam", "Robertson", "Rutherford",
    "Sequatchie", "Smith", "Sumner", "Stewart", "Trousdale", "Van Buren",
    "Warren", "Wayne", "White", "Williamson", "Wilson"
  ],
  "tn-west-explorer": [
    "Benton", "Carroll", "Chester", "Crockett", "Decatur", "Dyer",
    "Fayette", "Gibson", "Hardeman", "Hardin", "Haywood", "Henderson",
    "Henry", "Lake", "Lauderdale", "McNairy", "Madison", "Obion",
    "Shelby", "Tipton", "Weakley"
  ],
};

export const tennesseeBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Tennessee Explorer",
  test: "Test"
};

export const tennesseeBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const tennesseeGame: GameDefinition & {
  share: { appMessage: string; badgeMessage: (badgeName: string) => string; };
  help: { howToPlay: string[]; usefulTools: string[]; install: string[]; safeUse: string[]; };
  about: { fairUseNotice: string; };
} = {
  id: "tennessee",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Tennessee",
    headerImage: { type: "logo", path: "state-pl8-logo.png", alt: "State PL8 logo" },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Tennessee Department of Revenue",
      agencyUrl: "https://www.tn.gov/revenue.html",
      logoPath: "state-packs/tennessee/dor-logo.png",
      logoAlt: "Tennessee DOR logo"
    }
  },
  share: {
    appMessage: "I've been playing Every PL8 — a license plate collecting game!\n\nPlay it here: https://gorillagrin.com/florida-plates-game/\n\nTo install:\niPhone: open in Safari, tap Share, then Add to Home Screen.\nAndroid: open in Chrome, then use Add to Home screen or Install app.",
    badgeMessage: (badgeName: string) => `I just earned ${badgeName} on Every PL8!\n\nPlay it here: https://gorillagrin.com/florida-plates-game/\n\nTo install:\niPhone: open in Safari, tap Share, then Add to Home Screen.\nAndroid: open in Chrome, then use Add to Home screen or Install app.`
  },
  help: {
    howToPlay: ["Tap a plate image to enlarge it.", "Tap the circle icon to mark it found.", "Tap the checkmark to clear that sighting.", "If location access is allowed, the app saves the time and a place name when available.", "Use Filter to show all plates, only found, or only missing.", "Use Sort to arrange by category, A-Z, or Z-A."],
    usefulTools: ["Explore opens badges, a stats dashboard, and your map view.", "Settings lets you hide optional controls and switch color mode.", "Share opens a share sheet with the app link and install instructions."],
    install: ["iPhone: open the game in Safari, tap Share, then choose Add to Home Screen.", "Android: open the game in Chrome, then use Add to Home screen or Install app.", "Once it loads online at least once, it can keep working offline."],
    safeUse: ["For your safety and the safety of others, never use this app while driving.", "Always comply with all applicable traffic laws, including hands-free and distracted-driving regulations in your area.", "Use this app only when your vehicle is parked in a safe location or when operated by a passenger.", "By using this app, you agree that you are solely responsible for how and when it is used."]
  },
  about: { fairUseNotice: "Plate images are not the intellectual property of Gorilla Grin. They belong to the Tennessee Department of Revenue and are displayed here for identification, educational, and entertainment purposes under a fair use claim." }
};

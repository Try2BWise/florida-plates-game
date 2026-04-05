import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const kentuckyMixedBagCategories = new Set<PlateCategory>([
  "Civic & Causes",
  "Health & Family",
  "Education & Culture",
  "Public Service",
  "Travel & Tourism"
]);

export const kentuckyRegionScoutCounties = new Set<string>();

// Kentucky geographic regions (University of Kentucky)
export const kentuckyBadgeCounties: Record<string, string[]> = {
  "ky-bluegrass-explorer": [
    "Anderson", "Bath", "Boone", "Bourbon", "Boyle", "Bracken", "Campbell",
    "Carroll", "Clark", "Fayette", "Fleming", "Franklin", "Gallatin", "Grant",
    "Harrison", "Henry", "Jefferson", "Jessamine", "Kenton", "Lewis", "Mason",
    "Mercer", "Nicholas", "Oldham", "Owen", "Pendleton", "Robertson", "Scott",
    "Shelby", "Spencer", "Trimble", "Washington", "Woodford"
  ],
  "ky-eastern-mountain-explorer": [
    "Bell", "Breathitt", "Boyd", "Carter", "Clay", "Elliott", "Floyd",
    "Greenup", "Harlan", "Jackson", "Johnson", "Knott", "Knox", "Laurel",
    "Lawrence", "Lee", "Leslie", "Letcher", "Magoffin", "Martin", "McCreary",
    "Menifee", "Montgomery", "Morgan", "Owsley", "Perry", "Pike", "Powell",
    "Rowan", "Whitley", "Wolfe"
  ],
  "ky-knobs-explorer": [
    "Bullitt", "Estill", "Garrard", "Lincoln", "Madison", "Marion", "Nelson",
    "Rockcastle"
  ],
  "ky-pennyrile-explorer": [
    "Adair", "Allen", "Barren", "Breckinridge", "Caldwell", "Casey",
    "Christian", "Clinton", "Crittenden", "Cumberland", "Green", "Hardin",
    "Hart", "Hopkins", "Larue", "Livingston", "Logan", "Lyon", "Meade",
    "Metcalfe", "Monroe", "Pulaski", "Russell", "Simpson", "Taylor", "Todd",
    "Trigg", "Warren", "Wayne"
  ],
  "ky-jackson-purchase-explorer": [
    "Ballard", "Calloway", "Carlisle", "Fulton", "Graves", "Hickman",
    "Marshall", "McCracken"
  ],
  "ky-western-coalfields-explorer": [
    "Butler", "Daviess", "Edmonson", "Grayson", "Hancock", "Henderson",
    "McLean", "Muhlenberg", "Ohio", "Union", "Webster"
  ],
};

export const kentuckyBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Kentucky Explorer",
  test: "Test"
};

export const kentuckyBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const kentuckyGame: GameDefinition & {
  share: { appMessage: string; badgeMessage: (badgeName: string) => string; };
  help: { howToPlay: string[]; usefulTools: string[]; install: string[]; safeUse: string[]; };
  about: { fairUseNotice: string; };
} = {
  id: "kentucky",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Kentucky Edition",
    headerImage: { type: "logo", path: "state-pl8-logo.png", alt: "State PL8 logo" },
    attribution: {
      text: "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Kentucky Transportation Cabinet",
      agencyUrl: "https://drive.ky.gov/",
      logoPath: "state-packs/kentucky/kytc-logo.png",
      logoAlt: "Kentucky Transportation Cabinet logo"
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
  about: { fairUseNotice: "Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the Kentucky Transportation Cabinet and are displayed here for identification, educational, and entertainment purposes under a fair use claim." }
};

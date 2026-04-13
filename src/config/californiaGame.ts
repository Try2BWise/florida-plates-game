import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const californiaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Wildlife & Nature"
]);

export const californiaRegionScoutCounties = new Set<string>();

// California regional badge counties — 5 regions based loosely on
// Caltrans districts, consolidated for gameplay. All 58 counties covered.
export const californiaBadgeCounties: Record<string, string[]> = {
  // Southern California (LA, San Diego, inland empire)
  "ca-socal-explorer": [
    "Los Angeles", "Orange", "San Diego", "Riverside", "San Bernardino",
    "Ventura", "Imperial"
  ],
  // Central Coast & Valley
  "ca-central-explorer": [
    "Fresno", "Kern", "Kings", "Madera", "Mariposa", "Merced",
    "Monterey", "San Benito", "San Joaquin", "San Luis Obispo",
    "Santa Barbara", "Santa Cruz", "Stanislaus", "Tulare", "Tuolumne"
  ],
  // Bay Area & Northern Coast
  "ca-bay-area-explorer": [
    "Alameda", "Contra Costa", "Marin", "Napa", "San Francisco",
    "San Mateo", "Santa Clara", "Solano", "Sonoma"
  ],
  // Sacramento & Gold Country
  "ca-sacramento-explorer": [
    "Sacramento", "El Dorado", "Placer", "Yolo", "Amador",
    "Calaveras", "Alpine", "Mono", "Inyo", "Sutter", "Yuba", "Nevada"
  ],
  // Far North (Redding, Shasta, border)
  "ca-far-north-explorer": [
    "Butte", "Colusa", "Del Norte", "Glenn", "Humboldt", "Lake",
    "Lassen", "Mendocino", "Modoc", "Plumas", "Shasta", "Sierra",
    "Siskiyou", "Tehama", "Trinity"
  ],
};

export const californiaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "California Explorer",
  test: "Test"
};

export const californiaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const californiaGame: GameDefinition & {
  share: { appMessage: string; badgeMessage: (badgeName: string) => string; };
  help: { howToPlay: string[]; usefulTools: string[]; install: string[]; safeUse: string[]; };
  about: { fairUseNotice: string; };
} = {
  id: "california",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — California",
    headerImage: { type: "logo", path: "state-pl8-logo.png", alt: "State PL8 logo" },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "California Department of Motor Vehicles",
      agencyUrl: "https://www.dmv.ca.gov/",
      logoPath: "",
      logoAlt: "California DMV"
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
  about: { fairUseNotice: "Plate images are not the intellectual property of Gorilla Grin. They belong to the California Department of Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the California Department of Motor Vehicles." }
};

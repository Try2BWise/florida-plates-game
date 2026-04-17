import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const alaskaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Commercial"
]);

export const alaskaRegionScoutCounties = new Set<string>();

// Alaska regional badge boroughs — 5 regions based on Alaska's
// economic/geographic regions. All boroughs and census areas covered.
export const alaskaBadgeCounties: Record<string, string[]> = {
  // Southcentral (Anchorage metro, Kenai, Mat-Su, Valdez-Cordova)
  "ak-southcentral-explorer": [
    "Anchorage", "Kenai Peninsula", "Matanuska-Susitna",
    "Valdez-Cordova", "Chugach", "Copper River"
  ],
  // Southeast (Inside Passage / panhandle)
  "ak-southeast-explorer": [
    "Juneau", "Ketchikan Gateway", "Sitka",
    "Haines", "Skagway", "Wrangell", "Petersburg",
    "Prince of Wales-Hyder", "Yakutat", "Hoonah-Angoon"
  ],
  // Interior (Fairbanks, Denali corridor)
  "ak-interior-explorer": [
    "Fairbanks North Star", "Denali", "Southeast Fairbanks",
    "Yukon-Koyukuk"
  ],
  // Southwest (Bristol Bay, Aleutians, Kodiak, Bethel)
  "ak-southwest-explorer": [
    "Kodiak Island", "Bristol Bay", "Lake and Peninsula",
    "Dillingham", "Bethel", "Aleutians East", "Aleutians West",
    "Kusilvak"
  ],
  // Arctic / North Slope / Northwest
  "ak-arctic-explorer": [
    "North Slope", "Northwest Arctic", "Nome"
  ],
};

export const alaskaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Alaska Explorer",
  test: "Test"
};

export const alaskaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const alaskaBadgePlateSets: Record<string, string[]> = {};

export const alaskaGame: GameDefinition & {
  share: { appMessage: string; badgeMessage: (badgeName: string) => string; };
  help: { howToPlay: string[]; usefulTools: string[]; install: string[]; safeUse: string[]; };
  about: { fairUseNotice: string; };
} = {
  id: "alaska",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Alaska",
    headerImage: { type: "logo", path: "every-pl8-logo.png", alt: "Every PL8 logo" },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Alaska Division of Motor Vehicles",
      agencyUrl: "https://dmv.alaska.gov/",
      logoPath: "",
      logoAlt: "Alaska DMV"
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
  about: { fairUseNotice: "Plate images are not the intellectual property of Gorilla Grin. They belong to the Alaska Division of Motor Vehicles and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Alaska Division of Motor Vehicles." }
};

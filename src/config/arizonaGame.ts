import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const arizonaMixedBagCategories = new Set<PlateCategory>([
  "Civic",
  "Health",
  "Heritage",
  "Wildlife & Nature"
]);

export const arizonaRegionScoutCounties = new Set<string>();

// Arizona regional badge counties — 5 regions based on Arizona's
// Councils of Government (COGs). All 15 counties covered.
export const arizonaBadgeCounties: Record<string, string[]> = {
  // Greater Phoenix / Central (MAG region)
  "az-central-explorer": [
    "Maricopa", "Pinal"
  ],
  // Southern Arizona (PAG region + border counties)
  "az-southern-explorer": [
    "Pima", "Santa Cruz", "Cochise"
  ],
  // Northern Arizona (NACOG region)
  "az-northern-explorer": [
    "Coconino", "Yavapai", "Navajo", "Apache"
  ],
  // Western Arizona (WACOG region)
  "az-western-explorer": [
    "Mohave", "La Paz", "Yuma"
  ],
  // Eastern Arizona (SEAGO region)
  "az-eastern-explorer": [
    "Graham", "Greenlee", "Gila"
  ],
};

export const arizonaBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  regional: "Arizona Explorer",
  test: "Test"
};

export const arizonaBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const arizonaBadgePlateSets: Record<string, string[]> = {};

export const arizonaBadgeIds = new Set<string>([
  "az-central-explorer", "az-southern-explorer", "az-northern-explorer",
  "az-western-explorer", "az-eastern-explorer",
  "all-around-arizona",
]);

export const arizonaGame: GameDefinition & {
  share: { appMessage: string; badgeMessage: (badgeName: string) => string; };
  help: { howToPlay: string[]; usefulTools: string[]; install: string[]; safeUse: string[]; };
  about: { fairUseNotice: string; };
} = {
  id: "arizona",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — Arizona",
    headerImage: { type: "logo", path: "every-pl8-logo.png", alt: "Every PL8 logo" },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to the {agency} and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the {agency}.",
      agencyName: "Arizona Motor Vehicle Division",
      agencyUrl: "https://azmvdnow.gov/",
      logoPath: "",
      logoAlt: "Arizona MVD"
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
  about: { fairUseNotice: "Plate images are not the intellectual property of Gorilla Grin. They belong to the Arizona Motor Vehicle Division and are displayed here for identification, educational, and entertainment purposes under a fair use claim. Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the Arizona Motor Vehicle Division." }
};

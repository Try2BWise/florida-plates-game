import type { BadgeGroup } from "../lib/badges";
import type { GameDefinition, PlateCategory } from "../types";

export const fiftyStatesMixedBagCategories = new Set<PlateCategory>([]);

export const fiftyStatesRegionScoutCounties = new Set<string>();

// No county-level badges for this pack — regions are Census divisions
export const fiftyStatesBadgeCounties: Record<string, string[]> = {};

export const fiftyStatesBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Regions",
  collection: "Milestones",
  sports: "Sports",
  college: "College Track",
  locality: "Geography",
  service: "Those Who Serve",
  florida: "250th",
  test: "Test"
};

export const fiftyStatesBadgeGroupSymbols: Record<BadgeGroup, string> = {
  progress: "star",
  category: "grid",
  collection: "rings",
  sports: "trophy",
  college: "cap",
  locality: "pin",
  service: "shield",
  florida: "flag",
  test: "star"
};

export const fiftyStatesGame: GameDefinition & {
  share: { appMessage: string; badgeMessage: (badgeName: string) => string; };
  help: { howToPlay: string[]; usefulTools: string[]; install: string[]; safeUse: string[]; };
  about: { fairUseNotice: string; };
} = {
  id: "fifty-states",
  branding: {
    appName: "Every PL8",
    appShareName: "Every PL8",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Every PL8 — 50 States",
    headerImage: { type: "logo", path: "state-pl8-logo.png", alt: "State PL8 logo" },
    attribution: {
      text: "Plate images are not the intellectual property of Gorilla Grin. They belong to their respective state and territorial motor vehicle agencies and are displayed here for identification, educational, and entertainment purposes under a fair use claim.",
      agencyName: "Various State & Territory Motor Vehicle Agencies",
      agencyUrl: "",
      logoPath: "",
      logoAlt: ""
    }
  },
  share: {
    appMessage: "I've been playing Every PL8 — a license plate collecting game! Can you spot all 50 states?\n\nPlay it here: https://gorillagrin.com/florida-plates-game/\n\nTo install:\niPhone: open in Safari, tap Share, then Add to Home Screen.\nAndroid: open in Chrome, then use Add to Home screen or Install app.",
    badgeMessage: (badgeName: string) => `I just earned ${badgeName} on Every PL8!\n\nPlay it here: https://gorillagrin.com/florida-plates-game/\n\nTo install:\niPhone: open in Safari, tap Share, then Add to Home Screen.\nAndroid: open in Chrome, then use Add to Home screen or Install app.`
  },
  help: {
    howToPlay: [
      "Spot a license plate from any US state, territory, or DC.",
      "Tap the plate image to enlarge it.",
      "Tap the circle icon to mark it found.",
      "Tap the checkmark to clear that sighting.",
      "If location access is allowed, the app saves the time and place.",
      "Use Filter to show all plates, only found, or only missing.",
      "Use Sort to arrange by region, A-Z, or Z-A."
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
    fairUseNotice: "Plate images are not the intellectual property of Gorilla Grin. They belong to their respective state and territorial motor vehicle agencies and are displayed here for identification, educational, and entertainment purposes under a fair use claim."
  }
};

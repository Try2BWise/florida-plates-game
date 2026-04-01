import type { BadgeGroup } from "../../lib/badges";
import type { GameDefinition, PlateCategory } from "../../types";

export const mississippiMixedBagCategories = new Set<PlateCategory>([
  "Civic & Causes",
  "Health & Family",
  "Education & Culture",
  "Public Service",
  "Travel & Tourism",
  "Public Schools"
]);

export const mississippiPanhandleScoutCounties = new Set<string>();
export const mississippiBadgeCounties: Record<string, string[]> = {};

export const mississippiBadgeGroupLabels: Record<BadgeGroup, string> = {
  progress: "Progress",
  category: "Categories",
  collection: "Collections",
  sports: "Professional Sports",
  college: "College Track",
  locality: "Places",
  service: "Those Who Serve",
  florida: "Explorer",
  test: "Test"
};

export const mississippiBadgeGroupSymbols: Record<BadgeGroup, string> = {
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

export const mississippiGame: GameDefinition & {
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
  id: "mississippi",
  branding: {
    appName: "MS Plates",
    appShareName: "MS Plates",
    shareUrl: "https://gorillagrin.com/florida-plates-game/",
    appTagline: "Mississippi plate tracker preview",
    developerName: "Gorilla Grin",
    developerUrl: "https://gorillagrin.com",
    developerLogoPath: "gorilla-grin-horizontal.png",
    welcomeSignImagePath: "state-packs/mississippi/branding/mississippi-welcome-sign.png",
    welcomeSignAlt: "Welcome to Mississippi sign"
  },
  share: {
    appMessage: [
      "I've been previewing MS Plates, a Mississippi license plate spotting game.",
      "",
      "Preview it here: https://gorillagrin.com/florida-plates-game/",
      "",
      "To install:",
      "iPhone: open in Safari, tap Share, then Add to Home Screen.",
      "Android: open in Chrome, then use Add to Home screen or Install app."
    ].join("\n"),
    badgeMessage: (badgeName: string) =>
      [
        `I just earned ${badgeName} on MS Plates!`,
        "",
        "Preview it here: https://gorillagrin.com/florida-plates-game/",
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
      "Share MS Plates opens a share sheet with the app link and install instructions."
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
      "Mississippi plate images are not the intellectual property of Gorilla Grin. They belong to their respective owners and are displayed here for identification, educational, and entertainment purposes under a fair use claim during preview and curation."
  }
};
// ...existing code...
import type { EvaluatedBadge } from "../lib/badges";

interface BadgeIconProps {
  badge: EvaluatedBadge;
  size?: number;
  className?: string;
}

const customBadgeArtById: Record<string, string> = {
  // Other
  "first-spot": "glowing-star.png",
  "complete-set": "trophy-new.png",
  "game-on": "goal-net.png",
  "thrill-ride": "roller-coaster-new.png",
  // Sports
  "grand-slam": "baseball.png",
  touchdown: "american-football.png",
  "hat-trick": "ice-hockey.png",
  "slam-dunk": "basketball.png",
  goal: "soccer-ball.png",
  "checkered-flag": "chequered-flag.png",
  // Nature / Geography
  "coastal-cruiser": "water-wave.png",
  "farm-fresh": "tractor.png",
  "road-trip": "globe-with-meridians.png",
  escapee: "world-map.png",
  "i-get-around": "world-map.png",
  "panhandle-scout": "world-map.png",
  "green-light": "leaf-new.png",
  "eco-scout": "paw-prints.png",
  // Service / Public
  "healing-hands": "hospital-new.png",
  "those-who-serve": "shield-new.png",
  "back-the-blue": "police-car-light.png",
  "fire-watch": "fire-engine.png",
  // Education (College Track)
  "first-day-of-school": "school-new.png",
  "campus-tour": "backpack-new.png",
  freshman: "open-book.png",
  sophomore: "books.png",
  junior: "notebook.png",
  senior: "scroll.png",
  "graduation-day": "graduation-cap.png",
  // Explorer badges — all states
  "northwest-florida-explorer": "compass-new.png",
  "north-central-florida-explorer": "compass-new.png",
  "northeast-florida-explorer": "compass-new.png",
  "central-west-florida-explorer": "compass-new.png",
  "central-florida-explorer": "compass-new.png",
  "central-east-florida-explorer": "compass-new.png",
  "southwest-florida-explorer": "compass-new.png",
  "southeast-florida-explorer": "compass-new.png",
  "florida-keys-explorer": "desert-island.png",
  "all-around-florida": "compass-new.png",
  "ms-hills-explorer": "compass-new.png",
  "ms-delta-explorer": "compass-new.png",
  "ms-capital-river-explorer": "compass-new.png",
  "ms-pines-explorer": "leaf-new.png",
  "ms-coastal-explorer": "water-wave.png",
  "all-around-mississippi": "compass-new.png",
  "ar-ozarks-explorer": "compass-new.png",
  "ar-delta-explorer": "tractor.png",
  "ar-capital-explorer": "compass-new.png",
  "ar-river-valley-explorer": "water-wave.png",
  "ar-ouachitas-explorer": "compass-new.png",
  "ar-timberlands-explorer": "leaf-new.png",
  "all-around-arkansas": "compass-new.png",
  "mo-northwest-explorer": "compass-new.png",
  "mo-northeast-explorer": "compass-new.png",
  "mo-central-explorer": "compass-new.png",
  "mo-southwest-explorer": "compass-new.png",
  "mo-southeast-explorer": "compass-new.png",
  "all-around-missouri": "compass-new.png",
  "tn-east-explorer": "compass-new.png",
  "tn-middle-explorer": "compass-new.png",
  "tn-west-explorer": "compass-new.png",
  "all-around-tennessee": "compass-new.png",
  "ky-bluegrass-explorer": "compass-new.png",
  "ky-eastern-mountain-explorer": "compass-new.png",
  "ky-knobs-explorer": "compass-new.png",
  "ky-pennyrile-explorer": "compass-new.png",
  "ky-jackson-purchase-explorer": "compass-new.png",
  "ky-western-coalfields-explorer": "compass-new.png",
  "all-around-kentucky": "compass-new.png",
};

export function BadgeIcon({ badge, size = 96, className = "" }: BadgeIconProps) {
  const customArt = customBadgeArtById[badge.id];

  // Select medal type based on badge requirements
  let medal = "gold";
  if (typeof badge.progressTarget === "number" && typeof badge.progressCurrent === "number") {
    if (badge.progressTarget <= 9) {
      medal = "bronze";
    } else {
      // If badge is based on percent, use progressTarget as percent (e.g., 0.75 for 75%)
      // But most badges use count, so check if target is a count or percent
      // We'll use 75% of a category as threshold for gold
      // If target is less than 75% of a plausible category size, use silver
      // For simplicity, if target >= 10 and <= 0.75 * plausible max, use silver
      // If target > 0.75 * plausible max, use gold
      // But since we don't have category size here, fallback: if target >= 10 and <= 75, silver; >75 gold
      if (badge.progressTarget >= 10 && badge.progressTarget <= 75) {
        medal = "silver";
      } else if (badge.progressTarget > 75) {
        medal = "gold";
      }
    }
  }
  const medalFileMap: Record<string, string> = {
    bronze: "3rd-place-medal.png",
    silver: "2nd-place-medal.png",
    gold: "1st-place-medal.png",
  };
  const imgSrc = `${import.meta.env.BASE_URL}badges/${customArt ?? medalFileMap[medal]}`;
  return (
    <img
      src={imgSrc}
      alt={badge.name}
      className={`${badge.earned ? "badge-medal-img" : "badge-medal-img badge-medal-img--dimmed"} ${className}`.trim()}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
      draggable={false}
    />
  );
}

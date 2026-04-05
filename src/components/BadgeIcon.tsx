// ...existing code...
import type { EvaluatedBadge } from "../lib/badges";

interface BadgeIconProps {
  badge: EvaluatedBadge;
  size?: number;
  className?: string;
}

const customBadgeArtById: Record<string, string> = {
  "first-spot": "start.png",
  "complete-set": "trophy.png",
  "healing-hands": "hospital.png",
  "game-on": "goal.png",
  "coastal-cruiser": "waves.png",
  "farm-fresh": "farm.png",
  "first-day-of-school": "chalkboard.png",
  "campus-tour": "backpack.png",
  "graduation-day": "cap.png",
  "grand-slam": "baseball-trophy.png",
  touchdown: "football-trophy.png",
  "hat-trick": "hockey-trophy.png",
  "slam-dunk": "basketball-trophy.png",
  goal: "soccer-trophy.png",
  "checkered-flag": "crossed-checkered-flags.png",
  "thrill-ride": "roller-coaster.png",
  escapee: "3d-map.png",
  "i-get-around": "3d-map.png",
  "road-trip": "road-sign.png",
  "panhandle-scout": "3d-map.png",
  "northwest-florida-explorer": "compass.png",
  "north-central-florida-explorer": "compass.png",
  "northeast-florida-explorer": "compass.png",
  "central-west-florida-explorer": "compass.png",
  "central-florida-explorer": "compass.png",
  "central-east-florida-explorer": "compass.png",
  "southwest-florida-explorer": "compass.png",
  "southeast-florida-explorer": "compass.png",
  "florida-keys-explorer": "lighthouse.png",
  "all-around-florida": "compass.png",
  "ms-hills-explorer": "compass.png",
  "ms-delta-explorer": "compass.png",
  "ms-capital-river-explorer": "compass.png",
  "ms-pines-explorer": "leaf.png",
  "ms-coastal-explorer": "waves.png",
  "all-around-mississippi": "compass.png",
  "ar-ozarks-explorer": "compass.png",
  "ar-delta-explorer": "farm.png",
  "ar-capital-explorer": "compass.png",
  "ar-river-valley-explorer": "waves.png",
  "ar-ouachitas-explorer": "compass.png",
  "ar-timberlands-explorer": "leaf.png",
  "all-around-arkansas": "compass.png",
  "mo-northwest-explorer": "compass.png",
  "mo-northeast-explorer": "compass.png",
  "mo-central-explorer": "compass.png",
  "mo-southwest-explorer": "compass.png",
  "mo-southeast-explorer": "compass.png",
  "all-around-missouri": "compass.png",
  "tn-east-explorer": "compass.png",
  "tn-middle-explorer": "compass.png",
  "tn-west-explorer": "compass.png",
  "all-around-tennessee": "compass.png",
  "ky-bluegrass-explorer": "compass.png",
  "ky-eastern-mountain-explorer": "compass.png",
  "ky-knobs-explorer": "compass.png",
  "ky-pennyrile-explorer": "compass.png",
  "ky-jackson-purchase-explorer": "compass.png",
  "ky-western-coalfields-explorer": "compass.png",
  "all-around-kentucky": "compass.png",
  "green-light": "leaf.png",
  "eco-scout": "pawprint.png",
  "those-who-serve": "shield.png",
  "back-the-blue": "police-badge.png",
  "fire-watch": "hydrant.png"
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
  const imgSrc = `${import.meta.env.BASE_URL}badges/${customArt ?? `${medal}-medal.png`}`;
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

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
  "thrill-ride": "roller-coaster.png",
  escapee: "3d-map.png",
  "i-get-around": "3d-map.png",
  "road-trip": "3d-map.png",
  "panhandle-scout": "3d-map.png",
  "northwest-florida-explorer": "compass.png",
  "north-central-florida-explorer": "compass.png",
  "northeast-florida-explorer": "compass.png",
  "central-west-florida-explorer": "compass.png",
  "central-florida-explorer": "compass.png",
  "central-east-florida-explorer": "compass.png",
  "southwest-florida-explorer": "compass.png",
  "southeast-florida-explorer": "compass.png",
  "florida-keys-explorer": "compass.png",
  "all-around-florida": "compass.png",
  "those-who-serve": "badge.png"
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

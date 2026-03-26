// ...existing code...
import type { EvaluatedBadge } from "../lib/badges";

interface BadgeIconProps {
  badge: EvaluatedBadge;
}

// Removed unused BadgePalette interface

// Removed unused palettes constant

// Removed unused MedalBase function

// Removed unused CenterText function

// Removed unused RingStar function

// Removed unused PlateGlyph function

// Removed unused LeafGlyph function

// Removed unused CapGlyph function

// Removed unused BallGlyph function

// Removed unused PinGlyph function

// Removed unused renderBadgeGlyph function

export function BadgeIcon({ badge }: BadgeIconProps) {
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
  const imgSrc = `${import.meta.env.BASE_URL}plates/${medal}-medal.png`;
  return (
    <img
      src={imgSrc}
      alt={badge.name}
      className={badge.earned ? "badge-medal-img" : "badge-medal-img badge-medal-img--dimmed"}
      style={{ width: 96, height: 96, objectFit: "contain", display: "block" }}
      draggable={false}
    />
  );
}

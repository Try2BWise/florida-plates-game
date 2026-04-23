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
  // Category completion
  "mixed-bag": "palette.png",
  "full-spectrum": "trophy-new.png",
  // Sports
  "grand-slam": "baseball.png",
  touchdown: "american-football.png",
  "hat-trick": "ice-hockey.png",
  "slam-dunk": "basketball.png",
  goal: "soccer-ball.png",
  "checkered-flag": "chequered-flag.png",
  "sports-fan": "soccer-ball.png",
  "all-teams": "trophy-new.png",
  // Nature / Geography
  "coastal-cruiser": "water-wave.png",
  "farm-fresh": "tractor.png",
  "road-trip": "globe-with-meridians.png",
  escapee: "passport.png",
  "i-get-around": "world-map.png",
  "panhandle-scout": "beach.png",
  "green-light": "leaf-new.png",
  "eco-scout": "paw-prints.png",
  // Service / Public Safety
  "healing-hands": "hospital-new.png",
  "those-who-serve": "shield-new.png",
  "back-the-blue": "police-car-light.png",
  "fire-watch": "fire-engine.png",
  "reporting-for-duty": "shield-new.png",
  "on-call": "shield-new.png",
  "in-service": "shield-new.png",
  "united-front": "handshake.png",
  // Military / Veteran honors
  "all-branches": "star-new.png",
  "air-support": "airplane.png",
  airborne: "parachute.png",
  "bronze-star-honor": "3rd-place-medal.png",
  distinguished: "star-new.png",
  "combat-ready": "shield-new.png",
  "decorated-service": "star-new.png",
  // Education (College Track)
  "first-day-of-school": "school-new.png",
  "campus-tour": "backpack-new.png",
  freshman: "open-book.png",
  sophomore: "books.png",
  junior: "notebook.png",
  senior: "scroll.png",
  "graduation-day": "graduation-cap.png",
  // Florida regions
  "northwest-florida-explorer": "compass-new.png",
  "north-central-florida-explorer": "wheat.png",
  "northeast-florida-explorer": "bridge.png",
  "central-west-florida-explorer": "anchor.png",
  "central-florida-explorer": "compass-new.png",
  "central-east-florida-explorer": "rocket.png",
  "southwest-florida-explorer": "fish.png",
  "southeast-florida-explorer": "cityscape.png",
  "florida-keys-explorer": "desert-island.png",
  "all-around-florida": "all-around-florida.svg",
  // Mississippi regions
  "ms-hills-explorer": "mountain.png",
  "ms-delta-explorer": "tractor.png",
  "ms-capital-river-explorer": "cityscape.png",
  "ms-pines-explorer": "leaf-new.png",
  "ms-coastal-explorer": "water-wave.png",
  "all-around-mississippi": "all-around-mississippi.svg",
  // Arkansas regions
  "ar-ozarks-explorer": "mountain.png",
  "ar-delta-explorer": "tractor.png",
  "ar-capital-explorer": "cityscape.png",
  "ar-river-valley-explorer": "water-wave.png",
  "ar-ouachitas-explorer": "compass-new.png",
  "ar-timberlands-explorer": "leaf-new.png",
  "all-around-arkansas": "all-around-arkansas.svg",
  // Missouri regions
  "mo-northwest-explorer": "wheat.png",
  "mo-northeast-explorer": "tractor.png",
  "mo-central-explorer": "cityscape.png",
  "mo-southwest-explorer": "mountain.png",
  "mo-southeast-explorer": "water-wave.png",
  "all-around-missouri": "all-around-missouri.svg",
  // Tennessee regions
  "tn-east-explorer": "mountain.png",
  "tn-middle-explorer": "microphone.png",
  "tn-west-explorer": "guitar.png",
  "all-around-tennessee": "all-around-tennessee.svg",
  // Kentucky regions
  "ky-bluegrass-explorer": "horse.png",
  "ky-eastern-mountain-explorer": "mountain.png",
  "ky-knobs-explorer": "compass-new.png",
  "ky-pennyrile-explorer": "corn.png",
  "ky-jackson-purchase-explorer": "fish.png",
  "ky-western-coalfields-explorer": "compass-new.png",
  "all-around-kentucky": "all-around-kentucky.svg",
  // Kansas regions
  "ks-northwest-explorer": "wheat.png",
  "ks-northeast-explorer": "cityscape.png",
  "ks-southwest-explorer": "compass-new.png",
  "ks-south-central-explorer": "compass-new.png",
  "ks-southeast-explorer": "corn.png",
  "all-around-kansas": "all-around-kansas.svg",
  // Georgia regions
  "ga-north-georgia-explorer": "mountain.png",
  "ga-metro-atlanta-explorer": "cityscape.png",
  "ga-central-georgia-explorer": "wheat.png",
  "ga-southwest-georgia-explorer": "corn.png",
  "ga-southeast-georgia-explorer": "anchor.png",
  "all-around-georgia": "all-around-georgia.svg",
  // Alabama regions
  "al-north-alabama-explorer": "rocket.png",
  "al-central-alabama-explorer": "cityscape.png",
  "al-west-alabama-explorer": "wheat.png",
  "al-southeast-alabama-explorer": "corn.png",
  "al-gulf-coast-explorer": "water-wave.png",
  "all-around-alabama": "all-around-alabama.svg",
  // Alaska regions
  "ak-southcentral-explorer": "cityscape.png",
  "ak-southeast-explorer": "fish.png",
  "ak-interior-explorer": "mountain.png",
  "ak-southwest-explorer": "anchor.png",
  "ak-arctic-explorer": "snowflake.png",
  "all-around-alaska": "all-around-alaska.svg",
  // Arizona regions
  "az-central-explorer": "cityscape.png",
  "az-southern-explorer": "compass-new.png",
  "az-northern-explorer": "mountain.png",
  "az-western-explorer": "water-wave.png",
  "az-eastern-explorer": "compass-new.png",
  "all-around-arizona": "all-around-arizona.svg",
  // California regions
  "ca-socal-explorer": "beach.png",
  "ca-central-explorer": "wheat.png",
  "ca-bay-area-explorer": "bridge.png",
  "ca-sacramento-explorer": "cityscape.png",
  "ca-far-north-explorer": "mountain.png",
  "all-around-california": "all-around-california.svg",
  // Ohio regions
  "oh-northwest-explorer": "compass-new.png",
  "oh-northeast-explorer": "cityscape.png",
  "oh-central-explorer": "compass-new.png",
  "oh-southwest-explorer": "bridge.png",
  "oh-southeast-explorer": "mountain.png",
  "all-around-ohio": "all-around-ohio.svg",
  // West Virginia regions
  "wv-eastern-panhandle-explorer": "wheat.png",
  "wv-potomac-highlands-explorer": "mountain.png",
  "wv-mountaineer-country-explorer": "compass-new.png",
  "wv-metro-valley-explorer": "cityscape.png",
  "wv-new-river-mountain-lakes-explorer": "water-wave.png",
  "all-around-west-virginia": "all-around-west-virginia.svg",
  // Iowa regions
  "ia-northwest-explorer": "wheat.png",
  "ia-northeast-explorer": "fish.png",
  "ia-central-explorer": "cityscape.png",
  "ia-southwest-explorer": "corn.png",
  "ia-southeast-explorer": "water-wave.png",
  "all-around-iowa": "all-around-iowa.svg",
  // Minnesota regions
  "mn-northwest-explorer": "wheat.png",
  "mn-northeast-explorer": "water-wave.png",
  "mn-central-explorer": "fish.png",
  "mn-metro-explorer": "cityscape.png",
  "mn-southern-explorer": "corn.png",
  "all-around-minnesota": "all-around-minnesota.svg",
  // 50-State Challenge (USA mode)
  "usa-northeast-explorer": "cityscape.png",
  "usa-midwest-explorer": "wheat.png",
  "usa-south-explorer": "peach.png",
  "usa-west-explorer": "mountain.png",
  "usa-pacific-explorer": "water-wave.png",
  "usa-alaska": "polar-bear.png",
  "usa-hawaii": "beach.png",
  "all-around-usa": "all-around-usa.svg",
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

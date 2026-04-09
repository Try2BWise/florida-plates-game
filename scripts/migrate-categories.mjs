/**
 * migrate-categories.mjs
 *
 * One-time idempotent migration: 19 categories → 13 universal categories.
 * Applies bulk renames and per-plate overrides to all state master JSONs.
 *
 * Usage:  node scripts/migrate-categories.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "src", "data");

// ── Bulk 1:1 renames (old → new) ──────────────────────────────────────────
const renameMap = {
  "Civic & Causes": "Civic",
  "Commercial & Fleet": "Commercial",
  "Government & Official": "Government",
  "Health & Family": "Health",
  "Historical & Antique": "Heritage",
  "Military Honors & History": "Military",
  "Military Service": "Military",
  "Motorcycle Plates": "Motorcycle",
  "Nature & Wildlife": "Wildlife & Nature",
  "Professional Sports": "Sports",
  "Public Service": "First Responders",
  "Sports & Recreation": "Sports",
  "Standard Plates": "Standard",
  // Categories that split — default mapping for plates not in overrides
  Accessibility: "Standard",
  "Education & Culture": "Civic",
  "Special Use": "Standard",
  // Unchanged but listed for completeness
  Universities: "Universities",
  Schools: "Schools",
};

// ── Per-plate overrides (plate id → target category) ──────────────────────
// These override the bulk rename for plates that need to land in a different
// category than their old category's default mapping.
const plateOverrides = {
  // Accessibility → Military (disabled veterans)
  // Florida uses bare IDs (no state prefix)
  "disabled-veteran": "Military",
  "disabled-veteran-wheelchair": "Military",
  "paralyzed-veterans-of-america": "Military",
  "ky-disabled-former-prisoner-of-war": "Military",
  "ky-disabled-veteran-fee": "Military",
  "ky-disabled-veteran-no-fee": "Military",
  "ky-disabled-veteran-mc-fee": "Military",
  "ky-disabled-veteran-mc-no-fee": "Military",

  // Accessibility → Standard (non-veteran)
  "disabled-person-wheelchair-suffix": "Standard",
  "ky-disabled-parking": "Standard",

  // Education & Culture → Schools
  "agricultural-education": "Schools",
  "agriculture-keeps-florida-green": "Schools",
  "support-education": "Schools",
  "support-education-legacy": "Schools",
  "ar-arkansas-school-for-the-deaf-license-plate": "Schools",
  "ar-committed-to-education-license-plate-design-1": "Schools",
  "ar-committed-to-education-license-plate-design-2": "Schools",
  "ar-mid-south-community-education-license-plate": "Schools",
  "ar-northwest-arkansas-community-education-plate": "Schools",
  "ky-saint-xavier-high-school": "Schools",
  "tn-agriculture": "Schools",
  "tn-helping-schools": "Schools",

  // Education & Culture → Civic (4-H/FFA, arts, culture, causes)
  "ar-university-of-arkansas-agriculture-4-h-license-plate": "Civic",
  "ar-arkansas-agricultural-education-plate-ffa": "Civic",
  "challenger-columbia": "Civic",
  "hispanic-achievers": "Civic",
  "imagine": "Civic",
  "live-the-dream": "Civic",
  "state-of-the-arts": "Civic",
  "ar-buffalo-river-license-plate": "Civic",
  "ky-friend-of-ky-agriculture": "Civic",
  "tn-tennessee-arts-commission-cool-cat": "Civic",
  "tn-tennessee-arts-commission-rainbow": "Civic",

  // Special Use → Commercial
  "dealer": "Commercial",
  "manufacturer": "Commercial",

  // Special Use → Standard
  "amateur-radio": "Standard",
  "authenticated": "Standard",
  "exempt-series": "Standard",
  "pre-printed-temporary-license-plate": "Standard",
  "press": "Standard",
  "temporary-employment": "Standard",

  // Travel & Tourism → Wildlife & Nature (parks, zoos, nature)
  "explore-our-state-parks": "Wildlife & Nature",
  "mo-great-rivers-state": "Wildlife & Nature",
  "mo-kansas-city-zoo": "Wildlife & Nature",
  "mo-missouri-botanical-garden": "Wildlife & Nature",
  "mo-st-louis-zoo": "Wildlife & Nature",
  "mo-cave-state": "Wildlife & Nature",
  "ms-jackson-zoo": "Wildlife & Nature",
  "ms-mississippi-aquarium": "Wildlife & Nature",
  "tn-friends-of-the-great-smoky-mountains": "Wildlife & Nature",

  // Travel & Tourism → Heritage (landmarks, culture, destinations)
  "horse-country": "Heritage",
  "margaritaville": "Heritage",
  "visit-our-lights": "Heritage",
  "visit-our-lights-legacy": "Heritage",
  "walt-disney-world": "Heritage",
  "walt-disney-world-legacy": "Heritage",
  "mo-gateway-arch": "Heritage",
  "mo-route-66": "Heritage",
  "mo-visit-missouri": "Heritage",
  "ms-dixie-national": "Heritage",
  "ms-gulf-coast-regional-tourism-partnership": "Heritage",
  "ms-mississippi-home-of-the-blues": "Heritage",
  "ms-mississippi-public-broadcasting": "Heritage",
  "ms-tupelo-elvis-presley-fan-club": "Heritage",

  // Travel & Tourism → Civic (cause-oriented)
  "support-scenic-walton": "Civic",
  "mo-friends-of-arrow-rock": "Civic",
  "mo-missouri-travel-council": "Heritage",

  // Military → Civic (org membership, not verified service)
  "american-legion": "Civic",
  "support-our-troops": "Civic",
  "ms-american-legion": "Civic",
  "ms-civil-air-patrol": "Civic",
  "ms-veterans-of-foreign-wars": "Civic",
  "mo-civil-air-patrol": "Civic",
  "mo-the-american-legion": "Civic",
  "mo-veterans-of-foreign-wars": "Civic",
  "tn-sons-of-confederate-veterans": "Civic",
  "ky-civil-air-patrol": "Civic",

  // Sports → Civic (community orgs, not pro teams)
  "ms-gulfport-police-athletic-league": "Civic",
  "ms-ocean-springs-athletic-foundation": "Civic",
  "ms-vancleave-home-run-club": "Civic",
  "ms-youth-soccer-association": "Civic",

  // Sports → Wildlife & Nature (parks)
  "ar-arkansas-state-parks": "Wildlife & Nature",

  // Professional Sports miscategorized → correct category
  "ky-cardinal": "Wildlife & Nature",
  "ky-horse-council": "Civic",
  "ky-louisville-zoo": "Wildlife & Nature",
  "tn-sportsman-wildlife-foundation": "Wildlife & Nature",
  "ms-new-orleans-saints-football": "Sports",
};

// ── Valid target categories (the new 13) ──────────────────────────────────
const validCategories = new Set([
  "Civic",
  "Commercial",
  "First Responders",
  "Government",
  "Health",
  "Heritage",
  "Military",
  "Motorcycle",
  "Schools",
  "Sports",
  "Standard",
  "Universities",
  "Wildlife & Nature",
]);

// ── State files ───────────────────────────────────────────────────────────
const stateFiles = [
  "florida-plate-master.json",
  "mississippi-plate-master.json",
  "arkansas-plate-master.json",
  "missouri-plate-master.json",
  "tennessee-plate-master.json",
  "kentucky-plate-master.json",
];

// ── Main ──────────────────────────────────────────────────────────────────
let totalChanged = 0;
let totalSkipped = 0;
let totalAlreadyNew = 0;

for (const file of stateFiles) {
  const filePath = join(dataDir, file);
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const stateName = file.replace("-plate-master.json", "").toUpperCase();

  const changes = [];
  let changed = 0;
  let skipped = 0;
  let alreadyNew = 0;

  for (const plate of data.plates) {
    const oldCat = plate.category;

    // Already in the new taxonomy?
    if (validCategories.has(oldCat)) {
      // Check if this plate has an override that differs from its current category
      if (plateOverrides[plate.id] && plateOverrides[plate.id] !== oldCat) {
        const newCat = plateOverrides[plate.id];
        plate.category = newCat;
        changes.push(`  OVERRIDE  ${plate.id}: ${oldCat} → ${newCat}`);
        changed++;
      } else {
        alreadyNew++;
      }
      continue;
    }

    // Per-plate override takes priority
    if (plateOverrides[plate.id]) {
      const newCat = plateOverrides[plate.id];
      plate.category = newCat;
      changes.push(`  OVERRIDE  ${plate.id}: ${oldCat} → ${newCat}`);
      changed++;
      continue;
    }

    // Bulk rename
    if (renameMap[oldCat]) {
      const newCat = renameMap[oldCat];
      plate.category = newCat;
      changes.push(`  RENAME    ${plate.id}: ${oldCat} → ${newCat}`);
      changed++;
      continue;
    }

    // Unknown category — flag it
    changes.push(`  UNKNOWN   ${plate.id}: "${oldCat}" has no mapping!`);
    skipped++;
  }

  // Write back
  if (changed > 0) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }

  // Report
  console.log(`\n${stateName} (${file})`);
  console.log(`  ${data.plates.length} plates total`);
  console.log(`  ${changed} changed, ${alreadyNew} already migrated, ${skipped} unknown`);
  if (changes.length > 0) {
    for (const line of changes) {
      console.log(line);
    }
  }

  totalChanged += changed;
  totalSkipped += skipped;
  totalAlreadyNew += alreadyNew;
}

console.log(`\n${"─".repeat(60)}`);
console.log(`TOTAL: ${totalChanged} changed, ${totalAlreadyNew} already migrated, ${totalSkipped} unknown`);

if (totalSkipped > 0) {
  console.log(`\n⚠  ${totalSkipped} plates had unknown categories — review manually.`);
  process.exit(1);
}

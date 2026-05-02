// One-shot importer: IN BMV plate scrape → src/data/indiana-plate-master.json
//
// Reads IN/in_plates_output/plates.json (produced by scrape_in_plates.py),
// applies category mapping with keyword overrides, copies images into
// public/state-packs/indiana/plates/<sc-prefix>.<ext>, and writes the master.

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve, extname } from "node:path";

const SCRAPE_PATH = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\IN\\in_plates_output\\plates.json";
const SCRAPE_IMAGES = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\IN\\in_plates_output\\images";
const MASTER_PATH = resolve("src/data/indiana-plate-master.json");
const PLATE_IMG_DIR = resolve("public/state-packs/indiana/plates");

mkdirSync(PLATE_IMG_DIR, { recursive: true });

const scrape = JSON.parse(readFileSync(SCRAPE_PATH, "utf8"));

// ---- Category mapping ----------------------------------------------------

const KEYWORDS = {
  Health: [
    "cancer", "alzheimer", "diabetes", "autism", "suicide", "donate life",
    "down syndrome", "ovarian", "breakthrough t1d", "kids first",
    "riley hospital", "peyton manning", "st vincent", "milk bank",
    "respiratory care", "nursing leadership", "ems", "emergency medical",
    "health foundation", "meals on wheels", "shrine", "shriners",
    "little red door"
  ],
  "First Responders": [
    "fraternal order of police", "police memorial", "sheriff",
    "volunteer firefighter", "professional firefighter", "first responders",
    "patriot guard", "chiefs of police"
  ],
  "Wildlife & Nature": [
    "ducks unlimited", "wild turkey", "pollinator", "greenways",
    "environmental", "bicycle coalition", "zoological", "pet friendly",
    "audubon"
  ],
  Sports: [
    "colts", "pacers", "fever", "indiana soccer", "golf foundation",
    "motor speedway", "raceway", "indianapolis 500", "indy 500"
  ],
  Schools: [
    "ffa", "future farmers", "4-h", "boys and girls club",
    "music education", "ista", "department of education", "scholarship fund",
    "iuoe local 150"
  ],
  Heritage: [
    "lewis and clark", "lincoln", "boyhood home", "native american",
    "semiquincentennial", "historic", "in god we trust", "black expo"
  ],
  Commercial: [
    "fleet vehicle", "special machinery", "motor truck association",
    "trailer", "semi-tractor", "semi-trailer", "bus ", " bus", "truck ",
    " truck", "mini truck", " rv", "farm vehicle", "coal mining",
    "linemen", "iuoe", "realtors"
  ]
};

// Per-slug overrides. Win over keyword logic.
const EXPLICIT_OVERRIDES = {
  "standard-passenger": "Standard",
  "amateur-radio": "Civic",
  "blackout": "Civic",
  "disability": "Civic",
  "disability-blackout": "Civic",
  "rv": "Commercial",
  "historic": "Heritage",
  "in-god-we-trust": "Heritage",
  "farm": "Commercial",
  "bus": "Commercial",
  "truck": "Commercial",
  "mini-truck": "Commercial",
  "semi-tractor": "Commercial",
  "semi-trailer-permanent": "Commercial",
  "general-trailer": "Commercial",
  "permanent-trailer-3-000lb": "Commercial",
  "fleet-vehicle": "Commercial",
  "special-machinery": "Commercial",
  // Greek alumni orgs → Civic (matches MO convention)
  "alpha-kappa-alpha-sorority-inc": "Civic",
  "alpha-phi-alpha-fraternity": "Civic",
  "delta-research-and-educational-foundation": "Civic",
  // Edge cases
  "indiana-coal-mining-institute": "Commercial",
  "indiana-motor-truck-association": "Commercial",
  "iuoe-local-150-scholarship-fund-inc": "Schools",
  "indiana-association-of-realtors-inc": "Commercial",
  "indiana-state-council-knights-of-columbus-charity-fund-inc": "Civic",
  "indiana-shrine-association": "Health",
  "national-rifle-association": "Civic",
  "freemason": "Civic",
  "ancient-free-masons": "Civic",
  "lions-of-indiana": "Civic",
  "teamsters": "Commercial",
  "national-sisterhood-united-for-journeymen-linemen": "Commercial",
  // Veterans-themed orgs that DMV tags as Organization but belong in Military
  "american-legion": "Military",
  "american-legion-auxiliary": "Military",
  "pow-mia": "Military",
  "marine-foundation-of-indiana": "Military",
  // Cross-category corrections
  "special-olympics": "Sports",
  "a-kid-again-inc": "Health",
  // Missing-image plates we choose to drop (no art available from BMV)
  "down-syndrome-indiana": "DROP",
  "wfyi-public-media": "DROP",
  "hoosier-space-force-veteran": "DROP",
  "disabled-hoosier-space-force-veteran": "DROP"
};

function pickCategory(plate) {
  const slug = plate.slug;
  if (EXPLICIT_OVERRIDES[slug]) return EXPLICIT_OVERRIDES[slug];

  const dmvCat = plate.category_dmv;
  const haystack = ` ${plate.name.toLowerCase()} `;

  const hasKw = (kws) => kws.some(kw => haystack.includes(kw));

  // Highest priority: DMV-tagged Military stays Military.
  if (dmvCat === "Military") return "Military";

  // College → Universities (clean).
  if (dmvCat === "College") return "Universities";

  // Other → Commercial (Fleet Vehicle, Special Machinery).
  if (dmvCat === "Other") return "Commercial";

  // Standard handled via explicit overrides above; if it falls through, Civic.
  if (dmvCat === "Standard") return "Civic";

  // Organization — keyword routing.
  if (hasKw(KEYWORDS["First Responders"])) return "First Responders";
  if (hasKw(KEYWORDS.Health)) return "Health";
  if (hasKw(KEYWORDS["Wildlife & Nature"])) return "Wildlife & Nature";
  if (hasKw(KEYWORDS.Sports)) return "Sports";
  if (hasKw(KEYWORDS.Schools)) return "Schools";
  if (hasKw(KEYWORDS.Heritage)) return "Heritage";
  if (hasKw(KEYWORDS.Commercial)) return "Commercial";

  return "Civic";
}

// ---- Build master entries -----------------------------------------------

const masterPlates = [];
let droppedMissingImage = 0;

for (const p of scrape) {
  const category = pickCategory(p);
  if (category === "DROP") {
    droppedMissingImage += 1;
    continue;
  }

  const ext = extname(p.image_filename).toLowerCase() || ".jpg";
  const targetImageName = `in-${p.slug}${ext}`;
  const targetImagePath = `${PLATE_IMG_DIR}/${targetImageName}`;
  const sourceImagePath = `${SCRAPE_IMAGES}/${p.slug}${ext}`;

  if (existsSync(sourceImagePath)) {
    copyFileSync(sourceImagePath, targetImagePath);
  } else {
    console.warn(`Missing source image for ${p.slug}: ${sourceImagePath}`);
  }

  // plateType convention: motorcycles get plateType=motorcycle, but IN's
  // motorcycle plates are filtered out upstream so everything here is
  // passenger.
  masterPlates.push({
    id: `in-${p.slug}`,
    slug: p.slug,
    name: p.name,
    displayName: p.name,
    baseName: p.name,
    variantLabel: null,
    plateType: "passenger",
    isCurrent: true,
    isActive: true,
    category,
    image: {
      path: `state-packs/indiana/plates/${targetImageName}`,
      remoteUrl: p.image_url
    },
    sponsor: null,
    notes: p.contact_info || null,
    searchTerms: [],
    variantOf: null,
    relatedPlates: [],
    metadataBlob: {
      sourceCategories: [p.category_dmv],
      groupFee: p.group_fees || null,
      adminFee: p.admin_fees || null,
      personalizationFee: p.personalization_fees || null,
      renewOnline: p.renew_online === "Yes"
    },
    sourceRefs: [
      {
        source: "Indiana BMV",
        sourceId: p.scrape_id,
        versionId: null
      }
    ]
  });
}

masterPlates.sort((a, b) => a.name.localeCompare(b.name));

const master = {
  schemaVersion: 2,
  state: "Indiana",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "Indiana license plates sourced from the Indiana Bureau of Motor Vehicles plate gallery CSV.",
  sourceFiles: [
    "https://www.in.gov/bmv/registration-plates/license-plates-overview/_plates-data.csv"
  ],
  plates: masterPlates
};

writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2) + "\n");

// ---- Report --------------------------------------------------------------
const catCounts = {};
for (const p of masterPlates) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}
console.log(`Wrote ${MASTER_PATH} (${masterPlates.length} plates)`);
if (droppedMissingImage > 0) {
  console.log(`Dropped ${droppedMissingImage} plates with missing/404 source images.`);
}
console.log("\nCategory breakdown:");
for (const [cat, n] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat.padEnd(20)} ${n}`);
}

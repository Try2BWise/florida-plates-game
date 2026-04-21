/**
 * Ohio plate import script — one-shot helper for v1.9 Phase B import.
 *
 * Reads the scraped Ohio plate catalog from
 *   C:\Users\bwise\OneDrive\Gorilla Grin\OH\oh_plates_output\oh_plates.json
 * and its images/ sibling directory, then:
 *
 *  1. Maps each scraped category to our app's PlateCategory taxonomy
 *     (default per scraped category + keyword-based overrides for the
 *     big "Organizational Plates" bucket).
 *  2. Generates a slug-based id (`oh-<slug>`).
 *  3. Copies each image from the scrape dir to
 *     public/state-packs/ohio/plates/<slug>.<ext> under its new name.
 *  4. Builds the master plate entry and appends to the plates array.
 *  5. Writes src/data/ohio-plate-master.json with schemaVersion 2.
 *
 * Run once with:   node scripts/importOhMaster.mjs
 * Then regenerate the driver:  npm run generate:plate-driver
 *   (package.json already lists ohio in that script).
 *
 * Review the output master JSON for category mistakes before committing.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const SCRAPE_DIR = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\OH\\oh_plates_output";
const SCRAPE_JSON = join(SCRAPE_DIR, "oh_plates.json");
const SCRAPE_IMAGES = join(SCRAPE_DIR, "images");
const OUT_PLATES_DIR = join(repoRoot, "public", "state-packs", "ohio", "plates");
const OUT_MASTER = join(repoRoot, "src", "data", "ohio-plate-master.json");

mkdirSync(OUT_PLATES_DIR, { recursive: true });

/**
 * Slugify a plate name for use in file paths and IDs.
 * Lowercase, replace non-alphanumerics with hyphens, collapse runs,
 * trim leading/trailing hyphens. Preserves numerics (e.g., "4-H" → "4-h").
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Known Ohio sports teams — mapping trigger. */
const OH_SPORTS_TEAMS = [
  "browns", "bengals", "cavaliers", "cavs", "indians", "guardians",
  "reds", "blue jackets", "bluejackets", "crew", "fc cincinnati",
  "columbus clippers", "canton bulldogs", "nascar",
  "football hof", "baseball-all", "rock roll hof",
  "little brown jug"
];

/** Known fraternity / sorority patterns — mapping trigger for Schools. */
const OH_GREEK_ORGS = [
  "alpha kappa alpha", "alpha phi alpha", "delta sigma theta",
  "kappa alpha psi", "omega psi phi", "sigma gamma rho",
  "phi theta kappa", "zeta phi beta", "iota phi theta"
];

/**
 * Keyword triggers → target category. Applied in order; first match wins.
 * Specific overrides are listed BEFORE broader rules so narrower cases
 * (e.g., "habitat for humanity" as Civic) beat the generic "habitat" →
 * Wildlife rule.
 */
const OH_KEYWORD_RULES = [
  // ── Specific-name overrides (beat broader keyword rules below) ──
  { keywords: ["habitat for humanity"], category: "Civic" },
  { keywords: ["ronald mcdonald house"], category: "Health" },
  { keywords: ["red cross"], category: "Health" },
  { keywords: ["career center"], category: "Schools" },
  { keywords: ["fallen lineworker", "fallenlinemen"], category: "Civic" },
  { keywords: ["share the road"], category: "Civic" },

  // ── Schools — Greek orgs and school-district plates ──
  { keywords: OH_GREEK_ORGS, category: "Schools" },
  { keywords: ["high school", "schools", "academy", "preparatory", "hudson-schools", "dublin-city", "cuyahoga-heights", "north-royalton", "stow-munroe", "twinsburg", "solon schools", "padua-franciscan", "walsh-jesuit", "elder", "university-schools", "revere-local"], category: "Schools" },

  // ── Universities (rare in Organizational, usually in Collegiate) ──
  { keywords: ["notre dame", "west-virginia-university"], category: "Universities" },

  // ── Health ──
  { keywords: ["cancer", "als awareness", "autism", "diabetes", "suicide prevention", "heart", "disability", "awareness", "donate life", "hospital", "childrens", "brain tumor", "pediatric", "respiratory", "nurses", "physician", "juvenile diabetes", "conquercancer", "bottoms up diaper"], category: "Health" },

  // ── First Responders ──
  { keywords: ["fire", "ems", "police", "sheriff", "ambulance", "ambulette", "paramedic", "fop", "cops", "firefighter", "chiefs of police"], category: "First Responders" },

  // ── Military ──
  { keywords: ["army", "navy", "marine", "air force", "coast guard", "veteran", "vfw", "legion", "pow", "mia", "paratroopers", "airborne", "combat", "military sacrifice", "support troops", "honor our fallen", "gold star", "folds of honor", "save a warrior", "dav ", "civil air patrol", "military", "voiture", "gsf vietnam"], category: "Military" },

  // ── Wildlife & Nature ──
  { keywords: ["wildlife", "nature", "conservation", "habitat", "preserve", "zoo", "ducks unlimited", "bald eagle", "bullfrog", "honey bee", "monarch butterfly", "cat friendly", "dog friendly", "cat lovers", "rabbit rescue", "paws", "odnr deer", "odnr smallmouth", "odnr turkey", "bird sanctuary", "state parks", "scenic rivers", "cuyahoga valley", "lake erie", "smokey bear", "trees", "keep ohio beautiful", "pets"], category: "Wildlife & Nature" },

  // ── Sports (pro teams + sports orgs) ──
  { keywords: OH_SPORTS_TEAMS, category: "Sports" },
  { keywords: ["buckeyecorvette", "corvette", "streetrod", "collector", "commodore"], category: "Heritage" },

  // ── Heritage / historical ──
  { keywords: ["heritage", "historical", "historic", "bicentennial", "colonial", "commemorative", "replica", "perrys monument", "perrys_monument", "fallentimbers", "stanhywet", "statehouse", "medina_county_history"], category: "Heritage" },

  // ── Civic (specific overrides) ──
  { keywords: ["one_nation_god", "in god we trust"], category: "Civic" }
];

/**
 * Override map for the Gratis bucket — these are free-issued plates but
 * most of them honor veteran or responder status, not government service.
 */
const OH_GRATIS_OVERRIDES = [
  { keywords: ["prisoner of war", "pow"], category: "Military" },
  { keywords: ["disabled veteran"], category: "Military" },
  { keywords: ["volunteer rescue", "vol rescue"], category: "First Responders" },
  { keywords: ["civil air patrol", "cap"], category: "Military" }
];

/**
 * Map a scraped plate to the app's PlateCategory taxonomy.
 */
function mapCategory(plate) {
  const scrapedCat = plate.category;
  const name = (plate.name + " " + (plate.plate_id || "")).toLowerCase();

  // Direct scraped-category mappings
  if (scrapedCat === "Collegiate Plates") return "Universities";
  if (scrapedCat === "Professional Sports Teams Plates") return "Sports";
  if (scrapedCat === "Historical/Replica Plates") return "Heritage";
  if (scrapedCat === "Gratis") {
    // Apply Gratis-specific overrides (POW, disabled vet, etc. → Military)
    for (const rule of OH_GRATIS_OVERRIDES) {
      if (rule.keywords.some((k) => name.includes(k))) return rule.category;
    }
    return "Government";
  }
  if (scrapedCat === "Accessible Plates/Removable Windshield Placards") return "Civic";
  if (scrapedCat === "Company Logo Plates") return "Commercial";

  // Organizational Plates — apply keyword overrides
  if (scrapedCat === "Organizational Plates") {
    for (const rule of OH_KEYWORD_RULES) {
      if (rule.keywords.some((k) => name.includes(k))) {
        return rule.category;
      }
    }
    return "Civic"; // default for everything else in Organizational
  }

  // Unknown scraped category — default to Civic, flag for review
  console.warn(`UNKNOWN SCRAPED CATEGORY: ${scrapedCat} (${plate.name})`);
  return "Civic";
}

function buildSearchTerms(name, category) {
  const terms = new Set();
  const normalized = name.toLowerCase();

  // Individual words from name (excluding common stopwords and short junk)
  const stopwords = new Set(["the", "of", "and", "an", "a", "to", "for", "in", "on", "at", "by", "or", "with"]);
  for (const word of normalized.split(/[^a-z0-9]+/).filter(Boolean)) {
    if (word.length >= 3 && !stopwords.has(word)) {
      terms.add(word);
    }
  }

  // Category as a search term (lowercased)
  terms.add(category.toLowerCase());
  return Array.from(terms);
}

// ── Main ────────────────────────────────────────────────────────────

const scraped = JSON.parse(readFileSync(SCRAPE_JSON, "utf8"));
console.log(`Read ${scraped.length} plates from ${SCRAPE_JSON}`);

const plates = [];
const slugSeen = new Set();
const categoryCount = {};
let imagesCopied = 0;
let imagesMissing = 0;

for (const raw of scraped) {
  // Clean up the scraped name (e.g., "ALS Awareness<" → "ALS Awareness")
  const cleanName = raw.name.replace(/[<>]/g, "").trim();

  let slug = slugify(cleanName);
  // Disambiguate duplicate slugs by appending the scraped plate_id tail
  if (slugSeen.has(slug)) {
    const tail = raw.plate_id.replace(/^.*?([a-z0-9-]+)$/i, "$1");
    slug = `${slug}-${tail}`.replace(/-+/g, "-");
  }
  slugSeen.add(slug);

  const id = `oh-${slug}`;
  const category = mapCategory({ ...raw, name: cleanName });
  categoryCount[category] = (categoryCount[category] || 0) + 1;

  // Copy image from scrape dir to state-pack dir with the new slug name
  const sourceImg = raw.local_image
    ? join(SCRAPE_DIR, raw.local_image)
    : null;
  const ext = sourceImg ? extname(sourceImg).toLowerCase() : ".jpg";
  const destImg = join(OUT_PLATES_DIR, `oh-${slug}${ext}`);
  const imagePath = `state-packs/ohio/plates/oh-${slug}${ext}`;

  try {
    if (sourceImg) {
      copyFileSync(sourceImg, destImg);
      imagesCopied++;
    } else {
      imagesMissing++;
    }
  } catch (err) {
    console.warn(`  image copy failed for ${cleanName}: ${err.message}`);
    imagesMissing++;
  }

  plates.push({
    id,
    slug,
    name: cleanName,
    displayName: cleanName,
    baseName: cleanName,
    variantLabel: null,
    plateType: "passenger",
    isCurrent: true,
    isActive: true,
    category,
    image: {
      path: imagePath,
      remoteUrl: raw.large_image_url ?? null
    },
    sponsor: null,
    notes: null,
    searchTerms: buildSearchTerms(cleanName, category),
    variantOf: null,
    relatedPlates: [],
    metadataBlob: {
      sourceCategories: [raw.category]
    },
    sourceRefs: [{
      source: "Ohio BMV",
      sourceId: raw.plate_id,
      versionId: null
    }]
  });
}

// Sort plates alphabetically by name within each category for clean diffs
plates.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

const master = {
  schemaVersion: 2,
  state: "Ohio",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "Ohio license plates sourced from the Ohio Bureau of Motor Vehicles.",
  sourceFiles: [
    "https://www.bmv.ohio.gov/vr-sp-geninfo.aspx"
  ],
  plates
};

writeFileSync(OUT_MASTER, JSON.stringify(master, null, 2) + "\n");

console.log("");
console.log("=== OH Import Summary ===");
console.log(`Plates imported: ${plates.length}`);
console.log(`Images copied: ${imagesCopied}`);
console.log(`Images missing: ${imagesMissing}`);
console.log("Category distribution:");
for (const [cat, n] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`);
}
console.log(`Master written: ${OUT_MASTER}`);
console.log(`Next: npm run generate:plate-driver ohio`);

/**
 * West Virginia plate import script — one-shot helper for v1.9 Phase B.
 *
 * Source: C:\Users\bwise\OneDrive\Gorilla Grin\WV\wv_plates_output\
 *   wv_plates_full.json + images/
 *
 * Run once:   node scripts/importWvMaster.mjs
 * Then:       npm run generate:plate-driver
 */

import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const SCRAPE_DIR = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\WV\\wv_plates_output";
const SCRAPE_JSON = join(SCRAPE_DIR, "wv_plates_full.json");
const SCRAPE_IMAGES = join(SCRAPE_DIR, "images");
const OUT_PLATES_DIR = join(repoRoot, "public", "state-packs", "west-virginia", "plates");
const OUT_MASTER = join(repoRoot, "src", "data", "west-virginia-plate-master.json");

mkdirSync(OUT_PLATES_DIR, { recursive: true });

// Build a lookup of files actually present in the scrape dir for fallback.
// Two plates (IDs 2 and 112) had broken full-size URLs; their local_image
// is null in the JSON, but the scraper saved the thumbnail with the usual
// `NNN_Name.jpg` pattern. We look those up by zero-padded plate_id prefix.
const scrapeFiles = readdirSync(SCRAPE_IMAGES);
function findFallbackImage(plateId) {
  const padded3 = String(plateId).padStart(3, "0");
  const padded2 = String(plateId).padStart(2, "0");
  return scrapeFiles.find((f) =>
    f.startsWith(`${padded3}_`) || f.startsWith(`${padded2}_`) || f.startsWith(`${plateId}_`)
  );
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** WV-specific keyword rules for the "Associations and Organizations" and
 * "General Interest" buckets. Specific overrides first. */
const WV_KEYWORD_RULES = [
  // ── Specific-name overrides ──
  { keywords: ["in god we trust"], category: "Civic" },
  { keywords: ["character education"], category: "Schools" },

  // ── Greek orgs + schools ──
  { keywords: ["alpha kappa alpha", "alpha phi alpha", "delta sigma theta", "kappa alpha psi", "omega psi phi", "sigma gamma rho"], category: "Schools" },
  { keywords: ["educator", "pupil transportation"], category: "Schools" },

  // ── Health ──
  { keywords: ["cancer", "awareness", "organ donor", "hospital", "childrens", "children's", "cure childhood", "mobility impaired", "disabled", "chiropractic"], category: "Health" },

  // ── First Responders ──
  { keywords: ["fire fighter", "firefighter", "emergency medical", "ems", "deputy sheriff", "certified firefighter", "professional firefighter", "volunteer firefighter", "911", "9-1-1"], category: "First Responders" },

  // ── Wildlife & Nature ──
  { keywords: ["wildlife", "nature", "conservation", "deer", "brook trout", "bluebird", "eastern elk", "box turtle", "protect pollinators", "whitewater rafting"], category: "Wildlife & Nature" },

  // ── Military ──
  { keywords: ["military", "back the blue"], category: "Military" },

  // ── Heritage ──
  { keywords: ["antique vehicle", "classic car", "9-11 commemorative", "9/11"], category: "Heritage" },

  // ── Sports / Recreation ──
  { keywords: ["bowlers", "square and round dance"], category: "Sports" },

  // ── Civic (fraternal orgs and general interest) ──
  { keywords: ["lions", "rotary", "masons", "a.f. & a.m", "a.f. a.m", "p.h.a", "shriner", "elks", "knights of columbus", "contractors association", "coal", "gas", "oil", "realtors", "league of postmasters", "friends of coal", "back the blue wounded"], category: "Civic" }
];

/**
 * Map a WV scraped plate to the app's PlateCategory taxonomy.
 */
function mapCategory(plate) {
  const scrapedCat = plate.category;
  const name = plate.name.toLowerCase();

  if (scrapedCat === "Colleges and Universities") return "Universities";
  if (scrapedCat === "Military") return "Military";

  // Apply keyword overrides for Associations and General Interest
  if (scrapedCat === "Associations and Organizations" || scrapedCat === "General Interest") {
    for (const rule of WV_KEYWORD_RULES) {
      if (rule.keywords.some((k) => name.includes(k))) {
        return rule.category;
      }
    }
    // Defaults
    if (scrapedCat === "General Interest") return "Heritage";
    return "Civic";
  }

  console.warn(`UNKNOWN SCRAPED CATEGORY: ${scrapedCat} (${plate.name})`);
  return "Civic";
}

function buildSearchTerms(name, category) {
  const terms = new Set();
  const normalized = name.toLowerCase();
  const stopwords = new Set(["the", "of", "and", "an", "a", "to", "for", "in", "on", "at", "by", "or", "with", "wv"]);
  for (const word of normalized.split(/[^a-z0-9]+/).filter(Boolean)) {
    if (word.length >= 3 && !stopwords.has(word)) {
      terms.add(word);
    }
  }
  terms.add(category.toLowerCase());
  return Array.from(terms);
}

// ── Main ────────────────────────────────────────────────────────────

const scraped = JSON.parse(readFileSync(SCRAPE_JSON, "utf8"));
console.log(`Read ${scraped.length} plates from ${SCRAPE_JSON}`);

const plates = [];
const slugSeen = new Set();
const categoryCount = {};
const imageSizes = [];
let imagesCopied = 0;
let imagesMissing = 0;

for (const raw of scraped) {
  const cleanName = raw.name.replace(/[<>]/g, "").trim();

  let slug = slugify(cleanName);
  if (slugSeen.has(slug)) {
    slug = `${slug}-${raw.plate_id}`;
  }
  slugSeen.add(slug);

  const id = `wv-${slug}`;
  const category = mapCategory({ ...raw, name: cleanName });
  categoryCount[category] = (categoryCount[category] || 0) + 1;

  // Resolve source image — prefer local_image, fall back to the raw-named
  // file in the scrape dir (handles plates with broken full-size URLs
  // where the scraper saved only a thumbnail).
  let sourceImg = null;
  let isFallback = false;
  if (raw.local_image) {
    sourceImg = join(SCRAPE_DIR, raw.local_image);
  } else {
    const fallback = findFallbackImage(raw.plate_id);
    if (fallback) {
      sourceImg = join(SCRAPE_IMAGES, fallback);
      isFallback = true;
    }
  }
  let ext = sourceImg ? extname(sourceImg).toLowerCase() : ".jpg";
  // Normalize .jpeg → .jpg in the destination filename
  const destExt = ext === ".jpeg" ? ".jpg" : ext;
  const destImg = join(OUT_PLATES_DIR, `wv-${slug}${destExt}`);
  const imagePath = `state-packs/west-virginia/plates/wv-${slug}${destExt}`;

  try {
    if (sourceImg) {
      copyFileSync(sourceImg, destImg);
      imagesCopied++;
      if (isFallback) {
        console.log(`  thumbnail-fallback used for ${cleanName} (plate ${raw.plate_id})`);
      }
      // Track size for broken-image detection
      const st = statSync(destImg);
      imageSizes.push({ size: st.size, name: cleanName, slug });
    } else {
      console.warn(`  NO IMAGE for ${cleanName} (plate ${raw.plate_id})`);
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
      source: "West Virginia DMV",
      sourceId: String(raw.plate_id),
      versionId: null
    }]
  });
}

// Sort plates alphabetically within category
plates.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

const master = {
  schemaVersion: 2,
  state: "West Virginia",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "West Virginia license plates sourced from the West Virginia Division of Motor Vehicles.",
  sourceFiles: [
    "https://transportation.wv.gov/DMV/Vehicle-Services/License-Plates/Special-Plates/"
  ],
  plates
};

writeFileSync(OUT_MASTER, JSON.stringify(master, null, 2) + "\n");

console.log("");
console.log("=== WV Import Summary ===");
console.log(`Plates imported: ${plates.length}`);
console.log(`Images copied: ${imagesCopied}`);
console.log(`Images missing: ${imagesMissing}`);

// Flag the 2 broken-image plates by size outliers
imageSizes.sort((a, b) => a.size - b.size);
const smallest = imageSizes.slice(0, 4);
console.log("\nSmallest 4 images (flag for broken-scrape inspection):");
for (const { size, name, slug } of smallest) {
  console.log(`  ${(size / 1024).toFixed(1)} KB  wv-${slug}  (${name})`);
}

console.log("\nCategory distribution:");
for (const [cat, n] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`);
}
console.log(`Master written: ${OUT_MASTER}`);
console.log(`Next: npm run generate:plate-driver west-virginia`);

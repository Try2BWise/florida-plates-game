/**
 * Iowa plate import script — v1.9 Phase B.
 *
 * Source: C:\Users\bwise\OneDrive\Gorilla Grin\IA\ia_plates_output\
 *   ia_plates.json + images/
 *
 * Iowa DOT's index page groups plates into 4 buckets:
 *   - Personalized and Specialty Plates
 *   - Natural Resources Plates
 *   - College and University Plates
 *   - Military Service Plates
 *
 * The scrape drops a "Plate" suffix on most names, so we strip that.
 *
 * Run once: node scripts/importIaMaster.mjs
 * Then:     npm run generate:plate-driver iowa
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const SCRAPE_DIR = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\IA\\ia_plates_output";
const SCRAPE_JSON = join(SCRAPE_DIR, "ia_plates.json");
const OUT_PLATES_DIR = join(repoRoot, "public", "state-packs", "iowa", "plates");
const OUT_MASTER = join(repoRoot, "src", "data", "iowa-plate-master.json");

mkdirSync(OUT_PLATES_DIR, { recursive: true });

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Clean up scraped plate names:
 *  - strip trailing "Plate" / "plate" suffix (Iowa consistently appends it)
 *  - replace bad-encoded characters (e.g. "�" for em-dash) with " - "
 *  - collapse extra whitespace
 */
function cleanName(raw) {
  let s = raw.replace(/\uFFFD/g, "-");           // replacement char
  s = s.replace(/\s*[-—–]\s*/g, " - ");          // normalize dashes
  s = s.replace(/\s+plate\s*$/i, "");            // strip trailing "Plate"
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Iowa-specific keyword rules for the personalized/specialty bucket. */
const IA_KEYWORD_RULES = [
  // ── Named overrides ──
  { keywords: ["share the road"], category: "Civic" },
  { keywords: ["decal"], category: "Civic" },

  // ── Wildlife & Nature ──
  { keywords: ["ducks unlimited", "wildlife", "conservation"], category: "Wildlife & Nature" },

  // ── Health ──
  { keywords: ["cancer", "awareness", "organ", "tissue donor", "love our kids", "disabilities", "disability"], category: "Health" },

  // ── First Responders (police / fire / EMS) ──
  { keywords: ["ems", "emergency medical", "firefighter", "fallen peace officer", "police", "sheriff"], category: "First Responders" },

  // ── Schools (Iowa Ag Lit/FFA/4-H + motorcycle rider training) ──
  { keywords: ["ag literacy", "ffa", "rider education"], category: "Schools" },

  // ── Heritage ──
  { keywords: ["iowa heritage", "heritage", "historical", "historic"], category: "Heritage" },

  // ── Commercial (industry associations) ──
  { keywords: ["cattlemen"], category: "Commercial" },

  // ── Civic / fraternal ──
  { keywords: ["shriners", "fly our colors", "god bless", "choose life"], category: "Civic" },
];

function mapCategory(plate) {
  const scrapedCat = plate.category;
  const name = (plate.name + " " + (plate.slug_source || "")).toLowerCase();

  // Direct mappings by scraped bucket
  if (scrapedCat === "College and University Plates") return "Universities";
  if (scrapedCat === "Natural Resources Plates") return "Wildlife & Nature";
  if (scrapedCat === "Military Service Plates") return "Military";

  // Personalized and Specialty — use keyword rules
  if (scrapedCat === "Personalized and Specialty Plates") {
    for (const rule of IA_KEYWORD_RULES) {
      if (rule.keywords.some((k) => name.includes(k))) {
        return rule.category;
      }
    }
    return "Civic";
  }

  console.warn(`UNKNOWN SCRAPED CATEGORY: ${scrapedCat} (${plate.name})`);
  return "Civic";
}

function buildSearchTerms(name, category) {
  const terms = new Set();
  const normalized = name.toLowerCase();
  const stopwords = new Set(["the", "of", "and", "an", "a", "to", "for", "in", "on", "at", "by", "or", "with", "iowa", "plate"]);
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
let imagesCopied = 0;
let imagesMissing = 0;

for (const raw of scraped) {
  const name = cleanName(raw.name || raw.alt_text || raw.slug_source);

  let slug = slugify(name);
  if (slugSeen.has(slug)) {
    slug = `${slug}-${raw.slug_source || plates.length}`;
  }
  slugSeen.add(slug);

  const category = mapCategory({ ...raw, name });
  categoryCount[category] = (categoryCount[category] || 0) + 1;

  const sourceImg = raw.local_image
    ? join(SCRAPE_DIR, raw.local_image)
    : null;
  let ext = sourceImg ? extname(sourceImg).toLowerCase() : ".png";
  if (ext === ".jpeg") ext = ".jpg";
  const destImg = join(OUT_PLATES_DIR, `ia-${slug}${ext}`);
  const imagePath = `state-packs/iowa/plates/ia-${slug}${ext}`;

  try {
    if (sourceImg) {
      copyFileSync(sourceImg, destImg);
      imagesCopied++;
    } else {
      imagesMissing++;
    }
  } catch (err) {
    console.warn(`  image copy failed for ${name}: ${err.message}`);
    imagesMissing++;
  }

  plates.push({
    id: `ia-${slug}`,
    slug,
    name,
    displayName: name,
    baseName: name,
    variantLabel: null,
    plateType: "passenger",
    isCurrent: true,
    isActive: true,
    category,
    image: {
      path: imagePath,
      remoteUrl: raw.image_url ?? null
    },
    sponsor: null,
    notes: null,
    searchTerms: buildSearchTerms(name, category),
    variantOf: null,
    relatedPlates: [],
    metadataBlob: {
      sourceCategories: [raw.category]
    },
    sourceRefs: [{
      source: "Iowa DOT",
      sourceId: raw.slug_source || slug,
      versionId: null
    }]
  });
}

// Sort alphabetically within category
plates.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

const master = {
  schemaVersion: 2,
  state: "Iowa",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "Iowa license plates sourced from the Iowa Department of Transportation.",
  sourceFiles: [
    "https://iowadot.gov/registration-plates/license-plates/personalized-specialty-plates"
  ],
  plates
};

writeFileSync(OUT_MASTER, JSON.stringify(master, null, 2) + "\n");

console.log("");
console.log("=== IA Import Summary ===");
console.log(`Plates imported: ${plates.length}`);
console.log(`Images copied: ${imagesCopied}`);
console.log(`Images missing: ${imagesMissing}`);
console.log("Category distribution:");
for (const [cat, n] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`);
}
console.log(`Master written: ${OUT_MASTER}`);
console.log(`Next: npm run generate:plate-driver iowa`);

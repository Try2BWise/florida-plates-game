/**
 * Minnesota plate import script — v1.9 Phase B.
 *
 * Source: C:\Users\bwise\OneDrive\Gorilla Grin\MN\mn_plates_output\
 *   mn_plates.json + images/
 *
 * MN's scrape has two quirks to handle here:
 *  1. Many plates have a motorcycle variant captured as a separate
 *     row (e.g. "Afghanistan War Veteran" + "Afghanistan War Veteran
 *     license plate for a motorcycle"). We normalize the name, strip
 *     the suffix, and route the variant to the Motorcycle category.
 *  2. A handful of alt texts are verbose descriptions rather than
 *     plate names ("College of St. Benedict license plate with the
 *     letters CSB in red on the left side ..."). We truncate those.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const SCRAPE_DIR = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\MN\\mn_plates_output";
const SCRAPE_JSON = join(SCRAPE_DIR, "mn_plates.json");
const OUT_PLATES_DIR = join(repoRoot, "public", "state-packs", "minnesota", "plates");
const OUT_MASTER = join(repoRoot, "src", "data", "minnesota-plate-master.json");

mkdirSync(OUT_PLATES_DIR, { recursive: true });

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Detect whether an MN plate is a motorcycle variant based on its alt
 * text or name.
 */
function isMotorcycleVariant(name, alt) {
  const s = `${name} ${alt || ""}`.toLowerCase();
  return /(license plate for (a )?motorcycle|plate for motorcycle|motorcycle$|\bmc\b.*cropped)/.test(s);
}

/**
 * Clean up MN scraped plate names. The scraper already did alt-text
 * humanization; this does a second pass for MN-specific patterns.
 */
function cleanName(raw) {
  let s = raw || "";
  // Strip motorcycle variant suffixes
  s = s.replace(/\s*license plate for (a |the )?motorcycle\s*$/i, "");
  s = s.replace(/\s*plate for motorcycle\s*$/i, "");
  s = s.replace(/\s+motorcycle\s*$/i, "");
  // Strip leading "Image of a[n] / Image of the / Sample of a[n] / Sample of "
  s = s.replace(/^(image|sample) of (a |an |the )?/i, "");
  // Truncate at " license plate with " (verbose visual description)
  s = s.replace(/\s+license plate with .*$/i, "");
  // Drop trailing " license plate" if still present
  s = s.replace(/\s+license plate[\.\s]*$/i, "");
  // Strip trailing "sports team" decoration
  s = s.replace(/\s+sports team\s*$/i, "");
  // Fix the MN DPS site's typo
  s = s.replace(/\bRetried\b/g, "Retired");
  // Collapse whitespace and trim punctuation
  s = s.replace(/\s+/g, " ").trim().replace(/[\.\s]+$/, "");
  // Capitalize first letter for display
  if (s && s[0] === s[0].toLowerCase()) {
    s = s[0].toUpperCase() + s.slice(1);
  }
  return s;
}

const MN_KEYWORD_RULES = [
  // ── Named overrides ──
  { keywords: ["lion's club", "lions club"], category: "Civic" },
  { keywords: ["honorary consul"], category: "Civic" },
  { keywords: ["100 club"], category: "Civic" },
  { keywords: ["mmir", "missing and murdered"], category: "Civic" },
  { keywords: ["blackout"], category: "Civic" },

  // ── Commercial ──
  { keywords: ["agriculture"], category: "Commercial" },

  // ── Sports / Recreation ──
  { keywords: ["golf"], category: "Sports" },

  // ── Wildlife & Nature ──
  { keywords: ["critical habitat", "wildlife", "nature"], category: "Wildlife & Nature" },

  // ── Collector class → Heritage ──
  { keywords: ["collector", "classic", "pioneer", "street rod"], category: "Heritage" },
];

function mapCategoryFromScraped(scrapedCat, name) {
  const nameLower = name.toLowerCase();

  // Direct, deterministic mappings by scraped bucket.
  if (scrapedCat === "Military and Veteran") return "Military";
  if (scrapedCat === "Collegiate") return "Universities";
  if (scrapedCat === "MN Pro Sports") return "Sports";
  if (scrapedCat === "Firefighter") return "First Responders";
  if (scrapedCat === "Law Enforcement Memorial") return "First Responders";
  if (scrapedCat === "Critical Habitat") return "Wildlife & Nature";
  if (scrapedCat === "Standard") return "Standard";
  if (scrapedCat === "Disability") return "Health";
  if (scrapedCat === "Amateur Radio") return "Civic";
  if (scrapedCat === "Motorcycle") return "Motorcycle";
  if (scrapedCat === "Collector Class") return "Heritage";
  if (scrapedCat === "MN Agriculture") return "Commercial";
  if (scrapedCat === "MN Golf") return "Sports";

  // Keyword overrides for categories that can go multiple ways.
  for (const rule of MN_KEYWORD_RULES) {
    if (rule.keywords.some((k) => nameLower.includes(k))) {
      return rule.category;
    }
  }
  return "Civic";
}

function buildSearchTerms(name, category) {
  const terms = new Set();
  const stopwords = new Set(["the", "of", "and", "an", "a", "to", "for", "in", "on", "at", "by", "or", "with", "mn", "minnesota"]);
  for (const word of name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
    if (word.length >= 3 && !stopwords.has(word)) terms.add(word);
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
let skipped = 0;

for (const raw of scraped) {
  const rawName = raw.name || raw.alt_text || raw.slug_source || "Unknown";

  // Skip obvious junk (scraper caught some non-plate images).
  if (/^dvs$/i.test(rawName) || rawName.toLowerCase() === "dvs") {
    skipped++;
    continue;
  }

  const isMoto = isMotorcycleVariant(rawName, raw.alt_text);
  const cleanedName = cleanName(rawName);

  // Decide category: motorcycle variants go to Motorcycle regardless of
  // their scraped parent category.
  let category = mapCategoryFromScraped(raw.category, cleanedName);
  if (isMoto) category = "Motorcycle";

  let slug = slugify(cleanedName);
  if (isMoto) slug = `${slug}-mc`;
  if (slugSeen.has(slug)) {
    slug = `${slug}-${raw.slug_source || plates.length}`;
  }
  slugSeen.add(slug);

  const finalName = isMoto ? `${cleanedName} (Motorcycle)` : cleanedName;

  categoryCount[category] = (categoryCount[category] || 0) + 1;

  const sourceImg = raw.local_image ? join(SCRAPE_DIR, raw.local_image) : null;
  const ext = sourceImg ? extname(sourceImg).toLowerCase() : ".jpg";
  const destExt = ext === ".jpeg" ? ".jpg" : ext;
  const destImg = join(OUT_PLATES_DIR, `mn-${slug}${destExt}`);
  const imagePath = `state-packs/minnesota/plates/mn-${slug}${destExt}`;

  try {
    if (sourceImg) {
      copyFileSync(sourceImg, destImg);
      imagesCopied++;
    } else {
      imagesMissing++;
    }
  } catch (err) {
    console.warn(`  image copy failed for ${finalName}: ${err.message}`);
    imagesMissing++;
  }

  plates.push({
    id: `mn-${slug}`,
    slug,
    name: finalName,
    displayName: finalName,
    baseName: cleanedName,
    variantLabel: isMoto ? "Motorcycle" : null,
    plateType: isMoto ? "motorcycle" : "passenger",
    isCurrent: true,
    isActive: true,
    category,
    image: {
      path: imagePath,
      remoteUrl: raw.image_url ?? null
    },
    sponsor: null,
    notes: null,
    searchTerms: buildSearchTerms(finalName, category),
    variantOf: null,
    relatedPlates: [],
    metadataBlob: {
      sourceCategories: [raw.category]
    },
    sourceRefs: [{
      source: "Minnesota DVS",
      sourceId: raw.slug_source || slug,
      versionId: null
    }]
  });
}

plates.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

const master = {
  schemaVersion: 2,
  state: "Minnesota",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "Minnesota license plates sourced from the Minnesota Department of Public Safety (Driver and Vehicle Services).",
  sourceFiles: [
    "https://dps.mn.gov/divisions/dvs/vehicle/license-plates"
  ],
  plates
};

writeFileSync(OUT_MASTER, JSON.stringify(master, null, 2) + "\n");

console.log("");
console.log("=== MN Import Summary ===");
console.log(`Plates imported: ${plates.length}`);
console.log(`Images copied: ${imagesCopied}`);
console.log(`Images missing: ${imagesMissing}`);
console.log(`Skipped (junk): ${skipped}`);
console.log("Category distribution:");
for (const [cat, n] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`);
}
console.log(`Master written: ${OUT_MASTER}`);
console.log(`Next: npm run generate:plate-driver minnesota`);

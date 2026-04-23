/**
 * USA 50-State Challenge import script.
 *
 * Source: the classic road-trip game — one standard-issue plate per
 * US state. Image files are named by 2-letter USPS code (AL.jpg,
 * AK.jpg, AZ.jpg, ...) in the scrape dir.
 *
 * Source images:
 *   C:\Users\bwise\OneDrive\Gorilla Grin\USA\source_images\<CODE>.jpg
 *
 * Run once: node scripts/importUsaMaster.mjs
 * Then:     npm run generate:plate-driver usa
 */

import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const SCRAPE_DIR = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\USA\\source_images";
const OUT_PLATES_DIR = join(repoRoot, "public", "state-packs", "usa", "plates");
const OUT_MASTER = join(repoRoot, "src", "data", "usa-plate-master.json");

mkdirSync(OUT_PLATES_DIR, { recursive: true });

// Canonical 2-letter code → full state name.
const STATE_NAMES = {
  AL: "Alabama",       AK: "Alaska",        AZ: "Arizona",
  AR: "Arkansas",      CA: "California",    CO: "Colorado",
  CT: "Connecticut",   DE: "Delaware",      FL: "Florida",
  GA: "Georgia",       HI: "Hawaii",        ID: "Idaho",
  IL: "Illinois",      IN: "Indiana",       IA: "Iowa",
  KS: "Kansas",        KY: "Kentucky",      LA: "Louisiana",
  ME: "Maine",         MD: "Maryland",      MA: "Massachusetts",
  MI: "Michigan",      MN: "Minnesota",     MS: "Mississippi",
  MO: "Missouri",      MT: "Montana",       NE: "Nebraska",
  NV: "Nevada",        NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico",    NY: "New York",      NC: "North Carolina",
  ND: "North Dakota",  OH: "Ohio",          OK: "Oklahoma",
  OR: "Oregon",        PA: "Pennsylvania",  RI: "Rhode Island",
  SC: "South Carolina",SD: "South Dakota",  TN: "Tennessee",
  TX: "Texas",         UT: "Utah",          VT: "Vermont",
  VA: "Virginia",      WA: "Washington",    WV: "West Virginia",
  WI: "Wisconsin",     WY: "Wyoming",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Main ────────────────────────────────────────────────────────────

const sourceFiles = readdirSync(SCRAPE_DIR)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  .sort();

console.log(`Found ${sourceFiles.length} source image files in ${SCRAPE_DIR}`);

const plates = [];
let imagesCopied = 0;
let imagesMissing = 0;

for (const [code, name] of Object.entries(STATE_NAMES)) {
  const slug = slugify(name);
  const id = `usa-${slug}`;
  // Find a source file matching this code (case-insensitive extensions).
  const candidate = sourceFiles.find(
    (f) => f.toUpperCase().startsWith(`${code}.`)
  );
  if (!candidate) {
    console.warn(`  MISSING source image for ${code} (${name})`);
    imagesMissing++;
    continue;
  }
  const ext = extname(candidate).toLowerCase() === ".jpeg" ? ".jpg" : extname(candidate).toLowerCase();
  const destName = `usa-${slug}${ext}`;
  copyFileSync(join(SCRAPE_DIR, candidate), join(OUT_PLATES_DIR, destName));
  imagesCopied++;

  plates.push({
    id,
    slug,
    name,
    displayName: name,
    baseName: name,
    variantLabel: null,
    plateType: "passenger",
    isCurrent: true,
    isActive: true,
    category: "Standard",
    image: {
      path: `state-packs/usa/plates/${destName}`,
      remoteUrl: null
    },
    sponsor: null,
    notes: `Standard-issue ${name} license plate.`,
    searchTerms: [
      name.toLowerCase(),
      code.toLowerCase(),
      "standard"
    ],
    variantOf: null,
    relatedPlates: [],
    metadataBlob: {
      sourceCategories: ["Standard"],
      stateCode: code
    },
    sourceRefs: [{
      source: "State DMVs (aggregate)",
      sourceId: code,
      versionId: null
    }]
  });
}

// Sort alphabetically (already alphabetic from the STATE_NAMES ordering,
// but re-sort to be safe).
plates.sort((a, b) => a.name.localeCompare(b.name));

const master = {
  schemaVersion: 2,
  state: "USA",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "The classic road-trip game — one standard-issue plate per US state.",
  sourceFiles: [
    "Per-state standard plate images collected from each state's motor vehicle agency."
  ],
  plates
};

writeFileSync(OUT_MASTER, JSON.stringify(master, null, 2) + "\n");

console.log("");
console.log("=== USA Import Summary ===");
console.log(`States imported: ${plates.length}`);
console.log(`Images copied: ${imagesCopied}`);
console.log(`Images missing: ${imagesMissing}`);
console.log(`Master written: ${OUT_MASTER}`);
console.log(`Next: npm run generate:plate-driver usa`);

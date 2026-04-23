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

import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const SCRAPE_DIR = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\USA\\source_images";
const FACTS_CSV = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\us_states_fast_facts.csv";
const OUT_PLATES_DIR = join(repoRoot, "public", "state-packs", "usa", "plates");
const OUT_MASTER = join(repoRoot, "src", "data", "usa-plate-master.json");

// ── Load + parse state facts CSV ──────────────────────────────────
// Columns: State, Area_sq_mi, Area_Rank, Admission_Date, Capital,
//          Nickname, State_Bird, State_Flower, State_Tree
function loadFacts() {
  const rows = readFileSync(FACTS_CSV, "utf8").split(/\r?\n/).filter(Boolean);
  const header = rows.shift().split(",");
  const byState = {};
  for (const row of rows) {
    // Simple CSV split — facts CSV has no embedded commas in values.
    const cells = row.split(",");
    const obj = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    byState[obj.State] = obj;
  }
  return byState;
}

/**
 * Format a state's facts into a multi-line notes string that reads well
 * in the preview sheet. We lead with the nickname, then put the most
 * "trivia-worthy" facts together.
 */
function formatFacts(f) {
  if (!f) return null;
  // Parse the date as UTC so a local-timezone shift doesn't move Dec 14
  // → Dec 13. We want the calendar date exactly as given.
  const admissionDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${f.Admission_Date}T00:00:00Z`));
  const area = parseInt(f.Area_sq_mi, 10).toLocaleString("en-US");
  return [
    f.Nickname,
    `Capital: ${f.Capital} · Admitted ${admissionDate}`,
    `Bird: ${f.State_Bird} · Flower: ${f.State_Flower} · Tree: ${f.State_Tree}`,
    `Area: ${area} sq mi (#${f.Area_Rank})`,
  ].join("\n");
}

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
const facts = loadFacts();

console.log(`Found ${sourceFiles.length} source image files in ${SCRAPE_DIR}`);
console.log(`Loaded facts for ${Object.keys(facts).length} states`);

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
    notes: formatFacts(facts[name]) ?? `Standard-issue ${name} license plate.`,
    searchTerms: [
      name.toLowerCase(),
      code.toLowerCase(),
      "standard",
      // Include the nickname in search terms so "peach state" → Georgia, etc.
      ...(facts[name]?.Nickname ? [facts[name].Nickname.toLowerCase()] : []),
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

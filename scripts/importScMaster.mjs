// One-shot importer: SC DMV plate scrape → src/data/south-carolina-plate-master.json
//
// Reads SC/sc_plates_output/sc_plates.json, applies category mapping with
// keyword overrides, copies (and renames) images into
// public/state-packs/south-carolina/plates/, and writes the master.

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";

const SCRAPE_PATH = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\SC\\sc_plates_output\\sc_plates.json";
const SCRAPE_IMAGES = "C:\\Users\\bwise\\OneDrive\\Gorilla Grin\\SC\\sc_plates_output\\images";
const MASTER_PATH = resolve("src/data/south-carolina-plate-master.json");
const PLATE_IMG_DIR = resolve("public/state-packs/south-carolina/plates");

mkdirSync(PLATE_IMG_DIR, { recursive: true });

const scrape = JSON.parse(readFileSync(SCRAPE_PATH, "utf8"));

// ---- Category mapping ----------------------------------------------------

const KEYWORDS = {
  Military: [
    "army", "navy", "marine", "air force", "coast guard", "national guard",
    "air national", "veteran", "world war", " ww ", "wwii", "korea", "vietnam",
    "gulf war", "operation enduring", "operation iraqi", "operation noble",
    "purple heart", "bronze star", "silver star", "medal of honor",
    "distinguished flying", "distinguished service", "combat action",
    "combat related", "combat infantryman", "combat medic", "armed forces",
    "former pow", "former p.o.w", "pow*mia", "pow/mia", " pow ", " mia ",
    "legion", "vfw", "merchant marine", "submarine", "wounded warrior",
    "airborne", "paratrooper", "expeditionary medal", "occupation medal",
    "air medal", "legion of merit", "meritorious service", "fight terrorism",
    "pearl harbor", "ranger", "navy cross", "soldier", "warrant officer",
    "chief warrant", "we shall not forget", "remembers pow", "disabled veteran",
    "disabled female veteran", "wartime disabled", "gold star",
    "civil air patrol", "us veteran", "u.s. veteran", "united states veteran",
    "sons of confederate", "normandy", "desert shield", "desert storm",
    "space force", "state guard", "palmetto cross", "support our troops",
    "soldier's medal", "navy and marine", "medal of valor", "female veteran",
    "prisoner of war"
  ],
  "First Responders": [
    "police", "fire ", "fireman", "firefighter", " ems ", "sheriff",
    "paramedic", "back the badge", "back the blue", "law enforcement",
    "wounded line of duty", "search and rescue", "sarcom", "k-9", " k9 ",
    "deputy", "troopers", "fraternal order of police", "emergency medical",
    "respiratory therap", "concerns of police"
  ],
  Health: [
    "cancer", "autism", "autistic", "neurodivergent", "heart association",
    "winning women", "organ donor", "donate life", "hospital", "children's hospital",
    "childrens hospital", "children's trust", "childrens trust", "kids endowment",
    "hearing impaired", "leukemia", "diabetes", "cure", "hospice",
    "breast cancer", "alzheimer", "lyme", "epilepsy", "chase away childhood",
    "shriners", "connie maxwell", "camp sertoma", "save lives",
    "multiple sclerosis", "ms society", "nurses foundation", "nurses save",
    "st. jude", "ronald mcdonald", "drivers for a cure"
  ],
  "Wildlife & Nature": [
    "wildlife", "nature", "conservation", "audubon", "ducks unlimited",
    "wild turkey", "turkey federation", "quail", "trout", "endangered",
    "sportsman", "boykin spaniel", "beekeepers", "coastal conservation",
    "national wild", "outdoor", "hunters", "saltwater", "freshwater",
    "animal society", "habitat", "safari club",
    "deer management", "elk foundation", "zoo", "surfrider", "trees sc",
    "tree my dog", "forestry", "hunting island", "homeless pets",
    "wild dolphins", "painted bunting", "gone fishing", "riverbanks"
  ],
  Sports: [
    "panthers", "gamecocks", "clemson 2016", "clemson 2018",
    "clemson university men", "national championship", "ncaa champions",
    "darlington raceway", "darlington established", "darlington: too tough",
    "tennis", "junior golf", "first in golf", "nascar", "heritage classic",
    "association of letterman", "usc baseball", "usc ncaaw"
  ],
  Universities: [
    "university", "college", "alma mater", "alumni", "the citadel",
    "naval academy", "air force academy", "west point", "georgia tech",
    "purdue", "auburn", "musc", "letterman", "usc upstate", "sherman college"
  ],
  Heritage: [
    "antique", "historic", "anniversary", "in god we trust",
    "united we stand", "september", "9/11", "revolutionary war",
    "route 66", "gateway arch", "great rivers", "cave state",
    "wilson's creek", "friends of arrow rock", "arrow rock",
    "lighthouse", "hunley", "morris island", "penn center", "bethune",
    "catawba nation", "shag", "square dance"
  ],
  Schools: [
    "ffa", "future farmers", "4-h", "fccla",
    "first day of school", "helping schools",
    "high school", "public education", "northwestern high", "wilson high"
  ],
  Commercial: [
    "farm vehicle", "powering the palmetto", "trucking",
    "association for pupil transportation"
  ],
  Civic: [
    // catch-all civic indicators (not used as primary triggers; lowest priority)
  ]
};

// Per-slug overrides — wins over keyword matching. Use sparingly for
// names that the keyword logic gets unambiguously wrong.
const EXPLICIT_OVERRIDES = {
  "amateur-radio": "Civic",
  "share-the-road": "Civic",
  "rotary-international": "Civic",
  "personalized-license-plate": "Civic",
  "personalized-disabled-plate": "Civic",
  "driven-by-the-arts": "Civic",
  "keep-it-beautiful": "Civic",
  "reduce-reuse-recycle": "Civic",
  "technology-alliance": "Civic",
  "in-reason-we-trust": "Civic",
  "motorcycle": "Motorcycle",
  "motorcycle-awareness-alliance": "Civic",
  "us-naval-academy": "Universities",
  "us-air-force-academy": "Universities",
  "west-point": "Universities",
  "musc": "Universities",
  "250th-year-anniversary-revolutionary-war": "Heritage"
};

function pickCategory(plate) {
  const id = plate.slug;
  if (EXPLICIT_OVERRIDES[id]) return EXPLICIT_OVERRIDES[id];

  const cats = new Set(plate.categories);
  const haystack = ` ${plate.name.toLowerCase()} `;
  const desc = ` ${(plate.description || "").toLowerCase()} `;

  // Helper to check keyword match against name (and limited desc fallback).
  const hasKw = (kws) => kws.some(kw => haystack.includes(kw));
  const hasKwDeep = (kws) => kws.some(kw => haystack.includes(kw) || desc.includes(kw));

  // Highest priority: military markers in the plate NAME (primary identity).
  if (cats.has("military") || hasKw(KEYWORDS.Military)) return "Military";

  // First responders (police/fire/EMS) — separate from military.
  if (hasKw(KEYWORDS["First Responders"])) return "First Responders";

  // Health awareness/medical orgs.
  if (hasKw(KEYWORDS.Health)) return "Health";

  // Wildlife / Nature / Conservation orgs.
  if (hasKw(KEYWORDS["Wildlife & Nature"])) return "Wildlife & Nature";

  // Sports keyword override (catches Panthers/Clemson football championship plates
  // tagged organizations+specialty rather than sports).
  if (hasKw(KEYWORDS.Sports)) return "Sports";

  // Categorical sports without keyword (e.g., Special Olympics).
  if (cats.has("sports")) return "Sports";

  // Universities — by categorical tag OR strong keyword.
  if (cats.has("collegeuniversity") || hasKw(KEYWORDS.Universities)) {
    return "Universities";
  }

  // Heritage — historical, anniversaries, antique, etc.
  if (hasKw(KEYWORDS.Heritage)) return "Heritage";

  // K-12 / Schools indicators.
  if (hasKw(KEYWORDS.Schools)) return "Schools";

  // Commercial markers (utility, freight, fleet).
  if (hasKw(KEYWORDS.Commercial)) return "Commercial";

  // Categorical defaults — specialty falls through to Civic, not Heritage,
  // to avoid loading Heritage with org/cause plates that aren't actually
  // historical.
  if (cats.has("organizations")) return "Civic";
  if (cats.has("specialty")) return "Civic";
  if (cats.has("disabled")) return "Civic";

  return "Civic";
}

// Sponsor extraction — pull the org name out of the description, when obvious.
function extractSponsor(plate) {
  // For now, leave null — descriptions are too varied to reliably parse
  // the sponsor without heuristics that misfire. Can be refined per-state later.
  return null;
}

// ---- Build master entries -----------------------------------------------

const masterPlates = [];
const slugCounts = new Map();

for (const p of scrape) {
  const baseSlug = p.slug;
  let slug = baseSlug;
  // Defensive — slug uniqueness was already enforced in the scraper, but be safe.
  if (slugCounts.has(slug)) {
    slugCounts.set(slug, slugCounts.get(slug) + 1);
    slug = `${slug}-${slugCounts.get(slug)}`;
  } else {
    slugCounts.set(slug, 1);
  }

  const ext = extname(p.image_filename).toLowerCase() || ".png";
  const targetImageName = `sc-${slug}${ext}`;
  const targetImagePath = `${PLATE_IMG_DIR}/${targetImageName}`;
  const sourceImagePath = `${SCRAPE_IMAGES}/${slug}${ext}`;

  // Copy the image (don't move).
  if (existsSync(sourceImagePath)) {
    copyFileSync(sourceImagePath, targetImagePath);
  } else {
    console.warn(`Missing source image for ${slug}: ${sourceImagePath}`);
  }

  const category = pickCategory(p);
  const sponsor = extractSponsor(p);
  const isMotorcycleAvailable = p.categories.includes("motorcycle");
  // Only the standalone "Motorcycle" plate itself has plateType=motorcycle;
  // for everything else the "motorcycle" cat just signals an alt variant.
  const plateType = category === "Motorcycle" ? "motorcycle" : "passenger";

  masterPlates.push({
    id: `sc-${slug}`,
    slug,
    name: p.name,
    displayName: p.name,
    baseName: p.name,
    variantLabel: null,
    plateType,
    isCurrent: true,
    isActive: true,
    category,
    image: {
      path: `state-packs/south-carolina/plates/${targetImageName}`,
      remoteUrl: p.image_url
    },
    sponsor,
    notes: p.description || null,
    searchTerms: [],
    variantOf: null,
    relatedPlates: [],
    metadataBlob: {
      sourceCategories: p.categories,
      motorcycleAvailable: isMotorcycleAvailable
    },
    sourceRefs: [
      {
        source: "SC DMV",
        sourceId: p.scrape_id,
        versionId: null
      }
    ]
  });
}

// Sort plates alphabetically by name for stable output.
masterPlates.sort((a, b) => a.name.localeCompare(b.name));

const master = {
  schemaVersion: 2,
  state: "South Carolina",
  generatedDate: new Date().toISOString().slice(0, 10),
  description: "South Carolina license plates sourced from the South Carolina Department of Motor Vehicles plate gallery.",
  sourceFiles: ["https://dmv.sc.gov/vehicle-owners/registration/plate-gallery"],
  plates: masterPlates
};

writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2) + "\n");

// ---- Report --------------------------------------------------------------
const catCounts = {};
for (const p of masterPlates) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}
console.log(`Wrote ${MASTER_PATH} (${masterPlates.length} plates)`);
console.log("\nCategory breakdown:");
for (const [cat, n] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat.padEnd(20)} ${n}`);
}

// One-shot patch: add DMV canonical wording (and useful abbreviations) to
// searchTerms for the 15 MO plates whose displayName diverges from the DMV
// canonical name. baseName already carries the DMV wording for substring
// search, but we add it to searchTerms explicitly so intent is preserved in
// the data and abbreviations (AHA, VFW-style shortcuts) are first-class.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const masterPath = resolve("src/data/missouri-plate-master.json");
const raw = readFileSync(masterPath, "utf8");
const data = JSON.parse(raw);

// Map plate id → array of search terms to MERGE into its searchTerms.
// DMV canonical name goes first; useful abbreviations after.
const patches = {
  "mo-bee-friendly-missouri-state-beekeepers-association": [
    "Bee Friendly (Missouri State Beekeepers Association)"
  ],
  "mo-american-heart-association-winning-women": [
    "American Heart Association (Winning Women)",
    "AHA"
  ],
  "mo-some-gave-all-gold-star": [
    "Some Gave All (Gold Star)"
  ],
  "mo-veterans-of-foreign-wars-vfw": [
    "Veterans Of Foreign Wars (VFW)"
  ],
  "mo-missouri-elks-association": [
    "Missouri Elks Association"
  ],
  "mo-missouri-travel-council": [
    "Missouri Travel Council"
  ],
  "mo-arkansas-alumni-go-hogs": [
    "Arkansas Alumni - Go Hogs!",
    "razorbacks"
  ],
  "mo-missouri-federation-of-square-and-round-dance-clubs": [
    "Missouri Federation Of Square & Round Dance Clubs"
  ],
  "mo-mkn-teamsters": [
    "MKN Teamsters"
  ],
  "mo-masters": [
    "MASTERS"
  ],
  "mo-missouri-nurses-foundation": [
    "Missouri Nurses Foundation"
  ],
  "mo-missouri-bicycle-and-pedestrian-federation": [
    "Missouri Bicycle and Pedestrian Federation"
  ],
  "mo-wartime-disabled-dav": [
    "Wartime Disabled - DAV",
    "DAV"
  ],
  "mo-american-legion": [
    "American Legion"
  ],
  "mo-cave-state": [
    "Cave State"
  ]
};

const expectedIds = new Set(Object.keys(patches));
const touched = new Set();

for (const plate of data.plates) {
  if (!patches[plate.id]) continue;
  const existing = new Set((plate.searchTerms ?? []).map(t => t.toLowerCase()));
  const additions = patches[plate.id].filter(t => !existing.has(t.toLowerCase()));
  plate.searchTerms = [...(plate.searchTerms ?? []), ...additions];
  touched.add(plate.id);
}

const missing = [...expectedIds].filter(id => !touched.has(id));
if (missing.length) {
  console.error("Plates not found for patching:", missing);
  process.exit(1);
}

writeFileSync(masterPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Patched ${touched.size} plates with DMV-name searchTerms.`);

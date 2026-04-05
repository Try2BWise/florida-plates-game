#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const RAW_PATH = resolve(__dirname, 'tn-plates-raw.json');
const IMAGES_DIR = resolve(ROOT, 'public/state-packs/tennessee/plates');
const MASTER_PATH = resolve(ROOT, 'src/data/tennessee-plate-master.json');

function categorize(name) {
  const n = name.toLowerCase();
  if (/universit|college|vanderbilt|tennessee tech|ut |utc |utm |memphis|belmont|lipscomb|rhodes|carson.newman|cumberland|east tennessee|middle tennessee|austin peay|tennessee state|fisk|lee university|lincoln memorial|sewanee|union university|trevecca|maryville|bryan|bethel|king university|freed.hardeman|milligan|south college|tn tech|etsu|mtsu/i.test(n)) return 'Universities';
  if (/veteran|purple heart|pearl harbor|pow |mia|medal of honor|bronze star|silver star|military|armed force|marine|army|navy|air force|national guard|legion|combat|expeditionary|iraqi freedom|enduring freedom|desert|korea|vietnam|war on terror|5th special|101st|airborne|air medal|distinguished/i.test(n)) return 'Military Honors & History';
  if (/police|sheriff|fire |firefighter|ems |ambulance|trooper|emergency|rescue|law enforcement|highway patrol/i.test(n)) return 'Public Service';
  if (/disabled|handicap/i.test(n)) return 'Accessibility';
  if (/cancer|organ donor|autism|health|hospice|children.*hospital|choose life|child|diabetes|breast|leukemia|kidney|spay|neuter|pediatric|st\. jude|vanderbilt.*children|le bonheur/i.test(n)) return 'Health & Family';
  if (/titans|predators|grizzlies|nashville sc|memphis 901|vols |volunteer|soccer|football|baseball|basketball|golf|tennis|sport|racing|nascar|nfl|nba|nhl|mls/i.test(n)) return 'Professional Sports';
  if (/historic|antique|classic|vintage|street rod/i.test(n)) return 'Historical & Antique';
  if (/conservation|wildlife|turkey|deer|duck|bass|trout|nature|fish|game|elk|bird|hummingbird|eagle|quail|environment|recycle|clean|green/i.test(n)) return 'Nature & Wildlife';
  if (/education|school|literacy|museum|arts commission|cultural|ffa|agriculture|4-h|teacher|pta/i.test(n)) return 'Education & Culture';
  if (/motorcycle/i.test(n)) return 'Motorcycle Plates';
  if (/commercial|truck|trailer|farm vehicle|for hire|dealer/i.test(n)) return 'Commercial & Fleet';
  if (/state park|tourism|travel|smoky|great smoky|graceland/i.test(n)) return 'Travel & Tourism';
  if (/standard|personalized|regular|vanity|in god we trust/i.test(n)) return 'Standard Plates';
  if (/government|official|legislat|judge|mayor|county|city|state rep|state sen/i.test(n)) return 'Government & Official';
  return 'Civic & Causes';
}

function slugify(name) {
  return name.toLowerCase().replace(/['']/g, '').replace(/&/g, 'and').replace(/\./g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return true;
  } catch { return false; }
}

async function main() {
  const raw = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
  console.log(`Processing ${raw.length} Tennessee plates...`);
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });
  const existing = new Set(readdirSync(IMAGES_DIR));

  const masterPlates = [];
  let downloaded = 0, skipped = 0, failed = 0;

  for (const plate of raw) {
    const slug = slugify(plate.name);
    const ext = extname(new URL(plate.imageUrl).pathname) || '.jpg';
    const filename = `${slug}${ext}`;
    const destPath = resolve(IMAGES_DIR, filename);

    if (existing.has(filename)) { skipped++; }
    else {
      const ok = await downloadImage(plate.imageUrl, destPath);
      if (ok) { downloaded++; } else { failed++; console.log(`  FAILED: ${plate.name}`); }
    }

    const category = categorize(plate.name);
    const isMotorcycle = /motorcycle/i.test(plate.name);

    masterPlates.push({
      id: `tn-${slug}`, slug, name: plate.name, displayName: plate.name,
      baseName: plate.name.replace(/\s*-\s*Meritorious$/i, '').replace(/\s*\(Motorcycle\)$/i, '').trim(),
      variantLabel: isMotorcycle ? 'Motorcycle' : null,
      plateType: isMotorcycle ? 'motorcycle' : 'passenger',
      isCurrent: true, isActive: true, category,
      image: { path: `state-packs/tennessee/plates/${filename}`, remoteUrl: plate.imageUrl },
      sponsor: null, notes: null, searchTerms: [], variantOf: null, relatedPlates: [],
      metadataBlob: null,
      sourceRefs: [{ source: 'Tennessee DOR', sourceId: slug, versionId: null, value: null }]
    });
  }

  console.log(`Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
  masterPlates.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const master = {
    schemaVersion: 2, state: 'Tennessee',
    generatedDate: new Date().toISOString().split('T')[0],
    description: 'Tennessee specialty license plates from the Department of Revenue',
    sourceFiles: ['https://www.tn.gov/revenue/title-and-registration/license-plates/available-license-plates.html'],
    plates: masterPlates
  };

  writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));
  console.log(`\nWrote master: ${MASTER_PATH} (${masterPlates.length} plates)`);

  const cats = {};
  masterPlates.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  console.log('\nCategory breakdown:');
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
}

main().catch(console.error);

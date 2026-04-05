#!/usr/bin/env node
// Build Missouri plate pack from parsed platescript.js data
// Usage: node source_assets/missouri/build-mo-pack.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const IMAGES_DIR = resolve(ROOT, 'public/state-packs/missouri/plates');
const MASTER_PATH = resolve(ROOT, 'src/data/missouri-plate-master.json');
const RAW_PATH = resolve(__dirname, 'mo-plates-raw.json');

function categorize(name, sourceCategory) {
  if (sourceCategory === 'collegiate') return 'Universities';
  if (sourceCategory === 'military') return 'Military Honors & History';
  const n = name.toLowerCase();
  if (/police|sheriff|fire|ems|fraternal order of police|trooper/i.test(name)) return 'Public Service';
  if (/cancer|organ donor|health|children.*trust|kids first|choose life|right to life|prostate|breast|susan g|oral health|visionaware/i.test(n)) return 'Health & Family';
  if (/chiefs|royals|blues|cardinals|sporting kc|st\. louis city|sports hall/i.test(n)) return 'Professional Sports';
  if (/historic|antique|street rod|custom vehicle|route 66|lewis.*clark|arrow rock|george washington carver/i.test(n)) return 'Historical & Antique';
  if (/conservation|whitetails|turkey|duck|coonhound|fox trot|mule|animal|pet fund|save the river|water/i.test(n)) return 'Nature & Wildlife';
  if (/4-h|education|higher education|girl scout|boy scout|eagle scout|ranken/i.test(n)) return 'Education & Culture';
  if (/amateur radio|shuttle|vanpool|standard/i.test(n)) return 'Standard Plates';
  if (/farm|cattlemen|soybean|realtor/i.test(n)) return 'Civic & Causes';
  if (/national guard|legion|v\.f\.w\.|american legion|veteran.*fam|vietnam vet|gold star/i.test(n)) return 'Military Honors & History';
  if (/share the road|lake.*ozark/i.test(n)) return 'Travel & Tourism';
  return 'Civic & Causes';
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
  const rawPlates = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
  console.log(`Processing ${rawPlates.length} Missouri plates...`);

  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });
  const existing = new Set(readdirSync(IMAGES_DIR));

  const masterPlates = [];
  let downloaded = 0, skipped = 0, failed = 0;

  for (const plate of rawPlates) {
    const slug = slugify(plate.name);
    const gifFilename = `${plate.file}.gif`;
    const gifPath = resolve(IMAGES_DIR, gifFilename);
    const imageUrl = `https://dor.mo.gov/motor-vehicle/plates/images/${plate.file}.gif`;

    if (existing.has(gifFilename)) {
      skipped++;
    } else {
      const ok = await downloadImage(imageUrl, gifPath);
      if (ok) { downloaded++; } else { failed++; console.log(`  FAILED: ${plate.name} (${plate.file}.gif)`); }
    }

    const category = categorize(plate.name, plate.sourceCategory);

    masterPlates.push({
      id: `mo-${slug}`,
      slug,
      name: plate.name,
      displayName: plate.name,
      baseName: plate.name,
      variantLabel: null,
      plateType: 'passenger',
      isCurrent: true,
      isActive: true,
      category,
      image: {
        path: `state-packs/missouri/plates/${gifFilename}`,
        remoteUrl: imageUrl
      },
      sponsor: null,
      notes: null,
      searchTerms: [],
      variantOf: null,
      relatedPlates: [],
      metadataBlob: null,
      sourceRefs: [{
        source: 'Missouri DOR',
        sourceId: plate.file,
        versionId: null,
        value: null
      }]
    });
  }

  console.log(`Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);

  masterPlates.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const master = {
    schemaVersion: 2,
    state: 'Missouri',
    generatedDate: new Date().toISOString().split('T')[0],
    description: 'Missouri specialty license plates from the Department of Revenue',
    sourceFiles: ['https://dor.mo.gov/motor-vehicle/plates/personalized-specialty.html'],
    plates: masterPlates
  };

  writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));
  console.log(`\nWrote master: ${MASTER_PATH} (${masterPlates.length} plates)`);

  const cats = {};
  masterPlates.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  console.log('\nCategory breakdown:');
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

main().catch(console.error);

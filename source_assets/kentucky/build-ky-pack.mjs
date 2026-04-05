#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const RAW_PATH = resolve(__dirname, 'ky-plates-raw.json');
const IMAGES_DIR = resolve(ROOT, 'public/state-packs/kentucky/plates');
const MASTER_PATH = resolve(ROOT, 'src/data/kentucky-plate-master.json');

function categorize(name, sourceCategory) {
  if (sourceCategory === 'College/University') return 'Universities';
  if (sourceCategory === 'Military' || sourceCategory === 'Military Motorcycle') return 'Military Honors & History';
  if (sourceCategory === 'Government/Official') return 'Government & Official';
  if (sourceCategory === 'Disabled') return 'Accessibility';
  if (sourceCategory === 'Commercial') return 'Commercial & Fleet';
  if (sourceCategory === 'Standard Issue') return 'Standard Plates';
  if (sourceCategory === 'Special Motorcycle') return 'Motorcycle Plates';

  const n = name.toLowerCase();
  if (/police|sheriff|fire |ems |trooper|emergency|rescue|law enforcement/i.test(n)) return 'Public Service';
  if (/cancer|organ donor|autism|health|hospice|choose life|child|diabetes|breast|spay|neuter|alzheimer/i.test(n)) return 'Health & Family';
  if (/wildcat|cardinal|racers|colonels|eagle|hilltoppers|thoroughbred|wildcats|uk |u of l|louisville|kentucky derby|horse|racing/i.test(n)) return 'Professional Sports';
  if (/historic|antique|classic|vintage/i.test(n)) return 'Historical & Antique';
  if (/conservation|wildlife|turkey|deer|duck|bass|trout|nature|fish|elk|bird|environment/i.test(n)) return 'Nature & Wildlife';
  if (/education|school|teacher|4-h|agriculture|ffa/i.test(n)) return 'Education & Culture';
  if (/state park|tourism|travel/i.test(n)) return 'Travel & Tourism';
  if (/in god we trust|friends of coal|bluegrass/i.test(n)) return 'Civic & Causes';
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
  console.log(`Processing ${raw.length} Kentucky plates...`);
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });
  const existing = new Set(readdirSync(IMAGES_DIR));

  const masterPlates = [];
  let downloaded = 0, skipped = 0, failed = 0;

  for (const plate of raw) {
    const slug = slugify(plate.name);
    const filename = `${slug}.png`; // KY API returns PNG images
    const destPath = resolve(IMAGES_DIR, filename);

    if (existing.has(filename)) { skipped++; }
    else {
      const ok = await downloadImage(plate.imageUrl, destPath);
      if (ok) { downloaded++; } else { failed++; console.log(`  FAILED: ${plate.name}`); }
    }

    const category = categorize(plate.name, plate.sourceCategory);
    const isMotorcycle = /motorcycle/i.test(plate.sourceCategory);

    masterPlates.push({
      id: `ky-${slug}`, slug, name: plate.name, displayName: plate.name,
      baseName: plate.name,
      variantLabel: isMotorcycle ? 'Motorcycle' : null,
      plateType: isMotorcycle ? 'motorcycle' : 'passenger',
      isCurrent: true, isActive: plate.active, category,
      image: { path: `state-packs/kentucky/plates/${filename}`, remoteUrl: plate.imageUrl },
      sponsor: null, notes: plate.description || null, searchTerms: [], variantOf: null, relatedPlates: [],
      metadataBlob: null,
      sourceRefs: [{ source: 'Kentucky KYTC', sourceId: plate.plateId, versionId: null, value: null }]
    });
  }

  console.log(`Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
  masterPlates.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const master = {
    schemaVersion: 2, state: 'Kentucky',
    generatedDate: new Date().toISOString().split('T')[0],
    description: 'Kentucky specialty license plates from the Kentucky Transportation Cabinet',
    sourceFiles: ['https://secure2.kentucky.gov/kytc/plates/web/'],
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

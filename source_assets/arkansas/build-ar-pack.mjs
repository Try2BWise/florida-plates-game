#!/usr/bin/env node
// Download Arkansas plate images and build master JSON
// Usage: node source_assets/arkansas/build-ar-pack.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const RAW_PATH = resolve(__dirname, 'ar-plates-raw.json');
const IMAGES_DIR = resolve(ROOT, 'public/state-packs/arkansas/plates');
const MASTER_PATH = resolve(ROOT, 'src/data/arkansas-plate-master.json');

function categorize(name, desc) {
  const n = (name + ' ' + desc).toLowerCase();
  if (/universit|u of a|ualr|uca |uapb|harding|hendrix|ouachita|lyon|ozarks|john brown|philander|razorback|arkansas tech|arkansas state university|henderson state|southern arkansas|williams baptist|central baptist|crowley/i.test(name))
    return 'Universities';
  if (/veteran|purple heart|pearl harbor|pow |mia|medal of honor|bronze star|silver star|military|armed force|marine|army|navy|air force|national guard|legion|combat|expeditionary|iraqi freedom|enduring freedom|desert|korea|vietnam|war on terror|women veteran/i.test(n))
    return 'Military Honors & History';
  if (/police|sheriff|fire |firefighter|ems |ambulance|fraternal order|trooper|law enforcement|municipal police|state police/i.test(n))
    return 'Public Service';
  if (/disabled|handicap|physically/i.test(n))
    return 'Accessibility';
  if (/government|official|legislat|state senator|representative|judge|mayor|city council|county|circuit|prosecut|constable|collector|assessor|clerk|coroner|u\.s\. congress|civil service|not for hire|dealer|transporter|exempt|consular|diploma/i.test(n))
    return 'Government & Official';
  if (/game.*fish|wildlife|turkey|deer|duck|bass|trout|nature|conservation|hunting|bunting|eagle|quail|black lab|butterfly|mallard|natural heritage|red fox|squirrel|wood duck|pintail|bobwhite/i.test(n))
    return 'Nature & Wildlife';
  if (/education|school|literacy|museum|art |arts |cultural|ffa|agricultural education|community education/i.test(n))
    return 'Education & Culture';
  if (/tennis|golf|soccer|baseball|football|basketball|sport|racing|athletic|marathon|cycling/i.test(n))
    return 'Sports & Recreation';
  if (/cancer|organ donor|autism|down syndrome|health|hospice|children.*hospital|choose life|child|pediatric|diabetes|heart|breast|leukemia|kidney|dyslexia|childhood/i.test(n))
    return 'Health & Family';
  if (/antique|historic|classic|vintage|street rod/i.test(n))
    return 'Historical & Antique';
  if (/motorcycle/i.test(name) && !/antique/i.test(name))
    return 'Motorcycle Plates';
  if (/commercial|truck|trailer|farm vehicle|for hire/i.test(n))
    return 'Commercial & Fleet';
  if (/state park|tourism|travel|natural state|diamond/i.test(n))
    return 'Travel & Tourism';
  if (/personalized|standard|regular|vanity|in god we trust/i.test(n))
    return 'Standard Plates';
  if (/special use|temporary|drive.out/i.test(n))
    return 'Special Use';
  if (/placard/i.test(n))
    return 'Accessibility';
  return 'Civic & Causes';
}

function slugToFilename(slug) {
  return slug.replace(/[^a-z0-9-]/g, '');
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const raw = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
  console.log(`Processing ${raw.length} plates...`);

  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

  // Check which webp files already exist
  const existingFiles = new Set(readdirSync(IMAGES_DIR));

  const plates = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const plate of raw) {
    const slug = slugToFilename(plate.slug);
    const ext = extname(new URL(plate.imageUrl || 'https://x.com/x.jpg').pathname) || '.jpg';
    const origFilename = `${slug}${ext}`;
    const webpFilename = `${slug}.webp`;
    const origPath = resolve(IMAGES_DIR, origFilename);

    // Download original if needed
    if (plate.imageUrl) {
      if (existingFiles.has(origFilename) || existingFiles.has(webpFilename)) {
        skipped++;
      } else {
        const ok = await downloadImage(plate.imageUrl, origPath);
        if (ok) { downloaded++; } else { failed++; console.log(`  FAILED: ${plate.name}`); }
      }
    } else {
      failed++;
      console.log(`  NO IMAGE: ${plate.name}`);
    }

    // Use webp if exists, otherwise original
    const imagePath = existingFiles.has(webpFilename)
      ? `state-packs/arkansas/plates/${webpFilename}`
      : `state-packs/arkansas/plates/${origFilename}`;

    const category = categorize(plate.name, plate.description);
    const isMotorcycle = /motorcycle/i.test(plate.name);

    plates.push({
      id: `ar-${slug}`,
      slug,
      name: plate.name,
      displayName: plate.name,
      baseName: plate.name
        .replace(/\s*License Plate\s*/i, '')
        .replace(/\s*–\s*(Current|Valid|No Longer Issued)\s*/i, '')
        .replace(/\s*\(Motorcycle\)\s*/i, '')
        .trim(),
      variantLabel: isMotorcycle ? 'Motorcycle' : null,
      plateType: isMotorcycle ? 'motorcycle' : 'passenger',
      isCurrent: !/no longer issued/i.test(plate.name),
      isActive: true,
      category,
      image: {
        path: imagePath,
        remoteUrl: plate.imageUrl || null
      },
      sponsor: null,
      notes: plate.description || null,
      searchTerms: [],
      variantOf: null,
      relatedPlates: [],
      metadataBlob: null,
      sourceRefs: [{
        source: 'Arkansas DFA',
        sourceId: plate.slug,
        versionId: null,
        value: null
      }]
    });
  }

  console.log(`Downloaded: ${downloaded}, Skipped (existing): ${skipped}, Failed: ${failed}`);

  plates.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const master = {
    schemaVersion: 2,
    state: 'Arkansas',
    generatedDate: new Date().toISOString().split('T')[0],
    description: 'Arkansas specialty license plates from the Department of Finance and Administration',
    sourceFiles: ['https://www.dfa.arkansas.gov/office/motor-vehicle/specialty-plates-placards/'],
    plates
  };

  writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));
  console.log(`\nWrote master: ${MASTER_PATH} (${plates.length} plates)`);

  const cats = {};
  plates.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  console.log('\nCategory breakdown:');
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

main().catch(console.error);

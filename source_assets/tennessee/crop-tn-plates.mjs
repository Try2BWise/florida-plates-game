#!/usr/bin/env node
// Auto-crop white space from Tennessee plate images
// Usage: node source_assets/tennessee/crop-tn-plates.mjs

import sharp from 'sharp';
import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLATES_DIR = resolve(__dirname, '../../public/state-packs/tennessee/plates');

async function cropImage(filePath) {
  const image = sharp(filePath);
  const metadata = await image.metadata();

  // Use sharp's trim() to auto-detect and remove white borders
  // trim() removes pixels similar to the top-left pixel
  const trimmed = await image
    .trim({ threshold: 30 }) // threshold for "similar to background" detection
    .toBuffer({ resolveWithObject: true });

  // Write back
  await sharp(trimmed.data).toFile(filePath + '.tmp');

  // Replace original
  const fs = await import('fs');
  fs.renameSync(filePath + '.tmp', filePath);

  return {
    original: `${metadata.width}x${metadata.height}`,
    cropped: `${trimmed.info.width}x${trimmed.info.height}`
  };
}

async function main() {
  const files = readdirSync(PLATES_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Cropping ${files.length} Tennessee plate images...`);

  let processed = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = resolve(PLATES_DIR, file);
    try {
      const result = await cropImage(filePath);
      processed++;
      if (processed % 20 === 0) {
        console.log(`  ${processed}/${files.length} done (last: ${file} ${result.original} -> ${result.cropped})`);
      }
    } catch (e) {
      errors++;
      console.log(`  ERROR: ${file} - ${e.message}`);
    }
  }

  console.log(`\nDone. Processed: ${processed}, Errors: ${errors}`);
}

main().catch(console.error);

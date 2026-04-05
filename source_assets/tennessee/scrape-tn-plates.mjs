#!/usr/bin/env node
// Scrape Tennessee specialty plates from tn.gov
// Usage: node source_assets/tennessee/scrape-tn-plates.mjs

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('Fetching Tennessee plates page...');
  const res = await fetch('https://www.tn.gov/revenue/title-and-registration/license-plates/available-license-plates.html');
  const html = await res.text();

  // Extract plate cards: each has an img with alt text and a <p> with the name
  const plates = [];
  const imgRegex = /<img[^>]*src="([^"]*plates-gallery-photos[^"]*)"[^>]*alt="([^"]*)"[^>]*>/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const imageUrl = match[1].startsWith('http') ? match[1] : 'https://www.tn.gov' + match[1];
    const name = match[2]
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
    if (name) {
      plates.push({ name, imageUrl });
    }
  }

  const outPath = resolve(__dirname, 'tn-plates-raw.json');
  writeFileSync(outPath, JSON.stringify(plates, null, 2));
  console.log(`Wrote ${plates.length} plates to ${outPath}`);
}

main().catch(console.error);

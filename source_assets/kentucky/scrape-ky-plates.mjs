#!/usr/bin/env node
// Scrape Kentucky specialty plates from drive.ky.gov API
// Usage: node source_assets/kentucky/scrape-ky-plates.mjs

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const categories = [
  { id: '9f80e816-d73a-48be-9edf-6d7f64a84901', name: 'Standard Issue' },
  { id: '279bf63c-a058-424f-9a2a-e22995728ca3', name: 'Disabled' },
  { id: '98d58036-518e-4f3e-9401-023c53c3c625', name: 'Commercial' },
  { id: '0cb6934c-3289-49c7-801b-a0a2cb74b165', name: 'Special' },
  { id: 'f90ee165-cedd-4140-b0fd-eb73d2eaaaf7', name: 'College/University' },
  { id: 'd186a4c8-ff82-4086-b084-20b287fc3231', name: 'Special Motorcycle' },
  { id: '8f28e1b6-4cc3-4ef8-acc6-9a8e5b5add08', name: 'Military' },
  { id: '648e5d61-5f99-4e7c-b7b1-0426f6504aea', name: 'Military Motorcycle' },
  { id: '8218b2a7-d3a0-4965-9702-0aafab640401', name: 'Government/Official' },
  { id: '7cc37ff1-e365-41a9-a134-2dba83d7acf1', name: 'Miscellaneous' },
];

async function main() {
  const allPlates = [];

  for (const cat of categories) {
    console.log(`Fetching ${cat.name}...`);
    const res = await fetch(
      `https://secure2.kentucky.gov/kytc/plates/web/LicensePlate/GetLicensePlates?categoryId=${cat.id}&renewableOnly=false`
    );
    const data = await res.json();
    for (const p of data) {
      allPlates.push({
        name: p.Name,
        description: p.Description || '',
        plateId: p.LicensePlateId,
        imageId: p.ImageId,
        active: p.Active,
        sourceCategory: cat.name,
        imageUrl: `https://secure2.kentucky.gov/kytc/plates/web/LicensePlate/GenerateImage?imageId=${p.ImageId}&licensePlateId=${p.LicensePlateId}`
      });
    }
    console.log(`  ${data.length} plates`);
  }

  const outPath = resolve(__dirname, 'ky-plates-raw.json');
  writeFileSync(outPath, JSON.stringify(allPlates, null, 2));
  console.log(`\nWrote ${allPlates.length} plates to ${outPath}`);
}

main().catch(console.error);

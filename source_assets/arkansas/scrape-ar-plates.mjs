#!/usr/bin/env node
// Scrape Arkansas specialty plates from DFA website via WP REST API
// Usage: node source_assets/arkansas/scrape-ar-plates.mjs

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchAllPlates() {
  const allPlates = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://www.dfa.arkansas.gov/wp-json/wp/v2/specialty-plates?per_page=100&page=${page}&_fields=id,slug,title,link,featured_img`;
    console.log(`Fetching page ${page}...`);
    const res = await fetch(url);
    if (!res.ok) { hasMore = false; break; }
    const total = parseInt(res.headers.get('X-WP-TotalPages') || '1');
    const data = await res.json();
    allPlates.push(...data);
    hasMore = page < total;
    page++;
  }
  return allPlates;
}

async function fetchDescriptions() {
  const descMap = {};
  const totalPages = 7;

  for (let page = 1; page <= totalPages; page++) {
    const url = page === 1
      ? 'https://www.dfa.arkansas.gov/office/motor-vehicle/specialty-plates-placards/'
      : `https://www.dfa.arkansas.gov/office/motor-vehicle/specialty-plates-placards/?sf_paged=${page}`;
    console.log(`Scraping descriptions page ${page}/${totalPages}...`);
    const res = await fetch(url);
    const html = await res.text();

    // Parse descriptions from the HTML using regex (no DOM in Node)
    const articleRegex = /href="[^"]*\/specialty-plates\/([^/"]+)\/"[^]*?dce-meta-item[^>]*>([^<]+)</g;
    let match;
    while ((match = articleRegex.exec(html)) !== null) {
      descMap[match[1]] = match[2].trim();
    }
  }
  return descMap;
}

async function main() {
  console.log('Fetching plates from WP REST API...');
  const apiPlates = await fetchAllPlates();
  console.log(`Got ${apiPlates.length} plates from API`);

  console.log('Scraping descriptions from listing pages...');
  const descMap = await fetchDescriptions();
  console.log(`Got ${Object.keys(descMap).length} descriptions`);

  const plates = apiPlates.map(p => ({
    slug: p.slug,
    name: (p.title?.rendered || '')
      .replace(/&#8211;/g, '–')
      .replace(/&#8217;/g, '\u2019')
      .replace(/&#8216;/g, '\u2018')
      .replace(/&amp;/g, '&')
      .replace(/&#038;/g, '&'),
    description: descMap[p.slug] || '',
    imageUrl: p.featured_img || '',
    detailUrl: p.link || ''
  }));

  const outPath = resolve(__dirname, 'ar-plates-raw.json');
  writeFileSync(outPath, JSON.stringify(plates, null, 2));
  console.log(`Wrote ${plates.length} plates to ${outPath}`);
}

main().catch(console.error);

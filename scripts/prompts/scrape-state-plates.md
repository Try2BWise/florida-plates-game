# Prompt: Scrape License Plate Data for [STATE]

**Goal**: Research and compile a complete list of specialty license plates for **[STATE]** and output a JSON master file matching the schema below.

---

## Ground Rules

- **Only use official government sites** (state DMV, DOR, motor vehicle division). Do not use aggregation sites, collector sites, or third-party catalogs.
- **Trust the official catalog page as the full universe.** Don't hunt for hidden or unlisted plate codes.
- **Include every plate that was ever publicly available**, whether currently issued or discontinued.
- **Any variation of discontinued language** ("no longer available", "plate is discontinued", "retired", etc.) means `isCurrent: false`.
- **Legacy plates**: If a plate has had multiple designs over time, create separate entries for each version and link them via `variantOf`.
- **Each plate code = its own entry.** If the state lists them as separate codes, they get separate entries.
- **Motorcycle variants**: Include all motorcycle versions as separate entries, even if they are just a resized version of the passenger plate. Still link via `variantOf` to the passenger version, even if the name differs slightly.
- **Military plates**: Include every branch and medal variant individually. If a plate has any military connection, its category is `Military`.
- **Sports/university plates**: Include all. All school-branded plates (including college athletics) = `Universities`. Only use `Sports` for professional sports teams.
- **If a plate's category is ambiguous**, honor the intent of the plate over the sponsor. Log the ambiguity in `notes` (e.g., "Category note: could be Health or Civic, chose Civic").
- **When a cause/nonprofit plate doesn't clearly fit** a specific category, use `Civic`.
- **If a detail page fails to load or returns incomplete data**, include a minimal stub entry with whatever data you can get. Set `image.remoteUrl` to the expected URL pattern. Flag it in an issues report.

---

## Output File: `[state]-plate-master.json`

Top-level structure:
```json
{
  "schemaVersion": 2,
  "state": "[State Name]",
  "generatedDate": "YYYY-MM-DD",
  "description": "[State] plate master — sourced from [source name]",
  "sourceFiles": ["[source URLs used]"],
  "plates": [ ...plate entries... ]
}
```

---

## Plate Entry Schema

```json
{
  "id": "[st]-kebab-case-unique-id",
  "slug": "kebab-case-unique-id",
  "name": "Human Readable Name",
  "displayName": "Human Readable Name",
  "baseName": "Human Readable Name",
  "variantLabel": null,
  "plateType": "passenger",
  "isCurrent": true,
  "isActive": true,
  "category": "Wildlife & Nature",
  "image": {
    "path": "state-packs/[state]/plates/[st]-[slug].jpg",
    "remoteUrl": "https://full-url-to-plate-image-if-known"
  },
  "sponsor": "Sponsoring organization name",
  "notes": "Any relevant notes about restrictions or history",
  "searchTerms": ["lowercase name", "alternate keywords"],
  "variantOf": null,
  "relatedPlates": [],
  "metadataBlob": null,
  "sourceRefs": [
    {
      "source": "[State Agency Name]",
      "sourceId": "plate-code-or-identifier",
      "versionId": null,
      "value": null
    }
  ]
}
```

---

## Field Rules

**`id`**: State prefix + kebab-case slug. Example: `ga-university-of-georgia`, `ks-purple-heart`. If the same plate has a current and legacy version, suffix the legacy with `-legacy`. Example: `ga-university-of-georgia`, `ga-university-of-georgia-legacy`. Enforce uniqueness — if two plates normalize to the same slug, add a numeric suffix (`-1`, `-2`) and flag the collision.

**`slug`**: Same as `id` but without the state prefix.

**`name` / `displayName`**: Use the official DMV name exactly as listed. Keep these identical — I'll normalize later if needed. For motorcycle variants, append ` (Motorcycle)` to the name.

**`baseName`**: The parent plate name without any variant suffix. For example, if `name` is `"University of Georgia (Motorcycle)"`, `baseName` is `"University of Georgia"`.

**`variantLabel`**: `null` for the primary version. Use `"Motorcycle"` for motorcycle variants, `"Legacy"` for discontinued versions that have a current replacement.

**`plateType`**: `"passenger"` for standard plates. `"motorcycle"` for motorcycle-only plates.

**`isCurrent`**: `true` if the plate is currently available to order. `false` if retired/discontinued (any wording variation).

**`isActive`**: Same as `isCurrent`.

**`category`**: Must be exactly one of:
`Civic`, `Commercial`, `First Responders`, `Government`, `Health`, `Heritage`, `Military`, `Motorcycle`, `Schools`, `Sports`, `Standard`, `Universities`, `Wildlife & Nature`

Rules:
- `Motorcycle` for all motorcycle variants.
- `Military` for any plate with a military connection (medals, branches, veterans, etc.). Military wins over all other categories.
- `Universities` for all school-branded plates including college athletics.
- `Sports` only for professional sports teams.
- `Civic` as the default for unclear cause/nonprofit plates.
- When ambiguous, log your reasoning in `notes`.

**`image.path`**: Use the convention `state-packs/[state]/plates/[st]-[slug].jpg` where `[state]` is the lowercase full state name and `[st]` is the 2-letter lowercase abbreviation. Example: `state-packs/georgia/plates/ga-university-of-georgia.jpg`.

**`image.remoteUrl`**: If you can determine the image URL from the official site, include it. This is critical — I'll use these URLs to batch-download images separately. Set to `null` only if no image URL can be determined.

**`sponsor`**: Organization name only (no URLs). Best-effort.

**`notes`**: Free text. Include any relevant context: discontinued status, fee info, category ambiguity notes, restrictions, etc. Don't overthink structure.

**`searchTerms`**: Lowercase array. **Aim for high recall** — I can always trim, but I can't easily add what I don't have. Include:
- The plate name and common abbreviations (e.g., `"uga"`, `"ga tech"`)
- Generic terms describing visible plate imagery (e.g., `"bird"` for a Turkey Hunting plate)
- Major plate colors — but only colors you're confident about from the plate name or description. Don't guess from images.
- Team mascot names where applicable

**`variantOf`**: For motorcycle variants, set to the `id` of the passenger version (even if name differs slightly). For legacy variants, set to the `id` of the current version. For all others, only set when there is a concrete, known connection. Do not guess or assume — it's better to leave it `null` and let me link them manually.

**`relatedPlates`**: Array of `id` strings for plates that are clearly related (e.g., branch-specific military plates, a plate family). Same rule: only set when concrete.

**`sourceRefs`**: One entry per plate. `source` is the agency name, `sourceId` is the plate code or identifier from the source site.

---

## What to Include

- All **specialty/organizational plates** (wildlife, universities, military, civic orgs, sports teams, etc.)
- **Standard issue** plates (the default plate design) — one entry, category `Standard`
- **All motorcycle variants** as separate entries
- **Discontinued/legacy** plates — mark `isCurrent: false`
- **All military plates** including every branch and medal variant individually

## What to Skip

- Vanity/personalized text plates (same design, different custom text)
- Temporary tags
- Dealer/manufacturer plates

---

## Delivery

**Deliver in incremental batches of 50-100 plates** so I can catch schema issues early before you grind through the entire catalog. Include a brief **issues section** at the end of each batch noting:
- Missing images / broken detail pages
- Slug collisions
- Category ambiguities

The build pipeline will validate the schema at build time, so don't worry about programmatic validation — but do enforce slug uniqueness and flag collisions.

---

## Scraper Implementation

**Build a production-ready scraper** (Python 3 script) that:
- Hits the catalog page, visits each detail page, extracts the data
- Outputs the JSON file to the current directory matching the schema above
- Includes a brief progress log to stdout so I can see it working
- Uses standard libraries: `requests`, `BeautifulSoup`
- Runs on Windows with Python 3 (WSL also available if needed)

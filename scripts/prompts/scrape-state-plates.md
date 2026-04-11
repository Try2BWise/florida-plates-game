# Prompt: Scrape License Plate Data for [STATE]

**Goal**: Research and compile a complete list of specialty license plates for **[STATE]** and output a JSON master file matching the schema below.

---

## Ground Rules

- **Only use official government sites** (state DMV, DOR, motor vehicle division). Do not use aggregation sites, collector sites, or third-party catalogs.
- **Include every plate that was ever publicly available**, whether currently issued or discontinued.
- **Legacy plates**: If a plate has had multiple designs over time, create separate entries for each version and link them via `variantOf`.
- **Motorcycle variants**: Include all motorcycle versions, even if they are just a resized version of the passenger plate.
- **Military plates**: Include every branch and medal variant individually.
- **Sports/university plates**: Include all, not just major teams.
- **If a plate's category is ambiguous**, honor the intent of the plate over the sponsor. For example, an FFA plate issued with a university is `Schools` (because of FFA), not `Universities`.
- **When a cause/nonprofit plate doesn't clearly fit** a specific category, use `Civic`.

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

**`id`**: State prefix + kebab-case slug. Example: `ga-university-of-georgia`, `ks-purple-heart`. If the same plate has a current and legacy version, suffix the legacy with `-legacy`. Example: `ga-university-of-georgia`, `ga-university-of-georgia-legacy`.

**`slug`**: Same as `id` but without the state prefix.

**`name` / `displayName`**: Use the official DMV name exactly as listed. For motorcycle variants, append ` (Motorcycle)` to the name. I'll edit names later if needed — the DMV name may also serve as a useful search term.

**`baseName`**: The plate name without any variant suffix. For example, if `name` is `"University of Georgia (Motorcycle)"`, `baseName` is `"University of Georgia"`.

**`variantLabel`**: `null` for the primary version. Use `"Motorcycle"` for motorcycle variants, `"Legacy"` for discontinued versions that have a current replacement.

**`plateType`**: `"passenger"` for standard plates. `"motorcycle"` for motorcycle-only plates.

**`isCurrent`**: `true` if the plate is currently available to order. `false` if retired/discontinued.

**`isActive`**: Same as `isCurrent`.

**`category`**: Must be exactly one of:
`Civic`, `Commercial`, `First Responders`, `Government`, `Health`, `Heritage`, `Military`, `Motorcycle`, `Schools`, `Sports`, `Standard`, `Universities`, `Wildlife & Nature`

Use `Motorcycle` as the category for motorcycle variants.

**`image.path`**: Use the convention `state-packs/[state]/plates/[st]-[slug].jpg` where `[state]` is the lowercase full state name and `[st]` is the 2-letter lowercase abbreviation. Example: `state-packs/georgia/plates/ga-university-of-georgia.jpg`.

**`image.remoteUrl`**: If you can determine the image URL from the official site, include it. This is critical — I'll use these URLs to batch-download images separately. Set to `null` only if no image URL can be determined.

**`sponsor`**: Organization name only (no URLs). Best-effort.

**`searchTerms`**: Lowercase array. Include:
- The plate name and common abbreviations (e.g., `"uga"`, `"ga tech"`)
- Generic terms describing visible plate imagery (e.g., `"bird"` for a Turkey Hunting plate)
- Major plate colors — background color and prominent logo/image colors (e.g., `"red"`, `"blue"`, `"gold"`)

**`variantOf`**: If this is a motorcycle variant, set to the `id` of the passenger version. If this is a legacy variant, set to the `id` of the current version. Only set this when there is a concrete, known connection. Do not guess or assume — it's better to leave it `null` and let me link them manually.

**`relatedPlates`**: Array of `id` strings for plates that are clearly related (e.g., branch-specific military plates, a plate family). Same rule: only set when concrete.

**`sourceRefs`**: One entry per plate. `source` is the agency name, `sourceId` is the plate code or identifier from the source site.

**Slug collisions**: If two plates normalize to the same slug, add a numeric suffix (`-1`, `-2`).

---

## What to Include

- All **specialty/organizational plates** (wildlife, universities, military, civic orgs, sports teams, etc.)
- **Standard issue** plates (the default plate design) — one entry, category `Standard`
- **All motorcycle variants**
- **Discontinued/legacy** plates — mark `isCurrent: false`
- **All military plates** including every branch and medal variant individually

## What to Skip

- Vanity/personalized text plates (same design, different custom text)
- Temporary tags
- Dealer/manufacturer plates

---

## Deliverable

A single JSON file: `[state]-plate-master.json`

Aim for completeness over speed. Optimize the workflow however you see fit — batching by category, alphabetical, etc. The build pipeline will validate the schema at build time, so don't worry about programmatic validation.

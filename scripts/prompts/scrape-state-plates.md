# Prompt: Scrape License Plate Data for [STATE]

**Goal**: Research and compile a complete list of specialty/vanity license plates for **[STATE]** and output a JSON master file matching the schema below.

---

## Output File: `[state]-plate-master.json`

Top-level structure:
```json
{
  "schemaVersion": 1,
  "generatedDate": "YYYY-MM-DD",
  "description": "[State] plate master — sourced from [source name]",
  "sourceFiles": ["[source URLs or names used]"],
  "plates": [ ...plate entries... ]
}
```

---

## Plate Entry Schema

```json
{
  "id": "kebab-case-unique-id",
  "slug": "kebab-case-unique-id",
  "name": "Human Readable Name",
  "displayName": "Human Readable Name",
  "baseName": "Human Readable Name",
  "variantLabel": "Current",
  "plateType": "license_plate",
  "isCurrent": true,
  "isActive": true,
  "category": "Wildlife & Nature",
  "image": {
    "path": "plates/filename.jpg",
    "remoteUrl": null
  },
  "sponsor": "Sponsoring organization name and URL if known",
  "notes": "Any relevant notes about fees, restrictions, or history",
  "metadataBlob": {
    "sourceCategories": ["Original category from source"],
    "aliases": [],
    "rawNames": ["Exact name as it appeared in source"],
    "urls": ["https://source-url-if-any"]
  },
  "searchTerms": ["lowercase name", "alternate keywords"],
  "variantOf": null,
  "relatedPlates": [],
  "sourceRefs": [
    {
      "source": "dmv-website",
      "sourceId": "plate-name-or-url",
      "versionId": "kebab-case-unique-id"
    }
  ]
}
```

---

## Field Rules

**`id` / `slug`**: kebab-case, lowercase, no special chars. If the same plate has a current and legacy version, suffix with `-legacy`. Example: `bear-preserve`, `bear-preserve-legacy`.

**`category`**: Must be exactly one of:
`Civic`, `Commercial`, `First Responders`, `Government`, `Health`, `Heritage`, `Military`, `Motorcycle`, `Schools`, `Sports`, `Standard`, `Universities`, `Wildlife & Nature`

**`plateType`**: Almost always `"license_plate"`. Use `"motorcycle_plate"` only if the plate is explicitly motorcycle-only. Append `" (Motorcycle)"` to the `name` for motorcycle variants.

**`isCurrent`**: `true` if the plate is still available to order today. `false` if retired/discontinued.

**`isActive`**: Same as `isCurrent` for this project.

**`variantLabel`**: `"Current"` for active plates, `"Legacy"` for discontinued versions of a plate that also has a current version. Leave `"Current"` if there's only one version.

**`variantOf`**: If this is a legacy variant, set to the `id` of the current version. Otherwise `null`.

**`image.path`**: Use `"plates/[slug].jpg"` as a placeholder — images will be sourced separately. Set `remoteUrl` to `null`.

**`sponsor`**: Best-effort. Include the issuing organization name and website if listed on the DMV page.

**`searchTerms`**: Lowercase array. Include the plate name, common abbreviations, and the sponsoring org name if notable.

---

## Sources to Check (in order of reliability)

1. The official state DMV / motor vehicle website — look for a "specialty plates" or "personalized plates" catalog
2. The state legislature's fee schedule (often lists all authorized plates with enabling statute)
3. `motorists.org` or `plates.com` for supplemental coverage
4. For discontinued plates, the Internet Archive / Wayback Machine snapshots of the DMV plate catalog

---

## What to Include

- All **specialty/organizational plates** (wildlife, universities, military, civic orgs, sports teams, etc.)
- **Standard issue** plates (the default plate design) — one entry, category `Standard`
- **Motorcycle** variants where they exist as a distinct design
- **Discontinued/legacy** plates if you can find them — mark `isCurrent: false`

## What to Skip

- Vanity/personalized text plates (same design, different text)
- Temporary tags
- Dealer/manufacturer plates

---

## Deliverable

A single JSON file: `[state]-plate-master.json`

Aim for completeness over speed. If a plate's category is ambiguous, make a judgment call and note it in `notes`. If a plate has both a current and legacy design, create two entries linked via `variantOf`.

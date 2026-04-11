# Scrape Georgia License Plate Data

**Goal**: Compile a complete list of Georgia specialty license plates from the official Georgia Department of Revenue site and output a JSON master file.

---

## Source

The **only** source to use is the Georgia Department of Revenue Motor Vehicle Division:

- **Plate catalog**: https://mvd.dor.ga.gov/motor/plates/PlateSelection.aspx
- **Detail page pattern**: `https://mvd.dor.ga.gov/motor/plates/PlateDetails.aspx?PlateCode=XX` (where XX is the 2-character plate code)
- **Image URL pattern**: `https://mvd.dor.ga.gov/motor/plates/images/2004/{CODE}_Large.jpg`

Do not use any other sites. All data must come from the GA DOR pages above.

---

## Workflow

1. Start from the PlateSelection.aspx catalog page. Extract every plate code and name.
2. For each plate code, visit `PlateDetails.aspx?PlateCode=XX` and extract:
   - Plate name
   - Whether it's currently available or discontinued ("New plates are no longer available")
   - Fee information (if shown)
   - Sponsor/beneficiary (if shown)
   - The image URL: `images/2004/{CODE}_Large.jpg`
3. Build the JSON entries using the schema below.
4. Some detail pages may say "Sorry, the sample plate is currently unavailable" — still include the plate entry but set `image.remoteUrl` to the expected URL pattern anyway. I'll verify which images actually exist during download.

---

## Ground Rules

- **Include every plate listed** on PlateSelection.aspx, whether current or discontinued.
- **Include all motorcycle variants** as separate entries with `plateType: "motorcycle"` and `category: "Motorcycle"`.
- **Include all military plates** individually — every branch and medal variant gets its own entry.
- **When a plate's category is ambiguous**, honor the intent of the plate over the sponsor. Use `Civic` as the default for unclear cause/nonprofit plates.
- **Use the official DMV name** exactly as listed. I'll edit names later if needed.
- **Only set `variantOf`** when there is a concrete, known connection (motorcycle variant of a passenger plate, etc.). Don't guess.

---

## Output File: `georgia-plate-master.json`

Top-level structure:
```json
{
  "schemaVersion": 2,
  "state": "Georgia",
  "generatedDate": "YYYY-MM-DD",
  "description": "Georgia plate master — sourced from Georgia Department of Revenue MVD",
  "sourceFiles": [
    "https://mvd.dor.ga.gov/motor/plates/PlateSelection.aspx"
  ],
  "plates": [ ...plate entries... ]
}
```

---

## Plate Entry Schema

```json
{
  "id": "ga-kebab-case-name",
  "slug": "kebab-case-name",
  "name": "Official DMV Name",
  "displayName": "Official DMV Name",
  "baseName": "Official DMV Name",
  "variantLabel": null,
  "plateType": "passenger",
  "isCurrent": true,
  "isActive": true,
  "category": "Civic",
  "image": {
    "path": "state-packs/georgia/plates/ga-kebab-case-name.jpg",
    "remoteUrl": "https://mvd.dor.ga.gov/motor/plates/images/2004/XX_Large.jpg"
  },
  "sponsor": "Organization name if listed",
  "notes": "Discontinued, fees, restrictions, etc.",
  "searchTerms": ["lowercase name", "abbreviations", "colors", "imagery"],
  "variantOf": null,
  "relatedPlates": [],
  "metadataBlob": null,
  "sourceRefs": [
    {
      "source": "Georgia DOR",
      "sourceId": "XX",
      "versionId": null,
      "value": null
    }
  ]
}
```

---

## Field Rules

**`id`**: `ga-` prefix + kebab-case. Example: `ga-university-of-georgia`, `ga-bronze-star-army`. For motorcycle variants: `ga-university-of-georgia-motorcycle`.

**`slug`**: Same as `id` without the `ga-` prefix.

**`plateType`**: `"passenger"` for standard plates. `"motorcycle"` for motorcycle variants.

**`category`**: Must be exactly one of:
`Civic`, `Commercial`, `First Responders`, `Government`, `Health`, `Heritage`, `Military`, `Motorcycle`, `Schools`, `Sports`, `Standard`, `Universities`, `Wildlife & Nature`

Use `Motorcycle` for all motorcycle variants. Use `Military` for all military plates (medals, branches, veterans, etc.).

**`image.remoteUrl`**: Always populate this using the pattern `https://mvd.dor.ga.gov/motor/plates/images/2004/{CODE}_Large.jpg` where `{CODE}` is the plate code from PlateSelection.aspx. I will batch-download these separately and verify which ones actually resolve.

**`image.path`**: Use `state-packs/georgia/plates/ga-{slug}.jpg`. Example: `state-packs/georgia/plates/ga-university-of-georgia.jpg`.

**`searchTerms`**: Lowercase array. Include:
- Plate name and common abbreviations (e.g., `"uga"`, `"ga tech"`, `"gt"`)
- Generic terms for visible imagery (e.g., `"peach"`, `"eagle"`, `"flag"`)
- Major plate colors (e.g., `"red"`, `"black"`, `"gold"`)
- Team mascot names where applicable (e.g., `"bulldogs"`, `"yellowjackets"`)

**`sponsor`**: Organization name only. No URLs.

**`isCurrent`**: `false` if the catalog page says "New plates are no longer available".

**`variantOf`**: For motorcycle variants, set to the `id` of the passenger version. For all others, only set when there's a concrete connection. Leave `null` when unsure.

**`sourceRefs[].sourceId`**: The 2-character plate code from the catalog (e.g., `"GT"`, `"DV"`, `"AA"`).

**Slug collisions**: If two plates normalize to the same slug, add a numeric suffix (`-1`, `-2`).

---

## What to Include

- Every plate listed on PlateSelection.aspx
- All motorcycle variants as separate entries
- All military plates (every branch x medal combination)
- Standard plate designs
- Discontinued plates marked `isCurrent: false`

## What to Skip

- Vanity/personalized text plates (same design, different custom text)
- Temporary tags
- Dealer plates

---

## Deliverable

A single JSON file: `georgia-plate-master.json`

Optimize the workflow however you see fit. The catalog has ~340 plate codes. Take your time and aim for completeness.

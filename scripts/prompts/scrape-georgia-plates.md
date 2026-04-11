# Scrape Georgia License Plate Data

**Goal**: Compile a complete list of Georgia specialty license plates from the official Georgia Department of Revenue site and output a JSON master file.

---

## Source

The **only** source to use is the Georgia Department of Revenue Motor Vehicle Division:

- **Plate catalog**: https://mvd.dor.ga.gov/motor/plates/PlateSelection.aspx
- **Detail page pattern**: `https://mvd.dor.ga.gov/motor/plates/PlateDetails.aspx?PlateCode=XX` (where XX is the 2-character plate code)
- **Image URL pattern**: `https://mvd.dor.ga.gov/motor/plates/images/2004/{CODE}_Large.jpg`

Do not use any other sites. All data must come from the GA DOR pages above. Trust PlateSelection.aspx as the full universe — don't hunt for hidden codes.

---

## Workflow

1. Start from the PlateSelection.aspx catalog page. Extract every plate code and name.
2. For each plate code, visit `PlateDetails.aspx?PlateCode=XX` and extract:
   - Plate name
   - Whether it's currently available or discontinued (any variation of "no longer available", "discontinued", etc.)
   - Fee information (if shown)
   - Sponsor/beneficiary (if shown)
   - The image URL: `images/2004/{CODE}_Large.jpg`
3. Build the JSON entries using the schema below.
4. Some detail pages may say "Sorry, the sample plate is currently unavailable" or fail to load — still include a minimal stub entry. Set `image.remoteUrl` to the expected URL pattern. I'll verify which images actually exist during download.

---

## Ground Rules

- **Include every plate listed** on PlateSelection.aspx, whether current or discontinued.
- **Each plate code = its own entry.** If Georgia lists them as separate codes, they get separate entries.
- **Include all motorcycle variants** as separate entries with `plateType: "motorcycle"` and `category: "Motorcycle"`. Link to the passenger version via `variantOf` even if the name differs slightly.
- **Include all military plates** individually — every branch and medal variant gets its own entry. Any plate with a military connection = category `Military`.
- **All school-branded plates** (including college athletics) = `Universities`. Only use `Sports` for professional teams (Braves, Falcons, Hawks, Atlanta United, etc.).
- **When a plate's category is ambiguous**, honor the intent of the plate over the sponsor. Log the ambiguity in `notes`. Use `Civic` as the default for unclear cause/nonprofit plates.
- **Use the official DMV name** exactly as listed. I'll edit names later if needed.
- **Only set `variantOf`** when there is a concrete, known connection. Don't guess — leave `null` and I'll link manually.
- **If a detail page fails or returns incomplete data**, include a stub entry and flag it in the issues report.

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
  "notes": "Discontinued, fees, restrictions, category notes, etc.",
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

**`id`**: `ga-` prefix + kebab-case. Example: `ga-university-of-georgia`, `ga-bronze-star-army`. For motorcycle variants: `ga-university-of-georgia-motorcycle`. Enforce uniqueness — if two plates normalize to the same slug, add a numeric suffix (`-1`, `-2`) and flag the collision.

**`slug`**: Same as `id` without the `ga-` prefix.

**`name` / `displayName`**: Keep identical. Use the official DMV name exactly as listed. For motorcycle variants, append ` (Motorcycle)`.

**`baseName`**: The parent plate name without variant suffix. If `name` is `"University of Georgia (Motorcycle)"`, `baseName` is `"University of Georgia"`.

**`variantLabel`**: `null` for the primary version. `"Motorcycle"` for motorcycle variants.

**`plateType`**: `"passenger"` for standard plates. `"motorcycle"` for motorcycle variants.

**`isCurrent`**: `false` if the catalog or detail page indicates the plate is discontinued (any wording variation).

**`isActive`**: Same as `isCurrent`.

**`category`**: Must be exactly one of:
`Civic`, `Commercial`, `First Responders`, `Government`, `Health`, `Heritage`, `Military`, `Motorcycle`, `Schools`, `Sports`, `Standard`, `Universities`, `Wildlife & Nature`

Rules:
- `Motorcycle` for all motorcycle variants.
- `Military` for any plate with a military connection. Military wins over all other categories.
- `Universities` for all school-branded plates including college athletics.
- `Sports` only for professional sports teams (Braves, Falcons, Hawks, Atlanta United, Sporting KC, etc.).
- `Civic` as the default for unclear cause/nonprofit plates.
- When ambiguous, log reasoning in `notes`.

**`image.remoteUrl`**: Always populate this using the pattern `https://mvd.dor.ga.gov/motor/plates/images/2004/{CODE}_Large.jpg` where `{CODE}` is the plate code from PlateSelection.aspx. I will batch-download these separately and verify which ones actually resolve.

**`image.path`**: Use `state-packs/georgia/plates/ga-{slug}.jpg`. Example: `state-packs/georgia/plates/ga-university-of-georgia.jpg`.

**`sponsor`**: Organization name only. No URLs. Best-effort.

**`notes`**: Free text. Include discontinued status, fee info, category ambiguity reasoning, restrictions, etc.

**`searchTerms`**: Lowercase array. **Aim for high recall** — I can always trim, but I can't easily add what I don't have. Include:
- Plate name and common abbreviations (e.g., `"uga"`, `"ga tech"`, `"gt"`)
- Generic terms for visible imagery (e.g., `"peach"`, `"eagle"`, `"flag"`)
- Major plate colors — only colors you're confident about from the plate name or description. Don't guess from images.
- Team mascot names where applicable (e.g., `"bulldogs"`, `"yellowjackets"`)

**`variantOf`**: For motorcycle variants, set to the `id` of the passenger version. For all others, only set when there's a concrete connection. Leave `null` when unsure.

**`sourceRefs[].sourceId`**: The 2-character plate code from the catalog (e.g., `"GT"`, `"DV"`, `"AA"`).

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

## Delivery

**Deliver in incremental batches of 50-100 plates** so I can catch schema issues early before you grind through all 340 codes. Include a brief **issues section** at the end of each batch noting:
- Missing images / broken detail pages
- Slug collisions
- Category ambiguities

---

## Scraper Implementation

**Build a production-ready scraper** (Python 3 script) that:
- Hits PlateSelection.aspx, extracts all plate codes
- Visits each PlateDetails.aspx?PlateCode=XX page and extracts data
- Outputs `georgia-plate-master.json` to the current directory matching the schema above
- Includes a brief progress log to stdout (e.g., `[12/340] GT — Georgia Institute of Technology`)
- Uses standard libraries: `requests`, `BeautifulSoup`
- Runs on Windows with Python 3 (WSL also available if needed)
- Handles retries for transient failures
- Includes a polite delay between requests (1-2 seconds) to avoid overwhelming the server

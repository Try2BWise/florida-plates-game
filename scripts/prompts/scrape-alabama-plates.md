# Scrape Alabama License Plate Data

**Goal**: Compile a complete list of Alabama specialty license plates from the official Alabama Department of Revenue site and output a JSON master file.

---

## Source

The **only** source to use is the Alabama Department of Revenue:

- **Plate catalog**: https://www.revenue.alabama.gov/license-plates/
- **Image URL pattern**: `https://www.revenue.alabama.gov/wp-content/uploads/[YEAR]/[MONTH]/[FILENAME].jpg` (extract actual URLs from the catalog page — filenames vary)

The catalog is a searchable, paginated archive (50 plates per page, ~395 total). Each plate has an expandable detail section with fees, eligibility, and code sections.

Do not use any other sites. All data must come from the AL DOR pages above. Trust the catalog page as the full universe — don't hunt for hidden plates.

---

## Workflow

1. Paginate through the full catalog at `/license-plates/` extracting every plate entry.
2. For each plate, extract:
   - Plate name
   - Image URL (the `src` attribute from the thumbnail)
   - Vehicle type (Passenger, Motorcycle, Truck, etc.)
   - Whether it's currently available or discontinued
   - Fee/eligibility info from the expandable detail section
3. Build the JSON entries using the schema below.
4. If a plate's detail section fails to load or is empty, include a stub entry with the image and name from the listing.

---

## Ground Rules

- **Include every plate listed** on the catalog, whether current or discontinued.
- **Each catalog entry = its own entry.** If Alabama lists them as separate entries, they get separate entries.
- **Include all motorcycle variants** as separate entries with `plateType: "motorcycle"` and `category: "Motorcycle"`. Link to the passenger version via `variantOf` even if the name differs slightly.
- **Include all military plates** individually — every branch and medal variant gets its own entry. Any plate with a military connection = category `Military`. Military wins over all other categories.
- **All school-branded plates** (including college athletics) = `Universities`. Only use `Sports` for professional sports teams.
- **When a plate's category is ambiguous**, honor the intent of the plate over the sponsor. Log the ambiguity in `notes`. Use `Civic` as the default for unclear cause/nonprofit plates.
- **Use the official catalog name** exactly as listed. I'll edit names later if needed.
- **Only set `variantOf`** when there is a concrete, known connection. Don't guess — leave `null` and I'll link manually.
- **If a detail section is empty or fails**, include a stub entry and flag it in the issues report.
- **Any variation of discontinued language** ("no longer available", "discontinued", "retired", etc.) means `isCurrent: false`. Do NOT include this language in the plate name — capture it only in `isCurrent` and optionally in `notes`.

---

## Output File: `alabama-plate-master.json`

Top-level structure:
```json
{
  "schemaVersion": 2,
  "state": "Alabama",
  "generatedDate": "YYYY-MM-DD",
  "description": "Alabama plate master — sourced from Alabama Department of Revenue",
  "sourceFiles": [
    "https://www.revenue.alabama.gov/license-plates/"
  ],
  "plates": [ ...plate entries... ]
}
```

---

## Plate Entry Schema

```json
{
  "id": "al-kebab-case-name",
  "slug": "kebab-case-name",
  "name": "Official Catalog Name",
  "displayName": "Official Catalog Name",
  "baseName": "Official Catalog Name",
  "variantLabel": null,
  "plateType": "passenger",
  "isCurrent": true,
  "isActive": true,
  "category": "Civic",
  "image": {
    "path": "state-packs/alabama/plates/al-kebab-case-name.jpg",
    "remoteUrl": "https://www.revenue.alabama.gov/wp-content/uploads/YYYY/MM/filename.jpg"
  },
  "sponsor": "Organization name if listed",
  "notes": null,
  "searchTerms": ["abbreviations", "mascots", "colors", "imagery"],
  "variantOf": null,
  "relatedPlates": [],
  "metadataBlob": null,
  "sourceRefs": [
    {
      "source": "Alabama DOR",
      "sourceId": "plate-name-or-code",
      "versionId": null,
      "value": null
    }
  ]
}
```

---

## Field Rules

**`id`**: `al-` prefix + kebab-case. Example: `al-university-of-alabama`, `al-purple-heart`. For motorcycle variants: `al-university-of-alabama-motorcycle`. Enforce uniqueness — if two plates normalize to the same slug, add a numeric suffix (`-1`, `-2`) and flag the collision.

**`slug`**: Same as `id` without the `al-` prefix.

**`name` / `displayName`**: Keep identical. Use the official catalog name. Do NOT include "discontinued" or "no longer available" text in the name. For motorcycle variants, append ` (Motorcycle)`.

**`baseName`**: The parent plate name without variant suffix. If `name` is `"University of Alabama (Motorcycle)"`, `baseName` is `"University of Alabama"`.

**`variantLabel`**: `null` for the primary version. `"Motorcycle"` for motorcycle variants.

**`plateType`**: `"passenger"` for standard plates. `"motorcycle"` for motorcycle variants.

**`isCurrent`**: `false` if the plate is discontinued (any wording variation).

**`isActive`**: Same as `isCurrent`.

**`category`**: Must be exactly one of:
`Civic`, `Commercial`, `First Responders`, `Government`, `Health`, `Heritage`, `Military`, `Motorcycle`, `Schools`, `Sports`, `Standard`, `Universities`, `Wildlife & Nature`

Rules:
- `Motorcycle` for all motorcycle variants.
- `Military` for any plate with a military connection. Military wins over all other categories.
- `Universities` for all school-branded plates including college athletics.
- `Sports` only for professional sports teams.
- `Civic` as the default for unclear cause/nonprofit plates.
- Antique/historic vehicle plates = `Heritage`.
- Vanity/prestige plates = `Standard`.
- When ambiguous, log reasoning in `notes`.

**`image.remoteUrl`**: Extract the actual image URL from the catalog page. This is critical — I'll use these URLs to batch-download images separately.

**`image.path`**: Use `state-packs/alabama/plates/al-{slug}.jpg`.

**`sponsor`**: Organization name only. No URLs. Best-effort.

**`notes`**: Free text. Keep it lean — don't include boilerplate about fees or discontinued status (that's captured elsewhere). Only include genuinely useful context like eligibility requirements or category ambiguity reasoning.

**`searchTerms`**: Lowercase array. **Aim for high recall** — I can always trim. Include:
- Common abbreviations (e.g., `"bama"`, `"auburn"`, `"uab"`)
- Mascot names (e.g., `"crimson tide"`, `"tigers"`, `"blazers"`)
- Generic terms for visible imagery (e.g., `"eagle"`, `"flag"`, `"deer"`)
- Major plate colors you're confident about from the name or description
- Do NOT include the plate name itself as a search term (redundant)
- Do NOT include the category name or its component words as search terms (redundant)

**`variantOf`**: For motorcycle variants, set to the `id` of the passenger version. For all others, only set when there's a concrete connection. Leave `null` when unsure.

---

## What to Include

- Every plate on the catalog
- All motorcycle variants as separate entries
- All military plates individually
- Standard plate designs
- Discontinued plates marked `isCurrent: false`

## What to Skip

- Vanity/personalized text plates (same design, different custom text)
- Temporary tags
- Dealer plates

---

## Delivery

**Deliver in incremental batches of 50-100 plates** so I can catch schema issues early. Include a brief **issues section** at the end of each batch noting:
- Missing images
- Slug collisions
- Category ambiguities

---

## Scraper Implementation

**Build a production-ready scraper** (Python 3 script) that:
- Paginates through the full catalog at `/license-plates/`
- Extracts plate name, image URL, vehicle type, and detail info for each entry
- Outputs `alabama-plate-master.json` to the current directory matching the schema above
- Includes a brief progress log to stdout (e.g., `[12/395] University of Alabama`)
- Uses standard libraries: `requests`, `BeautifulSoup`
- Runs on Windows with Python 3 (WSL also available if needed)
- Handles retries for transient failures
- Includes a polite delay between requests (1-2 seconds)

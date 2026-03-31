# AI Plate Scrape Template

Use this prompt when asking another AI job to scrape or assemble plate data for a new state pack.

## Goal

Return a JSON dataset that matches the schema in [plate-master.schema.json](/C:/Users/bwise/OneDrive/Gorilla%20Grin/florida-plates-game/docs/customization/plate-master.schema.json).

The output should be shaped for authoring and later cleanup, not for direct runtime use.

## Prompt Template

```text
You are collecting license plate data for the state of [STATE NAME].

Return JSON only.
Do not include commentary, markdown fences, or explanation.

Use this schema:
- top-level fields: schemaVersion, state, generatedDate, description, sourceFiles, plates
- each plate must include:
  - id
  - slug
  - name
  - displayName
  - baseName
  - variantLabel
  - plateType
  - isCurrent
  - isActive
  - category
  - image { path, remoteUrl }
  - sponsor
  - notes
  - searchTerms
  - variantOf
  - relatedPlates
- optional fields:
  - metadataBlob
  - sourceRefs

Rules:
- use lowercase hyphenated ids and slugs
- use plateType = "license_plate" unless a different type is clearly required
- keep searchTerms lowercase
- include abbreviations, nicknames, mascots, colors, and obvious visual descriptors when useful
- use category values only from this list:
  - Accessibility
  - Civic & Causes
  - Commercial & Fleet
  - Education & Culture
  - Government & Official
  - Health & Family
  - Historical & Antique
  - Military Honors & History
  - Military Service
  - Motorcycle Plates
  - Nature & Wildlife
  - Professional Sports
  - Public Service
  - Special Use
  - Sports & Recreation
  - Standard Plates
  - Travel & Tourism
  - Universities
- if a plate is clearly a legacy/current/motorcycle variant, preserve that using:
  - baseName
  - displayName
  - variantLabel
  - variantOf when appropriate
- if data is uncertain, prefer null or an empty array over invented detail
- if image filenames are unknown, still provide remoteUrl and a reasonable placeholder path

Desired quality:
- include all known special, standard, university, military, public service, sports, and motorcycle plates
- avoid duplicate logical plates unless they are true variants
- preserve source provenance when available in sourceRefs
```

## Notes For Human Review

- The scrape output is expected to need a curation pass.
- `metadataBlob` and `sourceRefs` are useful for provenance and cleanup.
- The runtime generator will later normalize search terms and trim authoring-only fields.

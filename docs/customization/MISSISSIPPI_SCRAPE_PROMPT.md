# Mississippi Starter Prompt

Use this with another AI job to collect Mississippi plate data in a format that is close to this project's authoring pipeline.

## Primary Goal

Return JSON only, matching [plate-master.schema.json](/C:/Users/bwise/OneDrive/Gorilla%20Grin/florida-plates-game/docs/customization/plate-master.schema.json).

The output should be a Mississippi master dataset for later cleanup and runtime generation.

## Paste-Ready Prompt

```text
You are collecting license plate data for the state of Mississippi.

Return JSON only.
Do not include commentary, markdown fences, or explanation.

Your output must match this authoring shape:
- top-level fields:
  - schemaVersion
  - state
  - generatedDate
  - description
  - sourceFiles
  - plates
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
- optional:
  - metadataBlob
  - sourceRefs

Rules:
- use lowercase hyphenated ids and slugs
- use plateType = "license_plate" unless another type is clearly required
- keep searchTerms lowercase
- include useful abbreviations, mascots, colors, nicknames, and visual descriptors
- use only these categories:
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
- if a plate is a current, legacy, or motorcycle variant, preserve that using:
  - baseName
  - displayName
  - variantLabel
  - variantOf when appropriate
- if data is uncertain, prefer null or [] over invented details
- if exact local filenames are unknown, still provide remoteUrl and a reasonable placeholder path like plates/example.png

Mississippi-specific collection goals:
- include standard/base plates
- include specialty or cause plates
- include university plates
- include military and veterans plates
- include public service plates
- include professional sports plates if any exist
- include motorcycle plates if available
- include historic/antique/special-use plates where relevant to gameplay

Desired quality:
- avoid duplicate logical plates unless they are true variants
- preserve source provenance in sourceRefs when possible
- preserve raw names, aliases, and source categories in metadataBlob when possible
```

## Suggested Inputs To Give The Other AI

- official Mississippi DMV / DOR plate pages
- any official brochure PDFs
- archived image lists if official pages are incomplete
- a note that this dataset is for a plate-collection game, so search-friendly names matter

## Expected Follow-Up

After the scrape:

1. review categories
2. review duplicates and variants
3. review search terms
4. normalize image filenames
5. decide what Mississippi-specific badges and geography should exist

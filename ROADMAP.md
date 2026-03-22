# FL Plates Roadmap

This roadmap breaks the next phases of `FL Plates` into manageable versioned releases.

## v1.3

Data foundation and multi-version support.

### Goals

- import the new ZIP source
- define a canonical plate schema
- support multiple visual versions for one logical plate
- preserve one shared found state per logical plate
- normalize categories into one app taxonomy
- choose which version is the default tile image
- show all versions in the enlarged modal with horizontal scrolling

### Checklist

- inspect ZIP folder structure
- inspect ZIP JSON schema
- inspect charity metadata JSON schema
- design merged canonical schema
- define logical-plate identity rules
- define version identity rules
- define canonical app categories
- write import/transform script
- migrate current plate data into new schema
- update tile rendering to use default version
- update preview modal to show version scroller
- ensure find/unfind works at logical plate level
- verify no duplicate logical plates remain
- verify build and existing gameplay flows still work

### Definition Of Done

- one logical plate can contain multiple image versions
- tile shows one default/current version
- preview modal shows all versions if present
- found state applies to the plate, not the individual version

## v1.4

Metadata and plate details.

### Goals

- add charity/sponsor metadata
- add a clean info/details affordance
- surface intro year and confidence
- optionally surface rarity visually, but not as scoring

### Checklist

- map sponsor/charity fields into canonical schema
- add details/info button in preview modal
- create details panel or expandable section
- show sponsor name
- show sponsor URL if available
- show description if available
- show introduced year
- show year confidence when uncertain
- show rarity as informational only
- verify layout stays uncluttered on phone

### Definition Of Done

- users can access plate details on demand
- main tile list remains visually clean
- sponsor/year/rarity info is available without clutter

## v1.5

Curated search.

### Goals

- add non-title keyword search
- support aliases, colors, motifs, nicknames, sponsor terms
- search across the stabilized full catalog

### Checklist

- add `searchTerms` field to canonical schema
- update search logic to include title + category + metadata + search terms
- draft first-pass search terms for all current plates
- include school nicknames and abbreviations
- include sports aliases
- include strong visual motifs
- include color/theme terms where useful
- include sponsor/charity names where useful
- review edge cases and noisy terms
- test search on real examples like `butterfly`, `surf`, `gators`, `orange`

### Definition Of Done

- search finds plates by visual cues and aliases, not just title text

## v1.6

Optional rarity and history features.

### Goals

- use metadata more creatively without making scoring fragile

### Checklist

- define rarity display system
- consider rarity-based badges
- consider intro-year/history badges
- consider rarity filters
- decide whether any scoring use is appropriate
- only proceed if data quality is good enough

### Definition Of Done

- rarity/history add interest without confusing core gameplay

## Recommended Order

1. `v1.3` schema + import + versions
2. `v1.4` info/details metadata
3. `v1.5` curated search
4. `v1.6` rarity/history experiments

## Immediate Next Step

For `v1.3`, begin with:

- inspect the ZIP
- inspect the charity metadata JSON
- draft the canonical schema

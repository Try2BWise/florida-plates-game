# FL Plates Roadmap

This roadmap reflects the current released state of `FL Plates` after `v1.3.0` and outlines the next likely release tracks.

## Current Release

Current public release: `v1.3.0`

## Shipped In v1.3.0

`v1.3.0` ended up covering the original data-foundation goals plus a meaningful amount of metadata and UX polish.

### Delivered

- imported the new ZIP-based plate source into the app
- added a canonical generated catalog pipeline
- merged legacy and current data into one logical plate model
- supported multiple versions per logical plate
- preserved shared found state across versions
- replaced the old coarse category model with a more granular taxonomy
- updated the enlarged modal to support version switching
- surfaced beneficiary/details content directly in the enlarged modal
- removed a large amount of source boilerplate/noise from sponsor and version notes
- added duplicate-design cleanup tooling and used it to reduce redundant versions
- improved tile interaction by splitting:
  - image tap for enlarge
  - title tap for found / not found
- added a one-time onboarding tip for the split tap behavior
- replaced the browser clear confirmation with an in-app confirmation modal

### Result

- the live catalog is now based on a normalized generated source
- current and legacy plate designs can coexist cleanly
- details are available in-context without cluttering the main list

## v1.4

Curated search and discovery improvements.

### Goals

- make search useful for visual cues, aliases, nicknames, and themes
- support the current stabilized catalog before another big import wave
- improve “I saw a butterfly / gator / sunset / orange plate” style lookup

### Checklist

- add `searchTerms` support to the canonical plate schema
- update search to include:
  - plate name
  - category
  - aliases
  - sponsor/beneficiary text where helpful
  - curated search terms
- draft a first-pass keyword set for the full current catalog
- include school abbreviations and nicknames
- include sports team aliases
- include strong visual motifs
- include useful color/theme descriptors
- review noisy or overly broad terms
- test against real examples like:
  - `butterfly`
  - `surf`
  - `gators`
  - `orange`

### Definition Of Done

- search finds plates by what players notice, not just by exact plate title text

## v1.5

Metadata refinement and optional collection depth.

### Goals

- improve the quality and usefulness of plate metadata without cluttering the UI
- decide which metadata should stay informational versus becoming gameplay

### Checklist

- review sponsor/beneficiary text for any remaining noise
- decide whether sponsor URLs should be shown or linked
- decide whether introduction-year data should remain hidden or return in a lighter form
- evaluate whether popularity/rarity should appear visually in the modal
- consider new badge families driven by:
  - rarity
  - charity/cause collections
  - version collections
- keep scoring untouched unless the data quality becomes trustworthy enough

### Definition Of Done

- metadata feels more polished and useful without making the app visually busier or less trustworthy

## v1.6

Future catalog expansion and richer browsing.

### Goals

- prepare for the next source expansion without destabilizing search or the current taxonomy
- make it easier to browse a larger catalog once more plates arrive

### Checklist

- review the next incoming image/metadata package
- extend the generator/mapping rules for the next source
- preserve logical plate identity and version continuity
- decide whether additional browse modes are needed for a larger catalog
- consider richer grouping options that do not overcomplicate the main game screen

### Definition Of Done

- the app can absorb another plate expansion without undoing the clarity gained in `v1.3`

## Parking Lot

These are intentionally not committed to the next release yet.

- persistent “once earned, always earned” badges
- rarity-based scoring
- history/year-based gameplay
- in-app miscategorization reporting
- richer map provider or real slippy-map implementation
- custom badge artwork beyond the current icon system

## Recommended Order

1. `v1.4` curated search
2. `v1.5` metadata refinement and optional rarity/badge work
3. `v1.6` next catalog expansion support

## Immediate Next Step

For the next cycle, the best target is:

- build the curated `searchTerms` system
- draft the first-pass keyword set for the current `v1.3` catalog
- test it against the kinds of “visual memory” searches players actually use

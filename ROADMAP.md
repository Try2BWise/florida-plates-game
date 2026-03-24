# FL Plates Roadmap

This roadmap reflects the current released state of `FL Plates` after `v1.4.0` and outlines the next likely release tracks.

## Current Release

Current public release: `v1.4.0`

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

## Shipped In v1.4.0

`v1.4.0` focused on a full merit badge refresh, richer place-aware progress, and a more compact Explore experience.

### Delivered

- refreshed the merit badge set to match the revised badge definitions
- added new badge families for:
  - Those Who Serve
  - All Around Florida
- reworked Places badges while keeping them distinct from All Around Florida
- extended discovery storage to capture county and state metadata
- kept time-of-day badges defined but unshipped
- redesigned badge cards into a denser two-column layout
- moved most badge details into a dedicated badge modal
- improved supporting sighting details in the badge modal
- added a Timeline tab to Explore with:
  - date grouping
  - ascending / descending sort
  - expandable and collapsible day groups
- improved control readability in dark mode
- moved `Clear found` into Settings while keeping the in-app confirmation flow
- enlarged and centered the Explore panel and badge modal
- improved the search affordance so opening search focuses the field and raises the keyboard on mobile

### Result

- badge progress is richer, more location-aware, and easier to browse
- Explore scales better as the badge catalog grows
- the app is better prepared for future social, rarity, and search improvements

## Architecture Groundwork

This project now has an explicit tracked direction toward a reusable specialty-plate game framework, but without forcing a premature rewrite.

### Phase 0: Track The Direction

Completed.

- identified the reusable-framework effort as a real architectural track
- documented the phased extraction strategy so future work can be evaluated against it
- established the rule that new Florida-only rules should prefer Florida-specific config/domain files over being added directly to `App.tsx`

### Phase 1: Low-Risk Preparation

Completed.

- introduced a lightweight `GameDefinition` type
- created a first Florida game config/module
- moved branding/share/help/about copy into the Florida config
- moved Florida badge group labels and symbols out of the main component
- moved Florida regional/county badge constants out of the main component

### Why This Matters

- future Florida work has a clearer place to live
- the app now has a real seam for state/game-specific configuration
- future extraction work can happen incrementally instead of as a risky rewrite

## v1.5

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
- include sports aliases
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

## v1.6

Metadata refinement and future expansion support.

### Goals

- improve the quality and usefulness of plate metadata without cluttering the UI
- prepare for the next source expansion without destabilizing search or the current taxonomy

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
- review the next incoming image/metadata package
- extend the generator/mapping rules for the next source
- preserve logical plate identity and version continuity
- decide whether additional browse modes are needed for a larger catalog
- consider richer grouping options that do not overcomplicate the main game screen

### Definition Of Done

- metadata feels more polished and useful without making the app visually busier or less trustworthy
- the app can absorb another plate expansion without undoing the clarity gained in `v1.3`

## v1.7+

Optional social layer and cloud identity.

### Goals

- add an optional social layer without making accounts required to play
- keep identity low-friction, anonymous-first, and privacy-first
- support future friend/buddy features and global leaderboard concepts
- preserve extra protections around name and location data, especially for minors

### Vision

- players can remain fully local and unhooked if they want
- players can optionally create a persistent identity
- identity can begin as a generated anonymous handle
- players can later add an optional display name and eventually link external networks
- the social model should feel more like gaming buddies than general social media

### Default Shareable Data

- total plates found
- badges earned:
  - count
  - detail
- recent finds
- category completion percentages
- rarity / hard-to-find progress

### Optional Shareable Data

- region-based badge progress
- map pins / location-based views

### Default Private Data

- precise coordinates
- real name
- detailed location data unless explicitly enabled

### Privacy Expectations

- privacy-first defaults
- optional social participation, never required for play
- anonymous handles are acceptable as a starting point
- location sharing must be opt-in
- precise location sharing may need stronger restrictions or age gating

### Likely Phases

- optional cloud identity and sync
- privacy-aware public/private player profile
- global leaderboard
- badge rarity and difficulty percentages based on the player base
- friends / buddy connections
- optional regional or map-based social views

### Definition Of Done

- a future social release should work without requiring a native app first
- social participation remains optional
- privacy defaults are strong enough that players, including minors, are not pushed into oversharing

## Parking Lot

These are intentionally not committed to the next release yet.

- persistent “once earned, always earned” badges
- shipped time-of-day badges
- rarity-based scoring
- history/year-based gameplay
- in-app miscategorization reporting
- richer map provider or real slippy-map implementation
- custom badge artwork beyond the current icon system
- optional social identity, leaderboard, and buddy-sharing features

## Recommended Order

1. `v1.5` curated search
2. `v1.6` metadata refinement and next catalog expansion support
3. `v1.7+` optional social layer and cloud identity

## Immediate Next Step

For the next cycle, the best target is:

- implement curated search terms for the stabilized catalog
- test search against the most visually distinctive plates
- keep the time-of-day badge set documented for a later release

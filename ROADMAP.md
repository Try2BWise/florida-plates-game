# FL Plates Roadmap

This roadmap reflects the current released state of `FL Plates` after `v1.5.0` and outlines the most useful next release tracks.

## Current Release

Current public release: `v1.5.0`

## Shipped In v1.3.0

`v1.3.0` established the modern catalog foundation.

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

- the live catalog moved to a normalized generated source
- current and legacy plate designs can coexist cleanly
- details are available in-context without cluttering the main list

## Shipped In v1.4.0

`v1.4.0` focused on merit badges, place-aware progress, and a denser Explore experience.

### Delivered

- refreshed the merit badge set to match the revised badge definitions
- added new badge families for:
  - Those Who Serve
  - All Around Florida
- reworked Places badges while keeping them distinct from All Around Florida
- extended discovery storage to capture county and state metadata
- kept time-of-day badges defined but unshipped
- redesigned badge browsing around a denser Explore experience
- added a Timeline tab to Explore with:
  - date grouping
  - ascending / descending sort
  - expandable and collapsible day groups
- improved control readability in dark mode
- moved `Clear found` into Settings while keeping the in-app confirmation flow
- enlarged and centered the Explore panel and badge modal
- improved the search affordance so opening search focuses the field and raises the keyboard on mobile

### Result

- badge progress became richer and more location-aware
- Explore scales better as the badge catalog grows
- the app became better prepared for future social, rarity, and search improvements

## Shipped In v1.5.0

`v1.5.0` was a major data and asset refactor release that also cleaned up the project for future state expansion.

### Delivered

- replaced the old single runtime dataset with a two-file plate data flow:
  - editable master dataset
  - generated runtime driver
- added a dedicated plate-driver generator and folded legacy ID migration into it
- retired the old `v1.3` catalog-generation pipeline and older brochure-era helper scripts
- stopped tracking `dist/` and added repo cleanup via `.gitignore`
- moved badge graphics into a dedicated `public/badges` asset folder
- added and assigned new badge art selectively
- refined the badge modal to better match the plate modal
- merged `tags` into normalized lowercase `searchTerms`
- added first-pass visual search-term enrichment for a few distinctive plates
- reorganized categories to better fit the larger catalog, including:
  - `Public Service`
  - `Professional Sports`
  - `Sports & Recreation`
  - `Travel & Tourism`
  - `Military Service`
  - `Military Honors & History`
  - `Motorcycle Plates` as a category override
- cleaned up additional duplicate and naming issues in the imported catalog
- updated user-facing wording from `specialty plates` to `license plates`
- updated repo/app references for the `gorillagrin.com/florida-plates-game` custom domain
- completed framework groundwork beyond the original Phase 1 seam by:
  - shifting the runtime app to the generated plate driver
  - making future state-swapping more realistic without a rewrite

### Post-release maintenance already applied

- fixed badge browsing so all badges are always visible, with unearned badges dimmed
- ensured motorcycle-category plates display `(Motorcycle)` consistently in sorted views
- corrected a few motorcycle and category placement issues discovered after release

### Result

- the project now has a cleaner source-of-truth data model
- runtime plate data is smaller and easier to reason about
- badge assets and plate assets have clearer separation
- future framework extraction and editor tooling are much easier to envision

## Architecture Groundwork

This project now has an explicit tracked direction toward a reusable plate-game framework, but without forcing a premature rewrite.

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

### Phase 2: Isolate Domain Logic

Started, but not finished.

Already moving in this direction:

- the app now consumes a generated plate driver instead of a Florida-only hand-shaped runtime catalog
- Florida-specific category and naming rules are increasingly data-driven
- the new master/runtime split creates a better seam for future tooling and future states

Still to do:

- separate generic badge evaluation from Florida badge definitions
- move more Florida-specific grouping and progression logic out of the main app flow
- make more of the browse/search behavior consume declarative game data rather than Florida assumptions

## v1.6

Search enrichment and taxonomy polish.

### Goals

- make search genuinely useful for what players notice at a glance
- finish the catalog curation work that `v1.5.0` only started
- tighten category placement now that the expanded dataset is in place

### Checklist

- curate `searchTerms` across the full catalog, not just a few test plates
- add school abbreviations and nicknames where still missing
- add professional sports aliases and common fan terms
- add strong visual descriptors where helpful:
  - animals
  - colors
  - scenery
  - symbols
- decide whether sponsor and note text should also participate in search
- continue category cleanup for obvious misfits
- review sorted-list naming for clarity and consistency
- test search against real examples like:
  - `orange`
  - `butterfly`
  - `gators`
  - `police`
  - `beach`
  - `horse`

### Definition Of Done

- search finds plates by what players notice, not just by exact title text
- category placement feels stable enough that future cleanup becomes occasional maintenance instead of a rework

## v1.6.x

Mapping and geography polish.

### Goals

- make the map feel like a real part of the game instead of a rough secondary view
- improve confidence in saved sightings, pins, and regional progress
- strengthen low-signal and offline behavior for mapping-related features

### Checklist

- review how quickly newly found plates appear on the map after background location enrichment
- improve handling for finds with no resolved locality or delayed geocode data
- refine the current pin display so dense areas are easier to read
- evaluate whether clustering, regional summaries, or lighter grouping would improve usability
- tighten map copy and empty states so players understand what the map is showing
- review county and regional mapping data for consistency with badge logic
- test the map and location workflow in weak-signal travel conditions
- decide when the current custom pin map should give way to a richer slippy-map experience

### Definition Of Done

- the map is useful for reviewing discoveries instead of feeling experimental
- pins, locality data, and regional progress behave predictably enough to support future social and pack-based expansion

## v1.7

Framework extraction Phase 2 and editor-readiness.

### Goals

- keep paying down the Florida-specific technical debt without over-abstracting
- shape the codebase so a separate future driver editor has a clean target
- make another state feasible without committing to it yet

### Checklist

- separate generic badge evaluation from Florida badge definitions
- move more Florida-specific constants and rules out of `App.tsx`
- document the master-data editing workflow more clearly
- decide which runtime fields are truly required for game operation
- further trim authoring-only clutter from runtime output where safe
- identify what a future external editor would need to manage:
  - plate naming
  - category assignment
  - image binding
  - search term curation
  - variant relationships
- decide whether `variantOf` / `relatedPlates` stay as-is or evolve into a cleaner relationship model

### Definition Of Done

- the app shell is more clearly separable from Florida-specific game rules
- the future standalone editor has a more stable schema target

## v1.8+

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
- a standalone external driver editor

## Engagement Ideas

These are good candidates for future fun-factor improvements, but they are intentionally below search, taxonomy, and modularization in priority.

### Strong candidates

- streaks
- weekly or rotating challenges
- hidden surprise badges
- category bingo or mini-goal cards
- version hunter badges
- “almost complete” nudges for categories or badge groups
- plate of the day
- richer personal stats like:
  - most-seen plate
  - rarest found plate
  - closest category to completion

### Guardrails

- avoid turning the game into chore-like task management
- avoid too many simultaneous goals
- avoid noisy notification-style mechanics
- prefer delight and momentum over complicated scoring systems

## iPhone-First UX Checklist

This app is still a web app, but iPhone is the primary target experience. These checkpoints help guide future work so the PWA feels more like a polished installed app.

### Already strong

- installable Home Screen experience exists
- modals and utility panels are already touch-oriented
- search now focuses automatically when opened
- offline behavior has improved through stronger caching and background enrichment
- found-state capture is now immediate instead of waiting on reverse geocoding

### Still worth improving

#### Install and onboarding

- detect Safari vs non-Safari and show the right install guidance
- make install instructions feel more like first-run onboarding and less like documentation
- consider a one-time install prompt or coachmark for iPhone users

#### Startup and loading

- reduce perceived startup delay even further on weak signal
- make offline readiness more obvious to the user
- consider a friendlier offline/loading state if startup work is still in progress

#### Touch ergonomics

- keep primary controls in thumb-friendly areas
- avoid small controls near screen edges
- continue reviewing tap targets against real iPhone usage

#### Keyboard and search flow

- verify the search field remains visible when the keyboard opens on smaller iPhones
- check collapsed/expanded search behavior in installed-mode Safari vs Home Screen mode

#### Modal and panel behavior

- keep moving overlays toward iOS sheet-like behavior where it feels natural
- review whether large overlays should support better swipe or dismiss affordances later
- make sure important actions never sit too close to the home-indicator area

#### Offline confidence

- consider a subtle offline indicator when the network is unavailable
- consider clearer messaging when location enrichment is deferred and will fill in later
- ensure low-signal behavior never feels like a failed tap or frozen app

#### Visual polish

- continue reviewing spacing and safe-area usage on real iPhones
- make installed-mode presentation feel intentional and app-like
- keep reducing “web page” feel in high-use panels

### Good decision rule

When evaluating a new feature, ask:

- does it help or hurt one-handed use on iPhone?
- does it still behave well with poor or no signal?
- does it feel reasonable in Home Screen installed mode?
- does it require browser capabilities that are fragile on iPhone?

If the answer is risky, prefer the simpler interaction.

## Future Modularization

This section captures the likely path from `FL Plates` to a generic multi-state `plates-game` PWA shell.

### Target Model

The future architecture should split into three layers:

1. shell app
2. state pack
3. state index

### Product Direction

The long-term distribution target should be:

- a single store app
- pack-based state modes
- one active state at a time

The project should not plan around publishing and maintaining one separate app-store app per state.

#### Shell App

The reusable PWA engine should own:

- startup
- pack selection
- pack download and caching
- plate browsing
- search
- found / not found state
- badges
- timeline
- map
- settings
- offline behavior

The shell should avoid hardcoding Florida-specific logic.

#### State Pack

Each state pack should own:

- branding
- categories
- runtime plate driver
- badge definitions
- geography definitions
- asset manifests

Each pack should be installable and cacheable independently.

#### State Index

A small server-hosted index should answer:

- which states are available
- which version each pack is on
- where each pack manifest lives

This can stay static-hosted.

### Proposed Repo Structure

```text
src/
  app/
    components/
    hooks/
    lib/
    shell/
  packs/
    florida/
      manifest.json
      badges.json
      geography.json
    arkansas/
      manifest.json
      badges.json
      geography.json
  data/
    generated/
      florida-plate-driver.generated.json
      arkansas-plate-driver.generated.json
  config/
    shellConfig.ts
  types.ts

public/
  state-packs/
    florida/
      manifest.json
      assets/
        plates/
        badges/
        branding/
    arkansas/
      manifest.json
      assets/
        plates/
        badges/
        branding/
  state-index.json
```

### Proposed JSON Schemas

#### `state-index.json`

Purpose:
- list available packs
- tell the shell where to find each pack manifest

Suggested shape:

```json
{
  "version": 1,
  "states": [
    {
      "id": "florida",
      "name": "Florida",
      "version": "1.5.0",
      "manifestUrl": "/state-packs/florida/manifest.json"
    },
    {
      "id": "arkansas",
      "name": "Arkansas",
      "version": "0.1.0",
      "manifestUrl": "/state-packs/arkansas/manifest.json"
    }
  ]
}
```

#### `manifest.json`

Purpose:
- define one installable state pack
- declare pack metadata, files, branding, and capabilities

Suggested shape:

```json
{
  "id": "florida",
  "name": "Florida",
  "version": "1.5.0",
  "packBaseUrl": "/state-packs/florida/",
  "branding": {
    "appName": "FL Plates",
    "shortName": "FL Plates",
    "logoPath": "assets/branding/logo.png",
    "heroPath": "assets/branding/hero.png",
    "shareUrl": "https://gorillagrin.com/florida-plates-game/"
  },
  "files": {
    "plateDriver": "plate-driver.generated.json",
    "badges": "badges.json",
    "geography": "geography.json",
    "assetManifest": "assets.json"
  },
  "capabilities": {
    "badges": true,
    "map": true,
    "regions": true,
    "timeline": true
  }
}
```

#### `badges.json`

Purpose:
- define state-specific badges in a mostly data-driven way

Suggested shape:

```json
{
  "groups": [
    {
      "id": "progress",
      "label": "Progress",
      "icon": "progress"
    }
  ],
  "badges": [
    {
      "id": "first-spot",
      "name": "First Spot",
      "description": "Spot your first plate.",
      "group": "progress",
      "icon": "start.png",
      "rule": {
        "type": "count",
        "target": 1
      }
    },
    {
      "id": "thrill-ride",
      "name": "Thrill Ride",
      "description": "Find the Walt Disney World plate.",
      "group": "collections",
      "icon": "roller-coaster.png",
      "rule": {
        "type": "plate",
        "plateIds": [
          "walt-disney-world",
          "walt-disney-world-legacy"
        ]
      }
    }
  ]
}
```

#### `geography.json`

Purpose:
- define counties, regions, and optional geography-driven badge groupings

Suggested shape:

```json
{
  "stateCode": "FL",
  "stateName": "Florida",
  "counties": [
    "Alachua",
    "Baker",
    "Bay"
  ],
  "regions": [
    {
      "id": "panhandle",
      "name": "Panhandle",
      "counties": [
        "Escambia",
        "Bay",
        "Calhoun",
        "Franklin",
        "Gulf",
        "Holmes",
        "Jackson",
        "Liberty",
        "Okaloosa",
        "Santa Rosa",
        "Walton",
        "Washington"
      ]
    }
  ]
}
```

### Phased Refactor Checklist

#### Phase A: Florida As An Internal State Pack

Goal:
- make the current Florida experience loadable as a pack without changing product behavior

Tasks:
- move Florida branding into a pack manifest shape
- move Florida badge definitions into a pack-local structure
- move Florida geography definitions into a pack-local structure
- point the shell at a Florida pack loader rather than direct Florida imports

Definition of done:
- the app still behaves like `FL Plates`, but Florida is now effectively a pack

#### Phase B: Generic Pack Loader

Goal:
- make the app shell capable of loading one active pack dynamically

Tasks:
- introduce an active-pack abstraction
- load pack manifest, plate driver, badges, and geography through one loader
- scope local progress storage by pack ID
- ensure service worker caching works with pack-scoped assets

Definition of done:
- the app shell no longer assumes Florida is the only game

#### Badge modularization guidance

As the badge system grows, badge definitions should be separated into three layers:

- generic badges
- state-specific badges
- geography badges

##### Generic badges

These are reusable across states and usually count-based or category-based.

Examples:

- `First Spot`
- `Five Alive`
- overall percentage milestones
- generic category-count badges

These should ideally live in a shared badge definition source.

##### State-specific badges

These depend on state-specific named plates, themes, or collections.

Florida examples:

- `Thrill Ride`
- `GOAL!`
- `Checkered Flag`
- `Farm Fresh`
- `Coastal Cruiser`

These should live in each state pack.

##### Geography badges

These depend on state geography definitions such as counties or named regions.

Florida examples:

- `Panhandle Scout`
- `Northwest Florida Explorer`
- `All Around Florida`

These should live separately from general state badges so geography data can evolve independently.

##### Runtime merge model

For display and evaluation, the shell should merge all three layers into one active badge catalog:

- shared generic badges
- active state pack badges
- active state pack geography badges

The UI should still group badges by player-facing badge groups, not by technical source layer.

##### Recommended metadata

Each badge definition should eventually include a source scope such as:

- `generic`
- `state`
- `geography`

This will help with:

- validation
- future editor tooling
- debugging
- pack portability

#### Phase C: Static State Index

Goal:
- let the shell discover available packs from a server-hosted index

Tasks:
- add `state-index.json`
- add a lightweight state chooser UI
- support installing one pack at a time
- support switching the active pack

Definition of done:
- the generic shell can discover and switch between available state packs

#### Phase D: First Non-Florida Validation Pack

Goal:
- prove the architecture with a second state, likely Arkansas

Tasks:
- prepare an Arkansas master dataset
- generate an Arkansas runtime driver
- create Arkansas branding assets
- decide whether Arkansas launches with:
  - generic badges only
  - or a full Arkansas badge set
- verify that search, timeline, map, and caching work correctly with the new pack

Definition of done:
- at least two states can run from the same shell app

#### Phase E: Standalone Editor Support

Goal:
- prepare for a future external content editor without coupling it to the game repo

Tasks:
- stabilize the master-data schema
- stabilize the runtime-driver schema
- document the transform from master to runtime
- define the minimum editor feature set:
  - naming
  - category assignment
  - image binding
  - search-term curation
  - variant relationships

Definition of done:
- a future external editor has a clear schema target and workflow

## Recommended Order

1. `v1.6` search enrichment and taxonomy polish
2. `v1.7` framework extraction Phase 2 and editor-readiness
3. `v1.8+` optional social layer and cloud identity

## Immediate Next Step

For the next cycle, the best target is:

- curate search terms across the full catalog
- keep tightening category placement as outliers are found
- avoid major UI or platform work until search and taxonomy feel settled

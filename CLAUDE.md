# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Every PL8** (repo name `florida-plates-game`) is an offline-friendly PWA license-plate collecting game. Players spot specialty plates, mark them found (with timestamp, GPS, reverse-geocoded locality), and earn merit badges. It ships as a web PWA (GitHub Pages) and as an iOS app wrapped with Capacitor. React 18 + TypeScript + Vite, no router, no state-management library. Runtime deps are React, the Capacitor plugin set, and Leaflet (`leaflet` + `react-leaflet`, used only by `DiscoveryMap`).

The catalog spans 18 real state packs plus a special **USA 50-State Challenge** mode — see `src/games/stateRegistry.ts` for the authoritative list.

## Commands

All commands run from the repo root.

```bash
npm install
npm run dev:host        # Vite dev server bound to 0.0.0.0 (for LAN/phone testing); `npm run dev` for localhost only
npm run build           # tsc --noEmit (typecheck) then vite build — this is the only "test": there is no test runner
npm run preview:host    # serve the production build
```

`build` is gated by `prebuild`, which regenerates plate drivers, PWA assets, and build info. To regenerate just one piece:

```bash
npm run generate:plate-driver   # rebuild runtime driver + legacy-id map for ALL packs from their master JSON
npm run generate:pwa-assets
npm run generate:build-info
```

To regenerate the driver for a single pack, call the script directly: `node scripts/generatePlateDriver.mjs florida`.

There is no lint step and no automated test suite — `tsc --noEmit` (inside `npm run build`) is the correctness gate.

## Architecture

### State packs are the core abstraction

The app is multi-state: one codebase, many "state packs," only **one active at a time**. Each pack contributes four artifacts:

1. **Master dataset** — `src/data/{state}-plate-master.json`. Hand-authored/scraped source of truth (schema in `docs/customization/plate-master.schema.json`).
2. **Generated runtime files** — `src/data/generated/{state}-plate-driver.generated.json` + `{state}-legacy-id-map.generated.json`. Produced from the master by `scripts/generatePlateDriver.mjs`. These ARE committed; regenerate them via the build, never hand-edit.
3. **Config** — `src/config/{state}Game.ts`. Branding, share/help/about text, and all per-pack badge data: `{state}BadgeCounties`, `{state}BadgeGroupLabels`, `{state}BadgeGroupSymbols`, `{state}MixedBagCategories`, `{state}BadgePlateSets`, `{state}BadgeIds`, and the regional scout-county set.
4. **Registration** — an entry in `src/games/stateRegistry.ts` (metadata + `available`) and a `load{State}Pack()` case in `src/games/activeGame.ts`.

Public image assets live outside `src/` under `public/state-packs/{state}/` (plate images + DMV logo). Plate `image.path` values are relative to there.

Pack IDs use kebab-case where multi-word (`south-carolina`, `west-virginia`); the matching config file is camelCase (`southCarolinaGame.ts`).

### The "active game" module-load pattern

`src/games/activeGame.ts` is the crux. At **module evaluation time** it reads the persisted selected state, loads exactly one pack, and exports the `active*` bindings: `activeGame`, `activePlates`, `activeGroupedPlates`, `activeBadgeCounties`, `activeBadgePlateSets`, `activeBadgeIds`, `activePanhandleScoutCounties`, `activeStorage`, etc. `src/data/plates.ts` and `src/lib/storage.ts` re-export from these.

Consequence: the active state is fixed for the lifetime of the JS module graph. **Switching states writes the new id to storage and reloads the page** — there is no live hot-swap. When adding a state, wire it into both `stateRegistry` and the `loadStatePack` switch.

### Badges

`src/lib/badges.ts` (~1700 lines) holds `badgeDefinitions`, the `evaluateBadges(plates, discoveries, stateId)` engine, and `computePlayerRank()`. Badge groups combine generic logic (progress, category, collection, sports, college, locality, service) with **per-pack data injected via the active-game imports** — `badges.ts` imports `activeBadgeCounties` / `activeBadgePlateSets` / `activePanhandleScoutCounties` directly, and takes `stateId` to resolve the home-state name (for the "Escapee" badge: plates spotted outside the active state). Per-pack badge membership is data, not code: e.g. `activeBadgePlateSets["grand-slam"]` lists the plate names that satisfy that badge. This is why badge content lives in the state configs, not in `badges.ts`.

`src/lib/badgeHistory.ts` tracks when each badge was earned and whether the user has seen it (the "New!" experience), persisted per state. `App.tsx` reconciles history against the latest evaluation on every change.

### The USA 50-State Challenge

The `usa` pack (`src/config/usaGame.ts`, `loadUsaPack()`) is a different game mode reusing the same machinery: one "plate" per U.S. state, every plate category `Standard`, no counties or mixed-bag categories. Regional badges group *states* (US Census divisions) through the same `activeBadgePlateSets` mechanism. Treat it as a state pack that happens to be national.

### Storage

`src/lib/persistentStorage.ts` is the single storage layer: Capacitor Preferences (native iOS) with `localStorage` as fallback (PWA), fronted by a synchronous in-memory cache. `initStorage(keys)` MUST run at startup (see `main.tsx`) before any `getItem`. Reads are sync from cache; writes fan out to cache + both backing stores.

Discovery data is keyed per state: `{stateId}-plates-discoveries`. `src/lib/storage.ts` `loadDiscoveries()` remaps old plate ids through the pack's legacy-id map so historical sightings survive plate-id changes when masters are regenerated.

### UI

`src/App.tsx` (~1900 lines) is the whole app shell — view routing is a `useState` `ActiveView` union (`home` / `achievements` / `help` / `settings` / `state-picker`), not a router. The Achievements page has its own internal tabs (achievements / journey / map); the map tab renders `src/components/DiscoveryMap.tsx` (Leaflet). Other components in `src/components/` are leaf views. Styling is a single global `src/styles.css`.

### Native / platform integration

`src/lib/` wraps each Capacitor plugin (geolocation, haptics, notifications, share, status bar, splash, in-app browser, app review, etc.) so the rest of the app stays platform-agnostic and these no-op gracefully in a plain browser. `capacitor.config.ts` defines the iOS app (`com.gorillagrin.everypl8`); the `ios/` project is committed. The service worker (`public/sw.js`, registered by `src/registerServiceWorker.ts`) provides offline support and dispatches a `fl-plates:update-ready` event when a new version is waiting.

## Adding a new state pack

1. Author `src/data/{state}-plate-master.json` (see `docs/customization/` for schema, starter, and the AI scrape prompts in `scripts/prompts/`).
2. Add plate images under `public/state-packs/{state}/`.
3. Create `src/config/{state}Game.ts` (copy an existing one — e.g. `floridaGame.ts`), including the badge data exports listed above.
4. Add the state id to `scripts/generatePlateDriver.mjs`'s default list AND to the `generate:plate-driver` / `prebuild` arg lists in `package.json`.
5. Register in `src/games/stateRegistry.ts` and add a `load{State}Pack()` + switch case + `plateCountsByState` entry in `src/games/activeGame.ts`.
6. `npm run build` to regenerate drivers and typecheck.

## Deployment & releases

Push to `master` → `.github/workflows/deploy-pages.yml` runs `npm run build` and deploys `dist/` to GitHub Pages. The workflow sets `BASE_PATH=/{repo-name}/`, consumed by `vite.config.ts` as the base path (so asset URLs are repo-scoped). `RELEASING.md` documents the branch → merge → version bump → tag → `gh release` flow (note: it uses PowerShell snippets but the steps are shell-agnostic).

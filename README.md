# Every PL8

Installable offline-friendly license plate collecting game. Spot specialty plates on the road, mark them found, and earn merit badges as you explore.

**Live site:** [gorillagrin.com/florida-plates-game](https://gorillagrin.com/florida-plates-game/)

## Supported States

| State | Plates | Region Badges | Source Agency |
|-------|--------|---------------|--------------|
| Arkansas | 129 | 6 regions + master | AR DFA |
| Florida | 338 | 9 regions + master | FL DHSMV |
| Kansas | 85 | 6 regions + master | KS DOR |
| Kentucky | 231 | 6 regions + master | KY KYTC |
| Mississippi | 305 | 5 regions + master | MS DOR |
| Missouri | 162 | 5 regions + master | MO DOR |
| Tennessee | 210 | 3 regions + master | TN DOR |

## Features

- **Plate collection** -- Mark plates found with timestamp, GPS coordinates, and reverse-geocoded locality name.
- **Plate preview** -- Tap any plate image to view an enlarged preview with beneficiary, category, and notes.
- **Search, filter, sort** -- Search by name or alias, filter by found/not found, sort by category or alphabetically. 13 unified categories across all states.
- **Achievements** -- Game Center-style hub with earned, in-progress, and locked badge sections. Badges span progress milestones, category completions, regional exploration, college plates, service plates, and more.
- **Player ranks** -- Five-tier rank system (Rookie, Spotter, Collector, Road Scholar, Plate Master) based on badges earned.
- **Journey & Map** -- Timeline of sightings with date grouping, plus a map view of discovery locations.
- **Multi-state** -- Switch between state packs from the state picker with alphabetical quickjump. Each state has its own plate catalog, badge set, region badges, and discovery data.
- **Settings** -- Light/dark mode, toggle optional controls.
- **PWA** -- Install to iPhone or Android home screen. Works offline after first load.

## Tech Stack

- React 18, TypeScript, Vite
- No external dependencies beyond React
- PWA with service worker for offline support
- Deployed to GitHub Pages via GitHub Actions

## Local Development

```
npm install
npm run dev:host
```

For LAN testing on the same Wi-Fi, open the host IP and Vite port shown in the terminal.

## Build

```
npm run build
```

The `prebuild` step automatically regenerates the plate driver, PWA icons, and build metadata.

To regenerate just the plate driver:

```
npm run generate:plate-driver
```

## Deployment

Each push to `master` triggers a GitHub Actions build and deploys to GitHub Pages.

To set up from scratch:

1. Create a repo on GitHub.
2. Push to `origin/master`.
3. In the repo, go to **Settings > Pages** and set the source to **GitHub Actions**.

## Installation

### iPhone

1. Open the site in Safari.
2. Tap **Share**, then **Add to Home Screen**.

### Android

1. Open the site in Chrome.
2. Use **Add to Home screen** or **Install app**.

## Notes

- This is a PWA, not an App Store or Play Store app.
- Offline use works after the app shell and plate assets have loaded once.
- If a home-screen install appears stuck on an older version, open the site in the browser so the service worker can update.

## Acknowledgments

- Plate images belong to their respective state motor vehicle agencies and are displayed for identification and entertainment purposes under a fair use claim.
- Badge icons from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT License).
- State outline shapes from [StateFace](https://proicons.com/icon-collections/stateface) by ProPublica (MIT License).

## License

&copy; 2026 Gorilla Grin. All rights reserved.

This project is source-available but not open source. You may view the code but may not copy, modify, or distribute it without permission.

## Project Docs

- [RELEASING.md](RELEASING.md) -- Release process
- [ROADMAP.md](ROADMAP.md) -- Version roadmap

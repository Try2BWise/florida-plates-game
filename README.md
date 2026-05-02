# Every PL8

Installable offline-friendly license plate collecting game. Play the classic 50-state road-trip game, or dive deep into one state's specialty plate catalog. Mark plates as you spot them, earn merit badges, and track your discoveries on an interactive map.

**Live site:** [gorillagrin.com/florida-plates-game](https://gorillagrin.com/florida-plates-game/)

## Game modes

### USA — the classic road-trip game

One standard plate for each of the 50 US states. Spot a car from another state, tap the tile, move on. Earn regional badges (Northeast, Midwest, South, Mountain West, Pacific), snag iconic singletons for the hardest-to-find (Alaska, Hawaii), and rack up the capstone **All Around USA** when every region's tied off. Each state's detail card carries the state's nickname, capital, admission date, and official bird / flower / tree.

### Specialty-plate state packs

Pick one state and hunt its full specialty catalog — dozens to hundreds of designs, each with its own story. Every state has regional explorer badges that reward finding plates in specific counties (FL's Panhandle, CA's Bay Area, MN's Arrowhead, etc.) plus an **All Around \<State\>** capstone that shows the state's silhouette when earned.

| State | Plates | Region Badges | Source Agency |
|---|---|---|---|
| Alabama | 99 | 5 + all-around | AL ALEA |
| Alaska | 47 | 5 + all-around | AK DMV |
| Arizona | 132 | 5 + all-around | AZ MVD |
| Arkansas | 129 | 6 + all-around | AR DFA |
| California | 94 | 5 + all-around | CA DMV |
| Florida | 338 | 9 + all-around | FL DHSMV |
| Georgia | 287 | 5 + all-around | GA DOR |
| Indiana | 150 | 5 + all-around | IN BMV |
| Iowa | 72 | 5 + all-around | Iowa DOT |
| Kansas | 85 | 5 + all-around | KS DOR |
| Kentucky | 230 | 6 + all-around | KY KYTC |
| Minnesota | 120 | 5 + all-around | MN DPS (DVS) |
| Mississippi | 303 | 5 + all-around | MS DOR |
| Missouri | 166 | 5 + all-around | MO DOR |
| Ohio | 267 | 5 + all-around | OH BMV |
| South Carolina | 236 | 4 + all-around | SC DMV |
| Tennessee | 209 | 3 + all-around | TN DOR |
| West Virginia | 101 | 5 + all-around | WV DMV |
| **USA (50-State)** | **50** | **5 regions + 2 iconic + all-around** | **Aggregate** |

**19 packs · ~3,115 plates total**

## Features

- **Plate collection** — Tap to mark a plate found. The app timestamps the find and, if location is enabled, attaches lat/lng + reverse-geocoded locality/county/state.
- **Real interactive map** — Journey tab shows a Leaflet slippy map (OpenStreetMap + CARTO tiles) with every geotagged discovery pinned. Adapts to light/dark theme.
- **Timeline** — Chronological list of every sighting, grouped by date, collapsible.
- **Achievements** — Game Center-inspired hub with earned / in-progress / locked sections, a hero rank card, a "NEW" pulse + pill on freshly-earned badges, and an "Earned on" date stamp in the detail modal.
- **Player ranks** — Five tiers (Rookie → Spotter → Collector → Road Scholar → Plate Master) scaled by the percentage of badges earned.
- **Search, filter, sort** — Search by name, alias, nickname. Filter by found/not found. Sort by category, A-Z, or Z-A.
- **State picker** — USA mode pinned at top as a featured game. Below: alphabetical list with quick-jump nav (A-G, H-N, O-Z) and user-pinnable favorites.
- **Custom plates** — Spot a plate that isn't in the catalog? Add it to your personal "My Plates" collection.
- **Settings** — Light / dark / system theme, optional location capture, notifications opt-in, feedback link, export/import progress.
- **PWA + Capacitor iOS** — Add to home screen on iPhone or Android, or install the native iOS shell. Works offline after first load.
- **Privacy first** — No accounts, no analytics, no servers, no tracking. All data stays on your device. The only outbound traffic is optional reverse-geocoding and (on the Map tab) tile fetches.

## Tech stack

- React 18 · TypeScript · Vite
- Leaflet + react-leaflet for the map
- Capacitor for iOS native packaging
- Microsoft Fluent Emoji 3D set (MIT) for badge artwork
- PWA with service worker for offline support
- Deployed to GitHub Pages via GitHub Actions

## Local development

```
npm install
npm run dev:host
```

For LAN testing on the same Wi-Fi, open the host IP and Vite port shown in the terminal.

## Build

```
npm run build
```

The `prebuild` step regenerates the plate drivers for all 17 packs, PWA icons, and build metadata.

To regenerate just the plate driver:

```
npm run generate:plate-driver
```

## Deployment

Each push to `master` triggers a GitHub Actions build and deploys to GitHub Pages. To set up from scratch:

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

- This is a PWA (with an iOS Capacitor shell in flight), not yet on App Store or Play Store.
- Offline use works after the app shell and plate assets have loaded once.
- If a home-screen install appears stuck on an older version, open the site in the browser so the service worker can update.

## Acknowledgments

- Plate images belong to the respective state motor vehicle agencies (and, for certain California specialty designs, to licensed third-party artwork owners). They're displayed for identification, educational, and non-commercial reference purposes under a fair use claim (17 U.S.C. § 107). Logos, mascots, names, and other marks depicted on these plates are the property of their respective owners and are shown solely for identification of the license plates issued by the state agencies.
- Badge icons from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT License).
- State outline shapes from [StateFace](https://proicons.com/icon-collections/stateface) by ProPublica (MIT License).
- Map tiles from [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, served via [CARTO](https://carto.com/attributions).

## License

&copy; 2026 Gorilla Grin. All rights reserved.

This project is source-available but not open source. You may view the code but may not copy, modify, or distribute it without permission.

## Project docs

- [RELEASING.md](RELEASING.md) — Release process
- [ROADMAP.md](ROADMAP.md) — Version roadmap
- [BADGE_ICONS.md](BADGE_ICONS.md) — Badge icon inventory and status

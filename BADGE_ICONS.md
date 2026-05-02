# Badge Icon Roadmap

Tracks badge icon assignments. Current library is **56 PNG icons from Microsoft Fluent Emoji 3D** (MIT-licensed) plus **17 state-silhouette SVGs** derived from the existing `public/state-outlines/*.svg` files.

Status legend:
- ✅ Shipped
- 🟡 Proposed, easy win
- ⚪ Proposed, deferred (waits on infrastructure or concept)

---

## v1.9.0 audit summary

- **compass-new.png** uses: 75 → 15 (down from 58% of all regional badges to 10%)
- **Library size:** 40 → 56 PNGs + 17 state-silhouette SVGs = 73 total assets
- **All 16 `all-around-<state>` badges** now render the state's own outline in the brand accent color — a consistent "you've completed the whole state" visual pattern.
- **15 previously-unmapped badges** (Tier 1 from the audit — mixed-bag, full-spectrum, sports-fan, all-teams, all-branches, united-front, airborne, bronze-star-honor, distinguished, combat-ready, decorated-service, reporting-for-duty, on-call, in-service, air-support) now carry thematic artwork instead of falling back to a plain medal.

---

## 1. Generic badge icons (refined)

| Badge | Icon | Status | Notes |
|-------|------|--------|-------|
| `first-spot` | glowing-star | ✅ | |
| `five-alive` → `closing-in` | *medal fallback (bronze/silver/gold by threshold)* | ✅ | Intentional — medal-tier IS the metaphor |
| `complete-set` | trophy-new | ✅ | |
| `mixed-bag` | palette | ✅ | Was paw-prints (variety) |
| `full-spectrum` | trophy-new | ✅ | |
| `green-light` | leaf-new | ✅ | |
| `eco-scout` | paw-prints | ✅ | |
| `sports-fan` | soccer-ball | ✅ | |
| `all-teams` | trophy-new | ✅ | |
| `healing-hands` | hospital-new | ✅ | |
| `game-on` | goal-net | ✅ | BADGE_ICONS previously flagged this as weak; no game-die in library yet |
| `reporting-for-duty` / `on-call` / `in-service` | shield-new | ✅ | Matches those-who-serve |
| `those-who-serve` | shield-new | ✅ | |
| `back-the-blue` | police-car-light | ✅ | |
| `fire-watch` | fire-engine | ✅ | |
| `united-front` | handshake | ✅ | police + fire partnership |
| `all-branches` | star-new | ✅ | Distinct from glowing-star (first-spot) |
| `air-support` | airplane | ✅ | Blue Angels (was chequered-flag) |
| `airborne` | parachute | ✅ | Paratroopers |
| `bronze-star-honor` | 3rd-place-medal | ✅ | Literal bronze |
| `distinguished` | star-new | ✅ | |
| `combat-ready` | shield-new | ✅ | |
| `decorated-service` | star-new | ✅ | |
| `escapee` | passport | ✅ | Was world-map |
| `i-get-around` | world-map | ✅ | |
| `road-trip` | globe-with-meridians | ✅ | |
| `panhandle-scout` | beach | ✅ | Was world-map |
| `first-day-of-school` | school-new | ✅ | |
| `campus-tour` | backpack-new | ✅ | |
| `freshman` / `sophomore` / `junior` / `senior` / `graduation-day` | open-book / books / notebook / scroll / graduation-cap | ✅ | College progression |
| Florida sports (grand-slam, touchdown, etc.) | baseball / american-football / ice-hockey / basketball / soccer-ball / chequered-flag | ✅ | Per-sport icons |
| `coastal-cruiser` | water-wave | ✅ | |
| `farm-fresh` | tractor | ✅ | |
| `thrill-ride` | roller-coaster-new | ✅ | |

### Deferred badge concepts (not yet defined)

These would require new badge definitions in `badges.ts` AND new evaluation logic. Tracked here for future implementation alongside engagement features.

| Concept | Emoji | Description |
|---------|-------|-------------|
| **Daily Streak** | 🔥 fire | Find a plate N consecutive days |
| **Early Bird** | 🌅 sunrise | First find of the day before 7am local |
| **Night Owl** | 🦉 owl | Find a plate after 10pm local |
| **Weekend Warrior** | 🏖️ beach-with-umbrella | Find N plates on a weekend |
| **Road Tripper** | 🚗 automobile | N plates in a single day |
| **Speed Demon** | ⚡ high-voltage | N plates within X minutes |
| **Variety Pack** | 🎨 artist-palette *(in lib)* | N different categories in one day |
| **Completionist** | 💯 hundred-points | 100% of any category |
| **Anniversary** | 🎂 birthday-cake | First week / month / year of play |
| **Stargazer** | ⭐ star *(in lib)* | Find any plate with "star" in name |
| **Border Hopper** | 🗺️ world-map | Plates from N adjacent states in a trip |
| **Mileage Master** | 🛞 wheel | Cumulative GPS distance between finds |

---

## 2. State-specific region badge icons

**All-around badges:** All 16 states now use their own outline SVG (generated from `public/state-outlines/<CODE>.svg` with the brand accent color injected into the root `<svg>` element). This creates a consistent capstone visual across every state pack.

### Per-region differentiation (v1.9.0 pass)

| State | Region coverage | Notes |
|-------|-----------------|-------|
| Florida | 5 of 10 uniquely iconed | panhandle-scout→beach, N-central→wheat, NE→bridge (Jacksonville), C-West→anchor (Tampa), C-East→rocket (Space Coast), SW→fish, SE→cityscape (Miami), Keys→desert-island |
| Mississippi | **all 6 unique** ✅ | Hills→mountain, Delta→tractor, Capital/River→cityscape, Pines→leaf, Coastal→water-wave, All Around→state silhouette |
| Arkansas | 5 of 7 unique | Ozarks→mountain, Delta→tractor, Capital→cityscape (Little Rock), River Valley→water-wave, Timberlands→leaf |
| Missouri | **all 5 regions unique** ✅ | NW→wheat, NE→tractor, Central→cityscape, SW→mountain, SE→water-wave |
| Tennessee | **all 3 unique** ✅ (already gold-standard before v1.9) | East→mountain, Middle→microphone (Nashville), West→guitar (Memphis) |
| Kentucky | 4 of 7 unique | Bluegrass→horse, Eastern Mountain→mountain, Pennyrile→corn, Jackson Purchase→fish |
| Kansas | 3 of 5 unique | NW→wheat, NE→cityscape, SE→corn; all-around→sunflower |
| Georgia | **all 5 regions unique** ✅ | North→mountain, Metro Atlanta→cityscape, Central→wheat, SW→corn, SE→anchor (Savannah); all-around→peach |
| Alabama | 5 of 6 unique | North→rocket (Huntsville), Central→cityscape (Birmingham), West→wheat (Black Belt), SE→corn, Gulf→water-wave |
| Alaska | **all 5 regions unique** ✅ | Southcentral→cityscape, Southeast→fish, Interior→mountain, Southwest→anchor, Arctic→snowflake; all-around→polar-bear |
| Arizona | 3 of 5 unique | Central→cityscape (Phoenix), Northern→mountain, Western→water-wave; all-around→cactus |
| California | **all 5 regions unique** ✅ | Far North→mountain, Bay Area→bridge, Sacramento→cityscape, Central→wheat, SoCal→beach; all-around→bear |
| Ohio | 3 of 5 unique | NE→cityscape (Cleveland), SW→bridge (Cincinnati/Roebling), SE→mountain |
| West Virginia | 4 of 5 unique | Eastern Panhandle→wheat, Potomac Highlands→mountain, Metro Valley→cityscape, New River & Mountain Lakes→water-wave |
| Iowa | **all 5 regions unique** ✅ | NW→wheat, NE→fish (Driftless), Central→cityscape (Des Moines), SW→corn, SE→water-wave (Mississippi) |
| Minnesota | 4 of 5 unique | NW→wheat (Red River Valley), NE (Arrowhead)→water-wave, Central→fish (10k lakes), Metro→cityscape, Southern→corn |
| South Carolina | **all 4 regions unique** ✅ | Upstate→mountain (Blue Ridge), Midlands→cityscape (Columbia), Pee Dee→chequered-flag (Darlington Raceway), Lowcountry→anchor (Charleston) |
| Indiana | **all 5 regions unique** ✅ | NW→cityscape (Calumet/Gary), NE→fish (Lakes Country), Central→chequered-flag (Indy 500), SW→corn (farm belt), SE→mountain (Knobs hill country) |

### USA 50-State Challenge mode

| Badge | Icon | Notes |
|-------|------|-------|
| `usa-northeast-explorer` | cityscape | Eastern seaboard |
| `usa-midwest-explorer` | wheat | Breadbasket |
| `usa-south-explorer` | peach | Southern emblem |
| `usa-west-explorer` | mountain | Rockies |
| `usa-pacific-explorer` | water-wave | Pacific Ocean |
| `usa-alaska` | polar-bear | Last Frontier |
| `usa-hawaii` | beach | Aloha State |
| `all-around-usa` | state silhouette | USA outline in accent blue |

---

## 3. Remaining compass-only regional badges

These 15 regions still use the generic compass because no clearly-better icon beat it with the current asset library. Candidates for a future pass if more assets are added.

| State | Regions on compass-new |
|-------|------------------------|
| Florida | NW, Central, all-around |
| Arkansas | Ouachitas, all-around |
| Missouri | all-around |
| Tennessee | all-around |
| Kentucky | Knobs, Western Coalfields, all-around (all-around actually uses silhouette) |
| Kansas | SW, South-Central |
| Alabama | all-around |
| Arizona | Southern, Eastern |
| Ohio | NW, Central, all-around |
| West Virginia | Mountaineer Country |
| Iowa | all-around |
| Minnesota | all-around |

---

## 4. Seasonal & Promotional Badges

Depends on the CDN-pushable badge architecture (v1.10+). Not implementable until that lands. Inventory for future use:

### Holidays
| Event | Emoji |
|-------|-------|
| New Year | 🎉 party-popper |
| Valentine's | ❤️ red-heart |
| St. Patrick's | ☘️ shamrock |
| Easter | 🐰 rabbit |
| Memorial Day | 🇺🇸 flag-united-states |
| 4th of July | 🎆 fireworks |
| Halloween | 🎃 jack-o-lantern |
| Thanksgiving | 🦃 turkey |
| Christmas | 🎄 christmas-tree |
| Hanukkah | 🕎 menorah |

### Seasons
- Spring 🌷 tulip
- Summer ☀️ sun
- Fall 🍂 fallen-leaf
- Winter ❄️ snowflake *(already in lib)*

### Events / Promotions
| Concept | Emoji |
|---------|-------|
| Limited-time scavenger hunt | 🔍 magnifying-glass |
| Tourism board partnership | 🎫 admission-tickets |
| Sports postseason | 🏆 trophy |
| Election year | 🗳️ ballot-box |
| Eclipse event | 🌒 waning-crescent-moon |
| Big game weekend | 🏟️ stadium |
| Brand partnership | 🤝 handshake *(already in lib)* |
| Community milestone | 🌐 globe-with-meridians *(already in lib)* |

---

## Implementation notes

- Source: https://github.com/microsoft/fluentui-emoji
- License: MIT
- Format: Use `3D` variants (PNG, ~256×256)
- URL pattern: `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Name>/3D/<snake_case>_3d.png`
- Place in `public/badges/`
- Wire in `src/components/BadgeIcon.tsx` `customBadgeArtById` map
- Naming convention: lowercase, hyphenated, suffix with `-new` if replacing/updating an earlier icon (matches current pattern — e.g., `compass-new.png`, `star-new.png`)
- State silhouette SVGs: processed via one-shot Node script that reads `public/state-outlines/<CODE>.svg`, injects `fill="#3FA7E0"` on the root `<svg>` element so descendant paths inherit a visible color against any badge-frame background, then writes to `public/badges/all-around-<state>.svg`.

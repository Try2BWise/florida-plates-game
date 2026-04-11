# Social & Competitive Features — Brainstorm

*Captured from design discussions. No decisions made yet — this is a parking lot.*

---

## Guiding Constraint

Minimize infrastructure. Prefer on-device logic, Game Center (free, already on every iPhone, no backend required), and CDN-distributed data over custom servers. Avoid building a management system.

---

## Feature Ideas

### Competitive Play
- Global leaderboard — most plates found overall
- Per-state leaderboard — most plates found in a specific state pack
- Time-limited leaderboards — weekly or monthly resets
- Rarest plates leaderboard — weighted scoring by plate rarity/age
- Speed run — fastest completion of a full state pack

### Cooperative Play
- Shared group goal — a group collectively works toward finding all plates in a state
- Community milestones — "Every PL8 players have collectively found X plates this month"
- Cooperative scavenger hunt — everyone contributes finds toward a shared badge unlock

### Team Play
- Persistent team identity — named groups competing against each other
- Team leaderboard — aggregate score across team members
- Team-exclusive badges or challenges

### Geofenced Play
- **"Out of State" challenge** — find plates from State X while physically outside State X (GPS coordinates already stored per sighting)
- **Road Trip badge** — find plates from N different states in a single day or trip
- **Home turf vs. away** — track how many of your state's plates you've spotted in other states
- **State invasion** — find plates from every other state while in your home state

### Events & Promotions
- **Limited-time scavenger hunts** — a curated plate list active for a weekend or week, pushed via CDN without an app update
- **Seasonal challenges** — holiday-themed or travel-season badge sets
- **Partner promotions** — a tourism board or brand sponsors a plate challenge (e.g. "Find all Kansas agriculture plates")
- **Streak challenges** — find at least one plate per day for N days

### Social Sharing
- Share a badge earned as a card/image to native iOS share sheet (already partially wired — share button exists)
- "Challenge a friend" — send someone a specific plate to find
- Progress card — shareable image of your collection stats

---

## Technical Notes

### What requires no backend (Game Center / on-device)
- Leaderboards (total found, per state)
- Achievements mapped to badge completions
- Friend challenges
- Geofenced play (GPS data already stored, just needs new badge evaluation type)
- Limited-time events (badge definitions pushed via CDN)

### What would require a lightweight backend
- True team identity and team leaderboards (shared persistent state)
- Cooperative shared-progress goals (needs a sync point)
- Community aggregate stats ("X plates found globally this week")
- "Challenge a friend" with verification (otherwise honor system)

### Game Center specifically
- Free, already on every iPhone, no sign-up friction for users
- Leaderboards, achievements, friend lists, multiplayer matchmaking
- Capacitor plugin: `capacitor-game-connect`
- iOS-only — not a concern since app is iOS-only
- Natural fit: total plates found → leaderboard score; badge earned → Game Center achievement

### CDN-pushable badges (no app update needed)
- Badge definitions need to move from compiled TypeScript to remote JSON
- Evaluation engine (the patterns: threshold, category count, plate list, geo-check) stays compiled
- Enables: promotions, scavenger hunts, seasonal events, partner challenges — all push-deployed

### Geofenced badge evaluation (already mostly built)
- Every discovery already stores `latitude` / `longitude`
- State boundary check = polygon containment test (small GeoJSON per state)
- New badge type: `{ type: "out-of-state", targetState: "kansas", minCount: 5 }`
- No backend needed — pure on-device logic

---

## Open Questions for Full Brainstorm Session
- Async (see results later) vs. real-time (racing someone live)?
- Strangers (open global board) vs. friends-only?
- Opt-in competitive mode or always-on?
- What does "winning" mean — count, speed, diversity, rarity?
- Time-limited events: who triggers them? (CDN deploy = you control the schedule)
- How does team identity work without accounts? (Game Center groups? Invite codes?)

# Category Audit - 2026-03-29

## Current category counts

- Universities: 76
- Military & Veterans: 49
- Nature & Wildlife: 43
- Government & Official: 33
- Civic & Causes: 27
- Professional Sports: 20
- Health & Family: 19
- Public Safety: 11
- Special Use: 11
- Recreation & Tourism: 10
- Education & Culture: 9
- Commercial & Fleet: 8
- Historical & Antique: 8
- Accessibility: 6
- Standard Plates: 5
- Motorcycle Plates: 4

## What is straining

- `Military & Veterans` is doing too much at once.
  It currently mixes branch/service plates, veteran identity plates, medals/honors, campaigns, and some adjacent service-support plates.
- `Government & Official` is also carrying multiple concepts:
  agency plates, elected office plates, law-enforcement-adjacent official plates, and National Guard.
- `Professional Sports` and `Recreation & Tourism` have a blurry edge.
  They currently mix pro teams, athletics, participation sports, destination/tourism, and a few cause-oriented athletic plates.
- `Civic & Causes` is broad enough that it is becoming a second miscellaneous bucket.

## Recommended target taxonomy

This keeps the category list recognizable while making the crowded buckets more browseable.

- Universities
- Nature & Wildlife
- Civic & Causes
- Health & Family
- Education & Culture
- Sports & Recreation
- Public Safety
- Military Service
- Military Honors & History
- Government & Official
- Travel & Tourism
- Standard & Administrative
- Accessibility
- Historical & Antique

## Why this is the best next shape

### Split `Military & Veterans`

Recommended split:

- `Military Service`
  Branches, veterans, patriotic support, military identity, service organizations.
- `Military Honors & History`
  Medals, combat distinctions, campaigns, war-era history, POW/survivor style plates.

This is the clearest improvement and should be the first category change.

Examples that fit `Military Service`:

- U.S. Air Force
- U.S. Army
- U.S. Coast Guard
- U.S. Marine Corps
- U.S. Navy
- Veteran
- Woman Veteran
- Support Our Troops
- Salutes Veterans
- Florida Department of Veterans Affairs
- National Guard

Examples that fit `Military Honors & History`:

- Bronze Star
- Silver Star
- Purple Heart
- Medal of Honor (Army / Navy / Air Force)
- Air Force Cross
- Navy Cross
- Distinguished Flying Cross
- Distinguished Service Cross
- Combat Action Badge
- Combat Action Ribbon
- Combat Infantry Badge
- Combat Medical Badge
- Operation Desert Shield
- Operation Desert Storm
- Operation Enduring Freedom
- Operation Iraqi Freedom
- Pearl Harbor Survivor
- Ex-Prisoner of War
- Vietnam War Veteran
- Korean War Veteran
- World War II Veteran
- U.S. Paratroopers
- Navy Submariner

### Merge `Professional Sports` and part of `Recreation & Tourism`

Recommended new bucket:

- `Sports & Recreation`

This should cover:

- professional teams
- athletics and participation sports
- golf, tennis, soccer support, swimming, cycling-adjacent sport plates
- Olympics / Team USA style sports plates

Examples:

- Tampa Bay Buccaneers
- Jacksonville Jaguars
- Orlando Magic
- Inter Miami CF
- Golf Capital of the World
- Play Tennis
- Share the Road
- Swim for Life
- Special Olympics
- Go Team USA (Olympics)

Then keep a smaller `Travel & Tourism` bucket for:

- Walt Disney World
- Visit Our Lights
- Horse Country
- Florida State Parks

### Tighten `Government & Official`

Keep this bucket for actual official and agency plates:

- State / County / City
- House / Senate / Congress
- Department / division / commission / official-use plates
- Highway Patrol
- Fire Marshal
- PRIDE
- Department of Corrections

Move out anything better understood as:

- `Public Safety`
  Sheriff, FWC Officer, possibly Florida Highway Patrol if you prefer "service" over "government"
- `Military Service`
  Florida National Guard
- `Travel & Tourism`
  Florida State Parks

### Keep `Public Safety` focused on first responders and law enforcement support

This bucket is currently in better shape than `Military & Veterans`.
It should stay focused on:

- police
- sheriff associations
- firefighters
- EMS
- emergency management
- law-enforcement support / memorial plates

Possible adds from current other buckets:

- Sheriff
- Police Athletic League

### Reduce the size of `Civic & Causes`

Do not try to split this too aggressively yet.
Instead, move obvious outliers to stronger homes:

- Florida State Parks -> `Travel & Tourism`
- Miccosukee Indian / Seminole Indian -> likely `Education & Culture` or a future `Heritage & Tribal Nations`
- Margaritaville -> `Travel & Tourism`

After those moves, `Civic & Causes` can remain the home for:

- nonprofits
- fraternal orders
- community causes
- identity/cause plates
- general public-interest plates

## Low-risk implementation order

1. Split `Military & Veterans` into:
   - `Military Service`
   - `Military Honors & History`
2. Merge:
   - `Professional Sports`
   - sports-like `Recreation & Tourism`
   into `Sports & Recreation`
3. Create `Travel & Tourism` from the tourism/destination subset.
4. Clean up obvious outliers in `Government & Official`, `Public Safety`, and `Civic & Causes`.
5. Re-check badge logic and any category-based copy once the remap is stable.

## Recommendation

Do not redesign every category at once.
The best near-term payoff is:

1. military split
2. sports/recreation/tourism cleanup
3. targeted outlier fixes

That would improve browseability a lot without forcing a complete taxonomy rewrite.

# Badge Icon Roadmap

Tracks current badge icon assignments and proposed additions. Source: Microsoft Fluent Emoji 3D set (MIT licensed).

Status legend:
- ✅ Implemented
- 🟡 Proposed, easy win
- ⚪ Proposed, deferred (waits on infrastructure)

---

## 1. Refinements to Existing Generic Badges

| Badge | Current | Proposed | Status | Notes |
|-------|---------|----------|--------|-------|
| `game-on` | goal-net | 🎮 video-game OR 🎲 game-die | 🟡 | "Game on" implies starting/playing, not soccer |
| `i-get-around` | world-map | 🛣️ motorway | 🟡 | Currently identical to escapee |
| `panhandle-scout` | world-map | 🦀 crab OR 🏖️ beach-with-umbrella | 🟡 | Florida-specific gulf coast theme |
| `eco-scout` | paw-prints | 🦌 deer OR 🐢 turtle | ⚪ | Optional refinement |
| `green-light` | leaf-new | ♻️ recycling-symbol | ⚪ | Optional refinement |

---

## 2. New Generic Badge Concepts

These would require new badge definitions in `badges.ts` AND new evaluation logic. Tracked here for future implementation alongside the engagement features in ROADMAP.md.

| Concept | Emoji | Description |
|---------|-------|-------------|
| **Daily Streak** | 🔥 fire | Find a plate N consecutive days |
| **Early Bird** | 🌅 sunrise | First find of the day before 7am local |
| **Night Owl** | 🦉 owl | Find a plate after 10pm local |
| **Weekend Warrior** | 🏖️ beach-with-umbrella | Find N plates on a weekend |
| **Road Tripper** | 🚗 automobile | N plates in a single day |
| **Speed Demon** | ⚡ high-voltage | N plates within X minutes |
| **Variety Pack** | 🎨 artist-palette | N different categories in one day |
| **Completionist** | 💯 hundred-points | 100% of any category |
| **Anniversary** | 🎂 birthday-cake | First week / month / year of play |
| **Stargazer** | ⭐ star | Find any plate with "star" in name |
| **Out-of-State** | 🛂 passport-control | Find a plate from a state other than active |
| **Border Hopper** | 🗺️ world-map | Plates from N adjacent states in a trip |
| **Mileage Master** | 🛞 wheel | Cumulative GPS distance between finds |

---

## 3. State-Specific Region Badge Icons

Currently most state region badges use the generic `compass-new.png`. Replacing these gives 50+ badges across 12 states distinct visual identity.

### Florida (already differentiated ✓)

### California
| Region | Emoji | Status |
|--------|-------|--------|
| Far North | ⛰️ mountain | ✅ |
| Bay Area | 🌉 bridge-at-night | 🟡 |
| Sacramento | 🍷 wine-glass | 🟡 |
| Central | 🌾 sheaf-of-rice | 🟡 |
| SoCal | 🏖️ beach-with-umbrella | 🟡 |
| All Around | 🐻 bear | ✅ |

### Tennessee (3 Grand Divisions) ✅
| Region | Emoji | Status |
|--------|-------|--------|
| West Tennessee | 🎸 guitar (Memphis) | ✅ |
| Middle Tennessee | 🎤 microphone (Nashville) | ✅ |
| East Tennessee | ⛰️ mountain (Smokies) | ✅ |

### Kentucky
| Region | Emoji | Status |
|--------|-------|--------|
| Bluegrass | 🐎 horse | ✅ |
| Pennyrile | 🌽 ear-of-corn | 🟡 |
| Western Coalfields | ⛏️ pick | 🟡 |
| All Around | 🥃 tumbler-glass (bourbon) | 🟡 |

### Arkansas
| Region | Emoji |
|--------|-------|
| Ozarks | 🏞️ national-park |
| Delta | 🦆 duck |
| Timberlands | 🌲 evergreen-tree (already in MS Pines) |
| River Valley | 🌊 water-wave (already used) |

### Mississippi
| Region | Emoji |
|--------|-------|
| Coastal | 🌊 water-wave ✓ |
| All Around | 🌸 cherry-blossom (Magnolia) |
| River regions | 🚢 ship |

### Georgia
| Region | Emoji | Status |
|--------|-------|--------|
| North Georgia | ⛰️ mountain | ✅ |
| Metro Atlanta | 🏙️ cityscape | 🟡 |
| Coastal | ⚓ anchor | 🟡 |
| All Around | 🍑 peach | ✅ |

### Kansas
| Region | Emoji | Status |
|--------|-------|--------|
| All Around | 🌻 sunflower | ✅ |
| Agricultural regions | 🌾 sheaf-of-rice | 🟡 |

### Alabama
| Region | Emoji | Status |
|--------|-------|--------|
| North (Huntsville) | 🚀 rocket | 🟡 |
| Central (Birmingham) | ⚙️ gear | 🟡 |
| Gulf Coast | 🌊 water-wave | ✅ |

### Alaska
| Region | Emoji | Status |
|--------|-------|--------|
| All Around | 🐻‍❄️ polar-bear | ✅ |
| Interior (mountains) | ⛰️ mountain | ✅ |
| Coast | 🐟 fish | 🟡 |

### Arizona
| Region | Emoji | Status |
|--------|-------|--------|
| All Around | 🌵 cactus | ✅ |
| Northern | ⛰️ mountain | ✅ |
| Desert | 🏜️ desert | 🟡 |

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
- Winter ❄️ snowflake

### Events / Promotions
| Concept | Emoji |
|---------|-------|
| Limited-time scavenger hunt | 🔍 magnifying-glass |
| Tourism board partnership | 🎫 admission-tickets |
| Sports postseason | 🏆 trophy |
| Election year | 🗳️ ballot-box |
| Eclipse event | 🌒 waning-crescent-moon |
| Big game weekend | 🏟️ stadium |
| Brand partnership | 🤝 handshake |
| Community milestone | 🌐 globe-with-meridians |

---

## Implementation Notes

- Source: https://github.com/microsoft/fluentui-emoji
- License: MIT
- Format: Use `3D` variants (PNG, ~512x512)
- Place in `public/badges/`
- Wire in `src/components/BadgeIcon.tsx` `BADGE_ICONS` map
- Naming convention: lowercase, hyphenated, suffix with `-new` if replacing existing icon (matches current pattern)

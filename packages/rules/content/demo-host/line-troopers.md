---
kind: unit
name: Line Troopers
roles: [battleline]
profiles:
  - { name: Trooper, M: 6", T: 3, Sv: 4+, W: 1, Ld: 7+, OC: 2 }
ranged:
  - { name: Service rifle, tags: [RAPID FIRE 1], range: 24", A: 1, BS: 4+, S: 4, AP: 0, D: 1 }
  - { name: Flamer, tags: [IGNORES COVER, TORRENT], range: 12", A: D6, BS: N/A, S: 4, AP: 0, D: 1 }
  - { name: Service pistol, tags: [PISTOL], range: 12", A: 1, BS: 4+, S: 4, AP: -1, D: 1 }
melee:
  - { name: Close combat weapon, A: 1, WS: 4+, S: 3, AP: 0, D: 1 }
factionAbilities: [Hold the Line]
composition:
  models:
    - { name: Sergeant, min: 1, max: 1 }
    - { name: Trooper, min: 9, max: 19 }
  points:
    - { models: 10, points: 65 }
    - { models: 20, points: 130 }
  wargear:
    Sergeant: [service-pistol, close-combat-weapon, signal-flare]
    Trooper: [service-rifle, close-combat-weapon]
wargearOptions:
  - { id: flamer, models: Trooper, per: { every: 10 }, replace: [service-rifle], with: [[flamer]] }
equipment:
  - { name: Signal flare }
keywords: [INFANTRY, BATTLELINE, LINE TROOPERS]
factionKeywords: [DEMO HOST]
---

## Abilities

**Dig In:** While this unit is within range of an objective you control, it has the Benefit of Cover.

## Wargear abilities

**Signal flare:** Once per battle, at the start of your Shooting phase, one friendly DEMO HOST VEHICLE unit within
12" of the bearer can re-roll its hit rolls of 1 until the end of the phase.

---
kind: unit
name: Veteran Squad
profiles:
  - { name: Veteran, M: 6", T: 4, Sv: 3+, W: 2, Ld: 6+, OC: 1 }
ranged:
  - { name: Carbine, tags: [ASSAULT], range: 18", A: 2, BS: 3+, S: 4, AP: -1, D: 1 }
  - { name: Melta gun, tags: [MELTA 2], range: 12", A: 1, BS: 3+, S: 9, AP: -4, D: D6 }
melee:
  - { name: Combat blade, A: 2, WS: 3+, S: 4, AP: -1, D: 1 }
coreAbilities: [Deep Strike]
factionAbilities: [Hold the Line]
composition:
  models: [{ name: Veteran, min: 5, max: 10 }]
  points:
    - { models: 5, points: 90 }
    - { models: 10, points: 180 }
  wargear: { Veteran: [carbine, combat-blade] }
wargearOptions:
  - { id: melta, per: 2, replace: [carbine], with: [[melta-gun]], points: 5 }
keywords: [INFANTRY, VETERAN SQUAD]
factionKeywords: [DEMO HOST]
---

## Abilities

**Hit Hard:** Each time this unit is set up using Deep Strike, until the end of the turn its ranged attacks get +1 to
hit.

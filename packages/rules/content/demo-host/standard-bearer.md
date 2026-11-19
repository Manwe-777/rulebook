---
kind: unit
name: Standard Bearer
roles: [character]
profiles:
  - { name: Standard Bearer, M: 6", T: 4, Sv: 3+, W: 3, Ld: 6+, OC: 2 }
ranged:
  - { name: Service pistol, tags: [PISTOL], range: 12", A: 1, BS: 3+, S: 4, AP: -1, D: 1 }
melee:
  - { name: Banner pole, A: 3, WS: 3+, S: 4, AP: 0, D: 1 }
coreAbilities: [Support]
factionAbilities: [Hold the Line]
composition:
  models: [{ name: Standard Bearer, min: 1, max: 1 }]
  points: [{ models: 1, points: 45 }]
  wargear: { Standard Bearer: [service-pistol, banner-pole] }
support:
  bodyguards: [line-troopers, veteran-squad]
keywords: [INFANTRY, CHARACTER, STANDARD BEARER]
factionKeywords: [DEMO HOST]
---

## Abilities

**Rallying Point:** While this model is supporting a unit, add 1 to that unit's Objective Control.

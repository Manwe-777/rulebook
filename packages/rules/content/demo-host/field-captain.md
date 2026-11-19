---
kind: unit
name: Field Captain
roles: [character]
profiles:
  - { name: Field Captain, M: 6", T: 4, Sv: 3+, InSv: 5+, W: 5, Ld: 6+, OC: 1 }
ranged:
  - { name: Service pistol, tags: [PISTOL], range: 12", A: 1, BS: 2+, S: 4, AP: -1, D: 1 }
  - { name: Grenade launcher, tags: [BLAST], range: 24", A: D3, BS: 3+, S: 4, AP: 0, D: 1 }
melee:
  - { name: Duelling sabre, A: 5, WS: 2+, S: 5, AP: -2, D: 1 }
coreAbilities: [Leader, Deep Strike]
factionAbilities: [Hold the Line]
composition:
  models: [{ name: Field Captain, min: 1, max: 1 }]
  points: [{ models: 1, points: 70 }]
  wargear: { Field Captain: [service-pistol, duelling-sabre] }
wargearOptions:
  - { id: launcher, replace: [service-pistol], with: [[grenade-launcher]] }
leader:
  bodyguards: [line-troopers, veteran-squad]
keywords: [INFANTRY, CHARACTER, FIELD CAPTAIN]
factionKeywords: [DEMO HOST]
---

## Abilities

**Steady Orders:** While this model is leading a unit, models in that unit get +1 to their Leadership rolls.

## Description

An officer who leads from the front line, trusted to keep a squad together under fire.

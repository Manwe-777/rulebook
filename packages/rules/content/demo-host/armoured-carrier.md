---
kind: unit
name: Armoured Carrier
roles: [dedicated-transport]
profiles:
  - { name: Armoured Carrier, M: 10", T: 9, Sv: 3+, W: 11, Ld: 7+, OC: 2 }
ranged:
  - { name: Heavy stubber, tags: [RAPID FIRE 3], range: 36", A: 3, BS: 4+, S: 4, AP: 0, D: 1 }
melee:
  - { name: Armoured hull, A: 3, WS: 5+, S: 6, AP: 0, D: 1 }
coreAbilities: [Deadly Demise D3]
composition:
  models: [{ name: Armoured Carrier, min: 1, max: 1 }]
  points: [{ models: 1, points: 80 }]
  wargear: { Armoured Carrier: [heavy-stubber, armoured-hull] }
transport:
  capacity: 12
  allows: [INFANTRY]
  space: { CHARACTER: 2 }
keywords: [VEHICLE, TRANSPORT, DEDICATED TRANSPORT, ARMOURED CARRIER]
factionKeywords: [DEMO HOST]
---

## Transport

This model can carry 12 DEMO HOST INFANTRY models. Each CHARACTER model takes the space of 2 models.

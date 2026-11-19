---
kind: muster
id: matched-play
name: Matched play (demo values)
battleSizes:
  - { id: incursion, name: Incursion, points: 1000, overrides: { detachments: { min: 1, max: 1 } } }
  - { id: strike-force, name: Strike Force, points: 2000 }
detachments: { min: 1, max: 2 }
datasheetLimits:
  - { role: epic-hero, max: 1 }
  - { role: battleline, max: 6 }
  - { role: dedicated-transport, max: 6 }
  - { role: default, max: 3 }
enhancements: { max: 3, perModel: 1, excludeRoles: [epic-hero] }
upgrades: { max: 3, perUnit: 1 }
warlord: { required: true, roles: [character] }
attachments: { leadersPerBodyguard: 1, supportPerBodyguard: 1 }
strategicReserves: { maxShare: 0.5 }
---

## Description

Placeholder values that show the shape of the muster rules. Replace them with the values from the current muster
guide before checking real lists.

---
kind: muster
id: matched-play
name: Matched play (demo values)
battleSizes:
  - id: incursion
    name: Incursion
    points: 1000
    overrides: { detachmentPoints: 2, enhancements: { max: 2, perModel: 1, excludeRoles: [epic-hero] } }
  - { id: strike-force, name: Strike Force, points: 2000 }
detachments: { min: 1 }
detachmentPoints: 3
anyLoneDetachment: false
dispositions:
  - { id: purge-the-foe, name: Purge the Foe }
  - { id: take-and-hold, name: Take and Hold }
  - { id: priority-assets, name: Priority Assets }
  - { id: disruption, name: Disruption }
  - { id: reconnaissance, name: Reconnaissance }
datasheetLimits:
  - { role: epic-hero, max: 1 }
  - { role: battleline, max: 6 }
  - { role: dedicated-transport, max: 6 }
  - { role: default, max: 3 }
enhancements: { max: 4, perModel: 1, excludeRoles: [epic-hero] }
upgrades: { max: 3, perUnit: 1, enhancementSlots: 1 }
warlord: { required: true, roles: [character] }
attachments: { leadersPerBodyguard: 1, supportPerBodyguard: 1 }
strategicReserves: { maxShare: 0.5 }
---

## Description

Detachment points, enhancement limits and force dispositions follow the 11th edition muster rules for Incursion and
Strike Force. The other values are placeholders that show the shape of the muster rules; replace them with the values
from the current muster guide before checking real lists.

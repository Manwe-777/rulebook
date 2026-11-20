---
kind: detachment
name: Armoured Column
cost: 1 # detachment points
dispositions: [disruption, purge-the-foe]
grants:
  - { units: { ids: [veteran-squad] }, roles: [battleline], keywords: [BATTLELINE] }
enhancements:
  - { name: Overcharged Engines, points: 15, target: unit, keywords: [TRANSPORT] }
stratagems:
  - { name: Ram Speed, cp: 2, category: Strategic Ploy }
---

## Detachment rule

### Mounted Advance

Units that disembark from a DEMO HOST TRANSPORT can still declare a charge that turn. VETERAN SQUAD units are
BATTLELINE in this army.

## Enhancements

### Overcharged Engines

Upgrade. Add 2" to this unit's Move characteristic.

## Stratagems

### Ram Speed

**When:** Your Charge phase.

**Target:** One DEMO HOST VEHICLE unit from your army.

**Effect:** After your unit ends a charge move, roll a D6 for each enemy unit within Engagement Range: on a 4+, that
unit suffers D3 mortal wounds.

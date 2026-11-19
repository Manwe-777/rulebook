---
kind: detachment
name: Rapid Response
points: 30
unique: [VANGUARD]
enhancements:
  - { name: Forward Observer, points: 10, keywords: [CHARACTER], excludeKeywords: [EPIC HERO] }
stratagems:
  - { name: Drop In, cp: 1 }
constraints:
  - id: needs-deep-strikers
    when: { detachment: rapid-response }
    select: { units: { ids: [veteran-squad] } }
    measure: count
    min: 1
    message: Rapid Response needs at least one Veteran Squad.
---

## Detachment rule

### First In

Units from your army with Deep Strike can be set up in the first battle round.

## Enhancements

### Forward Observer

After the bearer's unit is set up using Deep Strike, one other friendly unit within 12" can re-roll its hit rolls of 1
until the end of the turn.

## Stratagems

### Drop In

**When:** The Reinforcements step of your Movement phase.

**Target:** One DEMO HOST unit from your army that is in Strategic Reserves.

**Effect:** Your unit can be set up anywhere more than 6" from all enemy units.

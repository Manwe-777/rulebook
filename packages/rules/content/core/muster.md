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
stratagems:
  - { name: Command Re-roll, cp: 1 }
  - { name: Epic Challenge, cp: 1 }
  - { name: Insane Bravery, cp: 1 }
  - { name: Explosives, cp: 1 }
  - { name: Crushing Impact, cp: 1 }
  - { name: Rapid Ingress, cp: 1 }
  - { name: Fire Overwatch, cp: 1 }
  - { name: Smokescreen, cp: 1 }
  - { name: Heroic Intervention, cp: 1 }
  - { name: Counteroffensive, cp: 2 }
---

## Description

Detachment points, enhancement limits and force dispositions follow the 11th edition muster rules for Incursion and
Strike Force. The other values are placeholders that show the shape of the muster rules; replace them with the values
from the current muster guide before checking real lists.

## Stratagems

Core stratagems every army can use, written in our own words; the core rules win where they differ. A player can't use
the same stratagem twice in one phase, nor target one unit with two stratagems in the same phase.

### Command Re-roll

**When:** Any phase, just after you make an Advance, Charge, Damage, Hazard, Hit, Save or Wound roll, or a roll for
the number of attacks of a weapon, for a friendly unit or model.

**Target:** That unit or model.

**Effect:** Re-roll it. When several dice were rolled together, re-roll one of them (a charge roll is always re-rolled
in full).

### Epic Challenge

**When:** Fight phase, just after a friendly CHARACTER unit is selected to fight.

**Target:** That CHARACTER unit.

**Effect:** Pick one CHARACTER model in it: until the end of the phase, its melee weapons have [PRECISION].

### Insane Bravery

**When:** Battle-shock step of your Command phase, just before you take a battle-shock roll for a friendly unit.

**Target:** That unit.

**Effect:** The roll is passed automatically.

**Restrictions:** Once per battle.

### Explosives

**When:** Your Shooting phase.

**Target:** One friendly EXPLOSIVES or GRENADES unit that isn't engaged, can shoot and didn't Advance this turn.

**Effect:** Pick one EXPLOSIVES or GRENADES model in it and one unengaged enemy unit within 8" that it can see. Roll six
D6: each 4+ inflicts 1 mortal wound on that enemy unit.

### Crushing Impact

**When:** Your Charge phase, just after a friendly MONSTER or VEHICLE unit ends a charge move.

**Target:** That unit.

**Effect:** Pick an enemy unit engaged with it and one of your models engaged with that unit. Roll as many D6 as that
model's Toughness: each 1 inflicts 1 mortal wound on your unit, each 5+ inflicts 1 mortal wound on the enemy unit (at
most 6 on each unit).

### Rapid Ingress

**When:** End of your opponent's Movement phase.

**Target:** One friendly unit in strategic reserves (not AIRCRAFT).

**Effect:** It makes an ingress move.

**Restrictions:** Not in the first battle round.

### Fire Overwatch

**When:** End of your opponent's Movement phase.

**Target:** One friendly unit that isn't engaged (not TITANIC).

**Effect:** It shoots using snap shooting: it can target only one visible enemy unit within 24", each attack hits only
on an unmodified 6, hit rolls can't be re-rolled, and it can't start an action for the rest of the phase.

### Smokescreen

**When:** Start of your opponent's Shooting phase.

**Target:** One friendly SMOKE unit.

**Effect:** Until the end of the phase, attacks against that unit, or against a unit that isn't fully visible because
of its models, are made against a target with the Benefit of Cover.

### Heroic Intervention

**When:** End of your opponent's Charge phase.

**Target:** One friendly unit that isn't engaged and is within 12" of an enemy unit (a VEHICLE only if it is a
CHARACTER or WALKER).

**Effect:** It makes a charge. Before rolling, pick a mode:

- **Leap to Defend:** it can only charge enemy units that made a charge move this phase.
- **Into the Fray (+1CP):** a charge roll above 6 counts as 6, and it can charge any enemy unit within 6".

### Counteroffensive

**When:** Fight step of your opponent's Fight phase, just after an enemy unit has resolved its attacks.

**Target:** One friendly unit that can fight.

**Effect:** Until the end of the phase it has Fights First, and it must be the next unit you pick to fight.

# Data model

Every record is a Markdown file: YAML frontmatter holds the data the apps compute with, and the Markdown body holds the
rules text in the contributor's own words. Records are parsed and checked by `@rulebook/rules` with zod schemas; a bad
field is reported with its path, never thrown.

Examples use the made-up demo faction that ships with the repository in `packages/rules/content/`.

## Files

```
content/
  core/
    muster.md          the muster rules (kind: muster)
  demo-host/
    faction.md         the faction record, required
    field-captain.md   one file per unit or detachment
    shield-wall.md
```

Files sit directly in their folder. A file with mistakes is left out and listed with every problem found; the rest
still loads. In tool-db each record is one value instead of a file (see [sharing.md](sharing.md)).

## Common fields

| Field  | Type   | Rule                                                                                                                                                                                               |
| ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind` | string | `faction`, `unit`, `detachment` or `muster`                                                                                                                                                        |
| `id`   | slug   | Lowercase words joined by hyphens, unique within its faction and kind. Never changes once released. Defaults to the file name (or the record's key in tool-db). A faction's id is its folder name. |
| `name` | string | Display name                                                                                                                                                                                       |

References to other records use their id. A reference to another faction's record is written `faction/id`.

Keywords are stored in upper case and compared ignoring case and accents (`KÂHL` matches `kahl`).

## Faction (`kind: faction`)

```yaml
kind: faction
id: demo-host
name: Demo Host
color: '#3b4a22'
icon: sword-01 # optional glyph name from the wh40k-icon font
factionKeyword: DEMO HOST # the keyword that makes a datasheet part of this faction
resources: # optional: faction resources spent by rules, shown on the army sheet
  - { id: resolve, name: Resolve points, short: RP }
```

Body sections (`##`): `Description`, `Army rule` (one `###` per rule), and any free sections.

`color` is the faction's colour in both apps: banners and datasheets in the rulebook; bars, headers, buttons and army
cards in the list builder. The builder darkens colours too light for white text until they reach 4.5:1 contrast, so
any colour is safe to pick. `icon` is shown on rulebook banners and datasheets, and on the builder's army cards and
army header. A unit's own `color` and `icon` override the faction's on its datasheet.

## Unit (`kind: unit`)

One datasheet.

```yaml
kind: unit
id: field-captain
name: Field Captain
roles: [character] # character, epic-hero, battleline, dedicated-transport, fortification
profiles:
  - { name: Field Captain, M: 6", T: 4, Sv: 3+, InSv: 5+, W: 5, Ld: 6+, OC: 1 }
ranged: # one row per weapon profile
  - { name: Service pistol, tags: [PISTOL], range: 12", A: 1, BS: 2+, S: 4, AP: -1, D: 1 }
  - { name: Grenade launcher, tags: [BLAST], range: 24", A: D3, BS: 3+, S: 4, AP: 0, D: 1 }
melee:
  - { name: Sabre – sweep, group: Sabre, A: 5, WS: 2+, S: 5, AP: -1, D: 1 }
  - { name: Sabre – thrust, group: Sabre, A: 3, WS: 2+, S: 6, AP: -2, D: 2 }
coreAbilities: [Leader, Deep Strike, 'Feel No Pain 5+']
factionAbilities: [Hold the Line]
composition:
  models: # the unit's model types and how many of each it can have
    - { name: Field Captain, min: 1, max: 1 }
  points: # cost by unit size, total models
    - { models: 1, points: 70 }
  wargear: # default wargear per model type
    Field Captain: [service-pistol, sabre]
wargearOptions:
  - id: launcher
    models: Field Captain # optional: which model type may take it; any model when left out
    per: 1 # up to this many models; { every: 5 } for one in every 5 models; all (the default) for any number
    replace: [service-pistol]
    with: [[grenade-launcher]] # pick one list of weapon ids
    points: 0 # optional cost per model taking it
leader: # optional: Leader ability
  bodyguards: [line-troopers, veteran-squad] # unit ids this unit can lead
support: # optional: Support ability, same shape as leader
  bodyguards: []
transport: # optional
  capacity: 12
  allows: [INFANTRY] # keywords a model needs to embark
  excludes: [ARTILLERY]
  space: { EXOARMOUR: 2 } # models with these keywords take this many places
detectionRange: 15" # optional, when it differs from the core default
keywords: [INFANTRY, CHARACTER, FIELD CAPTAIN]
factionKeywords: [DEMO HOST]
image: https://example.org/captain.webp # optional, hosted elsewhere
```

- Weapon rows that share a `group` are profiles of one weapon; the datasheet marks them and one profile is picked per
  attack.
- A weapon's id is its `id` field, or the slug of its group or name (`Sabre` → `sabre`). Wargear lists and options use
  these ids, and every id they use must be a weapon on the datasheet.
- Weapon abilities are `tags`, written as on the datasheet (`ANTI-VEHICLE 3+`, `SUSTAINED HITS 1`).
- `roles` drive muster limits. A unit can have several (`[character, epic-hero]`).
- The datasheet's composition, wargear, wargear options, points, leader and support blocks are generated from this
  data.
- Body sections: `Abilities` (unit abilities, one bold name or `###` per ability), and optional notes under `Leader`,
  `Support`, `Transport`, `Wargear options` and `Unit composition` for anything the structured fields can't express,
  and `Description`.

## Detachment (`kind: detachment`)

A detachment carries its own rules, enhancements, upgrades and stratagems, since none of them exist without it.

```yaml
kind: detachment
id: shield-wall
name: Shield Wall
cost: 2 # detachment points, paid from the battle size's budget (not from the army's points)
disposition: take-and-hold # force disposition, an id from the muster rules' dispositions
unique: [VANGUARD] # tags: an army can't take two detachments that share one
enhancements:
  - id: banner-of-resolve
    name: Banner of Resolve
    points: 15
    target: model # model: given to one CHARACTER model; unit: an upgrade for a whole unit
    keywords: [FIELD CAPTAIN] # the bearer needs all of these
    excludeKeywords: [EPIC HERO]
  - id: reinforced-plating
    name: Reinforced Plating
    points: 20
    target: unit
    keywords: [VEHICLE]
stratagems:
  - id: brace
    name: Brace!
    cp: 1
    category: Battle Tactic # optional
constraints: [] # army rules this detachment adds, see validation.md
```

Enhancement and stratagem ids default to the slug of their name. Body sections: `Description`, `Detachment rule` (one
`###` per rule), and `Enhancements` and `Stratagems` with one `###` per entry, named like the entry, holding its text. A stratagem's text uses `**When:**`, `**Target:**`, `**Effect:**` and `**Restrictions:**`
lines.

## Muster rules (`kind: muster`, faction `core`)

The core data every list is checked against. One record, maintained by the `core` maintainers.

```yaml
kind: muster
id: matched-play
name: Matched play
battleSizes:
  - id: incursion
    name: Incursion
    points: 1000
    overrides: { detachmentPoints: 2, enhancements: { max: 2 } }
  - { id: strike-force, name: Strike Force, points: 2000 }
detachments: { min: 1 } # optional max; otherwise only detachment points limit them
detachmentPoints: 3 # what an army can spend on detachments
anyLoneDetachment: false # true: an army with one detachment may take it whatever its cost
dispositions: # force dispositions; an army with several detachments picks one of theirs
  - { id: purge-the-foe, name: Purge the Foe }
  - { id: take-and-hold, name: Take and Hold }
  - { id: priority-assets, name: Priority Assets }
  - { id: disruption, name: Disruption }
  - { id: reconnaissance, name: Reconnaissance }
datasheetLimits: # copies of the same datasheet, by role; the first matching role wins
  - { role: epic-hero, max: 1 }
  - { role: battleline, max: 6 }
  - { role: dedicated-transport, max: 6 }
  - { role: default, max: 3 }
enhancements: { max: 4, perModel: 1, roles: [character], excludeRoles: [epic-hero] } # roles: who can take one
upgrades: { max: 3, perUnit: 1, enhancementSlots: 1 } # any upgrades together use this many enhancement slots
warlord: { required: true, roles: [character] }
attachments: { leadersPerBodyguard: 1, supportPerBodyguard: 1 }
strategicReserves: { maxShare: 0.5 }
constraints: [] # further army-wide rules, see validation.md
```

Detachment points, enhancement limits and dispositions above follow the 11th edition muster rules for Incursion and
Strike Force; the other values show the shape only and come from the current muster guide. Battle sizes may override
any limit (`battleSizes[].overrides`).

## Release

A fixed snapshot of one faction, signed by a maintainer (see [sharing.md](sharing.md)).

```yaml
faction: demo-host
version: 2026-11 # free text chosen by the maintainer
core: <hash of the core release it was checked against>
records: # every record in the faction, by kind/id, to the hash of its content
  faction/demo-host: <hash>
  unit/field-captain: <hash>
  detachment/shield-wall: <hash>
notes: Points update and the new detachment. # Markdown changelog
```

## List

What the builder saves. Lists are owned by their author and stored in the author's tool-db namespace, or exported as a
file.

```yaml
name: Shield Wall 2000
release: <hash of the faction release the list was last edited with>
disposition: take-and-hold # needed when the detachments have different dispositions
core: <hash of the core release>
battleSize: strike-force
faction: demo-host
detachments: [shield-wall]
warlord: u1
units:
  - id: u1 # unique within the list
    unit: field-captain # or faction/unit-id for another faction's unit
    models: 1
    wargear: [{ option: launcher, models: 1, choice: [grenade-launcher] }] # choice is one of the option's lists
    enhancement: banner-of-resolve
    attachedTo: u2 # the bodyguard this leader or support unit joins
  - id: u2
    unit: line-troopers
    models: 10
    upgrade: reinforced-plating # unit upgrades use `upgrade`
formation: # optional, checked when given
  reserves: [u3]
  embarked: { u4: [u2] } # transport entry id to embarked entry ids
```

# Validation

`@rulebook/rules` checks two things, both as pure functions that return a list of issues and never throw:

- `validateList(list, data)`: is this army legal?
- `checkDataset(data)`: are this faction's records consistent with each other and with the core data?

`data` is one faction release plus the core release it names. Both apps run the same code, so the editor shows what the
builder will report.

## Issues

```ts
interface Issue {
  code: string; // stable id, e.g. 'points-over-limit'
  severity: 'error' | 'warning'; // errors make a list illegal; warnings don't
  message: string; // plain words, names the units involved
  entries: string[]; // list entry ids (or record ids for dataset checks) the issue is about
  source: string; // 'core', or the record id whose rule raised it
}
```

A list is legal when it has no errors.

## List checks

Run in this order; every check runs even when an earlier one fails.

1. **References.** The release, battle size, detachments, units, wargear options, enhancements and upgrades all exist
   in the data. Unknown references are errors and the entry is skipped by later checks.
2. **Faction.** Every unit comes from the army's faction or a faction it includes (an entry can name another faction's
   unit as `faction/id`), and has the army's faction keyword, unless a constraint allows it. Allies are written that
   way: an `allow: faction` constraint selecting them, with a points `max`.
3. **Unit size.** The model count matches one of the unit's `points` sizes and each model type's `min`/`max`. When the
   entry gives `counts`, they match a size's model types; without them it takes the first size with its number of
   models. Points, default wargear and wargear limits use that size's models.
4. **Wargear.** Each option is taken by no more models than its `per` allows, options of one `group` together by no
   more than the most any of them allows, and chosen lists exist. Every swap must find enough models still carrying
   what it replaces: options for a named model type are applied first, then the others in list order.
5. **Points.** Units, wargear options, wargear priced per item carried (`itemPoints`), enhancements and upgrades are
   summed; a datasheet's later copies add its
   `copies` surcharge, counted in list order. Over the battle size's limit is an error. Detachments don't cost
   points.
   Before the checks, each chosen detachment's `grants` add their roles and keywords to the units they select (up to
   `max`, in list order), so datasheet limits, enhancements and the warlord see the units as the army uses them.

6. **Detachments.** At least `detachments.min` (and at most `max` when set), each once. Their `cost` adds up to no
   more than the battle size's `detachmentPoints`, unless `anyLoneDetachment` is on and there is only one. No two
   share a `unique` tag. When the chosen detachments offer more than one disposition, even a single detachment, the
   list picks one of them (`disposition`); a picked disposition must be offered by a chosen detachment.
7. **Datasheet limits.** Copies of each datasheet stay within the first `datasheetLimits` entry matching one of its
   roles.
8. **Enhancements.** Each enhancement comes from a chosen detachment, is taken once, goes on a unit with one of
   `enhancements.roles`, its `keywords` and none of its `excludeKeywords` or `excludeRoles`, and each model has at most `perModel`. The army has
   at most `enhancements.max`, counting `upgrades.enhancementSlots` more as soon as it takes any upgrade.
9. **Upgrades.** The same rules for unit upgrades, with `upgrades.perUnit` and `upgrades.max`; the same upgrade can go
   on several units unless `upgrades.once` is on.
10. **Warlord.** Present when required, and has one of the warlord roles.
11. **Attachments.** A leader or support unit is attached only to a bodyguard listed on its datasheet, in a block whose
    `when` holds and whose `unless` doesn't; each bodyguard
    has at most `leadersPerBodyguard` leader units and `supportPerBodyguard` support units, unless a constraint allows
    more.
12. **Constraints.** Every constraint from the core muster record, the faction record, the chosen detachments and the
    datasheets in the army.
13. **Formation** (only when the list has a `formation` section). Reserve units cost at most `strategicReserves.maxShare`
    of the points limit, counting units embarked in reserve transports. Embarked units fit their transport's capacity,
    allowed and excluded keywords and space rules.

## Constraints

Factions and detachments add their own army rules as data. A constraint selects things in the army, measures them and
compares the result. No faction data runs code.

```yaml
constraints:
  - id: needs-mounted
    when: { detachment: shield-wall } # optional: only applies when this holds
    select: { units: { keywords: [MOUNTED] } }
    measure: count # count | points | models
    min: 1
    message: Shield Wall needs at least one MOUNTED unit.
  - id: elite-share
    select: { units: { roles: [battleline], not: true } }
    measure: points
    maxShare: 0.5 # of the battle size's points limit
    message: Non-BATTLELINE units can be at most half the army's points.
  - id: allow-agents
    allow: faction # lift a core check for the selected units
    select: { units: { keywords: [AGENT] } }
    measure: points
    max: 500
    message: Up to 500 points of AGENT units can join the army.
```

**`when`** (all given conditions must hold): `detachment: id`, `battleSize: id`, `faction: id` (the army's faction),
`has: <selector>` (at least one match). **`unless`** takes the same conditions and switches the constraint off while
they all hold; a list of conditions switches it off while any one of them holds.

**Selectors** pick list entries:

| Field                                        | Matches entries that…                              |
| -------------------------------------------- | -------------------------------------------------- |
| `units: { ids: [...] }`                      | use one of these datasheets                        |
| `units: { keywords: [...] }`                 | have all of these keywords                         |
| `units: { anyKeywords: [...] }`              | have at least one of these keywords                |
| `units: { notKeywords: [...] }`              | have none of these keywords                        |
| `units: { roles: [...] }`                    | have one of these roles                            |
| `units: { … , not: true }`                   | don't match the rest of the selector               |
| `enhancements: { ids: [...] }` / `upgrades:` | carry one of these                                 |
| `attached: { … }`                            | are attached units whose leader matches the filter |
| `warlord: true` / `warlord: false`           | are / aren't the warlord                           |

**Measures:** `count` (entries), `models` (models in them), `points` (their total cost).

**Comparisons:** `min`, `max`, `maxShare` (share of the points limit), `equal`. Every constraint needs one, except an
`allow` with no limit.

**`allow`** turns a constraint into an exception for a core check on the selected entries, limited by the comparison:
`faction` (units without the faction keyword), `datasheet-limit`, `attachments` (selected leader and support units
don't count toward a bodyguard's limits, and a selected bodyguard takes one more leader).
When the comparison fails, the core check applies again and its issue names the constraint.

Rules that can't be expressed this way are written in the record's text, and the builder shows them as reminders on the
army sheet instead of checking them.

## Dataset checks

Run by the editor on every change and by maintainers before a release. Errors block a release.

- Every reference resolves: leader and support bodyguards, wargear ids (weapons and equipment) in defaults and
  options, constraint selectors,
  `faction/id` references to other factions.
- Every enhancement and stratagem has text (warning).
- Every detachment has at least one force disposition, and only ones the muster rules list (warning).
- Unit sizes in `points` fit the model type limits; sizes don't repeat.
- Ids are unique within their kind; enhancement and stratagem ids are unique within their detachment.
- Every unit carries the faction keyword (warning, since some factions include other units on purpose).
- A unit with a `leader` or `support` section has the matching core ability, and the reverse.
- Records that changed since the last release keep their ids, or the release notes say which ids were removed (lists
  using them get a warning when moved to the new release).

## Tests

Each list check has tests for the legal case, the boundary (exactly at a limit) and one past it. Constraints are tested
for every selector, measure and comparison, plus `when` and `allow`. Fixtures are built from the demo faction.

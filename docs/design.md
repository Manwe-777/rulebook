# Design

Rulebook is an open, free and community-run home for Warhammer 40,000 (11th edition) army rules, written by players in
their own words, and a list builder that checks whether an army is legal.

## Goals

- Anyone can read every faction's rules without an account.
- Approved contributors can edit rules through a form-based editor; maintainers review and publish their changes.
- Rules are stored as structured data, so the list builder can check a list without a human reading the rules.
- The list builder tells you if a list is legal (points, detachments, enhancements, upgrades, leaders and support
  units, unit limits) and explains every problem it finds.
- No company owns the data. Rules are shared over Nostr relays through [tool-db](https://github.com/Manwe-777/tool-db);
  the project runs one durable relay, and anyone can run more.
- Everything is open source.

## Parts

| Folder             | Package              | Contents                                                                       |
| ------------------ | -------------------- | ------------------------------------------------------------------------------ |
| `packages/rules`   | `@rulebook/rules`    | Record schemas, Markdown parsing, dataset checks and list validation. Pure TS. |
| `packages/sharing` | `@rulebook/sharing`  | tool-db keys, write rules (verificators), roles, proposals and releases.       |
| `apps/rulebook`    | `@rulebook/rulebook` | Reader, editor, review queue and release publishing.                           |
| `apps/builder`     | `@rulebook/builder`  | List builder and list validation.                                              |
| `apps/relay`       | `@rulebook/relay`    | ToolDB relay node: durable storage and the same write rules as the clients.    |

`packages/rules` and `packages/sharing` are used by both apps and the relay, so every place that reads data checks it
the same way.

```
 contributor ──propose──►                       ◄──read releases── list builder
 maintainer ──accept / release──►   relays    ◄──read / edit──── rulebook (reader + editor)
 owner ──maintainers / hidden──►  (public +
                                   apps/relay)
```

## Documents

- [data-model.md](data-model.md): every record type for 11th edition and the list format.
- [validation.md](validation.md): the checks run on lists and on datasets, and the constraint format factions use for
  their own rules.
- [sharing.md](sharing.md): how records, proposals, roles and releases are stored in tool-db.
- [roadmap.md](roadmap.md): build order.

## Roles

| Role        | Can                                                                  | Granted by        |
| ----------- | -------------------------------------------------------------------- | ----------------- |
| Reader      | Read released rules and unreleased accepted changes                  | Nobody, no login  |
| Contributor | Propose changes to a faction                                         | A maintainer      |
| Maintainer  | Accept or reject proposals, edit directly, publish releases          | The owner         |
| Owner       | Appoint and remove maintainers, hide content, maintain the core data | The project's key |

- Roles are per faction. The core rules data (battle sizes, muster limits, core abilities) is the faction `core`, with
  its own maintainers.
- Anyone signed in can ask to contribute to a faction; maintainers see the requests in the review queue.
- The owner's public key is the only fixed fact. Every other permission is data signed along the chain owner →
  maintainers → contributors, and anyone who checks a write (the apps on every read, relays that know the owner) works
  it out from that one key.

## Identity

Identities are Nostr keys; a role belongs to a public key. The apps never send a secret key anywhere.

| Way to sign            | How it works                                                                    | Meant for                 |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| Browser key            | Made by the app on the first write and kept in the browser's storage            | Anyone, no signup         |
| Password-protected key | The browser key stored encrypted (NIP-49 `ncryptsec`), unlocked with a password | Contributors              |
| Browser extension      | A NIP-07 extension (Alby, nos2x…) signs; the app only sees the public key       | Maintainers and the owner |

- Reading needs no key. A browser key is made the first time someone writes (asks to contribute, proposes a change,
  saves a list online).
- The account page shows the public key (`npub`), and backs the secret key up as a password-protected `ncryptsec` file
  or as a plain `nsec` after a warning. The same page imports an `nsec` or `ncryptsec`, switches to an extension, and
  signs out (forgetting the stored key after asking for confirmation).
- Moving to an extension keeps the identity: import the backed-up key into the extension, then choose the extension
  in the app. Roles stay because the public key is the same.
- A maintainer or the owner signing with an unprotected browser key sees a notice recommending a password or an
  extension.
- A lost key can't be recovered. A contributor who loses theirs is added again with their new key by a maintainer.
- The owner key is made offline with `npm run owner-key -w @rulebook/relay`, which prints the public key and saves the
  secret key only as an `ncryptsec` file outside the repository. The owner keeps that file in a password manager and
  imports the key into an extension for owner actions. The public key is built into the apps (`VITE_RULEBOOK_OWNER`)
  and into the relay installer (`RULEBOOK_OWNER`).
- The owner's secret key can't be replaced: without it nobody can appoint or remove maintainers or hide content. The
  `ncryptsec` file needs at least one backup kept apart from the password manager.

## Content policy

The project shares game data and players' own explanations of rules. It never shares Games Workshop's text or art.

- Rules prose is always written in the contributor's own words. Copying text from codices, faction packs, the app or
  other sites is not accepted, and maintainers reject proposals that do it.
- Numbers and structure (characteristics, points, keywords, which units a leader can join, costs and limits) are entered
  as data.
- No Games Workshop artwork, logos, model photos or fonts are bundled or uploaded. Unit images are links to pictures the
  contributor has the right to share. Players can add photos of their own models to units in the list builder; those
  stay in their browser and are never shared.
- Names are kept to what players need to find a unit or rule. Branding never imitates Games Workshop's.
- The repository ships only a made-up demo faction. Real factions exist only as community data on the relays.
- The static sites never contain relay content: only the demo faction is prerendered, and the browser fetches and
  caches releases itself. Whatever the project's own hosting serves is code and demo data.
- The owner keeps a hidden list. Clients don't show anything on it and the project's relay deletes it, so the project
  can act on takedown requests. Deletion on public relays is best effort (NIP-09).
- Every page links to the official sources and states that the project is unofficial and not endorsed by Games
  Workshop.

## Rules

- 11th edition only. Data, validation and UI follow the 11th edition core rules and faction packs.
- Records are small (one unit, detachment, enhancement or stratagem each), so changes are easy to review and rarely
  clash.
- The list builder only uses releases: fixed snapshots of a faction signed by one of its maintainers. A saved list
  names the release it was built against, so it keeps the same result until its owner moves it to a newer release.
- Faction data never contains code. Faction-specific army rules use the declarative constraints in
  [validation.md](validation.md).
- Every problem found in a list or a dataset is reported with a message and the entry it concerns; nothing throws.

## Open questions

- **Muster values.** The core rules leave mustering to the Warhammer 40,000 app: battle sizes and their points limits,
  how many detachments an army takes, how many copies of a datasheet are allowed per role, and enhancement and upgrade
  limits. The `core` maintainers have to fill them in from the current muster guide; `data-model.md` defines the fields.
- **Allies.** How 11th edition handles allied units (e.g. agents of another faction), and whether that needs more than
  the constraint format.
- **Wargear costs.** Whether any wargear option costs points in 11th edition. The schema allows a cost per option.
- **Stratagem categories.** Faction packs list some stratagems with a category (Battle Tactic, Strategic Ploy, Wargear)
  and some without. The category is optional until the newer format is settled.
- **Topic and owner key.** The tool-db topic name, and who else holds a backup of the owner key.
- **Relay servers.** Which servers run `apps/relay` for the project, and their domains.

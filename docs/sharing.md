# Sharing

Records, proposals, roles and releases are stored in [tool-db](https://github.com/Manwe-777/tool-db) under one topic,
on public Nostr relays plus the project's own relay (`apps/relay`). `@rulebook/sharing` holds the key layout and the
write rules; the apps and the relay all register the same rules, so bad data is dropped wherever it arrives.

## Relays

- Clients publish to and read from a configured list: the project relay first, then public relays.
- `apps/relay` runs `RulebookRelay` (from `@rulebook/sharing/relay`): a `ToolDbRelay` with LevelDB storage and the
  write rules, reading role lists from its own store. It keeps every record for good, so data survives public relays
  dropping old events.
- Anyone can run another copy of `apps/relay` and add it to their client's list.
- Records are kept under the relays' message size limit (NIP-11); one record is one unit, detachment or similar, never a
  whole faction.

## Keys

`<f>` is a faction id (`core` for the core data), `<h>` a SHA-256 hash in hex, `<p>` a public key. Parts are separated
by `/`, since tool-db keeps `.` for user namespaces (`:<p>.<key>`). The topic is `rulebook-40k`.

| Key                     | Written by            | Value                                                           |
| ----------------------- | --------------------- | --------------------------------------------------------------- |
| `maintainers/<f>`       | Owner                 | `{ keys: [p…] }`                                                |
| `contributors/<f>`      | Maintainers of `<f>`  | `{ keys: [p…] }`                                                |
| `blob/<h>`              | Anyone                | A record's Markdown text; `<h>` must be its hash                |
| `head/<f>/<kind>/<id>`  | Maintainers of `<f>`  | `{ blob: h, proposal?: key }`: the accepted version of a record |
| `release/<f>/<h>`       | Maintainers of `<f>`  | The release manifest; `<h>` must be the hash of its JSON        |
| `review/<f>/<p>/<n>`    | Maintainers of `<f>`  | `{ status: accepted \| rejected, comment }` for one proposal    |
| `hidden`                | Owner                 | `{ keys: [key…], blobs: [h…], reason }`                         |
| `:<p>.proposal/<f>/<n>` | That user (namespace) | `{ kind, id, base?: h, blob: h, note }`                         |
| `:<p>.request/<f>`      | That user (namespace) | `{ message }`: asks to become a contributor                     |
| `:<p>.list/<n>`         | That user (namespace) | A saved army list                                               |

The owner's public key is not data: it is built into the apps and into the relay installer. A relay started without it
is an open store that keeps any signed data on the topic; the apps still apply these rules on every read.

A release manifest is `{ faction, version, date, core?, records: { 'kind/id': h }, notes }`, hashed as JSON with its
keys sorted. Turned back into files, a record becomes `<f>/<id>.md` (`<f>/faction.md` for the faction record), ready for
`Library.fromFiles`.

## Write rules

Each rule is a tool-db custom verificator on the key prefix.

- Every key: its first part is one of the shared key types above, or it is a user namespace key; and it is not on the
  hidden list.
- `maintainers/` and `hidden`: written by the owner.
- `contributors/<f>`, `head/<f>/`, `release/<f>/`, `review/<f>/`: the author is in `maintainers/<f>`, or is the owner.
- `blob/<h>` and `release/<f>/<h>`: the hash of the value equals `<h>`. Content-addressed values can't be changed, only
  written again with the same content. A blob is at most 48 kB and declares a record
  `kind` in its frontmatter. Relays check nothing more in a record's fields, so a relay built before a new field or
  kind still stores records that use it; the apps check every field when they read a record.
- User namespaces only hold `proposal/`, `request/` and `list/` keys.
- Proposals: the author is in `contributors/<f>` or `maintainers/<f>`. Proposals from anyone else are stored by public
  relays but ignored by the apps and the project relay.
- Every other value (heads, releases, reviews, role lists, proposals) is parsed with the sharing schemas; values that
  don't parse are rejected.

Roles are read when data is checked, so removing a maintainer also stops trusting their heads and releases. A record
then falls back to the newest head written by a current maintainer. A release stays trusted as long as one current
maintainer has signed it: any maintainer can sign an existing manifest again under the same key.

## Flows

**Contributing.** A signed-in user writes `:<p>.request/<f>`. Maintainers see open requests in the review queue and add
the key to `contributors/<f>`.

**Proposing a change.** The editor writes the new record text to `blob/<h>`, then `:<p>.proposal/<f>/<n>` naming the
record, the blob it was based on (`base`) and a note. A proposal whose `base` is no longer the record's head is shown
as outdated; the editor offers a three-way merge of the Markdown.

**Reviewing.** A maintainer opens a proposal, sees the diff against the head and the dataset checks for the faction
with the change applied, then accepts (writes `head/…` and `review/…`) or rejects with a comment (`review/…` only).
Maintainers can also edit directly, which writes a blob and a head without a proposal.

**Releasing.** A maintainer picks the current heads of a faction, runs the dataset checks against the newest core
release, writes the manifest to `release/<f>/<h>` and adds release notes. The reader shows the newest trusted release by
default and accepted, unreleased changes on request.

**Building a list.** The builder loads the newest trusted release of the faction and the core release it names,
fetches the blobs by hash, and validates locally. A saved list keeps both release hashes. When a newer release exists,
the builder offers to move the list and shows what the move changes (points, removed entries, new issues).

**Hiding.** The owner adds keys or blob hashes to `hidden`. Every client checks the list on each read, including values
it cached earlier, and the relays running the write rules refuse new writes to hidden keys. Releases that need a hidden
blob load without that record.

## Caching

Clients store everything they verified in IndexedDB. Blobs and releases never change, so they are cached for good;
roles, heads and the hidden list are refreshed on every visit and kept live with subscriptions.

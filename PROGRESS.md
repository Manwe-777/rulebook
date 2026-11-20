# Progress

## Done

- Phase 1: project setup (Vite, React, TypeScript, Tailwind v4, ESLint, Prettier, Vitest, CI check job).
- Phase 2: unit schema (zod) and parser for frontmatter plus Markdown sections. Every bad field is reported instead of
  throwing.
- Phase 3: datasheet layout modelled on the 10th-edition cards; noise camouflage header. Checked at desktop and 375px.
- Phase 4: faction bundles (`content/<faction>/faction.md` + unit files) read into a `Library` from any list of files.
  Pages: faction index, faction page (free Markdown rules + datasheet list), unit page. Every page is prerendered to
  static HTML; `404.html` falls back to the client app. Unreadable files are listed on the index. Format documented in
  `docs/data-model.md`. A test fails CI when any file in `content/` is invalid.
- Workspace: the app moved to `apps/rulebook`; root holds lint, format and CI tooling.
- Design docs for 11th edition: `docs/design.md`, `data-model.md`, `validation.md`, `sharing.md`, `roadmap.md`.
- Rules package (`packages/rules`): 11th edition schemas for factions, units (roles, points, wargear options, leader,
  support, transport), detachments (enhancements, upgrades, stratagems, unique tags, constraints) and muster rules; the
  `Library`; a made-up demo faction and demo muster values. The rulebook app reads it, generates composition, wargear,
  points and leader blocks from the data, and has detachment pages.
- List validation: `validateList(list, library)` with every check in `docs/validation.md` and the constraint format,
  tested against the demo faction.
- Dataset checks: `checkDataset(library)` (unknown weapons, model types, bodyguards and constraint references; impossible
  unit sizes; Leader/Support mismatches; missing faction keywords and rules text; muster defaults). The rulebook home
  page lists them.
- Sharing (`packages/sharing`): key layout, write rules, roles, record texts by hash, proposals, reviews, releases,
  co-signing and the hidden list (`RulebookClient`), and `RulebookRelay`. Tested end to end against a local relay.
- Relay app (`apps/relay`): runs `RulebookRelay` with LevelDB, configured by environment variables; `publish` uploads a
  content folder and releases each faction in it.
- Reader on tool-db: with `VITE_RELAYS` and `VITE_RULEBOOK_OWNER` set, the rulebook loads the newest release of every
  faction from the relays after the first render, on top of the demo content. Checked in the browser against a local
  relay.
- Identity: browser key made on the first write, password protection (NIP-49), backup as `ncryptsec` file or `nsec`,
  import, NIP-07 extension, sign out; `npm run owner-key -w @rulebook/relay` makes the owner key.
- Editor (phase 7) in the rulebook: account page; per-faction workspace (ask to contribute, record list, new unit or
  detachment); record editor (Markdown with live parse errors, dataset checks with the change applied, and a preview;
  maintainers save, contributors propose); maintainers review proposals with a diff, add contributors from requests,
  manage contributors (owner: maintainers) and publish releases. Checked end to end in the browser against a local
  relay: request, approval, proposal, review, release, and the reader showing the new points.
- Connection badge in the rulebook header: relay link (connecting, connected, reconnecting, unreachable, offline) and
  whether this browser can sign. Sending is off while not connected or with a locked key. The record editor switches
  between the text and a full-width preview; checks and the send bar stay below both.
- Hosting (phase 9): CI deploys both apps to GitHub Pages (builder under `builder/`, links between them) and
  semantic-release publishes relay releases: a bundled relay, `install.sh` (systemd service, keeps settings, data and
  relay key on update, checks downloads) and `SHA256SUMS`. Installer tested under systemd in Docker; the Pages build
  checked under a sub-path in the browser. Apps and relay take the owner key as npub or hex. The relay needs no
  options: the release builds the project owner into `install.sh`, and with no owner it runs as an open store. See `docs/hosting.md`.
- Released rules are cached in IndexedDB (per owner key, shared by both apps on one site): shown at once on the next
  visit, kept when the relays can't be reached. `owner-key` no longer echoes the password.
- 11th edition detachment rules: detachments cost detachment points (`cost`, 1–3) from the battle size's budget
  (`detachmentPoints`: Incursion 2, Strike Force 3), not army points; each has a force `disposition` and an army with
  several picks one of theirs; upgrades together use one enhancement slot (`upgrades.enhancementSlots`); enhancement
  limits 2 / 4. `anyLoneDetachment` in the muster record covers the announced "any single detachment" rule. The builder
  shows each detachment's DP, disposition and tags, a DP counter and the disposition picker; the rulebook and the
  army sheet show DP and disposition. Local relay and browser data were reset (no migration: nothing was deployed).
- Readability: both apps tell the browser they are dark pages (`color-scheme: dark`), so dropdown lists, spinners and
  checkboxes are drawn dark with readable text; rule explanations wrap and open larger. The builder only offers the
  enhancements and upgrades a unit can take (the validator's check, shared) and hides the picker when there are none.
  The play view says when a unit took no wargear options and shows the dice to roll under each weapon it carries
  ("Roll 10 attacks, hitting on 3+"; abilities that add attacks are not counted).
- Rule explanations: a `glossary` record in `core` (one `###` per term, in our own words) explains weapon abilities and
  core abilities. Tapping a tag or core ability on a rulebook datasheet or in the builder's play view opens it (native
  popover). The starter glossary covers the weapon abilities, Feel No Pain and Deadly Demise; core abilities that
  changed in 11th edition (Deep Strike, Scouts, Stealth, Lone Operative, Infiltrators) wait for the core rules.
  Relays and release manifests accept any record kind, so new kinds need no relay update.
- Play view in the builder: tapping a unit's name opens it (`?unit=`, so back closes it) as it was built: stats with
  invulnerable save and base size (models with the same stats share a row), what each model type carries, only the
  weapons it carries with how many, its abilities, the rules of the wargear it carries, its enhancement or upgrade, and
  the leaders and support units attached to it. "Show all wargear" lists every weapon (the ones not carried dimmed)
  and every wargear rule. Checked against the tournament lists and at 390 px width.
- Wargear options: a count per choice, so two models can take different weapons from one option; headings name the
  model type; datasheets say "This model" / "The Theyn" and count repeated default wargear. Profiles carry base sizes.
- Checked against a real faction: Leagues of Votann (22 datasheets, 10 detachments, rules summarised in our own
  words) in a gitignored `local-content/` folder, published only to a local relay. A tournament list (two detachments,
  attached leaders, repeated datasheets) rebuilt in the builder comes to the same 1995 points and is legal. What it
  needed: several dispositions per detachment, datasheet copy surcharges ("2nd+ in your army: +20 pts"), wargear
  without a weapon profile (crests, scanners) with its own rules, and enhancements for one of several kinds of model.
  `publish` now reads each release back and fails when the relay refused records. Relays only check that a record
  text fits, matches its hash and declares a kind, so records with newer fields reach older relays.
- Printable army sheet: the builder's Print button opens the rulebook's `/print` page with the list after `#army=`
  (base64url, never sent to a server). Checkboxes (remembered per browser) for roster, army rules, detachment rules
  with the enhancements taken, stratagems and datasheets (each once). Roster brackets combined units with their total
  and spells out wargear swaps. Print CSS keeps the sheet colours, drops the app chrome and starts each section on a
  new page; datasheets keep their two-column layout on paper (`wide:` variant = md or print). Checked as a PDF.
- Faction colours and icons in the builder: the faction record's `color` tints an open army's page and its card on the
  armies screen (darkened when needed so white text keeps 4.5:1 contrast); its `icon` is shown on the card's banner
  (with a faint large copy behind) and next to the army name. The demo faction uses the generic `sword-01` glyph.
  Checked in the browser.
- Rules freshness in the builder: a "Rules data" panel on the armies screen (relay check state and when it last
  succeeded; version, release date and record count per faction and core), the rules version on each army card with a
  warning when the faction's rules changed since the army was last edited, and the release under the faction picker.
  Release info comes from `RulebookClient.latestReleases` and is cached with the files. Checked in the browser.
- Saved armies in the builder: an armies screen (name, faction, battle size, detachments, points against the limit,
  legal or problem count, unit count, last edit, unit photos) with new, open, duplicate and two-step delete. The open
  army is in the address (`?army=<id>`), so back, reload and links work on static hosting. The single list saved by
  earlier versions moves in on first load; unreadable armies are kept aside, not dropped. Checked in the browser.
- Attachments in the builder: a leader or support unit picks "Attach to" on its card, then sits framed with the unit
  it joins (a "Combined unit" box with the total points, attached cards on top) and shows "Leading …" with a Detach
  button; with nothing to join it lists the units it could. Checked in the browser.
- List builder as a PWA (installable, precached, works offline with cached releases).
- Unit photos in the builder: players add a photo of their own models per unit, crop it to a square (drag or pinch,
  zoom around the centre, quarter turns, always covering the square; preview and saved image drawn by the same code),
  saved as a 320 px WebP in IndexedDB and shown on unit cards and in the unit list. Checked in the browser.
- Smaller first load: tool-db, the editor and the account page load on demand, libraries are split into chunks that
  stay cached across deploys (rulebook 832 → ~620 kB, builder 643 → ~460 kB before gzip).
- List builder (`apps/builder`, phase 8 done before the editor): pick faction, battle size and detachments, add units,
  set size, wargear, enhancements, upgrades, attachments and warlord; points and every problem update as you edit; the
  list is saved in the browser (unreadable saves are backed up). Loads relay releases like the rulebook.

## Known issues

- tool-db has no deletion (NIP-09 is described in its design doc but not implemented), so the relay can't delete hidden
  content it already stored; it refuses new writes and clients don't show it.
- tool-db keeps a client's own writes locally even when they break the write rules, and `getData` serves them back
  without checking them again. Only that client is fooled, but its view goes wrong until its storage is cleared.
- Values a client cached are not checked again when roles change, and tool-db's `getData` doesn't return authors, so a
  head or release a client cached before its signer was removed stays trusted in that client until its storage is
  cleared. Hidden content is checked on every read.

- No relay server is chosen yet; `RULEBOOK_RELAYS` and `RULEBOOK_OWNER` must be set before the Pages build is useful.
- The relay installer job in CI (systemd in Docker on GitHub's runners) hasn't run there yet; it passes locally.
- First load is ~620 kB in the rulebook and ~460 kB in the builder (react-dom, zod, yaml, markdown); every page ships
  the whole rules library.

- Format gaps found with Leagues of Votann: "no duplicates", "one of these per model" and "replace X or Y" option rules;
  model types whose models carry different gear (E-COGs); passengers taking no transport space (by model type);
  detachments granting keywords (Beserks gain BATTLELINE); enhancements that need a weapon; splitting a unit across
  transports at deployment. These are written as notes in the records for now.

- The glossary needs checking against the 11th edition core rules, and the 11th edition core abilities adding. The
  editor can't create or edit glossary records yet.

## Next

- Push the repo, set the Pages variables, create the owner key and install a relay (`docs/hosting.md`). Editor follow-ups: form fields for the common frontmatter
  (stats, weapons, points) next to the text editor, a page for the core muster record and the hidden list, and merging
  outdated proposals. Builder follow-ups: exporting and importing armies (with their photos), sharing lists, sharing
  lists over tool-db, battle formation (reserves, transports) in the UI, only offering upgrades a unit can take.
- Muster values (battle sizes, detachment count, datasheet and enhancement limits) must be filled in from the current
  muster guide; see the open questions in `docs/design.md`.

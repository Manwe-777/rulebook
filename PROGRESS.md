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
- Wargear priced per item carried (`itemPoints`, e.g. a Repulsor's default Heavy Laser Destroyer +10), shown on
  datasheets and next to builder choices. The same upgrade can go on several units (as real lists do), unless the
  muster rules set `upgrades.once`.
- Live: the repository is on GitHub (Manwe-777/rulebook), the apps on GitHub Pages
  (manwe-777.github.io/rulebook/), relay release v1.0.0 with the owner key built in, and the first relay "Rulebook
  NYC" at `wss://192-241-132-246.sslip.io` (DigitalOcean droplet, Caddy for TLS), announced on the bootstrap relays.
- List sync between devices: armies are encrypted to the user's own key and kept in their namespace on the relays;
  a device links another with a QR code and a six-character code (works in an Android PWA, no extension needed).
  Newest change per army wins; deletions sync. Devices that sign with a browser extension can't sync.
- Local test content (gitignored `local-content/`, unpublished): 18 factions, 371 datasheets and 93 detachments,
  from 40k.app with rules in our own words: Leagues of Votann, Emperor's Children, Tyranids, Orks, T'au Empire, Grey
  Knights, the shared Space Marines bundle (69 datasheets, 16 detachments) and 11 chapters including it (Blood Angels,
  White Scars, Space Wolves, Ultramarines, Salamanders, Imperial Fists, Iron Hands, Raven Guard, Dark Angels, Black
  Templars, Deathwatch). Shared leaders name the chapter units they can lead. `check-content` reports no errors; 30
  tournament lists in `local-lists/` are legal and match their exports (one White Scars list is 100 short: its allied Callidus
  Assassin can't be expressed). Per-faction notes: `local-content/NOTES-<faction>.txt`; the method for adding a
  faction: `local-content/FACTION-BRIEF.txt`.
- Detachment `grants`: roles and keywords a detachment gives selected units (optionally up to `max`); validation
  applies them before every check and the builder's cards use the granted units (warlord, enhancements). Needed by
  Tyranids (Warrior Bioform Onslaught, Subterranean Assault), Orks (Kult of Speed, Runt Swarm) and Votann.
- `npm run check-content` and `npm run check-list` (rules package) check a content folder and price lists against
  it; the local factions' tournament lists live in the gitignored `local-lists/`.
- `npm run publish -w @rulebook/relay -- <folder> <version> --key <file>` signs with a password-protected key file
  (the Account page's backup), on project.json's relays plus the announced ones; RULEBOOK_SECRET still works for
  scripts. The bootstrap relays are nostr.mom, nos.lol and relay.primal.net (relay.damus.io connected too slowly).
- `npm run appoint -w @rulebook/relay`: the owner appoints or removes maintainers per faction (or `all`) from the
  terminal with the password-protected owner key file, so the owner key never goes into a browser. Checked against the
  local relays with a throwaway key (appoint, wrong password, remove).
- Relay discovery: `project.json` lists only bootstrap relays (relay.damus.io, nos.lol, relay.primal.net). A relay
  with `RELAY_PUBLIC_URL` announces itself hourly under `relay/<its key>`, signed with its own key, and copies the
  topic's data from the bootstrap and announced relays (a new relay fills itself; checked with two local relays: 206
  of 206 messages, all factions readable from the new one). Browsers read announcements when loading the rules, test
  each known relay, remember the ones that answer and drop one after three failed checks. The rulebook's Admin page
  lists the relays with name, key, last announcement, use and response time. The installer takes `--public-url` and
  `--name`. Client reads wait up to 8 s (tool-db's 1 s default dropped answers when many reads ran at once).
- `project.json` (committed) holds the owner's public key and the bootstrap relays. The apps, the relay and its installer
  default to it, and forks keep it, so they read the same data; build variables only override it.
- Shared datasheets: a faction can `include` others (a chapter including `space-marines`), with `excludes` for
  shared records it can't use. Lists, validation, the builder's unit and detachment pickers and the army sheet use
  the faction's own records plus the included ones; the dataset checks accept a shared leader naming a chapter unit;
  the rulebook keeps each datasheet under its own faction, links a shared leader's chapter bodyguards, and says on a
  chapter's page which factions it includes.
- Play mode in the builder (`?mode=play`, a Play button on each army card and a Play / Edit list switch in the army
  header): no forms, pickers, remove buttons or photo editing, so nothing changes mid-game. Each unit or combined unit
  is a compact card (photo, name, role, warlord, enhancement, points, stats in one line per distinct profile, what it
  carries); tapping it opens the full play view, and back returns to play mode. Checked in the browser.
- Readability: both apps tell the browser they are dark pages (`color-scheme: dark`), so dropdown lists, spinners and
  checkboxes are drawn dark with readable text; rule explanations wrap and open larger. The builder only offers the
  enhancements and upgrades a unit can take (the validator's check, shared) and hides the picker when there are none.
  The play view says when a unit took no wargear options and shows the dice to roll under each weapon it carries
  ("Roll 10 attacks, hitting on 3+"; abilities that add attacks are not counted).
- Rule explanations: a `glossary` record in `core` (one `###` per term, in our own words) explains weapon abilities and
  core abilities. Tapping a tag or core ability on a rulebook datasheet or in the builder's play view opens it (native
  popover). The glossary covers the 11th edition core abilities and weapon abilities (35 entries), checked against the
  core rules PDF and summarised in our own words.
  Relays and release manifests accept any record kind, so new kinds need no relay update.
- Play view in the builder: tapping a unit's name opens it (`?unit=`, so back closes it) as it was built: stats with
  invulnerable save and base size (models with the same stats share a row), what each model type carries, only the
  weapons it carries with how many, its abilities, the rules of the wargear it carries, its enhancement or upgrade, and
  the leaders and support units attached to it. "Show all wargear" lists every weapon (the ones not carried dimmed)
  and every wargear rule. Checked against the tournament lists and at 390 px width.
- Wargear options: a count per choice, so two models can take different weapons from one option; headings name the
  model type; datasheets say "This model" / "The Theyn" and count repeated default wargear. Profiles carry base sizes.
- Checked against Blood Angels: a `space-marines` bundle (18 shared datasheets, 5 detachments) and a `blood-angels`
  bundle including it (6 datasheets, Encarmine Speartip), local only, rules in our own words. Three tournament lists
  (GW app and New Recruit exports; three detachments each, repeated upgrades, paid wargear, copy surcharges, leaders
  from the shared bundle on chapter units) come to their exported 1995, 2000 and 2000 points and are legal, unit by
  unit.
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

- No content is published yet; the owner must appoint a maintainer before anything can be released.
- The relay installer job in CI (systemd in Docker on GitHub's runners) hasn't run there yet; it passes locally.
- First load is ~620 kB in the rulebook and ~460 kB in the builder (react-dom, zod, yaml, markdown); every page ships
  the whole rules library.

- List checks added for the gaps the factions found: allies only through an `allow: faction` rule (Deathwatch Allies,
  500 points); datasheet rules ("must / can't be the Warlord", "one per army") as unit `constraints` with a
  `warlord` selector and `when`/`unless` conditions; conditional leader and support blocks (Cato Sicarius with
  Marneus Calgar); sizes priced by model type (Wolf Guard Headtakers); wargear `group`s for "one or the other" swaps,
  and a check that every swap still finds what it replaces. All 31 local lists stay legal.
- Format gaps found across the 18 factions (details in each NOTES file): allied units from other factions (an
  Assassin in a White Scars list); per-datasheet army rules ("must / can't be the Warlord", "one per army",
  conditional Support); wargear rules "no duplicates", "one of these per model" and "replace X or Y"; points that
  depend on which models a unit has, not how many (Wolf Guard Headtakers with or without Hunting Wolves); transport
  space by model type or wounds and mixed capacity pools; detachment allowances for allies (Deathwatch Support's 500
  points); 40k.app leaving a unit's own name keyword off its card (added by hand where rules check it); two close
  combat weapon profiles sharing one id (Grey Knights squads, S5 row dropped).
- Format gaps found with Blood Angels: detachment restrictions on other Chapters' units (Encarmine Speartip) aren't
  checked; leaders that can only lead units missing from the data drop their Leader ability (Techmarine); 11th edition
  terms (HUNTER, Damaged X, psychic levels, combat doctrines) have no glossary entries yet.
- Format gaps found with Leagues of Votann: "no duplicates", "one of these per model" and "replace X or Y" option rules;
  model types whose models carry different gear (E-COGs); passengers taking no transport space (by model type);
  detachments granting keywords (Beserks gain BATTLELINE); enhancements that need a weapon; splitting a unit across
  transports at deployment. These are written as notes in the records for now.

- The editor can't create or edit glossary records yet. Datasheet-level terms that aren't core abilities (HUNTER,
  CONVERSION, OVERCHARGE, Damaged X, MOBILE) have no glossary entries.

## Next

- Push the repo, set the Pages variables, create the owner key and install a relay (`docs/hosting.md`). Editor follow-ups: form fields for the common frontmatter
  (stats, weapons, points) next to the text editor, a page for the core muster record and the hidden list, and merging
  outdated proposals. Builder follow-ups: exporting and importing armies (with their photos), sharing lists, sharing
  lists over tool-db, battle formation (reserves, transports) in the UI, only offering upgrades a unit can take.
- Muster values (battle sizes, detachment count, datasheet and enhancement limits) must be filled in from the current
  muster guide; see the open questions in `docs/design.md`.

# Roadmap

Each phase ends with `npm run check` passing and one commit.

1. **Workspace.** The rulebook app lives in `apps/rulebook`; lint, format and CI tooling at the root.
2. **Rules package.** `packages/rules` takes over the schemas and parser from the app and grows to the 11th edition
   model in [data-model.md](data-model.md): units with points, roles, wargear options, leader, support and transport;
   detachments with enhancements, upgrades and stratagems; faction resources; muster rules. A made-up demo faction and a
   demo core muster record replace the bundled content.
3. **List validation.** `validateList` and the constraint format from [validation.md](validation.md), with tests for
   every check.
4. **Dataset checks.** `checkDataset`, run by a test over the demo content and shown in the rulebook app.
5. **Sharing package and relay.** `packages/sharing` (keys, write rules, roles, blobs, heads, proposals, releases,
   hidden list) and `apps/relay`, tested against a local `ToolDbRelay`.
6. **Reader on tool-db.** The rulebook app reads factions from releases on the relays, with the bundled demo content
   as an offline source.
7. **Editor.** Sign-in, forms for every record kind with a Markdown editor for the text, live dataset checks,
   proposals, the review queue, contributor requests, maintainer management and releases.
8. **List builder.** `apps/builder`: pick a faction, battle size and detachments, add units, wargear, enhancements,
   upgrades and attachments, with live validation, saved lists and moving lists to newer releases.
9. **Hosting.** Both apps deployed to GitHub Pages; relay releases with a Linux installer that runs it under systemd
   (`hosting.md`).

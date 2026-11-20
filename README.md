# Rulebook

![CI](https://github.com/Manwe-777/rulebook/actions/workflows/ci.yml/badge.svg)

Community-written Warhammer 40,000 rules: a datasheet reader and editor, a list builder, and the relay that shares the rules.

| Folder             | Contents                                           |
| ------------------ | -------------------------------------------------- |
| `apps/rulebook`    | Reader and editor for faction rules                |
| `packages/rules`   | Rules format, parsing and demo content             |
| `packages/sharing` | Storage and permissions on tool-db                 |
| `apps/relay`       | Relay node that stores and checks the shared rules |
| `apps/builder`     | List builder                                       |
| `docs/`            | Design, content format and hosting                 |

## Run

```sh
npm install
npm run dev     # rulebook on http://localhost:5190
npm run dev -w @rulebook/builder   # list builder on http://localhost:5191
npm start -w @rulebook/relay   # relay on ws://localhost:8080, checking writes against project.json's owner
```

The apps read the owner key and relays from `project.json`; with none set they show the demo faction. `VITE_RELAYS`
(comma separated) and `VITE_RULEBOOK_OWNER` override them for a local run. To publish a content folder:

```sh
RULEBOOK_OWNER=<hex> RULEBOOK_SECRET=<maintainer secret, hex> RELAYS=ws://localhost:8080 \
  npm run publish -w @rulebook/relay -- packages/rules/content 2026-11
```

## Test

```sh
npm run check   # typecheck, lint, format check and tests
npm test        # tests only
```

## Build

```sh
npm run build   # static sites in apps/rulebook/dist/ and apps/builder/dist/
node apps/relay/scripts/package.mjs 1.0.0   # relay release in apps/relay/release/
```

Deploying the apps and installing a relay: `docs/hosting.md`.

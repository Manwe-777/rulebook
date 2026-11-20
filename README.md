# Rulebook

![CI](https://github.com/Manwe-777/rulebook/actions/workflows/ci.yml/badge.svg)
![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)

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

## Run a relay

Relays store and share the rules. Anyone can run one; it finds the others, copies their data and announces itself so the
apps find it. It needs Linux with systemd, Node.js 22 or newer, and a domain name with TLS (browsers only connect to
`wss://` from HTTPS pages; a dynamic DNS name works on a home connection).

```sh
curl -fsSL https://github.com/Manwe-777/rulebook/releases/latest/download/install.sh | sudo sh -s -- \
  --public-url wss://relay.example.org --name "Example relay"
```

Run it again to update or change settings. Put a TLS proxy such as Caddy in front of port 8080. Options, updates and
removal: `docs/hosting.md`.

## Contribute rules

Open the rulebook, pick a faction, choose **Edit or contribute** and ask to contribute. A key is made in your browser
the first time you write (protect it with a password on the Account page). Once a maintainer of that faction accepts
you, you can propose changes; maintainers review and release them.

Deploying the apps: `docs/hosting.md`. Rules format: `docs/data-model.md`.

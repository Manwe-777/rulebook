# Hosting

## Apps on GitHub Pages

The CI workflow deploys both apps to GitHub Pages on every push to `main` after the check job passes: the rulebook at
the site root, the list builder under `builder/`.

Setup, once per repository:

1. Settings → Pages → Source: **GitHub Actions**.
2. The owner key and relays come from `project.json` at the repository root:

```json
{ "owner": "npub1…", "relays": ["wss://relay.example.org"] }
```

`owner` is the public key printed by `npm run owner-key -w @rulebook/relay`; `relays` are the relays the apps read
from and write to. Both are public and committed, so forks read the same data by default.

3. Optionally, Settings → Secrets and variables → Actions → **Variables**:

| Variable          | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| `RULEBOOK_OWNER`  | Overrides `project.json`'s owner (npub or hex), for a separate project |
| `RULEBOOK_RELAYS` | Overrides `project.json`'s relays, comma separated (`wss://…`)         |
| `PAGES_BASE_PATH` | `/` for a custom domain; defaults to `/<repository name>/`             |

## Relay

A release carries `rulebook-relay.tar.gz` (the relay bundled into one script plus LevelDB with prebuilt binaries for
x64 and arm64), `install.sh` and `SHA256SUMS`. The installer needs Linux with systemd and Node.js 22 or newer
installed system-wide.

```sh
curl -fsSL https://github.com/Manwe-777/rulebook/releases/latest/download/install.sh | sudo sh
```

No options are needed. The release build writes the owner from `project.json` (or the `RULEBOOK_OWNER` variable) into
`install.sh`, so the relay
checks every write against the project's roles (who may edit, propose and release). Without an owner key the relay is an
open store: it keeps any correctly signed data on the topic, and the apps, which check every value against the owner key
built into them, ignore what doesn't follow the rules. An open relay can't mislead readers, but it stores whatever is
sent to it.

| Option        | Meaning                                                      |
| ------------- | ------------------------------------------------------------ |
| `--owner KEY` | Owner public key (npub or hex). Needed on the first install. |
| `--port N`    | Port to listen on. Default 8080.                             |
| `--host ADDR` | Address to listen on. Default 0.0.0.0.                       |
| `--uninstall` | Stop and remove the service. Data and settings stay.         |
| `--purge`     | With `--uninstall`, also delete the data and settings.       |

What it sets up:

- the relay in `/opt/rulebook-relay`, run by the `rulebook-relay` systemd service as a dynamic user with no
  capabilities (only `CAP_NET_BIND_SERVICE` when the port is below 1024) and a read-only system;
- settings in `/etc/rulebook-relay/relay.env` (root only), including the relay's own key, a random key made on the
  first install that only identifies the relay on the network;
- data in `/var/lib/rulebook-relay`.

Running the installer again updates the relay. Settings (including open mode), data and the relay key are kept; only
the options given change. The download is checked against `SHA256SUMS` and the settings against the new build before the running relay is
replaced.

The apps are served over https, so browsers only connect to `wss://` relays. Put a TLS proxy in front of the relay,
for example Caddy:

```
relay.example.org {
  reverse_proxy 127.0.0.1:8080
}
```

with the relay installed with `--host 127.0.0.1`. Then add `wss://relay.example.org` to `relays` in `project.json`.

## Releases

semantic-release runs on pushes to `main` after the check job. `feat` and `fix` commits cut a version; the release
gets the relay files built by `apps/relay/scripts/package.mjs`.

`apps/relay/tests/installer.sh` runs the installer in a Docker container with systemd: install, publish the demo
faction, update, a tampered download, uninstall and purge. CI runs it on every push, and releases wait for it. Locally
it needs Docker:

```sh
apps/relay/tests/installer.sh
```

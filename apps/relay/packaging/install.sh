#!/bin/sh
# Rulebook relay installer for Linux with systemd. Downloads the release,
# checks it against SHA256SUMS, installs it in /opt/rulebook-relay and runs it
# as the rulebook-relay service:
#
#   curl -fsSL https://github.com/OWNER/REPO/releases/latest/download/install.sh | sudo sh
#
# No options are needed. The relay checks writes against the project owner's
# key built into this script when the release was made; without one it is an
# open store (it keeps any signed data and the apps do the checking).
#
# Options:
#   --owner KEY   check writes against another owner public key (npub or hex)
#   --open        don't check writes: keep any signed data on the topic
#   --port N      port to listen on (default 8080)
#   --host ADDR   address to listen on (default 0.0.0.0)
#   --uninstall   stop and remove the service; keeps the data and settings
#   --purge       with --uninstall, also delete the data and settings
#
# Run it again to update: settings, data and the relay's own key are kept, and
# only the options given change. Needs Node.js 22 or newer.
#
# RULEBOOK_RELAY_DOWNLOAD overrides where the files come from (a release URL
# or a local directory, for testing).
set -eu

# The project owner, filled in when the release is built (empty when it wasn't set).
PROJECT_OWNER='@PROJECT_OWNER@'
case $PROJECT_OWNER in @*) PROJECT_OWNER= ;; esac

BASE=${RULEBOOK_RELAY_DOWNLOAD:-https://github.com/OWNER/REPO/releases/latest/download}
APP=/opt/rulebook-relay
CONF_DIR=/etc/rulebook-relay
CONF=$CONF_DIR/relay.env
UNIT=/etc/systemd/system/rulebook-relay.service

fail() { echo "rulebook-relay install: $*" >&2; exit 1; }

OWNER= OPEN= PORT= HOST= UNINSTALL= PURGE=
while [ $# -gt 0 ]; do
  case $1 in
    --owner) OWNER=${2:?--owner needs a key}; shift 2 ;;
    --open) OPEN=1; shift ;;
    --port) PORT=${2:?--port needs a number}; shift 2 ;;
    --host) HOST=${2:?--host needs an address}; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    --purge) PURGE=1; shift ;;
    *) fail "unknown option $1 (the options are listed at the top of install.sh)" ;;
  esac
done

[ "$(uname -s)" = Linux ] || fail "Linux only"
[ "$(id -u)" = 0 ] || fail "run as root (pipe into 'sudo sh -s -- ...')"
command -v systemctl >/dev/null 2>&1 || fail "needs systemd"

if [ -n "$UNINSTALL" ]; then
  systemctl disable --now rulebook-relay 2>/dev/null || true
  rm -rf "$APP" "$UNIT"
  systemctl daemon-reload
  if [ -n "$PURGE" ]; then
    rm -rf "$CONF_DIR" /var/lib/rulebook-relay /var/lib/private/rulebook-relay
    echo "rulebook-relay removed, with its data and settings"
  else
    echo "rulebook-relay removed; data in /var/lib/rulebook-relay and settings in $CONF_DIR are kept"
  fi
  exit 0
fi

NODE=$(command -v node || true)
[ -n "$NODE" ] || fail "needs Node.js 22 or newer (https://nodejs.org/en/download)"
NODE_MAJOR=$("$NODE" -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 22 ] || fail "needs Node.js 22 or newer, found $("$NODE" --version)"
NODE=$(readlink -f "$NODE")
case $NODE in
  /home/* | /root/*) fail "node is in a home folder ($NODE), which the service can't read: install Node.js system-wide" ;;
esac

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL --retry 3 -o "$2" "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -q -O "$2" "$1"; }
else
  fail "needs curl or wget"
fi
case $BASE in
  /*) fetch() { cp "$1" "$2"; } ;;
esac
command -v sha256sum >/dev/null 2>&1 || fail "needs sha256sum"

# Settings: kept from an earlier install, changed only by the options given.
setting() { [ -f "$CONF" ] && sed -n "s/^$1=//p" "$CONF" | tail -1; true; }
# Owner: --owner or --open, else the earlier install's (which may be open), else the project's.
if [ -n "$OPEN" ]; then
  OWNER=
elif [ -z "$OWNER" ]; then
  if [ -f "$CONF" ]; then OWNER=$(setting RULEBOOK_OWNER); else OWNER=$PROJECT_OWNER; fi
fi
PORT=${PORT:-$(setting PORT)}
HOST=${HOST:-$(setting HOST)}
SECRET=$(setting RELAY_SECRET_KEY)
case $PORT in '' ) PORT=8080 ;; *[!0-9]*) fail "--port must be a number" ;; esac
HOST=${HOST:-0.0.0.0}
# Ports below 1024 need the one capability that allows binding them.
if [ "$PORT" -lt 1024 ]; then
  CAPS="CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE"
else
  CAPS="CapabilityBoundingSet="
fi
# The relay's own key, made once so it keeps its identity across updates.
[ -n "$SECRET" ] || SECRET=$("$NODE" -p 'require("node:crypto").randomBytes(32).toString("hex")')

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT INT TERM

echo "downloading rulebook-relay from $BASE"
fetch "$BASE/SHA256SUMS" "$TMP/SHA256SUMS" || fail "can't download $BASE/SHA256SUMS"
fetch "$BASE/rulebook-relay.tar.gz" "$TMP/rulebook-relay.tar.gz" || fail "can't download $BASE/rulebook-relay.tar.gz"
WANT=$(awk '$2 == "rulebook-relay.tar.gz" || $2 == "*rulebook-relay.tar.gz" { print $1 }' "$TMP/SHA256SUMS")
[ -n "$WANT" ] || fail "rulebook-relay.tar.gz isn't listed in SHA256SUMS"
[ "$(sha256sum "$TMP/rulebook-relay.tar.gz" | cut -d' ' -f1)" = "$WANT" ] ||
  fail "rulebook-relay.tar.gz doesn't match its checksum: not installing"
tar -xzf "$TMP/rulebook-relay.tar.gz" -C "$TMP"

# Check the settings with the new build before touching the running one.
RULEBOOK_OWNER=$OWNER PORT=$PORT "$NODE" "$TMP/rulebook-relay/relay.mjs" --check-config ||
  fail "settings rejected, nothing changed"

rm -rf "$APP.new"
mv "$TMP/rulebook-relay" "$APP.new"
chmod -R a+rX "$APP.new"
rm -rf "$APP"
mv "$APP.new" "$APP"

mkdir -p "$CONF_DIR"
umask 077
cat > "$CONF" <<CONF
# Rulebook relay settings. Change them by running install.sh again with
# --owner, --port or --host, or edit this file and restart the service.
RULEBOOK_OWNER=$OWNER
PORT=$PORT
HOST=$HOST
RELAY_SECRET_KEY=$SECRET
CONF
umask 022

cat > "$UNIT" <<UNIT
[Unit]
Description=Rulebook relay (tool-db / Nostr)
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=$CONF
Environment=DATA_DIR=/var/lib/rulebook-relay
ExecStart=$NODE $APP/relay.mjs
Restart=on-failure
RestartSec=5
DynamicUser=yes
StateDirectory=rulebook-relay
StateDirectoryMode=0700
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
RestrictSUIDSGID=yes
LockPersonality=yes
$CAPS

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable rulebook-relay >/dev/null 2>&1
systemctl restart rulebook-relay

echo "rulebook-relay $(cat "$APP/VERSION") is running on $HOST:$PORT"
if [ -n "$OWNER" ]; then
  echo "  checks writes against owner $OWNER"
else
  echo "  open store: keeps any signed data (apps do the checking); --owner KEY turns checks on"
fi
echo "  logs:     journalctl -u rulebook-relay -f"
echo "  settings: $CONF"
echo "Browsers on https pages need wss://: put a TLS proxy in front (see docs/hosting.md)."

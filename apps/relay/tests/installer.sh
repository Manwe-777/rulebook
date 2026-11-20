#!/usr/bin/env bash
# The relay installer under systemd in a Docker container: install from a
# local "release", publish the demo faction to it, re-running keeps the relay
# key and the data, a tampered download is refused, uninstall keeps the data
# and --purge removes it.
#
#   tests/installer.sh
#
# Publishes with a throwaway owner key made for the run (or RULEBOOK_SECRET,
# hex). Needs Docker, unprivileged (see the docker run below).
set -euo pipefail
cd "$(dirname "$0")/.."
RULEBOOK_SECRET=${RULEBOOK_SECRET:-$(node -e 'import("tool-db").then(t => console.log(t.generateSecretKey()))')}
OWNER_HEX=$(node -e 'import("tool-db").then(t => console.log(t.getPublicKey(process.argv[1])))' "$RULEBOOK_SECRET")
OWNER=$(node -e 'import("tool-db").then(t => console.log(t.npubEncode(process.argv[1])))' "$OWNER_HEX")
WORK=$(mktemp -d)
trap 'docker rm -f $(docker ps -aq --filter label=rulebook-relay-test) >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

# A release with this owner built in, as CI makes it.
RULEBOOK_OWNER=$OWNER node scripts/package.mjs 0.0.0-test >/dev/null
cp -r release "$WORK/dl"
cp -r release "$WORK/bad"
echo tampered >> "$WORK/bad/rulebook-relay.tar.gz"

docker build -q -t rulebook-relay-test tests/installer >/dev/null
# Not --privileged: SYS_ADMIN only to remount the container's own cgroup tree.
c=$(docker run -d --cgroupns=private --cap-add SYS_ADMIN --tmpfs /run --tmpfs /run/lock \
      --label rulebook-relay-test -v "$WORK/dl":/dl:ro -v "$WORK/bad":/bad:ro rulebook-relay-test)
docker exec "$c" sh -c 'until systemctl is-system-running 2>/dev/null | grep -qE "running|degraded"; do sleep 1; done'
IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$c")

fail() { echo "FAIL: $*"; docker exec "$c" journalctl -u rulebook-relay --no-pager -n 30 || true; exit 1; }
node_key() { docker exec "$c" journalctl -u rulebook-relay --no-pager -o cat | sed -n 's/.*node key //p' | tail -1; }
wait_up() {
  for _ in $(seq 30); do
    docker exec "$c" systemctl is-active -q rulebook-relay && [ -n "$(node_key)" ] && return 0
    sleep 1
  done
  fail "relay not running"
}

journal() { docker exec "$c" journalctl -u rulebook-relay --no-pager -o cat; }
# Runs install.sh and waits for the relay it (re)started to say how it checks writes.
starts() { journal | grep -cE "Checking writes|open store" || true; }
install() {
  local before
  before=$(starts)
  docker exec -e RULEBOOK_RELAY_DOWNLOAD=/dl "$c" sh /dl/install.sh "$@" >/dev/null || fail "install.sh $*"
  for _ in $(seq 30); do [ "$(starts)" -gt "$before" ] && return 0; sleep 1; done
  fail "relay didn't start after install.sh $*"
}
# The newest start's owner line (later lines report the relay network).
owner_line() { journal | grep -E "Checking writes|open store" | tail -1; }
checks_owner() { owner_line | grep -q "Checking writes against owner $OWNER_HEX"; }
open_store() { owner_line | grep -q "open store"; }

echo "== install with no options uses the built-in owner"
install
checks_owner || fail "built-in owner not used"
wait_up
KEY=$(node_key)
[ "$(docker exec "$c" stat -c %a /etc/rulebook-relay/relay.env)" = 600 ] || fail "settings readable by others"

echo "== publish the demo faction"
RULEBOOK_SECRET=$RULEBOOK_SECRET RULEBOOK_OWNER=$OWNER_HEX RELAYS="ws://$IP:8080" \
  timeout 60 npx tsx src/publish.ts ../../packages/rules/content 2026-test || fail "publish"

echo "== update keeps the key and the data"
install --port 8081
checks_owner || fail "owner lost on update"
[ "$(node_key)" = "$KEY" ] || fail "relay key changed"
docker exec "$c" grep -q "^PORT=8081" /etc/rulebook-relay/relay.env || fail "port not changed"
[ -n "$(docker exec "$c" ls /var/lib/private/rulebook-relay)" ] || fail "no data stored"

echo "== --open, kept on update, and --owner turns checks back on"
install --open
open_store || fail "--open still checks"
install
open_store || fail "update dropped --open"
install --owner "$OWNER"
checks_owner || fail "--owner not used"

echo "== a tampered download is refused"
out=$(docker exec -e RULEBOOK_RELAY_DOWNLOAD=/bad "$c" sh /bad/install.sh 2>&1 || true)
grep -q "doesn't match its checksum" <<<"$out" || fail "tampered tarball accepted: $out"
docker exec "$c" systemctl is-active -q rulebook-relay || fail "refused update stopped the relay"

echo "== uninstall keeps data, purge removes it"
docker exec "$c" sh /dl/install.sh --uninstall >/dev/null
docker exec "$c" systemctl is-active -q rulebook-relay && fail "still running"
docker exec "$c" test -f /etc/rulebook-relay/relay.env || fail "settings removed"
docker exec "$c" sh /dl/install.sh --uninstall --purge >/dev/null
docker exec "$c" test -e /etc/rulebook-relay && fail "settings kept after --purge"

echo "PASS"

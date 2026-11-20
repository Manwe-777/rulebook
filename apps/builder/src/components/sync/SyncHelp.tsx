/** What sync does and how, for people who have never heard of Nostr. */
export default function SyncHelp() {
  return (
    <details className="text-sm text-text/80">
      <summary className="cursor-pointer font-semibold">How does this work?</summary>
      <div className="mt-2 flex flex-col gap-2">
        <p>
          Each device that syncs holds the same secret key. Your lists are encrypted with it on the device, then stored
          on a few public servers (relays). Any device with the key can read and update them; nobody else can, not even
          the relays.
        </p>
        <p>
          The key is made on the first device you turn sync on, and reaches another device only through the link and
          code you show it. If you also edit rules in the Rulebook, it is the same key as your Rulebook account (see its
          Account page to back it up).
        </p>
        <p>
          The relays use Nostr, an open network anyone can run; you don't need an account anywhere or to know anything
          about it.
        </p>
      </div>
    </details>
  );
}

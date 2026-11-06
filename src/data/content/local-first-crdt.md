![Local-first sync](/images/blog/local-first-sync.svg)

*Write to disk first. Sync later. Merge deterministically. The spinner disappears because the source of truth is local.*

## The loading spinner is a design choice

Every time you open a notes app and wait for a spinner, you are watching a architectural decision: the server owns the data, and the client is a thin view. If the network is slow, the app is slow. If the network is down, the app is broken.

Local-first software flips the default. The data lives on the device. Reads and writes are instant. The network is a synchronization mechanism, not a prerequisite for use.

The term comes from Ink & Switch's 2019 essay, which laid out seven ideals:

1. Your data lives on your device.
2. You can work offline.
3. You can collaborate with others.
4. The app works without a central server.
5. Data outlives the app.
6. Privacy is the default.
7. You retain control.

The hard part is not storing data locally. It is reconciling concurrent edits across devices without a central lock, without losing work, and without asking the user to resolve conflicts manually.

## The architecture

A local-first app has four parts:

- **Local database**: SQLite, IndexedDB, or an embedded store. Fast, durable, offline.
- **Operation log**: an append-only record of changes, often the source for sync.
- **Sync engine**: exchanges operations with other devices or a relay, handles retries and ordering.
- **CRDT**: a data type whose merge function is deterministic, commutative, and idempotent.

The server still matters. It provides discovery, authentication, durable storage for offline devices, and a place to enforce access control. But it is not the only place where data can be read or written.

## CRDTs in one page

A Conflict-free Replicated Data Type is a data structure designed to merge concurrent updates without coordination. The three properties that matter:

- **Commutative**: the order of merges does not matter.
- **Associative**: grouping does not matter.
- **Idempotent**: applying the same update twice has no additional effect.

Common CRDTs:

- **Grow-only counter**: each replica increments its own slot; the value is the sum.
- **Observed-remove set**: add and remove with tombstones and version vectors.
- **Last-writer-wins register**: a timestamp and replica ID break ties. Simple, but it loses concurrent values.
- **Sequence CRDT**: text and lists, preserving concurrent inserts. Yjs and Automerge are the mature implementations.

A simple LWW register in TypeScript:

```ts
type Stamp = { time: number; replica: string };
type LWW<T> = { value: T; stamp: Stamp };

function merge<T>(a: LWW<T>, b: LWW<T>): LWW<T> {
  if (a.stamp.time !== b.stamp.time) {
    return a.stamp.time > b.stamp.time ? a : b;
  }
  return a.stamp.replica > b.stamp.replica ? a : b;
}
```

LWW is easy, but it silently discards one of two concurrent writes. For a settings value, that is fine. For a paragraph of text, it is data loss. Use a sequence CRDT for anything a user would notice losing.

## A text editor with Yjs

Yjs is the most widely deployed sequence CRDT. It integrates with ProseMirror, CodeMirror, Monaco, and plain text areas, and it has providers for WebSocket, WebRTC, and IndexedDB.

```ts
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const doc = new Y.Doc();
const text = doc.getText("content");

// Local edit: instant, offline-safe.
text.insert(0, "Hello, local-first world.");

const provider = new WebsocketProvider(
  "wss://sync.example.com",
  "document-42",
  doc
);

provider.on("status", (event: { status: string }) => {
  console.log("sync:", event.status);
});
```

Two users can type at the same time, disconnect, reconnect, and converge without a server arbitrating every keystroke. The server relays updates and stores a snapshot; the merge logic lives in the CRDT.

## Permissions are harder than merging

CRDTs solve convergence. They do not solve authorization.

If a user loses access to a document, their device may still hold a replica. You need:

- encryption keys per document, rotated on revocation
- a server that refuses to relay updates from unauthorized users
- a client that deletes local copies on revocation
- an audit trail of who changed what

The local-first model makes revocation genuinely hard because the data is already on the device. Design for it from the beginning; bolting it on later is painful.

A practical pattern is **end-to-end encrypted documents with per-document keys**. The server stores ciphertext and enforces access to the key material. Revocation rotates the key and re-encrypts future updates. It is not perfect (the revoked device may retain old plaintext), but it bounds the damage.

## Schema migration and long-lived data

A local-first app can have users on year-old clients. If the schema changes, old clients must still read their local data and sync without corrupting new clients.

Strategies:

- **Version every document** and migrate on read.
- **Never delete fields**; deprecate and ignore.
- **Make migrations idempotent** and test them on real snapshots.
- **Keep the sync protocol backward-compatible** for at least one major version.
- **Ship a migration path** for offline devices that have not synced in months.

This is the same discipline as a distributed database, applied to clients you do not control.

## Undo, redo, and user trust

Undo in a collaborative editor is not a stack of local commands. Another user may have changed the same text. A good undo system uses:

- **selective undo**: undo only the local user's changes
- **intent-preserving transforms**: map the undo operation onto the current document
- **a visible history**: let users see what changed and by whom

If undo can silently revert someone else's work, users will not trust the app.

## When local-first is the wrong choice

Local-first is not a universal architecture. Avoid it when:

- you need strong global consistency (bank balances, inventory counts)
- a central authority must order events (auctions, trading)
- the data is too large to replicate (video libraries, huge datasets)
- regulatory requirements demand server-side custody
- the team cannot invest in CRDTs, migrations, and conflict UX

For a payment ledger, a server-authoritative database is correct. For a notes app, a design tool, or a field-service app that works in a basement, local-first is transformative.

## The takeaway

Local-first is not "offline mode." It is a reordering of trust: the device is the primary source of truth, and the network is an optimization.

The technical core is a CRDT and a sync engine. The product core is instant feedback, offline resilience, and user control. The hard parts are permissions, migrations, and undo — the same hard parts as any distributed system, moved to the edge.

Done well, the spinner disappears. Not because the network got faster, but because the app no longer waits for it.

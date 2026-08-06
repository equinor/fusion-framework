---
"@equinor/fusion-framework-module-state": major
---

Add a `pull` option to `PouchDbSyncStorage` for controlling how remote changes are pulled during sync, switch the default storage created by `createDefaultStorage()` to use it, and expose `createDefaultStorage` itself so callers can reuse it with custom overrides.

Previously, `PouchDbSyncStorage` always used a single bidirectional `db.sync()` connection, meaning every client kept a live `_changes` longpoll open for both push and pull. At production user counts this is a large number of concurrently open connections for a direction (pull) that's rarely needed in real time.

The new `pull` option lets push stay live (so local writes are never delayed) while pull is scheduled instead of continuous:

```typescript
new PouchDbSyncStorage({
  localDb,
  remoteDb,
  syncOptions,
  // Push stays live; pull runs once now, then every 60s, and again whenever the tab regains focus.
  pull: { mode: 'interval', intervalMs: 60000, refreshOnFocus: true },
});
```

- `mode: 'live'` (default, unchanged): behaves exactly as before, via `db.sync()`.
- `mode: 'interval'`: keeps push live via `db.replicate.to`, and replaces the live pull with one-shot `db.replicate.from` calls run on `intervalMs` (default `60000`) and, unless `refreshOnFocus: false`, whenever the document becomes visible again - regardless of whether the tab is currently visible.
- `mode: 'visible-interval'`: the same as `'interval'`, except the timer tick is skipped entirely while the tab is hidden (via the Page Visibility API) - a backgrounded tab has no user waiting on fresh data, so there's no reason to hold a connection open or make a request for it.

`createDefaultStorage()` now uses `pull: { mode: 'visible-interval', refreshOnFocus: true }` by default (a 60s `intervalMs`), so apps using the framework's default state storage no longer keep a continuous pull connection open per idle tab, and pause polling entirely while a tab is backgrounded.

`createDefaultStorage` is now also exported from `@equinor/fusion-framework-module-state/default-storage`, so a caller who wants the framework's default remote-resolution behavior (service discovery, auth, the per-user CouchDB proxy) but with different `pull` scheduling can call it directly instead of reimplementing that resolution:

```typescript
import { createDefaultStorage } from '@equinor/fusion-framework-module-state/default-storage';

config.setStorage((args) => createDefaultStorage(appKey, args, { intervalMs: 10000 }));
```

**Breaking change:** the scheduled pull dispatches a new `onStateSync.poll` event, added to the
exported `StateSyncEventType`/`StateSyncEvent` union. Consumers with an exhaustive `switch`/`if`
chain over `StateSyncEventType` (e.g. a `default: assertNever(event)` branch) need a new case for
`StateSyncEvent.Poll`/`event.type === 'onStateSync.poll'`, or that check will fail to compile
after upgrading:

```typescript
// Before: exhaustive over 4 members
switch (event.type) {
  case 'onStateSync.change': /* ... */ break;
  case 'onStateSync.complete': /* ... */ break;
  case 'onStateSync.error': /* ... */ break;
  case 'onStateSync.status': /* ... */ break;
  default: assertNever(event);
}

// After: add the new member
switch (event.type) {
  case 'onStateSync.change': /* ... */ break;
  case 'onStateSync.complete': /* ... */ break;
  case 'onStateSync.error': /* ... */ break;
  case 'onStateSync.status': /* ... */ break;
  case 'onStateSync.poll': /* ... */ break;
  default: assertNever(event);
}
```

Consumers that switch over a narrower type, or that only inspect specific event kinds (e.g. via
`StateSyncEvent.Change.is(event)`), are unaffected.


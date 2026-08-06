---
"@equinor/fusion-framework-module-state": minor
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


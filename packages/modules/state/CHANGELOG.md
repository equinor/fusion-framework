# @equinor/fusion-framework-module-state

## 2.0.2

### Patch Changes

- d333151: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.
  
  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:
  
  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```
- 18ee1cb: Remove monorepo-level license and contribution boilerplate from the state module README.
- 2899c8a: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 2.0.2-next.0

### Patch Changes

- c8008e3: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 2.0.1

### Patch Changes

- a5c3c40: Internal: bump `immer` from `9.0.21` to `11.1.17`. The dependency is unused in this package's source, so there is no consumer-facing behavior change.

## 2.0.0

### Major Changes

- 46f53ca: Add a `pull` option to `PouchDbSyncStorage` for controlling how remote changes are pulled during sync, switch the default storage created by `createDefaultStorage()` to use it, and expose `createDefaultStorage` itself so callers can reuse it with custom overrides.

  Previously, `PouchDbSyncStorage` always used a single bidirectional `db.sync()` connection, meaning every client kept a live `_changes` longpoll open for both push and pull. At production user counts this is a large number of concurrently open connections for a direction (pull) that's rarely needed in real time.

  The new `pull` option lets push stay live (so local writes are never delayed) while pull is scheduled instead of continuous:

  ```typescript
  new PouchDbSyncStorage({
    localDb,
    remoteDb,
    syncOptions,
    // Push stays live; pull runs once now, then every 60s, and again whenever the tab regains focus.
    pull: { mode: "interval", intervalMs: 60000, refreshOnFocus: true },
  });
  ```

  - `mode: 'live'` (default, unchanged): behaves exactly as before, via `db.sync()`.
  - `mode: 'interval'`: keeps push live via `db.replicate.to`, and replaces the live pull with one-shot `db.replicate.from` calls run on `intervalMs` (default `60000`) and, unless `refreshOnFocus: false`, whenever the document becomes visible again - regardless of whether the tab is currently visible.
  - `mode: 'visible-interval'`: the same as `'interval'`, except the timer tick is skipped entirely while the tab is hidden (via the Page Visibility API) - a backgrounded tab has no user waiting on fresh data, so there's no reason to hold a connection open or make a request for it.

  `createDefaultStorage()` now uses `pull: { mode: 'visible-interval', refreshOnFocus: true }` by default (a 60s `intervalMs`), so apps using the framework's default state storage no longer keep a continuous pull connection open per idle tab, and pause polling entirely while a tab is backgrounded.

  `createDefaultStorage` is now also exported from `@equinor/fusion-framework-module-state/default-storage`, so a caller who wants the framework's default remote-resolution behavior (service discovery, auth, the per-user CouchDB proxy) but with different `pull` scheduling can call it directly instead of reimplementing that resolution:

  ```typescript
  import { createDefaultStorage } from "@equinor/fusion-framework-module-state/default-storage";

  config.setStorage((args) =>
    createDefaultStorage(appKey, args, { intervalMs: 10000 }),
  );
  ```

  **Breaking change:** the scheduled pull dispatches a new `onStateSync.poll` event, added to the
  exported `StateSyncEventType`/`StateSyncEvent` union. Consumers with an exhaustive `switch`/`if`
  chain over `StateSyncEventType` (e.g. a `default: assertNever(event)` branch) need a new case for
  `StateSyncEvent.Poll`/`event.type === 'onStateSync.poll'`, or that check will fail to compile
  after upgrading:

  ```typescript
  // Before: exhaustive over 4 members
  switch (event.type) {
    case "onStateSync.change":
      /* ... */ break;
    case "onStateSync.complete":
      /* ... */ break;
    case "onStateSync.error":
      /* ... */ break;
    case "onStateSync.status":
      /* ... */ break;
    default:
      assertNever(event);
  }

  // After: add the new member
  switch (event.type) {
    case "onStateSync.change":
      /* ... */ break;
    case "onStateSync.complete":
      /* ... */ break;
    case "onStateSync.error":
      /* ... */ break;
    case "onStateSync.status":
      /* ... */ break;
    case "onStateSync.poll":
      /* ... */ break;
    default:
      assertNever(event);
  }
  ```

  Consumers that switch over a narrower type, or that only inspect specific event kinds (e.g. via
  `StateSyncEvent.Change.is(event)`), are unaffected.

### Patch Changes

- 55c95fa: Internal: bump `@types/uuid` from `^10.0.0` to `^11.0.0`. Type-only dependency, not re-exported from this package's public API — no consumer-facing impact.

## 1.0.0

### Major Changes

- b92698d: **🚀 Introducing the Fusion Framework State Module**

  **@equinor/fusion-framework-module-state** is a new reactive state management module with built-in synchronization capabilities and comprehensive event system for enterprise-grade applications.

  **🗄️ Synchronization Features**
  - **PouchDbSyncStorage**: Bidirectional synchronization with remote databases
  - **Real-time sync events**: Monitor sync progress, errors, and status changes
  - **Conflict resolution**: Automatic handling of concurrent data modifications
  - **Live sync options**: Configurable heartbeat, retry, and timeout settings

  **📡 Event System**
  Comprehensive event architecture for type-safe state management:

  **Event Classes:**
  - `StateEntryCreatedEvent` - Item creation tracking
  - `StateEntryUpdatedEvent` - Item modification events
  - `StateEntryDeletedEvent` - Item removal notifications
  - `StateSyncChangeEvent` - Sync data changes
  - `StateSyncCompleteEvent` - Sync operation completion
  - `StateSyncErrorEvent` - Sync failure handling
  - `StateSyncStatusEvent` - Sync status monitoring
  - `StateOperationSuccessEvent` - Successful operations
  - `StateOperationFailureEvent` - Operation failure tracking

  **Event Organization:**
  - `StateChangeEvent` - CRUD operation events
  - `StateSyncEvent` - Synchronization events
  - `StateOperationEvent` - Operation result events

  **🏗️ Core Architecture**
  - **StateProvider**: Reactive state management with observable patterns
  - **Storage Interface**: Extensible storage backends with sync capabilities
  - **Type Safety**: Comprehensive TypeScript definitions
  - **Memory Management**: Proper cleanup and disposal patterns
  - Storage and sync events are dispatched through the app's `event` module, so `onStateSync.*`
    listeners registered via `useAppModule('event').addEventListener(...)` actually fire.

### Patch Changes

- 0d6ef3a: Internal: bump `happy-dom` from `18.0.1` to `20.8.9` (dev dependency, test environment only). Resolves Dependabot security alerts for Happy DOM VM context escape / RCE, ECMAScriptModuleCompiler code injection, and fetch cross-origin cookie disclosure.
- 020d9e5: Internal: bump `uuid` from `^11.1.1` to `^14.0.1`, matching the version already used across the rest of the monorepo. Not directly imported by this package's source, so no breaking impact.
- 0d9d876: Internal: bump `uuid` from `^11.0.3` to `^11.1.1`. Resolves Dependabot security alert for a missing buffer bounds check in `uuid` v3/v5/v6 when a buffer is provided (`< 11.1.1`).
- 05586e7: Internal: bump `vitest` from `^2.0.5` to `^4.1.0` (dev dependency, test runner only), matching the version already used across the rest of the monorepo. Resolves Dependabot security alerts for the Vitest UI server arbitrary file read/execute vulnerability (`< 3.2.6`).

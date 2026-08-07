# Storage

PouchDB adapters, replication, sync event monitoring, and custom `IStorage`
implementations for `@equinor/fusion-framework-module-state`.

The module provides a PouchDB-based storage implementation out of the box:

```typescript
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';

// Create PouchDB storage
const storage = new PouchDbStorage('my-app-state');

// Alternative
const storage = new PouchDbStorage(
  PouchDbStorage.CreateDb('my-app-state', {/** Storage options */})
);

const stateProvider = new StateProvider({ storage });
```

## Configuring PouchDB Adapters

PouchDB is the preferred storage implementation and supports various adapters for different environments. For comprehensive information about all available adapters, see the [official PouchDB adapters documentation](https://pouchdb.com/adapters.html#pouchdb_in_the_browser).

```typescript
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';

// HTTP adapter (for remote CouchDB/Cloudant)
const remoteStorage = new PouchDbStorage('http://localhost:5984/my-app-state');
// No adapter needed for HTTP - PouchDB detects from URL

// Memory adapter (for testing or temporary storage)
// Note: Requires installing pouchdb-adapter-memory
// npm install pouchdb-adapter-memory
const memoryStorage = new PouchDbStorage(
  PouchDbStorage.CreateDb('my-app-state', { adapter: 'memory' })
);

// For legacy browser support (requires pouchdb-adapter-localstorage)
// npm install pouchdb-adapter-localstorage
const legacyStorage = new PouchDbStorage(
  PouchDbStorage.CreateDb('my-app-state', { adapter: 'localstorage' })
);
```

**Available Adapters:**
- **`idb` (default in browser)**: IndexedDB - recommended for modern browsers
- **`leveldb` (default in Node.js)**: LevelDB - recommended for Node.js applications  
- **`memory`**: In-memory storage - requires `pouchdb-adapter-memory` package
- **`localstorage`**: LocalStorage fallback - requires `pouchdb-adapter-localstorage` package
- **`http`/`https`**: Remote CouchDB/Cloudant - no additional package required

## Replication with PouchDbStorage

PouchDB provides built-in replication capabilities, enabling you to synchronize state data between local and remote databases. This is essential for building offline-first applications that can work without network connectivity and sync when online.

```typescript
import { enableStateModule } from '@equinor/fusion-framework-module-state';
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';

enableStateModule(configurator, async (builder) => {
  // Create local PouchDB storage
  const localDb = PouchDbStorage.CreateDb('my-app-state');
  const remoteDb = PouchDbStorage.CreateDb('http://localhost:5984/my-app-state');

  // Set up two-way sync with remote CouchDB
  localDb.sync(remoteDb, {
    live: true,
    retry: true
  });

  builder.setStorage(new PouchDbStorage(localDb));
});
```

**Replication Options:**
- **`live: true`**: Enables continuous replication that monitors for changes
- **`retry: true`**: Automatically retries replication on connection failures
- **`filter`**: Apply custom filters to replicate only specific documents
- **`since`**: Start replication from a specific sequence number

## Configurable Pull Scheduling with PouchDbSyncStorage

`PouchDbSyncStorage` wraps a local/remote database pair and starts replication for you. By
default it behaves like the `db.sync()` example above: a single continuous, bidirectional
connection. A production app with many idle tabs open at once, though, rarely needs pulled
changes in real time - the `pull` option lets push stay live (so local writes are never
delayed) while pull is scheduled instead of continuous:

```typescript
import { PouchDbSyncStorage } from '@equinor/fusion-framework-module-state/storage';

const storage = new PouchDbSyncStorage({
  localDb: { name_or_instance: 'my-app-state' },
  remoteDb: { name_or_instance: 'http://localhost:5984/my-app-state' },
  syncOptions: { retry: true },
  // Push stays live; pull runs once now, then every 60s, and again whenever the tab regains focus.
  pull: { mode: 'interval', intervalMs: 60000, refreshOnFocus: true },
});
```

`pull.mode` options:
- **`'live'`** (default): unchanged - a single continuous bidirectional `db.sync()` connection.
- **`'interval'`**: keeps push live via `db.replicate.to`, and replaces the live pull with
  one-shot `db.replicate.from` calls run on `pull.intervalMs` (default `60000`) and, unless
  `pull.refreshOnFocus: false`, whenever the document becomes visible again - regardless of
  whether the tab is currently visible.
- **`'visible-interval'`**: the same as `'interval'`, except the timer tick is skipped entirely
  while the tab is hidden (via the Page Visibility API) - a backgrounded tab has no user
  waiting on fresh data, so there's no reason to hold a connection open or make a request for it.

A scheduled pull dispatches an `onStateSync.poll` event (with `{ trigger, skipped }`) each time
it runs or is skipped because a previous pull is still in flight - see
[Monitoring Sync Progress](#monitoring-sync-progress) below.

### Default Storage

`@equinor/fusion-framework-module-state/default-storage` exports `createDefaultStorage`, the
factory the framework itself uses to resolve service discovery, auth, and the per-user CouchDB
proxy into a `PouchDbSyncStorage`. It defaults to `pull: { mode: 'visible-interval',
refreshOnFocus: true }` (a 60s `intervalMs`). Call it directly to reuse that resolution with a
different `pull` schedule instead of reimplementing it:

```typescript
import { createDefaultStorage } from '@equinor/fusion-framework-module-state/default-storage';

config.setStorage((args) => createDefaultStorage(appKey, args, { intervalMs: 10000 }));
```

## Monitoring Sync Progress

The state module provides comprehensive sync event monitoring through RxJS observables:

```typescript
import { enableStateModule } from '@equinor/fusion-framework-module-state';
import { StateSyncEvent } from '@equinor/fusion-framework-module-state/events';

enableStateModule(configurator, async (builder) => {
  const localDb = PouchDbStorage.CreateDb('my-app-state');
  const remoteDb = PouchDbStorage.CreateDb('http://localhost:5984/my-app-state');

  // Start sync
  const sync = localDb.sync(remoteDb, { live: true, retry: true });

  builder.setStorage(new PouchDbStorage(localDb));
});
```

## Custom Storage Implementation

If you need to use a different storage backend, you can create your own by implementing the `IStorage` interface. This allows you to integrate with any storage system (e.g., custom APIs, browser storage, or other databases).

### Example: Creating a Custom Storage

```typescript
import type { 
  IStorage, 
  StorageItem, 
  StorageResult, 
  RetrieveItemsOptions, 
  RetrievedItemsResponse,
  StorageChangeEventType,
  StorageChangeEventHandler,
  StorageErrorHandler 
} from '@equinor/fusion-framework-module-state/storage';
import type { AllowedValue } from '@equinor/fusion-framework-module-state';

class CustomStorage implements IStorage {
  async item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null> {
    // Retrieve the item by key from your backend
    return null;
  }

  async allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    // Retrieve all items from your backend
    return { items: [], total_count: 0, offset: 0 };
  }

  async putItem(item: StorageItem): Promise<StorageResult> {
    // Store the item in your custom backend
    // Return a StorageResult indicating success or error
    return { status: 'success', key: item.key };
  }

  async putItems?(items: StorageItem[]): Promise<StorageResult[]> {
    // Store multiple items in your custom backend
    return items.map(item => ({ status: 'success', key: item.key }));
  }

  async removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult> {
    // Remove the item from your custom backend
    return { status: 'success', key: item.key };
  }

  async removeItems?(items: Pick<StorageItem, 'key'>[]): Promise<StorageResult[]> {
    // Remove multiple items from your custom backend
    return items.map(item => ({ status: 'success', key: item.key }));
  }

  async clear?(args?: { clear_all: boolean }): Promise<StorageResult[]> {
    // Clear items from your custom backend
    return [];
  }

  on(type: StorageChangeEventType, callback: StorageChangeEventHandler): VoidFunction {
    // Register a change event listener
    // Return a function that unregisters the listener
    return () => {};
  }

  onError(callback: StorageErrorHandler): VoidFunction {
    // Register an error event listener
    // Return a function that unregisters the listener
    return () => {};
  }

  async initialize?(): Promise<void> {
    // Initialize the storage adapter if needed
  }

  [Symbol.dispose](): void {
    // Cleanup resources when the storage is disposed
  }
}
```

### Registering Your Custom Storage

To use your custom storage with the state module, pass an instance of your storage class to the module configuration:

```typescript
import { enableStateModule } from '@equinor/fusion-framework-module-state';

enableStateModule(configurator, (config) => {
  config.setStorage(new CustomStorage());
});
```

> [!TIP]
> Ensure your custom storage implementation handles errors and edge cases appropriately to provide a robust experience.

For the full interface definition, see the [IStorage source code](https://github.com/equinor/fusion-framework/blob/main/packages/modules/state/src/storage/Storage.interface.ts).

A state management module for the Fusion Framework that provides a reactive, type-safe way to store, retrieve, and observe state items with optional persistence.

## Features

- **Reactive State Management**: Built on RxJS observables for reactive state updates
- **Type Safety**: Strongly typed state items with support for various value types
- **Flexible Storage**: Pluggable storage backends with built-in PouchDB support
- **Bulk Operations**: Efficient batch operations for storing and removing multiple items
- **Prefix Filtering**: Filter items by key prefix for organized data retrieval
- **Live Mode**: Real-time state updates with live retrieval options
- **Error Handling**: Comprehensive error handling with detailed storage results

## Mental Model

Think of the state module as two separate concerns: a `StateProvider` that exposes a small,
consistent CRUD + observe API, and an `IStorage` backend that actually persists the data.

1. Configure a storage backend during module setup (PouchDB by default, or a custom `IStorage`).
2. Use `storeItem`/`storeItems` to write, `getItem`/`getAllItems` to read once.
3. Use `observeItem`/`observeItems` when you need reactive, always-up-to-date values.
4. Swap or extend storage (e.g. add CouchDB replication) without changing consumer code.

## Quick Start

```bash
pnpm install @equinor/fusion-framework-module-state
```

```typescript
import { enableStateModule } from '@equinor/fusion-framework-module-state';
import { createModuleConfigurator } from '@equinor/fusion-framework-module';

// Basic setup with default in-memory storage
const configurator = createModuleConfigurator();
enableStateModule(configurator);
const modules = await configurator.initialize();

// Use the state provider
const stateProvider = modules.state;

// Store and retrieve data
await stateProvider.storeItem({ key: 'example', value: 'Hello, World!' });
const item = await stateProvider.getItem('example');
console.log(item?.value); // "Hello, World!"

// Observe changes reactively
stateProvider.observeItem('example').subscribe(item => {
  console.log('Item updated:', item?.value);
});
```

## Module Setup

```typescript
import { createModuleConfigurator } from '@equinor/fusion-framework-module';
import { enableStateModule } from '@equinor/fusion-framework-module-state';
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';

// Configure and initialize modules
const configurator = createModuleConfigurator();

// Enable the state module
enableStateModule(configurator, (config) => {
  config.setStorage(new PouchDbStorage('my-state'));
});

// Initialize the modules
const modules = await configurator.initialize();
```

## Core API

| Method | Returns | Use it when |
| --- | --- | --- |
| `storeItem(item)` | `Promise<StorageResult>` | Storing a single state item |
| `storeItems(items)` | `Promise<StorageResult[]>` | Storing multiple items in one batch |
| `getItem(key)` | `Promise<StateItem \| null>` | Reading a single item by key |
| `getAllItems(options?)` | `Promise<RetrievedItemsResponse>` | Reading multiple items, with pagination or prefix filtering |
| `removeItem(item)` | `Promise<StorageResult>` | Removing a single item |
| `removeItems(items)` | `Promise<StorageResult[]>` | Removing multiple items in one batch |
| `clear()` | `Promise<StorageResult[]>` | Removing all items |
| `observeItem(key, options?)` | `Observable<StateItem \| null>` | Reacting to changes on a single item |
| `observeItems()` | `Observable<StateItem[]>` | Reacting to changes across all items |

See [Usage & Error Handling](docs/usage.md) for full CRUD examples, subscription cleanup patterns, error handling, and testing utilities.

## Storage

The module ships with a PouchDB-based `IStorage` implementation, including adapter configuration
and CouchDB replication for offline-first, multi-tab, and multi-device sync. You can also implement
`IStorage` yourself to integrate with any backend.

```typescript
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';

const storage = new PouchDbStorage('my-app-state');
const stateProvider = new StateProvider({ storage });
```

See [Storage](docs/storage.md) for adapter configuration, replication, sync event monitoring, and
custom `IStorage` implementations.

## Advanced Guides

- [Usage & Error Handling](docs/usage.md): CRUD operations, subscription cleanup, error handling, and test utilities
- [Storage](docs/storage.md): PouchDB adapters, replication, sync events, and custom storage implementations
- [Events](docs/events.md): state change, sync, and operation events dispatched through the `event` module
- [API Reference](docs/api-reference.md): supported value types, and the full `StateProvider`, `StateItem`, and result-type reference
- [Performance](docs/performance.md): prefix filtering, batching, and sync tuning tips


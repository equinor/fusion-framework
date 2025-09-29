[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)

A state management module for the Fusion Framework that provides a reactive, type-safe way to store, retrieve, and observe state items with optional persistence.

## Features

- **Reactive State Management**: Built on RxJS observables for reactive state updates
- **Type Safety**: Strongly typed state items with support for various value types
- **Flexible Storage**: Pluggable storage backends with built-in PouchDB support
- **Bulk Operations**: Efficient batch operations for storing and removing multiple items
- **Prefix Filtering**: Filter items by key prefix for organized data retrieval
- **Live Mode**: Real-time state updates with live retrieval options
- **Error Handling**: Comprehensive error handling with detailed storage results

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

## Basic Usage

```typescript
// Store a single entry in the state
stateProvider.storeItem({ 
    key: 'user-preference', 
    value: { theme: 'dark', language: 'en' } 
  }).then(result => {
    console.log(result); 
    // Output: { status: 'success', key: 'user-preference' }
  });

// Store multiple entries in the state
stateProvider.storeItems([
  { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
  { key: 'app-settings', value: { notifications: true, autoSave: false } }
]).then(result => {
  console.log(result);
  // Output: [
  //   { status: 'success', key: 'user-preference' },
  //   { status: 'success', key: 'app-settings' }
  // ]
});

// Retrieve a single item from the state
stateProvider.getItem('user-preference').then(item => {
  console.log(item);
  // Output: { key: 'user-preference', value: { theme: 'dark', language: 'en' } }
});

// Retrieve all items from the state
stateProvider.getAllItems().then(response => {
  console.log(response.items);
  // Output: [
  //   { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
  //   { key: 'app-settings', value: { notifications: true, autoSave: false } }
  // ]
  console.log(`Total items: ${response.total_count}`);
});

// Retrieve items with pagination
stateProvider.getAllItems({ limit: 10, skip: 0 }).then(response => {
  console.log(`Retrieved ${response.items.length} items`);
});

// Retrieve items with prefix filtering
stateProvider.getAllItems({ prefix: 'feature.' }).then(response => {
  console.log(`Retrieved ${response.items.length} feature items`);
});

// Retrieve items with both prefix filtering and pagination
stateProvider.getAllItems({ prefix: 'config.', limit: 5, skip: 0 }).then(response => {
  console.log(`Retrieved ${response.items.length} config items`);
});

// Prefix filtering is useful for organizing data by categories
// Example: Store feature flags with 'feature.' prefix
stateProvider.storeItems([
  { key: 'feature.darkMode', value: true },
  { key: 'feature.notifications', value: false },
  { key: 'config.theme', value: 'dark' }
]).then(() => {
  // Retrieve only feature flags
  return stateProvider.getAllItems({ prefix: 'feature.' });
}).then(response => {
  console.log('Feature flags:', response.items);
  // Output: [{ key: 'feature.darkMode', value: true }, { key: 'feature.notifications', value: false }]
});

// Remove a single item from the state (using object with key)
stateProvider.removeItem({ key: 'user-preference' }).then(result => {
  console.log(result);
  // Output: { status: 'success', key: 'user-preference' }
});

// Remove a single item from the state (using string key directly)
stateProvider.removeItem('user-preference').then(result => {
  console.log(result);
  // Output: { status: 'success', key: 'user-preference' }
});

// Remove multiple items from the state
stateProvider.removeItems([
  { key: 'user-preference' },
  { key: 'app-settings' }
]).then(result => {
  console.log(result);
  // Output: [
  //   { status: 'success', key: 'user-preference' },
  //   { status: 'success', key: 'app-settings' }
  // ]
});

// Clear all items from the state
stateProvider.clear().then(results => {
  console.log(results);
  // Output: Array of StorageResult objects for each deleted item
  // e.g., [{ status: 'success', key: 'user-preference' }, { status: 'success', key: 'app-settings' }]
});

// Observe changes to a specific item in the state
stateProvider.observeItem('user-preference').subscribe(item => {
  console.log(item?.value);
});

// Observe changes to all items in the state
stateProvider.observeItems().subscribe(items => {
  console.log(items);
});
```

> [!WARNING]
> `observeItem` and `observeItems` are hot observables and should be unsubscribed when no longer needed to prevent memory leaks.

### Managing Observable Subscriptions

```typescript
import { Subscription } from 'rxjs';

// Store subscription reference for cleanup
const itemSubscription: Subscription = stateProvider.observeItem('user-preference').subscribe(item => {
  console.log('Item changed:', item?.value);
});

// Clean up when done
itemSubscription.unsubscribe();

// For multiple subscriptions, use a subscription container
const subscriptions = new Subscription();

subscriptions.add(
  stateProvider.observeItem('setting1').subscribe(item => console.log('Setting 1:', item))
);

subscriptions.add(
  stateProvider.observeItem('setting2').subscribe(item => console.log('Setting 2:', item))
);

// Unsubscribe from all at once
subscriptions.unsubscribe();

// In React components, use useEffect for cleanup
useEffect(() => {
  const subscription = stateProvider.observeItem('user-preference').subscribe(item => {
    setUserPreference(item?.value);
  });

  return () => subscription.unsubscribe(); // Cleanup on unmount
}, []);
```

## Error Handling

The state module provides comprehensive error handling through `StorageResult` objects. Here's how to handle potential errors:

```typescript
// Handle storage errors when storing items
stateProvider.storeItem({ key: 'test', value: 'data' }).then(result => {
  if (result.status === 'error') {
    console.error(`Failed to store item ${result.key}:`, result.error?.message);
  } else {
    console.log(`Successfully stored item: ${result.key}`);
  }
});

// Handle bulk operation errors
stateProvider.storeItems([
  { key: 'item1', value: 'data1' },
  { key: 'item2', value: 'data2' }
]).then(results => {
  const failures = results.filter(r => r.status === 'error');
  const successes = results.filter(r => r.status === 'success');
  
  console.log(`${successes.length} items stored successfully`);
  if (failures.length > 0) {
    console.error(`${failures.length} items failed to store:`, failures);
  }
});

// Handle retrieval errors
stateProvider.getItem('non-existent-key').then(item => {
  if (item === null) {
    console.log('Item not found');
  } else {
    console.log('Item retrieved:', item);
  }
}).catch(error => {
  console.error('Error retrieving item:', error);
});
```

## Storage

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

### Configuring PouchDB Adapters

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

### Replication with PouchDbStorage

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

### Monitoring Sync Progress

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

### Custom Storage Implementation

If you need to use a different storage backend, you can create your own by implementing the `IStorage` interface. This allows you to integrate with any storage system (e.g., custom APIs, browser storage, or other databases).

#### Example: Creating a Custom Storage

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

#### Registering Your Custom Storage

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

## Supported Value Types

The state module supports various value types through the `AllowedValue` type:

- `string`
- `number`
- `boolean`
- `Array<unknown>`
- `Record<string | symbol | number, unknown>`
- `Set<unknown>`
- `null`
- `undefined`

## API Reference

### StateProvider
The `StateProvider` is the main interface for interacting with the state module. It provides methods for storing, retrieving, and observing state items.

#### Methods:
- **`initialize?(): Promise<void>`** *(optional)*
  - Initializes the state provider if needed by the underlying storage.
  - **Returns**: A promise that resolves when initialization is complete.

- **`storeItem(item: StateItem): Promise<StorageResult>`**
  - Stores a single state item.
  - **Parameters**:
    - `item`: The state item to store, including a `key` and `value`.
  - **Returns**: A promise resolving to a `StorageResult`.

- **`storeItems(items: StateItem[]): Promise<StorageResult[]>`**
  - Stores multiple state items in bulk.
  - **Parameters**:
    - `items`: An array of state items to store.
  - **Returns**: A promise resolving to an array of `StorageResult` objects.

- **`getItem(key: string): Promise<StateItem | null>`**
  - Retrieves a single state item by its key.
  - **Parameters**:
    - `key`: The key of the state item to retrieve.
  - **Returns**: A promise resolving to the state item or `null` if not found.

- **`getAllItems(options?: RetrieveItemsOptions): Promise<RetrievedItemsResponse>`**
  - Retrieves all state items with optional pagination and prefix filtering.
  - **Parameters**:
    - `options`: Optional retrieval options including `limit` and `skip` for pagination, and `prefix` for key filtering.
  - **Returns**: A promise resolving to a `RetrievedItemsResponse` containing items array, total count, and offset information.

- **`removeItem(item: Pick<StateItem, 'key'> | string): Promise<StorageResult>`**
  - Removes a single state item.
  - **Parameters**:
    - `item`: Either a state item object with a `key` property, or a string key directly.
  - **Returns**: A promise resolving to a `StorageResult`.

- **`removeItems(items: Array<Pick<StateItem, 'key'> | string>): Promise<StorageResult[]>`**
  - Removes multiple state items in bulk.
  - **Parameters**:
    - `items`: An array of objects with `key` properties or string keys directly identifying the state items to remove.
  - **Returns**: A promise resolving to an array of `StorageResult` objects.

- **`clear(): Promise<StorageResult[]>`**
  - Clears all state items.
  - **Returns**: A promise resolving to an array of `StorageResult` objects indicating the outcome of each deletion.

- **`observeItem(key: string, options?: { initialValue?: T }): Observable<StateItem<T> | null>`**
  - Observes changes to a specific state item.
  - **Parameters**:
    - `key`: The key of the state item to observe.
    - `options`: Optional configuration object with an `initialValue` that will be returned if no stored value exists.
  - **Returns**: An RxJS `Observable` emitting the state item or `null` if not found.

- **`observeItems(): Observable<StateItem[]>`**
  - Observes changes to all state items.
  - **Returns**: An RxJS `Observable` emitting an array of all state items.

### StateItem
Represents a single item in the state.

#### Properties:
- **`key: string`**
  - The unique identifier for the state item.
- **`value: AllowedValue`**
  - The value of the state item. Must be one of the supported types (see [Supported Value Types](#supported-value-types)).

### StorageResult
Represents the result of a storage operation.

#### Properties:
- **`status: 'success' | 'error'`**
  - Indicates whether the operation was successful.
- **`key: string`**
  - The key of the state item involved in the operation.
- **`error?: StorageError`**
  - An optional error object if the operation failed. Uses the `StorageError` type for storage-specific error information.

### RetrieveItemsOptions
Options for retrieving state items with pagination and prefix filtering support.

#### Properties:
- **`limit?: number`**
  - Maximum number of items to retrieve.
- **`skip?: number`**
  - Number of items to skip (for pagination).
- **`prefix?: string`**
  - Optional key prefix to filter items. Only items whose keys start with this prefix will be returned.

### RetrievedItemsResponse
Response object for bulk item retrieval operations.

#### Properties:
- **`items: StateItem[]`**
  - Array of retrieved state items.
- **`total_count?: number`**
  - Total number of items available in storage.
- **`offset?: number`**
  - Current offset in the result set.

## Testing

The state module includes comprehensive test utilities and examples:

```typescript
import { StateProvider } from '@equinor/fusion-framework-module-state';
import { createMockStorage } from '@equinor/fusion-framework-module-state/__tests__/storage.mock';

// Create a mock storage for testing
const mockStorage = createMockStorage();
const stateProvider = new StateProvider({ storage: mockStorage });

// Test your state operations
describe('State Management', () => {
  it('should store and retrieve items', async () => {
    await stateProvider.storeItem({ key: 'test', value: 'data' });
    const item = await stateProvider.getItem('test');
    expect(item?.value).toBe('data');
  });
});
```

## Migration Guide

### Upgrading from v1.x to v2.x

**Breaking Changes:**
- Event system has been refactored - see [events documentation](#monitoring-sync-progress)
- Storage interface methods are now async by default
- `observeItems` now returns `StateItem<T>[]` instead of `StateItem[]`

**Migration Steps:**
1. Update event subscriptions to use new event types
2. Add `await` to storage operations if using custom storage
3. Update type annotations for `observeItems` return values

### From Other State Libraries

**Redux Migration:**
```typescript
// Before (Redux)
const store = createStore(reducer);
store.dispatch({ type: 'SET_DATA', payload: data });

// After (Fusion State)
await stateProvider.storeItem({ key: 'data', value: data });
```

**Zustand Migration:**
```typescript
// Before (Zustand)
const useStore = create((set) => ({ data, setData }));
useStore.getState().setData(newData);

// After (Fusion State)
await stateProvider.storeItem({ key: 'data', value: newData });
```

## Performance Considerations

### Optimization Tips

1. **Use prefix filtering** for large datasets:
   ```typescript
   // Good: Filter by prefix for better performance
   const userPrefs = await stateProvider.getAllItems({ prefix: 'user.' });

   // Avoid: Loading all items when you only need a subset
   const allItems = await stateProvider.getAllItems();
   const userPrefs = allItems.items.filter(item => item.key.startsWith('user.'));
   ```

2. **Batch operations** for multiple changes:
   ```typescript
   // Good: Single bulk operation
   await stateProvider.storeItems([
     { key: 'user.name', value: 'John' },
     { key: 'user.email', value: 'john@example.com' }
   ]);

   // Avoid: Multiple individual operations
   await stateProvider.storeItem({ key: 'user.name', value: 'John' });
   await stateProvider.storeItem({ key: 'user.email', value: 'john@example.com' });
   ```

3. **Unsubscribe from observables** when components unmount:
   ```typescript
   // Good: Proper cleanup
   useEffect(() => {
     const subscription = stateProvider.observeItem('data').subscribe(setData);
     return () => subscription.unsubscribe();
   }, []);

   // Avoid: Memory leaks
   stateProvider.observeItem('data').subscribe(setData); // Never unsubscribed
   ```

### Memory Management

- **PouchDB Storage**: Uses IndexedDB in browsers, which has storage limits
- **Memory Storage**: All data kept in memory - lost on page refresh
- **Custom Storage**: Depends on your implementation

### Sync Performance

- **Live sync**: Provides real-time updates but increases network usage
- **Batch sync**: Reduces network calls but may show stale data
- **Filtered sync**: Only sync relevant data to improve performance

## Development

This package is part of the [Fusion Framework monorepo](https://github.com/equinor/fusion-framework).

### Contributing

We welcome contributions! Please see our [contributing guidelines](../../CONTRIBUTING.md) for details on:
- Code style and formatting
- Testing requirements
- Pull request process
- Release process

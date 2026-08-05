# API Reference

Supported value types, and the full `StateProvider`, `StateItem`, and result-type reference for
`@equinor/fusion-framework-module-state`.

## Supported Value Types

The state module supports various value types through the `AllowedValue` type:

- `string`
- `number`
- `boolean`
- `Array<unknown>`
- `Record<string, unknown>`
- `null`
- `undefined`

## StateProvider
The `StateProvider` is the main interface for interacting with the state module. It provides methods for storing, retrieving, and observing state items.

### Methods:
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

## StateItem
Represents a single item in the state.

### Properties:
- **`key: string`**
  - The unique identifier for the state item.
- **`value: AllowedValue`**
  - The value of the state item. Must be one of the supported types (see [Supported Value Types](#supported-value-types)).

## StorageResult
Represents the result of a storage operation.

### Properties:
- **`status: 'success' | 'error'`**
  - Indicates whether the operation was successful.
- **`key: string`**
  - The key of the state item involved in the operation.
- **`error?: StorageError`**
  - An optional error object if the operation failed. Uses the `StorageError` type for storage-specific error information.

## RetrieveItemsOptions
Options for retrieving state items with pagination and prefix filtering support.

### Properties:
- **`limit?: number`**
  - Maximum number of items to retrieve.
- **`skip?: number`**
  - Number of items to skip (for pagination).
- **`prefix?: string`**
  - Optional key prefix to filter items. Only items whose keys start with this prefix will be returned.

## RetrievedItemsResponse
Response object for bulk item retrieval operations.

### Properties:
- **`items: StateItem[]`**
  - Array of retrieved state items.
- **`total_count?: number`**
  - Total number of items available in storage.
- **`offset?: number`**
  - Current offset in the result set.

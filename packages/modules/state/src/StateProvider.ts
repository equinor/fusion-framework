import { from, type Observable } from 'rxjs';
import {
  defaultIfEmpty,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  scan,
  startWith,
} from 'rxjs/operators';

// Type-only imports for storage
import type {
  IStorage,
  RetrievedItemsResponse,
  RetrieveItemsOptions,
  StorageResult,
} from './storage/index.js';

import type { StorageItem } from './storage/index.js';

import { type StateEvent, StateChangeEvent } from './events/index.js';

import type { IStateProvider } from './StateProvider.interface.js';
import type { AllowedValue, StateItem } from './types.js';
import type { StateModuleConfig } from './StateModuleConfig.js';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { version } from './version.js';

import isEqual from 'fast-deep-equal';

/**
 * Provides a state management interface backed by a storage implementation.
 *
 * The `StateProvider` class implements the `IStateProvider` interface, allowing storage,
 * retrieval, and removal of state items, with optional support for live updates via observables.
 * It delegates storage operations to the provided `IStorage` instance, supporting both
 * single and bulk operations where available.
 *
 * @typeParam TType - The allowed value type for state items.
 *
 * @example
 * ```typescript
 * const provider = new StateProvider<MyType>(myStorage);
 * await provider.storeItem({ key: 'foo', value: 42 });
 * const item$ = provider.getItem('foo', { live: true });
 * ```
 */
export class StateProvider<TType extends AllowedValue = AllowedValue>
  extends BaseModuleProvider<StateModuleConfig>
  implements IStateProvider<TType>
{
  /** Internal storage implementation for persisting state items */
  #storage: IStorage;

  /**
   * Creates a new StateProvider instance.
   *
   * @param config - Configuration object containing the storage implementation
   */
  constructor(config: StateModuleConfig) {
    // Initialize base module provider with config and version
    super({ config, version });
    // Store reference to the underlying storage implementation
    this.#storage = config.storage;
  }

  /**
   * Initializes the state provider and underlying storage.
   *
   * This method should be called before using the provider to ensure
   * the storage backend is properly set up and ready for operations.
   *
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Initialize the underlying storage implementation if it has an initialize method
    // This allows storage adapters to perform setup like establishing connections
    await this.#storage.initialize?.();
  }

  /**
   * Stores a single item in the state storage.
   *
   * @param item - The state item to store, containing a key and value
   * @returns Promise that resolves with the storage operation result
   */
  public storeItem(item: StateItem<TType>): Promise<StorageResult> {
    return this.#storage.putItem(item);
  }

  /**
   * Stores multiple items in the state storage.
   *
   * Uses bulk operations if supported by the storage implementation,
   * otherwise falls back to individual operations.
   *
   * @param items - Array of state items to store
   * @returns Promise that resolves with an array of storage operation results
   */
  public async storeItems(items: StateItem<TType>[]): Promise<StorageResult[]> {
    // Check if the storage implementation supports bulk operations
    if (typeof this.#storage.putItems === 'function') {
      // Use optimized bulk operation if available
      return this.#storage.putItems(items);
    }
    // Storage does not support bulk put operation, need to put items individually
    // This fallback ensures compatibility with storage adapters that only support single operations
    const results = [];
    for (const item of items) {
      results.push(await this.#storage.putItem(item));
    }
    return results;
  }

  /**
   * Removes a single item from the state storage.
   *
   * @param item_or_id - Either the item key as a string or an object with a key property
   * @returns Promise that resolves with the storage operation result
   */
  public removeItem(item_or_id: Pick<StateItem, 'key'> | string): Promise<StorageResult> {
    // Normalize parameter - accept either a key string or an object with key property
    const item = typeof item_or_id === 'string' ? { key: item_or_id } : item_or_id;
    return this.#storage.removeItem(item);
  }

  /**
   * Removes multiple items from the state storage.
   *
   * Uses bulk operations if supported by the storage implementation,
   * otherwise falls back to individual operations.
   *
   * @param items - Array of item keys (as strings or objects with key property)
   * @returns Promise that resolves with an array of storage operation results
   */
  public async removeItems(items: Array<Pick<StateItem, 'key'> | string>): Promise<StorageResult[]> {
    // Normalize all items to objects with key property for consistent storage interface
    const keys = items.map((item) => (typeof item === 'string' ? { key: item } : item));
    // Check if the storage implementation supports bulk remove operations
    if (typeof this.#storage.removeItems === 'function') {
      // Use optimized bulk operation if available
      return this.#storage.removeItems(keys);
    }
    // Storage does not support bulk remove operation, need to remove items individually
    // This fallback ensures compatibility with storage adapters that only support single operations
    const results = [];
    for (const item of keys) {
      results.push(await this.#storage.removeItem(item));
    }
    return results;
  }

  /**
   * Retrieves a single item from the state storage by key.
   *
   * @template T - The expected type of the item value (defaults to TType)
   * @param key - The key of the item to retrieve
   * @returns Promise that resolves with the item if found, null otherwise
   */
  public getItem<T extends TType = TType>(key: string): Promise<StateItem<T> | null> {
    return this.#storage.item<T>(key);
  }

  /**
   * Retrieves all items from the state storage with optional filtering and pagination.
   *
   * @template T - The expected type of the item values (defaults to TType)
   * @param options - Optional configuration for filtering, pagination, and limits
   * @returns Promise that resolves with a response containing all matching items and metadata
   */
  public getAllItems<T extends TType = TType>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    return this.#storage.allItems<T>(options);
  }

  /**
   * Creates an observable that emits the current state and real-time updates for a specific item.
   *
   * The observable will emit:
   * - The current item value (or null if not found)
   * - Updates whenever the item is created, modified, or deleted
   * - An initial synthetic item if the key doesn't exist but initialValue is provided
   *
   * @template T - The expected type of the item value (defaults to TType)
   * @param key - The key of the item to observe
   * @param options - Optional configuration including an initial value for non-existent items
   * @returns Observable that emits the item state and subsequent changes
   */
  public observeItem<T extends TType = TType>(
    key: string,
    options?: { initialValue?: T },
  ): Observable<StateItem<T> | null> {
    // Create observable for the initial state of the item
    const initial$ = from(this.#storage.item<T>(key)).pipe(
      map((item) => {
        // If no item exists but an initial value was provided, create a synthetic item
        return item === null && options?.initialValue !== undefined
          ? ({ key, value: options.initialValue } as StateItem<T>)
          : item;
      }),
    );

    // Create observable for real-time changes to this specific item
    const changes$ = this.#storage.events$.pipe(
      // Filter to only state change events (ignore operation events)
      filter(StateChangeEvent.isStateChangeEvent),
      // Filter to only events affecting the requested key
      filter((e) => e.detail.key === key),
      // Transform the event into the item state (null for deletions, item for others)
      map((e) => {
        if (e.type === StateChangeEvent.Type.Deleted) {
          return null; // Item was deleted
        }
        return e.detail.item; // Item was created or updated
      }),
    );

    // Combine initial state with real-time changes
    // mergeMap ensures changes are applied to the initial item, startWith emits initial value first
    return initial$.pipe(
      mergeMap((item) => changes$.pipe(startWith(item), distinctUntilChanged(isEqual))),
    );
  }

  /**
   * Creates an observable that emits the current collection of all items and real-time updates.
   *
   * The observable will emit:
   * - The current array of all items (empty array if none exist)
   * - Updated arrays whenever any item is created, modified, or deleted
   *
   * Changes are applied immutably, ensuring each emission contains a new array reference.
   *
   * @template T - The expected type of the item values (defaults to TType)
   * @returns Observable that emits the complete item collection and subsequent changes
   */
  public observeItems<T extends TType = TType>(): Observable<StateItem<T>[]> {
    // Create observable for the initial collection of all items
    const initial$ = from(this.#storage.allItems<T>()).pipe(
      map((result) => result.items),
      // Ensure observable emits an empty array if no items found (handles edge case)
      defaultIfEmpty([] as StateItem<T>[]),
    );

    // Combine initial collection with real-time changes to any items
    // applyStateChangeEvents handles creating, updating, and deleting items in the collection
    return initial$.pipe(mergeMap(applyStateChangeEvents(this.#storage.events$)));
  }

  /**
   * Removes all items from the state storage.
   *
   * Uses bulk clear operations if supported by the storage implementation,
   * otherwise falls back to removing items individually. Individual removal
   * errors are handled gracefully to prevent partial failures from blocking
   * the entire clear operation.
   *
   * @returns Promise that resolves with an array of storage operation results
   */
  public async clear(): Promise<StorageResult[]> {
    // Check if the storage implementation supports optimized bulk clear operation
    if (typeof this.#storage.clear === 'function') {
      // Use optimized bulk clear if available
      return this.#storage.clear();
    }
    // Fallback: get all items and remove them individually
    const all = await this.getAllItems();
    // Remove all items concurrently and handle individual errors gracefully
    // This ensures partial failures don't prevent clearing other items
    return await Promise.all(
      all.items.map((item) =>
        this.#storage
          .removeItem(item)
          // Convert any removal errors to error result objects to maintain consistent return type
          .catch((error) => ({ status: 'error', error }) as StorageResult),
      ),
    );
  }
}

/**
 * Creates an RxJS operator that applies state change events to maintain an up-to-date array of state items.
 *
 * This operator factory produces a function that transforms an initial array of state items by listening
 * to state change events and applying them immutably. Each emission contains a new array reference
 * with the latest state.
 *
 * **Event Handling:**
 * - `StateChangeEvent.Type.Created`: Adds new item to the array
 * - `StateChangeEvent.Type.Updated`: Updates existing item (only if changed)
 * - `StateChangeEvent.Type.Deleted`: Removes item with matching key
 *
 * **Performance Optimizations:**
 * - Uses deep equality checks to avoid unnecessary emissions
 * - Applies changes immutably to maintain referential integrity
 * - Filters out irrelevant events for optimal performance
 *
 * @template T - The allowed value type for the state items
 * @param source$ - Observable stream of {@link StateEvent}s to listen for changes
 * @returns A function that takes an initial array and returns an observable of updated arrays
 *
 * @example
 * ```typescript
 * const items$ = initialItems$.pipe(
 *   mergeMap(applyStateChangeEvents(storage.events$))
 * );
 * ```
 */
function applyStateChangeEvents(source$: Observable<StateEvent>) {
  return <T extends AllowedValue = AllowedValue>(initial: StateItem<T>[] = []) =>
    source$.pipe(
      // Filter to only state change events (ignore operation events)
      filter(StateChangeEvent.isStateChangeEvent),
      // Accumulate changes using scan operator, starting with the initial array
      scan((acc, event) => {
        const {
          type,
          detail: { key, item },
        } = event;

        if (type === StateChangeEvent.Type.Deleted) {
          // Remove the item with the deleted key from the array
          return acc.filter((i) => i.key !== key);
        }

        // Find existing item by key
        const idx = acc.findIndex((i) => i.key === key);

        if (idx > -1) {
          // Item exists - check if it actually changed to avoid unnecessary updates
          if (isEqual(acc[idx], item)) {
            // No change, return original array to maintain reference stability
            return acc;
          }
          // Update existing item, return a new array (immutable update)
          const updated = [...acc];
          updated[idx] = item as StorageItem<T>;
          return updated;
        }

        // Item doesn't exist - append new item to array (immutable update)
        return [...acc, item as StorageItem<T>];
      }, initial),
      // Emit the initial array first, then each updated array
      startWith(initial),
      // Only emit when the array actually changes (deep equality check)
      distinctUntilChanged(isEqual),
    );
}

export default StateProvider;

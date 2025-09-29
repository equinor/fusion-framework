import type { AllowedValue } from '@equinor/fusion-framework-module-state';
import { type Observable, Subject } from 'rxjs';

import type {
  IStorage,
  StorageItem,
  StorageResult,
  RetrievedItemsResponse,
  RetrieveItemsOptions,
} from '../storage/index.js';

import { StateChangeEvent, type StateEventType } from '../events/index.js';

/**
 * Mock implementation of IStorage for testing purposes.
 *
 * Provides an in-memory storage implementation that emits state change events
 * when items are modified. Useful for unit testing components that depend on storage.
 *
 * @example
 * ```typescript
 * const storage = new MockStorage();
 * storage.setMockItems([{ key: 'test', value: 'data' }]);
 * ```
 */
export class MockStorage implements IStorage {
  // Internal event stream for state change notifications
  #events: Subject<StateEventType> = new Subject();
  // In-memory storage of items, keyed by item key
  items: Record<string, StorageItem> = {};

  /**
   * Initialize the mock with a set of items.
   * Useful for setting up test scenarios with predefined data.
   *
   * @param items - Array of storage items to initialize the mock with
   */
  setMockItems(items: Array<StorageItem>) {
    this.items = items.reduce(
      (acc, item) => {
        acc[item.key] = item;
        return acc;
      },
      {} as Record<string, StorageItem>,
    );
  }

  get events$(): Observable<StateEventType> {
    return this.#events.asObservable();
  }

  /**
   * Helper to generate a given number of items with keys 'item1', 'item2', ... and values 1, 2, ...
   */
  generateItems(count: number) {
    for (let i = 1; i <= count; i++) {
      this.items[`item-${i}`] = { key: `item-${i}`, value: i };
    }
  }

  putItem(item: StorageItem): Promise<StorageResult> {
    // Check if item already exists to determine event type
    const existing = this.items[item.key];
    // Store the item in memory
    this.items[item.key] = item;
    // Emit appropriate state change event
    if (existing) {
      this.#events.next(new StateChangeEvent.Updated({ detail: { key: item.key, item } }));
    } else {
      this.#events.next(new StateChangeEvent.Created({ detail: { key: item.key, item } }));
    }
    return Promise.resolve({ status: 'success', key: item.key });
  }

  removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult> {
    // Remove item from storage using destructuring to get both the removed item and remaining items
    const { [item.key]: removed, ...rest } = this.items;
    this.items = rest;
    // Emit deletion event with the removed item (if it existed)
    this.#events.next(
      new StateChangeEvent.Deleted({ detail: { key: removed.key, item: removed } }),
    );
    return Promise.resolve({ status: 'success', key: removed.key });
  }

  item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null> {
    return Promise.resolve((this.items[key] as StorageItem<T>) || null);
  }

  allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    // Get all items as array for filtering and pagination
    let allItems = Object.values(this.items) as StorageItem<T>[];

    // Apply prefix filtering if provided
    if (options?.prefix) {
      allItems = allItems.filter((item) => options.prefix && item.key.startsWith(options.prefix));
    }

    // Store total count before pagination
    const totalCount = allItems.length;

    // Apply pagination if options are provided
    let items = allItems;
    let offset = 0;

    if (options) {
      const skip = options.skip || 0;
      const limit = options.limit;

      offset = skip;

      if (limit !== undefined) {
        items = allItems.slice(skip, skip + limit);
      } else if (skip > 0) {
        items = allItems.slice(skip);
      }
    }

    return Promise.resolve({
      offset,
      total_count: totalCount,
      items,
    });
  }

  [Symbol.dispose](): void {
    this.#events.complete();
  }
}

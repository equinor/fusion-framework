import type { AllowedValue } from '@equinor/fusion-framework-module-state';

import type {
  IStorage,
  StorageItem,
  StorageChangeEvent,
  StorageChangeEventType,
  StorageResult,
  StorageError,
  RetrievedItemsResponse,
  RetrieveItemsOptions,
} from '../storage/index.js';

export class MockStorage implements IStorage {
  items: Record<string, StorageItem> = {};
  listeners: Array<{
    event: StorageChangeEventType;
    listener: (change: StorageChangeEvent) => void;
  }> = [];
  #errorListeners: Array<(error: StorageError) => void> = [];

  setMockItems(items: Array<StorageItem>) {
    this.items = items.reduce(
      (acc, item) => {
        acc[item.key] = item;
        return acc;
      },
      {} as Record<string, StorageItem>,
    );
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
    const existing = this.items[item.key];
    this.items[item.key] = item;
    this.notifyChange({ type: existing ? 'updated' : 'created', item });
    return Promise.resolve({ status: 'success', key: item.key });
  }

  removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult> {
    const { [item.key]: removed, ...rest } = this.items;
    this.items = rest;
    this.notifyChange({ type: 'deleted', item: removed });
    return Promise.resolve({ status: 'success', key: removed.key });
  }

  item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null> {
    return Promise.resolve((this.items[key] as StorageItem<T>) || null);
  }

  allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    const allItems = Object.values(this.items) as StorageItem<T>[];
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

  on(event: StorageChangeEventType, listener: (change: StorageChangeEvent) => void): VoidFunction {
    const obj = { event, listener };
    this.listeners.push(obj);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== obj);
    };
  }

  onError(callback: (error: StorageError) => void): VoidFunction {
    this.#errorListeners.push(callback);
    return () => {
      this.#errorListeners = this.#errorListeners.filter((l) => l !== callback);
    };
  }

  private notifyChange(change: StorageChangeEvent): void {
    for (const { event, listener } of this.listeners) {
      if (event === 'changed' || change.type === event) {
        listener(change);
      }
    }
  }

  [Symbol.dispose](): void {
    // no-op - only for testing purposes
  }
}

import type { AllowedValue } from '@equinor/fusion-framework-module-state';

import type {
  StorageItem,
  StorageChangeEventHandler,
  StorageErrorHandler,
  StorageChangeEventType,
  StorageResult,
} from './types.js';

export type RetrieveItemsOptions = {
  limit?: number;
  skip?: number;
};

export type RetrievedItemsResponse<T extends AllowedValue = AllowedValue> = {
  offset?: number;
  total_count?: number;
  items: StorageItem<T>[];
};

/**
 * Interface for a generic storage adapter that manages key-value pairs.
 *
 * Provides methods for initializing storage, performing CRUD operations,
 * and subscribing to change and error events.
 */
export interface IStorage extends Disposable {
  /**
   * Initializes the storage adapter.
   * Should be called before performing any operations.
   * @returns Promise that resolves when initialization is complete.
   */
  initialize?(): Promise<void>;

  /**
   * Clears items from the storage.
   * @param args Options for clearing, e.g., whether to clear all items.
   * @returns Promise that resolves to an array of results for each deletion.
   */
  clear?(args?: { clear_all: boolean }): Promise<StorageResult[]>;

  /**
   * Retrieves a single item by key.
   * @param key The key of the item.
   * @returns Promise that resolves to the item or null if not found.
   */
  item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null>;

  /**
   * Retrieves all items from storage.
   *
   * This function returns a promise that resolves to an array of all items in storage.
   *
   * @remarks
   * Multiple emits are possible when `options.limit` and `options.skip` are used.
   *
   * @returns Promise that resolves to an array of all items.
   */
  allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>>;

  /**
   * Stores a single item.
   * @param item The item to store.
   * @returns Promise that resolves to the result of the operation.
   */
  putItem(item: StorageItem): Promise<StorageResult>;

  /**
   * Stores multiple items.
   * @param items The items to store.
   * @returns Promise that resolves to an array of results.
   */
  putItems?(items: StorageItem[]): Promise<StorageResult[]>;

  /**
   * Removes a single item by key.
   * @param item Object containing the key of the item to remove.
   * @returns Promise that resolves to the result of the operation.
   */
  removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult>;

  /**
   * Removes multiple items by key.
   * @param items Array of objects containing keys of items to remove.
   * @returns Promise that resolves to an array of results.
   */
  removeItems?(items: Pick<StorageItem, 'key'>[]): Promise<StorageResult[]>;

  /**
   * Registers a listener for storage change events.
   * @param type The type of change event to listen for.
   * @param callback Function to call when the event occurs.
   * @returns Function to unregister the listener.
   */
  on: (type: StorageChangeEventType, callback: StorageChangeEventHandler) => VoidFunction;

  /**
   * Registers a listener for storage errors.
   * @param callback Function to call when an error occurs.
   * @returns Function to unregister the listener.
   */
  onError: (callback: StorageErrorHandler) => VoidFunction;
}

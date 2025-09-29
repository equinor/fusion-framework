import type { Observable } from 'rxjs';

import type { AllowedValue, StateEventType } from '@equinor/fusion-framework-module-state';

import type { StorageItem, StorageResult } from './types.js';

export type RetrieveItemsOptions = {
  limit?: number;
  skip?: number;
  prefix?: string;
};

export type RetrievedItemsResponse<T extends AllowedValue = AllowedValue> = {
  offset?: number;
  total_count?: number;
  items: StorageItem<T>[];
};

/**
 * Generic storage adapter interface for key-value operations.
 *
 * Defines contract for reactive storage implementations with CRUD operations,
 * event streaming, and lifecycle management.
 */
export interface IStorage extends Disposable {
  /**
   * Observable stream of storage change and operation events.
   *
   * @returns RxJS Observable emitting StorageEvent instances
   */
  readonly events$: Observable<StateEventType>;

  /**
   * Initialize storage adapter and establish connections.
   *
   * @returns Promise resolving when ready for operations
   */
  initialize?(): Promise<void>;

  /**
   * Bulk delete items from storage.
   *
   * @param args - Clear operation configuration
   * @returns Promise resolving to array of StorageResult objects
   */
  clear?(args?: { clear_all: boolean }): Promise<StorageResult[]>;

  /**
   * Retrieve single item by key.
   *
   * @template T - Expected value type
   * @param key - Storage key
   * @returns Promise resolving to item or null if not found
   *
   * @remarks Implementations should provide O(1) performance for individual retrievals
   */
  item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null>;

  /**
   * Retrieve all items with optional filtering and pagination.
   *
   * @template T - Expected value type
   * @param options - Pagination and filter options
   * @returns Promise resolving to paginated item response
   *
   * @remarks Implementations should support efficient pagination for large datasets
   */
  allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>>;

  /**
   * Store single item with conflict resolution.
   *
   * @param item - Item to store
   * @returns Promise resolving to operation result
   */
  putItem(item: StorageItem): Promise<StorageResult>;

  /**
   * Bulk store multiple items.
   *
   * @param items - Items to store
   * @returns Promise resolving to array of operation results
   *
   * @remarks Implementations should provide O(n) bulk operations for efficiency
   */
  putItems?(items: StorageItem[]): Promise<StorageResult[]>;

  /**
   * Remove single item by key.
   *
   * @param item - Object with key to remove
   * @returns Promise resolving to operation result
   */
  removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult>;

  /**
   * Bulk remove multiple items by key.
   *
   * @param items - Array of objects with keys to remove
   * @returns Promise resolving to array of operation results
   *
   * @remarks Implementations should provide O(n) bulk operations for efficiency
   */
  removeItems?(items: Pick<StorageItem, 'key'>[]): Promise<StorageResult[]>;
}

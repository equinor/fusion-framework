import type { ObservableInput } from 'rxjs';

import type { AllowedValue, StateItem } from './types.js';

import type { StorageResult } from './storage/types.js';
import type { RetrievedItemsResponse, RetrieveItemsOptions } from './storage/Storage.interface.js';

/**
 * Options for retrieving state values.
 *
 * @property live - If true, retrieves the value in "live" mode, which may trigger additional behaviors such as live updates.
 */
export type StateRetrieveOptions = {
  live?: boolean;
};

/**
 * Represents a generic state provider interface for managing stateful items.
 *
 * @typeParam TType - The type of values allowed in the state, constrained by {@link AllowedValue}.
 *
 * This interface defines the contract for a state provider, including methods for initialization,
 * storing, retrieving, and removing state items, as well as clearing all stored items. Implementations
 * of this interface are responsible for persisting and managing the lifecycle of state items.
 *
 * The interface promises:
 * - Asynchronous initialization via {@link initialize}, if needed.
 * - Asynchronous storage of single or multiple items via {@link storeItem} and {@link storeItems}.
 * - Asynchronous removal of single or multiple items via {@link removeItem} and {@link removeItems}.
 * - Retrieval of a single item or all items as observable streams via {@link getItem} and {@link getAllItems}.
 * - Asynchronous clearing of all items via {@link clear}.
 *
 * All storage and removal operations return a {@link StorageResult} or an array of results, indicating
 * the outcome of each operation.
 */
export interface IStateProvider<TType extends AllowedValue = AllowedValue> {
  /**
   * @optional
   * Initializes the state provider.
   */
  initialize?(): Promise<void>;

  /**
   * Stores a single item in the state.
   * @param item The item to store.
   * @returns A promise of the store operation.
   */
  storeItem(item: StateItem<TType>): Promise<StorageResult>;

  /**
   * Stores multiple items in the state.
   * @param items The items to store.
   * @returns A promise of the store operations.
   */
  storeItems(items: StateItem<TType>[]): Promise<StorageResult[]>;

  /**
   * Removes a single item from the state.
   * @param item_or_id The item or its ID to remove.
   * @returns A promise of the remove operation.
   */
  removeItem(item_or_id: Pick<StateItem, 'key'> | string): Promise<StorageResult>;

  /**
   * Removes multiple items from the state.
   * @param items The items or their IDs to remove.
   * @returns A promise of the remove operations.
   */
  removeItems(items: Array<Pick<StateItem, 'key'> | string>): Promise<StorageResult[]>;

  /**
   * Retrieves a single item from the state.
   * @param key The key of the item to retrieve.
   * @returns A promise of the retrieved item.
   */
  getItem<T extends TType = TType>(key: string): Promise<StateItem<T> | null>;

  /**
   * Retrieves all items from the state.
   * @param options Optional retrieval options.
   * @returns A promise of the retrieved items.
   */
  getAllItems<T extends TType = TType>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>>;

  /**
   * Observes a single item from the state.
   *
   * When changes to the underlying storage occur, this observable will emit the updated item.
   *
   * @param key The key of the item to observe.
   * @returns An observable stream of the item.
   */
  observeItem<T extends TType = TType>(
    key: string,
    options?: { initialValue?: T },
  ): ObservableInput<StateItem<T> | null>;

  /**
   * Observes multiple items from the state.
   *
   * When changes to the underlying storage occur, this observable will emit the updated items.
   *
   * @returns An observable stream of the items.
   */
  observeItems(): ObservableInput<StateItem[]>;

  /**
   * Clears all items from the state.
   * @returns A promise of the clear operation.
   */
  clear(): Promise<StorageResult[]>;
}

import { Observable, from, type ObservableInput } from 'rxjs';
import { defaultIfEmpty, map, tap } from 'rxjs/operators';

import {
  storageOperators,
  type IStorage,
  type RetrievedItemsResponse,
  type RetrieveItemsOptions,
  type StorageChangeEvent,
  type StorageResult,
} from './storage/index.js';

import type { IStateProvider } from './StateProvider.interface.js';
import type { AllowedValue, StateItem } from './types.js';
import type { StateModuleConfig } from './StateModuleConfig.js';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { version } from './version.js';
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
  #storage: IStorage;

  constructor(config: StateModuleConfig) {
    super({ config, version });
    this.#storage = config.storage;
  }

  async initialize(): Promise<void> {
    await this.#storage.initialize?.();
  }

  public storeItem(item: StateItem<TType>): Promise<StorageResult> {
    return this.#storage.putItem(item);
  }

  public storeItems(items: StateItem<TType>[]): Promise<StorageResult[]> {
    if (typeof this.#storage.putItems === 'function') {
      return this.#storage.putItems(items);
    }
    // Storage does not support bulk put operation, need to put items individually
    return Promise.all(items.map((item) => this.#storage.putItem(item)));
  }

  public removeItem(item_or_id: Pick<StateItem, 'key'> | string): Promise<StorageResult> {
    const item = typeof item_or_id === 'string' ? { key: item_or_id } : item_or_id;
    return this.#storage.removeItem(item);
  }

  public removeItems(items: Array<Pick<StateItem, 'key'> | string>): Promise<StorageResult[]> {
    const keys = items.map((item) => (typeof item === 'string' ? { key: item } : item));
    if (typeof this.#storage.removeItems === 'function') {
      return this.#storage.removeItems(keys);
    }
    // Storage does not support bulk remove operation, need to remove items individually
    return Promise.all(keys.map((item) => this.#storage.removeItem(item)));
  }

  public getItem<T extends TType = TType>(key: string): Promise<StateItem<T> | null> {
    return this.#storage.item<T>(key);
  }

  public getAllItems<T extends TType = TType>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    return this.#storage.allItems<T>(options);
  }

  public observeItem<T extends TType = TType>(
    key: string,
    options?: { initialValue?: T },
  ): Observable<StateItem<T> | null> {
    // Observable for initial items
    // TODO - consider pagination, OoS for current feature set
    const initial$ = from(this.#storage.item<T>(key)).pipe(
      map((item) => {
        return item === null && options?.initialValue !== undefined
          ? ({ key, value: options.initialValue } as StateItem<T>)
          : item;
      }),
    );

    // Observable for change in storage
    const changes$ = new Observable<StorageChangeEvent>((subscriber) =>
      this.#storage.on('changed', (e) => {
        // only queue changes for the provided key
        if (e.item.key === key) {
          return subscriber.next(e);
        }
      }),
    );

    // Combine initial items with subsequent changes
    return initial$.pipe(storageOperators.updateStorageItem(changes$));
  }

  public observeItems<T extends TType = TType>(): Observable<StateItem<T>[]> {
    // Observable for initial items
    const initial$ = from(this.#storage.allItems<T>()).pipe(
      map((result) => result.items),
      defaultIfEmpty([] as StateItem<T>[]), // ensure observable emits an empty array if no items found
    );

    // Observable for change in storage
    const changes$ = new Observable<StorageChangeEvent>((subscriber) =>
      this.#storage.on('changed', (e) => subscriber.next(e)),
    );

    // Combine initial items with subsequent changes
    return initial$.pipe(storageOperators.updateStorageItems(changes$));
  }

  public async clear(): Promise<StorageResult[]> {
    if (typeof this.#storage.clear === 'function') {
      return this.#storage.clear();
    }
    const all = await this.getAllItems();
    return await Promise.all(
      all.items.map((item) =>
        this.#storage
          .removeItem(item)
          .catch((error) => ({ status: 'error', error }) as StorageResult),
      ),
    );
  }
}

export default StateProvider;

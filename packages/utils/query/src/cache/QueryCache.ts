import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { FlowSubject } from '@equinor/fusion-observable';

import { actions } from './actions';

import createReducer from './create-reducer';

import type { QueryCacheMutation, QueryCacheRecord, QueryCacheStateData } from './types';
import type { ActionMap, Actions } from './actions';
import { QueryCacheEvent, QueryCacheEventData, type QueryCacheEvents } from './events';

/**
 * Defines the options used for trimming the query cache.
 * @template TType - The type of the response data.
 * @template TArgs - The type of the arguments used to fetch the data.
 */
type TrimOptions<TType, TArgs> = ActionMap<TType, TArgs>['trim']['payload'];

/**
 * Constructor arguments for creating a new instance of QueryCache.
 * @template TType - The type of the response data.
 * @template TArgs - The type of the arguments used to fetch the data.
 */
export type QueryCacheCtorArgs<TType, TArgs> = {
  /**
   * The initial state data for the query cache.
   */
  initial?: QueryCacheStateData<TType, TArgs>;

  /**
   * The options used for trimming the query cache.
   */
  trimming?: TrimOptions<TType, TArgs>;
};

/**
 * A class that represents a cache for storing query results.
 * @template TType - The type of the response data.
 * @template TArgs - The type of the arguments used to fetch the data.
 */
export class QueryCache<TType, TArgs> {
  /**
   * The internal state of the query cache, represented as a FlowSubject.
   */
  #state: FlowSubject<QueryCacheStateData<TType, TArgs>, Actions<TType, TArgs>>;

  /**
   * Events subject for emitting QueryCache lifecycle events.
   *
   * This subject broadcasts events that track cache operations,
   * allowing external observers to monitor cache changes and mutations.
   */
  #events: Subject<QueryCacheEvent>;

  /**
   * Retrieves the current state of the query cache as a record.
   * @returns {Record<string, QueryCacheRecord<TType, TArgs>>} The current state.
   */
  get state(): Record<string, QueryCacheRecord<TType, TArgs>> {
    return this.#state.value;
  }

  /**
   * Retrieves an Observable that emits the current state of the query cache.
   * @returns {Observable<Record<string, QueryCacheRecord<TType, TArgs>>>} An observable of the current state.
   */
  get state$(): Observable<Record<string, QueryCacheRecord<TType, TArgs>>> {
    return this.#state.asObservable();
  }

  /**
   * Retrieves an Observable that emits the actions dispatched to the query cache.
   * @returns {Observable<Actions<TType, TArgs>>} An observable of the dispatched actions.
   */
  get action$(): Observable<Actions<TType, TArgs>> {
    return this.#state.action$;
  }

  /**
   * Protected method to emit QueryCache lifecycle events.
   *
   * This method creates and emits events that track the various operations performed
   * on the cache, allowing external observers to monitor cache changes and mutations.
   *
   * @template TType - The specific event type from QueryCacheEvents
   * @param type - The event type identifier
   * @param key - The cache key associated with this event
   * @param data - Optional event-specific data payload (type-safe based on event type)
   * @protected
   */
  protected _registerEvent<TType extends keyof QueryCacheEvents>(
    type: TType,
    args?: { key?: string; data?: QueryCacheEventData<TType> },
  ): void {
    this.#events.next(new QueryCacheEvent(type, args?.key, args?.data));
  }

  /**
   * An Observable stream of QueryCache lifecycle events.
   *
   * This stream emits events that track the various operations performed on the cache,
   * including entry set, inserted, removed, invalidated, mutated, and trimmed events.
   * Subscribers can monitor cache changes and handle different lifecycle events.
   *
   * @returns An Observable stream of QueryCache events
   */
  public get event$(): Observable<QueryCacheEvent> {
    return this.#events.asObservable();
  }

  /**
   * Creates a new instance of QueryCache.
   * @param {QueryCacheCtorArgs<TType, TArgs>} args - The constructor arguments.
   */
  constructor(args?: QueryCacheCtorArgs<TType, TArgs>) {
    const { trimming, initial } = args ?? {};

    this.#state = new FlowSubject(createReducer(actions, initial));
    if (trimming) {
      this.#state.addEffect('cache/set', () => this.#state.next(actions.trim(trimming)));
    }

    // Initialize events subject for broadcasting lifecycle events
    this.#events = new Subject<QueryCacheEvent>();
  }

  /**
   * Checks if an item exists in the query cache by key.
   * @param {string} key - The key of the item to check.
   * @returns {boolean} True if the item exists, otherwise false.
   */
  public has(key: string): boolean {
    return key in this.#state.value;
  }

  /**
   * Sets the value of an item in the query cache.
   * @param {string} key - The key of the item to set.
   * @param {Pick<QueryCacheRecord<TType, TArgs>, 'value' | 'args' | 'transaction'>} record - The new value of the item.
   */
  public setItem(
    key: string,
    record: Pick<QueryCacheRecord<TType, TArgs>, 'value' | 'args' | 'transaction'>,
  ): void {
    const { args, transaction, value } = record;
    this.#state.next(actions.insert(key, { args, transaction, value }));
    this._registerEvent('query_cache_entry_inserted', { key, data: { value, args, transaction } });
  }

  /**
   * Retrieves an item from the query cache by key.
   * @param {string} key - The key of the item to retrieve.
   * @returns {QueryCacheRecord<TType, TArgs> | undefined} The cached item or undefined if not found.
   */
  public getItem(key: string): QueryCacheRecord<TType, TArgs> | undefined {
    return this.#state.value[key];
  }

  /**
   * Removes an item from the query cache by key.
   * @param {string} key - The key of the item to remove.
   */
  public removeItem(key: string) {
    this.#state.next(actions.remove(key));
    this._registerEvent('query_cache_entry_removed', { key });
  }

  /**
   * Invalidates an item in the query cache by key, causing it to be refetched on next request.
   * @param {string} key - The key of the item to invalidate.
   */
  public invalidate(key?: string) {
    const item = key ? this.#state.value[key] : undefined;
    this.#state.next(actions.invalidate(key, item));

    if (key) {
      this._registerEvent('query_cache_entry_invalidated', {
        key,
        data: { previousValue: item?.value },
      });
    }
  }

  /**
   * Mutates an item in the query cache by key.
   * @param {string} key - The key of the item to mutate.
   * @param {QueryCacheMutation | ((current: TType) => QueryCacheMutation)} changes - The changes to apply to the item.
   */
  public mutate(
    key: string,
    changes: QueryCacheMutation<TType> | ((current?: TType) => QueryCacheMutation<TType>),
  ): VoidFunction {
    const current = key in this.#state.value ? this.#state.value[key] : undefined;

    if (!current) {
      throw new Error(`Cannot mutate cache item with key ${key}: item not found`);
    }
    const next = typeof changes === 'function' ? changes(current?.value) : changes;
    this.#state.next(actions.mutate(key, next, current));

    this._registerEvent('query_cache_entry_mutated', {
      key,
      data: {
        previousValue: current.value,
        newValue: next,
        mutation: next,
      },
    });

    return () => this.#state.next(actions.set(key, current));
  }

  /**
   * Trims the query cache based on the provided options.
   * @param {TrimOptions<TType, TArgs>} options - The options for trimming the cache.
   */
  public trim(options: TrimOptions<TType, TArgs>) {
    const beforeKeys = new Set(Object.keys(this.#state.value));
    this.#state.next(actions.trim(options));
    const afterKeys = new Set(Object.keys(this.#state.value));

    const removedKeys = Array.from(beforeKeys).filter((key) => !afterKeys.has(key));

    this._registerEvent('query_cache_trimmed', {
      data: {
        removedKeys,
        criteria: options,
      },
    });
  }

  /**
   * Resets the query cache to its initial state.
   */
  public reset() {
    this.#state.reset();
    this._registerEvent('query_cache_reset');
  }

  /**
   * Completes the query cache, signaling that no more items will be added to the cache.
   */
  public complete() {
    this.#state.complete();
    this.#events.complete();
  }
}

export default QueryCache;

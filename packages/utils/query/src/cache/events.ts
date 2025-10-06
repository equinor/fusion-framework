import type { IQueryEvent } from '../events';

/**
 * Base interface for QueryCache events.
 *
 * This interface defines the structure of events emitted by QueryCache instances,
 * providing type-safe event data and cache key tracking.
 *
 * @template TData - The type of data associated with this event
 */
export interface IQueryCacheEvent<TData = unknown> extends IQueryEvent<TData> {
  key?: string;
}

/**
 * Event class for QueryCache lifecycle events.
 *
 * This class represents events that track the various operations performed
 * on the QueryCache, providing type-safe event data and cache key tracking.
 *
 * @template TData - The type of data associated with this event
 */
export class QueryCacheEvent<TData = unknown> implements IQueryCacheEvent<TData> {
  /**
   * Creates a new QueryCache event.
   *
   * @param type - The specific event type identifier
   * @param key - The cache key associated with this event
   * @param data - Optional event-specific data payload
   */
  constructor(
    public readonly type: keyof QueryCacheEvents,
    public readonly key?: string,
    public readonly data?: TData,
  ) {}
}

/**
 * Utility type to extract the data payload type from a QueryCache event type.
 *
 * This type helper extracts the generic type parameter from a QueryCacheEvent
 * based on the event type key, enabling type-safe event data handling.
 *
 * @template TType - The event type key from QueryCacheEvents
 */
export type QueryCacheEventData<TType extends keyof QueryCacheEvents> =
  QueryCacheEvents[TType] extends QueryCacheEvent<infer T> ? T : never;

/**
 * Interface defining all available QueryCache lifecycle event types.
 *
 * This interface maps event type keys to their corresponding event structures,
 * providing type-safe definitions for all events that can be emitted by QueryCache.
 *
 * @template TData - The type of cached data
 * @template TArgs - The type of query arguments
 */
export interface QueryCacheEvents<TData = unknown, TArgs = unknown> {
  /** Emitted when a cache entry is set with a complete record */
  query_cache_entry_set: QueryCacheEvent<{
    record: { value: TData; args: TArgs; transaction: string };
  }>;

  /** Emitted when a cache entry is inserted with new data */
  query_cache_entry_inserted: QueryCacheEvent<{ value: TData; args: TArgs; transaction: string }>;

  /** Emitted when a cache entry is removed */
  query_cache_entry_removed: QueryCacheEvent<never>;

  /** Emitted when a cache entry is invalidated */
  query_cache_entry_invalidated: QueryCacheEvent<{ previousValue?: TData }>;

  /** Emitted when a cache entry is mutated/updated */
  query_cache_entry_mutated: QueryCacheEvent<{
    previousValue: TData;
    newValue: TData;
    mutation: any;
  }>;

  /** Emitted when the cache is trimmed based on criteria */
  query_cache_trimmed: QueryCacheEvent<{
    removedKeys: string[];
    criteria: { sort?: any; validate?: any; size?: number };
  }>;

  /** Emitted when the cache is reset to its initial state */
  query_cache_reset: QueryCacheEvent<never>;
}

declare module '@equinor/fusion-query' {
  interface QueryEventMap extends QueryCacheEvents {}
}

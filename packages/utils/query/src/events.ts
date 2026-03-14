import type { QueryClientOptions } from './client/QueryClient';

/**
 * Base interface for all query-related events.
 *
 * Every event emitted through the `Query.event$` stream implements this interface,
 * providing a consistent structure for event type discrimination and optional payload.
 *
 * @template TData - The type of data payload carried by this event.
 */
export interface IQueryEvent<TData = unknown> {
  /** The event type identifier, used for filtering and type-safe discrimination. */
  type: keyof QueryEventMap;
  /** Optional event-specific data payload. */
  data?: TData;
}

/**
 * Concrete event class emitted by the {@link Query} instance itself.
 *
 * Represents lifecycle events for query creation, completion, caching, and job management.
 * Subscribers can use `instanceof QueryEvent` to filter for query-level events
 * when the aggregated `event$` stream also contains client and cache events.
 *
 * @template TData - The type of data payload carried by this event.
 */
export class QueryEvent<TData = undefined> implements IQueryEvent<TData> {
  constructor(
    public readonly type: keyof QueryEvents,
    public readonly key: string,
    public readonly data?: TData,
  ) {}
}

/**
 * Mapping of all Query-level event types to their event class shapes.
 *
 * This interface defines every lifecycle event emitted by a {@link Query} instance,
 * providing type-safe event data for subscribers. QueryClient and QueryCache events
 * are defined separately and merged into {@link QueryEventMap} via module augmentation.
 *
 * @template TData - The type of cached data.
 * @template TArgs - The type of query arguments.
 */
export interface QueryEvents<TData = unknown, TArgs = unknown> {
  /** Emitted when a new query is initiated with the provided arguments and options. */
  query_created: QueryEvent<{ args: TArgs; options?: Partial<QueryClientOptions> }>;
  /** Emitted when a query completes, indicating the result data and cache validity. */
  query_completed: QueryEvent<{ data: TData; hasValidCache: boolean }>;
  /** Emitted when a query connects to an already-running task for the same cache key. */
  query_connected: QueryEvent<{ isExistingTask: boolean }>;
  /** Emitted when a query task is added to the processing queue. */
  query_queued: QueryEvent;
  /** Emitted when a query is aborted via an `AbortSignal`. */
  query_aborted: QueryEvent;
  /** Emitted when a valid cache entry is found for the query arguments. */
  query_cache_hit: QueryEvent<{ cacheEntry: TData }>;
  /** Emitted when no valid cache entry exists and a fetch is required. */
  query_cache_miss: QueryEvent;
  /** Emitted when fetched data is written into the cache. */
  query_cache_added: QueryEvent<{ data: TData; taskId: string; args: TArgs; transaction?: string }>;
  /** Emitted when a new query job (task) is created for execution. */
  query_job_created: QueryEvent<{
    taskId: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  /** Emitted when a queued job is selected by the queue operator for processing. */
  query_job_selected: QueryEvent<{
    taskId: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  /** Emitted when a job begins executing its fetch operation. */
  query_job_started: QueryEvent<{
    taskId: string;
    transaction?: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  /** Emitted when a job subscription is closed and resources are released. */
  query_job_closed: QueryEvent<{
    taskId: string;
    transaction?: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  /** Emitted when a job finishes execution and results are cached. */
  query_job_completed: QueryEvent<{
    taskId: string;
    transaction?: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  /** Emitted when a queued job is skipped because it is no longer observed. */
  query_job_skipped: QueryEvent<{
    taskId: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
}

/**
 * Unified event map that combines Query, QueryClient, and QueryCache events.
 *
 * This interface is extended via TypeScript module augmentation by the `client` and `cache`
 * sub-modules, allowing `Query.event$` to emit a single aggregated stream of all event types.
 * Use this type for exhaustive event type discrimination.
 */
export interface QueryEventMap extends QueryEvents {}

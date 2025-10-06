import type { QueryClientOptions } from './client/QueryClient';

export interface IQueryEvent<TData = unknown> {
  type: keyof QueryEventMap;
  data?: TData;
}

/**
 * Base class for Query events
 */
export class QueryEvent<TData = undefined> implements IQueryEvent<TData> {
  constructor(
    public readonly type: keyof QueryEvents,
    public readonly key: string,
    public readonly data?: TData,
  ) {}
}

/**
 * Event map interface for type-safe event handling and extensibility
 */
export interface QueryEvents<TData = unknown, TArgs = unknown> {
  // new query created
  query_created: QueryEvent<{ args: TArgs; options?: Partial<QueryClientOptions> }>;
  // query completed
  query_completed: QueryEvent<{ data: TData; hasValidCache: boolean }>;
  // query connected to existing task
  query_connected: QueryEvent<{ isExistingTask: boolean }>;
  // query queued
  query_queued: QueryEvent;
  // query aborted
  query_aborted: QueryEvent;
  // query cache hit
  query_cache_hit: QueryEvent<{ cacheEntry: TData }>;
  // query cache missed
  query_cache_miss: QueryEvent;
  // query cache added
  query_cache_added: QueryEvent<{ data: TData; taskId: string; args: TArgs; transaction?: string }>;
  // query job created
  query_job_created: QueryEvent<{
    taskId: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  // query job selected
  query_job_selected: QueryEvent<{
    taskId: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  // query job started
  query_job_started: QueryEvent<{
    taskId: string;
    transaction?: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  // query job closed
  query_job_closed: QueryEvent<{
    taskId: string;
    transaction?: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  // query job completed
  query_job_completed: QueryEvent<{
    taskId: string;
    transaction?: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
  // query job skipped
  query_job_skipped: QueryEvent<{
    taskId: string;
    args: TArgs;
    options?: Partial<QueryClientOptions>;
  }>;
}

export interface QueryEventMap extends QueryEvents {
  // QueryClient events are handled separately and merged via module augmentation
}

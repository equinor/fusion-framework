import type { IQueryEvent } from '../events';

/**
 * Base interface for QueryClient events.
 *
 * This interface defines the structure of events emitted by QueryClient instances,
 * providing type-safe event data and transaction tracking.
 *
 * @template TData - The type of data associated with this event
 */
export interface IQueryClientEvent<TData = unknown> extends IQueryEvent<TData> {
  transaction: string;
}

/**
 * Event class for QueryClient lifecycle events.
 *
 * This class represents events that track the various stages of query execution
 * within the QueryClient, providing type-safe event data and transaction tracking.
 *
 * @template TData - The type of data associated with this event
 */
export class QueryClientEvent<TData = unknown> implements IQueryClientEvent<TData> {
  /**
   * Creates a new QueryClient event.
   *
   * @param type - The specific event type identifier
   * @param transaction - Unique transaction identifier for the query operation
   * @param data - Optional event-specific data payload
   */
  constructor(
    public readonly type: keyof QueryClientEvents,
    public readonly transaction: string,
    public readonly data?: TData,
  ) {}
}

/**
 * Utility type to extract the data payload type from a QueryClient event type.
 *
 * This type helper extracts the generic type parameter from a QueryClientEvent
 * based on the event type key, enabling type-safe event data handling.
 *
 * @template TType - The event type key from QueryClientEvents
 */
export type QueryClientEventData<TType extends keyof QueryClientEvents> =
  QueryClientEvents[TType] extends QueryClientEvent<infer T> ? T : never;

/**
 * Interface defining all available QueryClient lifecycle event types.
 *
 * This interface maps event type keys to their corresponding event structures,
 * providing type-safe definitions for all events that can be emitted by QueryClient.
 *
 * @template TData - The type of query result data
 * @template TArgs - The type of query arguments
 */
export interface QueryClientEvents<TData = unknown, TArgs = unknown> {
  /** Emitted when a query job is requested with arguments and options */
  query_client_job_requested: QueryClientEvent<{ args: TArgs; options?: unknown }>;

  /** Emitted when query execution begins (no additional data needed) */
  query_client_job_executing: QueryClientEvent<never>;

  /** Emitted when a query completes successfully with the result payload */
  query_client_job_completed: QueryClientEvent<{ payload: TData }>;

  /** Emitted when query execution fails with an error */
  query_client_job_failed: QueryClientEvent<{ error: Error }>;

  /** Emitted when a query is canceled with a reason */
  query_client_job_canceled: QueryClientEvent<{ reason: string }>;

  /** Emitted when a general error occurs during query processing */
  query_client_job_error: QueryClientEvent<{ error: Error }>;
}

declare module '@equinor/fusion-query' {
  interface QueryEventMap extends QueryClientEvents {}
}

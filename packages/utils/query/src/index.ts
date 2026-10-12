/**
 * `@equinor/fusion-query` — Reactive data fetching, caching, and state management library.
 *
 * This package provides the {@link Query} class for managing asynchronous data fetching
 * with built-in caching, queue strategies, retry logic, and a comprehensive event system.
 *
 * @packageDocumentation
 */
export * from './types.js';
export * as operators from './operators/index.js';

export { default, Query, QueryCtorOptions } from './Query.js';

export { IQueryEvent, QueryEventMap, QueryEvent } from './QueryEvent.js';

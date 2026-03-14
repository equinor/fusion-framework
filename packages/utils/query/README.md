# @equinor/fusion-query

Reactive data fetching and caching library built on RxJS Observables with queue strategies, automatic retry, and a comprehensive event system.

## When to Use

Use `@equinor/fusion-query` when you need to:

- Fetch remote data with built-in caching that prevents redundant network requests
- Manage concurrent requests with configurable queue strategies (`switch`, `merge`, `concat`)
- Automatically retry failed requests with customizable delay and count
- React to query lifecycle events for logging, debugging, or telemetry
- Share cached data across multiple consumers through a shared `QueryCache`
- Perform optimistic updates and cache mutations

## Installation

```bash
pnpm add @equinor/fusion-query
```

## Quick Start

```typescript
import { Query } from '@equinor/fusion-query';

interface User {
  id: string;
  name: string;
}

const userQuery = new Query<User, { id: string }>({
  client: {
    fn: async (args, signal) => {
      const res = await fetch(`/api/users/${args.id}`, { signal });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  },
  key: (args) => args.id,
  expire: 60_000, // cache valid for 60 seconds
});

// Observable usage
userQuery.query({ id: '123' }).subscribe({
  next: (result) => console.log(result.value),
  error: (err) => console.error(err),
});

// Async/await usage
const result = await userQuery.queryAsync({ id: '123' });
console.log(result.value);
```

## Core Concepts

### Query

The `Query` class is the main entry point. It coordinates a `QueryClient` (handles fetching), a `QueryCache` (stores results), and a queue operator (controls concurrency). When `query()` is called, it first checks the cache; if valid data exists, it emits immediately. Otherwise, a new fetch is queued.

### QueryClient

The `QueryClient` manages the execution of fetch functions, including dispatching requests, handling retries on failure, and emitting lifecycle events. It can be shared across multiple `Query` instances.

### QueryCache

The `QueryCache` stores fetched results keyed by a generated cache key. It supports insertions, mutations, invalidation, trimming, and resets. Multiple `Query` instances can share a single cache for cross-component data sharing.

### QueryTask

A `QueryTask` represents a single in-flight fetch operation. Tasks are deduplicated by cache key: if two consumers request the same data simultaneously, they share the same task.

## Configuration Options

The `QueryCtorOptions` type defines all configuration for a `Query` instance:

| Option | Type | Description |
|---|---|---|
| `client` | `QueryClient \| { fn, options? }` | The fetch function or an existing `QueryClient` instance |
| `key` | `(args) => string` | Generates a unique cache key from the query arguments |
| `expire` | `number` | Milliseconds before a cache entry is considered stale |
| `validate` | `(entry, args) => boolean` | Custom function to validate cache entries |
| `cache` | `QueryCache \| QueryCacheCtorArgs` | Shared cache instance or constructor args |
| `queueOperator` | `'switch' \| 'merge' \| 'concat' \| fn` | Strategy for handling concurrent requests |

## Queue Strategies

Queue strategies determine how multiple concurrent requests for different data are handled:

- **`switch`** (default): Cancels the active request when a new one arrives. Best for search-as-you-type where only the latest result matters.
- **`merge`**: Runs all requests in parallel. Best when every request must resolve independently.
- **`concat`**: Queues requests sequentially. Best when execution order matters.

```typescript
const query = new Query<SearchResult, { term: string }>({
  client: { fn: searchApi },
  key: (args) => args.term,
  queueOperator: 'switch', // cancel stale searches
});
```

## Cache Management

### Mutation (Optimistic Update)

Update cached data directly without refetching. The `mutate` method returns an undo function that restores the previous value:

```typescript
const undo = userQuery.mutate(
  { id: '123' },
  (current) => ({ value: { ...current!, name: 'Updated Name' }, updated: Date.now() }),
);

// Roll back if the server update fails
try {
  await updateUserOnServer('123', { name: 'Updated Name' });
} catch {
  undo();
}
```

### Invalidation

Mark specific entries or the entire cache as stale, forcing a refetch on the next query:

```typescript
userQuery.invalidate({ id: '123' }); // invalidate one entry
userQuery.invalidate();                // invalidate all entries
```

### Custom Cache Validation

Override the default expiration-based validation with custom logic:

```typescript
const query = new Query<Data, Args>({
  client: { fn: fetchData },
  key: (args) => JSON.stringify(args),
  validate: (entry, args) => {
    // Consider invalid if older than 30 minutes
    return (entry.updated ?? 0) + 30 * 60_000 > Date.now();
  },
});
```

### Shared Cache

Multiple `Query` instances can share a `QueryCache` to avoid duplicate fetches across components:

```typescript
import { Query } from '@equinor/fusion-query';
import { QueryCache } from '@equinor/fusion-query/cache';

const sharedCache = new QueryCache();

const homepageQuery = new Query({
  client: { fn: fetchPosts },
  cache: sharedCache,
  key: () => 'posts',
});

const sidebarQuery = new Query({
  client: { fn: fetchPosts },
  cache: sharedCache,
  key: () => 'posts', // same key — reuses cached data
});
```

## Persistent Query

Use `persistentQuery` when the UI should reflect cache mutations in real time. Unlike `query()`, which completes after emitting the result, `persistentQuery()` keeps the subscription open and re-emits whenever the underlying cache entry is updated:

```typescript
userQuery.persistentQuery({ id: '123' }).subscribe((result) => {
  renderUser(result.value); // re-renders on cache mutation
});
```

## Event System

The `Query.event$` Observable aggregates events from three sources — the Query itself, the QueryClient, and the QueryCache — into a single stream for monitoring and debugging.

### Query Events

| Event | Description |
|---|---|
| `query_created` | A new query was initiated |
| `query_completed` | A query finished (from cache or fetch) |
| `query_connected` | Subscriber joined an existing in-flight task |
| `query_queued` | A task was added to the processing queue |
| `query_aborted` | A query was cancelled via `AbortSignal` |
| `query_cache_hit` | Valid cached data was found |
| `query_cache_miss` | No valid cache; fetch is required |
| `query_cache_added` | Fetched data was written to cache |
| `query_job_created` | A new fetch job was created |
| `query_job_selected` | A job was picked by the queue operator |
| `query_job_started` | A job began executing |
| `query_job_closed` | A job subscription was closed |
| `query_job_completed` | A job finished and its results were cached |
| `query_job_skipped` | A job was skipped (no longer observed) |

### QueryClient Events

| Event | Description |
|---|---|
| `query_client_job_requested` | A fetch was requested with arguments |
| `query_client_job_executing` | Fetch execution started |
| `query_client_job_completed` | Fetch completed successfully |
| `query_client_job_failed` | Fetch execution failed |
| `query_client_job_canceled` | Fetch was canceled |
| `query_client_job_error` | An irrecoverable error occurred |

### QueryCache Events

| Event | Description |
|---|---|
| `query_cache_entry_set` | A cache entry was set |
| `query_cache_entry_inserted` | A new entry was inserted |
| `query_cache_entry_removed` | An entry was removed |
| `query_cache_entry_invalidated` | An entry was invalidated |
| `query_cache_entry_mutated` | An entry was mutated |
| `query_cache_trimmed` | The cache was trimmed |
| `query_cache_reset` | The cache was reset |

### Subscribing to Events

```typescript
import { filter } from 'rxjs';
import { QueryEvent } from '@equinor/fusion-query';
import { QueryClientEvent } from '@equinor/fusion-query/client';
import { QueryCacheEvent } from '@equinor/fusion-query/cache';

// All events
query.event$.subscribe((event) => console.log(event.type, event));

// Filter by event type
query.event$.pipe(
  filter((event) => event.type === 'query_cache_hit'),
).subscribe((event) => console.log('Cache hit:', event.data));

// Filter by event source using instanceof
const cacheEvents$ = query.event$.pipe(filter((e) => e instanceof QueryCacheEvent));
const clientEvents$ = query.event$.pipe(filter((e) => e instanceof QueryClientEvent));
const queryEvents$ = query.event$.pipe(filter((e) => e instanceof QueryEvent));
```

## React Integration

The `@equinor/fusion-query/react` sub-path exports the `useDebounceQuery` hook for debounced data fetching in React components:

```tsx
import { useDebounceQuery } from '@equinor/fusion-query/react';

function SearchComponent() {
  const [term, setTerm] = useState('');
  const result = useDebounceQuery(myQuery, {
    args: [{ search: term }],
    delay: 300,
  });

  return <input value={term} onChange={(e) => setTerm(e.target.value)} />;
}
```

## Operators

The `operators` namespace provides RxJS operator utilities:

- **`switchQueue`**: Cancels in-progress work when new items arrive (default strategy).
- **`mergeQueue`**: Processes items concurrently without cancellation.
- **`concatQueue`**: Processes items sequentially in FIFO order.
- **`queryValue`**: Extracts the raw `value` from a query result stream, stripping metadata.

```typescript
import { operators } from '@equinor/fusion-query';

query.query({ id: '123' }).pipe(operators.queryValue).subscribe((user) => {
  console.log(user.name); // plain User object, no wrapper
});
```

## Cleanup

Always unsubscribe from query Observables or call `complete()` to release resources:

```typescript
const sub = query.query(args).subscribe((r) => console.log(r));
// Later:
sub.unsubscribe();

// Or dispose the entire Query instance:
query.complete();
```

## Sub-path Exports

| Path | Contents |
|---|---|
| `@equinor/fusion-query` | `Query`, types, operators, events |
| `@equinor/fusion-query/cache` | `QueryCache`, `QueryCacheEvent`, cache types |
| `@equinor/fusion-query/client` | `QueryClient`, `QueryClientError`, `QueryClientEvent`, client types |
| `@equinor/fusion-query/operators` | Queue operators and `queryValue` |
| `@equinor/fusion-query/react` | `useDebounceQuery` hook |


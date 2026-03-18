# Observable Patterns

The observable API exposes the same HTTP transport pipeline as the promise API, but in a form that composes naturally with RxJS.

Use `fetch$()`, `json$()`, `blob$()`, and `sse$()` when your request depends on other streams, needs cancellation by unsubscribe, or should participate in a larger RxJS workflow.

## Promise Methods vs Observable Methods

| Need | Recommended API |
| --- | --- |
| One request and one result | `fetch()` or `json()` |
| RxJS composition | `fetch$()` or `json$()` |
| Automatic cancellation when input changes | `fetch$()` or `json$()` with `switchMap` |
| Observing transport activity | `request$`, `response$`, and the observable request methods |
| Streaming server events | `sse$()` |

Promise methods are implemented with `firstValueFrom(...)` on the corresponding observable method. That means both forms share the same underlying request pipeline.

## Core Observable Behavior

- observable request methods are cold
- nothing is sent until you subscribe
- unsubscribing aborts the underlying fetch
- `client.abort()` cancels every in-flight request started by that client instance
- `request$` and `response$` are per-client streams, not global streams

## Pattern: Request From Another Stream

Use `switchMap` when a new upstream value should replace the previous in-flight request.

```typescript
import { switchMap } from 'rxjs/operators';

const item$ = selectedId$.pipe(
  switchMap((id) => client.json$(`/items/${id}`)),
);
```

This pattern works well for route parameters, selected rows, debounced search terms, and refresh triggers.

## Pattern: Observe Transport Activity

Each client instance exposes `request$` and `response$` so you can observe transport behavior alongside your result stream.

```typescript
const requestLog = client.request$.subscribe((request) => {
  console.debug('request', request.method, request.uri);
});

const responseLog = client.response$.subscribe((response) => {
  console.debug('response', response.status, response.url);
});
```

Use these streams for diagnostics, telemetry, debugging operators, or building test helpers.

## Pattern: Cancel By Unsubscribing

Observable requests are a good fit for component and service lifecycles because cancellation is built in.

```typescript
const subscription = client.json$('/items').subscribe({
  next: console.log,
  error: console.error,
});

subscription.unsubscribe();
```

After unsubscribe, the client aborts the underlying fetch.

## Pattern: Reuse Parsing With Selectors

Selectors work well with observable request methods because they separate transport from parsing.

```typescript
const user$ = client.fetch$('/users/42', {
  selector: userSelector,
});
```

This lets you keep parsing logic reusable while still composing the request with RxJS operators.

## Pattern: Use The Right Layer For The Job

For most advanced flows, the HTTP module works best when each layer has one responsibility.

- use `fetch$()` or `json$()` for transport
- use selectors for response parsing
- use request and response handlers for cross-cutting transport behavior
- use RxJS operators for orchestration and composition

## Common Observable Workflows

- a route parameter stream drives `json$()` with `switchMap`
- a user action stream triggers `fetch$()` and `catchError`
- a request is observed through `request$` for telemetry
- a response is observed through `response$` for diagnostics
- an SSE endpoint uses `sse$()` for incremental updates

## Rule Of Thumb

Start with `json()` if you just need the result of one request. Move to `json$()` or `fetch$()` when the request is part of a reactive workflow.
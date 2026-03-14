# Server-Sent Events

Use `client.sse$()` when an endpoint returns `text/event-stream` and you want parsed `ServerSentEvent<T>` objects instead of manually reading the response body.

This is the highest-level SSE API in the package. If you need lower-level composition, use `createSseSelector` or `sseMap`.

## Quick Start

```typescript
const events$ = client.sse$<{ message: string }>('/events', undefined, {
  eventFilter: 'message',
  skipHeartbeats: true,
});
```

Subscribe to the result the same way you would any other observable HTTP call.

## `sse$()` Inputs

| Input | Where it goes | Purpose |
| --- | --- | --- |
| request init | second argument to `sse$()` | HTTP method, body, headers, and `signal` |
| SSE selector options | third argument to `sse$()` | `eventFilter`, `skipHeartbeats`, and custom parsing |

`client.sse$()` uses the request `signal` as the abort signal for the underlying SSE reader.

## SSE Options

| Option | Type | What it does |
| --- | --- | --- |
| `eventFilter` | `string | string[]` | Emits only matching named SSE events |
| `skipHeartbeats` | `boolean` | Skips empty heartbeat events and named `heartbeat` or `ping` events |
| `dataParser` | `(data: string) => T` | Overrides the default parser for the `data:` field |

By default, the parser tries `JSON.parse(...)` first and falls back to the raw string when parsing fails.

## What `sse$()` Does For You

- adds `Accept: text/event-stream`
- adds `Content-Type: text/event-stream`
- adds `Cache-Control: no-cache` and `Connection: keep-alive`
- validates that the response is a readable `text/event-stream`
- parses `data:` fields into `ServerSentEvent<T>` objects
- honors `retry:` directives by delaying before continuing to read
- stops reading when the observable is unsubscribed or the abort signal fires

## Abort Behavior

Pass an `AbortSignal` through the request init when you need explicit cancellation.

```typescript
const abortController = new AbortController();

const events$ = client.sse$<{ message: string }>(
  '/events',
  { signal: abortController.signal },
  { skipHeartbeats: true },
);

abortController.abort();
```

Unsubscribing from the observable also stops the underlying stream.

## Lower-Level SSE APIs

### `createSseSelector`

Use `createSseSelector` when you want to compose SSE handling with `fetch()` or `fetch$()` yourself.

Unlike `client.sse$()`, the lower-level SSE APIs do not add SSE request headers for you. Add the headers your endpoint expects, especially `Accept: text/event-stream`.

```typescript
import { createSseSelector } from '@equinor/fusion-framework-module-http/selectors';

const selector = createSseSelector<{ message: string }>({
  eventFilter: ['message', 'update'],
  skipHeartbeats: true,
});

const events$ = client.fetch$('/events', {
  headers: {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
  selector,
});
```

### `sseMap`

Use `sseMap` when you already have a response observable and want to transform that stream into SSE events.

```typescript
import { sseMap } from '@equinor/fusion-framework-module-http/operators';

const events$ = client.fetch$('/events', {
  headers: {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
}).pipe(
  sseMap<{ message: string }>({
    skipHeartbeats: true,
  }),
);
```

## Error Handling

The SSE APIs throw `ServerSentEventResponseError` when:

- the response is not OK
- the response body is not readable
- the response does not advertise `text/event-stream`

Handle SSE errors the same way you handle any other observable request error.

## Rule Of Thumb

- use `sse$()` for normal application code
- use `createSseSelector` when you want selector-level control
- use `sseMap` when you already have a response observable pipeline

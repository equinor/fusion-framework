# Testing

Import from `@equinor/fusion-framework-module-http/mock` to answer requests from registered route handlers instead of the network. The real configurator API — `configureClient`, `baseUri`, `defaultScopes`, `requestHandler`, `onCreate` — all still applies; only the network call itself is replaced.

## Quick Start

```typescript
import { enableHttpMock } from '@equinor/fusion-framework-module-http/mock';

enableHttpMock(configurator, (builder) => {
  builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
  builder.get('/items', () => Response.json([{ id: 1 }]));
});

const items = await fusion.modules.http.createClient('catalog').json('/items');
```

`enableHttpMock` replaces whichever HTTP module the configurator already carries — including a real one a `FrameworkConfigurator` pre-registers — so it must be called last, after any other HTTP setup.

## The Middleware Contract

A route handler is Fetch-standard middleware:

```typescript
type HttpMockMiddleware = (request: Request) => Response | undefined | Promise<Response | undefined>;
```

- **Matching is tried in registration order.** The first handler to return a `Response` (instead of `undefined`) wins; register more specific routes before more general ones (e.g. before a catch-all `.use(fromOpenApiMock(...))`).
- **Returning (or resolving to) `undefined` declines the request**, falling through to the next registered handler — this is how `.get`/`.post`/`.use` compose with each other and with a whole adapted backend.
- **One router is shared by every named client the configurator builds**, matched against each request's fully resolved URL (`baseUri` + path). Two clients with the same path on different `baseUri`s never collide.
- **The request is cloned before each handler runs**, so one handler reading the body (`request.json()`, `request.text()`) does not exhaust it for the next handler in the chain.
- **`.on(method, match, handler)`** — `method` is matched case-insensitively, or pass `undefined` to match any method. `match` is either a substring tested against the full resolved URL (`url.includes(match)`) or a `RegExp` tested against it (`match.test(url)`) — there is no path-template syntax (`/pets/:id`); use a `RegExp` when you need to extract or ignore parts of the path.
- **`.get`/`.post`/`.put`/`.patch`/`.delete`** are sugar for `.on('GET'|'POST'|..., match, handler)`.
- **`.use(handler)`** registers a handler for every method and every URL — this is the extension point an adapted backend (or a hand-rolled catch-all) registers through.

## What Happens When No Handler Matches

Nothing falls back to the real network, and nothing synthesizes a `404 Response`. Exhausting every registered handler throws instead:

```
Error: No mock handler matched GET https://api.example.com/items. Register one with configurator.http.use(...), .on(...), or .get/.post/.put/.patch/.delete(...).
```

This is deliberate: a mocked client can never reach a live backend by accident, and a forgotten route registration fails the test immediately and legibly — pointing at the exact method and URL — instead of masquerading as "just another 404" your code might otherwise swallow. If you want a route to *answer* with a 404 (as opposed to leaving it unregistered), register it explicitly and return a `Response` with that status — see below.

## Mocking Statuses, Headers, and Error Bodies

There is no separate "mock a status" or "mock a header" API — you build the same `Response` (or `res`) you would in the real handler. What that looks like depends on which of the three ways you're filling the seam.

### Directly with `.get`/`.post`/`.use`

Construct the `Response` however you like; every static and instance member of the Fetch `Response` is available:

```typescript
// custom status + headers
builder.get(
  '/items',
  () => new Response(JSON.stringify([{ id: 1 }]), {
    status: 201,
    headers: { 'content-type': 'application/json', 'x-total-count': '1' },
  }),
);

// shorthand for a JSON body — sets `content-type: application/json` for you
builder.get('/items', () => Response.json([{ id: 1 }], { status: 201, headers: { 'x-total-count': '1' } }));

// an error status is just a `Response` with that status — no throwing needed
builder.get('/items/999', () => Response.json({ error: 'not found' }, { status: 404 }));

// an empty response (matches `new Response(null, ...)` semantics — no content-type is set for a null body)
builder.delete('/items/1', () => new Response(null, { status: 204 }));

// simulate a network-level failure instead of an HTTP error response —
// reject/throw from the handler and it propagates like any other thrown error
builder.get('/items', () => {
  throw new Error('simulated network failure');
});

// async handlers work the same way — return a `Promise<Response>`
builder.get('/items', async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return Response.json([{ id: 1 }]);
});
```

> **`new Response(string)` sets a default `content-type`.** Passing a plain string body (as opposed to `null`/`undefined`) sets `content-type: text/plain;charset=UTF-8` unless you override it in `headers` — this is native `Response` behavior, not something the mock adds.

### Through `fromExpressStyleHandler` (`openapi-backend` and other Express-style handlers)

The handler gets a real `res`-shaped object ([`MockExpressResponse`](../src/mock/adapters/MockExpressResponse.ts)) with `.status()`/`.setHeader()` accumulating until a terminal call (`.json`/`.send`/`.end`) builds the final `Response`:

```typescript
api.register('getUserById', (c, req, res) => {
  res.status(404).setHeader('x-reason', 'not-found').json({ error: 'not found' });
});

api.register('createUser', (c, req, res) => {
  res.status(201).setHeader('location', `/users/${newId}`).json({ id: newId });
});
```

- `.status(code)` — sets the status; defaults to `200` if never called.
- `.setHeader(name, value)` — sets one header; call it multiple times for multiple headers. Chainable, and order relative to `.status()` doesn't matter — both only take effect once a terminal method fires.
- `.json(body)` — stringifies `body` and sets `content-type: application/json`.
- `.send(body?)` — a string body passes through as-is; any other value is JSON-stringified (with `content-type: application/json` set); calling it with no body sends an empty response with whatever status/headers were set.
- `.end(body?)` — same as `.send`, without the JSON-serialization special case for non-string bodies (a non-string, non-undefined body is coerced with `String(body)`).
- Only the first terminal call takes effect — a real response can only be sent once, and later calls are silently ignored.

### Through `fromOpenApiMock`

Status comes from the OpenAPI document itself: `createOpenApiMock` picks the lowest documented `2xx` status for the matched operation (falling back to its `default` response, or `200` if neither exists), and fakes the body from that response's schema — so the status is whatever the spec declares, not always `200`. There is **no header support** through this adapter — every response is built with `Response.json(mock, { status })`, so only `content-type: application/json` is ever set.

To control the status for one operation, register an override — its return value's `status` field replaces the declared one:

```typescript
const openApiMock = createOpenApiMock(openApiDocument, {
  overrides: {
    getPetById: async (ctx) => {
      if (ctx.params.petId === '999') {
        return { status: 404, mock: { message: 'Pet not found' } };
      }
      return ctx.mockResponseForOperation();
    },
  },
});
```

To control **headers** for one operation, don't rely on `fromOpenApiMock` for that route at all — register a direct `.get`/`.on` handler for it *before* `.use(fromOpenApiMock(...))` in the chain (registration order decides which one answers first):

```typescript
builder.get('/pets/999', () => Response.json({ message: 'Pet not found' }, {
  status: 404,
  headers: { 'x-error-code': 'PET_NOT_FOUND' },
}));
builder.use(fromOpenApiMock(openApiMock));
```

## Filling The Seam

Three ways to fill it, from least to most turn-key:

- **`.get`/`.post`/`.put`/`.patch`/`.delete`/`.on`/`.use`** — register a handler or arbitrary middleware directly.
- **`fromExpressStyleHandler`** — adapts an Express-style `(req, res)` handler, so a whole framework built from them (`openapi-backend`, for example) drops in with `.use(fromExpressStyleHandler(api.handleRequest))`.
- **`fromOpenApiMock`** — adapts an [`@equinor/fusion-openapi-mock`](../../utils/openapi-mock) instance, so a real `openapi.json`/`openapi.yaml` fakes every response — with a seed for repeatable output — until a specific operation needs overriding:

  ```typescript
  import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
  import { fromOpenApiMock } from '@equinor/fusion-framework-module-http/mock';

  const openApiMock = createOpenApiMock(openApiDocument, { seed: 42 });
  enableHttpMock(configurator, (builder) => {
    builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
    builder.use(fromOpenApiMock(openApiMock));
  });
  ```

Neither adapter takes a dependency on the library it adapts — construct the real instance and pass it in. All three compose freely in one router; a request tries every registered handler, in registration order, regardless of which of these ways registered it.

## Resetting Between Tests

Call `resetHandlers()` on the configurator (or `reset()` directly on a router) to clear every registered handler, so one test's routes never leak into the next:

```typescript
afterEach(() => {
  configurator.http.resetHandlers();
});
```

## Asserting Calls With `vi.fn`

A handler is a plain function, so a `vi.fn` spy works as one directly — no extra wiring:

```typescript
const handler = vi.fn(() => Response.json({ ok: true }));
builder.get('/items', handler);

await client.json('/items');

expect(handler).toHaveBeenCalledOnce();
const [request] = handler.mock.calls[0];
expect(request.method).toBe('GET');
```

## Multiple Named Clients

Registering handlers is independent of which named client(s) end up calling them — the shared router only matches on the request's fully resolved URL, not on which client made the call. Configure as many named clients as you need; give each its own `baseUri` so their paths don't collide even when they reuse the same route strings:

```typescript
enableHttpMock(configurator, (builder) => {
  builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
  builder.configureClient('billing', { baseUri: 'https://billing.example.com' });

  builder.get('https://api.example.com/items', () => Response.json([{ id: 1 }]));
  builder.get('https://billing.example.com/items', () => Response.json([{ id: 'inv-1' }]));
});
```

A `match` that is just a path (e.g. `'/items'`) matches by substring against the *full* resolved URL, so it still matches both clients above unless you include enough of the host to disambiguate, or use a `RegExp` anchored to one host.

See [`@equinor/fusion-framework/mock`](../../framework/docs/testing-extending.md) to mock every framework boundary at once.

# Testing

There is no separate mock client or configurator — register a short-circuiting middleware
through `configurator.http.addMiddleware(...)` on the real configurator instead. The real
configurator API — `configureClient`, `baseUri`, `defaultScopes`, `requestHandler`, `onCreate`
— all still applies; a middleware only wraps the network call itself.

## Quick Start

```typescript
configurator.configureHttpClient('catalog', { baseUri: 'https://api.example.com' });
configurator.http.addMiddleware(async (uri, init, next) =>
  uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
);

const items = await fusion.modules.http.createClient('catalog').json('/items');
```

## The Middleware Contract

```typescript
type HttpMiddleware = (
  uri: string,
  init: RequestInit,
  next: (uri: string, init: RequestInit) => Promise<Response>,
) => Response | Promise<Response> | Observable<Response>;
```

- **A middleware decides for itself whether to answer or fall through** — return a `Response` to
  handle the request, or call and return `next(uri, init)` to continue to whichever middleware
  (or the real network call) is registered next. There is no separate "declined" return value —
  unlike a router, this is an onion-style chain, so a middleware can also inspect what `next(...)`
  resolves to and decide based on that (a retry, for example).
- **Registration order is outermost-first.** The first middleware registered via `addMiddleware`
  wraps every other one, including the real network call — so it sees the request first and the
  response last.
- **A test middleware composes with real app config unchanged** — `addMiddleware` wraps
  `_performFetch` rather than replacing it, so the exact same client and configuration a real
  app registers is what a test exercises; only the boundary that would reach the network is
  short-circuited.

## Faking An Entire OpenAPI Document

`createOpenApiMockMiddleware` (`@equinor/fusion-framework-module-http/mock`) adapts an
[`@equinor/fusion-openapi-mock`](../../utils/openapi-mock) instance into an `HttpMiddleware`,
so a real `openapi.json`/`openapi.yaml` fakes every response until a specific operation needs
overriding:

```typescript
import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
import { createOpenApiMockMiddleware } from '@equinor/fusion-framework-module-http/mock';

const openApiMock = createOpenApiMock(openApiDocument, { seed: 42 });

configurator.configureHttpClient('catalog', { baseUri: 'https://api.example.com' });
configurator.http.addMiddleware(createOpenApiMockMiddleware(openApiMock));
```

A request that matches no operation in the document falls through to `next`, so this composes
with other middleware, or the real network call, registered around it.

## Asserting Calls With `vi.fn`

A middleware is a plain function, so a `vi.fn` spy works as one directly:

```typescript
const middleware = vi.fn(async () => Response.json({ ok: true }));
configurator.http.addMiddleware(middleware);

await client.json('/items');

expect(middleware).toHaveBeenCalledOnce();
const [uri, init] = middleware.mock.calls[0];
expect(init.method ?? 'GET').toBe('GET');
```

See [`@equinor/fusion-framework/mock`](../../../framework/docs/testing-extending.md) to mock every
framework boundary at once.

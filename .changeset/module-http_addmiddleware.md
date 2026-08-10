---
"@equinor/fusion-framework-module-http": minor
---

Replace the `@equinor/fusion-framework-module-http/mock` entry point's router-based mock (`enableHttpMock`, `HttpMockConfigurator`, `HttpMockRouter`) with `addMiddleware` on the real `HttpClientConfigurator`, so answering a request in a test no longer means swapping out a separate configurator.

```ts
configurator.configureHttpClient('catalog', { baseUri: 'https://api.example.com' });
configurator.http.addMiddleware(async (uri, init, next) =>
  uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
);
```

`addMiddleware` wraps `_performFetch` rather than replacing it, so the exact same client and configuration a real app registers is what a test exercises — only the boundary that would reach the network is short-circuited, and a middleware that calls `next(uri, init)` falls through to the real call (or the next middleware) unchanged.

Two adapters cover what the old router and its Express-style adapters did:

- `createRouterMiddleware(baseUri, build)` — a minimal Express-like router (`.get`/`.post`/`.put`/`.patch`/`.delete`/`.on`, `:id`-style path params) for one base URI, with no dependency on a real routing library.
- `createOpenApiMockMiddleware(openApiMock)` — adapts an `@equinor/fusion-openapi-mock` instance, so a real `openapi.json`/`openapi.yaml` fakes every response with no handlers written at all.

```ts
import { createRouterMiddleware } from '@equinor/fusion-framework-module-http/mock';

configurator.http.addMiddleware(
  createRouterMiddleware('https://context.example.com', (router) => {
    router.get('/contexts/:id', ({ params }) => Response.json({ id: params.id }));
  }),
);
```

`@equinor/fusion-framework`'s `FrameworkMockConfigurator.http` now returns the real `IHttpClientConfigurator` instead of a mock-specific one, for the same reason.

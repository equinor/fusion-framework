---
"@equinor/fusion-framework-module-http": minor
---

Add a `./mock` entry point built on `addMiddleware` on the real `HttpClientConfigurator`, so answering a request in a test doesn't mean swapping out a separate configurator.

```ts
configurator.configureHttpClient('catalog', { baseUri: 'https://api.example.com' });
configurator.http.addMiddleware(async (uri, init, next) =>
  uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
);
```

`addMiddleware` wraps `_performFetch` rather than replacing it, so the exact same client and configuration a real app registers is what a test exercises — only the boundary that would reach the network is short-circuited, and a middleware that calls `next(uri, init)` falls through to the real call (or the next middleware) unchanged.

Two adapters are included for building a middleware:

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

`@equinor/fusion-framework`'s `FrameworkMockConfigurator` gains a matching `.http` accessor, backed by the same real `IHttpClientConfigurator`.

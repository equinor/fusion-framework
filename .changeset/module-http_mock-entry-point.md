---
"@equinor/fusion-framework-module-http": minor
---

Add a `mock` entry point (`@equinor/fusion-framework-module-http/mock`) so HTTP clients answer requests from registered route handlers instead of the network.

```typescript
import { enableHttpMock } from '@equinor/fusion-framework-module-http/mock';

enableHttpMock(configurator, (builder) => {
  builder.configureClient('catalog', { baseUri: 'https://api.example.com' });
  builder.get('/items', () => Response.json([{ id: 1 }]));
});
```

Route handlers are Fetch-standard middleware — `(request: Request) => Response | undefined | Promise<...>` — tried in registration order, with `undefined` falling through to the next one. One router is shared across every named client a `HttpMockConfigurator` builds, matched against each request's fully resolved URL.

Two adapters drop in an existing backend with no hard dependency on it:

- `fromExpressStyleHandler(handler)` — adapts an Express-style `(req, res)` handler (or a whole framework built from them, like `openapi-backend`).
- `fromOpenApiMock(openApiMock)` — adapts an `@equinor/fusion-openapi-mock` instance, so a real `openapi.json`/`openapi.yaml` fakes every response with no handlers written at all.

`@equinor/fusion-framework`'s `FrameworkMockConfigurator` now pins this instead of the real HTTP module, so `.http` on a mocked framework never reaches the network either.

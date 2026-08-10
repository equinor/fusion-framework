---
"@equinor/fusion-framework": minor
---

`FrameworkMockConfigurator.http` now returns the real `IHttpClientConfigurator` instead of a mock-specific one — fake a response by registering a short-circuiting middleware through `.http.addMiddleware(...)` instead of swapping the module out:

```ts
const configurator = new FrameworkMockConfigurator();
configurator.http.addMiddleware(async (uri, init, next) =>
  uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
);
```

See `@equinor/fusion-framework-module-http`'s `addMiddleware` changeset for the full API.

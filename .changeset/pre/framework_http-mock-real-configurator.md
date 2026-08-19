---
"@equinor/fusion-framework": minor
---

Add a `.http` accessor to `FrameworkMockConfigurator`, backed by the real `IHttpClientConfigurator` — fake a response by registering a short-circuiting middleware through `.http.addMiddleware(...)` instead of swapping the module out:

```ts
const configurator = new FrameworkMockConfigurator();
configurator.http.addMiddleware(async (uri, init, next) =>
  uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
);
```

See `@equinor/fusion-framework-module-http`'s `addMiddleware` changeset for the full API.

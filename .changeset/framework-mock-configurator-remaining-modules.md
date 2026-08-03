---
"@equinor/fusion-framework": minor
---

Add `.services`, `.context` and `.telemetry` accessors to `FrameworkMockConfigurator`, alongside the existing `.msal`, `.serviceDiscovery` and `.http`.

These three modules have no test double yet, so anything read through `.services`, `.context` or `.telemetry` still performs real I/O — but their configurators are now reachable synchronously the same way `.msal` and `.serviceDiscovery` already are, since none of their `configure` factories depend on `ref`:

```typescript
const configurator = new FrameworkMockConfigurator();
configurator.services.configureClient('my-api', { baseUri: 'http://localhost:6669' });

const fusion = await init(configurator);
```

`event` is intentionally left out: its `configure` factory reads `ref` to wire event bubbling to a parent event provider when `FrameworkMockConfigurator` is hoisted inside a host framework, and pinning it would call `configure()` with `ref` always `undefined` — silently disabling that bubbling.

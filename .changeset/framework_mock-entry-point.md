---
"@equinor/fusion-framework": minor
---

Add a `./mock` entry point for initializing the framework in a test.

```typescript
import { mockFramework } from '@equinor/fusion-framework/mock';

const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ name: 'Ada Lovelace' });
  configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
  configurator.serviceDiscovery.addService({ key: 'my-api' });
});
```

`mockFramework` runs the real configure → initialize pipeline with the real built-in modules and
substitutes only the boundaries that leave the process. It takes a single callback receiving a
`FrameworkMockConfigurator`, which **is** a `FrameworkConfigurator`, so every `enableX` helper an
application already uses — including its own — accepts it unchanged.

`FrameworkMockConfigurator` exposes an accessor per module whose test boundary is mocked, all
reachable synchronously via a new `_pin`/`_getConfig` primitive any module (built-in or
application-defined) can reuse:

```typescript
class AppMockConfigurator extends FrameworkMockConfigurator<[InvoiceModule]> {
  constructor() {
    super();
    this._pin(invoiceMockModule);
  }
  get invoices(): InvoiceMockConfigurator {
    return this._getConfig('invoices');
  }
}
```

- `.msal` / `.serviceDiscovery` — unchanged in behavior, now built on `_pin`/`_getConfig` themselves.
- `.http` — backed by the real `IHttpClientConfigurator`; fake a response with
  `configurator.http.addMiddleware(...)` instead of swapping the module out. See
  `@equinor/fusion-framework-module-http`'s `addMiddleware` changeset for the full API.
- `.context` — backed by `ContextMockConfigurator` (`@equinor/fusion-framework-module-context/mock`);
  context resolution in tests no longer performs real I/O. **Type change:** `.context` now returns
  `ContextMockConfigurator` (extends `ContextModuleConfigurator`) — seed data with
  `setCurrentContext`/`setContexts`/`addContext`/`setRelatedContexts`/`setResolver` instead of
  configuring a real client.
- `.telemetry` — backed by `TelemetryMockConfigurator`
  (`@equinor/fusion-framework-module-telemetry/mock`); tracked telemetry no longer reaches
  Application Insights or any real endpoint. **Type change:** `.telemetry` now returns
  `TelemetryMockConfigurator` (extends the real `TelemetryConfigurator`) — read tracked items back
  through `.telemetry.adapter` (`getItems`/`waitForItem`) instead of asserting against a real backend.
- `.services` — reachable the same way, though it still performs real I/O (no test double yet).

`event` is intentionally left out: its `configure` factory reads `ref` to wire event bubbling to a
parent event provider when `FrameworkMockConfigurator` is hoisted inside a host framework, and
pinning it would silently disable that bubbling.

`docs/testing.md`, `docs/testing-extending.md` and `docs/testing-api.md` describe both mocking
strategies now available for context and telemetry: the in-memory mock configurators above, and
mocking the real API/adapter boundary directly for tests that need the full pipeline.

The entry point owns no mock logic of its own — each module exports its own test double from its
own `./mock` entry point, and this one composes the built-in set.

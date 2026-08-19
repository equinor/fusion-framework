---
"@equinor/fusion-framework": minor
---

`FrameworkMockConfigurator.telemetry` is now backed by `TelemetryMockConfigurator` from `@equinor/fusion-framework-module-telemetry/mock` instead of the real `TelemetryConfigurator` — telemetry tracked through a mocked framework instance no longer reaches Application Insights or any real endpoint:

```typescript
import { filter } from 'rxjs';

const fusion = await mockFramework();

fusion.modules.telemetry.items
  .pipe(filter((item) => item.name === 'button-click'))
  .subscribe((item) => {
    // ...
  });

fusion.modules.telemetry.trackEvent({ name: 'button-click' });
```

A test can register its own adapter alongside the mock's default one, the same way `enableTelemetry` already does:

```typescript
const myAdapter: ITelemetryAdapter = { processItem: (item) => forwardSomewhere(item) };
const fusion = await mockFramework((configurator) => {
  configurator.telemetry.setAdapter('my-adapter', myAdapter);
});
```

This changes the type returned by `.telemetry` from `ITelemetryConfigurator` to `TelemetryMockConfigurator` (which extends the real `TelemetryConfigurator`) — code relying on `.telemetry` being exactly the real configurator should read tracked items back through `.telemetry.adapter` (`getItems`/`waitForItem`) instead of asserting against a real telemetry backend.

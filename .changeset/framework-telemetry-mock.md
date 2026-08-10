---
"@equinor/fusion-framework": minor
---

`FrameworkMockConfigurator.telemetry` is now backed by `TelemetryMockConfigurator` from `@equinor/fusion-framework-module-telemetry/mock` instead of the real `TelemetryConfigurator` — telemetry tracked through a mocked framework instance no longer reaches Application Insights or any real endpoint:

```typescript
const fusion = await mockFramework();

fusion.modules.telemetry.trackEvent({ name: 'button-click' });

const item = await configurator.telemetry.adapter.waitForItem('button-click');
```

This changes the type returned by `.telemetry` from `ITelemetryConfigurator` to `TelemetryMockConfigurator` (which extends the real `TelemetryConfigurator`) — code relying on `.telemetry` being exactly the real configurator should read tracked items back through `.telemetry.adapter` (`getItems`/`waitForItem`) instead of asserting against a real telemetry backend.

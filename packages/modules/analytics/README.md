# @equinor/fusion-framework-module-analytics

Fusion Framework module for collecting and exporting application analytics using
OpenTelemetry standards.

## Who should use this

- **Application and portal developers** who want to track user interactions
  (clicks, context changes, app usage) without wiring up telemetry by hand.
- **Module authors** who want their module's lifecycle events picked up by
  analytics automatically via a collector.
- **Test authors** who need to assert which analytics events an app or
  collector produced.

## Overview

The analytics module provides a pluggable **adapter/collector** architecture:

- **Collectors** observe application state (context changes, app selection,
  app loads) and emit structured `AnalyticsEvent` objects.
- **Adapters** receive those events and forward them to a backend — the browser
  console for debugging, or an OTLP-compatible endpoint for production.

When a collector emits an event it is delivered to **every** registered adapter.

### Entry points

| Import path | Contents |
|---|---|
| `@equinor/fusion-framework-module-analytics` | Module definition, `enableAnalytics`, core types |
| `@equinor/fusion-framework-module-analytics/adapters` | `ConsoleAnalyticsAdapter`, `FusionAnalyticsAdapter`, `IAnalyticsAdapter` |
| `@equinor/fusion-framework-module-analytics/collectors` | `ContextSelectedCollector`, `AppSelectedCollector`, `AppLoadedCollector`, `IAnalyticsCollector` |
| `@equinor/fusion-framework-module-analytics/logExporters` | `OTLPLogExporter`, `FusionOTLPLogExporter` |
| `@equinor/fusion-framework-module-analytics/mock` | `MockAnalyticsAdapter` — record tracked events for test assertions |

## Documentation

| Topic | Description |
|---|---|
| [Adapters](docs/adapters.md) | `ConsoleAnalyticsAdapter`, `FusionAnalyticsAdapter`, and creating a custom `IAnalyticsAdapter` |
| [Collectors](docs/collectors.md) | Built-in collectors (context/app selection, app loaded) and creating a custom `IAnalyticsCollector` |
| [Tracking Events Manually](docs/tracking-events.md) | `provider.trackAnalytic` / `trackAnalytic$` for ad-hoc event tracking |
| [Testing](docs/testing.md) | `MockAnalyticsAdapter`, recording and awaiting tracked events, and using a bespoke `ModulesConfigurator` in tests |

## Quick Start

Call `enableAnalytics` inside your application or portal configuration callback
to register adapters and collectors:

```typescript
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
import { ContextSelectedCollector } from '@equinor/fusion-framework-module-analytics/collectors';

const configure = (configurator) => {
  enableAnalytics(configurator, (builder) => {
    // Register an adapter — receives every event
    builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());

    // Register a collector — emits events on context change
    builder.setCollector('context-selected', async (args) => {
      const contextProvider = await args.requireInstance('context');
      const appProvider = await args.requireInstance('app');
      return new ContextSelectedCollector(contextProvider, appProvider);
    });
  });
};
```

> **Note:** The analytics module initialises automatically when used inside the
> Fusion Framework module system. Manual initialisation is only required when
> accessing the provider directly.

See [Adapters](docs/adapters.md), [Collectors](docs/collectors.md), and
[Tracking Events Manually](docs/tracking-events.md) for the full adapter/collector
reference and how to build your own.

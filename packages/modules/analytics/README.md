# @equinor/fusion-framework-module-analytics

Fusion Framework module for collecting and exporting application analytics using
OpenTelemetry standards.

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

## Adapters

Adapters implement `IAnalyticsAdapter` and are responsible for processing and
sending analytics data to their destinations. All adapters support async
initialisation and will be initialised automatically when the provider starts.

### ConsoleAnalyticsAdapter

Logs every analytics event to the browser console. Useful for development and
debugging. No configuration required.

```typescript
builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
```

### FusionAnalyticsAdapter

Forwards analytics events to an OpenTelemetry-compatible log endpoint via a
bundled `LoggerProvider`.

Configuration options:

| Option | Type | Description |
|---|---|---|
| `portalId` | `string` | Portal identifier included in every log record |
| `logExporter` | `OTLPExporterBase` | OTLP log exporter for transport |

#### Using `OTLPLogExporter` (direct HTTP)

```typescript
import { OTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';
import { FusionAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';

builder.setAdapter('fusion-log', async () => {
  const logExporter = new OTLPLogExporter({
    url: 'https://example.com/v1/logs',
    headers: { 'Content-Type': 'application/json' },
  });
  return new FusionAnalyticsAdapter({ portalId: 'my-portal', logExporter });
});
```

#### Using `FusionOTLPLogExporter` (service discovery HTTP client)

```typescript
import { FusionOTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';
import { FusionAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';

builder.setAdapter('fusion', async (args) => {
  if (args.hasModule('serviceDiscovery')) {
    const sd = await args.requireInstance('serviceDiscovery');
    const httpClient = await sd.createClient('analytics');
    const logExporter = new FusionOTLPLogExporter(httpClient);
    return new FusionAnalyticsAdapter({ portalId: 'my-portal', logExporter });
  }
  console.error('Service discovery unavailable — analytics adapter not created');
});
```

### Creating a Custom Adapter

Implement `IAnalyticsAdapter` and register it with `setAdapter`:

```typescript
import type { IAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
import type { AnalyticsEvent } from '@equinor/fusion-framework-module-analytics';

class MyRemoteAdapter implements IAnalyticsAdapter {
  registerAnalytic(event: AnalyticsEvent): void {
    navigator.sendBeacon('/analytics', JSON.stringify(event));
  }

  [Symbol.dispose](): void {
    // cleanup if needed
  }
}

builder.setAdapter('remote', async () => new MyRemoteAdapter());
```

## Collectors

Collectors implement `IAnalyticsCollector` (or extend `BaseCollector`) and emit
`AnalyticsEvent` objects that are forwarded to all adapters. All collectors
support async initialisation.

### ContextSelectedCollector

Emits an event when the active Fusion context changes. Includes the new context,
the previous context, and the current app key in attributes.

```typescript
builder.setCollector('context-selected', async (args) => {
  const ctx = await args.requireInstance('context');
  const app = await args.requireInstance('app');
  return new ContextSelectedCollector(ctx, app);
});
```

### AppSelectedCollector

Emits an event when the active application changes. Includes the new and
previous app key metadata.

```typescript
builder.setCollector('app-selected', async (args) => {
  const app = await args.requireInstance('app');
  return new AppSelectedCollector(app);
});
```

### AppLoadedCollector

Emits an event when an application's modules finish loading. Includes app
manifest metadata and the current context (if available).

```typescript
builder.setCollector('app-loaded', async (args) => {
  const event = await args.requireInstance('event');
  const app = await args.requireInstance('app');
  return new AppLoadedCollector(event, app);
});
```

### Creating a Custom Collector

Extend `BaseCollector` with a Zod schema for validation:

```typescript
import { BaseCollector, createSchema } from '@equinor/fusion-framework-module-analytics/collectors';
import { z } from 'zod';
import { of } from 'rxjs';

const schema = createSchema(z.string(), z.object({ page: z.string() }));

class PageViewCollector extends BaseCollector<string, { page: string }> {
  constructor() {
    super('page-view', schema);
  }

  _initialize() {
    return of({ value: window.location.pathname, attributes: { page: document.title } });
  }
}
```

## Tracking Events Manually

The provider exposes methods for ad-hoc event tracking outside of collectors:

```typescript
// Single event
provider.trackAnalytic({
  name: 'button-click',
  value: 'save',
  attributes: { section: 'toolbar' },
});

// Observable stream
const subscription = provider.trackAnalytic$(myEvent$);
// later: subscription.unsubscribe();
```

#### Configuration

The Context Selected Collector needs the context provider.

##### Example configuration

```typescript
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ContextSelectedCollector } from '@equinor/fusion-framework-module-analytics/collectors';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableAnalytics(configurator, (builder) => {
    builder.setCollector('context-selected', async (args) => {
      const contextProvider = await args.requireInstance('context');
      const appProvider = await args.requireInstance('app');
      return new ContextSelectedCollector(contextProvider, appProvider);
    });
  });
}
```

### Creating Custom Collectors

You can create custom analytics collector by extending the `BaseCollector` class,
or implement the `IAnalyticsCollector` interface and add it in configuration.

#### Example Custom Collector

```typescript
import { type AnalyticsEvent, enableAnalytics } from '@equinor/fusion-framework-module-analytics';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableAnalytics(configurator, (builder) => {
    builder.setCollector('click-test', async () => {
      const subject = new Subject<AnalyticsEvent>();
      window.addEventListener('click', (e) => {
        subject.next({
          name: 'window-clicker',
          value: 42,
        });
      });

      return {
        subscribe: (subscriber) => {
          return subject.subscribe(subscriber);
        },
      };
    });
  });
}
```

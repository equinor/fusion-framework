# Adapters

Adapters implement `IAnalyticsAdapter` and are responsible for processing and
sending analytics data to their destinations. All adapters support async
initialisation and will be initialised automatically when the provider starts.

## ConsoleAnalyticsAdapter

Logs every analytics event to the browser console. Useful for development and
debugging. No configuration required.

```typescript
builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
```

## FusionAnalyticsAdapter

Forwards analytics events to an OpenTelemetry-compatible log endpoint via a
bundled `LoggerProvider`.

Configuration options:

| Option | Type | Description |
|---|---|---|
| `portalId` | `string` | Portal identifier included in every log record |
| `logExporter` | `OTLPExporterBase` | OTLP log exporter for transport |

### Using `OTLPLogExporter` (direct HTTP)

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

### Using `FusionOTLPLogExporter` (service discovery HTTP client)

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

## Creating a Custom Adapter

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

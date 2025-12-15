# Analytics Module

The Fusion Framework Analytics Module provides an unified way to track analytics.
It offers a consistent API for logging analytics data while supporting multiple
adapters and collectors.

When a collector emits a event, it will be sent to all adapters.

## Configuration

To configure the analytics module, you need to provide a function that specifies
the adapters and collectors you want to use. The configuration can be done in
your portal entry file or wherever you initialize the Fusion Framework.

```typescript
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableAnalytics(configurator, (builder) => {
    // configure the analytics module

    builder.setAdapter('console', async () => {
      return new ConsoleAnalyticsAdapter();
    });

    builder.setCollector('context-selected', async (args) => {
      const contextProvider = await args.requireInstance('context');
      return new ContextSelectedCollector(contextProvider);
    });
  });
}
```

## Initialization

The analytics module supports asynchronous initialization of adapters and
collectors. The provider exposes an `initialize()` method that should be called
to set up all configured adapters and collectors:

```typescript
// Get the analytics provider from modules
const provider = modules.analytics;

// Initialize adapters and collectors (required before use)
await provider.initialize();

// Check if provider is initialized
if (provider.initialized) {
  // Provider is ready for use
}
```

> [!NOTE]
> The analytics module will automatically initialize when used within the
> Fusion Framework module system. Manual initialization is only required when
> accessing the provider directly.

## Adapters

Adapters are responsible for processing and sending telemetry data to their
respective destinations. All adapters support asynchronous initialization and
will automatically be initialized when the analytics provider initializes.

### Using `setAdapter`

The `AnalyticsConfigurator` provides a method for adding adapters: `setAdapter`
for pre-instantiated adapters.

#### Simple `setAdapter` Example

```typescript
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableAnalytics(configurator, (builder) => {
    builder.setAdapter('console', async () => {
      return new ConsoleAnalyticsAdapter();
    });
  });
}
```

### Console Adapter

The `ConsoleAnalyticsAdapter` provides a simple way to log analytics data to the
console, useful for development and debugging.

#### Installation

The Console Adapter is included with the analytics module and doesn't require
additional installation.

#### Configuration

The Console Adapter does not require any configuration.

### Fusion Analytics Adapter

The `FusionAnalyticsAdapter` provides a way to log analytics data to a service
using the OpenTelemetry Logs pattern.

#### Installation

The Fusion Analytics Adapter is included with the analytics module and doesn't
require additional installation.

#### Configuration

The Fusion Analytics Adapter support the following configuration options:

- `portalId`: The portal Id to be included in log records.

- `logExporter`: The exporter to use. We bundle `OTLPLogExporter` and `FusionOTLPLogExporter` - see below.

##### Example configuration

```typescript
// OTLPLogExporter
import { OTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';

builder.setAdapter('fusion-log', async () => {
  const logExporter = new OTLPLogExporter({
    url: 'URL_TO_POST_TO',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return new FusionAnalyticsAdapter({
    portalId: 'PORTAL_ID',
    logExporter,
  });
});

// FusionOTLPLogExporter with httpClient
import { FusionOTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';

builder.setAdapter('fusion', async (args) => {
  if (args.hasModule('serviceDiscovery')) {
    const serviceDiscovery = await args.requireInstance<ServiceDiscoveryProvider>(
      'serviceDiscovery'
    );
    const httpClient = await serviceDiscovery.createClient('SERVICE_DISCOVERY_NAME');

    const logExporter = new FusionOTLPLogExporter(httpClient);

    return new FusionAnalyticsAdapter({
      portalId: 'PORTAL_ID',
      logExporter,
    });
  }
  console.error('Could not instanziate monitor http client from service-discovery');
});
```

### Creating Custom Adapters

You can create custom analytics adapters by implementing the `IAnalyticsAdapter`
interface and add it in configuration.

## Collectors

Collectors are responsible for sending events that adapters can pick up. All
collectors support asynchronous initialization and will automatically be
initialized when the analytics provider initializes.

### Using `setCollector`

The `AnalyticsConfigurator` provides a method for adding collectors:
`setCollector` for pre-instantiated collectors.

### Simple `setCollector` Example

```typescript
import { enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import { ContextSelectedCollector } from '@equinor/fusion-framework-module-analytics/collectors';

const configure = (configurator: IModulesConfigurator<any, any>) => {
  enableAnalytics(configurator, (builder) => {
    builder.setCollector('context-selected', async (args) => {
      const contextProvider = await args.requireInstance('context');
      return new ContextSelectedCollector(contextProvider);
    });
  });
}
```

### Context Selected Collector

The `ContextSelectedCollector` listens for selection in the context module and emits
the new and optional previous context.

#### Installation

The Context Selected Collector is included with the analytics module and doesn't
require additional installation.

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
      return new ContextSelectedCollector(contextProvider);
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

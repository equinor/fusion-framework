# @equinor/fusion-framework-module-service-discovery

Resolves service endpoint URIs and authentication scopes from a central service discovery API so that application code can request named services without hard-coding URLs.

## When to Use

Use this module when your application needs to:

- Look up backend service base URIs at runtime instead of baking them into config
- Obtain OAuth scopes for token acquisition automatically
- Create pre-configured HTTP clients for discovered services

## Prerequisites

The module depends on `@equinor/fusion-framework-module-http` for HTTP transport. An HTTP client pointing at the service discovery backend must be registered **before** service discovery is enabled.

> [!WARNING]
> The HTTP module must be enabled in the runtime (e.g. Portal). If you are building a sub-module such as an Application, the portal typically inherits this configuration for you.

## Quick Start

### 1. Register an HTTP client for the service discovery API

Skip this step if the runtime already provides an HTTP client keyed `"service_discovery"`.

```typescript
import { configureHttpClient } from '@equinor/fusion-framework-module-http';
import type { ModulesConfigurator } from '@equinor/fusion-framework-module';

const configurator = new ModulesConfigurator();
configurator.addConfig(
  configureHttpClient('service_discovery', {
    baseUri: 'https://discovery.example.com',
    defaultScopes: ['https://discovery.example.com/.default'],
  }),
);
```

### 2. Enable service discovery

```typescript
import { enableServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';

// Auto-detects the 'service_discovery' HTTP client
enableServiceDiscovery(configurator);
```

### 3. Resolve services at runtime

```typescript
// Resolve a single service
const contextService = await modules.serviceDiscovery.resolveService('context');
console.log(contextService.uri); // 'https://api.example.com/context'

// Create a ready-to-use HTTP client for a discovered service
const client = await modules.serviceDiscovery.createClient('people');
const data = await client.fetchAsync('/persons?search=Jane');
```

## Configuration

### Simple — Custom HTTP Client Key

If the HTTP client is registered under a key other than `"service_discovery"`:

```typescript
enableServiceDiscovery(configurator, async (builder) => {
  builder.configureServiceDiscoveryClientByClientKey(
    'sd_custom',        // HTTP client key
    '/custom/services', // optional endpoint path
  );
});
```

### Intermediate — Custom HTTP Client

Supply your own HTTP client and endpoint:

```typescript
enableServiceDiscovery(configurator, async (builder) => {
  builder.configureServiceDiscoveryClient(async ({ requireInstance }) => {
    const httpProvider = await requireInstance('http');
    return {
      httpClient: httpProvider.createClient('my_key'),
      endpoint: '/custom/services',
    };
  });
});
```

### Advanced — Fully Custom Discovery Client

Provide an object implementing `IServiceDiscoveryClient` directly:

```typescript
enableServiceDiscovery(configurator, async (builder) => {
  builder.setServiceDiscoveryClient({
    async resolveServices() {
      return [
        { key: 'api', uri: 'https://localhost:5000', defaultScopes: [] },
      ];
    },
    async resolveService(key) {
      const services = await this.resolveServices();
      const service = services.find((s) => s.key === key);
      if (!service) throw new Error(`Unknown service: ${key}`);
      return service;
    },
  });
});
```

Or use an async factory for access to the build environment:

```typescript
enableServiceDiscovery(configurator, async (builder) => {
  builder.setServiceDiscoveryClient(async ({ requireInstance }) => {
    const httpProvider = await requireInstance('http');
    const httpClient = httpProvider.createClient('my_key');
    return {
      async resolveServices() {
        return httpClient.fetchAsync('/services');
      },
      async resolveService(key) {
        return httpClient.fetchAsync(`/services/${key}`);
      },
    };
  });
});
```

## Key Concepts

### Inheritance

When used inside a sub-module (e.g. an Application), the Service Discovery module inherits the parent module's discovery client by default. This means:

- The child shares the parent's cache, avoiding duplicate API calls
- The child sees the same session overrides
- Breaking changes in the parent's client could affect the child

### Caching

The built-in `ServiceDiscoveryClient` caches results for **5 minutes** via `@equinor/fusion-query`. The `allow_cache` parameter on `resolveService` / `resolveServices` controls whether to return the first cached snapshot (`true`) or wait for the latest response (`false`, the default).

### Session Overrides

> [!TIP]
> Session overrides let you redirect services to local or staging URLs during development without touching application config.

Store a JSON object in `sessionStorage` under the key `"overriddenServiceDiscoveryUrls"`:

```typescript
const overrides = {
  'my-api': {
    url: 'https://localhost:3000/api',
    scopes: ['https://localhost/.default'],
  },
};
sessionStorage.setItem('overriddenServiceDiscoveryUrls', JSON.stringify(overrides));
```

How it works:

1. Services are fetched normally from the API
2. The module checks `sessionStorage` for overrides
3. Matching services get their `uri` and `scopes` replaced, and an `overridden: true` flag is set
4. Overrides are only applied when `sessionStorage` is available

Clear overrides by removing the storage key:

```typescript
sessionStorage.removeItem('overriddenServiceDiscoveryUrls');
```

> [!NOTE]
> Session overrides are temporary — they are cleared when the browser session ends and only affect the current tab/window.

## API Reference

### Exports

| Export                             | Kind          | Description                                                    |
| ---------------------------------- | ------------- | -------------------------------------------------------------- |
| `enableServiceDiscovery`           | function      | Registers the module on a `ModulesConfigurator` (recommended)  |
| `configureServiceDiscovery`        | function      | Creates an `IModuleConfigurator` for manual `addConfig` usage  |
| `ServiceDiscoveryConfigurator`     | class         | Builder for service discovery configuration                    |
| `ServiceDiscoveryProvider`         | class         | Runtime provider — resolves services, creates HTTP clients     |
| `IServiceDiscoveryProvider`        | interface     | Public API contract for the provider                           |
| `IServiceDiscoveryClient`          | interface     | Contract for pluggable discovery client implementations        |
| `Service`                          | type          | Shape of a resolved service endpoint                           |
| `ServiceDiscoveryConfig`           | interface     | Resolved module configuration holding the discovery client     |
| `ServiceDiscoveryModule`           | type          | Module type alias for the framework module system              |

### `Service` Shape

```typescript
type Service = {
  key: string;         // Lookup key (e.g. "context")
  uri: string;         // Base URI of the service
  scopes?: string[];   // OAuth scopes
  id?: string;         // Service registration ID
  name?: string;       // Display name
  tags?: string[];     // Freeform tags
  overridden?: boolean; // True when session-overridden
  defaultScopes: string[]; // @deprecated — use `scopes`
};
```
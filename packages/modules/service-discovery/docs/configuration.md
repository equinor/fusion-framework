# Configuration

Three levels of control over how services are discovered, from swapping the HTTP client key to replacing the discovery client outright.

## Simple — Custom HTTP Client Key

If the HTTP client is registered under a key other than `"service_discovery"`:

```typescript
enableServiceDiscovery(configurator, async (builder) => {
  builder.configureServiceDiscoveryClientByClientKey(
    'sd_custom',        // HTTP client key
    '/custom/services', // optional endpoint path
  );
});
```

## Intermediate — Custom HTTP Client

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

## Advanced — Fully Custom Discovery Client

> [!TIP]
> Do **not** reach for this to write a test. The module ships a test double at
> `@equinor/fusion-framework-module-service-discovery/mock` — see [Testing](./testing.md).

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

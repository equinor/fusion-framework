# Fusion Service Discovery Module

This module is for resolving service endpoints from a service discovery service.

> [!WARNING]
> This module requires `@equinor/fusion-framework-module-http` to to create http clients, so the module must be enabled in runtime.

## Configure

This module requires a http client to be configured. The http client should be configured with a key that is used to resolve the service endpoints.

> [!NOTE]
> The Service Discovery Module inherits configuration when used in sub-modules (ex. Application), which means that the http client should be configured in the root module (ex Portal).
> 
> Skip this step if the http client is already configured.

```typescript
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
const configurator = new ModulesConfigurator();
configurator.addConfig(
    configureHttpClient(
      'service_discovery', 
      { /* http config */ }
    )
);
```

### Simple Configuration

In the simplest form, the service discovery module can be enabled with the following code:

```typescript
import enableServiceDiscovery from '@equinor/fusion-framework-service-discovery';

// the module will setup the service discovery client with default configuration
// Assumes that http client is configured with key 'service_discovery'
enableServiceDiscovery(configurator);
```

#### Override default http client key

If the http client is configured with a different key, the key can be specified as follows:

```typescript
enableServiceDiscovery(
  configurator, 
  async(builder: ServiceDiscoveryConfigurator) => {
    builder.configureServiceDiscoveryClientByClientKey(
      // assume that http client is configured with this key
      'service_discovery_custom', 
      // optional endpoint path
      '/custom/services' 
    );
});
```

### Advanced Configuration

#### Override default http client

If a custom http client is required, the client can be configured as follows:

```typescript
enableServiceDiscovery(
  configurator, 
  async(builder: ServiceDiscoveryConfigurator) => {
    builder.configureServiceDiscoveryClient(
      // configurator callback
      async (args: ConfigBuilderCallbackArgs) => {
        // using build environment to create a http client
        const httpProvider = await requireInstance('http');
        const httpClient = httpProvider.createClient('some_key');
        return { 
          httpClient: httpProvider.createClient('some_key'),
          endpoint: '/custom/services'
        };
      }
    );
});
```

#### Setting a custom service discovery client

If a custom service discovery client is required, the client can be configured as follows:

```typescript
enableServiceDiscovery(
  configurator, 
  async(builder: ServiceDiscoveryConfigurator) => {
    builder.setServiceDiscoveryClient(
      {
        resolveServices() {
          return [
            { 
              key: 'service1', 
              url: 'http://service1.com' 
            },
            { 
              key: 'service2', 
              url: 'http://service2.com' 
            }
          ]
        },
        resolveService(key: string): Promise<ServiceEndpoint> {
          return this.services.find(s => s.key === key);
        }
      }
    );
});
```

If custom logic for creating the service discovery client is required, the client can be configured as follows:

```typescript
enableServiceDiscovery(
  configurator, 
  async(builder: ServiceDiscoveryConfigurator) => {
    builder.setServiceDiscoveryClient(
      async(args: ConfigBuilderCallbackArgs) => {
        const httpProvider = await requireInstance('http');
        const httpClient = httpProvider.createClient('my_key');
        return {
          resolveServices() {
            return httpClient.get('/services');
          },
          resolveService(key: string): Promise<ServiceEndpoint> {
            return httpClient.get(`/services/${key}`);
          }
        };
      }
    );
});
```
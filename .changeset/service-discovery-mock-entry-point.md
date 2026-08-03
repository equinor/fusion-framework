---
"@equinor/fusion-framework-module-service-discovery": minor
---

Added a `./mock` entry point exporting `mockServiceDiscovery`, `enableServiceDiscoveryMock`, `ServiceDiscoveryMockConfigurator` and `ServiceDiscoveryMockClient`, so service discovery resolves from an in-memory registry instead of the network.

```ts
import { mockServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery/mock';

mockServiceDiscovery(configurator, { services: [{ key: 'apps', uri: 'https://apps.test' }] });
```

`ServiceDiscoveryMockConfigurator` builds the registry on the builder itself — `setBaseUri`, `addService`, `addServices`, `removeService`, `setServices`, `setResolveUnknownServices` — and the client is constructed from that registry when the module builds its config. A test never has to construct a client just to add a service or point services at a local mock server.

```ts
import { enableServiceDiscoveryMock } from '@equinor/fusion-framework-module-service-discovery/mock';

enableServiceDiscoveryMock(configurator, (builder) => {
  builder.setBaseUri('http://localhost:6669');
  builder.addService({ key: 'my-api' });
});
```

`setBaseUri` lets the default service endpoints point at a local mock server such as `http://localhost:3000`, letting an application make real HTTP calls against Mockoon, Prism or the dev server without a service worker intercepting requests.

Also widened `configureServiceDiscovery` to accept a synchronous callback. The underlying builder always allowed it; only the exported type required a promise.

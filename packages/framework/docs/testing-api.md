# API

| Export | Owner | Purpose |
| --- | --- | --- |
| `mockFramework<TModules>(configure?)` | `/mock` | Build and initialize a framework instance for a test |
| `FrameworkMockConfigurator<TModules>` | `/mock` | `FrameworkConfigurator` whose outward boundaries are mocked, exposing `msal` and `serviceDiscovery` |
| `enableMsalMock(configurator, configure?)` | `-module-msal/mock` | Register the auth module with an in-process MSAL client |
| `msalMockModule` | `-module-msal/mock` | The auth module with a mock client, for manual registration |
| `MsalMockConfigurator` | `-module-msal/mock` | `MsalConfigurator` backed by a mock client (`setAccount`, `setClient`, …) |
| `MsalMockClient(config)` | `-module-msal/mock` | Build the in-process MSAL client on its own, from the same `MsalClientConfig` as `MsalClient` |
| `createMsalMockClient(config, user?)` | `-module-msal/mock` | Convenience alias for `new MsalMockClient(config)`, optionally signing a user in |
| `createMockToken(claims?)` | `-module-msal/mock` | Mint a deterministic JWT |
| `mockServiceDiscovery(configurator, options?, configure?)` | `-module-service-discovery/mock` | Replace service discovery with an in-memory registry |
| `enableServiceDiscoveryMock(configurator, configure?)` | `-module-service-discovery/mock` | Register the discovery module with an in-memory registry |
| `ServiceDiscoveryMockConfigurator` | `-module-service-discovery/mock` | `ServiceDiscoveryConfigurator` that builds an in-memory registry (`setBaseUri`, `addService`, …) |
| `ServiceDiscoveryMockClient(options?)` | `-module-service-discovery/mock` | Build the in-memory discovery client on its own |
| `defaultServiceDiscoveryMockServices` | `-module-service-discovery/mock` | Baseline services a Fusion app resolves at start-up |
| `createMockService(service, baseUri?)` | `-module-service-discovery/mock` | Expand a sparse service declaration into a full `Service` |

Module-owned exports are re-exported from `@equinor/fusion-framework/mock` for convenience; importing them from their own package is equally valid.

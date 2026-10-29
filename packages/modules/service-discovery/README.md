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

## Documentation

| Guide | Covers |
| --- | --- |
| [Configuration](./docs/configuration.md) | Custom HTTP client keys, custom clients, and replacing the discovery client |
| [Testing](./docs/testing.md) | The `/mock` entry point: an in-memory registry, local mock servers, and spying |
| [Session Overrides](./docs/session-overrides.md) | Redirecting services to local or staging URLs during development |
| [API Reference](./docs/api-reference.md) | Exports and the `Service` shape |

## Testing

Import from `@equinor/fusion-framework-module-service-discovery/mock` to resolve services from an in-memory registry instead of the service registry. The real configurator, provider and validation still run — only the boundary that would contact the registry is substituted.

```typescript
import { enableServiceDiscoveryMock } from '@equinor/fusion-framework-module-service-discovery/mock';

enableServiceDiscoveryMock(configurator);
```

Baseline services (`apps`, `people`, `context`, `bookmarks`, `notification`) resolve out of the box. The configurator owns the registry, so pointing every service at a locally running mock server takes no client:

```typescript
enableServiceDiscoveryMock(configurator, (builder) => {
  builder.setBaseUri('http://localhost:6669');
  builder.addService({ key: 'my-api' });
});
```

The entry point has **no test-runner dependency**, and ships no mocking API of its own — spying on a call is your test runner's job.

See [Testing](./docs/testing.md) for the full builder API, local-mock-server setup and runner guidance, or [`@equinor/fusion-framework/mock`](../../framework/docs/testing.md) to mock every framework boundary at once.

## Operational telemetry

When the telemetry module is available, the provider connects to it after initialization
and records one `fusion.service-discovery.resolve.duration` metric per network, fallback or
cooldown resolution, with a sanitized `.failure` exception when resolution throws.
Notifications explain where the list came from: `fusion.service-discovery.fallback` (last
known good list served instead of a failure) and `fusion.service-discovery.cooldown` (failed
fast during backoff, without a network attempt). `fusion.service-discovery.unknown-service`
marks a key that is not registered. Keys, URIs, scopes and errors are never recorded.

Cached resolutions are the bulk of lookups, so they record only a Debug-level
`fusion.service-discovery.cache-hit` event and no duration metric. Adapters that export
Information and above therefore send nothing for them.

The HTTP attempt behind a network resolution is reported by HTTP telemetry, not repeated
here. A child host that reuses its parent's client leaves reporting to the parent, so each
resolution is recorded once. Custom clients opt in by exposing `diagnostic$`, an observable of
`ServiceDiscoveryDiagnostic`.

## Key Concepts

### Inheritance

When used inside a sub-module (e.g. an Application), the Service Discovery module inherits the parent module's discovery client by default. This means:

- The child shares the parent's cache, avoiding duplicate API calls
- The child sees the same session overrides
- Breaking changes in the parent's client could affect the child

### Caching

The built-in `ServiceDiscoveryClient` caches results for **5 minutes** via `@equinor/fusion-query`. The `allow_cache` parameter on `resolveService` / `resolveServices` controls whether to return the first cached snapshot (`true`) or wait for the latest response (`false`, the default).

### Failure handling

Failed requests are never cached by `@equinor/fusion-query`, so without protection every retry, page reload, or re-render would call the service discovery API again. The built-in client hardens this:

- **Failure backoff** — after a failed request, outgoing requests pause for 1s, then 2s, 4s … up to 30s. Concurrent callers sharing one failed request count as a single failure. The pause resets on the next successful response.
- **Stale fallback** — when a refresh fails, or a call arrives during the pause, the last successful service list is returned if it is younger than 24 hours, so applications keep working through short outages.
- **Fail fast** — without a usable fallback, the request that failed rethrows its original error (for example `HttpJsonResponseError` with status `401`), and calls during the pause throw `ServiceDiscoveryUnavailableError` without touching the network. Its `cause` holds the original error and `retryAt` the time requests resume.

```typescript
import { ServiceDiscoveryUnavailableError } from '@equinor/fusion-framework-module-service-discovery';

try {
  await serviceDiscovery.resolveService('people');
} catch (error) {
  if (error instanceof ServiceDiscoveryUnavailableError) {
    // service discovery is down; error.cause is the original failure
  }
}
```

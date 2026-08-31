# Service Discovery — test double

Resolve services from an in-memory registry instead of the service registry.

```typescript
import { enableServiceDiscoveryMock } from '@equinor/fusion-framework-module-service-discovery/mock';

enableServiceDiscoveryMock(configurator);
```

Import path: `@equinor/fusion-framework-module-service-discovery/mock`. The entry point has **no test-runner dependency**.

## What is substituted

> [!IMPORTANT]
> Only `IServiceDiscoveryClient` — the object that would contact the service registry. The real `ServiceDiscoveryConfigurator`, the real `ServiceDiscoveryProvider` and the real configuration validation all still run.

That distinction is the point: a test still exercises scope resolution, HTTP client creation and module wiring, so it still catches mistakes there. A double that replaced the provider would have skipped that logic and reported whatever it was told to.

## Defaults

Baseline services resolve out of the box, so an application boots without declaring anything:

| Key | Resolves to |
| --- | --- |
| `apps` | `https://apps.fusion.test` |
| `people` | `https://people.fusion.test` |
| `context` | `https://context.fusion.test` |
| `bookmarks` | `https://bookmarks.fusion.test` |
| `notification` | `https://notification.fusion.test` |

An **undeclared** key resolves to a synthesised entry rather than throwing, so a test does not fail merely because the application resolved something the test did not think to declare. Call `setResolveUnknownServices(false)` to assert the opposite.

Resolution is deterministic across runs and machines.

## Build the registry on the builder

> [!IMPORTANT]
> You never construct a client to add a service or move services to another host. The **configurator owns the registry**; the client is built from it when the module assembles its config. Ordering of builder calls therefore does not matter.

```typescript
enableServiceDiscoveryMock(configurator, (builder) => {
  builder.setBaseUri('http://localhost:6669');
  builder.addService({ key: 'my-api' });
  builder.removeService('bookmarks');
});
```

| Method | Purpose |
| --- | --- |
| `setBaseUri(uri)` / `getBaseUri()` | Resolve every service without an explicit `uri` against this host |
| `addService(service)` / `addServices(services)` | Register services, replacing existing declarations by `key` |
| `removeService(key)` | Drop a service, including a baseline one |
| `setServices(services)` / `getServices()` | Replace the registry outright |
| `setResolveUnknownServices(boolean)` | Throw instead of synthesising unknown services |
| `configure(options)` | Apply `{ baseUri, services, resolveUnknownServices }` in one call |

A declaration only requires `key`; `uri`, `name` and `scopes` are derived from it. An explicit `uri` on a service always wins over `baseUri`.

Every method returns the builder, so calls chain.

## Running against a local mock server

`setBaseUri` is the hook for Mockoon, Prism or the Fusion dev server. With `http://localhost:6669`, `apps` resolves to `http://localhost:6669/apps`, so the application makes **real HTTP calls to a real local server**.

Nothing intercepts requests and no service worker is involved — the transport is exercised as it is in production.

```typescript
enableServiceDiscoveryMock(configurator, (builder) => {
  builder.setBaseUri('http://localhost:6669');
});
```

## Mocking an individual call

> [!IMPORTANT]
> That is your test runner's job. This module ships **no mocking API**.

The mock client is a plain class with ordinary methods, so `vi.spyOn`, `bun:test`'s `spyOn` and Node's `t.mock.method` all work on it directly — with their own call assertions, argument matchers and reset semantics, which a framework-specific API would not give you.

The provider exposes the client it resolves through, so a spy has a stable target:

```typescript
vi.spyOn(fusion.modules.serviceDiscovery.client, 'resolveService').mockResolvedValue(service);

afterEach(() => vi.restoreAllMocks());
```

## One-call shorthand

`mockServiceDiscovery` registers the module and applies options in a single call. Use it when the callback alone would be noise:

```typescript
import { mockServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery/mock';

mockServiceDiscovery(configurator, { baseUri: 'http://localhost:6669' });
```

> [!NOTE]
> The `services` option **replaces** the baseline registry. To keep the defaults and add to them, use `addService` on the builder.

## Taking full control

When resolution itself is the thing under test, register your own client — the same seam an application uses:

```typescript
enableServiceDiscoveryMock(configurator, (builder) => {
  builder.setServiceDiscoveryClient(new MyOwnDiscoveryClient());
});
```

## Exports

| Export | Purpose |
| --- | --- |
| `enableServiceDiscoveryMock(configurator, configure?)` | Register the module with an in-memory registry |
| `mockServiceDiscovery(configurator, options?, configure?)` | One-call shorthand over the above |
| `serviceDiscoveryMockModule` | The module itself, for manual registration |
| `ServiceDiscoveryMockConfigurator` | The real configurator, building an in-memory registry |
| `ServiceDiscoveryMockClient` | The in-memory client, if you need one standalone |
| `defaultServiceDiscoveryMockServices` | The baseline registry |
| `createMockService(service, baseUri?)` | Expand a sparse declaration into a full `Service` |

## Related

- [Module README](../README.md) — production configuration
- [`@equinor/fusion-framework/mock`](../../../framework/docs/testing.md) — mock every framework boundary at once

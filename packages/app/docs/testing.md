# Testing

`@equinor/fusion-framework-app/mock` runs an application's real module pipeline in
tests — the real `event`/`http`/`msal` modules, the real `AppConfigurator`
configuration pipeline, and real lifecycle — while only the boundaries that reach
outside the process (network access, credentials, a running parent portal) are
substituted with deterministic fakes. This entry point has no dependency on
Vitest or any other test runner.

```ts
import { mockAppModules } from '@equinor/fusion-framework-app/mock';

const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;
const modules = await mockAppModules(undefined, { manifest });
```

## `mockAppModules(cb, env, fusion?)`

Runs the same pipeline `configureModules` produces, against a mocked parent.
`cb` receives an `AppMockConfigurator` — which *is* an `AppConfigurator`, so
`useFrameworkServiceClient`, `configureHttpClient`, and any callback written for
a real app work against it unchanged.

- `cb` — configuration callback, or `undefined` to skip it.
- `env` — the application environment (`manifest`, `config`, `basename`).
- `fusion` — optional parent Fusion instance. Defaults to a fresh `mockFramework`
  instance with `app` already enabled and this app's own manifest and config
  served (see `enableAppManifestMock` below).

```ts
const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;

const modules = await mockAppModules(
  (configurator) => {
    configurator.useFrameworkServiceClient('portal-api');
    configurator.http.addMiddleware(async (uri, init, next) =>
      uri === 'https://portal-api.fusion.test/items' ? Response.json([{ id: 1 }]) : next(uri, init),
    );
  },
  { manifest },
);

const items = await modules.http.createClient('portal-api').json('/items');
```

The default parent's own `app` module (not `mockAppModules`'s returned `modules`)
only resolves `env.manifest`/`env.config` locally for `env.manifest.appKey` —
setting the current app to any other key falls through to whatever the parent's
real `app` module would do (a real service-discovery-resolved request, or
nothing if `serviceDiscovery` was never pointed anywhere):

```ts
import type { Fusion } from '@equinor/fusion-framework';
import type { AppModule } from '@equinor/fusion-framework-module-app';

await mockAppModules(async (_configurator, { fusion }) => {
  // the default parent always has `app` enabled; cast narrows the module set
  // for callers that pass in a parent without it
  const { app } = (fusion as Fusion<[AppModule]>).modules;

  app.setCurrentApp(env.manifest.appKey);
  await app.current?.getManifestAsync(); // resolves with env.manifest

  app.setCurrentApp('some-other-app');
  await app.current?.getManifestAsync(); // rejects — not this app's own manifest
}, env);
```

## `enableAppManifestMock(configurator, env)`

Registers the `app` module on a parent `mockFramework` configurator, serving
`env.manifest` and `env.config` for this app's own `appKey` while delegating
every other request — other app keys, tagged requests, builds, settings — to
whatever client service discovery (or a pre-configured http client) would really
resolve. `mockAppModules` uses this to build its zero-config default parent;
call it directly when a test needs to customize `serviceDiscovery` (e.g. point
it at a real local mock server) while keeping this app's own manifest and
config servable.

```ts
import { mockFramework } from '@equinor/fusion-framework/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableAppManifestMock, mockAppModules } from '@equinor/fusion-framework-app/mock';

const env = { manifest: { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const };

const fusion = await mockFramework<[AppModule]>((configurator) => {
  configurator.serviceDiscovery.setBaseUri('http://localhost:9999');
  enableAppManifestMock(configurator, env);
});

const modules = await mockAppModules(undefined, env, fusion);
```

## `AppMockConfigurator`

The configurator type passed to `mockAppModules`'s `cb`. It extends the real
`AppConfigurator`, so any configuration code written against a real app — named
HTTP clients, service-discovery clients, bookmark setup — works unchanged
against it in a test.

## Related

- [`@equinor/fusion-framework/mock`](../../framework/docs/testing.md) — mock every framework boundary at once, for building a custom parent `fusion` instance.
- [`@equinor/fusion-framework-module-app/mock`](../../modules/app/README.md) — the lower-level `MockAppClient` this package's mock wiring is built on.

# Develop with mock services

Use `@equinor/fusion-framework-cli-plugin-mock-server` when a Fusion application needs a local,
deterministic, or not-yet-deployed backend. The plugin adds `ffc mock-server`; it does not change
the base dev-server runtime or start a background process automatically.

The recommended application workflow has three parts:

1. Create `mocks/<service>.mock.ts` with `defineService`.
2. Run `ffc mock-server` in a foreground terminal.
3. Run `ffc app dev` for real discovery plus local overrides, or `ffc app dev --mock` for an
  isolated mock environment.

> [!IMPORTANT]
> Keep service mock behavior in `<service>.mock.ts`, not `dev-server.config.ts`. The executable
> module is reusable by local development, Playwright, and the programmatic mock server. Reserve
> `api.routes` and `api.processServices` for advanced server infrastructure and discovery
> transformations that are not service mocks.

## Install and start the mock server

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-mock-server
ffc mock-server
```

> [!IMPORTANT]
> Keep this foreground process running in one terminal and start the application in another. The
> plugin intentionally does not create an unowned background process.

Check that startup completed before connecting the app:

```sh
curl http://localhost:4010/@fusion-mock/health
```

> [!TIP]
> Use the health endpoint as the `url` readiness check in Playwright's `webServer` configuration.

## Define one executable module per service

```text
mocks/
  inventory.mock.ts
  inventory.openapi.json
```

```typescript
import schema from './inventory.openapi.json' with { type: 'json' };
import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

export default defineService({
  key: 'inventory',
  serviceDiscovery: 'new',
  schema,
  components: {
    InventoryItem: { name: () => 'Local item' },
  },
});
```

The module keeps service ownership, schema, deterministic fields, routes, and middleware in one
retrieval-friendly place.

This example uses `'new'` because `inventory` is not registered yet; startup fails if the key later
appears in real discovery. Use `'merge'` when the service already exists and only selected local
behavior should change.

## Choose the development mode

### Combine real discovery with selected local services

```sh
ffc mock-server
ffc app dev --env dev
```

Normal development fetches real discovery and overlays discovery-visible local definitions by
service key. Use this when most real backends remain useful.

### Use only predefined and local mocks

```sh
ffc mock-server
ffc app dev --env dev --mock http://localhost:4010
```

`--mock` points application discovery at the standalone server. The mock server never fetches real
service discovery; it resolves only bundled presets and local modules. Use this for isolated
development, CI, and browser tests.

> [!WARNING]
> `--mock` is intentionally isolated. A service missing from the bundled presets and local modules
> will not fall back to remote service discovery.

A preset is a built-in group of service definitions. The default `fusion` preset supplies common
services that framework modules resolve during startup. Local modules are layered after presets,
so app-specific behavior can override the baseline.

## Choose a discovery mode

| Mode | Developer scenario |
| --- | --- |
| `'merge'` | Override selected behavior of an existing discovered or preset service while inheriting its schema. |
| `'new'` | Add a pre-production service expected to enter real discovery before release. Definition resolution fails if the key already exists in discovery or an earlier mock layer. |
| `'replace'` | Supply a complete local definition and deliberately replace an earlier same-key definition. |
| `false` | Serve an app-owned endpoint without advertising it through discovery. Configure its `<key>.localhost` mock URL directly in environment-specific app config. |

> [!CAUTION]
> Use `'new'` only as a temporary pre-production contract. Once the real service key appears,
> definition resolution fails on purpose; register the backend before release and remove or change
> the local definition.

For example, a service with key `my-api` and `serviceDiscovery: false` is still served at
`http://my-api.localhost:4010`; it is simply absent from `/@fusion-mock/discovery`. This mirrors an
application-owned API URL that production configuration supplies directly.

Register that URL through the app's environment-specific `endpoints` configuration. The
[HTTP-client guide](../../app/docs/http-clients.md#mock-an-application-config-endpoint-locally)
contains the complete `app.config.dev.ts` recipe and restart caveat.

## Configure shared defaults

```typescript
import type {} from '@equinor/fusion-framework-cli-plugin-mock-server';
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(() => ({
  mockServer: {
    path: 'mocks',
    host: 'localhost',
    port: 4010,
    seed: 42,
  },
}));
```

Command-line flags override these defaults. `path` is relative to the project root.

## Test in a real browser

Use Playwright's `webServer` array to own both foreground processes and stop them after the suite.
The mock server exposes HTTP endpoints for per-test operation overrides and reset.

See the [plugin reference](../../cli-plugins/mock-server/README.md), [OpenAPI mock-server guide](../../utils/openapi-mock-server/docs/getting-started.md), and [Playwright cookbook](../../../cookbooks/app-react-mock-playwright/README.md).
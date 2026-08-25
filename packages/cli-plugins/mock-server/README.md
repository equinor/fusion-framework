# @equinor/fusion-framework-cli-plugin-mock-server

Optional Fusion Framework CLI plugin for running local OpenAPI-backed services with
`ffc mock-server`. Use it when development or browser tests need deterministic APIs, an
unavailable backend, or a service that has not entered Fusion service discovery yet.

> [!IMPORTANT]
> The command runs a standalone foreground HTTP server. It never fetches remote service discovery
> and never starts automatically with `ffc app dev`.

## Quick start

Install the plugin:

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-mock-server
```

Create one executable module per service:

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

This file is the service mock. Do not duplicate the service in `dev-server.config.ts` with
`api.routes` or `api.processServices`; those low-level hooks are not required for the normal mock
workflow.

`'new'` models a pre-production service and rejects collisions if the key becomes registered. See
[Choose a discovery mode](../../dev-server/docs/mocking.md#choose-a-discovery-mode) for existing
services, pre-production services, and direct-only app endpoints.

Start the server manually:

```sh
ffc mock-server
```

Installing the package makes the command available through the Fusion CLI. If the plugin is not
installed, `ffc mock-server` prints an installation hint. Explicit `mockServerPlugin()`
registration remains useful when `fusion-cli.config.ts` supplies command defaults.

## Connect an application

Keep the mock server running, then choose one app-development mode in another terminal:

```sh
# Keep real discovery and overlay selected local definitions
ffc app dev --env dev

# Use only bundled presets and local mock definitions
ffc app dev --env dev --mock http://localhost:4010
```

The standalone server uses only configured presets and local modules. `--mock` therefore gives an
isolated environment with no remote discovery dependency.

> [!WARNING]
> `ffc app dev --mock` does not fall back to real service discovery. Include every service the app
> needs through a preset or local mock module.

See [Develop with mock services](../../dev-server/docs/mocking.md) for discovery modes,
direct-only endpoints, and the difference between normal and isolated development.

## Configure defaults

The plugin augments `DevServerOptions` with a typed `mockServer` section. Import its types in
`dev-server.config.ts` so TypeScript loads the augmentation:

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

Command-line arguments override config defaults. `path` is relative to the project root.

> [!TIP]
> Put shared team defaults in `dev-server.config.ts`; reserve command-line flags for temporary
> local or CI overrides.

Register the plugin explicitly when command defaults belong in `fusion-cli.config.ts`:

```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';
import mockServerPlugin from '@equinor/fusion-framework-cli-plugin-mock-server';

export default defineFusionCli(() => ({
  plugins: [mockServerPlugin({ preset: ['fusion'], port: 4010 })],
}));
```

## Command reference

```text
ffc mock-server [dirs...] [options]
```

| Argument or option | Behavior |
| --- | --- |
| `[dirs...]` | Directories of `<name>.mock.ts` modules in ascending precedence. Later definitions are resolved by service key and discovery mode. |
| `--preset <name>` | Bundled preset layered before local directories. Repeatable; defaults to `fusion`. The first explicit flag replaces the default. |
| `--port <port>` | Listening port. Uses config, then plugin defaults, then `4010`. |
| `--host <host>` | Bind hostname. Uses config, then plugin defaults, then `localhost`. |
| `--seed <seed>` | Deterministic seed for generated OpenAPI responses. Without a seed, generated values are random. |

The process shuts down on `SIGINT` and `SIGTERM`. Let Playwright `webServer`, `concurrently`, or a
developer terminal own it instead of starting an unowned background process.

## Related documentation

- [OpenAPI mock-server getting started](../../utils/openapi-mock-server/docs/getting-started.md)
- [Testing with Playwright](../../utils/openapi-mock-server/docs/testing-with-playwright.md)
- [Mock API and Playwright cookbook](../../../cookbooks/app-react-mock-playwright/README.md)

## License

ISC

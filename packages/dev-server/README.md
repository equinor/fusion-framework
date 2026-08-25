# @equinor/fusion-framework-dev-server

Development server primitives for Fusion Framework applications. The package combines Vite,
React Fast Refresh, SPA environment injection, Fusion service discovery, and local API proxying.

> [!TIP]
> Most application developers should start with `ffc app dev`. Use this package directly when you
> are building framework tooling, a custom development command, or a Vite integration that needs
> control over server creation.

## Choose your entry point

| Goal | Start here |
| --- | --- |
| Run a Fusion application locally | `ffc app dev` from `@equinor/fusion-framework-cli` |
| Create and start a configured Vite server | `createDevServer(options, overrides?)` |
| Generate Vite configuration without starting a server | `createDevServerConfig(options, overrides?)` |
| Customize service discovery proxy routes | `processServices(data, args)` |
| Develop against local OpenAPI mocks | [`@equinor/fusion-framework-cli-plugin-mock-server`](../cli-plugins/mock-server/README.md) |

## Quick start

```sh
pnpm add -D @equinor/fusion-framework-dev-server vite
```

```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';

const server = await createDevServer({
  spa: {
    templateEnv: {
      portal: { id: 'my-portal' },
      title: 'My application',
      serviceDiscovery: {
        url: 'https://service-discovery.example.com',
        scopes: ['api://example.com/user_impersonation'],
      },
      msal: {
        clientId: 'client-id',
        tenantId: 'tenant-id',
        redirectUri: '/authentication/login-callback',
        requiresAuth: 'true',
      },
    },
  },
  api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' },
});

await server.listen();
server.printUrls();
```

The browser receives `spa.templateEnv`. The Node development server uses
`api.serviceDiscoveryUrl` to fetch service definitions and create same-origin proxy routes. These
two URLs often point to the same endpoint, but they serve different consumers.

Continue with [Getting started](docs/getting-started.md) for the complete mental model.

## Mock APIs locally

Install the optional mock-server plugin when a backend is unavailable, unstable, or needs
deterministic responses:

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-mock-server
ffc mock-server ./mocks --port 4010
```

> [!IMPORTANT]
> `ffc mock-server` is a standalone foreground process. Installing the plugin does not start it
> with `ffc app dev`; the developer or test runner owns its lifecycle.

The plugin adds typed `mockServer` settings to `DevServerOptions` only when its types are imported,
keeping this base package independent of optional mocking tools.

See [Develop with mock services](docs/mocking.md) for normal development overlays, isolated
`--mock` mode, direct-only services, and executable `<name>.mock.ts` modules.

## Learn in order

1. [Getting started](docs/getting-started.md) explains the server lifecycle and smallest useful setup.
2. [Configure the dev server](docs/configuration.md) covers SPA environment, API proxying, and logging.
3. [Develop with mock services](docs/mocking.md) shows the recommended optional mocking workflow.
4. [Advanced usage](docs/advanced.md) covers service processing, routes, Vite overrides, and extension interfaces.
5. [Troubleshooting](docs/troubleshooting.md) maps common symptoms to the responsible configuration.

## Public API

- `createDevServer` creates a configured `ViteDevServer`. Call `listen()` yourself.
- `createDevServerConfig` returns a Vite `UserConfig` for another tool to consume.
- `processServices` rewrites discovered service URIs through the local proxy and returns routes.
- `DevServerOptions<TEnv>` configures SPA injection, API discovery, and logging. It is an interface so optional plugins can augment it.
- `FusionService` describes a backend using `key`, `uri`, `name`, and optional OAuth `scopes`.

## Requirements and boundaries

- Vite 7 or 8 is required as a peer dependency.
- `api.serviceDiscoveryUrl` is required by the low-level API.
- The package configures development; it does not build or publish applications.
- Mock-server installation and process lifecycle are optional and external to this package.

## License

ISC
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

## Send app telemetry to a local OTLP collector

From your application repository, set the environment variable when starting the dev server:

```sh
FUSION_DEV_SERVER_OTLP_ENDPOINT=http://localhost:4318 pnpm exec ffc app dev
```

No app code or `DevServerOptions` changes are needed. The telemetry module's `OtlpAdapter` uses
the standard OpenTelemetry OTLP/HTTP log exporter through a same-origin dev-server route. App records
include `fusion.app.key` and `source: app`; shell records use `source: framework`.

Browser fetch/XHR spans are also exported. W3C `traceparent` and `tracestate` headers connect
requests to instrumented backends, and logs emitted under an active span carry its trace/span IDs.
The same collector URL configures `/v1/logs` and `/v1/traces`.

An app's explicitly configured telemetry adapters take precedence, so its records are not also
exported by the dev-server fallback. An unset variable leaves telemetry unchanged, and production
builds never enable this integration. Collector failures are reported once in the dev-server
terminal without breaking the app.

See [OTLP environment configuration](docs/configuration.md#send-telemetry-to-an-otlp-endpoint)
for the endpoint contract and boundaries.

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
`--mock` mode, direct-only services, and executable `<name>.mock.ts` modules. To verify an app's
help button opens the right article, see
[Test help articles locally](../utils/openapi-mock-server/docs/testing-help-articles.md). To check
the analytics an app tracks, see
[Test analytics locally](../utils/openapi-mock-server/docs/testing-analytics.md).

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
- Every request the dev server proxies upstream (service discovery and API routes) carries
  `X-Fusion-Dev-Server-Name` and `X-Fusion-Dev-Server-Version`, so upstream telemetry can tell
  local development traffic apart. Add more with `api.headers`; `ffc` adds `X-Fusion-Mock: true|false`.
- The package configures development; it does not build or publish applications.
- Mock-server installation and process lifecycle are optional and external to this package.

## License

ISC
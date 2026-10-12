# Configure the dev server

`DevServerOptions<TEnv>` has three base sections: `spa`, `api`, and `log`. Start with required
`api.serviceDiscoveryUrl`, then add browser environment and logging when your host needs them.

## Configure the browser environment

`spa.templateEnv` can be a static object or a function. The SPA plugin serializes its value into
the page for browser-side Fusion modules.

```typescript
const options = {
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
};
```

Use a factory when values come from a runtime source:

```typescript
const options = {
  spa: {
    templateEnv: () => ({
      title: 'Local application',
      telemetry: { consoleLevel: 0 },
    }),
  },
};
```

Browser telemetry and server logging use different scales. `telemetry.consoleLevel` controls the
browser console; `log.level` controls terminal output.

## Send telemetry to an OTLP endpoint

Set `FUSION_DEV_SERVER_OTLP_ENDPOINT` in the environment of the process that starts the dev
server. This works with `ffc app dev`, `createDevServer`, and `createDevServerConfig`; the app
does not need to call `enableTelemetry` or register an exporter.

```sh
FUSION_DEV_SERVER_OTLP_ENDPOINT=http://localhost:4318 pnpm exec ffc app dev
```

| Setting | Contract |
| --- | --- |
| `FUSION_DEV_SERVER_OTLP_ENDPOINT` | OTLP/HTTP collector base URL, optionally ending in `/v1/logs` or `/v1/traces`. The dev server derives both signal paths, preserving a collector path prefix. HTTP and HTTPS only; no embedded credentials. |
| Unset or empty | No dev-server exporter or collection route is enabled. |
| Production builds | The Vite environment bridge applies only to `serve`; production does not receive its endpoints. The SPA bootstrap only checks whether an endpoint is configured. |
| App identity | App records include the manifest's `fusion.app.key` and `source: app`. Shell records use `source: framework`. |
| Precedence | Any explicitly registered app telemetry adapter, including a console adapter, takes precedence over the dev-server fallback for that app's records. Metadata, scopes, and filters alone do not suppress the fallback. Existing adapters and relay behavior are preserved. |
| Collector failure | Requests time out after five seconds. Network errors and unsuccessful HTTP statuses produce a single terminal error per dev-server instance; later records can still be delivered if the collector recovers. The browser exporter reports its first failure as a warning. |

The SPA bootstrap configures `OtlpAdapter` from
`@equinor/fusion-framework-module-telemetry/otlp-adapter` as a fallback on the framework telemetry
provider. App telemetry already relays there with its manifest metadata. The adapter uses the
standard `@opentelemetry/exporter-logs-otlp-http` exporter. The browser sends logs and spans to
`/@fusion-telemetry/v1/logs` and `/@fusion-telemetry/v1/traces`; Node forwards them to the
collector's corresponding signal paths, so the collector does not need browser CORS support.
No authentication is added.

Logs and spans use bounded OpenTelemetry batch processors: up to 128 records per batch,
a 2,048-record queue, and a one-second scheduled export delay. This keeps bootstrap bursts
below the exporter's concurrent-request limit. Telemetry remains best effort; a full queue
can drop records, and closing the browser abruptly can lose buffered work.

### Connect frontend and backend traces

The environment-enabled SPA initializes standard OpenTelemetry fetch, XMLHttpRequest, and
document-load instrumentation, plus a W3C trace-context propagator. Outgoing same-origin API
requests carry `traceparent` and `tracestate`. The service worker preserves these headers when
rewriting requests, and the dev-server API proxy forwards them to the backend.

An OpenTelemetry-instrumented backend must extract that context and export its server spans to
the same collector. Frontend HTTP spans and backend server spans then share a trace ID; backend
logs can carry the server span ID, and frontend logs emitted within an active span carry the
frontend span ID. This enables navigation from logs to the shared trace in either direction.
Logs emitted outside an active span remain standalone logs.

For backend-initiated document traces, the backend-rendered HTML can include
`<meta name="traceparent" content="00-<trace-id>-<server-span-id>-01">`. Standard document-load
instrumentation continues that trace. Ordinary HTTP response headers do not automatically
change the parent context of subsequent browser work.

Tracing uses a zone context manager for callbacks and promise chains. Native `async`/`await`
code may require explicit context binding to retain an application-created span; the feature
does not rewrite application code. Instrumentation excludes telemetry collection and Vite
internal requests to avoid self-tracing loops. Cross-origin third-party requests do not receive
trace headers by default, avoiding unconfigured CORS preflights or trace-context leakage.

An already registered global tracer provider remains authoritative and is not overwritten.
Backend instrumentation is a prerequisite; enabling the frontend alone cannot create backend
spans. This package does not modify backend services.

This exports Fusion telemetry records (events, exceptions, metrics represented as log records,
and custom telemetry), not arbitrary calls to `console.log`. Console display thresholds do not
filter the OTLP exporter. The integration uses the default SPA bootstrap; a custom bootstrap
continues to own its telemetry setup.

Application Insights ingestion, analytics exporters, and Fusion HTTP client configuration are
unchanged.

## Configure service discovery and proxying

`api.serviceDiscoveryUrl` is the upstream endpoint the Node server fetches. The default
`processServices` rewrites each discovered URI to the local origin and creates a proxy route.

> [!WARNING]
> `spa.templateEnv.serviceDiscovery.url` configures the browser, while
> `api.serviceDiscoveryUrl` configures the Node proxy. Setting only one can produce a page that
> loads successfully but cannot resolve or proxy services.

```typescript
const options = {
  api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' },
};
```

Add `api.routes` for a small server-owned endpoint:

```typescript
const options = {
  api: {
    serviceDiscoveryUrl: 'https://service-discovery.example.com',
    routes: [
      {
        match: '/health',
        middleware: (_request, response) => {
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ status: 'ready' }));
        },
      },
    ],
  },
};
```

Prefer executable `mocks/<service>.mock.ts` modules from the
[mock-server guide](mocking.md) for local services. Reserve `api.routes` for server-owned behavior
that is not a service mock; do not reproduce OpenAPI operations as handwritten dev-server
middleware.

## Configure terminal logging

```typescript
const options = {
  api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' },
  log: { level: 4 },
};
```

Server levels are `0` None, `1` Error, `2` Warning, `3` Info, and `4` Debug. Info is the default.
Supply `log.logger` when a host already owns a configured `ConsoleLogger` hierarchy.

## Extend configuration from optional plugins

`DevServerOptions` is an interface so optional packages can contribute configuration without the
base package depending on them. Importing the mock-server plugin types adds `mockServer`:

```typescript
import type {} from '@equinor/fusion-framework-cli-plugin-mock-server';
import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

const options: DevServerOptions = {
  api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' },
  mockServer: { path: 'mocks', port: 4010, seed: 42 },
};
```

> [!TIP]
> This empty type import activates TypeScript declaration merging: it adds `mockServer` to
> `DevServerOptions` for type checking without producing a runtime import.
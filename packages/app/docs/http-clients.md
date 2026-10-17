# Configure HTTP Clients

The `AppConfigurator` can register named HTTP clients from several sources.
You retrieve a client at runtime with `framework.modules.http.createClient(name)`.

## From Application Config (auto-registration)

Endpoints defined in `app.config.<env>.ts` are **automatically registered as
named HTTP clients** when the `AppConfigurator` is created — no extra code
needed in `config.ts`.

```ts
// app.config.ts
import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig(() => ({
  endpoints: {
    schedule: {
      url: 'https://schedule-api.example.com',
      scopes: ['api://schedule-id/.default'],
    },
  },
}));
```

After initialization, use the client directly:

```ts
const client = framework.modules.http.createClient('schedule');
const data = await client.json('/items');
```

### Mock an application-config endpoint locally

Use a direct-only executable service when an app-owned endpoint needs a local OpenAPI mock but
must not appear in service discovery:

```ts
// mocks/my-api.mock.ts
import schema from './my-api.openapi.json' with { type: 'json' };
import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

export default defineService({
  key: 'my-api',
  serviceDiscovery: false,
  schema,
});
```

Point the development environment at the service's `<key>.localhost` origin:

```ts
// app.config.local.ts
import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig(() => ({
  endpoints: {
    'my-api': {
      url: 'http://my-api.localhost:4010',
    },
  },
}));
```

Start both foreground processes:

```sh
ffc mock-server
ffc app dev
```

`serviceDiscovery: false` keeps `my-api` out of discovery while the mock server continues serving
it directly. The mock server handles browser CORS for these per-service origins, so this workflow
does not require an `/@fusion-api` proxy route or handwritten `dev-server.config.ts` middleware.
Restart `ffc app dev` after changing `app.config.<env>.ts`; application config files are resolved at
startup rather than watched for changes.

The `--mock` flag is optional here. It changes where service discovery comes from, but the
app-owned `endpoints` entry remains explicit in application config. See
[Develop with mock services](../../dev-server/docs/mocking.md) for discovery modes and isolated
mock development.

## Via Service Discovery

```ts
const initialize = configureModules((configurator) => {
  configurator.useFrameworkServiceClient('people');
});
```

## Explicit Registration

Use `configureHttpClient` in `config.ts` when the endpoint is **not** in
`app.config.ts`, or when you need custom transport behavior such as headers,
response guards, or a custom client class.

```ts
configurator.configureHttpClient('custom-api', {
  baseUri: 'https://custom.api.example.com',
  defaultScopes: ['api://custom-id/.default'],
  onCreate: (client) => {
    client.requestHandler.setHeader('X-Source', 'portal');
  },
});
```

## Resolution Priority

When the same client name is configured in more than one place, the
highest-priority source wins:

| Priority | Source | Example |
|----------|--------|---------|
| 1 (highest) | **Session overrides** | User-specific URL / scopes set at runtime via `sessionStorage` |
| 2 | **Application config endpoints** | `endpoints` in `app.config.ts` |
| 3 | **Service-discovery registry** | Resolved via `useFrameworkServiceClient` |
| 4 (lowest) | **Explicit registration** | `configureHttpClient(name, options)` in `config.ts` |

This means an endpoint defined in `app.config.ts` will override a
`configureHttpClient` call for the same name, and a session override will
override both.

## App Identification Headers

Requests from the app's HTTP clients carry headers that tell backend services
which app made the call:

| Header | Value |
|--------|-------|
| `x-fusion-app` | `appKey` from the app manifest |
| `x-fusion-app-version` | `build.version` from the app manifest, when present |
| `x-fusion-framework-version` | Version of `@equinor/fusion-framework-app` |

Services using `Fusion.Infrastructure.Diagnostics` record these on their request
telemetry (`x-fusion-app` becomes the `fusion.app` tag), so traffic, errors, and
latency can be attributed to a single app.

Custom headers trigger a CORS preflight, so by default they are only sent to
origins known to accept them: the portal origin and the hosts listed in Fusion
service discovery. Requests to any other origin are sent unchanged. Headers set
explicitly on a request are never overwritten.

Session overrides of service URLs (typically a PR slot) are tagged too, since
they are Fusion-hosted. If service discovery does not answer within two
seconds, app startup continues and only the portal origin and `allowedOrigins`
are tagged.

Opt in your own backend once it allows the headers in CORS, or turn
identification off:

```ts
const initialize = configureModules((configurator) => {
  configurator.configureAppIdentification({
    allowedOrigins: ['https://my-backend.example.com'],
  });

  // or, to stop sending the headers entirely
  configurator.configureAppIdentification({ enabled: false });
});
```

Only clients created through the app's own HTTP module are tagged. Clients with
a custom `requestHandler`, portal-level modules, and raw `fetch` calls are not.

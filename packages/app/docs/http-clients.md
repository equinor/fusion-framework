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

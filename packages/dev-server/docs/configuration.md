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
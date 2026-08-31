# Advanced usage

Use these extension points after the default discovery proxy and SPA environment work. Most
applications do not need custom service processing.

> [!IMPORTANT]
> These are not the primary service-mocking APIs. Define application mocks in
> `mocks/<service>.mock.ts` with `defineService`; use `processServices` only when a host must
> transform real discovery independently of mock behavior.

## Transform discovered services

Call `processServices(data, args)` first, then transform its result. This preserves standard local
URI rewriting and proxy route generation.

```typescript
import { createDevServer, processServices } from '@equinor/fusion-framework-dev-server';

const server = await createDevServer({
  api: {
    serviceDiscoveryUrl: 'https://service-discovery.example.com',
    processServices: (data, args) => {
      const processed = processServices(data, args);
      return {
        ...processed,
        data: processed.data.filter((service) => service.key !== 'deprecated-service'),
      };
    },
  },
});
```

Throwing from a processor fails the discovery request. Validate upstream assumptions instead of
silently returning a partial service list.

> [!CAUTION]
> A custom processor replaces the default processing entry point. Call `processServices` first
> unless you intend to own all URI rewriting and proxy-route generation yourself.

## Add Vite configuration

The second argument is merged over generated Vite configuration:

```typescript
import { createDevServer } from '@equinor/fusion-framework-dev-server';
import myPlugin from 'my-vite-plugin';

const server = await createDevServer(
  { api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' } },
  {
    plugins: [myPlugin()],
    server: { host: '0.0.0.0', port: 3001 },
  },
);
```

Prefer first-class `spa`, `api`, and `log` options when they cover the requirement. Use overrides
for Vite-owned behavior and additional plugins.

## Own the Vite lifecycle

Use `createDevServerConfig` when a test harness or larger CLI creates Vite itself:

```typescript
import { createDevServerConfig } from '@equinor/fusion-framework-dev-server';
import { createServer } from 'vite';

const config = createDevServerConfig({
  api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' },
});
const server = await createServer(config);
await server.listen();
```

## Extend `DevServerOptions`

Optional tooling can use declaration merging because `DevServerOptions` is an interface. Keep the
augmentation in the owning plugin and import that plugin's types where extended options are
authored. The mock-server plugin's `mockServer` section is the reference implementation.
# Getting started

<!-- cspell:words rolesv -->

A `mocks/` directory of `<name>.mock.ts` modules is all this package needs. Each module defines
one service and imports the OpenAPI schema used to fake its responses. The same mocks work for
local development, Playwright, or an embedded server.

> [!TIP]
> Fusion application developers should install
> `@equinor/fusion-framework-cli-plugin-mock-server`, run `ffc mock-server`, and connect with
> `ffc app dev` or `ffc app dev --mock`. The programmatic APIs below are for test harnesses and
> hosts that need to own the HTTP server lifecycle directly.

## Define your first service

Add one `<name>.mock.ts` module per service:

```
mocks/
  context.mock.ts
  context.openapi.json
```

```ts
import schema from './context.openapi.json' with { type: 'json' };
import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

export default defineService({
  key: 'context',
  serviceDiscovery: 'replace',
  schema,
  components: { Context: { title: () => 'Local context' } },
});
```

The service is reachable at `/context` or `context.localhost:<port>`. `routes` declares fixed or
function-backed operation responses, and `middleware` registers request-aware routes.

## Start the server

```bash
pnpm exec fusion-mock ./mocks --port 4010

# layered: bundled Fusion baseline first, app overrides last
pnpm exec fusion-mock --preset=fusion ./mocks --port 4010
```

| Argument/Option | Description |
| --- | --- |
| `[dirs...]` | Directories of `<name>.mock.ts` modules, in ascending precedence. |
| `--preset=<name>` | Bundled preset to layer in (e.g. `--preset=fusion`); repeatable. |
| `--port <port>` | Port to listen on (default: OS-assigned). |
| `--seed <seed>` | Seeds every service's faked responses, so the same document/fields/seed always fake the same values (default: unseeded/random). |

When no directory or preset is supplied, the CLI uses `./mocks`. The CLI binds to `localhost`;
use the programmatic `start({ host })` option when another bind address is required.

Runs in the foreground and shuts down on `SIGINT`/`SIGTERM` — pair it with Playwright's
`webServer` (or `concurrently`), rather than running it in the background yourself, so nothing
owns a process it isn't also responsible for stopping.

Or start it from your own code — this mirrors Mock Service Worker's
`setupServer()`/`server.use()`: register sources, then start once.

```ts
import { createMockServer } from '@equinor/fusion-openapi-mock-server';

const server = createMockServer({ seed: 42 }).use('./mocks');
const { url } = await server.start({ host: 'localhost', port: 4010 });
// url -> 'http://localhost:4010'

await server.close();
```

Call `use()` before `start()` or the first `requestListener` request. `start()` rejects when the
host or port cannot be bound; `close()` is safe to call repeatedly and clears `server.url`.

Either way, this exposes a service-discovery response at
`http://localhost:4010/@fusion-mock/discovery` that any Fusion framework module can resolve
services from.

## The bundled Fusion baseline preset

A Fusion app's framework modules resolve several service-discovery keys during startup and may
fail when mandatory services are missing. The bundled `fusion` preset provides `app-state`,
`apps`, `bookmarks`, `context`, `notification`, `people`, `portal-config`, and `rolesv2`, including
schema-backed operations for common application flows:

```ts
const server = createMockServer().use('fusion').use('./mocks');
```

## Layering directories

Call `use()` once per source, in ascending precedence. Later sources are resolved according to each
service's discovery mode: `replace` replaces an earlier same-key service, while `merge` inherits
and customizes the earlier definition without copying its schema:

```mermaid
flowchart LR
    A["use('fusion')<br/>baseline preset"] --> C[Merged service set]
    B["use('./mocks')<br/>app mock modules"] --> C
    C -->|"replace or merge by key"| D["resolved local services"]
```

This also makes it easy to compose multiple teams' mocks, or layer a shared platform directory
underneath an app-specific one, without either side needing to know about the other.

A module with `serviceDiscovery: 'merge'` may omit `schema`; its `components`, `routes`, and
`middleware` merge onto the nearest earlier same-key service. Startup fails when no earlier
local or preset definition exists. The standalone mock server never fetches upstream service
discovery.

## Choose an override mechanism

Use the narrowest mechanism that expresses the behavior you need:

| Mechanism | Use it for | Runtime override behavior |
| --- | --- | --- |
| OpenAPI schemas | Generated baseline responses for normal service operations. | Can be replaced by operation ID. |
| `defineService.components` | Field faker values or faker functions. | Feeds the generated baseline. |
| `defineService.routes` | Static or function-backed operation responses. | Becomes the reset baseline and can still be replaced by operation ID. |
| `defineService.middleware` | Custom routes or request-aware behavior outside the OpenAPI operation model. | Runs before generated mocks, so runtime operation overrides do not replace it. |

Programmatic middleware receives a service-relative URL for both `/<service>/*` and
`<service>.localhost/*` requests. The context includes the parsed JSON body and the server-level
seed:

```ts
import { createService } from '@equinor/fusion-openapi-mock-server/discovery';

const people = createService('people', peopleDocument).middleware((router) => {
  router.post('/people-picker/resolve', (_req, res, { body, seed }) => {
    res.json({ body, seed });
  });
});

const server = createMockServer({ seed: 42 }).use([people]);
```

## Point your app at it

For a Fusion app running through `@equinor/fusion-framework-cli`, use `ffc app dev --mock`:

```bash
ffc app dev --mock http://localhost:4010
```

This rewrites the app's service-discovery URL to the mock server's `/@fusion-mock/discovery`
endpoint, so every framework module that resolves a service by key transparently gets the mock's
origin instead of the real one. The CLI also enables mock authentication with `Test User`; see
[Generate a mock user and update `.env`](../../../vite-plugins/spa/README.md#generate-a-mock-user-and-update-env)
to customize identity claims and token scopes.
[`@equinor/fusion-framework-cli-plugin-mock-server`](../../../cli-plugins/mock-server/README.md)
wraps the same server as `ffc mock-server`, so you don't need a separate binary installed either.

## Embedding into an existing server

To serve mocks from a port you already own instead of a separate one, mount the plain
`(req, res)` request handler — it needs no Express (or any other framework) dependency, and works
without ever calling `start()`:

```ts
import { createServer } from 'node:http';
import { createMockServer } from '@equinor/fusion-openapi-mock-server';

const mocks = createMockServer().use('./mocks');
const app = createServer((req, res) => {
  // Handle application-owned routes first, then let the mock server own
  // /@fusion-mock/* and /<service>/* unchanged.
  if (req.url === '/ready') {
    res.writeHead(200).end('ready');
    return;
  }
  mocks.requestListener(req, res);
});
```

`requestListener` expects `/@fusion-mock/*` and `/<service>/*` at the root. If another framework
mounts it below a prefix such as `/mocks`, strip that prefix before delegating the request.

## Where to go next

Once the server is running, see [Testing with Playwright](testing-with-playwright.md) for
overriding a single operation's response for one test, and for the full route reference.

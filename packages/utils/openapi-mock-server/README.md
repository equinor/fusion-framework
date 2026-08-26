# @equinor/fusion-openapi-mock-server

A standalone HTTP server for [`@equinor/fusion-openapi-mock`](../openapi-mock): it serves every
service it discovers from a directory of OpenAPI specs at its own address, so a test runner (e.g.
Playwright) can point service discovery at one origin and drive per-test overrides directly over
HTTP — no Vite or dev-server process involved.

## When to use this package

- You want a mock backend you can start and stop independently of your app's build tool (Vite,
  a bundled/staged build, or plain Playwright).
- You want Playwright tests to override a specific service's response for one test (e.g. "context
  resolution fails"), then reset back to the generated baseline afterward.
- You already have `@equinor/fusion-openapi-mock` specs and want them served over HTTP instead of
  wired into dev-server middleware.

## Installation

```bash
pnpm add -D @equinor/fusion-openapi-mock-server
```

## Quick start

```ts
import { createMockServer } from '@equinor/fusion-openapi-mock-server';

const server = createMockServer().use('fusion').use('./mocks');
const { url } = await server.start({ port: 4010 });
// url -> 'http://localhost:4010'

await server.close();
```

Or from the CLI:

```bash
pnpm exec fusion-mock --preset=fusion ./mocks --port 4010
```

Sources are layered from left to right, so `./mocks` replaces same-key services from the bundled
`fusion` preset. With no source argument, the CLI reads `./mocks`; with no `--port`, the operating
system assigns a free port.

## Entry points

| Import | Purpose |
| --- | --- |
| `@equinor/fusion-openapi-mock-server` | `createMockServer` and its server option/handle types. |
| `@equinor/fusion-openapi-mock-server/discovery` | Define executable `<name>.mock.ts` modules with `defineService`, or use lower-level `discoverServices`, `createService`, and `createRouter` APIs. |
| `@equinor/fusion-openapi-mock-server/presets` | Registry of bundled preset loaders. |
| `@equinor/fusion-openapi-mock-server/presets/fusion` | `fusionPreset` and its individual service definitions. |

The mock server exposes generated service responses, source-defined field/path overrides,
programmable middleware, and runtime operation overrides. Start with directory discovery; use the
lower-level discovery entry point only when a faker function or middleware route cannot be
expressed in JSON or YAML.

## Docs

- [Getting started](docs/getting-started.md) — directory convention, the bundled `fusion`
  preset, override mechanisms, layering, and running the server via the CLI or programmatically
- [Testing with Playwright](docs/testing-with-playwright.md) — per-test overrides, reset, and
  the full route reference

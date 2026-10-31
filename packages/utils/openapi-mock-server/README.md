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
| `@equinor/fusion-openapi-mock-server` | `createMockServer`, `createMockAuth`, `createMockAnalytics` (read, wait for, and reset recorded analytics in tests), and their server/session types. |
| `@equinor/fusion-openapi-mock-server/discovery` | Define executable `<name>.mock.ts` modules with `defineService`, or use lower-level `discoverServices`, `createService`, and `createRouter` APIs. |
| `@equinor/fusion-openapi-mock-server/presets` | Registry of bundled preset loaders. |
| `@equinor/fusion-openapi-mock-server/presets/fusion` | `fusionPreset`, `defineRolesV2Mock`, Fusion service definitions, `defineAnalyticsMock` (a mock Monitor service that receives, records, and seeds analytics), `defineAppFeatureEventsMock` (the Apps service's `POST /apps/feature-events/query` over those events), and `parseOtlpLogsRequest` / `parseOtlpResourceLog` / `projectAnalyticsEvent` for reading analytics the way Fusion's analytics pipeline does. |

The mock server exposes generated service responses, source-defined field/path overrides,
programmable middleware, and runtime operation overrides. Start with directory discovery; use the
lower-level discovery entry point only when a faker function or middleware route cannot be
expressed in JSON or YAML.

## Migration: path-to-regexp v9

This major release changes captured parameters for middleware routes registered through
`ServiceBuilder.middleware` or the exported `createRouter`. Review handlers that read
`RouteContext.params`, especially routes with multiple parameters in one segment.

```ts
router.get('/:file.:ext', (_req, res, { params }) => res.json(params));
// Request: /foo.json.html (relative to the service)
// Before (v8): { file: 'foo.json', ext: 'html' }
// Now (v9):    { file: 'foo', ext: 'json.html' }
```

Prefer separate segments for independently meaningful values, updating the mock route and test
clients together:

```ts
router.get('/files/:file/extensions/:ext', (_req, res, { params }) => res.json(params));
// Request: /files/foo.json/extensions/html
// params = { file: 'foo.json', ext: 'html' }
```

If existing URLs must stay unchanged, capture the entire segment and explicitly split it at the
last dot in your handler rather than relying on ambiguous matcher captures:

```ts
router.get('/:filename', (_req, res, { params }) => {
  const filename = String(params.filename);
  const separator = filename.lastIndexOf('.');
  if (separator <= 0 || separator === filename.length - 1) {
    res.statusCode = 400;
    res.json({ error: 'Expected a filename with an extension' });
    return;
  }
  res.json({ file: filename.slice(0, separator), ext: filename.slice(separator + 1) });
});
// Request: /foo.json.html -> { file: 'foo.json', ext: 'html' }
```

Direct `createRouter` usage still sets `trailing: false`. A route `/files/` matches `/files/`, not
`/files` or `/files//`; optional trailing slashes have not been enabled. The standalone server
already normalizes empty path segments before service middleware matching, so register `/files`
there: service requests `/files`, `/files/` and `/files//` reach that same route. This normalization
is unchanged by the upgrade. Simple routes such as `/users/:id` are unaffected by the capture change.

Add regressions that assert both the HTTP response and `params` for dotted values, invalid
filenames and trailing-slash variants. The dependency is ESM-only and requires Node 22 or newer;
keep using this package's ESM entry points.

## Docs

- [Getting started](docs/getting-started.md) — directory convention, the bundled `fusion`
  preset, override mechanisms, layering, and running the server via the CLI or programmatically
- [Testing with Playwright](docs/testing-with-playwright.md) — per-session user selection,
  switching, scope-aware token issuance, operation overrides, reset, and the full route reference
- [Test help articles locally](docs/testing-help-articles.md) — serve local help docs as a mock
  `help` service with `defineHelpArticlesMock`, so the dev portal opens the articles an app
  requests with `useHelpCenter()`
- [Test analytics locally](docs/testing-analytics.md) — receive, record, and seed the analytics an
  app tracks with `useTrackFeature()`, check them in Playwright with `createMockAnalytics`, and
  answer the app-feature events query with `defineAnalyticsMock` and `defineAppFeatureEventsMock`

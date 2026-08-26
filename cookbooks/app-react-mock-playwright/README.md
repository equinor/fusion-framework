# Mocked API + Playwright Cookbook

This cookbook demonstrates testing a Fusion Framework app end-to-end with a real browser,
against a real HTTP mock backend, using `ffc mock-server` and `@playwright/test`.

## Overview

Most cookbooks show a framework feature in isolation. This one shows the integration between two
pieces of Fusion Framework tooling: `@equinor/fusion-framework-cli-plugin-mock-server`'s
`ffc mock-server` command (a standalone mock HTTP server, see
[`packages/cli-plugins/mock-server`](../../packages/cli-plugins/mock-server)) and Playwright's
`webServer` option, which builds the application, starts both the mock server and the preview
server, and tears the servers down after the test run.

## How it works

- [`mocks/people.mock.ts`](mocks/people.mock.ts) overrides an existing service-discovery entry
  with `serviceDiscovery: 'merge'`, inheriting the bundled `people` schema while replacing its
  `getPerson` response.
- [`mocks/aurora-api.mock.ts`](mocks/aurora-api.mock.ts) temporarily adds the fictional
  pre-production `aurora-api` service with `serviceDiscovery: 'new'`, its own
  [`aurora-api.openapi.json`](mocks/aurora-api.openapi.json) schema, and deterministic component
  values. It is absent from real service discovery during development, but must be registered
  there before release.
- [`mocks/my-api.mock.ts`](mocks/my-api.mock.ts) defines `my-api`, imports its OpenAPI schema,
  and uses `serviceDiscovery: false` to keep this custom service out of discovery.
- [`app.config.local.ts`](app.config.local.ts) configures `my-api` directly at
  `http://my-api.localhost:4010` for both normal and `--mock` development.
- `ffc app serve --mock http://localhost:4010` serves the production build, resolves
  `app.config.local.ts`, and points service discovery at the mock server. The
  preview server automatically creates local proxy routes for the bundled services.
- [`src/routes/index.tsx`](src/routes/index.tsx),
  [`src/routes/people/index.tsx`](src/routes/people/index.tsx), and
  [`src/routes/aurora/index.tsx`](src/routes/aurora/index.tsx) give each service lifecycle
  scenario its own page. The direct-only scenario is the root index; named pages live in their own
  directories. Each page calls `useHttpClient()` directly so its explanation and the framework
  integration agents should reproduce live together in one retrieval-friendly file.
- [`playwright.config.ts`](playwright.config.ts) starts `ffc mock-server` and runs `ffc app build`
  followed by `ffc app serve --mock` as Playwright `webServer` entries, then runs the
  specs under [`playwright/`](playwright) against the built app.

## Running it

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-mock-playwright test
```

To run the pieces individually while developing:

```sh
pnpm mock:server   # ffc mock-server ./mocks --port 4010
pnpm mock:dev      # ffc app dev --mock http://localhost:4010, in another terminal
ffc app build
ffc app serve --mock http://localhost:4010  # in another terminal
```

Or start both processes together with `pnpm dev:mock`.

For normal development with real service discovery plus selected local services, manually start
`pnpm mock:server`, then run `pnpm dev` in another terminal. Plain `ffc app dev` discovers
`*.mock.ts` files under `mockServer.path` (default `mocks`) and merges visible `defineService`
entries into real discovery by key.
It does not start `ffc mock-server`; unreachable local service URIs remain unreachable.

## Key concepts

- **`ffc mock-server`** serves any directory of `<name>.mock.ts` service modules over HTTP,
  independent of Vite or the dev server — see the plugin's own
  [README](../../packages/cli-plugins/mock-server/README.md) for the full command reference.
- **`ffc app dev --mock` and `ffc app serve --mock`** use the mock server's discovery endpoint and
  generate proxy routes automatically, so the app needs no custom `dev-server.config.ts`. These
  modes ignore normal discovery and use only mock-server presets plus local `defineService`
  modules. `app serve` requires an existing build; Playwright runs `ffc app build` before starting
  the preview server.
- **`defineService`** controls mock-server behavior and whether a service is advertised. Plain
  `ffc app dev` points visible definitions at the manually started mock server;
  `'merge'` overrides an existing entry, `'new'` adds a pre-production service and rejects key
  collisions, `'replace'` deliberately replaces a complete definition, and `false` keeps a
  genuinely custom endpoint like `my-api` direct-only because `app.config.local.ts` supplies its URL.
- **`defineService`** keeps a service's schema, `components`, declarative `routes`, and
  `middleware` in one module. `serviceDiscovery: 'replace'` defines a complete service;
  `serviceDiscovery: 'merge'` inherits an earlier service schema. A declarative route remains
  overridable at runtime via `/@fusion-mock/:service/:operationId`
  (see
  [`playwright/playwright-override.spec.ts`](playwright/playwright-override.spec.ts)), while
  `middleware` always wins over the generated mock and runtime override.
- **Playwright's `webServer`** array starts and stops each process for the whole test run — do
  not start `ffc mock-server` yourself in the background; it is designed to run in the
  foreground and shut down on `SIGINT`/`SIGTERM`.

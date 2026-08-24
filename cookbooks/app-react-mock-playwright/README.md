# Mocked API + Playwright Cookbook

This cookbook demonstrates testing a Fusion Framework app end-to-end with a real browser,
against a real HTTP mock backend, using `ffc mock-server` and `@playwright/test`.

## Overview

Most cookbooks show a framework feature in isolation. This one shows the integration between two
pieces of Fusion Framework tooling: `@equinor/fusion-framework-cli-plugin-mock-server`'s
`ffc mock-server` command (a standalone mock HTTP server, see
[`packages/cli-plugins/mock-server`](../../packages/cli-plugins/mock-server)) and Playwright's
`webServer` option, which starts both the mock server and the app's dev server before the test
run and tears them down after.

## How it works

- [`mocks/my-api.openapi.json`](mocks/my-api.openapi.json) declares a single `GET /greeting`
  operation. [`mocks/my-api.overrides.ts`](mocks/my-api.overrides.ts) pins its `message` field
  to a fixed string via a `components` field-faker override, so the test has something
  deterministic to assert on.
- `ffc app dev --mock http://localhost:4010` points service discovery at the mock server. The
  dev server automatically creates local proxy routes for both `my-api` and the bundled services.
- [`mocks/people.overrides.ts`](mocks/people.overrides.ts) pins `people`'s (the bundled `fusion`
  preset's) `getPerson` response via a static `paths` override, without a local
  `people.openapi.json` — see `mergeServiceDefinitions` in `@equinor/fusion-openapi-mock-server`.
- [`src/routes/index.tsx`](src/routes/index.tsx) fetches a greeting from the `my-api` client and
  a person from the `people` client (both via `useHttpClient()`, from
  `@equinor/fusion-framework-react-app/http`) and renders the responses.
- [`playwright.config.ts`](playwright.config.ts) starts `pnpm mock:server` (`ffc mock-server`)
  and `pnpm mock:dev` (`ffc app dev --mock`) as Playwright `webServer` entries, then runs the
  specs under [`playwright/`](playwright) against the real running app.

## Running it

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-mock-playwright test:mock
```

To run the pieces individually while developing:

```sh
pnpm mock:server   # ffc mock-server ./mocks --port 4010
pnpm mock:dev      # ffc app dev --mock http://localhost:4010, in another terminal
```

Or start both processes together with `pnpm dev:mock`.

## Key concepts

- **`ffc mock-server`** serves any directory of `<service>.openapi.json` specs over HTTP,
  independent of Vite or the dev server — see the plugin's own
  [README](../../packages/cli-plugins/mock-server/README.md) for the full command reference.
- **`ffc app dev --mock`** uses the mock server's discovery endpoint and generates the dev-server
  proxy routes automatically, so the app needs no custom `dev-server.config.ts`.
- **`<service>.overrides.ts`** sidecars let a mock pin specific fields (`components`) or whole
  operation responses (`paths`) to fixed or computed values instead of the OpenAPI schema's
  random fake, which is what makes this cookbook's Playwright assertions deterministic. A
  `paths` override still stays overridable at runtime via `/@fusion-mock/:service/:operationId`
  (see
  [`playwright/playwright-override.spec.ts`](playwright/playwright-override.spec.ts)); a
  `middleware` override always wins over the generated mock, even against a runtime override.
- **Playwright's `webServer`** array starts and stops each process for the whole test run — do
  not start `ffc mock-server` yourself in the background; it is designed to run in the
  foreground and shut down on `SIGINT`/`SIGTERM`.

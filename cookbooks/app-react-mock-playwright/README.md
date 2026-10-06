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
- [`docs/articles/`](docs/articles) holds one help article per page, and
  [`docs/faqs/`](docs/faqs) holds FAQs that link to those articles. `ffc mock-server`
  auto-detects the folder and serves it as the `help` service. Each page heading has a
  [`HelpInfoButton`](src/components/HelpInfoButton.tsx) — an info icon that calls
  `useHelpCenter().openArticle(slug)` — so the dev portal opens the article explaining that page.
  [`src/routes/help/index.tsx`](src/routes/help/index.tsx) also opens a missing article and the
  FAQs page. [`playwright/help-articles.spec.ts`](playwright/help-articles.spec.ts) clicks every
  info icon and asserts the dev portal's article, not-found, and not-supported states. Renaming an
  article's `slug` fails its test.
- [`src/analytics/`](src/analytics) tracks a `page-viewed` feature with the route on every page
  ([`usePageViewTracking`](src/analytics/usePageViewTracking.ts)) and reads the app's own usage
  back through the Apps service's `POST /apps/feature-events/query`
  ([`useAppFeatureEvents`](src/analytics/useAppFeatureEvents.ts)).
  [`src/routes/analytics/index.tsx`](src/routes/analytics/index.tsx) tracks a demo feature and
  lists the events. With `--mock`, the dev portal sends the events to `ffc mock-server`, which reads
  them like Fusion's analytics pipeline, records them to `.fusion-mock/analytics.jsonl`, and answers
  the query with them plus the history in
  [`mocks/analytics.seed.jsonl`](mocks/analytics.seed.jsonl) (`--analytics-seed`).
  [`playwright/analytics.spec.ts`](playwright/analytics.spec.ts) waits for tracked features with
  `createMockAnalytics`, checks their data, reads them through the query, and keeps parallel
  browser contexts apart.
- [`playwright.config.ts`](playwright.config.ts) starts `ffc mock-server` and runs `ffc app build`
  followed by `ffc app serve --mock` as Playwright `webServer` entries, then runs the
  specs under [`playwright/`](playwright) against the built app.
- [`playwright/mock-auth-personas.spec.ts`](playwright/mock-auth-personas.spec.ts) uses
  `createMockAuth` to select normal-user and administrator personas in isolated browser contexts.
  The mock server issues a token for the scope requested by Fusion HTTP, and `my-api` echoes its
  `oid` claim so the test verifies the selected identity reached the backend.

## Running it

```sh
pnpm --filter @equinor/fusion-framework-cookbook-app-react-mock-playwright test
```

To run the pieces individually while developing:

```sh
pnpm mock:server   # ffc mock-server ./mocks --port 4010 --analytics-seed mocks/analytics.seed.jsonl
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
- Loopback browser origins can use credentialed mock auth on any port. Use **`--allow-origin`**
  only when tests serve apps or portals from a non-loopback origin.
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
- **Local help articles**: help docs use the same frontmatter markdown files `fhelp` syncs to
  production. Edit an article while `pnpm mock:server` runs and open help again to see the change.
  See [Test help articles locally](../../packages/utils/openapi-mock-server/docs/testing-help-articles.md).
- **Usage analytics**: give each test its own mock-auth user, so its analytics session is isolated,
  and use `createMockAnalytics().waitFor()` rather than reading once, because the framework sends
  analytics in batches. Tracked data arrives as `data_body_data` JSON text, exactly as the Apps
  service returns it. A recording from one run can be loaded with `--analytics-seed` in the next.
  See [Test analytics locally](../../packages/utils/openapi-mock-server/docs/testing-analytics.md).
- **Playwright's `webServer`** array starts and stops each process for the whole test run — do
  not start `ffc mock-server` yourself in the background; it is designed to run in the
  foreground and shut down on `SIGINT`/`SIGTERM`.
- **`createMockAuth`** selects a user per browser context rather than accepting a bearer token.
  Configure scopes on the app endpoint; the mock server mints an unsigned OBO-style token whenever
  Fusion MSAL requests those scopes. Calling `setUser` again and reloading switches persona;
  calling `reset` and reloading restores the default mock identity. See
  [`mock-auth-personas.spec.ts`](playwright/mock-auth-personas.spec.ts) for the complete flow.
  Persona claims here are placeholder identity data (`userId`, optional `claims.roles`); an
  authorization-aware app instead reads its access roles through the Roles V2 module — see the
  [Roles V2 end-to-end adoption guide](../../packages/framework/docs/roles-v2-adoption-guide.md)
  for that persona-to-policy flow and the [Roles V2 cookbook](../app-react-roles/README.md) for a
  runnable example.

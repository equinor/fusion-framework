# @equinor/fusion-framework-cookbook-app-react-mock-playwright

## 0.0.6

### Patch Changes

- efdf820: Demonstrate testing usage analytics against `ffc mock-server`.
  
  - Every page tracks a `page-viewed` feature with its route. A new Usage analytics page tracks a demo feature and lists the app's own events through the Apps service's `POST /apps/feature-events/query`.
  - The mock server loads earlier history from `mocks/analytics.seed.jsonl`.
  - `playwright/analytics.spec.ts` uses `createMockAnalytics` to wait for tracked features, check their data, read them back through the query, and keep parallel browser contexts apart.
  - A help article explains the page.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2183
- 9258fb1: Add a local help scenario: one help article per page in `docs/articles`, FAQs in `docs/faqs` that link to those articles, a `HelpInfoButton` info icon next to every page heading that opens that page's article with `useHelpCenter().openArticle(slug)`, a page that also opens a missing article and the FAQs page, buttons for `openHelp()` and `openSearch(term)`, and Playwright tests that click every info icon, browse every article from the sidebar, expand FAQs, search articles and FAQs, and check the dev portal's not-found and not-supported states.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2154

## 0.0.5

### Patch Changes

- 43bc1f0: Document session-isolated authorization personas with generic role policy examples for browser tests.
  
  Refs https://github.com/equinor/fusion-core-tasks/issues/2102

## 0.0.4

### Patch Changes

- c1924f9: Demonstrate isolated normal-user and administrator Playwright personas with runtime switching, reset, and localhost credentialed-CORS support.
  
  Relates to equinor/fusion-core-tasks#2096

## 0.0.3

### Patch Changes

- f0e9cc0: Internal: use the workspace Playwright catalog so all packages resolve a single compatible version.

## 0.0.2

### Patch Changes

- f663b46: Add a cookbook demonstrating Fusion Framework end-to-end testing with `@playwright/test`
  against `ffc mock-server`. Playwright's `webServer` starts both the mock server and `ffc app
  serve --mock` after building the app, which discovers the mocked services and creates local proxy
  routes automatically against production-built assets.
  Executable mock modules demonstrate overriding an existing discovery service, adding a
  pre-production `aurora-api` service with its own OpenAPI schema, and configuring a direct-only
  custom service. Deterministic responses remain replaceable through the mock server's per-test HTTP
  control plane.

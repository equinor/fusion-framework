---
"@equinor/fusion-framework-cookbook-app-react-mock-playwright": patch
---

Demonstrate testing usage analytics against `ffc mock-server`.

- Every page tracks a `page-viewed` feature with its route. A new Usage analytics page tracks a demo feature and lists the app's own events through the Apps service's `POST /apps/feature-events/query`.
- The mock server loads earlier history from `mocks/analytics.seed.jsonl`.
- `playwright/analytics.spec.ts` uses `createMockAnalytics` to wait for tracked features, check their data, read them back through the query, and keep parallel browser contexts apart.
- A help article explains the page.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2183

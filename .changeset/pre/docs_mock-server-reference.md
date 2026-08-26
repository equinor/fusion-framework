---
"@equinor/fusion-framework-docs": patch
---

Add the OpenAPI mock server reference covering executable `defineService` modules, service
discovery modes, local development overlays, Playwright overrides, reset behavior, and the
`ffc app dev --mock` workflow. Include a migration guide that maps service mocks in
`dev-server.config.ts` to `serviceDiscovery`, `routes`, `middleware`, and `components`, while
identifying host-level configuration that should remain in the dev server. Also add missing
cookbook pages and navigation entries to the cookbook index and sidebar. Publish the dev-server
learning path and mock-server plugin reference through the CLI documentation navigation.

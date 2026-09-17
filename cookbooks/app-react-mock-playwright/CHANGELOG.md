# @equinor/fusion-framework-cookbook-app-react-mock-playwright

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

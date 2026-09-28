# @equinor/fusion-openapi-mock-server

## 0.4.0

### Minor Changes

- 4b3a9a0: Add parameterized middleware routes with decoded path parameters, parsed service-relative URLs and queries, and explicit mock-only identity states sourced from session-scoped mock-auth bearer tokens.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2098
- e6b881a: Add `defineRolesV2Mock` for typed, persona-aware Roles V2 HTTP mocks with paged checks, activation/deactivation, recovery behavior, identity switching, and browser-session/account isolation.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2100

### Patch Changes

- 43bc1f0: Add an end-to-end Roles V2 adoption guide covering production configuration, active-only and claim-capable React flows, component tests, persona-aware HTTP mocks, Playwright identity, recovery failures, and trusted backend authorization boundaries.
  
  Refs https://github.com/equinor/fusion-core-tasks/issues/2102
- e6b881a: Align the bundled Roles V2 preset with the read and activation operations used by `@equinor/fusion-framework-module-roles`, and add a repeatable snapshot update command backed by the published Roles service contract.
  
  Fixes https://github.com/equinor/fusion-core-tasks/issues/2099

## 0.3.0

### Minor Changes

- c1924f9: Add a test-runner-agnostic mock-auth helper and session-isolated user API that issues unsigned OBO-style tokens for Fusion MSAL scope requests without restarting test servers. Credentialed browser access allows canonical loopback origins on every port; other origins require an explicit exact-origin allowlist.
  
  Relates to equinor/fusion-core-tasks#2096

## 0.2.1

### Patch Changes

- cc65bd5: Preserve the requested context ID in responses from the bundled Fusion Context preset.
  
  Fixes #5606.

## 0.2.0

### Minor Changes

- 54d0d20: Add `patch` and `options` middleware router shorthands for mocking PATCH and OPTIONS requests.

## 0.1.1

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.

## 0.1.0

### Minor Changes

- f663b46: Add a standalone OpenAPI mock server for local development and end-to-end tests.
  
  The package provides the `createMockServer` API and `fusion-mock` CLI, with directory discovery,
  the bundled Fusion service preset, executable `<name>.mock.ts` modules defined with `defineService`,
  programmable routes and middleware, browser CORS support, deterministic server-level seeding, and
  an HTTP control plane for per-test overrides and resets. Service definitions can be direct-only,
  merge an existing discovery service, add a new service with collision protection, or replace one.

### Patch Changes

- Updated dependencies [f663b46]
  - @equinor/fusion-openapi-mock@0.2.0

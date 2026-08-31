# @equinor/fusion-openapi-mock-server

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

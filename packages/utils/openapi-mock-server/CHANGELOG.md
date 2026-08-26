# @equinor/fusion-openapi-mock-server

## 0.1.0-next.1

### Minor Changes

- 09a9bcc: Add a standalone OpenAPI mock server for local development and end-to-end tests.
  
  The package provides the `createMockServer` API and `fusion-mock` CLI, with directory discovery,
  the bundled Fusion service preset, executable `<name>.mock.ts` modules defined with `defineService`,
  programmable routes and middleware, browser CORS support, deterministic server-level seeding, and
  an HTTP control plane for per-test overrides and resets. Service definitions can be direct-only,
  merge an existing discovery service, add a new service with collision protection, or replace one.

### Patch Changes

- Updated dependencies [306973d]
  - @equinor/fusion-openapi-mock@0.2.0-next.1

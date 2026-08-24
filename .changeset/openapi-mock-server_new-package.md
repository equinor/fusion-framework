---
"@equinor/fusion-openapi-mock-server": minor
---

Add a standalone OpenAPI mock server for local development and end-to-end tests.

The package provides the `createMockServer` API and `fusion-mock` CLI, with directory discovery,
the bundled Fusion service preset, layered schema and route overrides, programmable middleware,
deterministic server-level seeding, and an HTTP control plane for per-test overrides and resets.
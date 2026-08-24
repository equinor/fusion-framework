---
"@equinor/fusion-framework-cli": minor
---

Add a built-in `ffc mock-server` command and a `--mock [endpoint]` flag to `ffc app dev`.

`ffc mock-server` delegates to `@equinor/fusion-framework-cli-plugin-mock-server` when installed
and otherwise prints an installation hint. Explicit `mockServerPlugin()` configuration remains
supported for app-specific defaults without registering the command twice.

The `--mock` flag points API service discovery at a local
mock server (e.g. one started with `ffc mock-server`) without needing a `dev-server.config.ts`
override — `ffc app dev --mock` defaults to `http://localhost:4010`, or pass an explicit origin
with `ffc app dev --mock http://localhost:5010`. An existing `dev-server.config.ts` override for
`api.serviceDiscoveryUrl` still takes precedence.

`--mock` also enables the in-process MSAL mock (`spa.templateEnv.msal.mock`), so a mocked API
is usable end-to-end without a real Entra ID sign-in.

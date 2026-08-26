---
"@equinor/fusion-framework-cli": minor
---

Add a built-in `ffc mock-server` command and a `--mock [endpoint]` flag to `ffc app dev` and
`ffc app serve`.

`ffc mock-server` delegates to `@equinor/fusion-framework-cli-plugin-mock-server` when installed
and otherwise prints an installation hint. Explicit `mockServerPlugin()` configuration remains
supported for app-specific defaults without registering the command twice.

The `--mock` flag points API service discovery at a local
mock server (e.g. one started with `ffc mock-server`) without needing a `dev-server.config.ts`
override — `ffc app dev --mock` defaults to `http://localhost:4010`, or pass an explicit origin
with `ffc app dev --mock http://localhost:5010`. An existing `dev-server.config.ts` override for
`api.serviceDiscoveryUrl` still takes precedence.

`ffc app serve --mock` applies the same isolated discovery and mock authentication to a built
application preview. The application must be built first and resolves the `local` environment.
`ffc app dev --mock` preserves `--env`, which defaults to `local`; explicit `--manifest` and
`--config` paths remain supported.

Normal `ffc app dev` discovers local `<name>.mock.ts` modules and overlays discovery-visible
definitions onto remote service discovery. In `--mock` mode, discovery comes exclusively from the
manually started mock server. Local endpoint overrides can be supplied through
`app.config.local.ts`.

`--mock` also enables the in-process MSAL mock (`spa.templateEnv.msal.mock`), so a mocked API
is usable end-to-end without a real Entra ID sign-in.

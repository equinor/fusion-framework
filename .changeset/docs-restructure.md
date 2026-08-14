---
"@equinor/fusion-framework-module-service-discovery": patch
"@equinor/fusion-framework-module-msal": patch
"@equinor/fusion-framework": minor
---

Restructure documentation so each README is an entry point rather than a manual.

Long-form content moved into per-package `docs/` folders, matching the convention already used by `@equinor/fusion-framework-module` and `@equinor/fusion-framework-module-http`. Each README now keeps the elevator pitch, the shortest working example and a documentation table linking to the rest.

- **msal** — `docs/api-reference.md`, `docs/auth-code-flow.md`, `docs/testing.md`, `docs/version-management.md`, `docs/migration-v2-to-v4.md`, `docs/troubleshooting.md`. The README also gained the top-level heading it was missing.
- **service-discovery** — `docs/configuration.md`, `docs/testing.md`, `docs/session-overrides.md`, `docs/api-reference.md`.
- **framework** — `docs/testing-choosing-a-layer.md`, `docs/testing.md`, `docs/testing-design.md`, `docs/testing-extending.md`, `docs/testing-api.md`.

Both module READMEs now document their `/mock` entry point, which was previously undocumented, and state that spying on an individual call is the test runner's job rather than something these packages provide.

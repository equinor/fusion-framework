---
"@equinor/fusion-framework-vite-plugin-spa": minor
---

Add `FUSION_SPA_MSAL_MOCK` environment variable. When set to `true`, the generated bootstrap
script signs in through `@equinor/fusion-framework-module-msal/mock` instead of the real MSAL
client, so the dev server can run without Entra ID credentials, redirects, or network calls.
Intended for CI and Playwright runs against the dev server. The mock client is lazily
imported, so it is not loaded at runtime unless the flag is enabled.

Also add `FUSION_SPA_MSAL_MOCK_TOKEN`, an optional companion variable read only when
`FUSION_SPA_MSAL_MOCK` is set. Provide a JWT (e.g. from `createMockToken`, or one issued by a
team's backend mock) and its `name`, `preferred_username`, `oid`, `tid`, and `scp` claims name
the signed-in mock user. The token itself is also sent verbatim as the access/id token, so a
backend mock that validates the token sees exactly what was configured, not a regenerated one.

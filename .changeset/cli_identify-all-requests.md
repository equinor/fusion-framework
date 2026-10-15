---
"@equinor/fusion-framework-cli": minor
---

Identify every outgoing CLI request to Fusion services, not only publish, upload, check and tag calls.

`configureFramework` now registers the `X-Fusion-CLI-Name`, `X-Fusion-CLI-Version` and `User-Agent` headers on the framework HTTP client, so service discovery lookups and every other client created from it carry them too. Headers already set on a request are kept. `defaultHeaders` is now exported from `@equinor/fusion-framework-cli/bin`. Requests forwarded by the dev server keep identifying as the dev server (`X-Fusion-Dev-Server-*`). See [Request identification headers](https://github.com/equinor/fusion-framework/tree/main/packages/cli#request-identification-headers).

Fixes: https://github.com/equinor/fusion-core-tasks/issues/2207

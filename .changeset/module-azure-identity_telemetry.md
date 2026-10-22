---
"@equinor/fusion-framework-module-azure-identity": minor
---

Record Azure Identity authentication outcomes when a telemetry module is registered.
`acquireToken` (also used by `acquireAccessToken`), `login` and `logout` record
`fusion.azure-identity.<operation>.duration` metrics, with one sanitized failure exception
per failure. Tokens, scopes, auth records and original errors are never recorded, results
and errors are unchanged, and static `token_only` providers are never instrumented. Without
telemetry the provider is untouched, and the package stays Node-compatible.

Ref: #5804.

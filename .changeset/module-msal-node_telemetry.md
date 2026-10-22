---
"@equinor/fusion-framework-module-msal-node": minor
---

Record Node authentication outcomes when a telemetry module is registered. Providers record
`fusion.msal-node.acquire-token.duration`, `fusion.msal-node.login.duration` and
`fusion.msal-node.logout.duration`, with one sanitized failure exception per failure.
Tokens, scopes, accounts, device codes and original errors are never recorded, results and
errors are unchanged, and static `token_only` providers are never instrumented. Without
telemetry the provider is untouched, and the package stays Node-compatible.

Ref: #5804.

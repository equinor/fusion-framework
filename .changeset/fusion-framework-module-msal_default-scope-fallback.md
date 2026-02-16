---
"@equinor/fusion-framework-module-msal": patch
---

Default missing/empty token request scopes to the app `/.default` scope (when `clientId` is available) and expose `MsalProvider.defaultScopes` for consumers that want the same fallback.

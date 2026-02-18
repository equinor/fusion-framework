---
"@equinor/fusion-framework-module-msal": patch
---

Default missing/empty token request scopes to the app `/.default` scope (when `clientId` is available) and expose `MsalProvider.defaultScopes` for consumers that want the same fallback.

```ts
// Reuse the provider's default scope logic
const scopes = provider.defaultScopes;

// If scopes are omitted/empty, the provider will fall back to `defaultScopes` when possible.
await provider.acquireToken();

// Explicitly using the same fallback
await provider.acquireToken({ request: { scopes } });
```

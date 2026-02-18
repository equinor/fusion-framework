---
"@equinor/fusion-framework-module-msal": patch
---

Fix `MsalProvider.acquireToken`/`acquireAccessToken` to handle missing options by defaulting to safe arguments, preventing runtime crashes when accessing properties like `behavior`.

```ts
// Calling without options is now supported; safe defaults are applied.
await provider.acquireToken();
await provider.acquireAccessToken();
```

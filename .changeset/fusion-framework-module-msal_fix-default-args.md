---
"@equinor/fusion-framework-module-msal": patch
---

Fix `MsalProvider.acquireToken`/`acquireAccessToken` to handle missing options by defaulting to safe empty arguments, preventing runtime crashes when accessing properties like `behavior`.

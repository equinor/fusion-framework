---
"@equinor/fusion-framework-module-msal": patch
---

Prevent infinite automatic redirect loops in `MsalClient.acquireToken` when silent token acquisition fails repeatedly (such as `AADSTS65001` / `consent_required`). Non-interaction errors now propagate directly, while `InteractionRequiredAuthError` allows one automatic redirect per authorization request in the tab session before throwing the original MSAL error. Successful silent or popup token acquisition clears the guard, and explicit `silent: false` retries remain available.

Fixes equinor/fusion-core-tasks#3236

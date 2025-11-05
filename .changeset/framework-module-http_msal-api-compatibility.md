---
"@equinor/fusion-framework-module-http": patch
---

Update HTTP module to use new MSAL token acquisition API format.

Changes `acquireAccessToken` call from `{ scopes }` to `{ request: { scopes } }` to maintain compatibility with MSAL v4 API changes.

Migration: No action required. This is an internal API compatibility fix.

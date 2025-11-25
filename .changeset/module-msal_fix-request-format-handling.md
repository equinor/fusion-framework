---
"@equinor/fusion-framework-module-msal": patch
---

Fix request format handling in v2 proxy provider to support both v2 and v4 request formats.

The `acquireToken` and `acquireAccessToken` methods in the v2 proxy provider now correctly detect and handle requests in both v2 format (`{ scopes, account }`) and v4 format (`{ request: { scopes, account } }`), ensuring compatibility with both API versions.


---
'@equinor/fusion-framework-module-http': patch
---

fix(http): use acquireAccessToken instead of acquireToken

- The HTTP module now uses the correct method `acquireAccessToken` from the auth provider to retrieve the access token for requests with scopes.
- This fixes compatibility with the new MSAL node module interface, which no longer exposes `acquireToken` but instead provides `acquireAccessToken` for token retrieval.
- Ensures the Authorization header is set correctly for authenticated HTTP requests.

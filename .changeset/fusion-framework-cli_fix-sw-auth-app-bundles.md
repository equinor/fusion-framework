---
"@equinor/fusion-framework-cli": patch
---

Add `/@fusion-api/apps` as a direct service worker resource so auth tokens are injected for app bundle chunk requests in portal mode.

Previously, only `/apps-proxy` was registered. When the browser resolved relative chunk imports (e.g. `lib-*.js`) against the rewritten `/@fusion-api/apps/` origin, the service worker did not match the URL and the request was sent without an Authorization header, resulting in 401 errors.

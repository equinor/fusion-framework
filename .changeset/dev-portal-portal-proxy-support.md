---
"@equinor/fusion-framework-dev-portal": patch
---

Enhanced dev-portal with portal proxy service worker configuration ([Issue #3546](https://github.com/equinor/fusion-framework/issues/3546)).

- Added `/portal-proxy` service worker resource configuration in dev-server.ts
- Routes portal proxy requests to Fusion portal service API (`/@fusion-api/portals`)
- Enables portal proxy functionality for testing against real portal environments

This change supports the portal proxy feature by configuring the service worker to properly route portal requests through the dev-server proxy system.

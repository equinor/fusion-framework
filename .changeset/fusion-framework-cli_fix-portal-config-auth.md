---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-server": patch
---

Fix 401 Unauthorized responses when loading the portal-config API in the Fusion dev server.

The default service worker resource list now includes `/@fusion-api/portal-config` with the CI scope so the service worker injects a Bearer token for portal-config API calls (manifest, config, and bundle fetches) during bootstrap and other direct requests.

Also adds `scopes?: string[]` to the `FusionService` type so the type correctly reflects the service discovery response shape and is no longer misleading when services do include scopes.

Fixes: https://github.com/equinor/fusion/issues/830

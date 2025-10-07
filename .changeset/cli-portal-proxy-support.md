---
"@equinor/fusion-framework-cli": minor
---

Enhanced CLI with portal proxy support for testing apps in real portal environments ([Issue #3546](https://github.com/equinor/fusion-framework/issues/3546)).

- Added `/portal-proxy` service worker resource configuration to CLI dev server
- Routes portal proxy requests to Fusion portal service API (`/@fusion-api/portal-config`)
- Enhanced dev server creation with improved logging and error handling
- Exported `defineDevServerConfig` helper for type-safe portal configuration
- Updated `ffc app dev` command with better logging support

This enables developers to run `ffc app dev` to test against real portals, supporting configuration of portal ID and version tags for targeted testing scenarios.

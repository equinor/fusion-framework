---
"@equinor/fusion-framework-app": patch
---

Fix backwards compatibility issue in `configureHttpClientsFromAppConfig()` method.

The `configureHttpClientsFromAppConfig()` method now safely checks if the `getEndpoints()` function exists on `config` before calling it, and falls back to the deprecated `endpoints` property if needed. This prevents errors when using older versions of the API that don't have the `getEndpoints()` method.

This fixes issue equinor/fusion#792 where upgrading to v9.0.0 of `@equinor/fusion-framework-react-app` would cause a "Lazy component error" in local development environments using older backend API versions.

**Changes:**
- Method renamed to `_configureHttpClientsFromAppConfig()` (protected, internal)
- Added early return if config is not provided
- Uses optional chaining for `getEndpoints()` and falls back to deprecated `endpoints` property
- Maintains compatibility across different API versions

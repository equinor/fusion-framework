---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Add peer dependencies to SPA Vite plugin

Added peer dependencies to ensure proper dependency resolution for the SPA Vite plugin. This change declares the Fusion Framework modules that the plugin expects to be available in the consuming application:

- `@equinor/fusion-framework-module`
- `@equinor/fusion-framework-module-http`
- `@equinor/fusion-framework-module-msal`
- `@equinor/fusion-framework-module-service-discovery`
- `@equinor/fusion-framework-module-telemetry`

This ensures that consumers are aware of the required dependencies and helps prevent runtime errors due to missing modules.
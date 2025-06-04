---
"@equinor/fusion-cli": minor

cli: add portal config support

- Added support for loading and resolving portal configuration files via `loadPortalConfig` and `resolvePortalConfig` helpers.
- Introduced `PortalConfig`, `PortalConfigFn`, and `definePortalConfig` types/utilities for authoring static or dynamic portal configs.
- Updated dev server logic to use resolved portal config.
- Exposed new config utilities from `lib/portal` index.

This enables flexible, type-safe portal configuration for local development and deployment scenarios.

---
"@equinor/fusion-framework": patch
---

**@equinor/fusion-framework:**

Added telemetry module integration to the framework.

- Integrated `@equinor/fusion-framework-module-telemetry` as a core module in the framework
- Added `configureTelemetry` method to `FrameworkConfigurator` for configuring the telemetry module
- Updated type definitions to include `TelemetryModule` in `FusionModules`
- Added default telemetry configuration in the `FrameworkConfigurator` constructor that sets version metadata and default scope
- Enhanced event observable with event name prefixing in `FrameworkConfigurator`
- Removed unused `ModuleConsoleLogger` import
- Updated project references in `tsconfig.json` to include the telemetry module

**Migration:**

No breaking changes. Applications using the framework will automatically benefit from the improved telemetry module integration.

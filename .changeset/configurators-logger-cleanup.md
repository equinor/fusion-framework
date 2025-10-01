---
"@equinor/fusion-framework": patch
"@equinor/fusion-framework-app": patch
"@equinor/fusion-framework-widget": patch
---

Remove explicit logger initialization from configurator constructors in favor of telemetry.

- Removed `this.logger = new ModuleConsoleLogger(...)` from FrameworkConfigurator, AppConfigurator, and WidgetConfigurator constructors
- Logger functionality will be handled through telemetry module with console logging adapter

This prepares the configurators to use telemetry for logging instead of direct console logger initialization.

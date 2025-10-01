---
"@equinor/fusion-framework-module-telemetry": patch
---

Add utility for mapping module configurator events to telemetry items.

- Add `mapConfiguratorEvents` utility function to convert `ModuleEvent` to `TelemetryItem`
- Map `ModuleEventLevel` to `TelemetryLevel` appropriately (Error=1, Warning=2, Information=3, Debug=4)
- Include event metadata (timing, errors, properties) in telemetry data
- Update `enableTelemetry` function to support `attachConfiguratorEvents` option
- Export `mapConfiguratorEvents` from utils index

This enables telemetry modules to capture core framework events from module configurators.

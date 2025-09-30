---
"@equinor/fusion-framework": minor
---

Integrate telemetry module into framework core.

- Add TelemetryModule to FusionModules type definition
- Enable telemetry in FrameworkConfigurator with default configuration
- Add event$ observable with framework-specific event prefixing
- Include framework metadata in telemetry collection

---
"@equinor/fusion-framework-module-telemetry": minor
---

Add new telemetry module for collecting and sending telemetry data.

- Add `TelemetryModule` with configurable adapters
- Implement Application Insights and Console adapters
- Add `Measurement` class for telemetry data collection
- Provide `TelemetryProvider` and `TelemetryConfigurator` for module integration
- Include comprehensive test coverage for all components
- Support custom metadata resolution and telemetry item merging
- async initialization support with `initialize()` method on providers and adapters
- Enhanced error handling in measurement disposal and metadata resolution

Resolves #3483

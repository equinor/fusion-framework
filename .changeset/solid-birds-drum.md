---
"@equinor/fusion-framework-module-telemetry": major
---

Introduce new, strongly-typed telemetry provider/configurator interfaces, ApplicationInsights adapter, and improved metadata handling

- BREAKING CHANGE: Replaces legacy telemetry provider/configurator with a new, generic telemetry interface (`ITelemetryProvider`/`ITelemetryConfigurator`) that can be configured with adapters such as Application Insights for flexible telemetry logging.
- The new provider interface is adapter-based, allowing integration with different telemetry backends by simply registering the desired adapter (e.g., Application Insights).
- The configuration and provider interfaces have changed significantly; upgrading to v5 requires reconfiguring the module when enabling telemetry. Existing configuration code will not be compatible and must be updated to use the new interfaces and patterns.
- Introduces a modern, extensible telemetry provider interface supporting event tracking and measurement with improved type safety and documentation
- Adds a flexible telemetry configurator interface for adapter registration, dynamic metadata, and default scope management
- Enhances metadata handling with support for dynamic/async values and improved integration with event modules
- Adds ApplicationInsightsAdapter for Microsoft Application Insights integration
- Updates dependencies, exports, and removes deprecated/legacy telemetry files

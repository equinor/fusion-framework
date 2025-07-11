---
"@equinor/fusion-framework-module-telemetry": minor
---
Introduce comprehensive telemetry module core implementation, adapters, and supporting utilities.

- Implemented the `Measurement` class and interface to facilitate structured tracking and reporting of telemetry data, including custom metrics and events.
- Developed an extensible adapter architecture with `TelemetryAdapter` and `BaseTelemetryAdapter`, enabling seamless integration with multiple telemetry backends.
- Provided built-in adapters for Application Insights and Console logging, allowing flexible telemetry data routing and diagnostics.
- Added the `enableTelemetry` utility to streamline module configuration and activation of telemetry features within applications.
- Created utilities for mapping configurator events to telemetry items and merging telemetry payloads, improving data consistency and aggregation.
- Established a comprehensive test suite covering measurement logic, configurator event handling, provider integration, and schema validation to ensure reliability and correctness.
- Enhanced documentation with detailed usage examples, adapter configuration guides, and best practices in the README to support developer onboarding and effective module adoption.

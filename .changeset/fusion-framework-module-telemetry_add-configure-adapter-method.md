---
"@equinor/fusion-framework-module-telemetry": minor
---

Add `configureAdapter` method to `TelemetryConfigurator` for dynamic adapter configuration with dependency injection support.

The new method allows adapters to be configured using callback functions that can access module instances through `requireInstance`, enabling more flexible and powerful adapter setup patterns.

---
"@equinor/fusion-framework-module-context": patch
---

Declare `@equinor/fusion-framework-module-telemetry` as an optional peer dependency.

The context module imports `TelemetryLevel`/`TelemetryScope` at runtime to report context
resolution failures when a telemetry module is registered, but telemetry was previously
undeclared outside of this package's own dev dependencies. A consumer installing only
`@equinor/fusion-framework-module-context` without telemetry could fail to resolve this
import at runtime.

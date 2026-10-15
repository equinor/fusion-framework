---
"@equinor/fusion-framework-module-telemetry": patch
---

Raise the optional OpenTelemetry log peer dependencies to `^0.223.0`: `@opentelemetry/api-logs`, `@opentelemetry/exporter-logs-otlp-http`, and `@opentelemetry/sdk-logs`. Because `^0.222.0` does not include `0.223.x`, applications that install these peers next to the telemetry module should upgrade them to `0.223.x` to avoid peer-dependency warnings. The `@opentelemetry/resources` peer range (`^2.11.0`) is unchanged.

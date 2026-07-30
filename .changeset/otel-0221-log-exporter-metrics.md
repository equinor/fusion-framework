---
"@equinor/fusion-framework-module-analytics": patch
---

Internal: bump `@opentelemetry/api-logs`, `@opentelemetry/exporter-logs-otlp-http`, `@opentelemetry/otlp-exporter-base`, `@opentelemetry/otlp-transformer`, `@opentelemetry/sdk-logs` from `0.220.0` to `0.221.0` and `@opentelemetry/resources` from `2.9.0` to `2.10.0`.

`createOtlpNetworkExportDelegate` in `@opentelemetry/otlp-exporter-base@0.221.0` now requires an `ExporterMetrics` instance as its third argument. Updated `FusionOTLPLogExporter` to construct and pass one, matching the pattern used internally by the OpenTelemetry SDK's own OTLP log exporters.

---
"@equinor/fusion-framework-module-telemetry": patch
---

Internal: resolve fusion-lint warnings across the package — added missing TSDoc (`@returns`, `@param`, `@throws`, `@template`) on public APIs, added intent comments above control-flow and RxJS `.pipe()` chains, and split `parseTelemetryItem` and `TelemetryErrorEvent` into their own files to satisfy the single-export-per-file rule. No public behavior changes; `parseTelemetryItem` remains available from `@equinor/fusion-framework-module-telemetry/schemas` and `TelemetryErrorEvent` remains available from the package root.

The `initialize()` TODO for surfacing init-time telemetry items now references https://github.com/equinor/fusion-framework/issues/5112.

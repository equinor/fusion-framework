---
"@equinor/fusion-framework-module-telemetry": minor
---

Add a public `OtlpAdapter` at `@equinor/fusion-framework-module-telemetry/otlp-adapter`, backed by the standard OpenTelemetry OTLP/HTTP log exporter. Records include app identity, source, and active trace context. Export failures are reported once without blocking the app, and provider disposal flushes and shuts down supported adapters.

Records are batched with a one-second export delay to avoid concurrent-export failures during startup. Standalone consumers can call `forceFlush()` to export buffered records immediately.

Module disposal awaits provider disposal and every adapter's shutdown, so buffered exports finish before the lifecycle completes. Repeated disposal shares one promise; shutdown failures are reported through the module lifecycle after all adapters are attempted. Standalone providers should be disposed with `await provider.dispose()`.

OpenTelemetry packages are optional peer dependencies, required only for direct use of the OTLP adapter. Existing telemetry consumers do not need to install them.

Add optional fallback adapters for hierarchical telemetry. Parent fallback adapters skip records already handled by an explicitly configured child adapter, preserving existing parent adapters and relay behavior. This allows development exporters to defer to application-owned telemetry without double exporting.

Ref: equinor/fusion-core-tasks#2241.

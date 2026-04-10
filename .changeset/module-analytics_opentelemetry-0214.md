---
"@equinor/fusion-framework-module-analytics": patch
---

Internal: update OpenTelemetry dependencies (0.213.x → 0.214.x, resources 2.6.0 → 2.6.1).

Bumps all bundled OpenTelemetry packages used by the analytics module to the latest stable versions. Includes new features in the experimental packages (sampler and resource detection config, `OTEL_CONFIG_FILE` rename) and minor fixes. No changes to the public API surface of this module.

---
"@equinor/fusion-framework": minor
---

Capture safe terminal framework startup and ordinary module teardown outcomes from
host configuration, with an immutable lifecycle-local framework identity.
Capture is bounded and does not create an exporter. Set
`attachConfiguratorEvents: false` through `enableTelemetry` to disable it.

Register prepared telemetry configuration before user callbacks run.
`FrameworkConfigurator` accepts an optional telemetry configurator so the mock host
uses the same configuration, capture and provider pipeline without replacing module
factories.

Ref: #5803.

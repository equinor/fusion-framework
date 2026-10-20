---
"@equinor/fusion-framework": minor
---

Capture safe terminal framework startup and business teardown outcomes from the
telemetry-enable boundary, with an immutable lifecycle-local framework identity.
Capture is bounded and does not create an exporter. Set
`attachConfiguratorEvents: false` through `enableTelemetry` to disable it.

Ref: #5803.

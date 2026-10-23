---
"@equinor/fusion-framework-module-analytics": patch
---

Mark OTLP export requests with request-local diagnostic exclusion to prevent
shared HTTP telemetry from observing its own export traffic. Concurrent business
requests remain observable; no extra HTTP header or usage event is emitted.

Ref: #5803.

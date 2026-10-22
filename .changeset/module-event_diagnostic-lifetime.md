---
"@equinor/fusion-framework-module-event": patch
---

Keep the event provider alive through business and telemetry teardown so diagnostic
health reporting remains available while exporters flush and shut down.

Ref: #5803.

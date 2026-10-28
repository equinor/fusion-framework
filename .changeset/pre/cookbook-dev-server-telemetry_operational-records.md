---
"@equinor/fusion-framework-cookbook-app-react-dev-server-telemetry": patch
---

Demonstrate operational telemetry end to end against the Aspire dashboard: app host
lifecycle records, router navigation, HTTP request outcomes through
`createHttpTelemetry`, and an opt-in failed startup with `?fail-startup`. The README
lists the records to expect and shows that URLs never reach the collector. The Docker
Compose ports can be overridden with `ASPIRE_UI_PORT`, `ASPIRE_OTLP_GRPC_PORT` and
`ASPIRE_OTLP_HTTP_PORT`.

Ref: #5803.

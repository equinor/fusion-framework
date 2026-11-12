---
"@equinor/fusion-framework": minor
---

Capture safe terminal framework startup and ordinary module teardown outcomes from
host configuration, with an immutable lifecycle-local framework identity.
Capture is bounded and does not create an exporter. Set
`attachConfiguratorEvents: false` through `enableTelemetry` to disable it.

Register prepared telemetry configuration before user callbacks run.
`FrameworkConfigurator` accepts optional `FrameworkConfiguratorOptions` with a
`telemetry` configurator, so the mock host
uses the same configuration, capture and provider pipeline without replacing module
factories.

Record safe operational telemetry for every transport attempt of the framework's HTTP
clients. Each fetch attempt produces one `fusion.http.request.duration` metric with a
`success`, `failure` (rejected fetch or non-2xx response) or `cancelled` (aborted signal)
outcome, plus one sanitized `fusion.http.request.failure` on failure. URLs, headers,
bodies, tokens and original errors are never recorded; responses and errors are unchanged.

The HTTP middleware is appended after configuration callbacks, so retry middleware wraps it
and each retry is its own attempt. Exporter requests marked with
`markTelemetryExportRequest` are excluded, telemetry connects after initialization, and
no exporter is created. Opt out with `new FrameworkConfigurator({ httpTelemetry: false })`.

Refs #5803, #5804.

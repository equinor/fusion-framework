---
"@equinor/fusion-framework-module-services": minor
---

Record API client selection when the telemetry module is available. `ApiProvider` records
one `fusion.services.create-client.duration` metric per created client, for named,
service-discovery and custom factories, with one sanitized failure exception when no
client can be created. Service names, URIs and errors are never recorded; created clients
and thrown errors are unchanged. The provider gains an optional `connectTelemetry(telemetry)`
method, connected automatically after initialization.

Ref: #5804.

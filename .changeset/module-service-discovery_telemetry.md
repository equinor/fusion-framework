---
"@equinor/fusion-framework-module-service-discovery": minor
---

Record service discovery resolution outcomes when the telemetry module is available.
Each resolution produces one `fusion.service-discovery.resolve.duration` metric, with a
sanitized failure exception when it throws, and `cache-hit`, `fallback`, `cooldown` and
`unknown-service` notifications explain where the result came from. Keys, URIs, scopes and
errors are never recorded, and HTTP attempts are left to HTTP telemetry. A child host that
reuses its parent's client leaves reporting to the parent, so each resolution counts once.

`ServiceDiscoveryClient` exposes a safe `diagnostic$` stream and the provider an optional
`connectTelemetry(telemetry)` method; custom clients opt in by exposing `diagnostic$`.
Resolution results, caching, backoff and fallback behavior are unchanged.

Ref: #5804.

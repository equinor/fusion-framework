---
"@equinor/fusion-framework-module-service-discovery": minor
---

Record service discovery resolution outcomes when the telemetry module is available.
Each resolution not served from the cache produces one `fusion.service-discovery.resolve.duration`
metric, with a sanitized failure exception when it throws, and `fallback`, `cooldown` and
`unknown-service` notifications explain where the result came from. A resolution served from
the cache records only a `fusion.service-discovery.cache-hit` event at Debug level and no
duration metric, so hosts that export Information and above send nothing for cached lookups.
Keys, URIs, scopes and errors are never recorded, and HTTP attempts are left to HTTP
telemetry. A child host that reuses its parent's client leaves reporting to the parent, so
each resolution counts once.

`ServiceDiscoveryClient` exposes a safe `diagnostic$` stream and the provider an optional
`connectTelemetry(telemetry)` method; custom clients opt in by exposing `diagnostic$`.
Resolution results, caching, backoff and fallback behavior are unchanged.

The module now disposes the provider it created when the host disposes it, detaching
its diagnostics without disposing the shared discovery client.

Refs #5804, #5906.

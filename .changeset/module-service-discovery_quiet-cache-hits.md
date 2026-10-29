---
"@equinor/fusion-framework-module-service-discovery": patch
---

Reduce service discovery telemetry volume for cached lookups. A resolution served from the
cache now records only a `fusion.service-discovery.cache-hit` event at Debug level, and no
`fusion.service-discovery.resolve.duration` metric. Hosts that export Information and above
no longer send one or two Application Insights items per cached lookup. Network, fallback,
cooldown and unknown-service records are unchanged.

Fixes #5906.

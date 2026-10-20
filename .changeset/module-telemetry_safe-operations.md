---
"@equinor/fusion-framework-module-telemetry": major
---

Replace automatic raw configurator telemetry with bounded, sanitized operational
outcomes, preserving host origin, occurrence time and existing trace context across
asynchronous enrichment and nested routing.

**Migration:** dashboards using raw configurator names must query
`fusion.<module>.initialize.duration`, `fusion.<module>.dispose.duration`, and
`.failure` records instead. Built-in records no longer include arbitrary lifecycle
properties, original errors/stacks, dynamic metadata or custom default scopes.
Custom tracking retains its existing metadata behavior. Use
`enableTelemetry(configurator, { attachConfiguratorEvents: false })` to opt out.

Adapter initialization, synchronous/asynchronous processing, metadata, filters and
relay failures are isolated and reported out of band. Enrichment and processing are
bounded and shutdown awaits owned asynchronous work. Failed explicit exporters do not
activate ancestor fallback adapters.

Add optional `createHttpTelemetry` and `observeQueryTelemetry` integrations with
request-local export exclusions and separate scheduling/execution/cache semantics.
See the package's operational telemetry guide for schemas, limits and migration details.

Ref: #5803.

---
"@equinor/fusion-framework-module-telemetry": minor
---

Replace automatic raw configurator telemetry with bounded, sanitized operational
outcomes, preserving host origin, occurrence time and existing trace context across
asynchronous enrichment and nested routing.
Built-in records use a host-agnostic envelope: a lifecycle-local `hostId`, plus an
optional host-defined `source` kind, `hostName` and `hostVersion`. The module assumes
no host kind and does not default to `framework`; unclassified hosts emit records
without `source`. Source kinds are any lowercase kebab-case identifier, validated so
labels cannot carry dynamic data. Widget records omit widget manifest identity.

Export `TelemetryConfigurator` for host-owned configuration before initialization, and
`StartupCapture`, which captures a host's startup lifecycle before any provider exists.
Hosts create the capture, attach its records with `attachLifecycleItems`, and call
`capture.fail()` when their own setup fails; a failed startup is reported to the host's
parent without exporter ownership. Exporter ownership is declared configuration:
`setAdapter` with a non-fallback adapter or any `configureAdapter` factory owns
delivery, even if the factory later fails. `enableTelemetry` captures a plain
configurator's lifecycle unless its host already does; `attachConfiguratorEvents: false`
stops lifecycle records reaching the provider (the last call wins) but not the host's
own failure reporting. Custom stream errors are reported without stopping the
independently owned lifecycle subscription.

`TelemetryProvider` is now a thin facade over a `TelemetryProviderState` engine whose
initialization, disposal and health reporting run as `FlowSubject` flows; the
`ITelemetryProvider` contract is unchanged apart from the optional `source`.
`initialize()` and `dispose()` settle through actions delivered on the RxJS
`asyncScheduler`: under fake timers, advance timers (for example
`vi.advanceTimersByTimeAsync`) to settle them.

Export `createDiagnosticContext` for notifications without a measured duration,
alongside `createOperationalRecords` for measured outcomes, and the shared
`OperationalOutcome` type. Both validate module, operation and source kind as static
kebab-case identifiers; the diagnostic schema enforces the same rule.

**Migration:** dashboards using raw configurator names must query
`fusion.<module>.initialize.duration`, `fusion.<module>.dispose.duration`, and
`.failure` records instead. Built-in records no longer include arbitrary lifecycle
properties, original errors/stacks, dynamic metadata or custom default scopes.
Custom tracking retains its existing metadata behavior. Built-in records identify
the host through `fusion.diagnostic.hostName` and `fusion.diagnostic.source`, not
`fusion.app.key`; for app lifecycle records, query `hostName` where `source` is `app`.
Use `enableTelemetry(configurator, { attachConfiguratorEvents: false })` to opt out.

Adapter initialization, synchronous/asynchronous processing, metadata, filters and
relay failures are isolated and reported out of band. Enrichment and processing are
bounded and shutdown awaits owned asynchronous work. Failed explicit exporters do not
activate ancestor fallback adapters.

Add optional `createHttpTelemetry` and `observeQueryTelemetry` integrations with
request-local export exclusions and separate scheduling/execution/cache semantics.
See the package's operational telemetry guide for schemas, limits and migration details.

Ref: #5803.

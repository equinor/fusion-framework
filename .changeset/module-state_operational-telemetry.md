---
"@equinor/fusion-framework-module-state": minor
---

Report state persistence and synchronization health through host telemetry. Each
`getItem`, `getAllItems`, `storeItem(s)`, `removeItem(s)` and `clear` call records one
`fusion.state.<operation>.duration` outcome (`get`, `list`, `store`, `remove`,
`clear`) with an item count. Error results returned by storage are failures with
reason `storage-error` and a `failed` count. Synchronization is summarized in
one-minute reporting windows: the first `sync-status` transition into each status, the
first `sync-error` of each type, and one aggregated `sync-activity` summary per window,
so replication polling never emits per pull. Disconnecting telemetry releases the sync
observer, and reconnecting starts a fresh period. Keys, values, arguments and error messages are never included.

Returned promises settle exactly as before, and synchronous storage errors still throw
synchronously. The module now has a `dispose` hook that releases the provider's own
telemetry observers; storage itself is not disposed. Custom providers opt in through the
optional `IStateProvider.connectTelemetry` method.

`@equinor/fusion-framework-module-telemetry` is a new optional peer dependency. It is loaded only when host telemetry connects, so the module still imports and runs without it; `connectTelemetry` returns a promise that resolves once the connection applies.

Ref: #5805.

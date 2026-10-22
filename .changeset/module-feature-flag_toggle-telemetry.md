---
"@equinor/fusion-framework-module-feature-flag": minor
---

Report feature toggles through host telemetry. Each `toggleFeature`/`toggleFeatures`
call records one `fusion.feature-flag.toggle.duration` outcome with `requested`,
`applied`, `rejected` (unregistered or read-only) and `cancelled` (listener veto or
superseded listener work) counts. Bulk toggles retain their existing latest-only
application behavior and account for discarded pending listeners before exporting counts.
A request where listeners vetoed every applicable flag is `cancelled`;
a rejected dispatch is a failure, and the original rejection still reaches the caller.
A toggle still awaiting listeners at disposal is `cancelled` with reason `disposed`. The
module now disposes its provider at host teardown, which also releases plugin
connections and toggle listeners that were previously left attached.
Reads such as `hasFeature` and `getFeature` are not recorded, and feature keys and
values are never included.

Custom providers opt in through the optional `IFeatureFlagProvider.connectTelemetry`
method. Toggle behavior is unchanged.

Ref: #5805.

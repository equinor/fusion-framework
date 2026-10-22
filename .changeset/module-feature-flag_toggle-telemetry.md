---
"@equinor/fusion-framework-module-feature-flag": minor
---

Report feature toggles through host telemetry. Each `toggleFeature`/`toggleFeatures`
call records one `fusion.feature-flag.toggle.duration` outcome with `requested`,
`applied`, `rejected` (unregistered or read-only) and `cancelled` (listener veto)
counts. A request where listeners vetoed every applicable flag is `cancelled`;
a rejected dispatch is a failure, and the original rejection still reaches the caller.
Reads such as `hasFeature` and `getFeature` are not recorded, and feature keys and
values are never included.

Custom providers opt in through the optional `IFeatureFlagProvider.connectTelemetry`
method. Toggle behavior is unchanged.

Ref: #5805.

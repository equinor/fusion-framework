---
"@equinor/fusion-framework-module-context": minor
---

Report context selection through host telemetry. Each queued `setCurrentContext`
task records one `fusion.context.select.duration` outcome, and each resolution
attempt records `fusion.context.resolve.duration`: selection-driven, direct
`resolveContext`/`resolveContextAsync` calls and configured resolvers (`by: 'item'`),
and the lookup behind `setCurrentContextById` (`by: 'id'`). Validation failures without
resolution are failures with reason `validation`; a listener canceling
`onSetContextResolve`, `onSetContextResolved` or `onCurrentContextChange` is recorded
as `cancelled` with reason `listener`, never as a failure. Superseded, unsubscribed and
disposed tasks are `cancelled`; re-setting the current item without validation is
skipped work and records nothing. Context ids, titles and values are never included.

Custom providers opt in through the optional `IContextProvider.connectTelemetry` method.
Context behavior, results and thrown errors are unchanged.

Ref: #5805.

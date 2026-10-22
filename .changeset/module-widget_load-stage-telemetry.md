---
"@equinor/fusion-framework-module-widget": minor
---

Report widget loading through host telemetry. Each widget now records one
`fusion.widget.<stage>.duration` outcome for `load-manifest`, `load-config` and
`import`, plus a terminal `load` outcome for `initialize()`. Failures add one
sanitized `.failure` exception with a static reason code. Stages still running when
a widget is disposed are recorded as `cancelled` (reason `unloaded`), and a disposed
widget emits nothing more. Records carry only the validated widget key and version,
never configuration bodies, URLs or error messages.

Custom providers opt in through the optional `IWidgetModuleProvider.connectTelemetry`
method. Telemetry stays optional and never changes widget results or errors.

Ref: #5805.

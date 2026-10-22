---
"@equinor/fusion-framework-module-widget": minor
---

Report widget loading through host telemetry. Each widget now records one
`fusion.widget.<stage>.duration` outcome for `load-manifest`, `load-config` and
`import`, plus a `load` outcome for each `initialize()` subscription (`cancelled` when
the caller unsubscribes first). Failures add one sanitized `.failure` exception; stage
failures carry a static reason code. Stages still running when a widget is disposed are
recorded as `cancelled` (reason `unloaded`, or `disposed` when the widget module is
disposed), and a disposed widget emits nothing more. Records carry only the validated widget key and version,
never configuration bodies, URLs or error messages.

Custom providers opt in through the optional `IWidgetModuleProvider.connectTelemetry`
method. Telemetry stays optional and never changes widget results or errors.

Each stage is measured on its own request, so action creators, action shapes and flow
outputs are unchanged; the exported flow handlers only gain an optional trailing
per-request observer argument.

`@equinor/fusion-framework-module-telemetry` is a new optional peer dependency. It is loaded only when host telemetry connects, so the module still imports and runs without it; `connectTelemetry` returns a promise that resolves once the connection applies.

Ref: #5805.

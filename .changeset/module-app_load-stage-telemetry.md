---
"@equinor/fusion-framework-module-app": minor
---

Report application loading through host telemetry. Each app now records one
`fusion.app.<stage>.duration` outcome for `load-manifest`, `load-config`,
`load-settings`, `update-settings` and `import`, a `load` outcome for each
`initialize()` subscription (`cancelled` when the caller unsubscribes first), and
`unload` when the app is replaced or cleared, including a failed `unload` when module
teardown throws. Failures add one sanitized `.failure` exception; stage failures carry a
static reason code (`not-found`, `unauthorized`, `deleted`, `unknown` or `error`).
Superseded and unloaded stages are recorded as `cancelled`, and stages still in flight
when the app module is disposed are `cancelled` with reason `disposed`. Records carry only the validated app key and build version;
manifests, configuration, settings, URLs and error messages are never included.

Telemetry is connected after initialization through the new
`AppModuleProvider.connectTelemetry` method and is optional: loading results, errors
and cancellation are unchanged, and delivery failures are reported once locally.
Use telemetry adapter or relay filters on `diagnostic.module === 'app'` to exclude
these records.

Each stage is measured on its own request, so action creators, action shapes and flow
outputs are unchanged; the exported flow handlers only gain an optional trailing
per-request observer argument.

`@equinor/fusion-framework-module-telemetry` is a new optional peer dependency.

Ref: #5805.

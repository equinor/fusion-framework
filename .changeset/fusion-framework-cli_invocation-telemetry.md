---
"@equinor/fusion-framework-cli": minor
---

Add anonymous usage telemetry for CLI and plugin commands.

Each invocation sends one Application Insights request with the static command path, option names, exit code, outcome, duration, error type, OS, architecture, Node.js version, CI detection, the known target Fusion environment and a hashed machine id. Argument and option values, file paths, URLs, error messages, user names and tokens are never sent. Records are exported with `@azure/monitor-opentelemetry-exporter`, with no automatic collection, offline storage or SDK self-telemetry. Delivery is capped at 1.5 seconds and never changes the command's exit code, output or errors.

- Telemetry is on by default. Opt out with `FUSION_CLI_TELEMETRY_OPTOUT=1` (or `true`), `DO_NOT_TRACK=1` or `ffc telemetry disable`. `ffc telemetry status` shows the current state.
- The first interactive run prints a one-time notice on stderr. The notice is not shown in CI or non-interactive sessions.
- `FUSION_CLI_TELEMETRY_CONNECTION_STRING` overrides the default destination.
- While telemetry is enabled, requests to Fusion services carry a W3C `traceparent` that shares the invocation's operation id.

Refs: equinor/fusion-framework#5849, equinor/fusion-framework#5848

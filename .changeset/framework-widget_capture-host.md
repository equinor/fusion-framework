---
"@equinor/fusion-framework-widget": minor
---

Capture bounded widget lifecycle outcomes with a random host ID and manifest
name/version, inheriting eligible parent telemetry without creating an exporter.
Explicit widget exporters suppress ancestor fallback exporters, not ordinary
parent destinations. Preserve configuration failures while reporting safe diagnostics.

Ref: #5803.

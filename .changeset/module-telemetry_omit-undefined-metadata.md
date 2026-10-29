---
"@equinor/fusion-framework-module-telemetry": patch
---

`ApplicationInsightsAdapter` no longer exports `metadata: "undefined"` in
`customDimensions`. Records without metadata, including every built-in operational record,
now leave the `metadata` property out.

Fixes #5906.

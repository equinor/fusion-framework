---
"@equinor/fusion-framework-module-telemetry": patch
---

Internal: added an `@example` to each `parseTelemetryItem` overload (event, exception, metric, custom) instead of only on the implementation signature, since TypeScript only emits overload-signature TSDoc to `.d.ts` — the implementation's example was previously invisible in the published types and editor hover. No behavior change.

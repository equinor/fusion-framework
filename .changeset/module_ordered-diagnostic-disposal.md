---
"@equinor/fusion-framework-module": minor
---

Add `disposePriority` groups so business teardown completes before diagnostic sinks
flush, while retaining concurrent disposal within each group and idempotent teardown.
Emit measured host/module lifecycle outcomes and clean up successfully initialized
providers after sibling startup failures without replacing the original rejection.

Export `excludeDiagnostics(init)` and its request-local symbol marker for diagnostic
transports using shared HTTP middleware; no exclusion header is transmitted.

Ref: #5803.

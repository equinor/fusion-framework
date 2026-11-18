---
"@equinor/fusion-framework-module-telemetry": patch
---

Add `Measurement.dispose()` for explicit scope-exit measurement in browsers without `Symbol.dispose` or `using` support. Use `Symbol.for('Symbol.dispose')` as the symbolic disposal fallback without modifying browser globals, and report disposal failures without masking the original operation error.

---
"@equinor/fusion-framework-module-telemetry": patch
---

Replace the `deepmerge` dependency with a built-in metadata merge. This resolves the unpatched prototype-poisoning advisory GHSA-gcqx-w48m-w2h4: `__proto__` keys in metadata are now ignored. Class instances in metadata, such as `Error` objects, are now kept intact instead of being flattened into empty plain objects.

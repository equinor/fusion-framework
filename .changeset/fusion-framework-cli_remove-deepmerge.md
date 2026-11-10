---
"@equinor/fusion-framework-cli": patch
---

Replace the `deepmerge` dependency with a built-in merge for app config, app manifest, portal manifest and dev-server config. This resolves the unpatched prototype-poisoning advisory GHSA-gcqx-w48m-w2h4: `__proto__` keys in manifests or overrides are now ignored. Merge rules are unchanged: objects merge recursively, overrides win, and arrays are appended (app config `scopes` are replaced, and dev-server routes merge by `match`). Neither input is mutated, but nested values that are not overridden are now shared with the inputs instead of copied, and class instances such as `Date` or `URL` are kept intact instead of being copied into plain objects. The unused `is-mergeable-object` dependency is also removed.

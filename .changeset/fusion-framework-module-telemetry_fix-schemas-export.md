---
"@equinor/fusion-framework-module-telemetry": patch
---

Fix the `@equinor/fusion-framework-module-telemetry/schemas` sub-path export, which pointed at `dist/esm/schemas/index.js` instead of the emitted `dist/esm/schemas.js` and therefore never resolved.

Also import `deepmerge` through its package entry instead of `deepmerge/index.js`. The deep path loaded deepmerge's unbundled source, which requires `is-mergeable-object` — a package consumers do not install — so loading the telemetry module (and anything built on `@equinor/fusion-framework`) under native Node ESM failed with `Cannot find module 'is-mergeable-object'`.

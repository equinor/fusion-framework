---
"@equinor/fusion-framework-module-bookmark": patch
---

Fix native Node ESM loading of the package and its `/mock` sub-path: the `fast-deep-equal/es6` directory import now targets `fast-deep-equal/es6/index.js`, which Node can resolve.

Also remove the `@equinor/fusion-framework-module-bookmark/utils` sub-path export, which has pointed at a missing file since the bookmark rewrite.

---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Update rollup (4.59.0 → 4.60.1) used to produce the published bundles for both packages.

rollup 4.60.1 fixes a bug where side-effect imports could be silently dropped during bundling due to a namespace re-export caching issue ([rollup#6286](https://github.com/rollup/rollup/issues/6274)). Both packages use rollup to bundle their published output, so the fix ensures the emitted artifacts are correct.

No API or behaviour changes for consumers.

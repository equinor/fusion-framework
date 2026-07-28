---
"@equinor/fusion-framework-module-feature-flag": patch
---

Resolve fusion-lint warnings across the module: added missing TSDoc, added intent comments for control-flow and iterator/RxJS chains, and split `utils/selectors.ts`'s `findFeature` into its own file to satisfy `single-export-per-file`. `FeatureFlagModule.ts` was renamed to `feature-flag-module.ts` to match the repo's `*-module.ts` naming convention (no behavioral change).

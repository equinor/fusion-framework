---
"@equinor/fusion-framework-module-bookmark": patch
"@equinor/fusion-framework-module-widget": patch
"@equinor/fusion-framework-module-feature-flag": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-query": patch
"@equinor/fusion-observable": patch
"@equinor/fusion-framework-legacy-interopt": patch
---

Updated immer from 9.0.16 to 10.1.3 across all packages.

### Breaking Changes
- Immer 10.x introduces stricter TypeScript types for draft functions
- `ValidRecipeReturnType` type constraints have changed
- Promise return types in draft functions are no longer automatically handled

### Fixes Applied
- Updated BookmarkProvider to handle new immer type constraints
- Fixed ObservableInput type assignments in mergeScan operations
- Removed async/await from immer draft functions to comply with new type requirements

### Links
- [Immer 10.0.0 Release Notes](https://github.com/immerjs/immer/releases/tag/v10.0.0)
- [Immer Migration Guide](https://github.com/immerjs/immer/blob/main/MIGRATION.md)

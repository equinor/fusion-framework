---
"@equinor/fusion-framework-cli": patch
---

fix: improve dev server config merging for arrays of route objects

- Added a custom array merge strategy in `mergeDevServerConfig` to merge arrays of route objects by their `match` property, ensuring uniqueness and correct precedence.
- Other arrays are merged as unique sets.
- This prevents duplicate routes and ensures that overrides take precedence as expected.

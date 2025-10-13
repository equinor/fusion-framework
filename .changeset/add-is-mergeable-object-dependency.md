---
"@equinor/fusion-framework-cli": patch
---

Fix app development error by adding missing `is-mergeable-object` dependency

Added `is-mergeable-object` as a direct dependency to resolve runtime errors when using the CLI's app development features. This package is required by `deepmerge` but was not explicitly declared as a dependency, causing module resolution failures during app development.

**Changes:**
- Added `is-mergeable-object@^1.1.1` to dependencies in `packages/cli/package.json`

**Impact:**
- Fixes "Cannot find module 'is-mergeable-object'" errors during app development
- Ensures proper dependency resolution for CLI tools that use deepmerge functionality
- No breaking changes - this is purely a dependency fix
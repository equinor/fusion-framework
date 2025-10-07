---
"@equinor/fusion-framework-cli": patch
---

Fixed release annotations to always include CLI version and required metadata.

- Added `cliVersion` property to `ReleaseAnnotations` type
- Ensured annotations are always returned (removed undefined return type)
- Added fallback annotations for local builds with default values
- Improved type safety by making annotations consistently available

Thanks to @odinr for reporting in issue #3540.

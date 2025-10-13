---
"@equinor/fusion-framework-module-msal": minor
---

Refactored MSAL versioning module to use warnings instead of errors for version incompatibilities.

**Changes:**
- Removed `create-version-message.ts` and `static.ts` utility files
- Modified `resolveVersion()` to collect warnings for version mismatches instead of throwing errors
- Simplified `VersionError` class by removing factory methods and type enum references
- Updated tests to reflect new warning-based behavior

**Breaking Changes:**
- Version resolution now returns warnings for incompatible versions instead of throwing errors
- This change is backward compatible as existing code will continue to work, but error handling behavior has changed

**Migration:**
If your code previously caught `VersionError` exceptions for version incompatibilities, you should now check the `warnings` array in the resolution result instead.

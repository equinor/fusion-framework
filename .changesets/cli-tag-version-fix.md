---
"@equinor/fusion-framework-cli": patch
---

Fixed `--version` flag conflict in CLI tag commands and improved API consistency.

- **Fixed:** Resolved conflict between custom `--version` option and Commander's built-in `--version` flag that displays CLI version
- **Refactored:** Replaced separate `--appKey`/`--version` options with unified `--package name@version` syntax for both `app tag` and `portal tag` commands
- **Improved:** Enhanced error handling with clear validation messages for package format
- **Updated:** Documentation and help text to reflect new `--package` option usage
- **Added:** Better user feedback with colored logging for successful operations

**Breaking Changes:**
This introduces a breaking change to the CLI API by removing the `--version` and `--appKey` options in favor of the `--package` option. However, we're releasing this as a patch since:

1. The `--version` flag never worked properly due to the conflict with Commander's built-in version flag
2. The old API was fundamentally broken and unusable
3. Limited adoption in production environments means minimal impact
4. The same functionality is accessible through:
   - The `publish` command (recommended for standard releases)
   - The Fusion App Admin UI (graphical interface for release management)

**Migration:**
- Old: `fusion-framework-cli app tag --appKey my-app --version 1.2.3 latest`
- New: `fusion-framework-cli app tag --package my-app@1.2.3 latest`

This resolves the issue where `--version` would show CLI version (11.1.2) instead of using it as a bundle version parameter. Now `--version` correctly displays CLI version, and `--package` specifies the bundle to tag.

**Credits:** Special thanks to [@estoksam](https://github.com/estoksam) for identifying and reporting this CLI flag conflict issue.

**Fixes:** https://github.com/equinor/fusion/issues/652

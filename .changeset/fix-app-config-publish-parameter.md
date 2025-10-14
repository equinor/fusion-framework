---
"@equinor/fusion-framework-cli": patch
---

## Fix app config publish parameter

Fixed a bug in the `app config` command where the `config` parameter was incorrectly referenced as `options.config` when calling `publishAppConfig`. This was causing the publish functionality to fail when a custom config file path was provided.

### What Changed
- Corrected parameter passing in `packages/cli/src/cli/commands/app/config.ts`
- Changed `config: options.config` to `config` in the `publishAppConfig` call

### Impact
- The `ffc app config --publish` command now correctly uses the provided config file argument
- Fixes the issue where custom config files were not being passed to the publish function
- No breaking changes to the CLI interface

### Example
```bash
# This now works correctly with custom config files
ffc app config my-custom.config.ts --publish --manifest app.manifest.ts --env prod
```
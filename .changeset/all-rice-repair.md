---
"@equinor/fusion-imports": minor
---

This update to `@equinor/fusion-imports` improves error handling, enhances support for resolving multiple configuration file base names, and delivers structured results for import operations. Key enhancements include:

- Dedicated error classes for file-related issues
- Improved handling of script imports
- Robust file resolution mechanisms
  
Import handling now supports resolving scripts with imports from other modules, correctly resolving from the source directory or node_modules. Previously, imports were resolved only from memory, excluding the current working directory (cwd).

Note: This release includes breaking changes, requiring updates to dependent codebases.

**Added:**
- Introduced `FileNotFoundError` and `FileNotAccessibleError` classes to handle specific file-related errors.
- Added `processAccessError` utility to process file access errors and throw appropriate error types.
- Added support for resolving multiple base names in `resolveConfigFile`.
- Added `ImportConfigResult` type to provide structured results from `importConfig`.

**Changed:**
- Updated `importConfig` to return a structured result containing `path`, `extension`, and `config` instead of just the configuration object.
- Modified `importScript` to support custom output paths and handle memory-based builds when `write` is set to `false`.
- Enhanced `resolveConfigFile` to handle arrays of base names and throw `FileNotFoundError` for missing files.

**Fixed:**
- Fixed issues with `importScript` where missing files were not properly handled.
- Improved error handling for file access in `resolveConfigFile`.

**BREAKING CHANGES:**
- `importConfig` now returns an object of type `ImportConfigResult` instead of the raw configuration content. This change requires updates to all consumers of this function.
- `resolveConfigFile` now throws `FileNotFoundError` instead of a generic `Error` when no configuration file is found.
- `importScript` now uses `read-package-up` to determine the package-local path, which may affect the output location of bundled files.

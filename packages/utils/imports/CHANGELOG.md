# @equinor/fusion-imports

## 1.1.9

### Patch Changes

- [#3744](https://github.com/equinor/fusion-framework/pull/3744) [`b8ab0b7`](https://github.com/equinor/fusion-framework/commit/b8ab0b72d422996d38fae3e6d82cecfa77686487) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump read-package-up to 12.0.0 to align with upstream Node 20 requirement.

## 1.1.8

### Patch Changes

- [`41f8e9b`](https://github.com/equinor/fusion-framework/commit/41f8e9b7a9b2680553e089d04095a9db7821567e) Thanks [@odinr](https://github.com/odinr)! - Internal: upgrade build tooling dependency `esbuild` to 0.27.0 in `@equinor/fusion-imports`. No public API changes and no runtime impact to consumers.

## 1.1.7

### Patch Changes

- [#3750](https://github.com/equinor/fusion-framework/pull/3750) [`a768715`](https://github.com/equinor/fusion-framework/commit/a7687155c0666655afd932887e475415a7b76b31) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: update memfs from 4.50.0 to 4.51.0 to add sorting of files and folders in `toTreeSync()` output; improves test consistency and predictability.

## 1.1.6

### Patch Changes

- [`d8802e5`](https://github.com/equinor/fusion-framework/commit/d8802e5cd221e302529ea7d14e3c7c13734ad2eb) Thanks [@odinr](https://github.com/odinr)! - Internal: bump memfs from 4.48.1 to 4.50.0 to optimize buffer allocation and prevent O(n^2) overhead; no public API changes.

## 1.1.5

### Patch Changes

- [#3606](https://github.com/equinor/fusion-framework/pull/3606) [`fa12d3a`](https://github.com/equinor/fusion-framework/commit/fa12d3a2466a590a943d85c873f02bc45e8fba52) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump esbuild from 0.25.10 to 0.25.11

  - Add support for `with { type: 'bytes' }` imports (TC39 stage 2.7)
  - Lower CSS media query range syntax for older browsers
  - Update platform-specific binaries for better performance

## 1.1.4

### Patch Changes

- [#3437](https://github.com/equinor/fusion-framework/pull/3437) [`ff3ab8f`](https://github.com/equinor/fusion-framework/commit/ff3ab8fd64cacd9b0a691a696bb2a7c5187e2cf3) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated memfs from 4.42.0 to 4.46.0.

  - Patch update with internal improvements
  - No breaking changes to public API
  - All tests pass, build successful

## 1.1.3

### Patch Changes

- [#2910](https://github.com/equinor/fusion-framework/pull/2910) [`07cc985`](https://github.com/equinor/fusion-framework/commit/07cc9857e1427b574e011cc319518e701dba784d) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vitest from 2.1.9 to 3.2.4 across all packages.

  ## Breaking Changes

  - **Node.js Requirements**: Requires Node.js 18+ (already satisfied)
  - **Vite Compatibility**: Updated to work with Vite 7.x (already using Vite 7.1.5)
  - **Snapshot Format**: Snapshots now use backtick quotes (\`) instead of single quotes
  - **Coverage API**: New coverage methods `enableCoverage()` and `disableCoverage()`
  - **TypeScript Support**: Enhanced TypeScript integration and type definitions

  ## Security Updates

  - CVE-2025-24963: Browser mode serves arbitrary files (fixed in 2.1.9)
  - CVE-2025-24964: Remote Code Execution vulnerability (fixed in 2.1.9)

  ## Migration Notes

  - Test snapshots may need regeneration due to quote format changes
  - Some test configurations might need updates for new TypeScript support
  - Peer dependency warnings for @vitest/coverage-v8 are expected and safe to ignore

  ## Links

  - [Vitest 3.0 Migration Guide](https://vitest.dev/guide/migration)
  - [Vitest 3.2.4 Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v3.2.4)

## 1.1.2

### Patch Changes

- [#3324](https://github.com/equinor/fusion-framework/pull/3324) [`39188bf`](https://github.com/equinor/fusion-framework/commit/39188bfc84fe2b62f72b07acd58f10fe7149579c) Thanks [@odinr](https://github.com/odinr)! - Fixed incorrect repository directory reference in package.json.

  - Corrected the repository directory from "packages/utils/transpile" to "packages/utils/imports" to match the actual package location

- [#3324](https://github.com/equinor/fusion-framework/pull/3324) [`39188bf`](https://github.com/equinor/fusion-framework/commit/39188bfc84fe2b62f72b07acd58f10fe7149579c) Thanks [@odinr](https://github.com/odinr)! - Changed `esbuild` from `devDependency` to `dependency` to fix Yarn Plug and Play compatibility.

  - Fixes issue with Yarn Plug and Play where `@equinor/fusion-imports` tried to access esbuild but it wasn't declared in dependencies
  - Moved esbuild from devDependencies to dependencies to resolve the ambiguous require call

  Fixes: https://github.com/equinor/fusion/issues/641

- [#3325](https://github.com/equinor/fusion-framework/pull/3325) [`866d1c5`](https://github.com/equinor/fusion-framework/commit/866d1c52ab86aaa742605e401d8633bc032efeb2) Thanks [@odinr](https://github.com/odinr)! - Fixed Windows compatibility issue with ESM loader when importing bundled scripts.

  - Added `pathToFileURL` conversion before importing bundled scripts to prevent `ERR_UNSUPPORTED_ESM_URL_SCHEME` errors on Windows
  - Windows absolute paths like `C:\path\to\file.js` are now properly converted to `file:///C:/path/to/file.js` URLs before being passed to the ESM loader
  - This ensures cross-platform compatibility for dynamic imports in the CLI and build tools

  The fix addresses the root cause of Windows ESM loader errors where Node.js would interpret Windows drive letters as URL protocols.

  This fixes https://github.com/equinor/fusion/issues/642

  The issue affects not only Windows but any environment where file paths contain characters that ESM might interpret as URL components (e.g., paths with special characters, drive letters, or percent-encoded characters).

## 1.1.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Updated the `files` field in `package.json` to include both `dist` and `src` directories. No other changes were made.

## 1.1.1-next.1

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 1.1.1-next.0

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`d9a7ada`](https://github.com/equinor/fusion-framework/commit/d9a7ada786bfac3a0714f38c1379b5aac09a0f71) Thanks [@odinr](https://github.com/odinr)! - Updated the `files` field in `package.json` to include both `dist` and `src` directories. No other changes were made.

## 1.1.0

### Minor Changes

- [#3034](https://github.com/equinor/fusion-framework/pull/3034) [`e13592b`](https://github.com/equinor/fusion-framework/commit/e13592b8437914b36b9ea163affb5425c6372b38) Thanks [@odinr](https://github.com/odinr)! - This update to `@equinor/fusion-imports` improves error handling, enhances support for resolving multiple configuration file base names, and delivers structured results for import operations. Key enhancements include:

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

## 1.0.0

### Major Changes

- [#2921](https://github.com/equinor/fusion-framework/pull/2921) [`37b7f21`](https://github.com/equinor/fusion-framework/commit/37b7f21b6c8742be5e92e54ec1faa8eaba61e2a6) Thanks [@odinr](https://github.com/odinr)! - The `@equinor/fusion-imports` package introduces utility functions to simplify handling imports in your projects. This release includes the following features:

  - Resolves configuration files by searching for TypeScript, JavaScript, and JSON files in order.
  - Supports custom resolution logic via the `script.resolve` option.
  - Automatically resolves `module.default` when available.

  - Dynamically loads script modules at runtime using EsBuild.
  - Supports a subset of `EsBuild.BuildOptions` for customization.
  - Ideal for transpiling and executing external scripts in runtime environments.

  - Reads and parses JSON files directly from disk.

  These utilities are designed to enhance workflows for dynamic configuration loading, runtime script execution, and JSON handling.

  For more details, refer to the [README](./README.md).

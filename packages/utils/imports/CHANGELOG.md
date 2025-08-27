# @equinor/fusion-imports

## 1.1.1-next.2

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`a29edcd`](https://github.com/equinor/fusion-framework/commit/a29edcdaa36c9f987f08101fc711ef036417a960) Thanks [@odinr](https://github.com/odinr)! - Updated the `files` field in `package.json` to include both `dist` and `src` directories. No other changes were made.

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

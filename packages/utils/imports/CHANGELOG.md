# @equinor/fusion-imports

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

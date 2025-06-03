# @equinor/fusion-framework-dev-portal

## 1.0.0-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`84c16d7`](https://github.com/equinor/fusion-framework/commit/84c16d74c3235f809ce4c3e75868be12010ed695) Thanks [@odinr](https://github.com/odinr)! - Add `prepack` script to `dev-portal` and `dev-server` packages

  - Added a `prepack` script to `@equinor/fusion-framework-dev-portal` and `@equinor/fusion-framework-dev-server` to ensure the build runs before packaging.
  - This helps guarantee that the latest build artifacts are included when publishing these packages.

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - This release introduces a new package, `@equinor/fusion-framework-dev-portal`, as part of a refactor of the `@equinor/fusion-framework-cli`.
  The refactor moves specific functionality and code related to the development portal into its own dedicated package to improve modularity and maintainability.

  Additionally, this update includes improved documentation and examples for better user guidance.

  This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and is not intended for direct use in production.
  The main purpose of this package is to provide a development portal for the Fusion framework, allowing developers to easily set up and test their applications in a local environment.

  Even though this package can be used as standalone, it is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

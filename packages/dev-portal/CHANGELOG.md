# @equinor/fusion-framework-dev-portal

## 1.0.2

### Patch Changes

- [#3332](https://github.com/equinor/fusion-framework/pull/3332) [`8c88574`](https://github.com/equinor/fusion-framework/commit/8c885745ee345cd7ef219b2cc469fd19c8687467) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump dotenv from 16.6.1 to 17.2.2

## 1.0.1

### Patch Changes

- [#3298](https://github.com/equinor/fusion-framework/pull/3298) [`6480bf1`](https://github.com/equinor/fusion-framework/commit/6480bf197db9428fed80299c235f0608db0ca6a3) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/eds-core-react from 0.43.0 to 0.48.0

- [#3306](https://github.com/equinor/fusion-framework/pull/3306) [`113a9ac`](https://github.com/equinor/fusion-framework/commit/113a9ac9b11f4cdb09dad22cbea010a3f5097343) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @vitejs/plugin-react from 4.7.0 to 5.0.2.

## 1.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - This release introduces a new package, `@equinor/fusion-framework-dev-portal`, as part of a refactor of the `@equinor/fusion-framework-cli`.
  The refactor moves specific functionality and code related to the development portal into its own dedicated package to improve modularity and maintainability.

  **Features**

  - Development portal for the Fusion framework
  - Support for MSAL authentication
  - Integration with service discovery
  - Environment variable configuration

  This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and while it can be used standalone, it is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.

  **Read More**

  For more detailed information, usage examples, and advanced configuration, please refer to the [GitHub README](https://github.com/equinor/fusion-framework/tree/main/packages/dev-portal/README.md) for this package.

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

## 1.0.0-next.3

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 1.0.0-next.2

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`ba060b7`](https://github.com/equinor/fusion-framework/commit/ba060b7a5fcc4f84891cb416b4d2f7fde231a368) Thanks [@odinr](https://github.com/odinr)! - migrate build system from Rollup to Vite

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

# @equinor/fusion-framework-cookbook-app-react-environment-variables

## 1.0.6-preview.2

### Patch Changes

- [#3702](https://github.com/equinor/fusion-framework/pull/3702) [`999d81d`](https://github.com/equinor/fusion-framework/commit/999d81d9151505009d75457cf252e3c74cf64e52) Thanks [@github-actions](https://github.com/apps/github-actions)! - relase next of all packages

## 1.0.6-next.1

### Patch Changes

- [`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded) Thanks [@odinr](https://github.com/odinr)! - relase next of all packages

## 1.0.6-next.0

### Patch Changes

- [#3693](https://github.com/equinor/fusion-framework/pull/3693) [`995dc50`](https://github.com/equinor/fusion-framework/commit/995dc5059fc8fa5121630b3d10a0d7ea833947e2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improved all cookbook README documentation for better developer experience.

  All cookbook README files now feature:

  - Code examples matching actual implementations
  - Inline comments explaining patterns and concepts
  - Developer-friendly language for those new to Fusion Framework
  - Focus on what each cookbook demonstrates rather than generic setup
  - Proper TSDoc comments in code blocks
  - Removed installation sections in favor of teaching patterns

  This improves the learning experience for developers exploring framework features through the 18 available cookbooks.

## 1.0.5

## 1.0.5-next.1

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 1.0.5-next.0

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - fixed package.json main to point to dist

## 1.0.4

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

## 1.0.3

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

## 1.0.2

### Patch Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Cleaned up app config

  Removed `app.config.*` from the cookbook apps to prevent confusion when using the cookbook apps as a template for new apps.

## 1.0.1

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

## 1.0.0

### Major Changes

- [#2180](https://github.com/equinor/fusion-framework/pull/2180) [`060a1aa`](https://github.com/equinor/fusion-framework/commit/060a1aa7f4f2ce6b1ddef527a219bf267e488500) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-cookbook-app-react-environment-variables

  This new cookbook demonstrates how to use the `useAppEnvironmentVariables` hook to access environment variables in a Fusion Framework React application.

  The cookbook uses the newly created hook `useAppEnvironmentVariables` from `@equinor/fusion-framework-react-app` which retrieve environment variables from the application's configuration.

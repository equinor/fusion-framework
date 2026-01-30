# Change Log

## 4.1.8-next.0

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8) Thanks [@odinr](https://github.com/odinr)! - Migrate cookbook from `@remix-run/router` to `@equinor/fusion-framework-react-router`.

  Updated the bookmark-advanced cookbook to use the new React Router DSL API:
  - Replaced `NavigationProvider.createRouter()` with `Router` component from `@equinor/fusion-framework-react-router`
  - Migrated route definitions to use DSL functions (`layout`, `index`, `route`) from `@equinor/fusion-framework-react-router/routes`
  - Added `Root.tsx` component using the new layout pattern
  - Added `enableBookmark` configuration

  This cookbook now serves as an example of the recommended routing pattern for Fusion Framework applications.

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b), [`75c068f`](https://github.com/equinor/fusion-framework/commit/75c068fea13c32435ac26bd9043cc156482bfaf1), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8)]:
  - @equinor/fusion-framework-react-router@1.0.0-next.0

## 4.1.7

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Improved all cookbook README documentation for better developer experience.

  All cookbook README files now feature:
  - Code examples matching actual implementations
  - Inline comments explaining patterns and concepts
  - Developer-friendly language for those new to Fusion Framework
  - Focus on what each cookbook demonstrates rather than generic setup
  - Proper TSDoc comments in code blocks
  - Removed installation sections in favor of teaching patterns

  This improves the learning experience for developers exploring framework features through the 18 available cookbooks.

## 4.1.6

## 4.1.6-next.1

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 4.1.6-next.0

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - fixed package.json main to point to dist

## 4.1.5

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

## 4.1.4

### Patch Changes

- [#2855](https://github.com/equinor/fusion-framework/pull/2855) [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1) Thanks [@odinr](https://github.com/odinr)! - fixed `useExhaustiveDependencies`

- [#2850](https://github.com/equinor/fusion-framework/pull/2850) [`44bf009`](https://github.com/equinor/fusion-framework/commit/44bf00943dc585ad646d5f271e6767662abae2b1) Thanks [@odinr](https://github.com/odinr)! - refactored code to conform with Biome `useButtonType`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

## 4.1.3

### Patch Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Cleaned up app config

  Removed `app.config.*` from the cookbook apps to prevent confusion when using the cookbook apps as a template for new apps.

## 4.1.2

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

## 4.1.1

### Patch Changes

- [#2182](https://github.com/equinor/fusion-framework/pull/2182) [`13d1ae4`](https://github.com/equinor/fusion-framework/commit/13d1ae4cf2147cd2a4527bad2a7023b4ac4b9bbb) Thanks [@odinr](https://github.com/odinr)! - updated all cookbooks to use `workspace:^` as a dependency version.

## 4.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

## 4.0.25

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 4.0.24

### Patch Changes

- [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - fixed broken imports after updating to react@18

## 4.0.23

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

## 4.0.22

### Patch Changes

- [#1058](https://github.com/equinor/fusion-framework/pull/1058) [`4eadd69f`](https://github.com/equinor/fusion-framework/commit/4eadd69f24dc69623086d40aa367a5c8e67b6518) Thanks [@odinr](https://github.com/odinr)! - Update dependency: @remix-run/router@^1.7.2

## 4.0.21

### Patch Changes

- [#955](https://github.com/equinor/fusion-framework/pull/955) [`b0310b3b`](https://github.com/equinor/fusion-framework/commit/b0310b3b3668f72bdc973e5fee50118dbe17823f) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Remove leading `/` in package's main property for the cookbooks.

## 4.0.20

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.0.19

### Patch Changes

- [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - **add build script**
  this is not required, but nice to know that cookbooks builds...

## 4.0.18

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**
  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.16...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.17) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.15...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.16) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.14...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.15) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.13...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.14) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## 4.0.13 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.11...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.12) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.10...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.11) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.9...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.8...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.9) (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## 4.0.8 (2023-05-09)

### Bug Fixes

- **cookbooks:** remove strict mode as it is not needed for React 18 ([eda33e4](https://github.com/equinor/fusion-framework/commit/eda33e4d0e6c67e3da964599167a9db6e1eadf0a))

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.6...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.5...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## 4.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## 4.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.2...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.1...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.0...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.17...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@4.0.0) (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.16...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.17) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.13...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.16) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.13...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.15) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.13...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.14) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.12...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.13) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.11...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.12) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.10...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.11) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.9...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.10) (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.8...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.9) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.6...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.8) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.6...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.7) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.5...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.6) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.4...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.5) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.3...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.4) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.2...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.3) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.1...@equinor/fusion-framework-cookbook-app-react-bookmark-advanced@3.1.2) (2023-03-24)

### Bug Fixes

- **bookmark-cookbook:** enable shear bookmark ([f7af56d](https://github.com/equinor/fusion-framework/commit/f7af56d3f7b99a7a3c13073e0bb89fe46f9dd148))

## 3.1.1 (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-bookmark-advanced

## 3.1.0 (2023-03-22)

### Features

- Adding an advanced cookbook fro bookmark with router ([90fd3ca](https://github.com/equinor/fusion-framework/commit/90fd3ca34349072b38bdef3f7d72c135f431ab8f))
- advance bookmark example work initial commit ([6aa3e29](https://github.com/equinor/fusion-framework/commit/6aa3e2914608e41e85ce97c69fd7873df52fa592))

### Bug Fixes

- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

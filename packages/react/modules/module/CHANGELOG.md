# Change Log

## 3.0.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 3.0.3

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-module@4.2.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 3.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@2.0.1...@equinor/fusion-framework-react-module@2.0.2) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.1.2...@equinor/fusion-framework-react-module@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.1.2...@equinor/fusion-framework-react-module@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.1.2 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.1.1 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.1.0 (2022-11-17)

### Features

-   update typing of useModule hook ([958dd04](https://github.com/equinor/fusion-framework/commit/958dd0401667e9ebb1a51bced128ae43369cd6c4))

## 1.0.15 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.14 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.13 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.12 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.11 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.9...@equinor/fusion-framework-react-module@1.0.10) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.9 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.7...@equinor/fusion-framework-react-module@1.0.8) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.7 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.6 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.4...@equinor/fusion-framework-react-module@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.3...@equinor/fusion-framework-react-module@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.2...@equinor/fusion-framework-react-module@1.0.3) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.1...@equinor/fusion-framework-react-module@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.1-next.1...@equinor/fusion-framework-react-module@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.1-next.0...@equinor/fusion-framework-react-module@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@1.0.0...@equinor/fusion-framework-react-module@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

-   **react-module:** config is now object

### Features

-   **react-module:** update configurator ([9105abd](https://github.com/equinor/fusion-framework/commit/9105abd8458a5f1ea04fa46cd1a4bb86596a2346))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@0.2.5...@equinor/fusion-framework-react-module@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

-   **react-module:** config is now object

### Features

-   **react-module:** update configurator ([9105abd](https://github.com/equinor/fusion-framework/commit/9105abd8458a5f1ea04fa46cd1a4bb86596a2346))

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@0.2.4...@equinor/fusion-framework-react-module@0.2.5) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@0.2.3...@equinor/fusion-framework-react-module@0.2.4) (2022-09-05)

### Bug Fixes

-   **react-module:** fix typing of refs ([0df08fc](https://github.com/equinor/fusion-framework/commit/0df08fc00990a5c93b851f2c00175c7996f15845))

## 0.2.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## 0.2.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module@0.2.0...@equinor/fusion-framework-react-module@0.2.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-react-module

# 0.2.0 (2022-08-11)

-   feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

-   module.initialize now has object as arg

# 0.1.0 (2022-08-05)

### Features

-   **react-module:** initial ([#192](https://github.com/equinor/fusion-framework/issues/192)) ([368614b](https://github.com/equinor/fusion-framework/commit/368614b2c7bd43fad21b17ba709a42cad6e84319))

# Change Log

## 4.0.1

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module-http@5.1.1
    -   @equinor/fusion-framework-react-module@3.0.6

## 4.0.0

### Patch Changes

-   Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa)]:
    -   @equinor/fusion-framework-module-http@5.1.0

## 3.0.5

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-http@5.0.6
    -   @equinor/fusion-framework-react-module@3.0.5

## 3.0.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
    -   @equinor/fusion-framework-react-module@3.0.4
    -   @equinor/fusion-framework-module-http@5.0.5

## 3.0.3

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 3.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 2.0.4 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@2.0.2...@equinor/fusion-framework-react-module-http@2.0.3) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 2.0.2 (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.1.9...@equinor/fusion-framework-react-module-http@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.1.9...@equinor/fusion-framework-react-module-http@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.9 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.8 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.7 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.1.5...@equinor/fusion-framework-react-module-http@1.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.5 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.4 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.3 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.2 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.1 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.0 (2022-11-17)

### Features

-   update typing of useModule hook ([958dd04](https://github.com/equinor/fusion-framework/commit/958dd0401667e9ebb1a51bced128ae43369cd6c4))

## 1.0.19 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.18 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.17 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.16 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.15 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.11...@equinor/fusion-framework-react-module-http@1.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.10 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.8...@equinor/fusion-framework-react-module-http@1.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.8 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.5...@equinor/fusion-framework-react-module-http@1.0.6) (2022-09-16)

### Bug Fixes

-   **module-http:** improve hierarchy ([3603347](https://github.com/equinor/fusion-framework/commit/36033474991288983490f250726a551f7ce3dcbd))

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.4...@equinor/fusion-framework-react-module-http@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.3...@equinor/fusion-framework-react-module-http@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.2...@equinor/fusion-framework-react-module-http@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.1...@equinor/fusion-framework-react-module-http@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.1-next.1...@equinor/fusion-framework-react-module-http@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.1-next.0...@equinor/fusion-framework-react-module-http@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.0...@equinor/fusion-framework-react-module-http@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@0.1.3...@equinor/fusion-framework-react-module-http@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@0.1.2...@equinor/fusion-framework-react-module-http@0.1.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@0.1.1...@equinor/fusion-framework-react-module-http@0.1.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 0.1.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 0.1.0 (2022-09-05)

### Features

-   **rect-module-http:** create hook for using http client ([7a88b7a](https://github.com/equinor/fusion-framework/commit/7a88b7aeb246bc37c3a10927beaa2ec48f8515fc))

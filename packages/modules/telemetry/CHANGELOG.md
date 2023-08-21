# Change Log

## 4.0.1

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-framework-module-msal@3.0.5

## 4.0.0

### Major Changes

-   [#884](https://github.com/equinor/fusion-framework/pull/884) [`c36bbc6a`](https://github.com/equinor/fusion-framework/commit/c36bbc6a05169a08e85132697a8178227984eee0) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @microsoft/applicationinsights-web from 2.8.9 to 3.0.2

    This module is not yet been implemented by portal, bumping version and fix potential breaking changes when implementing

    see **[breaking changes from `@microsoft/applicationinsights-web`](https://microsoft.github.io/ApplicationInsights-JS/upgrade/v3_BreakingChanges.html)**

### Patch Changes

-   Updated dependencies [[`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
    -   @equinor/fusion-framework-module@4.2.2

## 3.0.8

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework-module@4.2.1
    -   @equinor/fusion-framework-module-msal@3.0.4

## 3.0.7

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-module@4.2.0
    -   @equinor/fusion-framework-module-msal@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.6 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 3.0.5 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 3.0.4 (2023-04-18)

### Bug Fixes

-   **services:** update-api-provider-types,,added som missing types,,@equinor/fusion-framework-app v7.0.3 packages/app ([994188b](https://github.com/equinor/fusion-framework/commit/994188bbc727bc10a924eeb4d8178763a4c27ac7))
-   update github action ([0a0860a](https://github.com/equinor/fusion-framework/commit/0a0860ad23ed33d5df73aac08710076901e3e958))

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@3.0.2...@equinor/fusion-framework-module-telemetry@3.0.3) (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@3.0.1...@equinor/fusion-framework-module-telemetry@3.0.2) (2023-04-18)

### Bug Fixes

-   update release action ([c73d7c6](https://github.com/equinor/fusion-framework/commit/c73d7c61e228b62810a6d1a8f32b438f78ec6f74))

## 3.0.1 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@2.0.0...@equinor/fusion-framework-module-telemetry@2.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.23...@equinor/fusion-framework-module-telemetry@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.23...@equinor/fusion-framework-module-telemetry@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.23 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.22 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.21 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.20 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.19 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.18 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.17 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.16 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.15 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.11...@equinor/fusion-framework-module-telemetry@1.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.10 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.8...@equinor/fusion-framework-module-telemetry@1.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.8 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.5...@equinor/fusion-framework-module-telemetry@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.4...@equinor/fusion-framework-module-telemetry@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.3...@equinor/fusion-framework-module-telemetry@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.2...@equinor/fusion-framework-module-telemetry@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.1...@equinor/fusion-framework-module-telemetry@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.1-next.1...@equinor/fusion-framework-module-telemetry@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.1-next.0...@equinor/fusion-framework-module-telemetry@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.0...@equinor/fusion-framework-module-telemetry@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.3.5...@equinor/fusion-framework-module-telemetry@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.5 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.3 (2022-08-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.3.0...@equinor/fusion-framework-module-telemetry@0.3.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.16...@equinor/fusion-framework-module-telemetry@0.3.0) (2022-08-11)

-   feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

-   module.initialize now has object as arg

## 0.2.16 (2022-08-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.14...@equinor/fusion-framework-module-telemetry@0.2.15) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.13...@equinor/fusion-framework-module-telemetry@0.2.14) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.2.13 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.11...@equinor/fusion-framework-module-telemetry@0.2.12) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.10...@equinor/fusion-framework-module-telemetry@0.2.11) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.9...@equinor/fusion-framework-module-telemetry@0.2.10) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.8...@equinor/fusion-framework-module-telemetry@0.2.9) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.7...@equinor/fusion-framework-module-telemetry@0.2.8) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.6...@equinor/fusion-framework-module-telemetry@0.2.7) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.5...@equinor/fusion-framework-module-telemetry@0.2.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.2.5 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.3...@equinor/fusion-framework-module-telemetry@0.2.4) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.2...@equinor/fusion-framework-module-telemetry@0.2.3) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.1...@equinor/fusion-framework-module-telemetry@0.2.2) (2022-06-13)

### Bug Fixes

-   **module-telemetry:** change operator ([dcc1284](https://github.com/equinor/fusion-framework/commit/dcc12841639c789af2d4f9282f758e3d8223c676))

## 0.2.1 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

# 0.2.0 (2022-06-10)

### Features

-   **module:** allow modules to have deps ([#128](https://github.com/equinor/fusion-framework/issues/128)) ([2466b1a](https://github.com/equinor/fusion-framework/commit/2466b1ad9d43aa472da9daf8c59b350844c0dae9))

## 0.1.10 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.8...@equinor/fusion-framework-module-telemetry@0.1.9) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.1.8 (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.6...@equinor/fusion-framework-module-telemetry@0.1.7) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.5...@equinor/fusion-framework-module-telemetry@0.1.6) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.4...@equinor/fusion-framework-module-telemetry@0.1.5) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.3...@equinor/fusion-framework-module-telemetry@0.1.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.2...@equinor/fusion-framework-module-telemetry@0.1.3) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.1.2 (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

# 0.1.0 (2022-02-07)

### Bug Fixes

-   **module-telemetry:** fix namechange of msal ([daea24f](https://github.com/equinor/fusion-framework/commit/daea24fc0af9eaba96d63361b4da3f30c99c9b8f))
-   **module-telemetry:** remove unused packages ([2ad74cc](https://github.com/equinor/fusion-framework/commit/2ad74cc6d8e0330e7724069c9cbcdb13a2f41b85))

### Features

-   add module for telemetry ([3960165](https://github.com/equinor/fusion-framework/commit/39601651665516985c4f31726363b42eee1adcae))

# Change Log

## 1.0.9

### Patch Changes

-   Updated dependencies [[`e539e606`](https://github.com/equinor/fusion-framework/commit/e539e606d04bd8b7dc0c0bfed7cd4a7731996936)]:
    -   @equinor/fusion-framework-module-service-discovery@7.0.9

## 1.0.8

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4
    -   @equinor/fusion-query@3.0.7
    -   @equinor/fusion-framework-module-event@4.0.5
    -   @equinor/fusion-framework-module-http@5.0.6
    -   @equinor/fusion-framework-module-service-discovery@7.0.8

## 1.0.7

### Patch Changes

-   Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
    -   @equinor/fusion-query@3.0.6
    -   @equinor/fusion-framework-module-service-discovery@7.0.7

## 1.0.6

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
    -   @equinor/fusion-framework-module-service-discovery@7.0.6
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-framework-module-event@4.0.4
    -   @equinor/fusion-framework-module-http@5.0.5
    -   @equinor/fusion-query@3.0.5

## 1.0.5

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 1.0.4

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@1.0.2...@equinor/fusion-framework-module-widget@1.0.3) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 1.0.2 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 1.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 1.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.10 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.8...@equinor/fusion-framework-module-widget@0.0.9) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.7...@equinor/fusion-framework-module-widget@0.0.8) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.6...@equinor/fusion-framework-module-widget@0.0.7) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.5...@equinor/fusion-framework-module-widget@0.0.6) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.4...@equinor/fusion-framework-module-widget@0.0.5) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.4 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.3 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.2 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

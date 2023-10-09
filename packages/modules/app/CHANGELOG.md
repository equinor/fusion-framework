# Change Log

## 5.2.8

### Patch Changes

-   Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
    -   @equinor/fusion-query@4.0.3

## 5.2.7

### Patch Changes

-   [#1305](https://github.com/equinor/fusion-framework/pull/1305) [`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9) Thanks [@odinr](https://github.com/odinr)! - fixed duplicate calls from flows

    alignment after changes to `@equinor/fusion-query`

-   Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
    -   @equinor/fusion-query@4.0.2

## 5.2.6

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-observable@8.1.2
    -   @equinor/fusion-query@4.0.1

## 5.2.5

### Patch Changes

-   Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
    -   @equinor/fusion-query@4.0.0

## 5.2.4

### Patch Changes

-   Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
    -   @equinor/fusion-observable@8.1.1
    -   @equinor/fusion-query@3.0.7

## 5.2.3

### Patch Changes

-   Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
    -   @equinor/fusion-query@3.0.6

## 5.2.2

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-observable@8.1.0
    -   @equinor/fusion-query@3.0.5

## 5.2.1

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 5.2.0

### Minor Changes

-   [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - Create and expose interface for App

    -   deprecate [AppModuleProvider.createApp](https://github.com/equinor/fusion-framework/blob/cf08d5ae3cef473e5025fd973a2a7a45a3b22dee/packages/modules/app/src/AppModuleProvider.ts#L171)

    this should not create any breaking changes since apps was only created from provider.
    if the class is still needed it can be imported:

    ```ts
    import { App } from '@equinor/fusion-framework-module-app/app';
    ```

-   [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - Allow updating manifest of application

    -   add meta data for `setManifest` action to flag if `merge` or `replace`
    -   add method on `App` to update manifest, _default flag `merge`_
    -   check in state reducer if `setManifest` action is `update` or `merge`
    -   update flow `handleFetchManifest` to prop passing of flag

## 5.1.3

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@5.1.1...@equinor/fusion-framework-module-app@5.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 5.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 5.1.0 (2023-05-22)

### Features

-   **module-app:** allow type hinting modules and env ([c80be46](https://github.com/equinor/fusion-framework/commit/c80be46c3c16a40b53506c29debfe6196ea7d945))

## 5.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 5.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 4.0.8 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.6...@equinor/fusion-framework-module-app@4.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.5...@equinor/fusion-framework-module-app@4.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.4...@equinor/fusion-framework-module-app@4.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.3...@equinor/fusion-framework-module-app@4.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.2...@equinor/fusion-framework-module-app@4.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 4.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 4.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.5...@equinor/fusion-framework-module-app@4.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.5...@equinor/fusion-framework-module-app@4.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.5 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [3.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.3...@equinor/fusion-framework-module-app@3.2.4) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [3.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.2...@equinor/fusion-framework-module-app@3.2.3) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.2 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.1 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.0 (2023-01-10)

### Features

-   make app state sync ([c8b4567](https://github.com/equinor/fusion-framework/commit/c8b456743ff5b2b397ce928a1006936cb8de5488))

## 3.1.0 (2023-01-04)

### Features

-   **module-app:** allow clearing current app ([c7f4c14](https://github.com/equinor/fusion-framework/commit/c7f4c144c29c2c40df42eafcdaabfb8214e1e88d))

## 3.0.0 (2023-01-04)

### ⚠ BREAKING CHANGES

-   **module-app:** manifest prop rename

### Bug Fixes

-   **module-app:** rename `appKey` to `key` ([9ee97b1](https://github.com/equinor/fusion-framework/commit/9ee97b149b9167a3747da371de76490e287d9514))

## 2.8.1 (2022-12-21)

### Bug Fixes

-   **module-app:** fix typo ([7db0811](https://github.com/equinor/fusion-framework/commit/7db08113697761ecfa75b5684272e6244ec9e137))

## 2.8.0 (2022-12-21)

### Features

-   **module-app:** expose current state of app ([accb084](https://github.com/equinor/fusion-framework/commit/accb08477416541beaa39574ff966ab2784ad430))

## [2.7.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.7.0...@equinor/fusion-framework-module-app@2.7.1) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.7.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.6.0...@equinor/fusion-framework-module-app@2.7.0) (2022-12-16)

### Features

-   **module-app:** expose config builder ([ed0fe34](https://github.com/equinor/fusion-framework/commit/ed0fe34c6ba67c1487b1d4087a5bddb7e8eaf3c8))

### Bug Fixes

-   **module-app:** fix import ([4b08ae1](https://github.com/equinor/fusion-framework/commit/4b08ae1ec2316142961d464b4be9346fc9403430))

## [2.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.5.0...@equinor/fusion-framework-module-app@2.6.0) (2022-12-16)

### Features

-   **module-app:** add app events ([f302a89](https://github.com/equinor/fusion-framework/commit/f302a8986042567129737d181f376e0fded418f0))

## 2.5.0 (2022-12-14)

### Features

-   **module-app:** update manifest interface ([ba740ef](https://github.com/equinor/fusion-framework/commit/ba740ef6f7a37eb72b1386d929cc27bf0530218a))

### Bug Fixes

-   **module-app:** correct import and exports ([d9de2d7](https://github.com/equinor/fusion-framework/commit/d9de2d71cb2521fb4b38843e54a4928646294df8))
-   **module-app:** fix key for fetching all manifest ([2df1815](https://github.com/equinor/fusion-framework/commit/2df18159d1128546b801c374f419b1e9528ca8c2))
-   **module-app:** make app module optional ([fa5c0ed](https://github.com/equinor/fusion-framework/commit/fa5c0ed0a9afc1f9ade3adb6e52e4425a59a7aa6))

## [2.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.3.0...@equinor/fusion-framework-module-app@2.4.0) (2022-12-12)

### Features

-   **module-app:** allow creating app instance ([d2d3080](https://github.com/equinor/fusion-framework/commit/d2d3080f4822fefca5df5a4a1ce46f138095d567))

## 2.3.0 (2022-12-12)

### Features

-   **module-app:** add config builder ([0fe107c](https://github.com/equinor/fusion-framework/commit/0fe107c87a129c6e63044e6298914cdfc4e0d626))

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.6...@equinor/fusion-framework-module-app@2.2.0) (2022-12-12)

### Features

-   create instance container for application ([d5cbd74](https://github.com/equinor/fusion-framework/commit/d5cbd74b89cd9cba0dabef4a62f585c72e3c14be))
-   **module-app:** load javascript modules ([bb3d2a1](https://github.com/equinor/fusion-framework/commit/bb3d2a1cb00b5753462094ebdf24c8ba3c614c9f))

## [2.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.5...@equinor/fusion-framework-module-app@2.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.4...@equinor/fusion-framework-module-app@2.1.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.3...@equinor/fusion-framework-module-app@2.1.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.2...@equinor/fusion-framework-module-app@2.1.3) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.1...@equinor/fusion-framework-module-app@2.1.2) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.0...@equinor/fusion-framework-module-app@2.1.1) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.0.1...@equinor/fusion-framework-module-app@2.1.0) (2022-12-05)

### Features

-   **context-selector:** header type contextselector and appcheck ([8ab0a50](https://github.com/equinor/fusion-framework/commit/8ab0a50e3f7ea3487796735c868f2e65d84fecd2))

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.0.1...@equinor/fusion-framework-module-app@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.0.0...@equinor/fusion-framework-module-app@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.11...@equinor/fusion-framework-module-app@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.11...@equinor/fusion-framework-module-app@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.10...@equinor/fusion-framework-module-app@1.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.9...@equinor/fusion-framework-module-app@1.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.8...@equinor/fusion-framework-module-app@1.5.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.7...@equinor/fusion-framework-module-app@1.5.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.6...@equinor/fusion-framework-module-app@1.5.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.5...@equinor/fusion-framework-module-app@1.5.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.4...@equinor/fusion-framework-module-app@1.5.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.3...@equinor/fusion-framework-module-app@1.5.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.2...@equinor/fusion-framework-module-app@1.5.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.1...@equinor/fusion-framework-module-app@1.5.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.0...@equinor/fusion-framework-module-app@1.5.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.4.4...@equinor/fusion-framework-module-app@1.5.0) (2022-12-01)

### Features

-   **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 1.4.4 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.4.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.4.2...@equinor/fusion-framework-module-app@1.4.3) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.4.2 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.4.0...@equinor/fusion-framework-module-app@1.4.1) (2022-11-18)

### Bug Fixes

-   **module-app:** fallback to portal ([6778624](https://github.com/equinor/fusion-framework/commit/67786241c809e27d60a2411dd6bffba315d5f3a3))

## 1.4.0 (2022-11-17)

### Features

-   **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.3.0...@equinor/fusion-framework-module-app@1.3.1) (2022-11-14)

### Bug Fixes

-   **module-app:** throw error when config or app not loading ([e4bd23a](https://github.com/equinor/fusion-framework/commit/e4bd23a4071bd68334aeaed9ed9ea12cac93222c))

## 1.3.0 (2022-11-14)

### Features

-   **module-app:** add app loader ([0ef0b71](https://github.com/equinor/fusion-framework/commit/0ef0b71de27f1dccc757aa7eceea558072a1db60))

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.6...@equinor/fusion-framework-module-app@1.2.0) (2022-11-14)

### Features

-   update packages to use observable ([98024aa](https://github.com/equinor/fusion-framework/commit/98024aa466c68f03bd793bd564cf7b6bf65def72))

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.5...@equinor/fusion-framework-module-app@1.1.6) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.4...@equinor/fusion-framework-module-app@1.1.5) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.1.4 (2022-11-11)

### Bug Fixes

-   **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 1.1.3 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.1...@equinor/fusion-framework-module-app@1.1.2) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.1.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.1.0 (2022-11-01)

### Features

-   **module-app:** initial app module ([ce5aed1](https://github.com/equinor/fusion-framework/commit/ce5aed124431afbe55b9cf11a50a5c8d5499260e))

## 1.0.12 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.11 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.9...@equinor/fusion-framework-module-app@1.0.10) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.9 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.7...@equinor/fusion-framework-module-app@1.0.8) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.7 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.6 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.4...@equinor/fusion-framework-module-app@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.3...@equinor/fusion-framework-module-app@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.2...@equinor/fusion-framework-module-app@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.1...@equinor/fusion-framework-module-app@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.1-next.1...@equinor/fusion-framework-module-app@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.1-next.0...@equinor/fusion-framework-module-app@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.0...@equinor/fusion-framework-module-app@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.17...@equinor/fusion-framework-module-app@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.17 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.16 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.15 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.13...@equinor/fusion-framework-module-app@0.1.14) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.13 (2022-08-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.11...@equinor/fusion-framework-module-app@0.1.12) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.11 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.9...@equinor/fusion-framework-module-app@0.1.10) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.8...@equinor/fusion-framework-module-app@0.1.9) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.7...@equinor/fusion-framework-module-app@0.1.8) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.6...@equinor/fusion-framework-module-app@0.1.7) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.5...@equinor/fusion-framework-module-app@0.1.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.4...@equinor/fusion-framework-module-app@0.1.5) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.4 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.3 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.2 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

# 0.1.0 (2022-02-07)

### Features

-   add module for application loading ([61d4e5f](https://github.com/equinor/fusion-framework/commit/61d4e5fa0df6308155bf830e68d902cecb8146c2))

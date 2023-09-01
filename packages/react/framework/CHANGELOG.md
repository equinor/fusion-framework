# Change Log

## 5.2.7

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.0.19
    -   @equinor/fusion-framework-react-module-signalr@2.0.7

## 5.2.6

### Patch Changes

-   Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4), [`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-observable@8.1.1
    -   @equinor/fusion-framework-module@4.2.4
    -   @equinor/fusion-framework@7.0.18
    -   @equinor/fusion-framework-react-module-http@3.0.5
    -   @equinor/fusion-framework-react-module-signalr@2.0.6

## 5.2.5

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.0.17
    -   @equinor/fusion-framework-react-module-signalr@2.0.5

## 5.2.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-react-module-signalr@2.0.4
    -   @equinor/fusion-framework-react-module-http@3.0.4
    -   @equinor/fusion-observable@8.1.0
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-framework@7.0.16

## 5.2.3

### Patch Changes

-   [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

    only style semantics updated

## 5.2.2

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework@7.0.15

## 5.2.1

### Patch Changes

-   [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - update typing to typescript 5

    provider from `createFrameworkProvider` was missing typehint of children

## 5.2.0

### Minor Changes

-   [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - Create and expose interface for App

    -   deprecate [AppModuleProvider.createApp](https://github.com/equinor/fusion-framework/blob/cf08d5ae3cef473e5025fd973a2a7a45a3b22dee/packages/modules/app/src/AppModuleProvider.ts#L171)

    this should not create any breaking changes since apps was only created from provider.
    if the class is still needed it can be imported:

    ```ts
    import { App } from '@equinor/fusion-framework-module-app/app';
    ```

## 5.1.4

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework@7.0.14
    -   @equinor/fusion-framework-react-module-context@6.0.9
    -   @equinor/fusion-framework-react-module-http@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.1.2...@equinor/fusion-framework-react@5.1.3) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.1.1...@equinor/fusion-framework-react@5.1.2) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.1.0...@equinor/fusion-framework-react@5.1.1) (2023-05-22)

### Bug Fixes

-   **react-framework:** expose useCurrentAppModules ([785d5eb](https://github.com/equinor/fusion-framework/commit/785d5eb08963d5ba1a007573879908b33e52fb3f))

## 5.1.0 (2023-05-22)

### Features

-   **react-framework:** add hook for using current app modules ([2d65464](https://github.com/equinor/fusion-framework/commit/2d654647b84e03d1c6e322509885d8bfa2b9142f))
-   **react-framework:** enhance `useCurrentApp` ([60026c9](https://github.com/equinor/fusion-framework/commit/60026c918c5033137cc359665074ea65c11a34fb))

## [5.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.10...@equinor/fusion-framework-react@5.0.11) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.9...@equinor/fusion-framework-react@5.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.8...@equinor/fusion-framework-react@5.0.9) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.8 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.6...@equinor/fusion-framework-react@5.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.5...@equinor/fusion-framework-react@5.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.2...@equinor/fusion-framework-react@5.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.1...@equinor/fusion-framework-react@5.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.0...@equinor/fusion-framework-react@5.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.12 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.11 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.10 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.9 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.7...@equinor/fusion-framework-react@4.0.8) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.7 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.6 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.4...@equinor/fusion-framework-react@4.0.5) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.4 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.2...@equinor/fusion-framework-react@4.0.3) (2023-03-06)

### Bug Fixes

-   **useApps:** hiding hidden apps ([7f1354f](https://github.com/equinor/fusion-framework/commit/7f1354fd72cd7b02715e67b8274b4c8185397012))

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.1...@equinor/fusion-framework-react@4.0.2) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.0...@equinor/fusion-framework-react@4.0.1) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.2.0...@equinor/fusion-framework-react@4.0.0) (2023-02-13)

### ⚠ BREAKING CHANGES

-   **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

-   **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
-   **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## [3.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.4...@equinor/fusion-framework-react@3.2.0) (2023-02-09)

### Features

-   (framework): person provider ([d4a3936](https://github.com/equinor/fusion-framework/commit/d4a3936d6a60f093f71eac1dacc05cd60c7bf554))

## 3.1.4 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [3.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.2...@equinor/fusion-framework-react@3.1.3) (2023-02-01)

### Bug Fixes

-   **framework-react:** make params for useApps optional ([9e3fce1](https://github.com/equinor/fusion-framework/commit/9e3fce16cb1abfea8ae77239078efa2b1b0f52c2))

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.0...@equinor/fusion-framework-react@3.1.2) (2023-02-01)

### Bug Fixes

-   **framework-app:** exporting hooks useApps and useAppProvider ([fd62fb3](https://github.com/equinor/fusion-framework/commit/fd62fb35667730d6d1f915bab4fc0c9bd8f6152b))

## [3.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.0...@equinor/fusion-framework-react@3.1.1) (2023-02-01)

### Bug Fixes

-   **framework-app:** exporting hooks useApps and useAppProvider ([fd62fb3](https://github.com/equinor/fusion-framework/commit/fd62fb35667730d6d1f915bab4fc0c9bd8f6152b))

## 3.1.0 (2023-02-01)

### Features

-   hooks useApps and useAppProvider ([bfa61a2](https://github.com/equinor/fusion-framework/commit/bfa61a2f01e70880f5a90e5184454ca40033ce71))

## 3.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.2.0...@equinor/fusion-framework-react@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.2.0...@equinor/fusion-framework-react@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.7...@equinor/fusion-framework-react@2.2.0) (2023-01-26)

### Features

-   **framework-react:** expose hook for signalr ([e807202](https://github.com/equinor/fusion-framework/commit/e807202e32e1031c7feb6e8ec1d30b3ed4336f35))

## 2.1.7 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.5...@equinor/fusion-framework-react@2.1.6) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.4...@equinor/fusion-framework-react@2.1.5) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.1.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.2...@equinor/fusion-framework-react@2.1.3) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.1...@equinor/fusion-framework-react@2.1.2) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.1.1 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.1.0 (2023-01-04)

### Features

-   **module-app:** allow clearing current app ([c7f4c14](https://github.com/equinor/fusion-framework/commit/c7f4c144c29c2c40df42eafcdaabfb8214e1e88d))

## 2.0.25 (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.23...@equinor/fusion-framework-react@2.0.24) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.22...@equinor/fusion-framework-react@2.0.23) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.0.22 (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.20...@equinor/fusion-framework-react@2.0.21) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.19...@equinor/fusion-framework-react@2.0.20) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.18...@equinor/fusion-framework-react@2.0.19) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.17...@equinor/fusion-framework-react@2.0.18) (2022-12-14)

### Bug Fixes

-   remove deprecated hooks ([af5586f](https://github.com/equinor/fusion-framework/commit/af5586f563e32c1e7e577a3e6837be610a135fc9))

## [2.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.16...@equinor/fusion-framework-react@2.0.17) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.15...@equinor/fusion-framework-react@2.0.16) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.0.15 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.13...@equinor/fusion-framework-react@2.0.14) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.12...@equinor/fusion-framework-react@2.0.13) (2022-12-12)

### Bug Fixes

-   **framework-react:** update hooks ([cd8b0cd](https://github.com/equinor/fusion-framework/commit/cd8b0cd580cd90a35392ccefb8e306700e903ce1))

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.11...@equinor/fusion-framework-react@2.0.12) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.10...@equinor/fusion-framework-react@2.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.9...@equinor/fusion-framework-react@2.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.8...@equinor/fusion-framework-react@2.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.7...@equinor/fusion-framework-react@2.0.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.6...@equinor/fusion-framework-react@2.0.7) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.5...@equinor/fusion-framework-react@2.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.4...@equinor/fusion-framework-react@2.0.5) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.3...@equinor/fusion-framework-react@2.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.1...@equinor/fusion-framework-react@2.0.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.1...@equinor/fusion-framework-react@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.0...@equinor/fusion-framework-react@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.32...@equinor/fusion-framework-react@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.32...@equinor/fusion-framework-react@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.32](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.31...@equinor/fusion-framework-react@1.3.32) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.30...@equinor/fusion-framework-react@1.3.31) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.29...@equinor/fusion-framework-react@1.3.30) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.28...@equinor/fusion-framework-react@1.3.29) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.27...@equinor/fusion-framework-react@1.3.28) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.26...@equinor/fusion-framework-react@1.3.27) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.25...@equinor/fusion-framework-react@1.3.26) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.24...@equinor/fusion-framework-react@1.3.25) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.23...@equinor/fusion-framework-react@1.3.24) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.22...@equinor/fusion-framework-react@1.3.23) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.21...@equinor/fusion-framework-react@1.3.22) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.20...@equinor/fusion-framework-react@1.3.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.19...@equinor/fusion-framework-react@1.3.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.19 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.17...@equinor/fusion-framework-react@1.3.18) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.17 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.15...@equinor/fusion-framework-react@1.3.16) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.14...@equinor/fusion-framework-react@1.3.15) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.14 (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.12...@equinor/fusion-framework-react@1.3.13) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.11...@equinor/fusion-framework-react@1.3.12) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.11 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.9...@equinor/fusion-framework-react@1.3.10) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.8...@equinor/fusion-framework-react@1.3.9) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.7...@equinor/fusion-framework-react@1.3.8) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.7 (2022-11-11)

### Bug Fixes

-   **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 1.3.6 (2022-11-03)

### Bug Fixes

-   deprecate useFramework from hooks ([d3d9b24](https://github.com/equinor/fusion-framework/commit/d3d9b24fe56937e2c9feba7de4228d8eb1cbbec5))

## [1.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.4...@equinor/fusion-framework-react@1.3.5) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.3...@equinor/fusion-framework-react@1.3.4) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.2...@equinor/fusion-framework-react@1.3.3) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.1...@equinor/fusion-framework-react@1.3.2) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.0...@equinor/fusion-framework-react@1.3.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.0 (2022-11-02)

### Features

-   **framework-react:** create hook for current context ([4ee803f](https://github.com/equinor/fusion-framework/commit/4ee803fd0e457c3ec7414b35100e12186327fb6f))
-   **framework-react:** react tooling for context ([b530114](https://github.com/equinor/fusion-framework/commit/b53011475a9c1a25b4e0756b66b57fd9b5711bbd))

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.2.0...@equinor/fusion-framework-react@1.2.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.1.1...@equinor/fusion-framework-react@1.2.0) (2022-11-01)

### Features

-   **framework-react:** expose app hooks ([46c1ea2](https://github.com/equinor/fusion-framework/commit/46c1ea28f88cb3dd0ff350a589850c5cd9a45a88))

## 1.1.1 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.17...@equinor/fusion-framework-react@1.1.0) (2022-10-27)

### Features

-   :sparkles: expose a single element for setup framework ([154e09f](https://github.com/equinor/fusion-framework/commit/154e09f027b7dea3015eb860fa530ce0f45dfa61))

## 1.0.17 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.15...@equinor/fusion-framework-react@1.0.16) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.14...@equinor/fusion-framework-react@1.0.15) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.14 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.12...@equinor/fusion-framework-react@1.0.13) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.12 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.9...@equinor/fusion-framework-react@1.0.10) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.8...@equinor/fusion-framework-react@1.0.9) (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.8 (2022-09-26)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.5...@equinor/fusion-framework-react@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.4...@equinor/fusion-framework-react@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.3...@equinor/fusion-framework-react@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.2...@equinor/fusion-framework-react@1.0.3) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.1...@equinor/fusion-framework-react@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.1-next.1...@equinor/fusion-framework-react@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.1-next.0...@equinor/fusion-framework-react@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.0...@equinor/fusion-framework-react@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

-   **framework-react:** config is now object

### Features

-   **framework-react:** update init ([f3e6e2b](https://github.com/equinor/fusion-framework/commit/f3e6e2ba7058b4b515ff0838516fe44705bfdf5c))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.3.3...@equinor/fusion-framework-react@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

-   **framework-react:** config is now object

### Features

-   **framework-react:** update init ([f3e6e2b](https://github.com/equinor/fusion-framework/commit/f3e6e2ba7058b4b515ff0838516fe44705bfdf5c))

## [0.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.3.2...@equinor/fusion-framework-react@0.3.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.3.1...@equinor/fusion-framework-react@0.3.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.3.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.3.0 (2022-09-05)

### Features

-   **framework-react:** expose rect module http ([f6ab26f](https://github.com/equinor/fusion-framework/commit/f6ab26f2c4463ce9d0996027a48eb5ad9d94779a))

## [0.2.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.18...@equinor/fusion-framework-react@0.2.19) (2022-08-29)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.2.18 (2022-08-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.16...@equinor/fusion-framework-react@0.2.17) (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.2.16 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.14...@equinor/fusion-framework-react@0.2.15) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.13...@equinor/fusion-framework-react@0.2.14) (2022-08-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.2.13 (2022-08-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.11...@equinor/fusion-framework-react@0.2.12) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.10...@equinor/fusion-framework-react@0.2.11) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.9...@equinor/fusion-framework-react@0.2.10) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.8...@equinor/fusion-framework-react@0.2.9) (2022-07-06)

### Bug Fixes

-   **framework-react:** remove legacy path ([fa82188](https://github.com/equinor/fusion-framework/commit/fa82188a7471a82fafacf26a1fc50a1703fe3944))

## [0.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.7...@equinor/fusion-framework-react@0.2.8) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.6...@equinor/fusion-framework-react@0.2.7) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.5...@equinor/fusion-framework-react@0.2.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.4...@equinor/fusion-framework-react@0.2.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.3...@equinor/fusion-framework-react@0.2.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.2...@equinor/fusion-framework-react@0.2.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.1...@equinor/fusion-framework-react@0.2.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.0...@equinor/fusion-framework-react@0.2.1) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.19...@equinor/fusion-framework-react@0.2.0) (2022-06-24)

### Features

-   **framework:** allow addtional modules ([d8d697b](https://github.com/equinor/fusion-framework/commit/d8d697b6fa8ea5c8130b324195d39f354d2fa768))

## [0.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.18...@equinor/fusion-framework-react@0.1.19) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.17...@equinor/fusion-framework-react@0.1.18) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.16...@equinor/fusion-framework-react@0.1.17) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.15...@equinor/fusion-framework-react@0.1.16) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.15 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.14 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.13 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.11...@equinor/fusion-framework-react@0.1.12) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.10...@equinor/fusion-framework-react@0.1.11) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.9...@equinor/fusion-framework-react@0.1.10) (2022-03-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.8...@equinor/fusion-framework-react@0.1.9) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.7...@equinor/fusion-framework-react@0.1.8) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.6...@equinor/fusion-framework-react@0.1.7) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.5...@equinor/fusion-framework-react@0.1.6) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.4...@equinor/fusion-framework-react@0.1.5) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.3...@equinor/fusion-framework-react@0.1.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.2...@equinor/fusion-framework-react@0.1.3) (2022-02-15)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.1...@equinor/fusion-framework-react@0.1.2) (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.1 (2022-02-09)

### Bug Fixes

-   **framework-react:** export Fusion ([94b150f](https://github.com/equinor/fusion-framework/commit/94b150ff9d1b5ad27c12f19160371edb464c88de))

# 0.1.0 (2022-02-07)

### Bug Fixes

-   **framework-react:** typehint ([75d3793](https://github.com/equinor/fusion-framework/commit/75d37936aca967d17d192977337bae99f6aea277))
-   **framework-react:** update name change ([e2382b7](https://github.com/equinor/fusion-framework/commit/e2382b70a7d7a8cd103cb33c2a839c5a34e315c9))
-   memo http clients ([f876acb](https://github.com/equinor/fusion-framework/commit/f876acb11e19d7802a28f58ce7d70bc76f777c5e))
-   **react:** fix typing ([9a2a51d](https://github.com/equinor/fusion-framework/commit/9a2a51dd76ed68ef95ef5c932555ae31165f16c2))
-   shared context ([f00732e](https://github.com/equinor/fusion-framework/commit/f00732ee3c1016be812204c7cf7b0205b2322075))

### Features

-   add package for creating framework in react ([3b6858d](https://github.com/equinor/fusion-framework/commit/3b6858dc9f6b8c0efd6aa51275693e068ac72bef))
-   **react-app:** add hooks ([9bfcc5e](https://github.com/equinor/fusion-framework/commit/9bfcc5ebd721b19232e7896cee037637c716f09a))

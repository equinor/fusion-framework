# Change Log

## 3.1.5

### Patch Changes

-   Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
    -   @equinor/fusion-framework-module@4.3.5

## 3.1.4

### Patch Changes

-   Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
    -   @equinor/fusion-framework-module@4.3.4

## 3.1.3

### Patch Changes

-   Updated dependencies [[`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
    -   @equinor/fusion-framework-module@4.3.3

## 3.1.2

### Patch Changes

-   [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

-   [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

    Removing the `removeComments` option allows TypeScript to preserve comments in the compiled JavaScript output. This can be beneficial for several reasons:

    1. Improved debugging: Preserved comments can help developers understand the code better during debugging sessions.
    2. Documentation: JSDoc comments and other important code documentation will be retained in the compiled output.
    3. Source map accuracy: Keeping comments can lead to more accurate source maps, which is crucial for debugging and error tracking.

    No action is required from consumers of the library. This change affects the build process and doesn't introduce any breaking changes or new features.

    Before:

    ```json
    {
        "compilerOptions": {
            "module": "ES2022",
            "target": "ES6",
            "incremental": true,
            "removeComments": true,
            "preserveConstEnums": true,
            "sourceMap": true,
            "moduleResolution": "node"
        }
    }
    ```

    After:

    ```json
    {
        "compilerOptions": {
            "module": "ES2022",
            "target": "ES6",
            "incremental": true,
            "preserveConstEnums": true,
            "sourceMap": true,
            "moduleResolution": "node"
        }
    }
    ```

    This change ensures that comments are preserved in the compiled output, potentially improving the development and debugging experience for users of the Fusion Framework.

-   Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
    -   @equinor/fusion-framework-module@4.3.2

## 3.1.1

### Patch Changes

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
    -   @equinor/fusion-framework-module@4.3.1

## 3.1.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0

## 3.0.10

### Patch Changes

-   Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    -   @equinor/fusion-framework-module@4.2.7

## 3.0.9

### Patch Changes

-   [#1646](https://github.com/equinor/fusion-framework/pull/1646) [`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1) Thanks [@odinr](https://github.com/odinr)! - re-export `AuthenticationResult` from `@azure/msal-browser`

## 3.0.8

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-module@4.2.6

## 3.0.7

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module@4.2.5

## 3.0.6

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4

## 3.0.5

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 3.0.4

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework-module@4.2.1

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

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 3.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@2.0.0...@equinor/fusion-framework-module-msal@2.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.23...@equinor/fusion-framework-module-msal@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.23...@equinor/fusion-framework-module-msal@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.23 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.22 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.21 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.20 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.19 (2022-11-11)

### Bug Fixes

-   **module-msal:** await redirect handling ([92686d2](https://github.com/equinor/fusion-framework/commit/92686d2ae054d7f507093b839edb2fe5775c7449))

## 1.0.18 (2022-11-11)

### Bug Fixes

-   **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 1.0.17 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.16 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.15 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.11...@equinor/fusion-framework-module-msal@1.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.10 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.8...@equinor/fusion-framework-module-msal@1.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.8 (2022-09-27)

### Bug Fixes

-   update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.5...@equinor/fusion-framework-module-msal@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.4...@equinor/fusion-framework-module-msal@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.3...@equinor/fusion-framework-module-msal@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.2...@equinor/fusion-framework-module-msal@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.1...@equinor/fusion-framework-module-msal@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.1-next.1...@equinor/fusion-framework-module-msal@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.1-next.0...@equinor/fusion-framework-module-msal@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@1.0.0...@equinor/fusion-framework-module-msal@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 1.0.0 (2022-09-12)

### Features

-   **module-msal:** expose simple config ([596c4c2](https://github.com/equinor/fusion-framework/commit/596c4c222a75bfef67e2e129792f6132cbceb47c))

### Bug Fixes

-   **module-msal:** set default logging to errors ([1b53be8](https://github.com/equinor/fusion-framework/commit/1b53be816600c838257f0b3c6f3a338466938a3f))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.4.2...@equinor/fusion-framework-module-msal@1.0.0-alpha.0) (2022-09-12)

### Features

-   **module-msal:** expose simple config ([596c4c2](https://github.com/equinor/fusion-framework/commit/596c4c222a75bfef67e2e129792f6132cbceb47c))

### Bug Fixes

-   **module-msal:** set default logging to errors ([1b53be8](https://github.com/equinor/fusion-framework/commit/1b53be816600c838257f0b3c6f3a338466938a3f))

## 0.4.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.4.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.4.0 (2022-08-29)

### ⚠ BREAKING CHANGES

-   rename fetch

-   fix(module-service-discovery): update http client consumer

-   build: update allowed branches

-   build: add conventional commit

-   build: use conventionalcommits

-   build(module-http): push major

-   build: update deps

### Features

-   rename fetch method ([#226](https://github.com/equinor/fusion-framework/issues/226)) ([f02df7c](https://github.com/equinor/fusion-framework/commit/f02df7cdd2b9098b0da49c5ea56ac3b6a17e9e32))

## 0.3.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.3.0...@equinor/fusion-framework-module-msal@0.3.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.2.0...@equinor/fusion-framework-module-msal@0.3.0) (2022-08-11)

-   feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

-   module.initialize now has object as arg

# 0.2.0 (2022-08-08)

### Features

-   **module-service-discovery:** resolve service to config ([3fa088d](https://github.com/equinor/fusion-framework/commit/3fa088d2ced8136447df6949928f1af9fc83407a))

## [0.1.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.23...@equinor/fusion-framework-module-msal@0.1.24) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.22...@equinor/fusion-framework-module-msal@0.1.23) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.22 (2022-08-01)

### Bug Fixes

-   change typo of exports ([b049503](https://github.com/equinor/fusion-framework/commit/b049503511fb1b37b920b00aed1468ed8385a67e))

## [0.1.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.20...@equinor/fusion-framework-module-msal@0.1.21) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.19...@equinor/fusion-framework-module-msal@0.1.20) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.18...@equinor/fusion-framework-module-msal@0.1.19) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.17...@equinor/fusion-framework-module-msal@0.1.18) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.16...@equinor/fusion-framework-module-msal@0.1.17) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.15...@equinor/fusion-framework-module-msal@0.1.16) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.14...@equinor/fusion-framework-module-msal@0.1.15) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.14 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.13 (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.12 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.11 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.10 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.8...@equinor/fusion-framework-module-msal@0.1.9) (2022-03-25)

### Bug Fixes

-   **module-msal:** prevent redirect loop ([2d0f57c](https://github.com/equinor/fusion-framework/commit/2d0f57c737282f485099ff2562b4c4c956f8e30a))

## 0.1.8 (2022-03-25)

### Bug Fixes

-   **modules-msal:** change regex group selector ([ebaa118](https://github.com/equinor/fusion-framework/commit/ebaa11849303e68f67544f8db57727673f821744))

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.6...@equinor/fusion-framework-module-msal@0.1.7) (2022-02-23)

### Bug Fixes

-   **module-msal:** await auth ([#33](https://github.com/equinor/fusion-framework/issues/33)) ([d4c3dbd](https://github.com/equinor/fusion-framework/commit/d4c3dbd0afc6a3adebe23853ccd363d1bf37f131))

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.5...@equinor/fusion-framework-module-msal@0.1.6) (2022-02-23)

### Bug Fixes

-   deps ([2f2938b](https://github.com/equinor/fusion-framework/commit/2f2938b554610a068ed451623dd13480cae27302))

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.4...@equinor/fusion-framework-module-msal@0.1.5) (2022-02-23)

### Bug Fixes

-   add missing deps ([d689a02](https://github.com/equinor/fusion-framework/commit/d689a025613401eadf693bdd52694ba462dcfea3))

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.3...@equinor/fusion-framework-module-msal@0.1.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-msal@0.1.2...@equinor/fusion-framework-module-msal@0.1.3) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

## 0.1.2 (2022-02-23)

### Bug Fixes

-   **module-msal:** auth client id check ([#27](https://github.com/equinor/fusion-framework/issues/27)) ([907460e](https://github.com/equinor/fusion-framework/commit/907460e3e63e777f6766dcc044cad7078d7ab747))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-msal

# 0.1.0 (2022-02-07)

### Bug Fixes

-   **module-msal:** invert bool check of scopes ([3d9fb50](https://github.com/equinor/fusion-framework/commit/3d9fb50e4b3d408cab4f6e68c44ca9045e8ce40d))

### Features

-   add client for msal ([41e6b13](https://github.com/equinor/fusion-framework/commit/41e6b1378f41b1e03023186d480460a0189878c6))
-   **module-msal:** change behavoir to redirect ([9f2193f](https://github.com/equinor/fusion-framework/commit/9f2193f21a7056cb6b42513845fdc19910522628))
-   **module-msal:** expose account ([f4b27b3](https://github.com/equinor/fusion-framework/commit/f4b27b3db7cf5133afbaf366ba953561dd23c113))

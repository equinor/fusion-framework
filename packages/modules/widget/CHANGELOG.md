# Change Log

## 6.0.0

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

-   Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`b628e90`](https://github.com/equinor/fusion-framework/commit/b628e90500b62e0185c09eb665ce31025bc9b541), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
    -   @equinor/fusion-framework-module@4.3.2
    -   @equinor/fusion-query@5.1.0
    -   @equinor/fusion-framework-module-http@6.0.1
    -   @equinor/fusion-framework-module-service-discovery@7.1.10
    -   @equinor/fusion-observable@8.3.3
    -   @equinor/fusion-framework-module-event@4.2.0

## 5.0.1

### Patch Changes

-   [#2235](https://github.com/equinor/fusion-framework/pull/2235) [`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb) Thanks [@odinr](https://github.com/odinr)! - - **Refactored**: The `actionBaseType` function has been renamed to `getBaseType` and its implementation has been updated.

    -   **Added**: New utility types and functions for handling action types and payloads in a more type-safe manner.

-   [#2248](https://github.com/equinor/fusion-framework/pull/2248) [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - #2235 renamed a method and changed type. This PR forgot to change to the correct param when using this method. Fixes typo - update to use actions `type` in the reducer.

-   Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
    -   @equinor/fusion-observable@8.3.2
    -   @equinor/fusion-query@5.0.5
    -   @equinor/fusion-framework-module-service-discovery@7.1.9

## 5.0.0

### Patch Changes

-   Updated dependencies [[`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
    -   @equinor/fusion-framework-module-http@6.0.0
    -   @equinor/fusion-query@5.0.4
    -   @equinor/fusion-observable@8.3.1
    -   @equinor/fusion-framework-module-service-discovery@7.1.8

## 4.0.8

### Patch Changes

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`9a91bb7`](https://github.com/equinor/fusion-framework/commit/9a91bb737d3452e697c047c0f5c7caa2adfd535d), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
    -   @equinor/fusion-framework-module@4.3.1
    -   @equinor/fusion-framework-module-event@4.1.2
    -   @equinor/fusion-query@5.0.3
    -   @equinor/fusion-framework-module-http@5.2.3
    -   @equinor/fusion-framework-module-service-discovery@7.1.7

## 4.0.7

### Patch Changes

-   Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
    -   @equinor/fusion-query@5.0.2
    -   @equinor/fusion-framework-module-service-discovery@7.1.6

## 4.0.6

### Patch Changes

-   Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
    -   @equinor/fusion-query@5.0.1
    -   @equinor/fusion-framework-module-service-discovery@7.1.5

## 4.0.5

### Patch Changes

-   Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
    -   @equinor/fusion-query@5.0.0
    -   @equinor/fusion-framework-module-service-discovery@7.1.4

## 4.0.4

### Patch Changes

-   Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
    -   @equinor/fusion-framework-module-http@5.2.2
    -   @equinor/fusion-framework-module-service-discovery@7.1.3

## 4.0.3

### Patch Changes

-   Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a), [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
    -   @equinor/fusion-observable@8.3.0
    -   @equinor/fusion-query@4.2.0
    -   @equinor/fusion-framework-module-service-discovery@7.1.2

## 4.0.2

### Patch Changes

-   Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
    -   @equinor/fusion-framework-module-http@5.2.1
    -   @equinor/fusion-framework-module-service-discovery@7.1.1

## 4.0.1

### Patch Changes

-   Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
    -   @equinor/fusion-framework-module-event@4.1.1

## 4.0.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0
    -   @equinor/fusion-framework-module-service-discovery@7.1.0
    -   @equinor/fusion-observable@8.2.0
    -   @equinor/fusion-framework-module-event@4.1.0
    -   @equinor/fusion-framework-module-http@5.2.0
    -   @equinor/fusion-query@4.1.0

## 3.0.0

### Major Changes

-   [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Widget has had a complete makeover all from the loading Component to the Module itself.
    -   adding events to widget module some include `onWidgetInitialized` , `onWidgetInitializeFailure` and `onWidgetScriptLoaded` and more.
    -   Enabling for multiple widget loading.
    -   Complex overhaul on the widget configuration utilizing th new BaseConfigBuilder class.
    -   Now able to configure baseImport url and widgetClient
    -   New widget component for loading of widgets
    -   Updated documentation

## 2.0.10

### Patch Changes

-   Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    -   @equinor/fusion-framework-module@4.2.7
    -   @equinor/fusion-framework-module-event@4.0.8
    -   @equinor/fusion-framework-module-http@5.1.6
    -   @equinor/fusion-framework-module-service-discovery@7.0.20

## 2.0.9

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-query@4.0.6
    -   @equinor/fusion-framework-module-service-discovery@7.0.19

## 2.0.8

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-http@5.1.5
    -   @equinor/fusion-framework-module-service-discovery@7.0.18

## 2.0.7

### Patch Changes

-   Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
    -   @equinor/fusion-framework-module-http@5.1.4
    -   @equinor/fusion-framework-module-service-discovery@7.0.17

## 2.0.6

### Patch Changes

-   Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
    -   @equinor/fusion-framework-module-http@5.1.3
    -   @equinor/fusion-framework-module-service-discovery@7.0.16

## 2.0.5

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-query@4.0.5
    -   @equinor/fusion-framework-module-service-discovery@7.0.15

## 2.0.4

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-module-service-discovery@7.0.14
    -   @equinor/fusion-framework-module@4.2.6
    -   @equinor/fusion-framework-module-http@5.1.2
    -   @equinor/fusion-query@4.0.4
    -   @equinor/fusion-framework-module-event@4.0.7

## 2.0.3

### Patch Changes

-   Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
    -   @equinor/fusion-query@4.0.3
    -   @equinor/fusion-framework-module-service-discovery@7.0.13

## 2.0.2

### Patch Changes

-   Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
    -   @equinor/fusion-query@4.0.2
    -   @equinor/fusion-framework-module-service-discovery@7.0.12

## 2.0.1

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module-event@4.0.6
    -   @equinor/fusion-framework-module-http@5.1.1
    -   @equinor/fusion-framework-module@4.2.5
    -   @equinor/fusion-framework-module-service-discovery@7.0.11
    -   @equinor/fusion-query@4.0.1

## 2.0.0

### Patch Changes

-   Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa), [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
    -   @equinor/fusion-framework-module-http@5.1.0
    -   @equinor/fusion-query@4.0.0
    -   @equinor/fusion-framework-module-service-discovery@7.0.10

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

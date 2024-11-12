# Change Log

## 1.2.13

### Patch Changes

-   Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
    -   @equinor/fusion-observable@8.4.2
    -   @equinor/fusion-query@5.1.4

## 1.2.12

### Patch Changes

-   Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
    -   @equinor/fusion-framework-module@4.3.5

## 1.2.11

### Patch Changes

-   Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
    -   @equinor/fusion-observable@8.4.1
    -   @equinor/fusion-query@5.1.3

## 1.2.10

### Patch Changes

-   Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
    -   @equinor/fusion-framework-module@4.3.4
    -   @equinor/fusion-query@5.1.2

## 1.2.9

### Patch Changes

-   Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
    -   @equinor/fusion-observable@8.4.0
    -   @equinor/fusion-query@5.1.1
    -   @equinor/fusion-framework-module@4.3.3

## 1.2.8

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

-   Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
    -   @equinor/fusion-framework-module@4.3.2
    -   @equinor/fusion-query@5.1.0
    -   @equinor/fusion-observable@8.3.3

## 1.2.7

### Patch Changes

-   Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
    -   @equinor/fusion-observable@8.3.2
    -   @equinor/fusion-query@5.0.5

## 1.2.6

### Patch Changes

-   Updated dependencies [[`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
    -   @equinor/fusion-query@5.0.4
    -   @equinor/fusion-observable@8.3.1

## 1.2.5

### Patch Changes

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
    -   @equinor/fusion-framework-module@4.3.1
    -   @equinor/fusion-query@5.0.3

## 1.2.4

### Patch Changes

-   Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
    -   @equinor/fusion-query@5.0.2

## 1.2.3

### Patch Changes

-   Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
    -   @equinor/fusion-query@5.0.1

## 1.2.2

### Patch Changes

-   Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
    -   @equinor/fusion-query@5.0.0

## 1.2.1

### Patch Changes

-   Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a), [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
    -   @equinor/fusion-observable@8.3.0
    -   @equinor/fusion-query@4.2.0

## 1.2.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0
    -   @equinor/fusion-observable@8.2.0
    -   @equinor/fusion-query@4.1.0

## 1.1.2

### Patch Changes

-   Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    -   @equinor/fusion-framework-module@4.2.7

## 1.1.1

### Patch Changes

-   Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
    -   @equinor/fusion-observable@8.1.5
    -   @equinor/fusion-query@4.0.6

## 1.1.0

### Minor Changes

-   [#1693](https://github.com/equinor/fusion-framework/pull/1693) [`7fea31b`](https://github.com/equinor/fusion-framework/commit/7fea31b049cd7dcce9336ed1bc339165729b0d99) Thanks [@Noggling](https://github.com/Noggling)! - Fixing the infinite loading if a bookmark is created in classic fusion and allowing for sourceSystem to be undefined.

## 1.0.17

### Patch Changes

-   Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
    -   @equinor/fusion-observable@8.1.4
    -   @equinor/fusion-query@4.0.5

## 1.0.16

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-observable@8.1.3
    -   @equinor/fusion-framework-module@4.2.6
    -   @equinor/fusion-query@4.0.4

## 1.0.15

### Patch Changes

-   [`6f8c32b8`](https://github.com/equinor/fusion-framework/commit/6f8c32b8e0ae1f4431d09d201b2a305a883cf886) Thanks [@odinr](https://github.com/odinr)! - After creating a bookmark the bookmark module will no longer set it as current. This makes sense because the application is already in the correct state when the bookmark was created

    see: #1547

    https://github.com/equinor/fusion-framework/blob/main/packages/modules/navigation/src/module.ts#L13

## 1.0.14

### Patch Changes

-   Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
    -   @equinor/fusion-query@4.0.3

## 1.0.13

### Patch Changes

-   Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
    -   @equinor/fusion-query@4.0.2

## 1.0.12

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module@4.2.5
    -   @equinor/fusion-observable@8.1.2
    -   @equinor/fusion-query@4.0.1

## 1.0.11

### Patch Changes

-   Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
    -   @equinor/fusion-query@4.0.0

## 1.0.10

### Patch Changes

-   Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4), [`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-observable@8.1.1
    -   @equinor/fusion-framework-module@4.2.4
    -   @equinor/fusion-query@3.0.7

## 1.0.9

### Patch Changes

-   Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
    -   @equinor/fusion-query@3.0.6

## 1.0.8

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-observable@8.1.0
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-query@3.0.5

## 1.0.7

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@1.0.5...@equinor/fusion-framework-module-bookmark@1.0.6) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.5 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@1.0.3...@equinor/fusion-framework-module-bookmark@1.0.4) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.3 (2023-04-24)

### Bug Fixes

-   **bookmark-module:** favorites now updates the bookmarks state when adding and removing bookmarks ([0e43cb1](https://github.com/equinor/fusion-framework/commit/0e43cb1a4e2f9b8fe3fcff4df053846f585cca3d))
-   **bookmark-module:** get the last event from get all bookmarks, and added onBookmarksChange dispatch ([4b53fc3](https://github.com/equinor/fusion-framework/commit/4b53fc37c0d072604c336490dc82beca2310cd51))

## 1.0.2 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.1 (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.4 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.3 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.2 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@0.2.0...@equinor/fusion-framework-module-bookmark@0.2.1) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.0 (2023-04-11)

### Features

-   **bookmark-module:** added functionality fro bookmark favorites ([0d66c30](https://github.com/equinor/fusion-framework/commit/0d66c301dd5d938c5e327273a6a48275bf29d5e1))

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@0.1.3...@equinor/fusion-framework-module-bookmark@0.1.4) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.1.3 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@0.1.1...@equinor/fusion-framework-module-bookmark@0.1.2) (2023-03-24)

### Bug Fixes

-   **bookmark-module:** invalidate cache for query by id ([24d6ca5](https://github.com/equinor/fusion-framework/commit/24d6ca5a59ce3e2a17291ddd65f0adb9f605e995))

## 0.1.1 (2023-03-24)

### Bug Fixes

-   **bookmark-module:** remove navigation provider resolver sins it not in use ([851a46b](https://github.com/equinor/fusion-framework/commit/851a46bb48cd01a51f630bc8b2e405660855152e))

## 0.1.0 (2023-03-22)

### Features

-   fusion bookmark module ([3f8259e](https://github.com/equinor/fusion-framework/commit/3f8259e47ea52637375d24ba3566c6ee1019c149))

### Bug Fixes

-   **bookmarks:** await dispatch of change event ([89c350a](https://github.com/equinor/fusion-framework/commit/89c350a6b26d036df8431064fd6641b6e546d324))
-   create example ([9a524ac](https://github.com/equinor/fusion-framework/commit/9a524ac354cd62ba084f05b456a2da857ed24575))
-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

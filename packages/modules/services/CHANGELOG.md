# Change Log

## 3.2.1

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module@4.2.5

## 3.2.0

### Minor Changes

-   [#1243](https://github.com/equinor/fusion-framework/pull/1243) [`f277c7fc`](https://github.com/equinor/fusion-framework/commit/f277c7fc54ca2ebe75ba1dda94a0d72eb7c8e15b) Thanks [@odinr](https://github.com/odinr)! - Added person services

    > **for internal usage only!**

    -   add function for fetching person details
    -   add function for querying persons
    -   add function for downloading person photo

    ```ts
    const personApi = await modules.services.createPeopleClient();
    personApi.query('v2', 'json
    ```

## 3.1.5

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

-   **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

-   **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

-   **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

-   **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
-   **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

-   **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

-   **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

-   **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
-   **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

-   **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
-   **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

-   **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

-   added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

-   update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

-   import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

-   :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

-   :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

-   **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

-   **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

-   **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
-   **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
-   **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))
    , {search: 'foo@bar.com'})
    personApi.get('v4', 'json

## 3.1.5

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

-   **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

-   **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

-   **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

-   **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
-   **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

-   **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

-   **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

-   **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
-   **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

-   **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
-   **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

-   **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

-   added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

-   update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

-   import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

-   :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

-   :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

-   **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

-   **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

-   **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
-   **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
-   **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))
    , {azureId: '1234'})
    personApi.photo('v2', 'blob

## 3.1.5

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

-   **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

-   **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

-   **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

-   **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
-   **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

-   **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

-   **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

-   **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
-   **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

-   **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
-   **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

-   **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

-   added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

-   update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

-   import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

-   :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

-   :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

-   **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

-   **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

-   **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
-   **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
-   **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))
    , {azureId: '123'})
    ``

-   [#1254](https://github.com/equinor/fusion-framework/pull/1254) [`a2d2dee9`](https://github.com/equinor/fusion-framework/commit/a2d2dee987673171ad91daec98cb530649da5849) Thanks [@odinr](https://github.com/odinr)! - Update people client to reflect Fusion API

    -   added models for v2 and v4
    -   added expand logic for person detail `roles` `positions` `contracts` `manager` `companies`
    -   changed api client to now include args and init (previously args where extracted from call parameters) to correctly type response models

## 3.1.5

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

-   **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

-   **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

-   **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

-   **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
-   **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

-   **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

-   **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

-   **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

-   **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
-   **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

-   **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
-   **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

-   **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

-   added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

-   update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

-   import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

-   :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

-   :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

-   **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

-   **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

-   **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
-   **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
-   **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
-   **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))

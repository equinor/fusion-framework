# Change Log

## 7.1.11

### Patch Changes

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-module@4.2.6
    -   @equinor/fusion-framework-module-http@5.1.2
    -   @equinor/fusion-framework-module-msal@3.0.8
    -   @equinor/fusion-framework-module-app@5.2.11
    -   @equinor/fusion-framework@7.0.24
    -   @equinor/fusion-framework-module-event@4.0.7

## 7.1.10

### Patch Changes

-   Updated dependencies [[`6d303787`](https://github.com/equinor/fusion-framework/commit/6d303787f647bb2fc3c90456eccac751abb264c4)]:
    -   @equinor/fusion-framework-module-app@5.2.10

## 7.1.9

### Patch Changes

-   Updated dependencies [[`8274dca1`](https://github.com/equinor/fusion-framework/commit/8274dca10a773e1d29ffbce82a6f6f2bae818316)]:
    -   @equinor/fusion-framework-module-app@5.2.9

## 7.1.8

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.2.8
    -   @equinor/fusion-framework@7.0.23

## 7.1.7

### Patch Changes

-   Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
    -   @equinor/fusion-framework-module-app@5.2.7
    -   @equinor/fusion-framework@7.0.22

## 7.1.6

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework@7.0.21
    -   @equinor/fusion-framework-module-app@5.2.6
    -   @equinor/fusion-framework-module-event@4.0.6
    -   @equinor/fusion-framework-module-http@5.1.1
    -   @equinor/fusion-framework-module@4.2.5
    -   @equinor/fusion-framework-module-msal@3.0.7

## 7.1.5

### Patch Changes

-   Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa)]:
    -   @equinor/fusion-framework-module-http@5.1.0
    -   @equinor/fusion-framework@7.0.20
    -   @equinor/fusion-framework-module-app@5.2.5

## 7.1.4

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework@7.0.19
    -   @equinor/fusion-framework-module-app@5.2.4

## 7.1.3

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4
    -   @equinor/fusion-framework-module-app@5.2.4
    -   @equinor/fusion-framework@7.0.18
    -   @equinor/fusion-framework-module-event@4.0.5
    -   @equinor/fusion-framework-module-http@5.0.6
    -   @equinor/fusion-framework-module-msal@3.0.6

## 7.1.2

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.2.3
    -   @equinor/fusion-framework@7.0.17

## 7.1.1

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-framework-module-event@4.0.4
    -   @equinor/fusion-framework-module-http@5.0.5
    -   @equinor/fusion-framework-module-msal@3.0.5
    -   @equinor/fusion-framework-module-app@5.2.2
    -   @equinor/fusion-framework@7.0.16

## 7.1.0

### Minor Changes

-   [#1093](https://github.com/equinor/fusion-framework/pull/1093) [`0a785d5c`](https://github.com/equinor/fusion-framework/commit/0a785d5c339ceec7cbbe2a6ff9e16053c86ce511) Thanks [@odinr](https://github.com/odinr)! - Allow options for `config.useFrameworkServiceClient`

    Add optional configuration when using a predefined client from service discovery

    **Changed interface**

    ```ts
    type useFrameworkServiceClient = (
      service_name: string,
      /** new, allows customize registration of http client from service discovery */
      options?: Omit<HttpClientOptions<any>, 'baseUri' | 'defaultScopes'>,
    )
    ```

    **example**

    ```ts
    config.useFrameworkServiceClient('some_fusion_service', {
        onCreate(client: IHttpClient) {
            /** make creation of http client add default request header */
            client.requestHandler.setHeader('api-version', '2.0');
        },
    });
    ```

### Patch Changes

-   Updated dependencies [[`7aee3cf0`](https://github.com/equinor/fusion-framework/commit/7aee3cf01764a272e7b0a09045ff674575b15035), [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
    -   @equinor/fusion-framework-module-event@4.0.3
    -   @equinor/fusion-framework-module@4.2.2

## 7.0.16

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework@7.0.15
    -   @equinor/fusion-framework-module-app@5.2.1
    -   @equinor/fusion-framework-module-event@4.0.2
    -   @equinor/fusion-framework-module-http@5.0.4
    -   @equinor/fusion-framework-module@4.2.1
    -   @equinor/fusion-framework-module-msal@3.0.4

## 7.0.15

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-module@4.2.0
    -   @equinor/fusion-framework@7.0.14
    -   @equinor/fusion-framework-module-app@5.1.3
    -   @equinor/fusion-framework-module-http@5.0.3
    -   @equinor/fusion-framework-module-msal@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.13...@equinor/fusion-framework-app@7.0.14) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 7.0.13 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 7.0.12 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.10...@equinor/fusion-framework-app@7.0.11) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.9...@equinor/fusion-framework-app@7.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.8...@equinor/fusion-framework-app@7.0.9) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 7.0.8 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.6...@equinor/fusion-framework-app@7.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.5...@equinor/fusion-framework-app@7.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 7.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 7.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.2...@equinor/fusion-framework-app@7.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.1...@equinor/fusion-framework-app@7.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [7.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@7.0.0...@equinor/fusion-framework-app@7.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 7.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.15 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.14 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.13 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.12 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@6.0.10...@equinor/fusion-framework-app@6.0.11) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.10 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.9 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@6.0.7...@equinor/fusion-framework-app@6.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.7 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@6.0.5...@equinor/fusion-framework-app@6.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@6.0.4...@equinor/fusion-framework-app@6.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@6.0.3...@equinor/fusion-framework-app@6.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@6.0.2...@equinor/fusion-framework-app@6.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 6.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@5.0.8...@equinor/fusion-framework-app@6.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [6.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@5.0.8...@equinor/fusion-framework-app@6.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [5.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@5.0.7...@equinor/fusion-framework-app@5.0.8) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 5.0.7 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [5.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@5.0.5...@equinor/fusion-framework-app@5.0.6) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [5.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@5.0.4...@equinor/fusion-framework-app@5.0.5) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 5.0.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 5.0.3 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 5.0.2 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 5.0.1 (2023-01-04)

### Bug Fixes

-   **module-app:** update deps ([3e956c4](https://github.com/equinor/fusion-framework/commit/3e956c4b66b012988e68c2f4633ccdb692dc9bc9))

## 5.0.0 (2023-01-04)

### ⚠ BREAKING CHANGES

-   **module-app:** manifest prop rename

### Bug Fixes

-   **module-app:** rename `appKey` to `key` ([9ee97b1](https://github.com/equinor/fusion-framework/commit/9ee97b149b9167a3747da371de76490e287d9514))

## 4.0.20 (2022-12-21)

### Bug Fixes

-   import export of app types ([6adeabe](https://github.com/equinor/fusion-framework/commit/6adeabecd1d261f3fda18a1cf93e5be4e374cbb5))

## 4.0.19 (2022-12-19)

### Bug Fixes

-   **react-app:** check if manifest is provided in env ([e41b6d1](https://github.com/equinor/fusion-framework/commit/e41b6d1c9006f7d55933a6375861d96126498015))

## 4.0.18 (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.16...@equinor/fusion-framework-app@4.0.17) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.15...@equinor/fusion-framework-app@4.0.16) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.14...@equinor/fusion-framework-app@4.0.15) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 4.0.14 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.12...@equinor/fusion-framework-app@4.0.13) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.11...@equinor/fusion-framework-app@4.0.12) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.10...@equinor/fusion-framework-app@4.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.9...@equinor/fusion-framework-app@4.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.8...@equinor/fusion-framework-app@4.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.7...@equinor/fusion-framework-app@4.0.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.6...@equinor/fusion-framework-app@4.0.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.3...@equinor/fusion-framework-app@4.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.4...@equinor/fusion-framework-app@4.0.5) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.3...@equinor/fusion-framework-app@4.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.1...@equinor/fusion-framework-app@4.0.3) (2022-12-05)

### Bug Fixes

-   **app:** adding type contextModule in event details for app package ([abea386](https://github.com/equinor/fusion-framework/commit/abea386c76c6297934a236d1bba9c71a12425065))

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.1...@equinor/fusion-framework-app@4.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@4.0.0...@equinor/fusion-framework-app@4.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.31...@equinor/fusion-framework-app@4.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.31...@equinor/fusion-framework-app@4.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.30...@equinor/fusion-framework-app@3.1.31) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.29...@equinor/fusion-framework-app@3.1.30) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.28...@equinor/fusion-framework-app@3.1.29) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.27...@equinor/fusion-framework-app@3.1.28) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.26...@equinor/fusion-framework-app@3.1.27) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.25...@equinor/fusion-framework-app@3.1.26) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.24...@equinor/fusion-framework-app@3.1.25) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.23...@equinor/fusion-framework-app@3.1.24) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.22...@equinor/fusion-framework-app@3.1.23) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.21...@equinor/fusion-framework-app@3.1.22) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.20...@equinor/fusion-framework-app@3.1.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.19...@equinor/fusion-framework-app@3.1.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.19 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.17...@equinor/fusion-framework-app@3.1.18) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.17 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.15...@equinor/fusion-framework-app@3.1.16) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.14...@equinor/fusion-framework-app@3.1.15) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.14 (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.12...@equinor/fusion-framework-app@3.1.13) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.11...@equinor/fusion-framework-app@3.1.12) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.11 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.9...@equinor/fusion-framework-app@3.1.10) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.8...@equinor/fusion-framework-app@3.1.9) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.7...@equinor/fusion-framework-app@3.1.8) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.7 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.6 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.4...@equinor/fusion-framework-app@3.1.5) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.3...@equinor/fusion-framework-app@3.1.4) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.2...@equinor/fusion-framework-app@3.1.3) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.1.2 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.1.0...@equinor/fusion-framework-app@3.1.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.0.10...@equinor/fusion-framework-app@3.1.0) (2022-11-01)

### Features

-   **framework:** implement module-app ([dc917f0](https://github.com/equinor/fusion-framework/commit/dc917f019da852fbd93eaf6ed7bc4a3a7e6f0d68))

## 3.0.10 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.0.8...@equinor/fusion-framework-app@3.0.9) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.0.8 (2022-10-26)

### Bug Fixes

-   **react-app:** :fire: update render env args with typing ([06bd3c7](https://github.com/equinor/fusion-framework/commit/06bd3c75218981f54216f76d3b7a667110dac3ae))

## [3.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.0.6...@equinor/fusion-framework-app@3.0.7) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.0.6 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.0.4...@equinor/fusion-framework-app@3.0.5) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.0.4 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 3.0.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.0.1...@equinor/fusion-framework-app@3.0.2) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@3.0.0...@equinor/fusion-framework-app@3.0.1) (2022-09-29)

### Bug Fixes

-   **app:** update interfaces ([9b833bf](https://github.com/equinor/fusion-framework/commit/9b833bf53ea0cdcb8d4dfec7da1c42440c6ebe2d))

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@2.0.0...@equinor/fusion-framework-app@3.0.0) (2022-09-27)

### ⚠ BREAKING CHANGES

-   **module-service-discovery:** order of arguments for configuring client in service discovery

### Bug Fixes

-   **module-service-discovery:** change order of arguments ([a1240c6](https://github.com/equinor/fusion-framework/commit/a1240c6360da5e919623bc31a51ced4c5ce1c2e3))
-   update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 2.0.0 (2022-09-26)

### ⚠ BREAKING CHANGES

-   **module-service-discovery:** order of arguments for configuring client in service discovery

### Bug Fixes

-   **module-service-discovery:** change order of arguments ([a1240c6](https://github.com/equinor/fusion-framework/commit/a1240c6360da5e919623bc31a51ced4c5ce1c2e3))

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.5...@equinor/fusion-framework-app@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.4...@equinor/fusion-framework-app@1.0.5) (2022-09-14)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.3...@equinor/fusion-framework-app@1.0.4) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.2...@equinor/fusion-framework-app@1.0.3) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.1...@equinor/fusion-framework-app@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.1-next.1...@equinor/fusion-framework-app@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.1-next.0...@equinor/fusion-framework-app@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@1.0.0...@equinor/fusion-framework-app@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

-   **app:** config is now object

### Features

-   **app:** update init ([528d77f](https://github.com/equinor/fusion-framework/commit/528d77f30430242d05bf9a7fbed3ea68171df39d))

### Bug Fixes

-   **app:** expect fusion modules ([301fcab](https://github.com/equinor/fusion-framework/commit/301fcab23e857bf87440b4212513a7eea2641aea))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@0.2.3...@equinor/fusion-framework-app@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

-   **app:** config is now object

### Features

-   **app:** update init ([528d77f](https://github.com/equinor/fusion-framework/commit/528d77f30430242d05bf9a7fbed3ea68171df39d))

### Bug Fixes

-   **app:** expect fusion modules ([301fcab](https://github.com/equinor/fusion-framework/commit/301fcab23e857bf87440b4212513a7eea2641aea))

## 0.2.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 0.2.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-app

## 0.2.1 (2022-09-01)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@0.1.2...@equinor/fusion-framework-app@0.2.0) (2022-08-29)

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

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@0.1.1...@equinor/fusion-framework-app@0.1.2) (2022-08-23)

**Note:** Version bump only for package @equinor/fusion-framework-app

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-app@0.1.0...@equinor/fusion-framework-app@0.1.1) (2022-08-22)

### Bug Fixes

-   **app:** fix typing of configurator ([5b71bea](https://github.com/equinor/fusion-framework/commit/5b71beadb34d3dc26bde23d93409008f2292e42b))

# 0.1.0 (2022-08-22)

### Features

-   **app:** create base module for fusion apps ([9bd3f2f](https://github.com/equinor/fusion-framework/commit/9bd3f2f1ff51d18f2a8989f2d2a1f5045720b7e0))

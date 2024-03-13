# Change Log

## 7.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-http@5.2.0
  - @equinor/fusion-query@4.1.0

## 7.0.20

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-module-http@5.1.6

## 7.0.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.6

## 7.0.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.1.5

## 7.0.17

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4

## 7.0.16

### Patch Changes

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3

## 7.0.15

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.5

## 7.0.14

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-query@4.0.4

## 7.0.13

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3

## 7.0.12

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2

## 7.0.11

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-query@4.0.1

## 7.0.10

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa), [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-framework-module-http@5.1.0
  - @equinor/fusion-query@4.0.0

## 7.0.9

### Patch Changes

- [#1227](https://github.com/equinor/fusion-framework/pull/1227) [`e539e606`](https://github.com/equinor/fusion-framework/commit/e539e606d04bd8b7dc0c0bfed7cd4a7731996936) Thanks [@yusijs](https://github.com/yusijs)! - Use defaultScopes in service discovery if available, otherwise fall back to default scope

## 7.0.8

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-query@3.0.7
  - @equinor/fusion-framework-module-http@5.0.6

## 7.0.7

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6

## 7.0.6

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-http@5.0.5
  - @equinor/fusion-query@3.0.5

## 7.0.5

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-module-http@5.0.4
  - @equinor/fusion-framework-module@4.2.1

## 7.0.4

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-module@4.2.0
  - @equinor/fusion-framework-module-http@5.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@7.0.2...@equinor/fusion-framework-module-service-discovery@7.0.3) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 7.0.2 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 7.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 7.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 6.0.8 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.6...@equinor/fusion-framework-module-service-discovery@6.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.5...@equinor/fusion-framework-module-service-discovery@6.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.4...@equinor/fusion-framework-module-service-discovery@6.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.3...@equinor/fusion-framework-module-service-discovery@6.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.2...@equinor/fusion-framework-module-service-discovery@6.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 6.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 6.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.4...@equinor/fusion-framework-module-service-discovery@6.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.4...@equinor/fusion-framework-module-service-discovery@6.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 5.0.4 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.2...@equinor/fusion-framework-module-service-discovery@5.0.3) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.1...@equinor/fusion-framework-module-service-discovery@5.0.2) (2023-01-16)

### Bug Fixes

- **legacy-interopt:** register legacy auth token resolve ([24ee4ea](https://github.com/equinor/fusion-framework/commit/24ee4eab42d4f472c8f4c8b959ce73f8f5b4dc1c))

## 5.0.1 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 5.0.0 (2023-01-12)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** changed `environment` from promise to sync

### Features

- **module-service-discovery:** allow sync resolve of service ([aa0361c](https://github.com/equinor/fusion-framework/commit/aa0361c765604ca5f642c9f2916cea860968d4a3))

## 4.0.8 (2022-12-14)

### Bug Fixes

- **module-service-discovery:** remove console log ([776d174](https://github.com/equinor/fusion-framework/commit/776d174fc141d4c6e1b8b476cb85b18985eb93b9))

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.6...@equinor/fusion-framework-module-service-discovery@4.0.7) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 4.0.6 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.4...@equinor/fusion-framework-module-service-discovery@4.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.3...@equinor/fusion-framework-module-service-discovery@4.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.2...@equinor/fusion-framework-module-service-discovery@4.0.3) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 4.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 4.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.11...@equinor/fusion-framework-module-service-discovery@4.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.11...@equinor/fusion-framework-module-service-discovery@4.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.10...@equinor/fusion-framework-module-service-discovery@3.2.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.9...@equinor/fusion-framework-module-service-discovery@3.2.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.8...@equinor/fusion-framework-module-service-discovery@3.2.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.7...@equinor/fusion-framework-module-service-discovery@3.2.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.6...@equinor/fusion-framework-module-service-discovery@3.2.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.5...@equinor/fusion-framework-module-service-discovery@3.2.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.4...@equinor/fusion-framework-module-service-discovery@3.2.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.3...@equinor/fusion-framework-module-service-discovery@3.2.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.2...@equinor/fusion-framework-module-service-discovery@3.2.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.1...@equinor/fusion-framework-module-service-discovery@3.2.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.0...@equinor/fusion-framework-module-service-discovery@3.2.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.1.4...@equinor/fusion-framework-module-service-discovery@3.2.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 3.1.4 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.1.2...@equinor/fusion-framework-module-service-discovery@3.1.3) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.1.2 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.1.1 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.0.11...@equinor/fusion-framework-module-service-discovery@3.1.0) (2022-11-14)

### Features

- update packages to use observable ([98024aa](https://github.com/equinor/fusion-framework/commit/98024aa466c68f03bd793bd564cf7b6bf65def72))

## 3.0.11 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.10 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.9 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.8 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.7 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.6 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.5 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.0.3...@equinor/fusion-framework-module-service-discovery@3.0.4) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.2 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.0.0...@equinor/fusion-framework-module-service-discovery@3.0.1) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@2.0.0...@equinor/fusion-framework-module-service-discovery@3.0.0) (2022-09-27)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** order of arguments for configuring client in service discovery

### Bug Fixes

- **module-service-discovery:** change order of arguments ([a1240c6](https://github.com/equinor/fusion-framework/commit/a1240c6360da5e919623bc31a51ced4c5ce1c2e3))
- update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 2.0.0 (2022-09-26)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** order of arguments for configuring client in service discovery

### Bug Fixes

- **module-service-discovery:** change order of arguments ([a1240c6](https://github.com/equinor/fusion-framework/commit/a1240c6360da5e919623bc31a51ced4c5ce1c2e3))

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.5...@equinor/fusion-framework-module-service-discovery@1.0.6) (2022-09-16)

### Bug Fixes

- **module-service-discovery:** fix typing ([29941ba](https://github.com/equinor/fusion-framework/commit/29941baa3682ade7f1e15c0322b7c976488599e6))

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.4...@equinor/fusion-framework-module-service-discovery@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.3...@equinor/fusion-framework-module-service-discovery@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.2...@equinor/fusion-framework-module-service-discovery@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1...@equinor/fusion-framework-module-service-discovery@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1-next.1...@equinor/fusion-framework-module-service-discovery@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1-next.0...@equinor/fusion-framework-module-service-discovery@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.0...@equinor/fusion-framework-module-service-discovery@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** update config

### Bug Fixes

- **module-service-discovery:** update config ([9998981](https://github.com/equinor/fusion-framework/commit/9998981bbcb1ed283dba7c77268e2c55a8e3fb83))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.7.2...@equinor/fusion-framework-module-service-discovery@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** update config

### Bug Fixes

- **module-service-discovery:** update config ([9998981](https://github.com/equinor/fusion-framework/commit/9998981bbcb1ed283dba7c77268e2c55a8e3fb83))

## 0.7.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.7.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.7.0 (2022-08-29)

### ⚠ BREAKING CHANGES

- rename fetch

- fix(module-service-discovery): update http client consumer

- build: update allowed branches

- build: add conventional commit

- build: use conventionalcommits

- build(module-http): push major

- build: update deps

### Features

- rename fetch method ([#226](https://github.com/equinor/fusion-framework/issues/226)) ([f02df7c](https://github.com/equinor/fusion-framework/commit/f02df7cdd2b9098b0da49c5ea56ac3b6a17e9e32))

## 0.6.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.6.0...@equinor/fusion-framework-module-service-discovery@0.6.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

# [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.5.0...@equinor/fusion-framework-module-service-discovery@0.6.0) (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

# 0.5.0 (2022-08-08)

### Features

- **module-service-discovery:** resolve service to config ([3fa088d](https://github.com/equinor/fusion-framework/commit/3fa088d2ced8136447df6949928f1af9fc83407a))

# [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.12...@equinor/fusion-framework-module-service-discovery@0.4.0) (2022-08-04)

- feat(module)!: allow requireing module instnce (#190) ([3a7e67e](https://github.com/equinor/fusion-framework/commit/3a7e67e9accb5185100325c92d5850a44626e498)), closes [#190](https://github.com/equinor/fusion-framework/issues/190)

### BREAKING CHANGES

- `deps` prop is remove from module object, use `await require('MODULE')`;

- feat(module)!: allow requireing module instnce

when module initiates it should be allowed to await an required module.

- add method for awaiting required module
- add typing for config in initialize fase

- update service discovery to await http module
- add service discovery client
- allow configuration of service discovery client

* `deps` prop is remove from module object, use `await require('MODULE')`;

* fix(module-http): add default interface for HttpClientOptions

## [0.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.11...@equinor/fusion-framework-module-service-discovery@0.3.12) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.3.11 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.9...@equinor/fusion-framework-module-service-discovery@0.3.10) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.8...@equinor/fusion-framework-module-service-discovery@0.3.9) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.7...@equinor/fusion-framework-module-service-discovery@0.3.8) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.6...@equinor/fusion-framework-module-service-discovery@0.3.7) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.5...@equinor/fusion-framework-module-service-discovery@0.3.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.4...@equinor/fusion-framework-module-service-discovery@0.3.5) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.3...@equinor/fusion-framework-module-service-discovery@0.3.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.3.3 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.1...@equinor/fusion-framework-module-service-discovery@0.3.2) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.0...@equinor/fusion-framework-module-service-discovery@0.3.1) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.2.4...@equinor/fusion-framework-module-service-discovery@0.3.0) (2022-06-13)

### Features

- **nodules-service-discovery:** make http-module dependency ([001dc2a](https://github.com/equinor/fusion-framework/commit/001dc2acbcd2e9a31a19fe9e7c9cd903fb20b2a1))

## 0.2.4 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.2.3 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.2.2 (2022-05-31)

### Bug Fixes

- **module-service-discovery:** update interfaces ([e1b6864](https://github.com/equinor/fusion-framework/commit/e1b686466ae28204e1d605cce0441dab69787e48))

## 0.2.1 (2022-03-14)

### Bug Fixes

- **service-discovery:** include uri in service ([#46](https://github.com/equinor/fusion-framework/issues/46)) ([3287d69](https://github.com/equinor/fusion-framework/commit/3287d69e23a5bccce8a9e762886340733f9c5447))

# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.1.1...@equinor/fusion-framework-module-service-discovery@0.2.0) (2022-02-15)

### Features

- **module-service-discovery:** allow custom service discovery ([8917e4e](https://github.com/equinor/fusion-framework/commit/8917e4e3053b824ac8d878b0bfbe6a22efd56c3b))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

# 0.1.0 (2022-02-07)

### Bug Fixes

- allow create callback on configure ([a76ebb0](https://github.com/equinor/fusion-framework/commit/a76ebb057f7b06a7ff737af6e3c29a000a5f0791))
- **module-service-discovery:** add default scopes ([b52af12](https://github.com/equinor/fusion-framework/commit/b52af1236d619f451f8d002a31548fd4706bc6c7))
- **module-service-discovery:** remove base url ([e4740ba](https://github.com/equinor/fusion-framework/commit/e4740ba90f1d499e572023a5a90137669a9d20bc))

### Features

- add module for service discovery ([8714495](https://github.com/equinor/fusion-framework/commit/871449527f06661b0ee784df87bfd6eeef2a37fc))
- **module-service-discovery:** add baseurl config ([2bb569f](https://github.com/equinor/fusion-framework/commit/2bb569f62952c127ca74bc7b818181cb5b3ac986))
- **module-service-discovery:** add method for configuring client ([2b99a21](https://github.com/equinor/fusion-framework/commit/2b99a2119dd0b335ff26f983426f41bf1f8c7511))

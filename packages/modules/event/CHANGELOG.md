# Change Log

## 4.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0

## 4.0.8

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7

## 4.0.7

### Patch Changes

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6

## 4.0.6

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5

## 4.0.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4

## 4.0.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3

## 4.0.3

### Patch Changes

- [#1076](https://github.com/equinor/fusion-framework/pull/1076) [`7aee3cf0`](https://github.com/equinor/fusion-framework/commit/7aee3cf01764a272e7b0a09045ff674575b15035) Thanks [@odinr](https://github.com/odinr)! - expose event stream from `IEventModuleProvider`

- [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

  only style semantics updated

- Updated dependencies [[`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
  - @equinor/fusion-framework-module@4.2.2

## 4.0.2

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-module@4.2.1

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 4.0.1 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 4.0.0 (2023-05-05)

### ⚠ BREAKING CHANGES

- **modules:** postInitialize no longer support void function, should not affect any application, only used internally

### Features

- **modules:** change postInitialize to return ObservableInput ([f1c2f56](https://github.com/equinor/fusion-framework/commit/f1c2f5644c6db2405bf5747a1094548e1723cce1))

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@2.0.0...@equinor/fusion-framework-module-event@2.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.2.1...@equinor/fusion-framework-module-event@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.2.1...@equinor/fusion-framework-module-event@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.2.1 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.2.0 (2022-12-08)

### Features

- **module-event:** allow filtering of events ([7cf41a7](https://github.com/equinor/fusion-framework/commit/7cf41a7e3662c46bb1126e7ac969ff229f22cd63))

## 1.1.6 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.1.5 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.1.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.1.3 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.1.2 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.1.0...@equinor/fusion-framework-module-event@1.1.1) (2022-11-02)

### Bug Fixes

- **module-event:** update typing of event source ([321aabc](https://github.com/equinor/fusion-framework/commit/321aabcdaa4f121ffa73e37fe4f9d05f049d12d2))

## 1.1.0 (2022-11-01)

### Features

- **module-event:** make details required ([ed4e8d7](https://github.com/equinor/fusion-framework/commit/ed4e8d7092be94b4ba4fd86edec8e261efe6d944))

## 1.0.13 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.11...@equinor/fusion-framework-module-event@1.0.12) (2022-10-21)

### Bug Fixes

- **module-event:** update import paths ([7007b30](https://github.com/equinor/fusion-framework/commit/7007b30eb5e7b4cdecafa264224f559f7b75b08a))

## 1.0.11 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.9...@equinor/fusion-framework-module-event@1.0.10) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.0.9 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.7...@equinor/fusion-framework-module-event@1.0.8) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.0.7 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.0.6 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.4...@equinor/fusion-framework-module-event@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.3...@equinor/fusion-framework-module-event@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.2...@equinor/fusion-framework-module-event@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.1...@equinor/fusion-framework-module-event@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.1-next.1...@equinor/fusion-framework-module-event@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.1-next.0...@equinor/fusion-framework-module-event@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.0...@equinor/fusion-framework-module-event@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@0.1.4...@equinor/fusion-framework-module-event@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 0.1.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 0.1.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 0.1.2 (2022-08-23)

### Bug Fixes

- **module-event:** expose event handler interface ([0b5bb32](https://github.com/equinor/fusion-framework/commit/0b5bb32c5d8eb445149da5d1e6012d90f1ccbc30))

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@0.1.0...@equinor/fusion-framework-module-event@0.1.1) (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

# 0.1.0 (2022-08-18)

### Features

- **module-event:** initial ([1202e9e](https://github.com/equinor/fusion-framework/commit/1202e9ebe711d0bea653826857e41d0c1c65ab24))

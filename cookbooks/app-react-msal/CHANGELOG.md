# Change Log

## 1.0.0

### Major Changes

- [#1646](https://github.com/equinor/fusion-framework/pull/1646) [`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1) Thanks [@odinr](https://github.com/odinr)! - created a cookbook for reading msal account and token

## 4.0.26

### Patch Changes

- [#1389](https://github.com/equinor/fusion-framework/pull/1389) [`7bf396c4`](https://github.com/equinor/fusion-framework/commit/7bf396c4803f2045777329520fa88752406e1b32) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-react-ag-grid-styles from 29.3.16 to 30.0.0

- [#1393](https://github.com/equinor/fusion-framework/pull/1393) [`f049479b`](https://github.com/equinor/fusion-framework/commit/f049479bfb51369a227eb432089d0da20be86529) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @equinor/fusion-react-person from 0.5.1 to 0.6.0

## 4.0.25

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 4.0.24

### Patch Changes

- [#1273](https://github.com/equinor/fusion-framework/pull/1273) [`9f570356`](https://github.com/equinor/fusion-framework/commit/9f570356939f077e0a6ca101fa0b7e51d369f7b4) Thanks [@Noggling](https://github.com/Noggling)! - Added display content to the div element that is provided to applications

## 4.0.23

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

## 4.0.22

### Patch Changes

- [#1058](https://github.com/equinor/fusion-framework/pull/1058) [`4eadd69f`](https://github.com/equinor/fusion-framework/commit/4eadd69f24dc69623086d40aa367a5c8e67b6518) Thanks [@odinr](https://github.com/odinr)! - Update dependency: @remix-run/router@^1.7.2

- [#1060](https://github.com/equinor/fusion-framework/pull/1060) [`3a2c3107`](https://github.com/equinor/fusion-framework/commit/3a2c3107b436c1eef7bc03c8225c32d40ed27e74) Thanks [@odinr](https://github.com/odinr)! - chore: update ag-grid to ~30.0

## 4.0.21

### Patch Changes

- [#955](https://github.com/equinor/fusion-framework/pull/955) [`b0310b3b`](https://github.com/equinor/fusion-framework/commit/b0310b3b3668f72bdc973e5fee50118dbe17823f) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Remove leading `/` in package's main property for the cookbooks.

## 4.0.20

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.0.19

### Patch Changes

- [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - **add build script**
  this is not required, but nice to know that cookbooks builds...

## 4.0.18

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.16...@equinor/fusion-framework-cookbook-app-react@4.0.17) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.15...@equinor/fusion-framework-cookbook-app-react@4.0.16) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.14...@equinor/fusion-framework-cookbook-app-react@4.0.15) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.13...@equinor/fusion-framework-cookbook-app-react@4.0.14) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 4.0.13 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.11...@equinor/fusion-framework-cookbook-app-react@4.0.12) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.10...@equinor/fusion-framework-cookbook-app-react@4.0.11) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.9...@equinor/fusion-framework-cookbook-app-react@4.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.8...@equinor/fusion-framework-cookbook-app-react@4.0.9) (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 4.0.8 (2023-05-09)

### Bug Fixes

- **cookbooks:** remove strict mode as it is not needed for React 18 ([eda33e4](https://github.com/equinor/fusion-framework/commit/eda33e4d0e6c67e3da964599167a9db6e1eadf0a))

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.6...@equinor/fusion-framework-cookbook-app-react@4.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.5...@equinor/fusion-framework-cookbook-app-react@4.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 4.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 4.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.2...@equinor/fusion-framework-cookbook-app-react@4.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.1...@equinor/fusion-framework-cookbook-app-react@4.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@4.0.0...@equinor/fusion-framework-cookbook-app-react@4.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.20...@equinor/fusion-framework-cookbook-app-react@4.0.0) (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.19...@equinor/fusion-framework-cookbook-app-react@3.1.20) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.16...@equinor/fusion-framework-cookbook-app-react@3.1.19) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.16...@equinor/fusion-framework-cookbook-app-react@3.1.18) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.16...@equinor/fusion-framework-cookbook-app-react@3.1.17) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.15...@equinor/fusion-framework-cookbook-app-react@3.1.16) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.14...@equinor/fusion-framework-cookbook-app-react@3.1.15) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.13...@equinor/fusion-framework-cookbook-app-react@3.1.14) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.12...@equinor/fusion-framework-cookbook-app-react@3.1.13) (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.11...@equinor/fusion-framework-cookbook-app-react@3.1.12) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.9...@equinor/fusion-framework-cookbook-app-react@3.1.11) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.9...@equinor/fusion-framework-cookbook-app-react@3.1.10) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.8...@equinor/fusion-framework-cookbook-app-react@3.1.9) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.7...@equinor/fusion-framework-cookbook-app-react@3.1.8) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.6...@equinor/fusion-framework-cookbook-app-react@3.1.7) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.5...@equinor/fusion-framework-cookbook-app-react@3.1.6) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.4...@equinor/fusion-framework-cookbook-app-react@3.1.5) (2023-03-24)

### Bug Fixes

- **bookmark-cookbook:** enable shear bookmark ([f7af56d](https://github.com/equinor/fusion-framework/commit/f7af56d3f7b99a7a3c13073e0bb89fe46f9dd148))

## 3.1.4 (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 3.1.3 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.1...@equinor/fusion-framework-cookbook-app-react@3.1.2) (2023-03-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.1.0...@equinor/fusion-framework-cookbook-app-react@3.1.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.22...@equinor/fusion-framework-cookbook-app-react@3.1.0) (2023-03-20)

### Features

- **cli:** allow configuring portal host in cli ([9641b21](https://github.com/equinor/fusion-framework/commit/9641b215a1bff957687e9eda661679f000588a47))

## [3.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.21...@equinor/fusion-framework-cookbook-app-react@3.0.22) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.21...@equinor/fusion-framework-cookbook-app-react@3.0.21) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.20...@equinor/fusion-framework-cookbook-app-react@3.0.21) (2023-03-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.19...@equinor/fusion-framework-cookbook-app-react@3.0.20) (2023-03-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 3.0.19 (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.17...@equinor/fusion-framework-cookbook-app-react@3.0.18) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.16...@equinor/fusion-framework-cookbook-app-react@3.0.17) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.15...@equinor/fusion-framework-cookbook-app-react@3.0.16) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.14...@equinor/fusion-framework-cookbook-app-react@3.0.15) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.13...@equinor/fusion-framework-cookbook-app-react@3.0.14) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.11...@equinor/fusion-framework-cookbook-app-react@3.0.13) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.11...@equinor/fusion-framework-cookbook-app-react@3.0.12) (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 3.0.11 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.9...@equinor/fusion-framework-cookbook-app-react@3.0.10) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.7...@equinor/fusion-framework-cookbook-app-react@3.0.9) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.7...@equinor/fusion-framework-cookbook-app-react@3.0.8) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.6...@equinor/fusion-framework-cookbook-app-react@3.0.7) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.5...@equinor/fusion-framework-cookbook-app-react@3.0.6) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.4...@equinor/fusion-framework-cookbook-app-react@3.0.5) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.3...@equinor/fusion-framework-cookbook-app-react@3.0.4) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.2...@equinor/fusion-framework-cookbook-app-react@3.0.3) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@3.0.1...@equinor/fusion-framework-cookbook-app-react@3.0.2) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 3.0.1 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.41...@equinor/fusion-framework-cookbook-app-react@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.41...@equinor/fusion-framework-cookbook-app-react@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.41](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.40...@equinor/fusion-framework-cookbook-app-react@2.0.41) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 2.0.40 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.39](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.38...@equinor/fusion-framework-cookbook-app-react@2.0.39) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.38](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.37...@equinor/fusion-framework-cookbook-app-react@2.0.38) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 2.0.37 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.36](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.35...@equinor/fusion-framework-cookbook-app-react@2.0.36) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.35](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.34...@equinor/fusion-framework-cookbook-app-react@2.0.35) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 2.0.34 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.33](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.32...@equinor/fusion-framework-cookbook-app-react@2.0.33) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.32](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.31...@equinor/fusion-framework-cookbook-app-react@2.0.32) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.30...@equinor/fusion-framework-cookbook-app-react@2.0.31) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.29...@equinor/fusion-framework-cookbook-app-react@2.0.30) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.28...@equinor/fusion-framework-cookbook-app-react@2.0.29) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.27...@equinor/fusion-framework-cookbook-app-react@2.0.28) (2022-12-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.26...@equinor/fusion-framework-cookbook-app-react@2.0.27) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.25...@equinor/fusion-framework-cookbook-app-react@2.0.26) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.24...@equinor/fusion-framework-cookbook-app-react@2.0.25) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.23...@equinor/fusion-framework-cookbook-app-react@2.0.24) (2022-12-19)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.22...@equinor/fusion-framework-cookbook-app-react@2.0.23) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.21...@equinor/fusion-framework-cookbook-app-react@2.0.22) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.20...@equinor/fusion-framework-cookbook-app-react@2.0.21) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.19...@equinor/fusion-framework-cookbook-app-react@2.0.20) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.18...@equinor/fusion-framework-cookbook-app-react@2.0.19) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.17...@equinor/fusion-framework-cookbook-app-react@2.0.18) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.16...@equinor/fusion-framework-cookbook-app-react@2.0.17) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.15...@equinor/fusion-framework-cookbook-app-react@2.0.16) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.14...@equinor/fusion-framework-cookbook-app-react@2.0.15) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.13...@equinor/fusion-framework-cookbook-app-react@2.0.14) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.12...@equinor/fusion-framework-cookbook-app-react@2.0.13) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.11...@equinor/fusion-framework-cookbook-app-react@2.0.12) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.10...@equinor/fusion-framework-cookbook-app-react@2.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.9...@equinor/fusion-framework-cookbook-app-react@2.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.8...@equinor/fusion-framework-cookbook-app-react@2.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.7...@equinor/fusion-framework-cookbook-app-react@2.0.8) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.6...@equinor/fusion-framework-cookbook-app-react@2.0.7) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.5...@equinor/fusion-framework-cookbook-app-react@2.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.4...@equinor/fusion-framework-cookbook-app-react@2.0.5) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.3...@equinor/fusion-framework-cookbook-app-react@2.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.2...@equinor/fusion-framework-cookbook-app-react@2.0.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.1...@equinor/fusion-framework-cookbook-app-react@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@2.0.0...@equinor/fusion-framework-cookbook-app-react@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.25...@equinor/fusion-framework-cookbook-app-react@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.25...@equinor/fusion-framework-cookbook-app-react@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.24...@equinor/fusion-framework-cookbook-app-react@1.3.25) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.23...@equinor/fusion-framework-cookbook-app-react@1.3.24) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.22...@equinor/fusion-framework-cookbook-app-react@1.3.23) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.21...@equinor/fusion-framework-cookbook-app-react@1.3.22) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.20...@equinor/fusion-framework-cookbook-app-react@1.3.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.19...@equinor/fusion-framework-cookbook-app-react@1.3.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.18...@equinor/fusion-framework-cookbook-app-react@1.3.19) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.17...@equinor/fusion-framework-cookbook-app-react@1.3.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.16...@equinor/fusion-framework-cookbook-app-react@1.3.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.15...@equinor/fusion-framework-cookbook-app-react@1.3.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.14...@equinor/fusion-framework-cookbook-app-react@1.3.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.13...@equinor/fusion-framework-cookbook-app-react@1.3.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.12...@equinor/fusion-framework-cookbook-app-react@1.3.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.11...@equinor/fusion-framework-cookbook-app-react@1.3.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.10...@equinor/fusion-framework-cookbook-app-react@1.3.11) (2022-11-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.9...@equinor/fusion-framework-cookbook-app-react@1.3.10) (2022-11-23)

### Bug Fixes

- **cookbooks:** update render initialize ([dedcfea](https://github.com/equinor/fusion-framework/commit/dedcfea1099adf380cc84418feb899dfe53fcd92))

## [1.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.8...@equinor/fusion-framework-cookbook-app-react@1.3.9) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.7...@equinor/fusion-framework-cookbook-app-react@1.3.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.6...@equinor/fusion-framework-cookbook-app-react@1.3.7) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.5...@equinor/fusion-framework-cookbook-app-react@1.3.6) (2022-11-18)

### Bug Fixes

- **cookbooks:** update cookbooks ([bd4c1a7](https://github.com/equinor/fusion-framework/commit/bd4c1a792ccdbae8415b0d8d83ff9bf77071f931))

## [1.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.4...@equinor/fusion-framework-cookbook-app-react@1.3.5) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.3...@equinor/fusion-framework-cookbook-app-react@1.3.4) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.2...@equinor/fusion-framework-cookbook-app-react@1.3.3) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.1...@equinor/fusion-framework-cookbook-app-react@1.3.2) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.3.0...@equinor/fusion-framework-cookbook-app-react@1.3.1) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.4...@equinor/fusion-framework-cookbook-app-react@1.3.0) (2022-11-14)

### Features

- **cookbook:** add sample config file ([0c3a4f6](https://github.com/equinor/fusion-framework/commit/0c3a4f64da505775974a0483769864ef032bb03a))

## 1.2.4 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.2...@equinor/fusion-framework-cookbook-app-react@1.2.3) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.1...@equinor/fusion-framework-cookbook-app-react@1.2.2) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.2.0...@equinor/fusion-framework-cookbook-app-react@1.2.1) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.1.2...@equinor/fusion-framework-cookbook-app-react@1.2.0) (2022-11-11)

### Features

- **cookbook:** add docker image ([2a51535](https://github.com/equinor/fusion-framework/commit/2a515350bd193fc789f9726eb1528b29ad2d7dbd))

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.1.1...@equinor/fusion-framework-cookbook-app-react@1.1.2) (2022-11-07)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react@1.1.0...@equinor/fusion-framework-cookbook-app-react@1.1.1) (2022-11-07)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react

## 1.1.0 (2022-11-07)

### Features

- **cookbook:** create initial app ([64682fa](https://github.com/equinor/fusion-framework/commit/64682fabd4f17f3d2df51e0d829f73fb2a85b90a))

### Bug Fixes

- **cookbook:** remove build ([dc4d9ae](https://github.com/equinor/fusion-framework/commit/dc4d9aeb3506c844e212f06ec7452c719598ff38))

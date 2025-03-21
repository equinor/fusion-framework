# Change Log

## 4.2.5

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

## 4.2.4

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

## 4.2.3

### Patch Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Cleaned up app config

  Removed `app.config.*` from the cookbook apps to prevent confusion when using the cookbook apps as a template for new apps.

## 4.2.2

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

## 4.2.1

### Patch Changes

- [#2182](https://github.com/equinor/fusion-framework/pull/2182) [`13d1ae4`](https://github.com/equinor/fusion-framework/commit/13d1ae4cf2147cd2a4527bad2a7023b4ac4b9bbb) Thanks [@odinr](https://github.com/odinr)! - updated all cookbooks to use `workspace:^` as a dependency version.

## 4.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

## 4.1.0

### Minor Changes

- [#1453](https://github.com/equinor/fusion-framework/pull/1453) [`6f542d4c`](https://github.com/equinor/fusion-framework/commit/6f542d4c7c01ae94c28b7e82efba800a902a7633) Thanks [@odinr](https://github.com/odinr)! - Prevent duplicate push event when navigating

  Added `master` | `slave` property when creating navigator.
  When configured as `slave`, the navigator will replace the action from `PUSH` to `REPLACE`
  The result should be that only the `master` will execute the `PUSH` action to `window.location`

## 4.0.25

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 4.0.24

### Patch Changes

- [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - fixed broken imports after updating to react@18

## 4.0.23

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

## 4.0.22

### Patch Changes

- [#1058](https://github.com/equinor/fusion-framework/pull/1058) [`4eadd69f`](https://github.com/equinor/fusion-framework/commit/4eadd69f24dc69623086d40aa367a5c8e67b6518) Thanks [@odinr](https://github.com/odinr)! - Update dependency: @remix-run/router@^1.7.2

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

- [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - updated cookbook for routing ([documentation](https://equinor.github.io/fusion-framework/modules/navigation/))

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.16...@equinor/fusion-framework-cookbook-app-react-router@4.0.17) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.15...@equinor/fusion-framework-cookbook-app-react-router@4.0.16) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.14...@equinor/fusion-framework-cookbook-app-react-router@4.0.15) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.13...@equinor/fusion-framework-cookbook-app-react-router@4.0.14) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 4.0.13 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.11...@equinor/fusion-framework-cookbook-app-react-router@4.0.12) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.10...@equinor/fusion-framework-cookbook-app-react-router@4.0.11) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.9...@equinor/fusion-framework-cookbook-app-react-router@4.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 4.0.9 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 4.0.8 (2023-05-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.6...@equinor/fusion-framework-cookbook-app-react-router@4.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.5...@equinor/fusion-framework-cookbook-app-react-router@4.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 4.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 4.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.2...@equinor/fusion-framework-cookbook-app-react-router@4.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.1...@equinor/fusion-framework-cookbook-app-react-router@4.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@4.0.0...@equinor/fusion-framework-cookbook-app-react-router@4.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.46...@equinor/fusion-framework-cookbook-app-react-router@4.0.0) (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.46](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.45...@equinor/fusion-framework-cookbook-app-react-router@3.0.46) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.45](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.42...@equinor/fusion-framework-cookbook-app-react-router@3.0.45) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.44](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.42...@equinor/fusion-framework-cookbook-app-react-router@3.0.44) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.43](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.42...@equinor/fusion-framework-cookbook-app-react-router@3.0.43) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.42](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.41...@equinor/fusion-framework-cookbook-app-react-router@3.0.42) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.41](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.40...@equinor/fusion-framework-cookbook-app-react-router@3.0.41) (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.40](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.39...@equinor/fusion-framework-cookbook-app-react-router@3.0.40) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.39](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.38...@equinor/fusion-framework-cookbook-app-react-router@3.0.39) (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.38](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.37...@equinor/fusion-framework-cookbook-app-react-router@3.0.38) (2023-03-31)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.37](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.35...@equinor/fusion-framework-cookbook-app-react-router@3.0.37) (2023-03-31)

### Bug Fixes

- **coockbooks:** pre-fixing package name with forward slash in package.json ([671785d](https://github.com/equinor/fusion-framework/commit/671785de0283b01c0852fe23d1231d30d295f4ec))

## [3.0.36](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.35...@equinor/fusion-framework-cookbook-app-react-router@3.0.36) (2023-03-31)

### Bug Fixes

- **coockbooks:** pre-fixing package name with forward slash in package.json ([671785d](https://github.com/equinor/fusion-framework/commit/671785de0283b01c0852fe23d1231d30d295f4ec))

## [3.0.35](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.34...@equinor/fusion-framework-cookbook-app-react-router@3.0.35) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.34](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.33...@equinor/fusion-framework-cookbook-app-react-router@3.0.34) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.33](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.32...@equinor/fusion-framework-cookbook-app-react-router@3.0.33) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.32](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.31...@equinor/fusion-framework-cookbook-app-react-router@3.0.32) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.30...@equinor/fusion-framework-cookbook-app-react-router@3.0.31) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 3.0.30 (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.28...@equinor/fusion-framework-cookbook-app-react-router@3.0.29) (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.27...@equinor/fusion-framework-cookbook-app-react-router@3.0.28) (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.26...@equinor/fusion-framework-cookbook-app-react-router@3.0.27) (2023-03-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.25...@equinor/fusion-framework-cookbook-app-react-router@3.0.26) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.24...@equinor/fusion-framework-cookbook-app-react-router@3.0.25) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.23...@equinor/fusion-framework-cookbook-app-react-router@3.0.24) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.23...@equinor/fusion-framework-cookbook-app-react-router@3.0.23) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.22...@equinor/fusion-framework-cookbook-app-react-router@3.0.23) (2023-03-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.21...@equinor/fusion-framework-cookbook-app-react-router@3.0.22) (2023-03-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.20...@equinor/fusion-framework-cookbook-app-react-router@3.0.21) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.19...@equinor/fusion-framework-cookbook-app-react-router@3.0.20) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.18...@equinor/fusion-framework-cookbook-app-react-router@3.0.19) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.17...@equinor/fusion-framework-cookbook-app-react-router@3.0.18) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.16...@equinor/fusion-framework-cookbook-app-react-router@3.0.17) (2023-02-22)

### Bug Fixes

- **cookbooks/app-react-router:** update router ([6cc3f72](https://github.com/equinor/fusion-framework/commit/6cc3f723ac85104fe3b5b3ce642608e33c4e0abe))

## [3.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.15...@equinor/fusion-framework-cookbook-app-react-router@3.0.16) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.14...@equinor/fusion-framework-cookbook-app-react-router@3.0.15) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.11...@equinor/fusion-framework-cookbook-app-react-router@3.0.14) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.12...@equinor/fusion-framework-cookbook-app-react-router@3.0.13) (2023-02-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.11...@equinor/fusion-framework-cookbook-app-react-router@3.0.12) (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 3.0.11 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.9...@equinor/fusion-framework-cookbook-app-react-router@3.0.10) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.7...@equinor/fusion-framework-cookbook-app-react-router@3.0.9) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.7...@equinor/fusion-framework-cookbook-app-react-router@3.0.8) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.6...@equinor/fusion-framework-cookbook-app-react-router@3.0.7) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.5...@equinor/fusion-framework-cookbook-app-react-router@3.0.6) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.4...@equinor/fusion-framework-cookbook-app-react-router@3.0.5) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.3...@equinor/fusion-framework-cookbook-app-react-router@3.0.4) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.2...@equinor/fusion-framework-cookbook-app-react-router@3.0.3) (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@3.0.1...@equinor/fusion-framework-cookbook-app-react-router@3.0.2) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 3.0.1 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.42...@equinor/fusion-framework-cookbook-app-react-router@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.42...@equinor/fusion-framework-cookbook-app-react-router@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.42](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.41...@equinor/fusion-framework-cookbook-app-react-router@2.0.42) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 2.0.41 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.40](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.39...@equinor/fusion-framework-cookbook-app-react-router@2.0.40) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.39](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.38...@equinor/fusion-framework-cookbook-app-react-router@2.0.39) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 2.0.38 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.37](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.36...@equinor/fusion-framework-cookbook-app-react-router@2.0.37) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.36](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.35...@equinor/fusion-framework-cookbook-app-react-router@2.0.36) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.35](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.34...@equinor/fusion-framework-cookbook-app-react-router@2.0.35) (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.34](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.33...@equinor/fusion-framework-cookbook-app-react-router@2.0.34) (2023-01-09)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.33](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.32...@equinor/fusion-framework-cookbook-app-react-router@2.0.33) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.32](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.31...@equinor/fusion-framework-cookbook-app-react-router@2.0.32) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.30...@equinor/fusion-framework-cookbook-app-react-router@2.0.31) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.29...@equinor/fusion-framework-cookbook-app-react-router@2.0.30) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.28...@equinor/fusion-framework-cookbook-app-react-router@2.0.29) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.27...@equinor/fusion-framework-cookbook-app-react-router@2.0.28) (2022-12-22)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.26...@equinor/fusion-framework-cookbook-app-react-router@2.0.27) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.25...@equinor/fusion-framework-cookbook-app-react-router@2.0.26) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.24...@equinor/fusion-framework-cookbook-app-react-router@2.0.25) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.23...@equinor/fusion-framework-cookbook-app-react-router@2.0.24) (2022-12-19)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.22...@equinor/fusion-framework-cookbook-app-react-router@2.0.23) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.21...@equinor/fusion-framework-cookbook-app-react-router@2.0.22) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.20...@equinor/fusion-framework-cookbook-app-react-router@2.0.21) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.19...@equinor/fusion-framework-cookbook-app-react-router@2.0.20) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.18...@equinor/fusion-framework-cookbook-app-react-router@2.0.19) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.17...@equinor/fusion-framework-cookbook-app-react-router@2.0.18) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.16...@equinor/fusion-framework-cookbook-app-react-router@2.0.17) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.15...@equinor/fusion-framework-cookbook-app-react-router@2.0.16) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.14...@equinor/fusion-framework-cookbook-app-react-router@2.0.15) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.13...@equinor/fusion-framework-cookbook-app-react-router@2.0.14) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.12...@equinor/fusion-framework-cookbook-app-react-router@2.0.13) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.11...@equinor/fusion-framework-cookbook-app-react-router@2.0.12) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.10...@equinor/fusion-framework-cookbook-app-react-router@2.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.9...@equinor/fusion-framework-cookbook-app-react-router@2.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.8...@equinor/fusion-framework-cookbook-app-react-router@2.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.7...@equinor/fusion-framework-cookbook-app-react-router@2.0.8) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.6...@equinor/fusion-framework-cookbook-app-react-router@2.0.7) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.5...@equinor/fusion-framework-cookbook-app-react-router@2.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.4...@equinor/fusion-framework-cookbook-app-react-router@2.0.5) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.3...@equinor/fusion-framework-cookbook-app-react-router@2.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.2...@equinor/fusion-framework-cookbook-app-react-router@2.0.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.1...@equinor/fusion-framework-cookbook-app-react-router@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@2.0.0...@equinor/fusion-framework-cookbook-app-react-router@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.21...@equinor/fusion-framework-cookbook-app-react-router@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.21...@equinor/fusion-framework-cookbook-app-react-router@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.20...@equinor/fusion-framework-cookbook-app-react-router@1.1.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.19...@equinor/fusion-framework-cookbook-app-react-router@1.1.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.18...@equinor/fusion-framework-cookbook-app-react-router@1.1.19) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.17...@equinor/fusion-framework-cookbook-app-react-router@1.1.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.16...@equinor/fusion-framework-cookbook-app-react-router@1.1.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.15...@equinor/fusion-framework-cookbook-app-react-router@1.1.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.14...@equinor/fusion-framework-cookbook-app-react-router@1.1.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.13...@equinor/fusion-framework-cookbook-app-react-router@1.1.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.12...@equinor/fusion-framework-cookbook-app-react-router@1.1.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.11...@equinor/fusion-framework-cookbook-app-react-router@1.1.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.10...@equinor/fusion-framework-cookbook-app-react-router@1.1.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.9...@equinor/fusion-framework-cookbook-app-react-router@1.1.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.8...@equinor/fusion-framework-cookbook-app-react-router@1.1.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.7...@equinor/fusion-framework-cookbook-app-react-router@1.1.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.6...@equinor/fusion-framework-cookbook-app-react-router@1.1.7) (2022-11-23)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.5...@equinor/fusion-framework-cookbook-app-react-router@1.1.6) (2022-11-23)

### Bug Fixes

- **cookbooks:** update render initialize ([dedcfea](https://github.com/equinor/fusion-framework/commit/dedcfea1099adf380cc84418feb899dfe53fcd92))

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.4...@equinor/fusion-framework-cookbook-app-react-router@1.1.5) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.3...@equinor/fusion-framework-cookbook-app-react-router@1.1.4) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.2...@equinor/fusion-framework-cookbook-app-react-router@1.1.3) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.1...@equinor/fusion-framework-cookbook-app-react-router@1.1.2) (2022-11-18)

### Bug Fixes

- **cookbooks:** update cookbooks ([bd4c1a7](https://github.com/equinor/fusion-framework/commit/bd4c1a792ccdbae8415b0d8d83ff9bf77071f931))

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-cookbook-app-react-router@1.1.0...@equinor/fusion-framework-cookbook-app-react-router@1.1.1) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-cookbook-app-react-router

## 1.1.0 (2022-11-17)

### Features

- **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

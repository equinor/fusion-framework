# Change Log

## 4.0.1

### Patch Changes

- [#2096](https://github.com/equinor/fusion-framework/pull/2096) [`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5) Thanks [@odinr](https://github.com/odinr)! - update documentation

## 4.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0

## 3.1.4

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7

## 3.1.3

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6

## 3.1.2

### Patch Changes

- [#1467](https://github.com/equinor/fusion-framework/pull/1467) [`a8f0f061`](https://github.com/equinor/fusion-framework/commit/a8f0f061dbde9efb3e2faf11fdb9c886d2277723) Thanks [@odinr](https://github.com/odinr)! - checks when `push`|`replace` is called if to is identical to previous to

## 3.1.1

### Patch Changes

- [#1464](https://github.com/equinor/fusion-framework/pull/1464) [`e2ec89f4`](https://github.com/equinor/fusion-framework/commit/e2ec89f457135037e2a333a61ba546fee6d99cd8) Thanks [@odinr](https://github.com/odinr)! - fix double navigation

## 3.1.0

### Minor Changes

- [#1453](https://github.com/equinor/fusion-framework/pull/1453) [`6f542d4c`](https://github.com/equinor/fusion-framework/commit/6f542d4c7c01ae94c28b7e82efba800a902a7633) Thanks [@odinr](https://github.com/odinr)! - Prevent duplicate push event when navigating

  Added `master` | `slave` property when creating navigator.
  When configured as `slave`, the navigator will replace the action from `PUSH` to `REPLACE`
  The result should be that only the `master` will execute the `PUSH` action to `window.location`

## 3.0.6

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5

## 3.0.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4

## 3.0.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3

## 3.0.3

### Patch Changes

- [#1058](https://github.com/equinor/fusion-framework/pull/1058) [`4eadd69f`](https://github.com/equinor/fusion-framework/commit/4eadd69f24dc69623086d40aa367a5c8e67b6518) Thanks [@odinr](https://github.com/odinr)! - Update dependency: @remix-run/router@^1.7.2

## 3.0.2

### Patch Changes

- [#950](https://github.com/equinor/fusion-framework/pull/950) [`24123cf7`](https://github.com/equinor/fusion-framework/commit/24123cf717c9b2b8987f9a349d7507e7057ea669) Thanks [@odinr](https://github.com/odinr)! - update generate version for packages

## 3.0.1

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 3.0.0

### Major Changes

- [#907](https://github.com/equinor/fusion-framework/pull/907) [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9) Thanks [@odinr](https://github.com/odinr)! - extend base module provider

  - make `NavigationProvider` extend `BaseModuleProvider`
  - internal function `_localizeLocation` is renamed to `_localizePath`. _should not cause breaking changes_
  - expose localized state from `Navigator` _(history)_

  BREAKING CHANGE: `NavigationProvider` no longer extends `Observable<{ action: Action; path: Path }>`, use `INavigationProvider.state# Change Log _(this is now a localized path)_

### Minor Changes

- [#907](https://github.com/equinor/fusion-framework/pull/907) [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9) Thanks [@odinr](https://github.com/odinr)! - add version to module

  - add `prebuild` step to generate version
  - update `.gitignore` to skip `version.ts` since this file is generated during building

### Patch Changes

- [#913](https://github.com/equinor/fusion-framework/pull/913) [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d) Thanks [@odinr](https://github.com/odinr)! - **Change init of NavigationProvider**

  moved the init to constructor

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.1.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [2.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@2.1.0...@equinor/fusion-framework-module-navigation@2.1.1) (2023-05-08)

### Bug Fixes

- **module-navigation:** prepend basename ([5d7c844](https://github.com/equinor/fusion-framework/commit/5d7c84454562a4c1a2ebad05923a716fbaf10660)), closes [/github.com/remix-run/react-router/blame/852e05ae4132132cf5dd82ffff4c7e5be76672ae/packages/router/router.ts#L716](https://github.com/equinor//github.com/remix-run/react-router/blame/852e05ae4132132cf5dd82ffff4c7e5be76672ae/packages/router/router.ts/issues/L716)

## 2.1.0 (2023-05-05)

### Features

- **module-navigation:** allow no argument when creating link ([4a7b56b](https://github.com/equinor/fusion-framework/commit/4a7b56bc67fe89bb79a707e8ecf2dca6757867d5))
- **module-navigation:** expose util method from provider. ([cbb1aaf](https://github.com/equinor/fusion-framework/commit/cbb1aafb700abfa0eefeac0184f92618687c3be1))

### Bug Fixes

- **module-navigation:** normalize navigation path ([08decd5](https://github.com/equinor/fusion-framework/commit/08decd59d264596a714e4346cd1853995b58b869))
- **module-navigation:** skip initial value when listening for change ([4d1a44d](https://github.com/equinor/fusion-framework/commit/4d1a44deb3a873983975112032652e3545e3548a))

## 2.0.1 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 2.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@1.0.7...@equinor/fusion-framework-module-navigation@1.0.8) (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 1.0.7 (2023-03-22)

### Bug Fixes

- **navigation:** allow inherent of parent history ([2c31592](https://github.com/equinor/fusion-framework/commit/2c31592b659608e9da6dcf88466660cd274174d2))

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@1.0.5...@equinor/fusion-framework-module-navigation@1.0.6) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@1.0.4...@equinor/fusion-framework-module-navigation@1.0.5) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 1.0.4 (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 1.0.3 (2023-02-20)

### Bug Fixes

- **modules/navigation:** initialize router on creation ([04ca77f](https://github.com/equinor/fusion-framework/commit/04ca77fd8d33d25e6e7e9580f1b9495a817aff92))

## 1.0.2 (2023-02-06)

### Bug Fixes

- **navigation:** fix subscription of listener ([f76eee1](https://github.com/equinor/fusion-framework/commit/f76eee19327c9ef805232ca7a3271a4a06e94b6f))

## 1.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@0.1.7...@equinor/fusion-framework-module-navigation@1.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@0.1.7...@equinor/fusion-framework-module-navigation@1.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@0.1.6...@equinor/fusion-framework-module-navigation@0.1.7) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 0.1.6 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## 0.1.5 (2023-01-09)

### Bug Fixes

- **module-navigation:** expose navigator ([8385afd](https://github.com/equinor/fusion-framework/commit/8385afd32a15ff3fe5e7c0a245266b3d33a3e8a0))

## 0.1.4 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-navigation@0.1.2...@equinor/fusion-framework-module-navigation@0.1.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 0.1.2 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-navigation

## 0.1.1 (2022-11-18)

### Bug Fixes

- basename in app render ([ae75815](https://github.com/equinor/fusion-framework/commit/ae75815877701c364f853413b29ad4f053d9c2c2))

## 0.1.0 (2022-11-17)

### Features

- **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

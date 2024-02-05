# Change Log

## 4.0.21

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7

## 4.0.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.6

## 4.0.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.5

## 4.0.18

### Patch Changes

- [#1601](https://github.com/equinor/fusion-framework/pull/1601) [`4ab2df5`](https://github.com/equinor/fusion-framework/commit/4ab2df5c83439f7fe3fe0846c005427e1793b576) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - add missing `graphic` and `meta` props

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-query@4.0.4

## 4.0.17

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3

## 4.0.16

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2

## 4.0.15

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-query@4.0.1

## 4.0.14

### Patch Changes

- Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-query@4.0.0

## 4.0.13

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-query@3.0.7

## 4.0.12

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6

## 4.0.11

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-query@3.0.5

## 4.0.10

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.0.9

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

## 4.0.8

### Patch Changes

- [#898](https://github.com/equinor/fusion-framework/pull/898) [`4551142e`](https://github.com/equinor/fusion-framework/commit/4551142ededdb2f1bf74eae552da26d28cd23057) Thanks [@odinr](https://github.com/odinr)! - feat(module-context): add config option for connection to parent context

  - add attribute to config interface
  - add setter on config builder
  - add check for connecting to parent when creating provider

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.6...@equinor/fusion-framework-module-context@4.0.7) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 4.0.6 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.4...@equinor/fusion-framework-module-context@4.0.5) (2023-05-12)

### Bug Fixes

- **module-context:** skip internal context queue when settting context internally ([79ed276](https://github.com/equinor/fusion-framework/commit/79ed2767e7742a4133223546ca20fa0a99db6d96))

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.3...@equinor/fusion-framework-module-context@4.0.4) (2023-05-11)

### Bug Fixes

- **module-context:** make clearCurrentContext await set context queue ([30f11fb](https://github.com/equinor/fusion-framework/commit/30f11fb0aa3204aac95718b69cca81bd1d24d983))

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.2...@equinor/fusion-framework-module-context@4.0.3) (2023-05-11)

### Bug Fixes

- **module-context:** execute all setting of context ([eb85c0c](https://github.com/equinor/fusion-framework/commit/eb85c0c239ec70edeb796b2f03b6ecd4c2fb9fb5)), closes [/github.com/equinor/fusion-framework/blob/3cd1a9e01c56fc9afb72f2df474a7b066b4215c4/packages/modules/context/src/ContextProvider.ts#L181](https://github.com/equinor//github.com/equinor/fusion-framework/blob/3cd1a9e01c56fc9afb72f2df474a7b066b4215c4/packages/modules/context/src/ContextProvider.ts/issues/L181)

## 4.0.2 (2023-05-10)

### Bug Fixes

- **module-context:** only skip first context item if not resolved ([cea6fce](https://github.com/equinor/fusion-framework/commit/cea6fcefd4853dcfbedf0d65d83cac7ac1b26523))

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.0...@equinor/fusion-framework-module-context@4.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.1.2...@equinor/fusion-framework-module-context@4.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

- **module-context:** current context can now be `null`
- **module-context:** skipInitialContext is now removed
- **module-context:** `ContextProvider.setCurrentContext` now returns an `Observable`

### Features

- **module-context:** add utils ([741774d](https://github.com/equinor/fusion-framework/commit/741774d0459c80c0f53f2030e13c7683c57359ce))
- **module-context:** allow connect tp parent context provider ([2d2a312](https://github.com/equinor/fusion-framework/commit/2d2a312a214d3b2c26fb2496af395976b0681b18))
- **module-context:** allow resolving of initial context ([b0713f3](https://github.com/equinor/fusion-framework/commit/b0713f3ff7d74e39d6a2d585bd2d95beaba7bc1c))
- **module-context:** dispose context client ([dd4203b](https://github.com/equinor/fusion-framework/commit/dd4203b50713079729be13876514e87184cbe84f))
- **module-context:** explicit `null` when context is cleared ([03738e7](https://github.com/equinor/fusion-framework/commit/03738e7a5ce75d1da322b2f34c511022f89e5aea))
- **module-context:** make setting context as an observable ([21e1c6b](https://github.com/equinor/fusion-framework/commit/21e1c6b64f541ec63dd6ea830410c7bb5cbdd84a))

### Bug Fixes

- **module-context:** expose resolve context async ([cff1cd8](https://github.com/equinor/fusion-framework/commit/cff1cd82a3a0d57513d9245d1289fc481bfac9e0))
- **module-context:** extract cause from query ([b04090c](https://github.com/equinor/fusion-framework/commit/b04090cef3184dda1db7f899939b8c223f290be5))
- **module-context:** fix index of context path ([38c89cf](https://github.com/equinor/fusion-framework/commit/38c89cfcc0d809d2ea27a8f388546ab4315fd010))
- **module-context:** fix parameters for resolving context from parent ([65eb101](https://github.com/equinor/fusion-framework/commit/65eb10159ee3bae8be53994112cac8244a315b28))
- **react-legacy-interopt:** fix initial context url ([31f113a](https://github.com/equinor/fusion-framework/commit/31f113aebc2ad09e6a446997e95ecfeef3da2fff))

## 3.1.2 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 3.1.1 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.0.2...@equinor/fusion-framework-module-context@3.1.0) (2023-04-17)

### Features

- **context:** add events for context validation|resolve failed ([dc413f0](https://github.com/equinor/fusion-framework/commit/dc413f0fe52b49349d7e07619950e96c523bb3eb))

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.0.1...@equinor/fusion-framework-module-context@3.0.2) (2023-04-17)

### Bug Fixes

- **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.0.0...@equinor/fusion-framework-module-context@3.0.1) (2023-04-17)

### Bug Fixes

- **context:** handle promise rejection of setting context ([96a0054](https://github.com/equinor/fusion-framework/commit/96a0054f6b4e9f3250a2b09493efabe96bf1e2ba))

## 3.0.0 (2023-04-16)

### Features

- **modules/context:** resolve related context ([0e92583](https://github.com/equinor/fusion-framework/commit/0e925837a4f2651ff9f2a003d13731f6d866412d))

## 2.0.15 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.14 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.13 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.12 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.10...@equinor/fusion-framework-module-context@2.0.11) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.10 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.9 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.7...@equinor/fusion-framework-module-context@2.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.7 (2023-03-20)

### Bug Fixes

- **module-context:** recursive subscribe on setCurrentContext and equal comparison ([3fe58d4](https://github.com/equinor/fusion-framework/commit/3fe58d44af770c41f5f8ea6169892318dcd35cc0))

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.5...@equinor/fusion-framework-module-context@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.4...@equinor/fusion-framework-module-context@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.3...@equinor/fusion-framework-module-context@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.2...@equinor/fusion-framework-module-context@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.8...@equinor/fusion-framework-module-context@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.8...@equinor/fusion-framework-module-context@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.7...@equinor/fusion-framework-module-context@1.2.8) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.7 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.5...@equinor/fusion-framework-module-context@1.2.6) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.4...@equinor/fusion-framework-module-context@1.2.5) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.3 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.2 (2022-12-16)

### Bug Fixes

- **module-context:** import paths ([00df4e0](https://github.com/equinor/fusion-framework/commit/00df4e04b59b8b5e7ac124cdfc726ff3e7b0f5d2))

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.0...@equinor/fusion-framework-module-context@1.2.1) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.0 (2022-12-13)

### Features

- **module-context:** add `clearContext` ([f214714](https://github.com/equinor/fusion-framework/commit/f21471479f92fb6f12f88211429d846272d6cffb))

## [1.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.9...@equinor/fusion-framework-module-context@1.1.10) (2022-12-12)

### Bug Fixes

- **context:** method for contextParameterFn on enableContext ([398658d](https://github.com/equinor/fusion-framework/commit/398658de26355a8ca99aea291963b8c302df3ddc))
- linting issues fixed ([2e62877](https://github.com/equinor/fusion-framework/commit/2e628770754b40425e97c7be2ec770824c42c6ff))

## [1.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.8...@equinor/fusion-framework-module-context@1.1.9) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.7...@equinor/fusion-framework-module-context@1.1.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.6...@equinor/fusion-framework-module-context@1.1.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.5...@equinor/fusion-framework-module-context@1.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.4...@equinor/fusion-framework-module-context@1.1.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.3...@equinor/fusion-framework-module-context@1.1.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.0...@equinor/fusion-framework-module-context@1.1.3) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.1...@equinor/fusion-framework-module-context@1.1.2) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.0...@equinor/fusion-framework-module-context@1.1.1) (2022-12-05)

### Bug Fixes

- **module-context:** update ContextItem interface ([7368fb0](https://github.com/equinor/fusion-framework/commit/7368fb08015e07cce54d30109462f36a64188d25))

## 1.1.0 (2022-12-05)

### Features

- **contextselector:** cli context selector ([f414466](https://github.com/equinor/fusion-framework/commit/f4144668e4deee32ed229807d81a0ea08ba5a476))

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.11...@equinor/fusion-framework-module-context@1.0.0) (2022-12-02)

### Features

- **module-context:** simplify context config ([d77c665](https://github.com/equinor/fusion-framework/commit/d77c6656d02f0a241ea685ae2595dda9b21420e4))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.11...@equinor/fusion-framework-module-context@1.0.0-alpha.0) (2022-12-02)

### Features

- **module-context:** simplify context config ([3b3caa9](https://github.com/equinor/fusion-framework/commit/3b3caa9374b21bb17998d78e6858880489d2e61a))

## [0.6.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.10...@equinor/fusion-framework-module-context@0.6.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.9...@equinor/fusion-framework-module-context@0.6.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.8...@equinor/fusion-framework-module-context@0.6.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.7...@equinor/fusion-framework-module-context@0.6.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.6...@equinor/fusion-framework-module-context@0.6.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.5...@equinor/fusion-framework-module-context@0.6.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.4...@equinor/fusion-framework-module-context@0.6.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.3...@equinor/fusion-framework-module-context@0.6.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.2...@equinor/fusion-framework-module-context@0.6.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.1...@equinor/fusion-framework-module-context@0.6.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.0...@equinor/fusion-framework-module-context@0.6.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.5.3...@equinor/fusion-framework-module-context@0.6.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 0.5.3 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.5.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.5.1...@equinor/fusion-framework-module-context@0.5.2) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.5.1 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.4.1...@equinor/fusion-framework-module-context@0.5.0) (2022-11-16)

### Features

- **module-context:** allow query filter ([1a89ee5](https://github.com/equinor/fusion-framework/commit/1a89ee57277af3853ce802da9b5e0956bff8ceaa))

## 0.4.1 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.3.4...@equinor/fusion-framework-module-context@0.4.0) (2022-11-14)

### Features

- update packages to use observable ([98024aa](https://github.com/equinor/fusion-framework/commit/98024aa466c68f03bd793bd564cf7b6bf65def72))

## 0.3.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.3.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.3.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.3.0...@equinor/fusion-framework-module-context@0.3.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.3.0 (2022-11-02)

### Features

- **module-context:** expose current context from client on provider ([6895056](https://github.com/equinor/fusion-framework/commit/68950561d5b3fce3c555842c8d26004387a963e1))

### Bug Fixes

- **module-context:** expose provider ([1fd2c5a](https://github.com/equinor/fusion-framework/commit/1fd2c5ae8a486a7c9b9933ffcb37918dfa3ac4b0))
- **module-context:** fix relative import ([da23b68](https://github.com/equinor/fusion-framework/commit/da23b6836739de1dda27c84b18083feff5c4055b))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.4...@equinor/fusion-framework-module-context@0.2.0) (2022-11-02)

### Features

- **module-context:** connect context module to parent ([6f1158f](https://github.com/equinor/fusion-framework/commit/6f1158f089fee8d9350875b20cba61f52886ee7a))

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.3...@equinor/fusion-framework-module-context@0.1.4) (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.2...@equinor/fusion-framework-module-context@0.1.3) (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.1.2 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.0...@equinor/fusion-framework-module-context@0.1.1) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.1.0 (2022-10-26)

### Features

- **context:** create initial context module ([c530b6a](https://github.com/equinor/fusion-framework/commit/c530b6a92f5d01c82a2b2157f819329615796e59))

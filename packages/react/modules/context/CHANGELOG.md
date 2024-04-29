# Change Log

## 6.2.4

### Patch Changes

- Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
  - @equinor/fusion-query@5.0.1
  - @equinor/fusion-framework-module-context@5.0.3

## 6.2.3

### Patch Changes

- Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
  - @equinor/fusion-query@5.0.0
  - @equinor/fusion-framework-module-context@5.0.2

## 6.2.2

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a), [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
  - @equinor/fusion-observable@8.3.0
  - @equinor/fusion-query@4.2.0
  - @equinor/fusion-framework-module-context@5.0.1

## 6.2.1

### Patch Changes

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-react-module@3.1.1
  - @equinor/fusion-framework-module-context@5.0.0

## 6.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-react-module@3.1.0
  - @equinor/fusion-observable@8.2.0
  - @equinor/fusion-framework-module-context@5.0.0
  - @equinor/fusion-query@4.1.0

## 6.1.2

### Patch Changes

- Updated dependencies [[`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098), [`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098)]:
  - @equinor/fusion-framework-module-context@4.2.0

## 6.1.1

### Patch Changes

- Updated dependencies [[`7424ad3`](https://github.com/equinor/fusion-framework/commit/7424ad37760904b7897bcafc11d85235246e1381)]:
  - @equinor/fusion-framework-module-context@4.1.1

## 6.1.0

### Minor Changes

- [#1760](https://github.com/equinor/fusion-framework/pull/1760) [`6e6ee6b`](https://github.com/equinor/fusion-framework/commit/6e6ee6b7ce280820111e8b98ac8377efb15808ef) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - - Add FusionContextSearchError.

  - Potential _BREAKING_:
    - Error in `ContextProvider.ts` are now unwrapped if the thrown error is
      `QueryClientError`.

  ```diff
  index 114f430b1..2640c9a55 100644
  --- a/packages/modules/context/src/ContextProvider.ts
  +++ b/packages/modules/context/src/ContextProvider.ts
  @@ -406,7 +407,15 @@ export class ContextProvider implements IContextProvider {
                   /* @ts-ignore */
                   this.#contextParameterFn({ search, type: this.#contextType }),
               )
  -            .pipe(map((x) => x.value));
  +            .pipe(
  +                catchError((err) => {
  +                    if (err.name === 'QueryClientError') {
  +                        throw err.cause;
  +                    }
  +                    throw err;
  +                }),
  +                map((x) => x.value),
  +            );

           return this.#contextFilter ? query$.pipe(map(this.#contextFilter)) : query$;
       }
  ```

### Patch Changes

- Updated dependencies [[`6e6ee6b`](https://github.com/equinor/fusion-framework/commit/6e6ee6b7ce280820111e8b98ac8377efb15808ef)]:
  - @equinor/fusion-framework-module-context@4.1.0

## 6.0.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@4.0.21
  - @equinor/fusion-framework-react-module@3.0.8

## 6.0.19

### Patch Changes

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
  - @equinor/fusion-observable@8.1.5
  - @equinor/fusion-query@4.0.6
  - @equinor/fusion-framework-module-context@4.0.20

## 6.0.18

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
  - @equinor/fusion-observable@8.1.4
  - @equinor/fusion-query@4.0.5
  - @equinor/fusion-framework-module-context@4.0.19

## 6.0.17

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`4ab2df5`](https://github.com/equinor/fusion-framework/commit/4ab2df5c83439f7fe3fe0846c005427e1793b576), [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-context@4.0.18
  - @equinor/fusion-observable@8.1.3
  - @equinor/fusion-query@4.0.4
  - @equinor/fusion-framework-react-module@3.0.7

## 6.0.16

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3
  - @equinor/fusion-framework-module-context@4.0.17

## 6.0.15

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2
  - @equinor/fusion-framework-module-context@4.0.16

## 6.0.14

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-context@4.0.15
  - @equinor/fusion-framework-react-module@3.0.6
  - @equinor/fusion-observable@8.1.2
  - @equinor/fusion-query@4.0.1

## 6.0.13

### Patch Changes

- Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-query@4.0.0
  - @equinor/fusion-framework-module-context@4.0.14

## 6.0.12

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
  - @equinor/fusion-observable@8.1.1
  - @equinor/fusion-query@3.0.7
  - @equinor/fusion-framework-module-context@4.0.13
  - @equinor/fusion-framework-react-module@3.0.5

## 6.0.11

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6
  - @equinor/fusion-framework-module-context@4.0.12

## 6.0.10

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-react-module@3.0.4
  - @equinor/fusion-observable@8.1.0
  - @equinor/fusion-framework-module-context@4.0.11
  - @equinor/fusion-query@3.0.5

## 6.0.9

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-module-context@4.0.9
  - @equinor/fusion-framework-react-module@3.0.3

## 6.0.8

### Patch Changes

- [#898](https://github.com/equinor/fusion-framework/pull/898) [`4551142e`](https://github.com/equinor/fusion-framework/commit/4551142ededdb2f1bf74eae552da26d28cd23057) Thanks [@odinr](https://github.com/odinr)! - refactor(module-react-context): expose module and configurator interface from context module

- Updated dependencies [[`4551142e`](https://github.com/equinor/fusion-framework/commit/4551142ededdb2f1bf74eae552da26d28cd23057)]:
  - @equinor/fusion-framework-module-context@4.0.8

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@6.0.6...@equinor/fusion-framework-react-module-context@6.0.7) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 6.0.6 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [6.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@6.0.4...@equinor/fusion-framework-react-module-context@6.0.5) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [6.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@6.0.3...@equinor/fusion-framework-react-module-context@6.0.4) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [6.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@6.0.2...@equinor/fusion-framework-react-module-context@6.0.3) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 6.0.2 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [6.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@6.0.0...@equinor/fusion-framework-react-module-context@6.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [6.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@5.0.5...@equinor/fusion-framework-react-module-context@6.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

- **module-context:** `ContextProvider.setCurrentContext` now returns an `Observable`

### Features

- **module-context:** make setting context as an observable ([21e1c6b](https://github.com/equinor/fusion-framework/commit/21e1c6b64f541ec63dd6ea830410c7bb5cbdd84a))

## 5.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 5.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@5.0.2...@equinor/fusion-framework-react-module-context@5.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@5.0.1...@equinor/fusion-framework-react-module-context@5.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [5.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@5.0.0...@equinor/fusion-framework-react-module-context@5.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 5.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.11 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.10 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.9 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.8 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@4.0.6...@equinor/fusion-framework-react-module-context@4.0.7) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.6 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.5 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@4.0.3...@equinor/fusion-framework-react-module-context@4.0.4) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 4.0.3 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@4.0.1...@equinor/fusion-framework-react-module-context@4.0.2) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@4.0.0...@equinor/fusion-framework-react-module-context@4.0.1) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@3.0.2...@equinor/fusion-framework-react-module-context@4.0.0) (2023-02-13)

### ⚠ BREAKING CHANGES

- **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

- **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
- **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@3.0.1...@equinor/fusion-framework-react-module-context@3.0.2) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 3.0.1 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 3.0.0 (2023-02-01)

### ⚠ BREAKING CHANGES

- hook has new return type

### Bug Fixes

- references to useObservableState ([614a569](https://github.com/equinor/fusion-framework/commit/614a5691f856765f07f5d71e39708f80dea49a6e))

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.23...@equinor/fusion-framework-react-module-context@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.23...@equinor/fusion-framework-react-module-context@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.22...@equinor/fusion-framework-react-module-context@1.0.23) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 1.0.22 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.20...@equinor/fusion-framework-react-module-context@1.0.21) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.19...@equinor/fusion-framework-react-module-context@1.0.20) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 1.0.19 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.17...@equinor/fusion-framework-react-module-context@1.0.18) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 1.0.17 (2023-01-12)

### Bug Fixes

- :bug: context undefined on first render ([790850e](https://github.com/equinor/fusion-framework/commit/790850e8c928e4feb8537a07bd8d5d6afb268bb5))

## 1.0.16 (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.14...@equinor/fusion-framework-react-module-context@1.0.15) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 1.0.14 (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.12...@equinor/fusion-framework-react-module-context@1.0.13) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.11...@equinor/fusion-framework-react-module-context@1.0.12) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.10...@equinor/fusion-framework-react-module-context@1.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.9...@equinor/fusion-framework-react-module-context@1.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.8...@equinor/fusion-framework-react-module-context@1.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.7...@equinor/fusion-framework-react-module-context@1.0.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.6...@equinor/fusion-framework-react-module-context@1.0.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.5...@equinor/fusion-framework-react-module-context@1.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.4...@equinor/fusion-framework-react-module-context@1.0.5) (2022-12-06)

### Bug Fixes

- **react-module-context:** memo client query fn ([ebfae82](https://github.com/equinor/fusion-framework/commit/ebfae82fcdd4879cdefee07dcc7a5612b7ac81cd))

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.3...@equinor/fusion-framework-react-module-context@1.0.4) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@1.0.2...@equinor/fusion-framework-react-module-context@1.0.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 1.0.2 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.11...@equinor/fusion-framework-react-module-context@1.0.0) (2022-12-02)

### Features

- update exiting debounce hooks ([27e716c](https://github.com/equinor/fusion-framework/commit/27e716ca253206d532e0f02233beb6f29c10de22))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.11...@equinor/fusion-framework-react-module-context@1.0.0-alpha.0) (2022-12-02)

### Features

- update exiting debounce hooks ([dd3eb5f](https://github.com/equinor/fusion-framework/commit/dd3eb5ff1a05edd6c25fd1ad65c0b68d50f5799a))

## [0.4.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.10...@equinor/fusion-framework-react-module-context@0.4.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.9...@equinor/fusion-framework-react-module-context@0.4.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.8...@equinor/fusion-framework-react-module-context@0.4.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.7...@equinor/fusion-framework-react-module-context@0.4.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.6...@equinor/fusion-framework-react-module-context@0.4.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.5...@equinor/fusion-framework-react-module-context@0.4.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.4...@equinor/fusion-framework-react-module-context@0.4.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.3...@equinor/fusion-framework-react-module-context@0.4.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.2...@equinor/fusion-framework-react-module-context@0.4.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.1...@equinor/fusion-framework-react-module-context@0.4.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.4.0...@equinor/fusion-framework-react-module-context@0.4.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.3.1...@equinor/fusion-framework-react-module-context@0.4.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 0.3.1 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.2.1...@equinor/fusion-framework-react-module-context@0.3.0) (2022-11-20)

### Features

- **react-module-context:** allow setting context by id ([c2acbf0](https://github.com/equinor/fusion-framework/commit/c2acbf0e1cb3fb8fd54f822ee76ff153851f2da7))
- **react-module-context:** create hook for query context ([67826a5](https://github.com/equinor/fusion-framework/commit/67826a572d43bb36dd58869acf880f87959429d8))

### Bug Fixes

- **react-module-context:** expose enable context ([59248a5](https://github.com/equinor/fusion-framework/commit/59248a52b1406ed2331b336c02a28a482e2d419f))

## 0.2.1 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.2.0 (2022-11-17)

### Features

- update typing of useModule hook ([958dd04](https://github.com/equinor/fusion-framework/commit/958dd0401667e9ebb1a51bced128ae43369cd6c4))

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.1.8...@equinor/fusion-framework-react-module-context@0.1.9) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.1.8 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.1.6...@equinor/fusion-framework-react-module-context@0.1.7) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.1.6 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.1.5 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.1.4 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.1.2...@equinor/fusion-framework-react-module-context@0.1.3) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.1.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-context@0.1.0...@equinor/fusion-framework-react-module-context@0.1.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-context

## 0.1.0 (2022-11-02)

### Features

- **react-module-context:** create react tooling context module ([0864830](https://github.com/equinor/fusion-framework/commit/086483008671d898b4ac901d8729bf700786ee6a))

# Change Log

## 2.0.13

### Patch Changes

-   [#783](https://github.com/equinor/fusion-framework/pull/783) [`1749da29`](https://github.com/equinor/fusion-framework/commit/1749da290c98c0a43b9fdf2253dfb224e4ccdcd0) Thanks [@Noggling](https://github.com/Noggling)! - updated `CreateBookMarkFn` type to support promise

-   Updated dependencies [[`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63), [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
    -   @equinor/fusion-query@3.0.4
    -   @equinor/fusion-framework-react@5.2.3

## 2.0.12

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-module-context@4.0.9
    -   @equinor/fusion-framework-react@5.1.4
    -   @equinor/fusion-framework-react-module@3.0.3

## 2.0.11

### Patch Changes

-   727fb935: fix(react-module-bookmark): module can be undefined

    the bookmark module might not been enable, which makes the application crash.

    **TODO:**

    -   [ ] create a simpler hook for using bookmark
    -   [ ] create a hook for exposing the module
    -   [ ] create better documentation

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.9...@equinor/fusion-framework-react-module-bookmark@2.0.10) (2023-05-24)

### Bug Fixes

-   **react-module-bookmark:** check if bookmark provider ([af112fb](https://github.com/equinor/fusion-framework/commit/af112fb43f95be28c129be1d31c0d494edb027cc))

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.8...@equinor/fusion-framework-react-module-bookmark@2.0.9) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.7...@equinor/fusion-framework-react-module-bookmark@2.0.8) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.6...@equinor/fusion-framework-react-module-bookmark@2.0.7) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 2.0.6 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.4...@equinor/fusion-framework-react-module-bookmark@2.0.5) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.3...@equinor/fusion-framework-react-module-bookmark@2.0.4) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.2...@equinor/fusion-framework-react-module-bookmark@2.0.3) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 2.0.2 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@2.0.0...@equinor/fusion-framework-react-module-bookmark@2.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@1.0.5...@equinor/fusion-framework-react-module-bookmark@2.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

-   **module-context:** `ContextProvider.setCurrentContext` now returns an `Observable`

### Features

-   **module-context:** make setting context as an observable ([21e1c6b](https://github.com/equinor/fusion-framework/commit/21e1c6b64f541ec63dd6ea830410c7bb5cbdd84a))

### Bug Fixes

-   **react-legacy-interopt:** fix initial context url ([31f113a](https://github.com/equinor/fusion-framework/commit/31f113aebc2ad09e6a446997e95ecfeef3da2fff))

## 1.0.5 (2023-04-24)

### Bug Fixes

-   **react-bookmarks:** added favorites add and remove to useBookmark plus one util ([0da0f5b](https://github.com/equinor/fusion-framework/commit/0da0f5b9fc1ce8edbd227c6e9676170ea422167d))

## 1.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@1.0.2...@equinor/fusion-framework-react-module-bookmark@1.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@1.0.1...@equinor/fusion-framework-react-module-bookmark@1.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@1.0.0...@equinor/fusion-framework-react-module-bookmark@1.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 1.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 0.1.11 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 0.1.10 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 0.1.9 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@0.1.7...@equinor/fusion-framework-react-module-bookmark@0.1.8) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 0.1.7 (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@0.1.5...@equinor/fusion-framework-react-module-bookmark@0.1.6) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@0.1.4...@equinor/fusion-framework-react-module-bookmark@0.1.5) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@0.1.3...@equinor/fusion-framework-react-module-bookmark@0.1.4) (2023-03-24)

### Bug Fixes

-   **react-module-bookmark:** fix tsconfig ([f3e0714](https://github.com/equinor/fusion-framework/commit/f3e07144b6f769bd039a4699e6cd19a6ef538799))

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@0.1.2...@equinor/fusion-framework-react-module-bookmark@0.1.3) (2023-03-24)

### Bug Fixes

-   **bookmark-react-module:** allowing for resolving bookmark by id ([50588e7](https://github.com/equinor/fusion-framework/commit/50588e7060c2d58037e5a949ff07bb72c8e4fb77))
-   **bookmark-react-module:** fix type ([22219eb](https://github.com/equinor/fusion-framework/commit/22219ebb4b820b50d732e41057e57dca2a02944f))

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-bookmark@0.1.1...@equinor/fusion-framework-react-module-bookmark@0.1.2) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-bookmark

## 0.1.1 (2023-03-24)

### Bug Fixes

-   **react-module-bookmark:** added navigation module to devDeps ([1d9083f](https://github.com/equinor/fusion-framework/commit/1d9083f57e62281bc52c649757dc450d2ecf7fdc))
-   **react-module-bookmark:** changed import ti type import ([08507d1](https://github.com/equinor/fusion-framework/commit/08507d17e653baf0e42a314476994af63e80464a))

## 0.1.0 (2023-03-22)

### Features

-   React bookmark module - hooks for the fusion bookmark module provider ([017c9d2](https://github.com/equinor/fusion-framework/commit/017c9d242ec5769600f38756718ed53456505f12))

### Bug Fixes

-   **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

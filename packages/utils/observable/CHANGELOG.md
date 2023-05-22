# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 8.0.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-observable

## 8.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-observable

## 7.0.3 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-observable

## [7.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@7.0.1...@equinor/fusion-observable@7.0.2) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-observable

## [7.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@7.0.0...@equinor/fusion-observable@7.0.1) (2023-02-20)

### Bug Fixes

-   **utils:** expose action call types ([af50204](https://github.com/equinor/fusion-framework/commit/af502049e2709c349f8b488aa84a62afc1baf0fd))

## 7.0.0 (2023-02-13)

### ⚠ BREAKING CHANGES

-   **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

-   **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
-   **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## 6.0.0 (2023-02-01)

### ⚠ BREAKING CHANGES

-   hook has new return type

### Features

-   useObservableState hook ([e26f2a9](https://github.com/equinor/fusion-framework/commit/e26f2a9a116e128c407b8268775eaffab02c4a7c))

### Bug Fixes

-   references to useObservableState ([614a569](https://github.com/equinor/fusion-framework/commit/614a5691f856765f07f5d71e39708f80dea49a6e))

## 4.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-observable

## 4.0.0 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-observable

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@3.0.4...@equinor/fusion-observable@4.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-observable

## 3.0.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-observable

## 3.0.3 (2022-12-14)

### Bug Fixes

-   **utils/observable:** improve type-hinting ([761dfb0](https://github.com/equinor/fusion-framework/commit/761dfb0d5675fba05bd31889d4bd4d2f721880ec))

## 3.0.2 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-observable

## 3.0.1 (2022-12-05)

### Bug Fixes

-   **utils:** export createState ([2e5030c](https://github.com/equinor/fusion-framework/commit/2e5030ca823c752ccd2e438afdec088bdcf1a8e5))

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.5.0...@equinor/fusion-observable@3.0.0) (2022-12-02)

### Features

-   **observable:** create hook for debouncing functions ([cca2630](https://github.com/equinor/fusion-framework/commit/cca2630c8ad26ddf054ad1d65aa9994254e0d153))
-   update exiting debounce hooks ([27e716c](https://github.com/equinor/fusion-framework/commit/27e716ca253206d532e0f02233beb6f29c10de22))

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.5.0...@equinor/fusion-observable@3.0.0-alpha.0) (2022-12-02)

### Features

-   **observable:** create hook for debouncing functions ([a37bcaf](https://github.com/equinor/fusion-framework/commit/a37bcaf6cabdecb4a3ade7fb3da8c83a9473f919))
-   update exiting debounce hooks ([dd3eb5f](https://github.com/equinor/fusion-framework/commit/dd3eb5ff1a05edd6c25fd1ad65c0b68d50f5799a))

## 2.5.0 (2022-12-01)

### Features

-   **observable:** add functionality for create state ([a114838](https://github.com/equinor/fusion-framework/commit/a114838a83a050516c50cfaeeb7adbd3ac181665))

### Bug Fixes

-   **observable:** fix typing of action mapper ([2ebca25](https://github.com/equinor/fusion-framework/commit/2ebca25789106e94f5a0dc2aa11f5bca2d40a255))

## [2.4.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.4.1...@equinor/fusion-observable@2.4.2) (2022-12-01)

### Bug Fixes

-   import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [2.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.4.0...@equinor/fusion-observable@2.4.1) (2022-12-01)

### Bug Fixes

-   **observable:** add missing state creation in reducer ([205e490](https://github.com/equinor/fusion-framework/commit/205e490ba485106e115974b3dc84280cf5853649))

## [2.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.3.0...@equinor/fusion-observable@2.4.0) (2022-12-01)

### Features

-   **observable:** support mapping of action definitions ([a508a6e](https://github.com/equinor/fusion-framework/commit/a508a6e19f1119b23cc2c20c9caa593a63d05412))

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.2.0...@equinor/fusion-observable@2.3.0) (2022-12-01)

### Features

-   **observable:** support state from create-reducer ([32d7664](https://github.com/equinor/fusion-framework/commit/32d7664d34ecbfc151d609a555b1bebd4989c965))

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.1.2...@equinor/fusion-observable@2.2.0) (2022-12-01)

### Features

-   **observable:** expose functionality for creating a reducer ([a750ac7](https://github.com/equinor/fusion-framework/commit/a750ac73a81cfac6faa8b9204217faa22ff8130d))

## [2.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.1.0...@equinor/fusion-observable@2.1.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.0.1...@equinor/fusion-observable@2.1.0) (2022-12-01)

### Features

-   **observable:** expose function for creating actions ([26e1731](https://github.com/equinor/fusion-framework/commit/26e17313fb9e1a4e329f3d4b037fbcf75688d224))

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.0.0...@equinor/fusion-observable@2.0.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@1.6.0...@equinor/fusion-observable@2.0.0) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [1.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@1.5.1...@equinor/fusion-observable@1.6.0) (2022-12-01)

### Features

-   **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 1.5.1 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## 1.5.0 (2022-11-20)

### Features

-   **observable:** expose fetch status ([d936826](https://github.com/equinor/fusion-framework/commit/d93682607194ea9512a8cce6711772b65164257f))

## 1.4.1 (2022-11-14)

### Bug Fixes

-   **observable:** skip error handling on cache subscription ([b3c8102](https://github.com/equinor/fusion-framework/commit/b3c81027dade03e5fb73680ee419200c6f3d0ba4))

## 1.4.0 (2022-11-14)

### Features

-   **observable:** update queue system ([bda336c](https://github.com/equinor/fusion-framework/commit/bda336cf40e131866c5dcc48c93d8349c7e77063))

## 1.3.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-observable

## 1.3.0 (2022-11-01)

### Features

-   **observable:** allow cancellation of transaction ([9615ee1](https://github.com/equinor/fusion-framework/commit/9615ee1315f0ae44cc0246b4efa48be87512536e))
-   **observable:** create query value selector ([3bfcdc3](https://github.com/equinor/fusion-framework/commit/3bfcdc3070c926d9c12cb701acdf2098da078717))

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@1.2.0...@equinor/fusion-observable@1.2.1) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-observable

## 1.2.0 (2022-10-26)

### Features

-   **observable:** allow preprocessor of queue ([b13ddf0](https://github.com/equinor/fusion-framework/commit/b13ddf05473ba53593dbc2318472e909012aae54))
-   **observable:** return last cache entry ([931dc31](https://github.com/equinor/fusion-framework/commit/931dc3176a94affcf50d1a3681fcd9fd43c170cc))
-   **test-app:** update test app ([74dc5eb](https://github.com/equinor/fusion-framework/commit/74dc5eb4504544d84dabaff865152e7ba33f9601))

## 1.1.0 (2022-10-21)

### Features

-   **observable:** enhance cache system ([626d3a2](https://github.com/equinor/fusion-framework/commit/626d3a299970cccc887501956a00e89db02f20a0))

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.4.0...@equinor/fusion-observable@1.0.0) (2022-10-17)

### Features

-   **observable:** rewrite observable query ([6725274](https://github.com/equinor/fusion-framework/commit/67252743cacaacb42b47719e2f51f48b52b83545))

## [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.3.3...@equinor/fusion-observable@0.4.0) (2022-10-17)

### Features

-   **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

### Bug Fixes

-   **observable:** expose QueryClient constructor arguments ([604245a](https://github.com/equinor/fusion-framework/commit/604245a410116a9f055185d921dccf45cf5cf259))

## 0.3.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.3.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.3.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-observable

# 0.3.0 (2022-08-08)

### Features

-   **observable:** provide hook for converting observable query ([6f1c95c](https://github.com/equinor/fusion-framework/commit/6f1c95c38446e63cb4f0573a0e99ee31daf55e9a))

# 0.2.0 (2022-08-04)

### Features

-   **observable:** create hook for using query client ([#191](https://github.com/equinor/fusion-framework/issues/191)) ([0a74d2e](https://github.com/equinor/fusion-framework/commit/0a74d2ea4b0a920887b66a69a5298043fefc8c1a))

## 0.1.12 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.10...@equinor/fusion-observable@0.1.11) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.9...@equinor/fusion-observable@0.1.10) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.8...@equinor/fusion-observable@0.1.9) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.7...@equinor/fusion-observable@0.1.8) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.6...@equinor/fusion-observable@0.1.7) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.5...@equinor/fusion-observable@0.1.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.4...@equinor/fusion-observable@0.1.5) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.1.4 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-observable

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.1.2...@equinor/fusion-observable@0.1.3) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.1.2 (2022-06-13)

### Bug Fixes

-   **observable:** expose query ([cf11bb9](https://github.com/equinor/fusion-framework/commit/cf11bb963349e1b586cb8c2c4a24e4010aa3cca1))

## 0.1.1 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-observable

# [0.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.0.2...@equinor/fusion-observable@0.1.0) (2022-05-12)

### Features

-   **observable:** add query ([#103](https://github.com/equinor/fusion-framework/issues/103)) ([1ce48ba](https://github.com/equinor/fusion-framework/commit/1ce48ba9bdba48496bec1f084b9c221f001794d6))

## [0.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.0.1...@equinor/fusion-observable@0.0.2) (2022-04-21)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.0.1 (2022-04-11)

**Note:** Version bump only for package @equinor/fusion-observable

# Change Log

## 8.1.4

### Patch Changes

-   [`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a) Thanks [@odinr](https://github.com/odinr)! - added default action type to ActionError

## 8.1.3

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

## 8.1.2

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 8.1.1

### Patch Changes

-   [#1213](https://github.com/equinor/fusion-framework/pull/1213) [`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760) Thanks [@eikeland](https://github.com/eikeland)! - # package.json setting type.module

    Removing type.module from package config since it was causing issues in @equinor/fusion-cli

-   [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4) Thanks [@odinr](https://github.com/odinr)! - expose `castDraft` from immer, since reused when creating reducers

## 8.1.0

### Minor Changes

-   [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - Use initial state from observable if observable has value property

    -   update typing og arguments
    -   update initial state to fallback to `observable.value`
        -   _`opt.initial` will supersede `observable.value`_
        -   internally `useLayoutEffect` subscribes to subject, so `opt.initial` will be overridden in next `tick`
    -   when provided subject changes instance, subscription will set current state to `observable.value` of the new subject
        -   only applies if new observable has value property

    update typing when using stateful observable in `useObservableState`

    if the source has a value property, the state will return the type of the observable

    _previously the return type was observable type or `undefined`, since the initial state would be undefined before source emits values_

    ```ts
    /** value: {foo:string}|undefined  */
    const { value } = useObservableState(source$ as Observable<{ foo: string }>);
    /** value: {foo:string}  */
    const { value } = useObservableState(source$ as BehaviorSubject<{ foo: string }>);

    /* override initial value  */
    const { value } = useObservableState(source$ as BehaviorSubject<{ foo: string }>, {
        initial: 'bar',
    });
    ```

-   [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - Add operator for using string property selector on `Observable<Record<string, unknown>>`

    example:

    ```ts
    // Observable<{foo: {bar: string}}>
    observable.pipe(mapProp('foo')); // Observable<{bar:string}>
    observable.pipe(mapProp('foo.bar')); // Observable<string>
    ```

-   [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - Allow using string path for observable selector

    > simplify usage of `useObservableSelector`

    ```ts
    // new
    useObservableSelector(source$, 'foo.bar');
    // existing
    useObservableSelector(
        source$,
        useCallback((source) => source.foo.bar, []),
    );
    ```

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - fix typing of `useObservableInputState`

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

## 8.0.3

### Patch Changes

-   [#1077](https://github.com/equinor/fusion-framework/pull/1077) [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f) Thanks [@odinr](https://github.com/odinr)! - useObservable no longer need initial parameter if reducer is `ReducerWithInitialState`

-   [#1077](https://github.com/equinor/fusion-framework/pull/1077) [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f) Thanks [@odinr](https://github.com/odinr)! - observer is now optional in subscription hooks

-   [#1077](https://github.com/equinor/fusion-framework/pull/1077) [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f) Thanks [@odinr](https://github.com/odinr)! - renamed `useObservableEpic` to `useObservableFlow`

    -   rename source file
    -   mark `useObservableEpic` as **deprecated**
    -   update index source file

-   [#1045](https://github.com/equinor/fusion-framework/pull/1045) [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63) Thanks [@eikeland](https://github.com/eikeland)! - # @equinor/fusion-observable

    Adding Immer as dependecy to @equinor/fusion-observable

## 8.0.2

### Patch Changes

-   [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - fix linting

    when using `React.useCallback` inside another hook, the callback function cant resolve input type of callback.

    https://github.com/equinor/fusion-framework/blob/ddc5bdbc0e0f8c61affb66631fe59366785ee474/packages/utils/observable/src/react/useObservableRef.ts#L15-L18

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

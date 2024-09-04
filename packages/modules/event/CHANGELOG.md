# Change Log

## 4.2.3

### Patch Changes

-   Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
    -   @equinor/fusion-framework-module@4.3.4

## 4.2.2

### Patch Changes

-   Updated dependencies [[`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
    -   @equinor/fusion-framework-module@4.3.3

## 4.2.1

### Patch Changes

-   [#2343](https://github.com/equinor/fusion-framework/pull/2343) [`736ef31`](https://github.com/equinor/fusion-framework/commit/736ef310ee101738f9022d581a2b3189b30a2646) Thanks [@odinr](https://github.com/odinr)! - Mutating complex objects like class instances would cause immer to throw an error. This change adds a try-catch block around the creation of immutable copies of event details to handle potential errors and disable mutations if the event details cannot be securely mutated.

    **added:**

    -   Imported `enableMapSet` from `immer` and invoked `enableMapSet()` to support Map and Set types in Immer drafts.
    -   Added a try-catch block around the creation of immutable copies of event details to handle potential errors and disable mutations if the event details cannot be securely mutated.

    **modified:**

    -   Removed the initial assignment of `#detail` and `#originalDetail` to the immutable copy produced by `immer`. Instead, they are initially assigned the raw `args.detail` value.
    -   The assignment of `#detail` and `#originalDetail` to an immutable copy is now done inside the try block, ensuring that mutations are only disabled upon failure to create an immutable copy.
    -   The assignment of `#source` is now done directly from `args.source` without attempting to create an immutable copy.

## 4.2.0

### Minor Changes

-   [#2326](https://github.com/equinor/fusion-framework/pull/2326) [`b628e90`](https://github.com/equinor/fusion-framework/commit/b628e90500b62e0185c09eb665ce31025bc9b541) Thanks [@odinr](https://github.com/odinr)! - Added feature for allowing the event listener to mutate the event details.

    **NOTE:** to not break the current behavior, the event creator needs to set the `allowMutate` flag to `true` in the event details.

    ```ts
    /** example of event listener */
    eventModule.on('foo', (event) => {
        event.updateDetails((details) => {
            details.foo = 'bar';
        });
    });

    /** example of event creation */
    const event = new CustomEvent({ foo: 'foo' }, { allowMutate: true });
    await eventModule.emit(event);

    console.log(event.details.foo); // bar
    console.log(event.originalDetails.foo); // foo
    ```

    The package now uses `immer` to allow for immutability of the event details. This means that the event details can be mutated in the event listener without affecting the original event details.

### Patch Changes

-   [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

-   [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

    Removing the `removeComments` option allows TypeScript to preserve comments in the compiled JavaScript output. This can be beneficial for several reasons:

    1. Improved debugging: Preserved comments can help developers understand the code better during debugging sessions.
    2. Documentation: JSDoc comments and other important code documentation will be retained in the compiled output.
    3. Source map accuracy: Keeping comments can lead to more accurate source maps, which is crucial for debugging and error tracking.

    No action is required from consumers of the library. This change affects the build process and doesn't introduce any breaking changes or new features.

    Before:

    ```json
    {
        "compilerOptions": {
            "module": "ES2022",
            "target": "ES6",
            "incremental": true,
            "removeComments": true,
            "preserveConstEnums": true,
            "sourceMap": true,
            "moduleResolution": "node"
        }
    }
    ```

    After:

    ```json
    {
        "compilerOptions": {
            "module": "ES2022",
            "target": "ES6",
            "incremental": true,
            "preserveConstEnums": true,
            "sourceMap": true,
            "moduleResolution": "node"
        }
    }
    ```

    This change ensures that comments are preserved in the compiled output, potentially improving the development and debugging experience for users of the Fusion Framework.

-   Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
    -   @equinor/fusion-framework-module@4.3.2

## 4.1.2

### Patch Changes

-   [#2171](https://github.com/equinor/fusion-framework/pull/2171) [`9a91bb7`](https://github.com/equinor/fusion-framework/commit/9a91bb737d3452e697c047c0f5c7caa2adfd535d) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-event

    ### Improved Type Resolution for `FrameworkEventInitType`

    The `FrameworkEventInitType` type has been enhanced to better resolve types for both `IFrameworkEvent` and `FrameworkEvent`.

    When defining events `FrameworkEventMap`, the dispatch type can now be inferred from the event type.

    #### Changes

    The type definition for `FrameworkEventInitType` has been updated as follows:

    ```typescript
    export type FrameworkEventInitType<T> =
        T extends IFrameworkEvent<infer U> ? U : T extends FrameworkEvent<infer U> ? U : never;
    ```

    This change ensures that `FrameworkEventInitType` can now correctly infer the type for both `IFrameworkEvent` and `FrameworkEvent`.

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
    -   @equinor/fusion-framework-module@4.3.1

## 4.1.1

### Patch Changes

-   [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

## 4.1.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0

## 4.0.8

### Patch Changes

-   Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    -   @equinor/fusion-framework-module@4.2.7

## 4.0.7

### Patch Changes

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-module@4.2.6

## 4.0.6

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module@4.2.5

## 4.0.5

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4

## 4.0.4

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3

## 4.0.3

### Patch Changes

-   [#1076](https://github.com/equinor/fusion-framework/pull/1076) [`7aee3cf0`](https://github.com/equinor/fusion-framework/commit/7aee3cf01764a272e7b0a09045ff674575b15035) Thanks [@odinr](https://github.com/odinr)! - expose event stream from `IEventModuleProvider`

-   [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

    only style semantics updated

-   Updated dependencies [[`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
    -   @equinor/fusion-framework-module@4.2.2

## 4.0.2

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework-module@4.2.1

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 4.0.1 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## 4.0.0 (2023-05-05)

### ⚠ BREAKING CHANGES

-   **modules:** postInitialize no longer support void function, should not affect any application, only used internally

### Features

-   **modules:** change postInitialize to return ObservableInput ([f1c2f56](https://github.com/equinor/fusion-framework/commit/f1c2f5644c6db2405bf5747a1094548e1723cce1))

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

-   **module-event:** allow filtering of events ([7cf41a7](https://github.com/equinor/fusion-framework/commit/7cf41a7e3662c46bb1126e7ac969ff229f22cd63))

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

-   **module-event:** update typing of event source ([321aabc](https://github.com/equinor/fusion-framework/commit/321aabcdaa4f121ffa73e37fe4f9d05f049d12d2))

## 1.1.0 (2022-11-01)

### Features

-   **module-event:** make details required ([ed4e8d7](https://github.com/equinor/fusion-framework/commit/ed4e8d7092be94b4ba4fd86edec8e261efe6d944))

## 1.0.13 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@1.0.11...@equinor/fusion-framework-module-event@1.0.12) (2022-10-21)

### Bug Fixes

-   **module-event:** update import paths ([7007b30](https://github.com/equinor/fusion-framework/commit/7007b30eb5e7b4cdecafa264224f559f7b75b08a))

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

-   **module-event:** expose event handler interface ([0b5bb32](https://github.com/equinor/fusion-framework/commit/0b5bb32c5d8eb445149da5d1e6012d90f1ccbc30))

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-event@0.1.0...@equinor/fusion-framework-module-event@0.1.1) (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-event

# 0.1.0 (2022-08-18)

### Features

-   **module-event:** initial ([1202e9e](https://github.com/equinor/fusion-framework/commit/1202e9ebe711d0bea653826857e41d0c1c65ab24))

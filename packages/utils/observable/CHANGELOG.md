# Change Log

## 8.5.6

### Patch Changes

- [#3654](https://github.com/equinor/fusion-framework/pull/3654) [`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update immer from 10.1.3 to 10.2.0 for performance improvements, including optimized caching and iteration logic.

## 8.5.5

### Patch Changes

- [#3515](https://github.com/equinor/fusion-framework/pull/3515) [`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275) Thanks [@odinr](https://github.com/odinr)! - ## Global Biome Configuration Modernization

  **Workspace-wide changes:**

  - Remove 19 rule overrides from `biome.json` to use Biome's strict "error" defaults
  - Enable `correctness/useUniqueElementIds` accessibility rule globally
  - Reduce configuration size by 40% (60+ → ~35 lines)
  - Eliminate all custom linting rule customizations

  **Package-specific changes:**

  - Replace static IDs with React `useId()` hooks in bookmark and dev-portal components
  - Fix `suspicious/noAssignInExpressions` violations in context, legacy-interopt, and observable packages
  - Update 11 React components for accessibility compliance

  **Impact:** All packages now use consistent, strict code quality enforcement with zero custom rule overrides.

  resolves: [#3494](https://github.com/equinor/fusion-framework/issues/3494)
  resolves: [#3495](https://github.com/equinor/fusion-framework/issues/3495)

## 8.5.4

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

## 8.5.3

### Patch Changes

- [#3395](https://github.com/equinor/fusion-framework/pull/3395) [`29f6710`](https://github.com/equinor/fusion-framework/commit/29f6710238baf9b29f42394b30cb8b97f25462c3) Thanks [@odinr](https://github.com/odinr)! - Updated immer from 9.0.16 to 10.1.3 across all packages.

  ### Breaking Changes

  - Immer 10.x introduces stricter TypeScript types for draft functions
  - `ValidRecipeReturnType` type constraints have changed
  - Promise return types in draft functions are no longer automatically handled

  ### Fixes Applied

  - Updated BookmarkProvider to handle new immer type constraints
  - Fixed ObservableInput type assignments in mergeScan operations
  - Removed async/await from immer draft functions to comply with new type requirements

  ### Links

  - [Immer 10.0.0 Release Notes](https://github.com/immerjs/immer/releases/tag/v10.0.0)
  - [Immer Migration Guide](https://github.com/immerjs/immer/blob/main/MIGRATION.md)

- [#3402](https://github.com/equinor/fusion-framework/pull/3402) [`7bb88c6`](https://github.com/equinor/fusion-framework/commit/7bb88c6247f3d93eccf363d610116c519f1ecff4) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @types/uuid from 9.0.8/10.0.0 to 11.0.0

  Updated TypeScript type definitions for UUID operations across multiple packages. This major version update provides improved type safety and compatibility with the latest UUID library features.

  ### Affected Packages

  - @equinor/fusion-framework-module-bookmark: @types/uuid ^9.0.8 → ^11.0.0
  - @equinor/fusion-framework-module-feature-flag: @types/uuid ^10.0.0 → ^11.0.0
  - @equinor/fusion-observable: @types/uuid ^10.0.0 → ^11.0.0
  - @equinor/fusion-query: @types/uuid ^10.0.0 → ^11.0.0

  ### Links

  - [@types/uuid on npm](https://www.npmjs.com/package/@types/uuid)
  - [DefinitelyTyped @types/uuid](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/uuid)

- [#3347](https://github.com/equinor/fusion-framework/pull/3347) [`11143fa`](https://github.com/equinor/fusion-framework/commit/11143fa3002fb8a6c095052a04c7e596c56bafa8) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump uuid from 11.0.3 to 13.0.0

  ### Breaking Changes

  - v13.0.0: Make browser exports the default
  - v12.0.0: Update to TypeScript 5.2, remove CommonJS support, drop Node 16 support

  ### New Features

  - Improved v4() performance
  - Added Node 24 to CI matrix
  - Restored node: prefix support

  ### Links

  - [GitHub releases](https://github.com/uuidjs/uuid/releases/tag/v13.0.0)
  - [npm changelog](https://www.npmjs.com/package/uuid?activeTab=versions)

## 8.5.2

### Patch Changes

- [#2910](https://github.com/equinor/fusion-framework/pull/2910) [`07cc985`](https://github.com/equinor/fusion-framework/commit/07cc9857e1427b574e011cc319518e701dba784d) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vitest from 2.1.9 to 3.2.4 across all packages.

  ## Breaking Changes

  - **Node.js Requirements**: Requires Node.js 18+ (already satisfied)
  - **Vite Compatibility**: Updated to work with Vite 7.x (already using Vite 7.1.5)
  - **Snapshot Format**: Snapshots now use backtick quotes (\`) instead of single quotes
  - **Coverage API**: New coverage methods `enableCoverage()` and `disableCoverage()`
  - **TypeScript Support**: Enhanced TypeScript integration and type definitions

  ## Security Updates

  - CVE-2025-24963: Browser mode serves arbitrary files (fixed in 2.1.9)
  - CVE-2025-24964: Remote Code Execution vulnerability (fixed in 2.1.9)

  ## Migration Notes

  - Test snapshots may need regeneration due to quote format changes
  - Some test configurations might need updates for new TypeScript support
  - Peer dependency warnings for @vitest/coverage-v8 are expected and safe to ignore

  ## Links

  - [Vitest 3.0 Migration Guide](https://vitest.dev/guide/migration)
  - [Vitest 3.2.4 Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v3.2.4)

## 8.5.1

### Patch Changes

- [#3086](https://github.com/equinor/fusion-framework/pull/3086) [`0d22e3c`](https://github.com/equinor/fusion-framework/commit/0d22e3c486ab11c40f14fb1f11f0b718e7bf1593) Thanks [@Noggling](https://github.com/Noggling)! - Added new export for actions

## 8.5.0

### Minor Changes

- [#3083](https://github.com/equinor/fusion-framework/pull/3083) [`d247ec7`](https://github.com/equinor/fusion-framework/commit/d247ec7482a4d5231657875f6c6733ce37df07c9) Thanks [@odinr](https://github.com/odinr)! - Add `isObservableInput` and `toObservable` utilities to make it easier to work with dynamic or flexible values—such as configuration, runtime data, or any input that might be a value, function, promise, or stream.

  These utilities let you accept and process values in many forms—plain values, functions, promises, or streams (observables)—and always handle them in a consistent, observable-based way. This is especially helpful when you want to let users or other code supply input as a direct value, a callback (sync or async), or even a stream, and you want to process the result the same way regardless of the input type. While this is most commonly useful for runtime configuration, feature toggles, or similar scenarios, it can be applied to any case where input flexibility is needed.

  **Why use this?**

  - Accept config, data, or handlers in any form: value, function, promise, or observable.
  - Write code that is agnostic to how the input is provided—no need for manual type checks or branching logic.
  - Great for plugin systems, runtime config, feature toggles, or APIs that want to be flexible and future-proof.

  **Example usage:**

  ```ts
  import { isObservableInput, toObservable } from "@equinor/fusion-observable";

  isObservableInput(Promise.resolve(1)); // true

  // Always get an Observable, no matter the input type
  const obs$ = toObservable(() => 42);
  ```

  See the package README for more details and advanced usage.

- [#3096](https://github.com/equinor/fusion-framework/pull/3096) [`89f80e4`](https://github.com/equinor/fusion-framework/commit/89f80e41dac04e71518c7314cada86ecc835708d) Thanks [@odinr](https://github.com/odinr)! - - Improved the `DynamicInputValue` type in `to-observable.ts` to better support functions with arguments and ObservableInput return types.
  - Updated the `toObservable` function signature for more accurate argument typing and handling.
  - Renamed test file from `observable.ts` to `observable.test.ts` for consistency with test conventions.
  - No breaking changes; all existing usages remain compatible.

## 8.4.9

### Patch Changes

- [#3057](https://github.com/equinor/fusion-framework/pull/3057) [`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428) Thanks [@odinr](https://github.com/odinr)! - fixed `typeVersions`

## 8.4.8

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

## 8.4.7

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

## 8.4.6

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2899](https://github.com/equinor/fusion-framework/pull/2899) [`d20db24`](https://github.com/equinor/fusion-framework/commit/d20db24c73690e90a5860fe5160909c77efa41cb) Thanks [@odinr](https://github.com/odinr)! - fixed `noBannedTypes` Biome rules

- [#2892](https://github.com/equinor/fusion-framework/pull/2892) [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424) Thanks [@odinr](https://github.com/odinr)! - Added comprehensive unit tests for the `createReducer` function to ensure its correct functionality. The tests cover the following scenarios:

  - Creating a reducer function.
  - Creating a reducer with a default value from a function.
  - Handling actions and updating state correctly.
  - Handling multiple actions and updating state correctly.
  - Handling default cases when no action matches.
  - Handling matchers correctly.

  These tests improve the reliability and maintainability of the `createReducer` function by verifying its behavior in various use cases.

- [#2892](https://github.com/equinor/fusion-framework/pull/2892) [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424) Thanks [@odinr](https://github.com/odinr)! - Refactor:

  - Fix issue where the default case reducer could be undefined.
  - Improve type definitions for `ActionReducerMapBuilder` to ensure better type safety and compatibility.

- [#2892](https://github.com/equinor/fusion-framework/pull/2892) [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to use default parameters last

  - Fixed the `createReducer` function in `create-reducer.ts` to properly handle the initial state when it is undefined.

## 8.4.5

### Patch Changes

- [#2855](https://github.com/equinor/fusion-framework/pull/2855) [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1) Thanks [@odinr](https://github.com/odinr)! - Conformed to Biome `linter.correctness.useExhaustiveDependencies`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

## 8.4.4

### Patch Changes

- [`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1) Thanks [@odinr](https://github.com/odinr)! - added react-dom in dev deps since `@testing-library/react` hadd peer deps to React 19, which crashed tests

## 8.4.3

### Patch Changes

- [#2571](https://github.com/equinor/fusion-framework/pull/2571) [`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump uuid from 10.0.0 to 11.0.3

## 8.4.2

### Patch Changes

- [#2558](https://github.com/equinor/fusion-framework/pull/2558) [`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump uuid from 10.0.0 to 11.0.3

## 8.4.1

### Patch Changes

- [#2426](https://github.com/equinor/fusion-framework/pull/2426) [`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated happy-dom from 14.12.3 to [15.7.3](https://github.com/capricorn86/happy-dom/releases/tag/v15.7.3)

## 8.4.0

### Minor Changes

- [#2353](https://github.com/equinor/fusion-framework/pull/2353) [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594) Thanks [@odinr](https://github.com/odinr)! - Added new constructor overloads and a `select` method to `FlowSubject` for enhanced state management and selection capabilities.

  The `FlowSubject` class now supports constructor overloading, allowing for more flexible initialization with either a `ReducerWithInitialState<S, A>` or a `Reducer<S, A>` along with an `initialState`. This change enables users to set up the initial state of their `FlowSubject` instances in a way that best suits their application's needs.

  Additionally, a new `select` method has been introduced. This method allows users to select and emit derived states from the `FlowSubject`'s state based on custom logic. The `select` method takes a `selector` function for computing the derived state and an optional `comparator` function for custom comparison logic, making state management more versatile and efficient.

  The `selector` exposes an shorthand method for selecting derived states from the `FlowSubject`'s state without the need to import and use `map` and `distinctUntilChanged` operators from `RxJS`.

  Consumers should update their code to utilize the new constructor overloads for initializing `FlowSubject` instances as needed. For advanced state management scenarios, consider using the `select` method to work with derived states efficiently. These changes are backward compatible and aim to provide more flexibility and functionality to the `FlowSubject` class.

  ```typescript
  /** Example of using the new constructor with a reducer with initial state */
  const reducerWithInitial = createReducer(
    { count: 0 }, // initial state
    (builder) => {
      builder.addCase("increment", (state) => {
        state.count += 1;
      });
      builder.addCase("decrement", (state) => {
        state.count -= 1;
      });
    }
  );
  const subject = new FlowSubject(reducerWithInitial);
  ```

  ```typescript
  /** Example of using the new constructor with a plain reducer and initial state */
  const reducer = (state, action) => {
    switch(action.type) {
      case 'increment':
        return { ...state, count: state.count + 1 };
      case 'decrement':
        return return { ...state, count: state.count - 1 };
    }
  }
  const flowSubject = new FlowSubject(reducer, { count: 0 });
  ```

  ```typescript
  /** Example of using the new select method */
  flowSubject
    .select(
      /** selector function */
      (state) => state.count,
      /** comparator function, optional, will use equal by default */
      (prev, next) => prev === next
    )
    .subscribe(
      /** subscriber function */
      (count) => console.log(count)
    );

  flowSubject.next({ type: "increment" }); // logs 1
  flowSubject.next({ type: "increment" }); // logs 2
  flowSubject.next({ type: "decrement" }); // logs 1
  ```

### Patch Changes

- [#2381](https://github.com/equinor/fusion-framework/pull/2381) [`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76) Thanks [@odinr](https://github.com/odinr)! - improve type resolve of ActionBaseType

- [#2358](https://github.com/equinor/fusion-framework/pull/2358) [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb) Thanks [@eikeland](https://github.com/eikeland)! - Updating vitest to 2.0.4. Setting vitest as devDependency in fusion-query. Updating vite to 5.3.4

## 8.3.3

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2319](https://github.com/equinor/fusion-framework/pull/2319) [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated `uuid` from `^9.0.16` to `^10.0.0`. This update includes breaking changes where support for Node.js versions 12 and 14 has been dropped, and Node.js version 20 is now supported. Additionally, it introduces support for RFC9562 MAX, v6, v7, and v8 UUIDs.

  **Migration Guide**
  Consumers should ensure their environments are using Node.js version 16 or higher to avoid compatibility issues. If you are using Fusion Framework, you do not need to take any action as Fusion Framework already requires Node.js version 18 or higher.

  [Link to `immer` v10.0.0 release notes](https://github.com/uuidjs/uuid/blob/main/CHANGELOG.md)

- [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

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

## 8.3.2

### Patch Changes

- [#2235](https://github.com/equinor/fusion-framework/pull/2235) [`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb) Thanks [@odinr](https://github.com/odinr)! - - **Refactored**: The `actionBaseType` function has been renamed to `getBaseType` and its implementation has been updated.
  - **Added**: New utility types and functions for handling action types and payloads in a more type-safe manner.

## 8.3.1

### Patch Changes

- [#2204](https://github.com/equinor/fusion-framework/pull/2204) [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab) Thanks [@odinr](https://github.com/odinr)! - Updated `@testing-library/react` dev dependency from `^14.2.0` to `^15.0.0`.

  This is a patch bump because it only updates a dev dependency, which does not affect the public API or functionality of the `@equinor/fusion-framework-observable` package. Consumers of this package do not need to make any changes.

  The `@testing-library/react` library is used internally for unit testing React components. Updating to the latest version ensures we have the latest testing utilities and improvements.

  Highlights from the `@testing-library/react` v15.0.0 changelog:

  - Minimum supported Node.js version is 18.0
  - New version of `@testing-library/dom` changes various roles. Check out the [changed types](https://github.com/testing-library/dom-testing-library/releases/tag/v10.0.0) if you are using `ByRole` queries.

## 8.3.0

### Minor Changes

- [#2054](https://github.com/equinor/fusion-framework/pull/2054) [`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a) Thanks [@odinr](https://github.com/odinr)! - Effects now support multiple triggers

## 8.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - Rework typing of `createState` to prevent infinite recursion

## 8.1.5

### Patch Changes

- [#1765](https://github.com/equinor/fusion-framework/pull/1765) [`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e) Thanks [@odinr](https://github.com/odinr)! - improve handling of initial value when using `useObservableState`

- [#1762](https://github.com/equinor/fusion-framework/pull/1762) [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e) Thanks [@odinr](https://github.com/odinr)! - fixed issue with invalid regex pattern for matching suffix on actions

## 8.1.4

### Patch Changes

- [`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a) Thanks [@odinr](https://github.com/odinr)! - added default action type to ActionError

## 8.1.3

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

## 8.1.2

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 8.1.1

### Patch Changes

- [#1213](https://github.com/equinor/fusion-framework/pull/1213) [`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760) Thanks [@eikeland](https://github.com/eikeland)! - # package.json setting type.module

  Removing type.module from package config since it was causing issues in @equinor/fusion-cli

- [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4) Thanks [@odinr](https://github.com/odinr)! - expose `castDraft` from immer, since reused when creating reducers

## 8.1.0

### Minor Changes

- [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - Use initial state from observable if observable has value property

  - update typing og arguments
  - update initial state to fallback to `observable.value`
    - _`opt.initial` will supersede `observable.value`_
    - internally `useLayoutEffect` subscribes to subject, so `opt.initial` will be overridden in next `tick`
  - when provided subject changes instance, subscription will set current state to `observable.value` of the new subject
    - only applies if new observable has value property

  update typing when using stateful observable in `useObservableState`

  if the source has a value property, the state will return the type of the observable

  _previously the return type was observable type or `undefined`, since the initial state would be undefined before source emits values_

  ```ts
  /** value: {foo:string}|undefined  */
  const { value } = useObservableState(source$ as Observable<{ foo: string }>);
  /** value: {foo:string}  */
  const { value } = useObservableState(
    source$ as BehaviorSubject<{ foo: string }>
  );

  /* override initial value  */
  const { value } = useObservableState(
    source$ as BehaviorSubject<{ foo: string }>,
    {
      initial: "bar",
    }
  );
  ```

- [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - Add operator for using string property selector on `Observable<Record<string, unknown>>`

  example:

  ```ts
  // Observable<{foo: {bar: string}}>
  observable.pipe(mapProp("foo")); // Observable<{bar:string}>
  observable.pipe(mapProp("foo.bar")); // Observable<string>
  ```

- [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - Allow using string path for observable selector

  > simplify usage of `useObservableSelector`

  ```ts
  // new
  useObservableSelector(source$, "foo.bar");
  // existing
  useObservableSelector(
    source$,
    useCallback((source) => source.foo.bar, [])
  );
  ```

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1099](https://github.com/equinor/fusion-framework/pull/1099) [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647) Thanks [@odinr](https://github.com/odinr)! - fix typing of `useObservableInputState`

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

## 8.0.3

### Patch Changes

- [#1077](https://github.com/equinor/fusion-framework/pull/1077) [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f) Thanks [@odinr](https://github.com/odinr)! - useObservable no longer need initial parameter if reducer is `ReducerWithInitialState`

- [#1077](https://github.com/equinor/fusion-framework/pull/1077) [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f) Thanks [@odinr](https://github.com/odinr)! - observer is now optional in subscription hooks

- [#1077](https://github.com/equinor/fusion-framework/pull/1077) [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f) Thanks [@odinr](https://github.com/odinr)! - renamed `useObservableEpic` to `useObservableFlow`

  - rename source file
  - mark `useObservableEpic` as **deprecated**
  - update index source file

- [#1045](https://github.com/equinor/fusion-framework/pull/1045) [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63) Thanks [@eikeland](https://github.com/eikeland)! - # @equinor/fusion-observable

  Adding Immer as dependecy to @equinor/fusion-observable

## 8.0.2

### Patch Changes

- [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - fix linting

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

- **utils:** expose action call types ([af50204](https://github.com/equinor/fusion-framework/commit/af502049e2709c349f8b488aa84a62afc1baf0fd))

## 7.0.0 (2023-02-13)

### ⚠ BREAKING CHANGES

- **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

- **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
- **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## 6.0.0 (2023-02-01)

### ⚠ BREAKING CHANGES

- hook has new return type

### Features

- useObservableState hook ([e26f2a9](https://github.com/equinor/fusion-framework/commit/e26f2a9a116e128c407b8268775eaffab02c4a7c))

### Bug Fixes

- references to useObservableState ([614a569](https://github.com/equinor/fusion-framework/commit/614a5691f856765f07f5d71e39708f80dea49a6e))

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

- **utils/observable:** improve type-hinting ([761dfb0](https://github.com/equinor/fusion-framework/commit/761dfb0d5675fba05bd31889d4bd4d2f721880ec))

## 3.0.2 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-observable

## 3.0.1 (2022-12-05)

### Bug Fixes

- **utils:** export createState ([2e5030c](https://github.com/equinor/fusion-framework/commit/2e5030ca823c752ccd2e438afdec088bdcf1a8e5))

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.5.0...@equinor/fusion-observable@3.0.0) (2022-12-02)

### Features

- **observable:** create hook for debouncing functions ([cca2630](https://github.com/equinor/fusion-framework/commit/cca2630c8ad26ddf054ad1d65aa9994254e0d153))
- update exiting debounce hooks ([27e716c](https://github.com/equinor/fusion-framework/commit/27e716ca253206d532e0f02233beb6f29c10de22))

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.5.0...@equinor/fusion-observable@3.0.0-alpha.0) (2022-12-02)

### Features

- **observable:** create hook for debouncing functions ([a37bcaf](https://github.com/equinor/fusion-framework/commit/a37bcaf6cabdecb4a3ade7fb3da8c83a9473f919))
- update exiting debounce hooks ([dd3eb5f](https://github.com/equinor/fusion-framework/commit/dd3eb5ff1a05edd6c25fd1ad65c0b68d50f5799a))

## 2.5.0 (2022-12-01)

### Features

- **observable:** add functionality for create state ([a114838](https://github.com/equinor/fusion-framework/commit/a114838a83a050516c50cfaeeb7adbd3ac181665))

### Bug Fixes

- **observable:** fix typing of action mapper ([2ebca25](https://github.com/equinor/fusion-framework/commit/2ebca25789106e94f5a0dc2aa11f5bca2d40a255))

## [2.4.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.4.1...@equinor/fusion-observable@2.4.2) (2022-12-01)

### Bug Fixes

- import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [2.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.4.0...@equinor/fusion-observable@2.4.1) (2022-12-01)

### Bug Fixes

- **observable:** add missing state creation in reducer ([205e490](https://github.com/equinor/fusion-framework/commit/205e490ba485106e115974b3dc84280cf5853649))

## [2.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.3.0...@equinor/fusion-observable@2.4.0) (2022-12-01)

### Features

- **observable:** support mapping of action definitions ([a508a6e](https://github.com/equinor/fusion-framework/commit/a508a6e19f1119b23cc2c20c9caa593a63d05412))

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.2.0...@equinor/fusion-observable@2.3.0) (2022-12-01)

### Features

- **observable:** support state from create-reducer ([32d7664](https://github.com/equinor/fusion-framework/commit/32d7664d34ecbfc151d609a555b1bebd4989c965))

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.1.2...@equinor/fusion-observable@2.2.0) (2022-12-01)

### Features

- **observable:** expose functionality for creating a reducer ([a750ac7](https://github.com/equinor/fusion-framework/commit/a750ac73a81cfac6faa8b9204217faa22ff8130d))

## [2.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.1.0...@equinor/fusion-observable@2.1.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.0.1...@equinor/fusion-observable@2.1.0) (2022-12-01)

### Features

- **observable:** expose function for creating actions ([26e1731](https://github.com/equinor/fusion-framework/commit/26e17313fb9e1a4e329f3d4b037fbcf75688d224))

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@2.0.0...@equinor/fusion-observable@2.0.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@1.6.0...@equinor/fusion-observable@2.0.0) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## [1.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@1.5.1...@equinor/fusion-observable@1.6.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 1.5.1 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-observable

## 1.5.0 (2022-11-20)

### Features

- **observable:** expose fetch status ([d936826](https://github.com/equinor/fusion-framework/commit/d93682607194ea9512a8cce6711772b65164257f))

## 1.4.1 (2022-11-14)

### Bug Fixes

- **observable:** skip error handling on cache subscription ([b3c8102](https://github.com/equinor/fusion-framework/commit/b3c81027dade03e5fb73680ee419200c6f3d0ba4))

## 1.4.0 (2022-11-14)

### Features

- **observable:** update queue system ([bda336c](https://github.com/equinor/fusion-framework/commit/bda336cf40e131866c5dcc48c93d8349c7e77063))

## 1.3.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-observable

## 1.3.0 (2022-11-01)

### Features

- **observable:** allow cancellation of transaction ([9615ee1](https://github.com/equinor/fusion-framework/commit/9615ee1315f0ae44cc0246b4efa48be87512536e))
- **observable:** create query value selector ([3bfcdc3](https://github.com/equinor/fusion-framework/commit/3bfcdc3070c926d9c12cb701acdf2098da078717))

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@1.2.0...@equinor/fusion-observable@1.2.1) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-observable

## 1.2.0 (2022-10-26)

### Features

- **observable:** allow preprocessor of queue ([b13ddf0](https://github.com/equinor/fusion-framework/commit/b13ddf05473ba53593dbc2318472e909012aae54))
- **observable:** return last cache entry ([931dc31](https://github.com/equinor/fusion-framework/commit/931dc3176a94affcf50d1a3681fcd9fd43c170cc))
- **test-app:** update test app ([74dc5eb](https://github.com/equinor/fusion-framework/commit/74dc5eb4504544d84dabaff865152e7ba33f9601))

## 1.1.0 (2022-10-21)

### Features

- **observable:** enhance cache system ([626d3a2](https://github.com/equinor/fusion-framework/commit/626d3a299970cccc887501956a00e89db02f20a0))

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.4.0...@equinor/fusion-observable@1.0.0) (2022-10-17)

### Features

- **observable:** rewrite observable query ([6725274](https://github.com/equinor/fusion-framework/commit/67252743cacaacb42b47719e2f51f48b52b83545))

## [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.3.3...@equinor/fusion-observable@0.4.0) (2022-10-17)

### Features

- **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

### Bug Fixes

- **observable:** expose QueryClient constructor arguments ([604245a](https://github.com/equinor/fusion-framework/commit/604245a410116a9f055185d921dccf45cf5cf259))

## 0.3.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.3.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.3.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-observable

# 0.3.0 (2022-08-08)

### Features

- **observable:** provide hook for converting observable query ([6f1c95c](https://github.com/equinor/fusion-framework/commit/6f1c95c38446e63cb4f0573a0e99ee31daf55e9a))

# 0.2.0 (2022-08-04)

### Features

- **observable:** create hook for using query client ([#191](https://github.com/equinor/fusion-framework/issues/191)) ([0a74d2e](https://github.com/equinor/fusion-framework/commit/0a74d2ea4b0a920887b66a69a5298043fefc8c1a))

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

- **observable:** expose query ([cf11bb9](https://github.com/equinor/fusion-framework/commit/cf11bb963349e1b586cb8c2c4a24e4010aa3cca1))

## 0.1.1 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-observable

# [0.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.0.2...@equinor/fusion-observable@0.1.0) (2022-05-12)

### Features

- **observable:** add query ([#103](https://github.com/equinor/fusion-framework/issues/103)) ([1ce48ba](https://github.com/equinor/fusion-framework/commit/1ce48ba9bdba48496bec1f084b9c221f001794d6))

## [0.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-observable@0.0.1...@equinor/fusion-observable@0.0.2) (2022-04-21)

**Note:** Version bump only for package @equinor/fusion-observable

## 0.0.1 (2022-04-11)

**Note:** Version bump only for package @equinor/fusion-observable

# Change Log

## 5.0.6-next.1

### Patch Changes

- [`2022136`](https://github.com/equinor/fusion-framework/commit/2022136108a49cf2ccd8109e7e720aa2fbc135f1) Thanks [@odinr](https://github.com/odinr)! - relase next of all packages

## 5.0.6-next.0

### Patch Changes

- [`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded) Thanks [@odinr](https://github.com/odinr)! - relase next of all packages

## 5.0.5

### Patch Changes

- [#3555](https://github.com/equinor/fusion-framework/pull/3555) [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update semver from 7.7.2 to 7.7.3, including performance improvements for version comparison and x-range build metadata support used throughout the framework for authentication and module versioning.

## 5.0.4

### Patch Changes

- [#3597](https://github.com/equinor/fusion-framework/pull/3597) [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b) Thanks [@odinr](https://github.com/odinr)! - Improve Symbol.hasInstance validation in BaseModuleProvider to ensure version is a valid semver and dispose is a function.

- [#3590](https://github.com/equinor/fusion-framework/pull/3590) [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be) Thanks [@odinr](https://github.com/odinr)! - Internal: Add static className properties to configurator classes (ModulesConfigurator, FrameworkConfigurator, AppConfigurator) to prevent constructor name mangling during compilation and ensure proper event naming.

## 5.0.3

### Patch Changes

- [#3490](https://github.com/equinor/fusion-framework/pull/3490) [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1) Thanks [@odinr](https://github.com/odinr)! - Add event system to module configurator for lifecycle tracking.

  - Add `ModuleEvent` and `ModuleEventLevel` types for structured event emission
  - Enhance module configurator with event emission capabilities
  - Support event levels: Error, Warning, Information, Debug
  - Include contextual data, error information, and performance metrics in events

  resolves: [#3489](https://github.com/equinor/fusion-framework/issues/3489)

## 5.0.2

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

## 5.0.1

### Patch Changes

- [#3384](https://github.com/equinor/fusion-framework/pull/3384) [`3049232`](https://github.com/equinor/fusion-framework/commit/30492326336bea0d1af683b89e62a18eceec4402) Thanks [@odinr](https://github.com/odinr)! - Fixed missing type definitions in compiled declaration files.

  - Removed @internal JSDoc tags from ModulesObjectInstanceType and ModulesObjectConfigType
  - These utility types are now properly included in the public API since they are referenced by public types
  - Resolves TypeScript compilation errors when consuming the module

  Fixes #3383

## 5.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Major: explicit ESM module type and .js extensions for all internal imports

  This release makes `@equinor/fusion-framework-module` an explicit ESM package by setting `type: "module"` in `package.json` and updating all internal TypeScript imports to use explicit `.js` extensions. This ensures compatibility with NodeNext module resolution and ESM environments, and aligns the runtime and published output with ESM standards.

  - All internal imports now use `.js` extensions (e.g., `import { X } from './foo.js'`)
  - `package.json` now explicitly sets `"type": "module"`
  - `tsconfig.json` updated to use `module` and `moduleResolution` set to `NodeNext`
  - No runtime logic changes
  - Expose `satisfies` method on `SemanticVersion` class to allow version range checks directly on instances. This change extends the `SemVer` class and adds a `satisfies` method for convenience and improved API usability.

  **BREAKING CHANGE:**
  Consumers must use ESM-compatible tooling and update any imports of this package to use explicit `.js` extensions for internal imports. CommonJS is no longer supported. This may require changes to build tooling, import paths, and runtime environments if not already ESM-ready.

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Fix: Update `SemanticVersion` to use the default import from `semver` for compatibility and correct type usage.

## 4.4.3-next.2

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 4.4.3-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`bbda62d`](https://github.com/equinor/fusion-framework/commit/bbda62def35c8e8b742d90459680f7199c4ece0f) Thanks [@odinr](https://github.com/odinr)! - Expose `satisfies` method on `SemanticVersion` class to allow version range checks directly on instances. This change extends the `SemVer` class and adds a `satisfies` method for convenience and improved API usability.

## 4.4.3-next.0

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`53ef326`](https://github.com/equinor/fusion-framework/commit/53ef32633ce1c050e20614f1343148327a40b2e6) Thanks [@odinr](https://github.com/odinr)! - Fix: Update `SemanticVersion` to use the default import from `semver` for compatibility and correct type usage.

## 4.4.2

### Patch Changes

- [#3057](https://github.com/equinor/fusion-framework/pull/3057) [`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428) Thanks [@odinr](https://github.com/odinr)! - fixed `typeVersions`

## 4.4.1

### Patch Changes

- [`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc) Thanks [@odinr](https://github.com/odinr)! - Fix: Improve error handling and logging in module initialization and post-initialization.

  - Improved error logging when `_initialize` fails
  - Ensure that error is piped to subscribe of `_initialize` when errors occurs

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

## 4.4.0

### Minor Changes

- [#3040](https://github.com/equinor/fusion-framework/pull/3040) [`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42) Thanks [@odinr](https://github.com/odinr)! - ### Enhance DotPath Utility and Config Builder Flexibility

  - Improved the `DotPath` utility to support deeper type resolution, including arrays and nominal class types.
  - Updated `BaseConfigBuilder` to use the new `DotPathUnion` and `DotPathType` types for better type safety and flexibility.
  - Enhanced `_set` in `BaseConfigBuilder` to accept both direct values and callbacks, improving usability.
  - Introduced and exported `ModuleConfiguratorConfigCallback` type for better type safety in module configuration.
  - Re-exported `ModuleConfiguratorConfigCallback` in the public API for accessibility.

  These changes improve type safety, developer experience, and flexibility when working with nested configurations and module builders.

## 4.3.8

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

## 4.3.7

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

## 4.3.6

### Patch Changes

- [#2852](https://github.com/equinor/fusion-framework/pull/2852) [`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d) Thanks [@odinr](https://github.com/odinr)! - replaced forEach with for-of loops for better readability

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

## 4.3.5

### Patch Changes

- [#2451](https://github.com/equinor/fusion-framework/pull/2451) [`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d) Thanks [@odinr](https://github.com/odinr)! - fixed issue where post handlers where empty

## 4.3.4

### Patch Changes

- [#2434](https://github.com/equinor/fusion-framework/pull/2434) [`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87) Thanks [@odinr](https://github.com/odinr)! - **@equinor/fusion-framework-module:**

  Updated the `_buildConfig` method in `BaseConfigBuilder` to improve error handling and configuration merging.

  - Enhanced `_buildConfig` to log errors when a configuration callback fails, providing more detailed error messages.
  - Improved the merging process of configuration callbacks by filtering out undefined values and mapping them to target-value pairs.
  - Updated the `_buildConfig` method to initialize the accumulator with the initial configuration or an empty object.

  ```ts
  type MyConfig = {
    foo?: number;
    bar?: string;
  }

  const initial = {foo: 1, bar: 'baz'};

  export class MyConfigurator extends BaseConfigBuilder<MyConfig> {
    setFoo(cb: ConfigBuilderCallback<MyConfig['foo']>){
      this._set('foo', cb);
    }
    setBar(cb: ConfigBuilderCallback<MyConfig['bar']>){
      this._set('bar', cb);
    }
  }

  const configurator =  MyConfigurator();

  configurator.setFoo(async () => {
    if(someCondition) // do some async work
  });

  configurator.setBar(() => {
    return 'override';
  });

  configurator.createConfig(initial).subscribe(console.log);
  ```

  _Output:_

  ```diff
  - {foo: undefined, bar: 'override'}
  + {foo: 1, bar: 'override'}
  ```

  Example of a failed configuration callback:

  ```ts
  configurator.setFoo(async () => {
    throw new Error("Failed to set foo");
  });
  ```

  _Output:_

  ```diff
  - Configuration failed
  + {foo: 1, bar: 'override'}
  ```

- [#2407](https://github.com/equinor/fusion-framework/pull/2407) [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9) Thanks [@odinr](https://github.com/odinr)! - Improved Configuration Callback Handling

  BaseConfigBuilder.\_buildConfig will now correctly handle asynchronous configuration callbacks. This change simplifies the handling of asynchronous configuration callbacks by removing the `async` keyword and directly using RxJS operators.

## 4.3.3

### Patch Changes

- [#2356](https://github.com/equinor/fusion-framework/pull/2356) [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592) Thanks [@odinr](https://github.com/odinr)! - fixed type for infering dot path

## 4.3.2

### Patch Changes

- [#2325](https://github.com/equinor/fusion-framework/pull/2325) [`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663) Thanks [@odinr](https://github.com/odinr)! - `ConfigBuilderCallback` in `BaseConfigBuilder` has now type-guard for only accepting `ObservableInput` as the return type.
  The method never supported synchronous return types, but the type-guard was missing.

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

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

## 4.3.1

### Patch Changes

- [#2177](https://github.com/equinor/fusion-framework/pull/2177) [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-module

  ### Changes to `BaseConfigBuilder`

  The `_createConfig` method in `BaseConfigBuilder` has been updated to return an `ObservableInput<TConfig>` instead of an `Observable<TConfig>`.
  This allows for more flexibility in how the config is created, as the method can now return a Promise or other observable-like type.

  Additionally, the `_createConfig` method now uses `from()` to convert the result of `_buildConfig` to an observable stream.

  Here's an example of how the updated `_createConfig` method can be used:

  ```typescript
  protected _createConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<TConfig>
  ): ObservableInput<TConfig> {
    return from(this._buildConfig(init, initial)).pipe(
      mergeMap((config) => this._processConfig(config, init))
    );
  }
  ```

  This change allows for asynchronous operations to be performed within the `_buildConfig` method, which can then be processed in the `_processConfig` method.

  Consumers of the `BaseConfigBuilder` class should not need to update their code, as the public API remains the same.

- [#2177](https://github.com/equinor/fusion-framework/pull/2177) [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-module

  ### Improved documentation for `BaseConfigBuilder`

  The `BaseConfigBuilder` class has been updated with improved documentation to better explain its usage and capabilities.

  #### What changed?

  The `BaseConfigBuilder` class is an abstract class that provides a flexible and extensible way to build and configure modules. It allows you to define configuration callbacks for different parts of your module's configuration, and then combine and process these callbacks to generate the final configuration object.

  The documentation has been expanded to include:

  1. A detailed explanation of how the `BaseConfigBuilder` class is designed to be used, including an example of creating a configuration builder for a hypothetical `MyModule` module.
  2. Descriptions of the key methods and properties provided by the `BaseConfigBuilder` class, such as `createConfig`, `createConfigAsync`, `_set`, `_buildConfig`, and `_processConfig`.
  3. Guidance on how to override the `_processConfig` method to add additional logic or validation to the configuration object before it is returned.
  4. Examples of how to use the `BaseConfigBuilder` class to handle common configuration scenarios, such as setting default values or validating configuration properties.

- [#2177](https://github.com/equinor/fusion-framework/pull/2177) [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-module

  ### Changes to `BaseConfigBuilder`

  The `BaseConfigBuilder` class has been updated to improve its extendability and provide better access to the internal configuration callbacks.

  #### Added `_get` and `_has` methods

  Two new protected methods have been added to the `BaseConfigBuilder` class:

  1. `_get<TTarget extends DotPath<TConfig>>(target: TTarget)`: This method retrieves the configuration callback for the specified target path in the configuration. It returns the callback or `undefined` if no callback is registered for the given target.
  2. `_has<TTarget extends DotPath<TConfig>>(target: TTarget)`: This method checks if the given target path exists in the configuration callbacks. It returns `true` if the target path exists, `false` otherwise.

  These methods allow subclasses of `BaseConfigBuilder` to easily access and check the existence of configuration callbacks for specific targets.

  #### Example usage

  Suppose you have a subclass of `BaseConfigBuilder` called `MyConfigBuilder`. You can use the new `_get` and `_has` methods like this:

  ```typescript
  class MyConfigBuilder extends BaseConfigBuilder<MyConfig> {
    // override the _buildConfig method
    async _createConfig(
      init: ConfigBuilderCallbackArgs,
      initial?: Partial<TConfig>
    ): ObservableInput<TConfig> {
      // Check if a callback is registered for the'my.custom.config' target
      if (this._has("my.custom.config")) {
        // register a fallback value for the'my.custom.config' target if no callback is registered
        this._set("my.custom.config", async () => {
          return 42;
        });
      } else {
        // if a callback is registered, call it and log the result
        configCallback = this._get("my.custom.config");
        configValue$ = from(configCallback(init, initial));
        console.log(await lastValueFrom(configValue$));
      }
      return lastValueFrom(from(super._createConfig(init, initial)));
    }
  }
  ```

  > [!WARNING]
  > the example code is not intended to be a working implementation of the `MyConfigBuilder` class. It is only intended to demonstrate how the new `_get` and `_has` methods can be used.

  This change allows for more flexibility and easier extensibility of the `BaseConfigBuilder` class.

## 4.3.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - Reworked `DotPath` since previous method used recursive typing

## 4.2.7

### Patch Changes

- [#1792](https://github.com/equinor/fusion-framework/pull/1792) [`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d) Thanks [@odinr](https://github.com/odinr)! - improve resolve of dot path for BaseConfigBuilder

## 4.2.6

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

## 4.2.5

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 4.2.4

### Patch Changes

- [`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f) Thanks [@odinr](https://github.com/odinr)! - replace `scan` + `last` whith `reduce` in `BaseConfigBuilder._buildConfig`

## 4.2.3

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

## 4.2.2

### Patch Changes

- [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

  only style semantics updated

## 4.2.1

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.2.0

### Minor Changes

- [#902](https://github.com/equinor/fusion-framework/pull/902) [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5) Thanks [@odinr](https://github.com/odinr)! - **Feat(module)** add base module class

  As a module developer there should be a base provider class to extend, which handles basic wireing.

  Some aspects of providers should be the same for all, like `version` handling.

  These new features does not change any existing code, only tooling for future development

- [#882](https://github.com/equinor/fusion-framework/pull/882) [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898) Thanks [@odinr](https://github.com/odinr)! - Add possibility to add multilevel config for module

  ```ts
  type MyModuleConfig = {
    foo: string;
    bar?: number;
    nested?: { up: boolean };
  };

  class MyModuleConfigurator extends BaseConfigBuilder<MyModuleConfig> {
    public setFoo(cb: ModuleConfigCallback<string>) {
      this._set("foo", cb);
    }

    public setBar(cb: ModuleConfigCallback<number>) {
      this._set("bar", cb);
    }

    public setUp(cb: ModuleConfigCallback<boolean>) {
      this._set("nested.up", cb);
    }
  }
  ```

- [#902](https://github.com/equinor/fusion-framework/pull/902) [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5) Thanks [@odinr](https://github.com/odinr)! - **Feat(module): add semver**

  In some cases other modules might require features in sibling modules

  ```ts
  if (modules.context.version.satisfies(">=7.2")) {
    // do some code
  } else {
    throw Error(
      "this feature requires ContextModule of 7.2 or higher, please update depencies"
    );
  }
  ```

  Usage:

  - log telemetry about module usage and outdated application
  - debug code runtime by knowing version of implementation
  - write inter-opt when breaking changes accour

### Patch Changes

- [#907](https://github.com/equinor/fusion-framework/pull/907) [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9) Thanks [@odinr](https://github.com/odinr)! - export `lib` assets:

  - SemanticVersion
  - ModuleProvider

- [#913](https://github.com/equinor/fusion-framework/pull/913) [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d) Thanks [@odinr](https://github.com/odinr)! - **Change base behavior of BaseModuleProvider**

  because of weird limitations of JavaScript, private fields are not accessible until all constructors are initialized (from ancestor to current child).
  This causes the `abstract` init function could not access private members when overridden.

  - **removed** `init` from `BaseModuleProvider`
    - _this is a breaking change, but not yet published, yet the `patch` version_
    - https://github.com/equinor/fusion-framework/blob/43854d9538ade189483c43e04b52eff7e1aa3b0c/packages/modules/module/src/lib/provider/BaseModuleProvider.ts#L31
  - **added** `provider` sub-scope for package

  > The usage when extending `BaseModuleProvider` is not as 😘, but now works

- [#907](https://github.com/equinor/fusion-framework/pull/907) [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9) Thanks [@odinr](https://github.com/odinr)! - allow `SemanticVersion` as `version` in ctor args for `BaseModuleProvider`

- [#924](https://github.com/equinor/fusion-framework/pull/924) [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - fix(module): add config builder callback args to process config method so that

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 4.1.0 (2023-05-23)

### Features

- **module:** create base configurator ([f94b51e](https://github.com/equinor/fusion-framework/commit/f94b51e53d6ae235456e2ea2b5a82db5aa1a18f0))

## 4.0.0 (2023-05-05)

### ⚠ BREAKING CHANGES

- **modules:** postInitialize no longer support void function, should not affect any application, only used internally

### Features

- **modules:** change postInitialize to return ObservableInput ([f1c2f56](https://github.com/equinor/fusion-framework/commit/f1c2f5644c6db2405bf5747a1094548e1723cce1))

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@2.0.0...@equinor/fusion-framework-module@2.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.3.0...@equinor/fusion-framework-module@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.3.0...@equinor/fusion-framework-module@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.3.0 (2023-01-26)

### Features

- **module:** add base module config builder ([5a897b7](https://github.com/equinor/fusion-framework/commit/5a897b762a3a9139a1de025d1b1f4ae162079028))

## 1.2.10 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.2.9 (2022-11-11)

### Bug Fixes

- **module-msal:** await redirect handling ([92686d2](https://github.com/equinor/fusion-framework/commit/92686d2ae054d7f507093b839edb2fe5775c7449))

## 1.2.8 (2022-11-03)

### Bug Fixes

- **module:** allow debug logging ([315f845](https://github.com/equinor/fusion-framework/commit/315f845e78469a05f27793a56dd281832e7b5dd7))

## 1.2.7 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.2.6 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.2.5 (2022-10-21)

### Bug Fixes

- **module:** update typing ([9428770](https://github.com/equinor/fusion-framework/commit/9428770eca39d5e5afe00b94d0d09a688fc821b0))

## [1.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.2.3...@equinor/fusion-framework-module@1.2.4) (2022-10-17)

### Bug Fixes

- expose init interface for modules ([208cf79](https://github.com/equinor/fusion-framework/commit/208cf792b83d093a0c9ba1cdf919b4196e442989))

## 1.2.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.2.1...@equinor/fusion-framework-module@1.2.2) (2022-09-29)

### Bug Fixes

- **module:** update interface for logging ([fc23ea3](https://github.com/equinor/fusion-framework/commit/fc23ea3602c0b18b3f54de584773f76ffe63617c))

## 1.2.1 (2022-09-27)

### Bug Fixes

- update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 1.2.0 (2022-09-20)

### Features

- **module:** add has module check ([e32cf7b](https://github.com/equinor/fusion-framework/commit/e32cf7b751854ae8e306bb1d6a84260099752714))

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.1.2...@equinor/fusion-framework-module@1.1.3) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.1.1...@equinor/fusion-framework-module@1.1.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.1.0...@equinor/fusion-framework-module@1.1.1) (2022-09-13)

### Bug Fixes

- update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.1...@equinor/fusion-framework-module@1.1.0) (2022-09-13)

### Features

- **module:** allow setting log levels ([017b5b3](https://github.com/equinor/fusion-framework/commit/017b5b34645aa001297f37e7aef5557e9027beee))

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.1-next.1...@equinor/fusion-framework-module@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.1-next.0...@equinor/fusion-framework-module@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@1.0.0...@equinor/fusion-framework-module@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

- **module:** initialize modules now takes configurator object as argument.

### Features

- **module:** rewrite config to object ([74566f3](https://github.com/equinor/fusion-framework/commit/74566f36eb73c63e1e25df05d89f6f6490dc8272))

### Bug Fixes

- **module:** await all creation of configs ([25649a4](https://github.com/equinor/fusion-framework/commit/25649a4a6bc4249f2fe996c0bdf735a7ebd42186))
- **module:** expose logger ([c88574a](https://github.com/equinor/fusion-framework/commit/c88574a61d368841dd648c511d80cad2e5efd7c6))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.4.4...@equinor/fusion-framework-module@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **module:** initialize modules now takes configurator object as argument.

### Features

- **module:** rewrite config to object ([74566f3](https://github.com/equinor/fusion-framework/commit/74566f36eb73c63e1e25df05d89f6f6490dc8272))

### Bug Fixes

- **module:** await all creation of configs ([25649a4](https://github.com/equinor/fusion-framework/commit/25649a4a6bc4249f2fe996c0bdf735a7ebd42186))
- **module:** expose logger ([c88574a](https://github.com/equinor/fusion-framework/commit/c88574a61d368841dd648c511d80cad2e5efd7c6))

## 0.4.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 0.4.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 0.4.2 (2022-08-19)

### Performance Improvements

- improve logging of initializing modules ([f313bca](https://github.com/equinor/fusion-framework/commit/f313bca19103356f9d1a2bc09b57d4ff975e46a0))

## [0.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.4.0...@equinor/fusion-framework-module@0.4.1) (2022-08-15)

### Bug Fixes

- enhance post initialize ([4d10184](https://github.com/equinor/fusion-framework/commit/4d10184bf89d8968360be726ec3885444999ef8f))

# 0.4.0 (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.8...@equinor/fusion-framework-module@0.3.0) (2022-08-04)

- feat(module)!: allow requireing module instnce (#190) ([3a7e67e](https://github.com/equinor/fusion-framework/commit/3a7e67e9accb5185100325c92d5850a44626e498)), closes [#190](https://github.com/equinor/fusion-framework/issues/190)

### BREAKING CHANGES

- `deps` prop is remove from module object, use `await require('MODULE')`;

- feat(module)!: allow requireing module instnce

when module initiates it should be allowed to await an required module.

- add method for awaiting required module
- add typing for config in initialize fase

- update service discovery to await http module
- add service discovery client
- allow configuration of service discovery client

* `deps` prop is remove from module object, use `await require('MODULE')`;

* fix(module-http): add default interface for HttpClientOptions

## 0.2.8 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.6...@equinor/fusion-framework-module@0.2.7) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.5...@equinor/fusion-framework-module@0.2.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.4...@equinor/fusion-framework-module@0.2.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.3...@equinor/fusion-framework-module@0.2.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.2...@equinor/fusion-framework-module@0.2.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module@0.2.1...@equinor/fusion-framework-module@0.2.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

## 0.2.1 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module

# 0.2.0 (2022-06-10)

### Features

- **module:** allow modules to have deps ([#128](https://github.com/equinor/fusion-framework/issues/128)) ([2466b1a](https://github.com/equinor/fusion-framework/commit/2466b1ad9d43aa472da9daf8c59b350844c0dae9))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module

# 0.1.0 (2022-02-07)

### Bug Fixes

- **react-app:** fix AppConfigurator interface ([e5a8a21](https://github.com/equinor/fusion-framework/commit/e5a8a21ff6a558876e3db9a2596e891d9abea0cd))

### Features

- add package for creating framework modules ([4020a1e](https://github.com/equinor/fusion-framework/commit/4020a1e444d990e62f5fd4371302fff01b73616c))
- **framework:** allow registering config, init hooks from config ([5f12718](https://github.com/equinor/fusion-framework/commit/5f1271817b73dccbb5c0b69389877c4278e6920e))
- **reat-app:** add default modules ([74bf60e](https://github.com/equinor/fusion-framework/commit/74bf60ec07ea9573901d4160de5d4252e6e9c167))

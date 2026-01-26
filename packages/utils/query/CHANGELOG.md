# Change Log

## 6.0.4-msal-v5.0

### Patch Changes

- [#3944](https://github.com/equinor/fusion-framework/pull/3944) [`312755f`](https://github.com/equinor/fusion-framework/commit/312755f01c7592329aec847ee4956fe9bf58458f) Thanks [@dependabot](https://github.com/apps/dependabot)! - pre-release msal v5

- Updated dependencies [[`312755f`](https://github.com/equinor/fusion-framework/commit/312755f01c7592329aec847ee4956fe9bf58458f)]:
  - @equinor/fusion-log@1.1.8-msal-v5.0
  - @equinor/fusion-observable@8.5.8-msal-v5.0

## 6.0.3

### Patch Changes

- [#3882](https://github.com/equinor/fusion-framework/pull/3882) [`8667a2d`](https://github.com/equinor/fusion-framework/commit/8667a2db65539b2f04ab99ccc58e255d31618c8f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: fix TypeScript type errors with immer 11.1.3 recursive Draft types by using type assertions instead of castDraft for value assignments in cache reducer.

## 6.0.2

### Patch Changes

- [#3786](https://github.com/equinor/fusion-framework/pull/3786) [`9b6fc05`](https://github.com/equinor/fusion-framework/commit/9b6fc05d8305b179f11ed9f0bc993f2d88305136) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump immer from 10.2.0 to 11.0.0

- Updated dependencies [[`9b6fc05`](https://github.com/equinor/fusion-framework/commit/9b6fc05d8305b179f11ed9f0bc993f2d88305136)]:
  - @equinor/fusion-observable@8.5.7

## 6.0.1

### Patch Changes

- [#3654](https://github.com/equinor/fusion-framework/pull/3654) [`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update immer from 10.1.3 to 10.2.0 for performance improvements, including optimized caching and iteration logic.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e)]:
  - @equinor/fusion-observable@8.5.6

## 6.0.0

### Major Changes

- [#3537](https://github.com/equinor/fusion-framework/pull/3537) [`d3bcafe`](https://github.com/equinor/fusion-framework/commit/d3bcafed8b8c5a02ebe68693588cb376ed5e1b0e) Thanks [@odinr](https://github.com/odinr)! - Added comprehensive event system for enhanced observability and telemetry integration.

  - Introduced base event interfaces and types for query lifecycle tracking
  - Added QueryCache events for monitoring cache operations (insertions, mutations, invalidations, etc.)
  - Added QueryClient events for tracking job execution stages
  - Integrated event emission throughout Query class for complete lifecycle observability
  - Exported new event types and interfaces from package index

  This enhancement enables proper telemetry logging without flooding console output, addressing the need for structured event monitoring in Fusion Framework applications. Developers can now subscribe to specific event streams for debugging, analytics, and performance monitoring instead of relying on verbose console logging.

  Related to: https://github.com/equinor/fusion-framework/issues/3482

### Patch Changes

- Updated dependencies [[`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275)]:
  - @equinor/fusion-observable@8.5.5

## 5.2.14

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6)]:
  - @equinor/fusion-observable@8.5.4

## 5.2.13

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

- Updated dependencies [[`29f6710`](https://github.com/equinor/fusion-framework/commit/29f6710238baf9b29f42394b30cb8b97f25462c3), [`7bb88c6`](https://github.com/equinor/fusion-framework/commit/7bb88c6247f3d93eccf363d610116c519f1ecff4), [`11143fa`](https://github.com/equinor/fusion-framework/commit/11143fa3002fb8a6c095052a04c7e596c56bafa8)]:
  - @equinor/fusion-observable@8.5.3

## 5.2.12

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

- Updated dependencies [[`07cc985`](https://github.com/equinor/fusion-framework/commit/07cc9857e1427b574e011cc319518e701dba784d)]:
  - @equinor/fusion-observable@8.5.2
  - @equinor/fusion-log@1.1.7

## 5.2.11

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

## 5.2.10

### Patch Changes

- Updated dependencies [[`0d22e3c`](https://github.com/equinor/fusion-framework/commit/0d22e3c486ab11c40f14fb1f11f0b718e7bf1593)]:
  - @equinor/fusion-observable@8.5.1

## 5.2.9

### Patch Changes

- Updated dependencies [[`d247ec7`](https://github.com/equinor/fusion-framework/commit/d247ec7482a4d5231657875f6c6733ce37df07c9), [`89f80e4`](https://github.com/equinor/fusion-framework/commit/89f80e41dac04e71518c7314cada86ecc835708d)]:
  - @equinor/fusion-observable@8.5.0

## 5.2.8

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-observable@8.4.9

## 5.2.7

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-observable@8.4.8

## 5.2.6

### Patch Changes

- Updated dependencies [[`3166a7a`](https://github.com/equinor/fusion-framework/commit/3166a7a92eff92f79c92490d442bcf1b63718b95)]:
  - @equinor/fusion-log@1.1.4

## 5.2.5

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-observable@8.4.7

## 5.2.4

### Patch Changes

- Updated dependencies [[`08a4ebb`](https://github.com/equinor/fusion-framework/commit/08a4ebb74b9ce9da8c7a4b4dabe3cd476c67a86e)]:
  - @equinor/fusion-log@1.1.3

## 5.2.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`d20db24`](https://github.com/equinor/fusion-framework/commit/d20db24c73690e90a5860fe5160909c77efa41cb), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424)]:
  - @equinor/fusion-observable@8.4.6
  - @equinor/fusion-log@1.1.2

## 5.2.2

### Patch Changes

- [#2857](https://github.com/equinor/fusion-framework/pull/2857) [`2fe6241`](https://github.com/equinor/fusion-framework/commit/2fe624186640c3b30079c7d76f0e3af65f64f5d2) Thanks [@odinr](https://github.com/odinr)! - conform with Biome `linter.performance.noDelete`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-observable@8.4.5
  - @equinor/fusion-log@1.1.1

## 5.2.1

### Patch Changes

- Updated dependencies [[`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1)]:
  - @equinor/fusion-observable@8.4.4

## 5.2.0

### Minor Changes

- [#2619](https://github.com/equinor/fusion-framework/pull/2619) [`a965fbe`](https://github.com/equinor/fusion-framework/commit/a965fbeb9544b74f7d7b4aaa1e57c50d2ae4a564) Thanks [@odinr](https://github.com/odinr)! - Added callback function for rollback of mutation on query cache

## 5.1.5

### Patch Changes

- [#2571](https://github.com/equinor/fusion-framework/pull/2571) [`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump uuid from 10.0.0 to 11.0.3

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-observable@8.4.3

## 5.1.4

### Patch Changes

- [#2558](https://github.com/equinor/fusion-framework/pull/2558) [`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump uuid from 10.0.0 to 11.0.3

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-observable@8.4.2

## 5.1.3

### Patch Changes

- Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
  - @equinor/fusion-observable@8.4.1

## 5.1.2

### Patch Changes

- [`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e) Thanks [@odinr](https://github.com/odinr)! - Added try catch block to execution of query function, since the method might throw an exception before returning the observable.

  ```ts
  const queryClient = new Query({
      client: {
          () => {
              throw new Error('this would terminate the process before');
              return new Observable((subscriber) => {
                  throw new Error('this worked before');
              });
          },
      },
      key: (value) => value,

  queryClient.query().subscribe({
      error: (error) => {
          // before changes this would not be called since stream would be terminated.
          console.log(error.message); // this would print 'this would terminate the process before'
      },
  });
  ```

- Updated dependencies [[`3238800`](https://github.com/equinor/fusion-framework/commit/32388003d9b9a61ed70f7125358d03889dbf8ca0)]:
  - @equinor/fusion-log@1.1.0

## 5.1.1

### Patch Changes

- [#2358](https://github.com/equinor/fusion-framework/pull/2358) [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb) Thanks [@eikeland](https://github.com/eikeland)! - Updating vitest to 2.0.4. Setting vitest as devDependency in fusion-query. Updating vite to 5.3.4

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594)]:
  - @equinor/fusion-observable@8.4.0
  - @equinor/fusion-log@1.0.2

## 5.1.0

### Minor Changes

- [#2313](https://github.com/equinor/fusion-framework/pull/2313) [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee) Thanks [@odinr](https://github.com/odinr)! - A new public method `generateCacheKey` has been added to the `Query` class. This method allows users to generate a cache key based on provided query arguments, which can be useful for advanced caching scenarios or debugging.

  ```typescript
  const query = new Query<YourDataType, YourArgsType>({
    /* ... */
  });
  const args = {
    /* your query arguments */
  };
  const cacheKey = query.generateCacheKey(args);
  console.log("Generated cache key:", cacheKey);
  ```

  **Enhanced mutate method**
  The mutate method of the Query class now accepts an optional options parameter, allowing for more flexible cache mutations.

  **New allowCreation option**
  You can now specify whether to allow the creation of a new cache entry if it doesn't exist when performing a mutation.

  ```ts
  const query = new Query<YourDataType, YourArgsType>({
    /* ... */
  });

  // Mutate existing cache entry or create a new one if it doesn't exist
  query.mutate(args, (prevState) => ({ ...prevState, newProperty: "value" }), {
    allowCreation: true,
  });
  ```

  **Changes to internal cache handling**
  The internal QueryCache class has been updated to support the new allowCreation option. This change allows for more flexible cache management, especially when dealing with non-existent cache entries.

  **Breaking change**
  The mutate method will now throw an error if the cache entry doesn't exist and allowCreation is not explicitly set to true. This change ensures more predictable behavior and helps prevent accidental cache entry creation.

  ```ts
  // This will throw an error if the cache entry doesn't exist
  query.mutate(args, changes);

  // This will create a new cache entry if it doesn't exist
  query.mutate(args, changes, { allowCreation: true });
  ```

  **How to update**
  If you're relying on the mutate method to create new cache entries, update your code to explicitly set allowCreation: true:

  ```ts
  query.mutate(args, changes, { allowCreation: true });
  ```

  Review your codebase for any uses of mutate that might be affected by the new error-throwing behavior when the cache entry doesn't exist.

  If you need to generate cache keys for advanced use cases, you can now use the generateCacheKey method:

  ```ts
  const cacheKey = query.generateCacheKey(args);
  ```

  These changes provide more control over cache manipulation and help prevent unintended side effects when working with the Query class.

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

- [#2313](https://github.com/equinor/fusion-framework/pull/2313) [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee) Thanks [@odinr](https://github.com/odinr)! - added test for mutating a value which does not exist in the cache

- Updated dependencies [[`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-observable@8.3.3
  - @equinor/fusion-log@1.0.1

## 5.0.5

### Patch Changes

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
  - @equinor/fusion-observable@8.3.2

## 5.0.4

### Patch Changes

- [#2148](https://github.com/equinor/fusion-framework/pull/2148) [`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103) Thanks [@odinr](https://github.com/odinr)! - ---

  ## "@equinor/fusion-query": minor

  This release introduces a new method `persistentQuery` to the `Query` class. This method allows for creating persistent queries that automatically update when the underlying cache entry changes.

  The `persistentQuery` method was added to simplify the process of creating queries that need to stay up-to-date with the latest data. Previously, developers had to manually handle cache updates and re-subscribe to the query observable when changes occurred. With `persistentQuery`, this process is automated, reducing boilerplate code and improving developer experience.

  To use the `persistentQuery` method, simply call it with the desired query arguments and options, similar to the existing `query` method:

  ```typescript
  import { Query } from "@equinor/fusion-query";

  const query = new Query({
    /* query options */
  });

  const persistentQuery$ = query.persistentQuery({ id: "123" });

  persistentQuery$.subscribe((result) => {
    console.log("Persistent query result:", result);
  });
  ```

  The persistentQuery method returns an observable that emits the cached result immediately if available. It then continues to emit new results whenever the cache entry changes, either due to a new query or a manual cache mutation.

  How to migrate
  If you have existing code that manually handles cache updates and re-subscribes to queries, you can migrate to the persistentQuery method by replacing the manual logic with a call to persistentQuery.

  For example, if you had code like this:

  ```ts
  const query$ = query.query({ id: "123" });
  const subscription = query$.subscribe((result) => {
    // Handle result
  });

  // Manually handle cache updates
  query.onMutate((event) => {
    if (event.detail.current?.key === "cacheKeyFor123") {
      subscription.unsubscribe();
      const newSubscription = query.query({ id: "123" }).subscribe((result) => {
        // Handle result
      });
    }
  });
  ```

  You can replace it with the following:

  ```ts
  const persistentQuery$ = query.persistentQuery({ id: "123" });
  const subscription = persistentQuery$.subscribe((result) => {
    // Handle result
  });
  ```

  The persistentQuery method handles the cache updates automatically, eliminating the need for manual logic and re-subscriptions.

  **Additional notes**

  The persistentQuery method uses the distinctUntilChanged operator to only emit new results when the cache entry's transaction or mutation status changes, reducing unnecessary emissions.
  If you need to customize the cache validation logic for the persistentQuery, you can pass a custom validate function in the cache options object, similar to the existing query method.
  The persistentQuery method internally uses the \_query and #generateCacheKey methods from the Query class, ensuring consistent behavior with the existing query functionality.

- Updated dependencies [[`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
  - @equinor/fusion-observable@8.3.1

## 5.0.3

### Patch Changes

- [#2170](https://github.com/equinor/fusion-framework/pull/2170) [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-query

  ### Improved Action Suffix Resolution

  We have improved the way action suffixes are resolved in the observable package. This change includes the following updates:

  - **Enhanced `actionBaseType` function**: Now supports extracting the base action type from both action objects and action type strings.
  - **New `isActionWithSuffix` function**: A utility function to check if an action has a specific suffix.
  - **Updated `isRequestAction`, `isSuccessAction`, `isFailureAction`, and `isCompleteAction` functions**: These functions now utilize `isActionWithSuffix` for better type safety and readability.

  ### Example Usage

  #### Extracting Base Action Type

  ```typescript
  const actionBaseTypeName = actionBaseType("update_my_stuff::request"); // 'update_my_stuff'
  ```

  #### Checking Action Suffix

  ```typescript
  if (isRequestAction(action)) {
    // Handle request action
  }

  if (isSuccessAction(action)) {
    // Handle success action
  }

  if (isFailureAction(action)) {
    // Handle failure action
  }

  if (isCompleteAction(action)) {
    // Handle complete action (either success or failure)
  }

  // Example
  import { createReducer, isSuccessAction } from "@equinor/fusion-observable";

  type Actions =
    | { type: "foo::request"; type: "foo::success" }
    | { type: "fooBar::request"; type: "fooBar::success" };

  const reducer = createReducer<any, Actions>(null, (builder) => {
    builder.addMatcher(isSuccessAction, (state, action) => {
      // IntelliSense will type hint only `::success` actions
      console.log(action.type); // 'foo::success' || 'fooBar::success'
    });
  });
  ```

- [#2169](https://github.com/equinor/fusion-framework/pull/2169) [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-query

  ### Updated Logger Dependency

  Replaced the internal logger implementation with the `@equinor/fusion-log` package. This change affects the following files:

  - `package.json`: Removed `chalk` dependency and added `@equinor/fusion-log`.
  - `src/Query.ts`: Updated import statements to use `@equinor/fusion-log`.
  - `src/QueryTask.ts`: Updated import statements to use `@equinor/fusion-log`.
  - `src/client/QueryClient.ts`: Updated import statements to use `@equinor/fusion-log`.
  - Deleted `src/logger.ts` as it is no longer needed.

  ```typescript
  typescript;
  // Before
  import { ConsoleLogger, ILogger } from "./logger";

  // After
  import { ConsoleLogger, ILogger } from "@equinor/fusion-log";
  ```

- Updated dependencies [[`97a79fb`](https://github.com/equinor/fusion-framework/commit/97a79fbec701edff276632f2219672b8eb4eb85a), [`97a79fb`](https://github.com/equinor/fusion-framework/commit/97a79fbec701edff276632f2219672b8eb4eb85a)]:
  - @equinor/fusion-log@1.0.0

## 5.0.2

### Patch Changes

- [#2145](https://github.com/equinor/fusion-framework/pull/2145) [`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995) Thanks [@odinr](https://github.com/odinr)! - Added some examples to documentation

## 5.0.1

### Patch Changes

- [#2107](https://github.com/equinor/fusion-framework/pull/2107) [`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197) Thanks [@odinr](https://github.com/odinr)! - Fixed issue with missing process env `FUSION_LOG_LEVEL`

  - added default resolve value when generating base vite configuration
  - moved default query log level resolve outside class

  fixes: https://github.com/equinor/fusion/issues/343

## 5.0.0

### Major Changes

- [#2095](https://github.com/equinor/fusion-framework/pull/2095) [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2) Thanks [@odinr](https://github.com/odinr)! - This changeset introduces several significant updates and new features to enhance the query utility package, aiming to improve its functionality, ease of use, and flexibility. Here's a thorough breakdown of the changes in layman's terms:
  In this update, significant enhancements were made to how query tasks handle cancellation, especially focusing on scenarios where there are no subscribers or observers left for a particular task.

  ```mermaid
  flowchart TD
      A[Start Query] --> B{Is Cached?}
      B -->|Yes| C[Return Cached Result]
      B -->|No| D{Any Active Observers?}
      C --> E[Subscribers Receive Cached Data]
      D -->|No| F[Cancel Query]
      D -->|Yes| G[Fetch Data]
      G --> H{Fetch Successful?}
      H -->|Yes| I[Notify Observers with New Data]
      H -->|No| J[Handle Fetch Error]
      I --> K[Update Cache]
      J --> L[Retry?]
      L -->|Yes| G
      L -->|No| M[Notify Observers with Error]
      F --> N[Query Canceled]

      click A "A detailed step initiating the query process. It checks cache and observer status."
      click B "B conditional check for cache availability."
      click C "C provides cached results if available to avoid unnecessary fetching."
      click D "D checks for any active subscribers before proceeding to fetch data."
      click E "E observable subscribers are notified with the cached data."
      click F "F query operation is canceled if there are no active observers."
      click G "G data fetching from the source, triggering an HTTP request or similar operation."
      click H "H evaluates the success or failure of the fetch operation."
      click I "I cache is updated with the fetched results for future requests."
      click J "J error handling procedure for failed fetch operations."
      click K "K observers are notified with fresh data from the fetch operation."
      click L "L decision on whether a failed fetch should be retried based on predefined criteria."
      click M "M observers are notified of the error when a fetch operation fails."
      click N "N marks the query as canceled within the system."
  ```

  In asynchronous programming, especially when dealing with data fetching operations (like API calls), tasks or queries are initiated to retrieve data. These tasks continue to run unless they complete, fail, or are explicitly cancelled. Without proper cancellation mechanisms, redundant tasks could consume unnecessary resources, leading to inefficiency and potential memory leaks in applications.

  > the problem with existing code was:
  >
  > 1. Cache was included in task, not individual for each query
  > 2. Request was not canceled when client request had no observers.

  The updated query utility introduces an improved system for automatically cancelling tasks when there are no active observers or subscribers. This means if you start a task to fetch data and then, for some reason, all interested parties (components, services, etc.) unsubscribe or stop listening for the result, the utility will automatically cancel the task to save resources.

  1. **Observation Mechanism**: Each query task now keeps track of its subscribers (observers). When a task is initiated, it's "observed" by whoever needs its result (e.g., a component waiting for data to display).
  2. **Cancellation Triggers**: The task continuously checks if it still has any observers. If, at any point, the task finds that all its observers have unsubscribed or there were no observers to start with, it triggers a cancellation process.
  3. **Executing Cancellation**: Upon triggering cancellation, the task sends a signal to halt the data fetching operation. This could mean aborting an HTTP request, stopping a database query, or any other data retrieval operation that's in progress. The exact mechanism depends on the type of operation but typically involves using features like `AbortController` with fetch API in web environments.
  4. **Resource Management**: This automatic cancellation helps in managing resources more efficiently. It ensures that the application's bandwidth, memory, and processing power are not wasted on tasks that are no longer needed. This is particularly important in scenarios where data fetching operations are costly or when the application is running in resource-constrained environments.

  - **`chalk` Library**: We've included a new library called `chalk` that allows us to add colors and styles to the text we print out in the console. This makes our log messages much easier to read and helps distinguish between different types of messages, like errors or general information.
  - **`@types/node` for Development**: To make our code smarter about what functions and features are available in Node.js, we've added type definitions specifically for Node.js. This is only used during development to help with things like code completion and checking for mistakes.
  - **Improved Error Handling with Custom Errors**: We've created a custom error class to handle different types of errors more effectively. This means we can provide more specific and helpful error messages, making it easier to understand what went wrong.
  - **Advanced Logging with Colors**: We've set up a new logging system that uses the `chalk` library to color-code messages. This update makes the logs stand out more, so you can quickly spot what's important or needs attention.
  - **Ability to Change Cached Data (Mutation) and Refresh Data (Invalidation)**: Sometimes, the data we saved (cached) for quick access might need to be updated or completely refreshed. We've added features to mutate (update) this cached data or invalidate it, which means marking it as outdated so fresh data can be fetched.
  - **Fetch Cancellation Support**: There's now support for stopping (canceling) data fetch operations if we no longer need the results. This is particularly useful to avoid unnecessary work and save resources.
  - **Detailed Status Tracking for Queries**: We introduced a way to track more details about each data fetch operation, such as whether it's actively fetching data, has completed, or has been canceled. This provides better insight into what's happening behind the scenes.
  - **Concurrent and Sequential Query Handling**: The updates introduce strategies to handle multiple data fetch requests at once, either by running them at the same time (concurrently) or one after the other (sequentially). This flexibility allows the utility to be more efficient in different scenarios.
  - **Comprehensive Testing**: We've added a bunch of tests to check that all these new features and updates are working correctly. Testing helps catch any issues early on and ensures that the utility behaves as expected.
  - **Logging Level Control**: There's a new setting (`FUSION_LOG_LEVEL`) that lets you control how much detail you want in the logs. This can make it easier to focus on the information that's important to you, especially when debugging.
  - **Test Environment Improvements**: The setup for running tests has been upgraded to use a library called `vitest`, which offers a modern approach to testing JavaScript projects. This should make the tests run faster and more reliably.

  In essence, these changes make the query utility more powerful and user-friendly. Error messages are clearer, logging is more descriptive, and there's now the ability to update or refresh cached data on demand. Additionally, the introduction of fetch cancellation helps in managing resources better. The new testing setup and environmental control options further enhance the development experience, making it easier to maintain and improve the utility going forward.

### Minor Changes

- [#2095](https://github.com/equinor/fusion-framework/pull/2095) [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2) Thanks [@odinr](https://github.com/odinr)! - added functionality for invalidate cache records

  ## example

  ### Step 1: Define the Fetch Function

  Assuming a function `fetchUserProfile(userId: string)` that fetches user profile data, ensure it's implemented. This function is crucial as it serves as the data source that the `Query` class will use.

  ### Step 2: Instantiate `Query` for User Profiles

  You need to create an instance of your `Query` class specifically for fetching and caching user profiles. The instantiation should include specifying how to generate cache keys and, potentially, how cache validation should work.

  ```typescript
  type UserProfileArgs = {
    userId: string;
  };

  const userProfileQuery = new Query<UserProfile, UserProfileArgs>({
    client: {
      fn: fetchUserProfile,
    },
    key: (args) => `userProfile_${args.userId}`,
  });
  ```

  ### Step 3: Execute the Query to Populate the Cache

  Use the `query` or `queryAsync` method to fetch the user profile for the user with id `1` and automatically populate the cache. Let's assume we prefer the asynchronous version for immediate use:

  ```typescript
  async function initializeUserProfileCache() {
    try {
      const userProfileData = await userProfileQuery.queryAsync({
        userId: "1",
      });
      console.log("UserProfile Data:", userProfileData);
    } catch (error) {
      console.error("Failed to fetch user profile data:", error);
    }
  }
  ```

  The `initializeUserProfileCache` function is an asynchronous function that attempts to fetch the user profile using the `queryAsync` method and logs the data to the console. This function populates the cache with the fetched user profile data, ready for subsequent accesses via the cache without needing to refetch the data.

  ### Listening to Cache Invalidation Events

  To react to cache invalidation events (not part of the initial population but useful for cache management), use the `onInvalidate` method:

  ```typescript
  userProfileQuery.onInvalidate((event) => {
    if (event.detail.item) {
      console.log(
        `Cache entry invalidated for user: ${event.detail.item.value.id}`
      );
    } else {
      console.log("Cache invalidated for all users");
    }
  });
  ```

  ### Invalidating the Cache

  When you want to invalidate the cache, either for specific user profiles or entirely, utilize the `invalidate` method:

  ```typescript
  // Invalidate cache for a specific user profile
  userProfileQuery.invalidate({ userId: "1" });

  // Invalidate the entire cache
  userProfileQuery.invalidate();
  ```

  In summary, these steps outline how to use your `Query` class to fetch, cache, and manage user profile data effectively. Starting with fetching and caching data for a user with id `1`, handling cache invalidation events, to invalidating cache entries as needed.

- [#2095](https://github.com/equinor/fusion-framework/pull/2095) [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2) Thanks [@odinr](https://github.com/odinr)! - Added functionality for mutating a cached value

  ## example

  ### Setting up the User Profile Scenario

  First, assume we have a user profile query setup similar to the previous explanation:

  ```typescript
  // Define the structure of a user profile and the arguments to identify a specific profile
  type UserProfile = {
    id: string;
    name: string;
    email: string;
    bio?: string;
  };

  type UserProfileArgs = {
    userId: string;
  };

  // Example Query: Initialized elsewhere, assume it's the instance of the enhanced Query class
  declare const userProfileQuery: Query<UserProfile, UserProfileArgs>;
  ```

  ### Using `onMutate` to Listen for Mutations

  Now, let’s listen to the `onMutate` event on our `userProfileQuery`. We want to log the change or potentially trigger a UI update whenever a user's profile cache entry is mutated.

  ```typescript
  // Subscribing to mutation events for the user profile query
  const unsubscribeOnMutate = userProfileQuery.onMutate(({ detail }) => {
    const { changes, current } = detail;

    // Assuming changes are direct object updates and current is the state prior to applying changes in this example
    console.log("Mutation occurred on user profile:", changes);

    if (current) {
      console.log("Previous state of the profile:", current);
    }

    // Here you could trigger a UI update or any other side effects needed after a mutation
    // For instance:
    // updateUI(current?.value, changes); // Hypothetical function to update UI
  });

  // Remember to call `unsubscribeOnMutate` to clean up when the component or application no longer needs to listen for these events
  // unsubscribeOnMutate();
  ```

  ### Mutating the Cache Entry

  To trigger this `onMutate` event, somewhere in your application, you might mutate the cache entry for a user profile after an action, such as the user updating their profile:

  ```typescript
  // Args identifying the specific user profile cache entry to mutate
  const JoshProfileArgs = { userId: "1" };

  // Assuming a simple update to the users bio
  const updateBioChangeFn = (currentUserProfile: UserProfile) => ({
    ...currentUserProfile,
    bio: "Updated bio information.",
  });

  // Perform cache entry mutation
  userProfileQuery.mutate(JoshProfileArgs, updateBioChangeFn);
  ```

  This mutation operation would then trigger the `onMutate` listener we set up earlier, logging the changes and potentially updating the UI or triggering other side effects.

  ### Conclusion

  The `onMutate` functionality in the `Query` class provides a powerful way to react to cache mutations, making it useful for keeping the UI in sync with the latest data changes or for logging and debugging purposes. Always ensure to unsubscribe from events when they are no longer needed to prevent memory leaks and unintended side effects.

## 4.2.0

### Minor Changes

- [#2053](https://github.com/equinor/fusion-framework/pull/2053) [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883) Thanks [@odinr](https://github.com/odinr)! - `QueryCache` now supports invalidation of all entries

  When not providing key for `QueryCache.invalidate`, all records will be set to invalid

  ```diff
  QueryCache.ts
  -     public invalidate(key: string) {
  +     public invalidate(key?: string) {
    this.#state.next(actions.invalidate(key));
  }
  ```

  ```diff
  create-reducer.ts
  .addCase(actions.invalidate, (state, action) => {
  +   const invalidKey = action.payload ? [action.payload] : Object.keys(state);
  -   const entry = state[action.payload];
  +   for (const key of invalidKey) {
  +       const entry = state[key];
          if (entry) {
             delete entry.updated;
          }
  +   }
  })
  ```

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a)]:
  - @equinor/fusion-observable@8.3.0

## 4.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-observable@8.2.0

## 4.0.6

### Patch Changes

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
  - @equinor/fusion-observable@8.1.5

## 4.0.5

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
  - @equinor/fusion-observable@8.1.4

## 4.0.4

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-observable@8.1.3

## 4.0.3

### Patch Changes

- [#1410](https://github.com/equinor/fusion-framework/pull/1410) [`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e) Thanks [@odinr](https://github.com/odinr)! - fixed queuing of query queue tasks

## 4.0.2

### Patch Changes

- [#1305](https://github.com/equinor/fusion-framework/pull/1305) [`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9) Thanks [@odinr](https://github.com/odinr)! - fixed issue where queries where executed before observed.

  > **This fix might break existing code, if observation was wrongly implemented!**

  ```ts
  const queryClient = new Query({
    client: {
      fn: async (value: string) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(value);
          }, 50);
        }),
    },
    key: (value) => value,
  });

  /** execute observables sequential */
  concat(
    /** after 100ms emits 'foo' */
    interval(100).map(() => "foo"),
    /** after 50ms emits 'bar' */
    queryClient.query("bar")
  ).subscribe(console.log);
  ```

  **expected result:**

  ```diff
  + 100ms 'foo' 50ms 'bar' |
  ```

  **actual result:**

  ```diff
  - 50ms 'bar' 50ms 'foo' |
  ```

  this is now resolved by having an inner task which is not add request to the queue before the task is observed

## 4.0.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-observable@8.1.2

## 4.0.0

### Major Changes

- [#1271](https://github.com/equinor/fusion-framework/pull/1271) [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578) Thanks [@odinr](https://github.com/odinr)! - Change abort behavior of QueryClient

  this also fixes the issue where only the first requester of a request could provide abort controller.

  _success_:

  ```ts
  const controllerA = new AbortController();
  const controllerB = new AbortController();
  const tasks = Promise.All([
    foo.query("bar", { controller: controllerA }),
    foo.query("bar", { controller: controllerB }),
  ]);
  try {
    setTimeout(() => controllerA.abort(), 10);
    await tasks;
  } catch (err) {
    // success
  }
  ```

  ```diff
  - setTimeout(() => controllerA.abort(), 10);
  + setTimeout(() => controllerB.abort(), 10);
  ```

  query wil no longer abort since task is attached to `controllerA`

  > the query client will return the ongoing task _(if not completed)_ for matching query key.

  ```ts
  let calls = 0;
  const query = new Query({
    client: {
      queueOperator: "merge",
      fn: (value) => {
        return new Promise((resolve) =>
          setTimeout(() => {
            call++;
            resolve(value);
          }, 100)
        );
        value;
      },
    },
    key: (value) => value,
  });
  setTimeout(
    // calls = 1
    () => query.queryAsync("foo").then(() => console.log(calls)),
    0
  );
  setTimeout(
    // calls = 1, since sharing first request
    () => query.queryAsync("foo").then(() => console.log(calls)),
    50
  );
  setTimeout(
    // calls = 2
    () => query.queryAsync("bar").then(() => console.log(calls)),
    100
  );
  setTimeout(
    // calls = 3
    () => query.queryAsync("foo").then(() => console.log(calls)),
    150
  );
  ```

  - expose current state of cache `QueryCache`
  - update request handler to support signal
  - update request processor to handle signal
  - remove `AbortController` from action meta
  - add functionality for aborting request by reference

  **BREAKING_CHANGES:**

  ```diff
   export type QueryClientOptions<TType = any, TArgs = any> = {
  -    controller: AbortControl
  +    signal?: AbortSignal;
       retry: Partial<RetryOptions>;
       /** reference to a query  */
       ref?: string;
       task?: Subject<QueryTaskValue<TType, TArgs>>;
  };
  ```

  migration

  ```diff
  const foo = new Query(...);
  const controller = new AbortController();
  foo.query(
    args,
  - {controller}
  + {signal: controller.signal}
  );
  ```

### Patch Changes

- [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a) Thanks [@odinr](https://github.com/odinr)! - Allow optionial ctor args in QueryCache

## 3.0.7

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
  - @equinor/fusion-observable@8.1.1

## 3.0.6

### Patch Changes

- [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - Query cache missed on first access since when creating a new cache record, updated was never set.

  > when creating a cache item, `entry.created` and `entry.updated` are set to `Date.now()`, but `entry.updates` are only incremented when updating.

  > when invalidating a cache record, `entry.updated` is deleted, which triggers the `defaultCacheValidator` to miss cache

  ```ts
  const defaultCacheValidator =
    <TType, TArgs>(expires = 0): CacheValidator<TType, TArgs> =>
    (entry) =>
      (entry.updated ?? 0) + expires > Date.now();
  ```

  **IMPORTANT**

  any consumer of this package should update ASAP to improve network performance.

  _discovered when duplicate service discovery calls was executed from cli portal_

## 3.0.5

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-observable@8.1.0

## 3.0.4

### Patch Changes

- [#1045](https://github.com/equinor/fusion-framework/pull/1045) [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63) Thanks [@eikeland](https://github.com/eikeland)! - remove immer as dependency (required in @equinor/fusion-observable)

- Updated dependencies [[`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`b16e93e2`](https://github.com/equinor/fusion-framework/commit/b16e93e23e456ab065a414f4bdc44445b6e9ad9f), [`38869a87`](https://github.com/equinor/fusion-framework/commit/38869a87788c340d363e9be1e7fc6ce0e29efa63)]:
  - @equinor/fusion-observable@8.0.3

## 3.0.3

### Patch Changes

- [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - build(@equinor/fusion-query): bump uuid from 8.3.2 to 9.0.0

- Updated dependencies [[`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a)]:
  - @equinor/fusion-observable@8.0.2

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.2 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-query

## 3.0.1 (2023-05-05)

### Bug Fixes

- **util-query:** add name to error ([630dd88](https://github.com/equinor/fusion-framework/commit/630dd88f6bf01aacdb155a3cd45730e434a6cd8f))

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-query

## 2.0.7 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.5...@equinor/fusion-query@2.0.6) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.4...@equinor/fusion-query@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.3...@equinor/fusion-query@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@2.0.2...@equinor/fusion-query@2.0.3) (2023-02-09)

### Bug Fixes

- **util/query:** enhance selection of queue operator ([b41a99f](https://github.com/equinor/fusion-framework/commit/b41a99fb046bd3adbd2ede2b38ebb1edf7eba3d8))
- **util/query:** expose queue operators ([f597f25](https://github.com/equinor/fusion-framework/commit/f597f25f98198e46a600309898ac9f2557c973f3))
- **util/query:** only cancel all request when transaction is not specified ([3ece6a3](https://github.com/equinor/fusion-framework/commit/3ece6a3d8d59f12036e9e329e3a4ff677dd87fec))

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-query

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-query

## 2.0.0 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-query

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@1.1.4...@equinor/fusion-query@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-query

## 1.1.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-query

## 1.1.3 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-query

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@1.1.1...@equinor/fusion-query@1.1.2) (2022-12-12)

### Bug Fixes

- **utils/query:** fix causation of error ([108f1b4](https://github.com/equinor/fusion-framework/commit/108f1b418f0f0b561c9bc3a5a0e41e5e8ad50f2f))

## 1.1.1 (2022-12-08)

### Bug Fixes

- **utils/query:** debounce cancelation of request ([f280bb8](https://github.com/equinor/fusion-framework/commit/f280bb812384d1c183372f8f68dda1de29995fff))

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@1.0.2...@equinor/fusion-query@1.1.0) (2022-12-08)

### Features

- **utils/query:** improve error handling ([1cec132](https://github.com/equinor/fusion-framework/commit/1cec132ea022f9fc81464ceb03e5aa4f7e8b4951))

## 1.0.2 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-query

## 1.0.1 (2022-12-05)

### Bug Fixes

- **query:** bind query method in hook ([d440f19](https://github.com/equinor/fusion-framework/commit/d440f1940c19717bc7adf0da405454af87eda541))

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.3.1...@equinor/fusion-query@1.0.0) (2022-12-02)

### Features

- update exiting debounce hooks ([27e716c](https://github.com/equinor/fusion-framework/commit/27e716ca253206d532e0f02233beb6f29c10de22))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.3.1...@equinor/fusion-query@1.0.0-alpha.0) (2022-12-02)

### Features

- update exiting debounce hooks ([dd3eb5f](https://github.com/equinor/fusion-framework/commit/dd3eb5ff1a05edd6c25fd1ad65c0b68d50f5799a))

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.3.0...@equinor/fusion-query@0.3.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.7...@equinor/fusion-query@0.3.0) (2022-12-01)

### Features

- **query:** rewrite query actions and reducer ([48b9982](https://github.com/equinor/fusion-framework/commit/48b99822619e7c7e3e20257d9a89a0cc5a5cc84e))

### Bug Fixes

- fix import typos ([fdfebd5](https://github.com/equinor/fusion-framework/commit/fdfebd5036dd76d72110fb61a2db9a04ad806408))
- **query:** fix import of uuid ([d8700fc](https://github.com/equinor/fusion-framework/commit/d8700fcd1ae6a522741c0a12f4c2f1f3934147cd))

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.6...@equinor/fusion-query@0.2.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.5...@equinor/fusion-query@0.2.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.4...@equinor/fusion-query@0.2.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.3...@equinor/fusion-query@0.2.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.2...@equinor/fusion-query@0.2.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.2.0...@equinor/fusion-query@0.2.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.1.2...@equinor/fusion-query@0.2.0) (2022-12-01)

### Features

- **observable:** expose function for creating actions ([26e1731](https://github.com/equinor/fusion-framework/commit/26e17313fb9e1a4e329f3d4b037fbcf75688d224))

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.1.1...@equinor/fusion-query@0.1.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-query@0.1.0...@equinor/fusion-query@0.1.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-query

## 0.1.0 (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

# Change Log

## 3.0.3

### Patch Changes

- [#3654](https://github.com/equinor/fusion-framework/pull/3654) [`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update immer from 10.1.3 to 10.2.0 for performance improvements, including optimized caching and iteration logic.

- [#3544](https://github.com/equinor/fusion-framework/pull/3544) [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.11 to 4.1.12, which includes a critical bug fix for ZodError.flatten() preventing crashes on 'toString' key and improved error handling throughout the framework.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e), [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59)]:
  - @equinor/fusion-observable@8.5.6
  - @equinor/fusion-query@6.0.1
  - @equinor/fusion-framework-module@5.0.5

## 3.0.2

### Patch Changes

- Updated dependencies [[`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275), [`d3bcafe`](https://github.com/equinor/fusion-framework/commit/d3bcafed8b8c5a02ebe68693588cb376ed5e1b0e), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-observable@8.5.5
  - @equinor/fusion-query@6.0.0
  - @equinor/fusion-framework-module@5.0.3

## 3.0.1

### Patch Changes

- [#3428](https://github.com/equinor/fusion-framework/pull/3428) [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.9 to 4.1.11

  - **v4.1.10**: Fixed shape caching issue (#5263) improving validation performance for complex schemas
  - **v4.1.11**: Maintenance release with general improvements

  This patch update enhances schema validation performance without changing any APIs.

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6)]:
  - @equinor/fusion-observable@8.5.4
  - @equinor/fusion-framework-module@5.0.2
  - @equinor/fusion-query@5.2.14

## 3.0.0

### Major Changes

- [#3394](https://github.com/equinor/fusion-framework/pull/3394) [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295) Thanks [@odinr](https://github.com/odinr)! - feat: migrate to zod v4

  Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the bookmark module to use explicit key and value types for records, simplified function schema definitions, and replaced zod-inferred types with explicit TypeScript interfaces.

  Key changes in source code:

  - Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.unknown())`)
  - Simplified function schema definitions by removing complex chaining (`.args()` and `.returns()`)
  - Replaced zod-inferred types with explicit TypeScript interfaces for better performance
  - Enhanced `BookmarkData` type definition with proper generic constraints
  - Added helper functions for config parsing (`parseBookmarkConfig`)

  Breaking changes: Record schemas must specify both key and value types explicitly. Function schema definitions now require explicit typing.

  Links:

  - [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
  - [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

## 2.2.1

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
  - @equinor/fusion-query@5.2.13
  - @equinor/fusion-observable@8.5.3

## 2.2.0

### Minor Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Refactored the `Bookmark` type to be an intersection of `BookmarkWithoutData` and an optional `payload` property, improving type safety and flexibility. Updated `useBookmarkNavigate` to use proper TypeScript typing for bookmark events.

  **Module Bookmark Changes:**

  - Refactored `Bookmark` type in `packages/modules/bookmark/src/types.ts`
  - Added export for `BookmarkProviderEvents` type in `packages/modules/bookmark/src/index.ts`
  - Updated JSDoc comment from `@note` to `@remarks` in `packages/modules/bookmark/src/BookmarkClient.ts`
  - Reordered tsconfig references (event before services)

  **React Changes:**

  - Updated `packages/react/modules/bookmark/src/portal/useBookmarkNavigate.ts` to use proper TypeScript typing for bookmark provider events
  - Removed React paths configuration from `packages/react/app/tsconfig.json`

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Upgrade zod dependency to ^3.25.76 in all affected packages.

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-log@1.1.5

## 2.1.15

### Patch Changes

- [#3182](https://github.com/equinor/fusion-framework/pull/3182) [`0bdd7f4`](https://github.com/equinor/fusion-framework/commit/0bdd7f4c3f166421b7703c374821b52a578a24e6) Thanks [@Noggling](https://github.com/Noggling)! - Enable MapSet in the bookmark module since a new Set is used in BookmarkState.

## 2.1.14

### Patch Changes

- [#3151](https://github.com/equinor/fusion-framework/pull/3151) [`9982c09`](https://github.com/equinor/fusion-framework/commit/9982c096f57e7928dbb65b3ca1d647646852963f) Thanks [@Noggling](https://github.com/Noggling)! - Remove unnecessary deepEqual check from the currentBookmark$ selector to ensure the current bookmark is always emitted, even when re-selected. This improves consistency and ensures consumers receive updates as expected.

## 2.1.13

### Patch Changes

- [#3148](https://github.com/equinor/fusion-framework/pull/3148) [`9cc3adc`](https://github.com/equinor/fusion-framework/commit/9cc3adcf502a3488a80c7a9b2a71eae0910a7b9f) Thanks [@Noggling](https://github.com/Noggling)! - Allow reselection of the current bookmark by removing the check that prevented setting the same bookmark as current. This enables applications to reselect a bookmark even if it is already active, supporting scenarios where application state changes require a re-selection event.

## 2.1.12

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-query@5.2.11

## 2.1.11

### Patch Changes

- Updated dependencies [[`0d22e3c`](https://github.com/equinor/fusion-framework/commit/0d22e3c486ab11c40f14fb1f11f0b718e7bf1593)]:
  - @equinor/fusion-observable@8.5.1
  - @equinor/fusion-query@5.2.10

## 2.1.10

### Patch Changes

- Updated dependencies [[`d247ec7`](https://github.com/equinor/fusion-framework/commit/d247ec7482a4d5231657875f6c6733ce37df07c9), [`89f80e4`](https://github.com/equinor/fusion-framework/commit/89f80e41dac04e71518c7314cada86ecc835708d)]:
  - @equinor/fusion-observable@8.5.0
  - @equinor/fusion-query@5.2.9

## 2.1.9

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-observable@8.4.9
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-query@5.2.8

## 2.1.8

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-observable@8.4.8
  - @equinor/fusion-query@5.2.7

## 2.1.7

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42), [`3166a7a`](https://github.com/equinor/fusion-framework/commit/3166a7a92eff92f79c92490d442bcf1b63718b95)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-log@1.1.4
  - @equinor/fusion-query@5.2.6

## 2.1.6

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-observable@8.4.7
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-query@5.2.5

## 2.1.5

### Patch Changes

- Updated dependencies [[`08a4ebb`](https://github.com/equinor/fusion-framework/commit/08a4ebb74b9ce9da8c7a4b4dabe3cd476c67a86e)]:
  - @equinor/fusion-log@1.1.3
  - @equinor/fusion-query@5.2.4

## 2.1.4

### Patch Changes

- [#2950](https://github.com/equinor/fusion-framework/pull/2950) [`88aab5c`](https://github.com/equinor/fusion-framework/commit/88aab5c50c3ae77d80ce420902db0ba843a8d85f) Thanks [@odinr](https://github.com/odinr)! - added missing return statement for `addStateCreator` method.

## 2.1.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`d20db24`](https://github.com/equinor/fusion-framework/commit/d20db24c73690e90a5860fe5160909c77efa41cb), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424)]:
  - @equinor/fusion-observable@8.4.6
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-query@5.2.3
  - @equinor/fusion-log@1.1.2

## 2.1.2

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`2fe6241`](https://github.com/equinor/fusion-framework/commit/2fe624186640c3b30079c7d76f0e3af65f64f5d2), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-observable@8.4.5
  - @equinor/fusion-query@5.2.2
  - @equinor/fusion-log@1.1.1

## 2.1.1

### Patch Changes

- Updated dependencies [[`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1)]:
  - @equinor/fusion-observable@8.4.4
  - @equinor/fusion-query@5.2.1

## 2.1.0

### Minor Changes

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - - Exposed the `IBookmarkProvider` interface and updated references.
  - Improved handling of the parent provider in `BookmarkProvider`.
  - Fixed `BookmarkProvider.on` to only emit when the source of the event is the provider.
  - Refactored `BookmarkProvider.generatePayload` to better handle the creation and update of bookmark payloads.
  - Ensured all observable executions to the API are terminated after the first successful or failed response.

### Patch Changes

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - improved typing and convertion from api

## 2.0.2

### Patch Changes

- Updated dependencies [[`a965fbe`](https://github.com/equinor/fusion-framework/commit/a965fbeb9544b74f7d7b4aaa1e57c50d2ae4a564)]:
  - @equinor/fusion-query@5.2.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-observable@8.4.3
  - @equinor/fusion-query@5.1.5

## 2.0.0

### Major Changes

- [#2410](https://github.com/equinor/fusion-framework/pull/2410) [`9d1cb90`](https://github.com/equinor/fusion-framework/commit/9d1cb9003fa10e7ccaa95c20ef86f0a618034641) Thanks [@odinr](https://github.com/odinr)! - rewrite bookmark module

  Needed rewrite of the bookmark module to better represent the api, and provide a more robust interface for working with bookmarks. Instead of fixing the current implementation, it was decided to rework the entire module to save time and confusion in the future.

  The v1 implementation had strong coupling with the portal code and was not a good representation of the api. The new implementation is more robust and independent of source systems. The new implementation uses zod schemas to validate requests and responses.

  The new implementation is not backwards compatible with the v1 implementation, so all ancestor modules should be updated to reflect the changes in this module.

  The new implementation has better state management and error handling, and should be easier to work with than the v1 implementation.

  **Highlights:**

  - has validation of configuration of the module.
  - uses the `BaseConfigBuilder` pattern for configuration.
  - has validation of requests and responses using zod schemas.
  - has better error handling and state management.
  - has better separation of concerns.
  - has better documentation.
  - has better state management.
  - has better flow control.
  - has better logging.

  **Migration:**

  - update config for enabling the module
  - check all direct access to provider interface if they are still valid

  **Breaking changes:**

  - The provider interface has changed
  - The client interface has changed
  - The configuration interface has changed

## 1.2.13

### Patch Changes

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-observable@8.4.2
  - @equinor/fusion-query@5.1.4

## 1.2.12

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module@4.3.5

## 1.2.11

### Patch Changes

- Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
  - @equinor/fusion-observable@8.4.1
  - @equinor/fusion-query@5.1.3

## 1.2.10

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-query@5.1.2

## 1.2.9

### Patch Changes

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-observable@8.4.0
  - @equinor/fusion-query@5.1.1
  - @equinor/fusion-framework-module@4.3.3

## 1.2.8

### Patch Changes

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
  - @equinor/fusion-framework-module@4.3.2
  - @equinor/fusion-query@5.1.0
  - @equinor/fusion-observable@8.3.3

## 1.2.7

### Patch Changes

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
  - @equinor/fusion-observable@8.3.2
  - @equinor/fusion-query@5.0.5

## 1.2.6

### Patch Changes

- Updated dependencies [[`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
  - @equinor/fusion-query@5.0.4
  - @equinor/fusion-observable@8.3.1

## 1.2.5

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-query@5.0.3

## 1.2.4

### Patch Changes

- Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
  - @equinor/fusion-query@5.0.2

## 1.2.3

### Patch Changes

- Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
  - @equinor/fusion-query@5.0.1

## 1.2.2

### Patch Changes

- Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
  - @equinor/fusion-query@5.0.0

## 1.2.1

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a), [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
  - @equinor/fusion-observable@8.3.0
  - @equinor/fusion-query@4.2.0

## 1.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-observable@8.2.0
  - @equinor/fusion-query@4.1.0

## 1.1.2

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7

## 1.1.1

### Patch Changes

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
  - @equinor/fusion-observable@8.1.5
  - @equinor/fusion-query@4.0.6

## 1.1.0

### Minor Changes

- [#1693](https://github.com/equinor/fusion-framework/pull/1693) [`7fea31b`](https://github.com/equinor/fusion-framework/commit/7fea31b049cd7dcce9336ed1bc339165729b0d99) Thanks [@Noggling](https://github.com/Noggling)! - Fixing the infinite loading if a bookmark is created in classic fusion and allowing for sourceSystem to be undefined.

## 1.0.17

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
  - @equinor/fusion-observable@8.1.4
  - @equinor/fusion-query@4.0.5

## 1.0.16

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-observable@8.1.3
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-query@4.0.4

## 1.0.15

### Patch Changes

- [`6f8c32b8`](https://github.com/equinor/fusion-framework/commit/6f8c32b8e0ae1f4431d09d201b2a305a883cf886) Thanks [@odinr](https://github.com/odinr)! - After creating a bookmark the bookmark module will no longer set it as current. This makes sense because the application is already in the correct state when the bookmark was created

  see: #1547

  https://github.com/equinor/fusion-framework/blob/main/packages/modules/navigation/src/module.ts#L13

## 1.0.14

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3

## 1.0.13

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2

## 1.0.12

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-observable@8.1.2
  - @equinor/fusion-query@4.0.1

## 1.0.11

### Patch Changes

- Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-query@4.0.0

## 1.0.10

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4), [`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-observable@8.1.1
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-query@3.0.7

## 1.0.9

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6

## 1.0.8

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-observable@8.1.0
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-query@3.0.5

## 1.0.7

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@1.0.5...@equinor/fusion-framework-module-bookmark@1.0.6) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.5 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@1.0.3...@equinor/fusion-framework-module-bookmark@1.0.4) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.3 (2023-04-24)

### Bug Fixes

- **bookmark-module:** favorites now updates the bookmarks state when adding and removing bookmarks ([0e43cb1](https://github.com/equinor/fusion-framework/commit/0e43cb1a4e2f9b8fe3fcff4df053846f585cca3d))
- **bookmark-module:** get the last event from get all bookmarks, and added onBookmarksChange dispatch ([4b53fc3](https://github.com/equinor/fusion-framework/commit/4b53fc37c0d072604c336490dc82beca2310cd51))

## 1.0.2 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.1 (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 1.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.4 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.3 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.2 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@0.2.0...@equinor/fusion-framework-module-bookmark@0.2.1) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.2.0 (2023-04-11)

### Features

- **bookmark-module:** added functionality fro bookmark favorites ([0d66c30](https://github.com/equinor/fusion-framework/commit/0d66c301dd5d938c5e327273a6a48275bf29d5e1))

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@0.1.3...@equinor/fusion-framework-module-bookmark@0.1.4) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## 0.1.3 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-bookmark

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-bookmark@0.1.1...@equinor/fusion-framework-module-bookmark@0.1.2) (2023-03-24)

### Bug Fixes

- **bookmark-module:** invalidate cache for query by id ([24d6ca5](https://github.com/equinor/fusion-framework/commit/24d6ca5a59ce3e2a17291ddd65f0adb9f605e995))

## 0.1.1 (2023-03-24)

### Bug Fixes

- **bookmark-module:** remove navigation provider resolver sins it not in use ([851a46b](https://github.com/equinor/fusion-framework/commit/851a46bb48cd01a51f630bc8b2e405660855152e))

## 0.1.0 (2023-03-22)

### Features

- fusion bookmark module ([3f8259e](https://github.com/equinor/fusion-framework/commit/3f8259e47ea52637375d24ba3566c6ee1019c149))

### Bug Fixes

- **bookmarks:** await dispatch of change event ([89c350a](https://github.com/equinor/fusion-framework/commit/89c350a6b26d036df8431064fd6641b6e546d324))
- create example ([9a524ac](https://github.com/equinor/fusion-framework/commit/9a524ac354cd62ba084f05b456a2da857ed24575))
- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

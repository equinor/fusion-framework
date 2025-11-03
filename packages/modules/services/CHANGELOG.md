# Change Log

## 7.1.5-preview.1

### Patch Changes

- [#3702](https://github.com/equinor/fusion-framework/pull/3702) [`999d81d`](https://github.com/equinor/fusion-framework/commit/999d81d9151505009d75457cf252e3c74cf64e52) Thanks [@github-actions](https://github.com/apps/github-actions)! - relase next of all packages

- Updated dependencies [[`999d81d`](https://github.com/equinor/fusion-framework/commit/999d81d9151505009d75457cf252e3c74cf64e52)]:
  - @equinor/fusion-framework-module@5.0.6-preview.1

## 7.1.5-next.0

### Patch Changes

- [`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded) Thanks [@odinr](https://github.com/odinr)! - relase next of all packages

- Updated dependencies [[`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded)]:
  - @equinor/fusion-framework-module@5.0.6-next.0

## 7.1.4

### Patch Changes

- [#3544](https://github.com/equinor/fusion-framework/pull/3544) [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.11 to 4.1.12, which includes a critical bug fix for ZodError.flatten() preventing crashes on 'toString' key and improved error handling throughout the framework.

- Updated dependencies [[`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59)]:
  - @equinor/fusion-framework-module@5.0.5

## 7.1.3

### Patch Changes

- [#3607](https://github.com/equinor/fusion-framework/pull/3607) [`6dfb29e`](https://github.com/equinor/fusion-framework/commit/6dfb29eef67548228c05668b44ad02a34c83b050) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @faker-js/faker from 9.9.0 to 10.1.0

  - Updated devDependency @faker-js/faker to v10.1.0
  - ESM-only distribution aligns with project architecture
  - All existing faker APIs remain stable and compatible
  - No breaking changes to public module API

- [#3602](https://github.com/equinor/fusion-framework/pull/3602) [`88e0e58`](https://github.com/equinor/fusion-framework/commit/88e0e58fcdcfa069be2c652ac46a4bb11e91abb1) Thanks [@odinr](https://github.com/odinr)! - Fix ApiProvider to extend BaseModuleProvider, ensuring proper framework integration and consistent provider lifecycle management.

  Provider now correctly implements IModuleProvider interface through BaseModuleProvider inheritance.

- Updated dependencies [[`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be)]:
  - @equinor/fusion-framework-module@5.0.4

## 7.1.2

### Patch Changes

- [#3477](https://github.com/equinor/fusion-framework/pull/3477) [`5b2b300`](https://github.com/equinor/fusion-framework/commit/5b2b300492ff7f3e2bf9aa10d6697178486028ec) Thanks [@Noggling](https://github.com/Noggling)! - Made the `jobTitle` field in `ApiPersonSchema` nullable to ensure external users can access bookmarks even when the `jobTitle` field is not set.

  ref:[668](https://github.com/equinor/fusion/issues/668)
  reporter: [EdwardBrunton](https://github.com/EdwardBrunton)

## 7.1.1

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

- [#3428](https://github.com/equinor/fusion-framework/pull/3428) [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.9 to 4.1.11

  - **v4.1.10**: Fixed shape caching issue (#5263) improving validation performance for complex schemas
  - **v4.1.11**: Maintenance release with general improvements

  This patch update enhances schema validation performance without changing any APIs.

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6)]:
  - @equinor/fusion-framework-module@5.0.2

## 7.1.0

### Minor Changes

- [#3394](https://github.com/equinor/fusion-framework/pull/3394) [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295) Thanks [@odinr](https://github.com/odinr)! - Updated Zod dependency from v3 to v4 with necessary schema adjustments.

  - Updated `zod` dependency from `^3.25.76` to `^4.1.8`
  - Fixed `z.record()` usage to explicitly specify key type as `z.string()`
  - Simplified `schemaSelector` function type parameters to align with Zod v4 API
  - Updated response type handling in schema selector utilities

  This update ensures compatibility with the latest Zod version while maintaining existing API contracts.

## 7.0.2

### Patch Changes

- [#3393](https://github.com/equinor/fusion-framework/pull/3393) [`3ce5a18`](https://github.com/equinor/fusion-framework/commit/3ce5a1887c8fb90f24c3367f8926db69cc9a1914) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated odata-query dependency from 8.0.4 to 8.0.5

  ### Changes

  - Updated odata-query to fix transform operations order issue
  - This is a patch update with no breaking changes

  ### Links

  - [GitHub releases](https://github.com/techniq/odata-query/releases/tag/v8.0.5)
  - [Changelog](https://github.com/techniq/odata-query/blob/main/CHANGELOG.md#805)

## 7.0.1

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

- Updated dependencies [[`3049232`](https://github.com/equinor/fusion-framework/commit/30492326336bea0d1af683b89e62a18eceec4402)]:
  - @equinor/fusion-framework-module@5.0.1

## 7.0.0

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Upgrade zod dependency to ^3.25.76 in all affected packages.

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module@5.0.0

## 6.0.4

### Patch Changes

- [#3252](https://github.com/equinor/fusion-framework/pull/3252) [`4447dd9`](https://github.com/equinor/fusion-framework/commit/4447dd9da60305eade68241ffbe670c4c7dde19a) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump odata-query from 7.0.9 to 8.0.4

## 6.0.3

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

## 6.0.2

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module@4.4.2

## 6.0.1

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1

## 6.0.0

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42)]:
  - @equinor/fusion-framework-module@4.4.0

## 5.1.4

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module@4.3.8

## 5.1.3

### Patch Changes

- [`134863f`](https://github.com/equinor/fusion-framework/commit/134863fa96bcd5f799bc621f755b1605d0c1255c) Thanks [@odinr](https://github.com/odinr)! - updated type def to 4.7+

## 5.1.2

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2904](https://github.com/equinor/fusion-framework/pull/2904) [`0a7cfc1`](https://github.com/equinor/fusion-framework/commit/0a7cfc18a2debea272bc934c473ede9510c0368d) Thanks [@odinr](https://github.com/odinr)! - refactor: aligned code to Biome rule `noAccumulatingSpread`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-module@4.3.7

## 5.1.1

### Patch Changes

- [#2854](https://github.com/equinor/fusion-framework/pull/2854) [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24) Thanks [@odinr](https://github.com/odinr)! - removed useless switch cases

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6

## 5.1.0

### Minor Changes

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - added support for user bookmarks v2

## 5.0.1

### Patch Changes

- [#2650](https://github.com/equinor/fusion-framework/pull/2650) [`2343667`](https://github.com/equinor/fusion-framework/commit/234366756878550ed7405610f384d69fb6a89967) Thanks [@odinr](https://github.com/odinr)! - Fixed `isBookmarkInFavorites` by altering `generateRequestParameters` which had a copy paste bug (wrong request method). Also disabled the `validate_api_request` response operation for now, it was throwing an error on all response code which waas not **OK**.

  > in a future update, the `ResponseHandler` will provide the operators with the `Request` object, so they can access the request method and other request properties.

  Also fixed the `headSelector` to only check response code, since a `HEAD` request does not return a body.

## 5.0.0

### Major Changes

- [#2410](https://github.com/equinor/fusion-framework/pull/2410) [`9d1cb90`](https://github.com/equinor/fusion-framework/commit/9d1cb9003fa10e7ccaa95c20ef86f0a618034641) Thanks [@odinr](https://github.com/odinr)! - Total rework of api interface for bookmarks.

  The current version misrepresents the api, and does not provide a good interface for working with bookmarks. So was decided to rework the api interface to better represent the api, and provide a more robust interface for working with bookmarks. Instead of fixing the current implementation, it was decided to rework the entire module to save time and confusion in the future.

  > This module is meant for internal use only, and should not be used directly by applications, so the breaking changes should not affect any applications. Ancestor modules should be updated to reflect the changes in this module.

  **BREAKING CHANGES:**

  - api client has been updated to reflect the new api endpoints and request/response types
  - models have been replaced with infered `zod` schemas
  - request and responses are now parsed and validated using `zod` schemas
  - file structure has been updated to reflect the new api client structure

## 4.1.5

### Patch Changes

- [#2491](https://github.com/equinor/fusion-framework/pull/2491) [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51) Thanks [@odinr](https://github.com/odinr)! - Capatalize http request method verb to uppercase

## 4.1.4

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module@4.3.5

## 4.1.3

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4

## 4.1.2

### Patch Changes

- Updated dependencies [[`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module@4.3.3

## 4.1.1

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-module@4.3.2

## 4.1.0

### Minor Changes

- [#2181](https://github.com/equinor/fusion-framework/pull/2181) [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-framework-module-services

  Updated the `PeopleApiClient.photo` method to properly type the response as `PersonPhotoApiResponse<TVersion>` instead of `Blob`. This allows for more accurate type checking when using the method.

  To update your code:

  - If you are using the `PeopleApiClient.photo` method directly, no changes are needed. The method will now properly type the response.
  - If you have custom type assertions or checks around the response from `PeopleApiClient.photo`, you may need to update them to handle `PersonPhotoApiResponse<TVersion>` instead of `Blob`.

  Example:

  ```ts
  // Before
  const photoResponse: Blob = await peopleApiClient.photo("v2", "blob", {
    azureId: "123",
  });
  console.log(typeof photoResponse); // Blob

  // After
  const photoResponse: PersonPhotoApiResponse<"v2"> =
    await peopleApiClient.photo("v2", "blob", {
      azureId: "123",
    });
  console.log(typeof photoResponse); // Object - { filename: string, blob: Blob }
  ```

## 4.0.2

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
  - @equinor/fusion-framework-module@4.3.1

## 4.0.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

## 4.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0

## 3.2.4

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7

## 3.2.3

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6

## 3.2.2

### Patch Changes

- [#1282](https://github.com/equinor/fusion-framework/pull/1282) [`ddc31c35`](https://github.com/equinor/fusion-framework/commit/ddc31c3571e36be057095238cf22e78051f423b0) Thanks [@odinr](https://github.com/odinr)! - add util for checking if object is person

  > extremely crude, but good enough until backend comes of with new models or endpoint

  _updated typings for person v4_

## 3.2.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5

## 3.2.0

### Minor Changes

- [#1243](https://github.com/equinor/fusion-framework/pull/1243) [`f277c7fc`](https://github.com/equinor/fusion-framework/commit/f277c7fc54ca2ebe75ba1dda94a0d72eb7c8e15b) Thanks [@odinr](https://github.com/odinr)! - Added person services

  > **for internal usage only!**

  - add function for fetching person details
  - add function for querying persons
  - add function for downloading person photo

  ```ts
  const personApi = await modules.services.createPeopleClient();
  personApi.query('v2', 'json
  ```

## 3.1.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

- **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

- **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

- **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

- **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
- **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

- **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

- **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

- **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
- **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

- **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
- **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

- **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

- added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

- import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

- :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

- :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

- **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

- **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

- **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
- **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
- **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))
  , {search: 'foo@bar.com'})
  personApi.get('v4', 'json

## 3.1.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

- **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

- **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

- **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

- **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
- **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

- **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

- **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

- **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
- **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

- **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
- **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

- **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

- added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

- import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

- :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

- :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

- **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

- **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

- **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
- **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
- **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))
  , {azureId: '1234'})
  personApi.photo('v2', 'blob

## 3.1.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

- **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

- **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

- **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

- **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
- **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

- **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

- **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

- **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
- **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

- **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
- **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

- **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

- added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

- import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

- :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

- :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

- **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

- **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

- **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
- **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
- **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))
  , {azureId: '123'})
  ``

- [#1254](https://github.com/equinor/fusion-framework/pull/1254) [`a2d2dee9`](https://github.com/equinor/fusion-framework/commit/a2d2dee987673171ad91daec98cb530649da5849) Thanks [@odinr](https://github.com/odinr)! - Update people client to reflect Fusion API

  - added models for v2 and v4
  - added expand logic for person detail `roles` `positions` `contracts` `manager` `companies`
  - changed api client to now include args and init (previously args where extracted from call parameters) to correctly type response models

## 3.1.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4

## 3.1.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3

## 3.1.3

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.1.1...@equinor/fusion-framework-module-services@3.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 3.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@3.0.3...@equinor/fusion-framework-module-services@3.1.0) (2023-05-05)

### Features

- **module-services:** add response handler ([77128e8](https://github.com/equinor/fusion-framework/commit/77128e82692ff570cf65a8b3c900bc6234ce4ae9))

### Bug Fixes

- **module-services:** validate response for http client ([6958f82](https://github.com/equinor/fusion-framework/commit/6958f82c4615f701e2ae9edf2d34dda60af8960a))

## 3.0.3 (2023-04-24)

### Bug Fixes

- **services-module:** fix bookmark favorites url ([f9c6129](https://github.com/equinor/fusion-framework/commit/f9c612914eae57452e1ffe77b1dc054eefea2850))

## 3.0.2 (2023-04-18)

### Bug Fixes

- **service:** fix linting ([88b5e59](https://github.com/equinor/fusion-framework/commit/88b5e596d18ac8b999404c3487a9896b0806a767))
- **services:** update-api-provider-types ([380c6af](https://github.com/equinor/fusion-framework/commit/380c6af855fa6b9a29dbedd51917f0d6e4e7742b))

## 3.0.1 (2023-04-17)

### Bug Fixes

- **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## 3.0.0 (2023-04-16)

### Bug Fixes

- **modules/services:** fix oData query builder ([95e3e98](https://github.com/equinor/fusion-framework/commit/95e3e9886cbf4d00820577eaf141f83cc8a602b5))

## 2.6.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.5.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.4.0 (2023-04-14)

### Features

- **module-services:** add api interface for resolving related context ([54a8d9f](https://github.com/equinor/fusion-framework/commit/54a8d9f1a34052abb0f2e9104c9395b0fc4c77c4))

## 2.3.1 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.2.0...@equinor/fusion-framework-module-services@2.3.0) (2023-03-28)

### Features

- **bookmark-client:** added verify users bookmark ([971835c](https://github.com/equinor/fusion-framework/commit/971835c801f46fc4bebd3d1b97ca8cd83c085a77))
- **Bookmark-Client:** Enable to add bookmark favorites ([83dd966](https://github.com/equinor/fusion-framework/commit/83dd966ef1d609f0be44373ee16344810ae9beb4))

### Bug Fixes

- **bookmark-client:** fix import ([7c7d585](https://github.com/equinor/fusion-framework/commit/7c7d585b6eb53688e5ce9f80474eac3275576290))
- **bookmark-client:** renamed id to bookmarkId ([590ad69](https://github.com/equinor/fusion-framework/commit/590ad69cfca579ec65accb5dab47c69968aade95))

## 2.2.0 (2023-03-27)

### Features

- **services:** Added notification api service ([8a40606](https://github.com/equinor/fusion-framework/commit/8a406068d69903e0d7ebc76079ed12caeac540f1))

## 2.1.0 (2023-03-22)

### Features

- added put and getAll endpoints to the bookmark api client ([b9deb40](https://github.com/equinor/fusion-framework/commit/b9deb406460cea2f0fa34eb688d4e427bfb2f9b5))

### Bug Fixes

- **pr:** Fixing pr comments ([4ee3fb3](https://github.com/equinor/fusion-framework/commit/4ee3fb3b509c7b7560378e18ee51d9c1759a8685))

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.6...@equinor/fusion-framework-module-services@2.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.5...@equinor/fusion-framework-module-services@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.4...@equinor/fusion-framework-module-services@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.3...@equinor/fusion-framework-module-services@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@2.0.2...@equinor/fusion-framework-module-services@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.15...@equinor/fusion-framework-module-services@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.14...@equinor/fusion-framework-module-services@1.0.15) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.14 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.12...@equinor/fusion-framework-module-services@1.0.13) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.11...@equinor/fusion-framework-module-services@1.0.12) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.11 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.10 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.9 (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.7...@equinor/fusion-framework-module-services@1.0.8) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.7 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.5...@equinor/fusion-framework-module-services@1.0.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.4...@equinor/fusion-framework-module-services@1.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@1.0.3...@equinor/fusion-framework-module-services@1.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.3 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.21...@equinor/fusion-framework-module-services@1.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.20...@equinor/fusion-framework-module-services@0.5.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.19...@equinor/fusion-framework-module-services@0.5.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.18...@equinor/fusion-framework-module-services@0.5.19) (2022-12-01)

### Bug Fixes

- import typos ([c6449f1](https://github.com/equinor/fusion-framework/commit/c6449f1ac692439d52ed0e88f8492de9721e29ce))

## [0.5.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.17...@equinor/fusion-framework-module-services@0.5.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.16...@equinor/fusion-framework-module-services@0.5.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.15...@equinor/fusion-framework-module-services@0.5.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.14...@equinor/fusion-framework-module-services@0.5.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.13...@equinor/fusion-framework-module-services@0.5.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.12...@equinor/fusion-framework-module-services@0.5.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.11...@equinor/fusion-framework-module-services@0.5.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.10...@equinor/fusion-framework-module-services@0.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.9...@equinor/fusion-framework-module-services@0.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.9 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.7...@equinor/fusion-framework-module-services@0.5.8) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.7 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.5.4...@equinor/fusion-framework-module-services@0.5.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.5.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.4.0...@equinor/fusion-framework-module-services@0.5.0) (2022-11-01)

### Features

- :sparkles: delete bookmark ([df70d9f](https://github.com/equinor/fusion-framework/commit/df70d9f6ed369cfc9e682a268b7175ddf8b3d122))

## 0.4.0 (2022-11-01)

### Features

- :sparkles: post bookmark module-services ([333ec6a](https://github.com/equinor/fusion-framework/commit/333ec6ab394f305aa02678d93a513ecf67fd52bc))

## 0.3.2 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.1 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.3.0 (2022-10-21)

### Features

- **module-services:** bookmarks get ([0fe2c83](https://github.com/equinor/fusion-framework/commit/0fe2c83155b7c49623da13739f0945edf4ee9200))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-services@0.1.1...@equinor/fusion-framework-module-services@0.2.0) (2022-10-17)

### Features

- **observable:** expose async query function ([b9292fc](https://github.com/equinor/fusion-framework/commit/b9292fcabd0756c0340fc767acf592482b253cd0))

## 0.1.1 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-services

## 0.1.0 (2022-10-03)

### Features

- **module-services:** initial ([98fd097](https://github.com/equinor/fusion-framework/commit/98fd097aa486d8ece4cd4501cf7ecb533dd7a62a)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** initial ([8eeadc7](https://github.com/equinor/fusion-framework/commit/8eeadc764516048e5ead9f5e2d14af7edd1b1057)), closes [#265](https://github.com/equinor/fusion-framework/issues/265) [#269](https://github.com/equinor/fusion-framework/issues/269) [#270](https://github.com/equinor/fusion-framework/issues/270)
- **module-services:** rewrite interface for services ([b440aa2](https://github.com/equinor/fusion-framework/commit/b440aa28ae733aa77e07128b04b21fe24db356b4))
- **module-services:** rewrite module ([bbbc203](https://github.com/equinor/fusion-framework/commit/bbbc2031f4c8785fd623db3be16f96195094f47e))
- **module-services:** rewrite module ([40b64ad](https://github.com/equinor/fusion-framework/commit/40b64ad5dca8ef719fcca9b3297e85aa28af413a))

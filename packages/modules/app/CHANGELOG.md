# Change Log

## 7.1.0

### Minor Changes

- [#3713](https://github.com/equinor/fusion-framework/pull/3713) [`eaa6871`](https://github.com/equinor/fusion-framework/commit/eaa6871edc07054138e88bc706a4137a3fcc261a) Thanks [@Noggling](https://github.com/Noggling)! - # Add app tag/version support for specific app builds

  This changeset introduces comprehensive support for loading specific app versions using tags, enabling developers to test different app builds and manage version-specific deployments.

  ## New Features

  ### App Tag/Version Support

  - **App Client**: Added `getAppBuild` method to fetch build manifests by app key and tag
  - **App Module Provider**: Enhanced `getAppManifest` to accept optional tag parameter
  - **App Loading**: Modified `setCurrentApp` to support `AppReference` objects with tag specification
  - **URL Integration**: Added `getAppTagFromUrl` utility to extract app tags from URL parameters

  ### Enhanced Type System

  - Added `AppReference` type for specifying app key and optional tag
  - Extended `AppBundleState` to include optional `tag` property
  - Updated `AppBuildManifest` type definition for build-specific metadata

  ### API Improvements

  - **AppClient**: Updated interface to support tag-based manifest and build fetching
  - **App Class**: Added `tag` getter property for accessing current app tag
  - **Action System**: Enhanced `fetchManifest` action to handle tag parameters

  ## Changes by Package

  ### `@equinor/fusion-framework-module-app`

  - **AppClient.ts**: Added `getAppBuild` method with tag support and updated `getAppManifest` signature
  - **AppModuleProvider.ts**: Enhanced `setCurrentApp` method to handle `AppReference` objects with tags
  - **App.ts**: Added `tag` getter and improved error handling in initialization
  - **types.ts**: Added `AppReference` type and extended `AppBundleState` with tag property
  - **actions.ts**: Updated `fetchManifest` action to accept tag parameter
  - **flows.ts**: Modified manifest fetching flow to handle tag-based requests

  ### `@equinor/fusion-framework-dev-portal`

  - **AppLoader.tsx**: Added `getAppTagFromUrl` utility function and integrated tag-based app loading

  ## Usage Examples

  ### Loading specific app version by tag

  ```typescript
  // Set current app with specific tag or version
  app.setCurrentApp({ appKey: "my-app", tag: "1.2.3" });

  app.setCurrentApp({ appKey: "my-app", tag: "preview" });

  // Extract tag from URL and load app
  const tag = getAppTagFromUrl();
  if (tag) {
    app.setCurrentApp({ appKey: "my-app", tag });
  }
  ```

  ### Fetching app builds

  ```typescript
  // Get build manifest for specific tag
  const buildManifest = await appClient.getAppBuild({
    appKey: "my-app",
    tag: "latest",
  });
  ```

  ## Migration Guide

  ### For App Consumers

  - No breaking changes - existing code continues to work
  - Optionally use new tag-based loading for version-specific deployments

  ### For App Developers

  - Consider adding `&tag` URL parameter support for testing different versions
  - Use new `AppReference` type when programmatically setting current apps with tags

  ## Technical Details

  - **Backward Compatibility**: All changes are backward compatible
  - **Caching**: Tag-based manifests and builds are cached separately
  - **Error Handling**: Enhanced error handling for build and manifest loading failures
  - **Type Safety**: Full TypeScript support for all new features

  closes: AB#65777
  related to: AB#65452

## 7.0.3

### Patch Changes

- [#3654](https://github.com/equinor/fusion-framework/pull/3654) [`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update immer from 10.1.3 to 10.2.0 for performance improvements, including optimized caching and iteration logic.

- [#3544](https://github.com/equinor/fusion-framework/pull/3544) [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.11 to 4.1.12, which includes a critical bug fix for ZodError.flatten() preventing crashes on 'toString' key and improved error handling throughout the framework.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e)]:
  - @equinor/fusion-observable@8.5.6
  - @equinor/fusion-query@6.0.1

## 7.0.2

### Patch Changes

- Updated dependencies [[`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275), [`d3bcafe`](https://github.com/equinor/fusion-framework/commit/d3bcafed8b8c5a02ebe68693588cb376ed5e1b0e)]:
  - @equinor/fusion-observable@8.5.5
  - @equinor/fusion-query@6.0.0

## 7.0.1

### Patch Changes

- [#3428](https://github.com/equinor/fusion-framework/pull/3428) [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.9 to 4.1.11

  - **v4.1.10**: Fixed shape caching issue (#5263) improving validation performance for complex schemas
  - **v4.1.11**: Maintenance release with general improvements

  This patch update enhances schema validation performance without changing any APIs.

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6)]:
  - @equinor/fusion-observable@8.5.4
  - @equinor/fusion-query@5.2.14

## 7.0.0

### Major Changes

- [#3394](https://github.com/equinor/fusion-framework/pull/3394) [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295) Thanks [@odinr](https://github.com/odinr)! - feat: migrate to zod v4

  Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the app module to use explicit key and value types for records and updated error message format from `description` to `message` for zod v4 compatibility.

  Key changes in source code:

  - Fixed record schema definitions to use explicit key and value types (`z.record(z.string(), z.any())`)
  - Updated error message options format (replaced `description` with `message`)
  - Enhanced `ApiAppConfigSchema` with proper record type definitions for environment and endpoints
  - Updated `ApiApplicationPersonSchema` to use zod v4 error message format

  Breaking changes: Record schemas must specify both key and value types explicitly. Error message format has changed from zod v3 to v4 format. Function schema definitions now require explicit typing.

  Links:

  - [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
  - [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

## 6.1.19

### Patch Changes

- [#3367](https://github.com/equinor/fusion-framework/pull/3367) [`e7de2b7`](https://github.com/equinor/fusion-framework/commit/e7de2b7c1114094da445625a761fc9a3be6bdf87) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add `landing-page` to union of `AppType`

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

- [#3386](https://github.com/equinor/fusion-framework/pull/3386) [`d740b78`](https://github.com/equinor/fusion-framework/commit/d740b7829694efb73edcd32006ec1f26e0075e9a) Thanks [@eikeland](https://github.com/eikeland)! - Added 'template-app' as a new app type to the AppType union.

  This change extends the available app types that consumers can use when configuring applications, providing support for template-based apps.

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

## 6.1.18

### Patch Changes

- [#3315](https://github.com/equinor/fusion-framework/pull/3315) [`2ea9fb6`](https://github.com/equinor/fusion-framework/commit/2ea9fb63bdf967e0d010ddae2af9f6fb32077240) Thanks [@Noggling](https://github.com/Noggling)! - Improve error handling in AppClient

  - Add support for HTTP 410 (Gone) status code handling across all error types
  - Import and use `HttpJsonResponseError` for more specific error handling in `getAppManifest`
  - Add 'deleted' error type to handle when application resources have been deleted
  - Update error handling logic to properly handle different error types in the catch blocks
  - Ensure proper error propagation and type checking for manifest, config, and settings errors

## 6.1.17

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Upgrade zod dependency to ^3.25.76 in all affected packages.

## 6.1.16

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-query@5.2.11

## 6.1.15

### Patch Changes

- Updated dependencies [[`0d22e3c`](https://github.com/equinor/fusion-framework/commit/0d22e3c486ab11c40f14fb1f11f0b718e7bf1593)]:
  - @equinor/fusion-observable@8.5.1
  - @equinor/fusion-query@5.2.10

## 6.1.14

### Patch Changes

- Updated dependencies [[`d247ec7`](https://github.com/equinor/fusion-framework/commit/d247ec7482a4d5231657875f6c6733ce37df07c9), [`89f80e4`](https://github.com/equinor/fusion-framework/commit/89f80e41dac04e71518c7314cada86ecc835708d)]:
  - @equinor/fusion-observable@8.5.0
  - @equinor/fusion-query@5.2.9

## 6.1.13

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-observable@8.4.9
  - @equinor/fusion-query@5.2.8

## 6.1.12

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-observable@8.4.8
  - @equinor/fusion-query@5.2.7

## 6.1.11

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.6

## 6.1.10

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-observable@8.4.7
  - @equinor/fusion-query@5.2.5

## 6.1.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.4

## 6.1.8

### Patch Changes

- [#2929](https://github.com/equinor/fusion-framework/pull/2929) [`e3de5fa`](https://github.com/equinor/fusion-framework/commit/e3de5fa01528705f8032f673bb03fe48ac97a152) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Added `queueOperator: "merge"` to manifest and config in AppClient

## 6.1.7

### Patch Changes

- [#2917](https://github.com/equinor/fusion-framework/pull/2917) [`378f897`](https://github.com/equinor/fusion-framework/commit/378f89707a357d165b84ea82b74147b7f0d87f52) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Add `webpackIgnore` to module import for application

## 6.1.6

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`d20db24`](https://github.com/equinor/fusion-framework/commit/d20db24c73690e90a5860fe5160909c77efa41cb), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424)]:
  - @equinor/fusion-observable@8.4.6
  - @equinor/fusion-query@5.2.3

## 6.1.5

### Patch Changes

- [#2852](https://github.com/equinor/fusion-framework/pull/2852) [`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d) Thanks [@odinr](https://github.com/odinr)! - replaced forEach with for-of loops for better readability

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`2fe6241`](https://github.com/equinor/fusion-framework/commit/2fe624186640c3b30079c7d76f0e3af65f64f5d2), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-observable@8.4.5
  - @equinor/fusion-query@5.2.2

## 6.1.4

### Patch Changes

- Updated dependencies [[`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1)]:
  - @equinor/fusion-observable@8.4.4
  - @equinor/fusion-query@5.2.1

## 6.1.3

### Patch Changes

- [#2519](https://github.com/equinor/fusion-framework/pull/2519) [`83a7ee9`](https://github.com/equinor/fusion-framework/commit/83a7ee971785343bccedc2d72cc02486193615af) Thanks [@eikeland](https://github.com/eikeland)! - ### Changes:

  - Updated `AppClient` class to improve the query for fetching app manifests:
    - Adjusted the query path manifests method to include `$expand=category,admins,owners,keywords` when `filterByCurrentUser` is not specified.
    - Minor formatting changes for better readability.

## 6.1.2

### Patch Changes

- [#2685](https://github.com/equinor/fusion-framework/pull/2685) [`add2e98`](https://github.com/equinor/fusion-framework/commit/add2e98d23e683a801729e9af543cfa15c574e27) Thanks [@eikeland](https://github.com/eikeland)! - Added versioning support to `AppModuleProvider`.

  **Modified files:**

  - `packages/modules/app/src/AppModuleProvider.ts`

  **Changes:**

  - Imported `SemanticVersion` from `@equinor/fusion-framework-module`.
  - Imported `version` from `./version`.
  - Added a `version` getter to `AppModuleProvider` that returns a `SemanticVersion` instance.

- Updated dependencies [[`a965fbe`](https://github.com/equinor/fusion-framework/commit/a965fbeb9544b74f7d7b4aaa1e57c50d2ae4a564)]:
  - @equinor/fusion-query@5.2.0

## 6.1.1

### Patch Changes

- [#2654](https://github.com/equinor/fusion-framework/pull/2654) [`59ab642`](https://github.com/equinor/fusion-framework/commit/59ab6424f3ce80649f42ddb6804b46f6789607ba) Thanks [@eikeland](https://github.com/eikeland)! - Reverting update to the `manifests` call `selector` function in `AppClient` to use `jsonSelector` and parse the response with `ApplicationSchema`.

  **Modified files:**

  - `packages/modules/app/src/AppClient.ts`

  **Changes:**

  - Replaced `res.json()` with `jsonSelector(res)`
  - Parsed the response using `ApplicationSchema.array().parse(response.value)`

## 6.1.0

### Minor Changes

- [#2577](https://github.com/equinor/fusion-framework/pull/2577) [`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982) Thanks [@eikeland](https://github.com/eikeland)! - Added `updateSetting` and `updateSettingAsync` to the `App` class. This allows updating a setting in settings without the need to handle the settings object directly. This wil ensure that the settings are mutated correctly.

  ```ts
  const app = new App();
  // the app class will fetch the latest settings before updating the setting
  app.updateSetting("property", "value");
  ```

  example of flux state of settings:

  ```ts
  const app = new App();
  const settings = app.getSettings();

  setTimeout(() => {
    settings.foo = "foo";
    app.updateSettingsAsync(settings);
  }, 1000);

  setTimeout(() => {
    settings.bar = "bar";
    app.updateSettingsAsync(settings);
    // foo is now reset to its original value, which is not what we want
  }, 2000);
  ```

- [#2577](https://github.com/equinor/fusion-framework/pull/2577) [`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982) Thanks [@eikeland](https://github.com/eikeland)! - #### Changes:

  1. **AppClient.ts**
     - Added `updateAppSettings` method to set app settings by appKey.
  2. **AppModuleProvider.ts**
     - Added `updateAppSettings` method to update app settings.
  3. **App.ts**
     - Added `updateSettings` and `updateSettingsAsync` methods to set app settings.
     - Added effects to monitor and dispatch events for settings updates.
  4. **actions.ts**
     - Added `updateSettings` async action for updating settings.
  5. **create-reducer.ts**
     - Added reducer case for `updateSettings.success` to update state settings.
  6. **create-state.ts**
     - Added `handleUpdateSettings` flow to handle updating settings.
  7. **events.ts**
     - Added new events: `onAppSettingsUpdate`, `onAppSettingsUpdated`, and `onAppSettingsUpdateFailure`.
  8. **flows.ts**
     - Added `handleUpdateSettings` flow to handle the set settings action.
  9. **package.json**
     - Added `settings` entry to exports and types.
  10. **index.ts**
      - Created new file to export `useAppSettings`.
  11. **useAppSettings.ts**
      - Created new hook for handling app settings.
  12. **app-proxy-plugin.ts**
      - Add conditional handler for persons/me/appKey/settings to prevent matching against appmanifest path

## 6.0.3

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-observable@8.4.3
  - @equinor/fusion-query@5.1.5

## 6.0.2

### Patch Changes

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-observable@8.4.2
  - @equinor/fusion-query@5.1.4

## 6.0.1

### Patch Changes

- [#2520](https://github.com/equinor/fusion-framework/pull/2520) [`248ee1f`](https://github.com/equinor/fusion-framework/commit/248ee1f83978a158dfb88dd47d8e8bcaac0e3574) Thanks [@eikeland](https://github.com/eikeland)! - ### Changes:
  - Updated the `AppClient` class to modify the query path in the `fn` method for fetching app manifests:
    - Changed the path from `/apps/${appKey}` to `/persons/me/apps/${appKey}`.

## 6.0.0

### Major Changes

- [#2494](https://github.com/equinor/fusion-framework/pull/2494) [`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251) Thanks [@odinr](https://github.com/odinr)! - Adjusted module to the new app service API.

  > [!WARNING]
  > This will introduce breaking changes to the configuration of `AppConfigurator.client`.

  **Added**

  - Introduced `AppClient` class to handle application manifest and configuration queries.
  - Added `zod` to validate the application manifest.

  **Changed**

  - Updated `AppModuleProvider` to use `AppClient` for fetching application manifests and configurations.
  - Modified `AppConfigurator` to utilize `AppClient` for client configuration.
  - Updated `useApps` hook with new input parameter for `filterByCurrentUser` in `fusion-framework-react`.

  **Migration**

  before:

  ```ts
  configurator.setClient({
    getAppManifest: {
      client: {
        fn: ({ appKey }) => httpClient.json$<ApiApp>(`/apps/${appKey}`),
      },
      key: ({ appKey }) => appKey,
    },
    getAppManifests: {
      client: {
        fn: () => httpClient.json$<ApiApp[]>(`/apps`),
      },
      key: () => `all-apps`,
    },
    getAppConfig: {
      client: {
        fn: ({ appKey }) => httpClient.json$<ApiApp>(`/apps/${appKey}/config`),
      },
      key: ({ appKey }) => appKey,
    },
  });
  ```

  after:

  ```ts
  import { AppClient } from `@equinor/fusion-framework-module-app`;
  configurator.setClient(new AppClient());
  ```

  custom client implementation:

  ```ts
  import { AppClient } from `@equinor/fusion-framework-module-app`;
  class CustomAppClient implements IAppClient { ... }
  configurator.setClient(new CustomAppClient());
  ```

## 5.3.11

### Patch Changes

- Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
  - @equinor/fusion-observable@8.4.1
  - @equinor/fusion-query@5.1.3

## 5.3.10

### Patch Changes

- Updated dependencies [[`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e)]:
  - @equinor/fusion-query@5.1.2

## 5.3.9

### Patch Changes

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594)]:
  - @equinor/fusion-observable@8.4.0
  - @equinor/fusion-query@5.1.1

## 5.3.8

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

- Updated dependencies [[`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
  - @equinor/fusion-query@5.1.0
  - @equinor/fusion-observable@8.3.3

## 5.3.7

### Patch Changes

- [#2235](https://github.com/equinor/fusion-framework/pull/2235) [`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb) Thanks [@odinr](https://github.com/odinr)! - - **Refactored**: The `actionBaseType` function has been renamed to `getBaseType` and its implementation has been updated.

  - **Added**: New utility types and functions for handling action types and payloads in a more type-safe manner.

- [#2248](https://github.com/equinor/fusion-framework/pull/2248) [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - #2235 renamed a method and changed type. This PR forgot to change to the correct param when using this method. Fixes typo - update to use actions `type` in the reducer.

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
  - @equinor/fusion-observable@8.3.2
  - @equinor/fusion-query@5.0.5

## 5.3.6

### Patch Changes

- Updated dependencies [[`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
  - @equinor/fusion-query@5.0.4
  - @equinor/fusion-observable@8.3.1

## 5.3.5

### Patch Changes

- Updated dependencies [[`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
  - @equinor/fusion-query@5.0.3

## 5.3.4

### Patch Changes

- Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
  - @equinor/fusion-query@5.0.2

## 5.3.3

### Patch Changes

- Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
  - @equinor/fusion-query@5.0.1

## 5.3.2

### Patch Changes

- Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
  - @equinor/fusion-query@5.0.0

## 5.3.1

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a), [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
  - @equinor/fusion-observable@8.3.0
  - @equinor/fusion-query@4.2.0

## 5.3.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-observable@8.2.0
  - @equinor/fusion-query@4.1.0

## 5.2.14

### Patch Changes

- [#1879](https://github.com/equinor/fusion-framework/pull/1879) [`2acd475`](https://github.com/equinor/fusion-framework/commit/2acd47532fe680f498fdf7229309cddb2594e391) Thanks [@odinr](https://github.com/odinr)! - improved documentation

## 5.2.13

### Patch Changes

- [#1763](https://github.com/equinor/fusion-framework/pull/1763) [`1ca8264`](https://github.com/equinor/fusion-framework/commit/1ca826489a0d1dd755324344a12bbf6659a3be12) Thanks [@odinr](https://github.com/odinr)! - improve type of current application

  - result will be `undefined` if current application has never been set
  - result will be `IApplication` if current application is set
  - result will be `null` if current application is cleared

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
  - @equinor/fusion-observable@8.1.5
  - @equinor/fusion-query@4.0.6

## 5.2.12

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
  - @equinor/fusion-observable@8.1.4
  - @equinor/fusion-query@4.0.5

## 5.2.11

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-observable@8.1.3
  - @equinor/fusion-query@4.0.4

## 5.2.10

### Patch Changes

- [#1545](https://github.com/equinor/fusion-framework/pull/1545) [`6d303787`](https://github.com/equinor/fusion-framework/commit/6d303787f647bb2fc3c90456eccac751abb264c4) Thanks [@odinr](https://github.com/odinr)! - fixed emittet event detials

## 5.2.9

### Patch Changes

- [#1529](https://github.com/equinor/fusion-framework/pull/1529) [`8274dca1`](https://github.com/equinor/fusion-framework/commit/8274dca10a773e1d29ffbce82a6f6f2bae818316) Thanks [@odinr](https://github.com/odinr)! - - improved app event dispatch
  - added mapping for all app events

## 5.2.8

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3

## 5.2.7

### Patch Changes

- [#1305](https://github.com/equinor/fusion-framework/pull/1305) [`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9) Thanks [@odinr](https://github.com/odinr)! - fixed duplicate calls from flows

  alignment after changes to `@equinor/fusion-query`

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2

## 5.2.6

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-observable@8.1.2
  - @equinor/fusion-query@4.0.1

## 5.2.5

### Patch Changes

- Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-query@4.0.0

## 5.2.4

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
  - @equinor/fusion-observable@8.1.1
  - @equinor/fusion-query@3.0.7

## 5.2.3

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6

## 5.2.2

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-observable@8.1.0
  - @equinor/fusion-query@3.0.5

## 5.2.1

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 5.2.0

### Minor Changes

- [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - Create and expose interface for App

  - deprecate [AppModuleProvider.createApp](https://github.com/equinor/fusion-framework/blob/cf08d5ae3cef473e5025fd973a2a7a45a3b22dee/packages/modules/app/src/AppModuleProvider.ts#L171)

  this should not create any breaking changes since apps was only created from provider.
  if the class is still needed it can be imported:

  ```ts
  import { App } from "@equinor/fusion-framework-module-app/app";
  ```

- [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - Allow updating manifest of application

  - add meta data for `setManifest` action to flag if `merge` or `replace`
  - add method on `App` to update manifest, _default flag `merge`_
  - check in state reducer if `setManifest` action is `update` or `merge`
  - update flow `handleFetchManifest` to prop passing of flag

## 5.1.3

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@5.1.1...@equinor/fusion-framework-module-app@5.1.2) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 5.1.1 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 5.1.0 (2023-05-22)

### Features

- **module-app:** allow type hinting modules and env ([c80be46](https://github.com/equinor/fusion-framework/commit/c80be46c3c16a40b53506c29debfe6196ea7d945))

## 5.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 5.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 4.0.8 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.6...@equinor/fusion-framework-module-app@4.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.5...@equinor/fusion-framework-module-app@4.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.4...@equinor/fusion-framework-module-app@4.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.3...@equinor/fusion-framework-module-app@4.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@4.0.2...@equinor/fusion-framework-module-app@4.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 4.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 4.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.5...@equinor/fusion-framework-module-app@4.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.5...@equinor/fusion-framework-module-app@4.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.5 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [3.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.3...@equinor/fusion-framework-module-app@3.2.4) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [3.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@3.2.2...@equinor/fusion-framework-module-app@3.2.3) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.2 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.1 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 3.2.0 (2023-01-10)

### Features

- make app state sync ([c8b4567](https://github.com/equinor/fusion-framework/commit/c8b456743ff5b2b397ce928a1006936cb8de5488))

## 3.1.0 (2023-01-04)

### Features

- **module-app:** allow clearing current app ([c7f4c14](https://github.com/equinor/fusion-framework/commit/c7f4c144c29c2c40df42eafcdaabfb8214e1e88d))

## 3.0.0 (2023-01-04)

### ⚠ BREAKING CHANGES

- **module-app:** manifest prop rename

### Bug Fixes

- **module-app:** rename `appKey` to `key` ([9ee97b1](https://github.com/equinor/fusion-framework/commit/9ee97b149b9167a3747da371de76490e287d9514))

## 2.8.1 (2022-12-21)

### Bug Fixes

- **module-app:** fix typo ([7db0811](https://github.com/equinor/fusion-framework/commit/7db08113697761ecfa75b5684272e6244ec9e137))

## 2.8.0 (2022-12-21)

### Features

- **module-app:** expose current state of app ([accb084](https://github.com/equinor/fusion-framework/commit/accb08477416541beaa39574ff966ab2784ad430))

## [2.7.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.7.0...@equinor/fusion-framework-module-app@2.7.1) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.7.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.6.0...@equinor/fusion-framework-module-app@2.7.0) (2022-12-16)

### Features

- **module-app:** expose config builder ([ed0fe34](https://github.com/equinor/fusion-framework/commit/ed0fe34c6ba67c1487b1d4087a5bddb7e8eaf3c8))

### Bug Fixes

- **module-app:** fix import ([4b08ae1](https://github.com/equinor/fusion-framework/commit/4b08ae1ec2316142961d464b4be9346fc9403430))

## [2.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.5.0...@equinor/fusion-framework-module-app@2.6.0) (2022-12-16)

### Features

- **module-app:** add app events ([f302a89](https://github.com/equinor/fusion-framework/commit/f302a8986042567129737d181f376e0fded418f0))

## 2.5.0 (2022-12-14)

### Features

- **module-app:** update manifest interface ([ba740ef](https://github.com/equinor/fusion-framework/commit/ba740ef6f7a37eb72b1386d929cc27bf0530218a))

### Bug Fixes

- **module-app:** correct import and exports ([d9de2d7](https://github.com/equinor/fusion-framework/commit/d9de2d71cb2521fb4b38843e54a4928646294df8))
- **module-app:** fix key for fetching all manifest ([2df1815](https://github.com/equinor/fusion-framework/commit/2df18159d1128546b801c374f419b1e9528ca8c2))
- **module-app:** make app module optional ([fa5c0ed](https://github.com/equinor/fusion-framework/commit/fa5c0ed0a9afc1f9ade3adb6e52e4425a59a7aa6))

## [2.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.3.0...@equinor/fusion-framework-module-app@2.4.0) (2022-12-12)

### Features

- **module-app:** allow creating app instance ([d2d3080](https://github.com/equinor/fusion-framework/commit/d2d3080f4822fefca5df5a4a1ce46f138095d567))

## 2.3.0 (2022-12-12)

### Features

- **module-app:** add config builder ([0fe107c](https://github.com/equinor/fusion-framework/commit/0fe107c87a129c6e63044e6298914cdfc4e0d626))

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.6...@equinor/fusion-framework-module-app@2.2.0) (2022-12-12)

### Features

- create instance container for application ([d5cbd74](https://github.com/equinor/fusion-framework/commit/d5cbd74b89cd9cba0dabef4a62f585c72e3c14be))
- **module-app:** load javascript modules ([bb3d2a1](https://github.com/equinor/fusion-framework/commit/bb3d2a1cb00b5753462094ebdf24c8ba3c614c9f))

## [2.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.5...@equinor/fusion-framework-module-app@2.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.4...@equinor/fusion-framework-module-app@2.1.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.3...@equinor/fusion-framework-module-app@2.1.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.2...@equinor/fusion-framework-module-app@2.1.3) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.1...@equinor/fusion-framework-module-app@2.1.2) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.1.0...@equinor/fusion-framework-module-app@2.1.1) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.0.1...@equinor/fusion-framework-module-app@2.1.0) (2022-12-05)

### Features

- **context-selector:** header type contextselector and appcheck ([8ab0a50](https://github.com/equinor/fusion-framework/commit/8ab0a50e3f7ea3487796735c868f2e65d84fecd2))

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.0.1...@equinor/fusion-framework-module-app@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@2.0.0...@equinor/fusion-framework-module-app@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.11...@equinor/fusion-framework-module-app@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.11...@equinor/fusion-framework-module-app@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.10...@equinor/fusion-framework-module-app@1.5.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.9...@equinor/fusion-framework-module-app@1.5.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.8...@equinor/fusion-framework-module-app@1.5.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.7...@equinor/fusion-framework-module-app@1.5.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.6...@equinor/fusion-framework-module-app@1.5.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.5...@equinor/fusion-framework-module-app@1.5.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.4...@equinor/fusion-framework-module-app@1.5.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.3...@equinor/fusion-framework-module-app@1.5.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.2...@equinor/fusion-framework-module-app@1.5.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.1...@equinor/fusion-framework-module-app@1.5.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.5.0...@equinor/fusion-framework-module-app@1.5.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.4.4...@equinor/fusion-framework-module-app@1.5.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 1.4.4 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.4.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.4.2...@equinor/fusion-framework-module-app@1.4.3) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.4.2 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.4.0...@equinor/fusion-framework-module-app@1.4.1) (2022-11-18)

### Bug Fixes

- **module-app:** fallback to portal ([6778624](https://github.com/equinor/fusion-framework/commit/67786241c809e27d60a2411dd6bffba315d5f3a3))

## 1.4.0 (2022-11-17)

### Features

- **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.3.0...@equinor/fusion-framework-module-app@1.3.1) (2022-11-14)

### Bug Fixes

- **module-app:** throw error when config or app not loading ([e4bd23a](https://github.com/equinor/fusion-framework/commit/e4bd23a4071bd68334aeaed9ed9ea12cac93222c))

## 1.3.0 (2022-11-14)

### Features

- **module-app:** add app loader ([0ef0b71](https://github.com/equinor/fusion-framework/commit/0ef0b71de27f1dccc757aa7eceea558072a1db60))

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.6...@equinor/fusion-framework-module-app@1.2.0) (2022-11-14)

### Features

- update packages to use observable ([98024aa](https://github.com/equinor/fusion-framework/commit/98024aa466c68f03bd793bd564cf7b6bf65def72))

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.5...@equinor/fusion-framework-module-app@1.1.6) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.4...@equinor/fusion-framework-module-app@1.1.5) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.1.4 (2022-11-11)

### Bug Fixes

- **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 1.1.3 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.1.1...@equinor/fusion-framework-module-app@1.1.2) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.1.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.1.0 (2022-11-01)

### Features

- **module-app:** initial app module ([ce5aed1](https://github.com/equinor/fusion-framework/commit/ce5aed124431afbe55b9cf11a50a5c8d5499260e))

## 1.0.12 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.11 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.9...@equinor/fusion-framework-module-app@1.0.10) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.9 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.7...@equinor/fusion-framework-module-app@1.0.8) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.7 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.6 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.4...@equinor/fusion-framework-module-app@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.3...@equinor/fusion-framework-module-app@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.2...@equinor/fusion-framework-module-app@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.1...@equinor/fusion-framework-module-app@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.1-next.1...@equinor/fusion-framework-module-app@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.1-next.0...@equinor/fusion-framework-module-app@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@1.0.0...@equinor/fusion-framework-module-app@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.17...@equinor/fusion-framework-module-app@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.17 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.16 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.15 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.13...@equinor/fusion-framework-module-app@0.1.14) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.13 (2022-08-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.11...@equinor/fusion-framework-module-app@0.1.12) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.11 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.9...@equinor/fusion-framework-module-app@0.1.10) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.8...@equinor/fusion-framework-module-app@0.1.9) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.7...@equinor/fusion-framework-module-app@0.1.8) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.6...@equinor/fusion-framework-module-app@0.1.7) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.5...@equinor/fusion-framework-module-app@0.1.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-app@0.1.4...@equinor/fusion-framework-module-app@0.1.5) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.4 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.3 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.2 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-app

# 0.1.0 (2022-02-07)

### Features

- add module for application loading ([61d4e5f](https://github.com/equinor/fusion-framework/commit/61d4e5fa0df6308155bf830e68d902cecb8146c2))

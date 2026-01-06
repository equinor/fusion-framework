# Change Log

## 8.0.1-cli-search-index.1

### Patch Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50) Thanks [@odinr](https://github.com/odinr)! - preview before pr

- Updated dependencies [[`fd26636`](https://github.com/equinor/fusion-framework/commit/fd266363fc6d0445733b16a9e25b303ec6fe4a50)]:
  - @equinor/fusion-framework-react-module@3.1.14-cli-search-index.1
  - @equinor/fusion-framework-module-navigation@6.0.1-cli-search-index.1
  - @equinor/fusion-framework-react-module-http@10.0.1-cli-search-index.1
  - @equinor/fusion-framework-react@7.4.20-cli-search-index.1
  - @equinor/fusion-framework-module@5.0.6-cli-search-index.1
  - @equinor/fusion-framework-module-msal@6.0.5-cli-search-index.0
  - @equinor/fusion-framework-module-app@7.2.2-cli-search-index.0
  - @equinor/fusion-framework-app@10.1.3-cli-search-index.1

## 8.1.1

### Patch Changes

- [#3845](https://github.com/equinor/fusion-framework/pull/3845) [`5114ac4`](https://github.com/equinor/fusion-framework/commit/5114ac4f71a60935d0194b9b2766f95adff0ba1e) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Fix tsconfig references

- Updated dependencies [[`5114ac4`](https://github.com/equinor/fusion-framework/commit/5114ac4f71a60935d0194b9b2766f95adff0ba1e)]:
  - @equinor/fusion-framework-module-app@7.2.1
  - @equinor/fusion-framework-app@10.2.1

## 8.1.0

### Minor Changes

- [#3842](https://github.com/equinor/fusion-framework/pull/3842) [`d38cd60`](https://github.com/equinor/fusion-framework/commit/d38cd60472380d60282c2a5672dc6e3bba3e7ca9) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add module fusion-framework-module-analytics

### Patch Changes

- Updated dependencies [[`d38cd60`](https://github.com/equinor/fusion-framework/commit/d38cd60472380d60282c2a5672dc6e3bba3e7ca9)]:
  - @equinor/fusion-framework-module-app@7.2.0
  - @equinor/fusion-framework-app@10.2.0

## 8.0.0

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Fix MSAL v4 compatibility issues in React app hooks.

  - Update useCurrentAccount to use account property instead of deprecated defaultAccount
  - Fix useToken hook to properly handle AcquireTokenResult type
  - Ensure proper null/undefined handling for account information

  These changes ensure React app hooks work correctly with MSAL v4 while maintaining backward compatibility.

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Update React App useToken hook to use new MSAL token acquisition API format.

  Internal implementation change to adapt to MSAL interface updates. React App hooks continue to work the same way for consumers.

  Why: Ensures compatibility with updated MSAL module API.

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-msal@6.0.0
  - @equinor/fusion-framework-react@7.4.19
  - @equinor/fusion-framework-app@10.1.2
  - @equinor/fusion-framework-module-app@7.1.0

## 7.0.1

### Patch Changes

- [#3625](https://github.com/equinor/fusion-framework/pull/3625) [`b55c08b`](https://github.com/equinor/fusion-framework/commit/b55c08b59635fca51ba643f9081321514d306911) Thanks [@odinr](https://github.com/odinr)! - Fix React hooks dependency arrays in useHelpCenter to prevent exhaustive dependencies linting errors.

  Changed dependency arrays from `[eventModule.dispatchEvent]` to `[eventModule]` in all useCallback hooks to properly track all dependencies used within the callbacks.

- Updated dependencies [[`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be)]:
  - @equinor/fusion-framework-module@5.0.4
  - @equinor/fusion-framework-module-msal@5.1.1
  - @equinor/fusion-framework-app@10.1.1

## 7.0.0

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-app@7.0.0
  - @equinor/fusion-framework-module-msal@5.0.0
  - @equinor/fusion-framework-app@10.0.0
  - @equinor/fusion-framework-react@7.4.18
  - @equinor/fusion-framework-react-module-http@10.0.0

## 6.2.7

### Patch Changes

- [#3322](https://github.com/equinor/fusion-framework/pull/3322) [`d362359`](https://github.com/equinor/fusion-framework/commit/d362359507e7c55f568ede09cc8e66feb197596a) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - Added `openReleaseNotes` flag for `useHelpCenter` hook in `@equinor/fusion-framework-react-app`

## 6.2.6

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Refactored the `Bookmark` type to be an intersection of `BookmarkWithoutData` and an optional `payload` property, improving type safety and flexibility. Updated `useBookmarkNavigate` to use proper TypeScript typing for bookmark events.

  **Module Bookmark Changes:**

  - Refactored `Bookmark` type in `packages/modules/bookmark/src/types.ts`
  - Added export for `BookmarkProviderEvents` type in `packages/modules/bookmark/src/index.ts`
  - Updated JSDoc comment from `@note` to `@remarks` in `packages/modules/bookmark/src/BookmarkClient.ts`
  - Reordered tsconfig references (event before services)

  **React Changes:**

  - Updated `packages/react/modules/bookmark/src/portal/useBookmarkNavigate.ts` to use proper TypeScript typing for bookmark provider events
  - Removed React paths configuration from `packages/react/app/tsconfig.json`

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-framework-module-app@6.1.17
  - @equinor/fusion-framework-module-msal@4.0.8
  - @equinor/fusion-framework-app@9.3.22
  - @equinor/fusion-framework-module-navigation@6.0.0
  - @equinor/fusion-framework-react@7.4.17
  - @equinor/fusion-framework-react-module@3.1.13

## 6.2.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.21
  - @equinor/fusion-framework-react@7.4.16

## 6.2.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.20

## 6.2.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.19

## 6.2.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.18

## 6.2.1

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-navigation@5.0.3
  - @equinor/fusion-framework-react@7.4.15
  - @equinor/fusion-framework-module-msal@4.0.7
  - @equinor/fusion-framework-module-app@6.1.16
  - @equinor/fusion-framework-app@9.3.17
  - @equinor/fusion-framework-react-module-http@9.0.3

## 6.2.0

### Minor Changes

- [#3039](https://github.com/equinor/fusion-framework/pull/3039) [`bfa2317`](https://github.com/equinor/fusion-framework/commit/bfa2317c1d23bd606fdbc2e9857b0be69b08e720) Thanks [@eikeland](https://github.com/eikeland)! - `@equinor/fusion-framework-react-app/fusion-apploader`

  [FusionApploader](#fusionapploader) component and [useFusionApploader](#usefusionapploader) is intended to be used to embed Fusion applications inside other Fusion application.

  > [!WARNING] > `FusionApploader` is an experimental poc.
  >
  > The embedded application will likely have issues with routing, context and other framework functionality, so use with care.
  >
  > Should only be used to embed 'simple' applications like **PowerBI** and **PowerApps**.

  ## FusionApploader

  React component for embeding a Fusion child application inside a parent Fusion application.

  Handles loading and error states, and mounts the child app's DOM element into a container div.

  If you need to customise the error and loading messages, then use the hook `useFusionApploader` and create your own component.

  ### Example usage

  ```typescript
  <FusionApploader appKey="my-app" />
  ```

  ## useFusionApploader

  A React hook for dynamically loading and mounting a Fusion child app inside a parent Fusion app. Handles loading state, error reporting, and provides a reference to the mounted app’s DOM element.

  ### Signature

  ```typescript
  useFusionApploader({ appKey }: { appKey: string }): {
    loading: boolean;
    error: Error | undefined;
    appRef: React.RefObject<HTMLDivElement | null>;
  }
  ```

  ### Parameters

  `appKey (string)`: The key of the Fusion app to load and mount.

  ### Returns

  - **loading** `(boolean)`: true while the app is loading.
  - **error** `(Error | undefined)`: Error object if loading fails, otherwise undefined.
  - **appRef** `(React.RefObject<HTMLDivElement | null>)`: Ref to the DOM element where the child app is mounted.

  ### Usage Example

  ```typescript
  import React, { useEffect, useRef } from "react";
  import { useFusionApploader } from "./useFusionAppLoader";

  const MyAppLoader = ({ appKey }: { appKey: string }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const { loading, error, appRef } = useFusionApploader({ appKey });

    useEffect(() => {
      if (wrapperRef.current && appRef.current) {
        wrapperRef.current.appendChild(appRef.current);
      }
    }, [appRef.current]);

    if (loading) return <div>Loading {appKey}...</div>;
    if (error)
      return (
        <div>
          Error loading {appKey}: {error.message}
        </div>
      );

    return <div ref={wrapperRef} />;
  };
  ```

  ### Notes

  - The hook is designed to be used in a parent Fusion app context.
  - The returned appRef should be appended to a container element in your component.
  - Handles subscription and cleanup automatically.
  - Useful for micro-frontend scenarios where apps are loaded dynamically.

## 6.1.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@6.1.15
  - @equinor/fusion-framework-react@7.4.14
  - @equinor/fusion-framework-app@9.3.16

## 6.1.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@6.1.14
  - @equinor/fusion-framework-react@7.4.13
  - @equinor/fusion-framework-app@9.3.15

## 6.1.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.14
  - @equinor/fusion-framework-react@7.4.12

## 6.1.4

### Patch Changes

- [#3060](https://github.com/equinor/fusion-framework/pull/3060) [`35cbd12`](https://github.com/equinor/fusion-framework/commit/35cbd12b3ca6d42b0b8b6f8a40dd500fcd1e3672) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add comments to the `useHelpCenter` hook

## 6.1.3

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module-navigation@5.0.2
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-framework-module-app@6.1.13
  - @equinor/fusion-framework-react@7.4.11
  - @equinor/fusion-framework-app@9.3.13
  - @equinor/fusion-framework-module-msal@4.0.6
  - @equinor/fusion-framework-react-module@3.1.12
  - @equinor/fusion-framework-react-module-http@9.0.2

## 6.1.2

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-framework-module-navigation@5.0.1
  - @equinor/fusion-framework-react@7.4.10
  - @equinor/fusion-framework-module-msal@4.0.5
  - @equinor/fusion-framework-module-app@6.1.12
  - @equinor/fusion-framework-app@9.3.12
  - @equinor/fusion-framework-react-module@3.1.11
  - @equinor/fusion-framework-react-module-http@9.0.1

## 6.1.1

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-app@9.3.11
  - @equinor/fusion-framework-module-app@6.1.11
  - @equinor/fusion-framework-module-msal@4.0.4
  - @equinor/fusion-framework-module-navigation@5.0.0
  - @equinor/fusion-framework-react@7.4.9
  - @equinor/fusion-framework-react-module@3.1.10
  - @equinor/fusion-framework-react-module-http@9.0.0

## 6.1.0

### Minor Changes

- [#3029](https://github.com/equinor/fusion-framework/pull/3029) [`a297265`](https://github.com/equinor/fusion-framework/commit/a29726554526a4feb6e41c6a9d9db5a4f2b01d3d) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add `useHelpCenter` hook to programmatically be able to open help side sheet.

## 6.0.10

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-navigation@4.0.10
  - @equinor/fusion-framework-react@7.4.8
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-msal@4.0.3
  - @equinor/fusion-framework-module-app@6.1.10
  - @equinor/fusion-framework-app@9.3.10
  - @equinor/fusion-framework-react-module@3.1.9
  - @equinor/fusion-framework-react-module-http@8.0.5

## 6.0.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.9
  - @equinor/fusion-framework-react@7.4.7

## 6.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.8
  - @equinor/fusion-framework-module-app@6.1.9
  - @equinor/fusion-framework-react@7.4.6

## 6.0.7

### Patch Changes

- [#2955](https://github.com/equinor/fusion-framework/pull/2955) [`6f104e2`](https://github.com/equinor/fusion-framework/commit/6f104e2ed191e77c6127376e035bbf7af80f166b) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - - Add env to 'onReactAppLoaded' event
  - Prevent context provider change if app key is not current app for 'onReactAppLoaded'
- Updated dependencies [[`5139102`](https://github.com/equinor/fusion-framework/commit/5139102838c30f73f3fcbc81fb6e78814f86445c)]:
  - @equinor/fusion-framework-react@7.4.5
  - @equinor/fusion-framework-app@9.3.7
  - @equinor/fusion-framework-module-app@6.1.8
  - @equinor/fusion-framework-react-module-http@8.0.4

## 6.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.6
  - @equinor/fusion-framework-react@7.4.4

## 6.0.5

### Patch Changes

- Updated dependencies [[`e3de5fa`](https://github.com/equinor/fusion-framework/commit/e3de5fa01528705f8032f673bb03fe48ac97a152)]:
  - @equinor/fusion-framework-module-app@6.1.8
  - @equinor/fusion-framework-app@9.3.5
  - @equinor/fusion-framework-react@7.4.3

## 6.0.4

### Patch Changes

- Updated dependencies [[`378f897`](https://github.com/equinor/fusion-framework/commit/378f89707a357d165b84ea82b74147b7f0d87f52)]:
  - @equinor/fusion-framework-module-app@6.1.7
  - @equinor/fusion-framework-app@9.3.4
  - @equinor/fusion-framework-react@7.4.3

## 6.0.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-react-module@3.1.8
  - @equinor/fusion-framework-module-navigation@4.0.9
  - @equinor/fusion-framework-react-module-http@8.0.3
  - @equinor/fusion-framework-react@7.4.3
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-msal@4.0.2
  - @equinor/fusion-framework-module-app@6.1.6
  - @equinor/fusion-framework-app@9.3.3

## 6.0.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.2
  - @equinor/fusion-framework-react@7.4.2

## 6.0.1

### Patch Changes

- [#2855](https://github.com/equinor/fusion-framework/pull/2855) [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1) Thanks [@odinr](https://github.com/odinr)! - Conformed to Biome `linter.correctness.useExhaustiveDependencies`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`68b180c`](https://github.com/equinor/fusion-framework/commit/68b180c687ad1939d4f3df185c634f5046a55f63), [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`6efabb7`](https://github.com/equinor/fusion-framework/commit/6efabb7837a97319e976e122db855d8b88b031a6), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-app@6.1.5
  - @equinor/fusion-framework-module-navigation@4.0.8
  - @equinor/fusion-framework-react-module@3.1.7
  - @equinor/fusion-framework-module-msal@4.0.1
  - @equinor/fusion-framework-react@7.4.1
  - @equinor/fusion-framework-app@9.3.1
  - @equinor/fusion-framework-react-module-http@8.0.2

## 6.0.0

### Minor Changes

- [#2814](https://github.com/equinor/fusion-framework/pull/2814) [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa) Thanks [@odinr](https://github.com/odinr)! - Update implementation of hook `useToken` and `useAccessToken`, to consume new MSAL provider interface.

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa), [`4578b18`](https://github.com/equinor/fusion-framework/commit/4578b1835b70bd0869441c8fcf6d188f6440f192), [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa), [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
  - @equinor/fusion-framework-module-msal@4.0.0
  - @equinor/fusion-framework-app@9.3.0
  - @equinor/fusion-framework-react@7.4.0
  - @equinor/fusion-framework-module-app@6.1.4
  - @equinor/fusion-framework-react-module-http@8.0.1

## 5.5.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@6.1.4
  - @equinor/fusion-framework-react@7.3.8
  - @equinor/fusion-framework-app@9.2.3

## 5.5.3

### Patch Changes

- [#2687](https://github.com/equinor/fusion-framework/pull/2687) [`22219ab`](https://github.com/equinor/fusion-framework/commit/22219ab3c07b5578c48a012632fe16d9a823a3bf) Thanks [@odinr](https://github.com/odinr)! - - Added hook for using theme in ag-grid
  - Fixed issue with export types of bookmarks

## 5.5.2

### Patch Changes

- Updated dependencies [[`50a8966`](https://github.com/equinor/fusion-framework/commit/50a8966d64544a34b386307b690e0ecbf8baaead)]:
  - @equinor/fusion-framework-app@9.2.2

## 5.5.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.2.1
  - @equinor/fusion-framework-module-app@6.1.3
  - @equinor/fusion-framework-react@7.3.7

## 5.5.0

### Minor Changes

- [#2691](https://github.com/equinor/fusion-framework/pull/2691) [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb) Thanks [@odinr](https://github.com/odinr)! - Added a enabler function for application to use bookmark module

### Patch Changes

- Updated dependencies [[`83a7ee9`](https://github.com/equinor/fusion-framework/commit/83a7ee971785343bccedc2d72cc02486193615af), [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb)]:
  - @equinor/fusion-framework-module-app@6.1.3
  - @equinor/fusion-framework-app@9.2.0
  - @equinor/fusion-framework-react@7.3.6

## 5.4.2

### Patch Changes

- Updated dependencies [[`add2e98`](https://github.com/equinor/fusion-framework/commit/add2e98d23e683a801729e9af543cfa15c574e27)]:
  - @equinor/fusion-framework-module-app@6.1.2
  - @equinor/fusion-framework-app@9.1.17
  - @equinor/fusion-framework-react@7.3.5

## 5.4.1

### Patch Changes

- Updated dependencies [[`59ab642`](https://github.com/equinor/fusion-framework/commit/59ab6424f3ce80649f42ddb6804b46f6789607ba)]:
  - @equinor/fusion-framework-module-app@6.1.1
  - @equinor/fusion-framework-app@9.1.16
  - @equinor/fusion-framework-react@7.3.4

## 5.4.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [[`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982), [`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982)]:
  - @equinor/fusion-framework-module-app@6.1.0
  - @equinor/fusion-framework-app@9.1.15
  - @equinor/fusion-framework-react@7.3.3

## 5.3.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.14
  - @equinor/fusion-framework-react@7.3.3
  - @equinor/fusion-framework-module-app@6.0.3

## 5.3.0

### Minor Changes

- [#2410](https://github.com/equinor/fusion-framework/pull/2410) [`9d1cb90`](https://github.com/equinor/fusion-framework/commit/9d1cb9003fa10e7ccaa95c20ef86f0a618034641) Thanks [@odinr](https://github.com/odinr)! - Updated bookmark namespace in `@equinor/fusion-react-app` to include new hooks and updated `useCurrentBookmark` hook.

  - Updated `index.ts` to re-export everything from `@equinor/fusion-framework-react-module-bookmark` instead of individual exports.
  - Marked `useBookmark` as deprecated in `useBookmark.ts`.
  - Enhanced `useCurrentBookmark` in `useCurrentBookmark.ts` to accept a `BookmarkPayloadGenerator` and use the `BookmarkModule` from `useAppModule`.

  **NOTE**: This change is backwards compatible and should not require any changes in consuming applications.
  **NOTE**: `useBookmark` will be removed in the next major version. Please use providers and hooks from `@equinor/fusion-framework-react-module-bookmark` instead.

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.13
  - @equinor/fusion-framework-react@7.3.2

## 5.2.12

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.12
  - @equinor/fusion-framework-react@7.3.1
  - @equinor/fusion-framework-module-app@6.0.2

## 5.2.11

### Patch Changes

- Updated dependencies [[`248ee1f`](https://github.com/equinor/fusion-framework/commit/248ee1f83978a158dfb88dd47d8e8bcaac0e3574)]:
  - @equinor/fusion-framework-module-app@6.0.1
  - @equinor/fusion-framework-app@9.1.11
  - @equinor/fusion-framework-react@7.3.0

## 5.2.10

### Patch Changes

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

- Updated dependencies [[`e11ad64`](https://github.com/equinor/fusion-framework/commit/e11ad64a42210443bdfd9ab9eb2fb95e7e345251)]:
  - @equinor/fusion-framework-module-app@6.0.0
  - @equinor/fusion-framework-react@7.3.0
  - @equinor/fusion-framework-app@9.1.10

## 5.2.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.9
  - @equinor/fusion-framework-module-app@5.3.11
  - @equinor/fusion-framework-react-module-http@8.0.0
  - @equinor/fusion-framework-react@7.2.3

## 5.2.8

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module@4.3.5
  - @equinor/fusion-framework-app@9.1.8
  - @equinor/fusion-framework-module-app@5.3.11
  - @equinor/fusion-framework-react-module-http@7.0.0
  - @equinor/fusion-framework-module-msal@3.1.5
  - @equinor/fusion-framework-module-navigation@4.0.7
  - @equinor/fusion-framework-react@7.2.2
  - @equinor/fusion-framework-react-module@3.1.6

## 5.2.7

### Patch Changes

- Updated dependencies [[`80cc4e9`](https://github.com/equinor/fusion-framework/commit/80cc4e95a8f2dd8e8aae9752412faefdb457e9e2)]:
  - @equinor/fusion-framework-module-navigation@4.0.6
  - @equinor/fusion-framework-module-app@5.3.11
  - @equinor/fusion-framework-react@7.2.1
  - @equinor/fusion-framework-app@9.1.7

## 5.2.6

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9), [`843edd9`](https://github.com/equinor/fusion-framework/commit/843edd96f2a01ebd814766105902977cdc1cdf8e)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-framework-react@7.2.0
  - @equinor/fusion-framework-app@9.1.6
  - @equinor/fusion-framework-module-app@5.3.10
  - @equinor/fusion-framework-module-msal@3.1.4
  - @equinor/fusion-framework-module-navigation@4.0.5
  - @equinor/fusion-framework-react-module@3.1.5
  - @equinor/fusion-framework-react-module-http@6.0.3

## 5.2.5

### Patch Changes

- Updated dependencies [[`1a215c4`](https://github.com/equinor/fusion-framework/commit/1a215c45c97d2dfdc8127dc752ec21951bb048be), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module-navigation@4.0.4
  - @equinor/fusion-framework-module@4.3.3
  - @equinor/fusion-framework-module-app@5.3.9
  - @equinor/fusion-framework-react@7.1.4
  - @equinor/fusion-framework-app@9.1.5
  - @equinor/fusion-framework-react-module-http@6.0.2
  - @equinor/fusion-framework-module-msal@3.1.3
  - @equinor/fusion-framework-react-module@3.1.4

## 5.2.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.4
  - @equinor/fusion-framework-module-app@5.3.8
  - @equinor/fusion-framework-react@7.1.3

## 5.2.3

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
  - @equinor/fusion-framework-react-module@3.1.3
  - @equinor/fusion-framework-module-navigation@4.0.3
  - @equinor/fusion-framework-react-module-http@6.0.1
  - @equinor/fusion-framework-react@7.1.2
  - @equinor/fusion-framework-module-msal@3.1.2
  - @equinor/fusion-framework-module-app@5.3.8
  - @equinor/fusion-framework-app@9.1.3

## 5.2.2

### Patch Changes

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb), [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526)]:
  - @equinor/fusion-framework-module-app@5.3.7
  - @equinor/fusion-framework-react@7.1.1
  - @equinor/fusion-framework-app@9.1.2

## 5.2.1

### Patch Changes

- Updated dependencies [[`b8d52ad`](https://github.com/equinor/fusion-framework/commit/b8d52adb2ca1f9857c672a3deb774409ff2bdb37)]:
  - @equinor/fusion-framework-app@9.1.1

## 5.2.0

### Minor Changes

- [#2181](https://github.com/equinor/fusion-framework/pull/2181) [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8) Thanks [@odinr](https://github.com/odinr)! - If you were previously using the `blob` or `blob# Change Log methods from the `IHttpClient`and expecting a`Blob`result, you must now use the new`BlobResult` type, which includes the filename (if available) and the blob data.

  **Migration Guide:**

  ```typescript
  // Before
  const blob = await httpClient.blob("/path/to/blob");
  console.log(blob); // Blob instance

  // After
  const blobResult = await httpClient.blob<Blob>("/path/to/blob");
  console.log(blobResult.filename); // 'example.pdf'
  console.log(blobResult.blob); // Blob instance
  ```

### Patch Changes

- Updated dependencies [[`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
  - @equinor/fusion-framework-app@9.1.0
  - @equinor/fusion-framework-react@7.1.0
  - @equinor/fusion-framework-module-app@5.3.6
  - @equinor/fusion-framework-react-module-http@6.0.0

## 5.1.0

### Minor Changes

- [#2180](https://github.com/equinor/fusion-framework/pull/2180) [`060a1aa`](https://github.com/equinor/fusion-framework/commit/060a1aa7f4f2ce6b1ddef527a219bf267e488500) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-react

  ### What changed?

  The `useAppEnvironmentVariables` hook has been added to the `@equinor/fusion-react` package.
  This hook provides access to the application's environment variables, which are retrieved from the app module provided by the framework.

  ### Why the change?

  Previously, there was no built-in way to access the application's environment variables from the React components.
  This new hook fills that gap, making it easier for developers to retrieve and use the environment configuration in their applications.

  ### How to use the new feature

  To use the `useAppEnvironmentVariables` hook, simply import it and call it in your React component:

  ```typescript
  import { useAppEnvironmentVariables } from "@equinor/fusion-react";

  const MyComponent = () => {
    const env = useAppEnvironmentVariables<{ API_URL: string }>();

    if (!env.complete) {
      return <div>Loading environment variables...</div>;
    }

    if (env.error) {
      return <div>Error loading environment variables</div>;
    }

    return (
      <div>My environment variables: {JSON.stringify(env.value, null, 2)}</div>
    );
  };
  ```

  The hook returns an observable state object that represents the current environment configuration.
  The `value` property of this object contains the environment variables, which can be typed using a generic type parameter.

  If the environment configuration is not yet available (e.g., during the initial load), the `complete` property will be `false`.
  If there was an error retrieving the configuration, the `error` property will be set.

  ### Migration guide

  There are no breaking changes introduced with this feature. Developers can start using the `useAppEnvironmentVariables` hook immediately to access their application's environment variables.

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-framework-app@9.0.9
  - @equinor/fusion-framework-module-app@5.3.5
  - @equinor/fusion-framework-module-msal@3.1.1
  - @equinor/fusion-framework-module-navigation@4.0.2
  - @equinor/fusion-framework-react@7.0.8
  - @equinor/fusion-framework-react-module@3.1.2
  - @equinor/fusion-framework-react-module-http@5.0.4

## 5.0.11

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.3.4
  - @equinor/fusion-framework-app@9.0.8
  - @equinor/fusion-framework-react@7.0.7

## 5.0.10

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.3.3
  - @equinor/fusion-framework-app@9.0.7
  - @equinor/fusion-framework-react@7.0.6

## 5.0.9

### Patch Changes

- [#2096](https://github.com/equinor/fusion-framework/pull/2096) [`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5) Thanks [@odinr](https://github.com/odinr)! - update documentation

- Updated dependencies [[`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5)]:
  - @equinor/fusion-framework-module-navigation@4.0.1
  - @equinor/fusion-framework-module-app@5.3.2
  - @equinor/fusion-framework-app@9.0.6
  - @equinor/fusion-framework-react@7.0.5

## 5.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.0.5
  - @equinor/fusion-framework-module-app@5.3.1
  - @equinor/fusion-framework-react-module-http@5.0.3
  - @equinor/fusion-framework-react@7.0.4

## 5.0.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.3.1
  - @equinor/fusion-framework-react@7.0.3
  - @equinor/fusion-framework-app@9.0.4

## 5.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.0.3
  - @equinor/fusion-framework-module-app@5.3.0
  - @equinor/fusion-framework-react-module-http@5.0.2
  - @equinor/fusion-framework-react@7.0.2

## 5.0.5

### Patch Changes

- Updated dependencies [[`036ec15`](https://github.com/equinor/fusion-framework/commit/036ec151ace9c051ded41798ab94b8ee5e3d4461)]:
  - @equinor/fusion-framework-app@9.0.2

## 5.0.4

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-react-module@3.1.1
  - @equinor/fusion-framework-react@7.0.1
  - @equinor/fusion-framework-app@9.0.1
  - @equinor/fusion-framework-react-module-http@5.0.1
  - @equinor/fusion-framework-module-app@5.3.0

## 5.0.3

### Patch Changes

- [#1963](https://github.com/equinor/fusion-framework/pull/1963) [`e0b95f1`](https://github.com/equinor/fusion-framework/commit/e0b95f1879ecfc108987073a58c3c3150c156aa8) Thanks [@eikeland](https://github.com/eikeland)! - Fixes type exports in package

## 5.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-react-module@3.1.0
  - @equinor/fusion-framework-module-navigation@4.0.0
  - @equinor/fusion-framework-react-module-http@5.0.0
  - @equinor/fusion-framework-react@7.0.0
  - @equinor/fusion-framework-module-msal@3.1.0
  - @equinor/fusion-framework-module-app@5.3.0
  - @equinor/fusion-framework-app@9.0.0

## 4.3.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@8.1.4
  - @equinor/fusion-framework-react@6.0.5

## 4.3.7

### Patch Changes

- Updated dependencies [[`2acd475`](https://github.com/equinor/fusion-framework/commit/2acd47532fe680f498fdf7229309cddb2594e391)]:
  - @equinor/fusion-framework-module-app@5.2.14
  - @equinor/fusion-framework-app@8.1.3
  - @equinor/fusion-framework-react@6.0.4

## 4.3.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react@6.0.3
  - @equinor/fusion-framework-app@8.1.2

## 4.3.5

### Patch Changes

- [#1852](https://github.com/equinor/fusion-framework/pull/1852) [`bdc50b0`](https://github.com/equinor/fusion-framework/commit/bdc50b035b9c20301105d17509937ff3d91ea027) Thanks [@odinr](https://github.com/odinr)! - chore: add missing exported type

## 4.3.4

### Patch Changes

- [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Exposing Widget for app development.

## 4.3.3

### Patch Changes

- Updated dependencies [[`2a813bc`](https://github.com/equinor/fusion-framework/commit/2a813bc0a32f53e7515f16f8b5cba1cf1e5018a3), [`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-react@6.0.2
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-app@8.1.1
  - @equinor/fusion-framework-module-app@5.2.13
  - @equinor/fusion-framework-module-msal@3.0.10
  - @equinor/fusion-framework-module-navigation@3.1.4
  - @equinor/fusion-framework-react-module@3.0.8
  - @equinor/fusion-framework-react-module-http@4.0.6

## 4.3.2

### Patch Changes

- [#1781](https://github.com/equinor/fusion-framework/pull/1781) [`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9) Thanks [@odinr](https://github.com/odinr)! - Added functionality for enabling feature flagging

  ```ts
  import { enableFeatureFlag } from `@equinor/fusion-framework-react-app/feature-flag`
  enableFeatureFlag(confgurator, [{
    id: 'my-flag',
    title: 'My flag'
  }])
  ```

  the user still needs to install `@equinor/fusion-framework-module-feature-flag`

- Updated dependencies [[`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9)]:
  - @equinor/fusion-framework-app@8.1.0

## 4.3.1

### Patch Changes

- Updated dependencies [[`1ca8264`](https://github.com/equinor/fusion-framework/commit/1ca826489a0d1dd755324344a12bbf6659a3be12), [`fdbe12f`](https://github.com/equinor/fusion-framework/commit/fdbe12f258aeb98d91094f16f2d8ce229d7b13ee)]:
  - @equinor/fusion-framework-module-app@5.2.13
  - @equinor/fusion-framework-react@6.0.1
  - @equinor/fusion-framework-app@8.0.1

## 4.3.0

### Minor Changes

- [#1747](https://github.com/equinor/fusion-framework/pull/1747) [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e) Thanks [@odinr](https://github.com/odinr)! - refactor hook for accessing feature flags

  > [!IMPORTANT]
  > the `useFeature` hook look for flag in parent **(portal)** if not defined in application scope

  > [!CAUTION] > `@equinor/fusion-framework-react-app/feature-flag` will only return `useFeature`, since we don not see any scenario which an application would need to access multiple.
  > We might add `useFeatures` if the should be an use-case

### Patch Changes

- Updated dependencies [[`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e), [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e)]:
  - @equinor/fusion-framework-app@8.0.0
  - @equinor/fusion-framework-react@6.0.0

## 4.2.1

### Patch Changes

- [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - Adding PersonSidesheet to cli with featuretoggler

- Updated dependencies []:
  - @equinor/fusion-framework-react@5.3.9

## 4.2.0

### Minor Changes

- [#1646](https://github.com/equinor/fusion-framework/pull/1646) [`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1) Thanks [@odinr](https://github.com/odinr)! - Created namespace for MSAL:

  - Created hooks for accessing current authenticated account
  - Created hooks for acquiring token
  - Created hooks for acquiring access token

### Patch Changes

- Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
  - @equinor/fusion-framework-module-msal@3.0.9
  - @equinor/fusion-framework-app@7.1.15
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-react@5.3.8
  - @equinor/fusion-framework-react-module-http@4.0.5

## 4.1.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@7.1.14
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-react-module-http@4.0.4
  - @equinor/fusion-framework-react@5.3.7

## 4.1.18

### Patch Changes

- Updated dependencies [[`cce198d`](https://github.com/equinor/fusion-framework/commit/cce198d6a91fb7912265d4383246dc405cf17a17), [`f85316f`](https://github.com/equinor/fusion-framework/commit/f85316f2344258896a77ef602bd4047dfa553788)]:
  - @equinor/fusion-framework-react-module-http@4.0.3
  - @equinor/fusion-framework-app@7.1.13
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-react@5.3.6

## 4.1.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-react@5.3.5
  - @equinor/fusion-framework-app@7.1.12

## 4.1.16

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-navigation@3.1.3
  - @equinor/fusion-framework-react@5.3.4
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-app@5.2.11
  - @equinor/fusion-framework-app@7.1.11
  - @equinor/fusion-framework-react-module@3.0.7
  - @equinor/fusion-framework-react-module-http@4.0.2

## 4.1.15

### Patch Changes

- Updated dependencies [[`6d303787`](https://github.com/equinor/fusion-framework/commit/6d303787f647bb2fc3c90456eccac751abb264c4)]:
  - @equinor/fusion-framework-module-app@5.2.10
  - @equinor/fusion-framework-app@7.1.10
  - @equinor/fusion-framework-react@5.3.3

## 4.1.14

### Patch Changes

- Updated dependencies [[`8274dca1`](https://github.com/equinor/fusion-framework/commit/8274dca10a773e1d29ffbce82a6f6f2bae818316)]:
  - @equinor/fusion-framework-module-app@5.2.9
  - @equinor/fusion-framework-app@7.1.9
  - @equinor/fusion-framework-react@5.3.3

## 4.1.13

### Patch Changes

- Updated dependencies [[`a8f0f061`](https://github.com/equinor/fusion-framework/commit/a8f0f061dbde9efb3e2faf11fdb9c886d2277723)]:
  - @equinor/fusion-framework-module-navigation@3.1.2

## 4.1.12

### Patch Changes

- Updated dependencies [[`e2ec89f4`](https://github.com/equinor/fusion-framework/commit/e2ec89f457135037e2a333a61ba546fee6d99cd8)]:
  - @equinor/fusion-framework-module-navigation@3.1.1

## 4.1.11

### Patch Changes

- Updated dependencies [[`6f542d4c`](https://github.com/equinor/fusion-framework/commit/6f542d4c7c01ae94c28b7e82efba800a902a7633)]:
  - @equinor/fusion-framework-module-navigation@3.1.0

## 4.1.10

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.2.8
  - @equinor/fusion-framework-app@7.1.8
  - @equinor/fusion-framework-react@5.3.3

## 4.1.9

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-framework-module-app@5.2.7
  - @equinor/fusion-framework-app@7.1.7
  - @equinor/fusion-framework-react@5.3.2

## 4.1.8

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-app@7.1.6
  - @equinor/fusion-framework-module-app@5.2.6
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-framework-module-navigation@3.0.6
  - @equinor/fusion-framework-react@5.3.1
  - @equinor/fusion-framework-react-module-http@4.0.1
  - @equinor/fusion-framework-react-module@3.0.6

## 4.1.7

### Patch Changes

- Updated dependencies [[`3896fbec`](https://github.com/equinor/fusion-framework/commit/3896fbec3458dbe2ebd66e772465d5f89cd20658)]:
  - @equinor/fusion-framework-react@5.3.0
  - @equinor/fusion-framework-app@7.1.5
  - @equinor/fusion-framework-module-app@5.2.5
  - @equinor/fusion-framework-react-module-http@4.0.0

## 4.1.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.2.4
  - @equinor/fusion-framework-app@7.1.4
  - @equinor/fusion-framework-react@5.2.7

## 4.1.5

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-framework-module-app@5.2.4
  - @equinor/fusion-framework-react@5.2.6
  - @equinor/fusion-framework-app@7.1.3
  - @equinor/fusion-framework-module-navigation@3.0.5
  - @equinor/fusion-framework-react-module@3.0.5
  - @equinor/fusion-framework-react-module-http@3.0.5

## 4.1.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.2.3
  - @equinor/fusion-framework-app@7.1.2
  - @equinor/fusion-framework-react@5.2.5

## 4.1.3

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-react-module@3.0.4
  - @equinor/fusion-framework-module-navigation@3.0.4
  - @equinor/fusion-framework-react-module-http@3.0.4
  - @equinor/fusion-framework-react@5.2.4
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-app@5.2.2
  - @equinor/fusion-framework-app@7.1.1

## 4.1.2

### Patch Changes

- [#959](https://github.com/equinor/fusion-framework/pull/959) [`ac889787`](https://github.com/equinor/fusion-framework/commit/ac88978763f7c2d2eee3b5154a0eac12a93bc5a8) Thanks [@odinr](https://github.com/odinr)! - create a hook which returns the current `ContextProvider`

  example

  ```ts
  import { useContextProvider } from "@equinor/fusion-framework-react-app/context";
  const App = () => {
    const contextProvider = useContextProvider();
  };
  ```

## 4.1.1

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-app@7.0.16
  - @equinor/fusion-framework-module-navigation@3.0.1
  - @equinor/fusion-framework-react@5.2.2

## 4.1.0

### Minor Changes

- [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - **Add tooling for navigation in React App package**

  - add hook for using the navigation module
  - add hook for creating a react router

  ```ts
  const routes = [
    {
      path: "/",
      element: <p>👍🏻</p>,
    },
  ];

  const Router = () => {
    const router = useRouter(routes);
    return <RouterProvider router={router} fallbackElement={<p>😥</p>} />;
  };

  const App = () => <Router />;
  ```

- [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - hook `useAppModule` now throws error if requested module is not configured

### Patch Changes

- [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - updated cookbook for routing ([documentation](https://equinor.github.io/fusion-framework/modules/navigation/))

## 4.0.17

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-app@7.0.15
  - @equinor/fusion-framework-react@5.1.4
  - @equinor/fusion-framework-react-module-http@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.15...@equinor/fusion-framework-react-app@4.0.16) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.14...@equinor/fusion-framework-react-app@4.0.15) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.13...@equinor/fusion-framework-react-app@4.0.14) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.12...@equinor/fusion-framework-react-app@4.0.13) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 4.0.12 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.10...@equinor/fusion-framework-react-app@4.0.11) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.9...@equinor/fusion-framework-react-app@4.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.8...@equinor/fusion-framework-react-app@4.0.9) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 4.0.8 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.6...@equinor/fusion-framework-react-app@4.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.5...@equinor/fusion-framework-react-app@4.0.6) (2023-05-05)

### Bug Fixes

- **react-app:** allow broader component type when creating react framework component ([a0c9187](https://github.com/equinor/fusion-framework/commit/a0c9187aa8861f48e6b62ea848cf951a75d02c1b))

## 4.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 4.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.2...@equinor/fusion-framework-react-app@4.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.1...@equinor/fusion-framework-react-app@4.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@4.0.0...@equinor/fusion-framework-react-app@4.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 4.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.25 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.24 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.23 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.21...@equinor/fusion-framework-react-app@3.0.22) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.21 (2023-04-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.19...@equinor/fusion-framework-react-app@3.0.20) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.18...@equinor/fusion-framework-react-app@3.0.19) (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.17...@equinor/fusion-framework-react-app@3.0.18) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.16...@equinor/fusion-framework-react-app@3.0.17) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.15...@equinor/fusion-framework-react-app@3.0.16) (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.15 (2023-03-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.14 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.12...@equinor/fusion-framework-react-app@3.0.13) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.12 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.10...@equinor/fusion-framework-react-app@3.0.11) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.9...@equinor/fusion-framework-react-app@3.0.10) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.8...@equinor/fusion-framework-react-app@3.0.9) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.7...@equinor/fusion-framework-react-app@3.0.8) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.6...@equinor/fusion-framework-react-app@3.0.7) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.6 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.4...@equinor/fusion-framework-react-app@3.0.5) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.2...@equinor/fusion-framework-react-app@3.0.4) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@3.0.2...@equinor/fusion-framework-react-app@3.0.3) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 3.0.2 (2023-02-01)

### Bug Fixes

- **react-app:** ts-ignore for type error ([b1b3eb7](https://github.com/equinor/fusion-framework/commit/b1b3eb7da1a35eb9ad7461aa4ee15f58d4de9766))

## 3.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.38...@equinor/fusion-framework-react-app@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.38...@equinor/fusion-framework-react-app@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.38](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.37...@equinor/fusion-framework-react-app@2.0.38) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 2.0.37 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.36](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.35...@equinor/fusion-framework-react-app@2.0.36) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.35](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.34...@equinor/fusion-framework-react-app@2.0.35) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 2.0.34 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.33](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.32...@equinor/fusion-framework-react-app@2.0.33) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.32](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.31...@equinor/fusion-framework-react-app@2.0.32) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 2.0.31 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.29...@equinor/fusion-framework-react-app@2.0.30) (2023-01-04)

### Bug Fixes

- **react-app:** cleanup tsconfig ([1283609](https://github.com/equinor/fusion-framework/commit/1283609ad137c7956fe2181fba97b0050638c553))

## [2.0.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.28...@equinor/fusion-framework-react-app@2.0.29) (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 2.0.28 (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 2.0.27 (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.25...@equinor/fusion-framework-react-app@2.0.26) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.24...@equinor/fusion-framework-react-app@2.0.25) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.23...@equinor/fusion-framework-react-app@2.0.24) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.22...@equinor/fusion-framework-react-app@2.0.23) (2022-12-19)

### Bug Fixes

- **react-app:** check if manifest is provided in env ([e41b6d1](https://github.com/equinor/fusion-framework/commit/e41b6d1c9006f7d55933a6375861d96126498015))

## [2.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.21...@equinor/fusion-framework-react-app@2.0.22) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.20...@equinor/fusion-framework-react-app@2.0.21) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.19...@equinor/fusion-framework-react-app@2.0.20) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.18...@equinor/fusion-framework-react-app@2.0.19) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.17...@equinor/fusion-framework-react-app@2.0.18) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.16...@equinor/fusion-framework-react-app@2.0.17) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 2.0.16 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.14...@equinor/fusion-framework-react-app@2.0.15) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.13...@equinor/fusion-framework-react-app@2.0.14) (2022-12-12)

### Bug Fixes

- **react-app:** update typing of legacy-app ([d4dbbb0](https://github.com/equinor/fusion-framework/commit/d4dbbb0a326cb6b54bb3a2348fd7961b3abf4ba7))

## [2.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.12...@equinor/fusion-framework-react-app@2.0.13) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.11...@equinor/fusion-framework-react-app@2.0.12) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.10...@equinor/fusion-framework-react-app@2.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.9...@equinor/fusion-framework-react-app@2.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.8...@equinor/fusion-framework-react-app@2.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.7...@equinor/fusion-framework-react-app@2.0.8) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.6...@equinor/fusion-framework-react-app@2.0.7) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.5...@equinor/fusion-framework-react-app@2.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.4...@equinor/fusion-framework-react-app@2.0.5) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.3...@equinor/fusion-framework-react-app@2.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.2...@equinor/fusion-framework-react-app@2.0.3) (2022-12-05)

### Bug Fixes

- **react-app:** fix optional dependencie version react-module-context ([4149ce6](https://github.com/equinor/fusion-framework/commit/4149ce625ffc330d69becde1d66f4d894c22c9f3))

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.1...@equinor/fusion-framework-react-app@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@2.0.0...@equinor/fusion-framework-react-app@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.19...@equinor/fusion-framework-react-app@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.19...@equinor/fusion-framework-react-app@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.18...@equinor/fusion-framework-react-app@1.3.19) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.17...@equinor/fusion-framework-react-app@1.3.18) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.16...@equinor/fusion-framework-react-app@1.3.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.15...@equinor/fusion-framework-react-app@1.3.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.14...@equinor/fusion-framework-react-app@1.3.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.13...@equinor/fusion-framework-react-app@1.3.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.12...@equinor/fusion-framework-react-app@1.3.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.11...@equinor/fusion-framework-react-app@1.3.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.10...@equinor/fusion-framework-react-app@1.3.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.9...@equinor/fusion-framework-react-app@1.3.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.8...@equinor/fusion-framework-react-app@1.3.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.7...@equinor/fusion-framework-react-app@1.3.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.6...@equinor/fusion-framework-react-app@1.3.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.3.6 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.4...@equinor/fusion-framework-react-app@1.3.5) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.3...@equinor/fusion-framework-react-app@1.3.4) (2022-11-20)

### Bug Fixes

- **react-app:** expose interface from framework-app ([a01aee3](https://github.com/equinor/fusion-framework/commit/a01aee3a32a74c821fdc93624aaf4173c0fcc4e1))

## [1.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.2...@equinor/fusion-framework-react-app@1.3.3) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.1...@equinor/fusion-framework-react-app@1.3.2) (2022-11-18)

### Bug Fixes

- basename in app render ([ae75815](https://github.com/equinor/fusion-framework/commit/ae75815877701c364f853413b29ad4f053d9c2c2))

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.0...@equinor/fusion-framework-react-app@1.3.1) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.15...@equinor/fusion-framework-react-app@1.3.0) (2022-11-17)

### Features

- **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

## 1.2.15 (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.13...@equinor/fusion-framework-react-app@1.2.14) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.12...@equinor/fusion-framework-react-app@1.2.13) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.2.12 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.10...@equinor/fusion-framework-react-app@1.2.11) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.9...@equinor/fusion-framework-react-app@1.2.10) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.8...@equinor/fusion-framework-react-app@1.2.9) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.2.8 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.6...@equinor/fusion-framework-react-app@1.2.7) (2022-11-07)

### Bug Fixes

- **react-app:** adjust function for creating components ([c986a4a](https://github.com/equinor/fusion-framework/commit/c986a4ac8aeb57035eb555ed07b86b1792b09900))

## 1.2.6 (2022-11-03)

### Bug Fixes

- deprecate useFramework from hooks ([d3d9b24](https://github.com/equinor/fusion-framework/commit/d3d9b24fe56937e2c9feba7de4228d8eb1cbbec5))

## [1.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.4...@equinor/fusion-framework-react-app@1.2.5) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.3...@equinor/fusion-framework-react-app@1.2.4) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.2...@equinor/fusion-framework-react-app@1.2.3) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.1...@equinor/fusion-framework-react-app@1.2.2) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.0...@equinor/fusion-framework-react-app@1.2.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.2.0 (2022-11-02)

### Features

- deprecate app-config ([1f24abc](https://github.com/equinor/fusion-framework/commit/1f24abc5125b0526c64973fe0b063a9c33d532b0))
- **react-app:** react tooling for context ([84a2624](https://github.com/equinor/fusion-framework/commit/84a26242f73da2d77b1468b7724da56b2add590b))

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.1.0...@equinor/fusion-framework-react-app@1.1.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.23...@equinor/fusion-framework-react-app@1.1.0) (2022-11-01)

### Features

- **framework:** implement module-app ([dc917f0](https://github.com/equinor/fusion-framework/commit/dc917f019da852fbd93eaf6ed7bc4a3a7e6f0d68))

## 1.0.23 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.21...@equinor/fusion-framework-react-app@1.0.22) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.20...@equinor/fusion-framework-react-app@1.0.21) (2022-10-27)

### Bug Fixes

- :fire: rewrite hook for getting app config ([cc862ba](https://github.com/equinor/fusion-framework/commit/cc862ba3c23608be6d3406b9cf35d20af6eccb97))

## [1.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.19...@equinor/fusion-framework-react-app@1.0.20) (2022-10-26)

### Bug Fixes

- **react-app:** :fire: update render env args with typing ([06bd3c7](https://github.com/equinor/fusion-framework/commit/06bd3c75218981f54216f76d3b7a667110dac3ae))

## 1.0.19 (2022-10-21)

### Bug Fixes

- **react-app:** improve app module hook ([ffb66e3](https://github.com/equinor/fusion-framework/commit/ffb66e3f488bf9c28870824b4d42748e5d072364))

## [1.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.17...@equinor/fusion-framework-react-app@1.0.18) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.16...@equinor/fusion-framework-react-app@1.0.17) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.0.16 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.14...@equinor/fusion-framework-react-app@1.0.15) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.0.14 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 1.0.13 (2022-10-03)

### Bug Fixes

- **react-app:** update typing of module instance ([b656a24](https://github.com/equinor/fusion-framework/commit/b656a24b2c0daac647994c1468dd8f14438fba2e))

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.11...@equinor/fusion-framework-react-app@1.0.12) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.10...@equinor/fusion-framework-react-app@1.0.11) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.9...@equinor/fusion-framework-react-app@1.0.10) (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.8...@equinor/fusion-framework-react-app@1.0.9) (2022-09-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.7...@equinor/fusion-framework-react-app@1.0.8) (2022-09-26)

### Bug Fixes

- **react-app:** expose module http ([fcd50b7](https://github.com/equinor/fusion-framework/commit/fcd50b7359fda49617000ccbca810cbcc1d6553b))

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.5...@equinor/fusion-framework-react-app@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.4...@equinor/fusion-framework-react-app@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.3...@equinor/fusion-framework-react-app@1.0.4) (2022-09-13)

### Bug Fixes

- update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.2...@equinor/fusion-framework-react-app@1.0.3) (2022-09-13)

### Bug Fixes

- update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.1...@equinor/fusion-framework-react-app@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.1-next.1...@equinor/fusion-framework-react-app@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.1-next.0...@equinor/fusion-framework-react-app@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.0...@equinor/fusion-framework-react-app@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.8.0...@equinor/fusion-framework-react-app@1.0.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **react-app:** config is now object

### Features

- **react-app:** update init ([a41f102](https://github.com/equinor/fusion-framework/commit/a41f102e2fee94ec4e29b567cf867465c672f16f))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.8.0...@equinor/fusion-framework-react-app@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **react-app:** config is now object

### Features

- **react-app:** update init ([a41f102](https://github.com/equinor/fusion-framework/commit/a41f102e2fee94ec4e29b567cf867465c672f16f))

## [0.8.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.7.3...@equinor/fusion-framework-react-app@0.8.0) (2022-09-09)

### Features

- **react-app:** create legacy app ([4ae10ab](https://github.com/equinor/fusion-framework/commit/4ae10ab4aec50d9e92ce4cb0c74a1405a0dcc36e))

## [0.7.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.7.2...@equinor/fusion-framework-react-app@0.7.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.7.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.7.1...@equinor/fusion-framework-react-app@0.7.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.7.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.7.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.6.1...@equinor/fusion-framework-react-app@0.7.0) (2022-09-05)

### Features

- **react-app:** expose http client ([91b9930](https://github.com/equinor/fusion-framework/commit/91b9930f404772bd58ce043b6987aaffc8324654))

## 0.6.1 (2022-09-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.5.1...@equinor/fusion-framework-react-app@0.6.0) (2022-08-29)

### ⚠ BREAKING CHANGES

- rename fetch

- fix(module-service-discovery): update http client consumer

- build: update allowed branches

- build: add conventional commit

- build: use conventionalcommits

- build(module-http): push major

- build: update deps

### Features

- rename fetch method ([#226](https://github.com/equinor/fusion-framework/issues/226)) ([f02df7c](https://github.com/equinor/fusion-framework/commit/f02df7cdd2b9098b0da49c5ea56ac3b6a17e9e32))

## [0.5.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.5.0...@equinor/fusion-framework-react-app@0.5.1) (2022-08-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

# 0.5.0 (2022-08-22)

### Features

- **react-app:** use event module ([21cf7f9](https://github.com/equinor/fusion-framework/commit/21cf7f98eafb8a4d970f3d2d9f56d56046da1321))

## [0.4.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.4.3...@equinor/fusion-framework-react-app@0.4.4) (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.4.3 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.4.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.4.1...@equinor/fusion-framework-react-app@0.4.2) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.4.0...@equinor/fusion-framework-react-app@0.4.1) (2022-08-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

# [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.3.0...@equinor/fusion-framework-react-app@0.4.0) (2022-08-08)

### Features

- **react-app:** implement app config for react apps ([b367e55](https://github.com/equinor/fusion-framework/commit/b367e550b1868ed30b067a9bfd99db09b269d862))

# 0.3.0 (2022-08-05)

### Features

- **react-app:** implement react framework modules ([#195](https://github.com/equinor/fusion-framework/issues/195)) ([acb0db3](https://github.com/equinor/fusion-framework/commit/acb0db36bff74c7838c48297179cf644db6cc8ca))

## [0.2.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.28...@equinor/fusion-framework-react-app@0.2.29) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.27...@equinor/fusion-framework-react-app@0.2.28) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.26...@equinor/fusion-framework-react-app@0.2.27) (2022-08-01)

### Bug Fixes

- expose framework in react-app package ([9dc2e5b](https://github.com/equinor/fusion-framework/commit/9dc2e5b2ec27344fbb390248abdbb73caed297cc))

## [0.2.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.25...@equinor/fusion-framework-react-app@0.2.26) (2022-07-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.24...@equinor/fusion-framework-react-app@0.2.25) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.23...@equinor/fusion-framework-react-app@0.2.24) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.22...@equinor/fusion-framework-react-app@0.2.23) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.21...@equinor/fusion-framework-react-app@0.2.22) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.20...@equinor/fusion-framework-react-app@0.2.21) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.19...@equinor/fusion-framework-react-app@0.2.20) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.18...@equinor/fusion-framework-react-app@0.2.19) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.17...@equinor/fusion-framework-react-app@0.2.18) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.16...@equinor/fusion-framework-react-app@0.2.17) (2022-06-24)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.15...@equinor/fusion-framework-react-app@0.2.16) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.14...@equinor/fusion-framework-react-app@0.2.15) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.13...@equinor/fusion-framework-react-app@0.2.14) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.12...@equinor/fusion-framework-react-app@0.2.13) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.2.12 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.2.11 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.2.10 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.8...@equinor/fusion-framework-react-app@0.2.9) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.7...@equinor/fusion-framework-react-app@0.2.8) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.6...@equinor/fusion-framework-react-app@0.2.7) (2022-03-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.5...@equinor/fusion-framework-react-app@0.2.6) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.4...@equinor/fusion-framework-react-app@0.2.5) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.3...@equinor/fusion-framework-react-app@0.2.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.2...@equinor/fusion-framework-react-app@0.2.3) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.1...@equinor/fusion-framework-react-app@0.2.2) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.0...@equinor/fusion-framework-react-app@0.2.1) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.1.2...@equinor/fusion-framework-react-app@0.2.0) (2022-02-15)

### Features

- **module-service-discovery:** allow custom service discovery ([8917e4e](https://github.com/equinor/fusion-framework/commit/8917e4e3053b824ac8d878b0bfbe6a22efd56c3b))

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.1.1...@equinor/fusion-framework-react-app@0.1.2) (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

# 0.1.0 (2022-02-07)

### Bug Fixes

- memo http clients ([f876acb](https://github.com/equinor/fusion-framework/commit/f876acb11e19d7802a28f58ce7d70bc76f777c5e))
- **react-app:** await configuration of app ([a71484b](https://github.com/equinor/fusion-framework/commit/a71484b17f2b6575aedefb0bdbc7965ffffae5e8))
- **react-app:** expose http interface ([441facd](https://github.com/equinor/fusion-framework/commit/441facdc32f71391683b33db394f34e966772faf))
- **react-app:** fix AppConfigurator interface ([e5a8a21](https://github.com/equinor/fusion-framework/commit/e5a8a21ff6a558876e3db9a2596e891d9abea0cd))
- **react-app:** include fusion modules in init of app ([1d7ffc3](https://github.com/equinor/fusion-framework/commit/1d7ffc3c203c7d7dda3d05abf4e8ffb396de04b4))
- **react-app:** rename of file ([6e3b758](https://github.com/equinor/fusion-framework/commit/6e3b758aec7e020d05912c2a80f398cd0b790a8b))
- **react-app:** update typeing ([20495bd](https://github.com/equinor/fusion-framework/commit/20495bdf2a1d67aed2b03ff1b07f5c38f02a8d9d))
- removed duplicate declaration of Component ([6db1b74](https://github.com/equinor/fusion-framework/commit/6db1b74304a3abd145b0b0268a20c5693743871a))
- shared context ([f00732e](https://github.com/equinor/fusion-framework/commit/f00732ee3c1016be812204c7cf7b0205b2322075))

### Features

- add package for creating react app ([c478025](https://github.com/equinor/fusion-framework/commit/c478025a057d1e6b38cd33189fe24580e58fc32b))
- **react-app:** add hooks ([9bfcc5e](https://github.com/equinor/fusion-framework/commit/9bfcc5ebd721b19232e7896cee037637c716f09a))
- **reat-app:** add default modules ([74bf60e](https://github.com/equinor/fusion-framework/commit/74bf60ec07ea9573901d4160de5d4252e6e9c167))

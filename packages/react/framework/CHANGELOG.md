# Change Log

## 7.4.0

### Minor Changes

- [#2814](https://github.com/equinor/fusion-framework/pull/2814) [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa) Thanks [@odinr](https://github.com/odinr)! - Updated `useCurrentUser` to consume new MSAL provider interface

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
    - @equinor/fusion-framework@7.3.0
    - @equinor/fusion-framework-module-feature-flag@1.1.12
    - @equinor/fusion-framework-react-module-http@8.0.1
    - @equinor/fusion-framework-react-module-signalr@3.0.21

## 7.3.8

### Patch Changes

- Updated dependencies [[`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1)]:
    - @equinor/fusion-observable@8.4.4
    - @equinor/fusion-framework-module-feature-flag@1.1.12
    - @equinor/fusion-framework@7.2.16
    - @equinor/fusion-framework-react-module-signalr@3.0.20

## 7.3.7

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.15
    - @equinor/fusion-framework-module-feature-flag@1.1.11

## 7.3.6

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.14

## 7.3.5

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.13
    - @equinor/fusion-framework-react-module-signalr@3.0.19

## 7.3.4

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.12

## 7.3.3

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
    - @equinor/fusion-framework-module-feature-flag@1.1.11
    - @equinor/fusion-observable@8.4.3
    - @equinor/fusion-framework@7.2.11
    - @equinor/fusion-framework-react-module-signalr@3.0.18

## 7.3.2

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.10

## 7.3.1

### Patch Changes

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
    - @equinor/fusion-framework-module-feature-flag@1.1.10
    - @equinor/fusion-observable@8.4.2
    - @equinor/fusion-framework@7.2.9
    - @equinor/fusion-framework-react-module-signalr@3.0.17

## 7.3.0

### Minor Changes

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

## 7.2.3

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.8
    - @equinor/fusion-framework-module-feature-flag@1.1.9
    - @equinor/fusion-framework-react-module-http@8.0.0
    - @equinor/fusion-framework-react-module-signalr@3.0.16

## 7.2.2

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
    - @equinor/fusion-framework-module@4.3.5
    - @equinor/fusion-framework-react-module-signalr@3.0.15
    - @equinor/fusion-framework@7.2.7
    - @equinor/fusion-framework-module-feature-flag@1.1.9
    - @equinor/fusion-framework-react-module-http@7.0.0
    - @equinor/fusion-framework-react-module@3.1.6

## 7.2.1

### Patch Changes

- Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
    - @equinor/fusion-observable@8.4.1
    - @equinor/fusion-framework-module-feature-flag@1.1.8
    - @equinor/fusion-framework@7.2.6
    - @equinor/fusion-framework-react-module-signalr@3.0.14

## 7.2.0

### Minor Changes

- [#2425](https://github.com/equinor/fusion-framework/pull/2425) [`843edd9`](https://github.com/equinor/fusion-framework/commit/843edd96f2a01ebd814766105902977cdc1cdf8e) Thanks [@odinr](https://github.com/odinr)! - These changes ensure that the `Framework` component and `createFrameworkProvider` function are consistent with the updated configuration approach and support module instances from the parent context.

    **Updated Framework Component:**

    - Added `useModules` hook to import modules from the parent context.
    - Updated the `createFrameworkProvider` function to accept a `ref` parameter for module instances.

    **Updated create-framework-provider Function:**

    - Added `ref` parameter to the `createFrameworkProvider` function to support module instances.
    - Updated the example usage in the documentation to reflect the changes.

    **Misc:**

    - Replaced deprecated import of `FusionConfigurator` with `FrameworkConfigurator` (renaming).

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
    - @equinor/fusion-framework-module@4.3.4
    - @equinor/fusion-framework@7.2.5
    - @equinor/fusion-framework-module-feature-flag@1.1.7
    - @equinor/fusion-framework-react-module@3.1.5
    - @equinor/fusion-framework-react-module-http@6.0.3
    - @equinor/fusion-framework-react-module-signalr@3.0.13

## 7.1.4

### Patch Changes

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
    - @equinor/fusion-observable@8.4.0
    - @equinor/fusion-framework-module@4.3.3
    - @equinor/fusion-framework-module-feature-flag@1.1.6
    - @equinor/fusion-framework@7.2.4
    - @equinor/fusion-framework-react-module-http@6.0.2
    - @equinor/fusion-framework-react-module@3.1.4
    - @equinor/fusion-framework-react-module-signalr@3.0.12

## 7.1.3

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.2.3
    - @equinor/fusion-framework-module-feature-flag@1.1.5

## 7.1.2

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
    - @equinor/fusion-framework-module@4.3.2
    - @equinor/fusion-framework-react-module-signalr@3.0.11
    - @equinor/fusion-framework-module-feature-flag@1.1.5
    - @equinor/fusion-framework-react-module@3.1.3
    - @equinor/fusion-framework-react-module-http@6.0.1
    - @equinor/fusion-observable@8.3.3
    - @equinor/fusion-framework@7.2.2

## 7.1.1

### Patch Changes

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
    - @equinor/fusion-observable@8.3.2
    - @equinor/fusion-framework-module-feature-flag@1.1.4
    - @equinor/fusion-framework@7.2.1
    - @equinor/fusion-framework-react-module-signalr@3.0.10

## 7.1.0

### Minor Changes

- [#2181](https://github.com/equinor/fusion-framework/pull/2181) [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8) Thanks [@odinr](https://github.com/odinr)! - If you were previously using the `blob` or `blob# Change Log methods from the `IHttpClient`and expecting a`Blob`result, you must now use the new`BlobResult` type, which includes the filename (if available) and the blob data.

    **Migration Guide:**

    ```typescript
    // Before
    const blob = await httpClient.blob('/path/to/blob');
    console.log(blob); // Blob instance

    // After
    const blobResult = await httpClient.blob<Blob>('/path/to/blob');
    console.log(blobResult.filename); // 'example.pdf'
    console.log(blobResult.blob); // Blob instance
    ```

### Patch Changes

- Updated dependencies [[`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
    - @equinor/fusion-framework@7.2.0
    - @equinor/fusion-observable@8.3.1
    - @equinor/fusion-framework-module-feature-flag@1.1.3
    - @equinor/fusion-framework-react-module-http@6.0.0
    - @equinor/fusion-framework-react-module-signalr@3.0.9

## 7.0.8

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
    - @equinor/fusion-framework-module@4.3.1
    - @equinor/fusion-framework@7.1.8
    - @equinor/fusion-framework-module-feature-flag@1.1.2
    - @equinor/fusion-framework-react-module@3.1.2
    - @equinor/fusion-framework-react-module-http@5.0.4
    - @equinor/fusion-framework-react-module-signalr@3.0.8

## 7.0.7

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.1.7
    - @equinor/fusion-framework-react-module-signalr@3.0.7

## 7.0.6

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.1.6
    - @equinor/fusion-framework-react-module-signalr@3.0.6

## 7.0.5

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework-module-feature-flag@1.1.1
    - @equinor/fusion-framework@7.1.5
    - @equinor/fusion-framework-react-module-signalr@3.0.5

## 7.0.4

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.1.4
    - @equinor/fusion-framework-module-feature-flag@1.1.1
    - @equinor/fusion-framework-react-module-http@5.0.3
    - @equinor/fusion-framework-react-module-signalr@3.0.4

## 7.0.3

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a)]:
    - @equinor/fusion-observable@8.3.0
    - @equinor/fusion-framework-module-feature-flag@1.1.1
    - @equinor/fusion-framework@7.1.3
    - @equinor/fusion-framework-react-module-signalr@3.0.3

## 7.0.2

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.1.2
    - @equinor/fusion-framework-module-feature-flag@1.1.0
    - @equinor/fusion-framework-react-module-http@5.0.2
    - @equinor/fusion-framework-react-module-signalr@3.0.2

## 7.0.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
    - @equinor/fusion-framework-react-module-signalr@3.0.1
    - @equinor/fusion-framework-react-module@3.1.1
    - @equinor/fusion-framework@7.1.1
    - @equinor/fusion-framework-react-module-http@5.0.1
    - @equinor/fusion-framework-module-feature-flag@1.1.0

## 7.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    - @equinor/fusion-framework-module@4.3.0
    - @equinor/fusion-framework-react-module-signalr@3.0.0
    - @equinor/fusion-framework-module-feature-flag@1.1.0
    - @equinor/fusion-framework-react-module@3.1.0
    - @equinor/fusion-framework-react-module-http@5.0.0
    - @equinor/fusion-observable@8.2.0
    - @equinor/fusion-framework@7.1.0

## 6.0.5

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.33

## 6.0.4

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.32

## 6.0.3

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.31

## 6.0.2

### Patch Changes

- [#1791](https://github.com/equinor/fusion-framework/pull/1791) [`2a813bc`](https://github.com/equinor/fusion-framework/commit/2a813bc0a32f53e7515f16f8b5cba1cf1e5018a3) Thanks [@yusijs](https://github.com/yusijs)! - propagate error from useApps if it fails

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    - @equinor/fusion-framework-module@4.2.7
    - @equinor/fusion-framework@7.0.30
    - @equinor/fusion-framework-module-feature-flag@1.0.2
    - @equinor/fusion-framework-react-module@3.0.8
    - @equinor/fusion-framework-react-module-http@4.0.6
    - @equinor/fusion-framework-react-module-signalr@2.0.18

## 6.0.1

### Patch Changes

- [#1766](https://github.com/equinor/fusion-framework/pull/1766) [`fdbe12f`](https://github.com/equinor/fusion-framework/commit/fdbe12f258aeb98d91094f16f2d8ce229d7b13ee) Thanks [@odinr](https://github.com/odinr)! - - The return type of the `useCurrentApp` function has been changed. The `currentApp` property can now be `undefined` or `null`, in addition to `CurrentApp<TModules, TEnv>`.

    - The initial value for `useObservableState` has been set to `provider.current`.
    - The assignment of `module` has been updated to handle the case where `modules` is `undefined`.
    - The return type of the `useCurrentAppModules` function has been changed. The `modules` property can now be `undefined` or `null`, in addition to `AppModulesInstance<TModules>`.
    - The initial value for `useObservableState` has been updated to handle the case where `currentApp` is `undefined`.

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
    - @equinor/fusion-observable@8.1.5
    - @equinor/fusion-framework-module-feature-flag@1.0.1
    - @equinor/fusion-framework@7.0.29
    - @equinor/fusion-framework-react-module-signalr@2.0.17

## 6.0.0

### Major Changes

- [#1747](https://github.com/equinor/fusion-framework/pull/1747) [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e) Thanks [@odinr](https://github.com/odinr)! - refactor framework feature flag hooks

    - useCurrentAppFeatures
    - _useFeature (internal)_
    - _useFeatures (internal)_
    - useFrameworkFeature
    - useFrameworkFeatures

    > [!CAUTION] > `useCurrentAppModules` does no longer return `Observable<AppModulesInstance>`, but current state of `AppModulesInstance | null`

### Patch Changes

- Updated dependencies [[`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e)]:
    - @equinor/fusion-framework-module-feature-flag@1.0.0

## 5.3.9

### Patch Changes

- Updated dependencies [[`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d), [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d)]:
    - @equinor/fusion-framework-module-feature-flag@0.0.1

## 5.3.8

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.28
    - @equinor/fusion-framework-react-module-http@4.0.5
    - @equinor/fusion-framework-react-module-signalr@2.0.16

## 5.3.7

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.27
    - @equinor/fusion-framework-react-module-http@4.0.4
    - @equinor/fusion-framework-react-module-signalr@2.0.15

## 5.3.6

### Patch Changes

- Updated dependencies [[`cce198d`](https://github.com/equinor/fusion-framework/commit/cce198d6a91fb7912265d4383246dc405cf17a17), [`f85316f`](https://github.com/equinor/fusion-framework/commit/f85316f2344258896a77ef602bd4047dfa553788)]:
    - @equinor/fusion-framework-react-module-http@4.0.3
    - @equinor/fusion-framework@7.0.26
    - @equinor/fusion-framework-react-module-signalr@2.0.14

## 5.3.5

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
    - @equinor/fusion-observable@8.1.4
    - @equinor/fusion-framework@7.0.25
    - @equinor/fusion-framework-react-module-signalr@2.0.13

## 5.3.4

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    - @equinor/fusion-observable@8.1.3
    - @equinor/fusion-framework-module@4.2.6
    - @equinor/fusion-framework@7.0.24
    - @equinor/fusion-framework-react-module-signalr@2.0.12
    - @equinor/fusion-framework-react-module@3.0.7
    - @equinor/fusion-framework-react-module-http@4.0.2

## 5.3.3

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.23
    - @equinor/fusion-framework-react-module-signalr@2.0.11

## 5.3.2

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.22
    - @equinor/fusion-framework-react-module-signalr@2.0.10

## 5.3.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    - @equinor/fusion-framework@7.0.21
    - @equinor/fusion-framework-module@4.2.5
    - @equinor/fusion-framework-react-module-http@4.0.1
    - @equinor/fusion-framework-react-module@3.0.6
    - @equinor/fusion-framework-react-module-signalr@2.0.9
    - @equinor/fusion-observable@8.1.2

## 5.3.0

### Minor Changes

- [`3896fbec`](https://github.com/equinor/fusion-framework/commit/3896fbec3458dbe2ebd66e772465d5f89cd20658) Thanks [@odinr](https://github.com/odinr)! - Create module provider when creating framework provider

    `useModule(...)` did not work previously within framework (portal) context since no context provider was created

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.20
    - @equinor/fusion-framework-react-module-http@4.0.0
    - @equinor/fusion-framework-react-module-signalr@2.0.8

## 5.2.7

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.19
    - @equinor/fusion-framework-react-module-signalr@2.0.7

## 5.2.6

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4), [`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    - @equinor/fusion-observable@8.1.1
    - @equinor/fusion-framework-module@4.2.4
    - @equinor/fusion-framework@7.0.18
    - @equinor/fusion-framework-react-module-http@3.0.5
    - @equinor/fusion-framework-react-module-signalr@2.0.6

## 5.2.5

### Patch Changes

- Updated dependencies []:
    - @equinor/fusion-framework@7.0.17
    - @equinor/fusion-framework-react-module-signalr@2.0.5

## 5.2.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    - @equinor/fusion-framework-react-module-signalr@2.0.4
    - @equinor/fusion-framework-react-module-http@3.0.4
    - @equinor/fusion-observable@8.1.0
    - @equinor/fusion-framework-module@4.2.3
    - @equinor/fusion-framework@7.0.16

## 5.2.3

### Patch Changes

- [#1047](https://github.com/equinor/fusion-framework/pull/1047) [`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @typescript-eslint/eslint-plugin from 5.59.11 to 6.1.0

    only style semantics updated

## 5.2.2

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    - @equinor/fusion-framework@7.0.15

## 5.2.1

### Patch Changes

- [#943](https://github.com/equinor/fusion-framework/pull/943) [`6fb3fb86`](https://github.com/equinor/fusion-framework/commit/6fb3fb8610f5ed5777d13bde71d8d92b0da31d8a) Thanks [@odinr](https://github.com/odinr)! - update typing to typescript 5

    provider from `createFrameworkProvider` was missing typehint of children

## 5.2.0

### Minor Changes

- [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - Create and expose interface for App

    - deprecate [AppModuleProvider.createApp](https://github.com/equinor/fusion-framework/blob/cf08d5ae3cef473e5025fd973a2a7a45a3b22dee/packages/modules/app/src/AppModuleProvider.ts#L171)

    this should not create any breaking changes since apps was only created from provider.
    if the class is still needed it can be imported:

    ```ts
    import { App } from '@equinor/fusion-framework-module-app/app';
    ```

## 5.1.4

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    - align all versions of typescript
    - update types to build
        - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    - @equinor/fusion-framework@7.0.14
    - @equinor/fusion-framework-react-module-context@6.0.9
    - @equinor/fusion-framework-react-module-http@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.1.2...@equinor/fusion-framework-react@5.1.3) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.1.1...@equinor/fusion-framework-react@5.1.2) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.1.0...@equinor/fusion-framework-react@5.1.1) (2023-05-22)

### Bug Fixes

- **react-framework:** expose useCurrentAppModules ([785d5eb](https://github.com/equinor/fusion-framework/commit/785d5eb08963d5ba1a007573879908b33e52fb3f))

## 5.1.0 (2023-05-22)

### Features

- **react-framework:** add hook for using current app modules ([2d65464](https://github.com/equinor/fusion-framework/commit/2d654647b84e03d1c6e322509885d8bfa2b9142f))
- **react-framework:** enhance `useCurrentApp` ([60026c9](https://github.com/equinor/fusion-framework/commit/60026c918c5033137cc359665074ea65c11a34fb))

## [5.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.10...@equinor/fusion-framework-react@5.0.11) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.9...@equinor/fusion-framework-react@5.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.8...@equinor/fusion-framework-react@5.0.9) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.8 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.6...@equinor/fusion-framework-react@5.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.5...@equinor/fusion-framework-react@5.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.2...@equinor/fusion-framework-react@5.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.1...@equinor/fusion-framework-react@5.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [5.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@5.0.0...@equinor/fusion-framework-react@5.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 5.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.12 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.11 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.10 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.9 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.7...@equinor/fusion-framework-react@4.0.8) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.7 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.6 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.4...@equinor/fusion-framework-react@4.0.5) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 4.0.4 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.2...@equinor/fusion-framework-react@4.0.3) (2023-03-06)

### Bug Fixes

- **useApps:** hiding hidden apps ([7f1354f](https://github.com/equinor/fusion-framework/commit/7f1354fd72cd7b02715e67b8274b4c8185397012))

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.1...@equinor/fusion-framework-react@4.0.2) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@4.0.0...@equinor/fusion-framework-react@4.0.1) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.2.0...@equinor/fusion-framework-react@4.0.0) (2023-02-13)

### ⚠ BREAKING CHANGES

- **utils/observable:** `useObservableInputState` and `useObservableSelectorState` now return full state, not only value

### Bug Fixes

- **utils/observable:** rename `next` to `value`from `useObservableState` ([4a08445](https://github.com/equinor/fusion-framework/commit/4a08445645af2488666564c2da716d32aa5e88c0))
- **utils/observable:** when subject in useObservableState reset state ([9c5c041](https://github.com/equinor/fusion-framework/commit/9c5c041d3d8c0b01bd507ea7f672711d9f5cb653))

## [3.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.4...@equinor/fusion-framework-react@3.2.0) (2023-02-09)

### Features

- (framework): person provider ([d4a3936](https://github.com/equinor/fusion-framework/commit/d4a3936d6a60f093f71eac1dacc05cd60c7bf554))

## 3.1.4 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [3.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.2...@equinor/fusion-framework-react@3.1.3) (2023-02-01)

### Bug Fixes

- **framework-react:** make params for useApps optional ([9e3fce1](https://github.com/equinor/fusion-framework/commit/9e3fce16cb1abfea8ae77239078efa2b1b0f52c2))

## [3.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.0...@equinor/fusion-framework-react@3.1.2) (2023-02-01)

### Bug Fixes

- **framework-app:** exporting hooks useApps and useAppProvider ([fd62fb3](https://github.com/equinor/fusion-framework/commit/fd62fb35667730d6d1f915bab4fc0c9bd8f6152b))

## [3.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@3.1.0...@equinor/fusion-framework-react@3.1.1) (2023-02-01)

### Bug Fixes

- **framework-app:** exporting hooks useApps and useAppProvider ([fd62fb3](https://github.com/equinor/fusion-framework/commit/fd62fb35667730d6d1f915bab4fc0c9bd8f6152b))

## 3.1.0 (2023-02-01)

### Features

- hooks useApps and useAppProvider ([bfa61a2](https://github.com/equinor/fusion-framework/commit/bfa61a2f01e70880f5a90e5184454ca40033ce71))

## 3.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.2.0...@equinor/fusion-framework-react@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.2.0...@equinor/fusion-framework-react@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.7...@equinor/fusion-framework-react@2.2.0) (2023-01-26)

### Features

- **framework-react:** expose hook for signalr ([e807202](https://github.com/equinor/fusion-framework/commit/e807202e32e1031c7feb6e8ec1d30b3ed4336f35))

## 2.1.7 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.5...@equinor/fusion-framework-react@2.1.6) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.4...@equinor/fusion-framework-react@2.1.5) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.1.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.2...@equinor/fusion-framework-react@2.1.3) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.1.1...@equinor/fusion-framework-react@2.1.2) (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.1.1 (2023-01-10)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.1.0 (2023-01-04)

### Features

- **module-app:** allow clearing current app ([c7f4c14](https://github.com/equinor/fusion-framework/commit/c7f4c144c29c2c40df42eafcdaabfb8214e1e88d))

## 2.0.25 (2023-01-04)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.23...@equinor/fusion-framework-react@2.0.24) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.22...@equinor/fusion-framework-react@2.0.23) (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.0.22 (2022-12-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.20...@equinor/fusion-framework-react@2.0.21) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.19...@equinor/fusion-framework-react@2.0.20) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.18...@equinor/fusion-framework-react@2.0.19) (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.17...@equinor/fusion-framework-react@2.0.18) (2022-12-14)

### Bug Fixes

- remove deprecated hooks ([af5586f](https://github.com/equinor/fusion-framework/commit/af5586f563e32c1e7e577a3e6837be610a135fc9))

## [2.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.16...@equinor/fusion-framework-react@2.0.17) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.15...@equinor/fusion-framework-react@2.0.16) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 2.0.15 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.13...@equinor/fusion-framework-react@2.0.14) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.12...@equinor/fusion-framework-react@2.0.13) (2022-12-12)

### Bug Fixes

- **framework-react:** update hooks ([cd8b0cd](https://github.com/equinor/fusion-framework/commit/cd8b0cd580cd90a35392ccefb8e306700e903ce1))

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.11...@equinor/fusion-framework-react@2.0.12) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.10...@equinor/fusion-framework-react@2.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.9...@equinor/fusion-framework-react@2.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.8...@equinor/fusion-framework-react@2.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.7...@equinor/fusion-framework-react@2.0.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.6...@equinor/fusion-framework-react@2.0.7) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.5...@equinor/fusion-framework-react@2.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.4...@equinor/fusion-framework-react@2.0.5) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.3...@equinor/fusion-framework-react@2.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.1...@equinor/fusion-framework-react@2.0.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.1...@equinor/fusion-framework-react@2.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@2.0.0...@equinor/fusion-framework-react@2.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.32...@equinor/fusion-framework-react@2.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.32...@equinor/fusion-framework-react@2.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.32](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.31...@equinor/fusion-framework-react@1.3.32) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.31](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.30...@equinor/fusion-framework-react@1.3.31) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.30](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.29...@equinor/fusion-framework-react@1.3.30) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.28...@equinor/fusion-framework-react@1.3.29) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.27...@equinor/fusion-framework-react@1.3.28) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.26...@equinor/fusion-framework-react@1.3.27) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.26](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.25...@equinor/fusion-framework-react@1.3.26) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.24...@equinor/fusion-framework-react@1.3.25) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.24](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.23...@equinor/fusion-framework-react@1.3.24) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.22...@equinor/fusion-framework-react@1.3.23) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.21...@equinor/fusion-framework-react@1.3.22) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.20...@equinor/fusion-framework-react@1.3.21) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.19...@equinor/fusion-framework-react@1.3.20) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.19 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.17...@equinor/fusion-framework-react@1.3.18) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.17 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.15...@equinor/fusion-framework-react@1.3.16) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.14...@equinor/fusion-framework-react@1.3.15) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.14 (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.12...@equinor/fusion-framework-react@1.3.13) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.11...@equinor/fusion-framework-react@1.3.12) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.11 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.9...@equinor/fusion-framework-react@1.3.10) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.8...@equinor/fusion-framework-react@1.3.9) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.7...@equinor/fusion-framework-react@1.3.8) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.7 (2022-11-11)

### Bug Fixes

- **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 1.3.6 (2022-11-03)

### Bug Fixes

- deprecate useFramework from hooks ([d3d9b24](https://github.com/equinor/fusion-framework/commit/d3d9b24fe56937e2c9feba7de4228d8eb1cbbec5))

## [1.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.4...@equinor/fusion-framework-react@1.3.5) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.3...@equinor/fusion-framework-react@1.3.4) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.2...@equinor/fusion-framework-react@1.3.3) (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.1...@equinor/fusion-framework-react@1.3.2) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.3.0...@equinor/fusion-framework-react@1.3.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.3.0 (2022-11-02)

### Features

- **framework-react:** create hook for current context ([4ee803f](https://github.com/equinor/fusion-framework/commit/4ee803fd0e457c3ec7414b35100e12186327fb6f))
- **framework-react:** react tooling for context ([b530114](https://github.com/equinor/fusion-framework/commit/b53011475a9c1a25b4e0756b66b57fd9b5711bbd))

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.2.0...@equinor/fusion-framework-react@1.2.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.1.1...@equinor/fusion-framework-react@1.2.0) (2022-11-01)

### Features

- **framework-react:** expose app hooks ([46c1ea2](https://github.com/equinor/fusion-framework/commit/46c1ea28f88cb3dd0ff350a589850c5cd9a45a88))

## 1.1.1 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.17...@equinor/fusion-framework-react@1.1.0) (2022-10-27)

### Features

- :sparkles: expose a single element for setup framework ([154e09f](https://github.com/equinor/fusion-framework/commit/154e09f027b7dea3015eb860fa530ce0f45dfa61))

## 1.0.17 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.15...@equinor/fusion-framework-react@1.0.16) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.14...@equinor/fusion-framework-react@1.0.15) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.14 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.12...@equinor/fusion-framework-react@1.0.13) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.12 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.9...@equinor/fusion-framework-react@1.0.10) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.8...@equinor/fusion-framework-react@1.0.9) (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.8 (2022-09-26)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.5...@equinor/fusion-framework-react@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.4...@equinor/fusion-framework-react@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.3...@equinor/fusion-framework-react@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.2...@equinor/fusion-framework-react@1.0.3) (2022-09-13)

### Bug Fixes

- update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.1...@equinor/fusion-framework-react@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.1-next.1...@equinor/fusion-framework-react@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.1-next.0...@equinor/fusion-framework-react@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@1.0.0...@equinor/fusion-framework-react@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

- **framework-react:** config is now object

### Features

- **framework-react:** update init ([f3e6e2b](https://github.com/equinor/fusion-framework/commit/f3e6e2ba7058b4b515ff0838516fe44705bfdf5c))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.3.3...@equinor/fusion-framework-react@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **framework-react:** config is now object

### Features

- **framework-react:** update init ([f3e6e2b](https://github.com/equinor/fusion-framework/commit/f3e6e2ba7058b4b515ff0838516fe44705bfdf5c))

## [0.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.3.2...@equinor/fusion-framework-react@0.3.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.3.1...@equinor/fusion-framework-react@0.3.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.3.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.3.0 (2022-09-05)

### Features

- **framework-react:** expose rect module http ([f6ab26f](https://github.com/equinor/fusion-framework/commit/f6ab26f2c4463ce9d0996027a48eb5ad9d94779a))

## [0.2.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.18...@equinor/fusion-framework-react@0.2.19) (2022-08-29)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.2.18 (2022-08-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.16...@equinor/fusion-framework-react@0.2.17) (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.2.16 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.14...@equinor/fusion-framework-react@0.2.15) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.13...@equinor/fusion-framework-react@0.2.14) (2022-08-11)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.2.13 (2022-08-08)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.11...@equinor/fusion-framework-react@0.2.12) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.10...@equinor/fusion-framework-react@0.2.11) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.9...@equinor/fusion-framework-react@0.2.10) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.8...@equinor/fusion-framework-react@0.2.9) (2022-07-06)

### Bug Fixes

- **framework-react:** remove legacy path ([fa82188](https://github.com/equinor/fusion-framework/commit/fa82188a7471a82fafacf26a1fc50a1703fe3944))

## [0.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.7...@equinor/fusion-framework-react@0.2.8) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.6...@equinor/fusion-framework-react@0.2.7) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.5...@equinor/fusion-framework-react@0.2.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.4...@equinor/fusion-framework-react@0.2.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.3...@equinor/fusion-framework-react@0.2.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.2...@equinor/fusion-framework-react@0.2.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.1...@equinor/fusion-framework-react@0.2.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.2.0...@equinor/fusion-framework-react@0.2.1) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-react

# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.19...@equinor/fusion-framework-react@0.2.0) (2022-06-24)

### Features

- **framework:** allow addtional modules ([d8d697b](https://github.com/equinor/fusion-framework/commit/d8d697b6fa8ea5c8130b324195d39f354d2fa768))

## [0.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.18...@equinor/fusion-framework-react@0.1.19) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.18](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.17...@equinor/fusion-framework-react@0.1.18) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.16...@equinor/fusion-framework-react@0.1.17) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.15...@equinor/fusion-framework-react@0.1.16) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.15 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.14 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.13 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.11...@equinor/fusion-framework-react@0.1.12) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.10...@equinor/fusion-framework-react@0.1.11) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.9...@equinor/fusion-framework-react@0.1.10) (2022-03-14)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.8...@equinor/fusion-framework-react@0.1.9) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.7...@equinor/fusion-framework-react@0.1.8) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.6...@equinor/fusion-framework-react@0.1.7) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.5...@equinor/fusion-framework-react@0.1.6) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.4...@equinor/fusion-framework-react@0.1.5) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.3...@equinor/fusion-framework-react@0.1.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.2...@equinor/fusion-framework-react@0.1.3) (2022-02-15)

**Note:** Version bump only for package @equinor/fusion-framework-react

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react@0.1.1...@equinor/fusion-framework-react@0.1.2) (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react

## 0.1.1 (2022-02-09)

### Bug Fixes

- **framework-react:** export Fusion ([94b150f](https://github.com/equinor/fusion-framework/commit/94b150ff9d1b5ad27c12f19160371edb464c88de))

# 0.1.0 (2022-02-07)

### Bug Fixes

- **framework-react:** typehint ([75d3793](https://github.com/equinor/fusion-framework/commit/75d37936aca967d17d192977337bae99f6aea277))
- **framework-react:** update name change ([e2382b7](https://github.com/equinor/fusion-framework/commit/e2382b70a7d7a8cd103cb33c2a839c5a34e315c9))
- memo http clients ([f876acb](https://github.com/equinor/fusion-framework/commit/f876acb11e19d7802a28f58ce7d70bc76f777c5e))
- **react:** fix typing ([9a2a51d](https://github.com/equinor/fusion-framework/commit/9a2a51dd76ed68ef95ef5c932555ae31165f16c2))
- shared context ([f00732e](https://github.com/equinor/fusion-framework/commit/f00732ee3c1016be812204c7cf7b0205b2322075))

### Features

- add package for creating framework in react ([3b6858d](https://github.com/equinor/fusion-framework/commit/3b6858dc9f6b8c0efd6aa51275693e068ac72bef))
- **react-app:** add hooks ([9bfcc5e](https://github.com/equinor/fusion-framework/commit/9bfcc5ebd721b19232e7896cee037637c716f09a))

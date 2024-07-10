# Change Log

## 5.2.4

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-app@9.1.4
    -   @equinor/fusion-framework-module-app@5.3.8
    -   @equinor/fusion-framework-react@7.1.3

## 5.2.3

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
    -   @equinor/fusion-framework-react-module@3.1.3
    -   @equinor/fusion-framework-module-navigation@4.0.3
    -   @equinor/fusion-framework-react-module-http@6.0.1
    -   @equinor/fusion-framework-react@7.1.2
    -   @equinor/fusion-framework-module-msal@3.1.2
    -   @equinor/fusion-framework-module-app@5.3.8
    -   @equinor/fusion-framework-app@9.1.3

## 5.2.2

### Patch Changes

-   Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb), [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526)]:
    -   @equinor/fusion-framework-module-app@5.3.7
    -   @equinor/fusion-framework-react@7.1.1
    -   @equinor/fusion-framework-app@9.1.2

## 5.2.1

### Patch Changes

-   Updated dependencies [[`b8d52ad`](https://github.com/equinor/fusion-framework/commit/b8d52adb2ca1f9857c672a3deb774409ff2bdb37)]:
    -   @equinor/fusion-framework-app@9.1.1

## 5.2.0

### Minor Changes

-   [#2181](https://github.com/equinor/fusion-framework/pull/2181) [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8) Thanks [@odinr](https://github.com/odinr)! - If you were previously using the `blob` or `blob# Change Log methods from the `IHttpClient`and expecting a`Blob`result, you must now use the new`BlobResult` type, which includes the filename (if available) and the blob data.

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

-   Updated dependencies [[`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
    -   @equinor/fusion-framework-app@9.1.0
    -   @equinor/fusion-framework-react@7.1.0
    -   @equinor/fusion-framework-module-app@5.3.6
    -   @equinor/fusion-framework-react-module-http@6.0.0

## 5.1.0

### Minor Changes

-   [#2180](https://github.com/equinor/fusion-framework/pull/2180) [`060a1aa`](https://github.com/equinor/fusion-framework/commit/060a1aa7f4f2ce6b1ddef527a219bf267e488500) Thanks [@odinr](https://github.com/odinr)! - ## @equinor/fusion-react

    ### What changed?

    The `useAppEnvironmentVariables` hook has been added to the `@equinor/fusion-react` package.
    This hook provides access to the application's environment variables, which are retrieved from the app module provided by the framework.

    ### Why the change?

    Previously, there was no built-in way to access the application's environment variables from the React components.
    This new hook fills that gap, making it easier for developers to retrieve and use the environment configuration in their applications.

    ### How to use the new feature

    To use the `useAppEnvironmentVariables` hook, simply import it and call it in your React component:

    ```typescript
    import { useAppEnvironmentVariables } from '@equinor/fusion-react';

    const MyComponent = () => {
      const env = useAppEnvironmentVariables<{ API_URL: string }>();

      if (!env.complete) {
        return <div>Loading environment variables...</div>;
      }

      if (env.error) {
        return <div>Error loading environment variables</div>;
      }

      return (
        <div>
          My environment variables: {JSON.stringify(env.value, null, 2)}
        </div>
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

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
    -   @equinor/fusion-framework-module@4.3.1
    -   @equinor/fusion-framework-app@9.0.9
    -   @equinor/fusion-framework-module-app@5.3.5
    -   @equinor/fusion-framework-module-msal@3.1.1
    -   @equinor/fusion-framework-module-navigation@4.0.2
    -   @equinor/fusion-framework-react@7.0.8
    -   @equinor/fusion-framework-react-module@3.1.2
    -   @equinor/fusion-framework-react-module-http@5.0.4

## 5.0.11

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.3.4
    -   @equinor/fusion-framework-app@9.0.8
    -   @equinor/fusion-framework-react@7.0.7

## 5.0.10

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.3.3
    -   @equinor/fusion-framework-app@9.0.7
    -   @equinor/fusion-framework-react@7.0.6

## 5.0.9

### Patch Changes

-   [#2096](https://github.com/equinor/fusion-framework/pull/2096) [`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5) Thanks [@odinr](https://github.com/odinr)! - update documentation

-   Updated dependencies [[`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5)]:
    -   @equinor/fusion-framework-module-navigation@4.0.1
    -   @equinor/fusion-framework-module-app@5.3.2
    -   @equinor/fusion-framework-app@9.0.6
    -   @equinor/fusion-framework-react@7.0.5

## 5.0.8

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-app@9.0.5
    -   @equinor/fusion-framework-module-app@5.3.1
    -   @equinor/fusion-framework-react-module-http@5.0.3
    -   @equinor/fusion-framework-react@7.0.4

## 5.0.7

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.3.1
    -   @equinor/fusion-framework-react@7.0.3
    -   @equinor/fusion-framework-app@9.0.4

## 5.0.6

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-app@9.0.3
    -   @equinor/fusion-framework-module-app@5.3.0
    -   @equinor/fusion-framework-react-module-http@5.0.2
    -   @equinor/fusion-framework-react@7.0.2

## 5.0.5

### Patch Changes

-   Updated dependencies [[`036ec15`](https://github.com/equinor/fusion-framework/commit/036ec151ace9c051ded41798ab94b8ee5e3d4461)]:
    -   @equinor/fusion-framework-app@9.0.2

## 5.0.4

### Patch Changes

-   [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

-   Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
    -   @equinor/fusion-framework-react-module@3.1.1
    -   @equinor/fusion-framework-react@7.0.1
    -   @equinor/fusion-framework-app@9.0.1
    -   @equinor/fusion-framework-react-module-http@5.0.1
    -   @equinor/fusion-framework-module-app@5.3.0

## 5.0.3

### Patch Changes

-   [#1963](https://github.com/equinor/fusion-framework/pull/1963) [`e0b95f1`](https://github.com/equinor/fusion-framework/commit/e0b95f1879ecfc108987073a58c3c3150c156aa8) Thanks [@eikeland](https://github.com/eikeland)! - Fixes type exports in package

## 5.0.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0
    -   @equinor/fusion-framework-react-module@3.1.0
    -   @equinor/fusion-framework-module-navigation@4.0.0
    -   @equinor/fusion-framework-react-module-http@5.0.0
    -   @equinor/fusion-framework-react@7.0.0
    -   @equinor/fusion-framework-module-msal@3.1.0
    -   @equinor/fusion-framework-module-app@5.3.0
    -   @equinor/fusion-framework-app@9.0.0

## 4.3.8

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-app@8.1.4
    -   @equinor/fusion-framework-react@6.0.5

## 4.3.7

### Patch Changes

-   Updated dependencies [[`2acd475`](https://github.com/equinor/fusion-framework/commit/2acd47532fe680f498fdf7229309cddb2594e391)]:
    -   @equinor/fusion-framework-module-app@5.2.14
    -   @equinor/fusion-framework-app@8.1.3
    -   @equinor/fusion-framework-react@6.0.4

## 4.3.6

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@6.0.3
    -   @equinor/fusion-framework-app@8.1.2

## 4.3.5

### Patch Changes

-   [#1852](https://github.com/equinor/fusion-framework/pull/1852) [`bdc50b0`](https://github.com/equinor/fusion-framework/commit/bdc50b035b9c20301105d17509937ff3d91ea027) Thanks [@odinr](https://github.com/odinr)! - chore: add missing exported type

## 4.3.4

### Patch Changes

-   [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Exposing Widget for app development.

## 4.3.3

### Patch Changes

-   Updated dependencies [[`2a813bc`](https://github.com/equinor/fusion-framework/commit/2a813bc0a32f53e7515f16f8b5cba1cf1e5018a3), [`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    -   @equinor/fusion-framework-react@6.0.2
    -   @equinor/fusion-framework-module@4.2.7
    -   @equinor/fusion-framework-app@8.1.1
    -   @equinor/fusion-framework-module-app@5.2.13
    -   @equinor/fusion-framework-module-msal@3.0.10
    -   @equinor/fusion-framework-module-navigation@3.1.4
    -   @equinor/fusion-framework-react-module@3.0.8
    -   @equinor/fusion-framework-react-module-http@4.0.6

## 4.3.2

### Patch Changes

-   [#1781](https://github.com/equinor/fusion-framework/pull/1781) [`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9) Thanks [@odinr](https://github.com/odinr)! - Added functionality for enabling feature flagging

    ```ts
    import { enableFeatureFlag } from `@equinor/fusion-framework-react-app/feature-flag`
    enableFeatureFlag(confgurator, [{
      id: 'my-flag',
      title: 'My flag'
    }])
    ```

    the user still needs to install `@equinor/fusion-framework-module-feature-flag`

-   Updated dependencies [[`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9)]:
    -   @equinor/fusion-framework-app@8.1.0

## 4.3.1

### Patch Changes

-   Updated dependencies [[`1ca8264`](https://github.com/equinor/fusion-framework/commit/1ca826489a0d1dd755324344a12bbf6659a3be12), [`fdbe12f`](https://github.com/equinor/fusion-framework/commit/fdbe12f258aeb98d91094f16f2d8ce229d7b13ee)]:
    -   @equinor/fusion-framework-module-app@5.2.13
    -   @equinor/fusion-framework-react@6.0.1
    -   @equinor/fusion-framework-app@8.0.1

## 4.3.0

### Minor Changes

-   [#1747](https://github.com/equinor/fusion-framework/pull/1747) [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e) Thanks [@odinr](https://github.com/odinr)! - refactor hook for accessing feature flags

    > [!IMPORTANT]
    > the `useFeature` hook look for flag in parent **(portal)** if not defined in application scope

    > [!CAUTION] > `@equinor/fusion-framework-react-app/feature-flag` will only return `useFeature`, since we don not see any scenario which an application would need to access multiple.
    > We might add `useFeatures` if the should be an use-case

### Patch Changes

-   Updated dependencies [[`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e), [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e)]:
    -   @equinor/fusion-framework-app@8.0.0
    -   @equinor/fusion-framework-react@6.0.0

## 4.2.1

### Patch Changes

-   [#1215](https://github.com/equinor/fusion-framework/pull/1215) [`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d) Thanks [@odinr](https://github.com/odinr)! - Adding PersonSidesheet to cli with featuretoggler

-   Updated dependencies []:
    -   @equinor/fusion-framework-react@5.3.9

## 4.2.0

### Minor Changes

-   [#1646](https://github.com/equinor/fusion-framework/pull/1646) [`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1) Thanks [@odinr](https://github.com/odinr)! - Created namespace for MSAL:

    -   Created hooks for accessing current authenticated account
    -   Created hooks for acquiring token
    -   Created hooks for acquiring access token

### Patch Changes

-   Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
    -   @equinor/fusion-framework-module-msal@3.0.9
    -   @equinor/fusion-framework-app@7.1.15
    -   @equinor/fusion-framework-module-app@5.2.12
    -   @equinor/fusion-framework-react@5.3.8
    -   @equinor/fusion-framework-react-module-http@4.0.5

## 4.1.19

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-app@7.1.14
    -   @equinor/fusion-framework-module-app@5.2.12
    -   @equinor/fusion-framework-react-module-http@4.0.4
    -   @equinor/fusion-framework-react@5.3.7

## 4.1.18

### Patch Changes

-   Updated dependencies [[`cce198d`](https://github.com/equinor/fusion-framework/commit/cce198d6a91fb7912265d4383246dc405cf17a17), [`f85316f`](https://github.com/equinor/fusion-framework/commit/f85316f2344258896a77ef602bd4047dfa553788)]:
    -   @equinor/fusion-framework-react-module-http@4.0.3
    -   @equinor/fusion-framework-app@7.1.13
    -   @equinor/fusion-framework-module-app@5.2.12
    -   @equinor/fusion-framework-react@5.3.6

## 4.1.17

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.2.12
    -   @equinor/fusion-framework-react@5.3.5
    -   @equinor/fusion-framework-app@7.1.12

## 4.1.16

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-module-navigation@3.1.3
    -   @equinor/fusion-framework-react@5.3.4
    -   @equinor/fusion-framework-module@4.2.6
    -   @equinor/fusion-framework-module-app@5.2.11
    -   @equinor/fusion-framework-app@7.1.11
    -   @equinor/fusion-framework-react-module@3.0.7
    -   @equinor/fusion-framework-react-module-http@4.0.2

## 4.1.15

### Patch Changes

-   Updated dependencies [[`6d303787`](https://github.com/equinor/fusion-framework/commit/6d303787f647bb2fc3c90456eccac751abb264c4)]:
    -   @equinor/fusion-framework-module-app@5.2.10
    -   @equinor/fusion-framework-app@7.1.10
    -   @equinor/fusion-framework-react@5.3.3

## 4.1.14

### Patch Changes

-   Updated dependencies [[`8274dca1`](https://github.com/equinor/fusion-framework/commit/8274dca10a773e1d29ffbce82a6f6f2bae818316)]:
    -   @equinor/fusion-framework-module-app@5.2.9
    -   @equinor/fusion-framework-app@7.1.9
    -   @equinor/fusion-framework-react@5.3.3

## 4.1.13

### Patch Changes

-   Updated dependencies [[`a8f0f061`](https://github.com/equinor/fusion-framework/commit/a8f0f061dbde9efb3e2faf11fdb9c886d2277723)]:
    -   @equinor/fusion-framework-module-navigation@3.1.2

## 4.1.12

### Patch Changes

-   Updated dependencies [[`e2ec89f4`](https://github.com/equinor/fusion-framework/commit/e2ec89f457135037e2a333a61ba546fee6d99cd8)]:
    -   @equinor/fusion-framework-module-navigation@3.1.1

## 4.1.11

### Patch Changes

-   Updated dependencies [[`6f542d4c`](https://github.com/equinor/fusion-framework/commit/6f542d4c7c01ae94c28b7e82efba800a902a7633)]:
    -   @equinor/fusion-framework-module-navigation@3.1.0

## 4.1.10

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.2.8
    -   @equinor/fusion-framework-app@7.1.8
    -   @equinor/fusion-framework-react@5.3.3

## 4.1.9

### Patch Changes

-   Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
    -   @equinor/fusion-framework-module-app@5.2.7
    -   @equinor/fusion-framework-app@7.1.7
    -   @equinor/fusion-framework-react@5.3.2

## 4.1.8

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-app@7.1.6
    -   @equinor/fusion-framework-module-app@5.2.6
    -   @equinor/fusion-framework-module@4.2.5
    -   @equinor/fusion-framework-module-navigation@3.0.6
    -   @equinor/fusion-framework-react@5.3.1
    -   @equinor/fusion-framework-react-module-http@4.0.1
    -   @equinor/fusion-framework-react-module@3.0.6

## 4.1.7

### Patch Changes

-   Updated dependencies [[`3896fbec`](https://github.com/equinor/fusion-framework/commit/3896fbec3458dbe2ebd66e772465d5f89cd20658)]:
    -   @equinor/fusion-framework-react@5.3.0
    -   @equinor/fusion-framework-app@7.1.5
    -   @equinor/fusion-framework-module-app@5.2.5
    -   @equinor/fusion-framework-react-module-http@4.0.0

## 4.1.6

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.2.4
    -   @equinor/fusion-framework-app@7.1.4
    -   @equinor/fusion-framework-react@5.2.7

## 4.1.5

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4
    -   @equinor/fusion-framework-module-app@5.2.4
    -   @equinor/fusion-framework-react@5.2.6
    -   @equinor/fusion-framework-app@7.1.3
    -   @equinor/fusion-framework-module-navigation@3.0.5
    -   @equinor/fusion-framework-react-module@3.0.5
    -   @equinor/fusion-framework-react-module-http@3.0.5

## 4.1.4

### Patch Changes

-   Updated dependencies []:
    -   @equinor/fusion-framework-module-app@5.2.3
    -   @equinor/fusion-framework-app@7.1.2
    -   @equinor/fusion-framework-react@5.2.5

## 4.1.3

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

    only dev deps updated should not affect any consumers

    see [react changelog](https://github.com/facebook/react/releases) for details

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-react-module@3.0.4
    -   @equinor/fusion-framework-module-navigation@3.0.4
    -   @equinor/fusion-framework-react-module-http@3.0.4
    -   @equinor/fusion-framework-react@5.2.4
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-framework-module-app@5.2.2
    -   @equinor/fusion-framework-app@7.1.1

## 4.1.2

### Patch Changes

-   [#959](https://github.com/equinor/fusion-framework/pull/959) [`ac889787`](https://github.com/equinor/fusion-framework/commit/ac88978763f7c2d2eee3b5154a0eac12a93bc5a8) Thanks [@odinr](https://github.com/odinr)! - create a hook which returns the current `ContextProvider`

    example

    ```ts
    import { useContextProvider } from '@equinor/fusion-framework-react-app/context';
    const App = () => {
        const contextProvider = useContextProvider();
    };
    ```

## 4.1.1

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework-app@7.0.16
    -   @equinor/fusion-framework-module-navigation@3.0.1
    -   @equinor/fusion-framework-react@5.2.2

## 4.1.0

### Minor Changes

-   [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - **Add tooling for navigation in React App package**

    -   add hook for using the navigation module
    -   add hook for creating a react router

    ```ts
    const routes = [
        {
            path: '/',
            element: <p>👍🏻</p>,
        },
    ];

    const Router = () => {
        const router = useRouter(routes);
        return <RouterProvider router={router} fallbackElement={<p>😥</p>} />;
    };

    const App = () => <Router />;
    ```

-   [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - hook `useAppModule` now throws error if requested module is not configured

### Patch Changes

-   [#934](https://github.com/equinor/fusion-framework/pull/934) [`ea081696`](https://github.com/equinor/fusion-framework/commit/ea0816967244917b01a3aa43b75cd3cf59573958) Thanks [@odinr](https://github.com/odinr)! - updated cookbook for routing ([documentation](https://equinor.github.io/fusion-framework/modules/navigation/))

## 4.0.17

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-app@7.0.15
    -   @equinor/fusion-framework-react@5.1.4
    -   @equinor/fusion-framework-react-module-http@3.0.3

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

-   **react-app:** allow broader component type when creating react framework component ([a0c9187](https://github.com/equinor/fusion-framework/commit/a0c9187aa8861f48e6b62ea848cf951a75d02c1b))

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

-   **react-app:** ts-ignore for type error ([b1b3eb7](https://github.com/equinor/fusion-framework/commit/b1b3eb7da1a35eb9ad7461aa4ee15f58d4de9766))

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

-   **react-app:** cleanup tsconfig ([1283609](https://github.com/equinor/fusion-framework/commit/1283609ad137c7956fe2181fba97b0050638c553))

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

-   **react-app:** check if manifest is provided in env ([e41b6d1](https://github.com/equinor/fusion-framework/commit/e41b6d1c9006f7d55933a6375861d96126498015))

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

-   **react-app:** update typing of legacy-app ([d4dbbb0](https://github.com/equinor/fusion-framework/commit/d4dbbb0a326cb6b54bb3a2348fd7961b3abf4ba7))

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

-   **react-app:** fix optional dependencie version react-module-context ([4149ce6](https://github.com/equinor/fusion-framework/commit/4149ce625ffc330d69becde1d66f4d894c22c9f3))

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

-   **react-app:** expose interface from framework-app ([a01aee3](https://github.com/equinor/fusion-framework/commit/a01aee3a32a74c821fdc93624aaf4173c0fcc4e1))

## [1.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.2...@equinor/fusion-framework-react-app@1.3.3) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.1...@equinor/fusion-framework-react-app@1.3.2) (2022-11-18)

### Bug Fixes

-   basename in app render ([ae75815](https://github.com/equinor/fusion-framework/commit/ae75815877701c364f853413b29ad4f053d9c2c2))

## [1.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.3.0...@equinor/fusion-framework-react-app@1.3.1) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.2.15...@equinor/fusion-framework-react-app@1.3.0) (2022-11-17)

### Features

-   **module-navigation:** initial ([891e69d](https://github.com/equinor/fusion-framework/commit/891e69d9a98ba02ee1f9dd1c5b0cb31ff1b5fd0f))

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

-   **react-app:** adjust function for creating components ([c986a4a](https://github.com/equinor/fusion-framework/commit/c986a4ac8aeb57035eb555ed07b86b1792b09900))

## 1.2.6 (2022-11-03)

### Bug Fixes

-   deprecate useFramework from hooks ([d3d9b24](https://github.com/equinor/fusion-framework/commit/d3d9b24fe56937e2c9feba7de4228d8eb1cbbec5))

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

-   deprecate app-config ([1f24abc](https://github.com/equinor/fusion-framework/commit/1f24abc5125b0526c64973fe0b063a9c33d532b0))
-   **react-app:** react tooling for context ([84a2624](https://github.com/equinor/fusion-framework/commit/84a26242f73da2d77b1468b7724da56b2add590b))

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.1.0...@equinor/fusion-framework-react-app@1.1.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.23...@equinor/fusion-framework-react-app@1.1.0) (2022-11-01)

### Features

-   **framework:** implement module-app ([dc917f0](https://github.com/equinor/fusion-framework/commit/dc917f019da852fbd93eaf6ed7bc4a3a7e6f0d68))

## 1.0.23 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.21...@equinor/fusion-framework-react-app@1.0.22) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.21](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.20...@equinor/fusion-framework-react-app@1.0.21) (2022-10-27)

### Bug Fixes

-   :fire: rewrite hook for getting app config ([cc862ba](https://github.com/equinor/fusion-framework/commit/cc862ba3c23608be6d3406b9cf35d20af6eccb97))

## [1.0.20](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.19...@equinor/fusion-framework-react-app@1.0.20) (2022-10-26)

### Bug Fixes

-   **react-app:** :fire: update render env args with typing ([06bd3c7](https://github.com/equinor/fusion-framework/commit/06bd3c75218981f54216f76d3b7a667110dac3ae))

## 1.0.19 (2022-10-21)

### Bug Fixes

-   **react-app:** improve app module hook ([ffb66e3](https://github.com/equinor/fusion-framework/commit/ffb66e3f488bf9c28870824b4d42748e5d072364))

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

-   **react-app:** update typing of module instance ([b656a24](https://github.com/equinor/fusion-framework/commit/b656a24b2c0daac647994c1468dd8f14438fba2e))

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

-   **react-app:** expose module http ([fcd50b7](https://github.com/equinor/fusion-framework/commit/fcd50b7359fda49617000ccbca810cbcc1d6553b))

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.5...@equinor/fusion-framework-react-app@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.4...@equinor/fusion-framework-react-app@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.3...@equinor/fusion-framework-react-app@1.0.4) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@1.0.2...@equinor/fusion-framework-react-app@1.0.3) (2022-09-13)

### Bug Fixes

-   update typings and linting ([7d2056b](https://github.com/equinor/fusion-framework/commit/7d2056b7866850b7efdfd4567385b5dbbcdf8761))

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

-   **react-app:** config is now object

### Features

-   **react-app:** update init ([a41f102](https://github.com/equinor/fusion-framework/commit/a41f102e2fee94ec4e29b567cf867465c672f16f))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.8.0...@equinor/fusion-framework-react-app@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

-   **react-app:** config is now object

### Features

-   **react-app:** update init ([a41f102](https://github.com/equinor/fusion-framework/commit/a41f102e2fee94ec4e29b567cf867465c672f16f))

## [0.8.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.7.3...@equinor/fusion-framework-react-app@0.8.0) (2022-09-09)

### Features

-   **react-app:** create legacy app ([4ae10ab](https://github.com/equinor/fusion-framework/commit/4ae10ab4aec50d9e92ce4cb0c74a1405a0dcc36e))

## [0.7.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.7.2...@equinor/fusion-framework-react-app@0.7.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.7.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.7.1...@equinor/fusion-framework-react-app@0.7.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.7.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.7.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.6.1...@equinor/fusion-framework-react-app@0.7.0) (2022-09-05)

### Features

-   **react-app:** expose http client ([91b9930](https://github.com/equinor/fusion-framework/commit/91b9930f404772bd58ce043b6987aaffc8324654))

## 0.6.1 (2022-09-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.5.1...@equinor/fusion-framework-react-app@0.6.0) (2022-08-29)

### ⚠ BREAKING CHANGES

-   rename fetch

-   fix(module-service-discovery): update http client consumer

-   build: update allowed branches

-   build: add conventional commit

-   build: use conventionalcommits

-   build(module-http): push major

-   build: update deps

### Features

-   rename fetch method ([#226](https://github.com/equinor/fusion-framework/issues/226)) ([f02df7c](https://github.com/equinor/fusion-framework/commit/f02df7cdd2b9098b0da49c5ea56ac3b6a17e9e32))

## [0.5.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.5.0...@equinor/fusion-framework-react-app@0.5.1) (2022-08-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

# 0.5.0 (2022-08-22)

### Features

-   **react-app:** use event module ([21cf7f9](https://github.com/equinor/fusion-framework/commit/21cf7f98eafb8a4d970f3d2d9f56d56046da1321))

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

-   **react-app:** implement app config for react apps ([b367e55](https://github.com/equinor/fusion-framework/commit/b367e550b1868ed30b067a9bfd99db09b269d862))

# 0.3.0 (2022-08-05)

### Features

-   **react-app:** implement react framework modules ([#195](https://github.com/equinor/fusion-framework/issues/195)) ([acb0db3](https://github.com/equinor/fusion-framework/commit/acb0db36bff74c7838c48297179cf644db6cc8ca))

## [0.2.29](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.28...@equinor/fusion-framework-react-app@0.2.29) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.28](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.27...@equinor/fusion-framework-react-app@0.2.28) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## [0.2.27](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.2.26...@equinor/fusion-framework-react-app@0.2.27) (2022-08-01)

### Bug Fixes

-   expose framework in react-app package ([9dc2e5b](https://github.com/equinor/fusion-framework/commit/9dc2e5b2ec27344fbb390248abdbb73caed297cc))

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

-   **module-service-discovery:** allow custom service discovery ([8917e4e](https://github.com/equinor/fusion-framework/commit/8917e4e3053b824ac8d878b0bfbe6a22efd56c3b))

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-app@0.1.1...@equinor/fusion-framework-react-app@0.1.2) (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-react-app

# 0.1.0 (2022-02-07)

### Bug Fixes

-   memo http clients ([f876acb](https://github.com/equinor/fusion-framework/commit/f876acb11e19d7802a28f58ce7d70bc76f777c5e))
-   **react-app:** await configuration of app ([a71484b](https://github.com/equinor/fusion-framework/commit/a71484b17f2b6575aedefb0bdbc7965ffffae5e8))
-   **react-app:** expose http interface ([441facd](https://github.com/equinor/fusion-framework/commit/441facdc32f71391683b33db394f34e966772faf))
-   **react-app:** fix AppConfigurator interface ([e5a8a21](https://github.com/equinor/fusion-framework/commit/e5a8a21ff6a558876e3db9a2596e891d9abea0cd))
-   **react-app:** include fusion modules in init of app ([1d7ffc3](https://github.com/equinor/fusion-framework/commit/1d7ffc3c203c7d7dda3d05abf4e8ffb396de04b4))
-   **react-app:** rename of file ([6e3b758](https://github.com/equinor/fusion-framework/commit/6e3b758aec7e020d05912c2a80f398cd0b790a8b))
-   **react-app:** update typeing ([20495bd](https://github.com/equinor/fusion-framework/commit/20495bdf2a1d67aed2b03ff1b07f5c38f02a8d9d))
-   removed duplicate declaration of Component ([6db1b74](https://github.com/equinor/fusion-framework/commit/6db1b74304a3abd145b0b0268a20c5693743871a))
-   shared context ([f00732e](https://github.com/equinor/fusion-framework/commit/f00732ee3c1016be812204c7cf7b0205b2322075))

### Features

-   add package for creating react app ([c478025](https://github.com/equinor/fusion-framework/commit/c478025a057d1e6b38cd33189fe24580e58fc32b))
-   **react-app:** add hooks ([9bfcc5e](https://github.com/equinor/fusion-framework/commit/9bfcc5ebd721b19232e7896cee037637c716f09a))
-   **reat-app:** add default modules ([74bf60e](https://github.com/equinor/fusion-framework/commit/74bf60ec07ea9573901d4160de5d4252e6e9c167))

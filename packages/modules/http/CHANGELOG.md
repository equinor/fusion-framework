# Change Log

## 6.0.1

### Patch Changes

-   [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - Updated documentation in `README.md` for http module.

    -   added introduction to http module
    -   added concepts section which highlights the key concepts of http module
    -   added sequence diagram for http request execution
    -   added examples for http module
    -   improved documentation for configuring http module
    -   improved documentation for working with http clients
    -   improved the formatting of the documentation

-   [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

-   [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - Updated TsDoc for http module

-   [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - - Added a new type `ResponseSelector<TResult, TResponse>`: a function that takes a `Response` object and returns an observable stream of type `TResult`. The `ResponseSelector` type has two template parameters: `TResult` and `TResponse`.

    -   Updated the `FetchRequestInit` type to include a new property `selector` of type `ResponseSelector<TReturn, TResponse>`, which allows specifying a response selector function.
    -   Updated the blob-selector and json-selector functions to use the new `ResponseSelector` type.

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
    -   @equinor/fusion-framework-module-msal@3.1.2

## 6.0.0

### Major Changes

-   [#2181](https://github.com/equinor/fusion-framework/pull/2181) [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8) Thanks [@odinr](https://github.com/odinr)! - The `blob` and `blob# Change Log methods in the `HttpClient` class have been updated to provide a more robust and flexible API for fetching blob resources.

    1. The `blob` and `blob# Change Log methods now accept an optional `args`parameter of type`FetchRequestInit<T, TRequest, TResponse>`, where `T` is the type of the expected blob result. This allows consumers to customize the fetch request and response handling.
    2. The `blob` and `blob# Change Log methods now return a `Promise<T>`and`StreamResponse<T>`respectively, where`T` is the type of the expected blob result. This allows consumers to handle the blob data in a more type-safe manner.
    3. The `blobSelector` function has been updated to extract the filename (if available) from the `content-disposition` header and return it along with the blob data in a `BlobResult` object.
    4. If you were previously using the `blob` or `blob# Change Log methods and expecting a `Blob`result, you must now use the new`BlobResult` type, which includes the filename (if available) and the blob data.

    > [!WARNING]
    > This alters the return type of the `blob` and `blob# Change Log methods, which is a **breaking change**.

    Example:

    ```typescript
    const blobResult = await httpClient.blob('/path/to/blob');
    console.log(blobResult.filename); // 'example.pdf'
    console.log(blobResult.blob); // Blob instance
    ```

    1. If you were providing a custom selector function to the `blob` or `blob# Change Log methods, you can now use the new `BlobResult` type in your selector function.

    Example:

    ```typescript
    const customBlobSelector = async (
        response: Response,
    ): Promise<{ filename: string; blob: Blob }> => {
        // Extract filename and blob from the response
        const { filename, blob } = await blobSelector(response);
        return { filename, blob };
    };

    const blobResult = await httpClient.blob('/path/to/blob', { selector: customBlobSelector });
    console.log(blobResult.filename); // 'example.pdf'
    console.log(blobResult.blob); // Blob instance
    ```

    3. If you were using the `blob# Change Log method and expecting a `StreamResponse<Blob>`, you can now use the new `StreamResponse<T>`type, where`T` is the type of the expected blob result.

    Example:

    ```typescript
    const blobStream = httpClient.blob$('/path/to/blob');
    blobStream.subscribe((blobResult) => {
        console.log(blobResult.filename); // 'example.pdf'
        console.log(blobResult.blob); // Blob instance
    });
    ```

### Patch Changes

-   [#2196](https://github.com/equinor/fusion-framework/pull/2196) [`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1) Thanks [@odinr](https://github.com/odinr)! - The `jsonSelector` function was not checking the error type in the `catch` block.
    This lead to not throwing the error with parsed data, but always throwing a parser error, where the correct error was `cause` in the `ErrorOptions`

    **BREAKING CHANGE:**

    If for some reason developers has catched the error and assumed the `cause` property would give the proper error data, this will no longer be the case.

    ```ts
    try {
        await jsonSelector(response);
    } catch (error) {
        if (error instanceof HttpJsonResponseError) {
            const { data, cause } = error;
            if (data) {
                console.error('the request was not `ok`, see provided error data', data);
            } else {
                console.error('failed to parse data from response, see provided cause', cause);
            }
        }
    }
    ```

    ```diff
    try {
      await jsonSelector(response);
    } catch (error) {
      if(error instanceof HttpJsonResponseError) {
    -    const data = error.cause instanceof HttpJsonResponseError ? err.cause.data : null;
    +    const data = error instanceof HttpJsonResponseError ? error.data : null;
        if(data) {
          console.error('the request was not `ok`, see provided error data', data);
        } else {
          console.error('failed to parse data from response, see provided cause', error.cause);
        }
      }
    }
    ```

## 5.2.3

### Patch Changes

-   Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
    -   @equinor/fusion-framework-module@4.3.1
    -   @equinor/fusion-framework-module-msal@3.1.1

## 5.2.2

### Patch Changes

-   [#2073](https://github.com/equinor/fusion-framework/pull/2073) [`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3) Thanks [@eikeland](https://github.com/eikeland)! - Removing type module in package.json

## 5.2.1

### Patch Changes

-   [#2043](https://github.com/equinor/fusion-framework/pull/2043) [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee) Thanks [@odinr](https://github.com/odinr)! - Added test for http client, to check if configured operators are not altered

-   [#2043](https://github.com/equinor/fusion-framework/pull/2043) [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee) Thanks [@odinr](https://github.com/odinr)! - When adding operators to request and response handler to an http client instanstance, the values where added to the configured handlers permanently

    ```ts
    // create a new client from configuration
    const fooClient = provider.createClient('foo');
    fooClient.requestHandler.setHeader('x-foo', 'bar');

    // generate a RequestInit object
    const fooRequest = await lastValueFrom(
        fooClient.requestHandler.process({ path: '/api', uri: fooClient.uri }),
    );

    expect((fooRequest.headers as Headers)?.get('x-foo')).toBe('bar');

    // create a new client from the same configuration
    const barClient = provider.createClient('foo');

    // generate a RequestInit object
    const barRequest = await lastValueFrom(
        barClient.requestHandler.process({ path: '/api', uri: barClient.uri }),
    );

    // expect the request header to not been modified
    // FAILED
    expect((barRequest.headers as Headers)?.get('x-foo')).toBeUndefined();
    ```

    modified the `ProcessOperators` to accept operators on creation, which are clone to the instance.

    ```diff
    --- a/packages/modules/http/src/lib/client/client.ts
    +++ a/packages/modules/http/src/lib/client/client.ts
    constructor(
        public uri: string,
        options?: Partial<HttpClientCreateOptions<TRequest, TResponse>>,
    ) {
    -   this.requestHandler = options?.requestHandler ?? new HttpRequestHandler<TRequest>();
    +   this.requestHandler = new HttpRequestHandler<TRequest>(options?.requestHandler);
    -   this.responseHandler = options?.responseHandler ?? new HttpResponseHandler<TResponse>();
    +   this.responseHandler = new HttpResponseHandler<TResponse>(options?.responseHandler);
        this._init();
    }

    ```

## 5.2.0

### Minor Changes

-   [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

-   Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
    -   @equinor/fusion-framework-module@4.3.0
    -   @equinor/fusion-framework-module-msal@3.1.0

## 5.1.6

### Patch Changes

-   Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
    -   @equinor/fusion-framework-module@4.2.7
    -   @equinor/fusion-framework-module-msal@3.0.10

## 5.1.5

### Patch Changes

-   Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
    -   @equinor/fusion-framework-module-msal@3.0.9

## 5.1.4

### Patch Changes

-   [#1625](https://github.com/equinor/fusion-framework/pull/1625) [`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - fix import from non specified export (moduleResolution: bundler)

## 5.1.3

### Patch Changes

-   [#1621](https://github.com/equinor/fusion-framework/pull/1621) [`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee) Thanks [@odinr](https://github.com/odinr)! - **Improves error handling when processing json http response**

    In packages/modules/http/src/errors.ts:

    -   The class HttpResponseError now has a generic parameter TResponse.
        -   Added a static property Name to the class.
    -   Added a new class HttpJsonResponseError which extends HttpResponseError and also has generic parameters TType and TResponse.
        -   Added a static property Name to the class.
        -   Added a public property data of type TType.
        -   Modified the constructor to accept an optional data parameter.

    In packages/modules/http/src/lib/selectors/json-selector.ts:

    -   Added an import statement for HttpJsonResponseError.
    -   Modified the jsonSelector function to handle errors when parsing the response.
        -   Added a try-catch block.
        -   Changed the JSON parsing logic to store the parsed data in a variable data.
        -   If the response is not OK, a HttpJsonResponseError is thrown with the appropriate error message, response object, and data property.
        -   If there is an error parsing the response, a HttpJsonResponseError is thrown with the appropriate error message, response object, and cause property.

## 5.1.2

### Patch Changes

-   [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

-   Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
    -   @equinor/fusion-framework-module@4.2.6
    -   @equinor/fusion-framework-module-msal@3.0.8

## 5.1.1

### Patch Changes

-   [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

-   Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
    -   @equinor/fusion-framework-module@4.2.5
    -   @equinor/fusion-framework-module-msal@3.0.7

## 5.1.0

### Minor Changes

-   [#1242](https://github.com/equinor/fusion-framework/pull/1242) [`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa) Thanks [@odinr](https://github.com/odinr)! - add method for executing blob requests

    -   added selector for extracting blob from response
    -   added function for fetching blob as stream or promise on the http client

    ```tsx
    const data = await client.blob('/person/photo');
    const url = URL.createObjectURL(blob);
    return <img src={url} />;
    ```

## 5.0.6

### Patch Changes

-   Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
    -   @equinor/fusion-framework-module@4.2.4
    -   @equinor/fusion-framework-module-msal@3.0.6

## 5.0.5

### Patch Changes

-   [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

-   [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

-   [#1163](https://github.com/equinor/fusion-framework/pull/1163) [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3) Thanks [@odinr](https://github.com/odinr)! - Append `Accecpt: application/json` to request headers

    when using the `json# Change Log or `json`function on the`HttpClient`add`Accecpt: application/json` to the request header

-   Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
    -   @equinor/fusion-framework-module@4.2.3
    -   @equinor/fusion-framework-module-msal@3.0.5

## 5.0.4

### Patch Changes

-   [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

-   Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
    -   @equinor/fusion-framework-module@4.2.1
    -   @equinor/fusion-framework-module-msal@3.0.4

## 5.0.3

### Patch Changes

-   [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    -   align all versions of typescript
    -   update types to build
        -   a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

-   Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
    -   @equinor/fusion-framework-module@4.2.0
    -   @equinor/fusion-framework-module-msal@3.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 5.0.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 5.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 5.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 4.0.2 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@4.0.0...@equinor/fusion-framework-module-http@4.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 4.0.0 (2023-02-22)

### ⚠ BREAKING CHANGES

-   **modules/http:** `IHttpClient.execute` is removed, most likely not used, too complex to maintain

### Bug Fixes

-   **modules/http:** fix typing for json requests ([459df80](https://github.com/equinor/fusion-framework/commit/459df80bfc79426ec6507db8f06d488b6a3d0f07))

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.2.3...@equinor/fusion-framework-module-http@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.2.3...@equinor/fusion-framework-module-http@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.2.3 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.2.2 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.2.1 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.1.8...@equinor/fusion-framework-module-http@2.2.0) (2022-12-08)

### Features

-   **http:** throw error when selector error ([dc0aa35](https://github.com/equinor/fusion-framework/commit/dc0aa35cbc44fb0503a9431ab728b81d8a3af290))

## 2.1.8 (2022-12-06)

### Bug Fixes

-   **module-http:** adding missing types on module-http iHttpClient ([ac6e81e](https://github.com/equinor/fusion-framework/commit/ac6e81e54d70b8a943466046fcbe86f6bd7c4c67))

## 2.1.7 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.6 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.5 (2022-11-18)

### Bug Fixes

-   **module-http:** add headers to json request ([8223394](https://github.com/equinor/fusion-framework/commit/8223394362a24663bf65442025f0b031aa37a910))

## 2.1.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.3 (2022-11-11)

### Bug Fixes

-   **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 2.1.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.0 (2022-11-01)

### Features

-   :necktie: remove try catch from json-selector ([fe5e2ea](https://github.com/equinor/fusion-framework/commit/fe5e2ea087cdee99403175e912eb09479b86414e))
-   :sparkles: return undefined on status code 204 ([af1eea7](https://github.com/equinor/fusion-framework/commit/af1eea7a9ef539a44c3cab69904b4764f169caa6))

### Reverts

-   :rewind: revert changes in json-selector ([8c448e5](https://github.com/equinor/fusion-framework/commit/8c448e5c76fb20cbd908c95f2fbd9d8d0367aad1))

## 2.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.11...@equinor/fusion-framework-module-http@2.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.0.10 (2022-10-03)

### Bug Fixes

-   **module-http:** allow typing of fetch request ([de08783](https://github.com/equinor/fusion-framework/commit/de0878342d82249ffc7e1212230d0aa0e14d32cb))

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.8...@equinor/fusion-framework-module-http@2.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.0.8 (2022-09-27)

### Bug Fixes

-   update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 2.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.5...@equinor/fusion-framework-module-http@2.0.6) (2022-09-16)

### Bug Fixes

-   **module-http:** fix export ([06a490d](https://github.com/equinor/fusion-framework/commit/06a490d40e34d2074ac102ac4fcd458cadd3538a))
-   **module-http:** improve hierarchy ([3603347](https://github.com/equinor/fusion-framework/commit/36033474991288983490f250726a551f7ce3dcbd))

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.4...@equinor/fusion-framework-module-http@2.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.3...@equinor/fusion-framework-module-http@2.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.2...@equinor/fusion-framework-module-http@2.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.1...@equinor/fusion-framework-module-http@2.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.1-next.1...@equinor/fusion-framework-module-http@2.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.1-next.0...@equinor/fusion-framework-module-http@2.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.0...@equinor/fusion-framework-module-http@2.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.0.0 (2022-09-12)

### Features

-   **module-http:** expose simple config ([94e4d6b](https://github.com/equinor/fusion-framework/commit/94e4d6bbb7fef010cd72e49242d68ed155592e11))

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@1.0.2...@equinor/fusion-framework-module-http@2.0.0-alpha.0) (2022-09-12)

### Features

-   **module-http:** expose simple config ([94e4d6b](https://github.com/equinor/fusion-framework/commit/94e4d6bbb7fef010cd72e49242d68ed155592e11))

## 1.0.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 1.0.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 1.0.0 (2022-08-29)

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

## 0.6.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.6.0...@equinor/fusion-framework-module-http@0.6.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.5.0...@equinor/fusion-framework-module-http@0.6.0) (2022-08-11)

-   feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

-   module.initialize now has object as arg

# 0.5.0 (2022-08-08)

### Bug Fixes

-   **module-http:** expose FetchRequest ([3d14ead](https://github.com/equinor/fusion-framework/commit/3d14ead0d78b36db091c6645ff1b69101e1f911f))

### Features

-   **module-service-discovery:** resolve service to config ([3fa088d](https://github.com/equinor/fusion-framework/commit/3fa088d2ced8136447df6949928f1af9fc83407a))

# [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.10...@equinor/fusion-framework-module-http@0.4.0) (2022-08-04)

-   feat(module)!: allow requireing module instnce (#190) ([3a7e67e](https://github.com/equinor/fusion-framework/commit/3a7e67e9accb5185100325c92d5850a44626e498)), closes [#190](https://github.com/equinor/fusion-framework/issues/190)

### BREAKING CHANGES

-   `deps` prop is remove from module object, use `await require('MODULE')`;

-   feat(module)!: allow requireing module instnce

when module initiates it should be allowed to await an required module.

-   add method for awaiting required module
-   add typing for config in initialize fase

-   update service discovery to await http module
-   add service discovery client
-   allow configuration of service discovery client

*   `deps` prop is remove from module object, use `await require('MODULE')`;

*   fix(module-http): add default interface for HttpClientOptions

## [0.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.9...@equinor/fusion-framework-module-http@0.3.10) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 0.3.9 (2022-08-01)

### Bug Fixes

-   change typo of exports ([b049503](https://github.com/equinor/fusion-framework/commit/b049503511fb1b37b920b00aed1468ed8385a67e))

## [0.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.7...@equinor/fusion-framework-module-http@0.3.8) (2022-07-01)

### Bug Fixes

-   **module-http:** fix selector of client ([dcc4774](https://github.com/equinor/fusion-framework/commit/dcc477489b51aa988a97494ff553eee34404469d))

## [0.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.6...@equinor/fusion-framework-module-http@0.3.7) (2022-07-01)

### Bug Fixes

-   **module-http:** make rxjs dependent ([a20286f](https://github.com/equinor/fusion-framework/commit/a20286f950ff10c84605c025354cb05280c7455a))

## [0.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.5...@equinor/fusion-framework-module-http@0.3.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [0.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.4...@equinor/fusion-framework-module-http@0.3.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [0.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.3...@equinor/fusion-framework-module-http@0.3.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [0.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.2...@equinor/fusion-framework-module-http@0.3.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.1...@equinor/fusion-framework-module-http@0.3.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 0.3.1 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# 0.3.0 (2022-06-14)

### Features

-   **module-http:** expose response processor ([e4551c5](https://github.com/equinor/fusion-framework/commit/e4551c549654ef25f33eef72ebc2fcc02ab552a2))

## 0.2.2 (2022-06-13)

### Bug Fixes

-   **module-http:** reutrn fallb ack config ([8ece469](https://github.com/equinor/fusion-framework/commit/8ece469e99bd64c10a7697d49fdcc5d396737ac8))

## 0.2.1 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# 0.2.0 (2022-05-31)

### Features

-   **module-http:** add json support ([a6adbbb](https://github.com/equinor/fusion-framework/commit/a6adbbb36ca1391f8813be6141ef963031098764))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# 0.1.0 (2022-02-07)

### Bug Fixes

-   expose http client interface ([8660822](https://github.com/equinor/fusion-framework/commit/8660822b669e549bd454aa8a6a0adcaeb5e7917f))
-   **module-http:** allow defaultScopes ([d476de9](https://github.com/equinor/fusion-framework/commit/d476de99e6289e60684f02bcd7b669e23f3789bb))
-   **module-http:** fix check if config when creating client ([950ebc1](https://github.com/equinor/fusion-framework/commit/950ebc18f8f35bb7e6f97d6a98bd91d87616a94e))
-   **module-http:** fix merge of process operators ([5a1d6d2](https://github.com/equinor/fusion-framework/commit/5a1d6d2942475c61c994f4ec26812c949cabbdf1))
-   **module-http:** fix relative url resolve ([0d8c311](https://github.com/equinor/fusion-framework/commit/0d8c311c66b52eec22d465e0db57fa003506ab0c))

### Features

-   add module for http clients ([7b02db7](https://github.com/equinor/fusion-framework/commit/7b02db7c2e34b97659bc72af7b5b31307cf55e5f))
-   http client base uri ([233cabf](https://github.com/equinor/fusion-framework/commit/233cabfea0f2b07955670e553472427ec27a3aa0))
-   **module-http:** add check for registered client keys ([93b42f8](https://github.com/equinor/fusion-framework/commit/93b42f88ad092e24fe4f1a216394893128d35734))
-   **module-http:** allow selector for http requests ([ea300c8](https://github.com/equinor/fusion-framework/commit/ea300c8ad5555e4514b35ac43a4c8494461afd91))

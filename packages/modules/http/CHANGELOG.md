# Change Log

## 7.0.7-next.0

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab)]:
  - @equinor/fusion-framework-module@5.0.6-next.1
  - @equinor/fusion-framework-module-msal@6.0.6-next.0

## 7.0.6

### Patch Changes

- [#3866](https://github.com/equinor/fusion-framework/pull/3866) [`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: Dedupe zod dependency to 4.3.5

  Deduplicated zod dependency to version 4.3.5 across all packages using `pnpm dedupe`. This aligns all packages (AI plugins upgraded from v3.25.76, other packages consolidated from v4.1.8/v4.1.11) to use the same latest stable version, improving consistency and reducing bundle size. All builds, tests, and linting pass successfully.

- Updated dependencies [[`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-module-msal@6.0.5

## 7.0.5

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Update HTTP module to use new MSAL token acquisition API format.

  Changes `acquireAccessToken` call from `{ scopes }` to `{ request: { scopes } }` to maintain compatibility with MSAL v4 API changes.

  Migration: No action required. This is an internal API compatibility fix.

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-msal@6.0.0

## 7.0.4

### Patch Changes

- [#3544](https://github.com/equinor/fusion-framework/pull/3544) [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.11 to 4.1.12, which includes a critical bug fix for ZodError.flatten() preventing crashes on 'toString' key and improved error handling throughout the framework.

- Updated dependencies [[`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59), [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74)]:
  - @equinor/fusion-framework-module@5.0.5
  - @equinor/fusion-framework-module-msal@5.1.2

## 7.0.3

### Patch Changes

- [#3594](https://github.com/equinor/fusion-framework/pull/3594) [`6900d98`](https://github.com/equinor/fusion-framework/commit/6900d98142c84f4703095f8d03b09af57a1d7d2e) Thanks [@odinr](https://github.com/odinr)! - Fix HttpClientProvider to extend BaseModuleProvider, ensuring proper module interface implementation and preventing configuration errors.

- Updated dependencies [[`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be)]:
  - @equinor/fusion-framework-module@5.0.4
  - @equinor/fusion-framework-module-msal@5.1.1

## 7.0.2

### Patch Changes

- [#3541](https://github.com/equinor/fusion-framework/pull/3541) [`a66d70a`](https://github.com/equinor/fusion-framework/commit/a66d70a9fa40ab14f2534be4f22b6d1f602097a0) Thanks [@odinr](https://github.com/odinr)! - Fixed capitalizeRequestMethodOperator to handle undefined HTTP method values.

  The operator was throwing a Zod validation error when request.method was undefined, expecting a string but receiving undefined. Updated the requestMethodCasing schema to properly handle optional method values and added test coverage for undefined method scenarios.

- Updated dependencies [[`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-framework-module@5.0.3

## 7.0.1

### Patch Changes

- [#3428](https://github.com/equinor/fusion-framework/pull/3428) [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.9 to 4.1.11
  - **v4.1.10**: Fixed shape caching issue (#5263) improving validation performance for complex schemas
  - **v4.1.11**: Maintenance release with general improvements

  This patch update enhances schema validation performance without changing any APIs.

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6), [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63)]:
  - @equinor/fusion-framework-module@5.0.2
  - @equinor/fusion-framework-module-msal@5.0.1

## 7.0.0

### Major Changes

- [#3394](https://github.com/equinor/fusion-framework/pull/3394) [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295) Thanks [@odinr](https://github.com/odinr)! - chore: bump zod from 3.25.76 to 4.1.8

  Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified error handling in the HTTP module to use ZodError `.issues` property instead of `.errors` and replaced `z.custom()` with `z.string().refine()` for better v4 compatibility.

  Key changes in source code:
  - Updated ZodError `.errors` to `.issues` property in capitalize-request-method operator
  - Replaced `z.custom()` with `z.string().refine()` for better v4 compatibility in request method casing validation
  - Simplified error message configuration in request method verb validation
  - Updated error handling to use new zod v4 error structure

  Breaking changes: Error handling structure has changed to use new zod v4 error format.

  Links:
  - [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
  - [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-msal@5.0.0

## 6.3.5

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

## 6.3.4

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - fix(http): use acquireAccessToken instead of acquireToken
  - The HTTP module now uses the correct method `acquireAccessToken` from the auth provider to retrieve the access token for requests with scopes.
  - This fixes compatibility with the new MSAL node module interface, which no longer exposes `acquireToken` but instead provides `acquireAccessToken` for token retrieval.
  - Ensures the Authorization header is set correctly for authenticated HTTP requests.

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Upgrade zod dependency to ^3.25.76 in all affected packages.

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-framework-module-msal@4.0.8

## 6.3.3

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions
  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-msal@4.0.7

## 6.3.2

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-framework-module-msal@4.0.6

## 6.3.1

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-framework-module-msal@4.0.5

## 6.3.0

### Minor Changes

- [#3038](https://github.com/equinor/fusion-framework/pull/3038) [`7a0a510`](https://github.com/equinor/fusion-framework/commit/7a0a510e0af1f0769c596e1b9aaa391250efd95d) Thanks [@odinr](https://github.com/odinr)! - ### Added
  - Introduced support for Server-Sent Events (SSE) in the HTTP module.
    - Added `sse# Change Log method to `HttpClient` for subscribing to SSE streams.
    - Added `sseMap` operator for handling SSE in RxJS pipelines.
    - Added `createSseSelector` for transforming SSE responses into observables.
    - Enhanced error handling with `ServerSentEventResponseError`.

  ### Documentation
  - Updated README with examples and usage details for SSE support.

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-module-msal@4.0.4

## 6.2.5

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-msal@4.0.3

## 6.2.4

### Patch Changes

- [#2952](https://github.com/equinor/fusion-framework/pull/2952) [`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8) Thanks [@odinr](https://github.com/odinr)! - fix(http): resovle relative urls

## 6.2.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2901](https://github.com/equinor/fusion-framework/pull/2901) [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to Biome `useOptionalChain`

- [#2900](https://github.com/equinor/fusion-framework/pull/2900) [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6) Thanks [@odinr](https://github.com/odinr)! - Fixed key syntax in `HttpClientConfigurator` default request handler.

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-msal@4.0.2

## 6.2.2

### Patch Changes

- [#2852](https://github.com/equinor/fusion-framework/pull/2852) [`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d) Thanks [@odinr](https://github.com/odinr)! - replaced forEach with for-of loops for better readability

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`6efabb7`](https://github.com/equinor/fusion-framework/commit/6efabb7837a97319e976e122db855d8b88b031a6), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-msal@4.0.1

## 6.2.1

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
  - @equinor/fusion-framework-module-msal@4.0.0

## 6.2.0

### Minor Changes

- [#2491](https://github.com/equinor/fusion-framework/pull/2491) [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51) Thanks [@odinr](https://github.com/odinr)! - Added a new operator `capitalizeRequestMethodOperator` to ensure that the HTTP method of a given request is in uppercase.
  - Introduced `capitalizeRequestMethodOperator` which processes an HTTP request object and converts its method to uppercase.
  - Logs a warning if the HTTP method was converted, providing information about the change and a reference to RFC 7231 Section 4.1.

  **Example usage:**

  ```typescript
  import { capitalizeRequestMethodOperator } from "@equinor/fusion-query";

  const operator = capitalizeRequestMethodOperator();
  const request = { method: "get" };
  const updatedRequest = operator(request);
  console.log(updatedRequest.method); // Outputs: 'GET'
  ```

  Adding the operator to the `HttpClient`:

  ```typescript
  const httpClient = new HttpClient();
  httpClient.requestHandler.add(
    "capatalize-method",
    capitalizeRequestMethodOperator(),
  );

  // transforms `method` to uppercase and logs a warning.
  httpClient.get("https://example.com", { method: "get" });
  ```

- [#2491](https://github.com/equinor/fusion-framework/pull/2491) [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51) Thanks [@odinr](https://github.com/odinr)! - The `HttpClientConfigurator` now has by default the `capitalizeRequestMethodOperator` and `requestValidationOperator` enabled.

  **CapitalizeRequestMethodOperator**

  This operator will capitalize the HTTP method name before sending the request. This is useful when you are using a client that requires the HTTP method to be capitalized. If you want to disable this operator, you can do so by removing it from the `HttpClientConfigurator`:

  ```typescript
  httpConfig.defaultHttpRequestHandler.remove("capitalize-method");
  ```

  > [!NOTE]
  > This operator is enabled by default and will log to the console if the method is not capitalized.

  **RequestValidationOperator**

  This operator will parse and validate the request before sending it. If the request is invalid, the error will be logged to the console. If you want to disable this operator, you can do so by removing it from the `HttpClientConfigurator`:

  ```typescript
  httpConfig.defaultHttpRequestHandler.remove("validate-request");
  ```

  > [!NOTE]
  > This operator is enabled by default and will log to the console if the request parameters are invalid.

  If you wish stricter validation, you can enable the `strict` mode by setting the `strict` property to `true`:

  ```typescript
  import { requestValidationOperator } from '@equinor/fusion-framework-module-http/operators';

  httpConfig.defaultHttpRequestHandler.set(
    'validate-request'
    requestValidationOperator({
      strict: true, // will throw error if schema is not valid
      parse: true // will not allow additional properties
    })
  );
  ```

- [#2491](https://github.com/equinor/fusion-framework/pull/2491) [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51) Thanks [@odinr](https://github.com/odinr)! - Added `remove` to the `ProcessOperators` to allow for the removal of a specific operator. This is useful for removing operators that are not desired, example default operators included in initial configuration.

  example:

  ```typescript
  httpClient.requestHandler.remove("capitalize-method");
  ```

  > [!NOTE]
  > There are currently no code completion for the `remove` method, so you will need to know the name of the operator you want to remove. We assume this is so low level that if you are removing operators you know what the name of the operator is.

  > [!TIP]
  > If you only wish to replace the operator with another operator, you can use the `set` method instead of `remove` and `add`.

- [#2491](https://github.com/equinor/fusion-framework/pull/2491) [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51) Thanks [@odinr](https://github.com/odinr)! - **New Feature: Enhanced `requestValidationOperator`**

  The `requestValidationOperator` is a utility function that validates incoming requests against a Zod schema. This function has two options: `strict` and `parse`. The `strict` option allows you to enforce strict validation, while the `parse` option enables you to return the parsed request object if it passes validation.

  The `requestValidationOperator` is meant to be used as a request operator in the Fusion API framework. It is a higher-order function that takes a Zod schema as an argument and returns a function that validates incoming requests against that schema.

  | Option                | Description                                                                                                                      | Usage                                                                                                                                 |
  | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | **Strict Validation** | When `strict` is set to `true`, the validation will fail if there are additional properties not defined in the schema.           | If `strict` is set to `false` or omitted, additional properties will be allowed and passed through without causing validation errors. |
  | **Parse Option**      | When `parse` is enabled, the function will return the parsed and potentially transformed request object if it passes validation. | If `parse` is not enabled, the function will not return anything even if the request object is valid.                                 |

  To use the new `strict` and `parse` options, update your code as follows:

  Example usage with strict validation:

  ```typescript
  const operator = requestValidationOperator({ strict: true });

  // This will throw an error because of invalid method and extra property.
  operator({
    method: "post",
    body: "foo",
    extraProperty: "This should not be here",
  });
  ```

  Example usage with parsing enabled:

  ```typescript
  // Example usage with parsing enabled
  const operator = requestValidationOperator({ parse: true });

  // will return { method: 'GET' }
  const parsedRequest = operator({
    method: "GET",
    extraProperty: "This should not be here",
  });
  ```

  Example usage with both strict validation and parsing enabled:

  ```typescript
  const operator = requestValidationOperator({ strict: true, parse: true });

  // will throw an error because of extra property.
  const parsedStrictRequest = operator({
    method: "GET",
    extraProperty: "This should not be here",
  });
  ```

  Example usage with the `HttpClient`:

  ```typescript
  const httpClient = new HttpClient();

  // Add the request validation operator to the HttpClient.
  httpClient.requestHandler.add(
    "validate-init",
    requestValidationOperator({ parse: true }),
  );

  // will throw an error because of invalid method.
  httpClient.get("https://example.com", { method: "get" });
  ```

## 6.1.0

### Minor Changes

- [#2452](https://github.com/equinor/fusion-framework/pull/2452) [`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31) Thanks [@odinr](https://github.com/odinr)! - **@equinor/fusion-framework-module-http**

  `HttpClient._resolveUrl` now supports resolving URLs with a base URL that contains a path.

  before:

  ```typescript
  const client = new HttpClient("https://example.com/test/me");
  client.fetch("/api"); // https://example.com/api
  ```

  now:

  ```typescript
  const client = new HttpClient("https://example.com/test/me");
  client.fetch("/api"); // https://example.com/test/me/api
  ```

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module@4.3.5
  - @equinor/fusion-framework-module-msal@3.1.5

## 6.0.3

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-framework-module-msal@3.1.4

## 6.0.2

### Patch Changes

- [#2358](https://github.com/equinor/fusion-framework/pull/2358) [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb) Thanks [@eikeland](https://github.com/eikeland)! - Updating vitest to 2.0.4. Setting vitest as devDependency in fusion-query. Updating vite to 5.3.4

- Updated dependencies [[`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module@4.3.3
  - @equinor/fusion-framework-module-msal@3.1.3

## 6.0.1

### Patch Changes

- [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - Updated documentation in `README.md` for http module.
  - added introduction to http module
  - added concepts section which highlights the key concepts of http module
  - added sequence diagram for http request execution
  - added examples for http module
  - improved documentation for configuring http module
  - improved documentation for working with http clients
  - improved the formatting of the documentation

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - Updated TsDoc for http module

- [#2324](https://github.com/equinor/fusion-framework/pull/2324) [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9) Thanks [@odinr](https://github.com/odinr)! - - Added a new type `ResponseSelector<TResult, TResponse>`: a function that takes a `Response` object and returns an observable stream of type `TResult`. The `ResponseSelector` type has two template parameters: `TResult` and `TResponse`.
  - Updated the `FetchRequestInit` type to include a new property `selector` of type `ResponseSelector<TReturn, TResponse>`, which allows specifying a response selector function.
  - Updated the blob-selector and json-selector functions to use the new `ResponseSelector` type.

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
  - @equinor/fusion-framework-module-msal@3.1.2

## 6.0.0

### Major Changes

- [#2181](https://github.com/equinor/fusion-framework/pull/2181) [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8) Thanks [@odinr](https://github.com/odinr)! - The `blob` and `blob# Change Log methods in the `HttpClient` class have been updated to provide a more robust and flexible API for fetching blob resources.
  1. The `blob` and `blob# Change Log methods now accept an optional `args`parameter of type`FetchRequestInit<T, TRequest, TResponse>`, where `T` is the type of the expected blob result. This allows consumers to customize the fetch request and response handling.
  2. The `blob` and `blob# Change Log methods now return a `Promise<T>`and`StreamResponse<T>`respectively, where`T` is the type of the expected blob result. This allows consumers to handle the blob data in a more type-safe manner.
  3. The `blobSelector` function has been updated to extract the filename (if available) from the `content-disposition` header and return it along with the blob data in a `BlobResult` object.
  4. If you were previously using the `blob` or `blob# Change Log methods and expecting a `Blob`result, you must now use the new`BlobResult` type, which includes the filename (if available) and the blob data.

  > [!WARNING]
  > This alters the return type of the `blob` and `blob# Change Log methods, which is a **breaking change**.

  Example:

  ```typescript
  const blobResult = await httpClient.blob("/path/to/blob");
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

  const blobResult = await httpClient.blob("/path/to/blob", {
    selector: customBlobSelector,
  });
  console.log(blobResult.filename); // 'example.pdf'
  console.log(blobResult.blob); // Blob instance
  ```

  3. If you were using the `blob# Change Log method and expecting a `StreamResponse<Blob>`, you can now use the new `StreamResponse<T>`type, where`T` is the type of the expected blob result.

  Example:

  ```typescript
  const blobStream = httpClient.blob$("/path/to/blob");
  blobStream.subscribe((blobResult) => {
    console.log(blobResult.filename); // 'example.pdf'
    console.log(blobResult.blob); // Blob instance
  });
  ```

### Patch Changes

- [#2196](https://github.com/equinor/fusion-framework/pull/2196) [`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1) Thanks [@odinr](https://github.com/odinr)! - The `jsonSelector` function was not checking the error type in the `catch` block.
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
        console.error(
          "the request was not `ok`, see provided error data",
          data,
        );
      } else {
        console.error(
          "failed to parse data from response, see provided cause",
          cause,
        );
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

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-framework-module-msal@3.1.1

## 5.2.2

### Patch Changes

- [#2073](https://github.com/equinor/fusion-framework/pull/2073) [`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3) Thanks [@eikeland](https://github.com/eikeland)! - Removing type module in package.json

## 5.2.1

### Patch Changes

- [#2043](https://github.com/equinor/fusion-framework/pull/2043) [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee) Thanks [@odinr](https://github.com/odinr)! - Added test for http client, to check if configured operators are not altered

- [#2043](https://github.com/equinor/fusion-framework/pull/2043) [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee) Thanks [@odinr](https://github.com/odinr)! - When adding operators to request and response handler to an http client instanstance, the values where added to the configured handlers permanently

  ```ts
  // create a new client from configuration
  const fooClient = provider.createClient("foo");
  fooClient.requestHandler.setHeader("x-foo", "bar");

  // generate a RequestInit object
  const fooRequest = await lastValueFrom(
    fooClient.requestHandler.process({ path: "/api", uri: fooClient.uri }),
  );

  expect((fooRequest.headers as Headers)?.get("x-foo")).toBe("bar");

  // create a new client from the same configuration
  const barClient = provider.createClient("foo");

  // generate a RequestInit object
  const barRequest = await lastValueFrom(
    barClient.requestHandler.process({ path: "/api", uri: barClient.uri }),
  );

  // expect the request header to not been modified
  // FAILED
  expect((barRequest.headers as Headers)?.get("x-foo")).toBeUndefined();
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

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-msal@3.1.0

## 5.1.6

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-module-msal@3.0.10

## 5.1.5

### Patch Changes

- Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
  - @equinor/fusion-framework-module-msal@3.0.9

## 5.1.4

### Patch Changes

- [#1625](https://github.com/equinor/fusion-framework/pull/1625) [`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - fix import from non specified export (moduleResolution: bundler)

## 5.1.3

### Patch Changes

- [#1621](https://github.com/equinor/fusion-framework/pull/1621) [`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee) Thanks [@odinr](https://github.com/odinr)! - **Improves error handling when processing json http response**

  In packages/modules/http/src/errors.ts:
  - The class HttpResponseError now has a generic parameter TResponse.
    - Added a static property Name to the class.
  - Added a new class HttpJsonResponseError which extends HttpResponseError and also has generic parameters TType and TResponse.
    - Added a static property Name to the class.
    - Added a public property data of type TType.
    - Modified the constructor to accept an optional data parameter.

  In packages/modules/http/src/lib/selectors/json-selector.ts:
  - Added an import statement for HttpJsonResponseError.
  - Modified the jsonSelector function to handle errors when parsing the response.
    - Added a try-catch block.
    - Changed the JSON parsing logic to store the parsed data in a variable data.
    - If the response is not OK, a HttpJsonResponseError is thrown with the appropriate error message, response object, and data property.
    - If there is an error parsing the response, a HttpJsonResponseError is thrown with the appropriate error message, response object, and cause property.

## 5.1.2

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-msal@3.0.8

## 5.1.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-framework-module-msal@3.0.7

## 5.1.0

### Minor Changes

- [#1242](https://github.com/equinor/fusion-framework/pull/1242) [`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa) Thanks [@odinr](https://github.com/odinr)! - add method for executing blob requests
  - added selector for extracting blob from response
  - added function for fetching blob as stream or promise on the http client

  ```tsx
  const data = await client.blob("/person/photo");
  const url = URL.createObjectURL(blob);
  return <img src={url} />;
  ```

## 5.0.6

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-framework-module-msal@3.0.6

## 5.0.5

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- [#1163](https://github.com/equinor/fusion-framework/pull/1163) [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3) Thanks [@odinr](https://github.com/odinr)! - Append `Accecpt: application/json` to request headers

  when using the `json# Change Log or `json`function on the`HttpClient`add`Accecpt: application/json` to the request header

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-msal@3.0.5

## 5.0.4

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-module@4.2.1
  - @equinor/fusion-framework-module-msal@3.0.4

## 5.0.3

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**
  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-module@4.2.0
  - @equinor/fusion-framework-module-msal@3.0.3

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

- **modules/http:** `IHttpClient.execute` is removed, most likely not used, too complex to maintain

### Bug Fixes

- **modules/http:** fix typing for json requests ([459df80](https://github.com/equinor/fusion-framework/commit/459df80bfc79426ec6507db8f06d488b6a3d0f07))

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

- **http:** throw error when selector error ([dc0aa35](https://github.com/equinor/fusion-framework/commit/dc0aa35cbc44fb0503a9431ab728b81d8a3af290))

## 2.1.8 (2022-12-06)

### Bug Fixes

- **module-http:** adding missing types on module-http iHttpClient ([ac6e81e](https://github.com/equinor/fusion-framework/commit/ac6e81e54d70b8a943466046fcbe86f6bd7c4c67))

## 2.1.7 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.6 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.5 (2022-11-18)

### Bug Fixes

- **module-http:** add headers to json request ([8223394](https://github.com/equinor/fusion-framework/commit/8223394362a24663bf65442025f0b031aa37a910))

## 2.1.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.3 (2022-11-11)

### Bug Fixes

- **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 2.1.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.1 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.1.0 (2022-11-01)

### Features

- :necktie: remove try catch from json-selector ([fe5e2ea](https://github.com/equinor/fusion-framework/commit/fe5e2ea087cdee99403175e912eb09479b86414e))
- :sparkles: return undefined on status code 204 ([af1eea7](https://github.com/equinor/fusion-framework/commit/af1eea7a9ef539a44c3cab69904b4764f169caa6))

### Reverts

- :rewind: revert changes in json-selector ([8c448e5](https://github.com/equinor/fusion-framework/commit/8c448e5c76fb20cbd908c95f2fbd9d8d0367aad1))

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

- **module-http:** allow typing of fetch request ([de08783](https://github.com/equinor/fusion-framework/commit/de0878342d82249ffc7e1212230d0aa0e14d32cb))

## [2.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.8...@equinor/fusion-framework-module-http@2.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 2.0.8 (2022-09-27)

### Bug Fixes

- update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 2.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@2.0.5...@equinor/fusion-framework-module-http@2.0.6) (2022-09-16)

### Bug Fixes

- **module-http:** fix export ([06a490d](https://github.com/equinor/fusion-framework/commit/06a490d40e34d2074ac102ac4fcd458cadd3538a))
- **module-http:** improve hierarchy ([3603347](https://github.com/equinor/fusion-framework/commit/36033474991288983490f250726a551f7ce3dcbd))

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

- **module-http:** expose simple config ([94e4d6b](https://github.com/equinor/fusion-framework/commit/94e4d6bbb7fef010cd72e49242d68ed155592e11))

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@1.0.2...@equinor/fusion-framework-module-http@2.0.0-alpha.0) (2022-09-12)

### Features

- **module-http:** expose simple config ([94e4d6b](https://github.com/equinor/fusion-framework/commit/94e4d6bbb7fef010cd72e49242d68ed155592e11))

## 1.0.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 1.0.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 1.0.0 (2022-08-29)

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

## 0.6.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.6.0...@equinor/fusion-framework-module-http@0.6.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.5.0...@equinor/fusion-framework-module-http@0.6.0) (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

# 0.5.0 (2022-08-08)

### Bug Fixes

- **module-http:** expose FetchRequest ([3d14ead](https://github.com/equinor/fusion-framework/commit/3d14ead0d78b36db091c6645ff1b69101e1f911f))

### Features

- **module-service-discovery:** resolve service to config ([3fa088d](https://github.com/equinor/fusion-framework/commit/3fa088d2ced8136447df6949928f1af9fc83407a))

# [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.10...@equinor/fusion-framework-module-http@0.4.0) (2022-08-04)

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

## [0.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.9...@equinor/fusion-framework-module-http@0.3.10) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

## 0.3.9 (2022-08-01)

### Bug Fixes

- change typo of exports ([b049503](https://github.com/equinor/fusion-framework/commit/b049503511fb1b37b920b00aed1468ed8385a67e))

## [0.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.7...@equinor/fusion-framework-module-http@0.3.8) (2022-07-01)

### Bug Fixes

- **module-http:** fix selector of client ([dcc4774](https://github.com/equinor/fusion-framework/commit/dcc477489b51aa988a97494ff553eee34404469d))

## [0.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-http@0.3.6...@equinor/fusion-framework-module-http@0.3.7) (2022-07-01)

### Bug Fixes

- **module-http:** make rxjs dependent ([a20286f](https://github.com/equinor/fusion-framework/commit/a20286f950ff10c84605c025354cb05280c7455a))

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

- **module-http:** expose response processor ([e4551c5](https://github.com/equinor/fusion-framework/commit/e4551c549654ef25f33eef72ebc2fcc02ab552a2))

## 0.2.2 (2022-06-13)

### Bug Fixes

- **module-http:** reutrn fallb ack config ([8ece469](https://github.com/equinor/fusion-framework/commit/8ece469e99bd64c10a7697d49fdcc5d396737ac8))

## 0.2.1 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# 0.2.0 (2022-05-31)

### Features

- **module-http:** add json support ([a6adbbb](https://github.com/equinor/fusion-framework/commit/a6adbbb36ca1391f8813be6141ef963031098764))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-http

# 0.1.0 (2022-02-07)

### Bug Fixes

- expose http client interface ([8660822](https://github.com/equinor/fusion-framework/commit/8660822b669e549bd454aa8a6a0adcaeb5e7917f))
- **module-http:** allow defaultScopes ([d476de9](https://github.com/equinor/fusion-framework/commit/d476de99e6289e60684f02bcd7b669e23f3789bb))
- **module-http:** fix check if config when creating client ([950ebc1](https://github.com/equinor/fusion-framework/commit/950ebc18f8f35bb7e6f97d6a98bd91d87616a94e))
- **module-http:** fix merge of process operators ([5a1d6d2](https://github.com/equinor/fusion-framework/commit/5a1d6d2942475c61c994f4ec26812c949cabbdf1))
- **module-http:** fix relative url resolve ([0d8c311](https://github.com/equinor/fusion-framework/commit/0d8c311c66b52eec22d465e0db57fa003506ab0c))

### Features

- add module for http clients ([7b02db7](https://github.com/equinor/fusion-framework/commit/7b02db7c2e34b97659bc72af7b5b31307cf55e5f))
- http client base uri ([233cabf](https://github.com/equinor/fusion-framework/commit/233cabfea0f2b07955670e553472427ec27a3aa0))
- **module-http:** add check for registered client keys ([93b42f8](https://github.com/equinor/fusion-framework/commit/93b42f88ad092e24fe4f1a216394893128d35734))
- **module-http:** allow selector for http requests ([ea300c8](https://github.com/equinor/fusion-framework/commit/ea300c8ad5555e4514b35ac43a4c8494461afd91))

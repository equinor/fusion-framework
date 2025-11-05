# Change Log

## 9.0.4

### Patch Changes

- [#3544](https://github.com/equinor/fusion-framework/pull/3544) [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.11 to 4.1.12, which includes a critical bug fix for ZodError.flatten() preventing crashes on 'toString' key and improved error handling throughout the framework.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e), [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59), [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74)]:
  - @equinor/fusion-query@6.0.1
  - @equinor/fusion-framework-module@5.0.5
  - @equinor/fusion-framework-module-http@7.0.4

## 9.0.3

### Patch Changes

- [#3595](https://github.com/equinor/fusion-framework/pull/3595) [`a13de68`](https://github.com/equinor/fusion-framework/commit/a13de68b2f196a779ea850af055d8db7926941ce) Thanks [@odinr](https://github.com/odinr)! - Fix ServiceDiscoveryProvider to extend BaseModuleProvider, ensuring proper module interface implementation and preventing configuration errors.

- Updated dependencies [[`6900d98`](https://github.com/equinor/fusion-framework/commit/6900d98142c84f4703095f8d03b09af57a1d7d2e), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be)]:
  - @equinor/fusion-framework-module-http@7.0.3
  - @equinor/fusion-framework-module@5.0.4

## 9.0.2

### Patch Changes

- Updated dependencies [[`a66d70a`](https://github.com/equinor/fusion-framework/commit/a66d70a9fa40ab14f2534be4f22b6d1f602097a0), [`d3bcafe`](https://github.com/equinor/fusion-framework/commit/d3bcafed8b8c5a02ebe68693588cb376ed5e1b0e), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-framework-module-http@7.0.2
  - @equinor/fusion-query@6.0.0
  - @equinor/fusion-framework-module@5.0.3

## 9.0.1

### Patch Changes

- [#3428](https://github.com/equinor/fusion-framework/pull/3428) [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.9 to 4.1.11

  - **v4.1.10**: Fixed shape caching issue (#5263) improving validation performance for complex schemas
  - **v4.1.11**: Maintenance release with general improvements

  This patch update enhances schema validation performance without changing any APIs.

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6), [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63)]:
  - @equinor/fusion-framework-module@5.0.2
  - @equinor/fusion-query@5.2.14
  - @equinor/fusion-framework-module-http@7.0.1

## 9.0.0

### Major Changes

- [#3394](https://github.com/equinor/fusion-framework/pull/3394) [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295) Thanks [@odinr](https://github.com/odinr)! - feat: migrate to zod v4

  Updated source code to migrate from zod v3 to v4. Updated zod dependency from v3.25.76 to v4.1.8 and modified schema definitions in the service discovery module to be compatible with zod v4's stricter type checking and updated API.

  Key changes in source code:

  - Updated `ApiService` and `ApiServices` schemas for zod v4 compatibility
  - Enhanced service object validation with proper type definitions
  - Updated service response selector to use zod v4 parsing
  - Improved error handling for malformed API responses

  Breaking changes: Schema validation behavior may differ due to zod v4's stricter type checking. Error message format has changed from zod v3 to v4 format. Function schema definitions now require explicit typing.

  Links:

  - [Zod v4 Migration Guide](https://github.com/colinhacks/zod/releases/tag/v4.0.0)
  - [Zod v4.1.8 Release Notes](https://github.com/colinhacks/zod/releases/tag/v4.1.8)

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-http@7.0.0

## 8.0.18

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Upgrade zod dependency to ^3.25.76 in all affected packages.

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module-http@6.3.4
  - @equinor/fusion-framework-module@5.0.0

## 8.0.17

### Patch Changes

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-http@6.3.3
  - @equinor/fusion-query@5.2.11

## 8.0.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.10

## 8.0.15

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.9

## 8.0.14

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-query@5.2.8
  - @equinor/fusion-framework-module-http@6.3.2

## 8.0.13

### Patch Changes

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-framework-module-http@6.3.1
  - @equinor/fusion-query@5.2.7

## 8.0.12

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42), [`7a0a510`](https://github.com/equinor/fusion-framework/commit/7a0a510e0af1f0769c596e1b9aaa391250efd95d)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-module-http@6.3.0
  - @equinor/fusion-query@5.2.6

## 8.0.11

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-http@6.2.5
  - @equinor/fusion-query@5.2.5

## 8.0.10

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.4

## 8.0.9

### Patch Changes

- Updated dependencies [[`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8)]:
  - @equinor/fusion-framework-module-http@6.2.4

## 8.0.8

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139), [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6)]:
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-http@6.2.3
  - @equinor/fusion-query@5.2.3

## 8.0.7

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`2fe6241`](https://github.com/equinor/fusion-framework/commit/2fe624186640c3b30079c7d76f0e3af65f64f5d2), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-http@6.2.2
  - @equinor/fusion-query@5.2.2

## 8.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@6.2.1

## 8.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.1

## 8.0.4

### Patch Changes

- Updated dependencies [[`a965fbe`](https://github.com/equinor/fusion-framework/commit/a965fbeb9544b74f7d7b4aaa1e57c50d2ae4a564)]:
  - @equinor/fusion-query@5.2.0

## 8.0.3

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-query@5.1.5

## 8.0.2

### Patch Changes

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-query@5.1.4

## 8.0.1

### Patch Changes

- Updated dependencies [[`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51)]:
  - @equinor/fusion-framework-module-http@6.2.0

## 8.0.0

### Major Changes

- [#2459](https://github.com/equinor/fusion-framework/pull/2459) [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa) Thanks [@odinr](https://github.com/odinr)! - The Service Discovery module has been totally revamped to provide a more flexible and robust solution for service discovery in the Fusion Framework.
  The module now relies on the Fusion Service Discovery API to fetch services and their configurations, which allows for more dynamic and real-time service discovery.

  The module now follows the "best practices" for configuration and usage, and it is now easier to configure and use the Service Discovery module in your applications. But this also means that the module has breaking changes that may require updates to existing implementations.

  > [!NOTE]
  > This module can still be configured to resolve custom services, as long as the client implements the `IServiceDiscoveryClient` interface.

  **Documentation Updates**

  - The README file has been updated to reflect the new configuration options and usage patterns for the Service Discovery module.
  - Added sections for simple and advanced configurations, including examples of how to override the default HTTP client key and set a custom service discovery client.

  **Code Changes:**

  - 🔨 package.json: Added `zod` as a new dependency for schema validation.
  - 💫 api-schema.ts: Added schema for the expected response from the `ServiceProviderClient`
  - 💫 client.ts: Created `serviceResponseSelector` for parsing and validating client respons.
  - 🔨 client.ts: Updated `IServiceDiscoveryClient` interface to include methods for resolving services and fetching services from the API.
  - 🔨 client.ts: Updated `ServiceDiscoveryClient` to use the new `serviceResponseSelector`
  - 💫 configurator.ts: Introduced new methods for setting and configuring the service discovery client.
  - 🔨 configurator.ts: Updated `ServiceDiscoveryConfigurator` to extend the `BaseConfigBuilder`
  - 🔨 configurator.ts: Added error handling and validation for required configurations.

  **BREAKING CHANGES:**

  - The type `Service` has deprecated the `defaultScopes` property in favor of `scopes`.
  - The `IServiceDiscoveryClient` interface has been updated, which may require changes in implementations that use this interface.
  - The `ServiceDiscoveryConfigurator` now extends `BaseConfigBuilder`, which will affect existing configurations.
  - The `ServiceDiscoveryProvider.resolveServices` method now returns `Service[]` (previously `Environment`).

  > [!NOTE]
  > Only the `ServiceDiscoveryProvider.resolveServices` should affect end-users,
  > as it changes the return type of the method.
  > The other changes are internal and should not affect existing implementations.

  **Consumer Migration Guide:**

  `defaultScopes` has been replaced with `scopes` in the `Service` type. Update your code to use the new property.

  If you are using the `ServiceDiscoveryProvider.resolveServices` method, update your code to expect an array of `Service` objects instead of an `Environment` object.

  ```typescript
  // Before
  const { services } = await serviceDiscoveryProvider.resolveServices(
    "my-service"
  );
  // After
  const services = await serviceDiscoveryProvider.resolveServices("my-service");
  ```

  > [!WARNING]
  > The preious `Environment` object had a `clientId` property, which is now removed, since every service can have its own client id, hence the `scopes` property in the `Service` object.

  **Configuration Migration Guide:**

  > If you are consuming the `@equinor/fusion-framework` and only configuring the http client, no changes are required.

  If you are manually enabling the Service Discovery module, update your configuration to use the new methods provided by `ServiceDiscoveryConfigurator`.
  Refer to the updated README for detailed configuration examples and usage patterns.

  > [!WARNING]
  > The `ServiceDiscoveryConfigurator` now extends `BaseConfigBuilder`, which means that the configuration methods have changed.

### Patch Changes

- Updated dependencies [[`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31), [`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module-http@6.1.0
  - @equinor/fusion-framework-module@4.3.5

## 7.1.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.1.3

## 7.1.12

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-query@5.1.2
  - @equinor/fusion-framework-module-http@6.0.3

## 7.1.11

### Patch Changes

- Updated dependencies [[`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module-http@6.0.2
  - @equinor/fusion-query@5.1.1
  - @equinor/fusion-framework-module@4.3.3

## 7.1.10

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
  - @equinor/fusion-framework-module@4.3.2
  - @equinor/fusion-query@5.1.0
  - @equinor/fusion-framework-module-http@6.0.1

## 7.1.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.0.5

## 7.1.8

### Patch Changes

- Updated dependencies [[`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
  - @equinor/fusion-framework-module-http@6.0.0
  - @equinor/fusion-query@5.0.4

## 7.1.7

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-query@5.0.3
  - @equinor/fusion-framework-module-http@5.2.3

## 7.1.6

### Patch Changes

- Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
  - @equinor/fusion-query@5.0.2

## 7.1.5

### Patch Changes

- Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
  - @equinor/fusion-query@5.0.1

## 7.1.4

### Patch Changes

- Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
  - @equinor/fusion-query@5.0.0

## 7.1.3

### Patch Changes

- Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
  - @equinor/fusion-framework-module-http@5.2.2

## 7.1.2

### Patch Changes

- Updated dependencies [[`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
  - @equinor/fusion-query@4.2.0

## 7.1.1

### Patch Changes

- Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
  - @equinor/fusion-framework-module-http@5.2.1

## 7.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-http@5.2.0
  - @equinor/fusion-query@4.1.0

## 7.0.20

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-module-http@5.1.6

## 7.0.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.6

## 7.0.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.1.5

## 7.0.17

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4

## 7.0.16

### Patch Changes

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3

## 7.0.15

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.5

## 7.0.14

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-query@4.0.4

## 7.0.13

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3

## 7.0.12

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2

## 7.0.11

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-query@4.0.1

## 7.0.10

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa), [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-framework-module-http@5.1.0
  - @equinor/fusion-query@4.0.0

## 7.0.9

### Patch Changes

- [#1227](https://github.com/equinor/fusion-framework/pull/1227) [`e539e606`](https://github.com/equinor/fusion-framework/commit/e539e606d04bd8b7dc0c0bfed7cd4a7731996936) Thanks [@yusijs](https://github.com/yusijs)! - Use defaultScopes in service discovery if available, otherwise fall back to default scope

## 7.0.8

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-query@3.0.7
  - @equinor/fusion-framework-module-http@5.0.6

## 7.0.7

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6

## 7.0.6

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-http@5.0.5
  - @equinor/fusion-query@3.0.5

## 7.0.5

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-module-http@5.0.4
  - @equinor/fusion-framework-module@4.2.1

## 7.0.4

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-module@4.2.0
  - @equinor/fusion-framework-module-http@5.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@7.0.2...@equinor/fusion-framework-module-service-discovery@7.0.3) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 7.0.2 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 7.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 7.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 6.0.8 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.6...@equinor/fusion-framework-module-service-discovery@6.0.7) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.5...@equinor/fusion-framework-module-service-discovery@6.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.4...@equinor/fusion-framework-module-service-discovery@6.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.3...@equinor/fusion-framework-module-service-discovery@6.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@6.0.2...@equinor/fusion-framework-module-service-discovery@6.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 6.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 6.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.4...@equinor/fusion-framework-module-service-discovery@6.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [6.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.4...@equinor/fusion-framework-module-service-discovery@6.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 5.0.4 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.2...@equinor/fusion-framework-module-service-discovery@5.0.3) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@5.0.1...@equinor/fusion-framework-module-service-discovery@5.0.2) (2023-01-16)

### Bug Fixes

- **legacy-interopt:** register legacy auth token resolve ([24ee4ea](https://github.com/equinor/fusion-framework/commit/24ee4eab42d4f472c8f4c8b959ce73f8f5b4dc1c))

## 5.0.1 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 5.0.0 (2023-01-12)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** changed `environment` from promise to sync

### Features

- **module-service-discovery:** allow sync resolve of service ([aa0361c](https://github.com/equinor/fusion-framework/commit/aa0361c765604ca5f642c9f2916cea860968d4a3))

## 4.0.8 (2022-12-14)

### Bug Fixes

- **module-service-discovery:** remove console log ([776d174](https://github.com/equinor/fusion-framework/commit/776d174fc141d4c6e1b8b476cb85b18985eb93b9))

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.6...@equinor/fusion-framework-module-service-discovery@4.0.7) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 4.0.6 (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.4...@equinor/fusion-framework-module-service-discovery@4.0.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.3...@equinor/fusion-framework-module-service-discovery@4.0.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@4.0.2...@equinor/fusion-framework-module-service-discovery@4.0.3) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 4.0.2 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 4.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.11...@equinor/fusion-framework-module-service-discovery@4.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.11...@equinor/fusion-framework-module-service-discovery@4.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.10...@equinor/fusion-framework-module-service-discovery@3.2.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.9...@equinor/fusion-framework-module-service-discovery@3.2.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.8...@equinor/fusion-framework-module-service-discovery@3.2.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.7...@equinor/fusion-framework-module-service-discovery@3.2.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.6...@equinor/fusion-framework-module-service-discovery@3.2.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.5...@equinor/fusion-framework-module-service-discovery@3.2.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.4...@equinor/fusion-framework-module-service-discovery@3.2.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.3...@equinor/fusion-framework-module-service-discovery@3.2.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.2...@equinor/fusion-framework-module-service-discovery@3.2.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.1...@equinor/fusion-framework-module-service-discovery@3.2.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.2.0...@equinor/fusion-framework-module-service-discovery@3.2.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.1.4...@equinor/fusion-framework-module-service-discovery@3.2.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 3.1.4 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.1.2...@equinor/fusion-framework-module-service-discovery@3.1.3) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.1.2 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.1.1 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.0.11...@equinor/fusion-framework-module-service-discovery@3.1.0) (2022-11-14)

### Features

- update packages to use observable ([98024aa](https://github.com/equinor/fusion-framework/commit/98024aa466c68f03bd793bd564cf7b6bf65def72))

## 3.0.11 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.10 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.9 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.8 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.7 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.6 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.5 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.0.3...@equinor/fusion-framework-module-service-discovery@3.0.4) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.3 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 3.0.2 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@3.0.0...@equinor/fusion-framework-module-service-discovery@3.0.1) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@2.0.0...@equinor/fusion-framework-module-service-discovery@3.0.0) (2022-09-27)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** order of arguments for configuring client in service discovery

### Bug Fixes

- **module-service-discovery:** change order of arguments ([a1240c6](https://github.com/equinor/fusion-framework/commit/a1240c6360da5e919623bc31a51ced4c5ce1c2e3))
- update registering of configuration ([20942ce](https://github.com/equinor/fusion-framework/commit/20942ce1c7a853ea3b55c031a242646e378db8c9))

## 2.0.0 (2022-09-26)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** order of arguments for configuring client in service discovery

### Bug Fixes

- **module-service-discovery:** change order of arguments ([a1240c6](https://github.com/equinor/fusion-framework/commit/a1240c6360da5e919623bc31a51ced4c5ce1c2e3))

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.5...@equinor/fusion-framework-module-service-discovery@1.0.6) (2022-09-16)

### Bug Fixes

- **module-service-discovery:** fix typing ([29941ba](https://github.com/equinor/fusion-framework/commit/29941baa3682ade7f1e15c0322b7c976488599e6))

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.4...@equinor/fusion-framework-module-service-discovery@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.3...@equinor/fusion-framework-module-service-discovery@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.2...@equinor/fusion-framework-module-service-discovery@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1...@equinor/fusion-framework-module-service-discovery@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1-next.1...@equinor/fusion-framework-module-service-discovery@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.1-next.0...@equinor/fusion-framework-module-service-discovery@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@1.0.0...@equinor/fusion-framework-module-service-discovery@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 1.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** update config

### Bug Fixes

- **module-service-discovery:** update config ([9998981](https://github.com/equinor/fusion-framework/commit/9998981bbcb1ed283dba7c77268e2c55a8e3fb83))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.7.2...@equinor/fusion-framework-module-service-discovery@1.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **module-service-discovery:** update config

### Bug Fixes

- **module-service-discovery:** update config ([9998981](https://github.com/equinor/fusion-framework/commit/9998981bbcb1ed283dba7c77268e2c55a8e3fb83))

## 0.7.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.7.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.7.0 (2022-08-29)

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

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.6.0...@equinor/fusion-framework-module-service-discovery@0.6.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

# [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.5.0...@equinor/fusion-framework-module-service-discovery@0.6.0) (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

# 0.5.0 (2022-08-08)

### Features

- **module-service-discovery:** resolve service to config ([3fa088d](https://github.com/equinor/fusion-framework/commit/3fa088d2ced8136447df6949928f1af9fc83407a))

# [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.12...@equinor/fusion-framework-module-service-discovery@0.4.0) (2022-08-04)

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

## [0.3.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.11...@equinor/fusion-framework-module-service-discovery@0.3.12) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.3.11 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.9...@equinor/fusion-framework-module-service-discovery@0.3.10) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.8...@equinor/fusion-framework-module-service-discovery@0.3.9) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.7...@equinor/fusion-framework-module-service-discovery@0.3.8) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.6...@equinor/fusion-framework-module-service-discovery@0.3.7) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.5...@equinor/fusion-framework-module-service-discovery@0.3.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.4...@equinor/fusion-framework-module-service-discovery@0.3.5) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.3...@equinor/fusion-framework-module-service-discovery@0.3.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.3.3 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.1...@equinor/fusion-framework-module-service-discovery@0.3.2) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.3.0...@equinor/fusion-framework-module-service-discovery@0.3.1) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.2.4...@equinor/fusion-framework-module-service-discovery@0.3.0) (2022-06-13)

### Features

- **nodules-service-discovery:** make http-module dependency ([001dc2a](https://github.com/equinor/fusion-framework/commit/001dc2acbcd2e9a31a19fe9e7c9cd903fb20b2a1))

## 0.2.4 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.2.3 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

## 0.2.2 (2022-05-31)

### Bug Fixes

- **module-service-discovery:** update interfaces ([e1b6864](https://github.com/equinor/fusion-framework/commit/e1b686466ae28204e1d605cce0441dab69787e48))

## 0.2.1 (2022-03-14)

### Bug Fixes

- **service-discovery:** include uri in service ([#46](https://github.com/equinor/fusion-framework/issues/46)) ([3287d69](https://github.com/equinor/fusion-framework/commit/3287d69e23a5bccce8a9e762886340733f9c5447))

# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-service-discovery@0.1.1...@equinor/fusion-framework-module-service-discovery@0.2.0) (2022-02-15)

### Features

- **module-service-discovery:** allow custom service discovery ([8917e4e](https://github.com/equinor/fusion-framework/commit/8917e4e3053b824ac8d878b0bfbe6a22efd56c3b))

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-service-discovery

# 0.1.0 (2022-02-07)

### Bug Fixes

- allow create callback on configure ([a76ebb0](https://github.com/equinor/fusion-framework/commit/a76ebb057f7b06a7ff737af6e3c29a000a5f0791))
- **module-service-discovery:** add default scopes ([b52af12](https://github.com/equinor/fusion-framework/commit/b52af1236d619f451f8d002a31548fd4706bc6c7))
- **module-service-discovery:** remove base url ([e4740ba](https://github.com/equinor/fusion-framework/commit/e4740ba90f1d499e572023a5a90137669a9d20bc))

### Features

- add module for service discovery ([8714495](https://github.com/equinor/fusion-framework/commit/871449527f06661b0ee784df87bfd6eeef2a37fc))
- **module-service-discovery:** add baseurl config ([2bb569f](https://github.com/equinor/fusion-framework/commit/2bb569f62952c127ca74bc7b818181cb5b3ac986))
- **module-service-discovery:** add method for configuring client ([2b99a21](https://github.com/equinor/fusion-framework/commit/2b99a2119dd0b335ff26f983426f41bf1f8c7511))

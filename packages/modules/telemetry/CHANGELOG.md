# Change Log

## 4.6.0

### Minor Changes

- [#3777](https://github.com/equinor/fusion-framework/pull/3777) [`78f3679`](https://github.com/equinor/fusion-framework/commit/78f3679b09716f69b3093edcff9f06ad605092c3) Thanks [@odinr](https://github.com/odinr)! - Refactor telemetry filtering API to use a unified `setFilter` method instead of separate `setAdapterFilter` and `setRelayFilter` methods.

  **Changes**

  - Added unified `setFilter()` method that accepts a filter object
  - Config changed from `adapterFilter`/`relayFilter` to a single `filter` object
  - The new API provides a cleaner, more cohesive interface for configuring both adapter and relay filters together

  **Usage**

  ```typescript
  builder.setFilter({
    adapter: (item) => item.type === TelemetryType.Exception,
    relay: (item) => item.scope?.includes("critical"),
  });
  ```

## 4.5.0

### Minor Changes

- [#3775](https://github.com/equinor/fusion-framework/pull/3775) [`1827381`](https://github.com/equinor/fusion-framework/commit/182738177dbbf5baaf9732ef3b540b4df80932f6) Thanks [@odinr](https://github.com/odinr)! - Add filtering options for telemetry messages passed from provider to adapters and parent providers.

  **New Features**

  - **`setAdapterFilter`**: Filter which telemetry items are passed to adapters
  - **`setRelayFilter`**: Filter which telemetry items are relayed to parent providers

  **Usage**

  ```typescript
  enableTelemetry(configurator, {
    configure: (builder) => {
      // Only send exceptions to adapters
      builder.setAdapterFilter((item) => item.type === TelemetryType.Exception);

      // Only relay important events to parent provider
      builder.setRelayFilter(
        (item) =>
          item.type === TelemetryType.Exception ||
          item.scope?.includes("critical")
      );
    },
  });
  ```

  **Hierarchical Filtering**

  This feature enables filtering at each level of hierarchical telemetry setups (bootstrap → portal → apps), allowing:

  - Portal instances to filter which events reach bootstrap adapters
  - App instances to filter which events reach portal providers
  - Performance optimization by filtering unnecessary telemetry before processing
  - Privacy control by preventing sensitive telemetry from flowing up the hierarchy

  **Backward Compatibility**

  Existing code continues to work without filters - all items pass through by default when no filters are configured.

  Closes: https://github.com/equinor/fusion-framework/issues/3774

## 4.4.0

### Minor Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Export `Measurement` class and `IMeasurement` interface from telemetry module.

  These classes were previously internal-only but are now needed by other modules for telemetry integration. No breaking changes to existing functionality.

  Migration: No action required. These are new exports that can be imported when needed.

## 4.3.1

### Patch Changes

- [#3680](https://github.com/equinor/fusion-framework/pull/3680) [`7ef76e3`](https://github.com/equinor/fusion-framework/commit/7ef76e36a854f01d1cd7bc1c40b1ca0172a01fc3) Thanks [@odinr](https://github.com/odinr)! - Fix incorrect TSDoc examples in telemetry module documentation.

  - Remove non-existent `setFilter` method references from TelemetryConfigurator documentation
  - Fix exception examples to include required `exception` property
  - Correct metric examples to have `value` at top level instead of in properties
  - Update scope properties to use array format instead of single strings
  - Improve formatting of trackException example for better readability

- [#3544](https://github.com/equinor/fusion-framework/pull/3544) [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod from 4.1.11 to 4.1.12, which includes a critical bug fix for ZodError.flatten() preventing crashes on 'toString' key and improved error handling throughout the framework.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e), [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59)]:
  - @equinor/fusion-observable@8.5.6
  - @equinor/fusion-framework-module@5.0.5

## 4.3.0

### Minor Changes

- [#3604](https://github.com/equinor/fusion-framework/pull/3604) [`31e2581`](https://github.com/equinor/fusion-framework/commit/31e2581fca2765dc7caf54f74db3db51020b53b7) Thanks [@odinr](https://github.com/odinr)! - Added `configureAdapter` method to `TelemetryConfigurator` for dynamic adapter configuration with dependency injection support.

  The new method allows adapters to be configured using callback functions that can access module instances through `requireInstance`, enabling more flexible and powerful adapter setup patterns.

  **Breaking Changes:**

  - `setAdapter()` method now requires an explicit identifier parameter: `builder.setAdapter('adapter-name', adapter)`

  **Note:** While this introduces breaking changes to the configurator API, we're treating this as a minor version bump since the telemetry module is still in active development and not yet widely adopted by consumers.

  **Changes:**

  - Fix RxJS observable chain in TelemetryConfigurator to properly resolve async adapters
  - Optimize adapter accumulation using mutable accumulator pattern for better performance with many adapters
  - Fix potential memory leaks by using proper shareReplay configuration with refCount: true
  - Add `hasAdapter` method to check adapter existence without logging exceptions
  - Update documentation level filter logic to use >= instead of <= for correct filtering behavior
  - Update documentation to use setAdapter instead of non-existent addAdapter method
  - Update `setAdapter` method to require explicit identifier parameter for consistency
  - Add comprehensive documentation examples for multiple adapters with different identifiers
  - Fix test cases to use correct adapter configuration format
  - Update SPA bootstrap and related code to use proper adapter identifiers

  **Migration:**

  Update `setAdapter()` calls to include identifier parameter: `builder.setAdapter('adapter-name', adapter)`

### Patch Changes

- Updated dependencies [[`dcdec9f`](https://github.com/equinor/fusion-framework/commit/dcdec9f87d591781d11db34c24e6bf85de3a3f48), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be)]:
  - @equinor/fusion-framework-module-event@4.4.0
  - @equinor/fusion-framework-module@5.0.4

## 4.2.0

### Minor Changes

- [#3488](https://github.com/equinor/fusion-framework/pull/3488) [`4e78565`](https://github.com/equinor/fusion-framework/commit/4e7856590f73fee840b065a0e4d89962e167ed9e) Thanks [@odinr](https://github.com/odinr)! - Add new telemetry module for collecting and sending telemetry data.

  - Add `TelemetryModule` with configurable adapters
  - Implement Application Insights and Console adapters
  - Add `Measurement` class for telemetry data collection
  - Provide `TelemetryProvider` and `TelemetryConfigurator` for module integration
  - Include comprehensive test coverage for all components
  - Support custom metadata resolution and telemetry item merging
  - async initialization support with `initialize()` method on providers and adapters
  - Enhanced error handling in measurement disposal and metadata resolution

  Resolves #3483

### Patch Changes

- [#3500](https://github.com/equinor/fusion-framework/pull/3500) [`0bad642`](https://github.com/equinor/fusion-framework/commit/0bad642205a7f780dcb6685243102b65b3755fa2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update zod dependency from ^3.25.75 to ^4.1.11 and fix compatibility issues with zod v4's stricter record type requirements.

- [#3490](https://github.com/equinor/fusion-framework/pull/3490) [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1) Thanks [@odinr](https://github.com/odinr)! - Add utility for mapping module configurator events to telemetry items.

  - Add `mapConfiguratorEvents` utility function to convert `ModuleEvent` to `TelemetryItem`
  - Map `ModuleEventLevel` to `TelemetryLevel` appropriately (Error=1, Warning=2, Information=3, Debug=4)
  - Include event metadata (timing, errors, properties) in telemetry data
  - Update `enableTelemetry` function to support `attachConfiguratorEvents` option
  - Export `mapConfiguratorEvents` from utils index

  This enables telemetry modules to capture core framework events from module configurators.

- Updated dependencies [[`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-observable@8.5.5
  - @equinor/fusion-framework-module@5.0.3

## 4.1.17

### Patch Changes

- [#3439](https://github.com/equinor/fusion-framework/pull/3439) [`c84d9eb`](https://github.com/equinor/fusion-framework/commit/c84d9ebce4faa01e63e8270ca1c1d573be7eddfe) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update @microsoft/applicationinsights-web from 3.3.9 to 3.3.10

## 4.1.16

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-msal@5.0.0

## 4.1.15

### Patch Changes

- [#3169](https://github.com/equinor/fusion-framework/pull/3169) [`1492d5d`](https://github.com/equinor/fusion-framework/commit/1492d5d8473e55672783a8a8adc18c9e73dd922c) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated @microsoft/applicationinsights-web from 3.3.8 to 3.3.9

  ### Changes

  - Fixed autoCaptureHandler issue that caused click events not to be auto-captured
  - Updated SDK Loader to avoid CodeQL scanning issues
  - Fixed HTML event capturing in Click Analytics
  - Export ICorrelationConfig interface from dependencies extension

  ### Links

  - [GitHub releases](https://github.com/microsoft/ApplicationInsights-JS/releases/tag/3.3.9)
  - [Changelog](https://github.com/microsoft/ApplicationInsights-JS/blob/main/RELEASES.md)

- Updated dependencies [[`da373ad`](https://github.com/equinor/fusion-framework/commit/da373ade663898b2628e28529b6e3dea3b91ed43)]:
  - @equinor/fusion-framework-module-msal@4.1.0

## 4.1.14

### Patch Changes

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-framework-module-msal@4.0.8

## 4.1.13

### Patch Changes

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-msal@4.0.7

## 4.1.12

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-framework-module-msal@4.0.6

## 4.1.11

### Patch Changes

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-framework-module-msal@4.0.5

## 4.1.10

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-module-msal@4.0.4

## 4.1.9

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-msal@4.0.3

## 4.1.8

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2901](https://github.com/equinor/fusion-framework/pull/2901) [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to Biome `useOptionalChain`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-msal@4.0.2

## 4.1.7

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`6efabb7`](https://github.com/equinor/fusion-framework/commit/6efabb7837a97319e976e122db855d8b88b031a6), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-msal@4.0.1

## 4.1.6

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
  - @equinor/fusion-framework-module-msal@4.0.0

## 4.1.5

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module@4.3.5
  - @equinor/fusion-framework-module-msal@3.1.5

## 4.1.4

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-framework-module-msal@3.1.4

## 4.1.3

### Patch Changes

- Updated dependencies [[`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module@4.3.3
  - @equinor/fusion-framework-module-msal@3.1.3

## 4.1.2

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2316](https://github.com/equinor/fusion-framework/pull/2316) [`73bc641`](https://github.com/equinor/fusion-framework/commit/73bc6413a8930e71185de27e5386545b2ef89e0f) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @microsoft/applicationinsights-web from 3.1.0 to 3.3.0

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

## 4.1.1

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-framework-module-msal@3.1.1

## 4.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-msal@3.1.0

## 4.0.6

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-module-msal@3.0.10

## 4.0.5

### Patch Changes

- Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
  - @equinor/fusion-framework-module-msal@3.0.9

## 4.0.4

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-msal@3.0.8

## 4.0.3

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-framework-module-msal@3.0.7

## 4.0.2

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-framework-module-msal@3.0.6

## 4.0.1

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-msal@3.0.5

## 4.0.0

### Major Changes

- [#884](https://github.com/equinor/fusion-framework/pull/884) [`c36bbc6a`](https://github.com/equinor/fusion-framework/commit/c36bbc6a05169a08e85132697a8178227984eee0) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump @microsoft/applicationinsights-web from 2.8.9 to 3.0.2

  This module is not yet been implemented by portal, bumping version and fix potential breaking changes when implementing

  see **[breaking changes from `@microsoft/applicationinsights-web`](https://microsoft.github.io/ApplicationInsights-JS/upgrade/v3_BreakingChanges.html)**

### Patch Changes

- Updated dependencies [[`1a2880d2`](https://github.com/equinor/fusion-framework/commit/1a2880d2e4c80ac5ce08f63ca3699fe77e4b565c)]:
  - @equinor/fusion-framework-module@4.2.2

## 3.0.8

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-module@4.2.1
  - @equinor/fusion-framework-module-msal@3.0.4

## 3.0.7

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

## 3.0.6 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 3.0.5 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 3.0.4 (2023-04-18)

### Bug Fixes

- **services:** update-api-provider-types,,added som missing types,,@equinor/fusion-framework-app v7.0.3 packages/app ([994188b](https://github.com/equinor/fusion-framework/commit/994188bbc727bc10a924eeb4d8178763a4c27ac7))
- update github action ([0a0860a](https://github.com/equinor/fusion-framework/commit/0a0860ad23ed33d5df73aac08710076901e3e958))

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@3.0.2...@equinor/fusion-framework-module-telemetry@3.0.3) (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@3.0.1...@equinor/fusion-framework-module-telemetry@3.0.2) (2023-04-18)

### Bug Fixes

- update release action ([c73d7c6](https://github.com/equinor/fusion-framework/commit/c73d7c61e228b62810a6d1a8f32b438f78ec6f74))

## 3.0.1 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@2.0.0...@equinor/fusion-framework-module-telemetry@2.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.23...@equinor/fusion-framework-module-telemetry@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.23...@equinor/fusion-framework-module-telemetry@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.23 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.22 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.21 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.20 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.19 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.18 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.17 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.16 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.15 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.11...@equinor/fusion-framework-module-telemetry@1.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.10 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.8...@equinor/fusion-framework-module-telemetry@1.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.8 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.5...@equinor/fusion-framework-module-telemetry@1.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.4...@equinor/fusion-framework-module-telemetry@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.3...@equinor/fusion-framework-module-telemetry@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.2...@equinor/fusion-framework-module-telemetry@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.1...@equinor/fusion-framework-module-telemetry@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.1-next.1...@equinor/fusion-framework-module-telemetry@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.1-next.0...@equinor/fusion-framework-module-telemetry@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@1.0.0...@equinor/fusion-framework-module-telemetry@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.3.5...@equinor/fusion-framework-module-telemetry@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.5 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.3 (2022-08-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.3.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.3.0...@equinor/fusion-framework-module-telemetry@0.3.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

# [0.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.16...@equinor/fusion-framework-module-telemetry@0.3.0) (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

## 0.2.16 (2022-08-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.14...@equinor/fusion-framework-module-telemetry@0.2.15) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.13...@equinor/fusion-framework-module-telemetry@0.2.14) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.2.13 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.11...@equinor/fusion-framework-module-telemetry@0.2.12) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.10...@equinor/fusion-framework-module-telemetry@0.2.11) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.9...@equinor/fusion-framework-module-telemetry@0.2.10) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.8...@equinor/fusion-framework-module-telemetry@0.2.9) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.7...@equinor/fusion-framework-module-telemetry@0.2.8) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.6...@equinor/fusion-framework-module-telemetry@0.2.7) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.5...@equinor/fusion-framework-module-telemetry@0.2.6) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.2.5 (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.3...@equinor/fusion-framework-module-telemetry@0.2.4) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.2...@equinor/fusion-framework-module-telemetry@0.2.3) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.2.1...@equinor/fusion-framework-module-telemetry@0.2.2) (2022-06-13)

### Bug Fixes

- **module-telemetry:** change operator ([dcc1284](https://github.com/equinor/fusion-framework/commit/dcc12841639c789af2d4f9282f758e3d8223c676))

## 0.2.1 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

# 0.2.0 (2022-06-10)

### Features

- **module:** allow modules to have deps ([#128](https://github.com/equinor/fusion-framework/issues/128)) ([2466b1a](https://github.com/equinor/fusion-framework/commit/2466b1ad9d43aa472da9daf8c59b350844c0dae9))

## 0.1.10 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.8...@equinor/fusion-framework-module-telemetry@0.1.9) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.1.8 (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.6...@equinor/fusion-framework-module-telemetry@0.1.7) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.5...@equinor/fusion-framework-module-telemetry@0.1.6) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.4...@equinor/fusion-framework-module-telemetry@0.1.5) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.3...@equinor/fusion-framework-module-telemetry@0.1.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-telemetry@0.1.2...@equinor/fusion-framework-module-telemetry@0.1.3) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.1.2 (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

## 0.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-telemetry

# 0.1.0 (2022-02-07)

### Bug Fixes

- **module-telemetry:** fix namechange of msal ([daea24f](https://github.com/equinor/fusion-framework/commit/daea24fc0af9eaba96d63361b4da3f30c99c9b8f))
- **module-telemetry:** remove unused packages ([2ad74cc](https://github.com/equinor/fusion-framework/commit/2ad74cc6d8e0330e7724069c9cbcdb13a2f41b85))

### Features

- add module for telemetry ([3960165](https://github.com/equinor/fusion-framework/commit/39601651665516985c4f31726363b42eee1adcae))

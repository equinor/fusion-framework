# Change Log

## 7.4.9

### Patch Changes

- Updated dependencies [[`1594ed8`](https://github.com/equinor/fusion-framework/commit/1594ed879579d0db6e42c5052a33174f7bf9346c), [`1594ed8`](https://github.com/equinor/fusion-framework/commit/1594ed879579d0db6e42c5052a33174f7bf9346c)]:
  - @equinor/fusion-framework-module-msal@7.2.1

## 7.4.8

### Patch Changes

- Updated dependencies [[`dcf51aa`](https://github.com/equinor/fusion-framework/commit/dcf51aa87ac79200893ec4909632554464e75055)]:
  - @equinor/fusion-framework-module-msal@7.2.0

## 7.4.7

### Patch Changes

- Updated dependencies [[`0b34d5d`](https://github.com/equinor/fusion-framework/commit/0b34d5d895c740a77fc995abeca910fdca1cf633)]:
  - @equinor/fusion-framework-module-msal@7.1.0

## 7.4.6

### Patch Changes

- Updated dependencies [[`21458e5`](https://github.com/equinor/fusion-framework/commit/21458e5e7585f0bf266c66d6f4135396fd7c1529)]:
  - @equinor/fusion-framework-module-telemetry@4.6.3

## 7.4.5

### Patch Changes

- Updated dependencies [[`434ce70`](https://github.com/equinor/fusion-framework/commit/434ce707d237b399f8438eebe742641b2a81b11f)]:
  - @equinor/fusion-framework-module-service-discovery@9.1.0

## 7.4.4

### Patch Changes

- Updated dependencies [[`1f5a8e4`](https://github.com/equinor/fusion-framework/commit/1f5a8e475ea30fa1e0f32c7dab885a5a42c50bba)]:
  - @equinor/fusion-framework-module-event@5.0.0
  - @equinor/fusion-framework-module-context@7.0.2
  - @equinor/fusion-framework-module-telemetry@4.6.2

## 7.4.3

### Patch Changes

- Updated dependencies [[`cb37cae`](https://github.com/equinor/fusion-framework/commit/cb37cae45e06778e8d1ea20faed31b582e49fcae)]:
  - @equinor/fusion-framework-module-msal@7.0.0
  - @equinor/fusion-framework-module-http@7.0.7

## 7.4.2

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Update FrameworkConfigurator.configureMsal to use MsalClientConfig instead of AuthClientConfig.

  This change aligns the framework configurator with the updated MSAL module types while maintaining backward compatibility through type aliases.

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-http@7.0.5
  - @equinor/fusion-framework-module-telemetry@4.4.0
  - @equinor/fusion-framework-module-msal@6.0.0

## 7.4.1

### Patch Changes

- [#3590](https://github.com/equinor/fusion-framework/pull/3590) [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be) Thanks [@odinr](https://github.com/odinr)! - Internal: Add static className properties to configurator classes (ModulesConfigurator, FrameworkConfigurator, AppConfigurator) to prevent constructor name mangling during compilation and ensure proper event naming.

- Updated dependencies [[`d08ee58`](https://github.com/equinor/fusion-framework/commit/d08ee5850acf5bbbf63ac93c8da81647e3ca55b5), [`dcdec9f`](https://github.com/equinor/fusion-framework/commit/dcdec9f87d591781d11db34c24e6bf85de3a3f48), [`6dfb29e`](https://github.com/equinor/fusion-framework/commit/6dfb29eef67548228c05668b44ad02a34c83b050), [`6900d98`](https://github.com/equinor/fusion-framework/commit/6900d98142c84f4703095f8d03b09af57a1d7d2e), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`88e0e58`](https://github.com/equinor/fusion-framework/commit/88e0e58fcdcfa069be2c652ac46a4bb11e91abb1), [`31e2581`](https://github.com/equinor/fusion-framework/commit/31e2581fca2765dc7caf54f74db3db51020b53b7), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be), [`a13de68`](https://github.com/equinor/fusion-framework/commit/a13de68b2f196a779ea850af055d8db7926941ce)]:
  - @equinor/fusion-framework-module-context@7.0.2
  - @equinor/fusion-framework-module-event@4.4.0
  - @equinor/fusion-framework-module-services@7.1.3
  - @equinor/fusion-framework-module-http@7.0.3
  - @equinor/fusion-framework-module@5.0.4
  - @equinor/fusion-framework-module-msal@5.1.1
  - @equinor/fusion-framework-module-telemetry@4.3.0
  - @equinor/fusion-framework-module-service-discovery@9.0.3

## 7.4.0

### Minor Changes

- [#3492](https://github.com/equinor/fusion-framework/pull/3492) [`7ba4713`](https://github.com/equinor/fusion-framework/commit/7ba47139a8d7cfbb757bd4626425c611e22c2126) Thanks [@odinr](https://github.com/odinr)! - Integrate telemetry module into framework core.

  - Add TelemetryModule to FusionModules type definition
  - Enable telemetry in FrameworkConfigurator with default configuration
  - Add event$ observable with framework-specific event prefixing
  - Include framework metadata in telemetry collection

  resolves: [#3491](https://github.com/equinor/fusion-framework/issues/3491)

### Patch Changes

- [#3490](https://github.com/equinor/fusion-framework/pull/3490) [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1) Thanks [@odinr](https://github.com/odinr)! - Remove explicit logger initialization from configurator constructors in favor of telemetry.

  - Removed `this.logger = new ModuleConsoleLogger(...)` from FrameworkConfigurator, AppConfigurator, and WidgetConfigurator constructors
  - Logger functionality will be handled through telemetry module with console logging adapter

  This prepares the configurators to use telemetry for logging instead of direct console logger initialization.

- Updated dependencies [[`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275), [`a66d70a`](https://github.com/equinor/fusion-framework/commit/a66d70a9fa40ab14f2534be4f22b6d1f602097a0), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1), [`4e78565`](https://github.com/equinor/fusion-framework/commit/4e7856590f73fee840b065a0e4d89962e167ed9e), [`0bad642`](https://github.com/equinor/fusion-framework/commit/0bad642205a7f780dcb6685243102b65b3755fa2), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-framework-module-context@7.0.1
  - @equinor/fusion-framework-module-http@7.0.2
  - @equinor/fusion-framework-module@5.0.3
  - @equinor/fusion-framework-module-telemetry@4.2.0
  - @equinor/fusion-framework-module-service-discovery@9.0.2

## 7.3.20

### Patch Changes

- [#3465](https://github.com/equinor/fusion-framework/pull/3465) [`df88854`](https://github.com/equinor/fusion-framework/commit/df888548eb50dd2d130e6651596ab4f7fac41f2c) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump rollup from 4.52.2 to 4.52.3

  This updates the rollup build tool to the latest patch version, which includes bug fixes for native loader environments that don't support reports.

- Updated dependencies [[`5b2b300`](https://github.com/equinor/fusion-framework/commit/5b2b300492ff7f3e2bf9aa10d6697178486028ec)]:
  - @equinor/fusion-framework-module-services@7.1.2

## 7.3.19

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-http@7.0.0
  - @equinor/fusion-framework-module-msal@5.0.0
  - @equinor/fusion-framework-module-service-discovery@9.0.0
  - @equinor/fusion-framework-module-services@7.1.0

## 7.3.18

### Patch Changes

- [#3391](https://github.com/equinor/fusion-framework/pull/3391) [`7792659`](https://github.com/equinor/fusion-framework/commit/7792659bf2ade10dba5e54c610d5abff522324b6) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vitest and @vitest/coverage-v8 from 2.0.1 to 3.2.4

  Major version update of Vitest testing framework and coverage package.

  ### Breaking Changes

  - Updated from Vitest v2 to v3
  - Coverage reporting may have configuration changes
  - Test runner behavior improvements

  ### New Features

  - Enhanced coverage reporting capabilities
  - Improved test performance
  - Better error handling and reporting
  - Updated Vite integration (v6.3.5)

  ### Links

  - [Vitest v3.2.4 Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v3.2.4)
  - [Vitest v3 Migration Guide](https://vitest.dev/guide/migration.html)
  - [Coverage v8 Documentation](https://vitest.dev/guide/coverage.html)

- Updated dependencies [[`da373ad`](https://github.com/equinor/fusion-framework/commit/da373ade663898b2628e28529b6e3dea3b91ed43), [`3ce5a18`](https://github.com/equinor/fusion-framework/commit/3ce5a1887c8fb90f24c3367f8926db69cc9a1914)]:
  - @equinor/fusion-framework-module-msal@4.1.0
  - @equinor/fusion-framework-module-services@7.0.2

## 7.3.17

### Patch Changes

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module-http@6.3.4
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-framework-module-msal@4.0.8
  - @equinor/fusion-framework-module-service-discovery@8.0.18
  - @equinor/fusion-framework-module-services@7.0.0
  - @equinor/fusion-framework-module-context@7.0.0
  - @equinor/fusion-framework-module-event@4.3.7

## 7.3.16

### Patch Changes

- Updated dependencies [[`4447dd9`](https://github.com/equinor/fusion-framework/commit/4447dd9da60305eade68241ffbe670c4c7dde19a)]:
  - @equinor/fusion-framework-module-services@6.0.4
  - @equinor/fusion-framework-module-context@6.0.6

## 7.3.15

### Patch Changes

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-services@6.0.3
  - @equinor/fusion-framework-module-http@6.3.3
  - @equinor/fusion-framework-module-msal@4.0.7
  - @equinor/fusion-framework-module-context@6.0.6
  - @equinor/fusion-framework-module-service-discovery@8.0.17

## 7.3.14

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@6.0.5
  - @equinor/fusion-framework-module-service-discovery@8.0.16
  - @equinor/fusion-framework-module-services@6.0.2

## 7.3.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@6.0.4
  - @equinor/fusion-framework-module-service-discovery@8.0.15
  - @equinor/fusion-framework-module-services@6.0.2

## 7.3.12

### Patch Changes

- Updated dependencies [[`231e24e`](https://github.com/equinor/fusion-framework/commit/231e24eef9ca33db2fbde2fdd1c918eeb620c8c4)]:
  - @equinor/fusion-framework-module-context@6.0.3

## 7.3.11

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module-context@6.0.2
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-framework-module-event@4.3.6
  - @equinor/fusion-framework-module-http@6.3.2
  - @equinor/fusion-framework-module-msal@4.0.6
  - @equinor/fusion-framework-module-service-discovery@8.0.14
  - @equinor/fusion-framework-module-services@6.0.2

## 7.3.10

### Patch Changes

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-framework-module-services@6.0.1
  - @equinor/fusion-framework-module-event@4.3.5
  - @equinor/fusion-framework-module-http@6.3.1
  - @equinor/fusion-framework-module-msal@4.0.5
  - @equinor/fusion-framework-module-context@6.0.1
  - @equinor/fusion-framework-module-service-discovery@8.0.13

## 7.3.9

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42), [`7a0a510`](https://github.com/equinor/fusion-framework/commit/7a0a510e0af1f0769c596e1b9aaa391250efd95d)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-module-http@6.3.0
  - @equinor/fusion-framework-module-context@6.0.0
  - @equinor/fusion-framework-module-event@4.3.4
  - @equinor/fusion-framework-module-msal@4.0.4
  - @equinor/fusion-framework-module-service-discovery@8.0.12
  - @equinor/fusion-framework-module-services@6.0.0

## 7.3.8

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-services@5.1.4
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-event@4.3.3
  - @equinor/fusion-framework-module-http@6.2.5
  - @equinor/fusion-framework-module-msal@4.0.3
  - @equinor/fusion-framework-module-context@5.1.3
  - @equinor/fusion-framework-module-service-discovery@8.0.11

## 7.3.7

### Patch Changes

- Updated dependencies [[`2c9fcd6`](https://github.com/equinor/fusion-framework/commit/2c9fcd6bcacb3e1b94d7aa4ad2e9d216a329faa5)]:
  - @equinor/fusion-framework-module-context@5.1.2

## 7.3.6

### Patch Changes

- Updated dependencies [[`134863f`](https://github.com/equinor/fusion-framework/commit/134863fa96bcd5f799bc621f755b1605d0c1255c)]:
  - @equinor/fusion-framework-module-services@5.1.3
  - @equinor/fusion-framework-module-context@5.1.1
  - @equinor/fusion-framework-module-service-discovery@8.0.10

## 7.3.5

### Patch Changes

- Updated dependencies [[`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8)]:
  - @equinor/fusion-framework-module-http@6.2.4
  - @equinor/fusion-framework-module-service-discovery@8.0.9
  - @equinor/fusion-framework-module-services@5.1.2

## 7.3.4

### Patch Changes

- Updated dependencies [[`5da6b2d`](https://github.com/equinor/fusion-framework/commit/5da6b2d4cb7fb93ff3784753a0052d3362ab828d)]:
  - @equinor/fusion-framework-module-context@5.1.0

## 7.3.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139), [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6), [`0a7cfc1`](https://github.com/equinor/fusion-framework/commit/0a7cfc18a2debea272bc934c473ede9510c0368d)]:
  - @equinor/fusion-framework-module-service-discovery@8.0.8
  - @equinor/fusion-framework-module-services@5.1.2
  - @equinor/fusion-framework-module-context@5.0.19
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-event@4.3.2
  - @equinor/fusion-framework-module-http@6.2.3
  - @equinor/fusion-framework-module-msal@4.0.2

## 7.3.2

### Patch Changes

- Updated dependencies [[`11e18fd`](https://github.com/equinor/fusion-framework/commit/11e18fd755e65d1bbbb9b98638fdb9a98c2c23ab)]:
  - @equinor/fusion-framework-module-context@5.0.18

## 7.3.1

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`6efabb7`](https://github.com/equinor/fusion-framework/commit/6efabb7837a97319e976e122db855d8b88b031a6), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-http@6.2.2
  - @equinor/fusion-framework-module-msal@4.0.1
  - @equinor/fusion-framework-module-services@5.1.1
  - @equinor/fusion-framework-module-service-discovery@8.0.7
  - @equinor/fusion-framework-module-context@5.0.17
  - @equinor/fusion-framework-module-event@4.3.1

## 7.3.0

### Minor Changes

- [#2814](https://github.com/equinor/fusion-framework/pull/2814) [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa) Thanks [@odinr](https://github.com/odinr)! - ---

  ## "@equinor/fusion-framework": minor

  **@equinor/fusion-framework:**

  Enhanced the `FrameworkConfigurator` class to improve the configuration of MSAL authentication.

  - Updated the `configureMsal` method to accept a callback function (`AuthConfigFn`) and an optional `requiresAuth` parameter.
  - The `configureMsal` method now adds a configuration object that sets the `requiresAuth` property and invokes the provided callback function with the builder.

  ```ts
  /** Example of using the updated `configureMsal` method */
  import { FrameworkConfigurator } from "@equinor/fusion-framework";

  const configurator = new FrameworkConfigurator();
  // prefered way to configure MSAL
  configurator.configureMsal((builder) => {
    builder.setClientConfig({
      tentantId: "...",
      clientId: "...",
      redirectUri: "...",
    });
    builder.setRequiresAuth(true);
  });

  // backward compatible way to configure MSAL
  configurator.configureMsal(
    {
      tentantId: "...",
      clientId: "...",
      redirectUri: "...",
    },
    true
  );
  ```

  This change is **backward compatible** and does not require any changes to existing code, but it is recommended to use the new callback function for better readability and maintainability.

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
  - @equinor/fusion-framework-module-msal@4.0.0
  - @equinor/fusion-framework-module-http@6.2.1
  - @equinor/fusion-framework-module-service-discovery@8.0.6
  - @equinor/fusion-framework-module-services@5.1.0

## 7.2.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.16
  - @equinor/fusion-framework-module-service-discovery@8.0.5
  - @equinor/fusion-framework-module-services@5.1.0

## 7.2.15

### Patch Changes

- Updated dependencies [[`a551b01`](https://github.com/equinor/fusion-framework/commit/a551b01d552b9b9770d1f5132803f92cc91d4bc6)]:
  - @equinor/fusion-framework-module-event@4.3.0
  - @equinor/fusion-framework-module-context@5.0.15

## 7.2.14

### Patch Changes

- Updated dependencies [[`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb)]:
  - @equinor/fusion-framework-module-services@5.1.0
  - @equinor/fusion-framework-module-context@5.0.15

## 7.2.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.15
  - @equinor/fusion-framework-module-service-discovery@8.0.4
  - @equinor/fusion-framework-module-services@5.0.1

## 7.2.12

### Patch Changes

- Updated dependencies [[`2343667`](https://github.com/equinor/fusion-framework/commit/234366756878550ed7405610f384d69fb6a89967)]:
  - @equinor/fusion-framework-module-services@5.0.1
  - @equinor/fusion-framework-module-context@5.0.14

## 7.2.11

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.14
  - @equinor/fusion-framework-module-service-discovery@8.0.3
  - @equinor/fusion-framework-module-services@5.0.0

## 7.2.10

### Patch Changes

- Updated dependencies [[`9d1cb90`](https://github.com/equinor/fusion-framework/commit/9d1cb9003fa10e7ccaa95c20ef86f0a618034641)]:
  - @equinor/fusion-framework-module-services@5.0.0
  - @equinor/fusion-framework-module-context@5.0.13

## 7.2.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.13
  - @equinor/fusion-framework-module-service-discovery@8.0.2
  - @equinor/fusion-framework-module-services@4.1.5

## 7.2.8

### Patch Changes

- Updated dependencies [[`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51)]:
  - @equinor/fusion-framework-module-http@6.2.0
  - @equinor/fusion-framework-module-services@4.1.5
  - @equinor/fusion-framework-module-service-discovery@8.0.1
  - @equinor/fusion-framework-module-context@5.0.12

## 7.2.7

### Patch Changes

- Updated dependencies [[`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31), [`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d), [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa)]:
  - @equinor/fusion-framework-module-http@6.1.0
  - @equinor/fusion-framework-module@4.3.5
  - @equinor/fusion-framework-module-service-discovery@8.0.0
  - @equinor/fusion-framework-module-services@4.1.4
  - @equinor/fusion-framework-module-context@5.0.12
  - @equinor/fusion-framework-module-event@4.2.4
  - @equinor/fusion-framework-module-msal@3.1.5

## 7.2.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.11
  - @equinor/fusion-framework-module-service-discovery@7.1.13
  - @equinor/fusion-framework-module-services@4.1.3

## 7.2.5

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-framework-module-context@5.0.10
  - @equinor/fusion-framework-module-event@4.2.3
  - @equinor/fusion-framework-module-http@6.0.3
  - @equinor/fusion-framework-module-msal@3.1.4
  - @equinor/fusion-framework-module-service-discovery@7.1.12
  - @equinor/fusion-framework-module-services@4.1.3

## 7.2.4

### Patch Changes

- Updated dependencies [[`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module-http@6.0.2
  - @equinor/fusion-framework-module@4.3.3
  - @equinor/fusion-framework-module-context@5.0.9
  - @equinor/fusion-framework-module-service-discovery@7.1.11
  - @equinor/fusion-framework-module-services@4.1.2
  - @equinor/fusion-framework-module-event@4.2.2
  - @equinor/fusion-framework-module-msal@3.1.3

## 7.2.3

### Patch Changes

- Updated dependencies [[`736ef31`](https://github.com/equinor/fusion-framework/commit/736ef310ee101738f9022d581a2b3189b30a2646)]:
  - @equinor/fusion-framework-module-event@4.2.1
  - @equinor/fusion-framework-module-context@5.0.8

## 7.2.2

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`b628e90`](https://github.com/equinor/fusion-framework/commit/b628e90500b62e0185c09eb665ce31025bc9b541), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-module@4.3.2
  - @equinor/fusion-framework-module-http@6.0.1
  - @equinor/fusion-framework-module-service-discovery@7.1.10
  - @equinor/fusion-framework-module-services@4.1.1
  - @equinor/fusion-framework-module-context@5.0.8
  - @equinor/fusion-framework-module-event@4.2.0
  - @equinor/fusion-framework-module-msal@3.1.2

## 7.2.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.7
  - @equinor/fusion-framework-module-service-discovery@7.1.9
  - @equinor/fusion-framework-module-services@4.1.0

## 7.2.0

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

- Updated dependencies [[`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
  - @equinor/fusion-framework-module-services@4.1.0
  - @equinor/fusion-framework-module-http@6.0.0
  - @equinor/fusion-framework-module-context@5.0.6
  - @equinor/fusion-framework-module-service-discovery@7.1.8

## 7.1.8

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`9a91bb7`](https://github.com/equinor/fusion-framework/commit/9a91bb737d3452e697c047c0f5c7caa2adfd535d), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-framework-module-event@4.1.2
  - @equinor/fusion-framework-module-context@5.0.5
  - @equinor/fusion-framework-module-http@5.2.3
  - @equinor/fusion-framework-module-msal@3.1.1
  - @equinor/fusion-framework-module-service-discovery@7.1.7
  - @equinor/fusion-framework-module-services@4.0.2

## 7.1.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.4
  - @equinor/fusion-framework-module-service-discovery@7.1.6
  - @equinor/fusion-framework-module-services@4.0.1

## 7.1.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.3
  - @equinor/fusion-framework-module-service-discovery@7.1.5
  - @equinor/fusion-framework-module-services@4.0.1

## 7.1.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.2
  - @equinor/fusion-framework-module-service-discovery@7.1.4
  - @equinor/fusion-framework-module-services@4.0.1

## 7.1.4

### Patch Changes

- Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
  - @equinor/fusion-framework-module-http@5.2.2
  - @equinor/fusion-framework-module-service-discovery@7.1.3
  - @equinor/fusion-framework-module-services@4.0.1

## 7.1.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@5.0.1
  - @equinor/fusion-framework-module-service-discovery@7.1.2
  - @equinor/fusion-framework-module-services@4.0.1

## 7.1.2

### Patch Changes

- Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
  - @equinor/fusion-framework-module-http@5.2.1
  - @equinor/fusion-framework-module-service-discovery@7.1.1
  - @equinor/fusion-framework-module-services@4.0.1

## 7.1.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-module-services@4.0.1
  - @equinor/fusion-framework-module-event@4.1.1
  - @equinor/fusion-framework-module-context@5.0.0

## 7.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-service-discovery@7.1.0
  - @equinor/fusion-framework-module-services@4.0.0
  - @equinor/fusion-framework-module-context@5.0.0
  - @equinor/fusion-framework-module-event@4.1.0
  - @equinor/fusion-framework-module-http@5.2.0
  - @equinor/fusion-framework-module-msal@3.1.0

## 7.0.33

### Patch Changes

- Updated dependencies [[`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098), [`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098)]:
  - @equinor/fusion-framework-module-context@4.2.0

## 7.0.32

### Patch Changes

- Updated dependencies [[`7424ad3`](https://github.com/equinor/fusion-framework/commit/7424ad37760904b7897bcafc11d85235246e1381)]:
  - @equinor/fusion-framework-module-context@4.1.1

## 7.0.31

### Patch Changes

- Updated dependencies [[`6e6ee6b`](https://github.com/equinor/fusion-framework/commit/6e6ee6b7ce280820111e8b98ac8377efb15808ef)]:
  - @equinor/fusion-framework-module-context@4.1.0

## 7.0.30

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-module-context@4.0.21
  - @equinor/fusion-framework-module-event@4.0.8
  - @equinor/fusion-framework-module-http@5.1.6
  - @equinor/fusion-framework-module-msal@3.0.10
  - @equinor/fusion-framework-module-service-discovery@7.0.20
  - @equinor/fusion-framework-module-services@3.2.4

## 7.0.29

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@4.0.20
  - @equinor/fusion-framework-module-service-discovery@7.0.19
  - @equinor/fusion-framework-module-services@3.2.3

## 7.0.28

### Patch Changes

- Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
  - @equinor/fusion-framework-module-msal@3.0.9
  - @equinor/fusion-framework-module-http@5.1.5
  - @equinor/fusion-framework-module-service-discovery@7.0.18
  - @equinor/fusion-framework-module-services@3.2.3

## 7.0.27

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4
  - @equinor/fusion-framework-module-service-discovery@7.0.17
  - @equinor/fusion-framework-module-services@3.2.3

## 7.0.26

### Patch Changes

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3
  - @equinor/fusion-framework-module-service-discovery@7.0.16
  - @equinor/fusion-framework-module-services@3.2.3

## 7.0.25

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@4.0.19
  - @equinor/fusion-framework-module-service-discovery@7.0.15
  - @equinor/fusion-framework-module-services@3.2.3

## 7.0.24

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`4ab2df5`](https://github.com/equinor/fusion-framework/commit/4ab2df5c83439f7fe3fe0846c005427e1793b576), [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-context@4.0.18
  - @equinor/fusion-framework-module-service-discovery@7.0.14
  - @equinor/fusion-framework-module-services@3.2.3
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-framework-module-msal@3.0.8
  - @equinor/fusion-framework-module-event@4.0.7

## 7.0.23

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@4.0.17
  - @equinor/fusion-framework-module-service-discovery@7.0.13
  - @equinor/fusion-framework-module-services@3.2.2

## 7.0.22

### Patch Changes

- Updated dependencies [[`ddc31c35`](https://github.com/equinor/fusion-framework/commit/ddc31c3571e36be057095238cf22e78051f423b0)]:
  - @equinor/fusion-framework-module-services@3.2.2
  - @equinor/fusion-framework-module-context@4.0.16
  - @equinor/fusion-framework-module-service-discovery@7.0.12

## 7.0.21

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-context@4.0.15
  - @equinor/fusion-framework-module-event@4.0.6
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-framework-module-msal@3.0.7
  - @equinor/fusion-framework-module-service-discovery@7.0.11
  - @equinor/fusion-framework-module-services@3.2.1

## 7.0.20

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa), [`f277c7fc`](https://github.com/equinor/fusion-framework/commit/f277c7fc54ca2ebe75ba1dda94a0d72eb7c8e15b), [`a2d2dee9`](https://github.com/equinor/fusion-framework/commit/a2d2dee987673171ad91daec98cb530649da5849)]:
  - @equinor/fusion-framework-module-http@5.1.0
  - @equinor/fusion-framework-module-services@3.2.0
  - @equinor/fusion-framework-module-service-discovery@7.0.10
  - @equinor/fusion-framework-module-context@4.0.14

## 7.0.19

### Patch Changes

- Updated dependencies [[`e539e606`](https://github.com/equinor/fusion-framework/commit/e539e606d04bd8b7dc0c0bfed7cd4a7731996936)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.9
  - @equinor/fusion-framework-module-services@3.1.5

## 7.0.18

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-framework-module-context@4.0.13
  - @equinor/fusion-framework-module-event@4.0.5
  - @equinor/fusion-framework-module-http@5.0.6
  - @equinor/fusion-framework-module-msal@3.0.6
  - @equinor/fusion-framework-module-service-discovery@7.0.8
  - @equinor/fusion-framework-module-services@3.1.5

## 7.0.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-context@4.0.12
  - @equinor/fusion-framework-module-service-discovery@7.0.7
  - @equinor/fusion-framework-module-services@3.1.4

## 7.0.16

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.6
  - @equinor/fusion-framework-module-services@3.1.4
  - @equinor/fusion-framework-module-context@4.0.11
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-event@4.0.4
  - @equinor/fusion-framework-module-http@5.0.5
  - @equinor/fusion-framework-module-msal@3.0.5

## 7.0.15

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

- Updated dependencies [[`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352)]:
  - @equinor/fusion-framework-module-context@4.0.10
  - @equinor/fusion-framework-module-event@4.0.2
  - @equinor/fusion-framework-module-http@5.0.4
  - @equinor/fusion-framework-module@4.2.1
  - @equinor/fusion-framework-module-msal@3.0.4
  - @equinor/fusion-framework-module-service-discovery@7.0.5
  - @equinor/fusion-framework-module-services@3.1.3

## 7.0.14

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- Updated dependencies [[`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`76b30c1e`](https://github.com/equinor/fusion-framework/commit/76b30c1e86db3db18adbe759bb1e39885de1c898), [`83ee5abf`](https://github.com/equinor/fusion-framework/commit/83ee5abf7bcab193c85980e5ae44895cd7f6f08d), [`7500ec2c`](https://github.com/equinor/fusion-framework/commit/7500ec2c9ca9b926a19539fc97c61c67f76fc8d9), [`060818eb`](https://github.com/equinor/fusion-framework/commit/060818eb04ebb9ed6deaed1f0b4530201b1181cf), [`3efbf0bb`](https://github.com/equinor/fusion-framework/commit/3efbf0bb93fc11aa158872cd6ab98a22bcfb59e5), [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c)]:
  - @equinor/fusion-framework-module@4.2.0
  - @equinor/fusion-framework-module-context@4.0.9
  - @equinor/fusion-framework-module-http@5.0.3
  - @equinor/fusion-framework-module-msal@3.0.3
  - @equinor/fusion-framework-module-service-discovery@7.0.4

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [7.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.12...@equinor/fusion-framework@7.0.13) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework

## 7.0.12 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.10...@equinor/fusion-framework@7.0.11) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.9...@equinor/fusion-framework@7.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.8...@equinor/fusion-framework@7.0.9) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework

## 7.0.8 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.6...@equinor/fusion-framework@7.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.5...@equinor/fusion-framework@7.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework

## 7.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework

## 7.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.2...@equinor/fusion-framework@7.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.1...@equinor/fusion-framework@7.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework

## [7.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@7.0.0...@equinor/fusion-framework@7.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework

## 7.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.15 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.14 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.13 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.12 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@6.0.10...@equinor/fusion-framework@6.0.11) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.10 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.9 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@6.0.7...@equinor/fusion-framework@6.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.7 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@6.0.5...@equinor/fusion-framework@6.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@6.0.4...@equinor/fusion-framework@6.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@6.0.3...@equinor/fusion-framework@6.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@6.0.2...@equinor/fusion-framework@6.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework

## 6.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.25...@equinor/fusion-framework@6.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework

## [6.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.25...@equinor/fusion-framework@6.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.25](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.24...@equinor/fusion-framework@5.0.25) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework

## 5.0.24 (2023-01-19)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.23](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.22...@equinor/fusion-framework@5.0.23) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.22](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.21...@equinor/fusion-framework@5.0.22) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework

## 5.0.21 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework

## 5.0.20 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework

## 5.0.19 (2022-12-21)

### Bug Fixes

- import export of app types ([6adeabe](https://github.com/equinor/fusion-framework/commit/6adeabecd1d261f3fda18a1cf93e5be4e374cbb5))

## 5.0.18 (2022-12-16)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.16...@equinor/fusion-framework@5.0.17) (2022-12-14)

### Bug Fixes

- **module-app:** make app module optional ([fa5c0ed](https://github.com/equinor/fusion-framework/commit/fa5c0ed0a9afc1f9ade3adb6e52e4425a59a7aa6))

## [5.0.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.15...@equinor/fusion-framework@5.0.16) (2022-12-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.14...@equinor/fusion-framework@5.0.15) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework

## 5.0.14 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.12...@equinor/fusion-framework@5.0.13) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.11...@equinor/fusion-framework@5.0.12) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.10...@equinor/fusion-framework@5.0.11) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.9...@equinor/fusion-framework@5.0.10) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.8...@equinor/fusion-framework@5.0.9) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.7...@equinor/fusion-framework@5.0.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.6...@equinor/fusion-framework@5.0.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.3...@equinor/fusion-framework@5.0.6) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.4...@equinor/fusion-framework@5.0.5) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.3...@equinor/fusion-framework@5.0.4) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.1...@equinor/fusion-framework@5.0.3) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.1...@equinor/fusion-framework@5.0.2) (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@5.0.0...@equinor/fusion-framework@5.0.1) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.17...@equinor/fusion-framework@5.0.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework

## [5.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.17...@equinor/fusion-framework@5.0.0-alpha.0) (2022-12-02)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.16...@equinor/fusion-framework@4.4.17) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.15...@equinor/fusion-framework@4.4.16) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.14...@equinor/fusion-framework@4.4.15) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.14](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.13...@equinor/fusion-framework@4.4.14) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.12...@equinor/fusion-framework@4.4.13) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.11...@equinor/fusion-framework@4.4.12) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.10...@equinor/fusion-framework@4.4.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.9...@equinor/fusion-framework@4.4.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.8...@equinor/fusion-framework@4.4.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.7...@equinor/fusion-framework@4.4.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.6...@equinor/fusion-framework@4.4.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.5...@equinor/fusion-framework@4.4.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.4.5 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.3...@equinor/fusion-framework@4.4.4) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.4.3 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.1...@equinor/fusion-framework@4.4.2) (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.4.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.4.0...@equinor/fusion-framework@4.4.1) (2022-11-17)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.4.0 (2022-11-17)

### Features

- update typing of useModule hook ([958dd04](https://github.com/equinor/fusion-framework/commit/958dd0401667e9ebb1a51bced128ae43369cd6c4))

## [4.3.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.3.7...@equinor/fusion-framework@4.3.8) (2022-11-16)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.3.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.3.6...@equinor/fusion-framework@4.3.7) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.3.6 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.3.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.3.4...@equinor/fusion-framework@4.3.5) (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.3.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.3.3...@equinor/fusion-framework@4.3.4) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.3.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.3.2...@equinor/fusion-framework@4.3.3) (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.3.2 (2022-11-11)

### Bug Fixes

- **module-auth:** make http module await auth ([18a0ed9](https://github.com/equinor/fusion-framework/commit/18a0ed947e128bf1cdc86aa45d31e73c1f8c4bbb))

## 4.3.1 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.3.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.2.2...@equinor/fusion-framework@4.3.0) (2022-11-03)

### Features

- **cli:** initial commit ([#380](https://github.com/equinor/fusion-framework/issues/380)) ([775b74f](https://github.com/equinor/fusion-framework/commit/775b74f5cc8507cf5449a9f91e018d80a4ab50a1))

## [4.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.2.1...@equinor/fusion-framework@4.2.2) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.2.0...@equinor/fusion-framework@4.2.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.2.0 (2022-11-02)

### Features

- **framework:** enable context for framework ([647a1c5](https://github.com/equinor/fusion-framework/commit/647a1c5b52ed4c721e1379e7c2395ca7ff752a40))

## [4.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.1.0...@equinor/fusion-framework@4.1.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.17...@equinor/fusion-framework@4.1.0) (2022-11-01)

### Features

- **framework:** implement module-app ([dc917f0](https://github.com/equinor/fusion-framework/commit/dc917f019da852fbd93eaf6ed7bc4a3a7e6f0d68))

## 4.0.17 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.16 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.14...@equinor/fusion-framework@4.0.15) (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.14 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.12...@equinor/fusion-framework@4.0.13) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.12 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.9...@equinor/fusion-framework@4.0.10) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.8...@equinor/fusion-framework@4.0.9) (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.8 (2022-09-26)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.5...@equinor/fusion-framework@4.0.6) (2022-09-16)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.4...@equinor/fusion-framework@4.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.3...@equinor/fusion-framework@4.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.2...@equinor/fusion-framework@4.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.1...@equinor/fusion-framework@4.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.1-next.1...@equinor/fusion-framework@4.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.1-next.0...@equinor/fusion-framework@4.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework

## [4.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@4.0.0...@equinor/fusion-framework@4.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework

## 4.0.0 (2022-09-12)

### ⚠ BREAKING CHANGES

- **framework:** initialize now takes object

### Features

- **framework:** rewrite configurator ([eda8fbf](https://github.com/equinor/fusion-framework/commit/eda8fbf2cb83e839a798063e15dc185801e6c17b))

### Bug Fixes

- **framework:** add default modules ([190271b](https://github.com/equinor/fusion-framework/commit/190271b0ed4a4c3c876cbed0de3ec48cd8004fdc))

## [4.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@3.0.2...@equinor/fusion-framework@4.0.0-alpha.0) (2022-09-12)

### ⚠ BREAKING CHANGES

- **framework:** initialize now takes object

### Features

- **framework:** rewrite configurator ([eda8fbf](https://github.com/equinor/fusion-framework/commit/eda8fbf2cb83e839a798063e15dc185801e6c17b))

### Bug Fixes

- **framework:** add default modules ([190271b](https://github.com/equinor/fusion-framework/commit/190271b0ed4a4c3c876cbed0de3ec48cd8004fdc))

## 3.0.2 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework

## 3.0.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@2.1.1...@equinor/fusion-framework@3.0.0) (2022-08-29)

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

## 2.1.1 (2022-08-23)

**Note:** Version bump only for package @equinor/fusion-framework

# [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@2.0.2...@equinor/fusion-framework@2.1.0) (2022-08-19)

### Features

- **framework:** enable event module ([e4734d2](https://github.com/equinor/fusion-framework/commit/e4734d2ab747b327eb074ca330aeac2188860c69))

## 2.0.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@2.0.0...@equinor/fusion-framework@2.0.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework

# [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.12...@equinor/fusion-framework@2.0.0) (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

## 1.2.12 (2022-08-08)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.10...@equinor/fusion-framework@1.2.11) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.9...@equinor/fusion-framework@1.2.10) (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework

## 1.2.9 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.7...@equinor/fusion-framework@1.2.8) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.6...@equinor/fusion-framework@1.2.7) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.5...@equinor/fusion-framework@1.2.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.4...@equinor/fusion-framework@1.2.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.3...@equinor/fusion-framework@1.2.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.2...@equinor/fusion-framework@1.2.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.1...@equinor/fusion-framework@1.2.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.2.0...@equinor/fusion-framework@1.2.1) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework

# 1.2.0 (2022-06-24)

### Features

- **framework:** allow addtional modules ([d8d697b](https://github.com/equinor/fusion-framework/commit/d8d697b6fa8ea5c8130b324195d39f354d2fa768))

## [1.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.16...@equinor/fusion-framework@1.1.17) (2022-06-14)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.16](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.15...@equinor/fusion-framework@1.1.16) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.14...@equinor/fusion-framework@1.1.15) (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework

## 1.1.14 (2022-06-13)

**Note:** Version bump only for package @equinor/fusion-framework

## 1.1.13 (2022-06-10)

**Note:** Version bump only for package @equinor/fusion-framework

## 1.1.12 (2022-05-31)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.10...@equinor/fusion-framework@1.1.11) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.9...@equinor/fusion-framework@1.1.10) (2022-03-25)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.8...@equinor/fusion-framework@1.1.9) (2022-03-14)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.7...@equinor/fusion-framework@1.1.8) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.6...@equinor/fusion-framework@1.1.7) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.5...@equinor/fusion-framework@1.1.6) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.4...@equinor/fusion-framework@1.1.5) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.3...@equinor/fusion-framework@1.1.4) (2022-02-23)

**Note:** Version bump only for package @equinor/fusion-framework

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.2...@equinor/fusion-framework@1.1.3) (2022-02-23)

### Bug Fixes

- **module-msal:** auth client id check ([#27](https://github.com/equinor/fusion-framework/issues/27)) ([907460e](https://github.com/equinor/fusion-framework/commit/907460e3e63e777f6766dcc044cad7078d7ab747))

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework@1.1.1...@equinor/fusion-framework@1.1.2) (2022-02-15)

**Note:** Version bump only for package @equinor/fusion-framework

## 1.1.1 (2022-02-09)

**Note:** Version bump only for package @equinor/fusion-framework

# 1.1.0 (2022-02-07)

### Bug Fixes

- add missing files ([750c2fd](https://github.com/equinor/fusion-framework/commit/750c2fdb0a5e0a2df2e12d900c41e305adcfc01e))
- expose auth creation ([d7f2ede](https://github.com/equinor/fusion-framework/commit/d7f2ede16573baf846ba73ca48ba273695eaa482))
- **framework:** add method for access token ([a3de5e2](https://github.com/equinor/fusion-framework/commit/a3de5e2ffb990ada0cd3ff3e47bd83b44cc044f2))
- removed exposed msal creator ([69821b9](https://github.com/equinor/fusion-framework/commit/69821b9279d7b285320b880494fcd3122c3c8041))

### Features

- add framework client ([56823b6](https://github.com/equinor/fusion-framework/commit/56823b6d1a17b139eda00ea1fc955dc412ec2603))
- add react renderer ([1427429](https://github.com/equinor/fusion-framework/commit/14274294f59863390959db56afe32ce00d6772dc))
- add service discovery to portal ([df661fd](https://github.com/equinor/fusion-framework/commit/df661fd9a7ded833b87f3e7b71343e840b581130))
- **framework:** add http client configurator ([65fbfce](https://github.com/equinor/fusion-framework/commit/65fbfce6427cf05f8ecdb6fb54236822e54adea4))
- **framework:** add response handler ([c5e4839](https://github.com/equinor/fusion-framework/commit/c5e48391e03a50bee6aade242d9c602cd35fb1c1))
- **react:** add http client hooks ([7d01f63](https://github.com/equinor/fusion-framework/commit/7d01f63bf98ad6ab25043e92836d3e2c820dc43e))
- rewrite framework to use modules ([3eaf699](https://github.com/equinor/fusion-framework/commit/3eaf6995f1d82f3542d3c32e3bfac516c1682560))

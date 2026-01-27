# Change Log

## 1.1.47-msal-v5.1

### Patch Changes

- [#3944](https://github.com/equinor/fusion-framework/pull/3944) [`312755f`](https://github.com/equinor/fusion-framework/commit/312755f01c7592329aec847ee4956fe9bf58458f) Thanks [@dependabot](https://github.com/apps/dependabot)! - pre-release msal v5

- Updated dependencies [[`312755f`](https://github.com/equinor/fusion-framework/commit/312755f01c7592329aec847ee4956fe9bf58458f)]:
  - @equinor/fusion-framework-module-msal@7.0.0-msal-v5.1
  - @equinor/fusion-framework@7.4.3-msal-v5.1
  - @equinor/fusion-framework-module-event@4.4.1-msal-v5.0
  - @equinor/fusion-framework-module-http@7.0.7-msal-v5.1
  - @equinor/fusion-framework-module@5.0.6-msal-v5.0
  - @equinor/fusion-framework-module-widget@12.0.4-msal-v5.1

## 1.1.47-msal-v5.0

### Patch Changes

- Updated dependencies [[`f373ec5`](https://github.com/equinor/fusion-framework/commit/f373ec5573d70a1b23e2b6261c831d3b23a8cf98)]:
  - @equinor/fusion-framework-module-msal@7.0.0-msal-v5.0
  - @equinor/fusion-framework@7.4.3-msal-v5.0
  - @equinor/fusion-framework-module-http@7.0.7-msal-v5.0
  - @equinor/fusion-framework-module-widget@12.0.4-msal-v5.0

## 1.1.46

### Patch Changes

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-http@7.0.5
  - @equinor/fusion-framework@7.4.2
  - @equinor/fusion-framework-module-msal@6.0.0

## 1.1.45

### Patch Changes

- [#3490](https://github.com/equinor/fusion-framework/pull/3490) [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1) Thanks [@odinr](https://github.com/odinr)! - Remove explicit logger initialization from configurator constructors in favor of telemetry.

  - Removed `this.logger = new ModuleConsoleLogger(...)` from FrameworkConfigurator, AppConfigurator, and WidgetConfigurator constructors
  - Logger functionality will be handled through telemetry module with console logging adapter

  This prepares the configurators to use telemetry for logging instead of direct console logger initialization.

- Updated dependencies [[`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1), [`a66d70a`](https://github.com/equinor/fusion-framework/commit/a66d70a9fa40ab14f2534be4f22b6d1f602097a0), [`7ba4713`](https://github.com/equinor/fusion-framework/commit/7ba47139a8d7cfbb757bd4626425c611e22c2126), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-framework@7.4.0
  - @equinor/fusion-framework-module-http@7.0.2
  - @equinor/fusion-framework-module@5.0.3
  - @equinor/fusion-framework-module-widget@12.0.1

## 1.1.44

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-http@7.0.0
  - @equinor/fusion-framework-module-msal@5.0.0
  - @equinor/fusion-framework@7.3.19
  - @equinor/fusion-framework-module-widget@12.0.0

## 1.1.43

### Patch Changes

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module-http@6.3.4
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-framework-module-msal@4.0.8
  - @equinor/fusion-framework@7.3.17
  - @equinor/fusion-framework-module-event@4.3.7
  - @equinor/fusion-framework-module-widget@11.0.0

## 1.1.42

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.16

## 1.1.41

### Patch Changes

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-widget@10.0.5
  - @equinor/fusion-framework-module-http@6.3.3
  - @equinor/fusion-framework-module-msal@4.0.7
  - @equinor/fusion-framework@7.3.15

## 1.1.40

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@10.0.4
  - @equinor/fusion-framework@7.3.14

## 1.1.39

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@10.0.3
  - @equinor/fusion-framework@7.3.13

## 1.1.38

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.12

## 1.1.37

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-framework-module-event@4.3.6
  - @equinor/fusion-framework-module-widget@10.0.2
  - @equinor/fusion-framework@7.3.11
  - @equinor/fusion-framework-module-http@6.3.2
  - @equinor/fusion-framework-module-msal@4.0.6

## 1.1.36

### Patch Changes

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-framework-module-widget@10.0.1
  - @equinor/fusion-framework-module-event@4.3.5
  - @equinor/fusion-framework-module-http@6.3.1
  - @equinor/fusion-framework-module-msal@4.0.5
  - @equinor/fusion-framework@7.3.10

## 1.1.35

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42), [`7a0a510`](https://github.com/equinor/fusion-framework/commit/7a0a510e0af1f0769c596e1b9aaa391250efd95d)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-module-http@6.3.0
  - @equinor/fusion-framework@7.3.9
  - @equinor/fusion-framework-module-event@4.3.4
  - @equinor/fusion-framework-module-msal@4.0.4
  - @equinor/fusion-framework-module-widget@10.0.0

## 1.1.34

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-widget@9.0.8
  - @equinor/fusion-framework-module-event@4.3.3
  - @equinor/fusion-framework-module-http@6.2.5
  - @equinor/fusion-framework-module-msal@4.0.3
  - @equinor/fusion-framework@7.3.8

## 1.1.33

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.7

## 1.1.32

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.6
  - @equinor/fusion-framework-module-widget@9.0.7

## 1.1.31

### Patch Changes

- Updated dependencies [[`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8)]:
  - @equinor/fusion-framework-module-http@6.2.4
  - @equinor/fusion-framework@7.3.5
  - @equinor/fusion-framework-module-widget@9.0.6

## 1.1.30

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.4

## 1.1.29

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139), [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6)]:
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-widget@9.0.5
  - @equinor/fusion-framework-module-event@4.3.2
  - @equinor/fusion-framework-module-http@6.2.3
  - @equinor/fusion-framework-module-msal@4.0.2
  - @equinor/fusion-framework@7.3.3

## 1.1.28

### Patch Changes

- Updated dependencies [[`11e18fd`](https://github.com/equinor/fusion-framework/commit/11e18fd755e65d1bbbb9b98638fdb9a98c2c23ab)]:
  - @equinor/fusion-framework-module-widget@9.0.4
  - @equinor/fusion-framework@7.3.2

## 1.1.27

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`6efabb7`](https://github.com/equinor/fusion-framework/commit/6efabb7837a97319e976e122db855d8b88b031a6), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-http@6.2.2
  - @equinor/fusion-framework-module-msal@4.0.1
  - @equinor/fusion-framework-module-widget@9.0.3
  - @equinor/fusion-framework-module-event@4.3.1
  - @equinor/fusion-framework@7.3.1

## 1.1.26

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa), [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
  - @equinor/fusion-framework-module-msal@4.0.0
  - @equinor/fusion-framework@7.3.0
  - @equinor/fusion-framework-module-http@6.2.1
  - @equinor/fusion-framework-module-widget@9.0.2

## 1.1.25

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@9.0.1
  - @equinor/fusion-framework@7.2.16

## 1.1.24

### Patch Changes

- Updated dependencies [[`a551b01`](https://github.com/equinor/fusion-framework/commit/a551b01d552b9b9770d1f5132803f92cc91d4bc6)]:
  - @equinor/fusion-framework-module-event@4.3.0
  - @equinor/fusion-framework@7.2.15
  - @equinor/fusion-framework-module-widget@9.0.0

## 1.1.23

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.2.14

## 1.1.22

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@8.0.3
  - @equinor/fusion-framework@7.2.13

## 1.1.21

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.2.12

## 1.1.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@8.0.2
  - @equinor/fusion-framework@7.2.11

## 1.1.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.2.10

## 1.1.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@8.0.1
  - @equinor/fusion-framework@7.2.9

## 1.1.17

### Patch Changes

- Updated dependencies [[`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51)]:
  - @equinor/fusion-framework-module-http@6.2.0
  - @equinor/fusion-framework@7.2.8
  - @equinor/fusion-framework-module-widget@8.0.0

## 1.1.16

### Patch Changes

- [#2459](https://github.com/equinor/fusion-framework/pull/2459) [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa) Thanks [@odinr](https://github.com/odinr)! - Update defaultScopes in WidgetConfigurator

- Updated dependencies [[`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31), [`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module-http@6.1.0
  - @equinor/fusion-framework-module@4.3.5
  - @equinor/fusion-framework@7.2.7
  - @equinor/fusion-framework-module-widget@7.0.0
  - @equinor/fusion-framework-module-event@4.2.4
  - @equinor/fusion-framework-module-msal@3.1.5

## 1.1.15

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@6.0.4
  - @equinor/fusion-framework@7.2.6

## 1.1.14

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-framework@7.2.5
  - @equinor/fusion-framework-module-event@4.2.3
  - @equinor/fusion-framework-module-http@6.0.3
  - @equinor/fusion-framework-module-msal@3.1.4
  - @equinor/fusion-framework-module-widget@6.0.3

## 1.1.13

### Patch Changes

- Updated dependencies [[`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-framework-module-http@6.0.2
  - @equinor/fusion-framework-module@4.3.3
  - @equinor/fusion-framework-module-widget@6.0.2
  - @equinor/fusion-framework@7.2.4
  - @equinor/fusion-framework-module-event@4.2.2
  - @equinor/fusion-framework-module-msal@3.1.3

## 1.1.12

### Patch Changes

- Updated dependencies [[`736ef31`](https://github.com/equinor/fusion-framework/commit/736ef310ee101738f9022d581a2b3189b30a2646)]:
  - @equinor/fusion-framework-module-event@4.2.1
  - @equinor/fusion-framework@7.2.3
  - @equinor/fusion-framework-module-widget@6.0.1

## 1.1.11

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
  - @equinor/fusion-framework-module-widget@6.0.0
  - @equinor/fusion-framework-module-event@4.2.0
  - @equinor/fusion-framework-module-msal@3.1.2
  - @equinor/fusion-framework@7.2.2

## 1.1.10

### Patch Changes

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb), [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526)]:
  - @equinor/fusion-framework-module-widget@5.0.1
  - @equinor/fusion-framework@7.2.1

## 1.1.9

### Patch Changes

- Updated dependencies [[`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
  - @equinor/fusion-framework-module-http@6.0.0
  - @equinor/fusion-framework@7.2.0
  - @equinor/fusion-framework-module-widget@5.0.0

## 1.1.8

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`9a91bb7`](https://github.com/equinor/fusion-framework/commit/9a91bb737d3452e697c047c0f5c7caa2adfd535d), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-framework-module-event@4.1.2
  - @equinor/fusion-framework@7.1.8
  - @equinor/fusion-framework-module-http@5.2.3
  - @equinor/fusion-framework-module-msal@3.1.1
  - @equinor/fusion-framework-module-widget@4.0.8

## 1.1.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@4.0.7
  - @equinor/fusion-framework@7.1.7

## 1.1.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@4.0.6
  - @equinor/fusion-framework@7.1.6

## 1.1.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@4.0.5
  - @equinor/fusion-framework@7.1.5

## 1.1.4

### Patch Changes

- Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
  - @equinor/fusion-framework-module-http@5.2.2
  - @equinor/fusion-framework@7.1.4
  - @equinor/fusion-framework-module-widget@4.0.4

## 1.1.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@4.0.3
  - @equinor/fusion-framework@7.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
  - @equinor/fusion-framework-module-http@5.2.1
  - @equinor/fusion-framework@7.1.2
  - @equinor/fusion-framework-module-widget@4.0.2

## 1.1.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-module-event@4.1.1
  - @equinor/fusion-framework@7.1.1
  - @equinor/fusion-framework-module-widget@4.0.1

## 1.1.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-widget@4.0.0
  - @equinor/fusion-framework-module-event@4.1.0
  - @equinor/fusion-framework-module-http@5.2.0
  - @equinor/fusion-framework-module-msal@3.1.0
  - @equinor/fusion-framework@7.1.0

## 1.0.32

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.0.33

## 1.0.31

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.0.32

## 1.0.30

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.0.31

## 1.0.29

### Patch Changes

- [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Widget has had a complete makeover all from the loading Component to the Module itself.
  - adding events to widget module some include `onWidgetInitialized` , `onWidgetInitializeFailure` and `onWidgetScriptLoaded` and more.
  - Enabling for multiple widget loading.
  - Complex overhaul on the widget configuration utilizing th new BaseConfigBuilder class.
  - Now able to configure baseImport url and widgetClient
  - New widget component for loading of widgets
  - Updated documentation
- Updated dependencies [[`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86)]:
  - @equinor/fusion-framework-module-widget@3.0.0

## 1.0.28

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework@7.0.30
  - @equinor/fusion-framework-module-event@4.0.8
  - @equinor/fusion-framework-module-http@5.1.6
  - @equinor/fusion-framework-module-msal@3.0.10
  - @equinor/fusion-framework-module-widget@2.0.10

## 1.0.27

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@2.0.9
  - @equinor/fusion-framework@7.0.29

## 1.0.26

### Patch Changes

- Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
  - @equinor/fusion-framework-module-msal@3.0.9
  - @equinor/fusion-framework@7.0.28
  - @equinor/fusion-framework-module-http@5.1.5
  - @equinor/fusion-framework-module-widget@2.0.8

## 1.0.25

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4
  - @equinor/fusion-framework@7.0.27
  - @equinor/fusion-framework-module-widget@2.0.7

## 1.0.24

### Patch Changes

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3
  - @equinor/fusion-framework@7.0.26
  - @equinor/fusion-framework-module-widget@2.0.6

## 1.0.23

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@2.0.5
  - @equinor/fusion-framework@7.0.25

## 1.0.22

### Patch Changes

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-widget@2.0.4
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-framework-module-msal@3.0.8
  - @equinor/fusion-framework@7.0.24
  - @equinor/fusion-framework-module-event@4.0.7

## 1.0.21

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@2.0.3
  - @equinor/fusion-framework@7.0.23

## 1.0.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.0.22
  - @equinor/fusion-framework-module-widget@2.0.2

## 1.0.19

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework@7.0.21
  - @equinor/fusion-framework-module-event@4.0.6
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-framework-module-msal@3.0.7
  - @equinor/fusion-framework-module-widget@2.0.1

## 1.0.18

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa)]:
  - @equinor/fusion-framework-module-http@5.1.0
  - @equinor/fusion-framework@7.0.20
  - @equinor/fusion-framework-module-widget@2.0.0

## 1.0.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.0.19
  - @equinor/fusion-framework-module-widget@1.0.9

## 1.0.16

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-framework@7.0.18
  - @equinor/fusion-framework-module-event@4.0.5
  - @equinor/fusion-framework-module-http@5.0.6
  - @equinor/fusion-framework-module-msal@3.0.6
  - @equinor/fusion-framework-module-widget@1.0.8

## 1.0.15

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-widget@1.0.7
  - @equinor/fusion-framework@7.0.17

## 1.0.14

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-widget@1.0.6
  - @equinor/fusion-framework-module-event@4.0.4
  - @equinor/fusion-framework-module-http@5.0.5
  - @equinor/fusion-framework-module-msal@3.0.5
  - @equinor/fusion-framework@7.0.16

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.12...@equinor/fusion-framework-widget@1.0.13) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 1.0.12 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.10...@equinor/fusion-framework-widget@1.0.11) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.9...@equinor/fusion-framework-widget@1.0.10) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.8...@equinor/fusion-framework-widget@1.0.9) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 1.0.8 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.6...@equinor/fusion-framework-widget@1.0.7) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.5...@equinor/fusion-framework-widget@1.0.6) (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 1.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 1.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.2...@equinor/fusion-framework-widget@1.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.1...@equinor/fusion-framework-widget@1.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@1.0.0...@equinor/fusion-framework-widget@1.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 1.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.16 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.15 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.14 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.13 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.11...@equinor/fusion-framework-widget@0.1.12) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.11 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.10 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.8...@equinor/fusion-framework-widget@0.1.9) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.8 (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.6...@equinor/fusion-framework-widget@0.1.7) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.5...@equinor/fusion-framework-widget@0.1.6) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.4...@equinor/fusion-framework-widget@0.1.5) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.3...@equinor/fusion-framework-widget@0.1.4) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.3 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.2 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-widget@0.1.0...@equinor/fusion-framework-widget@0.1.1) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-widget

## 0.1.0 (2023-01-27)

### Features

- **widget:** add configurator for widget modules ([ccc150b](https://github.com/equinor/fusion-framework/commit/ccc150bc9098e047023b788f43ed2338482b6ef1))

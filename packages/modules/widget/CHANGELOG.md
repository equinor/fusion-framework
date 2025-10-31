# Change Log

## 12.0.3-next.0

### Patch Changes

- Updated dependencies [[`dd26dd3`](https://github.com/equinor/fusion-framework/commit/dd26dd3e652eb07a77bcdc878f8493c6db4fed48)]:
  - @equinor/fusion-framework-module-http@7.0.5-next.0
  - @equinor/fusion-framework-module-service-discovery@9.0.5-next.0

## 12.0.2

### Patch Changes

- [#3654](https://github.com/equinor/fusion-framework/pull/3654) [`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update immer from 10.1.3 to 10.2.0 for performance improvements, including optimized caching and iteration logic.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e), [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59), [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74)]:
  - @equinor/fusion-observable@8.5.6
  - @equinor/fusion-query@6.0.1
  - @equinor/fusion-framework-module@5.0.5
  - @equinor/fusion-framework-module-http@7.0.4
  - @equinor/fusion-framework-module-service-discovery@9.0.4

## 12.0.1

### Patch Changes

- Updated dependencies [[`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275), [`a66d70a`](https://github.com/equinor/fusion-framework/commit/a66d70a9fa40ab14f2534be4f22b6d1f602097a0), [`d3bcafe`](https://github.com/equinor/fusion-framework/commit/d3bcafed8b8c5a02ebe68693588cb376ed5e1b0e), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1)]:
  - @equinor/fusion-observable@8.5.5
  - @equinor/fusion-framework-module-http@7.0.2
  - @equinor/fusion-query@6.0.0
  - @equinor/fusion-framework-module@5.0.3
  - @equinor/fusion-framework-module-service-discovery@9.0.2

## 12.0.0

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-http@7.0.0
  - @equinor/fusion-framework-module-service-discovery@9.0.0

## 11.0.1

### Patch Changes

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

- Updated dependencies [[`29f6710`](https://github.com/equinor/fusion-framework/commit/29f6710238baf9b29f42394b30cb8b97f25462c3), [`7bb88c6`](https://github.com/equinor/fusion-framework/commit/7bb88c6247f3d93eccf363d610116c519f1ecff4), [`11143fa`](https://github.com/equinor/fusion-framework/commit/11143fa3002fb8a6c095052a04c7e596c56bafa8)]:
  - @equinor/fusion-query@5.2.13
  - @equinor/fusion-observable@8.5.3

## 11.0.0

### Patch Changes

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-module-http@6.3.4
  - @equinor/fusion-framework-module@5.0.0
  - @equinor/fusion-framework-module-service-discovery@8.0.18
  - @equinor/fusion-framework-module-event@4.3.7

## 10.0.5

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-http@6.3.3
  - @equinor/fusion-query@5.2.11
  - @equinor/fusion-framework-module-service-discovery@8.0.17

## 10.0.4

### Patch Changes

- Updated dependencies [[`0d22e3c`](https://github.com/equinor/fusion-framework/commit/0d22e3c486ab11c40f14fb1f11f0b718e7bf1593)]:
  - @equinor/fusion-observable@8.5.1
  - @equinor/fusion-query@5.2.10
  - @equinor/fusion-framework-module-service-discovery@8.0.16

## 10.0.3

### Patch Changes

- Updated dependencies [[`d247ec7`](https://github.com/equinor/fusion-framework/commit/d247ec7482a4d5231657875f6c6733ce37df07c9), [`89f80e4`](https://github.com/equinor/fusion-framework/commit/89f80e41dac04e71518c7314cada86ecc835708d)]:
  - @equinor/fusion-observable@8.5.0
  - @equinor/fusion-query@5.2.9
  - @equinor/fusion-framework-module-service-discovery@8.0.15

## 10.0.2

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-observable@8.4.9
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-framework-module-event@4.3.6
  - @equinor/fusion-query@5.2.8
  - @equinor/fusion-framework-module-http@6.3.2
  - @equinor/fusion-framework-module-service-discovery@8.0.14

## 10.0.1

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-observable@8.4.8
  - @equinor/fusion-framework-module-event@4.3.5
  - @equinor/fusion-framework-module-http@6.3.1
  - @equinor/fusion-query@5.2.7
  - @equinor/fusion-framework-module-service-discovery@8.0.13

## 10.0.0

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42), [`7a0a510`](https://github.com/equinor/fusion-framework/commit/7a0a510e0af1f0769c596e1b9aaa391250efd95d)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-framework-module-http@6.3.0
  - @equinor/fusion-framework-module-event@4.3.4
  - @equinor/fusion-framework-module-service-discovery@8.0.12
  - @equinor/fusion-query@5.2.6

## 9.0.8

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-observable@8.4.7
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-framework-module-event@4.3.3
  - @equinor/fusion-framework-module-http@6.2.5
  - @equinor/fusion-query@5.2.5
  - @equinor/fusion-framework-module-service-discovery@8.0.11

## 9.0.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.4
  - @equinor/fusion-framework-module-service-discovery@8.0.10

## 9.0.6

### Patch Changes

- Updated dependencies [[`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8)]:
  - @equinor/fusion-framework-module-http@6.2.4
  - @equinor/fusion-framework-module-service-discovery@8.0.9

## 9.0.5

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2901](https://github.com/equinor/fusion-framework/pull/2901) [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to Biome `useOptionalChain`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139), [`d20db24`](https://github.com/equinor/fusion-framework/commit/d20db24c73690e90a5860fe5160909c77efa41cb), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424)]:
  - @equinor/fusion-framework-module-service-discovery@8.0.8
  - @equinor/fusion-observable@8.4.6
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-framework-module-event@4.3.2
  - @equinor/fusion-framework-module-http@6.2.3
  - @equinor/fusion-query@5.2.3

## 9.0.4

### Patch Changes

- [#2863](https://github.com/equinor/fusion-framework/pull/2863) [`11e18fd`](https://github.com/equinor/fusion-framework/commit/11e18fd755e65d1bbbb9b98638fdb9a98c2c23ab) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added check to `Widget.getConfig` to ensure that `undefined` config should not be emitted,
  since the return type is `Observable<WidgetConfig>`,
  so should not be breaking changed.
  All though this might has been emitting undefined before, this might break some code that relies on this behavior.

## 9.0.3

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`2fe6241`](https://github.com/equinor/fusion-framework/commit/2fe624186640c3b30079c7d76f0e3af65f64f5d2), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-framework-module-http@6.2.2
  - @equinor/fusion-observable@8.4.5
  - @equinor/fusion-query@5.2.2
  - @equinor/fusion-framework-module-service-discovery@8.0.7
  - @equinor/fusion-framework-module-event@4.3.1

## 9.0.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@6.2.1
  - @equinor/fusion-framework-module-service-discovery@8.0.6

## 9.0.1

### Patch Changes

- Updated dependencies [[`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1)]:
  - @equinor/fusion-observable@8.4.4
  - @equinor/fusion-query@5.2.1
  - @equinor/fusion-framework-module-service-discovery@8.0.5

## 9.0.0

### Patch Changes

- Updated dependencies [[`a551b01`](https://github.com/equinor/fusion-framework/commit/a551b01d552b9b9770d1f5132803f92cc91d4bc6)]:
  - @equinor/fusion-framework-module-event@4.3.0

## 8.0.3

### Patch Changes

- Updated dependencies [[`a965fbe`](https://github.com/equinor/fusion-framework/commit/a965fbeb9544b74f7d7b4aaa1e57c50d2ae4a564)]:
  - @equinor/fusion-query@5.2.0
  - @equinor/fusion-framework-module-service-discovery@8.0.4

## 8.0.2

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-observable@8.4.3
  - @equinor/fusion-query@5.1.5
  - @equinor/fusion-framework-module-service-discovery@8.0.3

## 8.0.1

### Patch Changes

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-observable@8.4.2
  - @equinor/fusion-query@5.1.4
  - @equinor/fusion-framework-module-service-discovery@8.0.2

## 8.0.0

### Patch Changes

- Updated dependencies [[`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51)]:
  - @equinor/fusion-framework-module-http@6.2.0
  - @equinor/fusion-framework-module-service-discovery@8.0.1

## 7.0.0

### Patch Changes

- Updated dependencies [[`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31), [`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d), [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa)]:
  - @equinor/fusion-framework-module-http@6.1.0
  - @equinor/fusion-framework-module@4.3.5
  - @equinor/fusion-framework-module-service-discovery@8.0.0
  - @equinor/fusion-framework-module-event@4.2.4

## 6.0.4

### Patch Changes

- Updated dependencies [[`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
  - @equinor/fusion-observable@8.4.1
  - @equinor/fusion-query@5.1.3
  - @equinor/fusion-framework-module-service-discovery@7.1.13

## 6.0.3

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-query@5.1.2
  - @equinor/fusion-framework-module-event@4.2.3
  - @equinor/fusion-framework-module-http@6.0.3
  - @equinor/fusion-framework-module-service-discovery@7.1.12

## 6.0.2

### Patch Changes

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-observable@8.4.0
  - @equinor/fusion-framework-module-http@6.0.2
  - @equinor/fusion-query@5.1.1
  - @equinor/fusion-framework-module@4.3.3
  - @equinor/fusion-framework-module-service-discovery@7.1.11
  - @equinor/fusion-framework-module-event@4.2.2

## 6.0.1

### Patch Changes

- Updated dependencies [[`736ef31`](https://github.com/equinor/fusion-framework/commit/736ef310ee101738f9022d581a2b3189b30a2646)]:
  - @equinor/fusion-framework-module-event@4.2.1

## 6.0.0

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`b628e90`](https://github.com/equinor/fusion-framework/commit/b628e90500b62e0185c09eb665ce31025bc9b541), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
  - @equinor/fusion-framework-module@4.3.2
  - @equinor/fusion-query@5.1.0
  - @equinor/fusion-framework-module-http@6.0.1
  - @equinor/fusion-framework-module-service-discovery@7.1.10
  - @equinor/fusion-observable@8.3.3
  - @equinor/fusion-framework-module-event@4.2.0

## 5.0.1

### Patch Changes

- [#2235](https://github.com/equinor/fusion-framework/pull/2235) [`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb) Thanks [@odinr](https://github.com/odinr)! - - **Refactored**: The `actionBaseType` function has been renamed to `getBaseType` and its implementation has been updated.

  - **Added**: New utility types and functions for handling action types and payloads in a more type-safe manner.

- [#2248](https://github.com/equinor/fusion-framework/pull/2248) [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - #2235 renamed a method and changed type. This PR forgot to change to the correct param when using this method. Fixes typo - update to use actions `type` in the reducer.

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb)]:
  - @equinor/fusion-observable@8.3.2
  - @equinor/fusion-query@5.0.5
  - @equinor/fusion-framework-module-service-discovery@7.1.9

## 5.0.0

### Patch Changes

- Updated dependencies [[`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
  - @equinor/fusion-framework-module-http@6.0.0
  - @equinor/fusion-query@5.0.4
  - @equinor/fusion-observable@8.3.1
  - @equinor/fusion-framework-module-service-discovery@7.1.8

## 4.0.8

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`9a91bb7`](https://github.com/equinor/fusion-framework/commit/9a91bb737d3452e697c047c0f5c7caa2adfd535d), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-framework-module-event@4.1.2
  - @equinor/fusion-query@5.0.3
  - @equinor/fusion-framework-module-http@5.2.3
  - @equinor/fusion-framework-module-service-discovery@7.1.7

## 4.0.7

### Patch Changes

- Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
  - @equinor/fusion-query@5.0.2
  - @equinor/fusion-framework-module-service-discovery@7.1.6

## 4.0.6

### Patch Changes

- Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
  - @equinor/fusion-query@5.0.1
  - @equinor/fusion-framework-module-service-discovery@7.1.5

## 4.0.5

### Patch Changes

- Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
  - @equinor/fusion-query@5.0.0
  - @equinor/fusion-framework-module-service-discovery@7.1.4

## 4.0.4

### Patch Changes

- Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
  - @equinor/fusion-framework-module-http@5.2.2
  - @equinor/fusion-framework-module-service-discovery@7.1.3

## 4.0.3

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a), [`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
  - @equinor/fusion-observable@8.3.0
  - @equinor/fusion-query@4.2.0
  - @equinor/fusion-framework-module-service-discovery@7.1.2

## 4.0.2

### Patch Changes

- Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
  - @equinor/fusion-framework-module-http@5.2.1
  - @equinor/fusion-framework-module-service-discovery@7.1.1

## 4.0.1

### Patch Changes

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-module-event@4.1.1

## 4.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-framework-module-service-discovery@7.1.0
  - @equinor/fusion-observable@8.2.0
  - @equinor/fusion-framework-module-event@4.1.0
  - @equinor/fusion-framework-module-http@5.2.0
  - @equinor/fusion-query@4.1.0

## 3.0.0

### Major Changes

- [#1746](https://github.com/equinor/fusion-framework/pull/1746) [`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86) Thanks [@Noggling](https://github.com/Noggling)! - Widget has had a complete makeover all from the loading Component to the Module itself.
  - adding events to widget module some include `onWidgetInitialized` , `onWidgetInitializeFailure` and `onWidgetScriptLoaded` and more.
  - Enabling for multiple widget loading.
  - Complex overhaul on the widget configuration utilizing th new BaseConfigBuilder class.
  - Now able to configure baseImport url and widgetClient
  - New widget component for loading of widgets
  - Updated documentation

## 2.0.10

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7
  - @equinor/fusion-framework-module-event@4.0.8
  - @equinor/fusion-framework-module-http@5.1.6
  - @equinor/fusion-framework-module-service-discovery@7.0.20

## 2.0.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.6
  - @equinor/fusion-framework-module-service-discovery@7.0.19

## 2.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.1.5
  - @equinor/fusion-framework-module-service-discovery@7.0.18

## 2.0.7

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4
  - @equinor/fusion-framework-module-service-discovery@7.0.17

## 2.0.6

### Patch Changes

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3
  - @equinor/fusion-framework-module-service-discovery@7.0.16

## 2.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.5
  - @equinor/fusion-framework-module-service-discovery@7.0.15

## 2.0.4

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.14
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-query@4.0.4
  - @equinor/fusion-framework-module-event@4.0.7

## 2.0.3

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3
  - @equinor/fusion-framework-module-service-discovery@7.0.13

## 2.0.2

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2
  - @equinor/fusion-framework-module-service-discovery@7.0.12

## 2.0.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-event@4.0.6
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-framework-module-service-discovery@7.0.11
  - @equinor/fusion-query@4.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa), [`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-framework-module-http@5.1.0
  - @equinor/fusion-query@4.0.0
  - @equinor/fusion-framework-module-service-discovery@7.0.10

## 1.0.9

### Patch Changes

- Updated dependencies [[`e539e606`](https://github.com/equinor/fusion-framework/commit/e539e606d04bd8b7dc0c0bfed7cd4a7731996936)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.9

## 1.0.8

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-query@3.0.7
  - @equinor/fusion-framework-module-event@4.0.5
  - @equinor/fusion-framework-module-http@5.0.6
  - @equinor/fusion-framework-module-service-discovery@7.0.8

## 1.0.7

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6
  - @equinor/fusion-framework-module-service-discovery@7.0.7

## 1.0.6

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.6
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-framework-module-event@4.0.4
  - @equinor/fusion-framework-module-http@5.0.5
  - @equinor/fusion-query@3.0.5

## 1.0.5

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 1.0.4

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@1.0.2...@equinor/fusion-framework-module-widget@1.0.3) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 1.0.2 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 1.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 1.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.10 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.8...@equinor/fusion-framework-module-widget@0.0.9) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.7...@equinor/fusion-framework-module-widget@0.0.8) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.6...@equinor/fusion-framework-module-widget@0.0.7) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.5...@equinor/fusion-framework-module-widget@0.0.6) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## [0.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-widget@0.0.4...@equinor/fusion-framework-module-widget@0.0.5) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.4 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.3 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

## 0.0.2 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-widget

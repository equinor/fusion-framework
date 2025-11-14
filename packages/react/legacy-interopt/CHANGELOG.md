# Change Log

## 27.0.1-cli-search-index.0

### Patch Changes

- [#3757](https://github.com/equinor/fusion-framework/pull/3757) [`db880d1`](https://github.com/equinor/fusion-framework/commit/db880d1fbdb62ba4667f11229d1e6c3a4cea06fc) Thanks [@odinr](https://github.com/odinr)! - preview release

- Updated dependencies [[`db880d1`](https://github.com/equinor/fusion-framework/commit/db880d1fbdb62ba4667f11229d1e6c3a4cea06fc)]:
  - @equinor/fusion-framework-app@10.1.3-cli-search-index.0
  - @equinor/fusion-framework@7.4.3-cli-search-index.0
  - @equinor/fusion-framework-module-app@7.1.1-cli-search-index.0
  - @equinor/fusion-framework-module-http@7.0.6-cli-search-index.0
  - @equinor/fusion-framework-module-msal@6.0.1-cli-search-index.0
  - @equinor/fusion-framework-module-navigation@6.0.1-cli-search-index.0
  - @equinor/fusion-framework-module-service-discovery@9.0.5-cli-search-index.0
  - @equinor/fusion-framework-react-app@8.0.1-cli-search-index.0
  - @equinor/fusion-observable@8.5.7-cli-search-index.0

## 27.0.0

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Fix MSAL v4 compatibility issues in legacy interopt LegacyAuthContainer.

  - Replace deprecated defaultAccount with account property
  - Update login calls to use MSAL v4 request structure
  - Fix handleRedirect usage to match MSAL v4 API
  - Ensure proper async/await patterns for authentication flows

  These changes ensure legacy interopt works correctly with MSAL v4 while maintaining backward compatibility for legacy applications.

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Update legacy auth container to use new MSAL Node API format.

  Internal implementation change to adapt to MSAL Node interface updates. Legacy interop continues to provide the same interface for consumers.

  Why: Ensures compatibility with updated MSAL Node module API.

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-http@7.0.5
  - @equinor/fusion-framework@7.4.2
  - @equinor/fusion-framework-module-msal@6.0.0
  - @equinor/fusion-framework-react-app@8.0.0
  - @equinor/fusion-framework-app@10.1.2
  - @equinor/fusion-framework-module-app@7.1.0

## 26.0.3

### Patch Changes

- [#3654](https://github.com/equinor/fusion-framework/pull/3654) [`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update immer from 10.1.3 to 10.2.0 for performance improvements, including optimized caching and iteration logic.

- Updated dependencies [[`67bcfa2`](https://github.com/equinor/fusion-framework/commit/67bcfa20f01cb8f209806905874ab594cb43538e), [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59), [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74)]:
  - @equinor/fusion-observable@8.5.6
  - @equinor/fusion-framework-module-app@7.0.3
  - @equinor/fusion-framework-module-msal@5.1.2
  - @equinor/fusion-framework-module-http@7.0.4
  - @equinor/fusion-framework-module-service-discovery@9.0.4

## 26.0.2

### Patch Changes

- [#3515](https://github.com/equinor/fusion-framework/pull/3515) [`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275) Thanks [@odinr](https://github.com/odinr)! - ## Global Biome Configuration Modernization

  **Workspace-wide changes:**

  - Remove 19 rule overrides from `biome.json` to use Biome's strict "error" defaults
  - Enable `correctness/useUniqueElementIds` accessibility rule globally
  - Reduce configuration size by 40% (60+ → ~35 lines)
  - Eliminate all custom linting rule customizations

  **Package-specific changes:**

  - Replace static IDs with React `useId()` hooks in bookmark and dev-portal components
  - Fix `suspicious/noAssignInExpressions` violations in context, legacy-interopt, and observable packages
  - Update 11 React components for accessibility compliance

  **Impact:** All packages now use consistent, strict code quality enforcement with zero custom rule overrides.

  resolves: [#3494](https://github.com/equinor/fusion-framework/issues/3494)
  resolves: [#3495](https://github.com/equinor/fusion-framework/issues/3495)

- Updated dependencies [[`9f5de98`](https://github.com/equinor/fusion-framework/commit/9f5de9844181b8bc2d770032ff3b1709e87c7c21), [`6cb288b`](https://github.com/equinor/fusion-framework/commit/6cb288b9e1ec4fae68ae6899735c176837bb4275), [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1), [`a66d70a`](https://github.com/equinor/fusion-framework/commit/a66d70a9fa40ab14f2534be4f22b6d1f602097a0), [`7ba4713`](https://github.com/equinor/fusion-framework/commit/7ba47139a8d7cfbb757bd4626425c611e22c2126)]:
  - @equinor/fusion-framework-app@10.1.0
  - @equinor/fusion-observable@8.5.5
  - @equinor/fusion-framework@7.4.0
  - @equinor/fusion-framework-module-http@7.0.2
  - @equinor/fusion-framework-module-app@7.0.2
  - @equinor/fusion-framework-module-service-discovery@9.0.2

## 26.0.1

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

- Updated dependencies [[`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6), [`1700ca8`](https://github.com/equinor/fusion-framework/commit/1700ca8851fa108e55e9729fd24f595272766e63)]:
  - @equinor/fusion-observable@8.5.4
  - @equinor/fusion-framework-module-msal@5.0.1
  - @equinor/fusion-framework-module-service-discovery@9.0.1
  - @equinor/fusion-framework-module-http@7.0.1
  - @equinor/fusion-framework-module-app@7.0.1

## 26.0.0

### Patch Changes

- Updated dependencies [[`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295), [`c222c67`](https://github.com/equinor/fusion-framework/commit/c222c673bc7cdefff6eb0cd9436bfa3d1f185295)]:
  - @equinor/fusion-framework-module-app@7.0.0
  - @equinor/fusion-framework-module-http@7.0.0
  - @equinor/fusion-framework-module-msal@5.0.0
  - @equinor/fusion-framework-module-service-discovery@9.0.0
  - @equinor/fusion-framework-app@10.0.0
  - @equinor/fusion-framework-react-app@7.0.0
  - @equinor/fusion-framework@7.3.19

## 25.0.1

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

- Updated dependencies [[`e7de2b7`](https://github.com/equinor/fusion-framework/commit/e7de2b7c1114094da445625a761fc9a3be6bdf87), [`29f6710`](https://github.com/equinor/fusion-framework/commit/29f6710238baf9b29f42394b30cb8b97f25462c3), [`d740b78`](https://github.com/equinor/fusion-framework/commit/d740b7829694efb73edcd32006ec1f26e0075e9a), [`da373ad`](https://github.com/equinor/fusion-framework/commit/da373ade663898b2628e28529b6e3dea3b91ed43), [`7bb88c6`](https://github.com/equinor/fusion-framework/commit/7bb88c6247f3d93eccf363d610116c519f1ecff4), [`11143fa`](https://github.com/equinor/fusion-framework/commit/11143fa3002fb8a6c095052a04c7e596c56bafa8), [`7792659`](https://github.com/equinor/fusion-framework/commit/7792659bf2ade10dba5e54c610d5abff522324b6)]:
  - @equinor/fusion-framework-module-app@6.1.19
  - @equinor/fusion-observable@8.5.3
  - @equinor/fusion-framework-module-msal@4.1.0
  - @equinor/fusion-framework@7.3.18

## 25.0.0

### Patch Changes

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-react-app@6.2.6
  - @equinor/fusion-framework-module-http@6.3.4
  - @equinor/fusion-framework-module-app@6.1.17
  - @equinor/fusion-framework-module-msal@4.0.8
  - @equinor/fusion-framework-module-service-discovery@8.0.18
  - @equinor/fusion-framework-app@9.3.22
  - @equinor/fusion-framework@7.3.17
  - @equinor/fusion-framework-module-navigation@6.0.0

## 24.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.16
  - @equinor/fusion-framework-app@9.3.21
  - @equinor/fusion-framework-react-app@6.2.5

## 24.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.20
  - @equinor/fusion-framework-react-app@6.2.4

## 24.0.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.19
  - @equinor/fusion-framework-react-app@6.2.3

## 24.0.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.3.18
  - @equinor/fusion-framework-react-app@6.2.2

## 24.0.1

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions

  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-navigation@5.0.3
  - @equinor/fusion-framework-module-http@6.3.3
  - @equinor/fusion-framework-module-msal@4.0.7
  - @equinor/fusion-framework-module-app@6.1.16
  - @equinor/fusion-framework-react-app@6.2.1
  - @equinor/fusion-framework-app@9.3.17
  - @equinor/fusion-framework@7.3.15
  - @equinor/fusion-framework-module-service-discovery@8.0.17

## 24.0.0

### Patch Changes

- Updated dependencies [[`bfa2317`](https://github.com/equinor/fusion-framework/commit/bfa2317c1d23bd606fdbc2e9857b0be69b08e720)]:
  - @equinor/fusion-framework-react-app@6.2.0

## 23.0.6

### Patch Changes

- Updated dependencies [[`0d22e3c`](https://github.com/equinor/fusion-framework/commit/0d22e3c486ab11c40f14fb1f11f0b718e7bf1593)]:
  - @equinor/fusion-observable@8.5.1
  - @equinor/fusion-framework-module-app@6.1.15
  - @equinor/fusion-framework-react-app@6.1.7
  - @equinor/fusion-framework-app@9.3.16
  - @equinor/fusion-framework-module-service-discovery@8.0.16
  - @equinor/fusion-framework@7.3.14

## 23.0.5

### Patch Changes

- Updated dependencies [[`d247ec7`](https://github.com/equinor/fusion-framework/commit/d247ec7482a4d5231657875f6c6733ce37df07c9), [`89f80e4`](https://github.com/equinor/fusion-framework/commit/89f80e41dac04e71518c7314cada86ecc835708d)]:
  - @equinor/fusion-observable@8.5.0
  - @equinor/fusion-framework-module-app@6.1.14
  - @equinor/fusion-framework-react-app@6.1.6
  - @equinor/fusion-framework-app@9.3.15
  - @equinor/fusion-framework-module-service-discovery@8.0.15
  - @equinor/fusion-framework@7.3.13

## 23.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.12
  - @equinor/fusion-framework-app@9.3.14
  - @equinor/fusion-framework-react-app@6.1.5

## 23.0.3

### Patch Changes

- Updated dependencies [[`35cbd12`](https://github.com/equinor/fusion-framework/commit/35cbd12b3ca6d42b0b8b6f8a40dd500fcd1e3672)]:
  - @equinor/fusion-framework-react-app@6.1.4

## 23.0.2

### Patch Changes

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module-navigation@5.0.2
  - @equinor/fusion-observable@8.4.9
  - @equinor/fusion-framework-react-app@6.1.3
  - @equinor/fusion-framework-module-app@6.1.13
  - @equinor/fusion-framework@7.3.11
  - @equinor/fusion-framework-app@9.3.13
  - @equinor/fusion-framework-module-http@6.3.2
  - @equinor/fusion-framework-module-msal@4.0.6
  - @equinor/fusion-framework-module-service-discovery@8.0.14

## 23.0.1

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module-navigation@5.0.1
  - @equinor/fusion-observable@8.4.8
  - @equinor/fusion-framework-module-http@6.3.1
  - @equinor/fusion-framework-module-msal@4.0.5
  - @equinor/fusion-framework-module-app@6.1.12
  - @equinor/fusion-framework-react-app@6.1.2
  - @equinor/fusion-framework-app@9.3.12
  - @equinor/fusion-framework@7.3.10
  - @equinor/fusion-framework-module-service-discovery@8.0.13

## 23.0.0

### Patch Changes

- Updated dependencies [[`7a0a510`](https://github.com/equinor/fusion-framework/commit/7a0a510e0af1f0769c596e1b9aaa391250efd95d)]:
  - @equinor/fusion-framework-module-http@6.3.0
  - @equinor/fusion-framework-app@9.3.11
  - @equinor/fusion-framework@7.3.9
  - @equinor/fusion-framework-module-app@6.1.11
  - @equinor/fusion-framework-module-msal@4.0.4
  - @equinor/fusion-framework-module-navigation@5.0.0
  - @equinor/fusion-framework-module-service-discovery@8.0.12
  - @equinor/fusion-framework-react-app@6.1.1

## 22.0.0

### Patch Changes

- Updated dependencies [[`a297265`](https://github.com/equinor/fusion-framework/commit/a29726554526a4feb6e41c6a9d9db5a4f2b01d3d)]:
  - @equinor/fusion-framework-react-app@6.1.0

## 21.0.10

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-navigation@4.0.10
  - @equinor/fusion-observable@8.4.7
  - @equinor/fusion-framework-module-http@6.2.5
  - @equinor/fusion-framework-module-msal@4.0.3
  - @equinor/fusion-framework-module-app@6.1.10
  - @equinor/fusion-framework-react-app@6.0.10
  - @equinor/fusion-framework-app@9.3.10
  - @equinor/fusion-framework@7.3.8
  - @equinor/fusion-framework-module-service-discovery@8.0.11

## 21.0.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.7
  - @equinor/fusion-framework-app@9.3.9
  - @equinor/fusion-framework-react-app@6.0.9

## 21.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@6.0.8
  - @equinor/fusion-framework@7.3.6
  - @equinor/fusion-framework-app@9.3.8
  - @equinor/fusion-framework-module-app@6.1.9
  - @equinor/fusion-framework-module-service-discovery@8.0.10

## 21.0.7

### Patch Changes

- Updated dependencies [[`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8), [`6f104e2`](https://github.com/equinor/fusion-framework/commit/6f104e2ed191e77c6127376e035bbf7af80f166b)]:
  - @equinor/fusion-framework-module-http@6.2.4
  - @equinor/fusion-framework-react-app@6.0.7
  - @equinor/fusion-framework-app@9.3.7
  - @equinor/fusion-framework@7.3.5
  - @equinor/fusion-framework-module-app@6.1.8
  - @equinor/fusion-framework-module-service-discovery@8.0.9

## 21.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@6.0.6
  - @equinor/fusion-framework@7.3.4
  - @equinor/fusion-framework-app@9.3.6

## 21.0.5

### Patch Changes

- Updated dependencies [[`e3de5fa`](https://github.com/equinor/fusion-framework/commit/e3de5fa01528705f8032f673bb03fe48ac97a152)]:
  - @equinor/fusion-framework-module-app@6.1.8
  - @equinor/fusion-framework-app@9.3.5
  - @equinor/fusion-framework-react-app@6.0.5

## 21.0.4

### Patch Changes

- Updated dependencies [[`378f897`](https://github.com/equinor/fusion-framework/commit/378f89707a357d165b84ea82b74147b7f0d87f52)]:
  - @equinor/fusion-framework-module-app@6.1.7
  - @equinor/fusion-framework-app@9.3.4
  - @equinor/fusion-framework-react-app@6.0.4

## 21.0.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- [#2901](https://github.com/equinor/fusion-framework/pull/2901) [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139) Thanks [@odinr](https://github.com/odinr)! - refactor: adhere to Biome `useOptionalChain`

- [#2900](https://github.com/equinor/fusion-framework/pull/2900) [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6) Thanks [@odinr](https://github.com/odinr)! - - Updated service resolver to use dot notation for service map keys.

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139), [`d20db24`](https://github.com/equinor/fusion-framework/commit/d20db24c73690e90a5860fe5160909c77efa41cb), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424), [`e695290`](https://github.com/equinor/fusion-framework/commit/e69529086e90b1d0d8aaf6d4b1de0e1167ce9424)]:
  - @equinor/fusion-framework-module-service-discovery@8.0.8
  - @equinor/fusion-framework-module-navigation@4.0.9
  - @equinor/fusion-observable@8.4.6
  - @equinor/fusion-framework-module-http@6.2.3
  - @equinor/fusion-framework-module-msal@4.0.2
  - @equinor/fusion-framework-module-app@6.1.6
  - @equinor/fusion-framework@7.3.3
  - @equinor/fusion-framework-react-app@6.0.3
  - @equinor/fusion-framework-app@9.3.3

## 21.0.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.3.2
  - @equinor/fusion-framework-react-app@6.0.2
  - @equinor/fusion-framework-app@9.3.2

## 21.0.1

### Patch Changes

- [#2855](https://github.com/equinor/fusion-framework/pull/2855) [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1) Thanks [@odinr](https://github.com/odinr)! - Conformed to Biome `linter.correctness.useExhaustiveDependencies`

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`68b180c`](https://github.com/equinor/fusion-framework/commit/68b180c687ad1939d4f3df185c634f5046a55f63), [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`6efabb7`](https://github.com/equinor/fusion-framework/commit/6efabb7837a97319e976e122db855d8b88b031a6), [`1953dd2`](https://github.com/equinor/fusion-framework/commit/1953dd217d85fa4880856b2c97b6305fcbaf2e24), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module-http@6.2.2
  - @equinor/fusion-framework-module-app@6.1.5
  - @equinor/fusion-framework-module-navigation@4.0.8
  - @equinor/fusion-observable@8.4.5
  - @equinor/fusion-framework-react-app@6.0.1
  - @equinor/fusion-framework-module-msal@4.0.1
  - @equinor/fusion-framework-module-service-discovery@8.0.7
  - @equinor/fusion-framework@7.3.1
  - @equinor/fusion-framework-app@9.3.1

## 21.0.0

### Minor Changes

- [#2814](https://github.com/equinor/fusion-framework/pull/2814) [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa) Thanks [@odinr](https://github.com/odinr)! - Updated `LegacyAuthContainer` to use new MSAL provider interface.

### Patch Changes

- Updated dependencies [[`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa), [`4578b18`](https://github.com/equinor/fusion-framework/commit/4578b1835b70bd0869441c8fcf6d188f6440f192), [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa), [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa), [`ea4b522`](https://github.com/equinor/fusion-framework/commit/ea4b5221b30719289fc947b5dbb0acd3ea52ffaa)]:
  - @equinor/fusion-framework-module-msal@4.0.0
  - @equinor/fusion-framework-app@9.3.0
  - @equinor/fusion-framework-react-app@6.0.0
  - @equinor/fusion-framework@7.3.0
  - @equinor/fusion-framework-module-app@6.1.4
  - @equinor/fusion-framework-module-http@6.2.1
  - @equinor/fusion-framework-module-service-discovery@8.0.6

## 20.0.4

### Patch Changes

- Updated dependencies [[`7f4a381`](https://github.com/equinor/fusion-framework/commit/7f4a381ee3594a8cc1c77f0c13c1ba70223d8bf1)]:
  - @equinor/fusion-observable@8.4.4
  - @equinor/fusion-framework-module-app@6.1.4
  - @equinor/fusion-framework-react-app@5.5.4
  - @equinor/fusion-framework-app@9.2.3
  - @equinor/fusion-framework-module-service-discovery@8.0.5
  - @equinor/fusion-framework@7.2.16

## 20.0.3

### Patch Changes

- Updated dependencies [[`22219ab`](https://github.com/equinor/fusion-framework/commit/22219ab3c07b5578c48a012632fe16d9a823a3bf)]:
  - @equinor/fusion-framework-react-app@5.5.3

## 20.0.2

### Patch Changes

- Updated dependencies [[`50a8966`](https://github.com/equinor/fusion-framework/commit/50a8966d64544a34b386307b690e0ecbf8baaead)]:
  - @equinor/fusion-framework-app@9.2.2
  - @equinor/fusion-framework-react-app@5.5.2

## 20.0.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.2.1
  - @equinor/fusion-framework@7.2.15
  - @equinor/fusion-framework-module-app@6.1.3
  - @equinor/fusion-framework-react-app@5.5.1

## 20.0.0

### Patch Changes

- Updated dependencies [[`83a7ee9`](https://github.com/equinor/fusion-framework/commit/83a7ee971785343bccedc2d72cc02486193615af), [`6ead547`](https://github.com/equinor/fusion-framework/commit/6ead547b869cd8a431876e4316c18cb98094a6fb)]:
  - @equinor/fusion-framework-module-app@6.1.3
  - @equinor/fusion-framework-react-app@5.5.0
  - @equinor/fusion-framework-app@9.2.0
  - @equinor/fusion-framework@7.2.14

## 19.0.2

### Patch Changes

- Updated dependencies [[`add2e98`](https://github.com/equinor/fusion-framework/commit/add2e98d23e683a801729e9af543cfa15c574e27)]:
  - @equinor/fusion-framework-module-app@6.1.2
  - @equinor/fusion-framework-module-service-discovery@8.0.4
  - @equinor/fusion-framework-app@9.1.17
  - @equinor/fusion-framework-react-app@5.4.2
  - @equinor/fusion-framework@7.2.13

## 19.0.1

### Patch Changes

- Updated dependencies [[`59ab642`](https://github.com/equinor/fusion-framework/commit/59ab6424f3ce80649f42ddb6804b46f6789607ba)]:
  - @equinor/fusion-framework-module-app@6.1.1
  - @equinor/fusion-framework@7.2.12
  - @equinor/fusion-framework-app@9.1.16
  - @equinor/fusion-framework-react-app@5.4.1

## 19.0.0

### Patch Changes

- Updated dependencies [[`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982), [`c3ba9f1`](https://github.com/equinor/fusion-framework/commit/c3ba9f109d9f96d6dc6ee2f0ddac00c8b3090982)]:
  - @equinor/fusion-framework-module-app@6.1.0
  - @equinor/fusion-framework-react-app@5.4.0
  - @equinor/fusion-framework-app@9.1.15

## 18.0.2

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-observable@8.4.3
  - @equinor/fusion-framework-app@9.1.14
  - @equinor/fusion-framework-react-app@5.3.1
  - @equinor/fusion-framework-module-app@6.0.3
  - @equinor/fusion-framework-module-service-discovery@8.0.3
  - @equinor/fusion-framework@7.2.11

## 18.0.1

### Patch Changes

- [#2574](https://github.com/equinor/fusion-framework/pull/2574) [`2e1a4fd`](https://github.com/equinor/fusion-framework/commit/2e1a4fdde0573bc23627a1dea4b0e92c531c79f7) Thanks [@eikeland](https://github.com/eikeland)! - #### Updated Files:

  - `packages/react/legacy-interopt/src/create-fusion-context.ts`
  - `packages/react/legacy-interopt/src/create-service-resolver.ts`

  #### Changes:

  1. **create-fusion-context.ts**
     - Added a call to `authContainer.handleWindowCallbackAsync()` before initializing `TelemetryLogger`.

  ```ts
  const authContainer = new LegacyAuthContainer({
    auth: framework.modules.auth,
  });

  await authContainer.handleWindowCallbackAsync();

  const telemetryLogger = new TelemetryLogger(
    telemetry?.instrumentationKey ?? "",
    authContainer
  );
  ```

  2. **create-service-resolver.ts**
     - Changed the third parameter of authContainer.registerAppAsync from false to true.

  ```ts
  return authContainer.registerAppAsync(
    id,
    uris.map((x) => x.uri),
    true
  );
  ```

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@5.3.0

## 18.0.0

### Patch Changes

- Updated dependencies [[`9d1cb90`](https://github.com/equinor/fusion-framework/commit/9d1cb9003fa10e7ccaa95c20ef86f0a618034641)]:
  - @equinor/fusion-framework-react-app@5.3.0
  - @equinor/fusion-framework@7.2.10
  - @equinor/fusion-framework-app@9.1.13

## 17.0.4

### Patch Changes

- [#2535](https://github.com/equinor/fusion-framework/pull/2535) [`10475db`](https://github.com/equinor/fusion-framework/commit/10475db05cf9248e482f004e82b84e2520709bd6) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/fusion from 3.4.16 to 3.4.17

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-observable@8.4.2
  - @equinor/fusion-framework-app@9.1.12
  - @equinor/fusion-framework-react-app@5.2.12
  - @equinor/fusion-framework-module-app@6.0.2
  - @equinor/fusion-framework-module-service-discovery@8.0.2
  - @equinor/fusion-framework@7.2.9

## 17.0.3

### Patch Changes

- Updated dependencies [[`248ee1f`](https://github.com/equinor/fusion-framework/commit/248ee1f83978a158dfb88dd47d8e8bcaac0e3574)]:
  - @equinor/fusion-framework-module-app@6.0.1
  - @equinor/fusion-framework-app@9.1.11
  - @equinor/fusion-framework-react-app@5.2.11

## 17.0.2

### Patch Changes

- [#2528](https://github.com/equinor/fusion-framework/pull/2528) [`ecc6bbb`](https://github.com/equinor/fusion-framework/commit/ecc6bbb16a1593c967f3bcebc0446ebac0bdac21) Thanks [@eikeland](https://github.com/eikeland)! - #### Updated Files:

  - `packages/react/legacy-interopt/src/create-fusion-context.ts`
  - `packages/react/legacy-interopt/src/create-service-resolver.ts`

  #### Changes:

  1. **create-fusion-context.ts**
     - Added a call to `authContainer.handleWindowCallbackAsync()` before initializing `TelemetryLogger`.
  2. **create-service-resolver.ts**

     - Changed the third parameter of authContainer.registerAppAsync from false to true.

## 17.0.1

### Patch Changes

- [#2524](https://github.com/equinor/fusion-framework/pull/2524) [`1941b76`](https://github.com/equinor/fusion-framework/commit/1941b76bdad85af3fe2ccfa9e46180e14940d2a1) Thanks [@odinr](https://github.com/odinr)! - Fixed `LegacyAuthContainer.registerAppAsync` to not create duplicate AuthApps when additional resources are added to the app.

- [#2524](https://github.com/equinor/fusion-framework/pull/2524) [`1941b76`](https://github.com/equinor/fusion-framework/commit/1941b76bdad85af3fe2ccfa9e46180e14940d2a1) Thanks [@odinr](https://github.com/odinr)! - Fixed `createServiceResolver` to extract app client id from each services.
  Previously we assumed that all services registered to the legacy auth container would use the same scope as all other services. This is not the case, as each service can have its own scope. This change allows us to extract the client id from the service definition, which is then used to create the service resolver.

  Resources are indexed by the client id, so when acquiring a resource, the legacy auth container will use the client id to generate an auth token. This token is then used to authenticate the request to the resource.

  **NOTE:** This will and should be deprecated in the future! This "bug" was discovered while an application used a mixed of legacy and new Framework, which caused the application to fail to authenticate requests to the resource (wrong audience).

## 17.0.0

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
  - @equinor/fusion-framework-react-app@5.2.10
  - @equinor/fusion-framework-app@9.1.10

## 16.0.0

### Patch Changes

- [#2491](https://github.com/equinor/fusion-framework/pull/2491) [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51) Thanks [@odinr](https://github.com/odinr)! - Capatalize http request method verb to uppercase

- Updated dependencies [[`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51)]:
  - @equinor/fusion-framework-module-http@6.2.0
  - @equinor/fusion-framework-app@9.1.9
  - @equinor/fusion-framework@7.2.8
  - @equinor/fusion-framework-module-app@5.3.11
  - @equinor/fusion-framework-module-service-discovery@8.0.1
  - @equinor/fusion-framework-react-app@5.2.9

## 15.0.0

### Minor Changes

- [#2459](https://github.com/equinor/fusion-framework/pull/2459) [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa) Thanks [@odinr](https://github.com/odinr)! - Updated createServiceResolver to match service discovery module

  **BREAKING CHANGES:**

  now requires `@equinor/fusion-framework-module-service-discovery^8`

### Patch Changes

- Updated dependencies [[`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31), [`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa)]:
  - @equinor/fusion-framework-module-http@6.1.0
  - @equinor/fusion-framework-module-service-discovery@8.0.0
  - @equinor/fusion-framework-app@9.1.8
  - @equinor/fusion-framework@7.2.7
  - @equinor/fusion-framework-module-app@5.3.11
  - @equinor/fusion-framework-module-msal@3.1.5
  - @equinor/fusion-framework-module-navigation@4.0.7
  - @equinor/fusion-framework-react-app@5.2.8

## 14.0.7

### Patch Changes

- Updated dependencies [[`80cc4e9`](https://github.com/equinor/fusion-framework/commit/80cc4e95a8f2dd8e8aae9752412faefdb457e9e2), [`f7c143d`](https://github.com/equinor/fusion-framework/commit/f7c143d44a88cc25c377d3ce8c3d1744114b891d)]:
  - @equinor/fusion-framework-module-navigation@4.0.6
  - @equinor/fusion-observable@8.4.1
  - @equinor/fusion-framework-react-app@5.2.7
  - @equinor/fusion-framework-module-app@5.3.11
  - @equinor/fusion-framework-app@9.1.7
  - @equinor/fusion-framework-module-service-discovery@7.1.13
  - @equinor/fusion-framework@7.2.6

## 14.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.6
  - @equinor/fusion-framework@7.2.5
  - @equinor/fusion-framework-module-app@5.3.10
  - @equinor/fusion-framework-module-http@6.0.3
  - @equinor/fusion-framework-module-msal@3.1.4
  - @equinor/fusion-framework-module-navigation@4.0.5
  - @equinor/fusion-framework-module-service-discovery@7.1.12
  - @equinor/fusion-framework-react-app@5.2.6

## 14.0.5

### Patch Changes

- Updated dependencies [[`bbde502`](https://github.com/equinor/fusion-framework/commit/bbde502e638f459379f63968febbc97ebe282b76), [`1a215c4`](https://github.com/equinor/fusion-framework/commit/1a215c45c97d2dfdc8127dc752ec21951bb048be), [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`e092f75`](https://github.com/equinor/fusion-framework/commit/e092f7599f1f2e0e0676a9f10565299272813594)]:
  - @equinor/fusion-observable@8.4.0
  - @equinor/fusion-framework-module-navigation@4.0.4
  - @equinor/fusion-framework-module-http@6.0.2
  - @equinor/fusion-framework-module-app@5.3.9
  - @equinor/fusion-framework-react-app@5.2.5
  - @equinor/fusion-framework-app@9.1.5
  - @equinor/fusion-framework@7.2.4
  - @equinor/fusion-framework-module-service-discovery@7.1.11
  - @equinor/fusion-framework-module-msal@3.1.3

## 14.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-app@9.1.4
  - @equinor/fusion-framework@7.2.3
  - @equinor/fusion-framework-module-app@5.3.8
  - @equinor/fusion-framework-react-app@5.2.4

## 14.0.3

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

- Updated dependencies [[`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-module-http@6.0.1
  - @equinor/fusion-framework-module-service-discovery@7.1.10
  - @equinor/fusion-framework-module-navigation@4.0.3
  - @equinor/fusion-observable@8.3.3
  - @equinor/fusion-framework-module-msal@3.1.2
  - @equinor/fusion-framework-module-app@5.3.8
  - @equinor/fusion-framework@7.2.2
  - @equinor/fusion-framework-react-app@5.2.3
  - @equinor/fusion-framework-app@9.1.3

## 14.0.2

### Patch Changes

- Updated dependencies [[`97e41a5`](https://github.com/equinor/fusion-framework/commit/97e41a55d05644b6684c6cb165b65b115bd416eb), [`da9dd83`](https://github.com/equinor/fusion-framework/commit/da9dd83c9352def5365b6c962dc8443589ac9526)]:
  - @equinor/fusion-observable@8.3.2
  - @equinor/fusion-framework-module-app@5.3.7
  - @equinor/fusion-framework-react-app@5.2.2
  - @equinor/fusion-framework-app@9.1.2
  - @equinor/fusion-framework-module-service-discovery@7.1.9
  - @equinor/fusion-framework@7.2.1

## 14.0.1

### Patch Changes

- Updated dependencies [[`b8d52ad`](https://github.com/equinor/fusion-framework/commit/b8d52adb2ca1f9857c672a3deb774409ff2bdb37)]:
  - @equinor/fusion-framework-app@9.1.1
  - @equinor/fusion-framework-react-app@5.2.1

## 14.0.0

### Patch Changes

- Updated dependencies [[`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8), [`72f48ec`](https://github.com/equinor/fusion-framework/commit/72f48eccc7262f6c419c60cc32f0dc829601ceab)]:
  - @equinor/fusion-framework-module-http@6.0.0
  - @equinor/fusion-framework-app@9.1.0
  - @equinor/fusion-framework@7.2.0
  - @equinor/fusion-framework-react-app@5.2.0
  - @equinor/fusion-observable@8.3.1
  - @equinor/fusion-framework-module-app@5.3.6
  - @equinor/fusion-framework-module-service-discovery@7.1.8

## 13.0.0

### Patch Changes

- Updated dependencies [[`060a1aa`](https://github.com/equinor/fusion-framework/commit/060a1aa7f4f2ce6b1ddef527a219bf267e488500)]:
  - @equinor/fusion-framework-react-app@5.1.0
  - @equinor/fusion-framework-app@9.0.9
  - @equinor/fusion-framework@7.1.8
  - @equinor/fusion-framework-module-app@5.3.5
  - @equinor/fusion-framework-module-http@5.2.3
  - @equinor/fusion-framework-module-msal@3.1.1
  - @equinor/fusion-framework-module-navigation@4.0.2
  - @equinor/fusion-framework-module-service-discovery@7.1.7

## 12.0.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.3.4
  - @equinor/fusion-framework-module-service-discovery@7.1.6
  - @equinor/fusion-framework-app@9.0.8
  - @equinor/fusion-framework-react-app@5.0.11
  - @equinor/fusion-framework@7.1.7

## 12.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.3.3
  - @equinor/fusion-framework-module-service-discovery@7.1.5
  - @equinor/fusion-framework-app@9.0.7
  - @equinor/fusion-framework-react-app@5.0.10
  - @equinor/fusion-framework@7.1.6

## 12.0.7

### Patch Changes

- Updated dependencies [[`0f95a74`](https://github.com/equinor/fusion-framework/commit/0f95a74b78cb5e86bc14c4a0f1f1715415746ef5)]:
  - @equinor/fusion-framework-module-navigation@4.0.1
  - @equinor/fusion-framework-react-app@5.0.9
  - @equinor/fusion-framework-module-app@5.3.2
  - @equinor/fusion-framework-module-service-discovery@7.1.4
  - @equinor/fusion-framework-app@9.0.6
  - @equinor/fusion-framework@7.1.5

## 12.0.6

### Patch Changes

- Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
  - @equinor/fusion-framework-module-http@5.2.2
  - @equinor/fusion-framework-app@9.0.5
  - @equinor/fusion-framework@7.1.4
  - @equinor/fusion-framework-module-app@5.3.1
  - @equinor/fusion-framework-module-service-discovery@7.1.3
  - @equinor/fusion-framework-react-app@5.0.8

## 12.0.5

### Patch Changes

- Updated dependencies [[`572a199`](https://github.com/equinor/fusion-framework/commit/572a199b8b3070af16d76238aa30d7aaf36a115a)]:
  - @equinor/fusion-observable@8.3.0
  - @equinor/fusion-framework-module-app@5.3.1
  - @equinor/fusion-framework-react-app@5.0.7
  - @equinor/fusion-framework-module-service-discovery@7.1.2
  - @equinor/fusion-framework-app@9.0.4
  - @equinor/fusion-framework@7.1.3

## 12.0.4

### Patch Changes

- Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
  - @equinor/fusion-framework-module-http@5.2.1
  - @equinor/fusion-framework-app@9.0.3
  - @equinor/fusion-framework@7.1.2
  - @equinor/fusion-framework-module-app@5.3.0
  - @equinor/fusion-framework-module-service-discovery@7.1.1
  - @equinor/fusion-framework-react-app@5.0.6

## 12.0.3

### Patch Changes

- Updated dependencies [[`036ec15`](https://github.com/equinor/fusion-framework/commit/036ec151ace9c051ded41798ab94b8ee5e3d4461)]:
  - @equinor/fusion-framework-app@9.0.2
  - @equinor/fusion-framework-react-app@5.0.5

## 12.0.2

### Patch Changes

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework@7.1.1
  - @equinor/fusion-framework-react-app@5.0.4
  - @equinor/fusion-framework-app@9.0.1
  - @equinor/fusion-framework-module-app@5.3.0

## 12.0.1

### Patch Changes

- Updated dependencies [[`e0b95f1`](https://github.com/equinor/fusion-framework/commit/e0b95f1879ecfc108987073a58c3c3150c156aa8)]:
  - @equinor/fusion-framework-react-app@5.0.3

## 12.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module-service-discovery@7.1.0
  - @equinor/fusion-framework-module-navigation@4.0.0
  - @equinor/fusion-observable@8.2.0
  - @equinor/fusion-framework-module-http@5.2.0
  - @equinor/fusion-framework-module-msal@3.1.0
  - @equinor/fusion-framework-module-app@5.3.0
  - @equinor/fusion-framework@7.1.0
  - @equinor/fusion-framework-react-app@5.0.0
  - @equinor/fusion-framework-app@9.0.0

## 11.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework@7.0.33
  - @equinor/fusion-framework-app@8.1.4
  - @equinor/fusion-framework-react-app@4.3.8

## 11.0.5

### Patch Changes

- Updated dependencies [[`2acd475`](https://github.com/equinor/fusion-framework/commit/2acd47532fe680f498fdf7229309cddb2594e391)]:
  - @equinor/fusion-framework-module-app@5.2.14
  - @equinor/fusion-framework-app@8.1.3
  - @equinor/fusion-framework-react-app@4.3.7
  - @equinor/fusion-framework@7.0.32

## 11.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@4.3.6
  - @equinor/fusion-framework@7.0.31
  - @equinor/fusion-framework-app@8.1.2

## 11.0.3

### Patch Changes

- Updated dependencies [[`bdc50b0`](https://github.com/equinor/fusion-framework/commit/bdc50b035b9c20301105d17509937ff3d91ea027)]:
  - @equinor/fusion-framework-react-app@4.3.5

## 11.0.2

### Patch Changes

- Updated dependencies [[`7a70bfb`](https://github.com/equinor/fusion-framework/commit/7a70bfb6674c5cf8624ce090e318239a41c8fb86)]:
  - @equinor/fusion-framework-react-app@4.3.4

## 11.0.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-react-app@4.3.3
  - @equinor/fusion-framework-app@8.1.1
  - @equinor/fusion-framework@7.0.30
  - @equinor/fusion-framework-module-app@5.2.13
  - @equinor/fusion-framework-module-http@5.1.6
  - @equinor/fusion-framework-module-msal@3.0.10
  - @equinor/fusion-framework-module-navigation@3.1.4
  - @equinor/fusion-framework-module-service-discovery@7.0.20

## 11.0.0

### Major Changes

- [#1789](https://github.com/equinor/fusion-framework/pull/1789) [`8f2939e`](https://github.com/equinor/fusion-framework/commit/8f2939e32da3d128e4749abd9e4b57d52145ac36) Thanks [@odinr](https://github.com/odinr)! - `LegacyAppContainer` no longer injects script for loading application when setting current application

  > the application should be loaded by the app loader component, not the state container

## 10.0.0

### Patch Changes

- Updated dependencies [[`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9), [`0f3affa`](https://github.com/equinor/fusion-framework/commit/0f3affa45b7b7dc0a0f01682682293e4b899a5d9)]:
  - @equinor/fusion-framework-react-app@4.3.2
  - @equinor/fusion-framework-app@8.1.0

## 9.0.1

### Patch Changes

- Updated dependencies [[`036546f`](https://github.com/equinor/fusion-framework/commit/036546f2e3d9c0d289c7145da84e940673027b5e), [`1ca8264`](https://github.com/equinor/fusion-framework/commit/1ca826489a0d1dd755324344a12bbf6659a3be12), [`d0c0c6a`](https://github.com/equinor/fusion-framework/commit/d0c0c6a971a478e3f447663bf50b4e3a7cb1517e)]:
  - @equinor/fusion-observable@8.1.5
  - @equinor/fusion-framework-module-app@5.2.13
  - @equinor/fusion-framework-react-app@4.3.1
  - @equinor/fusion-framework-app@8.0.1
  - @equinor/fusion-framework-module-service-discovery@7.0.19
  - @equinor/fusion-framework@7.0.29

## 9.0.0

### Patch Changes

- Updated dependencies [[`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e), [`8b031c3`](https://github.com/equinor/fusion-framework/commit/8b031c31f314deeffdf395fc847e4279b61aab7e)]:
  - @equinor/fusion-framework-react-app@4.3.0
  - @equinor/fusion-framework-app@8.0.0

## 8.0.1

### Patch Changes

- Updated dependencies [[`1918c82`](https://github.com/equinor/fusion-framework/commit/1918c8228bc7158c4c358aa8f5688342e3b11b1d)]:
  - @equinor/fusion-framework-react-app@4.2.1

## 8.0.0

### Patch Changes

- [#1672](https://github.com/equinor/fusion-framework/pull/1672) [`3f66272`](https://github.com/equinor/fusion-framework/commit/3f66272b4597794b7f8dfa76bca70cbc2a3ee465) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion from 3.4.11 to 3.4.14

- [#1651](https://github.com/equinor/fusion-framework/pull/1651) [`1d042d0`](https://github.com/equinor/fusion-framework/commit/1d042d02fb59ce19bf0a09263b87cb9f71195aea) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @equinor/fusion-components from 2.12.0 to 2.12.4

- Updated dependencies [[`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1), [`5eab8af`](https://github.com/equinor/fusion-framework/commit/5eab8afe3c3106cc67ad14ce4cbee6c7e4e8dfb1)]:
  - @equinor/fusion-framework-module-msal@3.0.9
  - @equinor/fusion-framework-react-app@4.2.0
  - @equinor/fusion-framework-app@7.1.15
  - @equinor/fusion-framework@7.0.28
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-module-http@5.1.5
  - @equinor/fusion-framework-module-service-discovery@7.0.18

## 7.0.8

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4
  - @equinor/fusion-framework-app@7.1.14
  - @equinor/fusion-framework@7.0.27
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-module-service-discovery@7.0.17
  - @equinor/fusion-framework-react-app@4.1.19

## 7.0.7

### Patch Changes

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3
  - @equinor/fusion-framework-app@7.1.13
  - @equinor/fusion-framework@7.0.26
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-module-service-discovery@7.0.16
  - @equinor/fusion-framework-react-app@4.1.18

## 7.0.6

### Patch Changes

- Updated dependencies [[`6ffaabf`](https://github.com/equinor/fusion-framework/commit/6ffaabf120704f2f4f4074a0fa0a17faf77fe22a)]:
  - @equinor/fusion-observable@8.1.4
  - @equinor/fusion-framework-module-app@5.2.12
  - @equinor/fusion-framework-app@7.1.12
  - @equinor/fusion-framework-react-app@4.1.17
  - @equinor/fusion-framework-module-service-discovery@7.0.15
  - @equinor/fusion-framework@7.0.25

## 7.0.5

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.14
  - @equinor/fusion-framework-module-navigation@3.1.3
  - @equinor/fusion-observable@8.1.3
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-framework-module-msal@3.0.8
  - @equinor/fusion-framework-module-app@5.2.11
  - @equinor/fusion-framework@7.0.24
  - @equinor/fusion-framework-react-app@4.1.16
  - @equinor/fusion-framework-app@7.1.11

## 7.0.4

### Patch Changes

- Updated dependencies [[`6d303787`](https://github.com/equinor/fusion-framework/commit/6d303787f647bb2fc3c90456eccac751abb264c4)]:
  - @equinor/fusion-framework-module-app@5.2.10
  - @equinor/fusion-framework-app@7.1.10
  - @equinor/fusion-framework-react-app@4.1.15

## 7.0.3

### Patch Changes

- Updated dependencies [[`8274dca1`](https://github.com/equinor/fusion-framework/commit/8274dca10a773e1d29ffbce82a6f6f2bae818316)]:
  - @equinor/fusion-framework-module-app@5.2.9
  - @equinor/fusion-framework-app@7.1.9
  - @equinor/fusion-framework-react-app@4.1.14

## 7.0.2

### Patch Changes

- Updated dependencies [[`a8f0f061`](https://github.com/equinor/fusion-framework/commit/a8f0f061dbde9efb3e2faf11fdb9c886d2277723)]:
  - @equinor/fusion-framework-module-navigation@3.1.2
  - @equinor/fusion-framework-react-app@4.1.13

## 7.0.1

### Patch Changes

- Updated dependencies [[`e2ec89f4`](https://github.com/equinor/fusion-framework/commit/e2ec89f457135037e2a333a61ba546fee6d99cd8)]:
  - @equinor/fusion-framework-module-navigation@3.1.1
  - @equinor/fusion-framework-react-app@4.1.12

## 7.0.0

### Patch Changes

- Updated dependencies [[`6f542d4c`](https://github.com/equinor/fusion-framework/commit/6f542d4c7c01ae94c28b7e82efba800a902a7633)]:
  - @equinor/fusion-framework-module-navigation@3.1.0
  - @equinor/fusion-framework-react-app@4.1.11

## 6.0.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.2.8
  - @equinor/fusion-framework-module-service-discovery@7.0.13
  - @equinor/fusion-framework-app@7.1.8
  - @equinor/fusion-framework-react-app@4.1.10
  - @equinor/fusion-framework@7.0.23

## 6.0.2

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-framework-module-app@5.2.7
  - @equinor/fusion-framework@7.0.22
  - @equinor/fusion-framework-module-service-discovery@7.0.12
  - @equinor/fusion-framework-app@7.1.7
  - @equinor/fusion-framework-react-app@4.1.9

## 6.0.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-app@7.1.6
  - @equinor/fusion-framework@7.0.21
  - @equinor/fusion-framework-module-app@5.2.6
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-module-msal@3.0.7
  - @equinor/fusion-framework-module-navigation@3.0.6
  - @equinor/fusion-framework-module-service-discovery@7.0.11
  - @equinor/fusion-framework-react-app@4.1.8
  - @equinor/fusion-observable@8.1.2

## 6.0.0

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa)]:
  - @equinor/fusion-framework-module-http@5.1.0
  - @equinor/fusion-framework-app@7.1.5
  - @equinor/fusion-framework@7.0.20
  - @equinor/fusion-framework-module-app@5.2.5
  - @equinor/fusion-framework-module-service-discovery@7.0.10
  - @equinor/fusion-framework-react-app@4.1.7

## 5.1.5

### Patch Changes

- Updated dependencies [[`e539e606`](https://github.com/equinor/fusion-framework/commit/e539e606d04bd8b7dc0c0bfed7cd4a7731996936)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.9
  - @equinor/fusion-framework@7.0.19
  - @equinor/fusion-framework-module-app@5.2.4
  - @equinor/fusion-framework-app@7.1.4
  - @equinor/fusion-framework-react-app@4.1.6

## 5.1.4

### Patch Changes

- Updated dependencies [[`6f64d1aa`](https://github.com/equinor/fusion-framework/commit/6f64d1aa5e44af37f0abd76cef36e87761134760), [`758eaaf4`](https://github.com/equinor/fusion-framework/commit/758eaaf436ae28d180e7d91818b41abe0d9624c4)]:
  - @equinor/fusion-observable@8.1.1
  - @equinor/fusion-framework-module-app@5.2.4
  - @equinor/fusion-framework-app@7.1.3
  - @equinor/fusion-framework@7.0.18
  - @equinor/fusion-framework-module-http@5.0.6
  - @equinor/fusion-framework-module-msal@3.0.6
  - @equinor/fusion-framework-module-navigation@3.0.5
  - @equinor/fusion-framework-module-service-discovery@7.0.8
  - @equinor/fusion-framework-react-app@4.1.5

## 5.1.3

### Patch Changes

- [`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594) Thanks [@odinr](https://github.com/odinr)! - fixed broken imports after updating to react@18

- Updated dependencies []:
  - @equinor/fusion-framework-module-app@5.2.3
  - @equinor/fusion-framework-module-service-discovery@7.0.7
  - @equinor/fusion-framework-app@7.1.2
  - @equinor/fusion-framework-react-app@4.1.4
  - @equinor/fusion-framework@7.0.17

## 5.1.2

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`8e7ae77c`](https://github.com/equinor/fusion-framework/commit/8e7ae77cfcadddc4b59e6bb57e620b84e5e1c647), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-module-service-discovery@7.0.6
  - @equinor/fusion-framework-module-navigation@3.0.4
  - @equinor/fusion-observable@8.1.0
  - @equinor/fusion-framework-module-http@5.0.5
  - @equinor/fusion-framework-module-msal@3.0.5
  - @equinor/fusion-framework-module-app@5.2.2
  - @equinor/fusion-framework@7.0.16
  - @equinor/fusion-framework-react-app@4.1.3
  - @equinor/fusion-framework-app@7.1.1

## 5.1.1

### Patch Changes

- [#1017](https://github.com/equinor/fusion-framework/pull/1017) [`0eac0480`](https://github.com/equinor/fusion-framework/commit/0eac0480b4743e2243a6349a3fb0352689fff075) Thanks [@eikeland](https://github.com/eikeland)! - # Featurelogger issue

  Fixes FeatureLogger in LegacyAppContainer logging null as appKey.

## 5.1.0

### Minor Changes

- [#962](https://github.com/equinor/fusion-framework/pull/962) [`14162858`](https://github.com/equinor/fusion-framework/commit/141628585c12174575a5ecd12d2a79ea47acca9d) Thanks [@odinr](https://github.com/odinr)! - **LegacyAppContainer**

  change behavior of internal application state of `LegacyAppContainer`.
  current value is set to 20ms, this can be adjusted later (if needed).

  Without this throttle the internal state could en up in death-loop since `DistributedState` is triggered on `window.requestAnimationFrame`, which would make a ping pong effect

  other:

  - `#manifest` is renamed to `#state`
  - subscription to Framework app changed is now directly on the app module vs event
  - added `dispose` since subscription/listeners are not cleaned up (should only be one `LegacyAppContainer`)

### Patch Changes

- [#962](https://github.com/equinor/fusion-framework/pull/962) [`14162858`](https://github.com/equinor/fusion-framework/commit/141628585c12174575a5ecd12d2a79ea47acca9d) Thanks [@odinr](https://github.com/odinr)! - Changed subscription on fusion framework history

  Application had random error with attaching to the Framework history since it was attached by `useEffect`, now changed to `useLayoutEffect`. this error only occurred when resolving initial context, which lead the legacy router in initial path and not the resolved context route.

## 5.0.2

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 5.0.0

### Major Changes

- [#935](https://github.com/equinor/fusion-framework/pull/935) [`710c337f`](https://github.com/equinor/fusion-framework/commit/710c337f2fa4ce834de4673c9805c2e0d07e7fef) Thanks [@odinr](https://github.com/odinr)! - **hotfix** provide legacy app manifest to `createLegacyRender`

  all application should have a `render` method for connecting to the framework, minimal effort for getting end-of-life application to run just a little longer...🌈

  **How to migrate**

  > as a app developer, you should not be using this package! 🙄

  as a portal developer, see code below 😎

  _current_

  ```ts
  // before change
  createLegacyRender(
    manifest.key,
    manifest.AppComponent as React.FunctionComponent,
    legacyFusion // fusion context container
  );
  ```

  _after_

  ```ts
  createLegacyRender(
    manifest, // mutated legacy manifest
    legacyFusion // fusion context container
  );
  ```

## 4.0.14

### Patch Changes

- [#929](https://github.com/equinor/fusion-framework/pull/929) [`32f4f5a3`](https://github.com/equinor/fusion-framework/commit/32f4f5a3073a703f536188da9f7cb548a1ae6b3e) Thanks [@odinr](https://github.com/odinr)! - **Prevent app registration death spiral**

  Currently the application can register it self with a shared function in the fusion context (window), this modifies the manifest. if the portal and application has different app containers _(which they do if application bundle with a different version of fusion-api than the fusion-cli 🤯)_.

  The 2 containers are connected threw a message bus and localStorage, which batch on `requestAnimationFrame`, which means that if there are miss-match between the application manifests, this would do a tic-toc as fast as your computer can render🧨

  after this update only a few manifest properties will be checked:

  - `render`
  - `AppComponent`
  - `tags`
  - `category`
  - `publishedDate`

  > we suggest that application ony register `appKey` plus `render` or `AppComponent` _(☠️ deprecated soon)_
  >
  > ```ts
  > registerApp("my-app", { render: myRenderMethod });
  > ```

## 4.0.13

### Patch Changes

- [#927](https://github.com/equinor/fusion-framework/pull/927) [`8bc4c5d6`](https://github.com/equinor/fusion-framework/commit/8bc4c5d6ed900e424efcab5572047c106d7ec04a) Thanks [@odinr](https://github.com/odinr)! - update loading of legacy applications

  - when an application load from CJS with `registerApp` the manifest is mutated and should update in legacy app container
  - add strict `undefined` check of manifest app component
  - add check if miss match of appKey, output warn and error if current app is not in scope

## 4.0.12

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

- [`d6671bc5`](https://github.com/equinor/fusion-framework/commit/d6671bc526179f18a5290049728c9c5ac72da671) Thanks [@odinr](https://github.com/odinr)! - added missing [exhausted-deps](https://legacy.reactjs.org/docs/hooks-rules.html), this might cause rerender, since `ReactRouterDom.createBrowserHistory` might create history dynamicly.

  this should be tested in portal when updating the `@equinor/fusion-framework-legacy-interopt`

  https://github.com/equinor/fusion-framework/blob/7c0a475174f61ba02570614c237d5cfb3b009cb1/packages/react/legacy-interopt/src/create-legacy-render.tsx#L59

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.10...@equinor/fusion-framework-legacy-interopt@4.0.11) (2023-05-24)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.9...@equinor/fusion-framework-legacy-interopt@4.0.10) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.8...@equinor/fusion-framework-legacy-interopt@4.0.9) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.7...@equinor/fusion-framework-legacy-interopt@4.0.8) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.6...@equinor/fusion-framework-legacy-interopt@4.0.7) (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.5...@equinor/fusion-framework-legacy-interopt@4.0.6) (2023-05-12)

### Bug Fixes

- **legacy-interopt:** fix router ([c904ff2](https://github.com/equinor/fusion-framework/commit/c904ff295ddf0da14f6cb2da77710baae95f05b7))

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.4...@equinor/fusion-framework-legacy-interopt@4.0.5) (2023-05-12)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.3...@equinor/fusion-framework-legacy-interopt@4.0.4) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.2...@equinor/fusion-framework-legacy-interopt@4.0.3) (2023-05-11)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 4.0.2 (2023-05-10)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@4.0.0...@equinor/fusion-framework-legacy-interopt@4.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.5...@equinor/fusion-framework-legacy-interopt@4.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

- **legacy-interopt:** portal need to implement navigation when context changes

### Features

- **legacy-interopt:** create tooling for legacy app wrapper ([815fead](https://github.com/equinor/fusion-framework/commit/815fead99a9d59ea3bb77b9db25deba4e33a5f0a))
- **legacy-interopt:** remove navigation from context manager ([4c5518f](https://github.com/equinor/fusion-framework/commit/4c5518f619174b9423f4c751da805d7c88e5cbd4))
- **react-legacy-interopt:** add support for legacy application to change context ([3262bde](https://github.com/equinor/fusion-framework/commit/3262bde423315d44881b5bca0e03ecbddf3f4a4d))
- **react-legacy-interopt:** update legacy context app init ([e29cdf2](https://github.com/equinor/fusion-framework/commit/e29cdf2fdb0169b3fd9bbaaa685d47b4bfb677dd))

### Bug Fixes

- **react-legacy-interopt:** fix fallback url path ([44204c1](https://github.com/equinor/fusion-framework/commit/44204c17a9b025bff041bfebd8f5000cb51b0a20))
- **react-legacy-interopt:** fix initial context url ([31f113a](https://github.com/equinor/fusion-framework/commit/31f113aebc2ad09e6a446997e95ecfeef3da2fff))
- **react-legacy-interopt:** fix legacy url resolving ([8082ad5](https://github.com/equinor/fusion-framework/commit/8082ad599c71b07c017fc0a9f32ee0dc21683087))
- **react-legacy-interopt:** keep leading slash in pathname ([34e9b75](https://github.com/equinor/fusion-framework/commit/34e9b7508e98f938e0996448444173e7a9d641a8))
- **react-legacy-interopt:** monitor current context changes ([a6b703a](https://github.com/equinor/fusion-framework/commit/a6b703a0d0d31a3d0d20cd52d6a1e4caef022f9d))
- **react-legacy-interopt:** remove context from suggest url when clearing context ([a04c80c](https://github.com/equinor/fusion-framework/commit/a04c80c94b19b9d9abc27965dec2fb22ed19dedd))

## 3.0.5 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 3.0.4 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [3.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.2...@equinor/fusion-framework-legacy-interopt@3.0.3) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.1...@equinor/fusion-framework-legacy-interopt@3.0.2) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@3.0.0...@equinor/fusion-framework-legacy-interopt@3.0.1) (2023-04-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.22 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.21 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.20 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.19](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.18...@equinor/fusion-framework-legacy-interopt@2.1.19) (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.18 (2023-04-11)

### Bug Fixes

- **legacy-interopt:** react 17.0.2 as dependecy not 17.0.52 since it fails fusion-cli ([d7edcd2](https://github.com/equinor/fusion-framework/commit/d7edcd203f6ecaac8baa53425804ecd95e4eace5))

## 2.1.17 (2023-04-11)

### Bug Fixes

- **legacy-interopt:** react 17.0.2 as dependecy not 17.0.52 since it fails fusion-cli ([d7edcd2](https://github.com/equinor/fusion-framework/commit/d7edcd203f6ecaac8baa53425804ecd95e4eace5))

## [2.1.17](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.16...@equinor/fusion-framework-legacy-interopt@2.1.17) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.16 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.15](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.14...@equinor/fusion-framework-legacy-interopt@2.1.15) (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.14 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.13](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.12...@equinor/fusion-framework-legacy-interopt@2.1.13) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.1.12 (2023-03-20)

### Bug Fixes

- **legacyContext:** removed ensurecontextidinurl, and navigation on contextchange ([f56c5d9](https://github.com/equinor/fusion-framework/commit/f56c5d9d001988454c7337e25e93399ce829bb90))

## [2.1.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.10...@equinor/fusion-framework-legacy-interopt@2.1.11) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.9...@equinor/fusion-framework-legacy-interopt@2.1.10) (2023-03-09)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.8...@equinor/fusion-framework-legacy-interopt@2.1.9) (2023-03-09)

### Bug Fixes

- **react/legact-interopt:** check if app manifest exists when current app changes ([8ad2a93](https://github.com/equinor/fusion-framework/commit/8ad2a930d0279cd48929141f4bd20ea975dba6b7))

## [2.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.7...@equinor/fusion-framework-legacy-interopt@2.1.8) (2023-03-06)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.6...@equinor/fusion-framework-legacy-interopt@2.1.7) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.5...@equinor/fusion-framework-legacy-interopt@2.1.6) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.4...@equinor/fusion-framework-legacy-interopt@2.1.5) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.3...@equinor/fusion-framework-legacy-interopt@2.1.4) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.2...@equinor/fusion-framework-legacy-interopt@2.1.3) (2023-02-06)

### Bug Fixes

- **legacy-iternopt:** remove logging ([76b2cfa](https://github.com/equinor/fusion-framework/commit/76b2cfa47bce288c53f49d856661bb027757347d))

## 2.1.2 (2023-02-06)

### Bug Fixes

- **navigation:** fix subscription of listener ([f76eee1](https://github.com/equinor/fusion-framework/commit/f76eee19327c9ef805232ca7a3271a4a06e94b6f))

## [2.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.1.0...@equinor/fusion-framework-legacy-interopt@2.1.1) (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.6...@equinor/fusion-framework-legacy-interopt@2.1.0) (2023-02-01)

### Features

- **legacy-interopt:** allow wrapper befaore main content ([818aa43](https://github.com/equinor/fusion-framework/commit/818aa4309fe3ae9899c7e624c6de3bbf53d8c10b))

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.5...@equinor/fusion-framework-legacy-interopt@2.0.6) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.3...@equinor/fusion-framework-legacy-interopt@2.0.5) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@2.0.3...@equinor/fusion-framework-legacy-interopt@2.0.4) (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.0.3 (2023-02-01)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.0.2 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 2.0.1 (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.6...@equinor/fusion-framework-legacy-interopt@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.6...@equinor/fusion-framework-legacy-interopt@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.5...@equinor/fusion-framework-legacy-interopt@1.0.6) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## 1.0.5 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.3...@equinor/fusion-framework-legacy-interopt@1.0.4) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.2...@equinor/fusion-framework-legacy-interopt@1.0.3) (2023-01-16)

### Bug Fixes

- **legacy-interopt:** register legacy auth token resolve ([24ee4ea](https://github.com/equinor/fusion-framework/commit/24ee4eab42d4f472c8f4c8b959ce73f8f5b4dc1c))
- **legacy-interopt:** remove yalc ([8f32e52](https://github.com/equinor/fusion-framework/commit/8f32e521de5b0cfde14309ec77f5c7a5e996456b))

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.1...@equinor/fusion-framework-legacy-interopt@1.0.2) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-legacy-interopt

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-legacy-interopt@1.0.0...@equinor/fusion-framework-legacy-interopt@1.0.1) (2023-01-16)

### Bug Fixes

- **legacy-import:** add build references ([5ecea04](https://github.com/equinor/fusion-framework/commit/5ecea04b9db6546751e7bc02ec176596249f5339))

## 1.0.0 (2023-01-16)

### Features

- **legacy-interopt:** create a package for interopt between framework and fusion-api ([280868a](https://github.com/equinor/fusion-framework/commit/280868a072c6e4c5b28219c7248cbf327fcf6efa))

### Bug Fixes

- **legacy-interopt:** fix minor typos and imports ([3d36f86](https://github.com/equinor/fusion-framework/commit/3d36f866a17876dd605cb78c57b2be664c2f0f95))

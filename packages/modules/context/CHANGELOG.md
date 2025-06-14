# Change Log

## 6.0.6

### Patch Changes

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-query@5.2.11

## 6.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.10

## 6.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.9

## 6.0.3

### Patch Changes

- [#3064](https://github.com/equinor/fusion-framework/pull/3064) [`231e24e`](https://github.com/equinor/fusion-framework/commit/231e24eef9ca33db2fbde2fdd1c918eeb620c8c4) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add support for html and svg in meta and graphic for context result

## 6.0.2

### Patch Changes

- [#3057](https://github.com/equinor/fusion-framework/pull/3057) [`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428) Thanks [@odinr](https://github.com/odinr)! - fixed `typeVersions`

- Updated dependencies [[`96bb1fb`](https://github.com/equinor/fusion-framework/commit/96bb1fb744d8dc2410e99fea6ca948d2d5489428)]:
  - @equinor/fusion-framework-module@4.4.2
  - @equinor/fusion-query@5.2.8

## 6.0.1

### Patch Changes

- Updated dependencies [[`e49f916`](https://github.com/equinor/fusion-framework/commit/e49f9161557202df57248d02ade4d2ef50231bdc), [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module@4.4.1
  - @equinor/fusion-query@5.2.7

## 6.0.0

### Patch Changes

- Updated dependencies [[`efd70a3`](https://github.com/equinor/fusion-framework/commit/efd70a34f734e0c155d3440e35ce4fa11a7abc42)]:
  - @equinor/fusion-framework-module@4.4.0
  - @equinor/fusion-query@5.2.6

## 5.1.3

### Patch Changes

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module@4.3.8
  - @equinor/fusion-query@5.2.5

## 5.1.2

### Patch Changes

- [#3010](https://github.com/equinor/fusion-framework/pull/3010) [`2c9fcd6`](https://github.com/equinor/fusion-framework/commit/2c9fcd6bcacb3e1b94d7aa4ad2e9d216a329faa5) Thanks [@odinr](https://github.com/odinr)! - Fixed path for base type in package json

## 5.1.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.4

## 5.1.0

### Minor Changes

- [#2930](https://github.com/equinor/fusion-framework/pull/2930) [`5da6b2d`](https://github.com/equinor/fusion-framework/commit/5da6b2d4cb7fb93ff3784753a0052d3362ab828d) Thanks [@odinr](https://github.com/odinr)! - **@equinor/fusion-framework-react:**

  - Enhanced `useAppContextNavigation` to support custom context path extraction and generation. This allows for more flexible navigation handling based on application-specific requirements.

  **@equinor/fusion-framework-module-context:**

  - Added support for custom context path extraction and generation in `ContextConfigBuilder`, `ContextProvider`, and `ContextModuleConfigurator`.
  - Introduced `setContextPathExtractor` and `setContextPathGenerator` methods in `ContextConfigBuilder` to allow developers to define custom logic for extracting and generating context paths.
  - Updated `ContextProvider` to utilize `extractContextIdFromPath` and `generatePathFromContext` from the configuration, enabling dynamic path handling.
  - Enhanced `ContextModuleConfigurator` to include `extractContextIdFromPath` and `generatePathFromContext` in the module configuration.

  If you are using `@equinor/fusion-framework-module-context` and need custom logic for context path handling:

  1. Use `setContextPathExtractor` to define how to extract context IDs from paths.
  2. Use `setContextPathGenerator` to define how to generate paths based on context items.

  Example:

  ```typescript
  builder.setContextPathExtractor((path) => {
    // Custom logic to extract context ID from path
    return path.match(/\/custom\/(.+)/)?.[1];
  });

  builder.setContextPathGenerator((context, path) => {
    // Custom logic to generate path from context
    return path.replace(/^(\/)?custom\/[^/]+(.*)$/, `/app/${item.id}$2`);
  });
  ```

  If your portal is generating context paths based on context items, you can now define custom logic for context path handling:

  ```typescript
  contextProvider.currentContext$
    .pipe(
      map((context) => {
        // Custom logic to generate path from context
        const path = contextProvider.generatePathFromContext?.(
          context,
          location.pathname
        );
        return path ?? fallbackPathGenerator(context, location.pathname);
      }),
      filter(Boolean)
    )
    .subscribe((path) => history.push(path));
  ```

## 5.0.19

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-module@4.3.7
  - @equinor/fusion-query@5.2.3

## 5.0.18

### Patch Changes

- [#2863](https://github.com/equinor/fusion-framework/pull/2863) [`11e18fd`](https://github.com/equinor/fusion-framework/commit/11e18fd755e65d1bbbb9b98638fdb9a98c2c23ab) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed matching type of `ContextClient` to extended `Observable` type. Only refactor, no functional changes.

  **note:** _the context client context item observable should not be able to be undefined, only item or `null`. this should be fixed in the future, added `@todo` comment to remind us to fix this in the future._

## 5.0.17

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`2fe6241`](https://github.com/equinor/fusion-framework/commit/2fe624186640c3b30079c7d76f0e3af65f64f5d2), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module@4.3.6
  - @equinor/fusion-query@5.2.2

## 5.0.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.2.1

## 5.0.15

### Patch Changes

- Updated dependencies [[`a965fbe`](https://github.com/equinor/fusion-framework/commit/a965fbeb9544b74f7d7b4aaa1e57c50d2ae4a564)]:
  - @equinor/fusion-query@5.2.0

## 5.0.14

### Patch Changes

- Updated dependencies [[`30767a2`](https://github.com/equinor/fusion-framework/commit/30767a2f72b54c2a3ea98ce08186017e34ae16bd)]:
  - @equinor/fusion-query@5.1.5

## 5.0.13

### Patch Changes

- Updated dependencies [[`21db01b`](https://github.com/equinor/fusion-framework/commit/21db01bbe5113b07aaa715d554378561e1a5223d)]:
  - @equinor/fusion-query@5.1.4

## 5.0.12

### Patch Changes

- Updated dependencies [[`2644b3d`](https://github.com/equinor/fusion-framework/commit/2644b3d63939aede736a3b1950db32dbd487877d)]:
  - @equinor/fusion-framework-module@4.3.5

## 5.0.11

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.1.3

## 5.0.10

### Patch Changes

- Updated dependencies [[`75d676d`](https://github.com/equinor/fusion-framework/commit/75d676d2c7919f30e036b5ae97c4d814c569aa87), [`be2e925`](https://github.com/equinor/fusion-framework/commit/be2e92532f4a4b8f0b2c9e12d4adf942d380423e), [`00d5e9c`](https://github.com/equinor/fusion-framework/commit/00d5e9c632876742c3d2a74efea2f126a0a169d9)]:
  - @equinor/fusion-framework-module@4.3.4
  - @equinor/fusion-query@5.1.2

## 5.0.9

### Patch Changes

- Updated dependencies [[`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb), [`a1524e9`](https://github.com/equinor/fusion-framework/commit/a1524e9c4d83778da3db42dbcf99908b776a0592)]:
  - @equinor/fusion-query@5.1.1
  - @equinor/fusion-framework-module@4.3.3

## 5.0.8

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

- Updated dependencies [[`2f74edc`](https://github.com/equinor/fusion-framework/commit/2f74edcd4a3ea2b87d69f0fd63492145c3c01663), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`29ff796`](https://github.com/equinor/fusion-framework/commit/29ff796ebb3a643c604e4153b6798bde5992363c), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee), [`5e20ce1`](https://github.com/equinor/fusion-framework/commit/5e20ce17af709f0443b7110bfc952ff8d8d81dee)]:
  - @equinor/fusion-framework-module@4.3.2
  - @equinor/fusion-query@5.1.0

## 5.0.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@5.0.5

## 5.0.6

### Patch Changes

- Updated dependencies [[`1681940`](https://github.com/equinor/fusion-framework/commit/16819401db191321637fb2a17390abd98738c103)]:
  - @equinor/fusion-query@5.0.4

## 5.0.5

### Patch Changes

- Updated dependencies [[`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`fb424be`](https://github.com/equinor/fusion-framework/commit/fb424be24ad9349d01daef91a01c464d7b1413d2), [`6a81125`](https://github.com/equinor/fusion-framework/commit/6a81125ca856bbddbd1ec9e66a30e887cef93f66), [`cd737c2`](https://github.com/equinor/fusion-framework/commit/cd737c2f916747965ece46ed6f33fdadb776c90b)]:
  - @equinor/fusion-framework-module@4.3.1
  - @equinor/fusion-query@5.0.3

## 5.0.4

### Patch Changes

- Updated dependencies [[`bd3d3e1`](https://github.com/equinor/fusion-framework/commit/bd3d3e165b3cbcef8f2c7b3219d21387731e5995)]:
  - @equinor/fusion-query@5.0.2

## 5.0.3

### Patch Changes

- Updated dependencies [[`491c2e0`](https://github.com/equinor/fusion-framework/commit/491c2e05a2383dc7aa310f11ba6f7325a69e7197)]:
  - @equinor/fusion-query@5.0.1

## 5.0.2

### Patch Changes

- Updated dependencies [[`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2), [`b9c1643`](https://github.com/equinor/fusion-framework/commit/b9c164337d984e760d4701d1c534b14cb52aa7e2)]:
  - @equinor/fusion-query@5.0.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`f5e4090`](https://github.com/equinor/fusion-framework/commit/f5e4090fa285db8dc10e09b450cee5767437d883)]:
  - @equinor/fusion-query@4.2.0

## 5.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904), [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-module@4.3.0
  - @equinor/fusion-query@4.1.0

## 4.2.0

### Minor Changes

- [#1933](https://github.com/equinor/fusion-framework/pull/1933) [`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098) Thanks [@odinr](https://github.com/odinr)! - updated method for resolving context from path, will now search all path fragments for context id by default

  updated documentation of utility functions

### Patch Changes

- [#1933](https://github.com/equinor/fusion-framework/pull/1933) [`701c297`](https://github.com/equinor/fusion-framework/commit/701c29709351ff80864d26311efc72a439cd4098) Thanks [@odinr](https://github.com/odinr)! - Export of utility function for extracting context id from path

## 4.1.1

### Patch Changes

- [`7424ad3`](https://github.com/equinor/fusion-framework/commit/7424ad37760904b7897bcafc11d85235246e1381) Thanks [@odinr](https://github.com/odinr)! - added documentation

## 4.1.0

### Minor Changes

- [#1760](https://github.com/equinor/fusion-framework/pull/1760) [`6e6ee6b`](https://github.com/equinor/fusion-framework/commit/6e6ee6b7ce280820111e8b98ac8377efb15808ef) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - - Add FusionContextSearchError.

  - Potential _BREAKING_:
    - Error in `ContextProvider.ts` are now unwrapped if the thrown error is
      `QueryClientError`.

  ```diff
  index 114f430b1..2640c9a55 100644
  --- a/packages/modules/context/src/ContextProvider.ts
  +++ b/packages/modules/context/src/ContextProvider.ts
  @@ -406,7 +407,15 @@ export class ContextProvider implements IContextProvider {
                   /* @ts-ignore */
                   this.#contextParameterFn({ search, type: this.#contextType }),
               )
  -            .pipe(map((x) => x.value));
  +            .pipe(
  +                catchError((err) => {
  +                    if (err.name === 'QueryClientError') {
  +                        throw err.cause;
  +                    }
  +                    throw err;
  +                }),
  +                map((x) => x.value),
  +            );

           return this.#contextFilter ? query$.pipe(map(this.#contextFilter)) : query$;
       }
  ```

## 4.0.21

### Patch Changes

- Updated dependencies [[`152cf73`](https://github.com/equinor/fusion-framework/commit/152cf73d39eb32ccbaddaa6941e315c437c4972d)]:
  - @equinor/fusion-framework-module@4.2.7

## 4.0.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.6

## 4.0.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-query@4.0.5

## 4.0.18

### Patch Changes

- [#1601](https://github.com/equinor/fusion-framework/pull/1601) [`4ab2df5`](https://github.com/equinor/fusion-framework/commit/4ab2df5c83439f7fe3fe0846c005427e1793b576) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - add missing `graphic` and `meta` props

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module@4.2.6
  - @equinor/fusion-query@4.0.4

## 4.0.17

### Patch Changes

- Updated dependencies [[`446b63ce`](https://github.com/equinor/fusion-framework/commit/446b63ce44b59a3aaab4399c0d877d3a1b560a0e)]:
  - @equinor/fusion-query@4.0.3

## 4.0.16

### Patch Changes

- Updated dependencies [[`7ad31761`](https://github.com/equinor/fusion-framework/commit/7ad3176102f92da108b67ede6fdf29b76149bed9)]:
  - @equinor/fusion-query@4.0.2

## 4.0.15

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module@4.2.5
  - @equinor/fusion-query@4.0.1

## 4.0.14

### Patch Changes

- Updated dependencies [[`ebcabd0e`](https://github.com/equinor/fusion-framework/commit/ebcabd0e6945e1420a0a9a7d82bd9255da1b8578), [`8739a5a6`](https://github.com/equinor/fusion-framework/commit/8739a5a65d8aaa46ce9ef56cce013efeeb006e8a)]:
  - @equinor/fusion-query@4.0.0

## 4.0.13

### Patch Changes

- Updated dependencies [[`9076a498`](https://github.com/equinor/fusion-framework/commit/9076a49876e7a414a27557b7fb9095a67fe3a57f)]:
  - @equinor/fusion-framework-module@4.2.4
  - @equinor/fusion-query@3.0.7

## 4.0.12

### Patch Changes

- Updated dependencies [[`066d843c`](https://github.com/equinor/fusion-framework/commit/066d843c88cb974150f23f4fb9e7d0b066c93594)]:
  - @equinor/fusion-query@3.0.6

## 4.0.11

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1145](https://github.com/equinor/fusion-framework/pull/1145) [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump rxjs from 7.5.7 to [7.8.1](https://github.com/ReactiveX/rxjs/blob/7.8.1/CHANGELOG.md)

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-module@4.2.3
  - @equinor/fusion-query@3.0.5

## 4.0.10

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 4.0.9

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

## 4.0.8

### Patch Changes

- [#898](https://github.com/equinor/fusion-framework/pull/898) [`4551142e`](https://github.com/equinor/fusion-framework/commit/4551142ededdb2f1bf74eae552da26d28cd23057) Thanks [@odinr](https://github.com/odinr)! - feat(module-context): add config option for connection to parent context

  - add attribute to config interface
  - add setter on config builder
  - add check for connecting to parent when creating provider

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.6...@equinor/fusion-framework-module-context@4.0.7) (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 4.0.6 (2023-05-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [4.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.4...@equinor/fusion-framework-module-context@4.0.5) (2023-05-12)

### Bug Fixes

- **module-context:** skip internal context queue when settting context internally ([79ed276](https://github.com/equinor/fusion-framework/commit/79ed2767e7742a4133223546ca20fa0a99db6d96))

## [4.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.3...@equinor/fusion-framework-module-context@4.0.4) (2023-05-11)

### Bug Fixes

- **module-context:** make clearCurrentContext await set context queue ([30f11fb](https://github.com/equinor/fusion-framework/commit/30f11fb0aa3204aac95718b69cca81bd1d24d983))

## [4.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.2...@equinor/fusion-framework-module-context@4.0.3) (2023-05-11)

### Bug Fixes

- **module-context:** execute all setting of context ([eb85c0c](https://github.com/equinor/fusion-framework/commit/eb85c0c239ec70edeb796b2f03b6ecd4c2fb9fb5)), closes [/github.com/equinor/fusion-framework/blob/3cd1a9e01c56fc9afb72f2df474a7b066b4215c4/packages/modules/context/src/ContextProvider.ts#L181](https://github.com/equinor//github.com/equinor/fusion-framework/blob/3cd1a9e01c56fc9afb72f2df474a7b066b4215c4/packages/modules/context/src/ContextProvider.ts/issues/L181)

## 4.0.2 (2023-05-10)

### Bug Fixes

- **module-context:** only skip first context item if not resolved ([cea6fce](https://github.com/equinor/fusion-framework/commit/cea6fcefd4853dcfbedf0d65d83cac7ac1b26523))

## [4.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@4.0.0...@equinor/fusion-framework-module-context@4.0.1) (2023-05-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [4.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.1.2...@equinor/fusion-framework-module-context@4.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

- **module-context:** current context can now be `null`
- **module-context:** skipInitialContext is now removed
- **module-context:** `ContextProvider.setCurrentContext` now returns an `Observable`

### Features

- **module-context:** add utils ([741774d](https://github.com/equinor/fusion-framework/commit/741774d0459c80c0f53f2030e13c7683c57359ce))
- **module-context:** allow connect tp parent context provider ([2d2a312](https://github.com/equinor/fusion-framework/commit/2d2a312a214d3b2c26fb2496af395976b0681b18))
- **module-context:** allow resolving of initial context ([b0713f3](https://github.com/equinor/fusion-framework/commit/b0713f3ff7d74e39d6a2d585bd2d95beaba7bc1c))
- **module-context:** dispose context client ([dd4203b](https://github.com/equinor/fusion-framework/commit/dd4203b50713079729be13876514e87184cbe84f))
- **module-context:** explicit `null` when context is cleared ([03738e7](https://github.com/equinor/fusion-framework/commit/03738e7a5ce75d1da322b2f34c511022f89e5aea))
- **module-context:** make setting context as an observable ([21e1c6b](https://github.com/equinor/fusion-framework/commit/21e1c6b64f541ec63dd6ea830410c7bb5cbdd84a))

### Bug Fixes

- **module-context:** expose resolve context async ([cff1cd8](https://github.com/equinor/fusion-framework/commit/cff1cd82a3a0d57513d9245d1289fc481bfac9e0))
- **module-context:** extract cause from query ([b04090c](https://github.com/equinor/fusion-framework/commit/b04090cef3184dda1db7f899939b8c223f290be5))
- **module-context:** fix index of context path ([38c89cf](https://github.com/equinor/fusion-framework/commit/38c89cfcc0d809d2ea27a8f388546ab4315fd010))
- **module-context:** fix parameters for resolving context from parent ([65eb101](https://github.com/equinor/fusion-framework/commit/65eb10159ee3bae8be53994112cac8244a315b28))
- **react-legacy-interopt:** fix initial context url ([31f113a](https://github.com/equinor/fusion-framework/commit/31f113aebc2ad09e6a446997e95ecfeef3da2fff))

## 3.1.2 (2023-04-24)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 3.1.1 (2023-04-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [3.1.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.0.2...@equinor/fusion-framework-module-context@3.1.0) (2023-04-17)

### Features

- **context:** add events for context validation|resolve failed ([dc413f0](https://github.com/equinor/fusion-framework/commit/dc413f0fe52b49349d7e07619950e96c523bb3eb))

## [3.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.0.1...@equinor/fusion-framework-module-context@3.0.2) (2023-04-17)

### Bug Fixes

- **context:** skip clearing context ([d4032b7](https://github.com/equinor/fusion-framework/commit/d4032b78b21d123e67cc7dadc50a65071d976b94))

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@3.0.0...@equinor/fusion-framework-module-context@3.0.1) (2023-04-17)

### Bug Fixes

- **context:** handle promise rejection of setting context ([96a0054](https://github.com/equinor/fusion-framework/commit/96a0054f6b4e9f3250a2b09493efabe96bf1e2ba))

## 3.0.0 (2023-04-16)

### Features

- **modules/context:** resolve related context ([0e92583](https://github.com/equinor/fusion-framework/commit/0e925837a4f2651ff9f2a003d13731f6d866412d))

## 2.0.15 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.14 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.13 (2023-04-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.12 (2023-04-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.10...@equinor/fusion-framework-module-context@2.0.11) (2023-03-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.10 (2023-03-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.9 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.7...@equinor/fusion-framework-module-context@2.0.8) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.7 (2023-03-20)

### Bug Fixes

- **module-context:** recursive subscribe on setCurrentContext and equal comparison ([3fe58d4](https://github.com/equinor/fusion-framework/commit/3fe58d44af770c41f5f8ea6169892318dcd35cc0))

## [2.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.5...@equinor/fusion-framework-module-context@2.0.6) (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.4...@equinor/fusion-framework-module-context@2.0.5) (2023-02-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.3...@equinor/fusion-framework-module-context@2.0.4) (2023-02-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@2.0.2...@equinor/fusion-framework-module-context@2.0.3) (2023-02-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.2 (2023-02-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.8...@equinor/fusion-framework-module-context@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.8...@equinor/fusion-framework-module-context@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.2.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.7...@equinor/fusion-framework-module-context@1.2.8) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.7 (2023-01-19)

### Bug Fixes

- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## [1.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.5...@equinor/fusion-framework-module-context@1.2.6) (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.4...@equinor/fusion-framework-module-context@1.2.5) (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.4 (2023-01-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.3 (2023-01-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.2 (2022-12-16)

### Bug Fixes

- **module-context:** import paths ([00df4e0](https://github.com/equinor/fusion-framework/commit/00df4e04b59b8b5e7ac124cdfc726ff3e7b0f5d2))

## [1.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.2.0...@equinor/fusion-framework-module-context@1.2.1) (2022-12-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 1.2.0 (2022-12-13)

### Features

- **module-context:** add `clearContext` ([f214714](https://github.com/equinor/fusion-framework/commit/f21471479f92fb6f12f88211429d846272d6cffb))

## [1.1.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.9...@equinor/fusion-framework-module-context@1.1.10) (2022-12-12)

### Bug Fixes

- **context:** method for contextParameterFn on enableContext ([398658d](https://github.com/equinor/fusion-framework/commit/398658de26355a8ca99aea291963b8c302df3ddc))
- linting issues fixed ([2e62877](https://github.com/equinor/fusion-framework/commit/2e628770754b40425e97c7be2ec770824c42c6ff))

## [1.1.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.8...@equinor/fusion-framework-module-context@1.1.9) (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.7...@equinor/fusion-framework-module-context@1.1.8) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.6...@equinor/fusion-framework-module-context@1.1.7) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.5...@equinor/fusion-framework-module-context@1.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.4...@equinor/fusion-framework-module-context@1.1.5) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.3...@equinor/fusion-framework-module-context@1.1.4) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.0...@equinor/fusion-framework-module-context@1.1.3) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.1...@equinor/fusion-framework-module-context@1.1.2) (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@1.1.0...@equinor/fusion-framework-module-context@1.1.1) (2022-12-05)

### Bug Fixes

- **module-context:** update ContextItem interface ([7368fb0](https://github.com/equinor/fusion-framework/commit/7368fb08015e07cce54d30109462f36a64188d25))

## 1.1.0 (2022-12-05)

### Features

- **contextselector:** cli context selector ([f414466](https://github.com/equinor/fusion-framework/commit/f4144668e4deee32ed229807d81a0ea08ba5a476))

## 1.0.1 (2022-12-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.11...@equinor/fusion-framework-module-context@1.0.0) (2022-12-02)

### Features

- **module-context:** simplify context config ([d77c665](https://github.com/equinor/fusion-framework/commit/d77c6656d02f0a241ea685ae2595dda9b21420e4))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.11...@equinor/fusion-framework-module-context@1.0.0-alpha.0) (2022-12-02)

### Features

- **module-context:** simplify context config ([3b3caa9](https://github.com/equinor/fusion-framework/commit/3b3caa9374b21bb17998d78e6858880489d2e61a))

## [0.6.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.10...@equinor/fusion-framework-module-context@0.6.11) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.9...@equinor/fusion-framework-module-context@0.6.10) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.8...@equinor/fusion-framework-module-context@0.6.9) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.7...@equinor/fusion-framework-module-context@0.6.8) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.6...@equinor/fusion-framework-module-context@0.6.7) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.5...@equinor/fusion-framework-module-context@0.6.6) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.4...@equinor/fusion-framework-module-context@0.6.5) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.3...@equinor/fusion-framework-module-context@0.6.4) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.2...@equinor/fusion-framework-module-context@0.6.3) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.1...@equinor/fusion-framework-module-context@0.6.2) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.6.0...@equinor/fusion-framework-module-context@0.6.1) (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.6.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.5.3...@equinor/fusion-framework-module-context@0.6.0) (2022-12-01)

### Features

- **query:** separate query from observable ([1408609](https://github.com/equinor/fusion-framework/commit/140860976c3ee9430a30deebcc8b08da857e5772))

## 0.5.3 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.5.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.5.1...@equinor/fusion-framework-module-context@0.5.2) (2022-11-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.5.1 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.5.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.4.1...@equinor/fusion-framework-module-context@0.5.0) (2022-11-16)

### Features

- **module-context:** allow query filter ([1a89ee5](https://github.com/equinor/fusion-framework/commit/1a89ee57277af3853ce802da9b5e0956bff8ceaa))

## 0.4.1 (2022-11-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.4.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.3.4...@equinor/fusion-framework-module-context@0.4.0) (2022-11-14)

### Features

- update packages to use observable ([98024aa](https://github.com/equinor/fusion-framework/commit/98024aa466c68f03bd793bd564cf7b6bf65def72))

## 0.3.4 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.3.3 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.3.2 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.3.0...@equinor/fusion-framework-module-context@0.3.1) (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.3.0 (2022-11-02)

### Features

- **module-context:** expose current context from client on provider ([6895056](https://github.com/equinor/fusion-framework/commit/68950561d5b3fce3c555842c8d26004387a963e1))

### Bug Fixes

- **module-context:** expose provider ([1fd2c5a](https://github.com/equinor/fusion-framework/commit/1fd2c5ae8a486a7c9b9933ffcb37918dfa3ac4b0))
- **module-context:** fix relative import ([da23b68](https://github.com/equinor/fusion-framework/commit/da23b6836739de1dda27c84b18083feff5c4055b))

## [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.4...@equinor/fusion-framework-module-context@0.2.0) (2022-11-02)

### Features

- **module-context:** connect context module to parent ([6f1158f](https://github.com/equinor/fusion-framework/commit/6f1158f089fee8d9350875b20cba61f52886ee7a))

## [0.1.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.3...@equinor/fusion-framework-module-context@0.1.4) (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.2...@equinor/fusion-framework-module-context@0.1.3) (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.1.2 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## [0.1.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-context@0.1.0...@equinor/fusion-framework-module-context@0.1.1) (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-context

## 0.1.0 (2022-10-26)

### Features

- **context:** create initial context module ([c530b6a](https://github.com/equinor/fusion-framework/commit/c530b6a92f5d01c82a2b2157f819329615796e59))

# Change Log

## 8.0.4

### Patch Changes

- Updated dependencies [[`e164abc`](https://github.com/equinor/fusion-framework/commit/e164abcf52ff84d181ed5406d2a28441d54da9a8)]:
  - @equinor/fusion-framework-module-http@6.2.4

## 8.0.3

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237), [`8c6c598`](https://github.com/equinor/fusion-framework/commit/8c6c598fce973f9c24426d5e108cc3301d2da139), [`fdd057e`](https://github.com/equinor/fusion-framework/commit/fdd057e0920ffb93e07b6338e3ff592a65dabbc6)]:
  - @equinor/fusion-framework-react-module@3.1.8
  - @equinor/fusion-framework-module-http@6.2.3

## 8.0.2

### Patch Changes

- Updated dependencies [[`ba5d12e`](https://github.com/equinor/fusion-framework/commit/ba5d12eba0a38db412353765e997d02c1fbb478d), [`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-module-http@6.2.2
  - @equinor/fusion-framework-react-module@3.1.7

## 8.0.1

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@6.2.1

## 8.0.0

### Patch Changes

- Updated dependencies [[`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51), [`73af73e`](https://github.com/equinor/fusion-framework/commit/73af73e5582ca27b132210af8ba308b80e036d51)]:
  - @equinor/fusion-framework-module-http@6.2.0

## 7.0.0

### Patch Changes

- Updated dependencies [[`c776845`](https://github.com/equinor/fusion-framework/commit/c776845e753acf4a0bceda1c59d31e5939c44c31)]:
  - @equinor/fusion-framework-module-http@6.1.0
  - @equinor/fusion-framework-react-module@3.1.6

## 6.0.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@6.0.3
  - @equinor/fusion-framework-react-module@3.1.5

## 6.0.2

### Patch Changes

- Updated dependencies [[`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb)]:
  - @equinor/fusion-framework-module-http@6.0.2
  - @equinor/fusion-framework-react-module@3.1.4

## 6.0.1

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

- Updated dependencies [[`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`788d0b9`](https://github.com/equinor/fusion-framework/commit/788d0b93edc25e5b682d88c58614560c204c1af9), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-module-http@6.0.1
  - @equinor/fusion-framework-react-module@3.1.3

## 6.0.0

### Patch Changes

- Updated dependencies [[`1e60919`](https://github.com/equinor/fusion-framework/commit/1e60919e83fb65528c88f604d7bd43299ec412e1), [`ba2379b`](https://github.com/equinor/fusion-framework/commit/ba2379b177f23ccc023894e36e50d7fc56c929c8)]:
  - @equinor/fusion-framework-module-http@6.0.0

## 5.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.2.3
  - @equinor/fusion-framework-react-module@3.1.2

## 5.0.3

### Patch Changes

- Updated dependencies [[`fab2d22`](https://github.com/equinor/fusion-framework/commit/fab2d22f56772c02b1c1e5688cea1dd376edfcb3)]:
  - @equinor/fusion-framework-module-http@5.2.2

## 5.0.2

### Patch Changes

- Updated dependencies [[`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee), [`4af517f`](https://github.com/equinor/fusion-framework/commit/4af517f107f960aa1dc7459451d99e2e83d350ee)]:
  - @equinor/fusion-framework-module-http@5.2.1

## 5.0.1

### Patch Changes

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-react-module@3.1.1

## 5.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-react-module@3.1.0
  - @equinor/fusion-framework-module-http@5.2.0

## 4.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.1.6
  - @equinor/fusion-framework-react-module@3.0.8

## 4.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.1.5

## 4.0.4

### Patch Changes

- Updated dependencies [[`1e4ba77`](https://github.com/equinor/fusion-framework/commit/1e4ba7707d3ce5cfd9c8d6673f760523aa47a45e)]:
  - @equinor/fusion-framework-module-http@5.1.4

## 4.0.3

### Patch Changes

- [`cce198d`](https://github.com/equinor/fusion-framework/commit/cce198d6a91fb7912265d4383246dc405cf17a17) Thanks [@odinr](https://github.com/odinr)! - export http errors from `@equinor/fusion-framework-module-http/errors`

- [#1623](https://github.com/equinor/fusion-framework/pull/1623) [`f85316f`](https://github.com/equinor/fusion-framework/commit/f85316f2344258896a77ef602bd4047dfa553788) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - Fix package exports in react-module-http

- Updated dependencies [[`0af3540`](https://github.com/equinor/fusion-framework/commit/0af3540340bac85a19ca3a8ec4e0ccd42b3090ee)]:
  - @equinor/fusion-framework-module-http@5.1.3

## 4.0.2

### Patch Changes

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-http@5.1.2
  - @equinor/fusion-framework-react-module@3.0.7

## 4.0.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-http@5.1.1
  - @equinor/fusion-framework-react-module@3.0.6

## 4.0.0

### Patch Changes

- Updated dependencies [[`8e9e34a0`](https://github.com/equinor/fusion-framework/commit/8e9e34a06a6905d092ad8ca3f9330a3699da20fa)]:
  - @equinor/fusion-framework-module-http@5.1.0

## 3.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-http@5.0.6
  - @equinor/fusion-framework-react-module@3.0.5

## 3.0.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- [#1125](https://github.com/equinor/fusion-framework/pull/1125) [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump react and @types/react to react 18.2

  only dev deps updated should not affect any consumers

  see [react changelog](https://github.com/facebook/react/releases) for details

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272), [`52d98701`](https://github.com/equinor/fusion-framework/commit/52d98701627e93c7284c0b9a5bfd8dab1da43bd3)]:
  - @equinor/fusion-framework-react-module@3.0.4
  - @equinor/fusion-framework-module-http@5.0.5

## 3.0.3

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

  - align all versions of typescript
  - update types to build
    - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 3.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 3.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 2.0.4 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [2.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@2.0.2...@equinor/fusion-framework-react-module-http@2.0.3) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 2.0.2 (2023-02-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 2.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [2.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.1.9...@equinor/fusion-framework-react-module-http@2.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [2.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.1.9...@equinor/fusion-framework-react-module-http@2.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.9 (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.8 (2023-01-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.7 (2022-12-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.1.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.1.5...@equinor/fusion-framework-react-module-http@1.1.6) (2022-12-08)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.5 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.4 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.3 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.2 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.1 (2022-11-18)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.1.0 (2022-11-17)

### Features

- update typing of useModule hook ([958dd04](https://github.com/equinor/fusion-framework/commit/958dd0401667e9ebb1a51bced128ae43369cd6c4))

## 1.0.19 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.18 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.17 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.16 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.15 (2022-11-01)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.11...@equinor/fusion-framework-react-module-http@1.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.10 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.8...@equinor/fusion-framework-react-module-http@1.0.9) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.8 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.7 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.5...@equinor/fusion-framework-react-module-http@1.0.6) (2022-09-16)

### Bug Fixes

- **module-http:** improve hierarchy ([3603347](https://github.com/equinor/fusion-framework/commit/36033474991288983490f250726a551f7ce3dcbd))

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.4...@equinor/fusion-framework-react-module-http@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.3...@equinor/fusion-framework-react-module-http@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.2...@equinor/fusion-framework-react-module-http@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.1...@equinor/fusion-framework-react-module-http@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.1-next.1...@equinor/fusion-framework-react-module-http@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.1-next.0...@equinor/fusion-framework-react-module-http@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@1.0.0...@equinor/fusion-framework-react-module-http@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 1.0.0 (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@0.1.3...@equinor/fusion-framework-react-module-http@1.0.0-alpha.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [0.1.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@0.1.2...@equinor/fusion-framework-react-module-http@0.1.3) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## [0.1.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-http@0.1.1...@equinor/fusion-framework-react-module-http@0.1.2) (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 0.1.1 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-http

## 0.1.0 (2022-09-05)

### Features

- **rect-module-http:** create hook for using http client ([7a88b7a](https://github.com/equinor/fusion-framework/commit/7a88b7aeb246bc37c3a10927beaa2ec48f8515fc))

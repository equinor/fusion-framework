# Change Log

## 4.0.0-next.1

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab)]:
  - @equinor/fusion-framework-react-module@4.0.0-next.1
  - @equinor/fusion-framework-module-signalr@10.0.0-next.1

## 4.0.0-next.0

### Major Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`9f7597e`](https://github.com/equinor/fusion-framework/commit/9f7597ee237ef069dc24cbe39c73b5b26db157dd) Thanks [@odinr](https://github.com/odinr)! - Require React 18+ as peer dependency. React 17 is no longer supported.

  **Migration:** Update your application to React 18+ to continue using these packages.

  Closes https://github.com/equinor/fusion-framework/issues/3504

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`75c068f`](https://github.com/equinor/fusion-framework/commit/75c068fea13c32435ac26bd9043cc156482bfaf1) Thanks [@odinr](https://github.com/odinr)! - Upgrade to React 19 and remove support for React versions lower than 18.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React 16 and 17 are no longer supported
  - Dev dependencies upgraded to React 19.2.1 and @types/react 19.2.7

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading these packages
  - If using React 16 or 17, upgrade to React 18 or 19 first

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8), [`9f7597e`](https://github.com/equinor/fusion-framework/commit/9f7597ee237ef069dc24cbe39c73b5b26db157dd), [`75c068f`](https://github.com/equinor/fusion-framework/commit/75c068fea13c32435ac26bd9043cc156482bfaf1)]:
  - @equinor/fusion-framework-react-module@4.0.0-next.0
  - @equinor/fusion-framework-module-signalr@10.0.0-next.0

## 3.0.35

### Patch Changes

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-signalr@9.0.0

## 3.0.34

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@8.0.0

## 3.0.33

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@7.0.0
  - @equinor/fusion-framework-react-module@3.1.13

## 3.0.32

### Patch Changes

- [#3088](https://github.com/equinor/fusion-framework/pull/3088) [`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d) Thanks [@eikeland](https://github.com/eikeland)! - chore: update package typesVersions
  - Updated package.json typesVersions.
  - Ensures backward compatibility with older node versions.
  - Ensured consistency with workspace and repository configuration.

- Updated dependencies [[`7441b13`](https://github.com/equinor/fusion-framework/commit/7441b13aa50dd7362d1629086a27b6b4e571575d)]:
  - @equinor/fusion-framework-module-signalr@6.0.5

## 3.0.31

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@6.0.4

## 3.0.30

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@6.0.3

## 3.0.29

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@6.0.2
  - @equinor/fusion-framework-react-module@3.1.12

## 3.0.28

### Patch Changes

- [#3054](https://github.com/equinor/fusion-framework/pull/3054) [`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add typesVersions from package.json files

- Updated dependencies [[`c6af3a3`](https://github.com/equinor/fusion-framework/commit/c6af3a3c926fb245e9d056b506d47b8bf4f1efde)]:
  - @equinor/fusion-framework-module-signalr@6.0.1
  - @equinor/fusion-framework-react-module@3.1.11

## 3.0.27

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@6.0.0
  - @equinor/fusion-framework-react-module@3.1.10

## 3.0.26

### Patch Changes

- [#3012](https://github.com/equinor/fusion-framework/pull/3012) [`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43) Thanks [@odinr](https://github.com/odinr)! - removed `typesVersions` from packages, since we no longer support TS < 4.7, also corrected `types` path in package.json

- Updated dependencies [[`f53b60b`](https://github.com/equinor/fusion-framework/commit/f53b60b7805706ce7617e614f0ac0c24317a2e43)]:
  - @equinor/fusion-framework-module-signalr@5.0.5
  - @equinor/fusion-framework-react-module@3.1.9

## 3.0.25

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@5.0.4

## 3.0.24

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@5.0.3

## 3.0.23

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

- Updated dependencies [[`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237)]:
  - @equinor/fusion-framework-react-module@3.1.8
  - @equinor/fusion-framework-module-signalr@5.0.2

## 3.0.22

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

- Updated dependencies [[`811f1a0`](https://github.com/equinor/fusion-framework/commit/811f1a0139ff4d1b0c3fba1ec2b77cc84ba080d1), [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d)]:
  - @equinor/fusion-framework-react-module@3.1.7
  - @equinor/fusion-framework-module-signalr@5.0.1

## 3.0.21

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@5.0.0

## 3.0.20

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@4.0.5

## 3.0.19

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@4.0.4

## 3.0.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@4.0.3

## 3.0.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@4.0.2

## 3.0.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@4.0.1

## 3.0.15

### Patch Changes

- Updated dependencies [[`15152e4`](https://github.com/equinor/fusion-framework/commit/15152e413c054a5f57af93211a470c98c7696caa)]:
  - @equinor/fusion-framework-module-signalr@4.0.0
  - @equinor/fusion-framework-react-module@3.1.6

## 3.0.14

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.13

## 3.0.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.12
  - @equinor/fusion-framework-react-module@3.1.5

## 3.0.12

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.11
  - @equinor/fusion-framework-react-module@3.1.4

## 3.0.11

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

- Updated dependencies [[`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1), [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee)]:
  - @equinor/fusion-framework-react-module@3.1.3
  - @equinor/fusion-framework-module-signalr@3.0.10

## 3.0.10

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.9

## 3.0.9

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.8

## 3.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.7
  - @equinor/fusion-framework-react-module@3.1.2

## 3.0.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.6

## 3.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.5

## 3.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.4

## 3.0.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.3

## 3.0.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.2

## 3.0.2

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@3.0.1

## 3.0.1

### Patch Changes

- [#1981](https://github.com/equinor/fusion-framework/pull/1981) [`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc) Thanks [@eikeland](https://github.com/eikeland)! - Align package exports with node10+ documentation.

- Updated dependencies [[`3d068b5`](https://github.com/equinor/fusion-framework/commit/3d068b5a7b214b62fcae5546f08830ea90f872dc)]:
  - @equinor/fusion-framework-react-module@3.1.1

## 3.0.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

### Patch Changes

- Updated dependencies [[`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904)]:
  - @equinor/fusion-framework-react-module@3.1.0
  - @equinor/fusion-framework-module-signalr@3.0.0

## 2.0.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.19
  - @equinor/fusion-framework-react-module@3.0.8

## 2.0.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.18

## 2.0.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.17

## 2.0.15

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.16

## 2.0.14

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.15

## 2.0.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.14

## 2.0.12

### Patch Changes

- Updated dependencies [[`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125)]:
  - @equinor/fusion-framework-module-signalr@2.0.13
  - @equinor/fusion-framework-react-module@3.0.7

## 2.0.11

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.12

## 2.0.10

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.11

## 2.0.9

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

- Updated dependencies [[`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc)]:
  - @equinor/fusion-framework-module-signalr@2.0.10
  - @equinor/fusion-framework-react-module@3.0.6

## 2.0.8

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.9

## 2.0.7

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.8

## 2.0.6

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.7
  - @equinor/fusion-framework-react-module@3.0.5

## 2.0.5

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-signalr@2.0.6

## 2.0.4

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

  conflicts of `@types/react` made random outcomes when using `yarn`

  this change should not affect consumer of the packages, but might conflict dependent on local package manager.

- Updated dependencies [[`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862), [`2dccccd1`](https://github.com/equinor/fusion-framework/commit/2dccccd124fbe3cdde2132c29c27d3da9fc6f1f5), [`d276fc5d`](https://github.com/equinor/fusion-framework/commit/d276fc5d514566d05c64705076a1cb91c6a44272)]:
  - @equinor/fusion-framework-react-module@3.0.4
  - @equinor/fusion-framework-module-signalr@2.0.5

## 2.0.3

### Patch Changes

- d8a439f0: chore(signalr): update peer deps
- Updated dependencies [d8a439f0]
  - @equinor/fusion-framework-module-signalr@2.0.3

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.0.2 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## 2.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## 2.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## 1.0.3 (2023-03-22)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-signalr@1.0.1...@equinor/fusion-framework-react-module-signalr@1.0.2) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## 1.0.1 (2023-01-30)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## [1.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-signalr@0.1.0...@equinor/fusion-framework-react-module-signalr@1.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-react-module-signalr@0.1.0...@equinor/fusion-framework-react-module-signalr@1.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-react-module-signalr

## 0.1.0 (2023-01-26)

### Features

- initial code for signalr-module and react-signalr ([c385ee2](https://github.com/equinor/fusion-framework/commit/c385ee2eca6ee58d87e2de955c43c2b75212efe4))
- **react-module-signalr:** create a hook for creating topic on a provider ([b4c1fd5](https://github.com/equinor/fusion-framework/commit/b4c1fd5c35b8b570380201a87a5142b617730a00))
- **react-module-signalr:** expose cjs module ([a0c9b52](https://github.com/equinor/fusion-framework/commit/a0c9b52bd5f05e5419267ff05e6d533b5ea98bcb))
- **react-module-signalr:** improve hook for using SignalR topic ([7eb511f](https://github.com/equinor/fusion-framework/commit/7eb511fb7a3f603aa418e5dfa969bea3b175d41c))

### Bug Fixes

- **react-module-signalr:** resolve circular ref ([f34086d](https://github.com/equinor/fusion-framework/commit/f34086d1710f2a3494feb19dd09079f66a1b5d63))

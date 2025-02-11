# Change Log

## 33.0.1

### Patch Changes

- [#2802](https://github.com/equinor/fusion-framework/pull/2802) [`6277eef`](https://github.com/equinor/fusion-framework/commit/6277eefe89444fee150f01c11b1d01348e024ca3) Thanks [@odinr](https://github.com/odinr)! - - Updated `README.md` with detailed documentation for the AG Grid React for Fusion Framework, including installation, configuration, theming, customizing a grid instance, and upgrading from version 32 to 33.

    - Refactor: `package.json` to include peer dependencies for `ag-grid-community` and `ag-grid-enterprise`.
    - Fixed: `AgGridConfigurator` class to setting the license key on initialization.
    - Refactor: import statements to use `ag-grid-enterprise` and `ag-grid-community`.
    - Feature: Added `createThemeFromExistingTheme` function to decontruct an existing theme and create a new theme _(AG-Grid type checks with `instanceof` which will break since the parent scope has another instance than the consumer)._

    We have chose to only `patch` this release, to conform with the AG Grid versioning scheme, event tho there are some breaking changes. This is because the breaking changes are not related to the API of the module itself, but rather to the dependencies of the module.

    - `@equinor/fusion-framework-module-ag-grid/enterprise` and `@equinor/fusion-framework-module-ag-grid/community` have been removed. Instead, the module now relies on the `ag-grid-enterprise` and `ag-grid-community` packages as peer dependencies. This means that you will have to install these packages yourself.

## 33.0.0

### Major Changes

- [#2687](https://github.com/equinor/fusion-framework/pull/2687) [`22219ab`](https://github.com/equinor/fusion-framework/commit/22219ab3c07b5578c48a012632fe16d9a823a3bf) Thanks [@odinr](https://github.com/odinr)! - Enhanced the AG Grid module with new functionalities and improvements.

    - Added TypeScript type definitions for better type support.
    - Introduced new exports for `community`, `enterprise`, and `themes`.
    - Implemented `AgGridConfigurator` and `AgGridProvider` classes for better configuration and initialization.
    - Added support for setting and clearing themes, managing modules, and setting license keys.
    - Updated the `module.ts` to use the new configurator and provider classes.
    - Removed deprecated files and refactored the module structure for better maintainability.

    **Detailed Changes:**

    - **package.json**: Updated dependencies and added new exports.
    - **AgGridConfigurator.interface.ts**: Defined the interface for configuring AG Grid settings and modules.
    - **AgGridConfigurator.ts**: Implemented the `AgGridConfigurator` class for managing AG Grid configuration.
    - **AgGridProvider.ts**: Implemented the `AgGridProvider` class for providing AG Grid configuration.
    - **community.ts**: Exported all from `ag-grid-community`.
    - **default-modules.ts**: Added a placeholder for default modules.
    - **enterprise.ts**: Exported all from `ag-grid-enterprise`.
    - **index.ts**: Updated exports to use the new configurator and provider.
    - **module.ts**: Refactored to use the new configurator and provider classes.
    - **themes.ts**: Added a default theme for AG Grid.

    **Breaking Changes:**

    - `@ag-grid-community/*` and `@ag-grid-enterprise/*` must be removed from the project dependencies.
    - The new configurator no longer supports setting license keys directly. Use the `setLicense` function to set license keys.
    - Modules are now managed through the `AgGridConfigurator` class. Use the `setModule` or `addModule` function to set/add modules to the configuration.

    **References:**

    - [AG Grid 33 Migration Guide](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/)
    - [AG Grid Documentation](https://www.ag-grid.com/)
    - [AG Grid Theme Builder](https://www.ag-grid.com/theme-builder/)

## 32.3.0

### Minor Changes

- [#2532](https://github.com/equinor/fusion-framework/pull/2532) [`850ffee`](https://github.com/equinor/fusion-framework/commit/850ffee7b84aaaf43e63fd3691177c72ec031e7e) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump the ag-grid to 32.3

## 32.2.0

### Minor Changes

- [#2467](https://github.com/equinor/fusion-framework/pull/2467) [`94659b2`](https://github.com/equinor/fusion-framework/commit/94659b2d8b350089841091a88754ca44b488acd2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated Ag Grid to 32.1.0

## 32.1.1

### Patch Changes

- [#2442](https://github.com/equinor/fusion-framework/pull/2442) [`80cc4e9`](https://github.com/equinor/fusion-framework/commit/80cc4e95a8f2dd8e8aae9752412faefdb457e9e2) Thanks [@odinr](https://github.com/odinr)! - Fixed reference check in navigation module and ag-grid module.

    hotfix for [PR-2425](https://github.com/equinor/fusion-framework/pull/2425)

## 32.1.0

### Minor Changes

- [#2377](https://github.com/equinor/fusion-framework/pull/2377) [`401a10c`](https://github.com/equinor/fusion-framework/commit/401a10c2cfc13c73f874a40cf51c0f722ef2f629) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump AG Grid from 32.0.2 to 32.1.0

## 32.0.1

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

## 32.0.0

### Major Changes

- [#2314](https://github.com/equinor/fusion-framework/pull/2314) [`c416233`](https://github.com/equinor/fusion-framework/commit/c41623333a0f0b2be1bd3567b383f3ee5ca6fdbd) Thanks [@dependabot](https://github.com/apps/dependabot)! - # Upgrading to AG Grid 32 for React

    ## Summary

    AG Grid 32 introduces several new features and improvements for React applications, along with some breaking changes that developers need to be aware of when upgrading.

    ## Key Breaking Changes

    1. **Removal of deprecated APIs**
        - Several deprecated APIs have been removed, including some related to row models, column definitions, and grid options.
    2. **Changes to default behavior**
        - The default for `suppressMenuHide` is now `true`.
        - `applyColumnDefOrder` now defaults to `true`.
    3. **Typing changes**
        - Some TypeScript interfaces have been updated or removed, which may require code adjustments.
    4. **Removal of Internet Explorer 11 support**
        - AG Grid no longer supports Internet Explorer 11.
    5. **Changes to CSS classes**
        - Some CSS classes have been renamed or removed, which may affect custom styling.
    6. **Adjustments to event parameters**
        - Certain events now have different parameter structures.
    7. **Modifications to API methods**
        - Some API methods have been changed or removed.

    When upgrading to AG Grid 32, it's important to review the [full changelog](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-32/?ref=blog.ag-grid.com) and test your application thoroughly to ensure compatibility with the new version.
    The AG Grid team provides codemods to assist with some of the migration tasks, which can help automate parts of the upgrade process.

## 31.3.0

### Minor Changes

- [#2207](https://github.com/equinor/fusion-framework/pull/2207) [`cc6b519`](https://github.com/equinor/fusion-framework/commit/cc6b519df0903c570e7ed2f4af9b8e5cf8d1fc7d) Thanks [@odinr](https://github.com/odinr)! - Updated the `@ag-grid-enterprise/core` dependency to version `~31.3.2`. This is a patch version bump.

    **Sticky Group Total and Grand Total Rows**: Group and grand total rows can now be displayed as sticky rows at the top or bottom of the grid, making it easier to track total values in large datasets.

    **Theme Builder**: A new powerful styling tool that allows users to easily build highly-customized themes for AG Grid using presets and visual configurations.

    **Skeleton Content in Loading Grid Cells**: Skeleton loading placeholders are now displayed in grid cells while data is being loaded, providing a better user experience.

    **Background Image in Excel Exports**: Users can now add a background image to Excel files exported from AG Grid.

    **Global Grid Options**: A new feature that allows users to apply global configuration options to all AG Grid instances in their application.

    **Accessibility Improvements**: AG Grid 31.3 includes enhancements to keyboard navigation and overall accessibility support.

    [see full release note](https://blog.ag-grid.com/whats-new-in-ag-grid-31-3/)

## 31.2.1

### Patch Changes

- [#2037](https://github.com/equinor/fusion-framework/pull/2037) [`20d929f`](https://github.com/equinor/fusion-framework/commit/20d929f87e6b68e1d1df0de114dd46583502a871) Thanks [@odinr](https://github.com/odinr)! - updated @ag-grid-enterprise/core to 31.2.0

## 31.2.0

### Minor Changes

- [#1953](https://github.com/equinor/fusion-framework/pull/1953) [`f3ae28d`](https://github.com/equinor/fusion-framework/commit/f3ae28dc6d1d5043605e07e2cd2e83ae799cd904) Thanks [@odinr](https://github.com/odinr)! - updated typescript to 5.4.2

## 31.1.0

### Minor Changes

- [#1885](https://github.com/equinor/fusion-framework/pull/1885) [`d6dbb5f`](https://github.com/equinor/fusion-framework/commit/d6dbb5fdeb683c64131de16fa79f3e714a7f552b) Thanks [@odinr](https://github.com/odinr)! - bumped ag-grid from 31.0.3 to 31.1.1

## 31.0.1

### Patch Changes

- [#1650](https://github.com/equinor/fusion-framework/pull/1650) [`36d18d5`](https://github.com/equinor/fusion-framework/commit/36d18d5779bcbe2f7b1c1c418cc28482632fdb18) Thanks [@odinr](https://github.com/odinr)! - update ag-grid to 31.0.1

## 30.2.1

### Patch Changes

- [#1595](https://github.com/equinor/fusion-framework/pull/1595) [`9c24e84`](https://github.com/equinor/fusion-framework/commit/9c24e847d041dea8384c77439e6b237f5bdb3125) Thanks [@Gustav-Eikaas](https://github.com/Gustav-Eikaas)! - support for module resolution NodeNext & Bundler

## 30.2.0

### Minor Changes

- [#1354](https://github.com/equinor/fusion-framework/pull/1354) [`a05a56c2`](https://github.com/equinor/fusion-framework/commit/a05a56c2e608d00c9083c345331751f31d415e1f) Thanks [@odinr](https://github.com/odinr)! - update [@ag-grid-enterprise/core to 30.2.0](https://github.com/ag-grid/ag-grid/releases/tag/v30.2.0)

## 30.1.1

### Patch Changes

- [`b5dfe5d2`](https://github.com/equinor/fusion-framework/commit/b5dfe5d29a249e0cca6c9589322931dfedd06acc) Thanks [@odinr](https://github.com/odinr)! - force patch bump, realign missing snapshot

## 30.1.0

### Minor Changes

- [#1225](https://github.com/equinor/fusion-framework/pull/1225) [`31a4b06a`](https://github.com/equinor/fusion-framework/commit/31a4b06afcbb76b0a7584724a5bc061a3e2d98b3) Thanks [@odinr](https://github.com/odinr)! - updated ag-grid to 30.1

    see [ag-grid changelog](https://github.com/ag-grid/ag-grid/releases/tag/v30.1.0)

    see [📚doc](https://equinor.github.io/fusion-framework/modules/ag-grid/)

## 30.0.1

### Patch Changes

- [#1109](https://github.com/equinor/fusion-framework/pull/1109) [`7ec195d4`](https://github.com/equinor/fusion-framework/commit/7ec195d42098fec8794db13e83b71ef7753ff862) Thanks [@odinr](https://github.com/odinr)! - Change packaged manager from yarn to pnpm

    conflicts of `@types/react` made random outcomes when using `yarn`

    this change should not affect consumer of the packages, but might conflict dependent on local package manager.

## 30.0.0

### Major Changes

- [#1060](https://github.com/equinor/fusion-framework/pull/1060) [`3a2c3107`](https://github.com/equinor/fusion-framework/commit/3a2c3107b436c1eef7bc03c8225c32d40ed27e74) Thanks [@odinr](https://github.com/odinr)! - chore: update ag-grid to ~30.0

## 29.3.3

### Patch Changes

- [#946](https://github.com/equinor/fusion-framework/pull/946) [`5a160d88`](https://github.com/equinor/fusion-framework/commit/5a160d88981ddfe861d391cfefe10f54dda3d352) Thanks [@odinr](https://github.com/odinr)! - Build/update typescript to 5

## 29.3.2

### Patch Changes

- [#905](https://github.com/equinor/fusion-framework/pull/905) [`a7858a1c`](https://github.com/equinor/fusion-framework/commit/a7858a1c01542e2dc94370709f122b4b99c3219c) Thanks [@odinr](https://github.com/odinr)! - **🚧 Chore: dedupe packages**

    - align all versions of typescript
    - update types to build
        - a couple of typecasts did not [satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#satisfies-support-in-jsdoc) and was recasted as `unknwon`, marked with `TODO`, should be fixed in future

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 29.3.1 (2023-05-23)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 29.3.0 (2023-05-09)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 4.0.1 (2023-05-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 4.0.0 (2023-04-16)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [3.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@3.0.0...@equinor/fusion-framework-module-ag-grid@3.0.1) (2023-03-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [3.0.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@2.0.2...@equinor/fusion-framework-module-ag-grid@3.0.0) (2023-01-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [3.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@2.0.2...@equinor/fusion-framework-module-ag-grid@3.0.0-alpha.0) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [2.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@2.0.1...@equinor/fusion-framework-module-ag-grid@2.0.2) (2023-01-26)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [2.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@2.0.0...@equinor/fusion-framework-module-ag-grid@2.0.1) (2023-01-19)

### Bug Fixes

- **module-ag-grid:** make options optional ([dfa6458](https://github.com/equinor/fusion-framework/commit/dfa6458ce3ed5e83370f8ad0ecdcb0aee68feb7e))
- update interface for enabling modules ([1e5730e](https://github.com/equinor/fusion-framework/commit/1e5730e91992c1d0177790c851be993a0532a3d1))

## 2.0.0 (2023-01-19)

### ⚠ BREAKING CHANGES

- **module-ag-grid:** enableAgGrid now requires options

### Features

- **module-ag-grid:** enhance enabling module ([4ae3c61](https://github.com/equinor/fusion-framework/commit/4ae3c61bc1e9e569e9002ef6a171dc3ef12ef5db))

## 1.0.19 (2022-12-06)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.18 (2022-12-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.17 (2022-11-11)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.16 (2022-11-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.15 (2022-11-02)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.14 (2022-10-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.13 (2022-10-21)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.12](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.11...@equinor/fusion-framework-module-ag-grid@1.0.12) (2022-10-17)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.11 (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.10](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.9...@equinor/fusion-framework-module-ag-grid@1.0.10) (2022-10-03)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.8...@equinor/fusion-framework-module-ag-grid@1.0.9) (2022-09-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.8](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.7...@equinor/fusion-framework-module-ag-grid@1.0.8) (2022-09-29)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.7 (2022-09-27)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.6 (2022-09-20)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.4...@equinor/fusion-framework-module-ag-grid@1.0.5) (2022-09-14)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.3...@equinor/fusion-framework-module-ag-grid@1.0.4) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.2...@equinor/fusion-framework-module-ag-grid@1.0.3) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.1...@equinor/fusion-framework-module-ag-grid@1.0.2) (2022-09-13)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.1-next.1...@equinor/fusion-framework-module-ag-grid@1.0.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.1-next.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.1-next.0...@equinor/fusion-framework-module-ag-grid@1.0.1-next.1) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [1.0.1-next.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@1.0.0...@equinor/fusion-framework-module-ag-grid@1.0.1-next.0) (2022-09-12)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 1.0.0 (2022-09-12)

### Features

- **module-ag-grid:** expose simple config ([e0ce67f](https://github.com/equinor/fusion-framework/commit/e0ce67f5594cd0f63aea318d130021b0bdeec41d))
- **module-ag-grid:** expose simple configurator ([788385f](https://github.com/equinor/fusion-framework/commit/788385fa216853c5cc71b13afbcd1c14ca712a5d))

## [1.0.0-alpha.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.3.4...@equinor/fusion-framework-module-ag-grid@1.0.0-alpha.0) (2022-09-12)

### Features

- **module-ag-grid:** expose simple config ([e0ce67f](https://github.com/equinor/fusion-framework/commit/e0ce67f5594cd0f63aea318d130021b0bdeec41d))
- **module-ag-grid:** expose simple configurator ([788385f](https://github.com/equinor/fusion-framework/commit/788385fa216853c5cc71b13afbcd1c14ca712a5d))

## 0.3.4 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 0.3.3 (2022-09-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 0.3.2 (2022-08-19)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.3.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.3.0...@equinor/fusion-framework-module-ag-grid@0.3.1) (2022-08-15)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

# 0.3.0 (2022-08-11)

- feat!: allow modules to displose ([32b69fb](https://github.com/equinor/fusion-framework/commit/32b69fb7cc61e78e503e67d0e77f21fb44b600b9))

### BREAKING CHANGES

- module.initialize now has object as arg

## [0.2.11](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.10...@equinor/fusion-framework-module-ag-grid@0.2.11) (2022-08-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 0.2.10 (2022-08-05)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.9](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.8...@equinor/fusion-framework-module-ag-grid@0.2.9) (2022-08-04)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## 0.2.8 (2022-08-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.7](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.6...@equinor/fusion-framework-module-ag-grid@0.2.7) (2022-07-01)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.6](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.5...@equinor/fusion-framework-module-ag-grid@0.2.6) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.5](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.4...@equinor/fusion-framework-module-ag-grid@0.2.5) (2022-06-30)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.4](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.3...@equinor/fusion-framework-module-ag-grid@0.2.4) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.3](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.2...@equinor/fusion-framework-module-ag-grid@0.2.3) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.2](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.1...@equinor/fusion-framework-module-ag-grid@0.2.2) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

## [0.2.1](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.2.0...@equinor/fusion-framework-module-ag-grid@0.2.1) (2022-06-28)

**Note:** Version bump only for package @equinor/fusion-framework-module-ag-grid

# [0.2.0](https://github.com/equinor/fusion-framework/compare/@equinor/fusion-framework-module-ag-grid@0.1.0...@equinor/fusion-framework-module-ag-grid@0.2.0) (2022-06-24)

### Bug Fixes

- **module-ag-grid:** update config chaining ([12e0cad](https://github.com/equinor/fusion-framework/commit/12e0cad06383a02b710d5a1b989f76a53363b181))

### Features

- **module-ag-grid:** create a module for registering ag-grid ([41f2388](https://github.com/equinor/fusion-framework/commit/41f238836d2e42b94f22a253067bfda0f46132e7))

# 0.1.0 (2022-06-23)

### Features

- **module-ag-grid:** create a module for registering ag-grid ([41f2388](https://github.com/equinor/fusion-framework/commit/41f238836d2e42b94f22a253067bfda0f46132e7))

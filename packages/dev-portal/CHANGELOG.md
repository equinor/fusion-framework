# @equinor/fusion-framework-dev-portal

## 1.1.0

### Minor Changes

- [#3349](https://github.com/equinor/fusion-framework/pull/3349) [`c511123`](https://github.com/equinor/fusion-framework/commit/c511123c835e24e9ddefcc4c47c2455f5df12087) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vite from 6.x to 7.1.5

  Major version update of Vite build tool across all packages. This update includes:

  - Enhanced build performance and caching
  - Better error reporting with code frames
  - Improved TypeScript integration
  - Updated plugin ecosystem compatibility
  - New development server features

  ### Links

  - [Vite 7.1.5 Release Notes](https://github.com/vitejs/vite/releases/tag/v7.1.5)
  - [Vite 7.x Migration Guide](https://vitejs.dev/guide/migration)

### Patch Changes

- [#3365](https://github.com/equinor/fusion-framework/pull/3365) [`6eeef2f`](https://github.com/equinor/fusion-framework/commit/6eeef2f2033dfacf7c972295c8c2cc2d4cd83976) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated @equinor/eds-tokens from 0.9.2 to 0.10.0

  - Added support for CSS custom properties via variables-static.css and variables-dynamic.css
  - Improved design token integration for better CSS compatibility
  - Updated dependencies and internal tooling (pnpm v10, node v22)

  This is a minor version update with new features and no breaking changes.

- [#3400](https://github.com/equinor/fusion-framework/pull/3400) [`aed6c53`](https://github.com/equinor/fusion-framework/commit/aed6c5385df496a86d06dc0af9dacafc255ea605) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @equinor/eds-core-react from 0.45.1 to 0.49.0

  ### New Features

  - ✨ Always show "add new option" in Autocomplete when onAddNewOption is provided
  - ✨ Tabs call onChange with provided value if present
  - ✨ Add disabled prop to Tooltip
  - ✨ Autocomplete allow option-label prop to be used without type of object
  - ✨ Add support for adding new options in Autocomplete

  ### Bug Fixes

  - 🐛 Autocomplete - Don't call onOptionsChange when clicking "Add new"
  - 🐛 Table - Fix Firefox table header wrapping issue
  - 🐛 Tabs documentation type mismatch - update onChange parameter from number to number | string
  - 🐛 DatePicker Disable back button in year range based on year, not month
  - 🐛 Tabs now allow 'null' value as child element 'Tabs.List' and 'Tabs.Panel'
  - 🐛 Autocomplete prevent onAddNewOption from being called twice in Strict Mode
  - 🐛 Table export table row with pascal case
  - 🐛 Autocomplete: Improvements to placeholder text
  - 🐛 Menu: Ensure onClose is called when a MenuItem without onClick is clicked

  ### Links

  - [GitHub releases](https://github.com/equinor/design-system/releases/tag/eds-core-react%400.49.0)
  - [npm changelog](https://www.npmjs.com/package/@equinor/eds-core-react?activeTab=versions)

- [#3366](https://github.com/equinor/fusion-framework/pull/3366) [`daa362e`](https://github.com/equinor/fusion-framework/commit/daa362e7d92ad362e46d666c434d0f09687abad5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update @equinor/eds-core-react from 0.48.0 to 0.49.0

  ### Changes

  - Updated @equinor/eds-core-react dependency to latest version across all packages
  - Fixed peerDependencies version mismatch in bookmark package
  - Includes bug fixes for Autocomplete and Table components
  - Adds new Autocomplete features for "add new option" functionality

  ### Affected Packages

  - packages/dev-portal
  - packages/react/components/bookmark
  - cookbooks/app-react-feature-flag
  - cookbooks/app-react-people

  ### Links

  - [GitHub releases](https://github.com/equinor/design-system/releases)
  - [Full Changelog](https://github.com/equinor/design-system/compare/eds-core-react@0.48.0...eds-core-react@0.49.0)

## 1.0.3

### Patch Changes

- [#3381](https://github.com/equinor/fusion-framework/pull/3381) [`bae9c95`](https://github.com/equinor/fusion-framework/commit/bae9c9554f335d0384b864436874bded47d00ed8) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update rollup from 4.49.0 to 4.50.2

  - Updated rollup dependency via vite transitive dependency
  - Includes bug fixes for tree-shaking array destructuring patterns
  - Performance improvements and platform support updates
  - No breaking changes - backward compatible update

## 1.0.2

### Patch Changes

- [#3332](https://github.com/equinor/fusion-framework/pull/3332) [`8c88574`](https://github.com/equinor/fusion-framework/commit/8c885745ee345cd7ef219b2cc469fd19c8687467) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump dotenv from 16.6.1 to 17.2.2

## 1.0.1

### Patch Changes

- [#3298](https://github.com/equinor/fusion-framework/pull/3298) [`6480bf1`](https://github.com/equinor/fusion-framework/commit/6480bf197db9428fed80299c235f0608db0ca6a3) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @equinor/eds-core-react from 0.43.0 to 0.48.0

- [#3306](https://github.com/equinor/fusion-framework/pull/3306) [`113a9ac`](https://github.com/equinor/fusion-framework/commit/113a9ac9b11f4cdb09dad22cbea010a3f5097343) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @vitejs/plugin-react from 4.7.0 to 5.0.2.

## 1.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - This release introduces a new package, `@equinor/fusion-framework-dev-portal`, as part of a refactor of the `@equinor/fusion-framework-cli`.
  The refactor moves specific functionality and code related to the development portal into its own dedicated package to improve modularity and maintainability.

  **Features**

  - Development portal for the Fusion framework
  - Support for MSAL authentication
  - Integration with service discovery
  - Environment variable configuration

  This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and while it can be used standalone, it is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.

  **Read More**

  For more detailed information, usage examples, and advanced configuration, please refer to the [GitHub README](https://github.com/equinor/fusion-framework/tree/main/packages/dev-portal/README.md) for this package.

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

## 1.0.0-next.3

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 1.0.0-next.2

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`ba060b7`](https://github.com/equinor/fusion-framework/commit/ba060b7a5fcc4f84891cb416b4d2f7fde231a368) Thanks [@odinr](https://github.com/odinr)! - migrate build system from Rollup to Vite

## 1.0.0-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`84c16d7`](https://github.com/equinor/fusion-framework/commit/84c16d74c3235f809ce4c3e75868be12010ed695) Thanks [@odinr](https://github.com/odinr)! - Add `prepack` script to `dev-portal` and `dev-server` packages

  - Added a `prepack` script to `@equinor/fusion-framework-dev-portal` and `@equinor/fusion-framework-dev-server` to ensure the build runs before packaging.
  - This helps guarantee that the latest build artifacts are included when publishing these packages.

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - This release introduces a new package, `@equinor/fusion-framework-dev-portal`, as part of a refactor of the `@equinor/fusion-framework-cli`.
  The refactor moves specific functionality and code related to the development portal into its own dedicated package to improve modularity and maintainability.

  Additionally, this update includes improved documentation and examples for better user guidance.

  This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and is not intended for direct use in production.
  The main purpose of this package is to provide a development portal for the Fusion framework, allowing developers to easily set up and test their applications in a local environment.

  Even though this package can be used as standalone, it is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

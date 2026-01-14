# @equinor/fusion-framework-dev-portal

## 1.3.0

### Minor Changes

- [#3900](https://github.com/equinor/fusion-framework/pull/3900) [`d7a9d12`](https://github.com/equinor/fusion-framework/commit/d7a9d127db9daff7d645d55eb08f37d1c36fa825) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Add feature flag `fusionLogAnalytics` to dev-portal in CLI.

  Add `ConsoleAnalyticsAdapter` Adapter to analytics module if the feature flag is
  enabled.

  By enabling this feature flag, analytics events will be logged out in the
  console. This is useful when you want to test events created by app teams (e.g.
  using `trackFeature` hook).

## 1.2.6

### Patch Changes

- [#3779](https://github.com/equinor/fusion-framework/pull/3779) [`ee6aa77`](https://github.com/equinor/fusion-framework/commit/ee6aa7764776000edab9233ad9a4716b2d85c4eb) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vite from 7.1.12 to 7.2.4

## 1.2.5

### Patch Changes

- [#3713](https://github.com/equinor/fusion-framework/pull/3713) [`eaa6871`](https://github.com/equinor/fusion-framework/commit/eaa6871edc07054138e88bc706a4137a3fcc261a) Thanks [@Noggling](https://github.com/Noggling)! - # Add app tag/version support for specific app builds

  This changeset introduces comprehensive support for loading specific app versions using tags, enabling developers to test different app builds and manage version-specific deployments.

  ## New Features

  ### App Tag/Version Support

  - **App Client**: Added `getAppBuild` method to fetch build manifests by app key and tag
  - **App Module Provider**: Enhanced `getAppManifest` to accept optional tag parameter
  - **App Loading**: Modified `setCurrentApp` to support `AppReference` objects with tag specification
  - **URL Integration**: Added `getAppTagFromUrl` utility to extract app tags from URL parameters

  ### Enhanced Type System

  - Added `AppReference` type for specifying app key and optional tag
  - Extended `AppBundleState` to include optional `tag` property
  - Updated `AppBuildManifest` type definition for build-specific metadata

  ### API Improvements

  - **AppClient**: Updated interface to support tag-based manifest and build fetching
  - **App Class**: Added `tag` getter property for accessing current app tag
  - **Action System**: Enhanced `fetchManifest` action to handle tag parameters

  ## Changes by Package

  ### `@equinor/fusion-framework-module-app`

  - **AppClient.ts**: Added `getAppBuild` method with tag support and updated `getAppManifest` signature
  - **AppModuleProvider.ts**: Enhanced `setCurrentApp` method to handle `AppReference` objects with tags
  - **App.ts**: Added `tag` getter and improved error handling in initialization
  - **types.ts**: Added `AppReference` type and extended `AppBundleState` with tag property
  - **actions.ts**: Updated `fetchManifest` action to accept tag parameter
  - **flows.ts**: Modified manifest fetching flow to handle tag-based requests

  ### `@equinor/fusion-framework-dev-portal`

  - **AppLoader.tsx**: Added `getAppTagFromUrl` utility function and integrated tag-based app loading

  ## Usage Examples

  ### Loading specific app version by tag

  ```typescript
  // Set current app with specific tag or version
  app.setCurrentApp({ appKey: "my-app", tag: "1.2.3" });

  app.setCurrentApp({ appKey: "my-app", tag: "preview" });

  // Extract tag from URL and load app
  const tag = getAppTagFromUrl();
  if (tag) {
    app.setCurrentApp({ appKey: "my-app", tag });
  }
  ```

  ### Fetching app builds

  ```typescript
  // Get build manifest for specific tag
  const buildManifest = await appClient.getAppBuild({
    appKey: "my-app",
    tag: "latest",
  });
  ```

  ## Migration Guide

  ### For App Consumers

  - No breaking changes - existing code continues to work
  - Optionally use new tag-based loading for version-specific deployments

  ### For App Developers

  - Consider adding `&tag` URL parameter support for testing different versions
  - Use new `AppReference` type when programmatically setting current apps with tags

  ## Technical Details

  - **Backward Compatibility**: All changes are backward compatible
  - **Caching**: Tag-based manifests and builds are cached separately
  - **Error Handling**: Enhanced error handling for build and manifest loading failures
  - **Type Safety**: Full TypeScript support for all new features

  closes: AB#65777
  related to: AB#65452

## 1.2.4

### Patch Changes

- [#3637](https://github.com/equinor/fusion-framework/pull/3637) [`f5b88e7`](https://github.com/equinor/fusion-framework/commit/f5b88e7ff8e896624de67bdf29091ba44bf8a628) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump rollup from 4.52.4 to 4.52.5 to fix sourcemap debugId generation; no public API changes.

- [#3629](https://github.com/equinor/fusion-framework/pull/3629) [`3a21f9a`](https://github.com/equinor/fusion-framework/commit/3a21f9a8b36aaa7c80209c0989627b1dcc48a6cf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump @equinor/fusion-react-side-sheet from 1.3.11 to 2.0.0 for React 19 compatibility fixes; no breaking changes to dev-portal functionality.

## 1.2.3

### Patch Changes

- [#3652](https://github.com/equinor/fusion-framework/pull/3652) [`8d50adc`](https://github.com/equinor/fusion-framework/commit/8d50adc17e81fc46da81795125832af8add5f678) Thanks [@dependabot](https://github.com/apps/dependabot)! - **Security:** Update Vite to v7.1.12

  This update addresses a security vulnerability in Vite's development server and includes bug fixes for improved compatibility. The update ensures secure development environments and better plugin ecosystem compatibility.

  **Changes:**

  - Updated Vite from v7.1.10 to v7.1.12
  - Includes security fix for development server file system checks
  - Includes compatibility fix for CommonJS plugin
  - No breaking changes or API modifications

  **Security Fix (v7.1.11):**

  - **dev**: trim trailing slash before `server.fs.deny` check ([#20968](https://github.com/vitejs/vite/issues/20968))
    - Prevents potential path traversal vulnerability in development server
    - Only affects development environment, not production builds

  **Bug Fix (v7.1.12):**

  - **deps**: downgrade commonjs plugin to 28.0.6 to avoid rollup/plugins issues ([#20990](https://github.com/vitejs/vite/issues/20990))
    - Improves compatibility with Rollup plugin ecosystem
    - Prevents potential build issues

  All packages using Vite as a development dependency are updated to the latest secure version. This is a patch-level security and bug fix update that maintains full compatibility with existing functionality.

  closes: https://github.com/equinor/fusion/issues/723

## 1.2.2

### Patch Changes

- [#3557](https://github.com/equinor/fusion-framework/pull/3557) [`8c6f679`](https://github.com/equinor/fusion-framework/commit/8c6f6790c69cca01bde55d622418040da1c5c9fc) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update deps of `@equinor/fusion-react-context-selector@1.0.6`

## 1.2.1

### Patch Changes

- [#3542](https://github.com/equinor/fusion-framework/pull/3542) [`2d4fd18`](https://github.com/equinor/fusion-framework/commit/2d4fd18394e8545b4616140a93a369d5ae77ccbc) Thanks [@eikeland](https://github.com/eikeland)! - Updated person component dependencies for improved functionality and bug fixes.

  - Updated `@equinor/fusion-react-person` from `^0.10.3` to `^0.10.10` in app-react-people cookbook
  - Updated `@equinor/fusion-wc-person` from `^3.1.8` to `^3.2.4` in dev-portal and people-resolver packages

- [#3547](https://github.com/equinor/fusion-framework/pull/3547) [`99a3c26`](https://github.com/equinor/fusion-framework/commit/99a3c26275c2089c3708124f5819ce383d8dc3dc) Thanks [@odinr](https://github.com/odinr)! - Enhanced dev-portal with portal proxy service worker configuration ([Issue #3546](https://github.com/equinor/fusion-framework/issues/3546)).

  - Added `/portal-proxy` service worker resource configuration in dev-server.ts
  - Routes portal proxy requests to Fusion portal service API (`/@fusion-api/portals`)
  - Enables portal proxy functionality for testing against real portal environments

  This change supports the portal proxy feature by configuring the service worker to properly route portal requests through the dev-server proxy system.

## 1.2.0

### Minor Changes

- [#3522](https://github.com/equinor/fusion-framework/pull/3522) [`63ac6a1`](https://github.com/equinor/fusion-framework/commit/63ac6a1178fc6f6b0702f51a9c36a67db76b92cd) Thanks [@odinr](https://github.com/odinr)! - Add comprehensive telemetry integration to the Fusion Dev Portal.

  **New Features:**

  - Enable telemetry tracking for portal usage analytics and monitoring
  - Configure portal-specific metadata including version and name identification
  - Set up telemetry event scoping for portal-specific tracking
  - Attach framework configurator events for comprehensive telemetry coverage

  **Technical Implementation:**

  - Integrate `@equinor/fusion-framework-module-telemetry` module
  - Configure telemetry with portal metadata (`type: 'portal-telemetry'`)
  - Set default scope to `['portal']` for event categorization
  - Establish parent-child telemetry relationship for consistent tracking
  - Add TypeScript path references for telemetry module

  **Configuration Updates:**

  - Enhanced `config.ts` with detailed telemetry setup and documentation
  - Updated dependency versions to use `workspace:*` for better monorepo compatibility
  - Improved code documentation and developer experience features

  resolves: [#3485](https://github.com/equinor/fusion-framework/issues/3485)

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

- [#3479](https://github.com/equinor/fusion-framework/pull/3479) [`11b5a00`](https://github.com/equinor/fusion-framework/commit/11b5a00047171f9969cabbcbbb53dd188ed8421e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump dotenv from 17.2.2 to 17.2.3 (TypeScript definition fix)

- [#3532](https://github.com/equinor/fusion-framework/pull/3532) [`63ecde5`](https://github.com/equinor/fusion-framework/commit/63ecde5c29e775b341c3fac0c1eeb7123db5e2db) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vite from 7.1.8 to 7.1.9 across development tools and plugins.

  This patch update fixes bugs and improves stability in the vite dependency.

## 1.1.4

### Patch Changes

- [#3471](https://github.com/equinor/fusion-framework/pull/3471) [`1db21e2`](https://github.com/equinor/fusion-framework/commit/1db21e21410f37bd9a8c1d31ab4f68452578a51e) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Re-add support for custom context path extraction and generation

## 1.1.3

### Patch Changes

- [#3446](https://github.com/equinor/fusion-framework/pull/3446) [`706c8a3`](https://github.com/equinor/fusion-framework/commit/706c8a3eebd7a4cb86cf457f50252a4a61520c15) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated @equinor/fusion-wc-person from 3.2.0 to 3.2.1.

## 1.1.2

### Patch Changes

- [#3432](https://github.com/equinor/fusion-framework/pull/3432) [`528d72c`](https://github.com/equinor/fusion-framework/commit/528d72c04066f93fca1fa6469f33ec8d5383dcdc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vite from 7.1.5 to 7.1.7, including bug fixes for HMR, build system, and glob imports.

## 1.1.1

### Patch Changes

- [#3442](https://github.com/equinor/fusion-framework/pull/3442) [`3b614f8`](https://github.com/equinor/fusion-framework/commit/3b614f87138f5a52f8ccc50ca8c6598ef3db37d6) Thanks [@asbjornhaland](https://github.com/asbjornhaland)! - Update biome to latest version

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

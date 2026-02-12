# @equinor/fusion-framework-vite-plugin-spa

## 3.1.6

### Patch Changes

- Updated dependencies [[`0b34d5d`](https://github.com/equinor/fusion-framework/commit/0b34d5d895c740a77fc995abeca910fdca1cf633)]:
  - @equinor/fusion-framework-module-msal@7.1.0

## 3.1.5

### Patch Changes

- Updated dependencies [[`21458e5`](https://github.com/equinor/fusion-framework/commit/21458e5e7585f0bf266c66d6f4135396fd7c1529)]:
  - @equinor/fusion-framework-module-telemetry@4.6.3

## 3.1.4

### Patch Changes

- Updated dependencies [[`434ce70`](https://github.com/equinor/fusion-framework/commit/434ce707d237b399f8438eebe742641b2a81b11f)]:
  - @equinor/fusion-framework-module-service-discovery@9.1.0

## 3.1.3

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-module-telemetry@4.6.2

## 3.1.2

### Patch Changes

- Updated dependencies [[`cb37cae`](https://github.com/equinor/fusion-framework/commit/cb37cae45e06778e8d1ea20faed31b582e49fcae)]:
  - @equinor/fusion-framework-module-msal@7.0.0
  - @equinor/fusion-framework-module-http@7.0.7

## 3.1.1

### Patch Changes

- [#3963](https://github.com/equinor/fusion-framework/pull/3963) [`122752b`](https://github.com/equinor/fusion-framework/commit/122752b075113b206583ec2c46240997162329b8) Thanks [@odinr](https://github.com/odinr)! - Remove `lodash.mergewith` from the SPA Vite plugin by switching environment merging to a simple object merge where loaded environment values override plugin defaults.

  Resolves: https://github.com/equinor/fusion-framework/security/dependabot/188
  Resolves: https://github.com/equinor/fusion-framework/security/dependabot/189

## 3.1.0

### Minor Changes

- [#3922](https://github.com/equinor/fusion-framework/pull/3922) [`d34ebd8`](https://github.com/equinor/fusion-framework/commit/d34ebd82c93acabc88f88e44a725f084af3af5ec) Thanks [@odinr](https://github.com/odinr)! - Enable AG Grid Enterprise license injection for the dev-portal by setting a global window key produced from the SPA template environment. The portal reads `window.FUSION_AG_GRID_KEY` to configure the AG Grid module and silence license warnings when a valid key is present. CLI docs now mention the license key setup.

  **Usage:**

  - In your SPA environment file, set `FUSION_SPA_AG_GRID_KEY=your-license-key-here`.
  - The SPA HTML template injects `window.FUSION_AG_GRID_KEY` before bootstrap runs, and the dev-portal picks it up automatically.

  Closes: https://github.com/equinor/fusion-core-tasks/issues/93
  Resolves: https://github.com/equinor/fusion-core-tasks/issues/92
  Solves: https://github.com/equinor/fusion/issues/732

### Patch Changes

- Updated dependencies [[`f70d66f`](https://github.com/equinor/fusion-framework/commit/f70d66f1bc826e614140adb2c6ee052f98e3b3da)]:
  - @equinor/fusion-framework-module-http@7.0.6
  - @equinor/fusion-framework-module-msal@6.0.5
  - @equinor/fusion-framework-module-service-discovery@9.0.5
  - @equinor/fusion-framework-module-telemetry@4.6.1

## 3.0.7

### Patch Changes

- [#3932](https://github.com/equinor/fusion-framework/pull/3932) [`15aaa87`](https://github.com/equinor/fusion-framework/commit/15aaa87e6a8b391c0672db0dcdca4c1cac3b50a7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: update rollup build dependency from 4.52.5 to 4.55.2.

  This update includes:

  - Improved circular dependency handling for manual chunks
  - Enhanced tree-shaking for Symbol properties
  - Performance improvements via variable name caching
  - Multiple bug fixes for build edge cases

  No changes to CLI or plugin functionality or public APIs.

## 3.0.6

### Patch Changes

- Updated dependencies [[`244d615`](https://github.com/equinor/fusion-framework/commit/244d615195721541870c98754ee37baca96b8584)]:
  - @equinor/fusion-framework-module-msal@6.0.4

## 3.0.5

### Patch Changes

- Updated dependencies [[`655ab0e`](https://github.com/equinor/fusion-framework/commit/655ab0ea9568090271225cb51285e78c2d08941e)]:
  - @equinor/fusion-framework-module-msal@6.0.3

## 3.0.4

### Patch Changes

- Updated dependencies [[`b8c8149`](https://github.com/equinor/fusion-framework/commit/b8c814938be4543d2522566ece10ebc6feefee75)]:
  - @equinor/fusion-framework-module-msal@6.0.2

## 3.0.3

### Patch Changes

- [#3779](https://github.com/equinor/fusion-framework/pull/3779) [`ee6aa77`](https://github.com/equinor/fusion-framework/commit/ee6aa7764776000edab9233ad9a4716b2d85c4eb) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vite from 7.1.12 to 7.2.4

- Updated dependencies [[`e8d6784`](https://github.com/equinor/fusion-framework/commit/e8d67848d53b8e733ddb60335fedeae637131c8d)]:
  - @equinor/fusion-framework-module-msal@6.0.1

## 3.0.2

### Patch Changes

- Updated dependencies [[`78f3679`](https://github.com/equinor/fusion-framework/commit/78f3679b09716f69b3093edcff9f06ad605092c3)]:
  - @equinor/fusion-framework-module-telemetry@4.6.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`1827381`](https://github.com/equinor/fusion-framework/commit/182738177dbbf5baaf9732ef3b540b4df80932f6)]:
  - @equinor/fusion-framework-module-telemetry@4.5.0

## 3.0.0

### Patch Changes

- [#3714](https://github.com/equinor/fusion-framework/pull/3714) [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8) Thanks [@odinr](https://github.com/odinr)! - Fix MSAL v4 compatibility issues in SPA plugin.

  - Update MSAL client configuration to use nested auth object structure
  - Replace deprecated defaultAccount with account property
  - Update acquireToken calls to use MSAL v4 request structure

  These changes ensure the SPA plugin works correctly with MSAL v4 while maintaining backward compatibility.

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8), [`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-module-http@7.0.5
  - @equinor/fusion-framework-module-telemetry@4.4.0
  - @equinor/fusion-framework-module-msal@6.0.0

## 2.0.2

### Patch Changes

- [#3637](https://github.com/equinor/fusion-framework/pull/3637) [`f5b88e7`](https://github.com/equinor/fusion-framework/commit/f5b88e7ff8e896624de67bdf29091ba44bf8a628) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump rollup from 4.52.4 to 4.52.5 to fix sourcemap debugId generation; no public API changes.

- [#3679](https://github.com/equinor/fusion-framework/pull/3679) [`1706e4c`](https://github.com/equinor/fusion-framework/commit/1706e4c503d8ef4db46a9572392d23e9c081c82c) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update @rollup/plugin-commonjs from 28.0.6 to 29.0.0, which reverts previous Node.js builtins handling changes and adds requireNodeBuiltins option.

- [#3646](https://github.com/equinor/fusion-framework/pull/3646) [`581306b`](https://github.com/equinor/fusion-framework/commit/581306bb7ace1646548865ea1711255065e90570) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update @rollup/plugin-typescript from 12.1.4 to 12.3.0 for improved TypeScript processing in watch mode and allowJs support.

- Updated dependencies [[`7ef76e3`](https://github.com/equinor/fusion-framework/commit/7ef76e36a854f01d1cd7bc1c40b1ca0172a01fc3), [`cd06a8a`](https://github.com/equinor/fusion-framework/commit/cd06a8a8de86a44edf349103fb9da6c8615a1d59), [`443414f`](https://github.com/equinor/fusion-framework/commit/443414fe0351b529cecf0a667383640567d05e74)]:
  - @equinor/fusion-framework-module-telemetry@4.3.1
  - @equinor/fusion-framework-module@5.0.5
  - @equinor/fusion-framework-module-msal@5.1.2
  - @equinor/fusion-framework-module-http@7.0.4
  - @equinor/fusion-framework-module-service-discovery@9.0.4

## 2.0.1

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

## 2.0.0

### Patch Changes

- [#3584](https://github.com/equinor/fusion-framework/pull/3584) [`0dd31cd`](https://github.com/equinor/fusion-framework/commit/0dd31cd1078b383ddab4a8cf1bb03d502e214715) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump @rollup/plugin-node-resolve from 16.0.1 to 16.0.3

  Bug fixes:

  - fix: resolve bare targets of package "imports" using export maps; avoid fileURLToPath(null)
  - fix: error thrown with empty entry

- [#3604](https://github.com/equinor/fusion-framework/pull/3604) [`31e2581`](https://github.com/equinor/fusion-framework/commit/31e2581fca2765dc7caf54f74db3db51020b53b7) Thanks [@odinr](https://github.com/odinr)! - Update SPA bootstrap telemetry configuration to use proper adapter identifiers.

  **Changes:**

  - Refactor console adapter setup for cleaner conditional logic
  - Update setAdapter calls to include required identifier parameter

  **Migration:**

  - No breaking changes for SPA consumers - internal implementation update only

- Updated dependencies [[`6900d98`](https://github.com/equinor/fusion-framework/commit/6900d98142c84f4703095f8d03b09af57a1d7d2e), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`e1a94c5`](https://github.com/equinor/fusion-framework/commit/e1a94c5a1df4ac2ec92ed25b75648397a3dbfa7b), [`31e2581`](https://github.com/equinor/fusion-framework/commit/31e2581fca2765dc7caf54f74db3db51020b53b7), [`0bc6b38`](https://github.com/equinor/fusion-framework/commit/0bc6b38e61c98a2f9dea7b55fa9983f268f860be), [`a13de68`](https://github.com/equinor/fusion-framework/commit/a13de68b2f196a779ea850af055d8db7926941ce)]:
  - @equinor/fusion-framework-module-http@7.0.3
  - @equinor/fusion-framework-module@5.0.4
  - @equinor/fusion-framework-module-msal@5.1.1
  - @equinor/fusion-framework-module-telemetry@4.3.0
  - @equinor/fusion-framework-module-service-discovery@9.0.3

## 1.2.2

### Patch Changes

- [#3578](https://github.com/equinor/fusion-framework/pull/3578) [`dd560e7`](https://github.com/equinor/fusion-framework/commit/dd560e75683788c875c6ba1e78463ae18d57fce2) Thanks [@Noggling](https://github.com/Noggling)! - Fix Windows compatibility issue in SPA Vite plugin

  Previously, the plugin was using direct `.pathname` access on URL objects which could cause issues on Windows due to path separator differences. This change replaces the direct pathname access with `fileURLToPath()` and `normalizePath()` from Vite to ensure proper cross-platform path handling.

  **Changes:**

  - Import `normalizePath` from Vite for consistent path normalization
  - Use `fileURLToPath()` to properly convert file URLs to paths
  - Apply `normalizePath()` to ensure consistent path separators across platforms

  This fix ensures the CLI and development server work correctly on Windows systems.

## 1.2.1

### Patch Changes

- [#3579](https://github.com/equinor/fusion-framework/pull/3579) [`b6a64d9`](https://github.com/equinor/fusion-framework/commit/b6a64d94bad7248c06b3aa7d65d7d698052437c7) Thanks [@Noggling](https://github.com/Noggling)! - Add peer dependencies to SPA Vite plugin

  Added peer dependencies to ensure proper dependency resolution for the SPA Vite plugin. This change declares the Fusion Framework modules that the plugin expects to be available in the consuming application:

  - `@equinor/fusion-framework-module`
  - `@equinor/fusion-framework-module-http`
  - `@equinor/fusion-framework-module-msal`
  - `@equinor/fusion-framework-module-service-discovery`
  - `@equinor/fusion-framework-module-telemetry`

  This ensures that consumers are aware of the required dependencies and helps prevent runtime errors due to missing modules.

## 1.2.0

### Minor Changes

- [#3547](https://github.com/equinor/fusion-framework/pull/3547) [`99a3c26`](https://github.com/equinor/fusion-framework/commit/99a3c26275c2089c3708124f5819ce383d8dc3dc) Thanks [@odinr](https://github.com/odinr)! - Enhanced SPA plugin with portal proxy support for testing apps in real portal environments ([Issue #3546](https://github.com/equinor/fusion-framework/issues/3546)).

  - Added `proxy` option to portal configuration to enable `/portal-proxy` routing
  - Added `FUSION_SPA_PORTAL_PROXY` environment variable support
  - Updated TypeScript types to include portal proxy configuration
  - Updated documentation with portal proxy usage examples

  This feature enables developers to load real portal implementations instead of the default developer portal, supporting configuration of portal ID and version tags for targeted testing scenarios.

  **Migration:**
  No migration required - the `proxy` option defaults to `false`, maintaining existing behavior.

  **Example usage:**

  ```ts
  portal: {
    id: 'my-portal',
    tag: 'latest',
    proxy: true, // Routes through /portal-proxy/
  }
  ```

## 1.1.4

### Patch Changes

- [#3490](https://github.com/equinor/fusion-framework/pull/3490) [`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1) Thanks [@odinr](https://github.com/odinr)! - Remove logger level configuration from bootstrap template.

  - Removed `configurator.logger.level` assignment from `bootstrap.ts`
  - Logger level configuration should be handled elsewhere or is no longer needed

  This cleans up the bootstrap template by removing unused logger configuration.

- [#3532](https://github.com/equinor/fusion-framework/pull/3532) [`63ecde5`](https://github.com/equinor/fusion-framework/commit/63ecde5c29e775b341c3fac0c1eeb7123db5e2db) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vite from 7.1.8 to 7.1.9 across development tools and plugins.

  This patch update fixes bugs and improves stability in the vite dependency.

- [#3521](https://github.com/equinor/fusion-framework/pull/3521) [`d1098f7`](https://github.com/equinor/fusion-framework/commit/d1098f7eeff04380c9e05e4a7a7d6b16e1d95884) Thanks [@odinr](https://github.com/odinr)! - Add comprehensive telemetry integration to SPA bootstrap and service worker.

  - Enable telemetry in SPA bootstrap with ConsoleAdapter
  - Add configurable console logging levels via FUSION_SPA_TELEMETRY_CONSOLE_LEVEL environment variable
  - Track bootstrap performance for portal loading operations
  - Monitor service worker registration and token acquisition
  - Include user metadata and portal configuration in telemetry
  - Track exceptions and errors throughout SPA lifecycle
  - Fix console level filtering logic to properly respect environment variable settings

  **Implementation Notes:**

  - Console level filtering defaults to `TelemetryLevel.Information` (1) when env var not set
  - Invalid env var values fallback to logging all telemetry (robust error handling)
  - Backward compatible: existing behavior unchanged when no FUSION_SPA_TELEMETRY_CONSOLE_LEVEL specified
  - Telemetry level mapping: 0=Debug, 1=Information, 2=Warning, 3=Error, 4=Critical

  resolves: [#3487](https://github.com/equinor/fusion-framework/issues/3487)

## 1.1.3

### Patch Changes

- [`56c27ec`](https://github.com/equinor/fusion-framework/commit/56c27ec9de03e07e725eecfdf2c028a1e29b6ece) Thanks [@odinr](https://github.com/odinr)! - Updated workspace dependencies to use exact version specifiers for consistent release behavior.

  - Changed workspace dependencies from `workspace:^` to `workspace:*` across CLI, dev-server, and SPA vite plugin packages
  - Ensures exact version resolution within the monorepo for predictable builds and releases
  - Affects both dependencies and devDependencies where applicable

## 1.1.2

### Patch Changes

- [#3470](https://github.com/equinor/fusion-framework/pull/3470) [`0734026`](https://github.com/equinor/fusion-framework/commit/073402682cacae75d82e69068e18b3061228972b) Thanks [@eikeland](https://github.com/eikeland)! - Fixed service worker not intercepting requests during hard refresh in development mode.

  **Problem**: During hard refresh, the service worker would not intercept fetch requests, causing authenticated API requests to fail. The service worker could be stuck in "waiting" state or already active but not controlling the page (`navigator.serviceWorker.controller` was `undefined`).

  **Root Cause**: Two related issues in the service worker lifecycle during hard refresh:

  1. **Waiting state**: When code changes, the new service worker enters "waiting" state, but `skipWaiting()` only runs in the `install` event (which already fired)
  2. **No controller**: Even when active, `clients.claim()` only runs in the `activate` event, which doesn't fire again if the service worker is already active

  **Solution**:

  - **Force activation on config receipt**: When receiving `INIT_CONFIG`, immediately call both `skipWaiting()` and `clients.claim()` to ensure the service worker activates and takes control regardless of its current state
  - **Wait for controller**: Registration now waits for `navigator.serviceWorker.controller` to be set before proceeding, ensuring fetch interception is ready
  - **Disable service worker caching**: Added `updateViaCache: 'none'` to always fetch fresh service worker code during development
  - **Comprehensive state handling**: Handle service workers in installing, waiting, and active states

  **Changes**:

  1. **sw.ts**: Call `skipWaiting()` and `clients.claim()` when receiving `INIT_CONFIG` message
  2. **register-service-worker.ts**: Wait for controller with polling and timeout fallback; disable service worker HTTP caching

  This ensures service workers always activate and take control during hard refresh, properly intercepting and authenticating requests in development mode.

  reporter: [v3gard](https://github.com/v3gard)

  resolves: [Force refresh (CTRL+Shift+R) causes app to throw #679
  ](https://github.com/equinor/fusion/issues/679)

## 1.1.1

### Patch Changes

- [#3432](https://github.com/equinor/fusion-framework/pull/3432) [`528d72c`](https://github.com/equinor/fusion-framework/commit/528d72c04066f93fca1fa6469f33ec8d5383dcdc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vite from 7.1.5 to 7.1.7, including bug fixes for HMR, build system, and glob imports.

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

## 1.0.1

### Patch Changes

- [#3381](https://github.com/equinor/fusion-framework/pull/3381) [`bae9c95`](https://github.com/equinor/fusion-framework/commit/bae9c9554f335d0384b864436874bded47d00ed8) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update rollup from 4.49.0 to 4.50.2

  - Updated rollup dependency via vite transitive dependency
  - Includes bug fixes for tree-shaking array destructuring patterns
  - Performance improvements and platform support updates
  - No breaking changes - backward compatible update

- [#2910](https://github.com/equinor/fusion-framework/pull/2910) [`07cc985`](https://github.com/equinor/fusion-framework/commit/07cc9857e1427b574e011cc319518e701dba784d) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vitest from 2.1.9 to 3.2.4 across all packages.

  ## Breaking Changes

  - **Node.js Requirements**: Requires Node.js 18+ (already satisfied)
  - **Vite Compatibility**: Updated to work with Vite 7.x (already using Vite 7.1.5)
  - **Snapshot Format**: Snapshots now use backtick quotes (\`) instead of single quotes
  - **Coverage API**: New coverage methods `enableCoverage()` and `disableCoverage()`
  - **TypeScript Support**: Enhanced TypeScript integration and type definitions

  ## Security Updates

  - CVE-2025-24963: Browser mode serves arbitrary files (fixed in 2.1.9)
  - CVE-2025-24964: Remote Code Execution vulnerability (fixed in 2.1.9)

  ## Migration Notes

  - Test snapshots may need regeneration due to quote format changes
  - Some test configurations might need updates for new TypeScript support
  - Peer dependency warnings for @vitest/coverage-v8 are expected and safe to ignore

  ## Links

  - [Vitest 3.0 Migration Guide](https://vitest.dev/guide/migration)
  - [Vitest 3.2.4 Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v3.2.4)

## 1.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Introducing a powerful new Vite plugin for building Single Page Applications (SPAs) with the Fusion Framework and Vite. This plugin significantly streamlines the development workflow by automating HTML template generation, bootstrapping authentication and service discovery, and enabling seamless portal loading and API proxying.

  **Purpose**:

  This plugin represents a strategic modularization of the Fusion Framework CLI codebase. By extracting the SPA functionality into its own dedicated package, we've simplified the CLI's architecture while enabling greater flexibility. This modular design allows the SPA component to be replaced or reused by third-party developers independently of the CLI. The primary goal is to maintain a cleaner, more maintainable codebase through proper separation of concerns, with the CLI using this plugin rather than containing this functionality directly.

  **Key Features**:

  - **Fusion Framework Bootstrap**: Automatically initializes core modules and renders configured portals
  - **Service Discovery**: Enables dynamic service routing and eliminates hardcoded service endpoints
  - **MSAL Authentication**: Provides seamless Azure AD integration with configurable authentication flows
  - **Service Worker**: Intercepts network requests to add authentication tokens and rewrite URLs for proxying
  - **Portal Integration**: Loads and renders any portal by ID from local packages or the Fusion Portal Service
  - **Environment Configuration**: Supports flexible configuration through code or `.env` files with proper naming conventions
  - **Custom Templates**: Allows full control over HTML document structure while maintaining environment variable injection
  - **Custom Bootstrap**: Supports advanced customization of the application initialization process
  - **API Service Integration**: Works with `@equinor/fusion-framework-vite-plugin-api-service` for enhanced development capabilities

  This plugin is designed for seamless integration with the Fusion Framework CLI and provides flexible configuration for both standard and advanced SPA scenarios.

  > Note: This plugin is intended for use in non-production environments only, primarily as a development and testing tool.

## 1.0.0-next.9

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 1.0.0-next.8

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`5973182`](https://github.com/equinor/fusion-framework/commit/5973182b156adb56137f1fc683635ae15274cc57) Thanks [@odinr](https://github.com/odinr)! - Update portal config and manifest API routes and types for consistency:

  - Change dev server API route for portal manifest/config from `/portals/portals/...` to `/portal-config/portals/...` for alignment with client usage.
  - Make portal config optional in dev server route and type definitions.
  - Update SPA bootstrap to use `portal-config` as the service discovery client key.
  - Refactor portal manifest/config loading and merging to use `RecursivePartial` and `lodash.mergewith` for deep merge support.
  - Remove unused zod import from portal config type.

  These changes improve consistency, flexibility, and correctness in portal manifest/config handling across CLI and SPA plugin.

## 1.0.0-next.7

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`23fdc8a`](https://github.com/equinor/fusion-framework/commit/23fdc8a80d21ff063b17d8c596c0afc0a891305f) Thanks [@odinr](https://github.com/odinr)! - Fix dependency and devDependency declarations for lodash.mergewith:

  - Move "lodash.mergewith" to dependencies and ensure correct version for @types/lodash.mergewith in devDependencies.
  - Remove duplicate and misplaced entries for lodash.mergewith and its types.
  - Remove unused @equinor/fusion-framework-vite-plugin-api-service from devDependencies.
  - Update lockfile to match package.json changes.

  This ensures correct dependency management and resolves potential issues with type resolution and package installation.

## 1.0.0-next.6

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`713cb15`](https://github.com/equinor/fusion-framework/commit/713cb15c5f1607e7f7285940a58165d97d8e41df) Thanks [@odinr](https://github.com/odinr)! - Refactor plugin internals for improved Vite compatibility and maintainability:

  - Made `resolveId` and `config` hooks async to support dynamic import resolution for virtual modules.
  - Improved resource alias resolution for `/@fusion-spa-bootstrap.js` and `/@fusion-spa-sw.js` using `import.meta.resolve` and `fileURLToPath`.
  - Enhanced environment variable handling by merging plugin and loaded environments, and defining them on `config.define`.
  - Ensured the Vite dev server allows access to the correct `../html` directory for SPA templates.
  - Added more robust logging for environment configuration and plugin setup.

## 1.0.0-next.5

### Minor Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`ea96493`](https://github.com/equinor/fusion-framework/commit/ea96493d95336f682e31a7b63161783ae7c99a63) Thanks [@odinr](https://github.com/odinr)! - Refactor build output and entrypoints for SPA Vite plugin:

  - Change main export entrypoint to `./dist/bin/index.js` (was `./dist/esm/index.js`).
  - Remove the `./html` export subpath.
  - Update Rollup config to bundle from `dist/esm` to `dist/bin` and adjust input/output accordingly.
  - Remove `postbuild` script and add `prebuild` script for TypeScript project references build.
  - Minor formatting improvements in `package.json`.

  These changes improve the build pipeline and clarify the published entrypoints for consumers.

## 1.0.0-next.4

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8870e73`](https://github.com/equinor/fusion-framework/commit/8870e73bd6d4141142c69c11c67b5b154bc80023) Thanks [@odinr](https://github.com/odinr)! - Update build system and dependencies:

  - Switch build script to use Rollup with a new `rollup.config.js` for ESM output
  - Add postbuild script to emit TypeScript declarations
  - Move all dependencies to devDependencies for clarity
  - Add and update Rollup-related devDependencies (including plugins and types)
  - Update `pnpm-lock.yaml` to reflect new and updated dependencies
  - Minor formatting and consistency improvements in `package.json` and `tsconfig.json`

  These changes modernize the build process and improve maintainability for the SPA Vite plugin package.

## 1.0.0-next.3

### Patch Changes

- Updated dependencies [[`bbda62d`](https://github.com/equinor/fusion-framework/commit/bbda62def35c8e8b742d90459680f7199c4ece0f)]:
  - @equinor/fusion-framework-module@4.4.3-next.1
  - @equinor/fusion-framework-module-http@6.3.3-next.2
  - @equinor/fusion-framework-module-msal@4.0.7-next.1
  - @equinor/fusion-framework-module-service-discovery@8.0.15-next.2

## 1.0.0-next.2

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`ca8d6c8`](https://github.com/equinor/fusion-framework/commit/ca8d6c834f9df35041ce8c7e2563c452d8b19276) Thanks [@odinr](https://github.com/odinr)! - Allow the plugin to access the template file by updating the Vite server file system allow list. This ensures the template can be served correctly during development.

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`7878f59`](https://github.com/equinor/fusion-framework/commit/7878f591c528d463bfbe558094c2c31004db8586) Thanks [@odinr](https://github.com/odinr)! - Update bootstrap logic to improve service discovery, authentication, and portal manifest loading. Refactored the initialization sequence and clarified environment variable usage in `bootstrap.ts`. No breaking changes expected.

- Updated dependencies [[`53ef326`](https://github.com/equinor/fusion-framework/commit/53ef32633ce1c050e20614f1343148327a40b2e6)]:
  - @equinor/fusion-framework-module@4.4.3-next.0
  - @equinor/fusion-framework-module-http@6.3.3-next.1
  - @equinor/fusion-framework-module-msal@4.0.7-next.0
  - @equinor/fusion-framework-module-service-discovery@8.0.15-next.1

## 1.0.0-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`96ad5d3`](https://github.com/equinor/fusion-framework/commit/96ad5d3a3aafe7adf5bd7f8e48e58bb19aa95ba8) Thanks [@odinr](https://github.com/odinr)! - Add prepack script to run build before packaging

  A `prepack` script was added to both the SPA and API service Vite plugin packages. This ensures the build step runs automatically before packaging, improving reliability of published artifacts.

- Updated dependencies [[`96ad5d3`](https://github.com/equinor/fusion-framework/commit/96ad5d3a3aafe7adf5bd7f8e48e58bb19aa95ba8)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.1

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - ---

  **New Package: Fusion Framework Vite SPA Plugin**

  This plugin enables building single-page applications (SPAs) with Vite. It provides features such as service discovery, MSAL authentication, and service worker configuration.

  **Features**:

  - **Service Discovery**: Fetch service discovery configurations and authenticate requests.
  - **MSAL Authentication**: Authenticate users with Azure AD.
  - **Service Worker**: Intercept fetch requests, apply authentication headers, and rewrite URLs.
  - **Custom Templates**: Define custom HTML templates for SPAs.
  - **Environment Configuration**: Configure the plugin using `.env` files or programmatically.

  **Usage**:

  ```ts
  import { defineConfig } from "vite";
  import { plugin as fusionSpaPlugin } from "@equinor/fusion-framework-vite-plugin-spa";

  export default defineConfig({
    plugins: [fusionSpaPlugin()],
  });
  ```

  ```ts
  fusionSpaPlugin({
    generateTemplateEnv: () => ({
      title: "My App",
      portal: {
        id: "my-portal",
      },
      serviceDiscovery: {
        url: "https://my-server.com/service-discovery",
        scopes: ["api://my-app/scope"],
      },
      msal: {
        tenantId: "my-tenant-id",
        clientId: "my-client-id",
        redirectUri: "https://my-app.com/auth-callback",
        requiresAuth: "true",
      },
      serviceWorker: {
        resources: [
          {
            url: "/app-proxy",
            rewrite: "/@fusion-api/app",
            scopes: ["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/.default"],
          },
        ],
      },
    }),
  });
  ```

  **Additional Details**:

  - **Custom Bootstrap**: Allows defining custom bootloader scripts.
  - **Dynamic Proxy**: Supports dynamic proxy services using `@equinor/fusion-framework-vite-plugin-api-service`.
  - **Environment Variables**: Automatically maps `.env` variables to `import.meta.env`.

  Refer to the README for detailed documentation.

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - Fetch and pass portal config to portal render function in bootstrap.ts

  - The SPA bootstrap script now fetches the portal config from `/portals/{portalId}@{portalTag}/config` and passes it as `config` to the portal's render function.
  - This enables portals to receive their runtime configuration directly at startup.

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- Updated dependencies [[`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.0
  - @equinor/fusion-framework-module-http@6.3.3-next.0
  - @equinor/fusion-framework-module-service-discovery@8.0.15-next.0

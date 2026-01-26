# @equinor/fusion-framework-dev-server

## 1.1.21-msal-v5.0

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@3.1.1-msal-v5.0

## 1.1.20

### Patch Changes

- Updated dependencies [[`d34ebd8`](https://github.com/equinor/fusion-framework/commit/d34ebd82c93acabc88f88e44a725f084af3af5ec)]:
  - @equinor/fusion-framework-vite-plugin-spa@3.1.0

## 1.1.19

### Patch Changes

- Updated dependencies [[`15aaa87`](https://github.com/equinor/fusion-framework/commit/15aaa87e6a8b391c0672db0dcdca4c1cac3b50a7)]:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.7

## 1.1.18

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.6

## 1.1.17

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.5

## 1.1.16

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.4

## 1.1.15

### Patch Changes

- Updated dependencies [[`ee6aa77`](https://github.com/equinor/fusion-framework/commit/ee6aa7764776000edab9233ad9a4716b2d85c4eb)]:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.3

## 1.1.14

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.2

## 1.1.13

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.1

## 1.1.12

### Patch Changes

- Updated dependencies [[`11fe961`](https://github.com/equinor/fusion-framework/commit/11fe961794e4960ccb987bc320268cc9b263f1f8)]:
  - @equinor/fusion-framework-vite-plugin-spa@3.0.0

## 1.1.11

### Patch Changes

- [#3686](https://github.com/equinor/fusion-framework/pull/3686) [`d6465bc`](https://github.com/equinor/fusion-framework/commit/d6465bc2787a37465e22964803501e44f6b19517) Thanks [@odinr](https://github.com/odinr)! - Update vite peerDependency version constraint from ^6.0.7 to ^7.0.0 to support the latest vite features and improvements.

## 1.1.10

### Patch Changes

- [#3637](https://github.com/equinor/fusion-framework/pull/3637) [`f5b88e7`](https://github.com/equinor/fusion-framework/commit/f5b88e7ff8e896624de67bdf29091ba44bf8a628) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump rollup from 4.52.4 to 4.52.5 to fix sourcemap debugId generation; no public API changes.

- Updated dependencies [[`f5b88e7`](https://github.com/equinor/fusion-framework/commit/f5b88e7ff8e896624de67bdf29091ba44bf8a628), [`1706e4c`](https://github.com/equinor/fusion-framework/commit/1706e4c503d8ef4db46a9572392d23e9c081c82c), [`581306b`](https://github.com/equinor/fusion-framework/commit/581306bb7ace1646548865ea1711255065e90570)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.2.4
  - @equinor/fusion-framework-vite-plugin-spa@2.0.2

## 1.1.9

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

- Updated dependencies [[`8d50adc`](https://github.com/equinor/fusion-framework/commit/8d50adc17e81fc46da81795125832af8add5f678)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.2.3
  - @equinor/fusion-framework-vite-plugin-spa@2.0.1

## 1.1.8

### Patch Changes

- Updated dependencies [[`0dd31cd`](https://github.com/equinor/fusion-framework/commit/0dd31cd1078b383ddab4a8cf1bb03d502e214715), [`31e2581`](https://github.com/equinor/fusion-framework/commit/31e2581fca2765dc7caf54f74db3db51020b53b7)]:
  - @equinor/fusion-framework-vite-plugin-spa@2.0.0

## 1.1.7

### Patch Changes

- Updated dependencies [[`dd560e7`](https://github.com/equinor/fusion-framework/commit/dd560e75683788c875c6ba1e78463ae18d57fce2)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.2.2

## 1.1.6

### Patch Changes

- Updated dependencies [[`b6a64d9`](https://github.com/equinor/fusion-framework/commit/b6a64d94bad7248c06b3aa7d65d7d698052437c7)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.2.1

## 1.1.5

### Patch Changes

- Updated dependencies [[`99a3c26`](https://github.com/equinor/fusion-framework/commit/99a3c26275c2089c3708124f5819ce383d8dc3dc)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.2.0

## 1.1.4

### Patch Changes

- [#3532](https://github.com/equinor/fusion-framework/pull/3532) [`63ecde5`](https://github.com/equinor/fusion-framework/commit/63ecde5c29e775b341c3fac0c1eeb7123db5e2db) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vite from 7.1.8 to 7.1.9 across development tools and plugins.

  This patch update fixes bugs and improves stability in the vite dependency.

- Updated dependencies [[`45954e5`](https://github.com/equinor/fusion-framework/commit/45954e5db471a2faa24e88e41fc6d6c18817d6d1), [`63ecde5`](https://github.com/equinor/fusion-framework/commit/63ecde5c29e775b341c3fac0c1eeb7123db5e2db), [`d1098f7`](https://github.com/equinor/fusion-framework/commit/d1098f7eeff04380c9e05e4a7a7d6b16e1d95884)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.1.4
  - @equinor/fusion-framework-vite-plugin-api-service@1.2.2

## 1.1.3

### Patch Changes

- [`56c27ec`](https://github.com/equinor/fusion-framework/commit/56c27ec9de03e07e725eecfdf2c028a1e29b6ece) Thanks [@odinr](https://github.com/odinr)! - Updated workspace dependencies to use exact version specifiers for consistent release behavior.

  - Changed workspace dependencies from `workspace:^` to `workspace:*` across CLI, dev-server, and SPA vite plugin packages
  - Ensures exact version resolution within the monorepo for predictable builds and releases
  - Affects both dependencies and devDependencies where applicable

- Updated dependencies [[`56c27ec`](https://github.com/equinor/fusion-framework/commit/56c27ec9de03e07e725eecfdf2c028a1e29b6ece)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.1.3

## 1.1.2

### Patch Changes

- [#3432](https://github.com/equinor/fusion-framework/pull/3432) [`528d72c`](https://github.com/equinor/fusion-framework/commit/528d72c04066f93fca1fa6469f33ec8d5383dcdc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vite from 7.1.5 to 7.1.7, including bug fixes for HMR, build system, and glob imports.

- Updated dependencies [[`528d72c`](https://github.com/equinor/fusion-framework/commit/528d72c04066f93fca1fa6469f33ec8d5383dcdc)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.2.1
  - @equinor/fusion-framework-vite-plugin-spa@1.1.1

## 1.1.1

### Patch Changes

- [#3443](https://github.com/equinor/fusion-framework/pull/3443) [`2291483`](https://github.com/equinor/fusion-framework/commit/2291483b10ea288102155839dc47dcfe2addc22c) Thanks [@eikeland](https://github.com/eikeland)! - Fix OPTIONS requests missing Allow header after Vite 7 update

  - Disabled Vite's internal CORS handling by setting `server.cors: false`
  - This allows backend services to properly handle OPTIONS requests with correct headers
  - Resolves issue where OPTIONS requests were not forwarded to backend after Vite 7 upgrade
  - Backend services can now include Allow, Access-Control-Allow-Methods, and other CORS headers

  closes: #3436

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

- [#3391](https://github.com/equinor/fusion-framework/pull/3391) [`7792659`](https://github.com/equinor/fusion-framework/commit/7792659bf2ade10dba5e54c610d5abff522324b6) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump vitest from 2.0.1 to 3.2.4

  Major version update of Vitest testing framework for dev-server package.

  ### Breaking Changes

  - Updated from Vitest v2 to v3
  - Test runner behavior improvements

  ### New Features

  - Enhanced test performance
  - Better error handling and reporting
  - Updated Vite integration (v6.3.5)

  ### Links

  - [Vitest v3.2.4 Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v3.2.4)
  - [Vitest v3 Migration Guide](https://vitest.dev/guide/migration.html)

- Updated dependencies [[`c511123`](https://github.com/equinor/fusion-framework/commit/c511123c835e24e9ddefcc4c47c2455f5df12087)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.2.0
  - @equinor/fusion-framework-vite-plugin-spa@1.1.0

## 1.0.3

### Patch Changes

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

- Updated dependencies [[`bae9c95`](https://github.com/equinor/fusion-framework/commit/bae9c9554f335d0384b864436874bded47d00ed8), [`07cc985`](https://github.com/equinor/fusion-framework/commit/07cc9857e1427b574e011cc319518e701dba784d)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.1
  - @equinor/fusion-log@1.1.7
  - @equinor/fusion-framework-vite-plugin-api-service@1.1.1

## 1.0.2

### Patch Changes

- [#3330](https://github.com/equinor/fusion-framework/pull/3330) [`3590104`](https://github.com/equinor/fusion-framework/commit/3590104bdf3bba3386cdec7e2692078e6a92bd01) Thanks [@odinr](https://github.com/odinr)! - Enhanced dev server configuration by removing `vite-tsconfig-paths` plugin.

  > The responsibility for adding the `vite-tsconfig-paths` plugin has been moved to `@equinor/fusion-framework-cli`, which now provides it via the `overrides` parameter in `createDevServerConfig`. This ensures consistent TypeScript path resolution in both development and build environments.

  - Removed `vite-tsconfig-paths` dependency from package.json
  - Removed plugin usage from `create-dev-server-config.ts`

  **Breaking change:**

  If you use `@equinor/fusion-framework-dev-server` outside of the CLI, you must manually add the `vite-tsconfig-paths` plugin to your Vite config overrides to maintain the same TypeScript path resolution behavior.

## 1.0.1

### Patch Changes

- [#3327](https://github.com/equinor/fusion-framework/pull/3327) [`22d6d3b`](https://github.com/equinor/fusion-framework/commit/22d6d3b7753da8ad30054839e8a6083850a208fa) Thanks [@odinr](https://github.com/odinr)! - Enhanced dev server configuration with improved React and TypeScript path resolution support.

  - Added `@vitejs/plugin-react` for better React development experience
  - Added `vite-tsconfig-paths` for improved TypeScript path resolution
  - Updated `create-dev-server-config.ts` to include both plugins in the vite configuration

## 1.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Introduced a new package, `@equinor/fusion-framework-dev-server`, designed to provide a development server tailored for Fusion Framework applications. Built on top of Vite, it seamlessly integrates Vite and Fusion Framework configurations.

  For more details, visit the [GitHub repository](https://github.com/equinor/fusion-framework/tree/main/packages/dev-server/README.md).

  **Features**

  - _`createDevServer` Function_: Simplifies the creation of a development server using a configuration object.
  - _`createDevServerConfig` Function_: Generates a Vite-compatible configuration for the development server.
  - _SPA Support_: Includes `spa.templateEnv` for defining environment variables specific to Single Page Applications.
  - _API Service Discovery_: Enables proxying and route mapping for API services via `api.serviceDiscoveryUrl`.
  - _Dynamic Proxy Routes_: Introduced the `processServices` function to remap Fusion services' URIs and dynamically generate proxy routes.
  - _Logging_: Integrated `@equinor/fusion-log` for customizable logging, with dedicated sub-loggers for SPA and API services.

  **Dependencies**

  The following dependencies were added to support the new package:

  - `@equinor/fusion-framework-vite-plugin-api-service`
  - `@equinor/fusion-framework-vite-plugin-spa`
  - `@equinor/fusion-log`

  **Examples**

  _Using `createDevServer`_

  ```ts
  import { createDevServer } from "@equinor/fusion-framework-dev-server";

  const devServer = await createDevServer({
    spa: {
      templateEnv: {
        portal: {
          id: "dev-portal",
        },
        title: "My Test Dev Server",
      },
    },
    api: {
      serviceDiscoveryUrl: "https://location.of.your.service.discovery",
      processServices: (data, route) => {
        return {
          data: data.concat({
            key: "mock-service",
            name: "Mock Service",
            uri: "/mock-api",
          }),
          routes: [],
        };
      },
    },
  });
  ```

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- Updated dependencies [[`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253), [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0
  - @equinor/fusion-log@1.1.5

## 1.0.0-next.10

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

- Updated dependencies [[`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461), [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.2
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.9
  - @equinor/fusion-log@1.1.5-next.0

## 1.0.0-next.9

### Patch Changes

- Updated dependencies [[`5973182`](https://github.com/equinor/fusion-framework/commit/5973182b156adb56137f1fc683635ae15274cc57)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.8

## 1.0.0-next.8

### Patch Changes

- Updated dependencies [[`23fdc8a`](https://github.com/equinor/fusion-framework/commit/23fdc8a80d21ff063b17d8c596c0afc0a891305f)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.7

## 1.0.0-next.7

### Patch Changes

- Updated dependencies [[`713cb15`](https://github.com/equinor/fusion-framework/commit/713cb15c5f1607e7f7285940a58165d97d8e41df)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.6

## 1.0.0-next.6

### Patch Changes

- Updated dependencies [[`ea96493`](https://github.com/equinor/fusion-framework/commit/ea96493d95336f682e31a7b63161783ae7c99a63)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.5

## 1.0.0-next.5

### Patch Changes

- Updated dependencies [[`8870e73`](https://github.com/equinor/fusion-framework/commit/8870e73bd6d4141142c69c11c67b5b154bc80023)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.4

## 1.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.3

## 1.0.0-next.3

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`2ed792a`](https://github.com/equinor/fusion-framework/commit/2ed792a1118f3726f811c4dbdf8d25c69d7bb756) Thanks [@odinr](https://github.com/odinr)! - removed options for server options for `createDevServerConfig`, use overrides instead on `createDevServer`

- Updated dependencies [[`ca8d6c8`](https://github.com/equinor/fusion-framework/commit/ca8d6c834f9df35041ce8c7e2563c452d8b19276), [`7878f59`](https://github.com/equinor/fusion-framework/commit/7878f591c528d463bfbe558094c2c31004db8586)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.2

## 1.0.0-next.2

### Patch Changes

- Updated dependencies [[`96ad5d3`](https://github.com/equinor/fusion-framework/commit/96ad5d3a3aafe7adf5bd7f8e48e58bb19aa95ba8)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.1
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.1

## 1.0.0-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`84c16d7`](https://github.com/equinor/fusion-framework/commit/84c16d74c3235f809ce4c3e75868be12010ed695) Thanks [@odinr](https://github.com/odinr)! - Add `prepack` script to `dev-portal` and `dev-server` packages

  - Added a `prepack` script to `@equinor/fusion-framework-dev-portal` and `@equinor/fusion-framework-dev-server` to ensure the build runs before packaging.
  - This helps guarantee that the latest build artifacts are included when publishing these packages.

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - Introduced a new package, `@equinor/fusion-framework-dev-server`, designed to provide a development server tailored for Fusion Framework applications. Built on top of Vite, it seamlessly integrates Vite and Fusion Framework configurations.

  **Features**

  - _`createDevServer` Function_: Simplifies the creation of a development server using a configuration object.
  - _`createDevServerConfig` Function_: Generates a Vite-compatible configuration for the development server.
  - _SPA Support_: Includes `spa.templateEnv` for defining environment variables specific to Single Page Applications.
  - _API Service Discovery_: Enables proxying and route mapping for API services via `api.serviceDiscoveryUrl`.
  - _Dynamic Proxy Routes_: Introduced the `processServices` function to remap Fusion services' URIs and dynamically generate proxy routes.
  - _Logging_: Integrated `@equinor/fusion-log` for customizable logging, with dedicated sub-loggers for SPA and API services.

  **Dependencies**

  The following dependencies were added to support the new package:

  - `@equinor/fusion-framework-vite-plugin-api-service`
  - `@equinor/fusion-framework-vite-plugin-spa`
  - `@equinor/fusion-log`

  **Examples**

  _Using `createDevServer`_

  ```ts
  import { createDevServer } from "@equinor/fusion-framework-dev-server";

  const devServer = await createDevServer({
    spa: {
      templateEnv: {
        portal: {
          id: "dev-portal",
        },
        title: "My Test Dev Server",
      },
    },
    api: {
      serviceDiscoveryUrl: "https://location.of.your.service.discovery",
      processServices: (data, route) => {
        return {
          data: data.concat({
            key: "mock-service",
            name: "Mock Service",
            uri: "/mock-api",
          }),
          routes: [],
        };
      },
    },
  });
  ```

  _Using `createDevServerConfig`_

  ```ts
  import { createDevServerConfig } from "@equinor/fusion-framework-dev-server";

  const config = createDevServerConfig({
    spa: {
      templateEnv: { API_URL: "https://api.example.com" },
    },
    api: {
      serviceDiscoveryUrl: "https://discovery.example.com",
      routes: ["/api"],
    },
  });
  ```

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - exported UserConfig interface from vite

- Updated dependencies [[`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.0
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.0

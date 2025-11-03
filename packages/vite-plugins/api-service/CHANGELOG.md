# @equinor/fusion-framework-vite-plugin-api-service

## 1.2.5-preview.1

### Patch Changes

- [#3702](https://github.com/equinor/fusion-framework/pull/3702) [`999d81d`](https://github.com/equinor/fusion-framework/commit/999d81d9151505009d75457cf252e3c74cf64e52) Thanks [@github-actions](https://github.com/apps/github-actions)! - relase next of all packages

## 1.2.5-next.0

### Patch Changes

- [`895a49a`](https://github.com/equinor/fusion-framework/commit/895a49aaa815a6cd317e60f40875b1763bd6bded) Thanks [@odinr](https://github.com/odinr)! - relase next of all packages

## 1.2.4

### Patch Changes

- [#3637](https://github.com/equinor/fusion-framework/pull/3637) [`f5b88e7`](https://github.com/equinor/fusion-framework/commit/f5b88e7ff8e896624de67bdf29091ba44bf8a628) Thanks [@dependabot](https://github.com/apps/dependabot)! - Internal: bump rollup from 4.52.4 to 4.52.5 to fix sourcemap debugId generation; no public API changes.

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

- [#3532](https://github.com/equinor/fusion-framework/pull/3532) [`63ecde5`](https://github.com/equinor/fusion-framework/commit/63ecde5c29e775b341c3fac0c1eeb7123db5e2db) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vite from 7.1.8 to 7.1.9 across development tools and plugins.

  This patch update fixes bugs and improves stability in the vite dependency.

## 1.2.1

### Patch Changes

- [#3432](https://github.com/equinor/fusion-framework/pull/3432) [`528d72c`](https://github.com/equinor/fusion-framework/commit/528d72c04066f93fca1fa6469f33ec8d5383dcdc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vite from 7.1.5 to 7.1.7, including bug fixes for HMR, build system, and glob imports.

## 1.2.0

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

## 1.1.1

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

## 1.1.0

### Minor Changes

- [#3323](https://github.com/equinor/fusion-framework/pull/3323) [`8b2633d`](https://github.com/equinor/fusion-framework/commit/8b2633dca8e61e18f19e605f5338a9925a8588ab) Thanks [@odinr](https://github.com/odinr)! - Improve `createRouteMatcher` to support multiple patterns and custom matcher functions. Adds better documentation and type safety for route matching.

  > [!TIP] You can now pass an array of patterns to `createRouteMatcher`

  ```typescript
  const matcher = createRouteMatcher<{ id: string }>({
    match: ["/user/:id", "/profile/:id"],
  });
  matcher("/user/42", req); // { params: { id: '42' } }
  matcher("/profile/99", req); // { params: { id: '99' } }
  ```

## 1.0.0

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - Introducing a new Vite plugin for Fusion Framework applications that simplifies API development workflows through service discovery integration and API mocking.

  Key capabilities:

  - Proxy requests to backend services with automatic route generation
  - Mock API responses for testing and development
  - Intercept and transform API requests and responses
  - Configure custom routes with middleware support

  For complete documentation and examples, see the [API Service Plugin README](https://github.com/equinor/fusion-framework/tree/main/packages/vite-plugins/api-service/README.md).

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`8fffbfb`](https://github.com/equinor/fusion-framework/commit/8fffbfb12daa9748bf5290e5084cd4d409aed253) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

## 1.0.0-next.2

### Patch Changes

- [#3137](https://github.com/equinor/fusion-framework/pull/3137) [`7c58c78`](https://github.com/equinor/fusion-framework/commit/7c58c7868c66b1fc0f720b4ed13d39e0fe505461) Thanks [@odinr](https://github.com/odinr)! - updates from main

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`db34d90`](https://github.com/equinor/fusion-framework/commit/db34d9003d64e4c7cb46cf0c95f0c7a0e7587128) Thanks [@odinr](https://github.com/odinr)! - merge with main

## 1.0.0-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`96ad5d3`](https://github.com/equinor/fusion-framework/commit/96ad5d3a3aafe7adf5bd7f8e48e58bb19aa95ba8) Thanks [@odinr](https://github.com/odinr)! - Add prepack script to run build before packaging

  A `prepack` script was added to both the SPA and API service Vite plugin packages. This ensures the build step runs automatically before packaging, improving reliability of published artifacts.

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - Added a new Vite plugin, `API Service Vite Plugin`, designed for development purposes to proxy or mock `Service Discovery` APIs.

  ### Features:

  - **Proxy or Mock APIs:** Simplifies handling and intercepting API calls during development.
  - **Custom Route Handling:** Supports middleware or proxy-based route management.
  - **Advanced Proxy Capabilities:** Includes response processing and dynamic route generation.
  - **Utility Functions:** Provides helper functions like `createResponseInterceptor` and `createRouteMatcher` for response manipulation and route matching.

  ### Usage:

  - Integrate the plugin into your Vite project by adding it to `vite.config.ts`.
  - Configure with `proxyHandler` for advanced proxying and `routes` for custom route definitions.

  ```ts
  import { defineConfig } from "vite";
  import { plugin as apiServicePlugin } from "@equinor/fusion-dev-server/api-service-plugin";

  export default defineConfig({
    plugins: [
      apiServicePlugin({
        proxyHandler: {
          // Optional: Define proxy handler configuration here
        },
        routes: [
          // Optional: Define custom routes here
        ],
      }),
    ],
  });
  ```

  This feature enhances development workflows by providing a flexible and powerful solution for managing API interactions in a Vite development server environment.

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

# @equinor/fusion-framework-vite-plugin-spa

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

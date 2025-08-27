# @equinor/fusion-framework-vite-plugin-api-service

## 1.0.0-next.3

### Major Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`a29edcd`](https://github.com/equinor/fusion-framework/commit/a29edcdaa36c9f987f08101fc711ef036417a960) Thanks [@odinr](https://github.com/odinr)! - Introducing a new Vite plugin for Fusion Framework applications that simplifies API development workflows through service discovery integration and API mocking.

  Key capabilities:

  - Proxy requests to backend services with automatic route generation
  - Mock API responses for testing and development
  - Intercept and transform API requests and responses
  - Configure custom routes with middleware support

  For complete documentation and examples, see the [API Service Plugin README](https://github.com/equinor/fusion-framework/tree/main/packages/vite-plugins/api-service/README.md).

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`a29edcd`](https://github.com/equinor/fusion-framework/commit/a29edcdaa36c9f987f08101fc711ef036417a960) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

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
